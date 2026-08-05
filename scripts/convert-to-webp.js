#!/usr/bin/env node
/**
 * Convert all .jpeg / .jpg / .png in /public to .webp.
 * Skips files that already have an up-to-date .webp sibling.
 * Run once after dropping new images:  npm run optimize-images
 *
 * Why WebP: ~30–50% smaller than JPEG at the same quality,
 * supported by every modern browser (incl. iOS 14+ Safari).
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.resolve(__dirname, '..', 'public')

// Tunable quality — 78 is a sweet spot for photos.
const Q = 78

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(p)
    else yield p
  }
}

async function shouldSkip(srcPath, destPath) {
  try {
    const [s, d] = await Promise.all([fs.stat(srcPath), fs.stat(destPath)])
    return d.mtimeMs >= s.mtimeMs
  } catch {
    return false
  }
}

// Resized siblings for `srcset`. A product card is ~190px wide on a phone and
// ~230px on a desktop; the source photos are often full phone captures
// (1290 × 2796), so without these every card downloads a picture 10× bigger
// than the box it is drawn into. Keep in step with VARIANT_WIDTHS in
// src/data/images.js — that file names these files, this one writes them.
// 400 covers a phone card (~190px at 2×), 800 covers a desktop card and the
// quick-view modal. There is deliberately no 1200: most source photos are phone
// captures ~1290px wide, so a 1200 variant weighed as much as the full-size
// file for a tier almost nothing selects.
const VARIANT_WIDTHS = [400, 800]
const variantPath = (webpPath, w) => webpPath.replace(/\.webp$/, `-${w}.webp`)

async function convertOne(srcPath) {
  const ext = path.extname(srcPath).toLowerCase()
  if (!['.jpeg', '.jpg', '.png'].includes(ext)) return null
  const destPath = srcPath.replace(/\.(jpe?g|png)$/i, '.webp')

  const fresh = await shouldSkip(srcPath, destPath)
  const variantsFresh = (
    await Promise.all(VARIANT_WIDTHS.map((w) => shouldSkip(srcPath, variantPath(destPath, w))))
  ).every(Boolean)
  if (fresh && variantsFresh) return { skipped: true, srcPath, destPath }

  const beforeBytes = (await fs.stat(srcPath)).size
  if (!fresh) await sharp(srcPath).webp({ quality: Q, effort: 5 }).toFile(destPath)
  const afterBytes = (await fs.stat(destPath)).size

  // `withoutEnlargement` — a source narrower than the target is copied at its
  // own width rather than blown up. The file is always written, so a srcset can
  // reference every width without checking whether it exists.
  let variantBytes = 0
  for (const w of VARIANT_WIDTHS) {
    const out = variantPath(destPath, w)
    await sharp(srcPath)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: Q, effort: 5 })
      .toFile(out)
    variantBytes += (await fs.stat(out)).size
  }

  return { skipped: false, srcPath, destPath, beforeBytes, afterBytes, variantBytes }
}

async function main() {
  console.log(`→ Scanning ${PUBLIC}…`)
  let total = 0
  let converted = 0
  let skipped = 0
  let savedBytes = 0

  for await (const file of walk(PUBLIC)) {
    const ext = path.extname(file).toLowerCase()
    if (!['.jpeg', '.jpg', '.png'].includes(ext)) continue
    total++

    try {
      const r = await convertOne(file)
      if (!r) continue
      const rel = path.relative(PUBLIC, file)
      if (r.skipped) {
        skipped++
        console.log(`   = ${rel}  (up-to-date)`)
      } else {
        converted++
        const saved = r.beforeBytes - r.afterBytes
        savedBytes += saved
        const pct = ((saved / r.beforeBytes) * 100).toFixed(0)
        const smallest = r.variantBytes != null ? `, +${VARIANT_WIDTHS.length} sizes` : ''
        console.log(`   ✓ ${rel}  ${(r.beforeBytes / 1024).toFixed(0)}kb → ${(r.afterBytes / 1024).toFixed(0)}kb  (-${pct}%${smallest})`)
      }
    } catch (err) {
      console.error(`   ✗ ${file}:`, err.message)
    }
  }

  console.log(
    `\n✔ Done. ${converted} converted, ${skipped} unchanged, ${total - converted - skipped} skipped.\n` +
    `  Total saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
