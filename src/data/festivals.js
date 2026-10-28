// Festival calendar — auto-shows banners during these date ranges.
// All dates are evaluated against the user's local clock (so Indian users see Diwali timed correctly).
// To customize: edit dates / messages here, no code changes needed.

export const FESTIVALS = [
  {
    id: 'new-year',
    name: 'New Year',
    icon: '🎊',
    bg: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fg: '#fff',
    accent: '#ffd700',
    // No year in the text — "Ring in 2027" would be wrong every year after.
    message: 'Ring in the New Year sweetly! Pre-order your celebration cake.',
    cta: 'Order Now',
    range: { fromMonth: 12, fromDay: 26, toMonth: 1, toDay: 4 }, // wraps year boundary
  },
  {
    id: 'valentines',
    name: "Valentine's",
    icon: '💕',
    bg: 'linear-gradient(90deg, #cf3e63 0%, #e0617a 50%, #ec8a99 100%)',
    fg: '#fff',
    accent: '#fff6f2',
    // No truffles — not sold (CLAUDE.md, Customer-facing copy).
    message: 'Sweeten Valentine\'s Day — cheesecakes, cupcakes & cake pops for someone sweet.',
    cta: 'Shop Now',
    range: { fromMonth: 2, fromDay: 7, toMonth: 2, toDay: 14 },
  },
  {
    id: 'holi',
    name: 'Holi',
    icon: '🌈',
    bg: 'linear-gradient(90deg, #f97316 0%, #ec4899 35%, #8b5cf6 70%, #06b6d4 100%)',
    fg: '#fff',
    accent: '#fff',
    message: 'Holi hai! Colorful cupcake boxes & rainbow jelly cups.',
    cta: 'See Specials',
    // Holi follows the lunar calendar — the week before it, per year (Holi:
    // 22 Mar 2027, 11 Mar 2028). A year not listed shows no Holi banner.
    years: {
      2027: { fromMonth: 3, fromDay: 16, toMonth: 3, toDay: 22 },
      2028: { fromMonth: 3, fromDay: 5, toMonth: 3, toDay: 11 },
    },
  },
  {
    id: 'eid',
    name: 'Eid',
    icon: '🌙',
    bg: 'linear-gradient(90deg, #064e3b 0%, #047857 50%, #d4af37 100%)',
    fg: '#fff',
    accent: '#d4af37',
    // No "saffron treats" — not sold.
    message: 'Eid Mubarak! Order Dubai cheesecake & milk cakes early.',
    cta: 'Order Now',
    // Eid ul-Fitr moves ~11 days earlier each year and depends on the moon —
    // about 10 Mar 2027 and 27 Feb 2028; confirm nearer the time. The week
    // before, so customers order ahead. A year not listed shows no banner.
    years: {
      2027: { fromMonth: 3, fromDay: 4, toMonth: 3, toDay: 11 },
      2028: { fromMonth: 2, fromDay: 21, toMonth: 2, toDay: 28 },
    },
  },
  {
    id: 'rakshabandhan',
    name: 'Raksha Bandhan',
    icon: '🪢',
    bg: 'linear-gradient(90deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
    fg: '#fff',
    accent: '#fff',
    // No hampers — not sold.
    message: 'Sweet treats for your sibling — cupcake boxes, cheesecakes & more.',
    cta: 'Order Now',
    // Raksha Bandhan is the Shravan full moon — 17 Aug 2027, 5 Aug 2028.
    years: {
      2027: { fromMonth: 8, fromDay: 11, toMonth: 8, toDay: 17 },
      2028: { fromMonth: 7, fromDay: 30, toMonth: 8, toDay: 5 },
    },
  },
  {
    id: 'diwali',
    name: 'Diwali',
    icon: '🪔',
    bg: 'linear-gradient(90deg, #d97706 0%, #f59e0b 35%, #fbbf24 70%, #fcd34d 100%)',
    fg: '#1a1a1a',
    accent: '#7c2d12',
    // No truffles here — the bakery doesn't sell them (CLAUDE.md, Customer-facing
    // copy). Diwali moves between mid-October and mid-November; check the range
    // each year (8 Nov in 2026).
    message: 'Happy Diwali! Order festive cakes and gift boxes a day ahead.',
    cta: 'Shop now',
    to: '/shop',
    range: { fromMonth: 11, fromDay: 5, toMonth: 11, toDay: 15 }, // matches DiwaliWelcome
  },
  {
    id: 'christmas',
    name: 'Christmas',
    icon: '🎄',
    bg: 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #15803d 100%)',
    fg: '#fff',
    accent: '#fbbf24',
    // No yule logs or plum cakes — not sold.
    message: 'Merry Christmas! Cupcake boxes, cookies & cheesecakes for the season.',
    cta: 'Shop Christmas',
    range: { fromMonth: 12, fromDay: 10, toMonth: 12, toDay: 25 },
  },
]

/**
 * `?diwali=preview` shows the whole Diwali season on any date — banner,
 * welcome screen AND the Diwali offers — on the live site too, so the owner
 * can check it before 5 Nov. It sticks for that browser tab (sessionStorage),
 * so moving to /offers or /cart keeps it; `?diwali=off` or closing the tab
 * ends it.
 *
 * Safe to leave public: the offers only LOOK live. Checkout reads the real
 * date (`cartOfferStatus(..., { real: true })`), so an order placed in preview
 * outside 5–15 Nov carries no gift line in its WhatsApp receipt. It never
 * touches offerNow(); `?testdate=` stays dev-only.
 */
const PREVIEW_KEY = 'cc_diwali_preview'
export function isDiwaliPreview() {
  try {
    const param = new URLSearchParams(window.location.search).get('diwali')
    if (param === 'preview') sessionStorage.setItem(PREVIEW_KEY, '1')
    else if (param === 'off') sessionStorage.removeItem(PREVIEW_KEY)
    return sessionStorage.getItem(PREVIEW_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Returns the active festival for the given date, or null if none.
 * Handles year-wrap ranges (e.g. New Year: Dec 26 → Jan 4).
 */
export function getActiveFestival(now = new Date()) {
  const m = now.getMonth() + 1
  const d = now.getDate()
  for (const f of FESTIVALS) {
    // A moving festival lists its dates per year; with none for this year it
    // stays hidden rather than showing last year's week.
    const range = f.years ? f.years[now.getFullYear()] : f.range
    if (!range) continue
    const { fromMonth, fromDay, toMonth, toDay } = range
    const wrapsYear = toMonth < fromMonth || (toMonth === fromMonth && toDay < fromDay)
    if (wrapsYear) {
      // active if (m,d) >= (fromMonth, fromDay) OR (m,d) <= (toMonth, toDay)
      if (
        (m > fromMonth || (m === fromMonth && d >= fromDay)) ||
        (m < toMonth || (m === toMonth && d <= toDay))
      ) return f
    } else {
      const afterStart = m > fromMonth || (m === fromMonth && d >= fromDay)
      const beforeEnd = m < toMonth || (m === toMonth && d <= toDay)
      if (afterStart && beforeEnd) return f
    }
  }
  return null
}
