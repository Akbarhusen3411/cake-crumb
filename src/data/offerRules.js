// Offer RULES — the small, always-loaded half of the offers (dates, pack
// prices, the cart's pack roll-up, the clock). Split out of offers.js in
// Oct 2026 so CartContext, the header, footer and banners don't pull every
// offer's wording, the /offers pickers and the gift logic into the first
// download. offers.js re-exports all of this, so importing from either works;
// eager code should import from HERE.

import { shopProducts, isPerPiece } from './products.js'
import { isDiwaliPreview } from './festivals.js'

// Master switch: false hides the Home band, the cart gift card and the receipt
// line, and /offers says there are none running. Nothing else needs touching.
export const OFFERS_ON = true

// The seven everyday offers (Mid-Month, Gift Box Pair, Cheesecake Lover, Tub
// Lover, Tub & Sip, Cookie Dozen, Big Basket). Off since 28 Oct 2026 by the
// owner's choice; true brings them all back. Seasonal offers (Diwali) run on
// their own dates either way.
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
  // Diwali: on from 00:00 on 5 Nov to 23:59 on 15 Nov, by the visitor's clock
  // — the same days as the Diwali banner and welcome screen (festivals.js,
  // DiwaliWelcome.jsx); change all three together. Values are menu value
  // (₹15 a cake pop, ~₹25 a cupcake, ₹100–120 a tub) and decide the gift.
  diwali: { month: 11, fromDay: 5, toDay: 15 },
  diwaliTubTiers: [
    { min: 2, gift: '3 cake pops', value: 45 },
    { min: 3, gift: '4 cake pops', value: 60 },
    { min: 4, gift: '2 cupcakes + 2 cake pops', value: 80 },
    { min: 6, gift: '1 extra cheesecake tub', value: 120 },
  ],
  diwaliSpongeTiers: [
    { min: 1, gift: '4 cake pops', value: 60 },
    { min: 2, gift: '1 sponge cake tub + 3 cake pops', value: 145 },
  ],
}

// The Diwali dates and pack prices AS WORDS, for copy — worked out from
// OFFER_RULES.diwali and the pack tables, so a date or price change can't
// leave "5 – 15 Nov" or "₹239" behind in a sentence. (Filled in below the
// pack tables.)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DM = MONTHS[OFFER_RULES.diwali.month - 1]
export const DIWALI_DATES = {
  range: `${OFFER_RULES.diwali.fromDay} – ${OFFER_RULES.diwali.toDay} ${DM}`,   // "5 – 15 Nov"
  short: `${OFFER_RULES.diwali.fromDay}–${OFFER_RULES.diwali.toDay} ${DM}`,     // "5–15 Nov"
  opens: `Opens ${OFFER_RULES.diwali.fromDay} ${DM}`,                           // "Opens 5 Nov"
}

// ── Diwali price packs (5–15 Nov) ──
// Unlike every other offer these MOVE A PRICE — but only as their own cart
// lines at their own price ("Red Velvet Cupcakes (Diwali pack of 10)" ₹289),
// exactly like a product tier. No total is recomputed anywhere, so the
// five-places rule isn't engaged: cart, checkout, receipt, invoice and the
// UPI amount just add up the lines as always. `was` is the same pieces at
// the per-piece price, shown struck through.
//   • Packs of 10 — the owner's prices, by product id. (A "box of 8 for the
//     box-of-6 price" was tried and dropped: it undercut the packs of 10.)
// Pack lines can only be ADDED inside the real window (never in a preview),
// and Checkout refuses an order still holding one after it closes.
// 10 at the per-piece price, then a round-ish Diwali price ending in 9:
//   ₹25 cupcakes   250 → 239   (Vanilla, Sprinkle)
//   ₹28 cupcakes   280 → 269   (Chocolate, Nutella, Strawberry)
//   ₹30 cupcakes   300 → 289   (Red Velvet, Biscoff — was 279 until 28 Oct)
//   ₹35 cupcake    350 → 329   (Pistachio)
//   ₹15 cake pops  150 → 139   (Chocolate, Vanilla, Red Velvet)
// 239 / 289 / 329 / 139 are the owner's figures; 269 follows the same step.
export const DIWALI_PACK10 = {
  'cup-vanilla': 239,
  'cup-sprinkle': 239,
  'cup-chocolate': 269,
  'cup-nutella': 269,
  'cup-strawberry': 269,
  'cup-redvelvet': 289,
  'cup-biscoff': 289,
  'cup-pistachio': 329,
  'bk-cakepop-chocolate': 139,
  'bk-cakepop-vanilla': 139,
  'bk-cakepop-redvelvet': 139,
}
// Two boxes of the box-only Variety Cupcakes (₹180 each): 360 → 339, the
// owner's figure. Box-only products by id → the price of TWO boxes.
export const DIWALI_PACK2 = {
  'cup-variety': 339,
}
// Single items at a percentage off for Diwali — product id → % off. The price
// is worked out from products.js (rounded down to whole rupees), so a price
// change follows: the gift box ₹1,600 → ₹1,440 (owner's ask, 29 Oct 2026).
// Same shape as the packs: its own cart line (<id>-d1, "(Diwali price)").
export const DIWALI_PCT_OFF = {
  'sg-birthday-box': 10,
}
/** The Diwali price of a DIWALI_PCT_OFF product, or null. */
export const diwaliOffPrice = (p) =>
  p && DIWALI_PCT_OFF[p.id] ? Math.floor((p.price * (100 - DIWALI_PCT_OFF[p.id])) / 100) : null

/** Is this cart line a Diwali pack? (ids end -d1 / -d2 / -d10; -d1 is a single
 *  item at its Diwali price; -d8 was the dropped box of 8, still matched so an
 *  old cart line is caught.) */
export const isDiwaliPackId = (id) => /-d(1|2|8|10)$/.test(String(id || ''))

const byId = (id) => shopProducts.find((p) => p.id === id)

/** Lowest pack prices, for copy: { cupcakes10, cakePops10, variety2, from }. */
export const DIWALI_FROM = (() => {
  const lo = (pred) => Math.min(...Object.entries(DIWALI_PACK10).filter(([id]) => pred(id)).map(([, v]) => v))
  const cupcakes10 = lo((id) => id.startsWith('cup-'))
  const cakePops10 = lo((id) => id.startsWith('bk-cakepop'))
  const variety2 = DIWALI_PACK2['cup-variety']
  return { cupcakes10, cakePops10, variety2, from: Math.min(cupcakes10, cakePops10, variety2) }
})()

/** The cart line for one Diwali pack of 10 — the one shape every add path uses. */
export function pack10Line(p) {
  return { id: `${p.id}-d10`, name: `${p.name} (Diwali pack of 10)`, price: DIWALI_PACK10[p.id], img: p.img }
}

// The pack a product's BASE line rolls up into: 10 loose cupcakes / cake pops,
// or 2 Variety boxes. Only on the REAL Diwali dates — a ?diwali=preview tab
// must never produce a real order at pack prices.
function packRule(p) {
  if (!p) return null
  if (DIWALI_PACK10[p.id] && isPerPiece(p)) return { size: 10, price: DIWALI_PACK10[p.id], line: pack10Line(p), label: 'pack of 10', unit: 'pieces' }
  if (DIWALI_PACK2[p.id]) return { size: 2, price: DIWALI_PACK2[p.id], line: pack2Line(p), label: 'pack of 2 boxes', unit: 'boxes' }
  if (DIWALI_PCT_OFF[p.id]) return { size: 1, price: diwaliOffPrice(p), line: price1Line(p), label: `${DIWALI_PCT_OFF[p.id]}% off`, unit: 'box' }
  return null
}
/** The cart line for one item at its Diwali % off (the gift box). */
export function price1Line(p) {
  return { id: `${p.id}-d1`, name: `${p.name} (Diwali price)`, price: diwaliOffPrice(p), img: p.img }
}
/** The cart line for the Diwali "2 boxes" pack (Variety). */
export function pack2Line(p) {
  return { id: `${p.id}-d2`, name: `${p.name.replace(/\s*\(Box of 6\)$/, '')} (Diwali 2 boxes of 6)`, price: DIWALI_PACK2[p.id], img: p.img }
}
/** { total, regular, packs, label } for `qty` of `p`'s base line right now. */
export function piecesPrice(p, qty, now = offerNow()) {
  const n = Math.max(0, Number(qty) || 0)
  const regular = (Number(p?.price) || 0) * n
  const rule = packRule(p)
  if (!OFFERS_ON || !rule || !diwaliWindow(now, true).live) return { total: regular, regular, packs: 0 }
  const packs = Math.floor(n / rule.size)
  return { total: packs * rule.price + (n % rule.size) * p.price, regular, packs, label: rule.label, single: rule.size === 1 }
}

/** "Add N more for the Diwali pack" — once at least half a pack is chosen. Real dates only. */
export function packNudge(p, qty, now = offerNow()) {
  const rule = packRule(p)
  if (!OFFERS_ON || !rule || !diwaliWindow(now, true).live) return null
  const r = (Number(qty) || 0) % rule.size
  return r && r >= rule.size / 2 ? { need: rule.size - r, price: rule.price, size: rule.size, unit: rule.unit } : null
}

/**
 * The cart's rule from 5 to 15 Nov: a base line (the product's own id at its
 * own price) holding a full pack becomes pack lines + the rest — 10 Vanilla
 * (added one by one or as "Add 10") bill as one ₹239 pack, 12 as a pack + 2,
 * and 2 Variety boxes as the ₹339 pair. Returns the SAME array when nothing changes. Called by
 * CartContext on every add / increment and on load.
 */
export function applyDiwaliPacks(items, now = offerNow()) {
  if (!OFFERS_ON || !Array.isArray(items) || !diwaliWindow(now, true).live) return items
  let out = items
  const ids = [...new Set(items.map((it) => String(it.id).replace(/-slice$/, '')))]
  for (const id of ids) {
    const p = byId(id)
    const rule = packRule(p)
    if (!rule) continue
    const loose = out.find((x) => x.id === p.id && Number(x.price) === p.price)
    const L = loose?.qty || 0
    if (rule.size !== 10) {
      // 2 Variety boxes → the pair, the rest stays a box; a gift box → its Diwali-price line.
      if (L < rule.size) continue
      out = setQty(out, loose, L % rule.size)
      out = addPack(out, rule.line, Math.floor(L / rule.size))
      continue
    }
    const box = hasBox6(p) ? out.find((x) => x.id === `${p.id}-slice` && Number(x.price) === p.slice) : null
    const B = box?.qty || 0
    const best = bestPacking(p, L, B)
    if (!best.packs) continue
    out = setQty(out, loose || baseLine(p), best.loose)
    if (hasBox6(p)) out = setQty(out, box || boxLine(p), best.boxes)
    out = addPack(out, rule.line, best.packs)
  }
  return out
}

// ── helpers for the roll-up ──
const hasBox6 = (p) => p?.sliceLabel === 'Box of 6' && p.slice != null
const baseLine = (p) => ({ id: p.id, name: `${p.name} (${p.sizeLabel || 'Whole'})`, price: p.price, img: p.img, qty: 0, minQty: Math.max(1, Number(p.minQty) || 1) })
const boxLine = (p) => ({ id: `${p.id}-slice`, name: `${p.name} (${p.sliceLabel})`, price: p.slice, img: p.img, qty: 0, minQty: 1 })
/** Set a line's qty (adding it if new, dropping it at 0). Same array when unchanged. */
function setQty(list, line, qty) {
  const i = list.findIndex((x) => x.id === line.id)
  if (i < 0) return qty > 0 ? [...list, { ...line, qty }] : list
  if (list[i].qty === qty) return list
  return qty > 0 ? list.map((x, j) => (j === i ? { ...x, qty } : x)) : list.filter((_, j) => j !== i)
}
function addPack(list, line, n) {
  const i = list.findIndex((x) => x.id === line.id)
  return i >= 0 ? list.map((x, j) => (j === i ? { ...x, qty: x.qty + n } : x)) : [...list, { ...line, qty: n, minQty: 1 }]
}
/**
 * The cheapest way to sell L loose pieces + B boxes of 6 of a 10-pack product:
 * k packs of 10, then the rest as boxes and/or pieces. Only a STRICTLY cheaper
 * mix replaces what's in the cart (ties keep the customer's own choice).
 * Owner's call, Oct 2026: boxes count too — 2 Vanilla boxes (₹300) become a
 * pack + 2 (₹289), 1 box + 4 pieces (₹250) a pack (₹239).
 */
export function bestPacking(p, L, B) {
  const rule = packRule(p)
  const pp = p.price
  const bp = hasBox6(p) ? p.slice : Infinity
  let best = { packs: 0, boxes: B, loose: L, cost: L * pp + B * (B ? bp : 0) }
  if (!rule || rule.size !== 10) return best
  const N = L + 6 * B
  for (let k = 1; k * 10 <= N; k++) {
    const r = N - 10 * k
    for (let b = 0; b * 6 <= r && (b === 0 || bp !== Infinity); b++) {
      const cost = k * rule.price + b * (b ? bp : 0) + (r - 6 * b) * pp
      if (cost < best.cost) best = { packs: k, boxes: b, loose: r - 6 * b, cost }
    }
  }
  return best
}
/** What `n` boxes of 6 cost right now — the quick view's box-tier total. */
export function boxesPrice(p, n, now = offerNow()) {
  const regular = (Number(p?.slice) || 0) * n
  if (!OFFERS_ON || !hasBox6(p) || !packRule(p) || !diwaliWindow(now, true).live) return { total: regular, regular, packs: 0 }
  const best = bestPacking(p, 0, n)
  return best.packs ? { total: best.cost, regular, packs: best.packs, label: 'pack of 10' } : { total: regular, regular, packs: 0 }
}

/**
 * What in a cart can't be ordered as it stands (real calendar):
 *  - `expired`: Diwali pack lines outside 5–15 Nov (they carry the pack price);
 *  - `belowMin`: a loose line under its minimum (1 cupcake) — allowed only
 *    beside a pack of the same product (11 cupcakes = a pack + 1 is fine).
 * Cart and Checkout show it (CartIssues.jsx); Checkout refuses to place it.
 */
/**
 * After 5–15 Nov: turn each Diwali pack line back into the same pieces at the
 * regular price — 10 loose cupcakes / cake pops, or 2 boxes — merged into any
 * line of that size already in the cart. "Remove packs" used to delete them,
 * so a cart of 12 Vanilla saved during Diwali came back as 2.
 * A pack whose product no longer exists is dropped. Same array if no pack.
 */
export function unpackExpiredPacks(items = [], now = offerNow()) {
  if (diwaliWindow(now, true).live || !items.some((it) => isDiwaliPackId(it.id))) return items
  let out = items.filter((it) => !isDiwaliPackId(it.id))
  for (const it of items) {
    const m = String(it.id).match(/^(.*)-d(1|2|8|10)$/)
    if (!m) continue
    const p = byId(m[1])
    if (!p) continue
    const packs = Math.max(1, Number(it.qty) || 1)
    let line, per
    if (m[2] === '1') {
      // one item at its Diwali price → the same item at the regular price
      line = { id: p.id, name: p.name, price: p.price, img: p.img, qty: 0, minQty: 1 }
      per = 1
    } else if (m[2] === '2') {
      // 2 boxes of 6: the box line (Variety is box-only, sold as the product itself)
      line = p.slice != null ? boxLine(p) : { id: p.id, name: p.name, price: p.price, img: p.img, qty: 0, minQty: 1 }
      per = 2
    } else {
      line = baseLine(p)
      per = Number(m[2]) // 10 pieces (or the retired box of 8)
    }
    const have = out.find((x) => x.id === line.id)?.qty || 0
    out = setQty(out, line, have + per * packs)
  }
  return out
}

export function cartProblems(items = [], now = offerNow()) {
  const live = diwaliWindow(now, true).live
  const expired = live ? [] : items.filter((it) => isDiwaliPackId(it.id))
  const belowMin = items.filter((it) => {
    const min = Math.max(1, Number(it.minQty) || 1)
    if (it.qty >= min) return false
    return !items.some((x) => x.id === `${it.id}-d10` || x.id === `${it.id}-d2`)
  })
  return { expired, belowMin, any: expired.length > 0 || belowMin.length > 0 }
}

/**
 * The ChatBot's version of applyDiwaliPacks. The bot keeps its own cart as
 * [name, { qty, price }] entries named "<product> — <size>" (or the bare
 * product name for a one-price item like Variety), so the same 10 Vanilla
 * cost ₹239 there as on the website, and 2 Variety boxes ₹339. Real dates
 * only. Pack entries carry `cat` = the source entry's name, so the receipt
 * can still group them under the right category.
 */
export function chatbotPacks(entries, now = offerNow()) {
  if (!OFFERS_ON || !Array.isArray(entries) || !diwaliWindow(now, true).live) return entries
  const split = (name) => {
    const m = name.match(/^(.*?)\s+—\s+(.+)$/)
    return { base: m ? m[1] : name, tier: m ? m[2] : '' }
  }
  const bases = [...new Set(entries.map(([n]) => split(n).base))]
  let out = entries
  for (const base of bases) {
    const p = shopProducts.find((x) => x.name === base)
    const rule = packRule(p)
    if (!rule) continue
    const clean = base.replace(/\s*\(Box of 6\)$/, '')
    const looseE = out.find(([n, v]) => split(n).base === base && Number(v.price) === p.price)
    const boxE = hasBox6(p) ? out.find(([n, v]) => split(n).base === base && Number(v.price) === p.slice && split(n).tier === p.sliceLabel) : null
    const L = looseE?.[1].qty || 0
    const B = boxE?.[1].qty || 0
    const best = rule.size !== 10
      ? { packs: Math.floor(L / rule.size), loose: L % rule.size, boxes: 0 }
      : bestPacking(p, L, B)
    if (!best.packs) continue
    const looseName = looseE?.[0] || `${base} — ${p.sizeLabel || 'Whole'}`
    const boxName = boxE?.[0] || `${base} — ${p.sliceLabel}`
    const drop = new Set([looseE?.[0], boxE?.[0]].filter(Boolean))
    out = out.filter(([n]) => !drop.has(n))
    if (best.loose) out.push([looseName, { ...(looseE?.[1] || {}), qty: best.loose, price: p.price }])
    if (rule.size === 10 && best.boxes) out.push([boxName, { ...(boxE?.[1] || {}), qty: best.boxes, price: p.slice }])
    const label = rule.size === 10 ? 'Diwali pack of 10' : rule.size === 2 ? 'Diwali 2 boxes of 6' : 'Diwali price'
    out.push([`${clean} — ${label}`, { qty: best.packs, price: rule.price, was: p.price * rule.size, cat: looseName }])
  }
  return out
}

/**
 * "🎁 Diwali: 10 for ₹239" under a ChatBot item — the pack this name/price
 * rolls up into, or null. Real dates only, so a preview never advertises a
 * price the cart won't charge.
 */
export function packHint(name, price, now = offerNow()) {
  if (!OFFERS_ON || !diwaliWindow(now, true).live) return null
  const base = String(name).match(/^(.*?)\s+—\s+(.+)$/)?.[1] || name
  const p = shopProducts.find((x) => x.name === base)
  const rule = packRule(p)
  return rule && Number(price) === p.price ? { size: rule.size, price: rule.price, unit: rule.size === 10 ? 'pcs' : rule.size === 1 ? 'box' : 'boxes' } : null
}

/**
 * The Diwali deals one product takes part in, for its Shop card — [] outside
 * the window. `price` deals carry a ready cart line (built exactly as the
 * /offers picker builds it); `gift` deals are one line of text linking to the
 * offer. Display follows diwaliWindow() (so a preview shows them); ADDING a
 * pack is gated on the real calendar by the caller.
 */
export function productDiwaliDeals(p, now = offerNow()) {
  if (!OFFERS_ON || !p || !diwaliWindow(now).live) return []
  const deals = []
  if (DIWALI_PACK10[p.id]) {
    deals.push({ kind: 'price', label: '10 pcs', was: p.price * 10, now: DIWALI_PACK10[p.id], line: pack10Line(p) })
  }
  if (DIWALI_PACK2[p.id]) {
    deals.push({ kind: 'price', label: '2 boxes', was: p.price * 2, now: DIWALI_PACK2[p.id], line: pack2Line(p) })
  }
  if (DIWALI_PCT_OFF[p.id]) {
    deals.push({ kind: 'price', label: `${DIWALI_PCT_OFF[p.id]}% off`, was: p.price, now: diwaliOffPrice(p), line: price1Line(p) })
  }
  if (p.category === 'Cheesecakes' && p.slice != null) {
    const t = OFFER_RULES.diwaliTubTiers[0]
    deals.push({ kind: 'gift', offer: 'diwali-tubs', text: `Buy ${t.min} tubs → ${t.gift} free` })
  }
  if (p.category === 'Sponge Cakes') {
    const t = OFFER_RULES.diwaliSpongeTiers[0]
    deals.push({ kind: 'gift', offer: 'diwali-sponge', text: `Whole cake → ${t.gift} free` })
  }
  return deals
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
 * Worked out from the switches and windows alone (no offer list needed):
 * the everyday set always has offers beyond Mid-Month, and Diwali has three.
 * Must agree with activeOffers(now).length > 0 in offers.js.
 */
export const offersLive = (now = offerNow()) => OFFERS_ON && (EVERYDAY_ON || diwaliWindow(now).live)

/**
 * { live, from, to } — this year's Diwali window. Dates are local. Under
 * ?diwali=preview it reads as live on any date, unless `real` (Checkout's
 * receipt) asks for the true calendar.
 */
export function diwaliWindow(now = offerNow(), real = false) {
  const { month, fromDay, toDay } = OFFER_RULES.diwali
  const from = new Date(now.getFullYear(), month - 1, fromDay)
  const to = new Date(now.getFullYear(), month - 1, toDay)
  const d = now.getDate()
  const inside = now.getMonth() + 1 === month && d >= fromDay && d <= toDay
  return { live: inside || (!real && isDiwaliPreview()), from, to }
}

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

