import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiGift, FiX } from 'react-icons/fi'
import { offerNow, activeOffers } from '../data/offers.js'
import { isDiwaliPreview } from '../data/festivals.js'

/**
 * Diwali & New Year welcome — a full-screen greeting shown before the site,
 * 5–15 November only, on EVERY visit (each page load — the owner's choice,
 * not once a day). While the Diwali offers run its button reads "Step in for
 * sweet Diwali offers" and opens /offers; ×, Esc and "just browse" fade it
 * away onto the page that was opened.
 *
 * - The window is WINDOW below; change it there. It reads the visitor's own
 *   clock through offerNow(), so `?testdate=2026-11-08` works on the dev server.
 * - Moving between pages doesn't bring it back (it's mounted once, in App);
 *   a reload or a new visit does.
 * - Never over Cart, Checkout, the order confirmation or admin.
 * - The quotes are our own lines, not attributed to anyone (see MidMonthPopup).
 * - The card is frosted glass over drifting colour blobs; its parts float in
 *   one after another. All motion stops under prefers-reduced-motion.
 * - Body scroll isn't locked (CLAUDE.md, Navbar); the backdrop is opaque.
 */

const WINDOW = { month: 11, fromDay: 5, toDay: 15 } // 5–15 November, inclusive
const HIDDEN_ON = ['/cart', '/checkout', '/confirm-order', '/admin']
const LEAVE_MS = 450
const LOGO_BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const LOGO_SRC = `${LOGO_BASE}/logo_final.webp`

const QUOTES = [
  'May your home glow with diyas, your table with sweets, and your heart with the people you love.',
  'This Diwali, may every lamp you light bring back a memory worth keeping.',
  'A new year is a fresh page — may yours be written in kindness, laughter and a little sweetness.',
  'The brightest light this Diwali is the one we share with each other.',
  'May the new year bring you more reasons to celebrate, and more people to celebrate with.',
  'Light a lamp for every blessing, and keep one burning for the year ahead.',
  'Sweets taste sweeter when they are shared — wishing you a Diwali full of sharing.',
  'May this new year be gentle on you, generous to you, and full of love.',
]

// Rangoli petals, every 22.5° (16 round the flower).
const PETALS = Array.from({ length: 16 }, (_, i) => i * 22.5)

// Fairy-light bulbs along a gentle sag: x in % of the width, y in px.
const LIGHTS = Array.from({ length: 17 }, (_, i) => {
  const t = i / 16
  return { x: 2 + t * 96, y: Math.round(6 + 34 * (1 - (2 * t - 1) ** 2)) }
})
// The wire in a 100 × 20 box drawn 44px tall (so 1 unit = 2.2px), through the
// same parabola as the bulbs: 6px → 2.7, 40px at the middle → control 33.7.
const LIGHT_STRING = 'M0 1.5 L2 2.7 Q50 33.7 98 2.7 L100 1.5'

function inWindow(now) {
  const d = now.getDate()
  return now.getMonth() + 1 === WINDOW.month && d >= WINDOW.fromDay && d <= WINDOW.toDay
}


export default function DiwaliWelcome() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const allowedHere = !HIDDEN_ON.some((r) => pathname === r || pathname.startsWith(r + '/'))
  // Decided on the first render, so the greeting is what the visitor sees first.
  // ?diwali=preview shows it on any date and every time (see festivals.js).
  const [preview] = useState(isDiwaliPreview)
  const [open, setOpen] = useState(() => {
    const now = offerNow()
    // Every time the site is opened (each page load) from 5 to 15 Nov — the
    // owner wants it on every visit, not once a day.
    return allowedHere && (preview || inWindow(now))
  })
  const [leaving, setLeaving] = useState(false)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    dialogRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setLeaving(true) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, preview])

  useEffect(() => {
    if (!leaving) return undefined
    const id = setTimeout(() => setOpen(false), LEAVE_MS)
    return () => clearTimeout(id)
  }, [leaving])

  if (!open || !allowedHere) return null
  const enter = () => setLeaving(true)
  // The main button always lands on the Home page (the owner's choice); the ×
  // and Esc just close it on the page that was opened.
  const goHome = () => {
    setLeaving(true)
    if (pathname !== '/') navigate('/')
  }
  const offers = activeOffers().filter((o) => o.season === 'diwali')

  return createPortal(
    <div className={`cc-diwali${leaving ? ' cc-diwali--leaving' : ''}`}>
      {/* Soft colour blobs drifting behind the glass card — what it frosts. */}
      <span className="cc-diwali__blobs" aria-hidden>
        <span /><span /><span /><span />
      </span>

      {/* A gold rangoli turning slowly behind the card. */}
      <svg className="cc-diwali__rangoli" viewBox="-100 -100 200 200" aria-hidden>
        {PETALS.map((r) => (
          <g key={r} transform={`rotate(${r})`}>
            <path d="M0 -20 C 7 -28, 7 -40, 0 -48 C -7 -40, -7 -28, 0 -20 Z" />
            <path d="M0 -54 C 10 -62, 10 -76, 0 -86 C -10 -76, -10 -62, 0 -54 Z" />
            <circle cx="0" cy="-93" r="2.2" />
          </g>
        ))}
        {PETALS.map((r) => (
          <circle key={`d${r}`} cx="0" cy="-51" r="1.3" transform={`rotate(${r + 11.25})`} />
        ))}
        <circle r="8" />
        <circle r="14" />
        <circle r="51" />
        <circle r="97" />
      </svg>

      {/* A string of fairy lights sagging across the top of the screen. */}
      <span className="cc-diwali__lights" aria-hidden>
        <svg viewBox="0 0 100 20" preserveAspectRatio="none">
          <path d={LIGHT_STRING} vectorEffect="non-scaling-stroke" />
        </svg>
        {LIGHTS.map((b, i) => (
          <span key={i} style={{ left: `${b.x}%`, top: `${b.y}px`, animationDelay: `${(i % 5) * 0.35}s` }} />
        ))}
      </span>
      <span className="cc-diwali__sparks" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => <span key={i} />)}
      </span>

      <div
        ref={dialogRef}
        className="cc-diwali__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-diwali-title"
        aria-describedby="cc-diwali-quote"
        tabIndex={-1}
      >
        <button type="button" className="cc-diwali__close" onClick={enter} aria-label="Close">
          <FiX size={18} />
        </button>

        {/* Left (or top): the greeting. */}
        <div className="cc-diwali__main">
          {/* The site's lockup, stacked: mark, wordmark, tagline (as Logo.jsx). */}
          <div className="cc-diwali__brand">
            <img
              src={LOGO_SRC}
              srcSet={`${LOGO_BASE}/logo_final-400.webp 400w, ${LOGO_BASE}/logo_final-800.webp 800w`}
              sizes="200px"
              width={400}
              height={278}
              alt=""
              className="cc-diwali__logo"
            />
            <span className="cc-diwali__word">
              CAKE<span className="cc-diwali__amp">&amp;</span>CRUMB
            </span>
            <span className="cc-diwali__tagline">The gourmet chocolate and berry boutique!</span>
          </div>

          <span className="cc-diwali__rule" aria-hidden>
            <span className="cc-diwali__diyas"><span>🪔</span><span>🪔</span><span>🪔</span></span>
          </span>

          <h2 id="cc-diwali-title" className="cc-diwali__title">
            Happy Diwali
            <span className="cc-diwali__script">&amp; a Happy New Year</span>
          </h2>

          <blockquote className="cc-diwali__quote">
            <span className="cc-diwali__qmark" aria-hidden>“</span>
            <p id="cc-diwali-quote">{quote}</p>
            <footer>— with love, from our kitchen to yours</footer>
          </blockquote>

          <p className="cc-diwali__sweet">
            We can’t wait to sweeten <span className="cc-diwali__keep">your day!<span className="cc-diwali__heart" aria-hidden> ♥</span></span>
          </p>

          {/* One button, which enters the website on the Home page (the owner's choice). While
              the Diwali offers run it says so; the offers themselves live on
              /offers, Home and the Shop. */}
          {offers.length > 0 ? (
            <>
              <button type="button" className="btn-rose cc-diwali__enter" onClick={goHome}>
                <FiGift aria-hidden /> Step in for sweet Diwali offers <FiArrowRight aria-hidden />
              </button>
            </>
          ) : (
            <button type="button" className="btn-rose cc-diwali__enter" onClick={goHome}>
              Step into the sweetness <FiArrowRight aria-hidden />
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body,
  )
}
