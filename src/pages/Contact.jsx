import { useMemo, useState } from 'react'
import {
  FiMapPin, FiPhone, FiClock, FiInstagram, FiHeart,
  FiCheckCircle, FiChevronDown,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import HeartDivider from '../components/HeartDivider.jsx'
import { img, u } from '../data/images.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'

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

  function onSubmit(e) {
    e.preventDefault()
    if (!required) return
    window.open(buildWhatsAppLink(buildMessage()), '_blank', 'noopener,noreferrer')
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
                fetchpriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal contact strip — replaces the sticky left card.
          Sits below the hero, gives quick access to WhatsApp / Phone /
          IG / hours without floating into the sticky header zone. */}
      <section className="py-4">
        <div className="container">
          <div className="cc-contact-strip">
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
                <div className="cc-contact-strip__label">Call (primary)</div>
                <div className="cc-contact-strip__value">+91 91731 83440</div>
              </div>
            </a>
            <a href="tel:+919081668490" className="cc-contact-strip__item">
              <span className="cc-contact-strip__icon"><FiPhone size={14} /></span>
              <div>
                <div className="cc-contact-strip__label">Call (alternate)</div>
                <div className="cc-contact-strip__value">+91 90816 68490</div>
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
            <div className="cc-contact-strip__item cc-contact-strip__item--info">
              <span className="cc-contact-strip__icon"><FiClock size={14} /></span>
              <div>
                <div className="cc-contact-strip__label">Lead time</div>
                <div className="cc-contact-strip__value">Pre-order 1 day in advance</div>
              </div>
            </div>
            <div className="cc-contact-strip__item cc-contact-strip__item--info">
              <span className="cc-contact-strip__icon"><FiMapPin size={14} /></span>
              <div>
                <div className="cc-contact-strip__label">Delivery</div>
                <div className="cc-contact-strip__value">Home delivery or pickup</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width custom order form — no sidebar, no sticky */}
      <section className="py-4 py-md-5">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="row">
            <div className="col-12">
              <form
                onSubmit={onSubmit}
                className="p-4 p-md-4"
                style={{
                  background: '#fff',
                  border: '1px solid var(--cc-border)',
                  borderRadius: 14,
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
                  <div className="col-md-6">
                    <select
                      className="cc-input"
                      value={form.occasion}
                      onChange={(e) => update('occasion', e.target.value)}
                      required
                    >
                      <option value="">Occasion *</option>
                      {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <input
                      className="cc-input"
                      type="date"
                      min={minDate}
                      value={form.needBy}
                      onChange={(e) => update('needBy', e.target.value)}
                      required
                      title="Need by *"
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
