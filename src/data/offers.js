// Offers — the single place to edit them (/offers, the Home band, the cart).
//
// Every offer is a FREE ITEM ADDED TO THE ORDER, never a lower price (see
// CLAUDE.md, "No discount system" and "Offers"). The cart and checkout total is
// the menu total, unchanged; the bakery adds the gift by hand when it confirms
// the order on WhatsApp. Nothing here reaches a total, so the five-places rule
// is never engaged.
//
// Gifts come in twos or boxes because products.js sets minQty: 2 on cupcakes
// and cake pops — the bakery doesn't bake a single one.

import { img } from './images.js'
import { shopProducts, isPerPiece } from './products.js'
import { inr } from './format.js'
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

/** Is this cart line a Diwali pack? (ids end -d2 / -d10; -d8 was the dropped
 *  box of 8, still matched so an old cart line is caught.) */
export const isDiwaliPackId = (id) => /-d(2|8|10)$/.test(String(id || ''))

// The packs as the cards show them: one row per pack with its regular and
// Diwali price. Worked out from products.js, so a price change follows.
const byId = (id) => shopProducts.find((p) => p.id === id)
function diwaliPackPrices() {
  const ten = (id) => ({ was: byId(id).price * 10, now: DIWALI_PACK10[id] })
  // The cheapest 10-cupcake pack leads ("from"); every flavour has one.
  const cup10 = Object.keys(DIWALI_PACK10).filter((id) => id.startsWith('cup-'))
    .reduce((a, id) => (!a || DIWALI_PACK10[id] < DIWALI_PACK10[a] ? id : a), null)
  return [
    cup10 && { label: '10 cupcakes', note: 'every flavour · from', ...ten(cup10) },
    { label: '2 Variety boxes', note: '12 cupcakes, all different', was: byId('cup-variety').price * 2, now: DIWALI_PACK2['cup-variety'] },
    { label: '10 cake pops', note: 'Chocolate, Vanilla or Red Velvet', ...ten('bk-cakepop-chocolate') },
  ].filter(Boolean)
}
/** The cart line for one Diwali pack of 10 — the one shape every add path uses. */
export function pack10Line(p) {
  return { id: `${p.id}-d10`, name: `${p.name} (Diwali pack of 10)`, price: DIWALI_PACK10[p.id], img: p.img }
}

// Loose pieces of a pack product: every full 10 is priced (and carted) as a
// pack, the rest at the per-piece price. Only on the REAL Diwali dates — a
// ?diwali=preview tab must never produce a real order at pack prices.
const packable = (p) => !!p && !!DIWALI_PACK10[p.id] && isPerPiece(p)
/** { total, regular, packs } for `qty` loose pieces of `p` right now. */
export function piecesPrice(p, qty, now = offerNow()) {
  const n = Math.max(0, Number(qty) || 0)
  const regular = (Number(p?.price) || 0) * n
  if (!OFFERS_ON || !packable(p) || !diwaliWindow(now, true).live) return { total: regular, regular, packs: 0 }
  const packs = Math.floor(n / 10)
  return { total: packs * DIWALI_PACK10[p.id] + (n % 10) * p.price, regular, packs }
}

/**
 * The cart's rule from 5 to 15 Nov: a per-piece line (the product's own id at
 * its per-piece price) holding 10 or more becomes pack lines + the rest — so
 * 10 Vanilla added one by one, or as "Add 10", bill as one ₹239 pack, and 12
 * as a pack + 2. Returns the SAME array when nothing changes. Called by
 * CartContext on every add / increment and on load.
 */
export function applyDiwaliPacks(items, now = offerNow()) {
  if (!OFFERS_ON || !Array.isArray(items) || !diwaliWindow(now, true).live) return items
  const out = []
  const packs = {}
  for (const it of items) {
    const p = shopProducts.find((x) => x.id === it.id)
    if (packable(p) && Number(it.price) === p.price && it.qty >= 10) {
      packs[p.id] = (packs[p.id] || 0) + Math.floor(it.qty / 10)
      if (it.qty % 10) out.push({ ...it, qty: it.qty % 10 })
    } else out.push(it)
  }
  const ids = Object.keys(packs)
  if (!ids.length) return items
  for (const id of ids) {
    const line = pack10Line(byId(id))
    const i = out.findIndex((x) => x.id === line.id)
    if (i >= 0) out[i] = { ...out[i], qty: out[i].qty + packs[id] }
    else out.push({ ...line, qty: packs[id], minQty: 1 })
  }
  return out
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

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
    deals.push({ kind: 'price', label: '2 boxes', was: p.price * 2, now: DIWALI_PACK2[p.id],
      line: { id: `${p.id}-d2`, name: `${p.name.replace(/\s*\(Box of 6\)$/, '')} (Diwali 2 boxes of 6)`, price: DIWALI_PACK2[p.id], img: p.img } })
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
const MID_FROM = ordinal(OFFER_RULES.midMonth.fromDay)
const MID_TO = ordinal(OFFER_RULES.midMonth.toDay)

// `buy` / `buyNote` / `get` are the short "Buy this → get that free" lines the
// Home cards show; `condition` and `gift` stay the full wording for /offers and
// the cart. `get` defaults to `gift`.
export const OFFERS = [
  // ── Diwali (5–15 Nov only) ──
  {
    id: 'diwali-tubs',
    season: 'diwali',
    // The cards show these rows instead of a sentence: "2 tubs → 3 cake pops free".
    steps: OFFER_RULES.diwaliTubTiers.map((t) => ({ buy: plural(t.min, 'tub', 'tubs'), get: t.gift })),
    stepsHead: 'Cheesecake tubs · mix any flavours',
    buy: 'Any 2 cheesecake tubs',
    buyNote: '3 tubs → 4 cake pops · 4 → 2 cupcakes + 2 cake pops · 6 → a free tub',
    get: '3 cake pops',
    name: 'Diwali Tub Treat',
    tag: 'Diwali · 5 – 15 Nov',
    condition: 'Order cheesecake tubs, any flavours mixed: 2 tubs get 3 cake pops, 3 get 4 cake pops, 4 get 2 cupcakes + 2 cake pops, and 6 get a 7th tub free.',
    gift: '3 cake pops, up to a free tub with 6',
    giftShort: 'up to a free tub',
    image: img.cheesecakeStrawberryCups,
    alt: 'Strawberry cheesecake in single-serve tubs',
    cta: { label: 'Shop cheesecake tubs', to: '/shop?category=Cheesecakes' },
  },
  {
    id: 'diwali-sponge',
    season: 'diwali',
    steps: OFFER_RULES.diwaliSpongeTiers.map((t) => ({ buy: plural(t.min, 'whole cake', 'whole cakes'), get: t.gift })),
    stepsHead: 'Whole sponge cake · any flavour',
    buy: 'A whole sponge cake',
    buyNote: 'Buy 2 for a free sponge tub + 3 cake pops',
    get: '4 cake pops',
    name: 'Diwali Cake Treat',
    tag: 'Diwali · 5 – 15 Nov',
    condition: 'Order a whole sponge cake (Bento), any flavour, for 4 free cake pops — or two whole sponge cakes for a free sponge cake tub + 3 cake pops.',
    gift: '4 cake pops, or a sponge tub + 3 cake pops with 2',
    giftShort: 'up to a sponge tub + 3 cake pops',
    image: img.rcCakeYellowRose,
    alt: 'A whole sponge cake with yellow buttercream roses',
    cta: { label: 'Shop sponge cakes', to: '/shop?category=Sponge%20Cakes' },
  },
  {
    id: 'diwali-packs',
    season: 'diwali',
    prices: diwaliPackPrices(),
    deal: true, // a price, not a free gift: label "Deal", no cart gift
    buy: 'Diwali packs — cupcakes & cake pops',
    buyNote: `Cupcakes from ${inr(239)} · cake pops ${inr(139)} · 2 Variety boxes ${inr(339)}`,
    get: `Packs from ${inr(139)}`,
    getLabel: 'Deal',
    name: 'Diwali Sweet Packs',
    tag: 'Diwali · 5 – 15 Nov',
    condition: 'Diwali-only packs at a special price — 10 cupcakes of any flavour, 10 Chocolate, Vanilla or Red Velvet cake pops, or 2 Variety boxes of 6.',
    gift: 'Diwali pack prices',
    tickerText: `10 cupcakes from ${inr(239)} · 10 cake pops ${inr(139)}`,
    image: img.rcOwnCupcakesSix,
    alt: 'Six assorted cupcakes',
    cta: { label: 'Choose a pack', to: '/offers#diwali-packs' },
  },
  // ── Everyday (only while EVERYDAY_ON) ──
  {
    id: 'mid-month',
    buy: `Spend ${inr(OFFER_RULES.midMonth.min)} or more`,
    buyNote: `Only from the ${MID_FROM} to the ${MID_TO}`,
    name: 'Mid-Month Treat',
    tag: `${MID_FROM} – ${MID_TO}, every month`,
    condition: `Order ${inr(OFFER_RULES.midMonth.min)} or more between the ${MID_FROM} and the ${MID_TO} of any month.`,
    gift: 'A box of 6 cake pops',
    image: img.rcOwnCakePops,
    alt: 'Chocolate cake pops',
    cta: { label: 'Start your order', to: '/shop' },
  },
  {
    id: 'gift-pair',
    buy: 'Any 2 boxes of 6',
    buyNote: 'Cupcakes, brownies, blondies or cookies',
    name: 'Gift Box Pair',
    tag: 'Made for gifting',
    condition: 'Order any 2 boxes of 6 — cupcakes, brownies, blondies or cookies, mixed as you like.',
    gift: 'A box of 6 cake pops',
    image: img.rcOwnCupcakesOpenBox,
    alt: 'An open box of assorted cupcakes',
    cta: { label: 'Shop gift boxes', to: '/shop?category=Cupcakes' },
  },
  {
    id: 'cheesecake',
    buy: 'A whole Banto 4″ cheesecake',
    buyNote: 'Any flavour',
    name: 'Cheesecake Lover',
    tag: 'Whole cheesecake',
    condition: 'Order any whole Banto 4″ cheesecake, in any flavour on the menu.',
    gift: '2 cupcakes',
    image: img.rcCheesecakeBlueberry,
    alt: 'A whole blueberry cheesecake',
    cta: { label: 'Shop cheesecakes', to: '/shop?category=Cheesecakes' },
  },
  {
    id: 'tub-lover',
    buy: 'Any 2 cheesecake tubs',
    buyNote: 'Buy 5 tubs and get 5 cake pops',
    get: '3 cake pops',
    name: 'Tub Lover',
    tag: 'More tubs, more pops',
    condition: 'Order any 2 cheesecake tubs for 3 free cake pops — or 5 tubs for 5. Mix the flavours as you like.',
    gift: '3 cake pops, or 5 with 5 tubs',
    // For one-line spots (the Home ticker, the hero stickers).
    giftShort: 'up to 5 cake pops',
    image: img.cheesecakeStrawberryCups,
    alt: 'Strawberry cheesecake in single-serve tubs',
    cta: { label: 'Shop cheesecakes', to: '/shop?category=Cheesecakes' },
  },
  {
    id: 'tub-sip',
    buy: '1 cheesecake tub + 1 drink',
    buyNote: 'Mojito, shake or coffee',
    name: 'Tub & Sip',
    tag: 'A treat for one',
    condition: 'Order a cheesecake tub and any drink — mojito, shake or coffee.',
    gift: '2 cake pops',
    image: img.drinkStrawberryMojito,
    alt: 'A strawberry mojito',
    cta: { label: 'Shop drinks', to: '/shop?category=Drinks' },
  },
  {
    id: 'cookie-dozen',
    buy: 'A box of 12 cookies',
    buyNote: 'Any flavour',
    name: 'Cookie Dozen',
    tag: 'Box of 12',
    condition: 'Order any box of 12 cookies, in any flavour.',
    gift: '2 extra cookies',
    image: img.rcCookiesChocolateNutBoard,
    alt: 'Chocolate cookies on a board',
    cta: { label: 'Shop cookies', to: '/shop?category=Cookies' },
  },
  {
    id: 'big-basket',
    buy: `Spend ${inr(OFFER_RULES.bigBasketMin)} or more`,
    buyNote: 'On one order, before delivery',
    name: 'Big Basket',
    tag: 'Family & office',
    condition: 'Spend ₹1,500 or more on one order (before delivery) — for the family, the office or a party.',
    gift: 'A box of 6 cake pops + 2 cupcakes',
    image: img.rcOwnCupcakesSix,
    alt: 'Six assorted cupcakes',
    cta: { label: 'Fill your basket', to: '/shop' },
  },
]

export const offerById = (id) => OFFERS.find((o) => o.id === id)

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

/** The offers running right now: Diwali ones in their window, then the everyday ones (if on), Mid-Month only in its window. */
export function activeOffers(now = offerNow()) {
  if (!OFFERS_ON) return []
  const midLive = midMonthWindow(now).live
  const diwaliLive = diwaliWindow(now).live
  return OFFERS.filter((o) =>
    o.season === 'diwali' ? diwaliLive : EVERYDAY_ON && (o.id !== 'mid-month' || midLive),
  )
}

/** Is any offer running now? Gates every offer surface, so none shows empty. */
export const offersLive = (now = offerNow()) => activeOffers(now).length > 0

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

// ── Which offer does this cart earn? ──────────────────────────────────────────
// Display only: shown in the cart and quoted in the WhatsApp receipt so the
// bakery knows which gift to pack. It never changes a total.

// One offer per order, and the cart shows the biggest gift it earns, judged
// by menu value (₹15 a cake pop, ~₹30 a cupcake, ~₹55 a cookie). Value rather
// than a fixed order, because Tub Lover's two tiers sit either side of
// Cheesecake Lover: 3 cake pops is worth less than 2 cupcakes, 5 is worth more.
// Ties go to the earlier offer in RANK. Mid-Month and Gift Box Pair give the
// same box.
const RANK = ['diwali-sponge', 'diwali-tubs', 'big-basket', 'cookie-dozen', 'mid-month', 'gift-pair', 'tub-lover', 'cheesecake', 'tub-sip']
const GIFT_VALUE = {
  'big-basket': 150,
  'cookie-dozen': 110,
  'mid-month': 90,
  'gift-pair': 90,
  cheesecake: 60,
  'tub-sip': 30,
}
const BOX_GROUPS = ['Brownies', 'Blondies']

// A cart line is { id, name, price, qty }. Its tier is the bracket at the end
// of its name — "Vanilla Cupcakes (Box of 6)" — which every add path writes.
// The id suffix (-slice / -unit) and the product's own labels are the fallback.
function lineInfo(raw) {
  // Saved orders and ChatBot lines may lack an id; never let that throw.
  const item = { ...raw, id: String(raw?.id || ''), name: String(raw?.name || '') }
  // An exact id match is the base tier, even when the id itself ends in
  // "-slice" ('lo-dipped-slice' is a product, not the tub tier of 'lo-dipped').
  const exact = shopProducts.find((p) => p.id === item.id)
  const suffix = exact ? null : item.id.match(/-(slice|unit)$/)?.[1]
  const baseId = suffix ? item.id.slice(0, -(suffix.length + 1)) : item.id
  const bare = item.name.replace(/\s*\([^)]*\)\s*$/, '')
  // The ChatBot names a tier with a dash instead: "Strawberry Cheesecake — Tub".
  const dashed = item.name.match(/^(.*?)\s+—\s+(.+)$/)
  const product =
    exact || shopProducts.find((p) => p.id === baseId) || shopProducts.find((p) => p.name === bare) ||
    (dashed && shopProducts.find((p) => p.name === dashed[1]))
  const bracket = item.name.match(/\(([^)]*)\)\s*$/)?.[1] || dashed?.[2]
  const isSlice = suffix === 'slice'
  const suffixLabel = isSlice
    ? product?.sliceLabel
    : suffix === 'unit'
      ? product?.unitLabel
      : product?.sizeLabel
  return { product, tier: bracket || suffixLabel || '', isSlice }
}

const isGiftBox = ({ product, tier }) =>
  tier === 'Box of 6' &&
  !!product &&
  (product.category === 'Cupcakes' || product.category === 'Cookies' || BOX_GROUPS.includes(product.group))

const isBanto = ({ product, tier }) => product?.category === 'Cheesecakes' && /^Banto/.test(tier)
// The cheesecake TUB (the -slice tier, labelled "Tub"). "Dipped Cheesecake
// Slice" is a different product — genuinely a slice — and doesn't count.
const isCheesecakeTub = ({ product, tier, isSlice }) =>
  product?.category === 'Cheesecakes' && (isSlice || /^tub$/i.test(tier))
const isDrink = ({ product }) => product?.category === 'Drinks'
const isCookieDozen = ({ product, tier }) => product?.category === 'Cookies' && tier === 'Box of 12'
// A WHOLE sponge cake (the base "Whole Bento" tier), not a sponge tub.
const isWholeSponge = ({ product, isSlice, tier }) =>
  product?.category === 'Sponge Cakes' && !isSlice && !/^tub$/i.test(tier)

// Offers whose gift grows with a count. id → which count, its tiers, and the
// word for one item (for "add 2 more cheesecake tubs").
export const TIERED = {
  'tub-lover': { count: 'tubs', tiers: OFFER_RULES.tubTiers, unit: 'cheesecake tub' },
  'diwali-tubs': { count: 'tubs', tiers: OFFER_RULES.diwaliTubTiers, unit: 'cheesecake tub' },
  'diwali-sponge': { count: 'sponge', tiers: OFFER_RULES.diwaliSpongeTiers, unit: 'whole sponge cake' },
}
/** The highest tier of `tiers` that `n` reaches, or null. */
export const tierFor = (tiers, n) => [...tiers].reverse().find((t) => n >= t.min) || null

/**
 * Where a cart stands. `offer` is the best OFFERS entry it earns (or null);
 * `nudge` points at the next better offer when it is close: { offer, text,
 * progress 0–1 }. `earned` maps every offer id to true/false, and `counts`
 * carries what each was measured on, for the per-card status on /offers.
 */
/** The Tub Lover tier a number of tubs reaches, or null. Highest first. */
export function tubTier(tubs) {
  return [...OFFER_RULES.tubTiers].reverse().find((t) => tubs >= t.min) || null
}

/**
 * Where a cart stands. `offer` is the best OFFERS entry it earns, or null —
 * for a tiered offer its `gift` is the tier actually reached. `nudge` points
 * at the next bigger gift when it is close: { offer, need | add, progress 0–1 }.
 * `earned` maps every offer id to true/false, and `counts` carries what each
 * was measured on, for the per-card status on /offers.
 */
export function cartOfferStatus(items = [], subtotal = 0, now = offerNow(), { real = false } = {}) {
  const counts = { boxes: 0, banto: 0, tubs: 0, drinks: 0, dozens: 0, sponge: 0 }
  for (const it of items) {
    const info = lineInfo(it)
    if (isGiftBox(info)) counts.boxes += it.qty
    if (isBanto(info)) counts.banto += it.qty
    if (isCheesecakeTub(info)) counts.tubs += it.qty
    if (isDrink(info)) counts.drinks += it.qty
    if (isCookieDozen(info)) counts.dozens += it.qty
    if (isWholeSponge(info)) counts.sponge += it.qty
  }
  const mid = midMonthWindow(now)
  const diwali = diwaliWindow(now, real)
  const has = items.length > 0
  const every = OFFERS_ON && EVERYDAY_ON
  const fest = OFFERS_ON && diwali.live
  // The tier each tiered offer reaches right now (null = not yet).
  const tiers = Object.fromEntries(
    Object.entries(TIERED).map(([id, t]) => [id, tierFor(t.tiers, counts[t.count])]),
  )
  const tier = tiers['tub-lover']
  const earned = {
    'diwali-tubs': fest && !!tiers['diwali-tubs'],
    'diwali-sponge': fest && !!tiers['diwali-sponge'],
    'big-basket': every && has && subtotal >= OFFER_RULES.bigBasketMin,
    'cookie-dozen': every && counts.dozens >= 1,
    'mid-month': every && has && mid.live && subtotal >= OFFER_RULES.midMonth.min,
    'gift-pair': every && counts.boxes >= 2,
    'tub-lover': every && !!tier,
    cheesecake: every && counts.banto >= 1,
    'tub-sip': every && counts.tubs >= 1 && counts.drinks >= 1,
  }
  const value = (id) => (TIERED[id] ? (tiers[id]?.value ?? 0) : GIFT_VALUE[id])
  const bestId = RANK.filter((id) => earned[id])
    .reduce((best, id) => (best && value(best) >= value(id) ? best : id), null)
  const bestValue = bestId ? value(bestId) : 0
  // Would earning this offer (at the tier in reach) beat what the cart has?
  const beats = (id, v = GIFT_VALUE[id]) => v > bestValue

  const topTier = OFFER_RULES.tubTiers[OFFER_RULES.tubTiers.length - 1]
  const firstTier = OFFER_RULES.tubTiers[0]
  const withGift = (id, gift) => ({ ...offerById(id), gift })

  // The next step up a tiered Diwali offer, once something counting towards it
  // is in the basket: "Add 1 more cheesecake tub for 4 cake pops free".
  const more = (n, what) => `${n} more ${what}${n === 1 ? '' : 's'}`
  const stepUp = (id) => {
    const t = TIERED[id]
    const n = counts[t.count]
    const next = t.tiers.find((x) => x.min > n)
    if (!fest || !n || !next || !beats(id, next.value)) return null
    return { offer: withGift(id, next.gift), add: more(next.min - n, t.unit), progress: n / next.min }
  }

  // Only nudge when the next step is genuinely close — a ₹200 cart told to
  // spend ₹1,300 more reads as a sales pitch, not a tip. First match wins, so
  // the order below is the order of preference.
  const candidates = [
    stepUp('diwali-sponge'),
    stepUp('diwali-tubs'),
    every && beats('big-basket') && subtotal >= OFFER_RULES.bigBasketMin * 0.6 && {
      offer: offerById('big-basket'),
      need: OFFER_RULES.bigBasketMin - subtotal,
      progress: subtotal / OFFER_RULES.bigBasketMin,
    },
    every && beats('mid-month') && mid.live && has && subtotal < OFFER_RULES.midMonth.min && {
      offer: offerById('mid-month'),
      need: OFFER_RULES.midMonth.min - subtotal,
      progress: subtotal / OFFER_RULES.midMonth.min,
    },
    every && beats('gift-pair') && counts.boxes === 1 && {
      offer: offerById('gift-pair'),
      add: '1 more box of 6',
      progress: 0.5,
    },
    // Already on the first tub tier: the next one is the step up.
    every && beats('tub-lover', topTier.value) && counts.tubs >= firstTier.min && counts.tubs < topTier.min && {
      offer: withGift('tub-lover', topTier.gift),
      add: more(topTier.min - counts.tubs, 'cheesecake tub'),
      progress: counts.tubs / topTier.min,
    },
    every && beats('tub-sip') && counts.tubs >= 1 && counts.drinks === 0 && {
      offer: offerById('tub-sip'),
      add: 'any drink',
      progress: 0.5,
    },
    every && beats('tub-lover', firstTier.value) && counts.tubs >= 1 && counts.tubs < firstTier.min && {
      offer: withGift('tub-lover', firstTier.gift),
      add: more(firstTier.min - counts.tubs, 'cheesecake tub'),
      progress: counts.tubs / firstTier.min,
    },
    every && beats('tub-sip') && counts.drinks >= 1 && counts.tubs === 0 && {
      offer: offerById('tub-sip'),
      add: 'a cheesecake tub',
      progress: 0.5,
    },
  ]
  const nudge = has ? candidates.find(Boolean) || null : null
  // A tiered offer's gift is the tier actually reached.
  const offer = !bestId ? null : TIERED[bestId] ? withGift(bestId, tiers[bestId].gift) : offerById(bestId)
  return { offer, nudge, earned, counts, mid, diwali, tubTier: tier, tiers }
}

/**
 * The gift a SAVED order earned — for /admin/orders, so the bakery packs it
 * without hunting through the WhatsApp receipt. Judged on the order's own
 * items and the time it was placed, on the real calendar (never a preview).
 * The gift isn't stored on the order (that would need a rules change), so this
 * re-works it out; the result is the same as the receipt's line for website
 * orders, and also covers ChatBot orders, whose receipt has no gift line.
 */
export function orderGift(order) {
  const when = order?.createdAt ? new Date(order.createdAt) : null
  if (!OFFERS_ON || !when || Number.isNaN(when.getTime())) return null
  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = Number(order.totals?.subtotal) || items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0)
  return cartOfferStatus(items, subtotal, when, { real: true }).offer
}

// ── Quick-add choices for the offer cards on /offers ──────────────────────────
// Each choice is a cart-ready line built EXACTLY as the Shop builds it (id
// suffix, "(tier)" name, tier price), so adding here and adding from /shop
// merge into one cart line instead of two.

const short = (name) => name.replace(/\s*\([^)]*\)\s*$/, '').replace(/ (Cupcakes|Cookies)$/, '')

function boxOf6Line(p) {
  // Cookies sell the box of 6 as the base tier; cupcakes, brownies and
  // blondies as the second (-slice) tier; Variety Cupcakes is box-only.
  if (p.sliceLabel === 'Box of 6') {
    return { id: `${p.id}-slice`, name: `${p.name} (${p.sliceLabel})`, price: p.slice, img: p.img }
  }
  if (p.sizeLabel === 'Box of 6') {
    const name = /\(Box of 6\)$/.test(p.name) ? p.name : `${p.name} (${p.sizeLabel})`
    return { id: p.id, name, price: p.price, img: p.img }
  }
  return null
}

const choice = (line, label) => (line ? { line, label } : null)
const tab = (label, items) => ({ label, items: items.filter(Boolean) })

function giftBoxTabs() {
  return [
    ['Cupcakes', (p) => p.category === 'Cupcakes'],
    ['Brownies', (p) => p.group === 'Brownies'],
    ['Blondies', (p) => p.group === 'Blondies'],
    ['Cookies', (p) => p.category === 'Cookies'],
  ].map(([label, test]) => tab(label, shopProducts.filter(test).map((p) => choice(boxOf6Line(p), short(p.name)))))
}

function bantoTabs() {
  const banto = shopProducts.filter((p) => p.category === 'Cheesecakes' && /^Banto/.test(p.sizeLabel || ''))
  return [...new Set(banto.map((p) => p.group))].map((g) =>
    tab(g, banto.filter((p) => p.group === g).map((p) =>
      choice({ id: p.id, name: `${p.name} (${p.sizeLabel})`, price: p.price, img: p.img }, p.name.replace(/ Cheesecake.*$/, '')),
    )),
  )
}

function tubSipTabs() {
  const tubs = shopProducts
    .filter((p) => p.category === 'Cheesecakes' && p.slice != null)
    .map((p) => choice({ id: `${p.id}-slice`, name: `${p.name} (${p.sliceLabel || 'Slice'})`, price: p.slice, img: p.img }, p.name.replace(/ Cheesecake.*$/, '')))
  const drinks = (group) => shopProducts
    .filter((p) => p.category === 'Drinks' && p.group === group)
    .map((p) => choice({ id: p.id, name: p.name, price: p.price, img: p.img }, p.name.replace(/\s*\([^)]*\)\s*$/, '')))
  return [
    tab('Tubs', tubs),
    tab('Mojitos', drinks('Mojitos')),
    tab('Shakes', drinks('Milkshakes')),
    tab('Iced Coffee', drinks('Iced Coffee')),
    tab('Hot Coffee', drinks('Hot Coffee')),
  ]
}

function tubLoverTabs() {
  const tubbed = shopProducts.filter((p) => p.category === 'Cheesecakes' && p.slice != null)
  return [...new Set(tubbed.map((p) => p.group))].map((g) =>
    tab(g, tubbed.filter((p) => p.group === g).map((p) =>
      choice({ id: `${p.id}-slice`, name: `${p.name} (${p.sliceLabel || 'Slice'})`, price: p.slice, img: p.img }, p.name.replace(/ Cheesecake.*$/, '')),
    )),
  )
}

function cookieDozenTabs() {
  return [tab('Box of 12', shopProducts
    .filter((p) => p.category === 'Cookies' && p.sliceLabel === 'Box of 12')
    .map((p) => choice({ id: `${p.id}-slice`, name: `${p.name} (${p.sliceLabel})`, price: p.slice, img: p.img }, short(p.name))))]
}

// Whole sponge cakes, built as /shop builds the base tier: "<name> (Whole Bento)".
function spongeTabs() {
  return [tab('Whole sponge cakes', shopProducts
    .filter((p) => p.category === 'Sponge Cakes')
    .map((p) => choice({ id: p.id, name: `${p.name} (${p.sizeLabel})`, price: p.price, img: p.img }, p.name.replace(/ Sponge Cake$/, ''))))]
}

// Diwali packs: each line carries `was` (struck through) and `pack`, which
// the picker uses to allow adding only inside the real window.
const short2 = (name) => name.replace(/ (Cupcakes|Cake Pops)$/, '')
function diwaliPackTabs() {
  const ten = (test) => shopProducts
    .filter((p) => DIWALI_PACK10[p.id] && test(p))
    .map((p) => choice({ ...pack10Line(p), was: p.price * 10, pack: true }, short2(p.name)))
  const two = shopProducts
    .filter((p) => DIWALI_PACK2[p.id])
    .map((p) => choice({ id: `${p.id}-d2`, name: `${p.name.replace(/\s*\(Box of 6\)$/, '')} (Diwali 2 boxes of 6)`, price: DIWALI_PACK2[p.id], was: p.price * 2, img: p.img, pack: true }, 'Variety × 2 boxes'))
  return [
    tab('Cupcakes × 10', ten((p) => p.category === 'Cupcakes')),
    tab('Variety × 2', two),
    tab('Cake pops × 10', ten((p) => p.group === 'Cake Pops')),
  ]
}

/** Offer id → { label, tabs } for the offers that qualify on particular items. */
export const OFFER_PICKERS = {
  'gift-pair': { label: 'Choose your boxes', tabs: giftBoxTabs() },
  'tub-lover': { label: 'Choose your tubs', tabs: tubLoverTabs() },
  cheesecake: { label: 'Choose your cheesecake', tabs: bantoTabs() },
  'tub-sip': { label: 'Choose a tub & a drink', tabs: tubSipTabs() },
  'cookie-dozen': { label: 'Choose your cookies', tabs: cookieDozenTabs() },
  'diwali-tubs': { label: 'Choose your tubs', tabs: tubLoverTabs() },
  'diwali-sponge': { label: 'Choose your sponge cake', tabs: spongeTabs() },
  'diwali-packs': { label: 'Choose your pack', tabs: diwaliPackTabs() },
}
