import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiSearch, FiCheckCircle, FiClock, FiTruck, FiAlertCircle,
  FiCalendar, FiUser, FiPhone, FiHome, FiShoppingBag, FiLoader,
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
function statusMeta(status) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed — baking', icon: FiCheckCircle, color: '#22a55a', tint: 'rgba(34,165,90,0.10)' }
    case 'out_for_delivery':
      return { label: 'Out for delivery', icon: FiTruck, color: '#cf3e63', tint: 'rgba(207,62,99,0.10)' }
    case 'delivered':
      return { label: 'Delivered', icon: FiCheckCircle, color: '#22a55a', tint: 'rgba(34,165,90,0.10)' }
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
    const id = (rawId || '').trim()
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
                  placeholder="Order ID (e.g. CC-AB-200526-0001)"
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
          {phase === 'not_found' && (
            <div className="cc-notice" role="note">
              <span className="cc-notice__icon"><FiAlertCircle size={16} /></span>
              <div>
                We couldn't find that order. Double-check the ID, or message us on WhatsApp at <strong>+91 91731 83440</strong> for help.
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="cc-notice" role="alert">
              <span className="cc-notice__icon"><FiAlertCircle size={16} /></span>
              <div>{error}</div>
            </div>
          )}

          {phase === 'found' && order && (
            <>
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
                      : (order.totals?.delivery > 0 ? inr(order.totals.delivery) : 'Confirmed on WhatsApp')}
                  </span>
                </div>
                <div className="d-flex justify-content-between" style={{ fontSize: '1.05rem' }}>
                  <strong style={{ color: 'var(--cc-cocoa)' }}>Total</strong>
                  <strong style={{ color: 'var(--cc-rose)', fontSize: '1.2rem' }}>{inr(order.totals?.total || 0)}</strong>
                </div>
                {order.deliveryMethod === 'delivery' && order.totals?.delivery === 0 && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', textAlign: 'right', marginTop: 4, marginBottom: 0 }}>
                    + delivery charge (confirmed by us)
                  </p>
                )}
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
