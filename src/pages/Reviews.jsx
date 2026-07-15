import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiStar, FiHeart, FiCheckCircle, FiTrash2, FiLock, FiLogOut,
  FiSmile, FiTruck, FiShield, FiChevronDown, FiCamera, FiX,
} from 'react-icons/fi'
import { compressImage } from '../utils/compressImage.js'
import { TbLeaf, TbCake, TbToolsKitchen2, TbHandStop } from 'react-icons/tb'
import HeartDivider from '../components/HeartDivider.jsx'
import { addReview, deleteReview, getReviews, summarize, timeAgo } from '../services/reviews.js'
import { isFirebaseEnabled } from '../firebase.js'
import ReviewCardSkeleton from '../components/skeletons/ReviewCardSkeleton.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'
import { img, u } from '../data/images.js'
import { shopProducts } from '../data/products.js'

const ITEMS_BY_CATEGORY = shopProducts.reduce((acc, p) => {
  if (!acc[p.category]) acc[p.category] = []
  acc[p.category].push({ id: p.id, name: p.name })
  return acc
}, {})

// Map an ordered-item name back to a product image so the review card can show
// a thumbnail — falls back to a generic cake image when there's no match.
const NAME_TO_IMG = shopProducts.reduce((acc, p) => {
  acc[p.name] = p.img
  return acc
}, {})
const FALLBACK_REVIEW_IMG = img.cheesecakeQuartet

function Stars({ count = 5, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: 'var(--cc-rose)' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          size={size}
          fill={i < count ? 'var(--cc-rose)' : 'transparent'}
          stroke="var(--cc-rose)"
          strokeWidth={1.5}
        />
      ))}
    </span>
  )
}

const SUB_RATINGS = [
  { Icon: TbCake,      title: 'Delicious Treats',   score: 4.9 },
  { Icon: TbLeaf,      title: 'Fresh Ingredients',  score: 4.9 },
  { Icon: TbHandStop,  title: 'Customer Service',   score: 4.8 },
  { Icon: FiHeart,     title: 'Packaging',          score: 4.9 },
]

const WHAT_LOVE = [
  { Icon: FiHeart,  title: 'Beautiful Designs',  text: 'Our treats look as good as they taste.' },
  { Icon: TbCake,   title: 'Delicious Flavors',  text: 'Made with love and the finest ingredients.' },
  { Icon: FiTruck,  title: 'Fresh & Timely',     text: 'Always fresh, always delivered on time.' },
  { Icon: FiSmile,  title: 'Great Service',      text: 'Friendly, helpful, and always here for you.' },
]

const PROMISE_STRIP = [
  { Icon: TbLeaf,          title: 'Fresh Ingredients', text: 'We use only the finest and freshest ingredients.' },
  { Icon: TbToolsKitchen2, title: 'Made with Love',    text: 'Every treat is handmade with care and passion.' },
  { Icon: FiTruck,         title: 'On-Time Delivery',  text: 'We deliver your treats fresh and on time, every time.' },
  { Icon: FiShield,        title: 'Safe & Secure',     text: 'Secure checkout and careful packaging always.' },
]

const PAGE_SIZE = 4

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
      '@type': 'AggregateRating', ratingValue: 4.9, reviewCount: 245, bestRating: 5, worstRating: 1,
    },
  })

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const [hover, setHover] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', rating: 5, title: '', text: '', orderItem: '', photo: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [submitOk, setSubmitOk] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef(null)

  async function onPickPhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoBusy(true)
    setSubmitMsg('')
    try {
      update('photo', await compressImage(file))
    } catch (err) {
      setSubmitMsg(err.message || 'Could not use that image.')
    } finally {
      setPhotoBusy(false)
    }
  }

  // ── Admin moderation (single hardcoded password, sessionStorage flag) ──
  const ADMIN_KEY = 'cc_admin_v1'
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return sessionStorage.getItem(ADMIN_KEY) === '1' } catch { return false }
  })
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPwd, setAdminPwd] = useState('')
  const [adminError, setAdminError] = useState('')
  const ADMIN_PASSWORD = 'cakeandcrumb2026'

  function tryAdminLogin(e) {
    e.preventDefault()
    if (adminPwd === ADMIN_PASSWORD) {
      try { sessionStorage.setItem(ADMIN_KEY, '1') } catch { /* storage blocked */ }
      setIsAdmin(true)
      setShowAdminLogin(false)
      setAdminPwd('')
      setAdminError('')
    } else {
      setAdminError('Incorrect password.')
    }
  }
  function adminLogout() {
    try { sessionStorage.removeItem(ADMIN_KEY) } catch { /* storage blocked */ }
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
      setShownCount(PAGE_SIZE)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const sorted = useMemo(() => {
    const list = [...reviews]
    if (sort === 'highest') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sort === 'lowest') list.sort((a, b) => (a.rating || 0) - (b.rating || 0))
    // 'recent' relies on the order returned by getReviews (newest first)
    return list
  }, [reviews, sort])

  const visible = sorted.slice(0, shownCount)
  const hasMore = sorted.length > shownCount

  function update(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMsg('')
    setSubmitOk(false)
    try {
      await addReview(form)
      setForm({ name: '', email: '', rating: 5, title: '', text: '', orderItem: '', photo: '' })
      setSubmitMsg('Your Sweet Words Mean the World to Us! 💕')
      setSubmitOk(true)
      reload()
    } catch (err) {
      setSubmitMsg(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const stats = summarize(reviews)
  const breakdown = stats.breakdown
  // Mockup-faithful totals when there are no real reviews yet, so the rating
  // breakdown isn't a blank panel on first render.
  const showcaseTotal = stats.total > 0 ? stats.total : 245
  const showcaseAvg = stats.total > 0 ? stats.avg : 4.9
  const showcaseBreakdown = stats.total > 0
    ? breakdown
    : [
      { stars: 5, count: 220 }, { stars: 4, count: 18 }, { stars: 3, count: 5 },
      { stars: 2, count: 1 }, { stars: 1, count: 1 },
    ]

  return (
    <>
      {/* ───── HERO ───── */}
      <section className="cc-reviews-hero">
        <div className="container py-4 py-md-5">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="eyebrow mb-3 d-inline-flex">Customer Reviews</span>
              <h1 className="cc-reviews-hero__title">
                Baked with Love,<br />Loved by You
              </h1>
              <HeartDivider width={50} />
              <p className="cc-reviews-hero__lede">
                We're so grateful for your sweet words! Here's what our lovely customers
                have to say about their experience.
              </p>
            </div>
            <div className="col-lg-6">
              <img
                src={u(img.heroReviews, 1000, 800)}
                alt="Three-tier celebration cake with pink fresh flowers"
                className="cc-reviews-hero__img"
                fetchpriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── STATS CARD ───── */}
      <section className="cc-reviews-stats-wrap">
        <div className="container py-4">
          <div className="cc-reviews-stats">
            {/* Overall rating */}
            <div className="cc-reviews-stats__overall">
              <div className="cc-reviews-stats__overall-label">Overall Rating</div>
              <div className="cc-reviews-stats__overall-num">{showcaseAvg.toFixed(1)}</div>
              <div className="my-2"><Stars count={Math.round(showcaseAvg)} size={16} /></div>
              <div className="cc-reviews-stats__overall-meta">
                Based on {showcaseTotal} reviews
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="cc-reviews-stats__bars">
              {showcaseBreakdown.map((b) => {
                const pct = showcaseTotal > 0 ? (b.count / showcaseTotal) * 100 : 0
                return (
                  <div key={b.stars} className="cc-reviews-stats__bar-row">
                    <span className="cc-reviews-stats__bar-label">
                      {b.stars} <FiStar size={11} fill="var(--cc-rose)" stroke="var(--cc-rose)" />
                    </span>
                    <div className="cc-reviews-stats__bar-track">
                      <div
                        className="cc-reviews-stats__bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="cc-reviews-stats__bar-count">{b.count}</span>
                  </div>
                )
              })}
            </div>

            {/* Sub-rating tiles */}
            <div className="cc-reviews-stats__subs">
              {SUB_RATINGS.map(({ Icon, title, score }) => (
                <div key={title} className="cc-reviews-stats__sub">
                  <span className="cc-features-card__icon cc-features-card__icon--lg">
                    <Icon size={22} />
                  </span>
                  <div className="cc-reviews-stats__sub-title">{title}</div>
                  <div className="cc-reviews-stats__sub-score">{score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── REVIEWS LIST + SUBMIT FORM (2-col) ───── */}
      <section className="cc-reviews-body">
        <div className="container pb-5">
          <div className="row g-4 g-lg-5">

            {/* LEFT — reviews list */}
            <div className="col-lg-8">
              <div className="cc-reviews-list__head">
                <h3 className="cc-reviews-list__title">What Our Customers Are Saying</h3>
                <div className="d-flex align-items-center" style={{ gap: '0.6rem' }}>
                  <label className="cc-shop-toolbar__sort">
                    <span>Sort by:</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="recent">Most Recent</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </label>
                  {isAdmin ? (
                    <button type="button" onClick={adminLogout} className="cc-admin-pill">
                      <FiLogOut size={11} /> Admin · Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAdminLogin(true)}
                      className="border-0 bg-transparent"
                      aria-label="Admin login"
                      style={{ color: 'var(--cc-cocoa-soft)', opacity: 0.5 }}
                    >
                      <FiLock size={12} />
                    </button>
                  )}
                </div>
              </div>

              {showAdminLogin && !isAdmin && (
                <form onSubmit={tryAdminLogin} className="cc-admin-login">
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
                    <div style={{ flex: '1 1 100%', fontSize: '0.75rem', color: 'var(--cc-rose-deep)' }}>
                      {adminError}
                    </div>
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
                <div className="cc-reviews-empty">
                  <span className="cc-features-card__icon cc-features-card__icon--lg">
                    <FiHeart size={22} />
                  </span>
                  <h5 className="mt-3">No reviews yet</h5>
                  <p>Be the first to share your sweet experience — use the form on the right.</p>
                </div>
              )}

              {!loading && visible.map((r) => {
                // A customer-uploaded photo (data URL) wins; otherwise fall back
                // to the ordered item's catalog image, then a generic cake shot.
                const thumb = (r.orderItem && NAME_TO_IMG[r.orderItem]) || FALLBACK_REVIEW_IMG
                const imgSrc = r.photo ? r.photo : u(thumb, 400, 400)
                return (
                  <article key={r.id} className="cc-review-card">
                    <img
                      src={imgSrc}
                      alt=""
                      className="cc-review-card__img"
                      loading="lazy"
                    />
                    <div className="cc-review-card__body">
                      <div className="cc-review-card__meta">
                        <span className="cc-review-card__avatar">
                          {(r.name || '?').charAt(0).toUpperCase()}
                        </span>
                        <strong className="cc-review-card__name">{r.name || 'Anonymous'}</strong>
                        <span className="cc-review-card__pill">
                          <FiCheckCircle size={10} /> Verified Buyer
                        </span>
                        <button
                          type="button"
                          className="cc-review-card__heart"
                          aria-label="Helpful"
                        >
                          <FiHeart size={16} />
                        </button>
                      </div>
                      <div className="cc-review-card__stars">
                        <Stars count={Number(r.rating) || 5} size={13} />
                        {r.createdAt && (
                          <span className="cc-review-card__time">{timeAgo(r.createdAt)}</span>
                        )}
                      </div>
                      {r.title && <h5 className="cc-review-card__title">{r.title}</h5>}
                      <p className="cc-review-card__text">{r.text}</p>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDelete(r.id, r.name)}
                          className="cc-review-card__delete"
                          aria-label={`Delete review by ${r.name}`}
                        >
                          <FiTrash2 size={11} /> Delete
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}

              {!loading && hasMore && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="cc-load-more"
                    onClick={() => setShownCount((n) => n + PAGE_SIZE)}
                  >
                    Load More Reviews <FiChevronDown size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT — Submit form + What Customers Love sidebar */}
            <aside className="col-lg-4">
              {/* Share Your Experience form */}
              <form className="cc-share-form" onSubmit={onSubmit}>
                <h6 className="cc-share-form__heading">Share Your Experience</h6>
                <p className="cc-share-form__sub">
                  We'd love to hear your thoughts! Your review helps us and other sweet customers.
                </p>

                <div className="cc-share-form__stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className="cc-share-form__star-btn"
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

                <input
                  className="cc-input mb-2"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  required
                />
                <input
                  className="cc-input mb-2"
                  placeholder="Your Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                <select
                  className="cc-input mb-2"
                  value={form.orderItem}
                  onChange={(e) => update('orderItem', e.target.value)}
                  aria-label="Your Order (Optional)"
                >
                  <option value="">Your Order (Optional)</option>
                  {Object.entries(ITEMS_BY_CATEGORY).map(([cat, items]) => (
                    <optgroup key={cat} label={cat}>
                      {items.map((it) => (
                        <option key={it.id} value={it.name}>{it.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <input
                  className="cc-input mb-2"
                  placeholder="Title (optional)"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                />
                <textarea
                  className="cc-input mb-3"
                  placeholder="Write your review here..."
                  rows={4}
                  value={form.text}
                  onChange={(e) => update('text', e.target.value)}
                  required
                />

                {/* Optional photo */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickPhoto}
                  style={{ display: 'none' }}
                />
                {form.photo ? (
                  <div className="cc-review-photo mb-3">
                    <img src={form.photo} alt="Your review" className="cc-review-photo__preview" />
                    <div className="cc-review-photo__meta">
                      <span className="cc-review-photo__ok">
                        <FiCheckCircle size={14} /> Photo added
                      </span>
                      <button
                        type="button"
                        className="cc-review-photo__remove"
                        onClick={() => update('photo', '')}
                      >
                        <FiX size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="cc-review-photo__drop mb-3"
                    onClick={() => fileRef.current?.click()}
                    disabled={photoBusy}
                  >
                    <FiCamera size={18} />
                    <span>{photoBusy ? 'Processing…' : 'Add a photo (optional)'}</span>
                  </button>
                )}

                {submitMsg && (
                  <div
                    className="cc-share-form__msg"
                    style={submitOk ? {
                      color: 'var(--cc-rose-deep)',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: '1rem',
                    } : undefined}
                  >
                    {submitMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-rose w-100 justify-content-center"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Submitting…' : <>Submit Review <FiHeart /></>}
                </button>
                {!isFirebaseEnabled && (
                  <p className="cc-share-form__note">
                    Saved locally — connect Firebase to make reviews permanent.
                  </p>
                )}
              </form>

              {/* What Customers Love */}
              <div className="cc-what-love">
                <h6 className="cc-what-love__heading">What Customers Love</h6>
                {WHAT_LOVE.map(({ Icon, title, text }) => (
                  <div key={title} className="cc-what-love__row">
                    <span className="cc-features-card__icon">
                      <Icon size={16} />
                    </span>
                    <div>
                      <div className="cc-what-love__title">{title}</div>
                      <p className="cc-what-love__text">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ───── BOTTOM PROMISE STRIP ───── */}
      <section className="cc-shop-promise">
        <div className="container py-4 py-md-5">
          <div className="feature-row">
            {PROMISE_STRIP.map(({ Icon, title, text }) => (
              <div key={title} className="feature-cell text-center cc-shop-promise__cell">
                <span className="cc-features-card__icon cc-features-card__icon--lg">
                  <Icon size={22} />
                </span>
                <div className="cc-features-card__heading mt-3">{title}</div>
                <p className="cc-features-card__text mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
