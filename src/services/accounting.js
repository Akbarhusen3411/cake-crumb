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
    console.error('[accounting] list failed', coll, err)
    return readLocal(coll)
  }
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
    console.error('[accounting] add failed', coll, err)
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
    console.error('[accounting] update failed', coll, err)
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
    console.error('[accounting] delete failed', coll, err)
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
    console.error('[accounting] seed menu failed', err)
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

/**
 * One-time import of the owner's Excel history (April–July 2026) into
 * acc_orders / acc_expenses. Deterministic ids (xl-o-N / xl-e-N) → running it
 * again just overwrites the same docs, never duplicates. Idempotent, flag-gated.
 */
export async function importExcelDataIfNeeded() {
  const FLAG = 'cc_acc_excel_v7' // bump to re-import when the Excel is updated
  try { if (localStorage.getItem(FLAG)) return null } catch { /* ignore */ }
  const { EXCEL_ORDERS, EXCEL_EXPENSES } = await import('../data/excelImport.js')
  const stamp = new Date().toISOString()
  const orderRecs = EXCEL_ORDERS.map((o, i) => ({ id: `xl-o-${i}`, ...o, createdAt: stamp }))
  const expenseRecs = EXCEL_EXPENSES.map((e, i) => ({ id: `xl-e-${i}`, ...e, createdAt: stamp }))
  const fromExcel = (r) => String(r.id).startsWith('xl-') // only touch imported rows, never manual entries

  const db = await getDb()
  if (!db) {
    const rewrite = (coll, recs) => {
      const kept = readLocal(coll).filter((r) => !fromExcel(r))
      writeLocal(coll, [...recs, ...kept])
    }
    rewrite(ACC.ORDERS, orderRecs); rewrite(ACC.EXPENSES, expenseRecs)
    try { localStorage.setItem(FLAG, '1') } catch { /* ignore */ }
    return { orders: orderRecs.length, expenses: expenseRecs.length }
  }
  try {
    const { doc, writeBatch } = await import('firebase/firestore')
    // clear previously-imported rows so a shorter/changed sheet leaves no orphans
    const curO = await listDocs(ACC.ORDERS)
    const curE = await listDocs(ACC.EXPENSES)
    const deletes = [
      ...curO.filter(fromExcel).map((r) => [ACC.ORDERS, r.id]),
      ...curE.filter(fromExcel).map((r) => [ACC.EXPENSES, r.id]),
    ]
    const writes = [...orderRecs.map((r) => [ACC.ORDERS, r]), ...expenseRecs.map((r) => [ACC.EXPENSES, r])]
    for (let i = 0; i < deletes.length; i += 400) {
      const batch = writeBatch(db)
      deletes.slice(i, i + 400).forEach(([c, id]) => batch.delete(doc(db, c, id)))
      await batch.commit()
    }
    for (let i = 0; i < writes.length; i += 400) {
      const batch = writeBatch(db)
      writes.slice(i, i + 400).forEach(([c, r]) => { const { id, ...data } = r; batch.set(doc(db, c, id), data) })
      await batch.commit()
    }
    await listDocs(ACC.ORDERS); await listDocs(ACC.EXPENSES)
    try { localStorage.setItem(FLAG, '1') } catch { /* ignore */ }
    return { orders: orderRecs.length, expenses: expenseRecs.length }
  } catch (err) {
    console.error('[accounting] excel import failed', err)
    return null
  }
}

// ───────────────────── settings (Expense Taken for Use) ─────────────────────
const TAKEN_LS = 'cc_acc_taken'

/** "Expense Taken for Use" — money taken from earnings to buy materials (owner's figure). */
export async function getExpenseTakenForUse() {
  let local = 0
  try { local = Number(localStorage.getItem(TAKEN_LS)) || 0 } catch { /* ignore */ }
  const db = await getDb()
  if (!db) return local
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(db, 'acc_settings', 'main'))
    if (snap.exists()) {
      const v = Number(snap.data().expenseTakenForUse) || 0
      try { localStorage.setItem(TAKEN_LS, String(v)) } catch { /* ignore */ }
      return v
    }
  } catch (err) { console.error('[accounting] getTaken failed', err) }
  return local
}

export async function setExpenseTakenForUse(n) {
  const v = Number(n) || 0
  try { localStorage.setItem(TAKEN_LS, String(v)) } catch { /* ignore */ }
  const db = await getDb()
  if (!db) return
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'acc_settings', 'main'), { expenseTakenForUse: v }, { merge: true })
  } catch (err) { console.error('[accounting] setTaken failed', err) }
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

/** Money summary for a month ("YYYY-MM") or all-time (month falsy). */
export function computeSummary(orders, expenses, withdrawals, month) {
  const inMonth = (d) => !month || String(d || '').slice(0, 7) === month
  const s = {
    receivedCash: 0, receivedOnline: 0, toCollect: 0, orderCount: 0, unpaidCount: 0,
    expensesCash: 0, expensesOnline: 0, withdrawnCash: 0, withdrawnOnline: 0,
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
    if (w.method === 'Online') s.withdrawnOnline += a; else s.withdrawnCash += a
  }
  s.received = s.receivedCash + s.receivedOnline
  s.totalExpenses = s.expensesCash + s.expensesOnline
  s.totalWithdrawn = s.withdrawnCash + s.withdrawnOnline
  s.totalSales = s.received + s.toCollect
  // Online money the owner already withdrew moves from the Bank pocket into Cash.
  s.cashInHand = s.receivedCash + s.onlineTakenToCash - s.expensesCash - s.withdrawnCash
  s.bankOnline = s.receivedOnline - s.onlineTakenToCash - s.expensesOnline - s.withdrawnOnline
  s.moneyInHand = s.cashInHand + s.bankOnline
  s.profit = s.totalSales - s.totalExpenses
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
