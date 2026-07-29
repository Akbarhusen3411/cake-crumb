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

// Bump to re-import when the Excel is regenerated. Recorded in the cloud (see
// below), so bumping it re-imports once for the whole bakery, not once per PC.
const EXCEL_VERSION = 'v7'

/** Record in Firestore that this Excel version has been imported. */
async function markExcelImported(db) {
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'acc_settings', 'main'), { excelImport: EXCEL_VERSION }, { merge: true })
    return true
  } catch (err) {
    reportCloudError('mark import', 'acc_settings', err)
    return false
  }
}

/**
 * One-time import of the owner's Excel history (April–July 2026) into
 * acc_orders / acc_expenses. Deterministic ids (xl-o-N / xl-e-N) → running it
 * again just overwrites the same docs, never duplicates.
 *
 * It DELETES every existing `xl-` doc and re-writes it with `set` (no merge),
 * so it must run **once per database, not once per device**. The gate used to be
 * a localStorage flag alone — which meant a second PC opening this page for the
 * first time silently reverted every cloud edit made to an imported row (a
 * changed amount, or the "✓ Taken to cash" flag) back to the Excel baseline.
 * The cloud marker `acc_settings/main.excelImport` is now the real gate.
 */
export async function importExcelDataIfNeeded() {
  const FLAG = `cc_acc_excel_${EXCEL_VERSION}`
  let localDone = false
  try { localDone = !!localStorage.getItem(FLAG) } catch { /* ignore */ }

  const db = await getDb()

  if (db) {
    let cloudVersion
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const snap = await getDoc(doc(db, 'acc_settings', 'main'))
      cloudVersion = snap.exists() ? (snap.data().excelImport || null) : null
    } catch (err) {
      // Can't tell whether the cloud already has it — importing on a guess
      // would wipe real edits, so do nothing.
      reportCloudError('import check', 'acc_settings', err)
      return { error: errText(err) }
    }
    if (cloudVersion === EXCEL_VERSION) {
      try { localStorage.setItem(FLAG, '1') } catch { /* ignore */ }
      return null
    }
    if (localDone) {
      // This device imported before the marker existed. Backfill it so no other
      // device repeats the destructive import.
      await markExcelImported(db)
      return null
    }
  } else if (localDone) {
    return null
  }

  const { EXCEL_ORDERS, EXCEL_EXPENSES } = await import('../data/excelImport.js')
  const stamp = new Date().toISOString()
  const orderRecs = EXCEL_ORDERS.map((o, i) => ({ id: `xl-o-${i}`, ...o, createdAt: stamp }))
  const expenseRecs = EXCEL_EXPENSES.map((e, i) => ({ id: `xl-e-${i}`, ...e, createdAt: stamp }))
  const fromExcel = (r) => String(r.id).startsWith('xl-') // only touch imported rows, never manual entries

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
    await markExcelImported(db)
    await listDocs(ACC.ORDERS); await listDocs(ACC.EXPENSES)
    try { localStorage.setItem(FLAG, '1') } catch { /* ignore */ }
    return { orders: orderRecs.length, expenses: expenseRecs.length }
  } catch (err) {
    reportCloudError('excel import', 'acc_orders/acc_expenses', err)
    return { error: errText(err) }
  }
}

// ───────────────────── settings (Expense Taken for Use) ─────────────────────
const TAKEN_LS = 'cc_acc_taken'

// The figure the owner carried over from the Excel sheet. Used only until it is
// explicitly set, so the dashboard keeps showing the number it always showed
// instead of dropping to ₹0 on a device that has never edited it.
export const TAKEN_DEFAULT = 12300

/** "Expense Taken for Use" — money taken from earnings to buy materials (owner's figure). */
export async function getExpenseTakenForUse() {
  let local = null
  try {
    const raw = localStorage.getItem(TAKEN_LS)
    if (raw != null) local = Number(raw) || 0
  } catch { /* ignore */ }
  const db = await getDb()
  if (!db) return local ?? TAKEN_DEFAULT
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(db, 'acc_settings', 'main'))
    if (snap.exists()) {
      const v = Number(snap.data().expenseTakenForUse) || 0
      try { localStorage.setItem(TAKEN_LS, String(v)) } catch { /* ignore */ }
      return v
    }
  } catch (err) { reportCloudError('read', 'acc_settings', err) }
  return local ?? TAKEN_DEFAULT
}

export async function setExpenseTakenForUse(n) {
  const v = Number(n) || 0
  try { localStorage.setItem(TAKEN_LS, String(v)) } catch { /* ignore */ }
  const db = await getDb()
  if (!db) return
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'acc_settings', 'main'), { expenseTakenForUse: v }, { merge: true })
  } catch (err) { reportCloudError('save', 'acc_settings', err) }
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
