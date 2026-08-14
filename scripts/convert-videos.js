/**
 * VIDEO PIPELINE — iPhone .MOV → web .mp4 (+ poster frame)
 *
 * Why this exists: the bakery's phone records HEVC (H.265) inside a .MOV
 * container. That combination plays in Safari and nowhere else — Chrome,
 * Firefox and every Android browser show a black box. The clips are also
 * 4K/60 and 15–115 MB each, and GitHub refuses any single file over 100 MB.
 *
 * So every clip is re-encoded to H.264 MP4, which every browser since ~2011
 * plays, and shrunk to a size a phone on mobile data can actually stream.
 *
 * Decisions baked in here:
 *   • AUDIO IS STRIPPED (-an). The kitchen clips have background noise, and a
 *     muted video is what lets it autoplay at all — browsers block autoplay
 *     with sound. No sound also means no surprise noise for the customer.
 *   • +faststart moves the index to the front of the file so playback can
 *     begin before the whole clip has downloaded. Without it a video only
 *     starts once fully loaded.
 *   • yuv420p — the one pixel format every device decodes. iPhone footage is
 *     often 4:2:2, which Android silently refuses.
 *   • Long clips are trimmed to MAX_SECONDS. This is a storefront strip, not
 *     a film; a 58-second cupcake video is 4x the bytes for the same trust.
 *   • Portrait and landscape are both kept as shot — the strip handles either.
 *
 * Run:  npm run convert-videos
 * Source clips stay untouched in public/products/; output lands in public/videos/.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// Sources are looked for in BOTH places, in this order: a clip is dropped into
// public/products/ off the phone, and moved to media-originals/ once converted
// (Vite copies public/ into dist/ verbatim, so a 100 MB .MOV left there would
// be pushed to gh-pages). Checking both means a re-run still finds every source
// instead of reporting the already-processed ones as missing.
const SRC_DIRS = [path.resolve('public/products'), path.resolve('media-originals/products')]
const OUT = path.resolve('public/videos')

const findSource = (name) => SRC_DIRS.map((d) => path.join(d, name)).find((p) => fs.existsSync(p))

const MAX_SECONDS = 15 // longest clip we ship
const LONG_EDGE = 1280 // scale so the longest side is this; keeps portrait portrait
const CRF = 30 // 28–32 is the sweet spot for food video at this size

// The clips worth showing, in the order the strip should play them, with the
// caption the customer reads. Keys are the source file names in public/products/.
// Anything not listed here is ignored, which is how the duplicate drops
// (`IMG_8138 (1).MOV`, `IMG_8378 (1).MOV`, `IMG_8378 (2).MOV`) stay out.
export const CLIPS = [
  // IMG_8378 ("Spreading the strawberry topping") was dropped at the owner's
  // request — it led the strip and showed a bare hand on the cake.
  { src: 'IMG_8382.MOV', out: 'cheesecake-piping', title: 'Piping the cream by hand' },
  { src: 'IMG_8389.mov', out: 'cheesecake-garnish', title: 'Finishing with pistachio' },
  { src: 'IMG_8121.MOV', out: 'cupcake-piping-pink', title: 'Piping a strawberry cupcake' },
  { src: 'IMG_8123.mov', out: 'cupcake-piping-biscoff', title: 'Biscoff buttercream, swirl by swirl' },
  { src: 'IMG_8122.mov', out: 'cupcake-rose-swirl', title: 'A rose swirl, finished' },
  { src: 'IMG_8116.MOV', out: 'cupcake-pistachio-close', title: 'Pistachio cupcake, up close' },
  { src: 'IMG_8138.MOV', out: 'cupcake-box-six', title: 'A box of six, ready to go' },

  // WhatsApp drops. Already H.264/yuv420p, so they would play as-is — but they
  // carry an AAC track, the first runs past MAX_SECONDS, and one is landscape.
  // Re-encoding through the same path fixes all three and normalises them to
  // the 9:16 the strip's cards expect.
  { src: 'WhatsApp Video 2026-08-14 at 12.24.51 PM.mp4', out: 'cupcake-caramel-drizzle', title: 'A caramel drizzle, poured by hand' },
  { src: 'WhatsApp Video 2026-08-14 at 12.25.34 PM.mp4', out: 'cupcake-vanilla-swirl', title: 'Piping a vanilla swirl' },
  // Shot landscape, unlike every other clip. Centre-cropped to 9:16 rather than
  // letterboxed: it is a slow pan across the tubs, so there is a tub dead-centre
  // at every moment and the crop loses nothing that matters.
  { src: 'WhatsApp Video 2026-08-14 at 12.26.05 PM.mp4', out: 'milkcake-tubs-pan', title: 'Every flavour, tub by tub', portrait: true },
]

const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg'

function run(args) {
  execFileSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] })
}

fs.mkdirSync(OUT, { recursive: true })

let done = 0
for (const clip of CLIPS) {
  const input = findSource(clip.src)
  if (!input) {
    console.log(`  skip  ${clip.src} — not in public/products/ or media-originals/products/`)
    continue
  }
  const mp4 = path.join(OUT, `${clip.out}.mp4`)
  const poster = path.join(OUT, `${clip.out}.jpg`)

  // `portrait: true` centre-crops a landscape source to 9:16 before scaling, so
  // a landscape clip fills the same card as the rest instead of being crushed
  // into it by the CSS. The expression is a no-op on a source that is already
  // 9:16 or taller, so it is safe to leave on.
  const crop = clip.portrait
    ? "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',"
    : ''

  // Longest side -> LONG_EDGE, other side even (H.264 needs even dimensions).
  const scale = `scale='if(gt(iw,ih),${LONG_EDGE},-2)':'if(gt(iw,ih),-2,${LONG_EDGE})'`

  run([
    '-loglevel', 'error', '-y',
    '-i', input,
    '-t', String(MAX_SECONDS),
    '-an', // no audio — see header
    '-vf', `${crop}${scale},format=yuv420p`,
    '-c:v', 'libx264',
    '-profile:v', 'main', // main, not high — widest device support
    '-level', '4.0',
    '-preset', 'slow',
    '-crf', String(CRF),
    '-r', '30', // 60fps buys nothing at this size and costs double
    '-movflags', '+faststart',
    mp4,
  ])

  // Poster: the frame the customer sees before the video plays (and the only
  // thing they see if autoplay is blocked or data-saver is on).
  run([
    '-loglevel', 'error', '-y',
    '-ss', '1', '-i', mp4,
    '-frames:v', '1',
    '-q:v', '4',
    poster,
  ])

  const mb = (fs.statSync(mp4).size / 1048576).toFixed(1)
  console.log(`  ok    ${clip.out}.mp4  ${mb} MB`)
  done++
}

console.log(`\n${done} clips → public/videos/`)
