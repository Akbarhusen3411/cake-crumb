import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiCheckCircle, FiHome, FiArrowLeft, FiSmartphone, FiTruck,
  FiCopy, FiShoppingBag,
} from 'react-icons/fi'
import { useCart } from '../context/CartContext.jsx'
import { inr } from '../data/format.js'
import { u, asset } from '../data/images.js'

const UPI_ID = '9081668490@kotakbank'
const PAYEE_NAME = 'Momin Akbarhusen Gulamali'

export default function Checkout() {
  const { items, count, subtotal, delivery, total, clear } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState('checkout') // checkout | success
  const [orderId, setOrderId] = useState(null)
  const [paid, setPaid] = useState(false)
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

  function placeOrder(e) {
    e.preventDefault()
    if (!isFormValid) return
    if (form.payment === 'upi' && !paid) {
      alert('Please mark "I have paid" after completing your UPI payment.')
      return
    }
    const id = 'CC-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    setOrderId(id)
    setStep('success')
    clear()
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
          <span className="feature-icon mb-3" style={{ width: 84, height: 84, color: 'var(--cc-rose)' }}>
            <FiCheckCircle size={40} />
          </span>
          <h2 className="section-title">Order Placed!</h2>
          <p className="mt-2">Thank you for your sweet order. We'll start baking right away.</p>
          <div
            className="d-inline-flex flex-column align-items-center mt-3 mb-4 px-4 py-3"
            style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 12 }}
          >
            <span className="tag-badge">Order ID</span>
            <strong style={{ color: 'var(--cc-cocoa)', fontSize: '1.2rem', letterSpacing: '0.06em' }}>
              {orderId}
            </strong>
          </div>
          <p style={{ fontSize: '0.9rem' }}>
            {form.payment === 'upi'
              ? 'Your UPI payment is being verified. We will confirm via WhatsApp/email shortly.'
              : 'Cash on Delivery — please keep the exact amount ready when our delivery partner arrives.'}
          </p>
          <div className="d-flex gap-2 justify-content-center mt-4 flex-wrap">
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

                {form.payment === 'upi' && (
                  <div
                    className="p-3 p-md-4 text-center"
                    style={{ background: 'var(--cc-cream)', borderRadius: 12 }}
                  >
                    <div className="tag-badge mb-2">Scan to pay {inr(total)}</div>
                    <img
                      src={asset('upi-qr.jpeg')}
                      alt="UPI QR code"
                      style={{
                        maxWidth: 260,
                        width: '100%',
                        height: 'auto',
                        borderRadius: 14,
                        margin: '0 auto',
                        display: 'block',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                      }}
                    />
                    <div className="mt-3" style={{ fontSize: '0.85rem' }}>
                      <div style={{ color: 'var(--cc-cocoa)' }}><strong>{PAYEE_NAME}</strong></div>
                      <div className="d-inline-flex align-items-center mt-1" style={{ gap: '0.4rem' }}>
                        <span>UPI ID: <strong>{UPI_ID}</strong></span>
                        <button
                          type="button"
                          onClick={copyUPI}
                          aria-label="Copy UPI ID"
                          className="border-0 bg-transparent"
                          style={{ color: 'var(--cc-rose)' }}
                        >
                          <FiCopy size={14} />
                        </button>
                        {copied && <span style={{ color: 'var(--cc-rose)', fontSize: '0.75rem' }}>Copied!</span>}
                      </div>
                    </div>
                    <label className="d-flex align-items-center justify-content-center mt-3" style={{ fontSize: '0.85rem', cursor: 'pointer', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={paid}
                        onChange={(e) => setPaid(e.target.checked)}
                        style={{ accentColor: 'var(--cc-rose)' }}
                      />
                      I have completed the UPI payment
                    </label>
                  </div>
                )}

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
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14, top: '90px' }}
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
                  <strong style={{ color: 'var(--cc-rose)', fontFamily: "'Playfair Display', serif", fontSize: '1.3rem' }}>
                    {inr(total)}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="btn-rose w-100 justify-content-center"
                  disabled={!isFormValid || (form.payment === 'upi' && !paid)}
                  style={{
                    opacity: !isFormValid || (form.payment === 'upi' && !paid) ? 0.5 : 1,
                    cursor: !isFormValid || (form.payment === 'upi' && !paid) ? 'not-allowed' : 'pointer',
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
