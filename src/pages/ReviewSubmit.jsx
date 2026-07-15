import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiHeart, FiCheckCircle, FiSend, FiCamera, FiX } from 'react-icons/fi'
import { addReview } from '../services/reviews.js'
import { shopProducts } from '../data/products.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { compressImage } from '../utils/compressImage.js'
import { reviewCooldownMs, markReviewSubmitted, isHoneypotTripped, HONEYPOT_STYLE } from '../utils/reviewGuard.js'

// Grouped item list for the "What did you order?" dropdown — sourced from the
// live product catalog so it stays in sync with the Shop.
const ITEMS_BY_CATEGORY = shopProducts.reduce((acc, p) => {
  if (!acc[p.category]) acc[p.category] = []
  acc[p.category].push({ id: p.id, name: p.name })
  return acc
}, {})

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="d-inline-flex justify-content-center" style={{ gap: '0.3rem' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="border-0 bg-transparent p-0"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          <FiStar
            size={36}
            fill={n <= (hover || value) ? 'var(--cc-rose)' : 'transparent'}
            stroke="var(--cc-rose)"
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

export default function ReviewSubmit() {
  usePageMeta({
    title: 'Leave a Review',
    description: 'Share your Cake & Crumb experience — takes less than 30 seconds.',
  })
  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    text: '',
    orderItem: '',
    photo: '',
  })
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef(null)
  const hpRef = useRef(null) // honeypot — real users never fill this

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function onPickPhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    setPhotoBusy(true)
    setErrorMsg('')
    try {
      const dataUrl = await compressImage(file)
      update('photo', dataUrl)
    } catch (err) {
      setErrorMsg(err.message || 'Could not use that image. Try another one.')
    } finally {
      setPhotoBusy(false)
    }
  }

  function removePhoto() {
    update('photo', '')
  }

  async function onSubmit(e) {
    e.preventDefault()

    // Honeypot: a bot filled the hidden field → pretend success, drop it.
    if (isHoneypotTripped(hpRef.current?.value)) {
      setStatus('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Rate-limit: one review per minute per browser.
    const wait = reviewCooldownMs()
    if (wait > 0) {
      setErrorMsg(`Please wait ${Math.ceil(wait / 1000)}s before sending another review.`)
      setStatus('error')
      return
    }

    setStatus('submitting')
    setErrorMsg('')
    try {
      await addReview(form)
      markReviewSubmitted()
      setStatus('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section className="bg-cream py-5">
        <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
          <span className="feature-icon mb-3" style={{ width: 84, height: 84 }}>
            <FiCheckCircle size={40} />
          </span>
          <h1 className="section-title">Your Sweet Words Mean the World to Us! 💕</h1>
          <p className="mt-3" style={{ fontSize: '1.05rem' }}>
            Thank you, <strong>{form.name}</strong> — we'll keep baking with love. ♥
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
            <Link to="/reviews" className="btn-rose">
              <FiStar /> See All Reviews
            </Link>
            <Link to="/" className="btn-outline-rose">
              <FiHeart /> Back to Home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream py-5">
      <div className="container py-3" style={{ maxWidth: 720 }}>
        <div className="text-center mb-4">
          <span className="eyebrow">Share Your Experience</span>
          <h1 className="section-title mt-3">How was your treat?</h1>
          <div className="heart-divider"><span aria-hidden>♥</span></div>
          <p style={{ maxWidth: 480, margin: '0.5rem auto 0' }}>
            We'd love to hear about your Cake & Crumb experience. Your kind words help us
            keep baking with love and help others discover us.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-4 p-md-5"
          style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 16 }}
        >
          {/* Honeypot — hidden from humans; bots that fill every field trip it. */}
          <input
            ref={hpRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={HONEYPOT_STYLE}
          />
          {/* Star rating */}
          <div className="text-center mb-4">
            <div className="tag-badge mb-2">Your Rating</div>
            <StarPicker value={form.rating} onChange={(v) => update('rating', v)} />
            <div style={{ fontSize: '0.85rem', color: 'var(--cc-cocoa-soft)', marginTop: '0.4rem' }}>
              {['', 'Could be better', 'It was okay', 'Pretty good', 'Loved it', 'Absolutely perfect!'][form.rating]}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <input
                className="cc-input"
                placeholder="Your Name *"
                aria-label="Your name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
                maxLength={60}
              />
            </div>
            <div className="col-md-6">
              <input
                className="cc-input"
                placeholder="Email (optional)"
                aria-label="Email (optional)"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="col-12">
              <label className="cc-field-label" htmlFor="review-order-item">
                What did you order?
              </label>
              <select
                id="review-order-item"
                className="cc-input"
                aria-label="What did you order?"
                value={form.orderItem}
                onChange={(e) => update('orderItem', e.target.value)}
              >
                <option value="">Select your treat (optional)</option>
                {Object.entries(ITEMS_BY_CATEGORY).map(([cat, items]) => (
                  <optgroup key={cat} label={cat}>
                    {items.map((it) => (
                      <option key={it.id} value={it.name}>{it.name}</option>
                    ))}
                  </optgroup>
                ))}
                <option value="Custom / Other">Custom / Other</option>
              </select>
            </div>

            {/* Optional review photo */}
            <div className="col-12">
              <label className="cc-field-label">Add a photo (optional)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickPhoto}
                style={{ display: 'none' }}
              />
              {form.photo ? (
                <div className="cc-review-photo">
                  <img src={form.photo} alt="Your review" className="cc-review-photo__preview" />
                  <div className="cc-review-photo__meta">
                    <span className="cc-review-photo__ok">
                      <FiCheckCircle size={14} /> Photo added
                    </span>
                    <button
                      type="button"
                      className="cc-review-photo__remove"
                      onClick={removePhoto}
                    >
                      <FiX size={13} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="cc-review-photo__drop"
                  onClick={() => fileRef.current?.click()}
                  disabled={photoBusy}
                >
                  <FiCamera size={20} />
                  <span>{photoBusy ? 'Processing…' : 'Tap to add a photo of your treat'}</span>
                  <small>JPG or PNG — we'll pick one for you if you skip this.</small>
                </button>
              )}
            </div>
            <div className="col-12">
              <input
                className="cc-input"
                placeholder="Review Title (e.g. Absolutely Perfect!)"
                aria-label="Review title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="col-12">
              <textarea
                className="cc-input"
                rows={5}
                placeholder="Tell us about your experience... *"
                aria-label="Your review"
                value={form.text}
                onChange={(e) => update('text', e.target.value)}
                required
                maxLength={1000}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textAlign: 'right' }}>
                {form.text.length}/1000
              </div>
            </div>
          </div>

          {errorMsg && (
            <div
              className="mt-3 p-2 text-center"
              style={{ background: '#fde8eb', color: 'var(--cc-rose-deep)', borderRadius: 8, fontSize: '0.85rem' }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn-rose w-100 justify-content-center mt-4"
            disabled={status === 'submitting'}
            style={{ opacity: status === 'submitting' ? 0.6 : 1 }}
          >
            {status === 'submitting' ? (
              <>Submitting...</>
            ) : (
              <>
                <FiSend /> Submit Review
              </>
            )}
          </button>

          <p
            style={{
              fontSize: '0.7rem',
              color: 'var(--cc-cocoa-soft)',
              textAlign: 'center',
              marginTop: '0.8rem',
              marginBottom: 0,
            }}
          >
            By submitting you agree to let us share your name and review publicly. We'll
            never share your email.
          </p>
        </form>
      </div>
    </section>
  )
}
