# A2 poster — English, one side

A 420 × 594 mm poster in the website's branding (Playfair Display, Lato, Allura; rose / cream /
cocoa): logo and name, "Freshly baked, made to order", 13 of the bakery's own photos, a
names-only menu, four promises, and a contact band with three QR codes. Not part of the Vite build.

**No prices are printed.** The "Prices?" card's QR opens the website's `/menu`, which reads
`src/data/products.js` — change a price, run `npm run deploy`, and every printed poster already
shows the new one.

| File | Use |
|---|---|
| `poster-a2.pdf` | **Give this to the printer** — exact A2, sharp text |
| `poster-a2-bleed.pdf` | 426 × 600 mm with 3 mm bleed, if the printer asks for it |
| `poster-a2-share.pdf` | Light (≈1 MB) image PDF for WhatsApp / phones — not for printing |
| `png/poster-a2.png` | High-quality image, 3970 × 5613 |
| `png/poster-a2-small.png` | 1400 px wide, for WhatsApp status / Instagram |
| `poster-a2.html` | Editable source |

Ask for A2 on 170 gsm gloss or matt poster paper (vinyl/flex outdoors). Scan all four QR codes
on a printed proof first.

## Assets

- `img/g00.jpg` – `g12.jpg` — the owner's photos, resized copies of the originals in
  `WhatsApp Unknown 2026-10-09 at 1.41.52 PM/` (kept: two are full-resolution camera shots).
- `img/logo-print.png` — same as `cards/img/logo-print.png`.
- `qr/whatsapp.svg`, `qr/instagram.svg` — from `cards/qr/`. `qr/google.png` = `public/google-qr.png`
  (Google Business Profile). `qr/menu.svg` → https://akbarhusen3411.github.io/cake-crumb/menu
  (made with the `qrcode` package, level H, verified with jsQR).

## Re-making the files after an edit

```
chrome --headless=new --virtual-time-budget=10000 --no-pdf-header-footer --print-to-pdf=poster-a2.pdf file:///…/pamphlet/poster-a2.html
chrome --headless=new --virtual-time-budget=10000 --no-pdf-header-footer --print-to-pdf=poster-a2-bleed.pdf "file:///…/pamphlet/poster-a2.html?bleed"
chrome --headless=new --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=2.5 --window-size=1588,2245 --screenshot=png/poster-a2.png "file:///…/pamphlet/poster-a2.html?png"
```

`?png` drops the grey surround so the screenshot is exactly the page. The share PDF and the small
PNG are made from that screenshot (resized with `sharp`, wrapped with `jspdf`).

# A2 advertisement — `ad-a2.*`

A second A2 poster laid out like a retail ad (after a reference the owner supplied): corner ribbon,
round brand emblem, a "made to order · eggless option · custom designs" seal, headline, four
product cards beside a hero cake photo, a dark feature band, an Order-today box, address and
socials, four QR codes (WhatsApp, Instagram, Google, and a pink "Prices?" tile → website /menu), an occasions row and a rose closing
strip. English only, no prices. Same assets as the poster.

| File | Use |
|---|---|
| `ad-a2.pdf` / `ad-a2-bleed.pdf` | For the printer |
| `ad-a2-share.pdf` | Light image PDF for WhatsApp / phones |
| `png/ad-a2.png` / `png/ad-a2-small.png` | Images |
| `ad-a2.html` | Source (`?bleed`, `?png` as for the poster) |

# A4 poster — `poster-a4.*`

The A2 poster shrunk to A4 (210 × 297 mm), for handouts, counters and shop windows.
`poster-a4.html` is a copy of `poster-a2.html` with `zoom: 0.5` on `.page`, plus an **"A4 readability"**
block at the end of its stylesheet that sets larger type, because a plain half-size copy printed its smallest text
at about 5 pt. Sizes there are still A2 values (printed size = half). To make room, the photo grid
is two rows (8 of the 13 photos). **An edit to one poster has to be copied into the other.**
The smallest text now prints at about 7.5 pt; QR codes are 21–23 mm.

| File | Use |
|---|---|
| `poster-a4.pdf` | **Give this to the printer** — exact A4 |
| `poster-a4-bleed.pdf` | 216 × 303 mm with 3 mm bleed |
| `poster-a4-share.pdf` | Light image PDF for WhatsApp / phones |
| `png/poster-a4.png` / `png/poster-a4-small.png` | 2481 × 3509 (300 dpi) / 1400 px wide |

Screenshot command as for the A2, with `--force-device-scale-factor=3.125 --window-size=794,1123`.
Print on 130–170 gsm gloss or matt.
