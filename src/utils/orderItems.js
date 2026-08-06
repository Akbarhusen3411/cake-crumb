// Item-line shaping shared by the accounting Orders list and the invoice, so a
// row and the invoice printed from it can never describe the same order in two
// different ways.

/** Normalise an order to a list of item lines (legacy single-item orders too). */
export const orderLines = (o) =>
  Array.isArray(o.items) && o.items.length
    ? o.items
    : [{ category: o.category, item: o.item, variant: o.variant, qty: o.qty, unitPrice: o.unitPrice }]

/**
 * The item name alone is ambiguous — the menu has a "Chocolate" under Cake Pop
 * and another under Cupcake, so "Chocolate — Per piece" says nothing. Append the
 * category, unless the name already carries it (rows typed by hand before the
 * cascade existed read "Red velvet cake pop" in full).
 */
export const fullItem = (it) => {
  const item = String(it.item || '').trim()
  const cat = String(it.category || '').trim()
  if (!cat) return item
  if (!item) return cat
  return item.toLowerCase().includes(cat.toLowerCase()) ? item : `${item} ${cat}`
}

/**
 * A menu variant as it should READ anywhere it's shown.
 *
 * Boxed items store a bare count — `acc_menu` rows for Cake Pops are literally
 * "6" and "12" — which renders as "Chocolate Cake Pop — 6" on a bill and as a
 * lone "6" in the size dropdown. Neither says what the 6 is.
 */
export const variantLabel = (v) => {
  const s = String(v || '').trim()
  return /^\d+$/.test(s) ? `Box of ${s}` : s
}

/**
 * The variant as it should READ on a bill.
 *
 * "Per piece" and "Per slice" are unit markers, not sizes — beside a Qty column
 * they say nothing the quantity doesn't, and "Biscoff Cheesecake — Per slice"
 * against a qty of 1 reads like a mistake. Dropped from display at the owner's
 * request. Real sizes ("Box of 6", "Bento", "Tub", "4 inch") do carry
 * information and stay.
 *
 * DISPLAY ONLY. The stored `variant` is untouched, because it's what
 * `isPerPieceVariant()` in accounting.js reads to enforce the 2-piece minimum,
 * and what the menu cascade matches a price on.
 */
const UNIT_VARIANT = /^\s*(per\s*(piece|pc|pcs|slice)|standard)\s*$/i
export const displayVariant = (v) =>
  (UNIT_VARIANT.test(String(v || '')) ? '' : variantLabel(v))

/**
 * Sizes read in the same order for every item: piece → slice → tub → box → whole.
 *
 * `acc_menu` keeps them in the order they were typed, so Cheesecake listed
 * "Banto (3 slices)" above "Per slice" while Cookies listed "1 pc" first — the
 * owner had to re-read the list for every item instead of reaching for the same
 * position. Ranked by what the size IS, then by how much of it you get.
 */
const VARIANT_RANKS = [
  [/per\s*(piece|pc|pcs)\b|^\s*1\s*(pc|pcs|piece)?\s*$/i, 0],  // a single piece
  [/per\s*slice\b/i, 1],                                        // a single slice
  [/\btub\b|\bcup\b|\d+\s*ml\b/i, 2],                           // served in a pot
  [/\bbox\b|per\s*box\b|^\s*\d+\s*$/i, 3],                      // a box of several
  [/bento|banto|whole|heart|circle|square/i, 4],                // the whole cake
]
export const variantRank = (v) => {
  const s = String(v || '')
  for (const [re, rank] of VARIANT_RANKS) if (re.test(s)) return rank
  return 5
}
/** The count inside a size ("Box of 12" → 12), so boxes run small to large. */
const variantCount = (v) => {
  const m = String(v || '').match(/\d+/)
  return m ? Number(m[0]) : 0
}
/** Sort menu rows for display. Same rank → fewer pieces / cheaper first. */
export const sortVariants = (rows, getVariant = (r) => r.variant, getPrice = (r) => r.price) =>
  [...rows].sort((a, b) =>
    variantRank(getVariant(a)) - variantRank(getVariant(b)) ||
    variantCount(getVariant(a)) - variantCount(getVariant(b)) ||
    (Number(getPrice(a)) || 0) - (Number(getPrice(b)) || 0)
  )

/** "Chocolate Cake Pop ×10" for compact one-line summaries. */
export const oneLine = (it, withQty) => {
  const v = displayVariant(it.variant)
  return (v ? `${fullItem(it)} — ${v}` : fullItem(it)) +
    (withQty && Number(it.qty) > 1 ? ` ×${it.qty}` : '')
}
