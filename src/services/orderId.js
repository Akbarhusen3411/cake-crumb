// Generate an order ID like CC-AB-080526-0001.
// - Initials: first letters of customer name (defaults to "CC" if empty).
// - DDMMYY: today's date.
// - NNNN: 4-digit daily counter persisted in localStorage, resets each day.
const COUNTER_PREFIX = 'cc_order_counter_'

export function generateOrderId(name = '') {
  const initials =
    (name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2) || 'CC').toUpperCase()

  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  const dateKey = `${dd}${mm}${yy}`

  const storageKey = COUNTER_PREFIX + dateKey
  let next = 1
  try {
    next = (Number(localStorage.getItem(storageKey)) || 0) + 1
    localStorage.setItem(storageKey, String(next))
  } catch {
    // localStorage might be blocked — fall back to a random suffix.
    next = Math.floor(Math.random() * 9999) + 1
  }
  const nnnn = String(next).padStart(4, '0')

  return `CC-${initials}-${dateKey}-${nnnn}`
}
