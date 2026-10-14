# Print cards — visiting card, thank-you card & contact card

Print artwork in the "pink paper" theme: dusty-pink stock, watercolour corner waves edged in gold,
maroon Cormorant Garamond, the website's cupcake mark. Not part of the Vite build.

`img/logo-print.png` is the logo with deeper colour and sharper edges for print; the website still uses the original.
`img/rose-spray.png` is the bottom-left rose cut out of the logo artwork, used in the card corners.

| File | Size | Sides |
|---|---|---|
| `visiting-card.html` / `.pdf` | 3.5 × 2 in (88.9 × 50.8 mm) | Front: logo, name, tagline · Back: Instagram + Google review QR codes, delivery · eggless · lead-time notes, WhatsApp, Instagram, full address, email |
| `thank-you-card.html` / `.pdf` | A7, 74 × 105 mm | Front: logo, name, thank-you message · Back: large Google review QR, order-again line, Instagram QR, contact, address |
| `contact-card.html` / `.pdf` | A5, 148 × 210 mm | One side: logo, name, tagline, two corner ribbons with a script quote under each, WhatsApp number, Instagram, email, full address, order-a-day-ahead note, payment, delivery · pickup, cancellation note, three QR codes (WhatsApp · Instagram · Google) |

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
| `whatsapp.svg` | https://wa.me/919173183440 (used on the contact card and the menu) |

The review QR opens the bakery's Google listing, where the customer taps *Reviews*.
For a QR that opens the "write a review" box directly, copy the **Ask for reviews**
link from Google Business Profile and ask Claude to regenerate `reviews.svg` from it. The codes are error-correction level H (so the icon in the
middle doesn't stop them scanning) and drawn as filled squares, not strokes — some PDF viewers
render stroked QR codes as stripes.

Scan every QR with a phone before printing.

**The printed menu reads these files directly.** Page 7 of `../menu/` loads `whatsapp.svg`,
`instagram.svg` and `reviews.svg` from this folder, so don't rename or move them. After
regenerating one, rebuild the menu too (`node menu/build-menu.mjs && node menu/export-menu.mjs`)
or its PDFs keep the old code.

## Contact card

`contact-card.html` is the A5 "how to reach us" sheet, and `png/contact-card.png` is the same at
300 dpi (1748 × 2480) for sharing on a phone. It has its own, paler look — blush paper, a
rose-gold frame, rose icons — matched to a reference image; the colours are set at the top of
that file, so `card.css` and the other two cards are untouched. Its logo is the website's own
`public/logo_final.png`, not `img/logo-print.png`.

Only one phone number is printed, **+91 91731 83440**. The payment line ("Orders of ₹1,000 or
more: 50% advance by UPI") and the 30-minute cancellation line repeat the website's rules — if
those change on the site, change them here and re-make the PDF and PNG.

Opening `contact-card.html?png` shows the card alone, with no grey surround, for a screenshot.
