// Distance-based delivery — geocoding half.
//
// Resolves an Indian pincode to lat/lng via the free OpenStreetMap Nominatim
// API and returns the straight-line (Haversine) distance in km from the bakery.
// The charge itself lives in one place — deliveryFee() in src/data/shopConfig.js
// — so this module only answers "how far away is this pincode?". Fails soft:
// returns null on any error, and the caller treats null as in-range/free with
// the bakery confirming far orders on WhatsApp.

import { DELIVERY } from '../data/shopConfig.js'

const ORIGIN = DELIVERY.origin // decoded from Plus Code MQ84+2GQ, Vaso 387380

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
 * Straight-line distance in km from the bakery to an Indian pincode.
 * Returns a number (rounded to 0.1 km) when the pincode resolves, or null.
 */
export async function kmFromBakeryByPincode(pincode) {
  const coords = await pincodeToCoords(pincode)
  if (!coords) return null
  const km = haversineKm(ORIGIN.lat, ORIGIN.lng, coords.lat, coords.lng)
  return Math.round(km * 10) / 10
}
