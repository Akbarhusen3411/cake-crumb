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

async function convertOne(srcPath) {
  const ext = path.extname(srcPath).toLowerCase()
  if (!['.jpeg', '.jpg', '.png'].includes(ext)) return null
  const destPath = srcPath.replace(/\.(jpe?g|png)$/i, '.webp')
  if (await shouldSkip(srcPath, destPath)) return { skipped: true, srcPath, destPath }

  const beforeBytes = (await fs.stat(srcPath)).size
  await sharp(srcPath).webp({ quality: Q, effort: 5 }).toFile(destPath)
  const afterBytes = (await fs.stat(destPath)).size
  return { skipped: false, srcPath, destPath, beforeBytes, afterBytes }
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
        console.log(`   ✓ ${rel}  ${(r.beforeBytes / 1024).toFixed(0)}kb → ${(r.afterBytes / 1024).toFixed(0)}kb  (-${pct}%)`)
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
