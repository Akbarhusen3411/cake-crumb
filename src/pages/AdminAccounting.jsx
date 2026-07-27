import { useEffect, useState } from 'react'
import { FiLock, FiLogOut, FiRefreshCw } from 'react-icons/fi'
import { getFirebaseAuth, isFirebaseEnabled } from '../firebase.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import {
  ACC, listDocs, seedMenuIfEmpty, ensurePerPieceMenu, ensureCakePopPrices, importExcelDataIfNeeded,
} from '../services/accounting.js'
import AdminNav from '../components/admin/AdminNav.jsx'
import DashboardTab from '../components/admin/accounting/DashboardTab.jsx'
import OrdersTab from '../components/admin/accounting/OrdersTab.jsx'
import MenuTab from '../components/admin/accounting/MenuTab.jsx'
import ExpensesTab from '../components/admin/accounting/ExpensesTab.jsx'
import MonthlyTab from '../components/admin/accounting/MonthlyTab.jsx'
import CloudSyncPanel from '../components/admin/accounting/CloudSyncPanel.jsx'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'menu', label: 'Menu & Prices' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'monthly', label: 'Monthly Report' },
]

export default function AdminAccounting() {
  usePageMeta({ title: 'Admin · Accounting', description: 'Cake & Crumb daily accounting.' })
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'; m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  // ── auth (same admin account as /admin/orders) ──
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const isAdmin = !!user

  const [tab, setTab] = useState('dashboard')
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [expenses, setExpenses] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let unsub = () => {}, active = true
    ;(async () => {
      const auth = await getFirebaseAuth()
      if (!auth) { if (active) setAuthReady(true); return }
      const { onAuthStateChanged } = await import('firebase/auth')
      unsub = onAuthStateChanged(auth, (u) => { if (active) { setUser(u); setAuthReady(true) } })
    })()
    return () => { active = false; unsub() }
  }, [])

  async function reload() {
    setLoading(true)
    const [m, o, e, w] = await Promise.all([
      listDocs(ACC.MENU), listDocs(ACC.ORDERS), listDocs(ACC.EXPENSES), listDocs(ACC.WITHDRAWALS),
    ])
    setMenu(m); setOrders(o); setExpenses(e); setWithdrawals(w)
    setLoading(false)
  }

  useEffect(() => {
    if (!isAdmin) return
    let active = true
    ;(async () => {
      await seedMenuIfEmpty()
      await ensurePerPieceMenu() // adds "Per piece" prices for Cake Pop & Cupcakes
      await ensureCakePopPrices() // owner's Cake Pop prices + Pistachio
      await importExcelDataIfNeeded() // one-time import of the Excel history
      if (active) await reload()
    })()
    return () => { active = false }
  }, [isAdmin])

  async function login(e) {
    e.preventDefault()
    setPwdError(''); setSigningIn(true)
    try {
      const auth = await getFirebaseAuth()
      if (!auth) throw new Error('Firebase is not configured.')
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      await signInWithEmailAndPassword(auth, email.trim(), pwd)
      setPwd('')
    } catch (err) {
      setPwdError(
        err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password'
          ? 'Incorrect email or password.' : (err?.message || 'Sign-in failed.')
      )
    } finally { setSigningIn(false) }
  }
  async function logout() {
    const auth = await getFirebaseAuth()
    if (auth) { const { signOut } = await import('firebase/auth'); await signOut(auth) }
    setUser(null)
  }

  // ── gates ──
  if (!isFirebaseEnabled) {
    return (
      <div className="container py-5" style={{ maxWidth: 560 }}>
        <div className="alert alert-warning">
          Firebase isn’t configured, so cloud accounting is off. Add your <code>VITE_FIREBASE_*</code> keys
          to <code>.env</code> and restart <code>npm run dev</code>. (Until then, data is saved only in this browser.)
        </div>
      </div>
    )
  }
  if (!authReady) return <div className="container py-5 text-center text-muted">Loading…</div>

  if (!isAdmin) {
    return (
      <div className="container py-5" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: 40, color: 'var(--cc-rose,#e0617a)' }}><FiLock /></div>
          <h3 style={{ fontFamily: 'var(--font-heading,serif)' }}>Admin · Accounting</h3>
          <p className="text-muted small">Sign in with your bakery admin account.</p>
        </div>
        <form onSubmit={login} className="card p-4 border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <input className="form-control mb-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="form-control mb-2" type="password" placeholder="Password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
          {pwdError ? <div className="text-danger small mb-2">{pwdError}</div> : null}
          <button className="btn text-white" style={{ background: 'var(--cc-rose,#e0617a)' }} disabled={signingIn}>
            {signingIn ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <section className="container py-4 py-md-5">
      <AdminNav />
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h1 className="h4 m-0" style={{ fontFamily: 'var(--font-heading,serif)', color: '#cf3e63' }}>Daily Accounting</h1>
        <button className="btn btn-sm btn-light ms-2" onClick={reload} title="Refresh"><FiRefreshCw /></button>
        {loading ? <span className="text-muted small">Loading…</span> : null}
        <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={logout}><FiLogOut /> Sign out</button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => {
          const on = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                border: '1px solid var(--cc-rose-soft, #d7a7ae)', borderRadius: 999,
                padding: '6px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                background: on ? 'var(--cc-rose, #e0617a)' : '#fff',
                color: on ? '#fff' : 'var(--cc-cocoa, #5b3e36)',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'dashboard' && (
        <>
          <DashboardTab orders={orders} expenses={expenses} withdrawals={withdrawals} />
          <CloudSyncPanel reload={reload} />
        </>
      )}
      {tab === 'orders' && <OrdersTab orders={orders} menu={menu} reload={reload} />}
      {tab === 'menu' && <MenuTab menu={menu} reload={reload} />}
      {tab === 'expenses' && <ExpensesTab expenses={expenses} reload={reload} />}
      {tab === 'monthly' && <MonthlyTab orders={orders} expenses={expenses} withdrawals={withdrawals} />}
    </section>
  )
}
