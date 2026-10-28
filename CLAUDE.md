# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev               # Vite dev server (http://localhost:5173/cake-crumb/)
npm run build             # Production build → dist/
npm run preview           # Serve the built dist/ — the ONLY way to test the CSP (see App Check & the CSP)
npm run lint              # ESLint over the repo
npm run photos            # Link + resize + check photos, in one step (see PHOTOS.md)
npm run check-images      # Every product has a photo, every photo exists
npm run check-prices      # Home's featured cards still quote the catalogue price
npm run optimize-images   # Regenerate .webp siblings for everything in /public
npm run convert-videos    # Phone clips → web-ready muted .mp4 + poster
npm run deploy            # Build + copy index.html → 404.html + stamp sitemap lastmod + push dist/ to gh-pages
```

**`npm run lint` does NOT check CSS** (ESLint only parses `.js`/`.jsx`). A scripted block-removal once left a stray `}` and every page lost its styling while lint stayed green. After any stylesheet edit, especially a scripted one, check both — on **`src/index.css` and `src/admin.css`** (swap the path):

```bash
# 1. braces balance (comments stripped so braces inside them don't count)
node -e "const s=require('fs').readFileSync('src/index.css','utf8').replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[{}]/g,' '));let d=0,b=[];s.split('\n').forEach((l,i)=>{for(const c of l){if(c==='{')d++;else if(c==='}'){d--;if(d<0){b.push(i+1);d=0}}}});console.log(d,b)"
# 2. it actually compiles (balanced braces ≠ valid CSS)
node --input-type=module -e "import {compile} from 'tailwindcss';import fs from 'node:fs';await compile(fs.readFileSync('src/index.css','utf8'),{base:process.cwd(),loadStylesheet:async()=>({base:process.cwd(),content:''}),loadModule:async()=>({base:process.cwd(),module:{}})});console.log('ok')"
```

**A JSX comment cannot be the first child of `{cond && ( … )}`** — that's two children, and fails as `Parsing error: Unexpected token className`. Put the comment *above* the `{cond && (` line. Inside an opening tag's attribute list, use `//` on its own line. Both hit repeatedly.

**A backtick inside a component's `<style>{` … `}</style>` block ends the string.** Several components (`ProductQuickView` especially) ship a stylesheet in a template literal; a backtick anywhere in it — even in a CSS comment — fails as `Parsing error: Unexpected token …`. Hit three times in one sitting. After editing one:

```bash
# no stray backticks, and braces still balance
node -e "const s=require('fs').readFileSync('src/components/ProductQuickView.jsx','utf8');const a=s.indexOf('<style>{\`')+9,b=s.indexOf('\`}</style>');const c=s.slice(a,b);console.log('backticks',(c.match(/\`/g)||[]).length);let d=0;for(const ch of c.replace(/\/\*[\s\S]*?\*\//g,'')){if(ch==='{')d++;else if(ch==='}')d--}console.log('depth',d)"
```

No automated tests — verify by running `npm run dev` and clicking through. **Never click Place Order or send a ChatBot order in a test script** — the dev server has the real Firebase and EmailJS keys, so it saves a real order and emails the bakery (an automated run was stopped for exactly this). Test up to the button; check the receipt/email builders by reading them. **Don't run `build`, `deploy` or `git push` unless explicitly asked.** Don't update this file unless explicitly asked either. **Keep this file under 150,000 characters** — tighten wording rather than letting it grow past that.

`npm run lint` exits 0 with warnings (`eslint.config.js` downgrades `react-refresh/only-export-components`, `react-hooks/set-state-in-effect`, `react-hooks/purity`). Baseline is **18 warnings, 0 errors** — read the output, and check whether any warning names a file you touched rather than counting.

**Checking logic without a test runner.** Pure `data/*` and `utils/*` modules run straight from Node (that's how the price rules, order-number sequence and CSV shape were verified):

```bash
node --input-type=module -e "import {describe} from './src/data/products.js'; console.log(describe(...))"
```

**Anything that reaches `src/firebase.js` throws** (`import.meta.env` is undefined outside Vite). `services/accounting.js` is the usual casualty; copy the pure function out, or drive it through a module that doesn't import Firebase. `data/offers.js` and anything importing `data/images.js` needs Vite too — load it with `createServer({ server: { middlewareMode: true }, appType: 'custom', cacheDir: '<a scratch dir>' }).ssrLoadModule(...)`.

**Never start a script's Vite server on the project's default cache.** A `createServer()` without its own `cacheDir` rewrites `node_modules/.vite/deps` under the owner's running `npm run dev`; that server then answers **504 Outdated Optimize Dep** for `firebase_app.js`, which every admin page reports as **"Firebase is not configured."** — `.env` was fine. It cost a confused login. Fix: Ctrl+C, `npm run dev -- --force`.

## Start here

Single-page React storefront for **Cake & Crumb**, a bakery in Vaso (Kheda, Gujarat 387380). Vite + React 19 + React Router v7 + Bootstrap 5 (layout) + Tailwind 4 (utilities), deployed to GitHub Pages. **No backend** — Firebase and EmailJS are optional; everything falls back to `localStorage`.

`README.md` is the human-facing counterpart: pinned dependency versions, setup walk-through, and the live URL (**https://akbarhusen3411.github.io/cake-crumb/**). It doesn't repeat anything below.

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
| Reviews, ratings, testimonials | **Reviews** | Three fabrications were removed; reviewer emails were publicly readable |
| Offers on the website (`/offers`, Home, the cart gift) | **Offers on the site** | Free gifts only, detected in the cart; only the two Diwali offers run (5–15 Nov); Mid-Month switches on and off by date |
| A poster or newspaper ad | **Print posters**, **No discount system** | Print, not code — every printed fact is hand-copied, and no offer may move a total |
| Adding a product category | **Product catalog** (*Special Gifts*) | Six files must agree; one silently strips the allergen badges if missed |
| The printed A4 menu | **Printed menu** | Generated from `products.js` — rebuild after a price change |
| The visiting card or thank-you card | **Print cards** | Contact details hand-copied; PDFs/PNGs regenerated by hand |
| Facebook cover/posts or the Google-review poster | **Social media** | Phones crop the cover's sides; no prices; the review QR carries a G badge only because it's level H |
| Anything claiming a fact to a customer | **Customer-facing copy**, **Timing**, **Reviews**, **Policy pages** | No opening hours, no invented ratings, no absolute guarantees, nothing advertised that isn't sold — and FAQ, policy pages and checkout must agree |

Two cross-cutting rules: **all money goes through `inr()`** (`src/data/format.js`, always two decimals), and **a change to any total must move all five places at once** — see *No discount system*.

## Architecture

### GitHub Pages base path

`vite.config.js` sets `base: '/cake-crumb/'`; `main.jsx` passes `basename={import.meta.env.BASE_URL}` to `<BrowserRouter>`.

- **Never write a raw `/products/foo.webp` string in JSX** — use `asset()`/`u()`/`img` from `src/data/images.js` or it breaks in production. `toWebP()` rewrites `.jpeg/.jpg/.png` → `.webp` at runtime, so product entries can keep `.jpeg` paths.
- `predeploy` copies `dist/index.html` → `dist/404.html` so deep links resolve, then **`scripts/prerender-routes.js` writes `dist/<route>.html` for every sitemap URL** — see *Routing*.

### Firebase + EmailJS (both optional)

- `src/firebase.js`: `isFirebaseEnabled` is a cheap sync env check, safe anywhere. A failed SDK load **resets its memo (`_appPromise = null`) so the next call retries**; screens say `firebaseUnavailableMessage()` ("couldn't load — check the connection") rather than "not configured". The SDK is **lazy-loaded** — `getDb()` / `getFirebaseAuth()` `await import(...)` and memoise. **Never statically `import 'firebase/firestore'`** from an eager-bundle module (the footer Newsletter is eager; the ChatBot isn't — see `DeferredChatBot`); it adds ~100KB-gz to every page.
- **App Check is attached inside `getFirebaseApp()`, after `initializeApp()` and before any Firestore/Auth call** — otherwise the first request goes out unattested. Gated on `VITE_RECAPTCHA_SITE_KEY`, **returns early when unset** (keeps `npm run dev` working without the key). It **never throws**, even with enforcement on: throwing on a reCAPTCHA hiccup would take all storefront Firestore access down. **`/privacy` states reCAPTCHA runs on every page**, so unsetting that var makes a published claim false.
- `src/services/*.js` share one shape: `await getDb()` → dynamic-import + write → **always** mirror to `localStorage` → **never throw**. UI must not block on them.
- Firestore rules live in **`firestore.rules`** (repo root, mirrored in `FIREBASE_SETUP.md`) — **pasted into the console by hand**; nothing deploys it. Admin is **`isAdmin()` = signed in AS `cakeandcrumb.in@gmail.com`**, not `request.auth != null` (any self-made account passed that), and **console sign-up is off** (Authentication → Settings → User actions). A new admin collection uses `isAdmin()`. `orders` are admin-only reads; the public `tracking` mirror and `reviews` are world-readable; all validated-create. **`reviews` create uses `hasOnly([...])` + size caps**, so a new review field needs the console rule updated or creates fail silently. **A field named in a validation line but missing from `hasOnly` is unsatisfiable** — two leftover `email is string` lines outlived `email`'s removal from the list, and **no review could be written for months**. Check the two lists agree. Changing a collection's shape **or adding one** needs a rules update.
- `emailNotify.js`: the free gift (`order.offerGift`) is appended to `items` and `deliveryTbc` drives `{{delivery}}` — no new placeholders, so the live templates stay untouched. `sendOrderEmail()` (Template #1), `sendCustomerConfirmation()` (Template #2, gated on `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`), `sendNewsletterNotification()` and `sendEnquiryNotification()` (both reuse #1 — free tier caps at two templates — overloading the order fields and leaving `to_email` blank so the template's fixed bakery address is used). Fire-and-forget. The customer template's Bcc **must stay empty** or the bakery gets duplicates. EmailJS keys are public by design.

**Reviews moderation** is gated by real Firebase Auth (same admin account), loaded lazily when the 🔒 is clicked. **No hardcoded moderation password — don't reintroduce one.** Both review forms run `utils/reviewGuard.js` (honeypot + one-per-minute localStorage limit) — speed bumps; the Firestore rules are the boundary.

**Review photos are data URLs, not Storage objects.** `utils/compressImage.js` downscales to `maxDim: 1000` / JPEG `quality: 0.7` (~120 KB) to fit Firestore's **1 MB document limit** — don't relax it; `photo` must stay in `hasOnly`.

### App Check & the CSP — the two server-side-ish controls

`orders`, `tracking` and `reviews` all accept **unauthenticated creates** (customers never sign in), so rules validate *what* is written, not *who*. Anyone can lift the Firebase config from the bundle. **Nothing client-side can be protected by obfuscation — don't propose it.**

- **App Check** (`initAppCheck()` in `firebase.js`) attests a request came from the real site; runs **inside `getFirebaseApp()`, before `getDb()`/`getFirebaseAuth()` hand out a service**. Never throws; enforcement is a console decision. No `VITE_RECAPTCHA_SITE_KEY` ⇒ no-op.
- **reCAPTCHA Enterprise, not v3** (`ReCaptchaEnterpriseProvider`) — plain reCAPTCHA is deprecated for new integrations; Enterprise is free to 10k assessments/month on **Spark**. **One key ID, no secret.** The key is **score-based** (`Challenge: No`, locked at creation): no checkbox, and a low-scored visitor **can't appeal**.
- **Enforcement for Cloud Firestore is ON (16 Sep 2026).** Unattested writes are rejected. Because every service falls back to `localStorage`, the customer still gets the WhatsApp receipt and email while the order silently never saves — **that failure is always one console toggle away**: an expired key, new origin or provider swap looks like a healthy site to the customer. `Unenforce` reverses it within a minute, no deploy.
- **Verify with the console's metrics, not DevTools.** App Check → APIs → Cloud Firestore splits verified / outdated client / unknown origin / invalid. Read a **recent** window (the 7-day figure averages in pre-launch days). `unknown origin` = no token; **`invalid` = a token that failed validation**, in practice a debug token the console doesn't hold.
  - **A missing `exchangeDebugToken` request is NOT a failure** — the token is cached in IndexedDB for 1 day (incognito keeps it until *every* incognito window closes). Chasing it costs an hour; the metrics answer in a minute.
  - Healthy localhost: `recaptcha__en.js` and `anchor?ar=…&k=<site key>` load from `www.google.com`, the console prints `App Check debug token: …` (**unconditional in debug mode, not an error**), and no `[firebase] App Check init failed:`.
  - **Enforcement takes up to 15 minutes to start.**
  - **Test by placing a real order and checking `/admin/orders`** — never the WhatsApp message or email, which fire independently of `saveOrder()`. Check `/track-order` too (separate `tracking` create). Then `/admin/accounting` on localhost: figures load but a new entry doesn't survive refresh ⇒ silent `localStorage` fallback, caused by the debug token.
- **Dev uses a debug token from `.env`** (`VITE_APPCHECK_DEBUG_TOKEN`), not `FIREBASE_APPCHECK_DEBUG_TOKEN = true` — with `true` the SDK invents a token to paste, the console masks it instantly, and one wrong character shows only as a permanent 403. Generate it in the console. Cost an afternoon once.

**CSP** lives in `vite.config.js` as `cspPlugin`, injected as a `<meta>` at **`head-prepend`** (a meta CSP only governs what follows it). GitHub Pages can't set headers, so: **`frame-ancestors` is ignored** (no clickjacking protection), and **no Report-Only mode** (can't be staged).

- **`apply: 'build'` deliberately** — the dev server's React Refresh inline preamble would be blocked. Test with `npm run preview`, **never** `npm run dev`.
- **`script-src` has no `'unsafe-inline'` and must not.** The only inline blocks are `type="application/ld+json"` (never executed). `style-src` needs it (components ship `<style>` blocks).
- **Any new integration needs its origin added here**, or it fails in production only. Every origin present was read off the SDKs and built HTML, not recalled.

### Order flow

Split so the customer's WhatsApp message stays clean and the bakery works from a private dashboard. `Checkout.jsx::placeOrder` fires four independent side-effects:

1. **WhatsApp** — `buildWhatsAppLink()` (`WHATSAPP_PHONE = 919173183440`) opens `wa.me` with a **clean receipt**: order ID + items + price. **No admin/track links, no repeated PII.**
2. **`saveOrder()`** — `orders` (full PII, admin-only) + a PII-free public `tracking/{orderId}` mirror + a last-50 `localStorage` mirror.
3. **`sendOrderEmail()`** to the bakery.
4. **`sendCustomerConfirmation()`** (optional).

**Both order paths must READ what `saveOrder()` returns** — `{ …, firebaseId }`, with `firebaseId: null` plus an `error` when the cloud write failed. `Checkout.jsx` and `ChatBot.jsx` discarded it for months; under enforcement a rejected write still gets the WhatsApp receipt and email. Both now branch on it **without awaiting it** (the success screen mustn't wait on a round trip): the WhatsApp band turns amber and becomes an instruction, and **Track Order is hidden** (it would answer "order not found"). `isFirebaseEnabled` separates a failed write from a dev build with no cloud. The **`tracking` mirror reports itself too** (`tracked`) — a second write to a second collection that can fail alone. A false `tracked` hides the Track link **and nothing else**: the order saved, so the band stays green.

**Order IDs** (`services/orderId.js`): `CC-AB-DDMMYY-XXXXX` — initials + date + 5 random Crockford chars (no `0/O/1/I`). The old per-day localStorage counter collided (every device started at `0001`, and `tracking/{orderId}` is `setDoc`-keyed). Randomness also stops the world-readable `tracking` collection being enumerated or pre-created with a forged status. **Don't make the suffix sequential again.**

**Payment — size-gated, no UTR.** Knobs in `shopConfig.js`: `BULK_ORDER_MIN`, `DEPOSIT_PCT` (₹1000 / 50% today — read the live values). No separate COD cap: being bulk is what removes COD.

- Below `BULK_ORDER_MIN`: **UPI full** or **COD**. At/above ("bulk"): **50% advance (UPI)** or **pay in full** — no order ≥ ₹1000 leaves with zero collected.
- `order.payment` = `{ method: 'upi'|'deposit'|'cod', paid, depositAmount, balanceDue }`.
- **`method: 'deposit'` does NOT imply money arrived — always branch on `paid`.** Checkout deposits are `paid: true` (the customer's claim); **ChatBot** deposits `paid: false`. `paymentLabel()`, the bulk checklist, the verify-payment panel (**hidden when nothing was claimed**) and `buildWebsiteInvoice` all read `paid`.
- `paid` is a **claim, never proof**. `AdminOrders.jsx` has a "How to verify this payment" panel (match amount — the *deposit* for deposit orders — + payer + time), a "⚠ Verify before baking" checklist on bulk orders, and an address-not-geolocated warning.
- Four surfaces enforce the bulk rule and must stay in sync: `shopConfig.js`, `Checkout.jsx`, `AdminOrders.jsx`, **`ChatBot.jsx`**. Three describe it, reading `BULK_ORDER_MIN` / `DEPOSIT_PCT` rather than quoting a figure: the **Cart** payment line, the **FAQ** Payment and bulk answers (which once promised bulk *discounts*), and `/refund-policy`.
- **Nothing is delivered on self-pickup, so nothing may say "Cash on Delivery".** Stored `payment.method` stays `'cod'` (bulk rule, totals, rules and invoice read it), but every **label** follows `deliveryMethod`: checkout payment tab and recap, success screen, WhatsApp receipt, `paymentLabel()` in `AdminOrders.jsx`, `payment_method` in `emailNotify.js`. A deposit's balance line follows suit ("₹X on pickup").
- **Don't reintroduce** "reserve — pay later", a customer-entered UTR, or full-COD for bulk.
- Vestigial `utr` plumbing is **intentionally left**: `orders.js` writes `utr: ''`, `emailNotify.js` hardcodes `utr: '—'` for the live template's `{{utr}}`. Removing means editing that template — not a drive-by.

**`/admin/orders` (`AdminOrders.jsx`)** — real Firebase Auth, `browserSessionPersistence`. `waNumber()` turns an 11-digit number with a leading 0 (ChatBot free text) into `91` + 10 digits — `wa.me/0…` opened nothing. A failed status save shows an **`actionError` banner** (the WhatsApp message already went), and `refresh()` **keeps the list on screen** when the cloud read falls back rather than swapping in this device's local copy. Live `onSnapshot`; steps orders `placed → confirmed → ready_for_pickup | out_for_delivery → completed` (+ `cancelled`); "Ready" is method-aware. Every action calls `updateOrderStatus()` (updates `orders` and `tracking`) then **opens WhatsApp synchronously — before any `await`**, or mobile blocks `window.open`. Not PIN-gated; only `/admin/accounting` is.

**"Ask to Confirm" is a message, not a status.** A `placed` order shows Confirm · Ask to Confirm · Cancel. The middle has `messageOnly: true`, so `act()` opens WhatsApp and **returns before the Firestore write**. A `pending_nudge` status would reach `tracking` (which `statusMeta()` can't render) and need a rules update. Keep future nudges on `messageOnly`.

**`/track-order`** reads the public `tracking/{orderId}` doc — no auth, no PII. A four-step line (`TrackProgress`): Placed → Confirmed → Ready / On its way → Completed; step 3's wording follows `deliveryMethod`, and **`cancelled` renders no line**. `stepIndex()` and `statusMeta()` share one status vocabulary with `AdminOrders.jsx`; a new status means editing all three. Reuses `.cc-progress` from the checkout stepper. **Legacy:** `/confirm-order` and its URL-params fallback exist but aren't linked; don't rely on them.

### Accounting ERP — `/admin/accounting`

The bakery's **manual daily bookkeeping** (walk-ins, expenses, owner's cash) — **not** website orders. Same Firebase Auth account. See `ACCOUNTING_SETUP.md`.

**Data & sync**

- `services/accounting.js` mirrors `orders.js`. Four admin-only collections: `acc_orders`, `acc_expenses`, `acc_withdrawals`, `acc_menu`. Orders and expenses are **itemized bills** (`items: [...]` + `amount`); `orderTotal()`/`orderQty()` sum lines and fall back to legacy `qty`/`unitPrice`. Summaries read `amount`/`orderTotal()`. **A new collection needs a rule** (`allow read, write: if isAdmin();` in `firestore.rules`, then paste it into the console — `request.auth != null` was the hole the admin lock closed) or writes fall back to localStorage silently.
- **A broken Firestore looks like a healthy one** — every helper falls back to `localStorage`, so one device shows stale rows and a failed write *looks* saved until the next cloud read reverts it. Failures route through `reportCloudError()` → `onCloudError(cb)` → a "Not saved to the cloud" banner; keep new cloud calls on that path. **Saves survive a weak connection and a closed tab**: a new or edited row carries `_pending: <nonce>` in localStorage, a delete leaves a tombstone (`cc_<coll>_deleted_v1`), and **only OUR write promise resolving clears them** (`markSaved(coll, id, nonce)` — a newer edit keeps its own mark). `mergePending()` lets a pending row beat the cloud copy and drops tombstoned ids; every snapshot runs `flushPending()` (deletes, then `setDoc` of each pending row on its own id — re-read per row, one flush per collection, `inFlight` stops double sends); every read/write has a 12 s `withTimeout()`. **Never clear the mark on sight of the doc in a snapshot** — Firestore's listener shows a write the moment it's *queued*, and with the default memory cache that queue dies with the tab (the first version did this and lost offline saves). `cloudData()` strips `id`/`_pending` from anything written, and cloud rows' own `_pending` is ignored (an old undo stored one). The fake-Firestore test harness that proves this lives only in a session scratchpad — re-create it before changing this layer. When cloud and local diverge, **read Firestore directly** (`getDocs`, no fallback) before diagnosing.
- **Live** — `subscribeDocs()` (`onSnapshot`) for all four. Without Firebase it delivers `localStorage` once, which is why tabs still call `reload()` after a save — keep those.
- **`acc_*` rules have no `hasOnly`**, so new fields are free (unlike `reviews`).
- **Menu** — `acc_menu` seeds from `data/accountingMenu.js` (207 items). Editable and **independent from `products.js`** by design: these are actual sale prices.
- **Menu seed** — `seedMenuIfEmpty()` seeds only on a **confirmed-empty SERVER read** (`getDocsFromServer`, timed out); an error or slow signal skips (an offline device once read its empty local copy and the batch landed on top of the real menu — 207 duplicates).
- **Menu importers** — `ensurePerPieceMenu()` / `ensureCakePopPrices()` / `ensureFreeGiftMenu()` / `ensureDiwaliPackMenu()` run **once per BOOK**, not per device: `alreadyRan(flag)` / `markRan(flag)` keep the mark in **`acc_settings/main.migrations`** (an old `localStorage` flag — `cc_acc_perpiece_v1`, `cc_acc_cakepop_v2`, `cc_acc_freegift_v1`, `cc_acc_diwalipack_v4` — is promoted to the cloud mark). Bump the suffix to re-run. **A book with a menu but no `migrations` record at all** has every flag in `IMPORTER_FLAGS` stamped without running (pre-marker books ran them long ago; a new phone must not re-add deleted rows or old prices) — add a new importer's flag there. They only *add* missing rows (matched on category + name [+ variant]) — except `ensureDiwaliPackMenu()`, which also **corrects the price of its own pack rows** to `offers.js` (v4 moved Red Velvet/Biscoff ₹279 → ₹289) and never touches another row.
- **`Free Gift` category (₹0)** — Cake Pop, Cupcake, Cheesecake Tub, Sponge Cake Tub, variant `Free`, for booking offer gifts. **The only category allowed a ₹0 rate**: `isFreeGiftLine()` (`accounting.js`) exempts it from `OrderForm`'s unpriced-line refusal; everywhere else ₹0 still means a size was never picked.
- **Diwali pack rows** — `Diwali pack of 10` for every cupcake and the three ₹15 cake pops, `Diwali 2 boxes of 6` for Variety, read from `DIWALI_PACK10` / `DIWALI_PACK2` in `offers.js`.
- **The Excel importer is retired — don't reinstate it.** It `set` its `xl-` rows on any device that hadn't run it, so a second PC silently reverted every cloud edit. `data/excelImport.js` was deleted Oct 2026 (Apr–Jul 2026 figures in git history). **Any bulk importer must be gated on a cloud marker, not a per-device one.**

**Money model**

- **Working capital.** Money in hand = invested + received − expenses − taken out. **Profit = received − expenses** — owner's money in isn't income, money out isn't a cost. Cash-basis, no stock: profit dips after a big purchase and recovers. Don't "fix" with inventory.
- **One profit definition — `s.profit`** (money **received**; unpaid sits in `toCollect`). `DashboardTab` and `MonthlyTab` once computed their own and disagreed. **Cancelled orders**: `computeSummary` drops them, so any on-screen total (the Orders list's `· ₹X`) must too.
- **Two pockets** — every row has `method: 'Cash' | 'Online'`; Cash in Hand / In Bank / Money in Hand as in `computeSummary`. The `withdrawn` "✓ Taken to cash" toggle feeds `onlineTakenToCash`. That Dashboard line is all-time only.
- **`direction` on `acc_withdrawals`** — `'in'` (owner invests) or `'out'`; **missing counts as `'out'`**. Reuses the collection so no new rule.
- **Order status is tracking only** — `Completed | In Progress | Pending | Cancelled`. **Only `Cancelled` changes a figure.** Adding a status is safe; renaming `Cancelled` isn't.
- **"Expense taken for use" is gone** — a hand-typed figure that double-counted. Don't reintroduce a manual money field. `acc_settings` still needs its rule (PIN hash, `lastBackupAt`).

**Order numbers — `orderNo`, `CC-XX-DDMMYY-NN`.** `CC-MF-300726-05` = Makbul Fatema, 30 Jul 2026, **fifth order of that month**. The sequence **counts the month** (matched on `MMYY` via `stampOf()`), climbing across days and restarting when the month turns; the last number is the month's count. It counted the day until the owner asked otherwise. Helpers `nextOrderNo()`/`dayStamp()`/`stampOf()`/`customerInitials()`/`orderSortKey()` in `accounting.js`; **`OrdersTab.save()` is the only assigner.** Column header reads **"Order ID"**; field stays `orderNo`.
  - **A label, never the document key** — two devices in one month compute the same next number; as a key it would overwrite. Same trap as `orderId.js` — **don't promote it, or make the storefront ID sequential.**
  - **Never reused, never regenerated** — deleting `-02` leaves `-03`; editing date/name keeps the number.
  - **No bulk backfill** — old rows show `—` and get a number when next edited.
  - **Sort by `orderSortKey`, never the number** (it leads with initials).

**Locks, PIN, backups**

- **Locks on exit, not a timer.** Leaving the page clears `cc_acc_unlocked`, so `/admin/orders` and back asks again. A 2-minute idle timer was replaced (it left figures up and could fire mid-read). Tabs within accounting don't lock; **refresh keeps you unlocked** (unload runs no React cleanups — that's what `sessionStorage` is for). The effect **re-asserts on mount** for StrictMode.
- **PIN gate (`PinGate.jsx`) — a second lock, not a second wall.** The boundary is Auth + rules; the admin password reads everything from the console. It protects **an unattended signed-in tab** — don't describe it as securing data. **Never hardcoded**: only `SHA-256(salt:pin)` in `acc_settings/main.accPinHash`. Forgotten or changing → delete that field in the console and the gate reopens in "choose a PIN" mode. **No in-app change-PIN screen** (built and removed). A failed *read* of the hash **does not unlock**. Subscriptions gate on `ready = isAdmin && unlocked`.
- **Danger zone** — "Download backup" and "start a fresh book" (`clearAccountingBooks()`, wipes orders/expenses/withdrawals in 400-doc batches, **keeps `acc_menu`**), gated on typing `DELETE`. No undo, no server backup — keep gate and backup button together.
- **Backups go through `downloadAccountingBackup()`** (`utils/accBackup.js`: `exportAccountingBackup()` → JSON → `markBackupTaken()`), from both the Danger zone and the Dashboard reminder. Date is **`acc_settings/main.lastBackupAt`** (merged beside the PIN hash, mirrored to `cc_acc_last_backup_v1`), so a laptop backup counts on the phone; `getLastBackupAt()` returns the newer and never throws. Dashboard line is quiet while recent, **amber from 30 days or never** — it's the only backup there is.

**Fields added without a rules change** — **`phone`** on `acc_orders` (optional, 10 digits via `normalizePhone()` in `utils/customerPhone.js`, which accepts `+91`/`91`/leading-0 and returns `null` for non-Indian-mobile) and **`category`** on `acc_expenses` (one of `EXPENSE_CATS` in `utils/expenseCats.js`: Ingredients · Packaging · Gas & utilities · Equipment · Delivery & travel · Other). **Older rows have neither**: read category via `catOf()` (missing/unknown → `Other`), never `e.category`; a missing phone means "no reminder". Not backfilled.

**Shared UI pieces**

- Customer list dedupes **case-insensitively**. Date helpers in `utils/adminDate.js` — **`todayIso()` shifts by the local offset** (plain UTC dated a pre-05:30 IST entry to yesterday); it delegates to **`localIso(date)`**, which the storefront uses too.
- **`SearchableSelect.jsx`** (`allowCustom`, `compact`, `icon`, `autoOpen`) — list is **portalled onto `document.body`, `position: fixed`**, tracking its field on scroll/resize (capture), flipping above when there's no room; as a child an `overflow: auto` ancestor clipped it. **One list open at a time** via a module-level registry. Outside-click in the **capture** phase (+ `touchstart`); **Escape `stopPropagation()`s** so it doesn't close the Modal. `spellCheck` off.
  - **Below 768px it's a bottom sheet** (`.cc-ssheet`, portalled): read-only trigger, title (`title` prop, else placeholder), own search box, thumb-sized options with a price chip, a "Use '…'" row for `allowCustom`. `visualViewport` sets `--cc-kb` to sit above the iOS keyboard; search **only autofocuses when there are no options**.
- **`Modal.jsx`** — flex-column sheet in a **non-scrolling backdrop**: header/footer pinned, `.cc-modal-body` scrolls (`overscroll-behavior: contain`). Widths `480 / wide 640 / xl 900`, plus **`full`** at 1180 (also `height: 100%`) and **`flush`** (no body padding or scrolling). `icon` draws a title badge. **Labelled `role="dialog"`** (`aria-modal`, `aria-labelledby`), takes focus on open and returns it on close. **Deliberately NOT a focus trap** — `SearchableSelect` portals outside the sheet. Edge-to-edge on a phone. **Never `align-items: stretch` on the backdrop** — taller content spills outside its white background.

**Entry sheets — `OrderForm.jsx` and `ExpenseForm` (in `ExpensesTab.jsx`), one layout**

- A `.cc-sheet` workbench: item list takes width and height (`.cc-sheet__main`); once-per-order fields (date, customer, payment, status) in a side column (`.cc-sheet__side`), **first in the DOM** and sent right with `order: 2` so a phone asks for them first. Panes stack below 992px.
- **One scroller per pane, never nested.** Dialog body + inner grid both with `overscroll-behavior: contain` made the wheel stop dead on short laptops ("it sticks"). Use `Modal`'s **`full`** + **`flush`**; the flush body is a **flex parent** above 992px so the sheet stretches rather than resolving a percentage (that path collapses the panes).
- One item = **one row** of `.cc-stable` (`# · Category · Item · Size · Qty · Rate · Total · ⌫`; expenses `# · Item · Qty · ₹ each · Total · ⌫`). Column widths declared **once on the frame** as `--cc-cols`, inherited by header and rows. Minimums fit a 1024px laptop (~623px list, needs ~600px); **`min-width: 0` on inputs** lets them shrink (an `<input>`'s `size` gives an intrinsic width).
- **Rate comes from the menu, never typed.** Read-only, `—` when none; save refuses an unpriced line (would book ₹0; the message points at Menu & Prices) — except a `Free Gift` line, which is meant to be ₹0. Changing category/item/size **clears `unitPrice`**. Total sums only lines naming an item.
- **Category carries into the next item** and its item list auto-opens.
- Sizes via **`sortVariants()`** (`utils/orderItems.js`): piece → slice → tub → box → whole, then count, then price.
- Total band closes the table (`.cc-stotal`); same figure in the footer (`.cc-sheet__foottotal`) and the side column's summary (`.cc-ssum`). A separate recap under the table was removed.
- **Exactly one add control** — `.cc-saddrow`, full width, **outside** the scroller. (A header pill duplicated it and went, with `.cc-additem` / `.cc-oadd`.) **Enter on Qty (orders) or ₹ each (expenses)** opens the next line. `.cc-stable` is **`flex: 0 1 auto`** — hugs its rows, scrolls once it outgrows the pane.
- **Built for long lists.** `buildMenuIndex()` indexes `acc_menu` once (category → items → sorted sizes); rows are `memo`ised with stable callbacks (`addLine` reads a `linesRef` synced in an effect, **not** `lines`). Each row used to scan all 207 menu rows three times.
- **Paid / Cash / Status are segmented buttons** (`.cc-seg`): `--ok` solid green for Paid, `--warn` amber **tint** for unpaid (matching `.cc-row-unpaid`), `--danger` for Cancelled.
- **Every colour was measured against its own background** (`#fffaf8` or `#fdeef2` here, not white); four shipped at 2.1–4.3:1 where small text needs 4.5. Check new ones.
- **Mistakes flagged on the row** (`.cc-sline--noprice` — named item, no rate; `.cc-sline--short` — a per-piece item on 1) **and in the footer**, never `alert()`. Each form has a pure `problem()` → `{ field, msg }`; Save sets `tried`, then the message is **recomputed every render** (no clearing logic). `.cc-sheet__error` is the footer's first line (footer wraps via `:has()` only while shown); the named field is ringed (`Field`'s `bad` → `.cc-field--bad`, or `.cc-sheet__main--bad`).
- **Save locks while saving** — `saving={busy}`, "Saving…", Cancel greyed, and `save()` checks a **`savingRef`** (a fast double tap beats the re-render; it once booked an order twice under one number). **All four forms** (Orders, Expenses, My Money, Menu & Prices) release the lock in a **`finally`** and call `reload()` **without awaiting** it — a throw or a slow read left the lock set and the next Save silently did nothing.
- **Below 768px each item is a card** (`.cc-sline` grid areas `n n del / cat / item / size / qty rate amt`; expenses `n del / item / qty rate amt`), "Item N" via `::before`, `.cc-sline__cap` captions over Qty / Rate / Total. **Header row needs `.cc-sline.cc-sline--head`** to stay hidden (a later `.cc-sline { display: flex }` outranked the single class). Qty is a **`.cc-qty` −/+ stepper** (minus stops at the per-piece minimum of 2), inputs **16px** (iOS zoom), `Field`'s **`half`** pairs short fields (Payment + Money in; Paid from + Delivery). `.cc-ssum` hidden; no inner scroll.
- **Orders: optional Phone** under Customer. Picking a known customer fills their latest number (`phones` prop, built oldest → newest) **until the field is typed in** (`phoneTyped` ref). Invalid blocks Save; blank is fine.
- **Quantities:** expenses keep **decimals** (0.5 kg — `qtyOf()`, up to 3 places, `step="any"`) and `amount` is summed from exactly the saved lines (a rounded line beside an unrounded total made the list and CSV disagree); orders are **whole pieces**, and the form's total uses the same rounded qty that's saved.
- **Expenses: "What for"** — six `.cc-catpick` chips in category colours. New expenses start on **Ingredients**; old ones open on **Other**.
- **Expense-only** — vendor and item suggestions via **two `<datalist>`s** (one element each, deduped case-insensitively). Delivery is a side-column field; summary states items / delivery / total separately.

**Lists, cards & actions**

- **One list grammar.** Orders, Expenses, My Money and Monthly Report use **`.cc-grid-table`** (vertical rules, cells centred) in **`.cc-table-scroll`** (~10 rows, sticky header, hidden scrollbar). Item cells list **every line with `qty × rate` and amount** (`.cc-items-cell` / `.cc-item-line` — the one place centring is overridden). Unpaid orders are **tinted end to end** (`.cc-row-unpaid`) with an amber left bar — on the **cells**, since Bootstrap paints `--bs-table-bg` over a `<tr>`. Amounts take their Paid/Unpaid chip colour.
- **My Money is paged** and has the shared `PeriodSelect`; In/Out totals follow the *filter*, not the page.
- **Phone cards — `.cc-ocard`** (Orders, Expenses, My Money). Orders: name + total · ID · date · method + Paid chip · status + Owes · one row per item (`qty × rate`; line amount **only with 2+ items**) · one slim action bar with **Mark paid labelled and green when unpaid**, the rest icons (`.cc-ocard__ico`). Expenses/My Money skip the bar and put Edit/Delete on the meta line. A roomier card was rejected as too tall. My Money cards have a green/purple left edge for in/out.
- **Undo after one-tap money actions** — Mark paid/unpaid, To cash/In bank, Delete on Orders; Delete on Expenses and My Money. `useUndo(reload)` (`accounting/useUndo.js`) + `<UndoToast>`, 6s, a new action replaces it. **Undo writes the old value back** (`{ paid: !!o.paid }`), never toggles; **an undone delete is re-added with `addDocRec(withoutId(row))`** (new id, same fields incl. `orderNo`). **The delete `confirm()` stays** too.
- **WhatsApp payment reminder** — an unpaid, non-cancelled order with a phone (`o.phone`, else the customer's latest) gets a `FaWhatsapp` button. Lists **every unpaid order of that customer** with total owed (`reminderText()`, max five lines), opens `wa.me/91…` **synchronously from the click**. Phone is searchable and a CSV column.
- **Floating "+"** (`AddFab.jsx`) on Orders and Expenses, phone only, only while no form/invoice is open. Parent gets bottom padding via `*:has(> .cc-fab)`; the Undo bar rides above it. My Money has two add buttons and no FAB.
- **Open tab survives refresh** — `cc_acc_tab` in **sessionStorage**, validated against `TABS`.
- **Orders tab extras** — **Today strip** (`.cc-today`: count · received · to collect, before filters, cancelled excluded) with a Today ⇄ All-dates toggle; **Status filter chips** on lower-cased status; list total **excludes cancelled** and says how many; **customer names filter to themselves** (`.cc-name-link`). Online orders have a **`.cc-bankchip`** (In bank ⇄ ✓ Taken to cash), **`white-space: nowrap`**; explanation lives on its tooltip and one `.cc-acc-note` line. Row actions in one **`.cc-row-actions`** group, a hairline before Delete. Dashboard's "still to collect" opens Orders filtered to unpaid **for the month the Dashboard shows** (`onShowUnpaid(period)`) via `AdminAccounting`'s `ordersPreset`, read in `OrdersTab`'s **state initialisers** (tabs mount fresh); any tab pill clears it.
- **Duplicate an order** (`FiCopy`) — copies into a **new** order: today's date, no `id`, no `orderNo`. `OrderForm` decides `editing` from **`initial?.id`**, so a prefilled copy saves via `addDocRec` and gets its own number. Subtitle *Copy of CC-…*.
- **Cancelled rows read as void** — greyed, amount struck (`.cc-row-cancelled` / `.cc-card-cancelled`; money cell found by **`.cc-amount`**, never column position). **Cancelled beats unpaid.**
- **"Owes ₹X" chip** (`.cc-owes`) — customer's unpaid total across *all* orders, case-insensitive. Hidden when this row **is** the whole debt.
- **CSV export** (`utils/csv.js`, Orders · Expenses · Monthly) — the **filtered rows** (what the count says). Money as **plain numbers, never `inr()` strings** (text won't sum), ISO dates, **leading BOM** (or Excel mangles ₹). The JSON backup restores the app; this is for an accountant.
  - **One line per item**, the parent's fields repeated down its lines.
  - **`Order total` / `Expense total` and `Delivery` only on the first line of their group** — repeated, they'd multiply.
  - Every file ends with a **TOTAL row**. Orders' says *"cancelled excluded"* (exported but not summed), then splits into **EARNINGS (paid only)** and **STILL TO COLLECT (unpaid)** — the raw Total sum is *invoiced*, not earnings (`s.profit` counts **received**).
- **Menu & Prices is an accordion** — one category open at a time (filtering opens all matches). Layout `.cc-mmenu` / `.cc-mcat` / `.cc-mitem`: search + New item on one line, **categories as a swipeable chip row**, one card per category (letter badge · name · item/price counts · price range · chevron). Open, **from 768px each item is ONE compact row** (owner: the item-over-tiles layout wasted space) — name in a fixed column · its tiles in a wrapping flex row sized to their text (so "Diwali pack of 10" is never cut to "Diwali…") · "+ Size" at the end; `.cc-mitem__head` is `display: contents` to join that grid. On a phone the name sits above the tiles. Sizes are **price tiles, two per row on a phone**, sorted by `sortVariants()`, labelled by `variantLabel()` (bare "6" → "Box of 6"). **"+ Size"** prefills category + item; **"Add an item to …"** prefills category, as does New item while a chip is selected.
  - **Tap a tile to edit the price in place** (`PriceTile`): Enter/✓ saves `{ price }` only, Esc/✕ cancels, ⋯ opens the full form. **Nothing saves on blur.** Digits and a dot only; blank turns red.

**Admin chrome**

- `App.jsx` hides the storefront shell on `/admin/*` and renders `AdminHeader.jsx`; the brand mark is **deliberately not a link**. `AdminNav.jsx` is the private Orders ⇄ Accounting nav, never linked publicly; optional **`className`**. Tab pills (`.cc-acc-tabs` / `.cc-acc-tab`) have a hairline under the row; the open tab scrolls to centre on a phone. The five list tabs swap to cards on mobile via `useIsMobile()`.
- **Both admin pages use `AdminPageHead.jsx`** — `.cc-acc-head` panel: icon badge · title + one context line (`sub`) · `AdminNav` · a framed toolbar. Each tool renders **only when its handler is passed** (`onRefresh`, `onLock`, `onSignOut`); refresh **spins while `loading`**. Laptop one row; phone badge · title · tools, then the switcher as a full-width two-half control. **The PIN screen uses it** (sign-out only). Don't give a page its own header again (they drifted and the switcher jumped).
- **Active pill on touch screens:** phones keep `:hover` on the last tap, and `.cc-acc-tab:hover` outranked `--on`. Hover lives in **`@media (hover: hover)`**; on state is the doubled `.cc-acc-tab.cc-acc-tab--on` on `--cc-rose-deep`. Same deep rose for `AdminNav`'s active pill.
- **Admin styles live in `src/admin.css`**, imported only by `AdminOrders.jsx` and `AdminAccounting.jsx` (shipped with their lazy chunks — ~90 KB off every storefront page, Oct 2026). It loads AFTER `index.css`, and **no class is styled in both** (checked at the split) so order can't flip a rule — keep admin rules there. Exceptions kept in `index.css`: `.cc-admin-header`/`.cc-admin-badge` (`App.jsx` renders `AdminHeader` before a chunk loads). The invoice's `@page` rule moved with it — still top level. Phone printing copies every loaded `<style>`/`<link>`, so it follows.
- **Admin mobile classes (≤768px)** in `admin.css` — reuse them: **`.cc-admin-tabs`** (snap strip, bleeds to the edge), **`.cc-admin-toolbar`** (stacks; the search's inline `maxWidth` needs `!important`), **`.cc-admin-filters`** (labels in a fixed column), **`.cc-row-action`** / **`.cc-row-actions`** (19px icons, real hit area), **`.cc-card-actions`/`.cc-card-action`** (centred icon tiles; label on `title`/`aria-label`). Phone toolbar: New (full width) → search + CSV → count **centred** (`text-align: center !important` beats `.text-end`); each `.cc-filter-group` is `nowrap` and scrolls sideways.

**Dashboard & reports**

- **Dashboard is deliberately sparse** — hero pair (Money in hand · Profit; **with one month picked the first reads "Net this month"** — a month's figure is its net flow, not the till) → four tiles (Invested · Earnings · Expenses · Taken out) → one to-collect / cash / bank line → one chart. **Adding a figure means removing one.** Earnings reads **`s.paidCount`**, never `orderCount`. Chart is **grouped, not stacked**, one axis, series `#cf3e63` / `#6b5bb0` (validated against `#ffffff` — re-validate before changing). **Figures use `--font-body` with `lining-nums tabular-nums`, never `--font-heading`** (Playfair's old-style digits look broken).
  - Each tile's top edge takes its colour (`--tone`); with one month picked, Profit and Earnings show **"▲ 12% vs Sep"** against the calendar month before (`prevMonthOf()`), nothing on All time or when last month was ₹0; the **backup line** sits under the to-collect strip.
  - **Phone (<700px):** heroes swap the long formula for a short one (`.cc-acc-note--long` / `--short`), tiles 2 × 2, to-collect becomes an amber strip with Cash / In bank below. Its link is `--cc-rose-ink` (rose-deep is 4.3:1 on that amber).
- **Monthly Report on a phone** — one card per month: month + "N orders · N paid", **Profit or Loss as headline** (green/red left edge), a bar of expenses vs earnings, Earnings · Expenses · To collect, the **three biggest expense categories**, "Your money: in / out" only if any. To-collect amber is `#9a5a0c` there (`#c67c17` is 3:1 on white). An **"All months" card** leads, the desktop table has a sticky **tfoot** — both **summed from the month rows**, matching the CSV TOTAL.
- **Expenses "where it went"** — `spendByCat(rows)` over filtered rows draws a split bar + legend (`.cc-expcats`, with 2+ categories); a legend entry sets the Category filter. Category is also a filter row, column, card tag and CSV column.

### Invoices, printing & PDF

`components/admin/InvoiceModal.jsx` serves **both** admin pages. It renders one **normalised shape**; `utils/invoice.js` adapts each source (`buildAccountingInvoice` / `buildWebsiteInvoice`), so the component never branches on its caller.

**Shape & references**

- **One reference on the sheet.** `printRef = invoice.reference || invoice.number` — the order's own number (`CC-AH-300726-01` or the storefront `orderId`), falling back to the `invoiceNumber()` hash only for rows predating order numbers. Two near-identical codes was a liability; the hash can't be looked up. `printRef` also names the PDF.
- **Payment wording follows `deliveryMethod`** ("Cash on pickup", "due on pickup") — `onWhat` in `buildWebsiteInvoice`.
- A **website** invoice adds phone, address, fulfilment, subtotal/delivery and an advance/balance line. **`deliveryKm` is deliberately absent** (bakery-side only).
- `invoiceNumber()` = `CC-INV-DDMMYY-XXXX` by **hashing the doc id, not a counter**. No write, identical on every device.
- **No GST line** (no GSTIN). FSSAI + Udyam *numbers* do appear.
- `utils/orderItems.js` is shared with `OrdersTab`. **`displayVariant()` hides unit markers** (`Per piece`, `Per slice`, `Standard`) — **display only**; the stored `variant` still drives `isPerPieceVariant()`'s 2-piece minimum, menu price match and search. **`variantLabel()` renders a bare count as "Box of N"**; `OrderForm` prettifies only the **label**, never the `value`.

**Download PDF** (primary action)

- Exists because a printed page can't be made clean: browsers stamp URL, date and "Page 1 of 1" into the margin; **Android Chrome can't turn that off**.
- `downloadInvoicePdf()` **dynamically imports `html-to-image` + `jspdf` inside the handler**, keeping the eager chunk unchanged.
- **`html-to-image`, not `html2canvas`** (which throws on Tailwind 4's `oklch()`). Rasterises via `foreignObject` at `pixelRatio: 3`, keeping real Playfair/Lato; PDF text is an **image** — accepted.
- **Always A4 landscape**, matching Print. The tall receipt is height-constrained and centred with white either side — inherent.

**Printing — the split is empirical**

- **Desktop** calls `window.print()` in place (`printInPlace()`), swapping `document.title` to `Invoice …` (names the PDF), restored on `afterprint`, a 20s timer (iOS never fires it) and unmount.
- **Mobile prints from a hidden iframe** (`printViaIframe()` + `standaloneInvoiceHtml()`), falling back to `printInPlace()`. In-place on a phone came back blank **twice** (mobile paginates from the layout viewport). A visible `window.open` tab worked but was rejected.
- **Devtools "mobile view" can't test this** — it keeps the desktop print engine.
- The frame needs all three: a **`<base href>`** (`srcdoc`'s base is `about:srcdoc`), the invoice wrapped in **`.cc-invoice-overlay`** (print hides `body > *:not(.cc-invoice-overlay)`), and printing **after `fonts.ready`**. Removed after 60s — tearing down when `print()` returns cancels async dialogs.
- The `@media print` **`html, body` overflow reset with `!important`** outranks the modal's inline scroll lock and `overflow-x: clip` — keep it.
- **`@page { size: A4 landscape; margin: 0 }` is at the TOP LEVEL of `src/admin.css`** (moved from `index.css` with the admin styles), not inside `@media print` (there it was dropped: portrait with headers). `margin: 0` suppresses the browser header/footer; **date/title/URL/page number are one group**.
- **Chrome's dialog overrides `@page` and remembers it.** A portrait-with-headers printout isn't proof the CSS broke — check the built CSS, then More settings.
- The modal is `createPortal`'d onto `document.body` so print can `display: none` `#root`; hiding the app in place prints blank pages.

**Layout** — colour in **text and borders, never filled blocks** (backgrounds only print with "Background graphics"). Masthead: two corners on desktop **and in print**, stacked and centred on a phone (`@media screen and (…)`, or it matches print too). Sheet **560px**; Qty/Rate/Amount **centred under headings** with fixed widths; print pins it to `190mm`, centred. Payment status and grand total share one closing line above a 2px rule. Closing quote hashed from the order id (reprints identical), in **Playfair italic, not Allura** (customers couldn't read the script).

### ChatBot — a second, independent order path

`src/components/ChatBot.jsx` places complete orders using the same `saveOrder()` + `generateOrderId()` + `wa.me` as Checkout. **It keeps its own `orderCart` in state**, separate from `CartContext` (reads only `count` for a badge).

- **Its menu is derived.** `data/chatbotMenu.js` generates `MENU_DATA`, `ORDER_ITEMS`, category lists and `getItemCat()` from `shopProducts`. **Don't re-embed prices in `ChatBot.jsx`.** `CATEGORY_CONFIG` maps category → emoji/subtitle/`strip` regex by **exact string** — renaming a category in `products.js` means renaming it here. `CAT_IMAGES` is hand-kept; a missing key just drops the photo strip.
- `ORDER_ITEMS` is **one entry per product**; two prices → one row with `variants`. Each variant `name` is `"<product> — <size>"`: the **cart key**, **WhatsApp receipt line** and `CAT_BY_NAME` key — change all three together. `min` rides on the `price` tier only (cupcakes: 2).
- Sub-headings come from each product's optional **`group`**. A group is assumed **homogeneous in price shape** (first item decides one or two columns). Two-price rows sort **cheaper unit first**.
- **Fires the same side-effects as Checkout** — `saveOrder()` + `sendOrderEmail()` + `sendCustomerConfirmation()` (it once called only `saveOrder()`, so a blocked pop-up left an order nobody heard of). Optional **`email` step** with Skip. Writes **`deliveryDate`** as its own field. Shape matches Checkout's.
- **`window.open` without `'noopener'`, then `win.opener = null`** — with noopener it returns `null` by spec, so every order read as "pop-up blocked" and customers sent it twice. The date picker uses **`localIso()`**, Confirm refuses a date before tomorrow, and **typed text at the date step is refused** (it saved "kal" as the date); picker label follows pickup/delivery. Reply times say "usually within a few hours"; area is "Vaso, Kheda and the surrounding districts"; the number comes from `WHATSAPP_PHONE` (`PHONE_PRETTY`).
- **Diwali offers in the chat** — `chatbotPacks(entries)` (`offerRules.js`) adds pack variants with `was` + `cat`; `mainOptions()` shows "🎁 Diwali Offers" only while live (`offersMessage()` lists them, regular price as "(was ₹…)"); a `PackHint` under a variant says how many more make a pack. `chatGift()` puts the gift on the review/summary cards (`GiftNote`), the order (`offerGift`) and the receipt ("*🎁 Free gift:* …"). Pack and gift prices read the **real** calendar, like Checkout.
- Prices through **`inr()`** (`money()` in `chatbotMenu.js`), never `₹${price}`.

**`src/pages/Menu.jsx` picks *which* products to show, not their prices.** `CARDS` lists product **ids** (`picks`), `rowsFor()` looks them up in `products.js`. Hand-maintained: picks, card order, `strip` regexes, notes. A removed id silently drops its row — check the page after renaming/removing. "from …" figures in notes are derived, via `inr()`.

### Delivery — flat slabs, chosen alongside method

Checkout asks **Home Delivery** or **Self-Pickup**. Pricing lives in `shopConfig.js` as `DELIVERY = { freeRadiusKm, slabs, origin }` + `deliveryFee(method, distanceKm)`. Pickup free; delivery within `freeRadiusKm` (10 km) free; beyond, the first slab with `maxKm` ≥ distance (10–20 km ₹80 · 20–35 ₹150 · 35–50 ₹250 · 50–75 ₹350 · 75–100 ₹450 · 100+ ₹550 — read the live values). **Slabs, not per-km**: a pincode's geocoded point is approximate. `distanceKm === null` → free. `DELIVERY.origin` is the pin of the bakery's Google Maps listing (Plus Code MQ84+58; was MQ84+2GQ, ~60m off, until Oct 2026) — the footer map, Maps links and JSON-LD `geo` read it too.

**The km is never shown to the customer.** `services/delivery.js` geocodes the pincode via Nominatim and Haversines from `origin`. Customer sees only the **amount** (or "…") — no distance, no "within 10 km". `deliveryKm` is stored on the private `orders` doc, shown **only in admin**, kept out of `tracking` and the receipt. Nominatim failure → null → no fee charged, and every surface says so honestly: the summary shows "Confirmed on WhatsApp" and the receipt, the order (`deliveryTbc`) and both emails say "to be confirmed" (see *Checkout*).

**ChatBot:** name → phone → *email (optional)* → **delivery/pickup** → address → **pincode** → date. **Pickup skips address and pincode** (`deliveryMethod: 'pickup'`, `deliveryKm: null`). Delivery uses the same `kmFromBakeryByPincode`. Review renders an `OrderSummaryCard`. **Cart** shows "Calculated at checkout". Change knobs in `shopConfig.js` only — don't hard-code a fee or print the word "flat".

### Cupcakes — the ×6 rule is now a habit, not an invariant

**`price × 6 === slice` no longer holds, and must not be "fixed".** Aug 2026 the owner's real counter prices (Menu & Prices in `/admin/accounting`) replaced the tidy ones:

| | Per piece | Box of 6 | vs 6 singles |
|---|---|---|---|
| Vanilla · Red Velvet · Biscoff | ₹25 / ₹30 / ₹30 | ₹150 / ₹180 / ₹180 | exact ×6 |
| Pistachio | ₹35 | ₹190 | box saves ₹20 |
| Chocolate · Nutella · Strawberry | ₹28 | ₹170 | **box costs ₹2 more** |
| Sprinkle | ₹25 | ₹155 | **box costs ₹5 more** |

Customers check the arithmetic, so the rows where **six singles beat the box** are the ones to watch. **Raise it with the owner; don't re-round their prices.** `Variety Cupcakes (Box of 6)` is box-only (`price`, no `slice`), so it carries a `desc` override.

**The counter menu is the source of truth for every price**; `products.js` must agree. Reconciled Aug 2026, matched on all but two cakesicle prices. Two structures came out of it:

- **Cakesicles are flavour × shape** — Chocolate and Vanilla across Heart ₹110 / Square ₹130 / Circle ₹150 / Ice Cream ₹160: eight entries, grouped `Cakesicles`. Both flavours price identically — the owner's list, not a slip.
- **A `Per Piece ₹25` cakesicle row is unresolved** and not on the site — six at ₹25 matches no shape, and Chocolate labels ₹110 "Heart 6 Box" while Vanilla says "Heart". Ask before modelling it.

**A per-piece product shows its BOX price — never the per-piece rate.** "From ₹25" under a photo of six reads as *six for ₹25*, and customers read it that way. `isPerPiece(p)` (`slice != null && minQty > 1`) switches the **Shop card**, **SearchOverlay** and **JSON-LD `Offer`** to the box price. A "₹25 per piece" sub-line was **explicitly removed** — don't re-add. The rate lives only in the **quick-view**; the **category note above the grid** is what tells customers pieces exist — load-bearing.

**Filters and sort still use `lowestPrice()`**, so Pistachio enters at ₹70 (2 × ₹35) while its card shows ₹190. Accepted — don't feed the box price into the filter.

**`ProductQuickView`'s desktop image is `position: absolute; inset: 0` and must stay so.** As `height: 100%` it resolved to `auto` and *the photo decided the modal's height* (three sizes for one product type). `.qv-image-col` needs `overflow: hidden` **and the image's border-radius**, or the settle-zoom flashes sharp corners.

`ProductQuickView` buys every product the same way (owner's redesign, Oct 2026): a **size picker** (`.qv-tiers`, one segment per size — label over price; hidden for a single-size product) and then ONE **`QtyBuy` panel** for the chosen size — size + price, a large − / + stepper beside the **live total** (regular price struck when a Diwali pack applies), an optional "Add N more for the Diwali pack" line, and a full-width "Add N to cart". Boxes, tubs and whole cakes can be added several at a time. Each size keeps its own count (`qtyByTier`); the cart lines are built exactly as before (`<id>`, `<id>-slice`, `<id>-unit`, "(tier)" names). **Its new styles live in `index.css` prefixed `.qv-modal`**, not in the component's template-literal stylesheet. **It's a real dialog**: `role="dialog"` on `.qv-modal` (`tabIndex={-1}`, no outline), `useDialogFocus()` (`hooks/useDialogFocus.js`: focus in, Tab wraps, focus back on close). The size picker is a **radiogroup with a roving tabIndex** (arrows / Home / End); struck prices carry visually-hidden "Regular price" / "Diwali price" labels, and only the total is a live region. The total uses `piecesPrice()` for the base tier and **`boxesPrice()` for the box tier** (2 Vanilla boxes read ₹289). The **scroll lock** also stops wheel / swipe chaining to the page from INSIDE the modal (only an element that can still scroll that way takes it). Shop passes `key={quickView?.id}` — the modal stays mounted with `product={null}`, so without it `qty` never re-inits. Cart line name carries the **tier** (`Vanilla Cupcakes (1 pc)`), never the count, since `add()` merges by id.

Three surfaces carry cupcake prices: `shopProducts`, `featured` (`feat-2` is the ₹180 box under a separate cart id) and `chatbotMenu.js` (derived). `Menu.jsx` needs no edit.

### Cart

`context/CartContext.jsx` is the single source of truth, persisted to `cc_cart_v4`. Item `{ id, name, price, img, qty, minQty }`. **No minimum order value** — don't add one without asking.

**Per-line `minQty`** (cupcakes, `2`). Three rules move together: `add()` **defaults qty to the minimum**; `decrement` **drops the line** below it; the line stores its own `minQty` so a restored cart keeps the rule. Base tier only.

**Bump the key when you repurpose a product id _or_ reprice one** — `add()` merges by id keeping the **stored** price, so an old line bills at the old rate. Bumping empties every saved cart once, the cheaper mistake. (`v1`→`v2`: cupcake ids changed meaning; `v2`→`v3`: four repriced; `v3`→`v4`: gift box ₹1,400 → ₹1,500.)

`add()` sets `toast`, the only thing `<CartToast />` renders — surface new toasts from the context.

**`CartIssues.jsx`** shows what can't be ordered as it stands, with a one-tap fix, in **Cart and Checkout**: `cartProblems(items)` → `{ expired, belowMin }` — Diwali pack lines after 15 Nov (**Switch to regular price** — `unpackPacks()` / `unpackExpiredPacks()` turn each pack back into its 10 pieces or 2 boxes at the catalogue price, merged into any line of that size; or Remove packs) and a loose line below its minimum (Make it N / Remove; allowed beside its own `-d10`/`-d2` line, where the roll-up left it). **Checkout refuses to place the order while any shows** (`cartBlocked`; phone bar reads "Fix your cart", scrolls to `#checkout-issues`).

### No discount / coupon / offers system — deliberately

No coupon field, promo code or percentage off. **Explicitly deferred by the owner** — don't add one speculatively. **The Diwali packs (see *Offers on the site*) are NOT a discount system**: each is its own cart line at its own price, like a product tier, so no total is recomputed and the five places below are untouched. Keep any future price deal in that shape. If asked:

- **A per-customer offer can't be enforced** (no auth, no server; a `localStorage` flag dies with incognito). Workable: let the customer *claim* it and the bakery verify the phone against past `orders`. Cart-value tiers need no identity.
- **A discount changes `total`, computed in five places** that move together: `shopConfig.js`, `CartContext.jsx`, `Checkout.jsx`, **`ChatBot.jsx`**; then `orders.js` `totals`, the `tracking` mirror, `emailNotify.js` (a new placeholder means **editing the live EmailJS template**), and the **Firestore validated-create rules**. `AdminOrders.jsx` is load-bearing: UPI is verified **by matching the amount**.

### Print posters — `pamphlet/`

A2/A4/A5 ad and menu-board posters, hand-kept HTML + headless-Chrome exports. **Editing rules live in `pamphlet/README.md`** (layout in mm, the A4/A5 copies, the two-page backs, bleed, exports). Never-break rules: **no prices printed** (the "Prices?" QR → `/menu`, so that URL is load-bearing for paper in circulation), contact details and flavour names are **hand-copied**, and verify each export's mtime after a rebuild.

### Print cards — `cards/`

Visiting, thank-you and A5 contact cards. **Editing rules live in `cards/README.md`.** Every contact detail is hand-copied (changing `BAKERY_ADDRESS` or the number stales them); QR codes are level H and must be decoded after regenerating; **`menu/` loads `cards/qr/*.svg` by relative path** — don't rename them.

### Printed menu — `menu/`

Seven-page A4 menu **generated from `products.js`** (prices via `inr()`, nut **N** marks from allergen tags). **Rebuild after any price, name or allergen change:** `node menu/build-menu.mjs && node menu/export-menu.mjs` (prints `ok`/`STALE` per file). **Never hand-edit `menu-a4.html`.** Details in `menu/README.md`.

### Social media — `social/`

Facebook cover/posts and the Google-review poster (HTML → headless Chrome). **Details in `social/README.md`.** No prices in images or captions; the review QR encodes `GOOGLE_REVIEW_LINK` and the export script decodes it before passing.

### Offers on the site — `/offers`, Home, and the cart

**Copy reads dates and prices, never types them**: `DIWALI_DATES` (`range` "5 – 15 Nov", `short`, `opens` "Opens 5 Nov") and `DIWALI_FROM` (`cupcakes10`, `cakePops10`, `variety2`, `from`) in `offerRules.js` feed offer tags, buyNote/ticker, CartIssues, the ChatBot and Shop/offers "Opens" chips; `DiwaliWelcome`'s `WINDOW` **is** `OFFER_RULES.diwali`. The festival banner's own Diwali range is still separate. Before the window, **/offers counts down** ("start on 5 Nov — in 8 days", up to 30 days ahead).

Ten offers in **`data/offers.js`** — three Diwali, seven everyday — the single place to edit them. **Split in two (Oct 2026):** `data/offerRules.js` holds the always-loaded half — switches, `OFFER_RULES`, pack prices, the cart roll-up, `offerNow()`, windows, `offersLive()`, `cartProblems()`, `chatbotPacks()`, `productDiwaliDeals()`; `offers.js` holds the wording (`OFFERS`), pickers and gift logic and **re-exports all of `offerRules.js`**. CartContext, Navbar, Footer, banners, Shop and the quick view import `offerRules.js` so the offer list stays out of the first download. **`offersLive()` there is worked out from the switches and windows alone — it must agree with `activeOffers(now).length > 0`** if an offer set changes. **Every offer is a free item added to the order, never a lower price** — except the Diwali packs, which are priced cart lines (below) — so no total moves and the five-places rule isn't engaged. The bakery adds the gift by hand on WhatsApp.

- **Two switches.** `OFFERS_ON` is the master (false hides everything). **`EVERYDAY_ON = false` since 28 Oct 2026** — the seven everyday offers are off by the owner's choice; true brings them back. Seasonal offers (`season: 'diwali'`) ignore it and run on their own dates.
- **Diwali offers — 5–15 Nov** (`OFFER_RULES.diwali`, `diwaliWindow()`; same days as the banner and `DiwaliWelcome` — change all three together). Owner-chosen from a list of proposals:
  - **Diwali Tub Treat** (`diwali-tubs`, cheesecake tubs mixed): 2 → 3 cake pops · 3 → 4 cake pops · 4 → 2 cupcakes + 2 cake pops · 6 → 1 extra tub (`diwaliTubTiers`).
  - **Diwali Cake Treat** (`diwali-sponge`, WHOLE sponge Bento — sponge tubs don't count, `isWholeSponge`): 1 → 4 cake pops · 2 → a sponge tub + 3 cake pops (`diwaliSpongeTiers`).
  - Gifts were sized at ≤ ~17% of the smallest qualifying order at menu price; the owner's ingredient costs were never checked.
- **Diwali Sweet Packs** (`diwali-packs`, `deal: true`, label "Deal", no cart gift) — packs at their own price: **10 of any cupcake** (₹25 → 239, ₹28 → 269, ₹30 → 289, ₹35 → 329: 10 × per-piece, then a figure ending in 9; 239/289/329/139 are the owner's, 269 follows; Red Velvet/Biscoff were ₹279 until 28 Oct), **10 Chocolate/Vanilla/Red Velvet cake pops ₹139**, **2 Variety boxes ₹339** (`DIWALI_PACK10` / `DIWALI_PACK2`). Cart lines `<id>-d10` / `<id>-d2`, names "(Diwali pack of 10)" / "(Diwali 2 boxes of 6)"; `was` (struck through) = the same pieces at the regular price.
  - **A box of 8 for the box-of-6 price was built and removed** — it undercut the packs of 10 per piece. `-d8` is still matched by `isDiwaliPackId()` so an old cart line is caught. Don't bring it back without re-checking it against the 10-packs.
  - **Packs roll up from ANY add** — `applyDiwaliPacks()` runs in `CartContext` on every add / increment and on load: a base line holding a full pack becomes pack lines + the rest (10 loose Vanilla → one ₹239 pack, 12 → pack + 2; 2 Variety boxes → the ₹339 pair). The owner hit this: 10 singles added in the quick view billed ₹250. `packRule()` knows both packs; `piecesPrice()` / `packNudge()` feed the quick view's total and hint. Pack lines ids `-d10` / `-d2`, built only by `pack10Line()` / `pack2Line()`.
  - **Boxes of 6 count too** — `bestPacking(p, loose, boxes)` finds the cheapest mix of packs + boxes + loose pieces that is **strictly cheaper** than the cart as it stands: 2 Vanilla boxes ₹300 → pack + 2 singles ₹289; box + 4 singles ₹250 → ₹239; 2 cake-pop boxes ₹180 → ₹169. Pistachio's box (₹190) already beats its pack per piece, so it stays. `boxesPrice()` gives the quick view's box-tier total; `chatbotPacks()` does the same for the chat's "<product> — <size>" lines.
  - **Adding a pack is gated on the REAL calendar** (`diwaliWindow(now, true)`) — roll-up, the /offers picker and Shop cards all honour it. In a preview the **"+ Add" still shows** (so it looks like the real thing) but a tap says **"Opens 5 Nov"** and adds nothing; the quick view shows regular prices. **Checkout refuses an order holding a pack outside the window** (`expiredPacks`, a notice above Place Order) — a pack carries its Diwali price, so a cart saved during Diwali must not order it later.
- **Offers say their deal as rows, not sentences** (owner: the BUY/FREE sentence was "hard to understand"). `OfferSteps.jsx`: tiered offers carry `steps` ("2 tubs → 🎁 3 cake pops FREE", built from the tiers) + `stepsHead`; packs carry `prices` rows with a **`PriceTag`** — regular price struck on a dark block, Diwali price large on rose (owner's reference: a "best deal" sticker). Everyday offers keep BUY/FREE. Used on /offers, Home tiles (`compact`), the pack picker and Shop cards. **Money still goes through `inr()`**; `PriceTag` only splits the string for styling.
- **Shop cards show their Diwali deals** — `productDiwaliDeals(p)`: a pack row (label · `PriceTag` · + Add) for cupcakes, cake pops and Variety, or a gift line linking to the offer for cheesecakes ("Buy 2 tubs → 3 cake pops free") and sponge cakes. Nothing outside the window.
- **The gift is stored on the order as `offerGift`** (`giftRecord()`: id, label, gift) by Checkout and the ChatBot. **`/admin/orders` shows "🎁 Free gift to pack"** via `orderGift(order)`: none if cancelled, the stored `offerGift` if present, else re-worked from items + `createdAt` on the real calendar (everyday offers counted before 28 Oct 2026, when they went off). **`orders` create rules have no `hasOnly`**, so `offerGift` needed no rules change. It also covers ChatBot orders: `lineInfo()` reads the ChatBot's "<product> — <size>" names and tolerates a missing id.
- **`?diwali=preview` makes Diwali offers LOOK live** (`diwaliWindow()` without `real`); Checkout's receipt gift and pack check use `real`, so a preview can't put a gift or a pack price on a real order.
- **Tiered offers share one shape** — `TIERED` (id → count, tiers, unit word) + `tierFor()`. A tier's `value` is its menu value and decides it against other offers; the cart's gift is the tier reached, and `stepUp()` nudges to the next one. `cartOfferStatus` returns `tiers` and `diwali`; `/offers`' `OfferStatus` reads `TIERED` for every tiered card. A new tiered offer = a `TIERED` entry + its tiers + a `counts` field.
- **Every offer surface gates on `activeOffers(now)` / `offersLive(now)`, never on `OFFERS_ON` alone** — Home band, ticker, stickers, the hero "See today's offers" button, the phone menu's Offers link (built in the component, with `useOfferClock()`), **the footer's Offers link** and /offers all vanish outside a window instead of showing empty. Two offers lay out side by side (`.cc-home-offers__grid--two`), three (the Diwali set) three across (`--three`). `MidMonthPopup` also needs `EVERYDAY_ON`.
- `OFFER_RULES` also holds the Mid-Month window (13th–20th), its ₹499 minimum, the ₹1,500 Big Basket line and Tub Lover's tiers (2 tubs → 3 cake pops, 5 → 5).
- **Mid-Month is date-driven by the visitor's clock** — 00:00 on the 13th to 23:59 on the 20th, monthly, no redeploy. Outside the window it's *hidden* everywhere (Home, `/offers`, cart). Time is read through **`offerNow()`**, re-rendered via **`useOfferClock()`** (every minute + tab focus). **`?testdate=YYYY-MM-DD[THH:MM]` works on the dev server only** (gated on `import.meta.env.DEV`) — keep it so.
- **`cartOfferStatus(items, subtotal, now)`** decides the gift: one per order, the **biggest by menu value** (`GIFT_VALUE`, tier values for Tub Lover), ties by `RANK`. Returns a `nudge` only when the next gift is close. Classifies lines by the **"(tier)" bracket in the name, then the id suffix** — an *exact* id match first, since `lo-dipped-slice` merely ends in `-slice`.
- **Picker lines must be built exactly as Shop/QuickView build them** (`<id>-slice` + "(tier)" name + tier price), or one box becomes two cart lines.
- The gift shows in Cart, Checkout and the Shop sidebar (`OfferGift`); Checkout writes **`🎁 Free gift: …`** into the receipt. It is **stored on the order as `offerGift`** (no rules change — `orders` has no `hasOnly`) and listed in both emails. Book it at **₹0** in accounting.
- **Home**: hero stickers over the photo (`HeroOffers`), a light rotating pill under the hero (`OffersTicker` — a dark marquee was rejected), then tiles (`OffersBand`). In the window Mid-Month is a double-width spotlight; outside, six tiles three across. **Below 576px stickers and ticker are hidden** and tiles become a stacked thumbnail list.
- **Every offer states its deal as BUY / FREE** (`.cc-offer-deal`) on Home and `/offers`. Each entry has short **`buy`** / **`buyNote`** / **`get`** (`get` falls back to `gift`); `condition` and `gift` stay the full cart/receipt wording. A new offer needs all three.
- **The phone CSS for these tiles sits AFTER the base `.cc-offer-card` rules** (before, same-specificity base rules won). Rebuilding that block once dropped the band header's phone rules.
- **`MidMonthPopup`** shows in the window **once per month per device** (`cc_midmonth_popup_v1` = "YYYY-MM"), never on cart/checkout/confirm-order/`/offers`/admin. Quotes are **original, not attributed to famous people**.
- Dates come from `OFFER_RULES` via `ordinal()` (a hand-typed "14th" went stale); fine print says **order time** counts.

### Checkout form starts empty

Pre-fill from `cc_customer_v1` / `cc_customer_draft_v1` was removed (stale data). `clearStoredCustomer()` deletes both on mount and submit. **Don't reintroduce pre-fill** without asking.

**A field error must be reachable, not just visible.** Every field has `aria-invalid`; each error `<div>` has an `id` + `role="alert"`, referenced by the input's `aria-describedby` under the same condition. Fields without a visible `<label>` carry `aria-label`. Keep both when adding a field.

**Email is OPTIONAL** (validated only when typed) — the confirmation mail itself may never send. Phone is the real channel.

**The form is `noValidate`, and Place Order is never disabled.** A tap on an unfinished form runs `revealProblems()`: every field marked touched (errors show), focus to the first problem (cart issue → field → payment → "working out delivery"), and a polite `#place-order-hint` line says why. A disabled grey button explained nothing; without `noValidate` the browser's check ran first and only focused the empty name field, silently. Payment tabs carry `aria-pressed` in a labelled group; the delivery choice is a `role="radiogroup"` labelled by `#delivery-method-label`. Cart qty buttons name the item ("One more Vanilla Cupcakes (1 pc)").

**Never put `required` on that input** (still true under `noValidate`). It was there for months: Place Order is a `type="submit"` in `<form onSubmit={placeOrder}>`, so the browser's constraint check ran *first* and refused every empty-email checkout while the JS said the form was valid. Same trap on `address` / `city` / `pincode`, hence `required={form.deliveryMethod === 'delivery'}`.

**The Delivery row must say something true at every stage**; "free" only after a pincode lookup: `pickup` → FREE · pickup, `loading` → …, **`idle` → "Add pincode"**, **`unknown` → "Confirmed on WhatsApp"**, then fee or FREE. (It used to show **FREE** the moment Home Delivery was picked.) **The same truth everywhere**: `deliveryPending` (loading) blocks Place Order ("Working out delivery…" — an order in the 1–3 s lookup saved ₹0 for a 40 km customer); `deliveryTbc` (delivery, lookup not done) makes the receipt say "to be confirmed on WhatsApp" and is stored on the order, so **both emails** and the ChatBot (`deliveryKm == null`) say it too. **`placeOrder()` re-checks `cartProblems()` and the minimum date** at the tap — nothing redraws the page as the clock ticks. Labels follow `deliveryMethod` ("Pickup date", "balance on pickup"); the success line is "We'll confirm your date on WhatsApp and bake it fresh for you" (not "baking right away"). The **cart** shows subtotal only; `total = subtotal + delivery` is checkout-only, and the FAQ says so.

### Routing & lazy loading

`App.jsx` `lazy()`-loads every route except `Home`. **The wildcard renders `NotFound`, not `Home`** (a soft 404 otherwise). `vite.config.js` splits a `react-vendor` chunk via `manualChunks`; Firebase gets its own async chunk by being dynamically imported. The wildcard + `predeploy` 404.html make deep links resolve.

**Every sitemap page has its own HTML file** (`scripts/prerender-routes.js`, last step of `predeploy`). Without it GitHub Pages served 404.html with **HTTP 404 for every route but Home** — Google dropped them and shared links previewed as Home. It writes `dist/<route>.html` (Pages serves `/shop` from `shop.html` with 200, no redirect), a copy of `index.html` with that page's `<title>`, description, canonical, og:* and twitter:* **read from its `usePageMeta({ title: '…', description: '…' })`** — keep those as plain single-quoted strings or the script falls back to Home's tags (it warns, never fails). Non-Home copies drop the hero preload. **A new public route needs a `PAGES` entry there** (plus the three things below). `/cart`, `/checkout`, unknown URLs still 404 — fine, they're not indexed.

**The ChatBot is deferred, not routed** — `DeferredChatBot.jsx` mounts it at first idle (`requestIdleCallback`, 2.5s backstop) or first interaction (the launcher lives inside it). It keeps the ChatBot (the largest component) out of the entry chunk; with the later offers split and lazy pop-ups the entry was **~109 KB (29.2 KB gz) in Oct 2026** — re-measure with a build rather than quoting it. `Suspense fallback={null}` on purpose.

**Seasonal and offer pieces load on demand too** (Oct 2026, ~4 KB gz off the entry chunk): `DiwaliWelcome` is fetched only while `diwaliWindow(offerNow()).live`, `MidMonthPopup` only while `OFFERS_ON && EVERYDAY_ON`, and Home's `HeroOffers` / `OffersTicker` / `OffersBand` only while `offersLive()` — each still decides for itself whether to show. **Eager code imports `data/offerRules.js`, never `offers.js`** (see *Offers on the site*).

`NO_FOOTER_ROUTES = ['/cart', '/checkout', '/confirm-order']` render `<MiniFooter />`. `<ScrollToTop />` resets scroll on route change.

**`<lastmod>` is stamped from git at build time** by `scripts/stamp-sitemap.js` (last step of `predeploy`): each URL takes the committer date of the newest file deciding what it renders (component + data), so a `products.js` edit moves `/shop` and `/menu` only. Stamping today on every URL would be worse than nothing (Google ignores inconsistent `lastmod`). **`/reviews` is left undated** (Firestore content changes without a commit). Runs on `dist/`, never `public/`; never fails a build.

**A new public route needs three things**: `lazy()` + `<Route>` in `App.jsx`, an entry in `public/sitemap.xml`, and a real link from somewhere (`/track-order` was linked only from the 404 page for months). `/cart`, `/checkout`, `/confirm-order` and `/admin/*` stay out of the sitemap. **So does `/review`** — the same form as `/reviews`, reached only from the post-order WhatsApp message in `AdminOrders.jsx`; listing it got a duplicate indexed.

**Stale-chunk self-heal.** Suspense handles a *pending* chunk, not a *rejected* one; after a deploy an open tab requests a vanished chunk and white-screens. `ErrorBoundary.jsx` matches a cross-browser `CHUNK_ERROR` regex and reloads **once** (guard `sessionStorage['cc_chunk_reloaded']`); `App.jsx` calls `clearChunkReloadGuard()` on mount. It resets on the `resetKey` **prop**, not `key=` (remounting re-flashes the skeleton).

### Product catalog

`data/products.js` is hand-maintained: `featured` (Home) and `shopProducts` (Shop + Menu). An entry is `{ id, name, price, category }` plus any of `slice` + `sizeLabel`/`sliceLabel` (second tier), `minQty`, `group`, `badge`, `desc`. **`img` and `allergens` are never hand-written** — `withPhoto()` looks the photo up by *name* in `productImages.js` (rename a product → rename its key there, or it silently falls back), and `attachAllergens()` derives tags from category + name keywords.

**Two generated fields are load-bearing.** `attachAllergens()` must never leave `[]` (no badges reads as "never checked"); a genuinely free-from item (mojitos, black coffee) gets `['eggless','vegan']`. `describe(p)` builds the one-sentence description for quick view and JSON-LD `Product`; `desc` overrules it. Neither may return nothing for a new product. **Name keywords decide tags, so a name that hides an ingredient needs a rule**: `macaron` is in `hasNuts` (almond shells; it shipped with no nut warning — also no `eggless-option`, egg-white shells), "Choc Covered Strawberry" is eggless + dairy, the "(Ghas)" pudding matches `ghas` (eggless + dairy). The printed menu's **N** marks come from these tags — rebuild it after a change. `describe()` strips brackets and the repeated noun from cheesecake flavours ("a baked chocolate cheesecake (milk & dark) cheesecake" shipped); blondies "Classic"/"White Chocolate" and Tres Leches have their own wording. **"Tres Leches"**, not "Trés Léches" (rename = `productImages.js` key too).

**`slice`-price gotcha (bit us twice):** "From" price, price filter and sort use `lowestPrice(p)` = `Math.min(price, slice)` — **never `slice || price`**. `slice` is the cheaper tier for cheesecakes but the pricier box-of-12 for cookies, so a ₹340 cookie box once showed "From ₹700" (in Shop, then `RelatedProducts`, which also billed the wrong tier).

**`lowestPrice` / `isPerPiece` / `hasUnit` / `cardPrice` / `priceLabel` live in `data/products.js`** — import, never re-derive. `priceLabel()` owns the wording ("From ₹210.00"). Shop writes its own JSX for the per-piece card (appends `sliceLabel`) but takes the rules from there, for both grid price and JSON-LD `Offer`.

**A THIRD tier: `unit`.** Cookies only — ₹50 single, ₹280 six, ₹580 twelve. `unit` + `unitLabel` hold the single; `price`/`slice` stay the boxes.

- **`lowestPrice()` includes `unit`** (filters/sort) but **`cardPrice()` never does** — it uses `lowestBox()`. A box photo must not advertise ₹50.
- `ProductQuickView` renders a third row with its own counter and cart line (`<id>-unit`); `chatbotMenu.js` appends a third variant. Both hand-wired; a fourth tier would need the same.
- **Don't add `unit` for linear pricing.** Cake pops (₹15 / ₹90 / ₹180, exact ×6/×12) state their box of 12 in `describe()`.

**`piece: true`** marks a product whose `price` is one loose piece sold singly (brownies, blondies). Gives the quick view a counter and the batch-bake note. **Not** `minQty` (would flip `isPerPiece`) and **not** `unit`. Display-only.

**Special Gifts is the tenth category, and adding it took six files.** One product: `sg-birthday-box`, *Birthday Gift Box*, ₹1,500 (was ₹1,400; ₹1,499 was rejected for its ₹749.50 advance), `group: 'Birthday'` (group = **occasion**; a second occasion is a new group, not a category). A new category needs: the `products.js` entry; its `case` in **`attachAllergens()`** (else `[]`, no badges); a `desc` or `describe()` branch; `CATEGORIES` in `Shop.jsx`; `CATEGORY_CONFIG` in `chatbotMenu.js`; a card in `Menu.jsx` + its `MENU_CARD_IMAGES` entry. `CAT_IMAGES` in the ChatBot is optional.

- **The box is cake and flowers. The dessert cup in the photo is FREE, not part of the ₹1,500** (owner's correction). `desc`, Menu card note, Home band and A4 poster say "comes free". **Wording only** — nothing adds the cup to the order or receipt, so the bakery must remember it.
- At ₹1,500 it's over `BULK_ORDER_MIN`: 50% advance / pay in full only. **The advance is stated beside the price** — Home band, Menu card note and the printed menu's gift band all say "Book with a 50% advance of ₹750.00", computed from `DEPOSIT_PCT` / `depositAmount()` (never typed), so a price or deposit change follows. `build-menu.mjs` imports `shopConfig.js` for it.
- **The owner must add it to Menu & Prices** in `/admin/accounting`; nothing syncs the two.
- **Home's band (`.cc-home-gift`) reads the product**: `GIFT_BOX` by id, price via `inr()`, button deep-links to it in the shop, band disappears if the product is removed. **Below 768px it's its own layout**: photo on top, the text as a white card just BELOW it (never overlapping — the photo has lettering in its corners), the three chips as equal icon-over-label tiles, and price + advance + a full-width button boxed as `.cc-home-gift__buy`.

**Multiple photos — `EXTRA_PHOTOS` in `productImages.js`**, keyed by name. `withPhoto()` sets `photos: [main, …extras]` **only** on listed products (one today). `ProductQuickView`'s `.qv-image-col--gallery` puts the image back **in flow** as a square, `object-fit: contain`, with thumbnails — opposite of every other product's out-of-flow `cover`, because these square shots have lettering in the corners. Shop card shows `img` alone.

- **Two gift-box files**: `birthday-gift-box.*` (cake-and-roses) is the main photo (slug `npm run photos` expects) and the Special Gifts card on `/menu`. `gift-box-birthday-flatlay.*` (open pink box) is the Menu hero, Home's band and the second photo, registered as `img.giftBirthdayBox`.
- **Both are square with lettering in the corners, so every slot showing one is 1:1** — the Menu hero is a capped square, and the Menu card has `square: true` (`.cc-menu-card__media--square`).

**`EXTRA_TIERS`** lists counter sizes the site can't take (brownie boxes of 4 and 12). **Display-only**, quoted in the category note. If one becomes orderable it needs a real product entry.

**The cheesecake single serving is a "Tub", never a "Slice".** All 23 cheesecakes have `sliceLabel: 'Tub'` (customers read "slice" as a triangle). `describe()`, Menu copy, ChatBot subtitle and offers say "tub". The owner's accounting menu still says "Per slice" — leave it. **Dipped Cheesecake Slice** genuinely is a slice. Old carts may show "(Slice)"; key not bumped (nothing repriced).

**Size labels must not contain brackets** — the cart wraps tiers in brackets, so `Banto 4" (inch)` rendered `(Banto 4" (inch))` in the cart, receipt, order and invoice. Now `Banto 4"` and `Whole Bento`. **"Banto" is not a typo for "Bento"** — Banto = cheesecake (3 slices), Bento = whole milk/sponge cake, per the owner's menu.

Shop is 3 columns (filters / grid / sticky cart). **12 at a time with "Show more"**, not pages. `PAGE_SIZE` is module-scope; the `?product=` jump reveals rows up to the target. **Cards carry compact allergen markers** (`AllergenTags` non-verbose: genuine free-from only). **"Contains nuts" is NOT on the cards since Oct 2026, by the owner's choice** — the quick view still lists it and the printed menu marks nut items **N**. It was put on the cards for allergy sufferers; raise that before anything else hides it. `eggless-option` is excluded there (95 of 120 products carry it). The empty state has its own "Clear filters" button (the sidebar's is off-screen on a phone).

**Menu page covers all 10 categories** (Platters was once invisible for lacking a card). A new card needs a `MENU_CARD_IMAGES` entry or falls back to the generic photo. Each card shows "+N more" beside View All, from rows **shown** vs the live catalogue.

- **Every card shows exactly `SHOWN` (4) rows** — `rowsFor(c).slice(0, SHOWN)`; extra `picks` are a reserve. **Platters (2) is LAST and Special Gifts (1) second to last**, so the short cards share the final row.
- **The photo doesn't set card height** — out of flow in `.cc-menu-card__media` (`position: absolute; inset: 0`). On a phone the frame is a 21:9 band.
- **Every card has a note of at most two lines** — highlighted box (`FiHeart`; leading `♥` stripped), clamped to two lines from 576px. Shorten copy rather than raising the clamp.
- Cheesecake rows have `suffix: '(Banto 4")'` so the price reads as a whole Banto.

**Home's featured cards add the SHOP's cart line** — each card names `shopId` + `tier`, and `featuredCartLine(card)` builds the line exactly as the quick view does (`cup-redvelvet-slice`, "(Box of 6)"). With their own `feat-N` ids they never merged with Shop lines, so two Red Velvet boxes from Home missed the Diwali pack (₹360 vs ₹349). **`npm run check-prices`** exists because `featured` keeps its **own copy** of each price. The script names which shop product and *field* each card mirrors (cupcake card quotes `slice`, cookie card `price`) and exits 1 on drift; a fifth card must be registered.

**The Category filter can match a `group`.** Names in **`GROUP_FILTERS`** match `p.group` (today `Cake Pops`, `Cakesicles`, both inside Bakes). Everything routes through `inFilter(p, category)` (grid + search-jump). **Prefer this to promoting a group to a category** — a new category needs an `attachAllergens()` case or loses its badges, plus `CATEGORY_CONFIG` / `CAT_IMAGES` / `describe()` entries. (Special Gifts is a category because the owner asked by name.) Group headings are suppressed for a group filter. Cake Pops and Cupcakes are per-piece, so both carry a **category note above the grid**.

### Search — `SearchOverlay.jsx`

- **The list renders only once the overlay has been opened** (`everOpened`) — closed, it is only hidden, and its 12 "Popular treats" thumbnails downloaded on every page.
- **`matches` and `results` stay separate.** `findProducts()` returns EVERY hit; the component slices to `MAX_RESULTS`. The count reads `matches.length` (slicing inside the filter once reported "12 results" for 65 hits). Overflow gets a "See all N matches" link.
- **`haystack(p)`** = name, category, `group`, all three size labels, `badge`, `describe(p)` and allergens (hyphens flattened). Name+category alone returned zero for "bento", "eggless", "vegan".
- **`eggless-option` is excluded from the haystack** (it made "eggless" return 105 of 120). "eggless" returns only eggless-as-baked (10 drinks). So "eggless cheesecake" returns nothing, and the empty state shows a note (via `mentionsEggless()`, `/\begg/i`) that most cakes can be made eggless. **Keep the note if you keep the exclusion.**
- Multi-word queries AND together. Arrow keys wrap; Enter clicks the highlighted `<a>`.
- **Scroll lock lets ONLY the results list scroll**, only while it has room that way (wheel); `overscroll-behavior: contain` covers touch. Event-based, like the mobile menu. List scrollbar hidden.

### Reviews — nothing may be invented

Three fabrications were removed. Don't reintroduce any.

- **`aggregateRating` is computed from real reviews and omitted below `MIN_REVIEWS_FOR_SCHEMA` (5).** It was hardcoded `4.9 / 245`; Google penalises fabricated review markup by hand.
- **The visible panel shows real numbers or an invitation** (it once fell back to "4.9 from 245" with an invented breakdown). With none, it says so and offers Write-a-review.
- **The four promise tiles carry no scores** (invented per-aspect ratings removed; the form asks one overall star). `SUB_RATINGS`, `WHAT_LOVE`, `PROMISE_STRIP` became one, attributing nothing to customers. **`PROMISE_STRIP` renders ONCE**, in the closing band. The stats card is two grid columns (score | breakdown); a third child means restoring the third column in `.cc-reviews-stats`.
- **Nothing on this page is "verified"**, page description included. **No "Verified Buyer" badge** — the form is public and "Your Order" is a free product choice, so nothing confirms a purchase (a test review with no order was badged). Fake badges are what consumer-protection rules target. The `usePageMeta` description kept "verified reviews" after the pill went — that's what search results show. Re-add only if orders and reviews are genuinely linked.
- **Neither review form collects an email, and must not** (`/review`'s field and its "we'll never share your email" line were removed Oct 2026 — it was thrown away anyway). `reviews` is `allow read: if true`, so every address was harvestable. `email` is out of `addReview()` and `hasOnly` in `FIREBASE_SETUP.md`; **the console rule must match.** Contact fields belong in an admin-only collection.
- **No absolute guarantees.** "on time, every time" and "Happiness Guaranteed" were removed from Reviews and About.

### Policy pages — `/refund-policy`, `/privacy`

Lazy-routed, linked from both footers (desktop ribbon; phone Track order · Refunds · Privacy chips), the checkout terms line and the FAQ's Payment/Cancellation sections, and in `sitemap.xml`. Keep them reachable from every page (the owner removed them from the phone footer, then asked for them back).

- **Both render as cards** (`.cc-policy--cards`): an "at a glance" row of three tiles, then one `.cc-policy__card` per section. **Tiles restate terms already on the page**, so a term change means editing tile, card and `/faq` together.
- **Every refund term is the one on `/faq`** — 30-minute window, refunds only for an in-window cancellation or confirmed quality issue, 100% within 24 hours if the bakery cancels. Deposit figures from `shopConfig`. **Change `/faq` and the policy together.**
- **`/privacy` must disclose reCAPTCHA** — App Check runs it on every page (IP, browser/device details, interaction signals, a `_GRECAPTCHA` cookie), so "cookieless analytics" applies to Plausible only. Google Fonts and the footer's **Google Maps embed** (`loading="lazy"`) are named too. Remove that section if App Check goes.
- **Privacy describes what the site ACTUALLY does** — PII-free `tracking` mirror, only the *pincode* goes to Nominatim, reviews and photos are public, no email on reviews, a `/contact` enquiry reaches the bakery by email and WhatsApp, Plausible is cookieless. Anything new leaving the browser means editing this page in the same commit.
- **Both carry a hand-maintained `LAST_UPDATED`** — bump only when a term changes; never compute from the clock.
- Plain document header, **not `PageHero`** (it always renders an image column).

### Contact, registrations & brand

- **Payment is "UPI or cash"** in meta descriptions, the Shop description and JSON-LD `paymentAccepted: ["UPI", "Cash"]` (GPay/PhonePe/Paytm are UPI apps; "COD" is false for pickup and bulk) · share title (og/twitter) is "Gourmet Cheesecakes, Milk Cakes & Cookies" (it said "Chocolate & Berry Boutique") · cupcake decoration surcharge is `DECORATION_EXTRA` in `shopConfig.js` (₹20, via `inr()`, asked for in order notes — not a cart line).
- **One public number: +91 91731 83440** (`WHATSAPP_PHONE`, mirrored in `index.html`, Footer/Contact/ChatBot). Email `cakeandcrumb.in@gmail.com`. **Address lives once as `BAKERY_ADDRESS` in `shopConfig.js`** — *386, Zahir Manzil, Venipura, Mominvad, Near Police Station, Vaso, Kheda, Gujarat-387380, India*, in the owner's order (not Google's). `full` ends in "India", so **nothing appends it** (invoice and `/privacy` once printed it twice). Footer, Contact, invoice, ChatBot, admin pickup message and both policy pages read it; the JSON-LD in `index.html`, `pamphlet/` and `cards/` are hand-copied. Delivery fees use `DELIVERY.origin`. **UPI handle `9081668490@okbizaxis`** (`UPI_ID` in `Checkout.jsx`) is a bank address, **not** a contact number — keep its digits. The QR beside it is the bakery's **own Google Pay merchant image** (`public/upi-qr.jpeg`); it **carries no amount**, so the figure is in the copy and "Open in UPI App" pre-fills amount + note. Routes are in `LINKS.md`.
- **Google Business Profile — three links, one listing** (all `shopConfig.js`): `MAP_LINK` (by CID) opens the Maps listing; `GOOGLE_PROFILE_LINK` and `GOOGLE_REVIEW_LINK` (place ID `ChIJy73gGoNZXjkRBkwvQscbki4`, decoded from Google's QR PDF) open the profile and the write-a-review box. `public/google-qr.png` is Google's profile QR — re-export if regenerated. The review link is used by Reviews' hero button and `/contact`'s "Find us on Google" band. The profile's **phone must stay `+91 91731 83440`**.
- **`/contact` is two equal cards over a Google band.** "Reach us" is a divided list (`.cc-contact-list`, rows `flex: 1`); the custom-order form is `.cc-contact-form` (flex column, footer `margin-top: auto`), so both end level. The QR is in its own `.cc-gbp-band` below.
- **Registrations — numbers only, never the scans.** `data/certifications.js`: FSSAI `20726012000837` (paid upto **16-07-2027**), Udyam `UDYAM-GJ-12-0059372`. `CertBadges.jsx` renders `pills` and `line` (Checkout needs its own copy, since `MiniFooter` replaces the footer). **Never publish or link the scans** — the FSSAI cert has the owner's photo, an Aadhaar reference and home address; the Udyam PDF has `9081668490`, a personal mobile. Displaying the FSSAI number is legally required.
- **Brand kit** — Playfair Display (headings/wordmark), Lato (body), Allura (accents); vars `--font-heading`/`--font-body`/`--font-script`. Palette on `:root`: `--cc-rose #e0617a`, `--cc-rose-deep #cf3e63`, `--cc-rose-soft #d7a7ae`, `--cc-blush-soft #f3d7d9`, `--cc-cream #fff6f2`, `--cc-blush #f7e3df`, `--cc-cocoa #5b3e36`, `--cc-cocoa-soft #7a584d`. **`--cc-rose-ink #ad2f4e` is rose for SMALL TEXT only** — `--cc-rose` is 3.2:1 on cream, `--cc-rose-deep` 4.36, both under 4.5 (19 Lighthouse failures). Use `--cc-rose` for fills, borders, icons; switch when rose is a word to read. Rose-ink clears 4.5 on blush (`#f3d7d9`) too. **Swept Oct 2026** (Lighthouse snapshots had 10 pages at 93–96): product card category/price, Menu row prices and "View all", feature headings, Reviews' write/share headings, the shop filter toggle, `.btn-outline-rose` text and the desktop footer column titles are now rose-ink; **white text sits on `#c0395b`** (the Add button, 5.3:1), not `--cc-rose`. **Don't fade text with `opacity`** to look secondary — it dropped gallery counts, contact labels and policy notes under 4.5; use `--cc-cocoa-soft`. **WhatsApp green `#25D366` takes icons only** — behind words it's 1.98:1 with white; buttons with text use **`#1a7f45`** (hover `#146a39`).
- **Button motion is one system.** `:root` tokens `--cc-ease` (`cubic-bezier(0.22, 1, 0.36, 1)`), `--cc-dur` (180ms), `--cc-dur-fast` (110ms) drive `.btn-rose`, `.btn-outline-rose`, `.cc-product-card__add`, `.cc-place-order-btn`, `.cc-clear-cart`, `.qty-btn` and `.qv-btn`: hover lift + shadow, a **faster `:active` press**, a focus ring. Don't add a fourth duration. Name transitioned properties — **never `transition: all`**. One `prefers-reduced-motion` block disarms transforms and the primary CTA's sheen; add new buttons to it.
- **Heroes are templated but hand-rolled.** All 7 brand pages use `.cc-{page}-hero` (warm-pink gradient, 2 columns, image `aspect-ratio: 5/4` + `object-fit: cover`, not `contain`). **`/menu` is the exception**: a square gift-box photo capped at 520px. **`PageHero.jsx` isn't the shared hero** — only `/faq` and `/track-order` use it; a cross-page hero change touches all 7. It takes optional `className` / `imageSrcSet` / `imageSizes`; Track Order's `.cc-track-hero` stacks its form and cuts the photo to 16:9 on phones. Unsplash heroes must be **standard images.unsplash.com IDs** (premium/plus need a paid licence; `u()` doesn't support them). Prefer the bakery's own photos where one suits the frame (see *Photos*).
- **The brand yields, the nav never does.** `.cc-brand` has `min-width: 0` + `overflow: hidden`; `.cc-header__right` has `flex-shrink: 0`. Without both, the `nowrap` wordmark overflows onto the nav links. Wordmark and tagline are `clamp()`d. **The tagline (41 chars of script) is the widest thing in the lockup**; the owner wants it shown, so **at ≤480px it wraps** into two centred lines (`width: 0; min-width: 100%` stops it widening the column). Wordmark + two lines stays under the logo's height, so `--cc-header-h` is unchanged. Don't go back to `nowrap` there.
- **Sticky header** — `.cc-header` with a scroll-aware shadow; other sticky elements use `top: calc(var(--cc-header-h, 81px) + 1rem)`. **No hard-coded pixel offsets.** **Critical:** `html, body` use `overflow-x: clip` — **never `overflow-x: hidden`**, which kills `position: sticky`.
- **Mobile menu scroll lock is event-based** — Navbar `preventDefault()`s `touchmove`/`wheel` outside the panel. **Don't reintroduce** `position: fixed` + saved-scrollY, `html.style.overflow = 'hidden'` or `body.menu-open { overflow: hidden }` (desync / iOS jump-to-top). Nothing mutates the body.
- **Image pipeline** — drop rasters into `/public`, run `npm run optimize-images` (`scripts/convert-to-webp.js`, quality 78, skips fresh files). Originals kept; runtime requests `.webp`.
  - **Pair `srcSet()` with `sizes`** (Oct 2026 also: Instagram fallback tiles, FAQ hero, review thumbs; the phone-menu logo is `logo-icon-400.webp`, lazy), or a 700px master lands in a 120px slot (789 KiB wasted on Home once: the wordmark in header, mobile footer and ChatBot, plus featured cards; 173 KiB after naming `-400`/`-800` variants).
  - **`public/logo_final.png` is TRIMMED to the drawing** (892×621; it arrived on 1536×1024 with 339px empty below, so the mark sat small and high). Trim the **master** — `convert-to-webp.js` resizes straight and would undo a patched variant. Re-trim if the artwork changes.
  - **`width`/`height` describe the file SERVED** (the variant), not the master — a mismatch is an aspect-ratio error and costs a Best Practices point. Measure the variant.

### Photos — `npm run photos`

`scripts/update-photos.js` is the owner-facing path; **`PHOTOS.md`** is the guide for a non-coder. It does **link → resize → check**.

- **Link.** A file in `public/products/` named `slugify(product name)` is written into `PRODUCT_IMAGES` automatically. `slugify` = strip accents (`Trés Léches` → `tres-leches`), `&` → `and`, non-alphanumerics → `-`. Rewrites **only the quoted value** on that key's line; a key it can't find is reported, never inserted blind.
- **Resize + check** shell out to the two existing scripts. `productImages.js` stays the source of truth; hand-editing is supported (shared artwork can't use the naming convention).
- **The "still sharing one photo" tail is the point** — every product borrowing another's picture, with the filename to save. Work it down; don't hand-audit the map.
- **Prefer the bakery's own photos where one fits.** 48 real photos sit in the `rc*` / `rcOwn*` block of `images.js` (unused ones were pruned Oct 2026). Home's About image and all six About kitchen thumbs (six: 2-, 3- and 6-across come out even) are `rcOwn*`. **Home's hero is still the stock roses** — `.cc-home-hero__img` is `5/4` and only five real photos are landscape (widest 16/9, `cover` trimmed ~15% per side); the owner prefers the roses. Don't swap without checking the crop on a real screen. Any hero needs **`srcSet()` + `sizes`** (800w is 22 KB vs 40 KB full).
- **"Unused" detection must scan `src/`, not just the map** — the Gallery names photos through the `img` registry in `data/images.js`. Nearest-name suggestions score by *fraction of the candidate matched*, not raw word hits.

### Video — `npm run convert-videos` and the Gallery strip

`scripts/convert-videos.js` → `public/videos/`, rendered by `components/VideoStrip.jsx` on **`/gallery` only**. `CLIPS` is hand-kept in *both* files: the script's decides what's encoded, the component's what shows and in what order.

- **Phone clips are HEVC-in-`.MOV`, Safari-only**, 4K/60 at 15–115 MB, and **GitHub caps a file at 100 MB**. Re-encode to H.264 (`-profile:v main`, `yuv420p` — Android refuses iPhone 4:2:2), longest side 1280, CRF 30, 30fps, trimmed to `MAX_SECONDS`. 649 MB became 6.6 MB.
- **Audio stripped (`-an`)** — the owner's ask, and what lets autoplay work.
- **`+faststart` is required** — verify `moov` appears before `mdat` in the first few KB.
- **`portrait: true`** centre-crops a landscape source to 9:16 *at encode time* (cards are 9:16 `cover`). No-op on 9:16 or taller.
- **Sources live OUTSIDE `/public`** (Vite copies it to `dist/`; a >100 MB `.MOV` fails the deploy). Masters go to **`media-originals/`** (gitignored); the script searches `public/products/` then `media-originals/products/`.
  - **The owner keeps masters outside the project now** (Oct 2026 — 16 videos, 30 original HEIC/JPEG photos, ~700 MB), so `media-originals/` normally doesn't exist. **Never `git add` a raw `.MOV`, even to unstage it** — git keeps a loose object (~660 MB piled up until `git gc --prune=now`). To re-encode, copy the source back into `media-originals/products/` first. The 30 photos are the only full-resolution originals, under camera names (`IMG_7487.HEIC`, UUIDs), not slugs.
- **Playback is IntersectionObserver-driven, not `autoplay`** — Android caps concurrent decoders (2–4); only on-screen clips play. `muted` set as a **DOM property** too (Safari), `playsInline` (iOS fullscreen), `preload="none"` + poster. A rejected `play()` falls back to poster + controls.
- **The rail overflows on purpose, scrollbar hidden**, so `.cc-video-arrow` is the only desktop affordance — never `display: none` it on pointer devices. Tracks are **fixed 200px, not `minmax(…, 1fr)`** (`1fr` squeezed columns and the last clip was unreachable). End-detection allows 2px slack.

**Finding unused files in `public/`** — match base name with `-400`/`-800` and extension stripped, against `src/`, `index.html`, `vite.config.js` **and the print folders** (`pamphlet/`, `cards/`, `menu/`, `social/` load `public/` files by relative path, e.g. `logo_final.png`). `favicon.webp` (`%BASE_URL%favicon.webp` in `index.html`) and `sitemap.xml` (via `robots.txt`) look unused but aren't.
- **A mention isn't a use.** Almost every photo is named in the `img` registry (`images.js`), so name-matching finds nothing; the real test is whether the **registry key** (`img.KEY`) is read anywhere outside the registry. The second Oct 2026 sweep removed 50 dead keys and 7 photos (4.1 MB) named only by them, plus the Vite template's `public/icons.svg` (kept alive in a substring scan by "react-icons" — check short names exactly).
- **`productImages.js` keys that aren't product names are category fallbacks** (`'Cheesecakes'`, `'Cupcakes'` …), read by `photoFor()` / `menuCardPhoto()` — not dead.
- **Don't delete video-poster `-400`/`-800` copies** — `npm run optimize-images` recreates them for every raster in `public/`.
- **Dead CSS needs runtime-name awareness**: classes built as `cc-seg__btn--${tone}` or `cc-ocard--${dir}` never appear whole in the source. `.cc-card-actions` / `.cc-card-action` are unused but kept as documented reusable admin pieces.
- **Not code leftovers, ask before deleting:** `pamphlet/WhatsApp Unknown 2026-10-09 …/` (13 of the owner's own WhatsApp photos, 4.8 MB, referenced by nothing) and `pamphlet/offer-red-velvet*.html` (the "Red Velvet Taste Test" print offer, 15 Oct 2026, not running). Both are pending the owner's answer.

### Gallery page

`pages/Gallery.jsx` holds the photos (each needs a **`cat`** in `GalleryGrid`'s `FILTERS`, or it only shows under "All"); `components/GalleryGrid.jsx` renders them.

- **Filter chips + `PAGE_SIZE` (18) + "Show more"**; zero-count chips auto-hide.
- **Tiles are 4:5, not 1:1** (portrait captures). The lightbox shows the uncropped view.
- **Not CSS-columns masonry** — `columns` fills top-to-bottom, so the bakery's own photos (ordered first) would stack in the left column.
- **`sizes` must track `.cc-gallery-mosaic`'s column counts** (selects the 400w variant).
- The lightbox **doesn't lock body scroll** (see Navbar rule).
- **The lightbox always offers a way to buy** (`buyLink()`): `p.img` matches the gallery's `/products/<file>`, so one product → `?product=` deep-link; several sharing the photo → its category; no match → the entry's `cat` via `CAT_TO_SHOP`; `custom: true` (three one-off cakes) or unmapped → `/contact`.
- **Short viewports and narrow phones have own rules.** At `max-height: 520px` the image caps at 58vh. Below 576px the two 44px arrows float over the image instead of being grid columns.

### Header & footer

- **The header is brand, nav, search and cart — nothing else.** A utility row (Track Order · phone) and a green "Order on WhatsApp" button were built and **taken out**; both live in the footer and mobile menu. Don't re-add.
- **Anything above `.cc-header` must sit OUTSIDE it.** It's `position: sticky` and `--cc-header-h` is hardcoded — **81px / 73px** — and the Shop sticky cart, `.cc-product-card` scroll-margin, the checkout anchor and `#our-story` measure from it.
  - **The variable = `.logo-icon` + the inner `.container`'s `py-2` (16px) + the 1px border.** Change one, update the variable. It once read 82px while the header was 111px; check by screenshotting the live site and scanning a pixel column for the bottom edge.
  - **Below 380px** the icon group sets the height and it stays at the 575 breakpoint's 73px — no override there.
- **The mobile menu ends in four captioned icons** — Instagram · Email · WhatsApp · Track order. Captions are the accessible names, so **no `aria-label`** (a differing one fails WCAG 2.5.3).
- **The mobile menu lists Offers; the desktop nav doesn't** (owner's choice). `mobileLinks` in `Navbar.jsx` splices it after Shop with a "Free gifts" tag, dropped when `OFFERS_ON` is false. The current page has a rose inset bar plus tint; text `--cc-rose-ink`.
- **The two footers carry different link sets.** Desktop: every `QUICK_LINKS` entry in a two-column grid, plus legal links in the ribbon. Phone: `MOBILE_QUICK_LINKS` (no Track Order) in the dot-row, and `MOBILE_HELP_LINKS` — Track order · Refunds · Privacy — as chips above the copyright.
- **`COPYRIGHT()` is exported from `Footer.jsx` and imported by `MiniFooter`** — one wording: `© {year} Cake & Crumb`. **Never add ®** (false trademark claim).
- **The desktop footer is a CSS grid (`.cc-footer-d__grid`)** — Brand · Quick Links (`max-content`) · Contact · Ordering · Find Us (square map). **Below 1400px** `grid-template-areas` tucks Ordering under Contact. Columns placed by area class (`.cc-footer-d__col--brand` …); a sixth means editing both templates.
- **The phone footer's contact rows are a left-aligned card** (`.cc-footer-m__info`), caption over value (inherited centring made ragged lines).
- **The footer map is one link, not an interactive embed.** `MAP_LINK` opens the listing by CID; `MAP_EMBED` is a keyless `www.google.com/maps?…&output=embed` of the same pin. The iframe has `pointer-events: none` so clicks hit the wrapping `<a>` (the embed's "View larger map" opened a bare coordinate page). Its "Open in Google Maps" pill sits at the **top** (Google's attribution is along the bottom). Phone: a 2:1 strip. **Must stay on `www.google.com`** — the only maps host in `frame-src`. Address links on the footer and `/contact` use `MAP_LINK`.

### Customer-facing copy — say it once, and only if it's true

Every rule here was broken on a live page for months.

- **Nothing advertised that can't be bought.** Home, Shop and Menu once sold "chocolates" — no such category or counter item exists. **Gallery keeps the word** (portfolio of real chocolate work); `CAT_TO_SHOP` in `GalleryGrid.jsx` has no `Chocolates` entry so those photos fall through to an enquiry link (labelled from the photo's `cat`). If chocolates are ever sold, add a product with a real counter price.
- **No absolute guarantee, anywhere** (Shop's strip kept "On-Time Delivery — fresh and on time, every time" after About and Reviews dropped it).
- **A promise strip renders once per page.** Reviews mapped `PROMISE_STRIP` twice; Shop had a sidebar trust list plus a closing strip (seven tiles for three claims, back to back on a phone). To show tiles higher up, **move** the band.
- **Two pages must not open with the same paragraph.** Home's About lede copied the About page's hero, and Home ran two icon strips restating each other. If an edit feels like filler, cut it.
- **Copy shown to both fulfilment methods must read true for both** — COD panel, COD tab sub-label and FAQ once said "when our delivery partner arrives" to pickup customers. Branch on `deliveryMethod`.

### Timing — there are no opening hours

A made-to-order kitchen: orders arrive on WhatsApp any hour, the date is agreed, baking follows. **Don't publish opening hours** — the Bakery JSON-LD deliberately has no `openingHoursSpecification` (Google would show "Closed now" to a 10pm customer), and the footer column is **Ordering**, not Hours.

One wording on Home, footer, cart, FAQ and `/contact`: **order a day ahead; order late and it's ready the next day.** (The FAQ's old "same-day before 11 AM" contradicted five surfaces.)

**Reply times are hedged** — "**usually** within a few hours", on `/contact` (twice) and `/faq` (twice). An unqualified reply promise is an opening-hours commitment in disguise.

### Conventions

- `usePageMeta({ title, description })` on every page; `useJsonLd(id, obj)` for structured data (Shop adds per-product `Product` — **no per-product ratings**; Reviews has a real `AggregateRating` only at ≥5 reviews). `useJsonLd` re-runs on `JSON.stringify(data)`; pass `null` to publish nothing.
- **JSON-LD is strict JSON: no `//` comments inside `<script type="application/ld+json">`** — it invalidates the block. Explain in an HTML comment above. FAQ answers likewise: each `a` string feeds the page and `acceptedAnswer`; use a per-section `more: { to, label }` for links.
- **Bootstrap spacing utilities carry `!important`** — a stylesheet `padding-bottom` loses to `.py-5` silently. Set spacing on the element (`pt-4 pb-2`).
- **Equal-height cards need `height: 100%` on the card**, not just the row; make it a flex column with the button `margin-top: auto` (Home's `.cc-treat-card`).
- **Highlighted info has one look**: **`.cc-infochip`** (pill: icon in a blush disc + cocoa text; `.cc-infochips` row, `--sm` variant), **`.cc-infonote`** (one sentence, tinted box, rose edge), **`.cc-infocard`** (several facts; stacked on phone, side by side from 768px). Don't style a new grey line.
- **Icon strips fold to 2 × 2 on phones** — Shop and Reviews promise strips (`.cc-shop-promise`) and About's `.cc-about-why` share one rule; an odd last cell spans the row; centred text uses `text-wrap: balance`. `/offers`'s How to Claim does the same with its own classes.
- `AllergenTags`: **compact** (cards — genuine free-from only; nut warnings removed by the owner) and **`verbose`** (quick view — everything, nuts included). Adding to the compact `important` list badges a large share of the catalogue; count first.
- **All money through `inr()`** (`data/format.js`), two decimals, everywhere. Don't hand-build `₹${…}`. Literal `₹` in *static copy* is fine (filter labels, budget ranges, "from ₹60" teasers, `DashboardTab`'s `₹1.5L` axis).
- **A React-rendered LCP image is invisible to the preload scanner.** `index.html` preloads the home hero with **`imagesrcset` + `imagesizes` mirroring the `<img>` exactly** (mismatched, it fetches a second copy). Live LCP went 7.2s → median 3.3s. Any above-the-fold hero needs the same.
- **An `<img>` with `height: 100%` needs a parent with a DEFINITE height**, or it resolves to `auto` and the photo sets the layout height (bit `ProductQuickView` and Home's About band, ~1280px tall from a 1200×1600 portrait at 50vw). Three fixes in use: **`aspect-ratio`** on the wrapper (heroes, `.ig-tile`, `SmartImage`), a **fixed pixel height**, or the image **out of flow** (`position: absolute; inset: 0`) in a sized column. All 38 image classes covered as of 16 Sep 2026; a new one must pick one.
- `<HeartDivider width={…} />` under hero h1s.
- **`ScrollReveal.jsx` animates every storefront page** (mounted once in `App.jsx`, off on `/admin/*`): tags headings, text, images, buttons and cards in `<main>`, fades each in once, then strips its attribute so the element's own transform/transition returns. Opt out with `data-no-reveal` — **every page's hero section and `PageHero` carry it** (fading the first screen held back Home's LCP photo ~1 s); choose motion with `data-reveal="up|down|left|right|zoom"`. Blocks containing an input/select/textarea are never animated. Hidden state exists only under `html.cc-reveal`, never added under `prefers-reduced-motion`. **`rootMargin` bottom is POSITIVE (`60px`)** — at `-8%` a heading at the foot of the first screen stayed invisible after refresh.
- `useIsMobile(bp = 768)` only where *markup* must differ — prefer CSS.
- **Any `YYYY-MM-DD` for a date input goes through `localIso()`** (`utils/adminDate.js`), never `new Date().toISOString().slice(0, 10)` — UTC reads as yesterday until 05:30 IST, so Checkout's `getMinDeliveryDate()` and Contact's `tomorrowISO()` offered **today** overnight. Not admin-only despite the file name.
- **A radio group needs a shared `name`** (else arrow keys don't move and screen readers announce unrelated radios). Shop's filters use `name="shop-category"` / `name="shop-price"` with `role="radiogroup"` + `aria-label` on the wrapper.
- `data/countries.js` drives the Checkout phone `<select>` **and** per-country length validation — a country without `len` accepts anything.
- `<RelatedProducts />` renders on Cart only. `<AllergenTags>` owns the code→label map; an unknown code renders nothing (typos fail silently).
- Per-icon imports from `react-icons/{fi,tb,fa}` are tree-shaken; don't attempt deep imports.

### localStorage keys

| Key | Owner | Notes |
|---|---|---|
| `cc_cart_v4` | `CartContext.jsx` | Bump when a product id changes meaning **or its price changes** — `add()` keeps the STORED price. v3 = Aug 2026 real prices (4 cupcake ids repriced, `bk-cakepop` retired); v4 = gift box ₹1,500 (Oct 2026). |
| `cc_customer_v1`, `cc_customer_draft_v1` | `Checkout.jsx` | Legacy pre-fill — **deleted**, never written |
| `cc_orders_local_v1`, `cc_reviews_local_v1`, `cc_newsletter_local_v1` | `services/` | Offline mirrors (orders keeps the last 50) |
| `cc_review_last_v1` | `reviewGuard.js` | One-per-minute review rate limit |
| `cc_festival_dismissed_v1` | `FestivalBanner.jsx` | |
| `cc_diwali_welcome_v1` | — | Dead (old once-a-day mark) |
| `cc_diwali_welcome_visit` | `DiwaliWelcome.jsx` | **sessionStorage**; welcome already shown this visit |
| `cc_chunk_reloaded` | `ErrorBoundary.jsx` | **sessionStorage**; one-shot stale-chunk reload guard |
| `cc_acc_orders_v1` … | `accounting.js` `lsKey()` | Mirror per accounting collection |
| `cc_acc_perpiece_v1`, `cc_acc_cakepop_v2`, `cc_acc_freegift_v1`, `cc_acc_diwalipack_v4` | `accounting.js` | Fast path only — the real "ran" mark is `acc_settings/main.migrations` (once per book). Bump the suffix to re-run; add new flags to `IMPORTER_FLAGS` |
| `cc_acc_*_deleted_v1` | `accounting.js` | Deletes not yet confirmed by Firestore (tombstones) — re-sent on the next live read |
| `cc_acc_excel_v7`, `cc_acc_taken` | — | Dead; nothing reads them |
| `cc_acc_unlocked` | `AdminAccounting.jsx` | **sessionStorage**; accounting PIN unlocked for this tab |
| `cc_acc_tab` | `AdminAccounting.jsx` | **sessionStorage**; last open accounting tab |
| `cc_acc_last_backup_v1` | `accounting.js` | Mirror of `acc_settings/main.lastBackupAt` |
| `cc_midmonth_popup_v1` | `MidMonthPopup.jsx` | Month key ("2026-10") the pop-up last showed in |
| `cc_offer_testdate` | `data/offers.js` | **sessionStorage, dev server only**; the `?testdate=` override |
| `cc_diwali_preview` | `data/festivals.js` | **sessionStorage**; `?diwali=preview` for this tab (live site too) |

### Festival banner

`data/festivals.js` defines date-ranged banners; `FestivalBanner.jsx` picks the active one from the local clock (read through `offerNow()`, so `?testdate=` works on the dev server). Ranges wrap year boundaries (see `new-year`). **Moving festivals (Holi, Eid, Raksha Bandhan) use `years: { 2027: {…}, 2028: {…} }`** instead of `range`, and **a year not listed shows no banner** (fixed ranges were the wrong week most years) — add the next year's dates each year; Eid depends on the moon, confirm nearer the time. Diwali runs **5–15 Nov** (Diwali is 8 Nov 2026 — check yearly), says "Order festive cakes and gift boxes a day ahead" and links to **/shop**, not /offers (set while offers were off; the Diwali offers came after — ask before relinking).

**Diwali & New Year welcome — `DiwaliWelcome.jsx`**, mounted in `App.jsx` (not on admin). A full-screen greeting shown **before the site, 5–15 Nov (`WINDOW`), **once per visit** (`sessionStorage['cc_diwali_welcome_visit']` — a reload or another page in the same tab doesn't bring it back; a new tab or a reopened browser does. Every page load was too much; the owner wanted every *visit*, not once a day). **`?diwali=preview` shows it every time** and doesn't set the mark, never on cart/checkout/confirm-order/admin. Same 5–15 Nov as the banner — **change both together**. Both are checked when the page opens; a tab left open over midnight switches on its next load.

- **Look (owner-approved after many rounds — don't redesign casually):** dark rose-wine veil over the **blurred site** (`backdrop-filter`), drifting rose/gold blobs, a slowly turning gold 16-petal rangoli (inline SVG), fairy lights sagging across the top (bulbs placed on the same parabola as the SVG wire — `LIGHTS` / `LIGHT_STRING`), rising embers. The card is **light frosted glass** with a thin gold-rose edge: brand lockup (logo + wordmark + tagline, as `Logo.jsx`), three diyas, "Happy Diwali & a Happy New Year", a bold quote under a small outlined "badge, the footer's "We can't wait to sweeten your day! ♥" (heart in a `nowrap` span), and ONE `.btn-rose`: **"🎁 Step in for sweet Diwali offers →" while the offers run, which closes it and goes to the HOME page** (`goHome`; owner's choice, not /offers). Outside the offers it reads "Step into the sweetness →". The × and Esc close it on the page that was opened.
- **Greeting only — the offers are NOT on the card** (owner's choice). Tried and removed: offer tags on the card, a full two-column offers panel, and an "or just browse the website" link. The offers live on Home, /offers and the Shop.
- **Fits without scrolling on every size tested** — 320×568, 360×640, 375×667, 390×844, 412×915, 430×932, 667×375, 844×390, 768×1024, 1024×768, 1280×720, 1366×657, 1440×900, 1920×1080. Short screens (≤760 / ≤700px tall) drop the diya row and the quote's sign-off; landscape phones go two columns. Re-measure all of them after a change.
- **The owner asked for a LIGHT card, not a heavy one** — a bold 800-weight, gradient-border, filled-badge version was rejected. **Quotes are bold upright Playfair 600**: the site loads no bold italic (only ital 400/500), so bold + italic would be faked. Adding `1,600` to the fonts link costs every page a file.
- **Removed by the owner:** "Saal Mubarak · Nutan Varshabhinandan", and the first dark-brown/gold theme. The 8 quotes are our own lines, unattributed.
- **Focus goes to the dialog (`tabIndex={-1}`), not the button** — focusing the button drew Chrome's focus ring on open, which read as a heavy double border. **Tab stays inside the card** (`useDialogFocus()`) and **`#root` is `inert`** while it's open; that effect is declared BEFORE `useDialogFocus` so focus restores after `inert` lifts.
- **Its logo is 121 / 158 / 173 px** (`sizes` mirrors the CSS) so a phone gets the 46 KB variant, not the 156 KB one.
- Sized for phone (base) → 768 → 1200, short screens (`max-height: 760px`) and **landscape phones (`max-height: 560px`: two columns, no lights)**. Fits without scrolling from 320×640 up. Every animation is off under `prefers-reduced-motion`; `@supports not (backdrop-filter…)` falls back to a solid card.
- **`?diwali=preview` shows the whole season on any date — banner, welcome AND the Diwali offers — on the LIVE site too** (`isDiwaliPreview()` in `festivals.js`). It **sticks for the tab** (`sessionStorage['cc_diwali_preview']`) so /offers and /cart keep it; `?diwali=off` ends it. Ignores a closed banner and doesn't record one. **Safe in production because the receipt reads the real calendar**: `diwaliWindow(now, real)` and `cartOfferStatus(…, { real: true })` in `Checkout.jsx`, so a preview tab outside 5–15 Nov sees a gift in the cart but sends none on WhatsApp. It never touches `offerNow()`; `?testdate=` stays dev-only.

## Environment

`.env` (gitignored — see `.env.example`) holds optional integrations. Vite reads it at startup only; **restart `npm run dev` after editing**.

| Var | Without it |
|---|---|
| `VITE_FIREBASE_*` | Reviews/orders/newsletter are localStorage-only. See `FIREBASE_SETUP.md`. |
| `VITE_EMAILJS_SERVICE_ID` + `_TEMPLATE_ID` + `_PUBLIC_KEY` | No admin notification email. See `EMAILJS_SETUP.md`. |
| `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` | No customer confirmation; admin email still works. Partly why checkout email is optional. |
| `VITE_RECAPTCHA_SITE_KEY` | No App Check — requests go unattested (rejected now enforcement is on, and show as "invalid" in metrics). **`/privacy` says reCAPTCHA runs on every page**, so a deployed build without it makes that page untrue. Public by design. See `FIREBASE_SETUP.md`. |
| `VITE_APPCHECK_DEBUG_TOKEN` | Dev only. Without it the SDK invents a token — see *App Check & the CSP*. Generate it in the console. Never set for a build. |
| `VITE_SNAPWIDGET_ID` | `InstagramFeed` shows a static grid and **retitles itself** ("A Few of Our Favourites", not "Follow Us on Instagram"). |

**Lighthouse (live home, mobile).** Accessibility, Best Practices and SEO are **100** — keep them. What it took: every icon-only control has an accessible name (the newsletter button's label is `d-none` below `sm`); a link's **visible words** say where it goes (`link-text` ignores `aria-label`; "Learn More" became "Read Our Story"); an `aria-label` must **contain** the visible text (WCAG 2.5.3 — the logo's was removed); no skipped heading levels; touch targets ≥ 24×24. **Home's 100 was partly an artefact**: ScrollReveal hides below-the-fold content during the run, so it isn't checked — scan other pages too (snapshots in a click-through session, since Lighthouse alone only loads Home). Heading levels follow the page, not the look: product names are `h3`, card/section titles `h2`, the desktop footer's column titles `h2`, the phone footer's newsletter line and the ChatBot header are `<p>` — each class sets its own size, so changing the tag doesn't change the look. Form fields without a visible `<label>` need `aria-label` (all of `/contact`'s do); links inside sentences on the policy pages are underlined (`.cc-policy p a`).

**Performance: live Home measured 61–66 (median 65, LCP ~6.9 s) on 28 Oct 2026**, before the hero/search/image fixes — re-measure; part of the gap is unreachable. `cache-insight` is ~1,400 KiB and GitHub Pages can't set headers. Render-blocking (~840ms) is Google Fonts + app CSS (fixes: self-host fonts or inline critical CSS — real trade-offs for a typography-led brand); 31 KiB unused JS is inside `react-vendor`. **Lighthouse is noisy** (61/85/92 on one build) — take a median; quote bytes and CLS, not the score.

**Checking responsive layout — `scrollWidth` is useless here** (`overflow-x: clip` silently cuts spill). Walk elements: anything whose `getBoundingClientRect().right` exceeds `clientWidth` is spilling. Drive it over CDP: Chrome with `--remote-debugging-port` + `--headless=new`, target from `/json/list`, **Node's built-in `WebSocket`**, `Emulation.setDeviceMetricsOverride` across widths. The 10 public pages at 320 → 1920 take ~3 minutes. **Two deliberate hits always show:** the ChatBot panel's decorative blur (`pointer-events-none`, `-top-10 -right-10`) and the gallery video rail. Anything else is a real break.

**Analytics.** `index.html` loads Plausible (cookieless, no banner, `defer`). It collects **nothing** until the site is registered at plausible.io. It does send pageviews to a third party; remove the tag if unwanted.

**`og:image` is a purpose-made card** (`public/og-card.jpg`, 1200×630) — product shots are portrait, and declaring 1200×630 over a 1500×2000 file broke WhatsApp/Facebook previews. Cut from `products/milkcake-assorted-tubs.webp` (1600×900); the `sharp` command is in a comment above the tag. **JPEG on purpose** (crawlers are patchy with WebP). Change the photo → change the declared size. WhatsApp caches hard: test with `?v=2`.

**Local SEO.** The `Bakery` JSON-LD in `index.html` has `address`, `geo` (matching `DELIVERY.origin`), `areaServed` and `email` — and **no `openingHoursSpecification`** (see *Timing*).
