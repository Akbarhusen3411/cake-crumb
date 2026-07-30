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

// A warm line to close the invoice on.
//
// Keep any replacement to one clause, under about 60 characters: it renders in
// Playfair italic at 1.08rem on a ~500px-wide sheet, which fits one line, and
// two lines here read as a paragraph rather than a sign-off. (It was Allura at
// 1.45rem, which capped it nearer 46 — the script was dropped because customers
// couldn't read the line through.)
//
// Written to sound like the baker rather than a brand: no "guaranteed", no
// exclamation marks, and no thank-you (the line directly below already says it,
// and hearing it twice makes both sound automatic). Each one points at the care
// that went in, not at the customer's wallet.
const QUOTES = [
  'Handmade, unhurried, and just for you.',
  'May this be the sweetest part of your day.',
  'Butter, sugar, and a good deal of love.',
  'Made in a small kitchen, with a full heart.',
  'Some things are worth the wait. This is one.',
  'Baked this morning — nothing here was rushed.',
  'From our kitchen to your table, with love.',
  'We hope it makes the moment a little sweeter.',
  'Sweetness delivered, happiness guaranteed.', // the bakery's own line, kept at the owner's request
]

/**
 * Picked from the order id, not at random — reprinting an invoice must produce
 * the identical document, and a quote that changed each time would make two
 * copies of the same bill look like two different bills.
 */
export function invoiceQuote(key) {
  return QUOTES[hash(key) % QUOTES.length]
}

/**
 * The line that closes the "your order is waiting on you" WhatsApp nudge.
 *
 * A separate pool from QUOTES because the two are doing opposite jobs: an
 * invoice quote signs off something finished, while this one has to pull a reply
 * out of someone who has gone quiet. So each of these leaves the sentence
 * unfinished on the customer's side — the oven is warm, the butter is out, and
 * the only missing thing is their word. Warm, never pushy: this goes to someone
 * who has already chosen to order, and guilt would be a poor thank-you.
 *
 * Keyed to the order like invoiceQuote, so a second nudge on the same order
 * reads as the same message rather than a new one.
 */
const PENDING_QUOTES = [
  'Every cake starts with a yes — we’re waiting on yours.',
  'Say the word, and the oven goes on. ♥',
  'The butter’s out and the oven’s warm — we’re only waiting on you.',
  'Your treats are one little message away.',
  'We’ve saved a place in the oven, just for you.',
  'Nothing’s baking until you say so — and we’d love to begin.',
  'One yes from you, and we start mixing. 🧁',
]

export function pendingQuote(key) {
  return PENDING_QUOTES[hash(key) % PENDING_QUOTES.length]
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
    // The book's own DDMMYY-NN handle, printed under the invoice number the same
    // way a website invoice carries its customer-facing order ID — so the sheet
    // in the customer's hand and the row in the book name the same order.
    reference: o?.orderNo || '',
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

  const method = p.method === 'deposit'
    // Same split payment either way; only the tense differs, and an unpaid
    // advance shouldn't read as one already handed over.
    ? (p.paid ? 'UPI advance + cash on delivery' : 'Advance then cash on delivery')
    : ({ upi: 'UPI', cod: 'Cash on delivery' }[p.method] || 'Cash on delivery')

  // `deposit` alone doesn't mean money arrived. A Checkout deposit order has the
  // advance paid (as claimed) and is genuinely part paid; a ChatBot one only has
  // the advance *required* — the bot can't take a payment — so it is still fully
  // unpaid, and printing "Part paid" on the customer's bill would be false.
  let statusLabel = 'Payment pending'
  if (p.method === 'deposit' && p.paid && deposit > 0) statusLabel = 'Part paid'
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
    paid: !!p.paid,
    statusLabel,
    methodLabel: method,
    balanceNote: p.method === 'deposit' && balance > 0
      ? (p.paid
        ? `Advance ${inr(deposit)} received · ${inr(balance)} due on delivery`
        : `Advance ${inr(deposit)} due before baking · ${inr(balance)} on delivery`)
      : '',
    fulfilment: [fulfilment, o?.deliveryDate].filter(Boolean).join(' · '),
    notes: o?.notes,
  }
}
