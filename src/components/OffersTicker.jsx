import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiGift, FiArrowRight } from 'react-icons/fi'
import { OFFERS_ON, activeOffers, midMonthWindow } from '../data/offers.js'
import { useOfferClock } from '../hooks/useOfferClock.js'

const EVERY_MS = 3800

/**
 * One offer at a time, in a light pill under the Home hero.
 *
 * Replaced a full-width dark scrolling ribbon, which shouted over the soft
 * blush design. This keeps the site's palette (white, blush, rose): each offer
 * slides up into place, rests, and the next follows. The pill links to the
 * offer showing; hovering or focusing it holds the current one so it can be
 * read; the dots jump straight to an offer. Under prefers-reduced-motion it
 * does not rotate on its own — the dots still work.
 */
export default function OffersTicker() {
  const now = useOfferClock()
  const offers = OFFERS_ON ? activeOffers(now) : []
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = offers.length

  useEffect(() => {
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (paused || still || count < 2) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % count), EVERY_MS)
    return () => clearInterval(id)
  }, [paused, count])

  if (!count) return null
  const o = offers[index % count]
  const mid = midMonthWindow(now)
  const until = mid.to.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  return (
    <div className="cc-ticker" data-no-reveal>
      <Link
        to={`/offers#${o.id}`}
        className={`cc-ticker__pill${o.id === 'mid-month' ? ' is-hot' : ''}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <span className="cc-ticker__icon" aria-hidden><FiGift size={15} /></span>
        <span className="cc-ticker__window">
          {/* Keyed on the offer, so each change remounts and slides in. */}
          <span key={o.id} className="cc-ticker__text">
            <strong>{o.name}</strong>
            <span className="cc-ticker__sep" aria-hidden> · </span>
            {(o.giftShort || o.gift).toLowerCase()} free
            {o.id === 'mid-month' && <span className="cc-ticker__until"> until {until}</span>}
          </span>
        </span>
        <span className="cc-ticker__go">See offer <FiArrowRight size={13} aria-hidden /></span>
      </Link>
      <div className="cc-ticker__dots" role="group" aria-label="Choose an offer">
        {offers.map((x, i) => (
          <button
            key={x.id}
            type="button"
            className={`cc-ticker__dot${i === index % count ? ' is-active' : ''}`}
            aria-label={x.name}
            aria-pressed={i === index % count}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
