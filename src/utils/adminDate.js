// Date helpers shared by the admin accounting tabs.
//
// `new Date().toISOString()` is UTC. In IST (+5:30) that reads as *yesterday*
// until 5:30 am, so a form defaulting to it would file an early-morning entry
// under the wrong day. Shift by the local offset first.
export function todayIso() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
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
