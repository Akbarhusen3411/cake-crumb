# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev               # Vite dev server (defaults to http://localhost:5173)
npm run build             # Production build → dist/
npm run preview           # Serve the built dist/ for smoke-testing
npm run lint              # ESLint over the repo
npm run optimize-images   # Regenerate .webp siblings for everything in /public (run after dropping new raster files)
npm run deploy            # Build + copy dist/index.html → dist/404.html + push dist/ to gh-pages branch
```

There are no automated tests; verify UI changes by running `npm run dev` and clicking through.

## Architecture

This is a single-page React storefront for **Cake & Crumb**, a bakery. Stack: Vite + React 19 + React Router v7 + Bootstrap 5 + Tailwind 4 (both are loaded; many components use Bootstrap classes for layout and Tailwind utilities for spacing/colors). Deployed to GitHub Pages.

### Deployment quirk: GitHub Pages base path

`vite.config.js` sets `base: '/cake-crumb/'` because the site is served from `akbarhusen3411.github.io/cake-crumb/`. Two consequences ripple through the code:

- `main.jsx` passes `basename={import.meta.env.BASE_URL}` to `<BrowserRouter>`, so all `<Link to="/...">` paths are relative to the base.
- `src/data/images.js` exports `asset()` and `u()` helpers that prepend `BASE_URL` to any `/public` path. **Never write a raw `/products/foo.webp` string in JSX** — go through `asset()`/`u()` or the `img` object, or it breaks in production.
- `src/data/images.js` also auto-rewrites `.jpeg/.jpg/.png` → `.webp` at runtime. Product entries can keep `.jpeg` paths and still serve WebP after `npm run optimize-images` has been run.
- `predeploy` copies `dist/index.html` to `dist/404.html` so GitHub Pages serves the SPA for unknown routes (deep-linked client routes work).

### Backend-less design with optional Firebase

The app is designed to work entirely client-side with `localStorage`, and *progressively enhance* if Firebase env vars are present:

- `src/firebase.js` reads `VITE_FIREBASE_*` from `.env`. If any are missing, `isFirebaseEnabled` is false and Firebase is never initialized — the bundle still imports `firebase`, but no network calls happen.
- Services in `src/services/` (`orders.js`, `reviews.js`, `newsletter.js`) all follow the same pattern: try Firestore if enabled, always mirror to `localStorage`, never throw. The UI should not block on these.
- Firestore security rules live in `FIREBASE_SETUP.md` (not in code). When changing the shape of `orders`, `reviews`, or `newsletter` documents, update those rules too or writes will be rejected in production.

### The order flow (the most load-bearing feature)

A customer placing an order triggers **three parallel side effects**, any of which can fail without breaking the others:

1. **WhatsApp** — `buildWhatsAppLink()` in `src/components/WhatsAppButton.jsx` opens `https://wa.me/919081668490` pre-filled with the order. This is the primary channel; the phone number is hardcoded in `WHATSAPP_PHONE`.
2. **Firestore + localStorage** — `saveOrder()` in `src/services/orders.js` writes to the `orders` collection and always mirrors locally (last 50 orders).
3. **EmailJS** — `sendOrderEmail()` in `src/services/emailNotify.js` is the backup admin notification. Currently commented out in `src/pages/Checkout.jsx` (see recent commit `59c803b`) — re-enable the import + call once `VITE_EMAILJS_*` is configured.

Order IDs come from `src/services/orderId.js` and look like `CC-AB-DDMMYY-NNNN` (initials + date + per-day counter in localStorage).

### Cart

`src/context/CartContext.jsx` is the single source of truth for cart state, persisted to `localStorage` under `cc_cart_v1`. Free delivery kicks in at subtotal ≥ ₹999 (otherwise ₹49). The shape of items in the cart is `{ id, name, price, img, qty }`.

### Routing & code splitting

`src/App.jsx` uses `lazy()` for every route except `Home`. **Firebase only loads when `/reviews` or `/review` is visited** — keep it that way to avoid bloating the landing page bundle. The wildcard `<Route path="*" element={<Home />} />` is what makes the GitHub Pages 404 fallback land users somewhere sensible.

### Product catalog

`src/data/products.js` is hand-maintained — `featured` (Home cards) and `shopProducts` (the full /shop list, also used by /menu). Each entry references `img.someName` from `src/data/images.js`. Some products have a `slice` field for a second price tier (rendered as a second add-to-cart button for "per slice" pricing). Sourced from the original `menu.html`; prices are INR.

### Festival banner

`src/data/festivals.js` defines date-ranged banners that auto-show during festivals; `FestivalBanner.jsx` reads the user's local clock to pick the active one. Dates wrap year boundaries (see `new-year`).

### Image pipeline

Drop raster files into `/public` (or `/public/products`), then run `npm run optimize-images`. `scripts/convert-to-webp.js` walks the tree, skips files whose `.webp` is newer than the source, and writes WebP at quality 78 next to the original. The original `.jpeg/.png` is kept as a fallback but the runtime helper in `images.js` always requests `.webp`.

### Useful conventions

- `usePageMeta({ title, description })` from `src/hooks/usePageMeta.js` updates `<title>` and OG/Twitter meta per route. Call it at the top of every page component.
- `<SmartImage>` is the drop-in `<img>` with shimmer skeleton + lazy loading — prefer it for any image that might be below the fold.
- INR formatting goes through `inr()` in `src/data/format.js`.

## Environment

`.env` (gitignored — see `.env.example` for the template) holds three optional integrations:

- `VITE_FIREBASE_*` — without these, reviews/orders/newsletter fall back to localStorage only. Setup: `FIREBASE_SETUP.md`.
- `VITE_EMAILJS_*` — without these, no admin notification email is sent. Setup: `EMAILJS_SETUP.md`.
- `VITE_SNAPWIDGET_ID` — optional Instagram feed widget.

Vite only reads `.env` at startup; restart `npm run dev` after editing it.
