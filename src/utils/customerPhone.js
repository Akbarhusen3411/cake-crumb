// Customer phone numbers for the accounting book (acc_orders.phone) and the
// "payment pending" WhatsApp reminder built from them. Pure — no Firebase — so
// it can be checked straight from Node.

/**
 * A typed number as the 10-digit Indian mobile it stands for, '' when blank,
 * or null when it isn't one. Accepts spaces, dashes, a leading 0, +91 or 91.
 */
export function normalizePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return /^[6-9]\d{9}$/.test(d) ? d : null
}

/**
 * The reminder text. `orders` are this customer's unpaid orders, each
 * { orderNo, date (display), total (display) }; `owed` is their sum, already
 * formatted. Lists at most five orders so the message stays a message.
 */
export function reminderText(name, owed, orders) {
  const first = String(name || '').trim().split(/\s+/)[0] || 'there'
  const shown = orders.slice(0, 5)
  const lines = shown.map((o) => `• ${o.orderNo ? `${o.orderNo} · ` : ''}${o.date} · ${o.total}`)
  if (orders.length > shown.length) lines.push(`• …and ${orders.length - shown.length} more`)
  return [
    `Hello ${first}, this is Cake & Crumb 🧁`,
    '',
    `A gentle reminder that ${owed} is pending for ${orders.length === 1 ? 'your order' : 'your orders'}:`,
    ...lines,
    '',
    'You can pay by UPI or cash, whichever suits you. Thank you!',
  ].join('\n')
}

/** wa.me link to a 10-digit Indian number with the text filled in. */
export const waLink = (phone10, text) =>
  `https://wa.me/91${phone10}?text=${encodeURIComponent(text)}`
