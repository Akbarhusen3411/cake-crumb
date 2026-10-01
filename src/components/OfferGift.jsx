import { Link } from 'react-router-dom'
import { FiGift } from 'react-icons/fi'
import { inr } from '../data/format.js'
import { OFFERS_ON, cartOfferStatus } from '../data/offers.js'
import { useOfferClock } from '../hooks/useOfferClock.js'

/**
 * "Offer unlocked" — the cart's answer to "did my offer apply?". Used by Cart,
 * Checkout and the Shop sidebar cart.
 *
 * Display only: the gift never enters a total (see data/offers.js). Keyed on
 * the offer id, so each time the cart earns a NEW gift the card remounts and
 * its unlock animation plays again; quantity changes that keep the same gift
 * don't replay it.
 *
 * `compact` is the narrow Shop sidebar cart.
 */
export default function OfferGift({ items, subtotal, compact = false }) {
  const now = useOfferClock()
  if (!OFFERS_ON) return null
  const { offer, nudge } = cartOfferStatus(items, subtotal, now)
  if (!offer && !nudge) return null

  return (
    <div className={`cc-ogift-wrap${compact ? ' cc-ogift-wrap--compact' : ''}`} data-no-reveal>
      {offer && (
        <div key={offer.id} className="cc-ogift" role="status">
          <span className="cc-ogift__sparks" aria-hidden />
          <span className="cc-ogift__icon" aria-hidden><FiGift size={compact ? 18 : 22} /></span>
          <div className="cc-ogift__text">
            <span className="cc-ogift__eyebrow">Offer unlocked</span>
            <strong className="cc-ogift__gift">{offer.gift} — free</strong>
            <span className="cc-ogift__note">
              {offer.name} · added when we confirm on WhatsApp.{' '}
              <Link to={`/offers#${offer.id}`}>Details</Link>
            </span>
          </div>
        </div>
      )}
      {nudge && (
        <div className="cc-onudge">
          <span>
            Add <strong>{nudge.need != null ? `${inr(nudge.need)} more` : nudge.add}</strong> for{' '}
            <strong>{nudge.offer.gift.toLowerCase()}</strong> free
          </span>
          <span className="cc-onudge__bar" aria-hidden>
            <span style={{ width: `${Math.min(100, Math.round(nudge.progress * 100))}%` }} />
          </span>
        </div>
      )}
    </div>
  )
}
