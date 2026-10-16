// What an expense was for (acc_expenses.category). acc_* rules carry no
// hasOnly list, so the field needed no rules change. Rows saved before
// categories existed have none and count as 'Other' — read through catOf(),
// never `e.category` directly.
export const EXPENSE_CATS = [
  { key: 'Ingredients', color: '#cf3e63' },
  { key: 'Packaging', color: '#6b5bb0' },
  { key: 'Gas & utilities', color: '#c27a12' },
  { key: 'Equipment', color: '#2b7a9e' },
  { key: 'Delivery & travel', color: '#1b7f5e' },
  { key: 'Other', color: '#8a7d78' },
]
const KEYS = new Set(EXPENSE_CATS.map((c) => c.key))

export const catOf = (e) => (KEYS.has(e?.category) ? e.category : 'Other')
export const catColor = (key) => (EXPENSE_CATS.find((c) => c.key === key) || EXPENSE_CATS.at(-1)).color

/** [{ key, color, amount }] for the given expenses, largest first, zeros dropped. */
export function spendByCat(expenses) {
  const sums = new Map(EXPENSE_CATS.map((c) => [c.key, 0]))
  for (const e of expenses) sums.set(catOf(e), sums.get(catOf(e)) + (Number(e.amount) || 0))
  return EXPENSE_CATS
    .map((c) => ({ ...c, amount: sums.get(c.key) }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
}
