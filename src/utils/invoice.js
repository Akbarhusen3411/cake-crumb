import { inr } from '../data/format.js'

// Crockford-style alphabet, same idea as services/orderId.js: no 0/O/1/I, so a
// number read aloud over the phone can't be mistyped back.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ'

// djb2 — a stable hash of the Firestore doc id.
function hash(str) {
  let h = 5381
  const s = String(str || '')
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0
  return h
}

/**
 * A stable, human invoice number derived from the order — deliberately NOT a
 * counter. A per-day localStorage counter is exactly what once gave two
 * customers the same storefront order ID (every device counted from 0001).
 * Deriving from the doc id means the same order shows the same number on every
 * device, forever, with no extra Firestore write and nothing to keep in sync.
 *
 * CC-INV-DDMMYY-XXXX
 */
export function invoiceNumber(order) {
  const parts = String(order?.date || '').slice(0, 10).split('-') // YYYY-MM-DD
  const stamp = parts.length === 3 ? `${parts[2]}${parts[1]}${parts[0].slice(2)}` : '000000'
  const h = hash(order?.id)
  let suffix = ''
  for (let i = 0; i < 4; i++) suffix += ALPHABET[(h >>> (i * 5)) % ALPHABET.length]
  return `CC-INV-${stamp}-${suffix}`
}

// A warm line to close the invoice on. Kept short — it sits under the total in
// script type, so anything longer than a breath reads as filler.
const QUOTES = [
  'May your day be as sweet as what’s inside.',
  'Baked by hand this morning, just for you.',
  'Life is short — eat the cake first.',
  'Made with butter, sugar and a little love.',
  'Every crumb, made for your happiest moments.',
  'Good things take time. This took a whole morning.',
  'Sweetness delivered, happiness guaranteed.',
]

/**
 * Picked from the order id, not at random — reprinting an invoice must produce
 * the identical document, and a quote that changed each time would make two
 * copies of the same bill look like two different bills.
 */
export function invoiceQuote(key) {
  return QUOTES[hash(key) % QUOTES.length]
}

// ───────────────────── builders ─────────────────────
//
// InvoiceModal renders one normalised shape; each admin page adapts its own
// order into it. The two sources hold very different things — an accounting
// order is a walk-in with just a name, a website order carries phone, address,
// delivery and a split payment — and keeping the adapting here means the
// component never has to branch on which page it was opened from.

/** A manual/walk-in order from the accounting book. */
export function buildAccountingInvoice(o, { lines, total }) {
  return {
    number: invoiceNumber(o),
    quoteKey: o?.id,
    date: o?.date,
    customer: { name: o?.customer },
    lines,
    total,
    paid: !!o?.paid,
    statusLabel: o?.paid ? 'Paid' : 'Payment pending',
    methodLabel: o?.method,
    notes: o?.notes,
  }
}

/**
 * A customer order placed through the website or the chat bot.
 *
 * `deliveryKm` is deliberately absent: the distance is bakery-side only and is
 * kept out of every customer-facing surface (the WhatsApp receipt, the public
 * tracking mirror). An invoice is handed to the customer, so it stays out here
 * too — see the delivery notes in CLAUDE.md.
 */
export function buildWebsiteInvoice(o) {
  const p = o?.payment || {}
  const t = o?.totals || {}
  const deposit = Number(p.depositAmount) || 0
  const balance = Number(p.balanceDue) || 0

  const method = {
    upi: 'UPI',
    deposit: 'UPI advance + cash on delivery',
    cod: 'Cash on delivery',
  }[p.method] || 'Cash on delivery'

  let statusLabel = 'Payment pending'
  if (p.method === 'deposit' && deposit > 0) statusLabel = 'Part paid'
  else if (p.paid) statusLabel = 'Paid'

  const fulfilment = o?.deliveryMethod === 'pickup' ? 'Self-pickup'
    : o?.deliveryMethod === 'delivery' ? 'Home delivery' : ''

  return {
    number: invoiceNumber({ id: o?.firebaseId || o?.orderId, date: o?.createdAt }),
    reference: o?.orderId,
    quoteKey: o?.orderId,
    date: o?.createdAt,
    customer: {
      name: o?.customer?.name,
      phone: o?.customer?.phone,
      address: [o?.customer?.address, o?.customer?.city, o?.customer?.pincode].filter(Boolean).join(', '),
    },
    lines: (o?.items || []).map((it) => ({
      label: it.name,
      qty: Number(it.qty) || 1,
      rate: Number(it.price) || 0,
      amount: Math.round((Number(it.price) || 0) * (Number(it.qty) || 1)),
    })),
    subtotal: Number(t.subtotal) || 0,
    delivery: Number(t.delivery) || 0,
    total: Number(t.total) || 0,
    paid: p.method === 'deposit' ? deposit > 0 : !!p.paid,
    statusLabel,
    methodLabel: method,
    balanceNote: p.method === 'deposit' && balance > 0
      ? `Advance ${inr(deposit)} received · ${inr(balance)} due on delivery`
      : '',
    fulfilment: [fulfilment, o?.deliveryDate].filter(Boolean).join(' · '),
    notes: o?.notes,
  }
}
