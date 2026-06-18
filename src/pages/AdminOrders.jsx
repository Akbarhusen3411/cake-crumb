import { useEffect, useState, useCallback } from 'react'
import {
  FiCheckCircle, FiXCircle, FiRefreshCw, FiLock, FiLogOut, FiClock,
  FiUser, FiPhone, FiMail, FiMapPin, FiCalendar,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import {
  getAllOrders, markOrderConfirmed, markOrderCancelled,
} from '../services/orders.js'
import { getFirebaseAuth, isFirebaseEnabled } from '../firebase.js'
import { inr } from '../data/format.js'
import { usePageMeta } from '../hooks/usePageMeta.js'

// Strip to digits; assume India (+91) for bare 10-digit numbers, so wa.me works.
function waNumber(raw) {
  if (!raw) return ''
  let d = String(raw).replace(/\D/g, '')
  if (d.length === 10) d = '91' + d
  return d
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function buildCustomerMessage(order, kind) {
  const name = order.customer?.name || 'there'
  const items = (order.items || []).map((i) => `  • ${i.name} × ${i.qty}`)
  if (kind === 'cancelled') {
    return [
      `🎂 *Order Update* — ${order.orderId}`,
      '',
      `Hi ${name},`,
      '',
      `We're sorry — your order has been *cancelled*. If this is unexpected or you'd like to reorder, just reply here and we'll help. 🙏`,
      '',
      '*Your Items:*',
      ...items,
      '',
      `— Cake & Crumb`,
    ].join('\n')
  }
  return [
    `🎂 *Order Confirmed!* — ${order.orderId}`,
    '',
    `Hi ${name}!`,
    '',
    `Great news — your order is *confirmed* and we're getting ready to bake. ♥`,
    '',
    `💰 *Total (excl. delivery):* ${inr(order.totals?.total || 0)}`,
    '',
    '*Your Items:*',
    ...items,
    '',
    `We'll be in touch closer to your delivery date. Thank you for choosing Cake & Crumb! 🙏`,
  ].join('\n')
}

const STATUS_STYLES = {
  placed: { label: 'Placed', bg: '#fff3cd', fg: '#8a6d00' },
  confirmed: { label: 'Confirmed', bg: '#d6f5e0', fg: '#1d7a44' },
  cancelled: { label: 'Cancelled', bg: '#f8d7da', fg: '#a32530' },
}

export default function AdminOrders() {
  usePageMeta({ title: 'Admin · Orders', description: 'Cake & Crumb order management.' })

  // Keep this page out of search engines.
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  // Firebase Auth admin session — only a signed-in admin can read order data
  // (enforced by Firestore rules), so customer PII stays private.
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const isAdmin = !!user

  // Subscribe to auth state once.
  useEffect(() => {
    let unsub = () => {}
    let active = true
    ;(async () => {
      const auth = await getFirebaseAuth()
      if (!auth) { if (active) setAuthReady(true); return }
      const { onAuthStateChanged } = await import('firebase/auth')
      unsub = onAuthStateChanged(auth, (u) => {
        if (!active) return
        setUser(u)
        setAuthReady(true)
      })
    })()
    return () => { active = false; unsub() }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const list = await getAllOrders()
    setOrders(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  async function login(e) {
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

  async function logout() {
    const auth = await getFirebaseAuth()
    if (auth) {
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    }
    setOrders([])
  }

  async function act(order, kind) {
    const key = order.firebaseId || order.orderId
    setBusyId(key)
    const ok = kind === 'confirmed'
      ? await markOrderConfirmed(order.firebaseId)
      : await markOrderCancelled(order.firebaseId)
    setBusyId(null)

    // Reflect the new status locally even if the write failed (e.g. local-only
    // mirror with no firebaseId) so the admin sees the action took effect.
    setOrders((prev) => prev.map((o) =>
      (o.firebaseId || o.orderId) === key ? { ...o, status: kind } : o
    ))

    if (!ok) {
      // No Firestore id — status couldn't be persisted, but still notify the customer.
      console.warn('[admin] status not persisted (no Firestore id); messaging customer anyway.')
    }

    const num = waNumber(order.customer?.phone)
    if (num) {
      const msg = buildCustomerMessage(order, kind)
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
    } else {
      alert('No customer phone number on this order — cannot message the customer.')
    }
  }

  // ── Login gate ──
  if (!isAdmin) {
    return (
      <section className="container py-5" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
          <FiLock size={28} style={{ color: 'var(--cc-rose)' }} />
          <h1 className="h4 mt-2" style={{ fontFamily: 'var(--font-heading)' }}>Admin — Orders</h1>
          <p style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.9rem' }}>
            Sign in with your bakery admin account to manage orders.
          </p>
        </div>
        {!isFirebaseEnabled ? (
          <p style={{ color: '#cf3e63', fontSize: '0.85rem', textAlign: 'center' }}>
            Firebase isn’t configured, so the admin dashboard is unavailable.
          </p>
        ) : !authReady ? (
          <p style={{ color: 'var(--cc-cocoa-soft)', textAlign: 'center' }}>Loading…</p>
        ) : (
          <form onSubmit={login}>
            <input
              type="email"
              className="cc-input mb-2"
              placeholder="Admin email"
              aria-label="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
            />
            <input
              type="password"
              className="cc-input mb-2"
              placeholder="Password"
              aria-label="Admin password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="current-password"
            />
            {pwdError && (
              <p style={{ color: '#cf3e63', fontSize: '0.8rem' }}>{pwdError}</p>
            )}
            <button type="submit" className="btn-rose w-100 mt-2" disabled={signingIn}>
              {signingIn ? 'Signing in…' : 'Log in'}
            </button>
          </form>
        )}
      </section>
    )
  }

  // ── Dashboard ──
  return (
    <section className="container py-5">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h1 className="h4 m-0" style={{ fontFamily: 'var(--font-heading)' }}>
          Orders <span style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.9rem' }}>({orders.length})</span>
        </h1>
        <div className="d-flex gap-2">
          <button className="btn-outline-rose" onClick={load} disabled={loading}>
            <FiRefreshCw size={14} /> {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button className="btn-outline-rose" onClick={logout}>
            <FiLogOut size={14} /> Log out
          </button>
        </div>
      </div>

      {!loading && orders.length === 0 && (
        <p style={{ color: 'var(--cc-cocoa-soft)' }}>No orders yet.</p>
      )}

      <div className="d-flex flex-column gap-3">
        {orders.map((o) => {
          const st = STATUS_STYLES[o.status] || STATUS_STYLES.placed
          const key = o.firebaseId || o.orderId
          const busy = busyId === key
          const done = o.status === 'confirmed' || o.status === 'cancelled'
          return (
            <div key={key} className="cc-admin-order" style={{
              border: '1px solid var(--cc-border, #f0d9d4)', borderRadius: 14,
              padding: '1rem 1.1rem', background: '#fff',
            }}>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <strong style={{ color: 'var(--cc-cocoa)' }}>{o.orderId}</strong>
                <span style={{
                  background: st.bg, color: st.fg, fontWeight: 700,
                  fontSize: '0.72rem', padding: '3px 10px', borderRadius: 999,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{st.label}</span>
              </div>

              <div style={{ fontSize: '0.86rem', color: 'var(--cc-cocoa)', lineHeight: 1.7 }}>
                <div><FiUser size={13} /> {o.customer?.name || '—'} &nbsp;
                  <FiPhone size={13} /> {o.customer?.phone || '—'}</div>
                {o.customer?.email && <div><FiMail size={13} /> {o.customer.email}</div>}
                {o.customer?.address && (
                  <div><FiMapPin size={13} /> {[o.customer.address, o.customer.city, o.customer.pincode].filter(Boolean).join(', ')}</div>
                )}
                {o.deliveryDate && <div><FiCalendar size={13} /> {o.deliveryDate}</div>}
                <div><FiClock size={13} /> {formatDate(o.createdAt)} · {o.source || 'checkout'}</div>
              </div>

              <ul style={{ margin: '0.6rem 0', paddingLeft: '1.1rem', fontSize: '0.86rem', color: 'var(--cc-cocoa-soft)' }}>
                {(o.items || []).map((it, i) => (
                  <li key={i}>{it.name} × {it.qty} = {inr((it.price || 0) * (it.qty || 1))}</li>
                ))}
              </ul>

              <div style={{ fontSize: '0.86rem', color: 'var(--cc-cocoa)' }}>
                <strong>Total (excl. delivery): {inr(o.totals?.total || 0)}</strong>
                {' · '}{o.payment?.method === 'upi' ? `UPI${o.payment?.utr ? ` · UTR ${o.payment.utr}` : ''}` : 'Cash on Delivery'}
                {o.notes ? ` · Notes: ${o.notes}` : ''}
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn-rose"
                  disabled={busy}
                  onClick={() => act(o, 'confirmed')}
                  style={{ opacity: o.status === 'confirmed' ? 0.6 : 1 }}
                >
                  <FaWhatsapp size={14} /> <FiCheckCircle size={14} /> {o.status === 'confirmed' ? 'Confirmed' : 'Confirm'}
                </button>
                <button
                  className="btn-outline-rose"
                  disabled={busy}
                  onClick={() => { if (confirm(`Cancel order ${o.orderId}?`)) act(o, 'cancelled') }}
                >
                  <FiXCircle size={14} /> Cancel
                </button>
                {done && (
                  <span style={{ alignSelf: 'center', fontSize: '0.78rem', color: 'var(--cc-cocoa-soft)' }}>
                    re-tap to message the customer again
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
