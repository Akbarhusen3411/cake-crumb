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

Single-page React storefront for **Cake & Crumb**, a bakery in Vaso (Anand, Gujarat). Stack: Vite + React 19 + React Router v7 + Bootstrap 5 + Tailwind 4 (both loaded — Bootstrap for layout, Tailwind utilities for one-off styling). Deployed to GitHub Pages.

### GitHub Pages base path

`vite.config.js` sets `base: '/cake-crumb/'` because the site is served from `akbarhusen3411.github.io/cake-crumb/`. Consequences:

- `main.jsx` passes `basename={import.meta.env.BASE_URL}` to `<BrowserRouter>` — all `<Link to="/...">` paths are relative to the base.
- `src/data/images.js` exports `asset()` and `u()` helpers that prepend `BASE_URL` to any `/public` path. **Never write a raw `/products/foo.webp` string in JSX** — go through `asset()`/`u()` or the `img` object, or it breaks in production.
- `images.js` auto-rewrites `.jpeg/.jpg/.png` → `.webp` at runtime via `toWebP()`. Product entries can keep `.jpeg` paths and still serve WebP after `npm run optimize-images`.
- `predeploy` copies `dist/index.html` → `dist/404.html` so GitHub Pages serves the SPA for deep links.

### Backend-less design, optional Firebase + EmailJS

The app works entirely client-side via `localStorage`; cloud services are progressive enhancements:

- `src/firebase.js` reads `VITE_FIREBASE_*`. If any are missing, `isFirebaseEnabled` is false; the bundle still imports Firebase but no network calls fire.
- Services in `src/services/` (`orders.js`, `reviews.js`, `newsletter.js`) follow the same shape: try Firestore if enabled → always mirror to `localStorage` → never throw. UI must not block on them.
- Firestore security rules live in `FIREBASE_SETUP.md` (not in code). When changing the shape of `orders`, `reviews`, or `newsletter` documents, update the rules too or writes will be rejected in production.
- `src/services/emailNotify.js` exposes `sendOrderEmail()` (admin) and `sendCustomerConfirmation()` (customer, gated on a separate `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`). Both fire-and-forget. See `EMAILJS_SETUP.md` for the two-template setup walkthrough.

### Order flow (the load-bearing feature)

Placing an order triggers **four parallel side-effects**, any of which can fail without breaking the others:

1. **WhatsApp** — `buildWhatsAppLink()` in `WhatsAppButton.jsx` opens `https://wa.me/919081668490` pre-filled. Primary channel. `WHATSAPP_PHONE` constant.
2. **Firestore + localStorage mirror** — `saveOrder()` writes the `orders` collection and a last-50 local mirror.
3. **Admin email** — `sendOrderEmail()` (EmailJS Template #1) to the bakery's inbox.
4. **Customer email** — `sendCustomerConfirmation()` (EmailJS Template #2, optional) to the customer if they entered an email.

Order IDs come from `services/orderId.js` and look like `CC-AB-DDMMYY-NNNN` (initials + date + per-day counter in localStorage).

There is **also an admin confirmation flow** at `/confirm-order?id=…` — the admin clicks a button in the admin email, the page calls `markOrderConfirmed()` (updates Firestore `status` to `'confirmed'`), then opens WhatsApp pre-filled with a confirmation message to the customer's phone. No third EmailJS template needed (free-tier cap is 2 templates).

Customers can look up their own orders at `/track-order?id=…` via `getOrderByOrderId()` (Firestore query by `orderId` field).

### Distance-based delivery

`src/services/delivery.js` resolves the user's Indian pincode → coords via OpenStreetMap Nominatim, computes Haversine distance from **Shia Masjid, Vaso (22.5687, 72.9598)**, and returns a charge at **₹5/km** with a floor of ₹30 and a cap of ₹500. The per-km rate is **intentionally not surfaced in the UI** — it's just shown as the computed delivery fee in the order summary. The lookup is debounced (600ms) and cached in-memory by pincode.

Cart page no longer shows delivery — Checkout computes it once the pincode resolves. Don't restore the old static `₹49 / Free` logic in `CartContext.jsx`.

### Cart

`src/context/CartContext.jsx` is the single source of truth, persisted to `localStorage` under `cc_cart_v1`. Item shape: `{ id, name, price, img, qty }`. Minimum order is **₹250** (`MIN_ORDER_INR` in `src/data/shopConfig.js`), enforced at both Cart (proceed-to-checkout button disabled) and Checkout (Place Order disabled).

### Customer info pre-fill

Two localStorage keys, used in `Checkout.jsx`:

- `cc_customer_v1` — saved on successful order. Long-term "remember me".
- `cc_customer_draft_v1` — saved continuously on every form change (400ms debounced) so an abandoned checkout retains all typed data on next visit. Cleared after a successful order.

`loadSavedCustomer()` prefers the draft (more recent), falls back to the success-saved profile.

### Routing & lazy loading

`src/App.jsx` uses `lazy()` for every route except `Home`. Firebase loads on `/reviews`, `/review`, `/checkout`, `/confirm-order`, and `/track-order` (anything that hits Firestore). The wildcard `<Route path="*" element={<Home />} />` makes the GitHub Pages 404 fallback land users somewhere sensible.

`NO_FOOTER_ROUTES = ['/cart', '/checkout', '/confirm-order']` — on these routes App.jsx renders `<MiniFooter />` (slim copyright + WhatsApp ribbon) instead of the full `<Footer />` so the buying flow stays focused.

### Product catalog

`src/data/products.js` is hand-maintained — `featured` (Home cards) and `shopProducts` (the full Shop + Menu list). Each entry references `img.someName` from `src/data/images.js`. Some products have a `slice` field for a second price tier (rendered as a second add-to-cart button). Sourced from the original menu PDF; prices in INR.

The Shop page surfaces categories as a horizontal chip row at the top (`.cc-filter-chips` in `index.css`) — the old desktop filter sidebar was removed. Search is wired to the navbar magnifier icon (`SearchOverlay.jsx`).

### Festival banner

`src/data/festivals.js` defines date-ranged banners; `FestivalBanner.jsx` picks the active one from the user's local clock. Date ranges wrap year boundaries (see `new-year`).

### Sticky header + `--cc-header-h` CSS variable

`src/components/Navbar.jsx` renders a glass-morph sticky header with a scroll-aware shadow (deeper when `window.scrollY > 24`). All other sticky elements (Shop sidebars, Checkout Order Summary, Contact form anchors) use `top: calc(var(--cc-header-h, 82px) + 1rem)` so they offset cleanly. **Don't hard-code pixel values like `top: 130`** — use the CSS variable.

The `.cc-header::after` is a 16px cream→transparent gradient that sticks with the header. Cards scrolling under the header pass behind this fade strip, so they never appear to visually "touch" the header bottom.

**Critical CSS gotcha:** `html, body` use `overflow-x: clip` (with `overflow-x: hidden` fallback via `@supports`). **Do not set `overflow-x: hidden` on html/body** — it turns the body into a scroll container and `position: sticky` stops working on the header.

### Mobile menu — keep it simple

Mobile hamburger opens a glassmorphism centered panel (`.mobile-menu-overlay`, `.mobile-menu__panel`). Scroll lock is intentionally minimal — `Navbar.jsx` toggles `html { overflow: hidden }` and `body.menu-open { overflow: hidden; touch-action: none }`. Plus a `useEffect` on `location.pathname` that force-closes the menu on every route change.

**Do not reintroduce the `position: fixed` + saved-`scrollY` body lock** — it was repeatedly desynced on rapid open/close and mid-navigation. The current simple lock can't be desynced because the body never moves.

### Image pipeline

Drop raster files into `/public` (or `/public/products`), then run `npm run optimize-images`. `scripts/convert-to-webp.js` walks the tree, skips files whose `.webp` is newer than the source, and writes WebP at quality 78. The original `.jpeg/.png` is kept as fallback but the runtime helper in `images.js` always requests `.webp`.

Logo uses `logo-icon.webp` (a crop of the watercolor brand mark) and bypasses `asset()` because the path is built from `BASE_URL` inline. The old artifact-prone 3 KB icon was replaced by the larger watercolor crop (~25 KB WebP), which has enough detail to tolerate WebP compression cleanly.

### Conventions worth following

- `usePageMeta({ title, description })` from `src/hooks/usePageMeta.js` updates `<title>` and OG/Twitter meta per route. Call it at the top of every page.
- `useJsonLd(id, jsonObj)` from `src/hooks/useJsonLd.js` injects structured data — Shop adds per-product `Product` JSON-LD with rating, brand, image; Home has `Bakery`; Reviews has `AggregateRating`.
- `<SmartImage>` is the drop-in `<img>` with shimmer skeleton + lazy loading.
- INR formatting goes through `inr()` in `src/data/format.js`.
- Per-icon imports from `react-icons/fi` are tree-shaken by Vite — `import { FiHome } from 'react-icons/fi'` is fine, don't try deep imports (the package doesn't expose them).

## Environment

`.env` (gitignored — see `.env.example`) holds optional integrations. Vite only reads `.env` at startup; restart `npm run dev` after editing.

| Var | What happens without it |
|---|---|
| `VITE_FIREBASE_*` | Reviews/orders/newsletter fall back to localStorage only. See `FIREBASE_SETUP.md`. |
| `VITE_EMAILJS_SERVICE_ID` + `VITE_EMAILJS_TEMPLATE_ID` + `VITE_EMAILJS_PUBLIC_KEY` | No admin notification email is sent. See `EMAILJS_SETUP.md`. |
| `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` | No customer confirmation email — admin notification still works. Skipped silently. |
| `VITE_SNAPWIDGET_ID` | Optional Instagram feed widget. |
