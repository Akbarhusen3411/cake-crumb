import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMapPin, FiPhone, FiClock, FiInstagram, FiHeart, FiMail,
  FiCheckCircle, FiChevronDown, FiHelpCircle, FiArrowRight,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import HeartDivider from '../components/HeartDivider.jsx'
import { img, u } from '../data/images.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'
import { DELIVERY } from '../data/shopConfig.js'

const OCCASIONS = [
  'Birthday', 'Wedding', 'Anniversary', 'Engagement',
  'Baby Shower', 'Festival', 'Corporate', 'Just Because',
]
const PRODUCT_CATEGORIES = [
  'Cheesecake', 'Milk Cake', 'Cupcakes', 'Cookies',
  'Number / Letter Cake', 'Custom Designed', 'Other',
]
const BUDGET_RANGES = [
  'Under ₹500', '₹500 – ₹1,000', '₹1,000 – ₹2,000',
  '₹2,000 – ₹5,000', '₹5,000+', 'Open / discuss',
]

function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function Contact() {
  usePageMeta({
    title: 'Custom Orders & Contact',
    description: 'Place a custom cake order — tell us your occasion, date and flavour, and we will send a quote on WhatsApp.',
  })

  const minDate = useMemo(() => tomorrowISO(), [])
  const [showMore, setShowMore] = useState(false)
  // Fallback state for a blocked WhatsApp pop-up — see onSubmit.
  const [blocked, setBlocked] = useState(false)
  const [waLink, setWaLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    occasion: '', needBy: '',
    servings: '', category: '',
    flavor: '', message: '', budget: '', notes: '',
  })

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const phoneValid = /^[6-9]\d{9}$/.test(form.phone.trim())
  const required = form.name.trim() && phoneValid && form.occasion && form.needBy

  function buildMessage() {
    const lines = [
      "Hi! I'd like to place a custom order from Cake & Crumb.",
      '',
      `*Name:* ${form.name}`,
      `*Phone:* +91 ${form.phone}`,
    ]
    if (form.email) lines.push(`*Email:* ${form.email}`)
    lines.push(`*Occasion:* ${form.occasion}`, `*Need By:* ${form.needBy}`)
    if (form.servings) lines.push(`*Servings:* ${form.servings}`)
    if (form.category) lines.push(`*Cake type:* ${form.category}`)
    if (form.flavor) lines.push(`*Flavour:* ${form.flavor}`)
    if (form.message) lines.push(`*Message on cake:* ${form.message}`)
    if (form.budget) lines.push(`*Budget:* ${form.budget}`)
    if (form.notes) lines.push(`*Notes:* ${form.notes}`)
    lines.push('', 'I can share inspiration images here on WhatsApp. Thanks!')
    return lines.join('\n')
  }

  /**
   * A blocked pop-up used to lose the whole enquiry.
   *
   * `window.open` is called synchronously off the click — that part is right,
   * and must stay: any `await` before it and mobile browsers block the window
   * outright (the same lesson AdminOrders records). But when it IS blocked,
   * `open()` returns null and the old code did nothing at all. The customer
   * had filled in nine fields, tapped submit, and got silence — and since this
   * form stores nothing anywhere, that lead was simply gone.
   *
   * Now a null return raises a fallback panel with a plain link and a copy
   * button, so the message always survives the failure.
   */
  function onSubmit(e) {
    e.preventDefault()
    if (!required) return
    const link = buildWhatsAppLink(buildMessage())
    setWaLink(link)
    const win = window.open(link, '_blank', 'noopener,noreferrer')
    setBlocked(!win || win.closed || typeof win.closed === 'undefined')
    setCopied(false)
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(buildMessage())
      setCopied(true)
    } catch {
      setCopied(false) // clipboard denied — the link below still works
    }
  }

  return (
    <>
      {/* ───── HERO — matches About/Menu/Shop/Reviews/Gallery ───── */}
      <section className="cc-contact-hero">
        <div className="container py-4 py-md-5">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="eyebrow mb-3 d-inline-flex">Get in Touch</span>
              <h1 className="cc-contact-hero__title">
                Let's Make Something<br />Sweet Together
              </h1>
              <HeartDivider width={50} />
              <p className="cc-contact-hero__lede">
                Tell us about your celebration and we'll send a quote on WhatsApp
                within a few hours.
              </p>
            </div>
            <div className="col-lg-6">
              <img
                src={u(img.heroContact, 1000, 800)}
                alt="Pink-frosted cupcakes on a white ceramic plate"
                className="cc-contact-hero__img"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Two columns: how to reach us on the left, the custom-order form on the
          right.

          This was a horizontal strip of six tiles above the form. Six across
          left each one ~150px, so "cakeandcrumb.in@gmail.com" broke mid-word
          into "cakeandcrumb.in@g / mail.com" and the lead time ran to three
          ragged lines. Stacked in a column each row gets the full width and
          nothing wraps badly.

          NOT sticky — an earlier version of this left card was, and it floated
          up into the sticky header. It scrolls with the page. */}
      <section className="py-4 py-md-5">
        <div className="container" style={{ maxWidth: 1100 }}>
          {/* Sits ABOVE the form, not below it: the point is to answer the
              question before it turns into a message the bakery types out by
              hand. Allergens, lead time, delivery, cancellation and storage are
              all already written up on /faq. */}
          <Link to="/faq" className="cc-faq-nudge">
            <span className="cc-faq-nudge__icon"><FiHelpCircle size={16} /></span>
            <span>
              <strong>Quick question?</strong> Allergens, lead time, delivery and
              cancellation are all answered in our FAQs.
            </span>
            <FiArrowRight size={15} className="cc-faq-nudge__arrow" />
          </Link>

          <div className="row g-4">
            {/* LEFT — how to reach us */}
            <div className="col-lg-4">
              <div className="cc-contact-aside">
                <h2 className="cc-contact-aside__head">Reach us</h2>

                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-contact-strip__cta"
                >
                  <FaWhatsapp size={18} />
                  <div>
                    <div className="cc-contact-strip__label">Fastest reply</div>
                    <div className="cc-contact-strip__value">WhatsApp Us</div>
                  </div>
                </a>
                <a href="tel:+919173183440" className="cc-contact-strip__item">
                  <span className="cc-contact-strip__icon"><FiPhone size={14} /></span>
                  <div>
                    <div className="cc-contact-strip__label">Call</div>
                    <div className="cc-contact-strip__value">+91 91731 83440</div>
                  </div>
                </a>
                <a
                  href="https://www.instagram.com/cake_and_crumb_1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-contact-strip__item"
                >
                  <span className="cc-contact-strip__icon"><FiInstagram size={14} /></span>
                  <div>
                    <div className="cc-contact-strip__label">DM us</div>
                    <div className="cc-contact-strip__value">@cake_and_crumb_1</div>
                  </div>
                </a>
                {/* The contact page listed no email at all — it was in the footer
                    on every page except the one whose job is contact. */}
                <a href="mailto:cakeandcrumb.in@gmail.com" className="cc-contact-strip__item">
                  <span className="cc-contact-strip__icon"><FiMail size={14} /></span>
                  <div>
                    <div className="cc-contact-strip__label">Email</div>
                    <div className="cc-contact-strip__value">cakeandcrumb.in@gmail.com</div>
                  </div>
                </a>
                <div className="cc-contact-strip__item cc-contact-strip__item--info">
                  <span className="cc-contact-strip__icon"><FiClock size={14} /></span>
                  <div>
                    <div className="cc-contact-strip__label">Lead time</div>
                    <div className="cc-contact-strip__value">Order a day ahead — late orders are ready the next day</div>
                  </div>
                </div>
                {/* The old tile said "Home delivery or pickup" but never said pick
                    up FROM WHERE. Coordinates come from DELIVERY.origin, the same
                    constant the delivery calculator uses, so the pin cannot drift. */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${DELIVERY.origin.lat},${DELIVERY.origin.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cc-contact-strip__item"
                >
                  <span className="cc-contact-strip__icon"><FiMapPin size={14} /></span>
                  <div>
                    <div className="cc-contact-strip__label">Delivery or pickup</div>
                    <div className="cc-contact-strip__value">Vaso, Kheda, Gujarat 387380</div>
                  </div>
                </a>
              </div>
            </div>

            {/* RIGHT — the custom order form */}
            <div className="col-lg-8">
              {/* height:100% so this and the "Reach us" card end level.
                  Bootstrap's .row already stretches the two COLUMNS to equal
                  height; without this the card inside each column still sized
                  to its own content, so the shorter one stopped early and left
                  a ragged bottom edge between them. */}
              <form
                onSubmit={onSubmit}
                className="p-4 p-md-4"
                style={{
                  background: '#fff',
                  border: '1px solid var(--cc-border)',
                  borderRadius: 14,
                  height: '100%',
                }}
              >
                <div className="d-flex align-items-center mb-3" style={{ gap: '0.6rem' }}>
                  <span className="feature-icon" style={{ width: 36, height: 36 }}>
                    <FiHeart size={14} />
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Place a Custom Order</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--cc-cocoa-soft)', margin: 0 }}>
                      Submitting opens WhatsApp with details prefilled — attach photos there.
                    </p>
                  </div>
                </div>

                {/* Required fields — 2 columns */}
                <div className="row g-2 g-md-3">
                  <div className="col-md-6">
                    <input
                      className="cc-input"
                      placeholder="Your Name *"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      required
                      maxLength={60}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      className="cc-input"
                      placeholder="Phone (10-digit) *"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      inputMode="numeric"
                      required
                    />
                  </div>
                  {/* These two share a row and MUST both carry a label, or they
                      don't line up: "Need by" needs one (a bare dd-mm-yyyy box
                      explains nothing), and without a matching one on Occasion
                      the date field started a label's height lower than the
                      select beside it. */}
                  <div className="col-md-6">
                    <label className="cc-field-label" htmlFor="contact-occasion">Occasion *</label>
                    <select
                      id="contact-occasion"
                      className="cc-input"
                      value={form.occasion}
                      onChange={(e) => update('occasion', e.target.value)}
                      required
                    >
                      <option value="">Choose an occasion</option>
                      {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="cc-field-label" htmlFor="contact-need-by">Need by *</label>
                    {/* No aria-label here — it would override the <label> above
                        and is the same words twice. */}
                    <input
                      id="contact-need-by"
                      className="cc-input"
                      type="date"
                      min={minDate}
                      value={form.needBy}
                      onChange={(e) => update('needBy', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <select
                      className="cc-input"
                      value={form.category}
                      onChange={(e) => update('category', e.target.value)}
                    >
                      <option value="">Cake type</option>
                      {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <input
                      className="cc-input"
                      type="number"
                      min="1"
                      placeholder="Number of servings"
                      value={form.servings}
                      onChange={(e) => update('servings', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <input
                      className="cc-input"
                      placeholder="Flavour preference (e.g. Pistachio, Biscoff…)"
                      value={form.flavor}
                      onChange={(e) => update('flavor', e.target.value)}
                    />
                  </div>
                </div>

                {/* Optional details — collapsible */}
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="border-0 bg-transparent mt-3 mb-1 d-inline-flex align-items-center"
                  style={{
                    color: 'var(--cc-rose)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    gap: '0.3rem',
                    padding: 0,
                  }}
                >
                  <FiChevronDown
                    size={14}
                    style={{ transform: showMore ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                  {showMore ? 'Fewer details' : 'Add more details'}
                </button>

                {showMore && (
                  <div className="row g-2 g-md-3 mt-1" style={{ animation: 'qv-up 0.2s ease-out' }}>
                    <div className="col-md-6">
                      <input
                        className="cc-input"
                        placeholder="Email (optional)"
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <select
                        className="cc-input"
                        value={form.budget}
                        onChange={(e) => update('budget', e.target.value)}
                      >
                        <option value="">Budget</option>
                        {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <input
                        className="cc-input"
                        placeholder='Message on cake (e.g. "Happy Birthday Aanya!")'
                        value={form.message}
                        onChange={(e) => update('message', e.target.value)}
                        maxLength={80}
                      />
                    </div>
                    <div className="col-12">
                      <textarea
                        className="cc-input"
                        rows={2}
                        placeholder="Eggless / dietary needs, design ideas, theme…"
                        value={form.notes}
                        onChange={(e) => update('notes', e.target.value)}
                        maxLength={400}
                      />
                    </div>
                  </div>
                )}

                <div
                  className="mt-3 p-2 d-flex align-items-start"
                  style={{
                    background: 'var(--cc-cream)',
                    borderRadius: 8,
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <FiCheckCircle color="var(--cc-rose)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>
                    Opens WhatsApp with your details prefilled. Attach photos there — we reply with a quote within a few hours.
                  </span>
                </div>

                {/* Only appears when the browser refused the pop-up. Without
                    this the form looked broken and the enquiry vanished. */}
                {blocked && (
                  <div className="cc-contact-blocked" role="alert">
                    <p className="cc-contact-blocked__head">
                      <FiHelpCircle size={15} /> Your browser blocked the WhatsApp window
                    </p>
                    <p className="cc-contact-blocked__text">
                      Nothing is lost — your details are still filled in below. Use either option:
                    </p>
                    <div className="cc-contact-blocked__actions">
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-rose">
                        <FaWhatsapp size={15} /> Open WhatsApp
                      </a>
                      <button type="button" onClick={copyMessage} className="cc-contact-blocked__copy">
                        {copied ? 'Copied — paste it to us' : 'Copy my enquiry'}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-rose w-100 justify-content-center mt-3"
                  disabled={!required}
                  style={{
                    background: required ? '#25D366' : 'var(--cc-rose)',
                    opacity: required ? 1 : 0.5,
                    cursor: required ? 'pointer' : 'not-allowed',
                  }}
                >
                  <FaWhatsapp size={16} /> Send via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
