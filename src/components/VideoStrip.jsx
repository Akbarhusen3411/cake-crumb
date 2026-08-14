import { useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { asset } from '../data/images.js'

/**
 * VIDEO STRIP — real kitchen footage, no sound.
 *
 * The point of this section is trust: a customer who can watch the cream being
 * piped by hand believes the photos. So these are the bakery's own clips, not
 * stock, and the copy says so.
 *
 * WHY EVERY ATTRIBUTE BELOW IS LOAD-BEARING — a video that silently refuses to
 * play looks exactly like a broken site, and each of these fixes one device:
 *
 *   • muted + playsInline — iOS Safari REFUSES to autoplay without both, and
 *     without playsInline it hijacks the screen into its native fullscreen
 *     player the moment it starts. `muted` must also be set as a DOM property
 *     (see the effect below), not only as a React attribute.
 *   • loop — the clips are 3–15s; looping makes them read as ambience rather
 *     than something the customer must sit through.
 *   • preload="none" + poster — nothing downloads until it is played or
 *     scrolled to. Eight clips eagerly loading would cost a phone ~6 MB on
 *     arrival, which is the whole page budget several times over.
 *   • No <source type> juggling: every clip is H.264 MP4 (see
 *     scripts/convert-videos.js). The phone's original HEVC .MOV plays only in
 *     Safari, which is why nothing here points at one.
 *
 * Autoplay is driven by IntersectionObserver rather than the `autoplay`
 * attribute: eight autoplaying videos compete for decoder slots (Android caps
 * concurrent hardware decoders, often at 2–4) and clips further down the strip
 * just never start. Playing only what is on screen — and pausing what leaves —
 * keeps that within budget on the weakest device.
 *
 * Anyone who prefers reduced motion gets still posters and a play button, which
 * is also the fallback when a browser rejects the autoplay promise.
 */

const CLIPS = [
  { file: 'cheesecake-piping', title: 'Piping the cream by hand' },
  { file: 'cheesecake-garnish', title: 'Finishing with pistachio' },
  { file: 'cupcake-piping-pink', title: 'Piping a strawberry cupcake' },
  { file: 'cupcake-piping-biscoff', title: 'Biscoff buttercream, swirl by swirl' },
  { file: 'cupcake-rose-swirl', title: 'A rose swirl, finished' },
  { file: 'cupcake-pistachio-close', title: 'Pistachio cupcake, up close' },
  { file: 'cupcake-caramel-drizzle', title: 'A caramel drizzle, poured by hand' },
  { file: 'cupcake-vanilla-swirl', title: 'Piping a vanilla swirl' },
  { file: 'milkcake-tubs-pan', title: 'Every flavour, tub by tub' },
  { file: 'cupcake-box-six', title: 'A box of six, ready to go' },
]

function Clip({ file, title, allowAutoplay }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Belt and braces: Safari checks the PROPERTY, and a React-rendered
    // `muted` attribute alone has been unreliable across versions.
    el.muted = true
    el.defaultMuted = true

    if (!allowAutoplay) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() rejects on some browsers/data-saver modes. Swallow it and
          // leave the poster + controls, rather than logging an unhandled reject.
          el.play?.().catch(() => setFailed(true))
        } else {
          el.pause?.()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [allowAutoplay])

  return (
    <figure className="cc-video-card">
      <video
        ref={ref}
        className="cc-video-card__media"
        poster={asset(`/videos/${file}.jpg`)}
        preload="none"
        muted
        loop
        playsInline
        // Controls appear only when we are not driving playback ourselves, so
        // the customer always has a way to start it.
        controls={!allowAutoplay || failed}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        aria-label={title}
      >
        <source src={asset(`/videos/${file}.mp4`)} type="video/mp4" />
        {/* Last resort: a browser with no MP4 support still sees the poster. */}
        <img src={asset(`/videos/${file}.jpg`)} alt={title} />
      </video>
      <figcaption className="cc-video-card__caption">{title}</figcaption>
    </figure>
  )
}

/**
 * The scrolling track, plus the arrows that make it usable.
 *
 * THE BUG THIS FIXES: the rail overflows its container by design (seven 9:16
 * cards never fit a 1296px container), and the scrollbar is hidden to keep the
 * strip clean. On a phone that's fine — you swipe. On a desktop with an ordinary
 * mouse there was no horizontal scroll gesture and no scrollbar, so the seventh
 * clip sat clipped at the right edge and could not be reached at all.
 *
 * So: explicit prev/next buttons that scroll by one card, disabled at each end
 * so they never look live when they'd do nothing. `scrollWidth - clientWidth`
 * is the maximum scrollLeft; the 2px slack absorbs sub-pixel rounding, which
 * otherwise leaves "next" enabled forever at the right-hand end.
 */
function Rail({ children }) {
  const ref = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const measure = () => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 })
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    // Cards are sized in vw/fr, so a resize changes whether anything overflows.
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [])

  const nudge = (dir) => {
    const el = ref.current
    if (!el) return
    // One card plus its gap, read off the DOM rather than hard-coded — the card
    // width is responsive.
    const card = el.querySelector('.cc-video-card')
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="cc-video-railwrap">
      <button
        type="button"
        className="cc-video-arrow cc-video-arrow--prev"
        onClick={() => nudge(-1)}
        disabled={edge.start}
        aria-label="Previous clips"
      >
        <FiChevronLeft />
      </button>

      <div className="cc-video-rail" ref={ref}>
        {children}
      </div>

      <button
        type="button"
        className="cc-video-arrow cc-video-arrow--next"
        onClick={() => nudge(1)}
        disabled={edge.end}
        aria-label="More clips"
      >
        <FiChevronRight />
      </button>
    </div>
  )
}

export default function VideoStrip() {
  // Respect the OS "reduce motion" setting. Read in the state initialiser, not
  // an effect: an effect would render once with autoplay on and then correct
  // itself, which is both a wasted render and a flash of the thing the setting
  // asked us not to do.
  const [allowAutoplay] = useState(
    () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )

  return (
    <section className="cc-video-strip">
      {/* Asymmetric on purpose: normal room above, very little below, because
          the gallery filters sit directly under this. Set here rather than in
          CSS — Bootstrap's spacing utilities carry !important, so a
          `.cc-video-strip > .container` rule loses to `.py-5` silently. */}
      <div className="container pt-4 pt-md-5 pb-2">
        <div className="text-center mb-4">
          <span className="eyebrow mb-3 d-inline-flex">From Our Kitchen</span>
          <h2 className="cc-video-strip__title">Watch It Being Made</h2>
          <p className="cc-video-strip__lede">
            Every order is baked, piped and finished by hand in our Vaso
            kitchen. These are our own cakes, filmed as they were made.
          </p>
        </div>

        <Rail>
          {CLIPS.map((c) => (
            <Clip key={c.file} {...c} allowAutoplay={allowAutoplay} />
          ))}
        </Rail>
      </div>
    </section>
  )
}
