import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiHeart, FiCheckCircle, FiSend } from 'react-icons/fi'
import { addReview } from '../services/reviews.js'

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
  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: 5,
    title: '',
    text: '',
    orderItem: '',
  })
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      await addReview(form)
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
          <h1 className="section-title">Thank you!</h1>
          <p className="mt-3" style={{ fontSize: '1.05rem' }}>
            Your review means the world to us, <strong>{form.name}</strong>. We'll keep
            baking with love. ♥
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
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="col-12">
              <input
                className="cc-input"
                placeholder="What did you order? (e.g. Pistachio Cheesecake)"
                value={form.orderItem}
                onChange={(e) => update('orderItem', e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="col-12">
              <input
                className="cc-input"
                placeholder="Review Title (e.g. Absolutely Perfect!)"
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
