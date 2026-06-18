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

- `src/firebase.js` reads `VITE_FIREBASE_*`. If any are missing, `isFirebaseEnabled` is false; the bundle still imports Firebase but no network calls fire.
- Services in `src/services/` (`orders.js`, `reviews.js`, `newsletter.js`) follow the same shape: try Firestore if enabled → always mirror to `localStorage` → never throw. UI must not block on them.
- Firestore security rules live in `FIREBASE_SETUP.md` (not in code). When changing the shape of `orders`, `reviews`, or `newsletter` documents, update the rules too or writes will be rejected in production.
- `src/services/emailNotify.js` exposes `sendOrderEmail()` (admin) and `sendCustomerConfirmation()` (customer, gated on a separate `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`). Both fire-and-forget. See `EMAILJS_SETUP.md` for the two-template setup walkthrough.

### Order flow (the load-bearing feature)

Placing an order triggers **four parallel side-effects**, any of which can fail without breaking the others:

1. **WhatsApp** — `buildWhatsAppLink()` in `WhatsAppButton.jsx` opens `https://wa.me/919173183440` pre-filled. Primary channel. `WHATSAPP_PHONE` constant.
2. **Firestore + localStorage mirror** — `saveOrder()` writes the `orders` collection and a last-50 local mirror.
3. **Admin email** — `sendOrderEmail()` (EmailJS Template #1) to the bakery's inbox.
4. **Customer email** — `sendCustomerConfirmation()` (EmailJS Template #2, optional) to the customer if they entered an email.

Order IDs come from `services/orderId.js` and look like `CC-AB-DDMMYY-NNNN` (initials + date + per-day counter in localStorage).

There is **also an admin confirmation flow** at `/confirm-order?id=…`. The confirm URL is included as a tap-able link at the bottom of every order's WhatsApp message (and in the admin email if EmailJS is configured). When the bakery owner taps the link, `ConfirmOrder.jsx` calls `markOrderConfirmed()` (updates Firestore `status` to `'confirmed'`), then opens WhatsApp pre-filled with a confirmation message to the customer's phone. No third EmailJS template needed (free-tier cap is 2 templates).

The confirm URL is built from `window.location.origin + BASE_URL + /confirm-order?id={ORDER_ID}` in `Checkout.jsx::buildOrderMessage()`. The same builder also emits a tap-able `/track-order?...` link for the customer. **Don't remove either link from the WhatsApp body** — they're currently the only paths to the confirm/track pages if EmailJS isn't set up.

**URL-params fallback** — both `ConfirmOrder.jsx` and `TrackOrder.jsx` accept `id`, `name`, `phone`, `total`, `date`, `method` as query params and build a minimal order from them when the Firestore + localStorage lookup returns nothing. This matters because the customer's localStorage mirror lives on their own phone — the admin opening a confirm link from a different device would otherwise see "Order not found". The items list isn't in the URL, so it's hidden in the fallback path. If you change `buildOrderMessage()`, keep these params in the URL or both pages start failing across devices.

Customers can also look up their own orders at `/track-order?id=…` via the lookup form on that page — same fallback chain applies.

### ChatBot is a second, independent order path

`src/components/ChatBot.jsx` (mounted globally in `App.jsx`, ~1150 lines) is a conversational ordering assistant — not just a help widget. It can place a complete order on its own: it walks the customer through category → item selection → contact details, then calls the same `saveOrder()` + `generateOrderId()` + `wa.me/{WHATSAPP_PHONE}` machinery as Checkout. **It keeps its own `orderCart` in component state** — completely separate from `CartContext`; it only reads `useCart().count` to show a badge. Adding to the ChatBot cart does **not** touch the main cart and vice-versa. The menu/price data shown in the bot (`CAT_IMAGES`, price cards) is hand-embedded in the file, **not** sourced from `src/data/products.js` — so a price or item change in `products.js` won't propagate to the bot. Keep them in sync manually when prices change.

### Delivery is a choice, not a computed fee

Checkout asks the customer to pick **Home Delivery** or **Self-Pickup** (radio cards). For home delivery the customer fills in address + city + 6-digit pincode; for pickup all three are optional. The total shown on checkout is always just the subtotal — the actual delivery charge is **confirmed by the bakery on WhatsApp**, and the order WhatsApp message makes that explicit (`*Delivery:* will be confirmed by Cake & Crumb`).

The old Haversine + Nominatim distance calculation in `src/services/delivery.js` is no longer called from `Checkout.jsx`. The file is kept around in case the bakery wants to bring back a per-km auto-quote later, but **don't reintroduce it without the user's explicit ask** — they removed it because customers found the auto-calculated number confusing when it didn't match the final quote.

### Cart

`src/context/CartContext.jsx` is the single source of truth, persisted to `localStorage` under `cc_cart_v1`. Item shape: `{ id, name, price, img, qty }`. **There is no minimum order** — any non-empty cart can proceed to checkout. `MIN_ORDER_INR` still exists in `src/data/shopConfig.js` but is unused; don't re-wire it without checking with the user first.

### Checkout form starts empty (pre-fill removed)

Earlier, `Checkout.jsx` pre-filled the form from two localStorage keys (`cc_customer_v1`, saved on successful order; and `cc_customer_draft_v1`, auto-saved on every keystroke). Customers reported seeing stale data from past visits on a fresh checkout — confusing on mobile especially — so pre-fill was removed.

The form now always starts empty. `clearStoredCustomer()` runs once on mount and again on successful submit, deleting both legacy keys. **Don't reintroduce pre-fill** without checking with the user first — the explicit ask was "no old data in delivery details".

### Routing & lazy loading

`src/App.jsx` uses `lazy()` for every route except `Home`. The routed pages are `/about`, `/menu`, `/shop`, `/gallery`, `/reviews`, `/contact`, `/cart`, `/checkout`, `/review` (review submit), `/faq`, `/confirm-order`, and `/track-order`. Firebase loads on `/reviews`, `/review`, `/checkout`, `/confirm-order`, and `/track-order` (anything that hits Firestore). Note the globally-mounted `ChatBot` also pulls in `saveOrder` → Firebase once a customer orders through it. The wildcard `<Route path="*" element={<Home />} />` makes the GitHub Pages 404 fallback land users somewhere sensible.

`NO_FOOTER_ROUTES = ['/cart', '/checkout', '/confirm-order']` — on these routes App.jsx renders `<MiniFooter />` (slim copyright + WhatsApp ribbon) instead of the full `<Footer />` so the buying flow stays focused.

A small `<ScrollToTop />` component inside `<CartProvider>` listens to `useLocation().pathname` and calls `window.scrollTo({ top: 0 })` on every route change — without it, React Router preserves scroll position and users end up at the bottom of the new page when they tap a header/footer link from a scrolled page.

### Product catalog

`src/data/products.js` is hand-maintained — `featured` (Home cards) and `shopProducts` (the full Shop + Menu list). Each entry references `img.someName` from `src/data/images.js`. Some products have a `slice` field for a second price tier (rendered as a second add-to-cart button). Sourced from the original menu PDF; prices in INR.

The Shop page is a 3-column layout (lg+): **left filter sidebar** (Category radio + Price Range radio + Occasion visual-only radio + Clear Filters button), **center product grid** (3 columns of `.cc-product-card`), **right sticky cart sidebar** with subtotal + View Cart / Checkout buttons + "Need Something Special?" CTA + 3 trust badges. Pagination shows 12 products per page with prev/next + numbered buttons. Filter state lives in component state; changing any filter resets to page 1. The old `.cc-filter-chips` row CSS is still in `index.css` but unused. Search is wired to the navbar magnifier icon (`SearchOverlay.jsx`).

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
- **HeartDivider** — `src/components/HeartDivider.jsx` is the small `— ♥ —` divider used under every hero h1 and several section headings. Accepts a `width` prop (default 60). Prefer this over the older `.heart-divider` class for any new heading.
- **Hero photos** — Home uses the local `hero-roses.jpeg`. The other 6 heroes use Unsplash photo IDs (`heroAbout`, `heroMenu`, `heroShop`, `heroReviews`, `heroGallery`, `heroContact` in `images.js`) served through the existing `u()` helper. Use **standard images.unsplash.com IDs only** — premium.unsplash.com / plus.unsplash.com URLs require a paid license and the `u()` helper doesn't support them.

The Reviews page also has its own non-hero patterns worth knowing: a 3-section stats card at the top (overall rating + 5⭐ breakdown bars + 4 sub-ratings with circular icons), a 2-column body (review list left with sort dropdown + Load More, Share-Your-Experience form right + What Customers Love card), and a bottom 4-feature promise strip — the same `.feature-row` pattern Shop uses.

### Conventions worth following

- `usePageMeta({ title, description })` from `src/hooks/usePageMeta.js` updates `<title>` and OG/Twitter meta per route. Call it at the top of every page.
- `useJsonLd(id, jsonObj)` from `src/hooks/useJsonLd.js` injects structured data — Shop adds per-product `Product` JSON-LD with rating, brand, image; Home has `Bakery`; Reviews has `AggregateRating`.
- `<SmartImage>` is the drop-in `<img>` with shimmer skeleton + lazy loading.
- `<HeartDivider width={50} />` is the small heart-on-a-line component used under hero h1s — see Brand kit section.
- INR formatting goes through `inr()` in `src/data/format.js`.
- Per-icon imports from `react-icons/fi`, `react-icons/tb`, and `react-icons/fa` are tree-shaken by Vite — `import { FiHome } from 'react-icons/fi'` is fine, don't try deep imports (the package doesn't expose them).

## Environment

`.env` (gitignored — see `.env.example`) holds optional integrations. Vite only reads `.env` at startup; restart `npm run dev` after editing.

| Var | What happens without it |
|---|---|
| `VITE_FIREBASE_*` | Reviews/orders/newsletter fall back to localStorage only. See `FIREBASE_SETUP.md`. |
| `VITE_EMAILJS_SERVICE_ID` + `VITE_EMAILJS_TEMPLATE_ID` + `VITE_EMAILJS_PUBLIC_KEY` | No admin notification email is sent. See `EMAILJS_SETUP.md`. |
| `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` | No customer confirmation email — admin notification still works. Skipped silently. |
| `VITE_SNAPWIDGET_ID` | Optional Instagram feed widget. |
