// Single source of truth for shop-wide rules.
// Tweak these values to change behavior across cart + checkout pages.

export const MIN_ORDER_INR = 250
export const MAX_ITEM_QTY = 99

// ── Delivery pricing — distance-based (calculated behind the scenes) ──────────
// The rule:
//   • Self-pickup                → always free
//   • Home delivery ≤ 10 km      → FREE
//   • Home delivery > 10 km      → ₹5 × the FULL distance (not just the km past 10)
// e.g. 11.6 km → round(11.6 × 5) = ₹58; 24.8 km → ₹124.
// Distance is measured from the bakery (Plus Code MQ84+2GQ, Vaso 387380) to the
// customer's pincode, geocoded at checkout — see src/services/delivery.js. The km
// figure is NOT shown to the customer anywhere; only the resulting charge feeds
// the total, and the bakery sees the distance in the admin dashboard. Tune the two
// knobs below and every surface updates together.
export const DELIVERY = {
  freeRadiusKm: 10, // delivery is free within this many km of the bakery
  perKm: 6,         // ₹ per km on the FULL distance once past the free radius
  // Bakery origin — decoded from the Plus Code MQ84+2GQ, Vaso, Gujarat 387380.
  origin: { lat: 22.665087, lng: 72.756359 },
}

// The delivery charge for a method + distance. distanceKm === null means "not
// known yet" (e.g. address not geocoded) → treated as in-range/free, with the
// bakery confirming any charge for far areas. Pickup is always free.
export function deliveryFee(method = 'delivery', distanceKm = null) {
  if (method === 'pickup') return 0
  if (distanceKm == null || distanceKm <= DELIVERY.freeRadiusKm) return 0
  // Beyond the free radius, charge the full distance × rate (rounded to the rupee).
  return Math.round(distanceKm * DELIVERY.perKm)
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
