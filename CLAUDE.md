# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev               # Vite dev server (http://localhost:5173/cake-crumb/)
npm run build             # Production build → dist/
npm run preview           # Serve the built dist/
npm run lint              # ESLint over the repo
npm run photos            # Link + resize + check photos, in one step (see PHOTOS.md)
npm run check-images      # Every product has a photo, every photo exists
npm run check-prices      # Home's featured cards still quote the catalogue price
npm run optimize-images   # Regenerate .webp siblings for everything in /public
npm run convert-videos    # Phone clips → web-ready muted .mp4 + poster
npm run deploy            # Build + copy index.html → 404.html + push dist/ to gh-pages
```

**`npm run lint` does NOT check CSS.** ESLint only parses `.js`/`.jsx`, so `index.css` can be completely broken while lint reports a clean baseline — that happened: a scripted block-removal left a stray `}` and every page lost its styling while lint stayed green. After any stylesheet edit, especially a scripted one, check both:

```bash
# 1. braces balance (comments stripped so braces inside them don't count)
node -e "const s=require('fs').readFileSync('src/index.css','utf8').replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[{}]/g,' '));let d=0,b=[];s.split('\n').forEach((l,i)=>{for(const c of l){if(c==='{')d++;else if(c==='}'){d--;if(d<0){b.push(i+1);d=0}}}});console.log(d,b)"
# 2. it actually compiles (balanced braces ≠ valid CSS)
node --input-type=module -e "import {compile} from 'tailwindcss';import fs from 'node:fs';await compile(fs.readFileSync('src/index.css','utf8'),{base:process.cwd(),loadStylesheet:async()=>({base:process.cwd(),content:''}),loadModule:async()=>({base:process.cwd(),module:{}})});console.log('ok')"
```

**A JSX comment cannot be the first child of `{cond && ( … )}`.** A conditional expression takes one child; a comment plus an element is two, and it fails as `Parsing error: Unexpected token className`. Put the comment *above* the `{cond && (` line. Same for comments inside an opening tag's attribute list — use `//` on its own line there. Both were hit repeatedly.

No automated tests — verify by running `npm run dev` and clicking through. **Don't run `build`, `deploy` or `git push` unless explicitly asked.** Don't update this file unless explicitly asked either.

`npm run lint` exits 0 with warnings (`eslint.config.js` downgrades `react-refresh/only-export-components`, `react-hooks/set-state-in-effect`, `react-hooks/purity`). Baseline is **18 warnings, 0 errors** — read the output, don't just check the exit code, and check whether any warning names a file you touched rather than counting.

**Checking logic without a test runner.** Pure data and util modules can be exercised straight from Node, which is how the price rules, the order-number sequence and the CSV shape were each verified:

```bash
node --input-type=module -e "import {describe} from './src/data/products.js'; console.log(describe(...))"
```

It works for `data/*` and `utils/*` — but **anything that reaches `src/firebase.js` throws**, because `import.meta.env` is undefined outside Vite. `services/accounting.js` is the usual casualty; copy the pure function out, or drive it through a module that doesn't import Firebase.

## Start here

Single-page React storefront for **Cake & Crumb**, a bakery in Vaso (Kheda, Gujarat 387380). Vite + React 19 + React Router v7 + Bootstrap 5 (layout) + Tailwind 4 (utilities), deployed to GitHub Pages. **No backend** — Firebase and EmailJS are optional; everything falls back to `localStorage`.

Find the subsystem your task touches and read that section first:

| Working on… | Read | Why |
|---|---|---|
| Anything a customer buys | **Order flow** | Four fire-and-forget side-effects; `total` is computed in five places |
| The bakery's books | **Accounting ERP** | A second admin app with its own data layer, money model and lock |
| The chat widget | **ChatBot** | A *complete second order path* with its own cart |
| Bills and printing | **Invoices** | Print/PDF differ on desktop vs mobile for hard-won reasons |
| Prices or the catalogue | **Product catalog**, **Cupcakes**, **Delivery** | `products.js` is the source; `lowestPrice()` has a trap, and `featured` keeps its own copy |
| Swapping a product photo | **Photos** | `npm run photos` links + resizes + checks; a slug-named file needs no code edit |
| Anything with video | **Video** | Phone `.MOV` is HEVC and plays in Safari only; sources must stay out of `/public` |
| Reviews, ratings, testimonials | **Reviews** | Three separate fabrications were removed; reviewer emails were publicly readable |
| Anything claiming a fact to a customer | **Customer-facing copy**, **Timing**, **Reviews**, **Policy pages** | No opening hours, no invented ratings, no absolute guarantees, nothing advertised that isn't sold — and the FAQ, policy pages and checkout must agree |

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
- `emailNotify.js`: `sendOrderEmail()` (Template #1), `sendCustomerConfirmation()` (Template #2, gated on `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`), `sendNewsletterNotification()` and `sendEnquiryNotification()` (both reuse #1 — the free tier caps at two templates, so they overload the order fields and leave `to_email` blank so the template's fixed bakery address is used). Fire-and-forget. The customer template's Bcc **must stay empty** or the bakery gets a duplicate of every email. EmailJS keys are public by design.

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
- Four surfaces enforce the bulk rule and must stay in sync: `shopConfig.js`, `Checkout.jsx`, `AdminOrders.jsx`, **`ChatBot.jsx`**. Three more only *describe* it, and all three read `BULK_ORDER_MIN` / `DEPOSIT_PCT` rather than quoting a figure: the **Cart**'s payment line (which promised "or Cash on Delivery" on carts too large to have it), the **FAQ**'s Payment and bulk-order answers (which promised bulk *discounts* — see *No discount system*), and `/refund-policy`.
- **Don't reintroduce** a "reserve — pay later" option, a customer-entered UTR, or full-COD for bulk orders.
- Vestigial `utr` plumbing is **intentionally left alone**: `orders.js` writes `utr: ''` and `emailNotify.js` hardcodes `utr: '—'` for the live EmailJS template's `{{utr}}`. Removing them means editing that template — not a drive-by.

**`/admin/orders` (`AdminOrders.jsx`)** — real Firebase Auth with `browserSessionPersistence`. Subscribes live (`onSnapshot`) and steps orders through `placed → confirmed → ready_for_pickup | out_for_delivery → completed` (+ `cancelled`); "Ready" is method-aware. Every action calls `updateOrderStatus()` (updates both `orders` and `tracking`) then **opens WhatsApp synchronously — before any `await`**, or mobile browsers block `window.open`. Not PIN-gated; only `/admin/accounting` is.

**"Ask to Confirm" is a message, not a status.** A `placed` order shows Confirm · Ask to Confirm · Cancel. The middle carries `messageOnly: true`, so `act()` opens WhatsApp and **returns before the Firestore write** — the order stays `placed`. Deliberately not a new status: a `pending_nudge` value would reach the public `tracking` mirror, which `statusMeta()` can't render, and would need a rules update. Keep future nudges on the `messageOnly` path.

**`/track-order`** reads the public `tracking/{orderId}` doc — cross-device, no auth, no PII. It draws a four-step progress line (`TrackProgress`) above the status banner: Placed → Confirmed → Ready / On its way → Completed, where step 3 takes its wording from `deliveryMethod` (an order for collection is never "out for delivery") and **`cancelled` renders no line at all** — a cancelled order hasn't progressed, and drawing it part-way along suggests it's still coming. `stepIndex()` and `statusMeta()` share one status vocabulary with `AdminOrders.jsx`; a new status means editing all three. It reuses the `.cc-progress` classes from the checkout stepper, so it needs no CSS of its own. **Legacy:** `/confirm-order` and its URL-params fallback still exist but aren't linked; don't rely on them.

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
- **UI** — the customer list dedupes **case-insensitively**, or "makbul varisali" and "Makbul Varisali" split one history. Shared date helpers in `utils/adminDate.js` — **`todayIso()` shifts by the local offset first**, since plain UTC dated a pre-05:30 IST entry to *yesterday*. It delegates to **`localIso(date)`**, which the storefront uses too (see *Conventions*).
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

**`src/pages/Menu.jsx` hand-picks *which* products to show, not what they cost.** `CARDS` lists product **ids** (`picks`) and `rowsFor()` looks each one up in `products.js`, so names, prices and badges follow a price change on the next render — it used to hold its own copy of ~30 prices, which is what made it the page a price could drift on. What's still hand-maintained: the picks themselves, the card order, the `strip` regexes and the notes. An id that no longer exists silently drops its row, so check the page after renaming or removing a product. The "from …" figures in the notes are derived too, and go through `inr()`.

### Delivery — flat slabs, chosen alongside method

Checkout asks **Home Delivery** or **Self-Pickup**. Pricing lives once in `shopConfig.js` as `DELIVERY = { freeRadiusKm, slabs, origin }` + `deliveryFee(method, distanceKm)`. Pickup is free; delivery within `freeRadiusKm` (10 km) is free; beyond, the first `slabs` band whose `maxKm` ≥ distance wins (10–20 km ₹80 · 20–35 ₹150 · 35–50 ₹250 · 50–75 ₹350 · 75–100 ₹450 · 100+ ₹550 — read the live values). **Slabs not per-km on purpose**: a pincode is an area, so its geocoded point is approximate. `distanceKm === null` → free. `DELIVERY.origin` is the bakery lat/lng from Plus Code MQ84+2GQ.

**The km is never shown to the customer.** `services/delivery.js` geocodes the pincode via Nominatim and Haversines from `origin`. The customer sees only the **amount** (or "…" while calculating) — never the distance or "within 10 km" wording. `deliveryKm` is stored on the private `orders` doc and shown **only in the admin dashboard**; it's kept out of the public `tracking` mirror and the WhatsApp receipt. Nominatim failure → null → free, never an error.

**ChatBot:** asks delivery-or-pickup, then for delivery only a pincode step — name → phone → *email (optional)* → **delivery/pickup** → address → **pincode** → date. **Pickup skips address and pincode entirely** (nothing to geocode or charge) and stores `deliveryMethod: 'pickup'`, `deliveryKm: null`. Delivery uses the same `kmFromBakeryByPincode`, so a pincode costs the same in both paths. Its review renders a styled `OrderSummaryCard`. **Cart** shows a neutral "Calculated at checkout". Change the knobs in `shopConfig.js` and everything follows — don't hard-code a fee or print the word "flat".

### Cupcakes — the ×6 rule is now a habit, not an invariant

**`price × 6 === slice` no longer holds, and must not be "fixed".** Aug 2026 the owner's real counter prices (Menu & Prices in `/admin/accounting`) replaced the tidy ones, and they don't divide cleanly. That list, not `products.js`, is what a walk-in is charged, so the two have to agree:

| | Per piece | Box of 6 | vs 6 singles |
|---|---|---|---|
| Vanilla · Red Velvet · Biscoff | ₹25 / ₹30 / ₹30 | ₹150 / ₹180 / ₹180 | exact ×6 |
| Pistachio | ₹35 | ₹190 | box saves ₹20 |
| Chocolate · Nutella · Strawberry | ₹28 | ₹170 | **box costs ₹2 more** |
| Sprinkle | ₹25 | ₹155 | **box costs ₹5 more** |

The reasoning behind the old rule still stands — both tiers are quoted side by side and customers do check the arithmetic, so the four rows where **six singles are cheaper than the box** are the ones to watch. **Raise it with the owner; don't silently re-round their prices.** `Variety Cupcakes (Box of 6)` is box-only (`price` with no `slice`), so it carries a `desc` override — the generic Cupcakes sentence offers a per-piece tier it doesn't have.

**The counter menu is the source of truth for every price.** `/admin/accounting` → Menu & Prices is what a walk-in is actually charged; `products.js` must agree with it. The whole catalogue was reconciled against it (Aug 2026) and matched on all but two cakesicle prices. Two structures came out of that reconciliation and are worth knowing:

- **Cakesicles are flavour × shape** — Chocolate and Vanilla across Heart ₹110 / Square ₹130 / Circle ₹150 / Ice Cream ₹160, so eight entries, one per pair, grouped as `Cakesicles`. The counter menu lists two *items* with the shapes as price rows; a product entry holds two prices and there are four shapes, hence the split. Both flavours price identically at every shape — that's the owner's list, not a copy-paste slip.
- **A `Per Piece ₹25` cakesicle row in the counter menu is unresolved** and deliberately not on the site — six at ₹25 is ₹150, which matches no shape price, and the Chocolate row labels ₹110 as "Heart 6 Box" while Vanilla labels the same ₹110 as just "Heart". Ask before modelling it.

**A per-piece product shows its BOX price — never the per-piece rate.** The one place `lowestPrice()` is deliberately *not* displayed: "From ₹25" under "Vanilla Cupcakes" with a photo of six reads as *six for ₹25*, and customers did read it that way. `isPerPiece(p)` (`slice != null && minQty > 1`) switches the **Shop card**, **SearchOverlay** and the **JSON-LD `Offer`** (structured data contradicting the visible price gets flagged) to the box price. A "₹25 per piece" sub-line was tried and **explicitly removed** — don't re-add it. The rate lives only in the **quick-view**, and the **category note above the grid** is what tells customers pieces exist — load-bearing, not decoration.

**Filters and sort still use `lowestPrice()`**, so a cupcake can appear under a band its card price sits outside (Pistachio enters at ₹70 — 2 × ₹35 — while its card shows the ₹190 box). Accepted trade — don't feed the box price into the filter.

`ProductQuickView` is where the piece count is chosen (stepper from `minQty`, live total). Shop passes `key={quickView?.id}` — the modal stays mounted with `product={null}`, so without the key `qty` never re-inits. The cart line name carries the **tier** (`Vanilla Cupcakes (1 pc)`), never the count, since `add()` merges by id.

Three surfaces carry cupcake prices: `shopProducts`, `featured` (both in `products.js` — `feat-2` is the ₹180 box under a separate cart id) and `chatbotMenu.js`, which derives its own. `Menu.jsx` reads `products.js` and needs no edit.

### Cart

`context/CartContext.jsx` is the single source of truth, persisted to `cc_cart_v3`. Item shape `{ id, name, price, img, qty, minQty }`. **No minimum order value** — `MIN_ORDER_INR` is a dead export; don't re-wire it without asking. (`updateQty` is exported but unused.)

**Per-line `minQty`** (only cupcakes, `2`). Three rules move together: `add()` **defaults qty to the minimum, not 1**; `decrement`/`updateQty` **drop the line** below the minimum (there's no valid quantity between 0 and 2); and the line stores its own `minQty` so a restored cart keeps the rule. Applies to the **base tier only**.

The key went `v1` → `v2` when cupcake ids changed meaning (`cup-vanilla` was a ₹150 box, now a ₹25 piece), then `v2` → `v3` when four cupcake ids kept their names but changed price. Either way `add()` merges by id keeping the **stored** price, so a surviving old line bills at the old rate. **Bump the key when you repurpose a product id _or_ reprice an existing one** — it empties every saved cart once, which is the cheaper of the two mistakes.

`add()` also sets `toast`, which is the only thing `<CartToast />` renders — surface new toasts from the context, not the component.

### No discount / coupon / offers system — deliberately

No coupon field, no promo code, no percentage off. Discounts were scoped and **explicitly deferred by the owner** — don't add one speculatively. If asked:

- **A per-customer offer cannot be enforced** — no auth, no server; a `localStorage` flag dies with an incognito tab. The workable pattern is the UPI one: let the customer *claim* it and have the bakery verify the phone against past `orders`. Cart-value tiers need no identity and are safe.
- **A discount changes `total`, computed in five places** that must move together: `shopConfig.js`, `CartContext.jsx`, `Checkout.jsx` and **`ChatBot.jsx`** (an independent path — it would otherwise quote a different price). Then `orders.js` `totals`, the `tracking` mirror, `emailNotify.js` (a new placeholder means **editing the live EmailJS template**), and the **Firestore validated-create rules**. `AdminOrders.jsx` is load-bearing: the bakery verifies UPI **by matching the amount**.

### Checkout form starts empty

Pre-fill from `cc_customer_v1` / `cc_customer_draft_v1` was removed — customers saw stale data from past visits. `clearStoredCustomer()` deletes both keys on mount and on submit. **Don't reintroduce pre-fill** without asking.

**Email is OPTIONAL** (validated only when something is typed). The customer confirmation mail is itself optional — it only sends when `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` is set — so demanding an address for a mail that may never be sent cost orders for nothing. Phone is the real channel.

**Never put `required` on that input.** It was there for months while the placeholder read "(optional)", `VALIDATORS.email` treated blank as valid and `isDetailsValid` didn't ask for it — but Place Order is a `type="submit"` inside `<form onSubmit={placeOrder}>`, so the browser's own constraint check runs *first* and refused every checkout with an empty email. **Nothing in the app's validation can see that**, which is why it survived: the JS says the form is valid and the button still won't submit. The same trap is live on `address` / `city` / `pincode`, which is why those are `required={form.deliveryMethod === 'delivery'}` and not a bare `required`.

**The Delivery row must say something true at every stage**, and "free" is only claimed once a pincode has actually been looked up: `pickup` → FREE · pickup, `loading` → …, **`idle` → "Add pincode"**, **`unknown` → "Confirmed on WhatsApp"**, then the fee or FREE. It used to fall through to a bold **FREE** the moment Home Delivery was picked — before any pincode existed — which also contradicted the Home Delivery card's "charges depend on distance" directly above it. Note the **cart** still shows the subtotal only; `total = subtotal + delivery` is a checkout-only thing, and the FAQ says so.

### Routing & lazy loading

`App.jsx` `lazy()`-loads every route except `Home`. **The wildcard renders `NotFound`, not `Home`** — a dead link used to show the homepage under the wrong URL, which reads as "it worked" to a customer and as a soft 404 to a crawler. The 404.html copy still boots real deep links, so only genuinely unknown paths reach it. Firebase loads on demand rather than per-route. `vite.config.js` splits a `react-vendor` chunk via `manualChunks`; Firebase gets its own async chunk by virtue of being dynamically imported. The wildcard `<Route path="*">` + the `predeploy` 404.html copy make deep links resolve (a harmless 404 on first load is inherent to GH Pages project sites).

**The ChatBot is deferred, not routed** — `DeferredChatBot.jsx` mounts it at the first idle moment (`requestIdleCallback`, 2.5s backstop) or on the first interaction. It can't lazy-load on click because the launcher lives *inside* it. Moving it off the critical path took the eager chunk from **116 kB to 67 kB** (31.2 → 17.3 kB gzipped). `Suspense fallback={null}` on purpose.

`NO_FOOTER_ROUTES = ['/cart', '/checkout', '/confirm-order']` render `<MiniFooter />`. `<ScrollToTop />` resets scroll on every route change — without it React Router leaves users at the bottom of the new page.

**A new public route needs three things**, not one: the `lazy()` + `<Route>` in `App.jsx`, an entry in `public/sitemap.xml`, and a link from somewhere real. `/track-order` existed for months linked only from the 404 page; `/refund-policy` and `/privacy` were added with all three. `/cart`, `/checkout` and `/confirm-order` stay out of the sitemap deliberately (transactional), as does `/admin/*`. **`/review` is out too** — it is the same form already on `/reviews`, reachable only from the "leave us a review" WhatsApp message `AdminOrders.jsx` sends after an order (a real link, but a transactional one), and listing it had search engines indexing a bare duplicate of the reviews page.

**Stale-chunk self-heal.** Suspense handles a *pending* chunk, not a *rejected* one — and every deploy emits new hashed names, so an open tab requests a chunk that no longer exists and white-screens. `ErrorBoundary.jsx` matches a cross-browser `CHUNK_ERROR` regex and reloads **once**, guarded by `sessionStorage['cc_chunk_reloaded']`; `App.jsx` calls `clearChunkReloadGuard()` on mount to re-arm. It resets on the `resetKey` **prop**, not via `key=` — remounting would re-flash the skeleton on every navigation.

### Product catalog

`data/products.js` is hand-maintained: `featured` (Home) and `shopProducts` (Shop + Menu). An entry is `{ id, name, price, category }` plus any of `slice` + `sizeLabel`/`sliceLabel` (second price tier), `minQty` (per-piece minimum), `group` (sub-heading), `badge`, `desc`. **`img` and `allergens` are never written by hand** — `withPhoto()` looks the photo up by *name* in `productImages.js` (so renaming a product means renaming its key there, or it silently falls back), and `attachAllergens()` derives the tags from category + name keywords.

**Two fields are generated, and both are load-bearing.** `attachAllergens()` must never leave a product with `[]` — an empty list renders no badges, which reads as "we never checked" rather than "there's nothing in it", so a genuinely free-from item (mojitos, black coffee) gets `['eggless','vegan']` instead. `describe(p)` builds the one-sentence description the quick view and the JSON-LD `Product` both show, from the name and category; set `desc` on an entry to overrule it. Neither may return nothing for a new product.

**`slice`-price gotcha (bit us twice):** the "From" price, price filter and price sort all use `lowestPrice(p)` = `Math.min(price, slice)` — **never `slice || price`**. `slice` is the *cheaper* per-slice tier for cheesecakes but the *pricier* box-of-12 for cookies (26 products), so assuming it's smaller made a ₹340 cookie box show "From ₹700" — first in Shop, then again in `RelatedProducts`, which also billed the *other* tier when you added it.

**`lowestPrice` / `isPerPiece` / `hasUnit` / `cardPrice` / `priceLabel` now live in `data/products.js`** and are imported, never re-derived — being re-implemented per file is exactly how it went wrong twice. `priceLabel()` owns the wording too ("From ₹210.00"), so the same product can't be quoted three ways. Shop still writes its own JSX for the per-piece card (it appends `sliceLabel`), but takes the rules from there — its grid price and its JSON-LD `Offer` both call the shared helpers.

**A THIRD tier: `unit`.** Cookies are the only three-tier products — ₹50 a cookie, ₹280 for six, ₹580 for twelve. `unit` + `unitLabel` hold the loose single; `price`/`slice` stay the two boxes so neither box is lost. Consequences, all deliberate:

- **`lowestPrice()` includes `unit`** (filters and sort use the true entry price) but **`cardPrice()` never does** — it falls back to `lowestBox()`, the old `lowestPrice`. A card showing a *box* of cookies must not advertise ₹50. That's the per-piece trap from the other direction.
- `ProductQuickView` renders it as a third row with its own counter and its own cart line (`<id>-unit`), and `chatbotMenu.js` appends it as a third variant. Both are hand-wired; a fourth tier would need the same again.
- **Don't add a third tier for linear pricing.** Cake pops are ₹15 / ₹90 / ₹180 — exactly ×6 and ×12 — so their box of 12 is stated in `describe()` instead. Only add `unit` when the tiers genuinely don't divide.

**`piece: true`** marks a product whose `price` tier is one loose piece and that sells singly (brownies, blondies). It only gives the quick view a counter and the batch-bake note. It is **not** `minQty` (that's a minimum, and would flip `isPerPiece` so the card quoted the box) and **not** `unit` (that's for a third tier). Display-only.

**`EXTRA_TIERS`** lists sizes sold at the counter that the site can't take an order for (cookie singles used to be here; brownie boxes of 4 and 12 still are). **Display-only** — nothing reaches the cart or the totals. Quoted in the category note so the site doesn't pretend they don't exist. If one becomes orderable it needs a real product entry, not a lookup here.

**Size labels must not contain brackets.** The cart wraps every tier in brackets, so `Banto 4" (inch)` rendered as `Strawberry Cheesecake (Banto 4" (inch))` — on 23 cheesecakes and 10 sponge cakes, and in the WhatsApp receipt, the stored order and the invoice, since all four read the same field. Now `Banto 4"` and `Whole Bento`. **"Banto" is not a typo for "Bento"** — they're different sizes in the owner's own accounting menu (Banto = cheesecake, 3 slices; Bento = whole milk/sponge cake). Don't "correct" it.

Shop is a 3-column layout (filters / grid / sticky cart). **12 at a time with "Show more"**, not numbered pages — 120 products was ten pages, and the pager had to yank the viewport back to the top of the grid on every click. `PAGE_SIZE` is module-scope so state can initialise from it; the `?product=` jump reveals rows up to the target instead of computing a page number. **Cards carry compact allergen markers** — `AllergenTags` in non-verbose mode, which shows nut warnings and genuine free-from tags only. `eggless-option` is excluded there on purpose: 95 of 120 products carry it, so it would badge nearly everything and bury the nut warning. The empty state carries its own "Clear filters" button, because the sidebar's is off-screen on a phone.

**Menu page covers all 9 categories.** A missing card means those products appear nowhere on `/menu` — Platters was invisible for exactly that reason. A new card also needs a `MENU_CARD_IMAGES` entry or it silently falls back to the generic photo. Each card shows "+N more" beside View All, computed from `picks` against the live catalogue.

**`npm run check-prices`** exists because `featured` (the four Home cards) keeps its **own copy** of each price, with nothing tying it to `shopProducts`. The script names which shop product and which *field* each card mirrors (the cupcake card quotes `slice`, the cookie card `price`) and exits 1 on drift. Add a fifth featured card and it will tell you to register it.

**The Category filter can match a `group`, not just a `category`.** `CATEGORIES` in `Shop.jsx` is a flat list of strings; any name also listed in **`GROUP_FILTERS`** is matched by `p.group` instead (today `Cake Pops` and `Cakesicles`, both living inside Bakes). Everything routes through `inFilter(p, category)` — the grid, and the search-jump that widens filters to reach a product. **Prefer this to promoting a group into a real category:** `attachAllergens()` switches on `category` and CLAUDE.md's rule is that it must never return `[]`, so a new category would silently strip the allergen badges off those products, on top of needing `CATEGORY_CONFIG` / `CAT_IMAGES` / `describe()` entries. Group headings are suppressed for a group filter (every row shares it). Cake Pops and Cupcakes are per-piece, so both carry a **category note above the grid** — the only place a customer learns single pieces exist, since the card quotes the box.

### Search — `SearchOverlay.jsx`

- **`matches` and `results` are separate and must stay so.** `findProducts()` returns EVERY hit; the component slices to `MAX_RESULTS` for display. The count in the UI reads `matches.length`. It used to slice inside the filter, so "cake" (65 hits) reported **"12 results"** and silently dropped 53 — a specific wrong number is worse than truncation. Overflow gets a "See all N matches" link.
- **`haystack(p)` is what a product can be found by** — name, category, `group`, all three size labels, `badge`, `describe(p)` and allergens (hyphens flattened, so "eggless" matches `eggless-option`). Name+category alone returned **zero** for "bento", "eggless" and "vegan" on a site that sells all three.
- **`eggless-option` is deliberately excluded from the haystack.** Nearly every baked product carries it, so including it made "eggless" return 105 of 120 — true and useless. "eggless" now returns only what is eggless *as baked* (10 drinks). The cost: "eggless cheesecake" returns nothing, so the empty state shows a note (fired by `mentionsEggless()`, matching `/\begg/i`) saying most cakes can be made eggless on request. **Keep that note if you keep the exclusion** — without it a zero-result reads as "we don't do eggless".
- Multi-word queries AND together, so "eggless cheesecake" narrows. Arrow keys wrap through results, Enter clicks the highlighted `<a>` rather than rebuilding the route.

### Reviews — nothing may be invented

This page had three separate fabrications and they are all gone. Do not reintroduce any of them.

- **`aggregateRating` is computed from real reviews and omitted below `MIN_REVIEWS_FOR_SCHEMA` (5).** It was hardcoded `4.9 / 245` and published to schema.org regardless of what had been left. Google treats fabricated review markup as spam and penalises it by hand.
- **The visible panel shows real numbers or an invitation.** It used to fall back to "4.9 from 245 reviews" with an invented star breakdown — a mockup placeholder that shipped. With no reviews it now says so and offers a Write-a-review button.
- **The four promise tiles carry no scores.** They had invented per-aspect ratings (4.9/4.9/4.8/4.9) that nothing collects — the form asks for one overall star. Three overlapping strips (`SUB_RATINGS`, `WHAT_LOVE`, `PROMISE_STRIP`) became one, and nothing is attributed to customers: "What Customers Love" put four hardcoded lines in their mouths. **`PROMISE_STRIP` is then rendered ONCE**, in the closing band — it was also mapped inside the stats card, so the survivor of that merge was itself printed twice a screen apart. The stats card is two grid columns (score | breakdown) because of it; putting a third child back means restoring the third column in `.cc-reviews-stats`.
- **Nothing on this page is "verified", the page description included.** The "Verified Buyer" pill was dropped because the review form is public and its "Your Order" field is a free choice from the product list, not a real order — nothing here can confirm a purchase, so the pill was a claim about a named person the site could not stand behind. The `usePageMeta` description kept the word long after the pill went ("verified reviews on cheesecakes…"), and that string is what a search result shows, so it was the last place the claim still reached customers. Re-add either only if orders and reviews are ever genuinely linked.
- **The review form does NOT collect an email, and must not.** The `reviews` collection is `allow read: if true` — it has to be, the page lists reviews without auth — so every address written there was harvestable by anyone with the project ID. It was never displayed and nothing read it back. `email` is out of `addReview()` and out of the `hasOnly` list in `FIREBASE_SETUP.md`; **the Firebase console rule must be updated to match.** Any future contact field belongs in an admin-only collection.
- **No absolute guarantees anywhere.** "on time, every time" and "Happiness Guaranteed" were removed from Reviews and About — a single kitchen can't promise them, and the second promised far more than the refund policy delivers.

### Policy pages — `/refund-policy`, `/privacy`

Lazy-routed, linked from both footers, the checkout terms line and the FAQ's Payment/Cancellation sections, and listed in `sitemap.xml`.

- **Every refund term is the one already on `/faq`** — the 30-minute window, refunds only for a cancellation inside it or a confirmed quality issue, 100% within 24 hours if the bakery cancels. Deposit figures read from `shopConfig`. **Change `/faq` and the policy page together**; a policy that contradicts the FAQ is worse than neither.
- **The privacy page describes what the site ACTUALLY does** — the PII-free public `tracking` mirror, that only the *pincode* goes to Nominatim and never the street address, that reviews and their photos are public, that no email is collected on a review, that a custom-order enquiry from `/contact` reaches the bakery by email as well as WhatsApp, and that Plausible is cookieless. If any of that changes, change this page in the same commit — adding `sendEnquiryNotification()` meant editing this page in the same breath, and so will the next thing that leaves the browser.
- **Both pages carry a hand-maintained `LAST_UPDATED` const.** Bump it only when a term actually changes; a date computed from the clock would claim revisions that never happened, which on a policy page is worse than no date at all.
- They use a plain document header, **not `PageHero`** — that component always renders an image column and would emit a broken `<img>` without one.

### Contact, registrations & brand

- **One public number site-wide: +91 91731 83440** (`WHATSAPP_PHONE`, mirrored in `index.html` and the Footer/Contact/ChatBot). Email `cakeandcrumb.in@gmail.com`; address *Vaso, Kheda, Gujarat 387380*. The checkout **UPI handle `9081668490@okbizaxis`** (`UPI_ID` in `Checkout.jsx` — this file said `@kotakbank` for a while, which was never the live value) is a bank address, **not** a contact number; it intentionally keeps the old digits, so don't "fix" those either. Routes are catalogued in `LINKS.md`.
- **Registrations — numbers only, never the scans.** `data/certifications.js` holds FSSAI `20726012000837` (paid upto **16-07-2027**) and Udyam `UDYAM-GJ-12-0059372`; `CertBadges.jsx` renders `pills` and `line` variants (Checkout needs its own copy, since `MiniFooter` replaces the footer there). **Never publish the certificate scans or link to them** — the FSSAI cert carries the owner's photograph, an Aadhaar reference and the home street address; the Udyam PDF carries `9081668490`, a personal mobile. Verification is done by **number** on the government portal, and displaying the FSSAI number is legally required — load-bearing, not decoration.
- **Brand kit** — Playfair Display (headings/wordmark), Lato (body), Allura (accents); CSS vars `--font-heading`/`--font-body`/`--font-script`. Palette on `:root`: `--cc-rose #e0617a`, `--cc-rose-deep #cf3e63`, `--cc-rose-soft #d7a7ae`, `--cc-blush-soft #f3d7d9`, `--cc-cream #fff6f2`, `--cc-blush #f7e3df`, `--cc-cocoa #5b3e36`, `--cc-cocoa-soft #7a584d`.
- **Heroes are templated but hand-rolled.** All 7 brand pages use `.cc-{page}-hero` (warm-pink gradient, 2-column, image `aspect-ratio: 5/4` + `object-fit: cover` — not `contain`, which left gaps). **`PageHero.jsx` is NOT the shared hero** despite the name — only `/faq` and `/track-order` use it; a cross-page hero change means touching all 7. Where a hero uses Unsplash it must be a **standard images.unsplash.com ID** (premium/plus need a paid licence and `u()` doesn't support them). Prefer one of the bakery's own photos where one suits the frame — see *Photos* for why Home's hero is the exception.
- **Sticky header** — `.cc-header` with a scroll-aware shadow; other sticky elements use `top: calc(var(--cc-header-h, 82px) + 1rem)`. **Don't hard-code pixel offsets.** **Critical:** `html, body` use `overflow-x: clip` — **never `overflow-x: hidden`**, which turns body into a scroll container and kills `position: sticky` on the header.
- **Mobile menu scroll lock is event-based, not style-based** — Navbar attaches `touchmove`/`wheel` listeners and `preventDefault()`s outside the panel. **Do not reintroduce** `position: fixed` + saved-scrollY (desyncs), `html.style.overflow = 'hidden'` or `body.menu-open { overflow: hidden }` (both cause the iOS jump-to-top bug). Nothing mutates the body, so it can't desync.
- **Image pipeline** — drop rasters into `/public`, run `npm run optimize-images` (`scripts/convert-to-webp.js`, quality 78, skips fresh files). Originals are kept but the runtime always requests `.webp`.

### Photos — `npm run photos`

`scripts/update-photos.js` is the owner-facing path and the one to point a non-coder at (**`PHOTOS.md`** is that guide, written to be followed without you). It does three things in order: **link → resize → check**.

- **Link.** A file in `public/products/` whose basename equals `slugify(product name)` is written into `PRODUCT_IMAGES` automatically, so the owner never edits code. `slugify` = strip accents (`Trés Léches` → `tres-leches`), `&` → `and` (or `Milk & Dark` and `Milk Dark` would collide), non-alphanumerics → `-`. It rewrites **only the quoted value** on that key's line, so padding and trailing comments survive; a key it can't find is reported, never inserted blind.
- **Resize + check** just shell out to the two existing scripts. `productImages.js` stays the single source of truth and hand-editing it is still fully supported — the naming convention is a shortcut, not a requirement (shared/themed artwork can't use it and shouldn't).
- **The "still sharing one photo" tail is the point.** It lists every product borrowing another's picture — i.e. the real "name says Strawberry, photo shows Mango" list — with the exact filename to save for each. Work that list down; don't hand-audit the map.
- **Prefer the bakery's own photos — but only where one fits the frame.** 62 real photos sit in the `rc*` / `rcOwn*` block of `images.js` and were going unused: Home ran the same stock bouquet of roses *twice*, and About's "A Peek Into Our Kitchen" showed five pieces of library artwork under a heading claiming to show the kitchen. Home's About-section image and all five kitchen thumbs are `rcOwn*` shots now. **Home's hero is deliberately still the roses.** `.cc-home-hero__img` is `aspect-ratio: 5/4` and **only five of the 62 real photos are landscape at all**, the widest being 16/9 — `cover` trimmed about 15% off each side of it, and the owner preferred the photo that fills the frame as shot. Don't swap it back without looking at the crop on a real screen. Whatever goes in a hero, pass **`srcSet()` + `sizes`**: the roses used to load the full 40 KB file everywhere, where the 800w variant is 22 KB.
- **"Unused" detection must scan `src/`, not just the map.** The Gallery names its photos through the `img` registry in `data/images.js`, so checking `PRODUCT_IMAGES` alone reported all the gallery artwork as unused and offered nonsense corrections for it. Nearest-name suggestions score by *fraction of the candidate matched*, not raw word hits, or every long product name wins on one common word ("cake", "choc").

### Video — `npm run convert-videos` and the Gallery strip

`scripts/convert-videos.js` → `public/videos/`, rendered by `components/VideoStrip.jsx` on **`/gallery` only**. `CLIPS` is hand-kept in *both* files; the script's list decides what gets encoded, the component's decides what shows and in what order.

- **Phone clips are HEVC-in-`.MOV` and unplayable outside Safari** — no Chrome, no Firefox, no Android, in any wrapper. They're also 4K/60 at 15–115 MB, and **GitHub hard-caps a single file at 100 MB**. So everything is re-encoded to H.264 (`-profile:v main`, `yuv420p` — the one format every device decodes; iPhone 4:2:2 is silently refused by Android), longest side 1280, CRF 30, 30fps, trimmed to `MAX_SECONDS`. 649 MB of source became 6.6 MB.
- **Audio is stripped (`-an`)**, not just muted in markup: it's what the owner asked for and what lets autoplay work at all.
- **`+faststart` is not optional** — without it playback can't begin until the whole file downloads. Verify by checking `moov` appears before `mdat` in the first few KB.
- **`portrait: true`** centre-crops a landscape source to 9:16 *at encode time*, so the crop is deliberate and the discarded pixels never ship. The cards are 9:16 with `object-fit: cover`, so a landscape clip would otherwise be crushed by the browser with no control over what survives. The expression is a no-op on anything already 9:16 or taller.
- **Sources live OUTSIDE `/public`.** Vite copies `public/` into `dist/` verbatim, so a raw `.MOV` left there is pushed to gh-pages and a >100 MB one fails the deploy outright. Masters go to **`media-originals/`** (gitignored); the script searches `public/products/` *then* `media-originals/products/`, so a re-run still finds already-processed sources instead of calling them missing.
- **Playback is IntersectionObserver-driven, not the `autoplay` attribute.** Android caps concurrent hardware decoders (often 2–4), so ten autoplaying clips leave the later ones permanently frozen. Only what's on screen plays. `muted` is set as a **DOM property** as well as an attribute (Safari checks the property), `playsInline` stops iOS hijacking into fullscreen, and `preload="none"` + poster keeps arrival cost near zero. A rejected `play()` promise falls back to poster + controls.
- **The rail overflows on purpose and the scrollbar is hidden**, so `.cc-video-arrow` is the only desktop affordance — never `display: none` it on a pointer device. Tracks are a **fixed 200px, not `minmax(…, 1fr)`**: `1fr` resolves against the scroll container, so columns squeezed instead of overflowing and the last clip was unreachable. End-detection allows 2px of sub-pixel slack or "next" never disables.

### Gallery page

`pages/Gallery.jsx` holds the photo list (each entry needs a **`cat`** matching a name in `GalleryGrid`'s `FILTERS`, or it drops out of every chip but "All"); `components/GalleryGrid.jsx` renders it.

- **Filter chips + `PAGE_SIZE` (18) + "Show more"** exist because 47 photos rendered flat was a twelve-row wall. Chips with a zero count auto-hide.
- **Tiles are 4:5, not 1:1** — nearly every photo is a portrait phone capture and a square frame cut the tops off tall cakes. The lightbox carries the uncropped view.
- **Deliberately NOT a CSS-columns masonry**: `columns` fills column-by-column, so the bakery's own photos — ordered first on purpose — would stack into the left column instead of reading across the top row.
- **`sizes` must track the column counts in `.cc-gallery-mosaic`.** It's what selects the 400w variant for a ~200px tile; overstating it silently doubles image bytes for the whole page.
- The lightbox **does not lock body scroll** — see the Navbar rule above; a fixed opaque overlay already hides what moves behind it.
- **The lightbox always offers a way to buy** (`buyLink()`), resolved rather than hand-maintained across 47 entries: `p.img` is the same `/products/<file>` string the gallery lists, so one product → deep-link to it via `?product=`; several products sharing that photo → its category; no match → the entry's own `cat` mapped through `CAT_TO_SHOP`; `custom: true` (the three one-off cakes) or an unmapped cat → `/contact`. Before this the page had **zero links** — 47 photos and 10 videos with nowhere to go.
- **Short viewports and narrow phones get their own lightbox rules.** At `max-height: 520px` (a phone held sideways) the image caps at 58vh — 78vh plus caption, button and padding overflowed a 360px-tall screen with no way to scroll. Below 576px the two 44px arrows stop being grid columns and float over the image; as columns they ate 128px of a 320px screen.

### Header & footer

- **The header is brand, nav, search and cart — nothing else.** A utility row (Track Order · phone) and a green "Order on WhatsApp" button were both built here and **taken back out**: above a delicate wordmark they read as clutter, and both live in the footer on every page and in the mobile menu. Don't re-add them as an "oversight fix".
- **Anything added above `.cc-header` must sit OUTSIDE it.** That element is `position: sticky` and `--cc-header-h` is a hardcoded 82/76/68px that the Shop sticky cart, `.cc-product-card` scroll-margin, the checkout anchor and `#our-story` all measure from. Growing the sticky header without updating the variable misplaces every one of them.
- **The mobile menu ends in one row of four icons** — Instagram · Email · WhatsApp · Track Order. Track Order was a full-width nav link and sat oddly among places to browse; the green "+91 …" button below the row was removed once WhatsApp joined it, as the same destination twice.
- **`COPYRIGHT()` is exported from `Footer.jsx` and imported by `MiniFooter`.** There were three different wordings — mobile, desktop, and a third on cart/checkout/confirm-order. One function, every footer. It reads `© {year} Cake & Crumb`: copyright is automatic under Berne, so "All rights reserved" adds nothing. **Never add ®** — that asserts a registered trademark and is a false claim without one.
- The address links to Google Maps using `DELIVERY.origin`, the same constant the delivery calculator uses, so the pin can't drift from the bakery. Same on `/contact`.

### Customer-facing copy — say it once, and only if it's true

Every rule here was broken on a live page, and each one shipped for months.

- **Nothing is advertised that can't be bought.** Home, Shop and Menu all opened by selling "chocolates". There is no Chocolates category in `products.js` and not one truffle, bonbon or disc among the 207 rows of the counter menu, so three pages you order from named a line that does not exist. **Gallery keeps the word** — it is a portfolio, it genuinely shows chocolate work, and `CAT_TO_SHOP` in `GalleryGrid.jsx` deliberately has no `Chocolates` entry so those photos fall through to an enquiry link (labelled from the photo's own `cat`, so a box of truffles doesn't offer "Ask about a custom cake"). If the bakery starts selling them, that is a product entry with a real counter price — not three words put back into three ledes.
- **No absolute guarantee, anywhere.** See *Reviews*. Shop's promise strip still carried "On-Time Delivery — fresh and on time, every time" long after that exact sentence was removed from About and Reviews for being a promise one kitchen cannot make.
- **A promise strip renders once per page.** `PROMISE_STRIP` was mapped twice on Reviews (see that section). Shop had the same fault split across two components — a sidebar trust list and a closing promise strip, seven tiles for three claims, and on a phone the sidebar lands directly above the strip so they were read back to back. If the tiles are wanted higher up, **move** the band; don't map it twice.
- **Two pages must not open with the same paragraph.** Home's About-section lede was the About page's hero lede word for word, and repeated "the finest ingredients and a passion for perfection" from Home's own hero a screen above. Home also ran two icon strips restating each other ("Freshly Made" against "Nothing Pre-Made", "Custom Orders" against "Made to Your Brief"). When an edit here starts to feel like filler, it is: cut it rather than rewording it.
- **Copy shown to both fulfilment methods must read true for both.** Checkout's COD panel, its COD tab sub-label and the FAQ's payment answer all had the money changing hands "when our delivery partner arrives" — shown to self-pickup customers, who collect it themselves. Branch on `deliveryMethod`.

### Timing — there are no opening hours

The bakery is a made-to-order kitchen, not a shop counter: orders arrive on WhatsApp at any hour, the date is agreed with the customer, and baking starts after that. **Do not publish opening hours anywhere** — the Bakery JSON-LD deliberately has no `openingHoursSpecification` (it would make Google show a "Closed now" badge and turn away someone messaging at 10pm), and the footer column is titled **Ordering**, not Hours.

One wording, used on Home, the footer, the cart, the FAQ and `/contact`: **order a day ahead; order late and it's ready the next day.** The FAQ used to promise "same-day for ready items if ordered before 11 AM", which contradicted five other surfaces and the About page's "nothing sits on a shelf".

**Reply times are hedged for the same reason** — "**usually** within a few hours", on `/contact` (twice) and `/faq` (twice). Two of those four said it flat, with no "usually": an unqualified promise of a reply within hours is an opening-hours commitment wearing a different hat, made by a kitchen that reads WhatsApp at midnight.

### Conventions

- `usePageMeta({ title, description })` at the top of every page; `useJsonLd(id, obj)` for structured data (Shop adds per-product `Product` — **no per-product ratings**, fabricated ones were removed; Reviews carries a real `AggregateRating` only once there are ≥5 reviews). `useJsonLd` re-runs on `JSON.stringify(data)`, so passing a value computed from state is fine — pass `null` to publish nothing.
- **JSON-LD is strict JSON: never put `//` comments inside a `<script type="application/ld+json">` block.** It silently invalidates the whole thing. Explanations go in an HTML comment above the tag. Same rule for FAQ answers — each `a` string feeds both the page and the `acceptedAnswer`, so markup in one leaks into the other; a per-section `more: { to, label }` carries links instead.
- **Bootstrap spacing utilities carry `!important`.** A `.cc-video-strip > .container { padding-bottom: … }` rule loses to `.py-5` with no warning — the gap between the video strip and the gallery "stayed broken" for exactly that reason. Set spacing on the element (`pt-4 pb-2`), not from the stylesheet.
- **Equal-height cards need `height: 100%` on the card, not just the row.** Bootstrap's `.row` stretches the *columns*; the card inside still sizes to its own content and leaves a ragged bottom edge.
- `AllergenTags` has two modes: **compact** (cards — nut warnings and genuine free-from only) and **`verbose`** (quick view — everything). Adding a tag to the compact `important` list badges a large share of the catalogue; check the count first.
- **All money through `inr()`** (`data/format.js`), always two decimals, everywhere — storefront, ChatBot, emails, admin, invoice. Don't hand-build `₹${…}`. Literal `₹` in *static copy* is fine and deliberate (filter labels, budget ranges, "from ₹60" teasers, `DashboardTab`'s `₹1.5L` axis) — `Under ₹500.00` would read as a mistake.
- `<SmartImage>` = `<img>` + shimmer skeleton + lazy load. `<HeartDivider width={…} />` under hero h1s.
- `useIsMobile(bp = 768)` only where the *markup* must differ — prefer CSS for pure layout.
- **Any `YYYY-MM-DD` for a date input goes through `localIso()`** (`utils/adminDate.js`), never `new Date().toISOString().slice(0, 10)`. The UTC form reads as the *previous* day until 05:30 IST, so Checkout's `getMinDeliveryDate()` and Contact's `tomorrowISO()` both offered **today** as their earliest date between midnight and dawn — under a banner asking for a day's notice, in exactly the window this bakery takes orders in. Despite the file's name it is not admin-only.
- **A group of `<input type="radio">` needs a shared `name`.** Without one each input is its own single-option group: arrow keys don't move between them and a screen reader announces twelve unrelated radios instead of one Category choice. Shop's filters pass `name="shop-category"` / `name="shop-price"`, with `role="radiogroup"` + `aria-label` on the wrapper (rather than `fieldset`/`legend`, which would have needed the surrounding CSS rewritten).
- `data/countries.js` drives the Checkout phone `<select>` **and** its per-country length validation — adding a country without a `len` silently accepts anything.
- `<RelatedProducts />` renders on the Cart page only. `<AllergenTags>` owns the code→label map; an unknown code renders nothing, so a typo fails silently.
- Per-icon imports from `react-icons/{fi,tb,fa}` are tree-shaken; don't attempt deep imports.

### localStorage keys

| Key | Owner | Notes |
|---|---|---|
| `cc_cart_v3` | `CartContext.jsx` | Bump when a product id changes meaning **or its price changes** — `add()` merges by id keeping the STORED price. v3 = Aug 2026 real prices (4 cupcake ids repriced, `bk-cakepop` retired). |
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
| `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` | No customer confirmation; admin email still works. Checkout's email field is optional partly because of this. |
| `VITE_SNAPWIDGET_ID` | `InstagramFeed` shows a hand-picked static grid instead of the live feed — and **retitles itself** ("A Few of Our Favourites" rather than "Follow Us on Instagram"), because the old Home markup headed static photos as a feed. |

**Analytics.** `index.html` loads Plausible (cookieless, no consent banner needed, `defer`). It collects **nothing** until the site is registered at plausible.io — the tag loads and reports nowhere, which is harmless but means no data. It does send pageviews to a third party; remove the tag if that isn't wanted.

**Local SEO.** The `Bakery` JSON-LD in `index.html` carries `address`, `geo` (the real lat/lng, matching `DELIVERY.origin`), `areaServed` and `email` — and deliberately **no `openingHoursSpecification`** (see *Timing*).
