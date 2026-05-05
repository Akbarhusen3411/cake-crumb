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
    message: 'Ring in 2027 sweetly! Pre-order your celebration cake.',
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
    message: 'Sweeten Valentine\'s Day — heart-shaped cheesecakes & truffle boxes.',
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
    range: { fromMonth: 3, fromDay: 10, toMonth: 3, toDay: 16 },
  },
  {
    id: 'eid',
    name: 'Eid',
    icon: '🌙',
    bg: 'linear-gradient(90deg, #064e3b 0%, #047857 50%, #d4af37 100%)',
    fg: '#fff',
    accent: '#d4af37',
    message: 'Eid Mubarak! Order Dubai cheesecake & saffron treats early.',
    cta: 'Order Now',
    range: { fromMonth: 4, fromDay: 1, toMonth: 4, toDay: 15 }, // Eid varies — adjust yearly
  },
  {
    id: 'rakshabandhan',
    name: 'Raksha Bandhan',
    icon: '🪢',
    bg: 'linear-gradient(90deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
    fg: '#fff',
    accent: '#fff',
    message: 'Sweet treats for your sibling — order rakhi-day cake hampers.',
    cta: 'Order Hampers',
    range: { fromMonth: 8, fromDay: 5, toMonth: 8, toDay: 20 },
  },
  {
    id: 'diwali',
    name: 'Diwali',
    icon: '🪔',
    bg: 'linear-gradient(90deg, #d97706 0%, #f59e0b 35%, #fbbf24 70%, #fcd34d 100%)',
    fg: '#1a1a1a',
    accent: '#7c2d12',
    message: 'Light up Diwali! Festive gift boxes & assorted truffles available.',
    cta: 'Shop Diwali',
    range: { fromMonth: 10, fromDay: 25, toMonth: 11, toDay: 5 },
  },
  {
    id: 'christmas',
    name: 'Christmas',
    icon: '🎄',
    bg: 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #15803d 100%)',
    fg: '#fff',
    accent: '#fbbf24',
    message: 'Merry Christmas! Yule logs, plum cakes & festive cookie boxes.',
    cta: 'Shop Christmas',
    range: { fromMonth: 12, fromDay: 10, toMonth: 12, toDay: 25 },
  },
]

/**
 * Returns the active festival for the given date, or null if none.
 * Handles year-wrap ranges (e.g. New Year: Dec 26 → Jan 4).
 */
export function getActiveFestival(now = new Date()) {
  const m = now.getMonth() + 1
  const d = now.getDate()
  for (const f of FESTIVALS) {
    const { fromMonth, fromDay, toMonth, toDay } = f.range
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
