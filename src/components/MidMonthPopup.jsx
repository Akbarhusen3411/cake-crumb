import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiGift, FiX, FiClock } from 'react-icons/fi'
import { u } from '../data/images.js'
import { inr } from '../data/format.js'
import { OFFERS_ON, OFFER_RULES, offerById, midMonthWindow, midMonthKey, daysUntil } from '../data/offers.js'
import { useOfferClock } from '../hooks/useOfferClock.js'

/**
 * The Mid-Month welcome — a pop-up that greets visitors from 00:00 on the 13th
 * to 23:59 on the 20th, once per month per device.
 *
 * - "Once" is remembered as the month key ("2026-10") in localStorage, so it
 *   comes back next month by itself and never nags within one window.
 * - Never over Cart, Checkout, the order confirmation, /offers (it's already
 *   there) or admin — nobody should be interrupted mid-order.
 * - Esc, the ×, "Maybe later" and a click on the backdrop all close it; focus
 *   moves into it on open and back where it was on close. It doesn't lock body
 *   scroll (see CLAUDE.md, Navbar — the opaque backdrop hides what moves).
 * - The quotes are our own lines, not attributed to anyone famous: misquoted
 *   "famous sayings" are everywhere, and a bakery shouldn't add to them.
 *
 * On the dev server, `&popup=again` in the URL forgets that it was seen.
 */

const SEEN_KEY = 'cc_midmonth_popup_v1'
const DELAY_MS = 1500
const HIDDEN_ON = ['/cart', '/checkout', '/confirm-order', '/offers', '/admin']

const QUOTES = [
  'Some days don’t need a reason — just a little something sweet.',
  'Halfway through the month, and you’ve earned a small celebration.',
  'The sweetest moments are the ones we share.',
  'A little sugar, a lot of love — baked just for you.',
  'Here’s to slowing down, and savouring every bite.',
  'Good things are made by hand, and given from the heart.',
  'Make today a little sweeter than yesterday.',
  'Love lives in the little things — like a box of cake pops.',
]

let forgotOnce = false

function alreadySeen(key) {
  try {
    if (import.meta.env.DEV && !forgotOnce && new URLSearchParams(window.location.search).get('popup') === 'again') {
      forgotOnce = true
      localStorage.removeItem(SEEN_KEY)
    }
    return localStorage.getItem(SEEN_KEY) === key
  } catch {
    return true // storage blocked: don't risk showing it on every page
  }
}

function markSeen(key) {
  try { localStorage.setItem(SEEN_KEY, key) } catch { /* storage blocked */ }
}

export default function MidMonthPopup() {
  const now = useOfferClock()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const dialogRef = useRef(null)
  const returnFocus = useRef(null)

  const mid = midMonthWindow(now)
  const key = midMonthKey(now)
  const allowedHere = !HIDDEN_ON.some((r) => pathname === r || pathname.startsWith(r + '/'))
  const eligible = OFFERS_ON && mid.live && allowedHere

  // Open after a beat, so the page is seen first. Marked as seen the moment it
  // opens — moving to another page must not bring it back.
  useEffect(() => {
    if (!eligible || open || alreadySeen(key)) return undefined
    const id = setTimeout(() => {
      returnFocus.current = document.activeElement
      markSeen(key)
      setOpen(true)
    }, DELAY_MS)
    return () => clearTimeout(id)
  }, [eligible, open, key])

  useEffect(() => {
    if (!open) return undefined
    dialogRef.current?.querySelector('[data-autofocus]')?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      returnFocus.current?.focus?.()
    }
  }, [open])

  // Never drawn over a page it shouldn't cover, even if it was already open.
  if (!open || !allowedHere) return null

  const offer = offerById('mid-month')
  const left = daysUntil(mid.to, now)
  const ends = mid.to.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const close = () => setOpen(false)
  const claim = () => {
    setOpen(false)
    navigate('/offers#mid-month')
  }

  return createPortal(
    <div className="cc-mmpop" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div
        ref={dialogRef}
        className="cc-mmpop__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-mmpop-title"
        aria-describedby="cc-mmpop-desc"
      >
        <button type="button" className="cc-mmpop__close" onClick={close} aria-label="Close">
          <FiX size={18} />
        </button>

        <div className="cc-mmpop__media">
          <img src={u(offer.image)} alt="" />
          <span className="cc-mmpop__hearts" aria-hidden>
            <span>♥</span><span>♥</span><span>♥</span><span>♥</span>
          </span>
          <span className="cc-mmpop__badge"><FiGift size={14} /> Mid-Month Treat</span>
        </div>

        <div className="cc-mmpop__body">
          <blockquote className="cc-mmpop__quote">
            <p>“{quote}”</p>
            <footer>— from our kitchen to yours</footer>
          </blockquote>

          <h2 id="cc-mmpop-title" className="cc-mmpop__title">A little sweetness, just because</h2>
          <p id="cc-mmpop-desc" className="cc-mmpop__offer">
            Order {inr(OFFER_RULES.midMonth.min)} or more by {ends} and we’ll add{' '}
            <strong>{offer.gift.toLowerCase()}</strong> — free.
          </p>

          <p className="cc-mmpop__ends">
            <FiClock size={14} aria-hidden />
            {left === 0 ? 'Last day — ends at midnight tonight' : `Ends ${ends} at midnight · ${left} ${left === 1 ? 'day' : 'days'} left`}
          </p>

          <div className="cc-mmpop__actions">
            <button type="button" className="btn-rose" onClick={claim} data-autofocus>
              <FiGift /> Claim my treat
            </button>
            <button type="button" className="cc-mmpop__later" onClick={close}>Maybe later</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
