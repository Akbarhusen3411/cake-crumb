import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiCheckCircle, FiHome, FiArrowLeft, FiSmartphone, FiTruck,
  FiCopy, FiShoppingBag, FiCalendar, FiAlertCircle, FiCheck,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCart } from '../context/CartContext.jsx'
import { inr } from '../data/format.js'
import { u } from '../data/images.js'
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '../data/countries.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { saveOrder } from '../services/orders.js'
import { generateOrderId } from '../services/orderId.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'
import { sendOrderEmail, sendCustomerConfirmation } from '../services/emailNotify.js'

const UPI_ID = '9081668490@kotakbank'
const PAYEE_NAME = 'Momin Akbarhusen Gulamali'
// Legacy localStorage keys — used to pre-fill the form from the last order
// and from auto-saved drafts. Pre-fill was removed (customers reported old
// data appearing on a fresh checkout); the keys are still cleared on mount
// so anyone with existing saved data gets a clean form.
const CUSTOMER_INFO_KEY = 'cc_customer_v1'
const CUSTOMER_DRAFT_KEY = 'cc_customer_draft_v1'

// Field-level validators — used both onBlur (for the live red border) and
// on submit (for the disabled button check).
const VALIDATORS = {
  name: (v) => (v.trim() ? '' : 'Name is required'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email'),
  address: (v) => (v.trim() ? '' : 'Address is required'),
  city: (v) => (v.trim() ? '' : 'City is required'),
  pincode: (v) => (/^\d{6}$/.test(v.trim()) ? '' : 'Pincode must be 6 digits'),
  deliveryDate: (v, minDate) => (v && v >= minDate ? '' : 'Please pick a future date'),
}

function getMinDeliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function formatDateForDisplay(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function clearStoredCustomer() {
  try {
    localStorage.removeItem(CUSTOMER_INFO_KEY)
    localStorage.removeItem(CUSTOMER_DRAFT_KEY)
  } catch { /* ignore */ }
}

export default function Checkout() {
  usePageMeta({ title: 'Checkout' })
  const { items, count, subtotal, clear } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState('checkout') // checkout | success
  const [orderId, setOrderId] = useState(null)
  const [utr, setUtr] = useState('')
  const [copied, setCopied] = useState(false)

  // Form always starts empty — pre-fill was removed because customers were
  // seeing stale data from past visits on a fresh checkout.
  const [form, setForm] = useState({
    countryCode: DEFAULT_COUNTRY.code,
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
    deliveryDate: '',
    payment: 'upi',
    // 'delivery' (home delivery, charges confirmed on WhatsApp) or 'pickup'
    // (customer picks up from the bakery — free).
    deliveryMethod: 'delivery',
  })

  // One-time cleanup: clear any legacy customer/draft data left in
  // localStorage from before pre-fill was removed.
  useEffect(() => { clearStoredCustomer() }, [])

  // Per-field errors that show on blur (and on submit attempt). An empty
  // string means "valid"; a non-empty string is the error message.
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const minDeliveryDate = useMemo(() => getMinDeliveryDate(), [])

  function validateField(key, value) {
    const validator = VALIDATORS[key]
    if (!validator) return ''
    return key === 'deliveryDate' ? validator(value, minDeliveryDate) : validator(value)
  }

  function onFieldBlur(key) {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors((e) => ({ ...e, [key]: validateField(key, form[key]) }))
  }

  // Live phone validation (special-case since it depends on country length)
  function validatePhone() {
    const len = form.phone.length
    const selected = COUNTRY_CODES.find((c) => c.code === form.countryCode) || DEFAULT_COUNTRY
    if (len === 0) return 'Phone is required'
    if (len !== selected.len) return `Phone should be ${selected.len} digits`
    return ''
  }
  function onPhoneBlur() {
    setTouched((t) => ({ ...t, phone: true }))
    setErrors((e) => ({ ...e, phone: validatePhone() }))
  }

  // Delivery fee is intentionally not calculated here — bakery confirms the
  // delivery charge on WhatsApp once they know the address. Total shown on
  // checkout is just the subtotal; the WhatsApp message makes the
  // "delivery charges apply, confirmed separately" expectation clear.
  const total = subtotal
  const selectedCountry = useMemo(
    () => COUNTRY_CODES.find((c) => c.code === form.countryCode) || DEFAULT_COUNTRY,
    [form.countryCode]
  )

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function copyUPI() {
    navigator.clipboard?.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isDetailsValid = useMemo(() => {
    const phoneOk =
      form.phone.length === selectedCountry.len ||
      // accept 7–15 digits as a generic fallback for countries with
      // variable lengths
      (selectedCountry.len === 0 && form.phone.length >= 7 && form.phone.length <= 15)
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    return (
      form.name.trim() &&
      phoneOk &&
      emailOk &&
      // For self-pickup, address fields are optional. Home delivery still
      // needs address + city + 6-digit pincode so the bakery can quote a
      // delivery charge on WhatsApp.
      (form.deliveryMethod === 'pickup' ||
        (form.address.trim() && form.city.trim() && /^\d{6}$/.test(form.pincode.trim()))) &&
      form.deliveryDate && form.deliveryDate >= minDeliveryDate
    )
  }, [form, minDeliveryDate, selectedCountry])

  const isPaymentValid =
    form.payment === 'cod' || (form.payment === 'upi' && /^\d{12}$/.test(utr))

  const isFormValid = isDetailsValid && isPaymentValid && subtotal > 0

  const [placedItems, setPlacedItems] = useState([])
  const [placedTotals, setPlacedTotals] = useState({ subtotal: 0, delivery: 0, total: 0 })
  const [placedDeliveryDate, setPlacedDeliveryDate] = useState('')

  function buildOrderMessage(id, snapshotItems, totals, deliveryDate) {
    const fullPhone = `${form.countryCode} ${form.phone}`
    const paymentLine = form.payment === 'upi'
      ? `*💳 Payment:* UPI ✅ Paid\n*🧾 UTR:* ${utr}`
      : '*💳 Payment:* Cash on Delivery'

    const isPickup = form.deliveryMethod === 'pickup'
    const methodLine = isPickup
      ? '*🚶 Order type:* Self-Pickup (free)'
      : '*🚚 Order type:* Home Delivery — _please confirm delivery charge_'

    // Address line is omitted for pickup orders (customer doesn't need to
    // share home address). For delivery, include whatever they filled in.
    const addressLine = isPickup
      ? null
      : `*📍 Address:* ${[form.address, form.city, form.pincode].filter(Boolean).join(', ')}`

    // The customer is the sender of this message, so it intentionally carries
    // NO admin links — only the order + price. The bakery confirms/cancels from
    // the password-protected admin dashboard (/admin/orders), which then
    // messages the customer back on WhatsApp.
    const lines = [
      `🎂 *NEW ORDER — ${id}*`,
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      `*👤 Customer:* ${form.name}`,
      `*📞 Phone:* ${fullPhone}`,
      `*📧 Email:* ${form.email}`,
      ...(addressLine ? [addressLine] : []),
      ...(deliveryDate ? [`*📅 Preferred date:* ${formatDateForDisplay(deliveryDate)}`] : []),
      methodLine,
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      '*📋 Items:*',
      ...snapshotItems.map((it) => `  • ${it.name} × ${it.qty} = ${inr(it.price * it.qty)}`),
      '━━━━━━━━━━━━━━━━━━━━',
      `*Subtotal:* ${inr(totals.subtotal)}`,
      isPickup
        ? '*Delivery:* FREE (pickup)'
        : '*Delivery:* _will be confirmed by Cake & Crumb_',
      `*💰 Total (excl. delivery): ${inr(totals.total)}*`,
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
    const snapshotTotals = { subtotal, delivery: 0, total }

    const msg = buildOrderMessage(id, snapshotItems, snapshotTotals, form.deliveryDate)
    try {
      window.open(buildWhatsAppLink(msg), '_blank', 'noopener,noreferrer')
    } catch {
      // popup blocker — fallback button on success page
    }

    const orderData = {
      orderId: id,
      items: snapshotItems,
      totals: snapshotTotals,
      customer: {
        name: form.name,
        // store with country code so admin emails / WhatsApp messages
        // include the international prefix
        phone: `${form.countryCode}${form.phone}`,
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
    sendCustomerConfirmation(orderData)
    clearStoredCustomer()

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
            <Link to={`/track-order?id=${orderId}`} className="btn-outline-rose">
              <FiCalendar /> Track Order
            </Link>
            <Link to="/shop" className="btn-rose">
              <FiShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const progressStep = isDetailsValid ? 'payment' : 'details'

  return (
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

        <div className="cc-notice mb-4" role="note">
          <span className="cc-notice__icon"><FiAlertCircle size={16} /></span>
          <div>
            <strong>Pre-order required.</strong> All orders are handcrafted to order — please choose a delivery date <strong>at least 1 day from today</strong>.
          </div>
        </div>

        <form id="checkout-form" onSubmit={placeOrder}>
          <div className="row g-4">
            <div className="col-lg-7">
              <div
                className="p-4 mb-4"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
              >
                <h4 className="mb-3" style={{ fontSize: '1.2rem' }}>Delivery Details</h4>
                <div className="row g-3">
                  <div className="col-12">
                    <input
                      className="cc-input" placeholder="Full Name *"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      onBlur={() => onFieldBlur('name')}
                      aria-invalid={Boolean(touched.name && errors.name)}
                      style={{ borderColor: touched.name && errors.name ? '#cf3e63' : undefined }}
                      required
                    />
                    {touched.name && errors.name && (
                      <div className="cc-field-error">{errors.name}</div>
                    )}
                  </div>

                  {/* Phone with country code */}
                  <div className="col-12">
                    <label className="cc-field-label" htmlFor="phone-input">Phone *</label>
                    <div className="cc-phone-row">
                      <select
                        className="cc-input cc-phone-cc"
                        value={form.countryCode}
                        onChange={(e) => update('countryCode', e.target.value)}
                        aria-label="Country code"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} {c.name}
                          </option>
                        ))}
                      </select>
                      <input
                        id="phone-input"
                        className="cc-input cc-phone-num"
                        placeholder={selectedCountry.example || `${selectedCountry.len}-digit number`}
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 15))}
                        onBlur={onPhoneBlur}
                        aria-invalid={Boolean(touched.phone && errors.phone)}
                        style={{ borderColor: touched.phone && errors.phone ? '#cf3e63' : undefined }}
                        inputMode="numeric"
                        required
                      />
                    </div>
                    {touched.phone && errors.phone && (
                      <div className="cc-field-error">{errors.phone}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <input
                      className="cc-input" placeholder="Email *" type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      onBlur={() => onFieldBlur('email')}
                      aria-invalid={Boolean(touched.email && errors.email)}
                      style={{ borderColor: touched.email && errors.email ? '#cf3e63' : undefined }}
                      required
                    />
                    {touched.email && errors.email && (
                      <div className="cc-field-error">{errors.email}</div>
                    )}
                  </div>
                  {/* Delivery method — radio toggle + notice */}
                  <div className="col-12">
                    <label className="cc-field-label">How would you like to receive your order? *</label>
                    <div className="cc-delivery-method">
                      <label className={`cc-delivery-method__opt${form.deliveryMethod === 'delivery' ? ' is-active' : ''}`}>
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="delivery"
                          checked={form.deliveryMethod === 'delivery'}
                          onChange={() => update('deliveryMethod', 'delivery')}
                        />
                        <span className="cc-delivery-method__icon">🚚</span>
                        <span>
                          <strong>Home Delivery</strong>
                          <span className="cc-delivery-method__sub">Charges depend on distance — we'll confirm on WhatsApp</span>
                        </span>
                      </label>
                      <label className={`cc-delivery-method__opt${form.deliveryMethod === 'pickup' ? ' is-active' : ''}`}>
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="pickup"
                          checked={form.deliveryMethod === 'pickup'}
                          onChange={() => update('deliveryMethod', 'pickup')}
                        />
                        <span className="cc-delivery-method__icon">🚶</span>
                        <span>
                          <strong>Self-Pickup</strong>
                          <span className="cc-delivery-method__sub">Free — pick up from Vaso, Kheda</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <textarea
                      className="cc-input"
                      rows={2}
                      placeholder={form.deliveryMethod === 'pickup' ? 'Address (optional for pickup)' : 'Address (House, Street, Area) *'}
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      onBlur={() => onFieldBlur('address')}
                      aria-invalid={Boolean(form.deliveryMethod === 'delivery' && touched.address && errors.address)}
                      style={{ borderColor: form.deliveryMethod === 'delivery' && touched.address && errors.address ? '#cf3e63' : undefined }}
                      required={form.deliveryMethod === 'delivery'}
                    />
                    {form.deliveryMethod === 'delivery' && touched.address && errors.address && (
                      <div className="cc-field-error">{errors.address}</div>
                    )}
                  </div>
                  <div className="col-12 col-md-7">
                    <input
                      className="cc-input"
                      placeholder={form.deliveryMethod === 'pickup' ? 'City (optional)' : 'City *'}
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      onBlur={() => onFieldBlur('city')}
                      aria-invalid={Boolean(form.deliveryMethod === 'delivery' && touched.city && errors.city)}
                      style={{ borderColor: form.deliveryMethod === 'delivery' && touched.city && errors.city ? '#cf3e63' : undefined }}
                      required={form.deliveryMethod === 'delivery'}
                    />
                    {form.deliveryMethod === 'delivery' && touched.city && errors.city && (
                      <div className="cc-field-error">{errors.city}</div>
                    )}
                  </div>
                  <div className="col-12 col-md-5">
                    <input
                      className="cc-input"
                      placeholder={form.deliveryMethod === 'pickup' ? 'Pincode (optional)' : 'Pincode (6-digit) *'}
                      value={form.pincode}
                      onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      onBlur={() => onFieldBlur('pincode')}
                      aria-invalid={Boolean(touched.pincode && errors.pincode && form.deliveryMethod === 'delivery')}
                      style={{
                        borderColor:
                          form.deliveryMethod === 'delivery' && touched.pincode && errors.pincode ? '#cf3e63' : undefined,
                      }}
                      required={form.deliveryMethod === 'delivery'}
                    />
                    {form.deliveryMethod === 'delivery' && touched.pincode && errors.pincode && (
                      <div className="cc-field-error">{errors.pincode}</div>
                    )}
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
                      onBlur={() => onFieldBlur('deliveryDate')}
                      aria-invalid={Boolean(touched.deliveryDate && errors.deliveryDate)}
                      style={{ borderColor: touched.deliveryDate && errors.deliveryDate ? '#cf3e63' : undefined }}
                      required
                    />
                    {touched.deliveryDate && errors.deliveryDate ? (
                      <div className="cc-field-error">{errors.deliveryDate}</div>
                    ) : (
                      <p style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', margin: '0.35rem 0 0' }}>
                        Earliest: {formatDateForDisplay(minDeliveryDate)}
                      </p>
                    )}
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
                            <div style={{ fontFamily: "'Lato', system-ui, sans-serif", fontSize: '1.4rem', color: 'var(--cc-cocoa)', lineHeight: 1 }}>
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

            {/* RIGHT — order summary with Place Order inside */}
            <div className="col-lg-5">
              <div
                className="p-4 sticky-lg-top"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14, top: 'calc(var(--cc-header-h, 82px) + 1rem)' }}
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
                  <span style={{ color: 'var(--cc-cocoa-soft)', fontStyle: 'italic' }}>
                    {form.deliveryMethod === 'pickup' ? 'Free (pickup)' : 'Confirmed on WhatsApp'}
                  </span>
                </div>
                <hr style={{ borderColor: 'var(--cc-border)' }} />
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '1.05rem' }}>
                  <strong style={{ color: 'var(--cc-cocoa)' }}>Total</strong>
                  <strong style={{ color: 'var(--cc-rose)', fontFamily: "'Lato', system-ui, sans-serif", fontSize: '1.3rem' }}>
                    {inr(total)}
                  </strong>
                </div>
                {form.deliveryMethod === 'delivery' && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', marginTop: 0, marginBottom: '1rem', textAlign: 'right' }}>
                    + delivery charge (confirmed by us)
                  </p>
                )}
                <button
                  type="submit"
                  className="btn-rose w-100 justify-content-center"
                  disabled={!isFormValid}
                  style={{
                    opacity: !isFormValid ? 0.5 : 1,
                    cursor: !isFormValid ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FiCheckCircle /> Place Order
                </button>
                <p style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textAlign: 'center', marginTop: '0.6rem', marginBottom: 0 }}>
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
