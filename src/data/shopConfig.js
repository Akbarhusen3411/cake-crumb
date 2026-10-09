// Single source of truth for shop-wide rules.
// Tweak these values to change behavior across cart + checkout pages.

// ── Delivery pricing — distance-based SLABS (calculated behind the scenes) ─────
// Self-pickup → always free. Home delivery is FREE within freeRadiusKm; beyond
// that it falls into a flat price band by distance. Slabs are used on purpose: a
// pincode covers an AREA (its geocoded point is only approximate), so a customer
// at 11 km or 19 km should pay the same clean fee rather than a falsely-precise
// per-km number. Distance is the straight-line km from the bakery (Plus Code
// MQ84+58, Vaso 387380) to the customer's pincode, geocoded — see
// src/services/delivery.js. The km is NEVER shown to the customer (only the
// resulting fee); the bakery sees the km in the admin dashboard and confirms /
// adjusts the final charge. Edit the bands below and every surface (checkout +
// ChatBot) updates together.
export const DELIVERY = {
  freeRadiusKm: 10, // delivery is free within this many km of the bakery
  // Flat fee by distance band. `maxKm` is each band's inclusive upper edge; the
  // first band whose maxKm ≥ distance wins. The last band (Infinity) is the
  // catch-all for very far orders. Ordered nearest → farthest.
  slabs: [
    { maxKm: 20, fee: 80 },   // 10–20 km
    { maxKm: 35, fee: 150 },  // 20–35 km
    { maxKm: 50, fee: 250 },  // 35–50 km
    { maxKm: 75, fee: 350 },  // 50–75 km
    { maxKm: 100, fee: 450 }, // 75–100 km
    { maxKm: Infinity, fee: 550 }, // 100 km+
  ],
  // Bakery origin — the pin of the bakery's own Google Maps listing (Plus Code
  // MQ84+58, Vaso, Gujarat 387380). It was MQ84+2GQ, ~60m off. The footer map,
  // the "open in Maps" links and the JSON-LD geo in index.html all use it.
  origin: { lat: 22.6654339, lng: 72.7558635 },
}

// ── Address + map — one copy for every surface that prints it ────────────────
// Printed in the owner's own order ("386, Zahir Manzil, Venipura, …"), deliberately not the
// order Google Maps lists it in. Footer, Contact, invoice, ChatBot, the admin
// pickup message and the policy pages all read these, so they can't drift.
export const BAKERY_ADDRESS = {
  street: '386, Zahir Manzil, Venipura, Mominvad, Near Police Station',
  locality: 'Vaso, Kheda, Gujarat-387380, India',
  full: '386, Zahir Manzil, Venipura, Mominvad, Near Police Station, Vaso, Kheda, Gujarat-387380, India',
}
// Opens the bakery's Google Maps LISTING (name, reviews, directions) by its CID
// rather than a bare coordinate pin. The CID is the second half of the listing's
// `0x…:0x2e921bc7422f4c06` id, written in decimal.
export const MAP_LINK = 'https://maps.google.com/?cid=3355775214967278598'
// What the Google Business Profile QR (public/google-qr.png) encodes, decoded
// from the PDF Google issued — the same listing as MAP_LINK, by place id.
// Regenerating the QR in the profile means re-exporting that image too.
export const GOOGLE_PROFILE_LINK = 'https://local.google.com/place?placeid=ChIJy73gGoNZXjkRBkwvQscbki4'
// Same place id, straight into Google's write-a-review box.
export const GOOGLE_REVIEW_LINK = 'https://search.google.com/local/writereview?placeid=ChIJy73gGoNZXjkRBkwvQscbki4'
// Keyless embed of the same pin. www.google.com is already in the CSP's
// frame-src (vite.config.js) — any other host here is blocked in production only.
export const MAP_EMBED = `https://www.google.com/maps?q=${DELIVERY.origin.lat},${DELIVERY.origin.lng}&z=16&output=embed`

// The delivery charge for a method + distance. distanceKm === null means "not
// known yet" (e.g. address not geocoded) → treated as in-range/free, with the
// bakery confirming any charge for far areas. Pickup is always free.
export function deliveryFee(method = 'delivery', distanceKm = null) {
  if (method === 'pickup') return 0
  if (distanceKm == null || distanceKm <= DELIVERY.freeRadiusKm) return 0
  // First band whose upper edge covers the distance (last band is Infinity).
  const band = DELIVERY.slabs.find((s) => distanceKm <= s.maxKm)
  return band ? band.fee : DELIVERY.slabs[DELIVERY.slabs.length - 1].fee
}

// ── Fraud protection — advance deposit + COD cap ──────────────────────────────
// A large Cash-on-Delivery order is the main fraud risk: a fake address + a
// no-show means the bakery eats the whole ingredient + delivery cost. These
// two knobs move that risk back onto the customer *before* baking starts:
//   • BULK_ORDER_MIN — at/above this SUBTOTAL an order is "bulk": full unpaid COD
//     is removed and the customer must pay a deposit now (UPI) or pay in full.
//   • DEPOSIT_PCT    — the bulk deposit, as a fraction of the order TOTAL. The
//     balance (total − deposit) is collected on pickup / delivery.
//   Once an order is bulk, plain COD is gone: its only choices are deposit-now
//   or pay-in-full.
// There is still no server/auth (see CLAUDE.md), so the deposit is enforced the
// same way UPI already is: the customer *claims* they paid and the bakery
// verifies the credit in its bank (admin dashboard) before confirming.
export const BULK_ORDER_MIN = 1000 // subtotal ≥ this ⇒ bulk order (deposit required)
export const DEPOSIT_PCT = 0.5     // bulk deposit = 50% of the order total

// Is this cart a "bulk" order that requires an advance? (subtotal-based)
export function isBulkOrder(subtotal = 0) {
  return Number(subtotal) >= BULK_ORDER_MIN
}

// The advance a bulk order pays now (rounded to the rupee); balance = total − this.
export function depositAmount(total = 0) {
  return Math.round(Number(total) * DEPOSIT_PCT)
}
