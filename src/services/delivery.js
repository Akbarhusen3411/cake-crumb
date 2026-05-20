// Distance-based delivery charge.
//
// Resolves an Indian pincode to lat/lng via the free OpenStreetMap Nominatim
// API, computes Haversine distance from the bakery in Vaso (Shia Masjid),
// and returns a charge based on a per-km rate that is intentionally NOT
// exposed in the UI. Falls back gracefully on any error.

// Approx coords for Shia Masjid, Vaso (Anand district, Gujarat).
// Adjust these if the precise location is different.
const ORIGIN_LAT = 22.5687
const ORIGIN_LNG = 72.9598

// ── Pricing knobs (private — don't surface in UI) ────────────────────────
const RATE_PER_KM   = 5    // INR per km of straight-line distance
const MIN_DELIVERY  = 30   // floor — never charge less than this
const MAX_DELIVERY  = 500  // sanity cap — never charge more than this

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371 // earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/**
 * Look up a 6-digit Indian pincode on Nominatim. Returns { lat, lng } or null.
 * Cached in-memory so repeated lookups for the same pincode don't hit the API.
 */
const cache = new Map()
export async function pincodeToCoords(pincode) {
  if (!/^\d{6}$/.test(pincode)) return null
  if (cache.has(pincode)) return cache.get(pincode)

  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?postalcode=${encodeURIComponent(pincode)}` +
      `&country=India&format=json&limit=1`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      cache.set(pincode, null)
      return null
    }
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) {
      cache.set(pincode, null)
      return null
    }
    const coords = { lat: Number(data[0].lat), lng: Number(data[0].lon) }
    cache.set(pincode, coords)
    return coords
  } catch {
    cache.set(pincode, null)
    return null
  }
}

/**
 * Compute the delivery charge for an Indian pincode.
 * Returns { km, charge } when the pincode resolves, or null when invalid.
 */
export async function computeDeliveryFromPincode(pincode) {
  const coords = await pincodeToCoords(pincode)
  if (!coords) return null
  const km = haversineKm(ORIGIN_LAT, ORIGIN_LNG, coords.lat, coords.lng)
  const raw = Math.ceil(km * RATE_PER_KM)
  const charge = Math.min(Math.max(raw, MIN_DELIVERY), MAX_DELIVERY)
  return { km: Math.round(km * 10) / 10, charge }
}
