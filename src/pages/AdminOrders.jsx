import { useEffect, useState } from 'react'
import {
  FiXCircle, FiRefreshCw, FiLock, FiLogOut, FiChevronDown,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import {
  subscribeOrders, getAllOrders, markOrderConfirmed, markOrderCancelled,
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
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function buildCustomerMessage(order, kind) {
  const name = order.customer?.name || 'there'
  const items = (order.items || []).map((i) => `  • ${i.name} × ${i.qty}`)
  if (kind === 'cancelled') {
    return [
      `🎂 *Order Update* — ${order.orderId}`, '',
      `Hi ${name},`, '',
      `We're sorry — your order has been *cancelled*. If this is unexpected or you'd like to reorder, just reply here and we'll help. 🙏`,
      '', '*Your Items:*', ...items, '', `— Cake & Crumb`,
    ].join('\n')
  }
  return [
    `🎂 *Order Confirmed!* — ${order.orderId}`, '',
    `Hi ${name}!`, '',
    `Great news — your order is *confirmed* and we're getting ready to bake. ♥`, '',
    `💰 *Total (excl. delivery):* ${inr(order.totals?.total || 0)}`, '',
    '*Your Items:*', ...items, '',
    `We'll be in touch closer to your delivery date. Thank you for choosing Cake & Crumb! 🙏`,
  ].join('\n')
}

const STATUS_STYLES = {
  placed: { label: 'Placed', bg: '#fff3cd', fg: '#8a6d00' },
  confirmed: { label: 'Confirmed', bg: '#d6f5e0', fg: '#1d7a44' },
  cancelled: { label: 'Cancelled', bg: '#f8d7da', fg: '#a32530' },
}

const FILTERS = ['all', 'placed', 'confirmed', 'cancelled']

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

  // ── Firebase Auth admin session ──
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState('all')

  const isAdmin = !!user

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

  // Live order feed — updates automatically as orders arrive / change status.
  useEffect(() => {
    if (!isAdmin) return
    let unsub = () => {}
    let active = true
    setLoading(true)
    subscribeOrders((list) => {
      if (!active) return
      setOrders(list)
      setLoading(false)
    }).then((u) => { if (active) unsub = u; else u() })
    return () => { active = false; unsub() }
  }, [isAdmin])

  async function refresh() {
    setLoading(true)
    const list = await getAllOrders()
    setOrders(list)
    setLoading(false)
  }

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

  function act(order, kind) {
    const num = waNumber(order.customer?.phone)
    if (!num) {
      alert('No customer phone number on this order — cannot message the customer.')
      return
    }
    // Open WhatsApp synchronously inside the tap. Mobile browsers block
    // window.open() once an `await` has run, so this MUST come before the
    // (async) Firestore status update — otherwise the message never opens on phones.
    const msg = buildCustomerMessage(order, kind)
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')

    // Persist the status change in the background; the live listener refreshes the badge.
    const key = order.firebaseId || order.orderId
    setBusyId(key)
    const update = kind === 'confirmed'
      ? markOrderConfirmed(order.firebaseId, order.orderId)
      : markOrderCancelled(order.firebaseId, order.orderId)
    Promise.resolve(update).finally(() => setBusyId(null))
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
              type="email" className="cc-input mb-2" placeholder="Admin email"
              aria-label="Admin email" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus
            />
            <input
              type="password" className="cc-input mb-2" placeholder="Password"
              aria-label="Admin password" value={pwd}
              onChange={(e) => setPwd(e.target.value)} autoComplete="current-password"
            />
            {pwdError && <p style={{ color: '#cf3e63', fontSize: '0.8rem' }}>{pwdError}</p>}
            <button type="submit" className="btn-rose w-100 mt-2" disabled={signingIn}>
              {signingIn ? 'Signing in…' : 'Log in'}
            </button>
          </form>
        )}
      </section>
    )
  }

  // ── Dashboard ──
  const counts = orders.reduce((acc, o) => {
    const s = o.status || 'placed'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})
  const shown = filter === 'all' ? orders : orders.filter((o) => (o.status || 'placed') === filter)

  return (
    <section className="container py-4 py-md-5">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h4 m-0" style={{ fontFamily: 'var(--font-heading)' }}>
          Orders <span style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.9rem' }}>({orders.length})</span>
          {loading && <span style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.8rem' }}> · loading…</span>}
        </h1>
        <div className="d-flex gap-2">
          <button className="btn-outline-rose" onClick={refresh} disabled={loading}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button className="btn-outline-rose" onClick={logout}>
            <FiLogOut size={14} /> Log out
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {FILTERS.map((f) => {
          const n = f === 'all' ? orders.length : (counts[f] || 0)
          const on = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                border: '1px solid var(--cc-rose-soft)',
                background: on ? 'var(--cc-rose)' : '#fff',
                color: on ? '#fff' : 'var(--cc-cocoa)',
                borderRadius: 999, padding: '4px 14px', fontSize: '0.8rem',
                fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer',
              }}
            >
              {f} ({n})
            </button>
          )
        })}
      </div>

      {!loading && shown.length === 0 && (
        <p style={{ color: 'var(--cc-cocoa-soft)' }}>No orders{filter !== 'all' ? ` (${filter})` : ''} yet.</p>
      )}

      {/* Compact collapsible rows */}
      <div className="d-flex flex-column gap-2">
        {shown.map((o) => {
          const st = STATUS_STYLES[o.status] || STATUS_STYLES.placed
          const key = o.firebaseId || o.orderId
          const open = expandedId === key
          const busy = busyId === key
          return (
            <div key={key} style={{
              border: '1px solid var(--cc-border, #f0d9d4)', borderRadius: 12,
              background: '#fff', overflow: 'hidden',
            }}>
              {/* Header (always visible, click to expand) */}
              <button
                onClick={() => setExpandedId(open ? null : key)}
                style={{
                  width: '100%', border: 'none', background: 'transparent',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.7rem 0.9rem', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{
                  background: st.bg, color: st.fg, fontWeight: 700, fontSize: '0.62rem',
                  padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase',
                  letterSpacing: '0.05em', flex: '0 0 auto',
                }}>{st.label}</span>
                <strong style={{ color: 'var(--cc-cocoa)', fontSize: '0.85rem', flex: '0 0 auto' }}>{o.orderId}</strong>
                <span style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.82rem', flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {o.customer?.name || '—'}
                </span>
                <strong style={{ color: 'var(--cc-rose-deep)', fontSize: '0.85rem', flex: '0 0 auto' }}>{inr(o.totals?.total || 0)}</strong>
                <span style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.72rem', flex: '0 0 auto' }} className="d-none d-sm-inline">{formatDate(o.createdAt)}</span>
                <FiChevronDown size={16} style={{ flex: '0 0 auto', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: 'var(--cc-cocoa-soft)' }} />
              </button>

              {/* Body */}
              {open && (
                <div style={{ padding: '0 0.9rem 0.9rem', borderTop: '1px solid #f4e6e2' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--cc-cocoa)', lineHeight: 1.7, paddingTop: '0.6rem' }}>
                    <div>📞 {o.customer?.phone || '—'}{o.customer?.email ? ` · ✉️ ${o.customer.email}` : ''}</div>
                    {o.customer?.address && (
                      <div>📍 {[o.customer.address, o.customer.city, o.customer.pincode].filter(Boolean).join(', ')}</div>
                    )}
                    {o.deliveryDate && <div>📅 {o.deliveryDate}</div>}
                    <div style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.78rem' }}>{formatDate(o.createdAt)} · {o.source || 'checkout'}</div>
                  </div>

                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.1rem', fontSize: '0.84rem', color: 'var(--cc-cocoa-soft)' }}>
                    {(o.items || []).map((it, i) => (
                      <li key={i}>{it.name} × {it.qty} = {inr((it.price || 0) * (it.qty || 1))}</li>
                    ))}
                  </ul>

                  <div style={{ fontSize: '0.84rem', color: 'var(--cc-cocoa)' }}>
                    <strong>Total (excl. delivery): {inr(o.totals?.total || 0)}</strong>
                    {' · '}{o.payment?.method === 'upi' ? `UPI${o.payment?.utr ? ` · UTR ${o.payment.utr}` : ''}` : 'Cash on Delivery'}
                    {o.notes ? ` · Notes: ${o.notes}` : ''}
                  </div>

                  <div className="d-flex gap-2 mt-3" style={{ maxWidth: 420 }}>
                    <button className="btn-rose" disabled={busy} onClick={() => act(o, 'confirmed')}
                      style={{ flex: '1 1 0', justifyContent: 'center', gap: '0.4rem', opacity: o.status === 'confirmed' ? 0.6 : 1 }}>
                      <FaWhatsapp size={14} /> {o.status === 'confirmed' ? 'Confirmed' : 'Confirm'}
                    </button>
                    <button className="btn-outline-rose" disabled={busy}
                      onClick={() => { if (confirm(`Cancel order ${o.orderId}?`)) act(o, 'cancelled') }}
                      style={{ flex: '1 1 0', justifyContent: 'center', gap: '0.4rem' }}>
                      <FiXCircle size={14} /> Cancel
                    </button>
                  </div>
                  {(o.status === 'confirmed' || o.status === 'cancelled') && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', margin: '0.4rem 0 0' }}>
                      Re-tap to message the customer again.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
