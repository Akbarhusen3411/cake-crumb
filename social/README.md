# Social media

See CLAUDE.md for the project overview.

---

## Editing notes (moved from CLAUDE.md, Oct 2026)

The working rules for this folder, kept here so the project-wide CLAUDE.md stays short. CLAUDE.md keeps a short pointer and the never-break rules.

Facebook artwork and the Google-review poster. Not in the app or Vite build. Every image is HTML rendered by headless Chrome via `execFileSync`.

- **`facebook-cover-tagline.html`** — 820 × 312 CSS px at 2× → 1640 × 624. **Phones crop to 16:9, keeping only x 132–688**, so name, number and the inner two photos sit there. Tagline under the name (owner's request); it's the widest line, so logo and type were shrunk. Export command in a comment at the top.
- **`posts/post.html?n=1…6`** — six launch posts, 540 × 675 at 2× → 1080 × 1350. `node social/posts/export.cjs` renders all, `ok`/`STALE` per file. Footer brand carries the tagline; cupcake photo is `cupcakes-box-pink-purple` everywhere (owner choices).
  - **No prices in images or `posts/captions.txt`** (one "from ₹…" reads as the whole range's price). Only ₹ left: the ₹1,000 / 50% advance *rule* in post 6.
  - Post 5 shows the Birthday Gift Box **whole** (`.photo--whole`: `contain` over a blurred copy) — `cover` cut its lettering.
- **`review-poster.html`** — A4, real mm. `node social/export-review-poster.cjs [<path to jsqr>]` writes `review-poster.pdf`, `png/review-poster.png` (300 dpi) and `google-review-qr-g.png`, then **decodes both QRs** and fails loudly if either doesn't return the review link. `jsqr` isn't a project dependency.
  - **`google-review-qr.svg` encodes `GOOGLE_REVIEW_LINK`** (unlike `cards/qr/reviews.svg` → `MAP_LINK`). Level **H** lets the G badge cover its centre — keep the badge ≤ ~22% of the code's width.
- **The Facebook page:** "No hours available" (see *Timing*), the one public number, and the site's copy rules apply to captions and replies.
- Contact details hand-copied into every file.
