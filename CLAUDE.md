# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev               # Vite dev server (http://localhost:5173/cake-crumb/)
npm run build             # Production build → dist/
npm run preview           # Serve the built dist/
npm run lint              # ESLint over the repo
npm run optimize-images   # Regenerate .webp siblings for everything in /public
npm run deploy            # Build + copy index.html → 404.html + push dist/ to gh-pages
```

No automated tests — verify by running `npm run dev` and clicking through. **Don't run `build`, `deploy` or `git push` unless explicitly asked.** Don't update this file unless explicitly asked either.

`npm run lint` exits 0 with warnings (`eslint.config.js` downgrades `react-refresh/only-export-components`, `react-hooks/set-state-in-effect`, `react-hooks/purity`). Baseline is **17 warnings, 0 errors** — read the output, don't just check the exit code.

## Start here

Single-page React storefront for **Cake & Crumb**, a bakery in Vaso (Kheda, Gujarat 387380). Vite + React 19 + React Router v7 + Bootstrap 5 (layout) + Tailwind 4 (utilities), deployed to GitHub Pages. **No backend** — Firebase and EmailJS are optional; everything falls back to `localStorage`.

Find the subsystem your task touches and read that section first:

| Working on… | Read | Why |
|---|---|---|
| Anything a customer buys | **Order flow** | Four fire-and-forget side-effects; `total` is computed in five places |
| The bakery's books | **Accounting ERP** | A second admin app with its own data layer, money model and lock |
| The chat widget | **ChatBot** | A *complete second order path* with its own cart |
| Bills and printing | **Invoices** | Print/PDF differ on desktop vs mobile for hard-won reasons |
| Prices or the catalogue | **Product catalog**, **Cupcakes**, **Delivery** | Prices live in several hand-maintained places; `lowestPrice()` has a trap |

Two cross-cutting rules: **all money goes through `inr()`** (`src/data/format.js`, always two decimals), and **a change to any total must move all five places at once** — see *No discount system*.

## Architecture

### GitHub Pages base path

`vite.config.js` sets `base: '/cake-crumb/'`.

- `main.jsx` passes `basename={import.meta.env.BASE_URL}` to `<BrowserRouter>`.
- **Never write a raw `/products/foo.webp` string in JSX** — use `asset()`/`u()`/`img` from `src/data/images.js` or it breaks in production. `toWebP()` rewrites `.jpeg/.jpg/.png` → `.webp` at runtime, so product entries can keep `.jpeg` paths.
- `predeploy` copies `dist/index.html` → `dist/404.html` so deep links resolve.

### Firebase + EmailJS (both optional)

- `src/firebase.js`: `isFirebaseEnabled` is a cheap sync env check, safe to import anywhere. The SDK is **lazy-loaded** — `getDb()` / `getFirebaseAuth()` `await import(...)` and memoise. **Never statically `import 'firebase/firestore'`** from a module in the eager bundle (the footer Newsletter is eager; the ChatBot isn't — see `DeferredChatBot`); it pulls ~100KB-gz onto every page.
- `src/services/*.js` all share one shape: `await getDb()` → dynamic-import + write → **always** mirror to `localStorage` → **never throw**. UI must not block on them.
- Firestore rules live in `FIREBASE_SETUP.md`, not in code. `orders` are admin-only reads; the public `tracking` mirror and `reviews` are world-readable; all validated-create. **`reviews` create uses `hasOnly([...])` + size caps**, so adding a review field means updating the console rule or creates silently fail. Changing a collection's shape **or adding one** needs a rules update or production breaks.
- `emailNotify.js`: `sendOrderEmail()` (Template #1), `sendCustomerConfirmation()` (Template #2, gated on `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`), `sendNewsletterNotification()` (reuses #1). Fire-and-forget. The customer template's Bcc **must stay empty** or the bakery gets a duplicate of every email. EmailJS keys are public by design.

**Reviews moderation** is gated by real Firebase Auth (same admin account), loaded lazily only when the 🔒 is clicked. **No hardcoded moderation password — don't reintroduce one.** Both review forms run `utils/reviewGuard.js` (honeypot + one-per-minute localStorage limit); those are speed bumps, the Firestore rules are the boundary.

**Review photos are data URLs, not Storage objects.** `utils/compressImage.js` downscales to `maxDim: 1000` / JPEG `quality: 0.7` (~120 KB) so the base64 string fits Firestore's **1 MB document limit** — don't relax it, and `photo` must stay in the `hasOnly` list.

### Order flow

Deliberately split so the customer's WhatsApp message stays clean and the bakery works from a private dashboard. `Checkout.jsx::placeOrder` fires four independent side-effects:

1. **WhatsApp** — `buildWhatsAppLink()` (`WHATSAPP_PHONE = 919173183440`) opens `wa.me` with a **clean receipt**: order ID + items + price only. **No admin/track links, no repeated PII** — don't re-add them.
2. **`saveOrder()`** — `orders` (full PII, admin-only) + a PII-free public `tracking/{orderId}` mirror + a last-50 `localStorage` mirror.
3. **`sendOrderEmail()`** to the bakery.
4. **`sendCustomerConfirmation()`** (optional).

**Order IDs** (`services/orderId.js`): `CC-AB-DDMMYY-XXXXX` — initials + date + 5 random Crockford chars (no `0/O/1/I`). It was a per-day localStorage counter, which collided (every device started at `0001`, and `tracking/{orderId}` is `setDoc` keyed by it). Randomness also stops the world-readable `tracking` collection being enumerated or pre-created with a forged status. **Don't make the suffix sequential again.**

**Payment — size-gated, no UTR.** Knobs in `shopConfig.js`: `BULK_ORDER_MIN`, `DEPOSIT_PCT`, `COD_MAX_INR` (₹1000 / 50% today — read the live values).

- Below `BULK_ORDER_MIN`: **UPI full** or **COD**.
- At/above ("bulk"): plain COD is **removed** — **50% advance (UPI)** or **pay in full**. No order ≥ ₹1000 leaves the kitchen with zero money collected.

`order.payment` = `{ method: 'upi'|'deposit'|'cod', paid, depositAmount, balanceDue }`.

- **`method: 'deposit'` does NOT imply money arrived — always branch on `paid` too.** Checkout deposits have `paid: true` (the customer's claim); **ChatBot** deposits have `paid: false`, since the bot can't take payment inline. `paymentLabel()`, the bulk checklist, the verify-payment panel (**hidden entirely when nothing was claimed**) and `buildWebsiteInvoice` all read `paid`.
- `paid` is a **claim, never proof** — the bakery verifies the credit in its own bank first. `AdminOrders.jsx` has a "How to verify this payment" panel matching by amount (the *deposit* amount for deposit orders) + payer + time, a "⚠ Verify before baking" checklist on bulk orders, and an address-not-geolocated warning.
- Four surfaces enforce the bulk rule and must stay in sync: `shopConfig.js`, `Checkout.jsx`, `AdminOrders.jsx`, **`ChatBot.jsx`**.
- **Don't reintroduce** a "reserve — pay later" option, a customer-entered UTR, or full-COD for bulk orders.
- Vestigial `utr` plumbing is **intentionally left alone**: `orders.js` writes `utr: ''` and `emailNotify.js` hardcodes `utr: '—'` for the live EmailJS template's `{{utr}}`. Removing them means editing that template — not a drive-by.

**`/admin/orders` (`AdminOrders.jsx`)** — real Firebase Auth with `browserSessionPersistence`. Subscribes live (`onSnapshot`) and steps orders through `placed → confirmed → ready_for_pickup | out_for_delivery → completed` (+ `cancelled`); "Ready" is method-aware. Every action calls `updateOrderStatus()` (updates both `orders` and `tracking`) then **opens WhatsApp synchronously — before any `await`**, or mobile browsers block `window.open`. Not PIN-gated; only `/admin/accounting` is.

**"Ask to Confirm" is a message, not a status.** A `placed` order shows Confirm · Ask to Confirm · Cancel. The middle carries `messageOnly: true`, so `act()` opens WhatsApp and **returns before the Firestore write** — the order stays `placed`. Deliberately not a new status: a `pending_nudge` value would reach the public `tracking` mirror, which `statusMeta()` can't render, and would need a rules update. Keep future nudges on the `messageOnly` path.

**`/track-order`** reads the public `tracking/{orderId}` doc — cross-device, no auth, no PII. **Legacy:** `/confirm-order` and its URL-params fallback still exist but aren't linked; don't rely on them.

### Accounting ERP — `/admin/accounting`

The bakery's **manual daily bookkeeping** (walk-ins, expenses, owner's cash) — **not** website orders. Same Firebase Auth account. See `ACCOUNTING_SETUP.md`.

- **Data** — `services/accounting.js` mirrors the `orders.js` shape. Four admin-only collections: `acc_orders`, `acc_expenses`, `acc_withdrawals`, `acc_menu`. Orders and expenses are **itemized bills** (`items: [...]` + `amount`); `orderTotal()`/`orderQty()` sum the lines and fall back to legacy top-level `qty`/`unitPrice`. All summaries read `amount`/`orderTotal()`. **Adding a collection needs a Firestore rule** (`allow read, write: if request.auth != null`) or writes silently fall back to localStorage.
- **A broken Firestore looks exactly like a healthy one.** Every helper catches and falls back to `localStorage`, so one device shows stale rows while the cloud stays empty, and a failed write *looks* saved until the next cloud read reverts it. Failures route through `reportCloudError()` → `onCloudError(cb)` → a "Not saved to the cloud" banner; keep new cloud calls on that path. When cloud and local diverge, **read Firestore directly** (`getDocs` with no fallback) before diagnosing.
- **Live, not one-shot** — `subscribeDocs()` (`onSnapshot`) for all four collections. Without Firebase it delivers `localStorage` once and never again, which is why tabs still call `reload()` after a save — don't remove those.
- **Menu** — `acc_menu` seeds from `data/accountingMenu.js` (207 items). Editable, and **independent from `products.js`** by design: accounting prices are actual sale prices.
- **Money model — working capital.** Money in hand = invested + received − expenses − taken out. **Profit = received − expenses** — owner's money in is not income, money out is not a cost. Cash-basis, no stock tracking: profit dips after a big purchase and recovers. Don't "fix" that with inventory.
- **One profit definition** — `s.profit` (money **received**, not invoiced; unpaid sits in `toCollect`). `DashboardTab` and `MonthlyTab` both read it; they once computed their own and disagreed. Any new profit-ish figure reads `s.profit`. Same rule for **cancelled orders**: `computeSummary` drops them, so any on-screen total (the Orders list's own `· ₹X`) must drop them too.
- **Two pockets** — every row carries `method: 'Cash' | 'Online'`. Cash in Hand / In Bank / Money in Hand as in `computeSummary`. The `withdrawn` "✓ Taken to cash" toggle feeds `onlineTakenToCash`. The Dashboard line is all-time only.
- **`direction` on `acc_withdrawals`** — `'in'` (owner invests) or `'out'` (takes out); **missing counts as `'out'`**. Reuses the collection so no new rule is needed. `acc_*` rules have **no `hasOnly` list**, so adding a field to them is free (unlike `reviews`).
- **Order status is tracking only** — `Completed | In Progress | Pending | Cancelled`. **Only `Cancelled` changes a figure** (dropped from sales). Adding a status is safe; renaming `Cancelled` is not.
- **Order numbers — `orderNo`, `CC-XX-DDMMYY-NN`.** `CC-MF-300726-05` = Makbul Fatema, 30 Jul 2026, the **fifth order of that month**. The sequence **counts the month** — not the day, not the customer — matched on the `MMYY` inside the date segment (`stampOf()`), so it climbs across days and restarts only when the month turns over, and a month's last number is also its order count. It counted the *day* until the owner asked otherwise; a per-day reset handed out the same `-01` thirty times a month. `nextOrderNo()`/`dayStamp()`/`stampOf()`/`customerInitials()`/`orderSortKey()` in `accounting.js`; **`OrdersTab.save()` is the only assigner.** The column header reads **"Order ID"**; the stored field stays `orderNo` (renaming it is a data migration for a label).
  - **A label, never the document key.** Two devices adding in the same month both compute the same next number; as a label that's a cosmetic clash, as a key it would overwrite an order. Same trap `orderId.js` documents — **don't promote it to a key, or make the storefront ID sequential.**
  - **Never reused, never regenerated** — deleting `-02` still leaves `-03`; correcting the date or name leaves the number alone.
  - **No bulk backfill** — old rows show `—` and get a number when next edited. A device-gated bulk write over `acc_*` is what went wrong with the Excel importer.
  - **Sort by `orderSortKey`, never the number** (it leads with initials, so it would group by name before date).
- **Locks on exit, not on a timer.** Leaving the page clears `cc_acc_unlocked`, so hopping to `/admin/orders` and back asks for the PIN again. A 2-minute idle timer was tried and replaced (it left figures on screen for the timeout and could fire mid-read). Switching *tabs within* accounting doesn't lock; a **refresh keeps you unlocked**, since unload doesn't run React cleanups — that's what `sessionStorage` is for. The effect **re-asserts on mount** for StrictMode's dev-only mount → cleanup → mount.
- **PIN gate (`PinGate.jsx`) — a second lock, not a second wall.** The real boundary is Auth + Firestore rules; anyone with the admin password can read every figure from the console. It protects **an unattended signed-in tab** — genuine, and the only risk it covers. Don't describe it as securing data. **Never hardcoded**: only `SHA-256(salt:pin)` in `acc_settings/main.accPinHash`. Forgotten *or* being changed → delete that field in the console and the gate reopens in "choose a PIN" mode. **There is no in-app change-PIN screen** — one was built and taken back out; changing the PIN is a rare console operation, not a button worth leaving on an unattended tab. A failed *read* of the hash **does not unlock** (treating a broken rule as "no PIN set" would be an open door). Subscriptions gate on `ready = isAdmin && unlocked`.
- **Danger zone** — "Download backup" (`exportAccountingBackup()`) and "start a fresh book" (`clearAccountingBooks()`, wipes orders/expenses/withdrawals in 400-doc batches, **keeps `acc_menu`**), gated on typing `DELETE`. No undo, no server backup — keep the gate and the backup button together.
- **Menu importers** — `ensurePerPieceMenu()` / `ensureCakePopPrices()` no-op after a `localStorage` flag (`cc_acc_perpiece_v1`, `cc_acc_cakepop_v2`); bump the suffix to re-run. Safe to stay device-gated because they only ever *add* a missing row.
- **The Excel importer is retired — don't reinstate it.** It rewrote its `xl-`-prefixed rows with `set` on any device that hadn't run it, so a second PC opening the page silently reverted every cloud edit. `data/excelImport.js` remains only as an archive (unreferenced). **Any bulk importer must be gated on a cloud marker, not a per-device one.**
- **"Expense taken for use" is gone** — one hand-typed figure that double-counted what Expenses and My Money now record properly. Don't reintroduce a manual money field. `acc_settings` still needs its rule (it holds the PIN hash).
- **UI** — the customer list dedupes **case-insensitively**, or "makbul varisali" and "Makbul Varisali" split one history. Shared date helpers in `utils/adminDate.js` — **`todayIso()` shifts by the local offset first**, since plain UTC dated a pre-05:30 IST entry to *yesterday*.
- **`SearchableSelect.jsx`** (type-to-filter; `allowCustom`, `compact`, `icon`, `autoOpen`) — the list is **portalled onto `document.body` and positioned `fixed`**, tracking its field on scroll/resize (capture) and flipping above when there's no room below. It has to be: the dialog body and the items grid both scroll, and as a child of the field an `overflow: auto` ancestor clipped it. **One list open at a time** via a module-level registry — outside-click alone lost the race when the click landed on another select. Outside-click listens in the **capture** phase (+ `touchstart`), and **Escape `stopPropagation()`s** so it shuts the list without closing the Modal. `spellCheck` off; names aren't dictionary words.
- **New Order sheet (`OrderForm.jsx`)** — one item is **one row** of a rose-headed table (`# · Category · Item · Size · Qty · Rate · Total · Action`); captions are stated once and figures centre under them. A field-per-line card meant two items filled the screen.
  - **The rate is the menu's and is never typed.** Read-only text, `—` when there's none, and save refuses an unpriced line (it would book ₹0 — the message points at Menu & Prices). Changing category/item/size **clears `unitPrice` with it**, or a cleared row kept the old price and still counted toward the total. The order total sums only lines that name an item.
  - The **category carries into the next item** and its item list auto-opens — an order is nearly always from one category, and re-picking it every line was the slowest part of writing a bill.
  - Sizes render through **`sortVariants()`** (`utils/orderItems.js`): piece → slice → tub → box → whole, then count, then price. `acc_menu` keeps them in typing order, so Cheesecake listed "Banto" above "Per slice" while Cookies led with "1 pc".
  - The **total band closes the table** and is the only place the order total is stated. A separate bill recap under it was tried and removed — the Total column already says it per item.
  - **Six items, then the grid scrolls** (`.cc-otable--scroll`, sticky header, auto-scrolls to the new row). Below 768px each item folds into its own boxed block, the captions hide (they no longer sit over what they name) and the inner scroll is dropped — the sheet's own scroll does it.
- **`Modal.jsx`** — a flex-column sheet inside a **non-scrolling backdrop**: header and footer pinned, `.cc-modal-body` scrolls (`overscroll-behavior: contain`). Widths `480 / wide 640 / xl 900`; `icon` draws a badge beside the title. Edge-to-edge full height on a phone. **Never `align-items: stretch` on the backdrop** — it sizes the sheet to the viewport and taller content spills outside its own white background, so the page behind shows through between the fields.
- **Admin lists share one grammar.** Orders, Expenses, My Money and Monthly Report all use **`.cc-grid-table`** (vertical rules, every cell centred) inside **`.cc-table-scroll`** (~10 rows, sticky header, scrollbar hidden). Item cells list **every line with `qty × rate` and its amount** (`.cc-items-cell` / `.cc-item-line`, left name + right money — the one place centring is overridden); a run-on `"… +5 more"` against a single total hid what any one item cost. Unpaid orders are **tinted end to end** (`.cc-row-unpaid`) with an amber left bar — it must land on the **cells**, since Bootstrap paints `--bs-table-bg` straight over a `<tr>` background. Amounts take the colour of their Paid/Unpaid chip.
- **Expense sheet** — items are one row each (Item · Qty · ₹ each · **line total** · remove) with the same six-then-scroll; on a phone the name takes its own line and the figures the next. Its add control is the bare **`.cc-oadd`** icon, where the order sheet uses the labelled **`.cc-additem`** pill. **My Money is paged** like every other list (it used to render every row ever entered) and carries the shared `PeriodSelect`; its In/Out totals follow the *filter*, not the page.
- **Orders tab extras** — a **Today strip** (`.cc-today`: count · received · to collect, before any filter, cancelled excluded) with a Today ⇄ All-dates toggle, since every other figure on the page is a month or all-time; **Status filter chips** matched on the lower-cased status; a list total that **excludes cancelled** (as `computeSummary` does) and says how many it dropped; and **customer names that filter to themselves** (`.cc-name-link`). The Dashboard's "still to collect" opens Orders pre-filtered to unpaid through `AdminAccounting`'s `ordersPreset` — tabs mount fresh, so `OrdersTab` reads it in its **state initialisers**, no effect; any tab pill clears it.
- **Duplicate an order** (`FiCopy`) — copies the row into a **new** order: today's date, no `id`, no `orderNo`, everything else as it stands. `OrderForm` decides `editing` from **`initial?.id`**, not from `initial` being present, so a fully prefilled form still saves through `addDocRec` and `nextOrderNo` hands it its own number. Its subtitle says *Copy of CC-…*.
- **Cancelled rows read as void** — greyed, with the amount struck (`.cc-row-cancelled` / `.cc-card-cancelled`; the money cell is found by **`.cc-amount`**, never by column position). **Cancelled beats unpaid** — it counts for nothing either way, so it shouldn't also be shouting for money.
- **"Owes ₹X" chip** (`.cc-owes`) — the customer's unpaid total across *all* their orders, keyed case-insensitively like the customer list. Hidden when this unpaid row **is** the whole debt, or it would just repeat its own amount.
- **CSV export** (`utils/csv.js`, Orders · Expenses · Monthly) — the **filtered rows**, i.e. exactly what the count beside the button says. Money goes in as **plain numbers, never `inr()` strings** — "₹1,880.00" is text to a spreadsheet and won't sum, which is the whole point — dates as ISO, and a **leading BOM** or Excel renders ₹ as mojibake. The Danger-zone JSON backup restores the app; this is the one an accountant can open.
  - **One line per item**, with the order's/expense's own fields repeated down its lines, so any column can be filtered or pivoted alone.
  - **`Order total` / `Expense total` and `Delivery` are written on the first line of their group only** — repeated on every line they'd multiply by the item count, and the column would no longer add up to the same figure as Amount.
  - Every file ends with a **TOTAL row**. Orders' says *"cancelled excluded"* and means it — cancelled orders are exported but kept out of the sums, matching `computeSummary` and the on-screen total.
  - Orders then splits that total into **EARNINGS (paid only)** and **STILL TO COLLECT (unpaid)**, which add back to it. The Total column mixes the two, so its raw sum is what was *invoiced* — quoting that as earnings would contradict `s.profit`, which counts money **received**.
- **Menu & Prices is a true accordion** — one category open at a time (Cheesecake alone is 23 items, and several open buried the next heading). Filtering still opens everything that matched.
- **Admin chrome** — `App.jsx` hides the storefront shell on `/admin/*` and renders `AdminHeader.jsx`; the brand mark is **deliberately not a link** (it would be an accidental exit). `AdminNav.jsx` is the private Orders ⇄ Accounting nav, never linked publicly. The five list tabs swap to **stacked cards on mobile** via `useIsMobile()`.
- **Admin mobile classes (≤768px)** in `index.css` — reuse rather than reinventing per tab: **`.cc-admin-tabs`** (horizontal snap strip, bleeds to the edge so a half-pill signals more), **`.cc-admin-toolbar`** (stacks button/search/count; the search's inline `maxWidth` means the override needs `!important`), **`.cc-admin-filters`** (labels pinned to a fixed column so chips align), **`.cc-row-action`** (19px icons with a real hit area, vs Bootstrap's 14px `btn-link`), **`.cc-card-actions`/`.cc-card-action`** (card actions as centred icon tiles — labelled buttons plus one bare icon sat unevenly and ate the card's width; the label lives on `title`/`aria-label`).
- **Dashboard is deliberately sparse** — hero pair (Money in hand · Profit) → four tiles (Invested · Earnings · Expenses · Taken out) → one still-to-collect / cash / bank line → one chart. The owner asked for exactly this; **adding a figure means removing one.** Earnings reads **`s.paidCount`**, never `orderCount` — that one counts every non-cancelled order, so "N paid orders" overstated it. The chart is **grouped, not stacked** (the two measures are compared, their sum is meaningless), one shared axis, series `#cf3e63` / `#6b5bb0` (palette-validated against `#ffffff` — re-validate before changing). **Figures use `--font-body` with `lining-nums tabular-nums`, never `--font-heading`** — Playfair's old-style digits sit at uneven heights and render amounts visibly broken.

### Invoices, printing & PDF

`components/admin/InvoiceModal.jsx` serves **both** admin pages. It renders one **normalised shape**; `utils/invoice.js` adapts each source (`buildAccountingInvoice` / `buildWebsiteInvoice`), so the component never branches on its caller.

**Shape & references**

- **One reference on the sheet, not two.** `printRef = invoice.reference || invoice.number` — the order's own number (`CC-AH-300726-01`, or the customer-facing `orderId`), falling back to the `invoiceNumber()` hash only for rows predating order numbers. It printed both once: two near-identical codes is a liability read aloud, and the hashed one can't be looked up. `printRef` also names the saved PDF.
- A **website** invoice adds phone, address, fulfilment, a subtotal/delivery breakdown and an advance/balance line. **`deliveryKm` is deliberately absent** — the distance is bakery-side only, and an invoice is handed to the customer.
- `invoiceNumber()` = `CC-INV-DDMMYY-XXXX` by **hashing the doc id, not a counter** (same reason as `orderId.js`). No Firestore write, identical on every device.
- **No GST line** — no GSTIN, so a tax line would be false. FSSAI + Udyam *numbers* do appear (required of a food business).
- `utils/orderItems.js` is shared with `OrdersTab`, so a row and its invoice can't disagree. **`displayVariant()` hides unit markers** (`Per piece`, `Per slice`, `Standard`) — beside a Qty column they add nothing. **Display only**: the stored `variant` still drives `isPerPieceVariant()`'s 2-piece minimum and the menu price match, and search still matches it. **`variantLabel()` renders a bare count as "Box of N"** (`acc_menu` stores `"6"`/`"12"`); `OrderForm` prettifies only the **label**, never the `value`.

**Download PDF** (primary action)

- It exists because a *printed* page can't be made clean: browsers stamp the URL, date and "Page 1 of 1" into the page margin, outside the document where no CSS reaches. Desktop Chrome can switch that off; **Android Chrome cannot**.
- `downloadInvoicePdf()` **dynamically imports `html-to-image` + `jspdf` inside the handler**, so the eager storefront chunk is unchanged. That's what retired the old "no PDF library" rule — the objection was about *static* inclusion.
- **`html-to-image`, not `html2canvas`** — html2canvas re-implements CSS and throws on Tailwind 4's `oklch()`. This rasterises via `foreignObject` at `pixelRatio: 3`, so the sheet keeps real Playfair/Lato. The trade: PDF text is an **image**, not selectable — accepted for a bill that gets handed over.
- **Always A4 landscape**, matching Print. The invoice is a tall receipt, so it's height-constrained and centred with white paper either side — inherent, not a bug.

**Printing — the split is empirical**

- **Desktop** calls `window.print()` in place (`printInPlace()`), swapping `document.title` to `Invoice …` for the duration (browsers name the PDF from it) — restored on `afterprint`, on a 20s timer (iOS never fires it) and on unmount.
- **Mobile prints from a hidden iframe** (`printViaIframe()` + `standaloneInvoiceHtml()`), falling back to `printInPlace()`. Printing in place on a phone was tried **twice** and came back blank: mobile browsers paginate from the layout viewport rather than re-laying out for paged media. A visible `window.open` tab worked too but was rejected — the dialog should come up on the tap.
- **Devtools "mobile view" cannot test any of this** — it resizes the viewport but keeps the desktop print engine.
- The frame needs all three or it silently breaks: a **`<base href>`** (`srcdoc`'s base is `about:srcdoc`), the invoice wrapped in **`.cc-invoice-overlay`** (the print rule hides `body > *:not(.cc-invoice-overlay)`), and printing **only after `fonts.ready`**. It's removed after 60s — tearing it down when `print()` returns cancels the job where the dialog is async.
- The `@media print` **`html, body` overflow reset with `!important`** outranks the modal's inline scroll lock and the site-wide `overflow-x: clip` — keep it.
- **`@page { size: A4 landscape; margin: 0 }` sits at the TOP LEVEL of `index.css`**, not inside `@media print` — nested there it was silently dropped and printouts came out portrait with headers. `margin: 0` is what suppresses the browser's header/footer, and **date/title/URL/page number are one group** — you cannot drop the URL and keep the page number.
- **Chrome's dialog overrides `@page` and remembers it.** Once the user touches Layout / Margins / Headers, that wins on every later print. A portrait-with-headers printout is **not** proof the CSS is broken — check the built CSS first, then More settings.
- The modal is `createPortal`'d onto `document.body` so print can `display: none` on `#root`; hiding the app *in place* leaves its layout and prints blank pages.

**Layout** — colour lives in **text and borders, never filled blocks** (Chrome only prints backgrounds when "Background graphics" is ticked). The masthead is responsive: two corners on desktop **and in print** (A4 ≈ 794px), stacked and centred on a phone; the mobile block is `@media screen and (…)` or it would also match print. The sheet is **560px** (wider left a chasm between a short name and its figures); Qty/Rate/Amount are **centred under their headings** with fixed widths, and print pins the sheet to `190mm` and centres it. Payment status and grand total share one closing line above a 2px rule. The closing quote is hashed from the order id (so a reprint is identical) and renders in **Playfair italic, not Allura** — customers couldn't read the joined script through.

### ChatBot — a second, independent order path

`src/components/ChatBot.jsx` can place a complete order on its own, calling the same `saveOrder()` + `generateOrderId()` + `wa.me` machinery as Checkout. **It keeps its own `orderCart` in component state**, entirely separate from `CartContext` (it only reads `count` for a badge).

- **Its menu is derived, not hand-maintained.** `data/chatbotMenu.js` generates `MENU_DATA`, `ORDER_ITEMS`, the category lists and `getItemCat()` from `shopProducts`. **Don't re-embed prices in `ChatBot.jsx`.** `CATEGORY_CONFIG` maps each category to emoji/subtitle/`strip` regex and matches `product.category` by **exact string** — renaming a category in `products.js` means renaming it here. `CAT_IMAGES` is the only hand-kept map; a missing key just drops the photo strip.
- `ORDER_ITEMS` is **one entry per product**; a two-price product becomes one row with a `variants` array. Each variant `name` is the full `"<product> — <size>"` string, which is the **cart key**, the **WhatsApp receipt line** and the `CAT_BY_NAME` key — change the format and update all three. `min` rides on the `price` tier only (cupcakes: 2), and the selector honours it.
- Sub-headings come from each product's optional **`group`** field (nothing else reads it). A group is assumed **homogeneous in price shape** — its first item decides one or two price columns. Two-price rows sort **cheaper unit first**, since `slice` is cheaper for cheesecakes but pricier for cookies.
- **It fires the same side-effects as Checkout** — `saveOrder()` + `sendOrderEmail()` + `sendCustomerConfirmation()`. It once called only `saveOrder()`, so a blocked pop-up left a real order nobody was told about. The confirmation needs an address, hence an **optional `email` step** with a Skip. It writes **`deliveryDate`** as its own field (the invoice reads it). Its order shape matches Checkout's, so no rules change was needed.
- Prices render through **`inr()`** (`money()` in `chatbotMenu.js` and every figure in the component) — it used to build `₹${price}` strings, which is why it had no lakh grouping.

**`src/pages/Menu.jsx` is an independent hand-written list** (`CARDS`) — a curated teaser that deliberately doesn't read `products.js`. **The one place a price can still drift** — check it when prices change, and anything it lists must exist in `products.js`.

### Delivery — flat slabs, chosen alongside method

Checkout asks **Home Delivery** or **Self-Pickup**. Pricing lives once in `shopConfig.js` as `DELIVERY = { freeRadiusKm, slabs, origin }` + `deliveryFee(method, distanceKm)`. Pickup is free; delivery within `freeRadiusKm` (10 km) is free; beyond, the first `slabs` band whose `maxKm` ≥ distance wins (10–20 km ₹80 · 20–35 ₹150 · 35–50 ₹250 · 50–75 ₹350 · 75–100 ₹450 · 100+ ₹550 — read the live values). **Slabs not per-km on purpose**: a pincode is an area, so its geocoded point is approximate. `distanceKm === null` → free. `DELIVERY.origin` is the bakery lat/lng from Plus Code MQ84+2GQ.

**The km is never shown to the customer.** `services/delivery.js` geocodes the pincode via Nominatim and Haversines from `origin`. The customer sees only the **amount** (or "…" while calculating) — never the distance or "within 10 km" wording. `deliveryKm` is stored on the private `orders` doc and shown **only in the admin dashboard**; it's kept out of the public `tracking` mirror and the WhatsApp receipt. Nominatim failure → null → free, never an error.

**ChatBot:** asks delivery-or-pickup, then for delivery only a pincode step — name → phone → *email (optional)* → **delivery/pickup** → address → **pincode** → date. **Pickup skips address and pincode entirely** (nothing to geocode or charge) and stores `deliveryMethod: 'pickup'`, `deliveryKm: null`. Delivery uses the same `kmFromBakeryByPincode`, so a pincode costs the same in both paths. Its review renders a styled `OrderSummaryCard`. **Cart** shows a neutral "Calculated at checkout". Change the knobs in `shopConfig.js` and everything follows — don't hard-code a fee or print the word "flat".

### Cupcakes — box price must stay a multiple of 6

**`price × 6 === slice`** for every cupcake (₹25/₹30/₹35 → ₹150/₹180/₹210). Both tiers are quoted side by side, so a rounded per-piece rate would make six singles visibly cost more or less than the box. **Pick the BOX price first, then divide** — that's why boxes went ₹170 → ₹180 and ₹190 → ₹210.

**A per-piece product shows its BOX price — never the per-piece rate.** The one place `lowestPrice()` is deliberately *not* displayed: "From ₹25" under "Vanilla Cupcakes" with a photo of six reads as *six for ₹25*, and customers did read it that way. `isPerPiece(p)` (`slice != null && minQty > 1`) switches the **Shop card**, **SearchOverlay** and the **JSON-LD `Offer`** (structured data contradicting the visible price gets flagged) to the box price. A "₹25 per piece" sub-line was tried and **explicitly removed** — don't re-add it. The rate lives only in the **quick-view**, and the **category note above the grid** is what tells customers pieces exist — load-bearing, not decoration.

**Filters and sort still use `lowestPrice()`**, so a cupcake can appear under a band its card price sits outside (Pistachio enters at ₹70, card shows ₹210). Accepted trade — don't feed the box price into the filter.

`ProductQuickView` is where the piece count is chosen (stepper from `minQty`, live total). Shop passes `key={quickView?.id}` — the modal stays mounted with `product={null}`, so without the key `qty` never re-inits. The cart line name carries the **tier** (`Vanilla Cupcakes (1 pc)`), never the count, since `add()` merges by id.

Four surfaces carry cupcake prices: `products.js`, `Menu.jsx`, `chatbotMenu.js`, and `featured` in `products.js` (`feat-2` is the ₹180 box, a separate cart id).

### Cart

`context/CartContext.jsx` is the single source of truth, persisted to `cc_cart_v2`. Item shape `{ id, name, price, img, qty, minQty }`. **No minimum order value** — `MIN_ORDER_INR` is a dead export; don't re-wire it without asking. (`updateQty` is exported but unused.)

**Per-line `minQty`** (only cupcakes, `2`). Three rules move together: `add()` **defaults qty to the minimum, not 1**; `decrement`/`updateQty` **drop the line** below the minimum (there's no valid quantity between 0 and 2); and the line stores its own `minQty` so a restored cart keeps the rule. Applies to the **base tier only**.

The key went `v1` → `v2` when cupcake ids changed meaning (`cup-vanilla` was a ₹150 box, now a ₹25 piece) — `add()` merges by id keeping the **stored** price, so a surviving v1 line would bill at the old rate. **Bump the key again if you repurpose a product id.**

`add()` also sets `toast`, which is the only thing `<CartToast />` renders — surface new toasts from the context, not the component.

### No discount / coupon / offers system — deliberately

No coupon field, no promo code, no percentage off. Discounts were scoped and **explicitly deferred by the owner** — don't add one speculatively. If asked:

- **A per-customer offer cannot be enforced** — no auth, no server; a `localStorage` flag dies with an incognito tab. The workable pattern is the UPI one: let the customer *claim* it and have the bakery verify the phone against past `orders`. Cart-value tiers need no identity and are safe.
- **A discount changes `total`, computed in five places** that must move together: `shopConfig.js`, `CartContext.jsx`, `Checkout.jsx` and **`ChatBot.jsx`** (an independent path — it would otherwise quote a different price). Then `orders.js` `totals`, the `tracking` mirror, `emailNotify.js` (a new placeholder means **editing the live EmailJS template**), and the **Firestore validated-create rules**. `AdminOrders.jsx` is load-bearing: the bakery verifies UPI **by matching the amount**.

### Checkout form starts empty

Pre-fill from `cc_customer_v1` / `cc_customer_draft_v1` was removed — customers saw stale data from past visits. `clearStoredCustomer()` deletes both keys on mount and on submit. **Don't reintroduce pre-fill** without asking.

### Routing & lazy loading

`App.jsx` `lazy()`-loads every route except `Home`. Firebase loads on demand rather than per-route. `vite.config.js` splits a `react-vendor` chunk via `manualChunks`; Firebase gets its own async chunk by virtue of being dynamically imported. The wildcard `<Route path="*">` + the `predeploy` 404.html copy make deep links resolve (a harmless 404 on first load is inherent to GH Pages project sites).

**The ChatBot is deferred, not routed** — `DeferredChatBot.jsx` mounts it at the first idle moment (`requestIdleCallback`, 2.5s backstop) or on the first interaction. It can't lazy-load on click because the launcher lives *inside* it. Moving it off the critical path took the eager chunk from **116 kB to 67 kB** (31.2 → 17.3 kB gzipped). `Suspense fallback={null}` on purpose.

`NO_FOOTER_ROUTES = ['/cart', '/checkout', '/confirm-order']` render `<MiniFooter />`. `<ScrollToTop />` resets scroll on every route change — without it React Router leaves users at the bottom of the new page.

**Stale-chunk self-heal.** Suspense handles a *pending* chunk, not a *rejected* one — and every deploy emits new hashed names, so an open tab requests a chunk that no longer exists and white-screens. `ErrorBoundary.jsx` matches a cross-browser `CHUNK_ERROR` regex and reloads **once**, guarded by `sessionStorage['cc_chunk_reloaded']`; `App.jsx` calls `clearChunkReloadGuard()` on mount to re-arm. It resets on the `resetKey` **prop**, not via `key=` — remounting would re-flash the skeleton on every navigation.

### Product catalog

`data/products.js` is hand-maintained: `featured` (Home) and `shopProducts` (Shop + Menu). Some entries have a `slice` second price tier.

**`slice`-price gotcha (bit us once):** the "From" price, price filter and price sort all use `lowestPrice(p)` = `Math.min(price, slice)` — **never `slice || price`**. `slice` is the *cheaper* per-slice tier for cheesecakes but the *pricier* box-of-12 for cookies, so assuming it's smaller made a ₹340 cookie box show "From ₹700". Same rule in `SearchOverlay.jsx` and the JSON-LD Offer.

Shop is a 3-column layout (filters / grid / sticky cart), 12 per page, filters reset to page 1. Search lives in `SearchOverlay.jsx` and deep-links to `/shop?category=…`.

### Contact, registrations & brand

- **One public number site-wide: +91 91731 83440** (`WHATSAPP_PHONE`, mirrored in `index.html` and the Footer/Contact/ChatBot). Email `cakeandcrumb.in@gmail.com`; address *Vaso, Kheda, Gujarat 387380*. The checkout **UPI handle `9081668490@kotakbank`** is a bank address, **not** a contact number — it intentionally keeps the old digits; don't "fix" it. Routes are catalogued in `LINKS.md`.
- **Registrations — numbers only, never the scans.** `data/certifications.js` holds FSSAI `20726012000837` (paid upto **16-07-2027**) and Udyam `UDYAM-GJ-12-0059372`; `CertBadges.jsx` renders `pills` and `line` variants (Checkout needs its own copy, since `MiniFooter` replaces the footer there). **Never publish the certificate scans or link to them** — the FSSAI cert carries the owner's photograph, an Aadhaar reference and the home street address; the Udyam PDF carries `9081668490`, a personal mobile. Verification is done by **number** on the government portal, and displaying the FSSAI number is legally required — load-bearing, not decoration.
- **Brand kit** — Playfair Display (headings/wordmark), Lato (body), Allura (accents); CSS vars `--font-heading`/`--font-body`/`--font-script`. Palette on `:root`: `--cc-rose #e0617a`, `--cc-rose-deep #cf3e63`, `--cc-rose-soft #d7a7ae`, `--cc-blush-soft #f3d7d9`, `--cc-cream #fff6f2`, `--cc-blush #f7e3df`, `--cc-cocoa #5b3e36`, `--cc-cocoa-soft #7a584d`.
- **Heroes are templated but hand-rolled.** All 7 brand pages use `.cc-{page}-hero` (warm-pink gradient, 2-column, image `aspect-ratio: 5/4` + `object-fit: cover` — not `contain`, which left gaps). **`PageHero.jsx` is NOT the shared hero** despite the name — only `/faq` and `/track-order` use it; a cross-page hero change means touching all 7. Hero photos use **standard images.unsplash.com IDs only** (premium/plus need a paid licence and `u()` doesn't support them).
- **Sticky header** — `.cc-header` with a scroll-aware shadow; other sticky elements use `top: calc(var(--cc-header-h, 82px) + 1rem)`. **Don't hard-code pixel offsets.** **Critical:** `html, body` use `overflow-x: clip` — **never `overflow-x: hidden`**, which turns body into a scroll container and kills `position: sticky` on the header.
- **Mobile menu scroll lock is event-based, not style-based** — Navbar attaches `touchmove`/`wheel` listeners and `preventDefault()`s outside the panel. **Do not reintroduce** `position: fixed` + saved-scrollY (desyncs), `html.style.overflow = 'hidden'` or `body.menu-open { overflow: hidden }` (both cause the iOS jump-to-top bug). Nothing mutates the body, so it can't desync.
- **Image pipeline** — drop rasters into `/public`, run `npm run optimize-images` (`scripts/convert-to-webp.js`, quality 78, skips fresh files). Originals are kept but the runtime always requests `.webp`.

### Conventions

- `usePageMeta({ title, description })` at the top of every page; `useJsonLd(id, obj)` for structured data (Shop adds per-product `Product` — **no per-product ratings**, fabricated ones were removed; only Reviews carries a real `AggregateRating`).
- **All money through `inr()`** (`data/format.js`), always two decimals, everywhere — storefront, ChatBot, emails, admin, invoice. Don't hand-build `₹${…}`. Literal `₹` in *static copy* is fine and deliberate (filter labels, budget ranges, "from ₹60" teasers, `DashboardTab`'s `₹1.5L` axis) — `Under ₹500.00` would read as a mistake.
- `<SmartImage>` = `<img>` + shimmer skeleton + lazy load. `<HeartDivider width={…} />` under hero h1s.
- `useIsMobile(bp = 768)` only where the *markup* must differ — prefer CSS for pure layout.
- `data/countries.js` drives the Checkout phone `<select>` **and** its per-country length validation — adding a country without a `len` silently accepts anything.
- `<RelatedProducts />` renders on the Cart page only. `<AllergenTags>` owns the code→label map; an unknown code renders nothing, so a typo fails silently.
- Per-icon imports from `react-icons/{fi,tb,fa}` are tree-shaken; don't attempt deep imports.

### localStorage keys

| Key | Owner | Notes |
|---|---|---|
| `cc_cart_v2` | `CartContext.jsx` | Bump when a product id changes meaning |
| `cc_customer_v1`, `cc_customer_draft_v1` | `Checkout.jsx` | Legacy pre-fill — **deleted**, never written |
| `cc_orders_local_v1`, `cc_reviews_local_v1`, `cc_newsletter_local_v1` | `services/` | Offline mirrors (orders keeps the last 50) |
| `cc_review_last_v1` | `reviewGuard.js` | One-per-minute review rate limit |
| `cc_festival_dismissed_v1` | `FestivalBanner.jsx` | |
| `cc_chunk_reloaded` | `ErrorBoundary.jsx` | **sessionStorage**; one-shot stale-chunk reload guard |
| `cc_acc_orders_v1` … | `accounting.js` `lsKey()` | Mirror per accounting collection |
| `cc_acc_perpiece_v1`, `cc_acc_cakepop_v2` | `accounting.js` | One-time menu migrations — bump the suffix to re-run |
| `cc_acc_excel_v7`, `cc_acc_taken` | — | Dead; nothing reads them |
| `cc_acc_unlocked` | `AdminAccounting.jsx` | **sessionStorage**; accounting PIN unlocked for this tab |

### Festival banner

`data/festivals.js` defines date-ranged banners; `FestivalBanner.jsx` picks the active one from the local clock. Ranges wrap year boundaries (see `new-year`).

## Environment

`.env` (gitignored — see `.env.example`) holds optional integrations. Vite reads it only at startup; **restart `npm run dev` after editing**.

| Var | Without it |
|---|---|
| `VITE_FIREBASE_*` | Reviews/orders/newsletter are localStorage-only. See `FIREBASE_SETUP.md`. |
| `VITE_EMAILJS_SERVICE_ID` + `_TEMPLATE_ID` + `_PUBLIC_KEY` | No admin notification email. See `EMAILJS_SETUP.md`. |
| `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` | No customer confirmation; admin email still works. |
| `VITE_SNAPWIDGET_ID` | Optional Instagram feed widget. |
