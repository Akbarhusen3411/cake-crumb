#!/usr/bin/env node
/**
 * ONE COMMAND FOR PHOTOS:  npm run photos
 *
 * The whole job of changing a picture on the website, start to finish:
 *
 *   1. Save your photo into  public/products/  named after the product,
 *      in lower case with dashes:
 *          Mango Sponge Cake        →  mango-sponge-cake.jpeg
 *          Trés Léches Milk Cake    →  tres-leches-milk-cake.jpeg
 *          Chocolate Cheesecake (Milk & Dark)
 *                                   →  chocolate-cheesecake-milk-and-dark.jpeg
 *   2. Run  npm run photos
 *
 * That is it. This script then:
 *   • LINKS it — writes the file name into src/data/productImages.js for you,
 *     so you never edit code. That file stays the single source of truth and
 *     you can still hand-edit it whenever you want something different.
 *   • RESIZES it — makes the .webp the site actually loads, plus the -400 and
 *     -800 versions used on phones and cards. Do nothing and a photo will not
 *     appear, because the site always asks for .webp.
 *   • CHECKS it — reports any product still without a photo of its own.
 *
 * You do not have to use the naming trick. Drop a file in with any name and
 * edit src/data/productImages.js by hand; this script still resizes and checks.
 * The naming is only there so you never have to open a code file.
 *
 * Nothing here deletes or overwrites a photo you already had — the only file it
 * ever rewrites is productImages.js, and only the right-hand side of a line.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PHOTO_DIR = path.join(ROOT, 'public', 'products')
const MAP_FILE = path.join(ROOT, 'src', 'data', 'productImages.js')

const src = (rel) => pathToFileURL(path.join(ROOT, rel)).href
const { PRODUCT_IMAGES, MENU_CARD_IMAGES } = await import(src('src/data/productImages.js'))
const { shopProducts, featured } = await import(src('src/data/products.js'))

const PHOTO_EXT = /\.(jpe?g|png)$/i

/**
 * Product name → the file name you should save. Accents are stripped so the
 * name is typeable on any keyboard, and "&" becomes "and" rather than vanishing
 * (otherwise "Milk & Dark" and "Milk Dark" would collide).
 */
const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents: e-acute -> e, so names stay typeable
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Every name the site can ask for a photo of, deduped (a Home-page featured
// card can repeat a Shop row).
const productNames = [...new Set([...featured, ...shopProducts].map((p) => p.name))]
const allNames = [...productNames, ...Object.keys(MENU_CARD_IMAGES)]

const bySlug = new Map()
for (const name of allNames) bySlug.set(slugify(name), name)

const currentFor = (name) => PRODUCT_IMAGES[name] ?? MENU_CARD_IMAGES[name]

/**
 * Every file name mentioned anywhere under src/ — the product map is NOT the
 * only consumer. The Gallery names its photos through the `img` registry in
 * data/images.js, so checking PRODUCT_IMAGES alone reported perfectly good
 * gallery artwork as "unused" and then offered nonsense corrections for it.
 */
async function referencedInSource() {
  const seen = new Set()
  async function walk(dir) {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) await walk(p)
      else if (/\.(jsx?|css)$/.test(e.name)) seen.add(await fs.readFile(p, 'utf8'))
    }
  }
  await walk(path.join(ROOT, 'src'))
  return [...seen].join('\n')
}
const SOURCE_TEXT = await referencedInSource()

// ── 1. Link any slug-named photo to its product ──────────────────────────────
const onDisk = (await fs.readdir(PHOTO_DIR)).filter((f) => PHOTO_EXT.test(f))

const linked = []
const unknown = []
for (const file of onDisk) {
  const base = file.replace(PHOTO_EXT, '')
  const name = bySlug.get(base)
  if (!name) {
    // Genuinely unreferenced = not in the product map AND not named anywhere in
    // src/ (the Gallery, hero art and CSS all reach for files directly).
    const mapped = Object.values({ ...PRODUCT_IMAGES, ...MENU_CARD_IMAGES }).includes(file)
    if (!mapped && !SOURCE_TEXT.includes(file)) unknown.push(file)
    continue
  }
  const current = currentFor(name)
  if (current === file) continue // already linked, nothing to do
  linked.push({ name, file, was: current })
}

if (linked.length) {
  let text = await fs.readFile(MAP_FILE, 'utf8')
  const failed = []
  for (const l of linked) {
    // Replace only the quoted value on that key's line; the key, the padding
    // and any trailing comment stay exactly as they were.
    const re = new RegExp(`('${escapeRe(l.name)}':\\s*)'[^']*'`)
    if (!re.test(text)) { failed.push(l); continue }
    text = text.replace(re, `$1'${l.file}'`)
  }
  await fs.writeFile(MAP_FILE, text, 'utf8')

  console.log(`\n📌 Linked ${linked.length - failed.length} photo(s) to their product:`)
  for (const l of linked) {
    if (failed.includes(l)) continue
    console.log(`   ${l.name}`)
    console.log(`      was  ${l.was}`)
    console.log(`      now  ${l.file}`)
  }
  if (failed.length) {
    console.log(`\n⚠  Could not find these names in productImages.js — add them by hand:`)
    for (const l of failed) console.log(`   '${l.name}': '${l.file}',`)
  }
} else {
  console.log('\n📌 No new photos to link (every slug-named file is already in place).')
}

// ── 2. Make the .webp the site loads, plus -400 / -800 ───────────────────────
console.log('\n🖼  Resizing…')
const conv = spawnSync(process.execPath, [path.join(__dirname, 'convert-to-webp.js')], {
  stdio: ['ignore', 'pipe', 'inherit'],
  encoding: 'utf8',
})
// Only the tail matters here; the per-file list is noise once it works.
const convLines = (conv.stdout || '').trim().split('\n')
console.log('   ' + convLines.slice(-2).join('\n   '))

// ── 3. Check, and say what still needs a real photo ──────────────────────────
console.log('\n🔍 Checking…')
const check = spawnSync(process.execPath, [path.join(__dirname, 'check-product-images.js')], {
  stdio: ['ignore', 'pipe', 'inherit'],
  encoding: 'utf8',
})
const checkOut = check.stdout || ''
const problem = /MISSING FILE|NOT MAPPED|STALE KEY|NO \.webp/.test(checkOut)
console.log('   ' + (problem ? 'Problems found — full report below.' : 'Every product has a photo, and every photo exists.'))
if (problem) console.log(checkOut)

// Re-import fresh so the "needs a real photo" list reflects the links just made.
const after = await import(src('src/data/productImages.js') + `?t=${linked.length}`)
const used = {}
for (const [name, file] of Object.entries(after.PRODUCT_IMAGES)) (used[file] ||= []).push(name)
const shared = Object.entries(used).filter(([, names]) => names.length > 1)

if (unknown.length) {
  console.log(`\n❓ In public/products/ but not used anywhere — check the spelling:`)
  for (const f of unknown.slice(0, 12)) {
    const base = f.replace(PHOTO_EXT, '')
    // Nearest product by shared word count — a typo is usually one word off.
    const words = new Set(base.split('-'))
    let best = null, bestScore = 0
    for (const [s, name] of bySlug) {
      const parts = s.split('-')
      const hits = parts.filter((w) => words.has(w)).length
      // Score by how much of the CANDIDATE is matched, not the raw hit count —
      // otherwise a long product name wins on one common word ("choc", "cake")
      // and the suggestion is nonsense.
      const score = hits / parts.length
      if (hits >= 2 && score > bestScore) { bestScore = score; best = { s, name } }
    }
    console.log(`   ${f}` + (bestScore >= 0.6 ? `   → did you mean  ${best.s}.jpeg  (${best.name})?` : ''))
  }
  if (unknown.length > 12) console.log(`   …and ${unknown.length - 12} more`)
}

if (shared.length) {
  console.log(`\n📷 Still sharing one photo — save a photo named like this to fix:`)
  for (const [file, names] of shared.sort((a, b) => b[1].length - a[1].length).slice(0, 10)) {
    console.log(`   ${file}`)
    for (const n of names) console.log(`      ${slugify(n)}.jpeg   → ${n}`)
  }
  if (shared.length > 10) console.log(`   …and ${shared.length - 10} more groups`)
}

console.log('\n✔ Done. Refresh the site to see the change.\n')
