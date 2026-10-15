// Renders review-poster.html → review-poster.pdf (A4) + png/review-poster.png (300 dpi),
// and google-review-qr-g.png (the QR with the G badge), then decodes both to prove they scan.
// Run from the repo root: node social/export-review-poster.cjs
// jsQR is not a project dependency — pass its folder as the first argument to run the scan check.
const { execFileSync } = require('child_process')
const path = require('path'), fs = require('fs')
const { pathToFileURL } = require('url')
const sharp = require('sharp')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const dir = __dirname
const src = pathToFileURL(path.join(dir, 'review-poster.html')).href
const URL = 'https://search.google.com/local/writereview?placeid=ChIJy73gGoNZXjkRBkwvQscbki4'
fs.mkdirSync(path.join(dir, 'png'), { recursive: true })
const pdf = path.join(dir, 'review-poster.pdf'), png = path.join(dir, 'png', 'review-poster.png')
const t0 = Date.now()
execFileSync(CHROME, ['--headless=new', '--virtual-time-budget=8000', '--no-pdf-header-footer', '--print-to-pdf=' + pdf, src], { stdio: 'ignore' })
execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--virtual-time-budget=8000', '--force-device-scale-factor=3.125',
  '--window-size=794,1123', '--screenshot=' + png, src + '?png'], { stdio: 'ignore' })
for (const f of [pdf, png]) console.log(path.basename(f), fs.statSync(f).mtimeMs >= t0 ? 'ok' : 'STALE')

;(async () => {
  // standalone QR with the G badge: 2000px code, badge 22% wide on a white disc
  const G = fs.readFileSync(path.join(dir, 'review-poster.html'), 'utf8').match(/<div class="g">(<svg[\s\S]*?<\/svg>)/)[1]
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
  const qr = await sharp(path.join(dir, 'google-review-qr.png')).toBuffer()
  const disc = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="440" height="440"><circle cx="220" cy="220" r="220" fill="#fff"/></svg>')
  const g = await sharp(Buffer.from(G), { density: 1200 }).resize(280, 280).png().toBuffer()
  await sharp(qr).composite([{ input: disc, left: 780, top: 780 }, { input: g, left: 860, top: 860 }]).png().toFile(path.join(dir, 'google-review-qr-g.png'))
  console.log('google-review-qr-g.png ok')
  const jsqrDir = process.argv[2]
  if (!jsqrDir) return console.log('(scan check skipped — pass the jsqr folder)')
  const jsQR = require(jsqrDir)
  for (const [f, w] of [['google-review-qr-g.png', 800], ['png/review-poster.png', 1240]]) {
    const { data, info } = await sharp(path.join(dir, f)).resize(w).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const r = jsQR(new Uint8ClampedArray(data), info.width, info.height)
    console.log('scan', f, r ? (r.data === URL ? 'OK → review link' : 'WRONG: ' + r.data) : 'FAILED')
  }
})()
