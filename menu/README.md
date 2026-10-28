# Printed menu — A4 menu card

A seven-page A4 menu in the website's look: blush paper, rose double border, Playfair headings,
Lato item names, bold rose prices. Not part of the Vite build.

**Prices are read from the website catalogue** (`src/data/products.js`), so the menu always matches
the site. After any price or product change, rebuild it (see below) — don't edit `menu-a4.html`
by hand, the next build overwrites it.

## Pages

| Page | Contents |
|---|---|
| 1 · Cover | Logo and name, "Our Menu", five cake photos, what's inside (with page numbers), made to order · eggless on request · delivery & pickup, FSSAI and Udyam numbers |
| 2 · Cheesecakes | Classic · Exotic · Chocolate · Premium, Banto and Tub prices, size guide |
| 3 · Cakes & Cookies | Milk Cakes, Sponge Cakes (Bento / Tub), Cookies (1 · box of 6 · box of 12), custom-cake note, size guide |
| 4 · Cupcakes & Treats | Cupcakes, Cake Pops, Dessert Cups, Cakesicles (by shape), Sweet Treats, Platters |
| 5 · Bakes & Gifts | Brownies, Blondies, New on the Menu, Dipping Boxes, Birthday Gift Box |
| 6 · Drinks | Mojitos, Milkshakes, Iced Coffee, Hot Coffee, eggless note |
| 7 · Order & Contact | How to order (1-2-3), WhatsApp, Instagram, email, address, ordering facts, three QR codes (WhatsApp · Instagram · Google) |

## Files

| File | What it is |
|---|---|
| `menu-a4.pdf` | **For printing** — A4, 7 pages, sharp text (~26 MB) |
| `menu-a4-share.pdf` | **For WhatsApp / phones** — same 7 pages as images (~4 MB). Send it as a *Document* so WhatsApp doesn't blur it |
| `png/menu-page-1.png` … `-7.png` | Each page at 300 dpi (2480 × 3508) |
| `png/menu-page-N-small.jpg` | Small copies for status / quick sharing |
| `build-menu.mjs` | Builds `menu-a4.html` from the catalogue |
| `export-menu.mjs` | Makes the PDFs and images with Chrome |
| `menu.css` | The menu's design |
| `menu-a4.html` | The generated menu (open in Chrome to preview) |
| `menu.pdf`, `contact-card.png` | The old menu and the contact card image this menu was made from — kept for reference only (their prices are out of date) |

## Rebuild

From the project folder:

```bash
node menu/build-menu.mjs && node menu/export-menu.mjs
```

Each output is listed with `ok` when it was freshly written (`STALE` means it wasn't — check for
an error above). Each page adjusts its own spacing and photo sizes to fill the border, but after a
big change look through the PNGs to make sure nothing overflows.

## Written by hand — update these yourself

- The page numbers in the cover's "What's inside" list.
- Contact details on page 7: +91 91731 83440, @cake_and_crumb_1, cakeandcrumb.in@gmail.com, the address.
- The ₹1,000 / 50% advance line.
- The QR codes come from `../cards/qr/` — regenerate them there.

## Notes

- **Banto** = whole cheesecake, **Bento** = whole milk / sponge cake (450–500 g — to be confirmed),
  **Tub** = single serve. Not typos.
- The old menu's second number (90816 68490) is the UPI number and was left off on purpose, as was
  "GPay · PhonePe · Paytm" — the menu says "UPI (any app) · Cash".
- The Birthday Gift Box is a cake and flowers; the dessert cup is a free extra.

---

## Editing notes (moved from CLAUDE.md, Oct 2026)

The working rules for this folder, kept here so the project-wide CLAUDE.md stays short. CLAUDE.md keeps a short pointer and the never-break rules.

Seven-page A4: cover · Cheesecakes · Cakes & Cookies · Cupcakes & Treats · Bakes & Gifts · Drinks · Order & Contact. Not in the app or Vite build.

- **Generated, unlike every other print piece.** `build-menu.mjs` reads `products.js`, `certifications.js` and `inr()` → `menu-a4.html`; `export-menu.mjs` renders `menu-a4.pdf`, `png/menu-page-N.png` (300 dpi, plus `-small.jpg`) and `menu-a4-share.pdf` (JPEG pages) via headless Chrome with `execFileSync`, printing `ok`/`STALE` per output. Rebuild after any price change: `node menu/build-menu.mjs && node menu/export-menu.mjs`. **Never hand-edit `menu-a4.html`.**
- **Prices from `products.js`, not `menu/menu.pdf`** (the owner's older menu, kept as source; its prices differ). Every price via `inr()`.
- **Deliberately gone from the old menu:** `90816 68490` as a second number, and "GPay · PhonePe · Paytm" — it says "UPI (any app) · Cash".
- **Size wording:** cheesecakes **Banto / Tub**, milk & sponge cakes **Bento / Tub**, size guide at each page's foot ("whole cake, 450–500 g" · "Tub — single serve"). The Bento weight is unconfirmed.
- **Theme follows the website**: blush paper, rose double border, Playfair bold cocoa titles with heart divider, Lato item names, bold rose prices, blush pill badges, ♡ note boxes. **Every section heading is a band** (`.sub`: bold rose-ink Playfair on blush, rose left bar). Cover is a side-by-side masthead (large logo left, wordmark + tagline + "Our Menu" right); stacked and the black header wordmark were rejected.
- **Pages fill themselves** — an in-page `fit()` tunes row padding (`--rp`), photo height (`--ph`) and gift band (`--gs`). Big changes can still overflow — check the PNGs.
- **Hand-kept:** cover contents page numbers, contact panel (number, handle, email, `BAKERY_ADDRESS`), the ₹1,000 / 50% line, and QRs (`../cards/qr/*.svg`). Cover shows FSSAI and Udyam numbers (owner's request here).
- `menu-a4.pdf` is ~26 MB; send the share PDF on phones.
