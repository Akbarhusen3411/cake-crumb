# Print cards — visiting card & thank-you card

Print artwork in the "pink paper" theme: dusty-pink stock, watercolour corner waves edged in gold,
maroon Cormorant Garamond, the website's cupcake mark. Not part of the Vite build.

`img/logo-print.png` is the logo with deeper colour and sharper edges for print; the website still uses the original.
`img/rose-spray.png` is the bottom-left rose cut out of the logo artwork, used in the card corners.

| File | Size | Sides |
|---|---|---|
| `visiting-card.html` / `.pdf` | 3.5 × 2 in (88.9 × 50.8 mm) | Front: logo, name, tagline · Back: Instagram + Google review QR codes, delivery · eggless · lead-time notes, WhatsApp, Instagram, full address, email |
| `thank-you-card.html` / `.pdf` | A7, 74 × 105 mm | Front: logo, name, thank-you message · Back: large Google review QR, order-again line, Instagram QR, contact, address |

The `.pdf` files are ready to send to a printer (one page per side, exact size).

**Bleed:** `visiting-card-bleed.pdf` is the visiting card with 0.125 in (3 mm) of background on
every side — 3.75 × 2.25 in, trimmed to 3.5 × 2 — for printers that cut after printing. It is
the same HTML opened as `visiting-card.html?bleed`; all text stays at least 3 mm inside the cut.
`png/visiting-card-front-bleed.png` / `-back-bleed.png` are the same at 600 dpi (2250 × 1350).
Ask for 300–350 gsm matt card. To re-make a PDF after editing the HTML: open it in
Chrome → Ctrl+P → Save as PDF → More settings → **Background graphics** on,
Margins **None**, Scale **100**.

## QR codes (`qr/`)

| File | Opens |
|---|---|
| `instagram.svg` | https://www.instagram.com/cake_and_crumb_1/ |
| `reviews.svg` | https://maps.google.com/?cid=3355775214967278598 (the Google listing — same as `MAP_LINK` in `src/data/shopConfig.js`) |
| `website.svg` | https://akbarhusen3411.github.io/cake-crumb/ (spare — taken off the visiting card until the site's product photos are finished) |
| `whatsapp.svg` | https://wa.me/919173183440 (spare, not used on a card yet) |

The review QR opens the bakery's Google listing, where the customer taps *Reviews*.
For a QR that opens the "write a review" box directly, copy the **Ask for reviews**
link from Google Business Profile and ask Claude to regenerate `reviews.svg` from it. The codes are error-correction level H (so the icon in the
middle doesn't stop them scanning) and drawn as filled squares, not strokes — some PDF viewers
render stroked QR codes as stripes.

Scan every QR with a phone before printing.
