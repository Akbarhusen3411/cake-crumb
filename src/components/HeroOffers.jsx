import { Link } from 'react-router-dom'
import { FiGift, FiArrowRight } from 'react-icons/fi'
import { OFFERS_ON, activeOffers } from '../data/offers.js'
import { useOfferClock } from '../hooks/useOfferClock.js'

// Where each sticker sits on the hero photo, and the side it flies in from.
const SLOTS = ['top', 'right', 'bottom']

/**
 * Three offer "stickers" over the Home hero photo — the first thing a visitor
 * sees, so the offers are noticed before any scrolling.
 *
 * They fly in one after another (from the top, the right, then the bottom) and
 * then float gently, each out of step with the others. Each is a link to its
 * offer on /offers. The first three running offers are used, so from the 13th
 * to the 20th the Mid-Month Treat leads. On a phone (<576px) they are hidden
 * altogether: they covered the photo, and the offers list follows the hero.
 *
 * Kept out of ScrollReveal (data-no-reveal): they carry their own entrance.
 */
export default function HeroOffers() {
  const now = useOfferClock()
  if (!OFFERS_ON) return null
  const picks = activeOffers(now).slice(0, SLOTS.length)

  return (
    <div className="cc-hero-stickers" data-no-reveal>
      {picks.map((o, i) => (
        <Link
          key={o.id}
          to={`/offers#${o.id}`}
          className={`cc-hero-sticker cc-hero-sticker--${SLOTS[i]}${o.id === 'mid-month' ? ' is-hot' : ''}`}
        >
          <span className="cc-hero-sticker__icon" aria-hidden><FiGift size={15} /></span>
          <span className="cc-hero-sticker__text">
            <span className="cc-hero-sticker__name">
              {o.id === 'mid-month' ? 'Limited time · ' : ''}{o.name}
            </span>
            <span className="cc-hero-sticker__gift">Free: {(o.giftShort || o.gift).toLowerCase()}</span>
          </span>
          <FiArrowRight size={14} className="cc-hero-sticker__go" aria-hidden />
        </Link>
      ))}
    </div>
  )
}
