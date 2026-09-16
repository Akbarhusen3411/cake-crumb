#!/usr/bin/env node
/**
 * Stamp `<lastmod>` onto dist/sitemap.xml from git history.
 *
 * WHY FROM GIT, AND WHY AT BUILD TIME
 *
 * `lastmod` is only worth having if it is true. Google says plainly that it
 * ignores the value on sites where it isn't consistently accurate, so stamping
 * every URL with today's date on every deploy is worse than omitting it — it
 * claims eleven pages changed when one did, and teaches the crawler to distrust
 * the whole file. A hand-maintained date is the same problem a month later.
 *
 * So each URL takes the committer date of the newest file that actually decides
 * what that page renders — its own component, plus the shared data it reads. A
 * price edit in products.js moves /shop and /menu and nothing else, which is the
 * truth. And it runs against dist/, never public/, so a deploy doesn't leave a
 * modified file in the working tree for someone to commit by accident.
 *
 * Never fails the build: no git, no sitemap, an unmapped URL — each is a reason
 * to leave that entry exactly as it was, not to stop a deploy over a hint.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const SITEMAP = 'dist/sitemap.xml'

/**
 * URL path → the files that decide what it shows.
 *
 * `/reviews` is deliberately absent. Its content is customer reviews out of
 * Firestore, which change without a commit, so any git date would be a
 * confident lie. No lastmod says "I don't know", which is accurate.
 */
const SOURCES = {
  '/': ['src/pages/Home.jsx', 'src/data/products.js', 'src/data/festivals.js'],
  '/menu': ['src/pages/Menu.jsx', 'src/data/products.js'],
  '/shop': ['src/pages/Shop.jsx', 'src/data/products.js'],
  '/gallery': ['src/pages/Gallery.jsx', 'src/components/GalleryGrid.jsx', 'src/components/VideoStrip.jsx'],
  '/about': ['src/pages/About.jsx'],
  '/contact': ['src/pages/Contact.jsx', 'src/data/certifications.js'],
  '/faq': ['src/pages/FAQ.jsx', 'src/data/shopConfig.js'],
  '/track-order': ['src/pages/TrackOrder.jsx'],
  '/privacy': ['src/pages/Privacy.jsx'],
  '/refund-policy': ['src/pages/RefundPolicy.jsx', 'src/data/shopConfig.js'],
}

/** Newest committer date (YYYY-MM-DD) across `files`, or '' if git can't say. */
function lastCommitDate(files) {
  const present = files.filter((f) => existsSync(f))
  if (!present.length) return ''
  try {
    // %cs is the committer date, short — already the YYYY-MM-DD the sitemap
    // spec wants, with no timezone arithmetic to get wrong.
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...present], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return /^\d{4}-\d{2}-\d{2}$/.test(out.trim()) ? out.trim() : ''
  } catch {
    return '' // no git, shallow clone, whatever — the entry just keeps no date
  }
}

function main() {
  if (!existsSync(SITEMAP)) {
    console.log(`[sitemap] ${SITEMAP} not found — nothing to stamp.`)
    return
  }
  const xml = readFileSync(SITEMAP, 'utf8')
  const dates = new Map()
  for (const [path, files] of Object.entries(SOURCES)) {
    const d = lastCommitDate(files)
    if (d) dates.set(path, d)
  }

  let stamped = 0, skipped = 0
  const out = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)
    if (!loc) return block
    // Everything after the site root: ".../cake-crumb/shop" → "/shop", and the
    // root itself → "/".
    const path = '/' + loc[1].replace(/^https?:\/\/[^/]+\/[^/]*\/?/, '')
    const date = dates.get(path === '/' ? '/' : path.replace(/\/$/, ''))
    if (!date) { skipped++; return block }
    stamped++
    const tag = `<lastmod>${date}</lastmod>`
    // Idempotent: replace an existing stamp rather than adding a second one.
    return /<lastmod>/.test(block)
      ? block.replace(/<lastmod>[^<]*<\/lastmod>/, tag)
      : block.replace(/(<loc>[^<]+<\/loc>)/, `$1\n    ${tag}`)
  })

  writeFileSync(SITEMAP, out)
  console.log(`[sitemap] stamped ${stamped} url(s) from git, left ${skipped} without a date.`)
}

main()
