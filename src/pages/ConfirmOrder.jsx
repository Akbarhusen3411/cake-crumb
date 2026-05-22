import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiCheckCircle, FiAlertCircle, FiHome, FiShoppingBag,
  FiCalendar, FiUser, FiLoader,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { getOrderByOrderId, markOrderConfirmed } from '../services/orders.js'
import { inr } from '../data/format.js'
import { usePageMeta } from '../hooks/usePageMeta.js'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDeliveryDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Strip everything except digits. If the result is 10 digits, assume India
// and prepend 91 so wa.me has a fully qualified number.
function normalizeWhatsAppNumber(raw) {
  if (!raw) return ''
  let digits = String(raw).replace(/\D/g, '')
  if (digits.length === 10) digits = '91' + digits
  return digits
}

function buildConfirmMessage(order) {
  const lines = [
    `🎂 *Order Confirmed!* — ${order.orderId}`,
    '',
    `Hi ${order.customer?.name || 'there'}!`,
    '',
    `Great news — your order has been *confirmed* and we're starting to bake. ♥`,
    '',
    `📅 *Delivery:* ${formatDeliveryDate(order.deliveryDate)}`,
    `💰 *Total:* ${inr(order.totals?.total || 0)}`,
    '',
    '*Your Items:*',
    ...(order.items || []).map((i) => `  • ${i.name} × ${i.qty}`),
    '',
    `We'll be in touch closer to your delivery date.`,
    '',
    `Thank you for choosing Cake & Crumb! 🙏`,
  ]
  return lines.join('\n')
}

// ── Page ───────────────────────────────────────────────────────────────────

// Fallback order built purely from URL params, used when Firestore isn't
// configured and the customer's localStorage isn't reachable from the admin's
// device. Just enough to send a confirmation WhatsApp back to the customer.
function orderFromParams(params) {
  const phone = params.get('phone') || ''
  if (!phone) return null
  return {
    orderId: params.get('id') || '',
    customer: { name: params.get('name') || 'there', phone },
    deliveryDate: params.get('date') || '',
    totals: { total: Number(params.get('total')) || 0 },
    items: [],
    status: 'placed',
    firebaseId: null,
  }
}

export default function ConfirmOrder() {
  usePageMeta({ title: 'Confirm Order — Admin' })

  const [params] = useSearchParams()
  const orderId = params.get('id') || ''

  const [phase, setPhase] = useState('loading') // loading | confirmed | already | error
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [waOpened, setWaOpened] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!orderId) {
        setPhase('error')
        setError('No order ID in the link.')
        return
      }

      try {
        let found = await getOrderByOrderId(orderId)
        if (cancelled) return

        // Fallback — the URL itself carries enough customer data to send a
        // confirmation message back. Use it when Firestore/localStorage
        // can't find the order (typical when the admin device is different
        // from the customer's).
        if (!found) found = orderFromParams(params)

        if (!found) {
          setPhase('error')
          setError(`Order ${orderId} not found. It may not have synced to Firestore yet, or the ID is wrong.`)
          return
        }

        const wasAlreadyConfirmed = found.status === 'confirmed'
        if (found.firebaseId && !wasAlreadyConfirmed) {
          await markOrderConfirmed(found.firebaseId)
          if (cancelled) return
        }

        setOrder(found)
        setPhase(wasAlreadyConfirmed ? 'already' : 'confirmed')

        // Auto-open WhatsApp with the confirmation message pre-filled.
        const phone = normalizeWhatsAppNumber(found.customer?.phone)
        if (phone) {
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildConfirmMessage(found))}`
          try {
            window.open(url, '_blank', 'noopener,noreferrer')
            if (!cancelled) setWaOpened(true)
          } catch {
            // popup blocked — manual fallback button stays visible
          }
        }
      } catch (err) {
        if (cancelled) return
        setPhase('error')
        setError(err.message || 'Something went wrong while confirming the order.')
      }
    })()

    return () => { cancelled = true }
  }, [orderId])

  // ── Loading ──
  if (phase === 'loading') {
    return (
      <section className="bg-cream py-5">
        <div className="container py-5 text-center" style={{ maxWidth: 520 }}>
          <span className="feature-icon mb-3" style={{ width: 72, height: 72, color: 'var(--cc-rose)' }}>
            <FiLoader size={28} className="cc-spin" />
          </span>
          <h2 className="section-title">Confirming order…</h2>
          <p className="mt-2" style={{ color: 'var(--cc-cocoa-soft)' }}>Looking up <strong>{orderId}</strong> in our system.</p>
        </div>
      </section>
    )
  }

  // ── Error ──
  if (phase === 'error') {
    return (
      <section className="bg-cream py-5">
        <div className="container py-5 text-center" style={{ maxWidth: 520 }}>
          <span
            className="feature-icon mb-3"
            style={{ width: 72, height: 72, color: '#cf3e63', borderColor: '#cf3e63' }}
          >
            <FiAlertCircle size={32} />
          </span>
          <h2 className="section-title">Couldn't confirm this order</h2>
          <p className="mt-2" style={{ fontSize: '0.95rem' }}>{error}</p>
          <Link to="/" className="btn-outline-rose mt-3"><FiHome /> Back to Home</Link>
        </div>
      </section>
    )
  }

  // ── Confirmed / Already-confirmed (shared UI) ──
  const wasAlready = phase === 'already'
  const phone = normalizeWhatsAppNumber(order.customer?.phone)
  const manualUrl = `https://wa.me/${phone}?text=${encodeURIComponent(buildConfirmMessage(order))}`

  return (
    <section className="bg-cream py-5">
      <div className="container py-5 text-center" style={{ maxWidth: 600 }}>
        <span
          className="feature-icon mb-3"
          style={{ width: 84, height: 84, color: '#22a55a', borderColor: '#22a55a' }}
        >
          <FiCheckCircle size={40} />
        </span>
        <h2 className="section-title">
          {wasAlready ? 'Already confirmed' : 'Order Confirmed!'}
        </h2>
        <p className="mt-2" style={{ color: 'var(--cc-cocoa-soft)' }}>
          {wasAlready
            ? 'This order was already marked confirmed. You can still re-send the WhatsApp message below.'
            : 'The order is marked confirmed in your records. Now just send the WhatsApp message to your customer.'}
        </p>

        {/* Order card */}
        <div
          className="d-inline-block text-start mt-3 mb-3 px-4 py-3 w-100"
          style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14, maxWidth: 480 }}
        >
          <div className="d-flex justify-content-between mb-2" style={{ gap: '0.5rem' }}>
            <span className="tag-badge">Order ID</span>
            <strong style={{ color: 'var(--cc-cocoa)', letterSpacing: '0.04em' }}>{order.orderId}</strong>
          </div>
          <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem', fontSize: '0.9rem' }}>
            <FiUser size={13} color="var(--cc-rose)" />
            <span>{order.customer?.name}</span>
            <span style={{ color: 'var(--cc-cocoa-soft)' }}>· {order.customer?.phone}</span>
          </div>
          {order.deliveryDate && (
            <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem', fontSize: '0.9rem' }}>
              <FiCalendar size={13} color="var(--cc-rose)" />
              <span>{formatDeliveryDate(order.deliveryDate)}</span>
            </div>
          )}
          <div className="d-flex justify-content-between mt-2 pt-2" style={{ borderTop: '1px solid var(--cc-border)' }}>
            <span style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.85rem' }}>Total</span>
            <strong style={{ color: 'var(--cc-rose)', fontSize: '1.1rem' }}>{inr(order.totals?.total || 0)}</strong>
          </div>
        </div>

        {/* WhatsApp box — mirrors the checkout success page */}
        <div
          className="p-3 p-md-4 mb-4 mx-auto text-start"
          style={{
            background: 'rgba(37, 211, 102, 0.08)',
            border: '1.5px solid rgba(37, 211, 102, 0.35)',
            borderRadius: 14,
            maxWidth: 520,
          }}
        >
          <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
            <FaWhatsapp size={20} color="#25D366" />
            <strong style={{ color: 'var(--cc-cocoa)' }}>
              {waOpened ? 'WhatsApp opened' : 'Send confirmation on WhatsApp'}
            </strong>
          </div>
          <p style={{ fontSize: '0.88rem', marginBottom: '0.8rem' }}>
            A confirmation message is pre-filled in WhatsApp for <strong>{order.customer?.phone}</strong>.
            Just <strong>press Send</strong>. If WhatsApp didn't open, tap below.
          </p>
          <a
            href={manualUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rose w-100 justify-content-center"
            style={{ background: '#25D366' }}
          >
            <FaWhatsapp size={18} /> Open WhatsApp
          </a>
        </div>

        <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
          <Link to="/" className="btn-outline-rose">
            <FiHome /> Home
          </Link>
          <Link to="/shop" className="btn-rose">
            <FiShoppingBag /> Shop
          </Link>
        </div>
      </div>
    </section>
  )
}
