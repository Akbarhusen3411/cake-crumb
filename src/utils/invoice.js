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
export function invoiceQuote(order) {
  return QUOTES[hash(order?.id) % QUOTES.length]
}
