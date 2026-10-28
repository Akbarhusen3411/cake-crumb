// Give every public page its own HTML file, so GitHub Pages answers 200.
//
// Run by `npm run deploy` (predeploy), after the build. GitHub Pages has no
// rewrites: a request for /cake-crumb/shop found no file and was served
// 404.html — the app still rendered, but with HTTP 404, so Google dropped
// every page except Home, and a shared /shop link previewed as Home (the raw
// HTML carried Home's title and og:url).
//
// For each URL in dist/sitemap.xml this writes dist/<route>.html (GitHub
// Pages serves /shop from shop.html with a 200, no redirect, no trailing
// slash) — a copy of dist/index.html with that page's own <title>,
// description, canonical, og:* and twitter:* tags, read from the page's
// usePageMeta({ title, description }) call so the two can't drift. The app
// boots exactly as before; usePageMeta still sets the same tags at runtime.
// Pages other than Home also drop the Home hero's preload (an unused 22 KB
// high-priority download on every other page).
//
// Never fails the deploy: a page it can't read keeps Home's tags and is
// reported.
import fs from 'node:fs'
import path from 'node:path'

const DIST = 'dist'
const SITE = 'https://akbarhusen3411.github.io/cake-crumb'
const DEFAULT_DESC = 'Cake & Crumb — handcrafted cheesecakes, milk cakes, cookies and desserts. Order on WhatsApp.'

// route → the page component that renders it (src/App.jsx)
const PAGES = {
  menu: 'Menu', shop: 'Shop', about: 'About', gallery: 'Gallery', reviews: 'Reviews',
  contact: 'Contact', faq: 'FAQ', 'track-order': 'TrackOrder', offers: 'Offers',
  'refund-policy': 'RefundPolicy', privacy: 'Privacy',
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// Unescape a JS single-quoted string body.
const unjs = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\')

function metaFor(page) {
  const src = fs.readFileSync(path.join('src', 'pages', `${page}.jsx`), 'utf8')
  const call = src.slice(src.indexOf('usePageMeta({'))
  const block = call.slice(0, call.indexOf('})'))
  const title = block.match(/title:\s*'((?:[^'\\]|\\.)*)'/)?.[1]
  const desc = block.match(/description:\s*'((?:[^'\\]|\\.)*)'/)?.[1]
  return { title: title && unjs(title), description: desc ? unjs(desc) : DEFAULT_DESC }
}

function setAttr(html, selector, value) {
  // selector: e.g. 'name="description"' — replaces that tag's content="…"
  const re = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*(")`)
  return re.test(html) ? html.replace(re, `$1${value}$2`) : html
}

try {
  const base = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
    // the source wraps some tags over several lines — normalise to one
    .replace(/<meta\s*\n\s*(name|property)="([^"]+)"\s*\n\s*content="/g, '<meta $1="$2" content="')
  const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8')
  const routes = [...sitemap.matchAll(/<loc>[^<]*\/cake-crumb\/([^<]*)<\/loc>/g)].map((m) => m[1]).filter(Boolean)
  let written = 0
  for (const route of routes) {
    const page = PAGES[route]
    if (!page) { console.warn(`  prerender: no page mapped for /${route} — add it to PAGES`); continue }
    const { title, description } = metaFor(page)
    if (!title) { console.warn(`  prerender: couldn't read usePageMeta in ${page}.jsx — /${route} keeps Home's tags`) }
    const full = esc(title ? `${title} | Cake & Crumb` : 'Cake & Crumb')
    const desc = esc(description)
    const url = `${SITE}/${route}`
    let html = base.replace(/<title>[^<]*<\/title>/, `<title>${full}</title>`)
    html = setAttr(html, 'name="description"', desc)
    html = setAttr(html, 'property="og:title"', full)
    html = setAttr(html, 'property="og:description"', desc)
    html = setAttr(html, 'property="og:url"', url)
    html = setAttr(html, 'name="twitter:title"', full)
    html = setAttr(html, 'name="twitter:description"', desc)
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    // Home's hero preload is useless here
    html = html.replace(/<link\s+rel="preload"\s+as="image"\s+imagesrcset="[^"]*hero-roses[^"]*"[^>]*\/>\s*/s, '')
    fs.writeFileSync(path.join(DIST, `${route}.html`), html)
    written++
  }
  console.log(`  prerender: wrote ${written} page files (${routes.length} sitemap URLs + Home)`)
} catch (err) {
  console.warn('  prerender: skipped —', err.message)
}
