import { useState } from 'react'
import { FiMail, FiCheckCircle, FiSend } from 'react-icons/fi'
import { subscribeNewsletter } from '../services/newsletter.js'
import { sendNewsletterNotification } from '../services/emailNotify.js'

/**
 * Compact newsletter signup. Slot it into the footer or any inline section.
 */
export default function Newsletter({ compact = false }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const source = compact ? 'footer' : 'inline'
      await subscribeNewsletter(email, source)
      // Fire-and-forget: email the subscriber's address to the bakery inbox.
      sendNewsletterNotification(email, source).catch(() => {})
      setStatus('done')
      setEmail('')
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div
        className="d-flex align-items-center"
        style={{
          gap: '0.5rem',
          fontSize: compact ? '0.8rem' : '0.9rem',
          color: 'var(--cc-rose-deep)',
        }}
      >
        <FiCheckCircle size={compact ? 14 : 18} />
        <span>Thanks for subscribing! You'll hear from us soon.</span>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      {!compact && (
        <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
          <FiMail color="var(--cc-rose)" />
          <strong style={{ color: 'var(--cc-cocoa)' }}>Sweet news, in your inbox</strong>
        </div>
      )}
      {!compact && (
        <p style={{ fontSize: '0.85rem', color: 'var(--cc-cocoa-soft)', margin: '0 0 0.7rem' }}>
          New flavours, festival specials, and treat-of-the-week — no spam, ever.
        </p>
      )}
      <div className="newsletter-form">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="newsletter-form__input"
          disabled={status === 'loading'}
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="newsletter-form__btn"
        >
          {status === 'loading' ? '…' : (
            <>
              <FiSend size={14} />
              <span className="d-none d-sm-inline">Subscribe</span>
            </>
          )}
        </button>
      </div>
      {errorMsg && (
        <p style={{ fontSize: '0.75rem', color: '#cf3e63', marginTop: '0.4rem', marginBottom: 0 }}>
          {errorMsg}
        </p>
      )}
    </form>
  )
}
