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

/** "Chocolate Cake Pop — Per piece ×10" for compact one-line summaries. */
export const oneLine = (it, withQty) =>
  (it.variant ? `${fullItem(it)} — ${it.variant}` : fullItem(it)) +
  (withQty && Number(it.qty) > 1 ? ` ×${it.qty}` : '')
