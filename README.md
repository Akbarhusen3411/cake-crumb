# Cake & Crumb

A React storefront for **Cake & Crumb** — handcrafted cheesecakes, milk cakes, cookies and custom desserts. WhatsApp-first ordering with optional Firebase backing for reviews and orders.

🌐 **Live site:** https://akbarhusen3411.github.io/cake-crumb/

## Tech stack

- **React 19** + **React Router v7** (lazy-loaded routes)
- **Vite 8** build / dev server
- **Bootstrap 5** + **Tailwind 4** (layout + utility classes)
- **Firebase Firestore** — optional, for reviews / orders / newsletter persistence
- **EmailJS** — optional, admin email notification on every new order
- Deployed to **GitHub Pages** via `gh-pages` (served from `/cake-crumb/` base path)

The app works fully without Firebase / EmailJS — features fall back to `localStorage`. Configure them when you want cross-device persistence and email backup.

## Quick start

```bash
npm install
npm run dev               # http://localhost:5173/cake-crumb/
```

### All scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the built `dist/` for smoke-testing |
| `npm run lint` | ESLint over the repo |
| `npm run photos` | Link, resize and check product photos (see [`PHOTOS.md`](./PHOTOS.md)) |
| `npm run check-images` | Every product has a photo, every photo exists |
| `npm run check-prices` | Home's featured cards still match the catalogue price |
| `npm run optimize-images` | Generate `.webp` siblings for everything in `/public` |
| `npm run convert-videos` | Phone clips → web-ready muted `.mp4` + poster |
| `npm run deploy` | Build + push `dist/` to the `gh-pages` branch |

After dropping new raster files into `/public`, run `npm run optimize-images` once so the runtime helper can serve them as WebP.

## Configuration

Copy `.env.example` → `.env` and fill in the keys you want to use. **Restart the dev server** after editing `.env` — Vite only reads it at startup.

- **Firebase** (reviews, orders, newsletter persistence) → see [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md)
- **EmailJS** (admin email on every new order) → see [`EMAILJS_SETUP.md`](./EMAILJS_SETUP.md)
- **SnapWidget** (optional Instagram feed widget) → set `VITE_SNAPWIDGET_ID`

## Features

- 🛒 Cart + checkout with UPI / Cash-on-Delivery, persisted in `localStorage`
- 📱 WhatsApp auto-opens with pre-filled order summary on checkout
- 🤖 Floating chatbot for orders without leaving the page
- ⭐ Customer reviews with admin moderation, star ratings, JSON-LD aggregate rating for SEO
- 🎉 Festival banners that auto-show on calendar dates (Diwali, Valentine's, etc.)
- 🖼️ Auto WebP image pipeline (`sharp`) — keeps the site light on mobile
- 🔍 Per-route `<title>` / OG meta + sitemap for SEO

## Project structure

```
src/
  components/      Reusable UI (Navbar, Footer, ChatBot, WhatsAppButton, …)
  context/         CartContext — single source of truth for cart state
  data/            Static data: products, images, offers, festivals, shopConfig, certifications, accounting menu
  hooks/           usePageMeta, useJsonLd, useIsMobile, useOfferClock
  pages/           Route components (Home, Shop, Checkout, Reviews, admin, …)
  services/        orders, reviews, newsletter, emailNotify, orderId, delivery, accounting
  utils/           invoice, CSV export, dates, image compression, review guard
  firebase.js      Initializes Firebase only if VITE_FIREBASE_* are set
scripts/           Photo, price, video and sitemap helpers behind the npm scripts
```

## Print material

Not part of the site build — each folder has its own README with the files and how to re-make them.

| Folder | What's in it |
|---|---|
| [`menu/`](./menu/README.md) | Seven-page A4 **priced menu**, generated from `src/data/products.js` — run `node menu/build-menu.mjs && node menu/export-menu.mjs` after a price change |
| [`pamphlet/`](./pamphlet/README.md) | Posters and ads (A2 · A4 · A5), no prices |
| [`cards/`](./cards/README.md) | Visiting card, thank-you card, A5 contact card, and the shared QR codes |

For deeper architecture notes (the GitHub Pages base-path quirk, the four-part order flow, the accounting admin, invoices, the progressive-enhancement Firebase pattern) see [`CLAUDE.md`](./CLAUDE.md).

## Deployment

```bash
npm run deploy
```

`predeploy` builds the site and copies `dist/index.html` → `dist/404.html` so GitHub Pages serves the SPA for unknown routes (deep links to `/cake-crumb/reviews`, `/cake-crumb/shop`, etc. work). `gh-pages -d dist` then pushes the build to the `gh-pages` branch.

The Vite `base: '/cake-crumb/'` in `vite.config.js` matches the GitHub repo name; if you fork to a different repo name, update it there.

## License

Private project. All product photography and brand assets are © Cake & Crumb.
