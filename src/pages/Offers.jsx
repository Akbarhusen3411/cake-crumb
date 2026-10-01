import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiGift, FiShoppingBag, FiMessageCircle, FiCheckCircle, FiArrowRight,
  FiPlus, FiMinus, FiChevronDown, FiCalendar,
} from 'react-icons/fi'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { u, srcSet } from '../data/images.js'
import { inr } from '../data/format.js'
import { BULK_ORDER_MIN, DEPOSIT_PCT } from '../data/shopConfig.js'
import { useCart } from '../context/CartContext.jsx'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'
import {
  OFFERS_ON, OFFER_RULES, OFFER_PICKERS, ordinal,
  activeOffers, cartOfferStatus, midMonthWindow, daysUntil,
} from '../data/offers.js'
import { useOfferClock } from '../hooks/useOfferClock.js'

// The hero says how many offers there are, so it can't go stale when one is added.
const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
const countWord = (n) => COUNT_WORDS[n] || String(n)

const dayMonth = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/** The mid-month line for the hero: running now, or when it next opens. */
function MidMonthChip({ now }) {
  const w = midMonthWindow(now)
  if (w.live) {
    const left = daysUntil(w.to, now)
    return (
      <span className="cc-offers-chip cc-offers-chip--live">
        <span className="cc-offers-dot" aria-hidden />
        Mid-Month Treat is on — {left === 0 ? 'last day today' : `ends ${dayMonth(w.to)}`}
      </span>
    )
  }
  const inDays = daysUntil(w.from, now)
  return (
    <span className="cc-offers-chip">
      <FiCalendar size={14} aria-hidden />
      Next Mid-Month Treat: {dayMonth(w.from)} – {dayMonth(w.to)}
      {inDays > 0 && <> · in {inDays} {inDays === 1 ? 'day' : 'days'}</>}
    </span>
  )
}

/**
 * Tabs + a scrolling row of products the offer counts, each one tap from the
 * cart. Lines are built exactly as /shop builds them (see data/offers.js), so
 * the same box added here or there is one cart line.
 */
function OfferPicker({ tabs }) {
  const [tab, setTab] = useState(0)
  const { items, add, increment, decrement } = useCart()
  const qtyOf = (id) => items.find((it) => it.id === id)?.qty || 0

  return (
    <div className="cc-opick" data-no-reveal>
      {tabs.length > 1 && (
        <div className="cc-opick__tabs" role="tablist">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={tab === i}
              className={`cc-opick__tab${tab === i ? ' is-active' : ''}`}
              onClick={() => setTab(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="cc-opick__row" role={tabs.length > 1 ? 'tabpanel' : undefined}>
        {tabs[tab].items.map(({ line, label }) => {
          const qty = qtyOf(line.id)
          return (
            <div key={line.id} className={`cc-opick__item${qty ? ' is-in' : ''}`}>
              <img src={u(line.img, 200, 200)} srcSet={srcSet(line.img)} sizes="96px" alt="" loading="lazy" />
              <span className="cc-opick__name" title={line.name}>{label}</span>
              <span className="cc-opick__price">{inr(line.price)}</span>
              {qty ? (
                <span className="cc-opick__stepper">
                  <button type="button" onClick={() => decrement(line.id)} aria-label={`One fewer ${line.name}`}><FiMinus size={12} /></button>
                  <strong aria-live="polite">{qty}</strong>
                  <button type="button" onClick={() => increment(line.id)} aria-label={`One more ${line.name}`}><FiPlus size={12} /></button>
                </span>
              ) : (
                <button type="button" className="cc-opick__add" onClick={() => add(line)} aria-label={`Add ${line.name}`}>
                  <FiPlus size={12} /> Add
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** "✓ Unlocked", or how far the cart is from this offer. */
function OfferStatus({ offer, status, subtotal }) {
  const { earned, counts, mid } = status
  const won = status.offer?.id === offer.id
  if (earned[offer.id]) {
    // Tub Lover can be unlocked at its first tier with a bigger one in reach.
    const tiers = OFFER_RULES.tubTiers
    const top = tiers[tiers.length - 1]
    const stepUp = offer.id === 'tub-lover' && counts.tubs < top.min
    return (
      <>
        <div className={`cc-ostatus is-earned${won ? ' is-won' : ''}`}>
          <FiCheckCircle size={14} />
          {offer.id === 'tub-lover' && won
            ? `Unlocked — ${status.tubTier.gift} free`
            : won ? 'Unlocked — this is your gift' : 'Unlocked · a bigger gift already applies'}
        </div>
        {stepUp && (
          <div className="cc-ostatus">
            <span>{counts.tubs} of {top.min} tubs — {top.min - counts.tubs} more for {top.gift}</span>
            <span className="cc-onudge__bar" aria-hidden>
              <span style={{ width: `${Math.round((counts.tubs / top.min) * 100)}%` }} />
            </span>
          </div>
        )}
      </>
    )
  }
  let text = null
  let progress = 0
  switch (offer.id) {
    // Counters only once something relevant is in the basket — "₹0.00 of
    // ₹499.00" and "0 of 2 boxes" on an empty basket read as noise.
    case 'mid-month':
      if (!mid.live) text = `Opens ${dayMonth(mid.from)} — orders placed then qualify`
      else if (subtotal > 0) {
        text = `${inr(subtotal)} of ${inr(OFFER_RULES.midMonth.min)} in your basket`
        progress = subtotal / OFFER_RULES.midMonth.min
      }
      break
    case 'gift-pair':
      if (counts.boxes) {
        text = `${counts.boxes} of 2 boxes in your basket`
        progress = counts.boxes / 2
      }
      break
    case 'tub-lover': {
      if (!counts.tubs) break
      // Counts towards the first tier, then the top one.
      const tiers = OFFER_RULES.tubTiers
      const next = tiers.find((t) => counts.tubs < t.min) || tiers[tiers.length - 1]
      text = `${counts.tubs} of ${next.min} tubs — ${next.gift} free`
      progress = counts.tubs / next.min
      break
    }
    case 'tub-sip':
      if (counts.tubs || counts.drinks) {
        text = counts.tubs ? 'Tub ✓ — now add any drink' : 'Drink ✓ — now add a cheesecake tub'
        progress = 0.5
      }
      break
    case 'big-basket':
      if (subtotal > 0) {
        text = `${inr(subtotal)} of ${inr(OFFER_RULES.bigBasketMin)} — ${inr(OFFER_RULES.bigBasketMin - subtotal)} to go`
        progress = subtotal / OFFER_RULES.bigBasketMin
      }
      break
    default:
  }
  if (!text) return null
  return (
    <div className="cc-ostatus">
      <span>{text}</span>
      {progress > 0 && (
        <span className="cc-onudge__bar" aria-hidden>
          <span style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }} />
        </span>
      )}
    </div>
  )
}

/**
 * One offer, one full-width row: a square photo, then name, the BUY / FREE
 * deal and the action. On a phone the photo shrinks to a thumbnail beside the
 * name and everything below it takes the card's full width (see the CSS). The picker opens on demand, inside the card, so a card is only
 * ever as tall as what it says (a 2-up grid stretched short cards to match the
 * ones with a picker).
 */
function OfferCard({ offer: o, index, status, subtotal, startOpen }) {
  const [open, setOpen] = useState(startOpen)
  const picker = OFFER_PICKERS[o.id]
  const won = status.offer?.id === o.id
  return (
    <article id={o.id} className={`cc-orow${won ? ' is-won' : ''}`}>
      <div className="cc-orow__media">
        <img src={u(o.image)} srcSet={srcSet(o.image)} sizes="(min-width: 576px) 200px, 64px" alt={o.alt} loading="lazy" />
        <span className="cc-orow__num" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="cc-orow__body">
        <span className="cc-orow__tag">{o.tag}</span>
        <h3 className="cc-orow__name">{o.name}</h3>
        {/* Same BUY / FREE pair as the Home tiles, so the deal reads the same
            on both pages. */}
        <p className="cc-offer-deal">
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
        </p>
        <OfferStatus offer={o} status={status} subtotal={subtotal} />
        <div className="cc-orow__actions">
          {picker ? (
            <button
              type="button"
              className="btn-rose cc-orow__btn"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Hide choices' : picker.label}{' '}
              <FiChevronDown size={14} className={open ? 'is-flipped' : ''} />
            </button>
          ) : (
            <Link to={o.cta.to} className="btn-rose cc-orow__btn">
              {o.cta.label} <FiArrowRight size={14} />
            </Link>
          )}
          {picker && (
            <Link to={o.cta.to} className="cc-orow__link">
              Or browse the shop <FiArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
      {picker && open && <OfferPicker tabs={picker.tabs} />}
    </article>
  )
}

/** Fixed basket bar: what's in the cart, the gift it has earned, and the way out. */
function BasketBar({ status, count, subtotal }) {
  if (!count) return null
  return (
    <div className="cc-obar" role="region" aria-label="Your basket" data-no-reveal>
      <span className="cc-obar__info">
        <FiShoppingBag size={15} aria-hidden />
        <span>
          <strong>{count}</strong> {count === 1 ? 'item' : 'items'} · {inr(subtotal)}
          {status.offer && (
            <span className="cc-obar__gift"><FiGift size={12} aria-hidden /> {status.offer.gift} free</span>
          )}
        </span>
      </span>
      <Link to="/cart" className="cc-obar__btn cc-obar__btn--ghost">Cart</Link>
      <Link to="/checkout" className="cc-obar__btn">Checkout <FiArrowRight size={13} /></Link>
    </div>
  )
}

export default function Offers() {
  usePageMeta({
    title: 'Offers',
    description: 'Free cake pops, cupcakes and cookies added to your Cake & Crumb order — everyday offers, plus a Mid-Month Treat from the 14th to the 20th. Menu prices, gifts on us.',
  })
  const { items, count, subtotal } = useCart()
  const now = useOfferClock()
  const offers = activeOffers(now)
  const status = cartOfferStatus(items, subtotal, now)
  const { hash } = useLocation()
  const target = hash.slice(1)

  // /offers#cheesecake (from a Home tile or the cart's "Details") lands on that
  // card. ScrollToTop runs on the route change, so this waits a frame for it.
  useEffect(() => {
    if (!target) return
    const id = requestAnimationFrame(() =>
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
    return () => cancelAnimationFrame(id)
  }, [target])

  return (
    <div className="cc-offers">
      {/* ───── HERO ───── */}
      <section className="cc-offers-hero">
        <div className="cc-offers-confetti" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="container text-center position-relative">
          <span className="eyebrow">Cake &amp; Crumb Offers</span>
          <h1 className="cc-offers-hero__title">A Little Extra,<br />On Us</h1>
          <p className="cc-offers-hero__lede">
            {OFFERS_ON
              ? `${countWord(offers.length)} ways to get something free with your order. You pay the menu price — the extra treats are on the house.`
              : 'There are no offers running just now. Every cake is still baked to order, and we’d love to make yours.'}
          </p>
          {OFFERS_ON && (
            <div className="cc-offers-hero__meta"><MidMonthChip now={now} /></div>
          )}
          <div className="cc-offers-hero__cta">
            <Link to="/shop" className="btn-rose"><FiShoppingBag /> Shop now</Link>
            {OFFERS_ON && (
              <a href="#offer-list" className="cc-offers-hero__link">See all offers <FiArrowRight size={14} /></a>
            )}
          </div>
        </div>
      </section>

      {OFFERS_ON && (
        <>
          {/* ───── OFFERS ───── */}
          <section id="offer-list" className="cc-offers-list">
            <div className="container py-4 py-md-5">
              <div className="text-center mb-4 mb-md-5">
                <span className="eyebrow">The Offers</span>
                <h2 className="section-title mt-3">Pick Your Free Treat</h2>
              </div>
              <div className="cc-orows">
                {offers.map((o, i) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    index={i}
                    status={status}
                    subtotal={subtotal}
                    startOpen={target === o.id}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ───── HOW TO CLAIM ─────
              The gift is added by hand on WhatsApp, so the page has to say so
              plainly: a customer who expects to see it in the cart total would
              otherwise think the offer didn't apply. */}
          <section className="cc-offers-how">
            <div className="container py-5">
              <div className="text-center mb-4">
                <span className="eyebrow">How to Claim</span>
                <h2 className="section-title mt-3">No Code Needed</h2>
              </div>
              <ol className="cc-offers-steps">
                <li>
                  <span className="cc-offers-steps__icon"><FiShoppingBag size={20} /></span>
                  <h3>Order as usual</h3>
                  <p>On the website, through our chat, or straight on WhatsApp. Your total is the menu price.</p>
                </li>
                <li>
                  <span className="cc-offers-steps__icon"><FiMessageCircle size={20} /></span>
                  <h3>We add your gift</h3>
                  <p>When we confirm your order on WhatsApp, we tell you which offer applies and add the free treats.</p>
                </li>
                <li>
                  <span className="cc-offers-steps__icon"><FiGift size={20} /></span>
                  <h3>It comes packed in</h3>
                  <p>The gift is boxed with your order, whether you pick it up or we deliver it.</p>
                </li>
              </ol>
            </div>
          </section>

          {/* ───── TERMS ───── */}
          <section className="cc-offers-terms">
            <div className="container py-5">
              <h2 className="cc-offers-terms__title">The fine print</h2>
              <ul>
                <li><FiCheckCircle aria-hidden /> One offer per order — offers don’t combine. If your order fits more than one, you get the bigger gift.</li>
                <li><FiCheckCircle aria-hidden /> The gift is added when we confirm on WhatsApp, so it won’t appear in your cart or checkout total.</li>
                <li><FiCheckCircle aria-hidden /> Mid-Month Treat runs from 12:00 am on the {ordinal(OFFER_RULES.midMonth.fromDay)} to midnight on the {ordinal(OFFER_RULES.midMonth.toDay)}, and it’s the moment you place the order that counts — a basket filled on the {ordinal(OFFER_RULES.midMonth.toDay)} but ordered after midnight misses it.</li>
                <li><FiCheckCircle aria-hidden /> Gift flavours are our pick from the day’s bake.</li>
                <li><FiCheckCircle aria-hidden /> Orders of {inr(BULK_ORDER_MIN)} or more take a {Math.round(DEPOSIT_PCT * 100)}% advance by UPI, or full payment, as always.</li>
                <li><FiCheckCircle aria-hidden /> Everything is made to order, so please order at least a day ahead.</li>
                <li><FiCheckCircle aria-hidden /> Offers can change — this page always shows the ones running today.</li>
              </ul>
            </div>
          </section>
        </>
      )}

      {/* ───── CLOSING ───── */}
      <section className="cc-offers-close">
        <div className="container py-5 text-center">
          <h2 className="cc-offers-close__title">Planning something bigger?</h2>
          <p>Birthdays, office treats or a house full of guests — tell us what you need and the date, and we’ll plan the bake with you.</p>
          <a
            href={buildWhatsAppLink(`Hi! I'd like to plan an order.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rose"
          >
            <FiMessageCircle /> Message us on WhatsApp
          </a>
        </div>
      </section>

      {OFFERS_ON && <BasketBar status={status} count={count} subtotal={subtotal} />}
    </div>
  )
}
