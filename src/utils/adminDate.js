// Date helpers shared by the admin accounting tabs AND the two storefront date
// pickers (Checkout's delivery date, Contact's "need by").
//
// `new Date().toISOString()` is UTC. In IST (+5:30) that reads as *yesterday*
// until 5:30 am, so a form defaulting to it would file an early-morning entry
// under the wrong day. Shift by the local offset first.
//
// Checkout and Contact each rolled their own `d.setDate(d.getDate() + 1)` +
// `.toISOString()`, which has exactly this fault one day over: between
// midnight and 05:30 IST their "earliest date" resolved to TODAY, so the date
// input accepted same-day against a banner promising a day's notice — and that
// window is precisely when a bakery taking WhatsApp orders at any hour gets
// them. Both now call localIso(), so the rule lives in one place.

/** "YYYY-MM-DD" for a Date in the LOCAL timezone, not UTC. */
export function localIso(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function todayIso() {
  return localIso()
}

/** "28 Jul 26" — the compact form every list uses. */
export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

/** "July 2026" from "2026-07"; "All time" for the ALL sentinel. */
export function monthLabel(ym) {
  if (!ym || ym === 'ALL' || ym === 'all') return 'All time'
  const [y, m] = String(ym).split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

/** Does a "YYYY-MM-DD" fall in the scope? period: 'all' | 'today' | 'YYYY-MM'. */
export function inPeriod(date, period) {
  if (!period || period === 'all') return true
  const d = String(date || '')
  return period === 'today' ? d === todayIso() : d.slice(0, 7) === period
}
