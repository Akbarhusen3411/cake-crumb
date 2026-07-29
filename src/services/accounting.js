import { getDb } from '../firebase.js'
import { ACCOUNTING_MENU } from '../data/accountingMenu.js'

// Admin-only daily-accounting store. Same shape as services/orders.js:
// Firestore when configured, always mirrored to localStorage, never throws.
//
// Collections:
//   acc_orders      { date, customer, category, item, variant, qty, unitPrice, paid, method, status, notes }
//   acc_expenses    { date, vendor, amount, method, notes }
//   acc_withdrawals { date, amount, method, notes }
//   acc_menu        { category, name, variant, price }
//
//  date  : "YYYY-MM-DD"  · method : "Cash" | "Online"  · paid : boolean
export const ACC = {
  ORDERS: 'acc_orders',
  EXPENSES: 'acc_expenses',
  WITHDRAWALS: 'acc_withdrawals',
  MENU: 'acc_menu',
}

const lsKey = (coll) => `cc_${coll}_v1`

function readLocal(coll) {
  try { return JSON.parse(localStorage.getItem(lsKey(coll)) || '[]') } catch { return [] }
}
function writeLocal(coll, list) {
  try { localStorage.setItem(lsKey(coll), JSON.stringify(list)) } catch { /* ignore */ }
}
const isLocalId = (id) => String(id).startsWith('local-') || String(id).startsWith('seed-')
const newLocalId = () => `local-${Date.now()}-${Math.round(Math.random() * 1e6)}`

// Every cloud failure below degrades to localStorage, so a broken rule renders
// identically to a healthy database — one device shows its own stale rows while
// the cloud stays empty. Report it so the page can say so out loud.
const errText = (err) => err?.code || err?.message || String(err)
let cloudErrorHandler = null
/** Subscribe to cloud-write/read failures. Returns an unsubscribe function. */
export function onCloudError(fn) {
  cloudErrorHandler = fn
  return () => { if (cloudErrorHandler === fn) cloudErrorHandler = null }
}
function reportCloudError(op, coll, err) {
  console.error(`[accounting] ${op} failed`, coll, err)
  try { cloudErrorHandler?.(`${op} ${coll} — ${errText(err)}`) } catch { /* ignore */ }
}

/** List every doc in a collection (Firestore → localStorage fallback/mirror). */
export async function listDocs(coll) {
  const db = await getDb()
  if (!db) return readLocal(coll)
  try {
    const { collection, getDocs } = await import('firebase/firestore')
    const snap = await getDocs(collection(db, coll))
    const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    writeLocal(coll, arr)
    return arr
  } catch (err) {
    reportCloudError('read', coll, err)
    return readLocal(coll)
  }
}

/**
 * Live subscription to a collection — the page updates the moment another
 * device writes, instead of only on load/refresh. Falls back to a one-shot
 * localStorage read when Firestore isn't available. Returns an unsubscribe fn.
 */
export function subscribeDocs(coll, onData) {
  let cancelled = false
  let unsub = () => {}
  ;(async () => {
    const db = await getDb()
    if (cancelled) return
    if (!db) { onData(readLocal(coll)); return }
    try {
      const { collection, onSnapshot } = await import('firebase/firestore')
      if (cancelled) return
      unsub = onSnapshot(
        collection(db, coll),
        (snap) => {
          const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          writeLocal(coll, arr)
          onData(arr)
        },
        (err) => { reportCloudError('live read', coll, err); onData(readLocal(coll)) }
      )
    } catch (err) {
      reportCloudError('live read', coll, err)
      onData(readLocal(coll))
    }
  })()
  return () => { cancelled = true; unsub() }
}

/** Add a record. Returns the saved record with its id. */
export async function addDocRec(coll, data) {
  const rec = { ...data, createdAt: new Date().toISOString() }
  const db = await getDb()
  if (!db) {
    const r = { id: newLocalId(), ...rec }
    const l = readLocal(coll); l.unshift(r); writeLocal(coll, l)
    return r
  }
  try {
    const { collection, addDoc } = await import('firebase/firestore')
    const ref = await addDoc(collection(db, coll), rec)
    const r = { id: ref.id, ...rec }
    const l = readLocal(coll); l.unshift(r); writeLocal(coll, l)
    return r
  } catch (err) {
    reportCloudError('save', coll, err)
    const r = { id: newLocalId(), ...rec }
    const l = readLocal(coll); l.unshift(r); writeLocal(coll, l)
    return r
  }
}

/** Update a record by id. */
export async function updateDocRec(coll, id, data) {
  const l = readLocal(coll)
  const i = l.findIndex((x) => x.id === id)
  if (i >= 0) { l[i] = { ...l[i], ...data }; writeLocal(coll, l) }
  const db = await getDb()
  if (!db || isLocalId(id)) return
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, coll, id), data)
  } catch (err) {
    // Swallowing this used to make the edit look saved: the localStorage write
    // above kept it on screen, then the next read from the cloud reverted it.
    reportCloudError('update', coll, err)
  }
}

/** Delete a record by id. */
export async function deleteDocRec(coll, id) {
  writeLocal(coll, readLocal(coll).filter((x) => x.id !== id))
  const db = await getDb()
  if (!db || isLocalId(id)) return
  try {
    const { doc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, coll, id))
  } catch (err) {
    reportCloudError('delete', coll, err)
  }
}

/** Seed the 207-item menu once, if the menu collection is empty. */
export async function seedMenuIfEmpty() {
  const existing = await listDocs(ACC.MENU)
  if (existing.length > 0) return existing
  const db = await getDb()
  if (!db) {
    const seeded = ACCOUNTING_MENU.map((m, i) => ({ id: `seed-${i}`, ...m }))
    writeLocal(ACC.MENU, seeded)
    return seeded
  }
  try {
    const { collection, doc, writeBatch } = await import('firebase/firestore')
    const batch = writeBatch(db) // 207 < 500 batch limit
    ACCOUNTING_MENU.forEach((m) => batch.set(doc(collection(db, ACC.MENU)), m))
    await batch.commit()
    return await listDocs(ACC.MENU)
  } catch (err) {
    reportCloudError('seed menu', ACC.MENU, err)
    const seeded = ACCOUNTING_MENU.map((m, i) => ({ id: `seed-${i}`, ...m }))
    writeLocal(ACC.MENU, seeded)
    return seeded
  }
}

// Categories sold by the piece (min 2). A "Per piece" size is added automatically.
export const PER_PIECE_CATS = ['Cake Pop', 'Cupcake']
export const isPerPieceVariant = (v) => /per\s*piece/i.test(v || '')

/**
 * Ensure Cake Pop & Cupcake items each have a "Per piece" price (box-of-6 ÷ 6),
 * so the owner can sell any number of pieces. Idempotent; runs once per browser.
 */
export async function ensurePerPieceMenu() {
  const FLAG = 'cc_acc_perpiece_v1'
  try { if (localStorage.getItem(FLAG)) return [] } catch { /* ignore */ }
  const menu = await listDocs(ACC.MENU)
  const byItem = {}
  for (const m of menu) {
    if (!PER_PIECE_CATS.includes(m.category)) continue
    const key = `${m.category}||${m.name}`
    ;(byItem[key] ||= []).push(m)
  }
  const additions = []
  for (const rows of Object.values(byItem)) {
    if (rows.some((r) => isPerPieceVariant(r.variant))) continue // already has one
    const six = rows.find((r) => /(^|\D)6(\D|$)/.test(r.variant || '')) || rows[0]
    const perPiece = Math.round((Number(six?.price) || 0) / 6)
    if (perPiece > 0) additions.push({ category: rows[0].category, name: rows[0].name, variant: 'Per piece', price: perPiece })
  }
  for (const a of additions) await addDocRec(ACC.MENU, a)
  try { localStorage.setItem(FLAG, '1') } catch { /* ignore */ }
  return additions
}

/**
 * Set the owner's Cake Pop prices (per piece / box of 6 / box of 12) and add
 * Pistachio. Idempotent; only writes when a price is missing or different.
 */
export async function ensureCakePopPrices() {
  const FLAG = 'cc_acc_cakepop_v2'
  try { if (localStorage.getItem(FLAG)) return } catch { /* ignore */ }
  const menu = await listDocs(ACC.MENU)
  const SPEC = {
    Vanilla:      { 'Per piece': 15, 6: 90, 12: 180 },
    Chocolate:    { 'Per piece': 15, 6: 90, 12: 180 },
    'Red Velvet': { 'Per piece': 15, 6: 90, 12: 180 },
    Pistachio:    { 'Per piece': 20, 6: 120, 12: 240 },
  }
  for (const [name, variants] of Object.entries(SPEC)) {
    for (const [variant, price] of Object.entries(variants)) {
      const existing = menu.find(
        (m) => m.category === 'Cake Pop' && m.name === name && String(m.variant) === String(variant)
      )
      if (existing) {
        if (Number(existing.price) !== price) await updateDocRec(ACC.MENU, existing.id, { price })
      } else {
        await addDocRec(ACC.MENU, { category: 'Cake Pop', name, variant: String(variant), price })
      }
    }
  }
  try { localStorage.setItem(FLAG, '1') } catch { /* ignore */ }
}

// ── The Excel importer is RETIRED. ──
// It used to seed acc_orders / acc_expenses from the owner's Apr–Jul 2026
// spreadsheet (`src/data/excelImport.js`, kept in the repo as the archive of
// those figures). The owner cleared the books to start fresh from August 2026,
// and the importer rewrote its rows with `set` on any device that hadn't run it
// — so leaving it wired up would have refilled the fresh book with the old year.
// It is deliberately not called from anywhere. Don't reinstate it without the
// owner's explicit ask; `acc_settings/main.excelImport` is now a dead marker.

// ───────────────────── destructive: start a fresh book ─────────────────────

/** Delete every doc in a collection. Returns { deleted } or { error }. */
export async function clearCollection(coll) {
  writeLocal(coll, [])
  const db = await getDb()
  if (!db) return { deleted: 0, localOnly: true }
  try {
    const { collection, getDocs, writeBatch, doc } = await import('firebase/firestore')
    const snap = await getDocs(collection(db, coll))
    const ids = snap.docs.map((d) => d.id)
    for (let i = 0; i < ids.length; i += 400) { // 500 is the batch limit
      const batch = writeBatch(db)
      ids.slice(i, i + 400).forEach((id) => batch.delete(doc(db, coll, id)))
      await batch.commit()
    }
    writeLocal(coll, [])
    return { deleted: ids.length }
  } catch (err) {
    reportCloudError('clear', coll, err)
    return { deleted: 0, error: errText(err) }
  }
}

/**
 * Wipe the books: orders, expenses and the owner's money in/out. `acc_menu` is
 * KEPT — the 207 prices (and any the owner edited by hand) are the tool's setup,
 * not its bookkeeping, and the New Order form is unusable without them.
 */
export async function clearAccountingBooks() {
  const out = {}
  for (const coll of [ACC.ORDERS, ACC.EXPENSES, ACC.WITHDRAWALS]) {
    out[coll] = await clearCollection(coll)
  }
  return out
}

/** Everything in the books as one plain object, for a downloadable backup. */
export async function exportAccountingBackup() {
  const [orders, expenses, withdrawals, menu] = await Promise.all([
    listDocs(ACC.ORDERS), listDocs(ACC.EXPENSES), listDocs(ACC.WITHDRAWALS), listDocs(ACC.MENU),
  ])
  return {
    exportedAt: new Date().toISOString(),
    counts: { orders: orders.length, expenses: expenses.length, withdrawals: withdrawals.length, menu: menu.length },
    orders, expenses, withdrawals, menu,
  }
}

// The "Expense Taken for Use" setting is gone. It was one hand-typed figure
// standing in for two things the tool now records properly: material bought
// (Expenses tab) and money the owner moves in or out of the business (My Money
// tab). `acc_settings/main` is left in place — it now holds the accounting PIN
// hash (below) and nothing else.

// ───────────────────── accounting PIN (second lock) ─────────────────────
//
// A SECOND LOCK, NOT A SECOND WALL. The real boundary is Firebase Auth plus the
// Firestore rules; anyone holding the admin email + password can already read
// every figure straight from the console, and could bypass this check from
// devtools. What it actually protects is a signed-in tab left unattended — a
// phone or laptop someone else picks up. That is a real risk for a shop counter,
// which is why it exists, and it is the only risk it covers.
//
// The PIN is NEVER hardcoded — the same rule the reviews moderation UI follows.
// It is SHA-256'd with an app salt and stored in `acc_settings/main.accPinHash`,
// which is admin-only, so the digits appear neither in the published bundle nor
// in the repo. A 6-digit PIN is brute-forceable offline by anyone who can read
// the hash, but reading it already requires the admin login.
const PIN_SALT = 'cake-crumb-acc-pin-v1'

async function pinDigest(pin) {
  const bytes = new TextEncoder().encode(`${PIN_SALT}:${String(pin)}`)
  const buf = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * The stored PIN hash, or null if none is set yet. Throws on a read failure so
 * the gate can say "couldn't check" and offer a retry — silently treating an
 * error as "no PIN set" would turn a broken rule into an open door.
 */
export async function getAccPinHash() {
  const db = await getDb()
  if (!db) return null
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'acc_settings', 'main'))
  return snap.exists() ? (snap.data().accPinHash || null) : null
}

/** Set (or change) the PIN. Digits only, 4–8 of them. */
export async function setAccPin(pin) {
  const clean = String(pin).trim()
  if (!/^\d{4,8}$/.test(clean)) throw new Error('PIN must be 4 to 8 digits.')
  const db = await getDb()
  if (!db) throw new Error('Firebase is not configured.')
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(db, 'acc_settings', 'main'), { accPinHash: await pinDigest(clean) }, { merge: true })
}

/** True when `pin` matches the stored hash. */
export async function verifyAccPin(pin, storedHash) {
  if (!storedHash) return false
  return (await pinDigest(String(pin).trim())) === storedHash
}

// ───────────────────── pure calculations (client-side) ─────────────────────

export const lineTotal = (o) => Math.round((Number(o.qty) || 0) * (Number(o.unitPrice) || 0))

/**
 * Total value of an order. New orders carry an `items` array (one customer,
 * many items); legacy single-item orders fall back to top-level qty × price.
 */
export function orderTotal(o) {
  if (Array.isArray(o.items) && o.items.length) {
    return o.items.reduce((s, it) => s + Math.round((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)), 0)
  }
  return lineTotal(o)
}

/** Total number of pieces in an order (sum of item quantities). */
export function orderQty(o) {
  if (Array.isArray(o.items) && o.items.length) {
    return o.items.reduce((s, it) => s + (Number(it.qty) || 0), 0)
  }
  return Number(o.qty) || 0
}

/**
 * Money summary for a month ("YYYY-MM") or all-time (month falsy).
 *
 * The owner's working-capital model, in their words: put ₹15,000 in, buy ₹15,000
 * of material, sell ₹20,000 → ₹5,000 profit, and the original ₹15,000 is back
 * inside that ₹20,000; spend ₹10,000 of it on more material and total expenses
 * are ₹25,000. So:
 *
 *   Money in hand = invested + received − expenses − taken out
 *   Profit        = received − expenses      (money you put in is not income)
 *
 * `acc_withdrawals` rows carry `direction: 'in' | 'out'` — money the owner puts
 * IN from his own pocket, or takes OUT for himself. Rows with no `direction`
 * are treated as 'out', which is what every row meant before investing existed.
 */
export function computeSummary(orders, expenses, withdrawals, month) {
  const inMonth = (d) => !month || String(d || '').slice(0, 7) === month
  const s = {
    receivedCash: 0, receivedOnline: 0, toCollect: 0, orderCount: 0, unpaidCount: 0,
    expensesCash: 0, expensesOnline: 0, withdrawnCash: 0, withdrawnOnline: 0,
    investedCash: 0, investedOnline: 0,
    onlineTakenToCash: 0, // online payments the owner has withdrawn from the bank
  }
  for (const o of orders) {
    if (!inMonth(o.date)) continue
    if (String(o.status || '').toLowerCase() === 'cancelled') continue // write-offs don't count as sales
    const t = orderTotal(o)
    s.orderCount++
    if (o.paid) {
      if (o.method === 'Online') { s.receivedOnline += t; if (o.withdrawn) s.onlineTakenToCash += t }
      else s.receivedCash += t
    } else { s.toCollect += t; s.unpaidCount++ }
  }
  for (const e of expenses) {
    if (!inMonth(e.date)) continue
    const a = Number(e.amount) || 0
    if (e.method === 'Online') s.expensesOnline += a; else s.expensesCash += a
  }
  for (const w of withdrawals) {
    if (!inMonth(w.date)) continue
    const a = Number(w.amount) || 0
    const online = w.method === 'Online'
    if (w.direction === 'in') { if (online) s.investedOnline += a; else s.investedCash += a }
    else if (online) s.withdrawnOnline += a
    else s.withdrawnCash += a
  }
  s.received = s.receivedCash + s.receivedOnline
  s.totalExpenses = s.expensesCash + s.expensesOnline
  s.totalWithdrawn = s.withdrawnCash + s.withdrawnOnline
  s.invested = s.investedCash + s.investedOnline
  s.totalSales = s.received + s.toCollect
  // Online money the owner already withdrew moves from the Bank pocket into Cash.
  s.cashInHand = s.receivedCash + s.investedCash + s.onlineTakenToCash - s.expensesCash - s.withdrawnCash
  s.bankOnline = s.receivedOnline + s.investedOnline - s.onlineTakenToCash - s.expensesOnline - s.withdrawnOnline
  s.moneyInHand = s.cashInHand + s.bankOnline
  // Profit counts money actually RECEIVED, not invoiced — an unpaid order stays
  // in `toCollect` until the customer pays. The Dashboard and the Monthly Report
  // both read this one value, so the two screens can't quote different profits
  // for the same month (they used to: the Dashboard netted off `received`, the
  // Monthly Report off `totalSales`).
  s.profit = s.received - s.totalExpenses
  return s
}

/** Distinct months ("YYYY-MM") present in the data, newest first. */
export function monthsFrom(...lists) {
  const set = new Set()
  lists.flat().forEach((r) => {
    const m = String(r.date || '').slice(0, 7)
    if (m.length === 7) set.add(m)
  })
  return [...set].sort().reverse()
}
