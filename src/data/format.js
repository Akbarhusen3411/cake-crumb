// The one INR formatter — Indian numbering (lakhs/crores) applied automatically,
// always to two decimals.
//
// Two decimals everywhere at the owner's request: an amount is money whether
// it's a menu price, a cart total or a line on an invoice, and "₹15.00 × 10 =
// ₹150.00" reads as arithmetic in a way "₹15 × 10 = ₹150" doesn't. It briefly
// applied only to the admin/bookkeeping screens, which left the ChatBot quoting
// ₹410.00 while the Shop card beside it said ₹410 — worse than either choice on
// its own. If it ever goes back to whole rupees, it goes back everywhere.
//
// EVERY money figure on the site goes through here. ChatBot.jsx used to build
// its own with `₹${price}` template strings, which is how it ended up without
// lakh grouping; don't reintroduce that anywhere.
const fmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const inr = (n) => fmt.format(Number(n) || 0)
