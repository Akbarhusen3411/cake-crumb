import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiCheckCircle, FiHome, FiArrowLeft, FiSmartphone, FiTruck,
  FiCopy, FiShoppingBag, FiCalendar, FiAlertCircle, FiCheck, FiShield,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCart } from '../context/CartContext.jsx'
import { inr } from '../data/format.js'
import { u } from '../data/images.js'
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '../data/countries.js'
import { deliveryFee, isBulkOrder, depositAmount, DEPOSIT_PCT } from '../data/shopConfig.js'
import { kmFromBakeryByPincode } from '../services/delivery.js'
import { localIso } from '../utils/adminDate.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { saveOrder } from '../services/orders.js'
import { generateOrderId } from '../services/orderId.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'
import CertBadges from '../components/CertBadges.jsx'
import { sendOrderEmail, sendCustomerConfirmation } from '../services/emailNotify.js'

const UPI_ID = '9081668490@okbizaxis'
const PAYEE_NAME = 'Cake And Crumb'
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
  // OPTIONAL. The bakery works over WhatsApp — the phone number is the channel
  // that matters, and the customer confirmation email is itself optional (it
  // only sends when VITE_EMAILJS_CUSTOMER_TEMPLATE_ID is set). Demanding an
  // address for a mail that may never be sent cost orders for nothing. Still
  // validated when something IS typed, so a typo is caught rather than sent to
  // a dead address.
  email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email'),
  address: (v) => (v.trim() ? '' : 'Address is required'),
  city: (v) => (v.trim() ? '' : 'City is required'),
  pincode: (v) => (/^\d{6}$/.test(v.trim()) ? '' : 'Pincode must be 6 digits'),
  deliveryDate: (v, minDate) => (v && v >= minDate ? '' : 'Please pick a future date'),
}

// localIso, not toISOString: the latter is UTC, so between midnight and
// 05:30 IST "tomorrow" came back as today's date — the picker accepted a
// same-day order under a banner asking for at least a day's notice.
function getMinDeliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return localIso(d)
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
  const [copied, setCopied] = useState(false)

  // Distance-based delivery: straight-line km from the bakery to the customer's
  // pincode (geocoded via Nominatim). null = not known yet → treated as free.
  // deliveryCalc: 'idle' (no pincode) | 'loading' | 'done' | 'unknown' (lookup failed).
  const [deliveryKm, setDeliveryKm] = useState(null)
  const [deliveryCalc, setDeliveryCalc] = useState('idle')

  // Order ID reserved up front for the UPI flow, so the SAME id can be shown on
  // the pay screen + embedded in the UPI note and reused when the order is
  // placed. This is how the bakery ties a bank credit back to an order (no UTR).
  const [pendingOrderId, setPendingOrderId] = useState(null)

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
    // Two payment options only: 'upi' (Pay Now — customer pays via UPI QR and the
    // bakery verifies the credit in its bank) and 'cod' (pay on delivery/pickup).
    // The old "reserve — pay later" option was removed because customers reserved
    // without ever paying. Default is Pay Now.
    payment: 'upi',
    // 'delivery' (home delivery, charges confirmed on WhatsApp) or 'pickup'
    // (customer picks up from the bakery — free).
    deliveryMethod: 'delivery',
  })

  // One-time cleanup: clear any legacy customer/draft data left in
  // localStorage from before pre-fill was removed.
  useEffect(() => { clearStoredCustomer() }, [])

  // Estimate delivery distance whenever the pincode completes (home delivery only).
  // Pickup or an incomplete pincode resets to "free / not calculated".
  useEffect(() => {
    if (form.deliveryMethod !== 'delivery' || !/^\d{6}$/.test(form.pincode.trim())) {
      setDeliveryKm(null)
      setDeliveryCalc('idle')
      return
    }
    let cancelled = false
    setDeliveryCalc('loading')
    kmFromBakeryByPincode(form.pincode.trim()).then((km) => {
      if (cancelled) return
      if (km == null) {
        setDeliveryKm(null)
        setDeliveryCalc('unknown')
      } else {
        setDeliveryKm(km)
        setDeliveryCalc('done')
      }
    })
    return () => { cancelled = true }
  }, [form.pincode, form.deliveryMethod])

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

  // Distance-based delivery (see shopConfig.js): free within 10 km of the bakery,
  // then flat price bands by distance. Free for pickup; free while unknown.
  const delivery = deliveryFee(form.deliveryMethod, deliveryKm)
  const total = subtotal + delivery

  // Fraud protection (see shopConfig.js). A "bulk" cart (subtotal ≥ ₹1000) can't
  // use plain full-unpaid Cash on Delivery — the customer must pay a 50% advance
  // now (UPI) or pay in full. This is what stops a fake-address no-show from
  // costing the bakery a whole day's bake.
  const bulk = isBulkOrder(subtotal)
  const depositAmt = depositAmount(total)   // 50% advance paid now (UPI)
  const balanceDue = total - depositAmt     // rest paid on pickup / delivery
  // How much the customer pays *now* via UPI: the deposit for a bulk deposit,
  // otherwise the full total.
  const payNow = form.payment === 'deposit' ? depositAmt : total

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
    // Blank is fine; a malformed address is not (see VALIDATORS.email).
    const emailOk = !form.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
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

  // Valid payment choices depend on order size: a bulk order allows full UPI or a
  // 50% deposit (no plain COD); a normal order allows full UPI or COD.
  const isPaymentValid = bulk
    ? (form.payment === 'upi' || form.payment === 'deposit')
    : (form.payment === 'upi' || form.payment === 'cod')

  const isFormValid = isDetailsValid && isPaymentValid && subtotal > 0

  // Keep the selected payment method consistent with the order size. When a cart
  // crosses into "bulk", a stale 'cod' choice becomes invalid → switch to the
  // deposit; when it drops back below bulk, a stale 'deposit' → full UPI. Only
  // fires on the bulk flip, so it never fights a choice the customer makes while
  // the bulk status is unchanged.
  useEffect(() => {
    setForm((p) => {
      if (bulk && p.payment === 'cod') return { ...p, payment: 'deposit' }
      if (!bulk && p.payment === 'deposit') return { ...p, payment: 'upi' }
      return p
    })
  }, [bulk])

  // Reserve the order ID as soon as the details are valid and the customer is
  // paying by UPI (full or deposit — both show a QR with the id in the note) —
  // generated once, then reused at submit so the bank credit can be matched.
  useEffect(() => {
    if ((form.payment === 'upi' || form.payment === 'deposit') && isDetailsValid && !pendingOrderId) {
      setPendingOrderId(generateOrderId(form.name))
    }
  }, [form.payment, isDetailsValid, pendingOrderId, form.name])

  const [placedItems, setPlacedItems] = useState([])
  const [placedTotals, setPlacedTotals] = useState({ subtotal: 0, delivery: 0, total: 0 })
  const [placedDeliveryDate, setPlacedDeliveryDate] = useState('')

  function buildOrderMessage(id, snapshotItems, totals, deliveryDate) {
    const isPickup = form.deliveryMethod === 'pickup'
    // Deposit figures derived from the passed totals so the success-page re-send
    // (which runs after the cart is cleared) still shows the right numbers.
    const dep = depositAmount(totals.total)
    const bal = totals.total - dep
    let paymentLine
    if (form.payment === 'deposit') {
      paymentLine =
        `*💳 Payment:* 50% advance ${inr(dep)} paid via UPI (bakery will verify)\n` +
        `*💵 Balance:* ${inr(bal)} on ${isPickup ? 'pickup' : 'delivery'}`
    } else if (form.payment === 'upi') {
      paymentLine = '*💳 Payment:* UPI — Paid in full (bakery will verify)'
    } else {
      paymentLine = '*💳 Payment:* Cash on Delivery'
    }

    const methodLine = isPickup
      ? '*🚶 Order type:* Self-Pickup (free)'
      : '*🚚 Order type:* Home Delivery'

    // Clean CUSTOMER receipt — order + price only, no admin links and no repeated
    // personal details. The bakery sees the full name / phone / address in the
    // /admin/orders dashboard (matched to this message by the order ID) and
    // confirms or cancels from there, which messages the customer back.
    const lines = [
      `🎂 *My Order — ${id}*`,
      '━━━━━━━━━━━━━━━━━━━━',
      ...(deliveryDate ? [`*📅 Preferred date:* ${formatDateForDisplay(deliveryDate)}`] : []),
      methodLine,
      '',
      '*📋 Items:*',
      ...snapshotItems.map((it) => `  • ${it.name} × ${it.qty} = ${inr(it.price * it.qty)}`),
      '━━━━━━━━━━━━━━━━━━━━',
      `*Subtotal:* ${inr(totals.subtotal)}`,
      isPickup
        ? '*Delivery:* FREE (pickup)'
        : totals.delivery > 0
          ? `*Delivery:* ${inr(totals.delivery)}`
          : '*Delivery:* FREE',
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

    // Reuse the id reserved for the UPI pay screen (so it matches what the
    // customer saw / what's in the UPI note); COD orders generate one here.
    const id = pendingOrderId || generateOrderId(form.name)
    const snapshotItems = items.map((it) => ({ ...it }))
    const snapshotTotals = { subtotal, delivery, total }

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
        method: form.payment, // 'upi' (full) | 'deposit' (50% now) | 'cod'
        // 'paid' is the customer's CLAIM for any UPI payment (full or advance) —
        // the bakery verifies the credit in its bank before confirming. No UTR.
        paid: form.payment === 'upi' || form.payment === 'deposit',
        // For a deposit order: how much was paid now, and what's still owed on
        // delivery. Shown in the admin dashboard so the bakery collects the rest.
        depositAmount: form.payment === 'deposit' ? depositAmount(snapshotTotals.total) : 0,
        balanceDue:
          form.payment === 'deposit'
            ? snapshotTotals.total - depositAmount(snapshotTotals.total)
            : form.payment === 'cod'
              ? snapshotTotals.total
              : 0,
      },
      deliveryDate: form.deliveryDate,
      deliveryMethod: form.deliveryMethod,
      // Distance is stored for the bakery's reference only (shown in the admin
      // dashboard, never to the customer). null for pickup / unknown.
      deliveryKm: form.deliveryMethod === 'delivery' ? deliveryKm : null,
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
          {/* One h1 per route — these three are alternate branches (empty,
              placed, and the form itself), so only one renders at a time. */}
          <h1 className="section-title">Nothing to checkout</h1>
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
          <h1 className="section-title">Order Placed!</h1>
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
              ? "We'll verify your UPI payment in our account and confirm on WhatsApp. Tip: reply with a screenshot of your payment to help us match it faster."
              : form.payment === 'deposit'
                ? "We'll verify your advance payment and confirm on WhatsApp. The balance is paid on delivery/pickup. Tip: reply with a screenshot to help us match it faster."
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
          <h1 className="section-title mt-2">Almost There</h1>
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
                id="checkout-details"
                className="p-4 mb-4 cc-checkout-anchor"
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
                          <option key={c.code} value={c.code} title={c.name}>
                            {c.flag} {c.code} {c.short}
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
                    {/* NOT `required`, deliberately. It was — and since Place
                        Order is a type="submit" inside this form, the browser's
                        own constraint check ran first and refused every
                        checkout with an empty email. On a field labelled
                        "(optional)", whose validator treats blank as valid and
                        which isDetailsValid does not require. Phone is the real
                        channel and the confirmation mail only sends when
                        VITE_EMAILJS_CUSTOMER_TEMPLATE_ID is set. Don't re-add
                        it; a typed address is still checked by
                        VALIDATORS.email. */}
                    <input
                      className="cc-input" placeholder="Email (optional)" type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      onBlur={() => onFieldBlur('email')}
                      aria-invalid={Boolean(touched.email && errors.email)}
                      style={{ borderColor: touched.email && errors.email ? '#cf3e63' : undefined }}
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
                id="checkout-payment"
                className="p-4 cc-checkout-anchor"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
              >
                <h4 className="mb-3" style={{ fontSize: '1.2rem' }}>Payment Method</h4>

                {bulk && (
                  <div
                    className="d-flex align-items-start mb-3"
                    style={{
                      gap: '0.6rem',
                      background: 'rgba(224, 97, 122, 0.08)',
                      border: '1px solid var(--cc-rose-soft)',
                      borderRadius: 12,
                      padding: '0.8rem 1rem',
                      fontSize: '0.82rem',
                      color: 'var(--cc-cocoa)',
                      lineHeight: 1.55,
                    }}
                  >
                    <FiAlertCircle size={17} style={{ flexShrink: 0, marginTop: 2, color: 'var(--cc-rose)' }} />
                    <span>
                      This is a <strong>larger order ({inr(subtotal)})</strong>. To reserve your slot we ask
                      for a <strong>{Math.round(DEPOSIT_PCT * 100)}% advance ({inr(depositAmt)})</strong> now,
                      or full payment — the balance is paid on {form.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}.
                      Full cash-on-delivery isn’t available for orders this size.
                    </span>
                  </div>
                )}

                <div className="d-flex flex-column flex-md-row gap-3 mb-3">
                  {bulk ? (
                    <button
                      type="button"
                      className={'payment-tab' + (form.payment === 'deposit' ? ' active' : '')}
                      onClick={() => update('payment', 'deposit')}
                    >
                      <span className="icon-wrap"><FiSmartphone size={18} /></span>
                      <span>
                        <div>Pay {Math.round(DEPOSIT_PCT * 100)}% Advance</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--cc-cocoa-soft)' }}>
                          {inr(depositAmt)} now · {inr(balanceDue)} on {form.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}
                        </div>
                      </span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={'payment-tab' + (form.payment === 'upi' ? ' active' : '')}
                    onClick={() => update('payment', 'upi')}
                  >
                    <span className="icon-wrap"><FiSmartphone size={18} /></span>
                    <span>
                      <div>{bulk ? 'Pay Full Now (UPI)' : 'Pay Now (UPI)'}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--cc-cocoa-soft)' }}>
                        {bulk ? `Pay ${inr(total)} now via any UPI app` : 'Scan & pay with any UPI app'}
                      </div>
                    </span>
                  </button>
                  {!bulk && (
                    <button
                      type="button"
                      className={'payment-tab' + (form.payment === 'cod' ? ' active' : '')}
                      onClick={() => update('payment', 'cod')}
                    >
                      <span className="icon-wrap"><FiTruck size={18} /></span>
                      <span>
                        <div>Cash on Delivery</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--cc-cocoa-soft)' }}>
                          {form.deliveryMethod === 'pickup'
                            ? 'Pay in cash when you collect'
                            : 'Pay in cash when it arrives'}
                        </div>
                      </span>
                    </button>
                  )}
                </div>

                {(form.payment === 'upi' || form.payment === 'deposit') && (() => {
                  const isDeposit = form.payment === 'deposit'
                  const noteText = pendingOrderId ? `Cake & Crumb ${pendingOrderId}` : 'Cake & Crumb order'
                  const upiPayString =
                    `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
                    `&pn=${encodeURIComponent(PAYEE_NAME)}` +
                    `&am=${payNow}` +
                    `&cu=INR` +
                    `&tn=${encodeURIComponent(noteText)}`
                  // The bakery's own Google Pay merchant QR (public/upi-qr.jpeg), not a
                  // generated one — a merchant QR carries the payee's merchant fields, which
                  // a plain `upi://pay` string can't reproduce. It carries no amount, so the
                  // figure to enter is stated above and under the code; the "Open in UPI App"
                  // button below still uses upiPayString, which does pre-fill amount + note.
                  const qrUrl = u('/upi-qr.jpeg')

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
                              {isDeposit ? 'Advance to Pay Now' : 'Amount to Pay'}
                            </div>
                            <div style={{ fontFamily: "'Lato', system-ui, sans-serif", fontSize: '1.4rem', color: 'var(--cc-cocoa)', lineHeight: 1 }}>
                              {inr(payNow)}
                            </div>
                            {isDeposit && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', marginTop: 4 }}>
                                Balance <strong style={{ color: 'var(--cc-cocoa)' }}>{inr(balanceDue)}</strong> on {form.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}
                              </div>
                            )}
                            {pendingOrderId && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', marginTop: 4 }}>
                                Order <strong style={{ color: 'var(--cc-cocoa)', letterSpacing: '0.04em' }}>{pendingOrderId}</strong>
                              </div>
                            )}
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
                              alt={`UPI payment QR code for ${PAYEE_NAME}`}
                              loading="lazy"
                              style={{
                                width: '100%',
                                maxWidth: 200,
                                height: 'auto',
                                display: 'block',
                              }}
                            />
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--cc-cocoa-soft)', marginTop: '0.6rem', marginBottom: 0 }}>
                            Scan with any UPI app and enter{' '}
                            <strong style={{ color: 'var(--cc-cocoa)' }}>{inr(payNow)}</strong>
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
                          background: 'var(--cc-cream)',
                          borderTop: '1px solid var(--cc-border)',
                          fontSize: '0.78rem',
                          color: 'var(--cc-cocoa-soft)',
                          lineHeight: 1.5,
                        }}
                      >
                        <strong style={{ color: 'var(--cc-cocoa)' }}>After you pay,</strong> tap{' '}
                        <strong>Place Order</strong> below. We match your payment to order{' '}
                        {pendingOrderId ? <strong style={{ color: 'var(--cc-cocoa)' }}>{pendingOrderId}</strong> : 'your order'}{' '}
                        in our account and confirm on WhatsApp — no reference number needed.
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
                          {/* This tab also shows for self-pickup, where there
                              is no delivery partner and nothing arrives at a
                              door. */}
                          Pay <strong>{inr(total)}</strong> in cash when you{' '}
                          {form.deliveryMethod === 'pickup' ? 'collect your order' : 'receive your order'}.
                          Please keep the exact amount ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Soft advance note for smaller custom orders. Bulk orders have
                    their own enforced deposit banner above, so this would be
                    redundant (and contradictory — "may" vs the required deposit). */}
                {!bulk && (
                  <div
                    className="d-flex align-items-start mt-3"
                    style={{
                      gap: '0.6rem',
                      background: 'var(--cc-cream)',
                      border: '1px dashed var(--cc-rose-soft)',
                      borderRadius: 12,
                      padding: '0.7rem 0.9rem',
                      fontSize: '0.78rem',
                      color: 'var(--cc-cocoa-soft)',
                      lineHeight: 1.5,
                    }}
                  >
                    <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--cc-rose)' }} />
                    <span>
                      For <strong>custom orders</strong>, Cake &amp; Crumb may confirm a small
                      advance on WhatsApp before baking. The balance is settled on pickup / delivery.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — order summary with Place Order inside */}
            <div className="col-lg-5">
              <div className="cc-summary-card sticky-lg-top" style={{ top: 'calc(var(--cc-header-h, 82px) + 1rem)' }}>
                <div className="cc-summary-card__head">
                  <span className="cc-summary-card__head-icon"><FiShoppingBag size={17} /></span>
                  <div>
                    <div className="cc-summary-card__title">Order Summary</div>
                    <div className="cc-summary-card__count">{count} item{count !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                <div className="cc-summary-card__items">
                  {items.map((it) => (
                    <div key={it.id} className="cc-summary-item">
                      <img src={u(it.img, 200, 200)} alt="" className="cc-summary-item__img" />
                      <div className="cc-summary-item__info">
                        <div className="cc-summary-item__name">{it.name}</div>
                        <div className="cc-summary-item__meta">
                          <span className="cc-summary-item__qty">×{it.qty}</span>
                          {inr(it.price)}
                        </div>
                      </div>
                      <span className="cc-summary-item__price">{inr(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="cc-summary-card__totals">
                  <div className="cc-summary-row">
                    <span>Subtotal</span>
                    <span>{inr(subtotal)}</span>
                  </div>
                  {/* Every state says something TRUE.
                      This used to fall through to a bold "FREE" the moment
                      Home Delivery was picked — before any pincode existed, so
                      before anything could possibly have been calculated. A
                      customer 30 km away read "FREE" and then got charged ₹150,
                      which also contradicted the Home Delivery card right above
                      it ("charges depend on distance"). Free is now only
                      claimed once a pincode has actually been looked up. */}
                  <div className="cc-summary-row">
                    <span>Delivery</span>
                    {form.deliveryMethod === 'pickup' ? (
                      <span className="cc-summary-delivery--free">FREE · pickup</span>
                    ) : deliveryCalc === 'loading' ? (
                      <span>…</span>
                    ) : deliveryCalc === 'idle' ? (
                      <span style={{ color: 'var(--cc-cocoa-soft)' }}>Add pincode</span>
                    ) : deliveryCalc === 'unknown' ? (
                      <span style={{ color: 'var(--cc-cocoa-soft)' }}>Confirmed on WhatsApp</span>
                    ) : delivery > 0 ? (
                      <span>{inr(delivery)}</span>
                    ) : (
                      <span className="cc-summary-delivery--free">FREE</span>
                    )}
                  </div>
                </div>

                <div className="cc-summary-total">
                  <span className="cc-summary-total__label">Total</span>
                  <span className="cc-summary-total__value">{inr(total)}</span>
                </div>

                {form.payment === 'deposit' && (
                  <div className="cc-summary-deposit">
                    <span>Pay now · {Math.round(DEPOSIT_PCT * 100)}% advance</span>
                    <strong>{inr(depositAmt)}</strong>
                  </div>
                )}

                <button type="submit" className="cc-place-order-btn" disabled={!isFormValid}>
                  <FiCheckCircle size={18} /> Place Order
                </button>

                <div className="cc-summary-trust">
                  <span><FiShield size={12} /> Secure</span>
                  <span><FiCheckCircle size={12} /> Freshly baked</span>
                  <span><FaWhatsapp size={12} /> Order updates</span>
                </div>

                {/* Checkout uses MiniFooter, so the footer's registration line
                    never renders here — repeat it at the point of payment. */}
                <CertBadges variant="line" className="cc-summary-certs" />

                {/* Was plain text pointing at "terms & conditions" that had no
                    page behind them. Now it links to the two that exist — on a
                    page that takes a UPI advance, the cancellation terms should
                    be one tap from the pay button, not buried in the footer. */}
                <p className="cc-summary-terms">
                  By placing your order you agree to our{' '}
                  <Link to="/refund-policy">cancellation &amp; refund policy</Link>
                  {' '}and{' '}
                  <Link to="/privacy">privacy policy</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Room to scroll clear of the fixed bar, so the terms line at the
              bottom of the summary isn't stuck underneath it. */}
          <div className="cc-checkout-bar__spacer" aria-hidden />

          {/* Sticky action bar — phones and tablets only (hidden at lg+, where
              the summary card is sticky beside the form and Place Order is
              already in view). Without it the button sits below twenty fields
              AND the whole order summary, so the customer scrolls the page
              twice to buy.
              Deliberately NOT disabled when the form is incomplete: a dead
              button tells you nothing. It takes you to whichever section is
              still missing something instead. */}
          <div className="cc-checkout-bar">
            <div className="cc-checkout-bar__total">
              <span>Total</span>
              <strong>{inr(total)}</strong>
            </div>
            <button
              type="submit"
              className="cc-checkout-bar__btn"
              onClick={(e) => {
                if (isFormValid) return // let it submit
                e.preventDefault()
                const target = !isDetailsValid ? 'checkout-details' : 'checkout-payment'
                document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              <FiCheckCircle size={17} />
              {isFormValid ? 'Place Order' : 'Complete your details'}
            </button>
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
