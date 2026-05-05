import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiHeart, FiCheckCircle, FiSend, FiTrash2, FiLock, FiLogOut } from 'react-icons/fi'
import PageHero from '../components/PageHero.jsx'
import { addReview, deleteReview, getReviews, summarize, timeAgo } from '../services/reviews.js'
import { isFirebaseEnabled } from '../firebase.js'
import ReviewCardSkeleton from '../components/skeletons/ReviewCardSkeleton.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'
import { img, u } from '../data/images.js'

function Stars({ count = 5, size = 14, color = 'var(--cc-rose)' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          size={size}
          fill={i < count ? color : 'transparent'}
          stroke={color}
          strokeWidth={1.5}
        />
      ))}
    </span>
  )
}

const sub = [
  { title: 'Delicious Treats', score: 4.9 },
  { title: 'Fresh Ingredients', score: 4.9 },
  { title: 'Customer Service', score: 4.8 },
  { title: 'Packaging', score: 4.9 },
]

export default function Reviews() {
  usePageMeta({
    title: 'Reviews',
    description: 'See what our customers say about Cake & Crumb — verified reviews on cheesecakes, milk cakes, cookies and custom cakes.',
  })
  useJsonLd('aggregate-rating', {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'Cake & Crumb',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      reviewCount: 245,
      bestRating: 5,
      worstRating: 1,
    },
  })
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [hover, setHover] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', rating: 5, title: '', text: '', orderItem: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  // ── Admin moderation (single hardcoded password, sessionStorage flag) ──
  const ADMIN_KEY = 'cc_admin_v1'
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return sessionStorage.getItem(ADMIN_KEY) === '1' } catch { return false }
  })
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPwd, setAdminPwd] = useState('')
  const [adminError, setAdminError] = useState('')
  // The password lives client-side. For real security, swap to Firebase Auth.
  // Set in code so it can be rotated without re-deploying env vars.
  const ADMIN_PASSWORD = 'cakeandcrumb2026'

  function tryAdminLogin(e) {
    e.preventDefault()
    if (adminPwd === ADMIN_PASSWORD) {
      try { sessionStorage.setItem(ADMIN_KEY, '1') } catch {}
      setIsAdmin(true)
      setShowAdminLogin(false)
      setAdminPwd('')
      setAdminError('')
    } else {
      setAdminError('Incorrect password.')
    }
  }
  function adminLogout() {
    try { sessionStorage.removeItem(ADMIN_KEY) } catch {}
    setIsAdmin(false)
  }
  async function onDelete(id, name) {
    if (!confirm(`Delete review by ${name || 'anonymous'}?`)) return
    const ok = await deleteReview(id)
    if (ok) reload()
    else alert('Could not delete. Check Firestore rules / connectivity.')
  }

  async function reload() {
    setLoading(true)
    try {
      const list = await getReviews()
      setReviews(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMsg('')
    try {
      await addReview(form)
      setForm({ name: '', email: '', rating: 5, title: '', text: '', orderItem: '' })
      setSubmitMsg('Thank you! Your review was submitted.')
      reload()
    } catch (err) {
      setSubmitMsg(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const stats = summarize(reviews)
  const breakdown = stats.breakdown

  return (
    <>
      <PageHero
        eyebrow="Customer Reviews"
        title={<>Baked with Love,<br />Loved by You</>}
        text="We're so grateful for your sweet words! Here's what our lovely customers have to say about their experience."
        cta={null}
        image={u(img.pinkDripCake2, 1000, 750)}
        imageAlt="Pink drip cake"
      />

      <section className="py-5">
        <div className="container">
          {/* Stats */}
          <div
            className="row g-4 p-3 p-md-4 mb-4"
            style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
          >
            <div className="col-md-3 text-center">
              <div style={{ fontSize: '0.85rem', color: 'var(--cc-cocoa-soft)' }}>Overall Rating</div>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '3rem', color: 'var(--cc-cocoa)', lineHeight: 1 }}>
                {stats.total > 0 ? stats.avg.toFixed(1) : '—'}
              </div>
              <div className="my-2"><Stars count={Math.round(stats.avg) || 5} size={18} /></div>
              <div style={{ fontSize: '0.8rem' }}>
                {stats.total > 0
                  ? `Based on ${stats.total} review${stats.total === 1 ? '' : 's'}`
                  : 'Be the first to review!'}
              </div>
            </div>
            <div className="col-md-4">
              {breakdown.map((b) => {
                const pct = stats.total > 0 ? (b.count / stats.total) * 100 : 0
                return (
                  <div key={b.stars} className="d-flex align-items-center mb-2" style={{ gap: '0.6rem', fontSize: '0.85rem' }}>
                    <span>{b.stars} <FiStar size={12} fill="var(--cc-rose)" stroke="var(--cc-rose)" /></span>
                    <div style={{ flex: 1, background: 'var(--cc-cream)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ background: 'var(--cc-rose)', height: '100%', width: `${pct}%`, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ width: 30, textAlign: 'right' }}>{b.count}</span>
                  </div>
                )
              })}
            </div>
            <div className="col-md-5">
              <div className="row g-3 text-center">
                {sub.map((s, i) => (
                  <div className="col-6 col-md-3" key={i}>
                    <span className="feature-icon mb-2" style={{ width: 44, height: 44 }}>
                      <FiHeart size={18} />
                    </span>
                    <div className="tag-badge" style={{ fontSize: '0.65rem' }}>{s.title}</div>
                    <div style={{ color: 'var(--cc-cocoa)', fontWeight: 700, marginTop: 4 }}>{s.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', margin: 0 }}>What Our Customers Are Saying</h3>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={adminLogout}
                    className="border-0"
                    style={{
                      background: 'rgba(207, 62, 99, 0.1)',
                      color: 'var(--cc-rose-deep)',
                      fontSize: '0.7rem',
                      padding: '0.3rem 0.7rem',
                      borderRadius: 999,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <FiLogOut size={11} /> Admin · Logout
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(true)}
                    className="border-0 bg-transparent"
                    aria-label="Admin login"
                    style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.7rem', opacity: 0.5 }}
                    title="Admin login"
                  >
                    <FiLock size={12} />
                  </button>
                )}
              </div>

              {showAdminLogin && !isAdmin && (
                <form
                  onSubmit={tryAdminLogin}
                  className="mb-3 p-3 d-flex flex-wrap"
                  style={{
                    gap: '0.5rem',
                    background: 'var(--cc-cream)',
                    border: '1px solid var(--cc-border)',
                    borderRadius: 10,
                  }}
                >
                  <input
                    type="password"
                    placeholder="Admin password"
                    value={adminPwd}
                    onChange={(e) => setAdminPwd(e.target.value)}
                    className="cc-input"
                    style={{ flex: 1, minWidth: 200 }}
                    autoFocus
                  />
                  <button type="submit" className="btn-rose" style={{ fontSize: '0.7rem' }}>Unlock</button>
                  <button
                    type="button"
                    onClick={() => { setShowAdminLogin(false); setAdminPwd(''); setAdminError('') }}
                    className="btn-outline-rose"
                    style={{ fontSize: '0.7rem' }}
                  >
                    Cancel
                  </button>
                  {adminError && (
                    <div style={{ flex: '1 1 100%', fontSize: '0.75rem', color: 'var(--cc-rose-deep)' }}>{adminError}</div>
                  )}
                </form>
              )}

              {loading && (
                <>
                  <ReviewCardSkeleton />
                  <ReviewCardSkeleton />
                  <ReviewCardSkeleton />
                </>
              )}

              {!loading && reviews.length === 0 && (
                <div
                  className="text-center py-5"
                  style={{ background: '#fff', border: '1px dashed var(--cc-border)', borderRadius: 14 }}
                >
                  <span className="feature-icon mb-3" style={{ width: 64, height: 64 }}>
                    <FiHeart size={24} />
                  </span>
                  <h5>No reviews yet</h5>
                  <p style={{ fontSize: '0.9rem' }}>Be the first to share your sweet experience!</p>
                </div>
              )}

              {!loading && reviews.map((r) => (
                <article
                  key={r.id}
                  className="d-flex flex-column flex-md-row p-3 p-md-4 mb-3 position-relative"
                  style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14, gap: '1rem' }}
                >
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onDelete(r.id, r.name)}
                      aria-label={`Delete review by ${r.name}`}
                      className="position-absolute"
                      style={{
                        top: 10, right: 10,
                        background: 'rgba(207, 62, 99, 0.1)',
                        border: '1px solid rgba(207, 62, 99, 0.3)',
                        color: 'var(--cc-rose-deep)',
                        borderRadius: 999,
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: 'pointer',
                      }}
                    >
                      <FiTrash2 size={11} /> Delete
                    </button>
                  )}
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'var(--cc-blush)',
                      color: 'var(--cc-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '1.6rem',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {(r.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center mb-2" style={{ gap: '0.6rem' }}>
                      <strong style={{ color: 'var(--cc-cocoa)' }}>{r.name}</strong>
                      <span
                        style={{
                          background: 'var(--cc-blush)',
                          color: 'var(--cc-rose)',
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 999,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <FiCheckCircle size={11} /> Verified
                      </span>
                      {r.createdAt && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--cc-cocoa-soft)' }}>
                          · {timeAgo(r.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="mb-1"><Stars count={Number(r.rating) || 5} /></div>
                    {r.title && <h5 style={{ fontSize: '1rem', margin: '0.3rem 0' }}>{r.title}</h5>}
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{r.text}</p>
                    {r.orderItem && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--cc-cocoa-soft)', marginTop: '0.4rem' }}>
                        Ordered: {r.orderItem}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <aside className="col-lg-4">
              <form
                onSubmit={onSubmit}
                className="p-4 mb-4"
                style={{ background: 'var(--cc-blush)', borderRadius: 14 }}
              >
                <div className="tag-badge mb-2">Share Your Experience</div>
                <p style={{ fontSize: '0.85rem' }}>
                  We'd love to hear your thoughts — they help us keep baking with love.
                </p>
                <div className="text-center mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className="border-0 bg-transparent p-1"
                      onMouseEnter={() => setHover(i + 1)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => update('rating', i + 1)}
                      aria-label={`Rate ${i + 1} stars`}
                    >
                      <FiStar
                        size={26}
                        fill={i < (hover || form.rating) ? 'var(--cc-rose)' : 'transparent'}
                        stroke="var(--cc-rose)"
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <input className="cc-input mb-2" placeholder="Your Name *" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                <input className="cc-input mb-2" placeholder="Your Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
                <input className="cc-input mb-2" placeholder="What did you order? (optional)" value={form.orderItem} onChange={(e) => update('orderItem', e.target.value)} />
                <input className="cc-input mb-2" placeholder="Title (optional)" value={form.title} onChange={(e) => update('title', e.target.value)} />
                <textarea className="cc-input mb-3" placeholder="Write your review here... *" rows={4} value={form.text} onChange={(e) => update('text', e.target.value)} required />
                {submitMsg && (
                  <div
                    className="mb-2 text-center"
                    style={{
                      fontSize: '0.8rem',
                      color: submitMsg.startsWith('Thank') ? 'var(--cc-rose-deep)' : 'var(--cc-rose-deep)',
                      background: '#fff',
                      padding: '0.5rem',
                      borderRadius: 8,
                    }}
                  >
                    {submitMsg}
                  </div>
                )}
                <button
                  className="btn-rose w-100 justify-content-center"
                  type="submit"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Submitting…' : <><FiSend /> Submit Review</>}
                </button>
                {!isFirebaseEnabled && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--cc-cocoa-soft)', textAlign: 'center', marginTop: '0.6rem', marginBottom: 0 }}>
                    Saved locally — connect Firebase to make reviews permanent.
                  </p>
                )}
              </form>

              <div
                className="p-4"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
              >
                <div className="tag-badge mb-3">What Customers Love</div>
                {[
                  { title: 'Beautiful Designs', text: 'Our treats look as good as they taste.' },
                  { title: 'Delicious Flavors', text: 'Made with love and the finest ingredients.' },
                  { title: 'Fresh & Timely', text: 'Always fresh, always delivered on time.' },
                  { title: 'Great Service', text: 'Friendly, helpful, and always here for you.' },
                ].map((it, i) => (
                  <div key={i} className="d-flex mb-3" style={{ gap: '0.6rem' }}>
                    <span className="feature-icon" style={{ width: 32, height: 32, flexShrink: 0 }}>
                      <FiHeart size={14} />
                    </span>
                    <div>
                      <div className="tag-badge" style={{ fontSize: '0.7rem' }}>{it.title}</div>
                      <p style={{ fontSize: '0.8rem', margin: 0 }}>{it.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
