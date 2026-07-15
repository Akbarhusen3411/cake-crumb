// Single source of truth for shop-wide rules.
// Tweak these values to change behavior across cart + checkout pages.

export const MIN_ORDER_INR = 250
export const MAX_ITEM_QTY = 99

// ── Delivery pricing — distance-based SLABS (calculated behind the scenes) ─────
// Self-pickup → always free. Home delivery is FREE within freeRadiusKm; beyond
// that it falls into a flat price band by distance. Slabs are used on purpose: a
// pincode covers an AREA (its geocoded point is only approximate), so a customer
// at 11 km or 19 km should pay the same clean fee rather than a falsely-precise
// per-km number. Distance is the straight-line km from the bakery (Plus Code
// MQ84+2GQ, Vaso 387380) to the customer's pincode, geocoded — see
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
  // Bakery origin — decoded from the Plus Code MQ84+2GQ, Vaso, Gujarat 387380.
  origin: { lat: 22.665087, lng: 72.756359 },
}

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
// three knobs move that risk back onto the customer *before* baking starts:
//   • BULK_ORDER_MIN — at/above this SUBTOTAL an order is "bulk": full unpaid COD
//     is removed and the customer must pay a deposit now (UPI) or pay in full.
//   • DEPOSIT_PCT    — the bulk deposit, as a fraction of the order TOTAL. The
//     balance (total − deposit) is collected on pickup / delivery.
//   • COD_MAX_INR    — subtotal above which plain "Cash on Delivery" disappears
//     entirely. Kept equal to BULK_ORDER_MIN so the two rules line up: once an
//     order is bulk, its only choices are deposit-now or pay-in-full.
// There is still no server/auth (see CLAUDE.md), so the deposit is enforced the
// same way UPI already is: the customer *claims* they paid and the bakery
// verifies the credit in its bank (admin dashboard) before confirming.
export const BULK_ORDER_MIN = 1000 // subtotal ≥ this ⇒ bulk order (deposit required)
export const DEPOSIT_PCT = 0.5     // bulk deposit = 50% of the order total
export const COD_MAX_INR = 1000    // subtotal > this ⇒ no plain Cash on Delivery

// Is this cart a "bulk" order that requires an advance? (subtotal-based)
export function isBulkOrder(subtotal = 0) {
  return Number(subtotal) >= BULK_ORDER_MIN
}

// Is plain full-unpaid Cash on Delivery allowed for this subtotal?
export function isCodAllowed(subtotal = 0) {
  return Number(subtotal) <= COD_MAX_INR && !isBulkOrder(subtotal)
}

// The advance a bulk order pays now (rounded to the rupee); balance = total − this.
export function depositAmount(total = 0) {
  return Math.round(Number(total) * DEPOSIT_PCT)
}
