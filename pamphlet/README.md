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
round brand emblem, a pink "Easy as 1·2·3" gift tag (how to order — the promises are in the
feature band, so the tag doesn't repeat them), headline, four product cards beside a hero cake
photo, a dark feature band, one order panel (rose "Ready to order?" call-to-action with the
number, Call / WhatsApp pills and the lead time · address and socials · three QR codes for
WhatsApp, Instagram and Google — the "Prices?" tile was removed at the owner's request), an occasions row and
a rose closing strip. English only, no prices. Same assets as the poster. The cheesecake tag says
**Banto**, the owner's word for the whole cheesecake (Bento is the milk/sponge cake size).

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

# A4 advertisement — `ad-a4.*`

The A2 ad on A4, built the same way as `poster-a4`: a copy of `ad-a2.html` with `zoom: 0.5` plus an
**"A4 readability"** block that sets larger type and re-places the blocks (its `top` values are A2
millimetres), and a smaller emblem so the name clears its ring. Otherwise the same content.
**An edit to one ad has to be copied into the other.**

| File | Use |
|---|---|
| `ad-a4.pdf` / `ad-a4-bleed.pdf` | For the printer (exact A4 / 3 mm bleed) |
| `ad-a4-share.pdf` | Light image PDF for WhatsApp / phones |
| `png/ad-a4.png` / `png/ad-a4-small.png` | 300 dpi / 1400 px wide |

## Sharp files for phones

- **`png/*-hd.jpg` / `png/*-hd.png`** (A4 only) — 3970 × 5615, i.e. 600 dpi. The `.jpg` is the one to
  send; send it on WhatsApp **as a Document**, never as a Photo, or WhatsApp shrinks it and it blurs.
  Made with `--force-device-scale-factor=5 --window-size=794,1123`.
- **`*-share.pdf`** are built from those full-resolution images (the A2 ones from `png/*-a2.png`), not
  a downsized copy, so they stay sharp when zoomed.
- **`qr/google-hd.png`** is `qr/google.png` enlarged 4× with nearest-neighbour, so its squares keep
  hard edges; at 456 px PDF viewers smoothed it into a blur. All four designs use it. Remake it the
  same way if Google's QR is ever re-exported.
