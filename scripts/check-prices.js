#!/usr/bin/env node
/**
 * Catch a Home page that has quietly gone stale:  npm run check-prices
 *
 * `featured` (the four cards on the Home page) keeps its OWN copy of each
 * price, separate from `shopProducts`. Nothing in the code ties them together —
 * change a price in the shop and the Home page keeps advertising the old one
 * until somebody notices. That is a customer seeing ₹410 on the front page and
 * ₹450 in the cart.
 *
 * This is the check nobody was doing by hand. Each featured card names the shop
 * product it mirrors and WHICH tier it quotes, because they differ:
 *   • "Red Velvet Cupcakes (Box of 6)" quotes the cupcake's `slice` (the box)
 *   • "Triple Choc Cookies (Box of 6)" quotes the cookie's `price` (also a box)
 *   • the cheesecake and milk cake quote `price` (Banto / Bento)
 *
 * Exits 1 on a mismatch so it can gate a release.
 */
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const src = (rel) => pathToFileURL(path.join(ROOT, rel)).href
const { featured, shopProducts } = await import(src('src/data/products.js'))

// featured card name → [shop product name, which field it mirrors]
const MIRRORS = {
  'Blueberry Cheesecake': ['Blueberry Cheesecake', 'price'],
  'Red Velvet Cupcakes (Box of 6)': ['Red Velvet Cupcakes', 'slice'],
  'Triple Choc Cookies (Box of 6)': ['Triple Choc Cookies', 'price'],
  'Pistachio Milk Cake (Bento)': ['Pistachio Milk Cake', 'price'],
}

const byName = Object.fromEntries(shopProducts.map((p) => [p.name, p]))
const problems = []

for (const card of featured) {
  const mirror = MIRRORS[card.name]
  if (!mirror) {
    problems.push(`NO MIRROR    "${card.name}" is featured but not listed in MIRRORS — add it to scripts/check-prices.js`)
    continue
  }
  const [shopName, field] = mirror
  const shop = byName[shopName]
  if (!shop) {
    problems.push(`MISSING      featured "${card.name}" mirrors "${shopName}", which no longer exists in shopProducts`)
    continue
  }
  if (shop[field] !== card.price) {
    problems.push(
      `PRICE DRIFT  "${card.name}" shows ₹${card.price} on the Home page, ` +
      `but "${shopName}".${field} is ₹${shop[field]}`
    )
  }
}

console.log(`\n  Featured prices — ${featured.length} cards checked against the catalogue\n`)
if (problems.length === 0) {
  console.log('  ✔ No drift — the Home page quotes the same prices as the shop.\n')
  process.exit(0)
}
for (const p of problems) console.log('  ✗ ' + p)
console.log(`\n  ${problems.length} problem(s). Fix src/data/products.js.\n`)
process.exit(1)
