import { Link } from 'react-router-dom'
import { FiArrowRight, FiGift, FiClock } from 'react-icons/fi'
import { u, srcSet } from '../data/images.js'
import { OFFERS_ON, activeOffers, midMonthWindow, daysUntil } from '../data/offers.js'
import { useOfferClock } from '../hooks/useOfferClock.js'

const dayMonth = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/**
 * Offers on Home — one tile per offer, each a link to its card on /offers.
 * Mid-Month shows only from the 13th to the 20th, as the featured tile (two
 * columns wide): seven tiles plus one double make two even rows of four. It is
 * a spotlight on purpose — photo beside a cocoa-to-rose panel, a softly
 * pulsing gold edge, a "Limited time" ribbon, a countdown and its own Claim
 * button — because it's the one offer with a deadline. The rest of the month
 * the six everyday offers sit three across.
 *
 * Motion is deliberately quiet: ScrollReveal staggers the tiles in (they carry
 * a "-card" class, which it picks up), the photo eases in on hover, a single
 * sweep of light crosses the tile, and the gift badge floats gently. The
 * Mid-Month tile says whether it's live, with a pulsing dot, or when it opens.
 *
 * Each tile states its deal as two labelled lines, BUY and FREE, rather than a
 * condition sentence — on a phone the sentence buried which item was the gift.
 * Below 576px the tiles become a stacked list (thumbnail | deal), not a swipe
 * row: every offer is visible without sideways scrolling.
 */
export default function OffersBand() {
  const now = useOfferClock()
  if (!OFFERS_ON) return null
  const mid = midMonthWindow(now)
  const offers = activeOffers(now)
  const left = mid.live ? daysUntil(mid.to, now) : null
  const endsLine = left === 0
    ? 'Last day — ends at midnight'
    : `Ends ${dayMonth(mid.to)} · ${left} ${left === 1 ? 'day' : 'days'} left`

  return (
    <section className="cc-home-offers" aria-labelledby="home-offers-title">
      <div className="container py-5">
        <div className="cc-home-offers__head">
          <div>
            <span className="eyebrow">Offers</span>
            <h2 id="home-offers-title" className="section-title mt-3">Something Extra, On Us</h2>
            <p className="cc-home-offers__lede">
              Menu prices, with free treats added to your order. No codes — we pack the gift in when we confirm.
            </p>
          </div>
          <Link to="/offers" className="btn-rose cc-home-offers__all">
            All offers <FiArrowRight />
          </Link>
        </div>

        {/* Seven tiles (Mid-Month live) lay out four across with Mid-Month
            double width; the six everyday ones lay out three across. */}
        <div className={`cc-home-offers__grid${mid.live ? '' : ' cc-home-offers__grid--six'}`}>
          {offers.map((o, i) => (
            <Link
              key={o.id}
              to={`/offers#${o.id}`}
              className={`cc-offer-card${o.id === 'mid-month' ? ' cc-offer-card--feature' : ''}`}
            >
              <span className="cc-offer-card__media">
                <img
                  src={u(o.image)}
                  srcSet={srcSet(o.image)}
                  sizes="(min-width: 992px) 360px, (min-width: 576px) 45vw, 112px"
                  alt=""
                  loading="lazy"
                />
                <span className="cc-offer-card__num" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                {o.id === 'mid-month' && (
                  <span className={`cc-offer-card__live${mid.live ? ' is-live' : ''}`}>
                    {mid.live ? <><span className="cc-offers-dot" aria-hidden /> On now</> : `From ${dayMonth(mid.from)}`}
                  </span>
                )}
              </span>
              <span className="cc-offer-card__body">
                {o.id === 'mid-month' && <span className="cc-offer-card__ribbon">Limited time</span>}
                <span className="cc-offer-card__tag">{o.tag}</span>
                <span className="cc-offer-card__name">{o.name}</span>
                {/* The deal in two lines — what to buy, what comes free. The
                    full condition sentence lives on /offers. */}
                <span className="cc-offer-deal">
                  <span className="cc-offer-deal__row">
                    <span className="cc-offer-deal__label">Buy</span>
                    <span className="cc-offer-deal__text">
                      {o.buy}
                      {o.buyNote && <small>{o.buyNote}</small>}
                    </span>
                  </span>
                  <span className="cc-offer-deal__row cc-offer-deal__row--get">
                    <span className="cc-offer-deal__label"><FiGift size={12} aria-hidden /> Free</span>
                    <span className="cc-offer-deal__text">{o.get || o.gift}</span>
                  </span>
                </span>
                {o.id === 'mid-month' && (
                  <span className="cc-offer-card__spot">
                    <span className="cc-offer-card__ends"><FiClock size={13} aria-hidden /> {endsLine}</span>
                    <span className="cc-offer-card__claim">Claim now <FiArrowRight size={14} /></span>
                  </span>
                )}
              </span>
              {/* Phone only: the row is a link, and this says so. */}
              <FiArrowRight size={16} className="cc-offer-card__go" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
