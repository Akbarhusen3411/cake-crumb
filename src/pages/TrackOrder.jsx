import { Fragment, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiSearch, FiCheckCircle, FiClock, FiTruck, FiAlertCircle,
  FiCalendar, FiUser, FiPhone, FiHome, FiShoppingBag, FiLoader, FiCheck,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { getOrderTracking } from '../services/orders.js'
import { inr } from '../data/format.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { WHATSAPP_PHONE } from '../components/WhatsAppButton.jsx'
import PageHero from '../components/PageHero.jsx'
import { img, u } from '../data/images.js'

function formatDeliveryDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Fallback order built purely from URL params — used when Firestore + the
// local mirror both come up empty (typical when the customer opens their
// /track-order link from a different browser/device than where they placed
// the order). The WhatsApp message bakery shares to the customer includes
// every value we need here.
function orderFromParams(params) {
  const phone = params.get('phone') || ''
  const id = params.get('id') || ''
  if (!phone && !id) return null
  return {
    orderId: id,
    customer: { name: params.get('name') || 'Customer', phone },
    deliveryDate: params.get('date') || '',
    totals: { subtotal: Number(params.get('total')) || 0, delivery: 0, total: Number(params.get('total')) || 0 },
    items: [],
    status: 'placed',
    deliveryMethod: params.get('method') || 'delivery',
    firebaseId: null,
  }
}

// Map raw status → label + icon + colour
/**
 * WhatsApp link for the two failure states. Carries whatever the customer
 * typed, so the bakery can look it up rather than asking them to repeat it —
 * a wrong ID is still the most useful thing they can send.
 */
function helpLink(typedId) {
  const id = (typedId || '').trim().toUpperCase()
  const msg = id
    ? `Hi, I can't find my order. The ID I have is ${id}.`
    : "Hi, I'd like to check on my order but I can't find my Order ID."
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`
}

/**
 * Where the order stands, as four steps.
 *
 * The page showed a single status banner and nothing else, so "Confirmed" gave
 * no hint that ready / out-for-delivery and completed were still to come —
 * which is the actual question someone opens this page to ask. These are the
 * statuses AdminOrders steps an order through, no more: adding one here means
 * adding it there and in statusMeta() below.
 *
 * Step 3 takes its wording from the fulfilment method, because "Ready" is
 * method-aware in the dashboard too — an order for collection is never out for
 * delivery. Cancelled gets no progress line at all (the caller skips it): a
 * cancelled order has not progressed, and drawing it part-way along a track
 * suggests it is still coming.
 *
 * Reuses the .cc-progress classes the checkout stepper already defines — same
 * furniture, same page, no new CSS.
 */
function stepIndex(status) {
  switch (status) {
    case 'confirmed': return 1
    case 'ready_for_pickup':
    case 'out_for_delivery': return 2
    case 'completed':
    case 'delivered': return 3
    // 'placed' and anything statusMeta() doesn't recognise start at the top.
    default: return 0
  }
}

function TrackProgress({ status, deliveryMethod }) {
  const current = stepIndex(status)
  const labels = [
    'Placed',
    'Confirmed',
    deliveryMethod === 'pickup' ? 'Ready' : 'On its way',
    'Completed',
  ]
  // On the last step nothing is still in progress, so every step reads done —
  // otherwise a finished order shows its final step as the one being worked on.
  const finished = current === labels.length - 1

  return (
    <div className="cc-progress" role="list" aria-label="Order progress">
      {labels.map((label, i) => {
        const done = i < current || finished
        return (
          <Fragment key={label}>
            {i > 0 && <span className={'cc-progress__line' + (i <= current ? ' is-done' : '')} />}
            <div
              className={'cc-progress__step' + (done ? ' is-done' : '') + (i === current && !finished ? ' is-active' : '')}
              role="listitem"
              aria-current={i === current ? 'step' : undefined}
            >
              <span className="cc-progress__num">{done ? <FiCheck size={14} /> : i + 1}</span>
              <span className="cc-progress__label">{label}</span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

function statusMeta(status) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed — baking your order', icon: FiCheckCircle, color: '#1d4ed8', tint: 'rgba(29,78,216,0.10)' }
    case 'ready_for_pickup':
      return { label: 'Ready for pickup 🎉', icon: FiCheckCircle, color: '#5b2a9e', tint: 'rgba(91,42,158,0.10)' }
    case 'out_for_delivery':
      return { label: 'Out for delivery', icon: FiTruck, color: '#b25316', tint: 'rgba(178,83,22,0.10)' }
    case 'completed':
    case 'delivered':
      return { label: 'Completed — enjoy! 🎂', icon: FiCheckCircle, color: '#22a55a', tint: 'rgba(34,165,90,0.10)' }
    case 'cancelled':
      return { label: 'Cancelled', icon: FiAlertCircle, color: '#a32530', tint: 'rgba(163,37,48,0.10)' }
    default:
      return { label: 'Order received — awaiting confirmation', icon: FiClock, color: '#b27300', tint: 'rgba(178,115,0,0.10)' }
  }
}

export default function TrackOrder() {
  usePageMeta({
    title: 'Track Order',
    description: 'Look up your Cake & Crumb order status by ID.',
  })

  const [params, setParams] = useSearchParams()
  const [inputId, setInputId] = useState(params.get('id') || '')
  const [order, setOrder] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | loading | found | not_found | error
  const [error, setError] = useState('')

  async function lookup(rawId) {
    // UPPERCASE here, not just in the input's onChange. Order IDs are uppercase
    // Crockford base32 and the tracking doc is keyed by that exact string — but
    // the ?id= path never touches the input, so a link that got lowercased in
    // transit (mail clients and chat apps do this, and people retype them by
    // hand) reported a perfectly real order as missing.
    const id = (rawId || '').trim().toUpperCase()
    if (!id) {
      setPhase('idle')
      setOrder(null)
      return
    }
    setPhase('loading')
    setError('')
    try {
      let found = await getOrderTracking(id)
      // Fallback: when the lookup misses but the URL itself carries the
      // essential order info (id, name, phone, total, date, method), build
      // a minimal order from those params so the customer still gets a
      // confirmation screen on any device.
      if (!found && params.get('phone')) found = orderFromParams(params)
      if (found) {
        setOrder(found)
        setPhase('found')
      } else {
        setOrder(null)
        setPhase('not_found')
      }
    } catch (err) {
      setPhase('error')
      setError(err.message || 'Something went wrong.')
    }
  }

  // Auto-lookup if ?id= is in the URL on first load. lookup() is async so
  // setState happens inside its body, not synchronously in this effect.
  useEffect(() => {
    const id = params.get('id')
    if (id) queueMicrotask(() => lookup(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onSubmit(e) {
    e.preventDefault()
    setParams(inputId.trim() ? { id: inputId.trim() } : {})
    lookup(inputId)
  }

  const meta = order ? statusMeta(order.status) : null
  const StatusIcon = meta?.icon

  return (
    <>
      <PageHero
        eyebrow="Track Your Order"
        title={<>Where is My<br />Sweet Treat?</>}
        text="Paste your Order ID below and we'll show you exactly where your order stands."
        image={u(img.pinkDripCake, 1000, 750)}
        imageAlt="Pink letter cake"
        cta={
          <>
            <form onSubmit={onSubmit} className="cc-track-form mt-4">
              <div className="cc-track-form__field">
                <FiSearch className="cc-track-form__icon" />
                <input
                  type="text"
                  placeholder="Order ID (e.g. CC-AB-200526-K9GEV)"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value.toUpperCase())}
                  className="cc-input"
                  aria-label="Order ID"
                />
              </div>
              <button type="submit" className="btn-rose" disabled={phase === 'loading'}>
                {phase === 'loading' ? <FiLoader className="cc-spin" size={16} /> : <FiSearch size={16} />}
                {phase === 'loading' ? 'Looking up…' : 'Track'}
              </button>
            </form>
            <p className="mt-2 mb-0" style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.82rem' }}>
              Your Order ID is in the WhatsApp message you sent us.
            </p>
          </>
        }
      />

      {phase !== 'idle' && (
      <section className="py-4 py-md-5">
        <div className="container" style={{ maxWidth: 720 }}>
          {/* The number used to sit in here as plain bold text. This is the one
              screen where someone is stuck and wants help, and it was the one
              screen with nothing to tap — the WhatsApp button only rendered on
              a FOUND order. Comment stays OUTSIDE the `&&`: a JSX comment can't
              be the first child of a conditional expression. */}
          {phase === 'not_found' && (
            <div className="cc-notice" role="note">
              <span className="cc-notice__icon"><FiAlertCircle size={16} /></span>
              <div>
                <p className="mb-2">
                  We couldn't find that order. Check the ID against your WhatsApp
                  receipt — it looks like <strong>CC-AB-200526-K9GEV</strong>.
                </p>
                <a href={helpLink(inputId)} target="_blank" rel="noopener noreferrer" className="cc-track-help">
                  <FaWhatsapp size={14} /> Ask us to find it
                </a>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="cc-notice" role="alert">
              <span className="cc-notice__icon"><FiAlertCircle size={16} /></span>
              <div>
                <p className="mb-2">{error}</p>
                <a href={helpLink(inputId)} target="_blank" rel="noopener noreferrer" className="cc-track-help">
                  <FaWhatsapp size={14} /> Ask us about your order
                </a>
              </div>
            </div>
          )}

          {phase === 'found' && order && (
            <>
              {/* Comment sits OUTSIDE the `&&` — a JSX comment cannot be the
                  first child of a conditional expression. */}
              {order.status !== 'cancelled' && (
                <TrackProgress status={order.status} deliveryMethod={order.deliveryMethod} />
              )}

              {/* Status banner */}
              <div
                className="p-3 p-md-4 mb-3"
                style={{
                  background: meta.tint,
                  border: `1.5px solid ${meta.color}33`,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <span
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: meta.color, color: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <StatusIcon size={20} />
                </span>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Current Status</div>
                  <strong style={{ color: 'var(--cc-cocoa)', fontSize: '1.05rem' }}>{meta.label}</strong>
                </div>
              </div>

              {/* Order summary card */}
              <div
                className="p-4"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: '0.5rem' }}>
                  <div>
                    <span className="tag-badge">Order ID</span>
                    <div style={{ color: 'var(--cc-cocoa)', fontSize: '1.1rem', letterSpacing: '0.04em', fontWeight: 700 }}>{order.orderId}</div>
                  </div>
                  {order.deliveryDate && (
                    <div className="text-end">
                      <span className="tag-badge">Delivery Date</span>
                      <div style={{ color: 'var(--cc-cocoa)', fontSize: '0.95rem', fontWeight: 600 }}>
                        <FiCalendar size={13} color="var(--cc-rose)" /> {formatDeliveryDate(order.deliveryDate)}
                      </div>
                    </div>
                  )}
                </div>

                <hr style={{ borderColor: 'var(--cc-border)' }} />

                {/* Customer — only when available (the public tracking record carries no personal info) */}
                {order.customer?.name && (
                  <>
                    <div style={{ fontSize: '0.9rem', color: 'var(--cc-cocoa)', marginBottom: '0.85rem' }}>
                      <div className="d-flex align-items-center" style={{ gap: '0.5rem', marginBottom: 4 }}>
                        <FiUser size={13} color="var(--cc-rose)" /> {order.customer.name}
                      </div>
                      {order.customer?.phone && (
                        <div className="d-flex align-items-center" style={{ gap: '0.5rem', color: 'var(--cc-cocoa-soft)' }}>
                          <FiPhone size={13} color="var(--cc-rose)" /> {order.customer.phone}
                        </div>
                      )}
                    </div>
                    <hr style={{ borderColor: 'var(--cc-border)' }} />
                  </>
                )}

                {/* Items — hidden when running on URL-params fallback (items list not in URL) */}
                {(order.items?.length || 0) > 0 && (
                  <>
                    <div className="mb-2" style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                      Your Items
                    </div>
                    {order.items.map((it) => (
                      <div key={it.id} className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--cc-cocoa)' }}>{it.name} × {it.qty}</span>
                        <strong style={{ color: 'var(--cc-cocoa)' }}>{inr((it.price || 0) * (it.qty || 1))}</strong>
                      </div>
                    ))}
                    <hr style={{ borderColor: 'var(--cc-border)' }} />
                  </>
                )}

                {/* Totals */}
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.88rem' }}>
                  <span>Subtotal</span>
                  <span>{inr(order.totals?.subtotal || 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.88rem' }}>
                  <span>Delivery</span>
                  <span style={{ color: 'var(--cc-cocoa-soft)' }}>
                    {order.deliveryMethod === 'pickup'
                      ? 'Free (pickup)'
                      : (order.totals?.delivery > 0 ? inr(order.totals.delivery) : 'FREE')}
                  </span>
                </div>
                <div className="d-flex justify-content-between" style={{ fontSize: '1.05rem' }}>
                  <strong style={{ color: 'var(--cc-cocoa)' }}>Total</strong>
                  <strong style={{ color: 'var(--cc-rose)', fontSize: '1.2rem' }}>{inr(order.totals?.total || 0)}</strong>
                </div>
              </div>

              {/* WhatsApp help footer */}
              <div className="text-center mt-4">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi, I need help with my order ${order.orderId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-rose"
                  style={{ background: '#25D366' }}
                >
                  <FaWhatsapp size={16} /> Message us about this order
                </a>
              </div>

              <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
                <Link to="/" className="btn-outline-rose"><FiHome /> Home</Link>
                <Link to="/shop" className="btn-rose"><FiShoppingBag /> Shop Again</Link>
              </div>
            </>
          )}
        </div>
      </section>
      )}
    </>
  )
}
