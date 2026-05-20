import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiCheckCircle, FiHome, FiArrowLeft, FiSmartphone, FiTruck,
  FiCopy, FiShoppingBag, FiCalendar, FiAlertCircle, FiCheck,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCart } from '../context/CartContext.jsx'
import { inr } from '../data/format.js'
import { u } from '../data/images.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { saveOrder } from '../services/orders.js'
import { generateOrderId } from '../services/orderId.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'
import { sendOrderEmail, sendCustomerConfirmation } from '../services/emailNotify.js'

const UPI_ID = '9081668490@kotakbank'
const PAYEE_NAME = 'Momin Akbarhusen Gulamali'
const CUSTOMER_INFO_KEY = 'cc_customer_v1'

// Earliest selectable delivery date — tomorrow, in YYYY-MM-DD for the date input.
function getMinDeliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function formatDateForDisplay(iso) {
  if (!iso) return ''
  // Append T00:00 so the string is parsed in local time, not UTC.
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function loadSavedCustomer() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_INFO_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveCustomerInfo(form) {
  try {
    localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify({
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
    }))
  } catch {
    // storage full / blocked — fine, we just won't pre-fill next time
  }
}

export default function Checkout() {
  usePageMeta({ title: 'Checkout' })
  const { items, count, subtotal, delivery, total, clear } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState('checkout') // checkout | success
  const [orderId, setOrderId] = useState(null)
  const [utr, setUtr] = useState('')
  const [copied, setCopied] = useState(false)

  // Pre-fill from localStorage if the customer has ordered before. Lazy
  // initialiser so we read storage exactly once on mount.
  const [form, setForm] = useState(() => {
    const saved = loadSavedCustomer()
    return {
      name: saved.name || '',
      phone: saved.phone || '',
      email: saved.email || '',
      address: saved.address || '',
      city: saved.city || '',
      pincode: saved.pincode || '',
      notes: '',
      deliveryDate: '',
      payment: 'upi',
    }
  })
  const [prefilled] = useState(() => {
    const saved = loadSavedCustomer()
    return Boolean(saved.name && saved.phone)
  })

  const minDeliveryDate = useMemo(() => getMinDeliveryDate(), [])

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function copyUPI() {
    navigator.clipboard?.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isDetailsValid = useMemo(() => {
    return (
      form.name.trim() &&
      /^[6-9]\d{9}$/.test(form.phone.trim()) &&
      form.address.trim() &&
      form.city.trim() &&
      /^\d{6}$/.test(form.pincode.trim()) &&
      form.deliveryDate && form.deliveryDate >= minDeliveryDate
    )
  }, [form, minDeliveryDate])

  const isPaymentValid =
    form.payment === 'cod' || (form.payment === 'upi' && /^\d{12}$/.test(utr))

  const isFormValid = isDetailsValid && isPaymentValid

  const [placedItems, setPlacedItems] = useState([])
  const [placedTotals, setPlacedTotals] = useState({ subtotal: 0, delivery: 0, total: 0 })
  const [placedDeliveryDate, setPlacedDeliveryDate] = useState('')

  function buildOrderMessage(id, snapshotItems, totals, deliveryDate) {
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
      ...(deliveryDate ? [`*📅 Delivery date:* ${formatDateForDisplay(deliveryDate)}`] : []),
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
    const msg = buildOrderMessage(id, snapshotItems, snapshotTotals, form.deliveryDate)
    try {
      window.open(buildWhatsAppLink(msg), '_blank', 'noopener,noreferrer')
    } catch {
      // popup blocker — success page has a manual fallback button
    }

    // (B) Persist + notify — all fire-and-forget, none block the success transition.
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
      deliveryDate: form.deliveryDate,
      notes: form.notes,
      source: 'checkout',
    }
    saveOrder(orderData)
    sendOrderEmail(orderData)
    if (form.email) sendCustomerConfirmation(orderData)
    saveCustomerInfo(form)

    setOrderId(id)
    setPlacedItems(snapshotItems)
    setPlacedTotals(snapshotTotals)
    setPlacedDeliveryDate(form.deliveryDate)
    setStep('success')
    clear()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function sendOrderToWhatsApp() {
    if (!orderId) return
    const msg = buildOrderMessage(orderId, placedItems, placedTotals, placedDeliveryDate)
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
          <CheckoutProgress step="success" />

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
            {placedDeliveryDate && (
              <div className="mt-2" style={{ fontSize: '0.85rem', color: 'var(--cc-cocoa-soft)' }}>
                <FiCalendar size={13} /> Delivery: <strong style={{ color: 'var(--cc-cocoa)' }}>{formatDateForDisplay(placedDeliveryDate)}</strong>
              </div>
            )}
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

  // Progress state for the indicator: details done → payment is "active".
  const progressStep = isDetailsValid ? 'payment' : 'details'

  return (
    <>
      <section className="bg-cream py-5 cc-checkout-section">
        <div className="container">
          <div className="d-flex align-items-center mb-3" style={{ gap: '0.5rem' }}>
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

          <CheckoutProgress step={progressStep} />

          {/* 1-day-advance notice */}
          <div className="cc-notice mb-4" role="note">
            <span className="cc-notice__icon"><FiAlertCircle size={16} /></span>
            <div>
              <strong>Pre-order required.</strong> All orders are handcrafted to order — please choose a delivery date <strong>at least 1 day from today</strong>.
            </div>
          </div>

          {/* Welcome-back banner (only when we found saved info) */}
          {prefilled && (
            <div className="cc-notice cc-notice--soft mb-4" role="note">
              <span className="cc-notice__icon"><FiCheckCircle size={16} /></span>
              <div>
                Welcome back! We pre-filled your details from your last order — edit anything you'd like.
              </div>
            </div>
          )}

          <form id="checkout-form" onSubmit={placeOrder}>
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
                        className="cc-input" placeholder="Email (optional — for order confirmation)" type="email"
                        value={form.email} onChange={(e) => update('email', e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <textarea
                        className="cc-input" rows={2} placeholder="Address (House, Street, Area) *"
                        value={form.address} onChange={(e) => update('address', e.target.value)} required
                      />
                    </div>
                    <div className="col-12 col-md-7">
                      <input
                        className="cc-input" placeholder="City *"
                        value={form.city} onChange={(e) => update('city', e.target.value)} required
                      />
                    </div>
                    <div className="col-12 col-md-5">
                      <input
                        className="cc-input" placeholder="Pincode (6-digit) *"
                        value={form.pincode} onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode="numeric" required
                      />
                    </div>
                    <div className="col-12">
                      <label className="cc-field-label" htmlFor="delivery-date">
                        <FiCalendar size={13} /> Preferred Delivery Date *
                      </label>
                      <input
                        id="delivery-date"
                        className="cc-input"
                        type="date"
                        min={minDeliveryDate}
                        value={form.deliveryDate}
                        onChange={(e) => update('deliveryDate', e.target.value)}
                        required
                      />
                      <p style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', margin: '0.35rem 0 0' }}>
                        Earliest: {formatDateForDisplay(minDeliveryDate)}
                      </p>
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

                  {/* Desktop place-order button (hidden on mobile — mobile uses the sticky bar) */}
                  <button
                    type="submit"
                    className="btn-rose w-100 justify-content-center d-none d-lg-inline-flex"
                    disabled={!isFormValid}
                    style={{
                      opacity: !isFormValid ? 0.5 : 1,
                      cursor: !isFormValid ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <FiCheckCircle /> Place Order
                  </button>
                  <p style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textAlign: 'center', marginTop: '0.6rem' }} className="d-none d-lg-block">
                    By placing your order you agree to our terms & conditions.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Mobile sticky bar — fixed bottom, only renders on the checkout step. */}
      <div className="cc-checkout-bar d-lg-none" role="region" aria-label="Place order">
        <div className="cc-checkout-bar__total">
          <span className="cc-checkout-bar__total-label">Total</span>
          <strong>{inr(total)}</strong>
        </div>
        <button
          type="submit"
          form="checkout-form"
          className="btn-rose cc-checkout-bar__cta"
          disabled={!isFormValid}
          style={{
            opacity: !isFormValid ? 0.55 : 1,
            cursor: !isFormValid ? 'not-allowed' : 'pointer',
          }}
        >
          <FiCheckCircle /> Place Order
        </button>
      </div>
    </>
  )
}

// ─── Checkout progress indicator ────────────────────────────────────────────
// step prop: 'details' | 'payment' | 'success'
function CheckoutProgress({ step }) {
  const detailsDone = step !== 'details'
  const paymentDone = step === 'success'
  const cls = (active, done) =>
    'cc-progress__step' + (done ? ' is-done' : '') + (active && !done ? ' is-active' : '')

  return (
    <div className="cc-progress" role="list" aria-label="Checkout progress">
      <div className={cls(false, true)} role="listitem">
        <span className="cc-progress__num"><FiCheck size={14} /></span>
        <span className="cc-progress__label">Cart</span>
      </div>
      <span className={'cc-progress__line' + (detailsDone ? ' is-done' : '')} />
      <div className={cls(step === 'details', detailsDone)} role="listitem">
        <span className="cc-progress__num">{detailsDone ? <FiCheck size={14} /> : '2'}</span>
        <span className="cc-progress__label">Details</span>
      </div>
      <span className={'cc-progress__line' + (paymentDone ? ' is-done' : '')} />
      <div className={cls(step === 'payment', paymentDone)} role="listitem">
        <span className="cc-progress__num">{paymentDone ? <FiCheck size={14} /> : '3'}</span>
        <span className="cc-progress__label">Payment</span>
      </div>
      <span className={'cc-progress__line' + (paymentDone ? ' is-done' : '')} />
      <div className={cls(step === 'success', paymentDone)} role="listitem">
        <span className="cc-progress__num">{paymentDone ? <FiCheck size={14} /> : '4'}</span>
        <span className="cc-progress__label">Done</span>
      </div>
    </div>
  )
}
