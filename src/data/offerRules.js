// Offer RULES — the small, always-loaded half of the offers (switches, dates,
// the clock, the cart's minimum check). Split out of offers.js in Oct 2026 so
// CartContext, the header, footer and banners don't pull every offer's
// wording, the /offers pickers and the gift logic into the first download.
// offers.js re-exports all of this, so importing from either works; eager
// code should import from HERE.
//
// The Diwali 2026 offers (gift tiers, price packs, the gift box's 10% off)
// were removed on 12 Nov 2026 at the owner's request — see git history
// (commit a489502 and before) if a seasonal offer is wanted again.

// Master switch: false hides the Home band, the cart gift card and the receipt
// line, and /offers says there are none running. Nothing else needs touching.
export const OFFERS_ON = true

// The seven everyday offers (Mid-Month, Gift Box Pair, Cheesecake Lover, Tub
// Lover, Tub & Sip, Cookie Dozen, Big Basket). Off since 28 Oct 2026 by the
// owner's choice; true brings them all back.
export const EVERYDAY_ON = false

export const OFFER_RULES = {
  // Day-of-month window, inclusive: on from 00:00 on the 13th to 23:59 on the
  // 20th, by the visitor's own clock. Outside it the offer is hidden entirely.
  midMonth: { fromDay: 13, toDay: 20, min: 499 },
  bigBasketMin: 1500, // subtotal, before delivery
  // Tub Lover: the gift grows with the number of cheesecake tubs. Each
  // tier's value (menu price of the gift) decides it against other offers.
  tubTiers: [
    { min: 2, gift: '3 cake pops', value: 45 },
    { min: 5, gift: '5 cake pops', value: 75 },
  ],
}

/**
 * What in a cart can't be ordered as it stands: a line under its minimum
 * (1 cupcake, where the bakery bakes 2 or more). Cart and Checkout show it
 * (CartIssues.jsx); Checkout refuses to place it.
 */
export function cartProblems(items = []) {
  const belowMin = items.filter((it) => it.qty < Math.max(1, Number(it.minQty) || 1))
  return { belowMin, any: belowMin.length > 0 }
}

/** 13 → "13th", 21 → "21st". */
export const ordinal = (n) => {
  const t = n % 100
  if (t >= 11 && t <= 13) return `${n}th`
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`
}
// ── The clock every offer reads ───────────────────────────────────────────────
// Normally just `new Date()`. On the DEV server only, `?testdate=2026-10-15`
// (or a full `2026-10-20T23:58`) pretends it is that moment for this tab, so
// the Mid-Month switch-over can be checked before it happens; `?testdate=off`
// clears it. It is compiled out of the production build — on the live site a
// customer must not be able to fake a date and unlock a gift.
const TESTDATE_KEY = 'cc_offer_testdate'

export function offerNow() {
  if (!import.meta.env?.DEV) return new Date()
  try {
    const param = new URLSearchParams(window.location.search).get('testdate')
    if (param === 'off') sessionStorage.removeItem(TESTDATE_KEY)
    else if (param) sessionStorage.setItem(TESTDATE_KEY, param)
    const stored = sessionStorage.getItem(TESTDATE_KEY)
    if (!stored) return new Date()
    // A bare date keeps today's time of day, so countdowns still read sensibly.
    const real = new Date()
    const [d, t] = stored.split('T')
    const [y, m, day] = d.split('-').map(Number)
    const [hh, mm] = t ? t.split(':').map(Number) : [real.getHours(), real.getMinutes()]
    const fake = new Date(y, m - 1, day, hh, mm)
    return Number.isNaN(fake.getTime()) ? real : fake
  } catch {
    return new Date()
  }
}

/**
 * Is any offer running now? Gates every offer surface, so none shows empty.
 * Worked out from the switches alone (no offer list needed): the everyday set
 * always has offers beyond Mid-Month. Must agree with
 * activeOffers(now).length > 0 in offers.js.
 */
export const offersLive = () => OFFERS_ON && EVERYDAY_ON

/** "2026-10" — which month's window it is; what the pop-up remembers it showed. */
export function midMonthKey(now = offerNow()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// ── Mid-month window ──────────────────────────────────────────────────────────

/** { live, from, to } — this month's window if it's running or still to come, else next month's. Dates are local. */
export function midMonthWindow(now = offerNow()) {
  const { fromDay, toDay } = OFFER_RULES.midMonth
  const day = now.getDate()
  const monthOffset = day > toDay ? 1 : 0
  const from = new Date(now.getFullYear(), now.getMonth() + monthOffset, fromDay)
  const to = new Date(now.getFullYear(), now.getMonth() + monthOffset, toDay)
  return { live: day >= fromDay && day <= toDay, from, to }
}

/** Whole days from today to `date` (local midnight to local midnight). */
export function daysUntil(date, now = offerNow()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - today) / 86400000)
}
