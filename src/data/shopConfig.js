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
