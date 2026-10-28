import { FiGift } from 'react-icons/fi'
import { inr } from '../data/format.js'

/**
 * A price tag in the "best deal" style: the regular price struck through on a
 * dark block, the offer price large on rose, a small "Diwali deal" flag.
 * Money still goes through inr(); the string is only split for styling
 * (symbol · rupees · paise).
 */
function money(n) {
  const m = inr(n).match(/^(\D*)([\d,]+)(\.\d+)?$/)
  return m ? { sym: m[1], whole: m[2], paise: m[3] || '' } : { sym: '', whole: inr(n), paise: '' }
}

export function PriceTag({ was, now, small = false, flag = 'Diwali deal' }) {
  const w = money(was)
  const n = money(now)
  return (
    <span className={`cc-ptag${small ? ' cc-ptag--sm' : ''}`}>
      {flag && <span className="cc-ptag__flag">{flag}</span>}
      <span className="cc-ptag__was">
        <span className="visually-hidden">Regular price </span>
        <s>{w.sym}{w.whole}<small>{w.paise}</small></s>
      </span>
      <span className="cc-ptag__now">
        <span className="visually-hidden">Diwali price </span>
        <sup>{n.sym}</sup>{n.whole}<sup>{n.paise}</sup>
      </span>
    </span>
  )
}

/**
 * An offer's deal, said simply:
 *  - `steps`  → one row per tier: "2 tubs → 🎁 3 cake pops"
 *  - `prices` → one row per pack: "10 cake pops  [₹150 | ₹139]"
 * Pure spans, because Home renders it inside a <Link>.
 * `compact` is the Home tile.
 */
export default function OfferSteps({ offer, compact = false }) {
  if (offer.prices) {
    return (
      <span className={`cc-oprices${compact ? ' cc-oprices--compact' : ''}`}>
        {offer.prices.map((p) => (
          <span key={p.label} className="cc-oprices__row">
            <span className="cc-oprices__label">
              {p.label}
              {p.note && <small>{p.note}</small>}
            </span>
            <PriceTag was={p.was} now={p.now} small={compact} flag={null} />
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className={`cc-osteps${compact ? ' cc-osteps--compact' : ''}`}>
      <span className="cc-osteps__head">{offer.stepsHead || 'Buy more, get more'}</span>
      {offer.steps.map((s) => (
        <span key={s.buy} className="cc-osteps__row">
          <span className="cc-osteps__buy">{s.buy}</span>
          <span className="cc-osteps__arrow" aria-hidden>→</span>
          <span className="cc-osteps__get">
            <FiGift aria-hidden /> {s.get} <em>free</em>
          </span>
        </span>
      ))}
    </span>
  )
}
