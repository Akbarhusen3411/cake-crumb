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

// Master switch: false hides the Home band, the cart gift card and the receipt
// line, and /offers says there are none running. Nothing else needs touching.
export const OFFERS_ON = true

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

/** 13 → "13th", 21 → "21st". */
export const ordinal = (n) => {
  const t = n % 100
  if (t >= 11 && t <= 13) return `${n}th`
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`
}
const MID_FROM = ordinal(OFFER_RULES.midMonth.fromDay)
const MID_TO = ordinal(OFFER_RULES.midMonth.toDay)

export const OFFERS = [
  {
    id: 'mid-month',
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

/** The offers running right now — the everyday ones, plus Mid-Month in its window. */
export function activeOffers(now = offerNow()) {
  const live = midMonthWindow(now).live
  return OFFERS.filter((o) => o.id !== 'mid-month' || live)
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
const RANK = ['big-basket', 'cookie-dozen', 'mid-month', 'gift-pair', 'tub-lover', 'cheesecake', 'tub-sip']
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
function lineInfo(item) {
  // An exact id match is the base tier, even when the id itself ends in
  // "-slice" ('lo-dipped-slice' is a product, not the tub tier of 'lo-dipped').
  const exact = shopProducts.find((p) => p.id === item.id)
  const suffix = exact ? null : item.id.match(/-(slice|unit)$/)?.[1]
  const baseId = suffix ? item.id.slice(0, -(suffix.length + 1)) : item.id
  const bare = item.name.replace(/\s*\([^)]*\)\s*$/, '')
  const product =
    exact || shopProducts.find((p) => p.id === baseId) || shopProducts.find((p) => p.name === bare)
  const bracket = item.name.match(/\(([^)]*)\)\s*$/)?.[1]
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
export function cartOfferStatus(items = [], subtotal = 0, now = offerNow()) {
  const counts = { boxes: 0, banto: 0, tubs: 0, drinks: 0, dozens: 0 }
  for (const it of items) {
    const info = lineInfo(it)
    if (isGiftBox(info)) counts.boxes += it.qty
    if (isBanto(info)) counts.banto += it.qty
    if (isCheesecakeTub(info)) counts.tubs += it.qty
    if (isDrink(info)) counts.drinks += it.qty
    if (isCookieDozen(info)) counts.dozens += it.qty
  }
  const mid = midMonthWindow(now)
  const has = items.length > 0
  const tier = tubTier(counts.tubs)
  const earned = {
    'big-basket': has && subtotal >= OFFER_RULES.bigBasketMin,
    'cookie-dozen': counts.dozens >= 1,
    'mid-month': has && mid.live && subtotal >= OFFER_RULES.midMonth.min,
    'gift-pair': counts.boxes >= 2,
    'tub-lover': !!tier,
    cheesecake: counts.banto >= 1,
    'tub-sip': counts.tubs >= 1 && counts.drinks >= 1,
  }
  const value = (id) => (id === 'tub-lover' ? (tier?.value ?? 0) : GIFT_VALUE[id])
  const bestId = RANK.filter((id) => earned[id])
    .reduce((best, id) => (best && value(best) >= value(id) ? best : id), null)
  const bestValue = bestId ? value(bestId) : 0
  // Would earning this offer (at the tier in reach) beat what the cart has?
  const beats = (id, v = GIFT_VALUE[id]) => v > bestValue

  const topTier = OFFER_RULES.tubTiers[OFFER_RULES.tubTiers.length - 1]
  const firstTier = OFFER_RULES.tubTiers[0]
  const withGift = (id, gift) => ({ ...offerById(id), gift })

  // Only nudge when the next step is genuinely close — a ₹200 cart told to
  // spend ₹1,300 more reads as a sales pitch, not a tip. First match wins, so
  // the order below is the order of preference.
  const more = (n, what) => `${n} more ${what}${n === 1 ? '' : 's'}`
  const candidates = [
    beats('big-basket') && subtotal >= OFFER_RULES.bigBasketMin * 0.6 && {
      offer: offerById('big-basket'),
      need: OFFER_RULES.bigBasketMin - subtotal,
      progress: subtotal / OFFER_RULES.bigBasketMin,
    },
    beats('mid-month') && mid.live && has && subtotal < OFFER_RULES.midMonth.min && {
      offer: offerById('mid-month'),
      need: OFFER_RULES.midMonth.min - subtotal,
      progress: subtotal / OFFER_RULES.midMonth.min,
    },
    beats('gift-pair') && counts.boxes === 1 && {
      offer: offerById('gift-pair'),
      add: '1 more box of 6',
      progress: 0.5,
    },
    // Already on the first tub tier: the next one is the step up.
    beats('tub-lover', topTier.value) && counts.tubs >= firstTier.min && counts.tubs < topTier.min && {
      offer: withGift('tub-lover', topTier.gift),
      add: more(topTier.min - counts.tubs, 'cheesecake tub'),
      progress: counts.tubs / topTier.min,
    },
    beats('tub-sip') && counts.tubs >= 1 && counts.drinks === 0 && {
      offer: offerById('tub-sip'),
      add: 'any drink',
      progress: 0.5,
    },
    beats('tub-lover', firstTier.value) && counts.tubs >= 1 && counts.tubs < firstTier.min && {
      offer: withGift('tub-lover', firstTier.gift),
      add: more(firstTier.min - counts.tubs, 'cheesecake tub'),
      progress: counts.tubs / firstTier.min,
    },
    beats('tub-sip') && counts.drinks >= 1 && counts.tubs === 0 && {
      offer: offerById('tub-sip'),
      add: 'a cheesecake tub',
      progress: 0.5,
    },
  ]
  const nudge = has ? candidates.find(Boolean) || null : null
  const offer = !bestId ? null : bestId === 'tub-lover' ? withGift('tub-lover', tier.gift) : offerById(bestId)
  return { offer, nudge, earned, counts, mid, tubTier: tier }
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

/** Offer id → { label, tabs } for the offers that qualify on particular items. */
export const OFFER_PICKERS = {
  'gift-pair': { label: 'Choose your boxes', tabs: giftBoxTabs() },
  'tub-lover': { label: 'Choose your tubs', tabs: tubLoverTabs() },
  cheesecake: { label: 'Choose your cheesecake', tabs: bantoTabs() },
  'tub-sip': { label: 'Choose a tub & a drink', tabs: tubSipTabs() },
  'cookie-dozen': { label: 'Choose your cookies', tabs: cookieDozenTabs() },
}
