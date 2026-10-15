// Renders post.html?n=1..6 → post-N.png (1080 × 1350). Run from the repo root: node social/posts/export.cjs
const { execFileSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const dir = __dirname
for (let n = 1; n <= 6; n++) {
  const out = path.join(dir, `post-${n}.png`)
  const t0 = Date.now()
  execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--virtual-time-budget=6000', '--force-device-scale-factor=2',
    '--window-size=540,675', '--screenshot=' + out, pathToFileURL(path.join(dir, 'post.html')).href + '?n=' + n], { stdio: 'ignore' })
  console.log(`post-${n}.png`, fs.statSync(out).mtimeMs >= t0 ? 'ok' : 'STALE')
}
