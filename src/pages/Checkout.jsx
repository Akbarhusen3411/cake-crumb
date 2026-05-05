import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiCheckCircle, FiHome, FiArrowLeft, FiSmartphone, FiTruck,
  FiCopy, FiShoppingBag,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCart } from '../context/CartContext.jsx'
import { inr } from '../data/format.js'
import { u } from '../data/images.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { saveOrder } from '../services/orders.js'
import { generateOrderId } from '../services/orderId.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'
import { sendOrderEmail } from '../services/emailNotify.js'

const UPI_ID = '9081668490@kotakbank'
const PAYEE_NAME = 'Momin Akbarhusen Gulamali'

export default function Checkout() {
  usePageMeta({ title: 'Checkout' })
  const { items, count, subtotal, delivery, total, clear } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState('checkout') // checkout | success
  const [orderId, setOrderId] = useState(null)
  const [utr, setUtr] = useState('')          // 12-digit UPI transaction reference
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
    payment: 'upi', // upi | cod
  })

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function copyUPI() {
    navigator.clipboard?.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isFormValid = useMemo(() => {
    return (
      form.name.trim() &&
      /^[6-9]\d{9}$/.test(form.phone.trim()) &&
      form.address.trim() &&
      form.city.trim() &&
      /^\d{6}$/.test(form.pincode.trim())
    )
  }, [form])

  // Snapshot of items at the moment of order — preserved for the success page
  // even after we clear() the live cart.
  const [placedItems, setPlacedItems] = useState([])
  const [placedTotals, setPlacedTotals] = useState({ subtotal: 0, delivery: 0, total: 0 })

  function buildOrderMessage(id, snapshotItems, totals) {
    const paymentLine = form.payment === 'upi'
      ? `*💳 Payment:* UPI ✅ Paid\n*🧾 UTR:* ${utr}`
      : '*💳 Payment:* Cash on Delivery'
    const lines = [
      `🎂 *NEW ORDER — ${id}*`,
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      `*👤 Customer:* ${form.name}`,
      `*📞 Phone:* +91 ${form.phone}`,
      ...(form.email ? [`*📧 Email:* ${form.email}`] : []),
      `*📍 Address:* ${form.address}, ${form.city} - ${form.pincode}`,
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      '*📋 Items:*',
      ...snapshotItems.map((it) => `  • ${it.name} × ${it.qty} = ${inr(it.price * it.qty)}`),
      '━━━━━━━━━━━━━━━━━━━━',
      `*Subtotal:* ${inr(totals.subtotal)}`,
      `*Delivery:* ${totals.delivery === 0 ? 'FREE ✅' : inr(totals.delivery)}`,
      `*💰 Total: ${inr(totals.total)}*`,
      '',
      paymentLine,
      ...(form.notes ? ['', `*📝 Notes:* ${form.notes}`] : []),
      '',
      'Please confirm my order. Thank you! 🙏',
    ]
    return lines.join('\n')
  }

  function placeOrder(e) {
    e.preventDefault()
    if (!isFormValid) return
    if (form.payment === 'upi' && !/^\d{12}$/.test(utr)) {
      alert('Please enter the 12-digit UTR / UPI reference number from your payment app.')
      return
    }

    const id = generateOrderId(form.name)
    const snapshotItems = items.map((it) => ({ ...it }))
    const snapshotTotals = { subtotal, delivery, total }

    // (A) Open WhatsApp synchronously inside this click — bypasses popup blockers.
    // The success page still has a "Send Order on WhatsApp" button as a manual fallback.
    const msg = buildOrderMessage(id, snapshotItems, snapshotTotals)
    try {
      window.open(buildWhatsAppLink(msg), '_blank', 'noopener,noreferrer')
    } catch {
      // popup blocker or no window — silently continue; user has fallback button
    }

    // (B) Persist + email — both fire-and-forget, never block the success transition.
    const orderData = {
      orderId: id,
      items: snapshotItems,
      totals: snapshotTotals,
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
      },
      payment: {
        method: form.payment,
        paid: form.payment === 'upi',
        utr: form.payment === 'upi' ? utr : '',
      },
      notes: form.notes,
      source: 'checkout',
    }
    saveOrder(orderData)
    sendOrderEmail(orderData)

    setOrderId(id)
    setPlacedItems(snapshotItems)
    setPlacedTotals(snapshotTotals)
    setStep('success')
    clear()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function sendOrderToWhatsApp() {
    if (!orderId) return
    const msg = buildOrderMessage(orderId, placedItems, placedTotals)
    window.open(buildWhatsAppLink(msg), '_blank', 'noopener,noreferrer')
  }

  // Empty-cart guard (only if not on success step)
  if (count === 0 && step !== 'success') {
    return (
      <section className="bg-cream py-5">
        <div className="container py-5 text-center">
          <h2 className="section-title">Nothing to checkout</h2>
          <p className="mt-2">Add some sweet treats to your cart first.</p>
          <Link to="/shop" className="btn-rose mt-3">
            <FiShoppingBag /> Browse Shop
          </Link>
        </div>
      </section>
    )
  }

  if (step === 'success') {
    return (
      <section className="bg-cream py-5">
        <div className="container py-5 text-center" style={{ maxWidth: 600 }}>
          <span className="feature-icon mb-3" style={{ width: 84, height: 84, color: 'var(--cc-rose)' }}>
            <FiCheckCircle size={40} />
          </span>
          <h2 className="section-title">Order Placed!</h2>
          <p className="mt-2">Thank you for your sweet order. We'll start baking right away.</p>
          <div
            className="d-inline-flex flex-column align-items-center mt-3 mb-3 px-4 py-3"
            style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 12 }}
          >
            <span className="tag-badge">Order ID</span>
            <strong style={{ color: 'var(--cc-cocoa)', fontSize: '1.2rem', letterSpacing: '0.06em' }}>
              {orderId}
            </strong>
          </div>

          <div
            className="p-3 p-md-4 mb-4 mx-auto"
            style={{
              background: 'rgba(37, 211, 102, 0.08)',
              border: '1.5px solid rgba(37, 211, 102, 0.35)',
              borderRadius: 14,
              maxWidth: 520,
            }}
          >
            <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
              <FaWhatsapp size={20} color="#25D366" />
              <strong style={{ color: 'var(--cc-cocoa)' }}>WhatsApp opened</strong>
            </div>
            <p style={{ fontSize: '0.88rem', marginBottom: '0.8rem' }}>
              Your order details are pre-filled in WhatsApp — <strong>just press Send</strong>.
              If WhatsApp didn't open or got blocked, tap below.
            </p>
            <button
              type="button"
              onClick={sendOrderToWhatsApp}
              className="btn-rose w-100 justify-content-center"
              style={{ background: '#25D366' }}
            >
              <FaWhatsapp size={18} /> Open WhatsApp Again
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--cc-cocoa-soft)' }}>
            {form.payment === 'upi'
              ? 'Your UPI payment will be verified via WhatsApp.'
              : 'Cash on Delivery — please keep the exact amount ready.'}
          </p>
          <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
            <Link to="/" className="btn-outline-rose">
              <FiHome /> Back to Home
            </Link>
            <Link to="/shop" className="btn-rose">
              <FiShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream py-5">
      <div className="container">
        <div className="d-flex align-items-center mb-4" style={{ gap: '0.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="border-0 bg-transparent"
            style={{ color: 'var(--cc-cocoa-soft)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <FiArrowLeft /> Back
          </button>
        </div>
        <div className="text-center mb-4">
          <span className="eyebrow">Checkout</span>
          <h2 className="section-title mt-2">Almost There</h2>
        </div>

        <form onSubmit={placeOrder}>
          <div className="row g-4">
            {/* LEFT — delivery + payment */}
            <div className="col-lg-7">
              <div
                className="p-4 mb-4"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
              >
                <h4 className="mb-3" style={{ fontSize: '1.2rem' }}>Delivery Details</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      className="cc-input" placeholder="Full Name *"
                      value={form.name} onChange={(e) => update('name', e.target.value)} required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      className="cc-input" placeholder="Phone (10-digit) *"
                      value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      inputMode="numeric" required
                    />
                  </div>
                  <div className="col-12">
                    <input
                      className="cc-input" placeholder="Email (optional)" type="email"
                      value={form.email} onChange={(e) => update('email', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="cc-input" rows={2} placeholder="Address (House, Street, Area) *"
                      value={form.address} onChange={(e) => update('address', e.target.value)} required
                    />
                  </div>
                  <div className="col-md-7">
                    <input
                      className="cc-input" placeholder="City *"
                      value={form.city} onChange={(e) => update('city', e.target.value)} required
                    />
                  </div>
                  <div className="col-md-5">
                    <input
                      className="cc-input" placeholder="Pincode (6-digit) *"
                      value={form.pincode} onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric" required
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="cc-input" rows={2} placeholder="Order notes (e.g. eggless, message on cake) — optional"
                      value={form.notes} onChange={(e) => update('notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div
                className="p-4"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
              >
                <h4 className="mb-3" style={{ fontSize: '1.2rem' }}>Payment Method</h4>
                <div className="d-flex flex-column flex-md-row gap-3 mb-3">
                  <button
                    type="button"
                    className={'payment-tab' + (form.payment === 'upi' ? ' active' : '')}
                    onClick={() => update('payment', 'upi')}
                  >
                    <span className="icon-wrap"><FiSmartphone size={18} /></span>
                    <span>
                      <div>UPI / QR Code</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--cc-cocoa-soft)' }}>
                        Scan & pay with any UPI app
                      </div>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={'payment-tab' + (form.payment === 'cod' ? ' active' : '')}
                    onClick={() => update('payment', 'cod')}
                  >
                    <span className="icon-wrap"><FiTruck size={18} /></span>
                    <span>
                      <div>Cash on Delivery</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--cc-cocoa-soft)' }}>
                        Pay in cash when it arrives
                      </div>
                    </span>
                  </button>
                </div>

                {form.payment === 'upi' && (() => {
                  const upiPayString =
                    `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
                    `&pn=${encodeURIComponent(PAYEE_NAME)}` +
                    `&am=${total}` +
                    `&cu=INR` +
                    `&tn=${encodeURIComponent('Cake & Crumb order')}`
                  const qrUrl =
                    `https://api.qrserver.com/v1/create-qr-code/` +
                    `?size=320x320&margin=8&color=1a1a1a&bgcolor=ffffff` +
                    `&data=${encodeURIComponent(upiPayString)}`

                  return (
                    <div
                      className="upi-pay-card"
                      style={{
                        background: '#fff',
                        border: '1px solid var(--cc-border)',
                        borderRadius: 14,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between"
                        style={{ background: 'var(--cc-cream)', gap: '0.6rem' }}
                      >
                        <div className="d-flex align-items-center" style={{ gap: '0.6rem' }}>
                          <span className="feature-icon" style={{ width: 38, height: 38 }}>
                            <FiSmartphone size={16} />
                          </span>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                              Amount to Pay
                            </div>
                            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '1.4rem', color: 'var(--cc-cocoa)', lineHeight: 1 }}>
                              {inr(total)}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            background: 'var(--cc-rose)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            padding: '0.25rem 0.7rem',
                            borderRadius: 999,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          UPI
                        </span>
                      </div>

                      <div className="row g-0 align-items-center">
                        <div className="col-md-5 p-3 p-md-4 text-center">
                          <div
                            style={{
                              display: 'inline-block',
                              padding: 12,
                              background: '#fff',
                              border: '2px solid var(--cc-rose)',
                              borderRadius: 14,
                            }}
                          >
                            <img
                              src={qrUrl}
                              alt="UPI payment QR code"
                              style={{
                                width: '100%',
                                maxWidth: 200,
                                height: 'auto',
                                display: 'block',
                              }}
                            />
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--cc-cocoa-soft)', marginTop: '0.6rem', marginBottom: 0 }}>
                            Scan with any UPI app
                          </p>
                        </div>

                        <div className="col-md-7 p-3 p-md-4">
                          <div className="mb-3">
                            <div style={{ fontSize: '0.65rem', color: 'var(--cc-cocoa-soft)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
                              Pay to
                            </div>
                            <div style={{ color: 'var(--cc-cocoa)', fontWeight: 600 }}>{PAYEE_NAME}</div>
                          </div>
                          <div className="mb-3">
                            <div style={{ fontSize: '0.65rem', color: 'var(--cc-cocoa-soft)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
                              UPI ID
                            </div>
                            <div
                              className="d-flex align-items-center justify-content-between"
                              style={{
                                background: 'var(--cc-cream)',
                                padding: '0.5rem 0.7rem',
                                borderRadius: 8,
                                gap: '0.5rem',
                              }}
                            >
                              <code style={{ background: 'transparent', padding: 0, color: 'var(--cc-cocoa)', fontSize: '0.85rem' }}>
                                {UPI_ID}
                              </code>
                              <button
                                type="button"
                                onClick={copyUPI}
                                className="border-0 bg-transparent"
                                aria-label="Copy UPI ID"
                                style={{ color: 'var(--cc-rose)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              >
                                <FiCopy size={13} /> {copied ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                          <a
                            href={upiPayString}
                            className="btn-rose w-100 justify-content-center"
                            style={{ fontSize: '0.8rem' }}
                          >
                            <FiSmartphone size={14} /> Open in UPI App
                          </a>
                          <p style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textAlign: 'center', marginTop: '0.5rem', marginBottom: 0 }}>
                            Works on phones with GPay, PhonePe, Paytm, BHIM, etc.
                          </p>
                        </div>
                      </div>

                      <div
                        className="px-3 px-md-4 py-3"
                        style={{
                          background: utr.length === 12 ? 'var(--cc-cream)' : '#fff',
                          borderTop: '1px solid var(--cc-border)',
                          transition: 'background 0.2s',
                        }}
                      >
                        <label
                          htmlFor="utr-input"
                          style={{
                            display: 'block',
                            fontSize: '0.7rem',
                            color: 'var(--cc-cocoa-soft)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            fontWeight: 700,
                            marginBottom: 6,
                          }}
                        >
                          Enter UTR / UPI Reference Number *
                        </label>
                        <div className="d-flex" style={{ gap: '0.5rem' }}>
                          <input
                            id="utr-input"
                            type="text"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            placeholder="12-digit number from your UPI app"
                            inputMode="numeric"
                            maxLength={12}
                            className="cc-input"
                            style={{
                              flex: 1,
                              fontSize: '0.95rem',
                              letterSpacing: '0.04em',
                              fontFamily: 'monospace',
                            }}
                          />
                          {utr.length === 12 && (
                            <span
                              className="d-inline-flex align-items-center"
                              style={{
                                color: 'var(--cc-rose-deep)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                gap: 4,
                              }}
                            >
                              <FiCheckCircle size={16} />
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: '0.7rem',
                          color: 'var(--cc-cocoa-soft)',
                          marginTop: 6,
                          marginBottom: 0,
                          lineHeight: 1.4,
                        }}>
                          After paying, your UPI app shows a <strong>12-digit transaction
                          reference (UTR)</strong>. Open the payment receipt → copy the
                          reference number → paste it here. This proves the payment.
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {form.payment === 'cod' && (
                  <div
                    className="p-3 p-md-4"
                    style={{ background: 'var(--cc-cream)', borderRadius: 12, fontSize: '0.9rem' }}
                  >
                    <div className="d-flex align-items-start" style={{ gap: '0.7rem' }}>
                      <span className="feature-icon" style={{ width: 40, height: 40, flexShrink: 0 }}>
                        <FiTruck size={16} />
                      </span>
                      <div>
                        <strong style={{ color: 'var(--cc-cocoa)' }}>Cash on Delivery</strong>
                        <p className="mb-0 mt-1">
                          Pay <strong>{inr(total)}</strong> in cash when our delivery partner hands over your order. Please keep the exact amount ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — order summary */}
            <div className="col-lg-5">
              <div
                className="p-4 sticky-lg-top"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14, top: '140px' }}
              >
                <div className="tag-badge mb-3">Order Summary</div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {items.map((it) => (
                    <div key={it.id} className="d-flex align-items-center mb-3" style={{ gap: '0.7rem' }}>
                      <img
                        src={u(it.img, 200, 200)}
                        alt=""
                        style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div className="flex-grow-1" style={{ fontSize: '0.85rem', minWidth: 0 }}>
                        <div style={{ color: 'var(--cc-cocoa)', fontWeight: 600 }}>{it.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cc-cocoa-soft)' }}>
                          Qty: {it.qty} × {inr(it.price)}
                        </div>
                      </div>
                      <strong style={{ color: 'var(--cc-rose)', fontSize: '0.9rem' }}>
                        {inr(it.price * it.qty)}
                      </strong>
                    </div>
                  ))}
                </div>

                <hr style={{ borderColor: 'var(--cc-border)' }} />
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.9rem' }}>
                  <span>Subtotal</span>
                  <span>{inr(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                  <span>Delivery</span>
                  <span style={{ color: delivery === 0 ? 'var(--cc-rose)' : 'inherit' }}>
                    {delivery === 0 ? 'Free' : inr(delivery)}
                  </span>
                </div>
                <hr style={{ borderColor: 'var(--cc-border)' }} />
                <div className="d-flex justify-content-between mb-3" style={{ fontSize: '1.05rem' }}>
                  <strong style={{ color: 'var(--cc-cocoa)' }}>Total</strong>
                  <strong style={{ color: 'var(--cc-rose)', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '1.3rem' }}>
                    {inr(total)}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="btn-rose w-100 justify-content-center"
                  disabled={!isFormValid || (form.payment === 'upi' && !/^\d{12}$/.test(utr))}
                  style={{
                    opacity: !isFormValid || (form.payment === 'upi' && !/^\d{12}$/.test(utr)) ? 0.5 : 1,
                    cursor: !isFormValid || (form.payment === 'upi' && !/^\d{12}$/.test(utr)) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FiCheckCircle /> Place Order
                </button>
                <p style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textAlign: 'center', marginTop: '0.6rem' }}>
                  By placing your order you agree to our terms & conditions.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
