#!/usr/bin/env node
/**
 * Check the product name → photo map:  npm run check-images
 *
 * Answers the four questions you actually have after editing
 * src/data/productImages.js by hand:
 *
 *   1. Did I mistype a file name?          → MISSING FILE
 *   2. Did I forget `npm run optimize-images`? → NO .webp  (the site loads .webp)
 *   3. Does every product still have a photo?  → NOT MAPPED / STALE KEY
 *   4. Which products are still sharing one photo, and which photos are spare?
 *      → SHARED / UNUSED. Sharing is what makes a Strawberry card show a Mango
 *        picture, so it is listed even though it is not an error.
 *
 * Exits 1 on a real problem (1 or 3), 0 otherwise — warnings do not fail.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PHOTO_DIR = path.join(ROOT, 'public', 'products')

const src = (rel) => pathToFileURL(path.join(ROOT, rel)).href
const { PRODUCT_IMAGES, MENU_CARD_IMAGES, FALLBACK_PHOTO } = await import(src('src/data/productImages.js'))
const { shopProducts, featured } = await import(src('src/data/products.js'))

const onDisk = new Set(
  (await fs.readdir(PHOTO_DIR)).filter((f) => !f.startsWith('.'))
)
const isRootPath = (v) => v.startsWith('/')
// Keep in step with VARIANT_WIDTHS in scripts/convert-to-webp.js.
const VARIANT_WIDTHS = [400, 800]
const isVariant = (f) => /-(\d+)\.webp$/.test(f)

// Deduped: a Home-page featured card can carry the same name as its Shop row,
// and one name is one entry in the map.
const productNames = [...new Set([...featured, ...shopProducts].map((p) => p.name))]
const errors = []
const warnings = []

// 1 + 2 — every mapped file exists, and has its .webp sibling
const allEntries = [
  ...Object.entries(PRODUCT_IMAGES).map(([k, v]) => ['product', k, v]),
  ...Object.entries(MENU_CARD_IMAGES).map(([k, v]) => ['menu card', k, v]),
]
for (const [kind, name, file] of allEntries) {
  if (isRootPath(file)) continue // path from the site root — outside /public/products
  if (!onDisk.has(file)) {
    errors.push(`MISSING FILE   ${kind} "${name}" → public/products/${file} does not exist`)
    continue
  }
  const webp = file.replace(/\.(jpe?g|png)$/i, '.webp')
  if (webp !== file && !onDisk.has(webp)) {
    warnings.push(`NO .webp       ${file} — run: npm run optimize-images`)
    continue
  }
  // The cards serve these through srcset; a missing one means the browser
  // falls back to the full-size photo on that viewport.
  const missingSizes = VARIANT_WIDTHS
    .map((w) => webp.replace(/\.webp$/, `-${w}.webp`))
    .filter((v) => !onDisk.has(v))
  if (missingSizes.length) {
    warnings.push(`NO -${VARIANT_WIDTHS.join('/-')} sizes  ${file} — run: npm run optimize-images`)
  }
}

// 3 — every product has an entry, and no entry points at a product that is gone
for (const name of productNames) {
  if (!PRODUCT_IMAGES[name]) errors.push(`NOT MAPPED     product "${name}" has no photo in productImages.js`)
}
/**
 * Closest real product name, so a mistyped KEY says what it should have been.
 * The key has to match products.js character for character, and "Mango
 * Cheescake" or "mango cheesecake" fails silently — the product just falls back
 * to the neutral photo. Scored on shared lower-cased words as a fraction of the
 * candidate, so a long name can't win on one common word ("cake", "chocolate").
 */
const nearestName = (typo) => {
  const words = new Set(typo.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))
  let best = null
  let bestScore = 0
  for (const real of productNames) {
    const parts = real.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
    const hits = parts.filter((w) => words.has(w)).length
    const score = hits / parts.length
    if (hits >= 1 && score > bestScore) { bestScore = score; best = real }
  }
  return bestScore >= 0.5 ? best : null
}

for (const name of Object.keys(PRODUCT_IMAGES)) {
  if (!productNames.includes(name)) {
    const guess = nearestName(name)
    warnings.push(
      `STALE KEY      "${name}" is in productImages.js but no product has that name` +
      (guess ? `\n                 → did you mean "${guess}"?` : '')
    )
  }
}

// 4 — photos doing double duty, and photos nobody uses
const byFile = new Map()
for (const name of productNames) {
  const f = PRODUCT_IMAGES[name]
  if (!f) continue
  byFile.set(f, [...(byFile.get(f) || []), name])
}
const shared = [...byFile.entries()].filter(([, names]) => names.length > 1)
// FALLBACK_PHOTO counts as used — it is what an unmapped name renders.
const used = new Set([...byFile.keys(), ...Object.values(MENU_CARD_IMAGES), FALLBACK_PHOTO])
const unused = [...onDisk]
  .filter((f) => !f.endsWith('.webp') && !isVariant(f))
  .filter((f) => !used.has(f))

const line = '─'.repeat(72)
console.log(`\n${line}\n  Product photos — ${productNames.length} products, ${Object.keys(PRODUCT_IMAGES).length} mapped\n${line}`)

if (errors.length) {
  console.log('\nPROBLEMS')
  errors.forEach((e) => console.log('  ✗ ' + e))
}
if (warnings.length) {
  console.log('\nWARNINGS')
  warnings.forEach((w) => console.log('  ! ' + w))
}
if (shared.length) {
  console.log(`\nONE PHOTO, SEVERAL PRODUCTS (${shared.length}) — a real photo for each is better`)
  shared
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([f, names]) => console.log(`  • ${f}\n      ${names.join('\n      ')}`))
}
if (unused.length) {
  console.log(`\nPHOTOS IN THE FOLDER THAT NOTHING USES (${unused.length}) — free to assign`)
  unused.forEach((f) => console.log('  · ' + f))
}
if (!errors.length && !warnings.length) console.log('\n  All good — every product has a photo and every photo exists.')
console.log('')

process.exit(errors.length ? 1 : 0)
