# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev               # Vite dev server (defaults to http://localhost:5173/cake-crumb/)
npm run build             # Production build → dist/
npm run preview           # Serve the built dist/ for smoke-testing
npm run lint              # ESLint over the repo
npm run optimize-images   # Regenerate .webp siblings for everything in /public
npm run deploy            # Build + copy dist/index.html → dist/404.html + push dist/ to gh-pages
```

There are no automated tests; verify UI changes by running `npm run dev` and clicking through. The user has a standing preference: **do not run `npm run build`, `npm run deploy`, or `git push` unless explicitly asked.** Make source changes and stop.

## Architecture

Single-page React storefront for **Cake & Crumb**, a bakery in Vaso (Kheda, Gujarat — PIN 387380). Stack: Vite + React 19 + React Router v7 + Bootstrap 5 + Tailwind 4 (both loaded — Bootstrap for layout, Tailwind utilities for one-off styling). Deployed to GitHub Pages.

### GitHub Pages base path

`vite.config.js` sets `base: '/cake-crumb/'` because the site is served from `akbarhusen3411.github.io/cake-crumb/`. Consequences:

- `main.jsx` passes `basename={import.meta.env.BASE_URL}` to `<BrowserRouter>` — all `<Link to="/...">` paths are relative to the base.
- `src/data/images.js` exports `asset()` and `u()` helpers that prepend `BASE_URL` to any `/public` path. **Never write a raw `/products/foo.webp` string in JSX** — go through `asset()`/`u()` or the `img` object, or it breaks in production.
- `images.js` auto-rewrites `.jpeg/.jpg/.png` → `.webp` at runtime via `toWebP()`. Product entries can keep `.jpeg` paths and still serve WebP after `npm run optimize-images`.
- `predeploy` copies `dist/index.html` → `dist/404.html` so GitHub Pages serves the SPA for deep links.

### Backend-less design, optional Firebase + EmailJS

The app works entirely client-side via `localStorage`; cloud services are progressive enhancements:

- `src/firebase.js` reads `VITE_FIREBASE_*`. `isFirebaseEnabled` is a cheap synchronous env check, safe to import anywhere. The SDK is **lazy-loaded**: `getDb()` and `getFirebaseAuth()` `await import('firebase/...')` on first use and memoise the app. **Never statically `import 'firebase/firestore'`** in a module reachable from the eager bundle (ChatBot + footer Newsletter are eager) — it would pull the ~100KB-gz SDK onto every page's critical path. Services dynamic-import the specific Firestore functions inside each async call.
- Services in `src/services/` (`orders.js`, `reviews.js`, `newsletter.js`) follow the same shape: `await getDb()` → if present, dynamic-import + write to Firestore → always mirror to `localStorage` → never throw. UI must not block on them.
- Firestore security rules live in `FIREBASE_SETUP.md` (not in code). `orders` are admin-only reads (`if request.auth != null`); the public `tracking` mirror and `reviews` are world-readable; all are validated-create. **`reviews` create uses `hasOnly([...])` + per-field size caps** (anti-spam) and **`reviews` delete requires auth** (`if request.auth != null`) — so adding a new field to a review means updating the `hasOnly` list in the console or creates silently fail. When you change a collection's shape **or add a collection**, update the rules in the Firebase console or writes/reads fail in production.
- `src/services/emailNotify.js` exposes `sendOrderEmail()` (admin, Template #1), `sendCustomerConfirmation()` (customer, Template #2, gated on `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`), and `sendNewsletterNotification()` (reuses Template #1 to notify the bakery of a new subscriber). All fire-and-forget. See `EMAILJS_SETUP.md`. The customer template's recipient is `{{to_email}}`; its Bcc must stay empty or the bakery gets a duplicate of every customer email. EmailJS keys are public in the bundle by design; abuse is capped by the free-tier quota (the paid domain-allowlist is intentionally not used).

**Review moderation + anti-spam.** The Reviews-page (`/reviews`) delete/moderation UI is gated by **real Firebase Auth** — the same admin account as `/admin/orders`, via `getFirebaseAuth()` loaded **lazily** (only when the 🔒 lock is clicked, so ordinary visitors to this public page never pull the auth SDK). There is **no hardcoded moderation password** — don't reintroduce one. Both review forms (`/review` `ReviewSubmit.jsx` and the Reviews-page share form) run `src/utils/reviewGuard.js`: a hidden **honeypot** field + a **one-per-minute** localStorage rate-limit. These are speed bumps only; the real boundary is the Firestore rules (reviews delete = auth-only, create = `hasOnly` + size-capped).

**Review photos are data URLs, not Storage objects.** There is no storage bucket — `src/utils/compressImage.js` canvas-downscales to `maxDim: 1000`, re-encodes to JPEG at `quality: 0.7` (typically well under ~120 KB) and the resulting `data:image/jpeg;base64,…` string is written as the review's `photo` field. That compression is what keeps a phone photo inside Firestore's **1 MB document limit** — don't relax it, and remember `photo` is one of the fields the `hasOnly` + size-cap rules must permit.

### Order flow (the load-bearing feature)

The flow is deliberately **split so the customer's WhatsApp message stays clean and the admin manages orders from a private dashboard** — not from links inside the customer's message.

Placing an order (`Checkout.jsx::placeOrder`) triggers parallel fire-and-forget side-effects, any of which can fail without breaking the others:

1. **WhatsApp** — `buildWhatsAppLink()` (`WhatsAppButton.jsx`, `WHATSAPP_PHONE = 919173183440`) opens `wa.me` pre-filled with a **clean customer receipt** built by `buildOrderMessage()`: order ID + items + price only. **No admin/confirm/track links and no repeated personal details** — the bakery reads name/phone/address from the dashboard, matched by order ID. Don't re-add links or PII to this message.
2. **`saveOrder()`** writes the `orders` collection (full PII, admin-only) **and** a public PII-free `tracking/{orderId}` mirror (status/items/totals/date — never name/phone/email/address) **and** a last-50 `localStorage` mirror.
3. **Admin email** — `sendOrderEmail()` (EmailJS Template #1) to the bakery inbox.
4. **Customer email** — `sendCustomerConfirmation()` (Template #2, optional).

Order IDs come from `services/orderId.js`: `CC-AB-DDMMYY-XXXXX` (initials + date + 5 random chars from a Crockford-style alphabet with no `0/O/1/I`, so an ID read aloud can't be mistyped). The suffix was a per-day **localStorage counter**, which collided: every device counted from `0001`, so two same-day customers with the same initials got the *same ID* — and `tracking/{orderId}` is written with `setDoc`, keyed by that ID. Randomness also stops the world-readable `tracking` collection from being enumerated or pre-created with a forged status. **Don't make the suffix sequential again.**

**Payment — size-gated, no UTR.** The payment options depend on cart **subtotal**, gated by the fraud-protection knobs in `shopConfig.js` (`BULK_ORDER_MIN`, `DEPOSIT_PCT`, `COD_MAX_INR` — all ₹1000 / 50% today; read the live values, don't trust this prose):

- **Below `BULK_ORDER_MIN`** — **Pay Now (UPI, full)** or **Cash on Delivery** (default UPI). Unchanged.
- **At/above `BULK_ORDER_MIN` ("bulk")** — plain full-COD is **removed**. The customer picks **Pay 50% Advance (UPI)** (the `deposit` method — pays `depositAmount(total)` now, balance in cash on delivery) or **Pay Full Now (UPI)**. This is the anti-fraud measure: no order ≥ ₹1000 ever leaves the kitchen with zero money collected. Added at the owner's request after a fake-address COD no-show concern.

`order.payment` is `{ method: 'upi'|'deposit'|'cod', paid, depositAmount, balanceDue }`. `paid` is the customer's **claim** for any UPI payment (full or advance), never proof — the bakery **verifies the credit in its own bank** before confirming (`AdminOrders.jsx` has a collapsible "How to verify this payment" matching by amount — the **deposit** amount for a deposit order — + payer name + time, plus a "⚠ Verify before baking" badge/checklist on bulk orders and an address-not-geolocated warning). A "reserve — pay later" option existed and was removed (customers reserved without paying); **there is still no UTR/reference field**. The bulk rule is enforced by four coordinated surfaces — `shopConfig.js` (the knobs + `isBulkOrder`/`depositAmount`), `Checkout.jsx` (payment tabs + deposit QR + coercion effect), `AdminOrders.jsx` (verify UI), and **`ChatBot.jsx`** (the bot can't take inline UPI, so a bulk bot order just flags "50% advance requested before baking" in the WhatsApp message + on-screen summary). Change a threshold in one place and keep those in sync. Don't reintroduce a reserve option, a customer-entered UTR, or full-COD for bulk orders without the user's explicit ask.

Vestigial `utr` plumbing survives the removal and is **intentionally left alone**: `orders.js` still writes `utr: ''` on every order doc, and `emailNotify.js` hardcodes `utr: '—'` to satisfy the `{{utr}}` placeholder in EmailJS Template #1. Deleting them means editing the live EmailJS template too — don't "clean this up" as a drive-by.

**Admin dashboard — `/admin/orders` (`AdminOrders.jsx`).** Password is real **Firebase Auth** (Email/Password user created in the console; `getFirebaseAuth()` sets `browserSessionPersistence` so login is required again after the tab closes). It subscribes live (`subscribeOrders()` → `onSnapshot`) to all orders and steps each through a **status lifecycle**: `placed → confirmed → ready_for_pickup | out_for_delivery → completed` (+ `cancelled`). The "Ready" action is **method-aware** (pickup vs delivery, from `order.deliveryMethod`). Every action calls `updateOrderStatus(firebaseId, orderId, status)` — which updates both the `orders` doc and the `tracking` mirror — then **opens WhatsApp synchronously** (before any `await`, or mobile browsers block `window.open`) with a status-appropriate message to the customer.

**Customer tracking — `/track-order` (`TrackOrder.jsx`).** Reads the public `tracking/{orderId}` doc via `getOrderTracking()`, so it works cross-device with no auth and no PII exposed; falls back to the local mirror. `statusMeta()` maps each status to a label/icon for the customer.

**Legacy:** `/confirm-order` (`ConfirmOrder.jsx`) and the URL-params fallback (`id/name/phone/total/date/method`) still exist but are no longer linked from the customer message — the dashboard supersedes them. Don't rely on them for the primary flow.

### Daily accounting ERP — `/admin/accounting` (private bookkeeping)

A second admin area, separate from `/admin/orders`. It's the bakery's **manual daily-accounting tool** (walk-in/family orders, expenses, cash taken for personal use) — **not** website customer orders. Gated by the same Firebase Auth admin account. Ported from a former JavaFX desktop app at the owner's request. See `ACCOUNTING_SETUP.md`.

- **Data** — `src/services/accounting.js` mirrors the `orders.js` shape (Firestore when configured, always mirrored to `localStorage`, never throws). Four **admin-only** collections: `acc_orders`, `acc_expenses`, `acc_withdrawals`, `acc_menu`. Both orders and expenses are **itemized bills**: `acc_orders` = `{ date, customer, items: [{category, item, variant, qty, unitPrice}], amount, paid, method, status, notes }` (one customer, many items — `orderTotal()`/`orderQty()` in accounting.js sum the lines and fall back to legacy top-level `qty`/`unitPrice` for old single-item docs); `acc_expenses` = `{ date, vendor, method, notes, items: [{name, price}], delivery, amount }` where `amount = Σ item prices + delivery`. All money summaries read `amount` / `orderTotal()`, so line-items are additive detail, not a breaking change. **Adding these means adding Firestore rules** (`allow read, write: if request.auth != null` for each) or cloud writes silently fall back to localStorage — the snippet is in `ACCOUNTING_SETUP.md`. **Be aware of how loud that failure isn't:** every helper catches, logs to the console and falls back to `localStorage`, so a broken Firestore renders identically to a healthy one — a device shows its own stale rows while the cloud stays empty, and two devices silently disagree. When cloud and local diverge, don't trust the rendered figures; read Firestore directly (a `getDocs` with **no** fallback) before diagnosing anything.
- **Menu** — `acc_menu` seeds once from `src/data/accountingMenu.js` (207 items generated from the menu PDF, incl. drinks/coffee the storefront doesn't sell). Editable in the Menu tab; **independent from `products.js`** (the storefront catalogue) by design — accounting prices are actual sale prices, storefront prices are the published ones.
- **Money model (two pockets)** — every order/expense/withdrawal carries `method: 'Cash' | 'Online'`. `computeSummary()` (pure, client-side) yields **Cash in Hand** = cashReceived − cashExpenses − cashWithdrawn, **In Bank (Online)** = the online equivalents, and **Money in Hand** = their sum. Online payments still count as earnings/profit; "In Bank" is online money not yet withdrawn. Profit = Sales − Expenses. The Dashboard shows an all-time balance plus a month picker that re-scopes every figure via `computeSummary(..., 'YYYY-MM')`.
- **Searchable dropdowns** — `src/components/admin/SearchableSelect.jsx` (type-to-filter, keyboard nav, `allowCustom` for free text). The New Order form (`components/admin/accounting/OrderForm.jsx`) is a Category → Item → Size/Variant cascade that auto-fills price. Tab components live in `components/admin/accounting/`.
- **Admin chrome + mobile** — `App.jsx` hides the storefront `Navbar`/`Footer`/`ChatBot`/`BackToTop`/`FestivalBanner` on any `/admin/*` route (`isAdmin = pathname.startsWith('/admin')`) and renders **`components/admin/AdminHeader.jsx`** in their place: the same `.cc-header` frosted-glass bar and brand mark, with every customer affordance removed (no nav links, no search, no cart) and an "Admin" pill. **The mark is deliberately not a link** — on the storefront it goes home, which here would be an accidental exit from the tool. `AdminNav.jsx` is the private Orders ⇄ Accounting pill nav on both admin pages (never linked publicly). Both pages share one header row — title in rose Playfair, icon-only refresh beside it, `Sign out` pushed right with `ms-auto`; keep them in step. Orders + Expenses tabs render **stacked cards on mobile** (via `src/hooks/useIsMobile.js`) instead of the wide desktop table.
- **Dashboard layout + the one chart** — `DashboardTab.jsx` is a responsive grid (`.cc-acc-*` classes at the end of `index.css`): hero pair (Money at hand · Profit) → four KPI tiles → received-by-method split → a **grouped** bar chart of sales vs expenses over the last 6 months. Grouped, not stacked, because the two measures are compared per month and their sum means nothing; one shared axis (never a second y-scale); `MonthlyTab` is the table view of the same figures. The two series colours (`#cf3e63` brand rose, `#6b5bb0`) were run through a palette validator against the actual `#ffffff` card surface — re-validate before changing either. **Figures use `--font-body` (Lato) with `lining-nums tabular-nums`, never `--font-heading`**: Playfair Display is a display serif whose old-style digits sit at uneven heights, so amounts rendered visibly broken. Headings stay Playfair.
- **"Expense taken for use"** — money the owner pulls out of earnings to buy materials; subtracted from *Money at hand* on the **all-time view only**. It was a constant compiled into `DashboardTab.jsx` (so it showed ₹12,300 even on an empty dashboard and needed a code edit to change); it now reads/writes `acc_settings/main` through `getExpenseTakenForUse()` / `setExpenseTakenForUse()`, editable inline, with `TAKEN_DEFAULT = 12300` until explicitly set. `acc_settings` needs its own Firestore rule like the other four collections.
- **One-time importers (flag-gated)** — besides `seedMenuIfEmpty()`, `accounting.js` exports `ensurePerPieceMenu()`, `ensureCakePopPrices()` and `importExcelDataIfNeeded()`; each no-ops after setting a `localStorage` flag (`cc_acc_perpiece_v1`, `cc_acc_cakepop_v2`, `cc_acc_excel_v7`). The Excel importer **dynamically** imports `src/data/excelImport.js` (the owner's Apr–Jul 2026 history, ~4.7k lines auto-generated from `cake_and_crumb_excel.xlsx`) so it emits its own async chunk instead of bloating the bundle. It writes **deterministic ids** (`xl-o-N` / `xl-e-N`) in 400-doc `writeBatch` chunks and deletes prior `xl-`-prefixed rows first, so a re-run overwrites rather than duplicates and a shortened sheet leaves no orphans; manual entries are never touched. **To re-import after regenerating the data, bump the flag suffix** (`_v7` → `_v8`) — editing the data alone changes nothing on a device that already imported. Note the flags are **per-origin**, so `localhost` and the deployed site import independently.

### Contact + payment constants

One public phone/WhatsApp number site-wide: **+91 91731 83440** (`WHATSAPP_PHONE` in `WhatsAppButton.jsx`, mirrored in `index.html` meta/JSON-LD and the Footer/Contact/ChatBot). Email everywhere is `cakeandcrumb.in@gmail.com`; address is *Vaso, Kheda, Gujarat 387380, India*. The checkout **UPI handle is `9081668490@kotakbank`** (`UPI_ID` in `Checkout.jsx`) — that's a bank payment address, **not** a contact number, so it intentionally still contains the old digits; don't "fix" it. All routes/links are catalogued in `LINKS.md`.

### Statutory registrations — numbers only, never the scans

`src/data/certifications.js` is the single source of truth for the bakery's two government registrations: **FSSAI** `20726012000837` (food-safety; fee paid upto **16-07-2027** — it lapses if not renewed) and **Udyam/MSME** `UDYAM-GJ-12-0059372` (Micro, Manufacturing). `src/components/CertBadges.jsx` renders them in two variants — `pills` (Home, under the feature strip; About's "Registered & Certified" section) and `line` (the compact line above the copyright ribbon in both Footer variants, and in the Checkout summary card). Checkout needs its own copy because `NO_FOOTER_ROUTES` swaps in `MiniFooter`, so the footer line never renders there.

**Only the numbers are published — never the certificate scans, and never a link to them.** The FSSAI certificate carries the owner's **photograph**, an **Aadhaar** reference and the **full home street address** (Venipura Mominvad / "Momin House") — all far more specific than the public *Vaso, Kheda 387380*. The Udyam PDF carries **9081668490**, a personal mobile that is not the public contact number (it survives only as the `UPI_ID` bank handle). None of it belongs on a public page and none of it is what anyone checks: customers and food-safety officers verify the **number** on the government portal. Displaying the FSSAI number is required of food businesses under the FSS Act, so this is load-bearing, not decoration. Don't add a certificate image/PDF, and don't surface `9081668490` as a contact.

The About page links each number to its official verification portal — Udyam deep-links to `Udyam_Verify.aspx`; FoSCoS is a JS app with no stable deep link, so it points at the portal root.

### ChatBot is a second, independent order path

`src/components/ChatBot.jsx` (mounted globally in `App.jsx`) is a conversational ordering assistant — not just a help widget. It can place a complete order on its own: it walks the customer through category → item selection → contact details, then calls the same `saveOrder()` + `generateOrderId()` + `wa.me/{WHATSAPP_PHONE}` machinery as Checkout. **It keeps its own `orderCart` in component state** — completely separate from `CartContext`; it only reads `useCart().count` to show a badge. Adding to the ChatBot cart does **not** touch the main cart and vice-versa.

**The bot's menu is derived, not hand-maintained.** `src/data/chatbotMenu.js` generates `MENU_DATA` (price cards), `ORDER_ITEMS` (the order selector), `MENU_CATEGORIES` / `ORDER_CATEGORIES`, and `getItemCat()` from `shopProducts` in `products.js`. A price or item added there appears in the bot automatically — **don't re-embed prices in `ChatBot.jsx`**. Its one category list, `CATEGORY_CONFIG`, maps each `products.js` category to an emoji, subtitle, and a `strip` regex that trims the redundant noun off row labels ("Strawberry Cheesecake" → "Strawberry"); the order selector keeps full names so the WhatsApp receipt stays unambiguous. Categories are matched by **exact string** against `product.category`, so renaming a category in `products.js` means renaming it here too. `CAT_IMAGES` (decorative thumbnails) is keyed by `CATEGORY_CONFIG.key` and is the only hand-kept map left; a missing key just drops the photo strip.

`ORDER_ITEMS` is **one entry per product**. A two-price product (one with a `slice`) becomes a single entry carrying a `variants: [{ name, label, price }, …]` array — rendered as **one row with both tiers as side-by-side add buttons**, not two rows. Each variant's `name` is the full `"<product> — <size>"` string: that is the **cart key** *and* the WhatsApp receipt line, and `getItemCat()`'s `CAT_BY_NAME` is keyed by it — so if you touch the variant-name format, update all three together. Single-price products stay a flat `{ name, price, cat }`. `OrderItemSelector` in `ChatBot.jsx` branches on `item.variants`; its "Done" button shows the running `cartCount` + `total` (passed from the parent's `getCartTotal()`).

Sub-headings inside a bot category (Cheesecakes → Classic/Exotic/Chocolate/Premium; Drinks → Mojitos/Milkshakes/…) come from each product's optional **`group`** field in `products.js`. Nothing else reads `group`. A group is assumed **homogeneous in price shape** — its first item decides whether the card renders one price column or two, so don't mix `slice`-bearing and single-price products under one `group`. Two-price rows are sorted **cheaper unit first**, because `slice` is the *cheaper* tier for cheesecakes (slice vs whole) but the *pricier* one for cookies (box of 12 vs box of 6).

**`src/pages/Menu.jsx` is still an independent hand-written list** (`CARDS`) — a curated 5-items-per-category teaser that deliberately does *not* read `products.js`. It is the one place a price can still drift; check it when prices change. Anything it lists must exist in `products.js` or customers see an item they cannot buy (a phantom "Cheesecake Cup ₹150" lived there until it was removed).

### Delivery is a flat fee, chosen alongside method

Checkout asks the customer to pick **Home Delivery** or **Self-Pickup** (radio cards). For home delivery the customer fills in address + city + 6-digit pincode; for pickup all three are optional.

Delivery pricing is **distance-based flat SLABS**, defined once in `src/data/shopConfig.js` as `DELIVERY = { freeRadiusKm, slabs, origin }` with a `deliveryFee(method, distanceKm = null)` helper. Pickup is always free; home delivery **within `freeRadiusKm` (10 km) is FREE**; **beyond** that the fee is the first `slabs` band whose `maxKm` ≥ distance (bands are `{ maxKm, fee }`, ordered nearest→farthest, last one `maxKm: Infinity`). Current bands: 10–20 km ₹80 · 20–35 ₹150 · 35–50 ₹250 · 50–75 ₹350 · 75–100 ₹450 · 100 km+ ₹550. **Slabs (not per-km) on purpose** — a pincode covers an area, so its geocoded point is approximate; bands make 11 km and 19 km pay the same clean fee, and the bakery confirms/adjusts the final charge. Read the live bands from `shopConfig.js`. `distanceKm === null` means "not measured yet" → treated as free. The checkout total **includes delivery** (`total = subtotal + delivery`). `DELIVERY.origin` is the bakery lat/lng (`22.665087, 72.756359`) decoded from the Plus Code **MQ84+2GQ, Vaso 387380** — update it there if the bakery moves.

**The km figure is never shown to the customer.** `src/services/delivery.js` (`kmFromBakeryByPincode`) resolves the customer's 6-digit pincode to lat/lng via OpenStreetMap **Nominatim**, then Haversine-measures km from `DELIVERY.origin`. `Checkout.jsx` runs this in an effect when the pincode completes (home delivery only) and stores `deliveryKm` + a `deliveryCalc` state — but the customer only ever sees the resulting **delivery amount** (or "…" while calculating), never the distance or any "within 10 km" wording. The km is persisted on the private `orders` doc (`deliveryKm`) and shown **only in the admin dashboard** ("~14 km away") so the bakery knows the distance; it is deliberately **kept out of the public `tracking` mirror** and the customer WhatsApp receipt. If Nominatim fails, `deliveryKm` stays null → free, never a hard error.

**Other surfaces:** Cart shows a neutral "Calculated at checkout" (no address there). The **ChatBot** has a dedicated **pincode step** in its order flow (name → phone → address → **pincode** → date). It geocodes the pincode with the same `kmFromBakeryByPincode` at that step, stores `deliveryKm` in state, then charges `deliveryFee('delivery', deliveryKm)` — so the same pincode costs the same in the bot and on the website. Lookup failure → free (bakery confirms). It persists `customer.pincode` + `deliveryKm` + `deliveryMethod: 'delivery'` so the admin dashboard shows "~N km away" for bot orders too. The bot's final review renders a **styled `OrderSummaryCard`** (a chat message with a `summary` payload, matching the website checkout card) rather than plain text. The order email + tracking mirror read `totals.delivery` (amount only). Change the two knobs in `shopConfig.js` and everything updates together; don't hard-code a fee, print the word "flat", or surface the km/"within 10 km" wording to customers anywhere.

This model was set up at the owner's explicit request (an earlier version was removed for showing a confusing fluctuating quote) — the mitigation is that the distance stays behind the scenes and the customer sees only a clean amount.

### Cupcakes are sold per piece — box price must stay a multiple of 6

Cupcakes use the same two-tier `price`/`slice` shape as brownies, but with an extra invariant: **`price × 6 === slice`** for every cupcake. Per-piece ₹25/₹30/₹35 → box of 6 ₹150/₹180/₹210. Both tiers are quoted side by side (Shop quick-view, ChatBot row, Menu teaser), so if the per-piece tier were rounded, six singles would visibly cost more or less than the box and one of the two numbers would read as a cheat. **Pick the BOX price first, then divide by 6** — that's why Chocolate/Strawberry/Nutella went ₹170 → ₹180 and Pistachio ₹190 → ₹210 when per-piece landed (₹170 ÷ 6 = ₹28.33, which isn't a price you can charge). The owner chose to raise the box prices rather than round the per-piece tier.

`minQty: 2` on each cupcake means the bakery won't bake a single one — see the Cart section for how the rule is enforced.

**A per-piece product shows its BOX price, not its lowest price — and never the per-piece rate.** This is the one place `lowestPrice()` is deliberately *not* what gets displayed. "From ₹25" under a card named **"Vanilla Cupcakes"** showing a photo of six of them reads as *"six cupcakes for ₹25"* — the owner reported customers misreading it exactly that way. So `isPerPiece(p)` (`p.slice != null && p.minQty > 1`) switches three surfaces to the box price: the **Shop card** (`₹150` + a plain "Box of 6" sub-line), the **SearchOverlay** row, and the **per-product JSON-LD `Offer`** — that last one matters because structured data contradicting the visible price gets flagged by search engines. A sub-line quoting the per-piece rate ("Box of 6 · ₹25 per piece") was tried and **explicitly removed at the owner's request**: one unambiguous number on the card beats a cheaper one competing with it. Don't re-add it. The per-piece rate lives only in the **quick-view**, and the **category note above the grid** is what tells customers pieces are an option at all — so that note is load-bearing, not decoration.

**Filters and sort still use `lowestPrice()`**, since the true entry price is 2 × the per-piece rate (₹50), not the box; a cupcake can therefore appear under a price filter its card price sits outside (Pistachio: enters at ₹70, card shows ₹210). That's the accepted trade — don't "fix" it by feeding the box price into the filter, or per-piece buyers stop finding cupcakes in the low bands.

Because the card hides the per-piece rate, **`ProductQuickView` is where the piece count is chosen**: the base tier renders a "How many?" stepper starting at `minQty` with a live total ("Add 4 — ₹100"). Shop passes `key={quickView?.id}` — the modal stays mounted with `product={null}`, so without the key its `qty` state would never re-init for the next product. The cart line name carries the **tier** (`Vanilla Cupcakes (1 pc)`), never the count: `add()` merges by id, so a `(2 pcs)` name would go stale the moment the customer added more. The count lives in cart `qty`.

Four surfaces carry cupcake prices and must move together: `products.js` (the tiers), **`Menu.jsx`** (hand-written teaser — box prices only), `chatbotMenu.js` (`strip: / Cupcakes/` — it was `/ Cupcakes \(6 pcs\)/` before the rename, and the names no longer carry "(6 pcs)"), and the `featured` array in `products.js` (`feat-2` is the ₹180 Red Velvet **box**, a separate cart id from `cup-redvelvet-slice`).

### "Banto 4\"" means inches, not slices

Cheesecake `sizeLabel` is `Banto 4" (inch)` — the `(inch)` is deliberate so customers don't read the `4` as a slice count. Whole ≈ 3 slices by price (`slice` × 3 ≈ whole), but that ratio is **not** shown as "3 slices" on cards or in the ChatBot; keep the size framed as the 4-inch measurement.

### Cart

`src/context/CartContext.jsx` is the single source of truth, persisted to `localStorage` under `cc_cart_v2`. Item shape: `{ id, name, price, img, qty, minQty }`. **There is no minimum order value** — any non-empty cart can proceed to checkout. `MIN_ORDER_INR` still exists in `src/data/shopConfig.js` but is a dead export (nothing reads it); don't re-wire it without checking with the user first. (`updateQty` is exported but unused too — the Cart page only uses `increment`/`decrement`.)

**Per-line minimum quantity (`minQty`).** A product may set `minQty` (only cupcakes do today: `2`). `minQtyOf()` defaults it to 1, so every other product and every pre-existing cart line behaves exactly as before. Three rules move together: `add(product, qty)` **defaults qty to the minimum, not 1** (a first "Add" must land on 2 or the cart opens in an unorderable state); `decrement`/`updateQty` **drop the line entirely** when it falls below the minimum (there's no valid quantity between 0 and 2 to stop at); and the line carries its own `minQty` so a restored cart keeps the rule. `minQty` applies to the **base (`price`) tier only** — a box of 6 is orderable on its own.

The key was bumped `v1` → `v2` when per-piece cupcakes landed: **the cupcake ids changed meaning** (`cup-vanilla` was a box of 6 at ₹150, now a single piece at ₹25), and since `add()` merges by id while keeping the **stored** price, a surviving v1 line would have billed new per-piece adds at the old box rate. Bump the key again if you ever repurpose an existing product id.

The context value also carries derived totals (`count`, `subtotal`, `delivery`, `total`) and a `toast` slot: `add()` sets `toast` to the added product and clears it after 2.4 s, which is the only thing `<CartToast />` renders from. Adding a cart mutation that should surface a toast means setting it in the context, not in the component.

### There is no discount / coupon / offers system — deliberately

Nothing in the codebase implements promotions: no coupon field, no promo code, no percentage off. `CartContext` hardcodes `delivery = 0` and `total = subtotal`; the money path is `subtotal + delivery` end to end. Discounts were scoped and **explicitly deferred by the owner** — don't add one speculatively.

If they're ever requested, two things dominate the design:

- **A per-customer offer ("first order 10% off") cannot be enforced.** There is no customer auth and no server — any `localStorage` "already ordered" flag dies with an incognito tab. The workable pattern is the one the site already uses for UPI: let the customer *claim* it, surface the claim in `AdminOrders.jsx`, and have the bakery verify the phone against past `orders` before confirming. Cart-value/bulk tiers need no identity and are safe.
- **A discount changes `total`, which is computed in five places.** All must move together: `shopConfig.js` (put the helper beside `deliveryFee()`), `CartContext.jsx`, `Checkout.jsx`, **and `ChatBot.jsx`** — the bot is an independent order path and will otherwise quote a different price for the same cart. Then the persistence layer: `orders.js` `totals`, the public `tracking` mirror, `emailNotify.js` (a new `{{discount}}` placeholder means **editing the live EmailJS templates**, or the line silently vanishes), and the **Firestore validated-create rules** (writes fail in production until updated). Note `AdminOrders.jsx` is load-bearing here — the bakery verifies UPI payments **by matching the amount** in its bank, so a discounted total that isn't shown there breaks payment verification.

### Checkout form starts empty (pre-fill removed)

Earlier, `Checkout.jsx` pre-filled the form from two localStorage keys (`cc_customer_v1`, saved on successful order; and `cc_customer_draft_v1`, auto-saved on every keystroke). Customers reported seeing stale data from past visits on a fresh checkout — confusing on mobile especially — so pre-fill was removed.

The form now always starts empty. `clearStoredCustomer()` runs once on mount and again on successful submit, deleting both legacy keys. **Don't reintroduce pre-fill** without checking with the user first — the explicit ask was "no old data in delivery details".

### Routing & lazy loading

`src/App.jsx` uses `lazy()` for every route except `Home`. Routed pages: `/about`, `/menu`, `/shop`, `/gallery`, `/reviews`, `/contact`, `/cart`, `/checkout`, `/review`, `/faq`, `/confirm-order`, `/track-order`, `/admin/orders`, and `/admin/accounting`. Firebase is loaded **on demand** (see the lazy-loading note above) rather than per-route, so the SDK only downloads when a page actually performs a Firestore/Auth call. `vite.config.js` splits a `react-vendor` chunk via `manualChunks`; Firebase emits its own async chunk because it's dynamically imported. The wildcard `<Route path="*" element={<Home />} />` + the `predeploy` 404.html copy make GitHub Pages deep links resolve to the SPA (a harmless 404 is logged on first load — inherent to GH Pages project-page SPAs).

`NO_FOOTER_ROUTES = ['/cart', '/checkout', '/confirm-order']` — on these routes App.jsx renders `<MiniFooter />` instead of the full `<Footer />`.

A small `<ScrollToTop />` component inside `<CartProvider>` listens to `useLocation().pathname` and calls `window.scrollTo({ top: 0 })` on every route change — without it, React Router preserves scroll position and users end up at the bottom of the new page when they tap a header/footer link from a scrolled page.

**Stale-chunk self-heal.** `<ErrorBoundary resetKey={pathname}>` wraps `<Suspense>` in `App.jsx`. Suspense handles a lazy chunk that is *pending*, not one that *rejects* — and every deploy emits new hashed chunk names, so anyone with the tab already open requests a chunk GitHub Pages no longer has the moment they navigate, and the whole tree unmounts to a white screen. `ErrorBoundary.jsx` matches a cross-browser `CHUNK_ERROR` regex (Chrome/Firefox/Safari each word it differently, plus Vite's preload helper) and reloads **once**, guarded by `sessionStorage['cc_chunk_reloaded']` so a genuinely broken build can't trap the user in a reload loop; `App.jsx` calls `clearChunkReloadGuard()` on mount to re-arm it for a later deploy in the same tab. It resets on the `resetKey` **prop** rather than via `key=` — remounting would tear down `<Suspense>` and re-flash the skeleton on every navigation. Keep that regex in sync if the lazy-loading setup changes.

### Product catalog

`src/data/products.js` is hand-maintained — `featured` (Home cards) and `shopProducts` (the full Shop + Menu list). Each entry references `img.someName` from `src/data/images.js`. Some products have a `slice` field for a second price tier (rendered as a second add-to-cart button). Sourced from the original menu PDF; prices in INR.

The Shop page is a 3-column layout (lg+): **left filter sidebar** (Category radio + Price Range radio + Clear Filters button), **center product grid** (3 columns of `.cc-product-card`), **right sticky cart sidebar** with subtotal + View Cart / Checkout buttons + "Need Something Special?" CTA + 3 trust badges. Pagination shows 12 products per page with prev/next + numbered buttons. Filter state lives in component state; changing any filter resets to page 1. Search is wired to the navbar magnifier icon (`SearchOverlay.jsx`), whose results deep-link to `/shop?category=…`.

**`slice`-price gotcha (bit us once):** the "From" price, price-range filter, and price sort all use `lowestPrice(p)` = `Math.min(price, slice)` — **never** `slice || price`. `slice` is the *cheaper* per-slice tier for cheesecakes but the *pricier* box-of-12 for cookies/brownies/cake-pops, so assuming `slice` is smaller made a ₹340 cookie box show "From ₹700" and mis-sort/mis-filter it. Same rule in `SearchOverlay.jsx` and the per-product JSON-LD Offer.

### Festival banner

`src/data/festivals.js` defines date-ranged banners; `FestivalBanner.jsx` picks the active one from the user's local clock. Date ranges wrap year boundaries (see `new-year`).

### Sticky header + `--cc-header-h` CSS variable

`src/components/Navbar.jsx` renders a glass-morph sticky header with a scroll-aware shadow (deeper when `window.scrollY > 24`). All other sticky elements (Shop sidebars, Checkout Order Summary, Contact form anchors) use `top: calc(var(--cc-header-h, 82px) + 1rem)` so they offset cleanly. **Don't hard-code pixel values like `top: 130`** — use the CSS variable.

The `.cc-header::after` is a 16px cream→transparent gradient that sticks with the header. Cards scrolling under the header pass behind this fade strip, so they never appear to visually "touch" the header bottom.

**Critical CSS gotcha:** `html, body` use `overflow-x: clip` (with `overflow-x: hidden` fallback via `@supports`). **Do not set `overflow-x: hidden` on html/body** — it turns the body into a scroll container and `position: sticky` stops working on the header.

### Mobile menu — keep it simple

Mobile hamburger opens a glassmorphism centered panel (`.mobile-menu-overlay`, `.mobile-menu__panel`). A `useEffect` on `location.pathname` force-closes the menu on every route change so a link click can't leave the menu stuck open.

**Scroll lock is event-based, not style-based.** When `open` becomes true, Navbar.jsx attaches `touchmove` + `wheel` listeners to `document` and calls `e.preventDefault()` when the event target is outside `panelRef`. The panel's own `overflow-y: auto` + `overscroll-behavior: contain` lets users scroll within the menu without chaining to the body.

**Do not reintroduce any of these older approaches** — each caused real bugs:
- `position: fixed` + saved-`scrollY` body lock → desynced on rapid open/close and mid-navigation
- Setting `html.style.overflow = 'hidden'` → iOS Safari snaps scroll position to 0 (the "page jumps to top, then menu opens" bug)
- `body.menu-open { overflow: hidden }` CSS class → same iOS jump problem

The current event-listener approach can't desync because nothing mutates the body — the page sits exactly where the user left it; only events outside the panel are swallowed.

### Image pipeline

Drop raster files into `/public` (or `/public/products`), then run `npm run optimize-images`. `scripts/convert-to-webp.js` walks the tree, skips files whose `.webp` is newer than the source, and writes WebP at quality 78. The original `.jpeg/.png` is kept as fallback but the runtime helper in `images.js` always requests `.webp`.

Logo uses `logo_final.webp` (the watercolor cupcake+cookie+roses brand mark, ~168 KB) and bypasses `asset()` because the path is built from `BASE_URL` inline. The source `logo_final.png` (~2.5 MB) is kept in `/public` and `src/assets/` as the high-res original; the WebP sibling is what every component actually loads. The old `logo-icon.{png,webp}` files (a different older crop) still exist as fallbacks for any direct references.

### Brand kit & page heroes

The site uses a consistent "boutique pink" brand kit. **Don't deviate without a reason** — page heroes especially are templated so all 7 (Home / About / Menu / Shop / Reviews / Gallery / Contact) feel like the same site.

- **Fonts** — `Playfair Display` (serif) for h1–h5 + the logo wordmark, `Lato` (sans) for body, `Allura` (script) for accents like the footer flourish and tagline. Loaded via Google Fonts link in `index.html`. CSS vars `--font-heading` / `--font-body` / `--font-script` in `index.css` mirror these.
- **Palette CSS vars** (defined on `:root` in `index.css`):
  - `--cc-rose: #e0617a` — primary CTAs, links, eyebrow text
  - `--cc-rose-deep: #cf3e63` — hover state
  - `--cc-rose-soft: #d7a7ae` — dusty rose accents (dividers, heart bullets, soft borders)
  - `--cc-blush-soft: #f3d7d9` — light pink (badges, soft chip bg)
  - `--cc-cream: #fff6f2`, `--cc-blush: #f7e3df`, `--cc-cocoa: #5b3e36`, `--cc-cocoa-soft: #7a584d` — surfaces and text
- **Hero pattern** — every page hero uses `.cc-{page}-hero` with a soft warm-pink gradient bg (`linear-gradient(180deg, #fbe6df 0%, #f5d9d2 100%)`), `.container py-4 py-md-5`, a 2-column row (text left, rounded-card image right). The image uses `aspect-ratio: 5/4`, `object-fit: cover`, `border-radius: 18px`, and a 2-layer pink-tinted soft drop shadow. Don't use `object-fit: contain` on heroes — earlier attempts left awkward gaps; cover with the right photo is cleaner.
- **`PageHero.jsx` is NOT the shared hero** despite the name — only `/faq` and `/track-order` use it. The 7 brand pages (Home / About / Menu / Shop / Reviews / Gallery / Contact) each **hand-roll** their hero markup against the `.cc-{page}-hero` CSS above. Editing `PageHero.jsx` will not change them; a cross-page hero change means touching all 7 pages.
- **HeartDivider** — `src/components/HeartDivider.jsx` is the small `— ♥ —` divider used under every hero h1 and several section headings. Accepts a `width` prop (default 60). Prefer this over the older `.heart-divider` class for any new heading.
- **Hero photos** — Home uses the local `hero-roses.jpeg`. The other 6 heroes use Unsplash photo IDs (`heroAbout`, `heroMenu`, `heroShop`, `heroReviews`, `heroGallery`, `heroContact` in `images.js`) served through the existing `u()` helper. Use **standard images.unsplash.com IDs only** — premium.unsplash.com / plus.unsplash.com URLs require a paid license and the `u()` helper doesn't support them.

The Reviews page also has its own non-hero patterns worth knowing: a 3-section stats card at the top (overall rating + 5⭐ breakdown bars + 4 sub-ratings with circular icons), a 2-column body (review list left with sort dropdown + Load More, Share-Your-Experience form right + What Customers Love card), and a bottom 4-feature promise strip — the same `.feature-row` pattern Shop uses.

### Conventions worth following

- `usePageMeta({ title, description })` from `src/hooks/usePageMeta.js` updates `<title>` and OG/Twitter meta per route. Call it at the top of every page.
- `useJsonLd(id, jsonObj)` from `src/hooks/useJsonLd.js` injects structured data — Shop adds per-product `Product` JSON-LD with brand, image, and lowest price (**no per-product ratings** — fabricated identical ratings were removed; only Reviews carries a real `AggregateRating`); Home has `Bakery`.
- `<SmartImage>` is the drop-in `<img>` with shimmer skeleton + lazy loading.
- `<HeartDivider width={50} />` is the small heart-on-a-line component used under hero h1s — see Brand kit section.
- INR formatting goes through `inr()` in `src/data/format.js`.
- Per-icon imports from `react-icons/fi`, `react-icons/tb`, and `react-icons/fa` are tree-shaken by Vite — `import { FiHome } from 'react-icons/fi'` is fine, don't try deep imports (the package doesn't expose them).
- `src/data/countries.js` (`COUNTRY_CODES`, `DEFAULT_COUNTRY`) exists solely for the Checkout phone field: it drives the country-code `<select>` **and** the per-country phone-length validation (`len`). India is first and default. Adding a country means adding its `len` or validation silently passes anything.
- `useIsMobile(bp = 768)` from `src/hooks/useIsMobile.js` is the shared breakpoint hook — five accounting tabs use it to swap the desktop table for stacked cards. Prefer CSS for pure layout; use this only where the markup itself must differ.
- `<RelatedProducts />` renders on the Cart page (nowhere else). `<AllergenTags>` owns the code→label/icon map for a product's optional `allergens: ['eggless', 'contains-nuts', …]` array — only a handful of `products.js` entries set it. It has a **compact** mode (dietary positives + nut warnings only) and a `verbose` mode; today only `ProductQuickView` renders it, verbose. An unknown code renders nothing, so a typo fails silently.
- `eslint.config.js` (flat config, ignores `dist`) downgrades `react-refresh/only-export-components`, `react-hooks/set-state-in-effect`, and `react-hooks/purity` to **warnings**. `npm run lint` therefore exits 0 with warnings present — read the output, don't just check the exit code. Baseline is **17 warnings, 0 errors**; treat a new error as yours.

### localStorage keys

Keys are spread across nine files and several carry versioning rules, so they're catalogued here rather than rediscovered:

| Key | Owner | Notes |
|---|---|---|
| `cc_cart_v2` | `CartContext.jsx` | Bump when a product id changes meaning (see Cart) |
| `cc_customer_v1`, `cc_customer_draft_v1` | `Checkout.jsx` | Legacy pre-fill keys — **deleted** on mount and on submit, never written |
| `cc_orders_local_v1`, `cc_reviews_local_v1`, `cc_newsletter_local_v1` | `services/` | Offline mirrors (orders keeps the last 50) |
| `cc_review_last_v1` | `reviewGuard.js` | One-per-minute review rate limit |
| `cc_festival_dismissed_v1` | `FestivalBanner.jsx` | |
| `cc_chunk_reloaded` | `ErrorBoundary.jsx` | **sessionStorage**; one-shot stale-chunk reload guard |
| `cc_acc_orders_v1` … (`cc_{collection}_v1`) | `accounting.js` `lsKey()` | Mirror per accounting collection |
| `cc_acc_perpiece_v1`, `cc_acc_cakepop_v2`, `cc_acc_excel_v7` | `accounting.js` | One-time migration flags — bump the suffix to re-run |
| `cc_acc_taken` | `accounting.js` | Local cache of the `acc_settings/main` figure |

## Environment

`.env` (gitignored — see `.env.example`) holds optional integrations. Vite only reads `.env` at startup; restart `npm run dev` after editing.

| Var | What happens without it |
|---|---|
| `VITE_FIREBASE_*` | Reviews/orders/newsletter fall back to localStorage only. See `FIREBASE_SETUP.md`. |
| `VITE_EMAILJS_SERVICE_ID` + `VITE_EMAILJS_TEMPLATE_ID` + `VITE_EMAILJS_PUBLIC_KEY` | No admin notification email is sent. See `EMAILJS_SETUP.md`. |
| `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` | No customer confirmation email — admin notification still works. Skipped silently. |
| `VITE_SNAPWIDGET_ID` | Optional Instagram feed widget. |
