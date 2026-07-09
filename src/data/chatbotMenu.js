// ChatBot menu + order data — DERIVED from products.js, never hand-maintained.
//
// The bot used to keep its own copies of every item and price, which silently
// drifted from the catalog (customers saw prices they could not order). Now both
// the price cards and the order selector are generated from `shopProducts`, so a
// price change in products.js propagates everywhere on the next render.
//
// Sub-headings inside a category come from each product's optional `group` field.

import { shopProducts } from './products.js'

// Category order + presentation. `category` must match products.js exactly.
// `strip` trims the redundant category noun off row labels so rows stay narrow
// ("Strawberry Cheesecake" → "Strawberry"); the order selector keeps full names.
const CATEGORY_CONFIG = [
  { key: 'cheesecakes',  category: 'Cheesecakes',  emoji: '🍰', subtitle: 'Banto 4" (inch) · whole or per slice', strip: / Cheesecake/ },
  { key: 'milk-cakes',   category: 'Milk Cakes',   emoji: '🥛', subtitle: 'Bento or single-serve tub',            strip: / Milk Cake/ },
  { key: 'sponge-cakes', category: 'Sponge Cakes', emoji: '🎂', subtitle: 'Whole bento or single-serve tub',      strip: / Sponge Cake/ },
  { key: 'cupcakes',     category: 'Cupcakes',     emoji: '🧁', subtitle: 'Box of 6 · +₹20 for decoration',       strip: / Cupcakes \(6 pcs\)/ },
  { key: 'cookies',      category: 'Cookies',      emoji: '🍪', subtitle: 'Box of 6 or box of 12',                strip: / Cookies/ },
  { key: 'bakes',        category: 'Bakes',        emoji: '🍫', subtitle: 'Brownies, blondies, cakesicles & more', strip: / Brownie$| Blondie$/ },
  { key: 'dessert-cups', category: 'Dessert Cups', emoji: '🍮', subtitle: 'Per cup · 150ml',                      strip: / Cup$/ },
  { key: 'drinks',       category: 'Drinks',       emoji: '🥤', subtitle: 'Per glass · +₹10 for cream on coffee' },
  { key: 'platters',     category: 'Platters',     emoji: '🥞', subtitle: 'Served fresh to order' },
]

// Long size labels get a compact form for the narrow price-column headers.
const HEADER_LABELS = {
  'Banto 4" (inch)': 'Banto',
  'Whole (Bento)': 'Bento',
  'Box of 6': 'Box 6',
  'Box of 12': 'Box 12',
  '1 pc': 'Piece',
  'Per slice': 'Slice',
  'Per piece': 'Each',
}

const money = (n) => `₹${n}`
const headerLabel = (label) => HEADER_LABELS[label] || label

// Primary size label (the `price` field) and secondary (the `slice` field).
const sizeOf = (p) => p.sizeLabel || 'Whole'
const sliceOf = (p) => p.sliceLabel || 'Per slice'

const shortName = (p, strip) => (strip ? p.name.replace(strip, '') : p.name).trim()

// Preserve products.js ordering while bucketing by `group`.
function groupBy(products) {
  const buckets = new Map()
  for (const p of products) {
    const key = p.group || ''
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(p)
  }
  return buckets
}

// A two-price product is rendered cheaper-unit-first, so the left column is always
// the smaller portion. `slice` is cheaper than `price` for cheesecakes (slice vs
// whole) but pricier for cookies (box of 12 vs box of 6) — sort, don't assume.
const cheapFirst = (p) =>
  p.slice <= p.price
    ? { lo: { label: sliceOf(p), price: p.slice }, hi: { label: sizeOf(p), price: p.price } }
    : { lo: { label: sizeOf(p), price: p.price }, hi: { label: sliceOf(p), price: p.slice } }

function buildCategory(cfg) {
  const products = shopProducts.filter((p) => p.category === cfg.category)
  const groups = []

  for (const [groupName, items] of groupBy(products)) {
    // A group is homogeneous in price shape, so the first item decides the columns.
    const twoPrice = items[0].slice != null
    const cols = twoPrice
      ? [headerLabel(cheapFirst(items[0]).lo.label), headerLabel(cheapFirst(items[0]).hi.label)]
      : null
    groups.push({
      name: groupName || null,
      cols,
      items: items.map((p) => {
        if (p.slice == null) return { n: shortName(p, cfg.strip), p: money(p.price) }
        const { lo, hi } = cheapFirst(p)
        return { n: shortName(p, cfg.strip), s: money(lo.price), w: money(hi.price) }
      }),
    })
  }

  return { title: cfg.category, subtitle: cfg.subtitle, groups }
}

// Every purchasable variant, with the full product name so the WhatsApp receipt
// and the admin dashboard stay unambiguous.
function buildOrderItems(cfg) {
  const catLabel = `${cfg.emoji} ${cfg.category}`
  return shopProducts
    .filter((p) => p.category === cfg.category)
    .flatMap((p) =>
      p.slice != null
        ? [
            { name: `${p.name} — ${sizeOf(p)}`, price: p.price, cat: catLabel },
            { name: `${p.name} — ${sliceOf(p)}`, price: p.slice, cat: catLabel },
          ]
        : [{ name: p.name, price: p.price, cat: catLabel }]
    )
}

export const MENU_DATA = Object.fromEntries(
  CATEGORY_CONFIG.map((cfg) => [cfg.key, buildCategory(cfg)])
)

export const ORDER_ITEMS = Object.fromEntries(
  CATEGORY_CONFIG.map((cfg) => [cfg.key, buildOrderItems(cfg)])
)

export const MENU_CATEGORIES = [
  ...CATEGORY_CONFIG.map((cfg) => ({ label: `${cfg.emoji} ${cfg.category}`, action: `cat_${cfg.key}` })),
  { label: '◀️ Back to Main', action: 'home' },
]

export const ORDER_CATEGORIES = [
  ...CATEGORY_CONFIG.map((cfg) => ({ label: `${cfg.emoji} ${cfg.category}`, action: `ord_${cfg.key}` })),
  { label: '✅ Review My Order', action: 'review_order' },
  { label: '🏠 Main Menu', action: 'home' },
]

// Name → "🍰 Cheesecakes", for grouping the WhatsApp order receipt.
const CAT_BY_NAME = new Map(
  Object.values(ORDER_ITEMS).flatMap((items) => items.map((i) => [i.name, i.cat]))
)

export function getItemCat(name) {
  return CAT_BY_NAME.get(name) || ''
}
