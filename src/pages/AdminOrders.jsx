import { useEffect, useState } from 'react'
import {
  FiXCircle, FiRefreshCw, FiLock, FiLogOut, FiChevronDown, FiAlertTriangle,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import {
  subscribeOrders, getAllOrders, updateOrderStatus,
} from '../services/orders.js'

const PICKUP_LOCATION = 'Cake & Crumb, Vaso, Kheda, Gujarat 387380'
const REVIEW_LINK = 'https://akbarhusen3411.github.io/cake-crumb/review'
import { getFirebaseAuth, isFirebaseEnabled } from '../firebase.js'
import { inr } from '../data/format.js'
import { isBulkOrder } from '../data/shopConfig.js'
import { usePageMeta } from '../hooks/usePageMeta.js'

// Human-readable payment summary for an order card.
function paymentLabel(o) {
  const p = o.payment || {}
  if (p.method === 'upi') return 'UPI — paid in full (verify in your bank)'
  if (p.method === 'deposit') {
    return `Advance ${inr(p.depositAmount || 0)} paid (verify in bank) + ${inr(p.balanceDue || 0)} cash on delivery`
  }
  return 'Cash on Delivery'
}

// The amount the bakery should look for as a bank credit before confirming:
// the deposit for an advance order, otherwise the full total.
function verifyAmount(o) {
  const p = o.payment || {}
  if (p.method === 'deposit') return p.depositAmount || 0
  return o.totals?.total || 0
}

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

function buildCustomerMessage(order, status) {
  const name = order.customer?.name || 'there'
  const id = order.orderId
  const items = (order.items || []).map((i) => `  • ${i.name} × ${i.qty}`)
  switch (status) {
    case 'cancelled':
      return [
        `🎂 *Order Update* — ${id}`, '',
        `Hi ${name},`, '',
        `We're sorry — your order has been *cancelled*. If this is unexpected or you'd like to reorder, just reply here and we'll help. 🙏`,
        '', '*Your Items:*', ...items, '', `— Cake & Crumb`,
      ].join('\n')
    case 'ready_for_pickup':
      return [
        `🎉 *Your order is READY!* — ${id}`, '',
        `Hi ${name}!`, '',
        `Your treats are freshly made and ready for *pickup* 🛍️`, '',
        `📍 *Collect from:* ${PICKUP_LOCATION}`, '',
        '*Your Items:*', ...items, '',
        `See you soon! 🎂`,
      ].join('\n')
    case 'out_for_delivery':
      return [
        `🚚 *Out for delivery!* — ${id}`, '',
        `Hi ${name}!`, '',
        `Great news — your order is ready and *on its way* to you now. 🎂`, '',
        '*Your Items:*', ...items, '',
        `Thank you for ordering from Cake & Crumb!`,
      ].join('\n')
    case 'completed':
      return [
        `💛 *Thank you!* — ${id}`, '',
        `Hi ${name}!`, '',
        `We hope you love your treats! 🎂 If you have a moment, we'd be so grateful for a quick review:`,
        REVIEW_LINK, '',
        `With love, Cake & Crumb`,
      ].join('\n')
    case 'confirmed':
    default:
      return [
        `🎂 *Order Confirmed!* — ${id}`, '',
        `Hi ${name}!`, '',
        `Great news — your order is *confirmed* and we're getting ready to bake. ♥`, '',
        `💰 *Total:* ${inr(order.totals?.total || 0)}${order.totals?.delivery > 0 ? ` _(incl. ${inr(order.totals.delivery)} delivery)_` : ''}`, '',
        '*Your Items:*', ...items, '',
        `We'll message you again once it's ready. Thank you for choosing Cake & Crumb! 🙏`,
      ].join('\n')
  }
}

const STATUS_STYLES = {
  placed: { label: 'Placed', bg: '#fff3cd', fg: '#8a6d00' },
  confirmed: { label: 'Confirmed', bg: '#d9e8ff', fg: '#1d4ed8' },
  ready_for_pickup: { label: 'Ready · Pickup', bg: '#e7defb', fg: '#5b2a9e' },
  out_for_delivery: { label: 'Out for delivery', bg: '#ffe6d6', fg: '#b25316' },
  completed: { label: 'Done', bg: '#d6f5e0', fg: '#1d7a44' },
  cancelled: { label: 'Cancelled', bg: '#f8d7da', fg: '#a32530' },
}

const FILTERS = ['all', 'placed', 'confirmed', 'ready', 'done', 'cancelled']

// Match a UI filter tab to one or more raw statuses.
function matchesFilter(o, f) {
  const s = o.status || 'placed'
  if (f === 'all') return true
  if (f === 'ready') return s === 'ready_for_pickup' || s === 'out_for_delivery'
  if (f === 'done') return s === 'completed'
  return s === f
}

// The action buttons available for an order, based on its current status + type.
function actionsFor(o) {
  const s = o.status || 'placed'
  const isPickup = o.deliveryMethod === 'pickup'
  if (s === 'placed') {
    return [
      { status: 'confirmed', label: 'Confirm', kind: 'primary' },
      { status: 'cancelled', label: 'Cancel', kind: 'danger' },
    ]
  }
  if (s === 'confirmed') {
    return [
      isPickup
        ? { status: 'ready_for_pickup', label: 'Ready for Pickup', kind: 'primary' }
        : { status: 'out_for_delivery', label: 'Out for Delivery', kind: 'primary' },
      { status: 'cancelled', label: 'Cancel', kind: 'danger' },
    ]
  }
  if (s === 'ready_for_pickup' || s === 'out_for_delivery') {
    return [
      { status: 'completed', label: 'Mark Done', kind: 'primary' },
      { status: 'cancelled', label: 'Cancel', kind: 'danger' },
    ]
  }
  // completed / cancelled — allow re-sending the final message
  return [{ status: s, label: 'Re-send message', kind: 'outline' }]
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
  const [feedError, setFeedError] = useState('')

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
    setFeedError('')
    subscribeOrders(
      (list) => {
        if (!active) return
        setOrders(list)
        setLoading(false)
      },
      (err) => {
        if (!active) return
        // Without this, a snapshot error would leave the dashboard stuck on "loading…".
        setFeedError(err?.message || 'Could not load orders — check your connection or Firestore rules.')
        setLoading(false)
      }
    ).then((u) => { if (active) unsub = u; else u() })
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

  function act(order, status) {
    const num = waNumber(order.customer?.phone)
    if (!num) {
      alert('No customer phone number on this order — cannot message the customer.')
      return
    }
    // Open WhatsApp synchronously inside the tap. Mobile browsers block
    // window.open() once an `await` has run, so this MUST come before the
    // (async) Firestore status update — otherwise the message never opens on phones.
    const msg = buildCustomerMessage(order, status)
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')

    // Persist the status change in the background; the live listener refreshes the badge.
    const key = order.firebaseId || order.orderId
    setBusyId(key)
    Promise.resolve(updateOrderStatus(order.firebaseId, order.orderId, status))
      .finally(() => setBusyId(null))
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
  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = orders.filter((o) => matchesFilter(o, f)).length
    return acc
  }, {})
  const shown = orders.filter((o) => matchesFilter(o, filter))

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
          const n = counts[f] || 0
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

      {feedError && (
        <div style={{ background: '#f8d7da', color: '#a32530', border: '1px solid #f1aeb5', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
          ⚠ {feedError} <button onClick={refresh} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', color: '#a32530', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {!loading && !feedError && shown.length === 0 && (
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
                {isBulkOrder(o.totals?.subtotal ?? o.totals?.total) && (o.status === 'placed' || o.status === 'confirmed') && (
                  <span
                    title="Large order — verify payment & address before baking"
                    style={{
                      background: '#fdecef', color: '#b0264a', fontWeight: 800, fontSize: '0.58rem',
                      padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase',
                      letterSpacing: '0.05em', flex: '0 0 auto', whiteSpace: 'nowrap',
                    }}
                  >⚠ Verify</span>
                )}
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
                    <strong>Total: {inr(o.totals?.total || 0)}</strong>
                    {o.totals?.delivery > 0 ? ` (incl. ${inr(o.totals.delivery)} delivery)` : ''}
                    {o.deliveryMethod === 'delivery' && o.deliveryKm ? ` · ~${o.deliveryKm} km away` : ''}
                    {' · '}{paymentLabel(o)}
                    {o.notes ? ` · Notes: ${o.notes}` : ''}
                  </div>

                  {/* Delivery order with no measured distance → address couldn't be
                      geo-located (bad/unknown pincode). Worth a confirmation call. */}
                  {o.deliveryMethod === 'delivery' && !o.deliveryKm && (
                    <div
                      className="mt-2 d-flex align-items-start"
                      style={{
                        gap: '0.5rem', background: '#fff7ed', border: '1px solid #fcd9b6',
                        borderRadius: 10, padding: '0.5rem 0.7rem', fontSize: '0.76rem',
                        color: '#9a5b12', lineHeight: 1.45,
                      }}
                    >
                      <FiAlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>Delivery address couldn’t be located from its pincode — <strong>call to confirm the address</strong> before dispatching.</span>
                    </div>
                  )}

                  {/* Bulk-order safety checklist — the fraud-prone case. */}
                  {isBulkOrder(o.totals?.subtotal ?? o.totals?.total) && (o.status === 'placed' || o.status === 'confirmed') && (
                    <details
                      className="mt-2"
                      style={{
                        background: '#fdecef', border: '1px solid #f6c6d2', borderRadius: 10,
                        padding: '0.55rem 0.7rem', fontSize: '0.78rem', color: '#8f1f3f', lineHeight: 1.5,
                      }}
                    >
                      <summary style={{ cursor: 'pointer', fontWeight: 800 }}>
                        ⚠ Large order — verify before baking
                      </summary>
                      <ol style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                        <li><strong>Call the customer</strong> ({o.customer?.phone || 'no number'}) to confirm the order is genuine.</li>
                        {o.payment?.method === 'deposit'
                          ? <li>Confirm the <strong>{inr(o.payment?.depositAmount || 0)} advance</strong> landed in your bank (see “verify payment” below).</li>
                          : o.payment?.method === 'upi'
                            ? <li>Confirm the <strong>full {inr(o.totals?.total || 0)}</strong> landed in your bank (see “verify payment” below).</li>
                            : <li><strong>No advance was collected</strong> on this order — consider asking for one on WhatsApp before baking.</li>}
                        {o.deliveryMethod === 'delivery' && <li>Confirm the delivery address is real and reachable.</li>}
                        <li>Only then tap <strong>Confirm</strong> and start baking.</li>
                      </ol>
                    </details>
                  )}

                  {(o.payment?.method === 'upi' || o.payment?.method === 'deposit') && (
                    <div
                      className="mt-2"
                      style={{
                        background: '#fff7ed',
                        border: '1px solid #fcd9b6',
                        borderRadius: 10,
                        padding: '0.55rem 0.7rem',
                        fontSize: '0.76rem',
                        color: '#9a5b12',
                        lineHeight: 1.45,
                      }}
                    >
                      <div className="d-flex align-items-start" style={{ gap: '0.5rem' }}>
                        <FiAlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>
                          <strong>
                            Check the {o.payment?.method === 'deposit' ? 'advance' : 'payment'} landed in your bank before confirming.
                          </strong>{' '}
                          "Paid" here is the customer's claim, not proof.
                          {o.payment?.method === 'deposit' && (
                            <> Collect the <strong>{inr(o.payment?.balanceDue || 0)}</strong> balance on delivery.</>
                          )}
                        </span>
                      </div>
                      <details style={{ marginTop: 6 }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#9a5b12' }}>
                          How to verify this payment
                        </summary>
                        <ol style={{ margin: '6px 0 0', paddingLeft: 18, lineHeight: 1.55 }}>
                          <li>Open your bank / UPI app for the account that receives your payments.</li>
                          <li>Go to transaction history for around the time this order was placed (shown at the top of this card).</li>
                          <li>Find a <strong>credit of {inr(verifyAmount(o))}</strong>{o.payment?.method === 'deposit' ? ' (the advance)' : ''} to your account.</li>
                          <li>Check the payer name / phone roughly matches <strong>{o.customer?.name || 'the customer'}</strong>, and the amount is exact.</li>
                          <li>Credit found ✅ → tap <strong>Confirm</strong>. Nothing found or amount differs → don't confirm; message the customer or <strong>Cancel</strong>.</li>
                        </ol>
                        <div style={{ marginTop: 6, fontStyle: 'italic' }}>
                          Never confirm on a screenshot alone — only on a real credit in your passbook.
                        </div>
                      </details>
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3 flex-wrap" style={{ maxWidth: 460 }}>
                    {actionsFor(o).map((a) => {
                      const isDanger = a.kind === 'danger'
                      const isOutline = a.kind === 'outline'
                      const onClick = isDanger
                        ? () => { if (confirm(`Cancel order ${o.orderId}?`)) act(o, a.status) }
                        : () => act(o, a.status)
                      return (
                        <button
                          key={a.label}
                          disabled={busy}
                          className={isDanger || isOutline ? 'btn-outline-rose' : 'btn-rose'}
                          onClick={onClick}
                          style={{ flex: '1 1 0', justifyContent: 'center', gap: '0.4rem' }}
                        >
                          {a.kind === 'primary' ? <FaWhatsapp size={14} /> : (isDanger ? <FiXCircle size={14} /> : null)}
                          {a.label}
                        </button>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', margin: '0.4rem 0 0' }}>
                    Each button updates the status and opens WhatsApp to message the customer.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
