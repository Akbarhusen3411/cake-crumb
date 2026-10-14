// Exports menu/menu-a4.html → PDF, per-page PNGs and a phone-friendly share PDF.
//
//   node menu/build-menu.mjs && node menu/export-menu.mjs
//
// Drives headless Chrome with execFileSync (no shell) — a bash loop once wrote
// pamphlet outputs to literal wrong names, so every output's mtime is checked.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { jsPDF } from 'jspdf'

const here = path.dirname(fileURLToPath(import.meta.url))
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const url = pathToFileURL(path.join(here, 'menu-a4.html')).href
const PAGES = 7
const started = Date.now()
const pngDir = path.join(here, 'png')
fs.mkdirSync(pngDir, { recursive: true })

const chrome = (args) =>
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=10000', ...args], { stdio: 'ignore' })

// 1. Print PDF (vector text, A4, all pages)
const pdf = path.join(here, 'menu-a4.pdf')
chrome(['--no-pdf-header-footer', `--print-to-pdf=${pdf}`, url])

// 2. One 300 dpi PNG per page. A4 = 793.7 × 1122.5 CSS px → window 794 × 1123, scale 3.125,
//    cropped to 2480 × 3508.
const pngs = []
for (let n = 1; n <= PAGES; n++) {
  const raw = path.join(pngDir, `_raw-${n}.png`)
  chrome(['--force-device-scale-factor=3.125', '--window-size=794,1123', `--screenshot=${raw}`, `${url}?png&page=${n}`])
  const out = path.join(pngDir, `menu-page-${n}.png`)
  await sharp(raw).extract({ left: 0, top: 0, width: 2480, height: 3508 }).png().toFile(out)
  fs.unlinkSync(raw)
  pngs.push(out)
}

// 3. Share PDF — the page images as high-quality JPEGs, for WhatsApp / phones.
const share = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
for (const [i, p] of pngs.entries()) {
  const jpg = await sharp(p).jpeg({ quality: 86, mozjpeg: true }).toBuffer()
  if (i) share.addPage('a4')
  share.addImage(jpg, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
  // Small copy for WhatsApp status / quick sharing
  await sharp(p).resize({ width: 1400 }).jpeg({ quality: 86 }).toFile(p.replace(/\.png$/, '-small.jpg'))
}
fs.writeFileSync(path.join(here, 'menu-a4-share.pdf'), Buffer.from(share.output('arraybuffer')))

for (const f of [pdf, path.join(here, 'menu-a4-share.pdf'), ...pngs]) {
  const s = fs.statSync(f)
  console.log((s.mtimeMs >= started ? 'ok   ' : 'STALE'), path.relative(here, f), `${(s.size / 1024).toFixed(0)} KB`)
}
