import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiStar, FiHeart, FiCheckCircle, FiTrash2, FiLock, FiLogOut,
  FiTruck, FiChevronDown, FiCamera, FiX, FiEdit3,
} from 'react-icons/fi'
import { compressImage } from '../utils/compressImage.js'
import { TbLeaf, TbCake, TbToolsKitchen2 } from 'react-icons/tb'
import HeartDivider from '../components/HeartDivider.jsx'
import { addReview, deleteReview, getReviews, summarize, timeAgo } from '../services/reviews.js'
import { isFirebaseEnabled, getFirebaseAuth } from '../firebase.js'
import { reviewCooldownMs, markReviewSubmitted, isHoneypotTripped, HONEYPOT_STYLE } from '../utils/reviewGuard.js'
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

/** Reviews needed before an average is worth publishing to search engines. */
const MIN_REVIEWS_FOR_SCHEMA = 5

/**
 * ONE strip, not three.
 *
 * This page carried SUB_RATINGS, WHAT_LOVE and PROMISE_STRIP — twelve tiles
 * saying four things. "Fresh Ingredients" appeared twice; so did service, and
 * so did freshness/timeliness. On a page whose whole job is showing what
 * CUSTOMERS said, twelve tiles of what the bakery says crowded them out.
 *
 * Two content rules kept while merging:
 *   • Nothing is attributed to customers. The old "What customers love" heading
 *     put four hardcoded lines in their mouths — the same fault as the invented
 *     4.9 rating, just without a number. These are the bakery's own claims,
 *     written in the bakery's own voice.
 *   • No absolute guarantees. "Always delivered on time" and "on time, every
 *     time" are promises one kitchen cannot make; the wording now says what is
 *     actually done instead.
 */
const PROMISE_STRIP = [
  { Icon: TbCake,          title: 'Baked to order',    text: 'Nothing sits on a shelf — your order is made for you.' },
  { Icon: TbLeaf,          title: 'Real ingredients',  text: 'Real cream, real fruit, real chocolate.' },
  { Icon: TbToolsKitchen2, title: 'Finished by hand',  text: 'Every cake is piped and decorated by hand.' },
  { Icon: FiTruck,         title: 'Boxed with care',   text: 'Packed so it arrives exactly as it left the kitchen.' },
]

// Six, not four. The reviews sit in a col-lg-8 beside the submit-form sidebar,
// so a short list left a column of empty cream next to its lower half.
const PAGE_SIZE = 6

export default function Reviews() {
  usePageMeta({
    title: 'Reviews',
    description: 'See what our customers say about Cake & Crumb — verified reviews on cheesecakes, milk cakes, cookies and custom cakes.',
  })
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const [hover, setHover] = useState(0)
  const [form, setForm] = useState({ name: '', rating: 5, title: '', text: '', orderItem: '', photo: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [submitOk, setSubmitOk] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef(null)
  const hpRef = useRef(null) // honeypot — real users never fill this
  const formRef = useRef(null)

  // Scroll the submit form into view and put the cursor in its first field.
  // `scroll-margin-top` on the form keeps the sticky header off it.
  function jumpToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => formRef.current?.querySelector('input[name="name"], .cc-input')?.focus(), 500)
  }

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

  // ── Admin moderation (real Firebase Auth — same account as /admin/orders) ──
  // The old hardcoded password was client-side only and visible in the public
  // bundle, so it couldn't actually protect deletes. Now moderation requires a
  // signed-in Firebase user, and the Firestore rules enforce it server-side.
  // Auth is loaded LAZILY (only when the admin clicks the lock) so ordinary
  // visitors to this public page never download the auth SDK.
  const [user, setUser] = useState(null)
  const [authStarted, setAuthStarted] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const isAdmin = !!user

  // Subscribe to auth state only after the admin engages the lock. If they're
  // already signed in (e.g. came from /admin/orders in the same tab), this picks
  // up that session automatically and skips the login form.
  useEffect(() => {
    if (!authStarted) return
    let unsub = () => {}
    let active = true
    ;(async () => {
      const auth = await getFirebaseAuth()
      if (!auth) return
      const { onAuthStateChanged } = await import('firebase/auth')
      unsub = onAuthStateChanged(auth, (u) => {
        if (!active) return
        setUser(u)
        if (u) setShowAdminLogin(false)
      })
    })()
    return () => { active = false; unsub() }
  }, [authStarted])

  function openAdmin() {
    setAuthStarted(true)
    setShowAdminLogin(true)
  }

  async function adminLogin(e) {
    e.preventDefault()
    setPwdError('')
    setSigningIn(true)
    try {
      const auth = await getFirebaseAuth()
      if (!auth) throw new Error('Firebase is not configured.')
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      await signInWithEmailAndPassword(auth, email.trim(), pwd)
      setPwd('')
    } catch (err) {
      setPwdError(
        err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password'
          ? 'Incorrect email or password.'
          : (err?.message || 'Sign-in failed.')
      )
    } finally {
      setSigningIn(false)
    }
  }

  async function adminLogout() {
    const auth = await getFirebaseAuth()
    if (auth) {
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    }
    setUser(null)
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

    // Honeypot: a bot filled the hidden field → silently pretend success and
    // drop it, so the bot can't tell it was blocked.
    if (isHoneypotTripped(hpRef.current?.value)) {
      setSubmitMsg('Your Sweet Words Mean the World to Us! 💕')
      setSubmitOk(true)
      setForm({ name: '', rating: 5, title: '', text: '', orderItem: '', photo: '' })
      return
    }

    // Rate-limit: one review per minute per browser.
    const wait = reviewCooldownMs()
    if (wait > 0) {
      setSubmitOk(false)
      setSubmitMsg(`Thanks! Please wait ${Math.ceil(wait / 1000)}s before sending another review.`)
      return
    }

    setSubmitting(true)
    setSubmitMsg('')
    setSubmitOk(false)
    try {
      await addReview(form)
      markReviewSubmitted()
      setForm({ name: '', rating: 5, title: '', text: '', orderItem: '', photo: '' })
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
  const hasReviews = stats.total > 0

  /**
   * Ratings shown here are the REAL ones or none at all.
   *
   * This panel used to fall back to "4.9 from 245 reviews" with an invented
   * star breakdown whenever no reviews had loaded — a placeholder from the
   * original mockup that shipped to production and told every visitor the
   * bakery had 245 reviews it did not have. The same two numbers were also
   * published as schema.org `aggregateRating`, which Google treats as review
   * spam and penalises by hand. Both are gone: the panel now shows an
   * invitation until real reviews exist.
   */
  useJsonLd(
    'aggregate-rating',
    // Below a handful of reviews an average is noise, and rich results won't
    // show it anyway — so publish nothing rather than something flattering.
    stats.total >= MIN_REVIEWS_FOR_SCHEMA
      ? {
        '@context': 'https://schema.org',
        '@type': 'Bakery',
        name: 'Cake & Crumb',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number(stats.avg.toFixed(1)),
          reviewCount: stats.total,
          bestRating: 5,
          worstRating: 1,
        },
      }
      : null,
  )

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
                fetchPriority="high"
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
              {hasReviews ? (
                <>
                  <div className="cc-reviews-stats__overall-label">Overall Rating</div>
                  <div className="cc-reviews-stats__overall-num">{stats.avg.toFixed(1)}</div>
                  <div className="my-2"><Stars count={Math.round(stats.avg)} size={16} /></div>
                  <div className="cc-reviews-stats__overall-meta">
                    Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
                  </div>
                </>
              ) : (
                /* No reviews yet — say so and ask, rather than invent a score.
                   An empty panel is a worse first impression than an honest
                   invitation, and this is the one place a visitor is already
                   thinking about leaving one. */
                <>
                  <div className="cc-reviews-stats__overall-label">Reviews</div>
                  <div className="my-2"><Stars count={0} size={16} /></div>
                  <div className="cc-reviews-stats__overall-meta">
                    No reviews yet — yours would be the first.
                  </div>
                  <button type="button" className="cc-reviews-empty-cta" onClick={jumpToForm}>
                    Write a review
                  </button>
                </>
              )}
            </div>

            {/* Breakdown bars */}
            <div className="cc-reviews-stats__bars">
              {breakdown.map((b) => {
                const pct = hasReviews ? (b.count / stats.total) * 100 : 0
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

            {/* The one promise strip — see PROMISE_STRIP. */}
            <div className="cc-reviews-stats__subs">
              {PROMISE_STRIP.map(({ Icon, title, text }) => (
                <div key={title} className="cc-reviews-stats__sub">
                  <span className="cc-features-card__icon cc-features-card__icon--lg">
                    <Icon size={22} />
                  </span>
                  <div className="cc-reviews-stats__sub-title">{title}</div>
                  <div className="cc-reviews-stats__sub-text">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── REVIEWS LIST + SUBMIT FORM (2-col) ───── */}
      <section className="cc-reviews-body">
        {/* pb-4, not pb-5: the promise strip below brings its own py-5, and the
            two together left a band of empty cream under the columns. */}
        <div className="container pb-4">
          <div className="row g-4 g-lg-5">

            {/* LEFT — reviews list */}
            <div className="col-lg-8">
              {/* Phones only: the form sits below the entire list here, so
                  someone who came to WRITE a review had to scroll past everyone
                  else's first. Hidden on lg+, where the form is already in view
                  on the right. */}
              <button type="button" className="cc-write-review" onClick={jumpToForm}>
                <FiEdit3 size={14} /> Write a review
              </button>

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
                      onClick={openAdmin}
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
                <form onSubmit={adminLogin} className="cc-admin-login">
                  <input
                    type="email"
                    placeholder="Admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="cc-input"
                    style={{ flex: 1, minWidth: 160 }}
                    autoComplete="username"
                    autoFocus
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="cc-input"
                    style={{ flex: 1, minWidth: 140 }}
                    autoComplete="current-password"
                  />
                  <button type="submit" className="btn-rose" style={{ fontSize: '0.7rem' }} disabled={signingIn}>
                    {signingIn ? 'Signing in…' : 'Unlock'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAdminLogin(false); setPwd(''); setPwdError('') }}
                    className="btn-outline-rose"
                    style={{ fontSize: '0.7rem' }}
                  >
                    Cancel
                  </button>
                  {pwdError && (
                    <div style={{ flex: '1 1 100%', fontSize: '0.75rem', color: 'var(--cc-rose-deep)' }}>
                      {pwdError}
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
                  {/* "on the right" was only true on desktop — on a phone the
                      form sits below the whole list. */}
                  <p>Be the first to share your sweet experience — the "Share Your Experience" form is all yours.</p>
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
                        {/* No "Verified Buyer" pill: it rendered on EVERY review
                            unconditionally, and nothing here can verify a purchase —
                            the review form is public and its "Your Order" field is a
                            free choice from the product list, not a real order. It was
                            a claim about a named person that the site could not stand
                            behind, alongside the invented rating, review count and
                            per-aspect scores already removed from this page. Only
                            re-add it if orders and reviews are ever genuinely linked.

                            No "Helpful" heart either: it had no handler and no
                            counter behind it, so tapping it did nothing at all.
                            Add it back with real storage, or not at all. */}
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

              {/* Closes the list off instead of ending on blank cream: either a
                  button with the count still to come, or a full stop once the
                  reader has seen them all. */}
              {!loading && reviews.length > 0 && (
                <div className="cc-reviews-foot">
                  {hasMore ? (
                    <>
                      <button
                        type="button"
                        className="cc-load-more"
                        onClick={() => setShownCount((n) => n + PAGE_SIZE)}
                      >
                        Load More Reviews <FiChevronDown size={14} />
                      </button>
                      <p className="cc-reviews-foot__count">
                        Showing {visible.length} of {reviews.length} reviews
                      </p>
                    </>
                  ) : (
                    reviews.length > PAGE_SIZE && (
                      <p className="cc-reviews-foot__end">
                        <FiHeart size={13} /> That's all {reviews.length} reviews — thank you for reading.
                      </p>
                    )
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — Submit form + What Customers Love sidebar */}
            <aside className="col-lg-4">
              {/* Share Your Experience form */}
              <form ref={formRef} className="cc-share-form" onSubmit={onSubmit}>
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
