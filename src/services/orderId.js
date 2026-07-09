// Generate an order ID like CC-AB-080526-K7QM.
// - Initials: first letters of customer name (defaults to "CC" if empty).
// - DDMMYY: today's date.
// - XXXX: 4 random chars — collision-resistant and unguessable.
//
// This was a 4-digit *per-device* localStorage counter, which was broken two ways.
// It never gave the bakery a real sequence (every device counted from 0001
// independently), and because almost every customer orders once, nearly every first
// order of the day was `-0001`. Two same-day customers whose names share initials
// ("Amit Singh" / "Akbar Shaikh" → AS) produced the *same ID*, and the public
// `tracking/{orderId}` doc is written with setDoc — keyed by the ID — so their
// tracking records collided.
//
// Random chars also make IDs unguessable, which matters because `tracking` is
// world-readable and world-creatable (see FIREBASE_SETUP.md): a sequential ID can be
// enumerated, or pre-created with a forged status before the real order lands.

// Crockford-style alphabet: no 0/O/1/I, so an ID read aloud over WhatsApp or the
// phone can't be transcribed wrong. Uppercase only — TrackOrder upper-cases input.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
// 5 chars = 31^5 ≈ 28.6M per (initials, day) bucket. Collisions only matter inside a
// bucket, and a bucket is a handful of orders, so the birthday risk is negligible.
const SUFFIX_LEN = 5

// Uniform pick from ALPHABET. 256 isn't divisible by 31, so reject the tail bytes
// instead of taking `% 31` and biasing the early letters.
const LIMIT = Math.floor(256 / ALPHABET.length) * ALPHABET.length

function randomSuffix() {
  const out = []
  const c = globalThis.crypto
  if (c?.getRandomValues) {
    const buf = new Uint8Array(SUFFIX_LEN * 2)
    while (out.length < SUFFIX_LEN) {
      c.getRandomValues(buf)
      for (const b of buf) {
        if (out.length === SUFFIX_LEN) break
        if (b < LIMIT) out.push(ALPHABET[b % ALPHABET.length])
      }
    }
  } else {
    // Ancient or locked-down browser — weaker, but still ~923k combinations.
    while (out.length < SUFFIX_LEN) {
      out.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)])
    }
  }
  return out.join('')
}

export function generateOrderId(name = '') {
  const initials =
    (name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2) || 'CC').toUpperCase()

  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  const dateKey = `${dd}${mm}${yy}`

  return `CC-${initials}-${dateKey}-${randomSuffix()}`
}
