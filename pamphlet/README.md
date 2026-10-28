# Print posters — `pamphlet/`

Two designs, English only, none of them priced:

| Design | Sizes | Sides | For |
|---|---|---|---|
| **Poster** (`poster-*`) — calm menu board, 13 photos, names-only menu | A2 · A4 | One | Counters, waiting areas |
| **Advertisement** (`ad-*`) — retail-ad layout, gift box, order panel with QR codes | A2 · A4 · A5 | A2 one side; A4 and A5 front + photo back | Walls, handouts, handbills |

**Need a menu with prices?** That is `../menu/` — a seven-page A4 menu card generated from
`src/data/products.js` (see `menu/README.md`). The posters stay unpriced so a price change never
needs a reprint.

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
feature band, so the tag doesn't repeat them), headline, four product cards beside the birthday gift box
photo (square frame, with a "Birthday special — Gift Box" sticker on its bottom-left corner), a dark feature band, one order panel (rose "Ready to order?" call-to-action with the
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
millimetres), and a smaller emblem so the name clears its ring. The front is otherwise the A2's,
except that the gift box is named on a **banner under the photo** instead of a sticker on it.
It also has a second page, the photo back — see below. **An edit to one ad has to be copied into
the others by hand** (`ad-a2`, `ad-a4`, `ad-a5`).

| File | Use |
|---|---|
| `ad-a4.pdf` / `ad-a4-bleed.pdf` | For the printer — **two pages, front then back** (exact A4 / 3 mm bleed) |
| `ad-a4-share.pdf` | Two-page image PDF for WhatsApp / phones |
| `png/ad-a4.png` / `png/ad-a4-small.png` | The front: 300 dpi / 1400 px wide |

## Sharp files for phones

- **`png/*-hd.jpg` / `png/*-hd.png`** (A4 and A5) — 600 dpi: 3970 × 5615 for A4, 3496 × 4960 for A5. The `.jpg` is the one to
  send; send it on WhatsApp **as a Document**, never as a Photo, or WhatsApp shrinks it and it blurs.
  A4: `--force-device-scale-factor=5 --window-size=794,1123`; A5: `6.25` and `560,794`, then cropped.
- **A shared front image opens WhatsApp on many Android phones.** Their galleries scan a picture
  for QR codes and offer the link. It is the WhatsApp code on the front, not a fault; the back has
  no code and opens as a plain photo.
- **`*-share.pdf`** are built from those full-resolution images (the A2 ones from `png/*-a2.png`), not
  a downsized copy, so they stay sharp when zoomed.
- **`qr/google-hd.png`** is `qr/google.png` enlarged 4× with nearest-neighbour, so its squares keep
  hard edges; at 456 px PDF viewers smoothed it into a blur. All four designs use it. Remake it the
  same way if Google's QR is ever re-exported.

# The ad's back side — second page of `ad-a4.html` and `ad-a5.html`

Both files hold two pages: the front, then a photo back (`ad-a2` has no back). **The two backs carry
the same content — an edit to one goes into the other.** No prices, no contact details (the front
has them; a full order panel was built here and removed at the owner's request). Five bands:

1. **Masthead** — logo, name, the brand tagline, "A little taste of what we bake".
2. **Feature** — the dessert tubs large on a tilted rose card, beside Custom cakes, Cupcakes,
   Cheesecakes and Cheesecake tubs.
3. **"Pick your favourite"** — five round photos: Nutella cheesecake, Milk cake, Mango cupcake,
   Birthday cake, Cookies.
4. **Photo row** — Cake pops (two photos side by side in the wide tile), Strawberry, Brownies,
   Heart cake.
5. **Closing panel** — "Which one is yours? … Turn over to order", two unlabelled photos beside
   "A sweet surprise for someone special", and Birthdays / Anniversaries / Parties / Gifting.

**The names are the owner's own, corrected by hand — don't rename one from its filename.** The file
`dessertcup-rose-cream` is **Strawberry**, and the dark hearts are **"Heart cake"**. No photo appears
twice on the page.

| File | Use |
|---|---|
| `ad-a4.pdf` / `ad-a4-bleed.pdf` | **Two pages: front, then back** — print double-sided |
| `ad-a4-share.pdf` | Two-page image PDF for WhatsApp / phones |
| `png/ad-a4-back.png` / `-hd.png` / `-hd.jpg` / `-small.png` | The back alone: 300 dpi / 600 dpi / 1400 px wide |

Screenshots hold one page: `?png` is the front, `?png&side=back` the back.

`img/bNN.jpg` are untouched copies of the owner's photos — most from `public/products/<name>.jpeg`
(the source name is in a comment beside each tile), `b21`/`b22` the two cake-pop photos sent
separately. Gaps in the numbering are spares from earlier rounds, since deleted. To swap a
photo, replace that `bNN.jpg` and re-export. Bands are placed absolutely from the page top, so a
taller band means moving the ones below it; leave room for the photo rings, which are drawn
*outside* their boxes.

# A5 advertisement — `ad-a5.*`

The two-sided A4 ad on A5 (148 × 210 mm), for handbills. A5 has the same proportions as A4, so
`ad-a5.html` is a copy of `ad-a4.html` with a smaller `zoom` (148 / 420) and an **"A5 readability"**
block at the very end of its stylesheet: larger type, QR codes at about 19 mm, no occasions row
on the front (the back's closing panel shows the same four) and no sub-lines in the brown band. Sizes there are A2 values (printed size
= 0.352 of the figure). **An edit to `ad-a4.html` has to be copied here by hand.**

| File | Use |
|---|---|
| `ad-a5.pdf` / `ad-a5-bleed.pdf` | Two pages, front then back — exact A5 / 154 × 216 mm with 3 mm bleed |
| `ad-a5-front.pdf` / `ad-a5-front-bleed.pdf` | **Front only**, one page — for a single-sided run |
| `ad-a5-share.pdf` | Two-page image PDF for WhatsApp / phones |
| `png/ad-a5*.png`, `png/ad-a5-back*.png` | 1748 × 2480 (300 dpi), `-hd` 3496 × 4960 (600 dpi), `-small` 1400 px wide |

Screenshots use `--window-size=560,794` (A5 is a fraction of a pixel smaller) and are cropped to the
exact pixel size; `?png` is the front, `?png&side=back` the back. When *printing*, `?side=front` or
`?side=back` gives that side alone (it combines with `?bleed`) — that is how the front-only PDFs are made.

---

## Editing notes (moved from CLAUDE.md, Oct 2026)

The working rules for this folder, kept here so the project-wide CLAUDE.md stays short. CLAUDE.md keeps a short pointer and the never-break rules.

Two designs, each in A2 (420 × 594 mm) and A4 — the ad in A5 too — English only, editable HTML plus exports. Not in the app or Vite build; `pamphlet/README.md` lists every file. (`offers/` was deleted Oct 2026.) The **priced** print piece is `menu/`; posters stay unpriced.

- **`ad-a2.html`** — retail ad (emblem, "Easy as 1·2·3" gift tag, product cards, hero photo, feature band, one order panel with three QRs), recommended for walls. **`poster-a2.html`** — calmer menu board (13 photos, names-only menu) for counters.
- **No prices printed.** `poster-a2`/`-a4` carry a "Prices?" QR (`qr/menu.svg` → `/menu`), so the `/menu` URL is load-bearing for paper in circulation. **The ads no longer have that tile** (owner's choice; customers ask on WhatsApp).
- **The A4s are copies, not derived.** `ad-a4.html` / `poster-a4.html` = the A2 file with `zoom: 0.5` on `.page` plus an **"A4 readability"** block at the end (larger type, re-placed blocks; sizes and `top` still in **A2 mm**, printed = half). Edits go into each size by hand. `poster-a4` has two photo rows (8 of 13); `ad-a4` a smaller emblem and larger card photos.
- **The ad's gift tag says how to order, not the promises** ("Made to order / Eggless / Custom designs" are in the brown band). No second circle beside the emblem (a round seal was rejected).
- **Facts checked against the catalogue:** cheesecake card tag is **"Banto & tubs"**. No card photo may show chocolates (none sold); the heart-box shot appears only as an unlabelled decorative circle (owner's choice).
- **Contact details, address and flavour names are hand-copied**, as in `cards/`.
- **Laid out in millimetres.** `ad-a2` places nearly every block `position: absolute` from the top — a taller section means moving those below. Re-render and look.
- **`poster-a2` is two stacks that must not meet**: masthead → photos → menu → promises flow from the top; brown band, occasions row and closing strip are pinned to the bottom. The photo rows (`grid-template-rows` on `.mosaic`) are the slack — retune after any change above and check the promises→band gap.
- **The masthead is one centred group**: logo beside the name, centred between the corner ribbons. Stacked logo and name-centred-alone were both rejected.
- **`?bleed`** gives a 3 mm bleed; **`?png`** drops the grey surround. PDFs/PNGs come from headless Chrome like the cards (commands in README); `*-share.pdf` is the PNG wrapped with `jspdf`, for phones. A4 bleed is 6 A2-mm (`--b: 6mm`).
- **`ad-a4.html` and `ad-a5.html` are TWO pages each** — a second `.page` (`.page--back`) is a photo back, so their PDFs are front then back; `ad-a2` has no back. `?png` = front, **`?png&side=back`** = back (`png/*-back*`). Don't split the back into its own file again (owner had it merged).
  - **The A5 is a third hand-kept copy**: `ad-a4.html` with `zoom: 0.35238` (148 / 420), 8.51 A2-mm bleed, and an **"A5 readability"** block at the very end (larger type, ~19 mm QRs, no occasions row on the front, no sub-lines in the brown band). **The two backs must stay identical in content** — back edits go into both. Only the A5 takes `?side=front` / `?side=back` when *printed* (makes `ad-a5-front.pdf`).
  - **A5 screenshots need a crop**: page is 559.37 × 793.7 CSS px, window `560,794`, PNG cut to 1748 × 2480 (300 dpi).
  - **All three fronts feature the birthday gift box** in a **square** frame (lettering in its corners). A4/A5 name it on a banner under the photo; A2 uses a sticker over its bottom-left and drops the two small circles that covered "Happy Birthday". Wording: *Cake · flowers · free dessert cup* (the cup is free, not part of the box). A plain phone photo was tried as hero; the owner went back to the styled one.
  - **Outlines are shadows OUTSIDE the box.** Hero ring 3 mm, banner 2 mm, so a 5 mm gap was none (frame is 156 mm tall for that); round photos' ring 2.2 mm, names 6 mm below. Leave room for the ring.
  - **The back is five absolutely-placed bands** — masthead (logo, name, tagline, "A little taste of what we bake") · dessert-tub hero + four tiles · "Pick your favourite" round photos · one wide + three tall · closing panel. Photos are copies in `img/bNN.jpg`, source name in a comment beside each (gaps = spares deleted Oct 2026).
  - **Every name on the back is the owner's wording — don't re-derive from a filename.** `dessertcup-rose-cream` is **Strawberry**; the dark hearts are **"Heart cake"**, not chocolates; the assorted-tubs shot isn't milk cake. The same filenames sit on differently-named site products — unresolved.
  - **No photo twice on the back.** The wide tile is two cake-pop photos (`.tile--duo`).
  - **The back carries NO contact details** — no number, pills or QR (an order panel was removed; the front says it). Closing panel: "Turn over to order", two photos, four occasion icons.
  - **The closing panel's three columns must add to the 392 mm inside the margins**, or the middle overflows and pushes the occasions grid off the edge — hence `minmax(0, 1fr)`.
  - **A shared front image opens WhatsApp on many Android phones** (galleries scan QRs) — expected. The back has no code.
- **Phone sharpness.** A4s also export `png/*-hd.png`/`.jpg` at 600 dpi (scale factor 5); share PDFs use the full-resolution image. `qr/google-hd.png` is Google's QR enlarged 4× nearest-neighbour (at 456 px viewers blurred it). WhatsApp blur is its photo compression: send **as a Document**.
- **Verify a rebuild wrote the files.** A bash `for` loop with backslashed Windows paths once wrote to literal `pamphlet$n.pdf` names and left real PDFs stale. Drive Chrome from Node (`execFileSync`, no shell) and check each output's mtime.
- **Owner's wording:** "Homemade cakes & desserts", never "homemade bakery"; Gujarati town spelling **વસો**, not વાસો. A Gujarati back was built, then removed.
