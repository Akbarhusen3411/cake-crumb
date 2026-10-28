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
import { shopProducts } from './products.js'
import { inr } from './format.js'
import {
  OFFERS_ON, EVERYDAY_ON, OFFER_RULES, DIWALI_PACK10, DIWALI_PACK2,
  ordinal, offerNow, diwaliWindow, midMonthWindow, pack10Line, pack2Line,
} from './offerRules.js'

// The rules half (dates, pack prices, roll-up, clock) lives in offerRules.js;
// everything there is re-exported so old imports keep working.
export * from './offerRules.js'

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
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

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
    giftShort: 'up to a 7th tub',
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

/** The offers running right now: Diwali ones in their window, then the everyday ones (if on), Mid-Month only in its window. */
export function activeOffers(now = offerNow()) {
  if (!OFFERS_ON) return []
  const midLive = midMonthWindow(now).live
  const diwaliLive = diwaliWindow(now).live
  return OFFERS.filter((o) =>
    o.season === 'diwali' ? diwaliLive : EVERYDAY_ON && (o.id !== 'mid-month' || midLive),
  )
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
export function cartOfferStatus(items = [], subtotal = 0, now = offerNow(), { real = false, everyday = EVERYDAY_ON } = {}) {
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
  const every = OFFERS_ON && everyday
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
// The day the seven everyday offers were switched off — an order placed
// before it was judged with them ON, whatever the switch says today.
const EVERYDAY_OFF_FROM = new Date(2026, 9, 28)

/** The small, stored form of a gift: what /admin/orders shows and packs. */
export const giftRecord = (offer) => (offer ? { id: offer.id, name: offer.name, gift: offer.gift } : null)

/**
 * The gift a SAVED order earned, for /admin/orders. Orders placed since
 * 28 Oct 2026 carry it (`offerGift`, written when the order was placed, from
 * the same rule as the receipt) — today's switches can't change it. Older
 * orders are worked out from their items and time, with the everyday offers
 * as they were then. A cancelled order packs nothing.
 */
export function orderGift(order) {
  if (!order || order.status === 'cancelled') return null
  if ('offerGift' in order) return order.offerGift || null
  const when = order.createdAt ? new Date(order.createdAt) : null
  if (!when || Number.isNaN(when.getTime())) return null
  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = Number(order.totals?.subtotal) || items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0)
  return giftRecord(cartOfferStatus(items, subtotal, when, { real: true, everyday: when < EVERYDAY_OFF_FROM }).offer)
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
    .map((p) => choice({ ...pack2Line(p), was: p.price * 2, pack: true }, 'Variety × 2 boxes'))
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
