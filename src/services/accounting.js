import { getDb, isFirebaseEnabled } from '../firebase.js'
import { ACCOUNTING_MENU } from '../data/accountingMenu.js'
import { shopProducts } from '../data/products.js'

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

// ── Saves that survive a weak connection ──
// Every change made here — a new record, an edit, a delete — is kept on this
// device as PENDING until OUR OWN write call to Firestore resolves, and only
// that clears it:
//  - a new or edited row carries `_pending: <nonce>` in localStorage;
//  - a delete leaves a tombstone (cc_<coll>_deleted_v1).
// Reads always let a pending row win over the cloud copy (and drop tombstoned
// ids), and every live snapshot re-sends whatever is still pending (setDoc on
// the SAME id, so a retry can't make a duplicate).
//
// Why our own promise and not the snapshot: Firestore's live listener shows a
// write the moment it's QUEUED (latency compensation), long before the server
// has it — and with the default memory cache that queue dies with the tab.
// Clearing the mark on sight of the doc (the first version of this) lost
// every save made on a weak signal if the page closed before the server
// acknowledged it.
//
// Writes give up waiting after SAVE_TIMEOUT_MS (a Firestore promise settles
// only on a server ack, which left "Saving…" spinning at the counter); the
// row simply stays pending and is re-sent.
const SAVE_TIMEOUT_MS = 12000
const TIMEOUT_MSG = 'timeout — slow or no connection; will retry'
const withTimeout = (p, ms = SAVE_TIMEOUT_MS) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(TIMEOUT_MSG)), ms))])
const isTimeout = (err) => err?.message === TIMEOUT_MSG
// The menu set-up checks run on every unlock and are safe to skip (they try
// again next time). A slow first connection on a phone — App Check + warm-up
// often takes longer than 12 s — is not a failed save, so it must not raise
// the "Not saved to the cloud" banner. Real errors (rules, App Check) still do.
function reportSetupError(op, coll, err) {
  if (isTimeout(err)) { console.warn(`[accounting] ${op} skipped (slow connection)`, coll); return }
  reportCloudError(op, coll, err)
}
/** A record as it may be written to the cloud: no id, no sync bookkeeping. */
const cloudData = ({ id, _pending, ...rest }) => rest // eslint-disable-line no-unused-vars
const stripPending = ({ _pending, ...rest }) => rest // eslint-disable-line no-unused-vars
const newNonce = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const deadKey = (coll) => `cc_${coll}_deleted_v1`
function readDead(coll) {
  try { return JSON.parse(localStorage.getItem(deadKey(coll)) || '[]') } catch { return [] }
}
function writeDead(coll, ids) {
  try { localStorage.setItem(deadKey(coll), JSON.stringify([...new Set(ids)])) } catch { /* ignore */ }
}

/** Clear a row's pending mark — only if it is still the SAME change (nonce). */
function markSaved(coll, id, nonce) {
  writeLocal(coll, readLocal(coll).map((x) => (x.id === id && x._pending === nonce ? stripPending(x) : x)))
}

/** Cloud rows, with this device's pending changes on top and its pending deletes taken out. */
function mergePending(coll, cloudRows) {
  // A `_pending` field that reached the cloud (an old undo could store one) is
  // bookkeeping, not data — never let it mark a row pending on this device.
  const cloud = cloudRows.map(stripPending)
  const local = readLocal(coll)
  const pending = new Map(local.filter((r) => r._pending && !isLocalId(r.id)).map((r) => [r.id, r]))
  const dead = new Set(readDead(coll))
  if (!pending.size && !dead.size) return cloud
  const ids = new Set(cloud.map((r) => r.id))
  const fresh = [...pending.values()].filter((r) => !ids.has(r.id) && !dead.has(r.id))
  return [...fresh, ...cloud.filter((r) => !dead.has(r.id)).map((r) => pending.get(r.id) || r)]
}

const inFlight = new Map() // `${coll}/${id}` → nonce being sent right now
async function sendRow(db, coll, row) {
  const key = `${coll}/${row.id}`
  const nonce = row._pending
  if (inFlight.get(key) === nonce) return // already on its way
  inFlight.set(key, nonce)
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await withTimeout(setDoc(doc(db, coll, row.id), cloudData(row)))
    markSaved(coll, row.id, nonce)
  } finally {
    if (inFlight.get(key) === nonce) inFlight.delete(key)
  }
}

const flushing = new Set()
/** Re-send everything still pending for a collection. Stops at the first failure (still offline). */
async function flushPending(db, coll) {
  if (flushing.has(coll)) return
  flushing.add(coll)
  try {
    const { doc, deleteDoc } = await import('firebase/firestore')
    for (const id of readDead(coll)) {
      await withTimeout(deleteDoc(doc(db, coll, id)))
      writeDead(coll, readDead(coll).filter((x) => x !== id))
    }
    const ids = readLocal(coll).filter((r) => r._pending && !isLocalId(r.id)).map((r) => r.id)
    for (const id of ids) {
      // Re-read each time: the owner may have edited or deleted it meanwhile.
      const row = readLocal(coll).find((r) => r.id === id && r._pending)
      if (row) await sendRow(db, coll, row)
    }
  } catch (err) {
    reportCloudError('retry save', coll, err)
  } finally {
    flushing.delete(coll)
  }
}

/** List every doc in a collection (Firestore → localStorage fallback/mirror). */
export async function listDocs(coll) {
  const db = await getDb()
  if (!db) return readLocal(coll)
  try {
    const { collection, getDocs } = await import('firebase/firestore')
    const snap = await withTimeout(getDocs(collection(db, coll)))
    const arr = mergePending(coll, snap.docs.map((d) => ({ id: d.id, ...d.data() })))
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
          const arr = mergePending(coll, snap.docs.map((d) => ({ id: d.id, ...d.data() })))
          writeLocal(coll, arr)
          onData(arr)
          flushPending(db, coll)
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
  // cloudData() drops an `id` / `_pending` a caller passed along (an undone
  // delete re-adds the old row) — that bookkeeping must never reach the cloud.
  const rec = { ...cloudData(data), createdAt: new Date().toISOString() }
  const db = await getDb()
  let fs = null
  if (db) {
    try { fs = await import('firebase/firestore') } catch (err) { reportCloudError('save', coll, err) }
  } else if (isFirebaseEnabled) {
    // Config present but the SDK didn't load: this save is on this device
    // only — say so instead of looking saved.
    reportCloudError('save', coll, new Error('cloud not reachable — saved on this device only'))
  }
  if (!fs) {
    const r = { id: newLocalId(), ...rec }
    const l = readLocal(coll); l.unshift(r); writeLocal(coll, l)
    return r
  }
  const ref = fs.doc(fs.collection(db, coll))
  const r = { id: ref.id, ...rec }
  const row = { ...r, _pending: newNonce() }
  const l = readLocal(coll); l.unshift(row); writeLocal(coll, l)
  try {
    await sendRow(db, coll, row)
  } catch (err) {
    // Kept as pending: it stays on screen, survives a reload and is re-sent
    // with the same id on the next live read.
    reportCloudError('save', coll, err)
  }
  return r
}

/** Update a record by id. */
export async function updateDocRec(coll, id, data) {
  const patch = cloudData(data)
  const nonce = newNonce()
  const cloudRow = !isLocalId(id)
  const l = readLocal(coll)
  const i = l.findIndex((x) => x.id === id)
  if (i >= 0) { l[i] = { ...l[i], ...patch, ...(cloudRow ? { _pending: nonce } : {}) }; writeLocal(coll, l) }
  const db = await getDb()
  if (!db && isFirebaseEnabled && cloudRow) reportCloudError('update', coll, new Error('cloud not reachable — changed on this device only'))
  if (!db || !cloudRow) return
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    await withTimeout(updateDoc(doc(db, coll, id), patch))
    markSaved(coll, id, nonce)
  } catch (err) {
    // Stays pending: the whole row is re-sent on the next live read, so a
    // reload no longer reverts the edit to the cloud's old copy.
    reportCloudError('update', coll, err)
  }
}

/** Delete a record by id. */
export async function deleteDocRec(coll, id) {
  writeLocal(coll, readLocal(coll).filter((x) => x.id !== id))
  const db = await getDb()
  if (!db && isFirebaseEnabled && !isLocalId(id)) reportCloudError('delete', coll, new Error('cloud not reachable — deleted on this device only'))
  if (!db || isLocalId(id)) return
  writeDead(coll, [...readDead(coll), id]) // until the cloud confirms
  try {
    const { doc, deleteDoc } = await import('firebase/firestore')
    await withTimeout(deleteDoc(doc(db, coll, id)))
    writeDead(coll, readDead(coll).filter((x) => x !== id))
  } catch (err) {
    reportCloudError('delete', coll, err)
  }
}

/**
 * Seed the 207-item menu once, if the menu collection is empty.
 * "Empty" must come from the SERVER: on a weak signal a read could fall back
 * to an empty device copy, and the seed batch then committed on top of the
 * real menu once the connection came back — 207 duplicate rows. No answer from
 * the server → skip; the next healthy unlock decides.
 */
export async function seedMenuIfEmpty() {
  const db = await getDb()
  if (!db) {
    if (readLocal(ACC.MENU).length > 0) return
    writeLocal(ACC.MENU, ACCOUNTING_MENU.map((m, i) => ({ id: `seed-${i}`, ...m })))
    return
  }
  let fs
  try {
    fs = await import('firebase/firestore')
    // One doc answers "is it empty?" — downloading all 207+ rows here is what
    // timed out on a phone's first connection. The live feed loads the menu.
    const snap = await withTimeout(fs.getDocsFromServer(fs.query(fs.collection(db, ACC.MENU), fs.limit(1))))
    if (!snap.empty) return
  } catch (err) {
    reportSetupError('read menu', ACC.MENU, err)
    return
  }
  try {
    const batch = fs.writeBatch(db) // 207 < 500 batch limit
    ACCOUNTING_MENU.forEach((m) => batch.set(fs.doc(fs.collection(db, ACC.MENU)), m))
    await withTimeout(batch.commit())
  } catch (err) {
    reportCloudError('seed menu', ACC.MENU, err)
  }
}

// Categories sold by the piece (min 2). A "Per piece" size is added automatically.
export const PER_PIECE_CATS = ['Cake Pop', 'Cupcake']
export const isPerPieceVariant = (v) => /per\s*piece/i.test(v || '')

// ── "Run once" for the menu importers — recorded in the CLOUD ──
// A per-device localStorage flag alone let a new phone, a second browser or a
// cleared cache run an importer AGAIN: re-adding rows the owner had deleted,
// and (the price fixers) writing old prices over the owner's own edits. The
// mark now lives in acc_settings/main.migrations, so it runs once per BOOK.
// The local flag stays as a fast path; a device that already has it stamps
// the cloud mark too, so the first device to unlock after this change closes
// the door for every other one. No cloud (localStorage-only build) → the
// local flag alone, as before.
// Every importer's flag, so a pre-marker book can be stamped in one go.
const IMPORTER_FLAGS = ['cc_acc_perpiece_v1', 'cc_acc_cakepop_v2', 'cc_acc_freegift_v1', 'cc_acc_menufix_nov26_v1']
async function alreadyRan(flag) {
  let local = false
  try { local = !!localStorage.getItem(flag) } catch { /* ignore */ }
  const db = await getDb()
  if (!db) return local
  try {
    const { doc, getDoc, setDoc, getDocsFromServer, query, collection, limit } = await import('firebase/firestore')
    const ref = doc(db, 'acc_settings', 'main')
    const snap = await withTimeout(getDoc(ref))
    if (snap.exists() && snap.data()?.migrations?.[flag]) {
      try { localStorage.setItem(flag, '1') } catch { /* ignore */ }
      return true
    }
    // A book with a menu but NO migrations record predates the cloud marks:
    // the owner's devices ran every importer of this release long ago. A new
    // phone unlocking first must not run them again (re-adding deleted rows,
    // writing old prices over edited ones) — stamp them all as done instead.
    if (!snap.data()?.migrations) {
      const menu = await withTimeout(getDocsFromServer(query(collection(db, ACC.MENU), limit(1))))
      if (!menu.empty) {
        const now = new Date().toISOString()
        await setDoc(ref, { migrations: Object.fromEntries(IMPORTER_FLAGS.map((f) => [f, now])) }, { merge: true })
        try { localStorage.setItem(flag, '1') } catch { /* ignore */ }
        return true
      }
    }
    if (local) await setDoc(ref, { migrations: { [flag]: new Date().toISOString() } }, { merge: true })
    return local
  } catch (err) {
    reportSetupError('read', 'acc_settings', err)
    // Can't tell whether the book already ran it — skip rather than risk
    // overwriting the owner's prices. It will run on a later, healthy unlock.
    return true
  }
}
async function markRan(flag) {
  try { localStorage.setItem(flag, '1') } catch { /* ignore */ }
  const db = await getDb()
  if (!db) return
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'acc_settings', 'main'), { migrations: { [flag]: new Date().toISOString() } }, { merge: true })
  } catch (err) {
    reportCloudError('write', 'acc_settings', err)
  }
}

/**
 * Ensure Cake Pop & Cupcake items each have a "Per piece" price (box-of-6 ÷ 6),
 * so the owner can sell any number of pieces. Idempotent; runs once per browser.
 */
export async function ensurePerPieceMenu() {
  const FLAG = 'cc_acc_perpiece_v1'
  if (await alreadyRan(FLAG)) return []
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
  await markRan(FLAG)
  return additions
}

// ── Free gifts (offers) ──
// Offer gifts are booked on the order like any item, at ₹0, so the counter
// stock and the order history show what went out. This is the ONE category
// allowed a ₹0 rate — everywhere else ₹0 means a size was never picked, and
// OrderForm refuses it.
export const FREE_GIFT_CAT = 'Free Gift'
export const isFreeGiftLine = (l) => String(l?.category || '').trim() === FREE_GIFT_CAT
const FREE_GIFT_ITEMS = ['Cake Pop', 'Cupcake', 'Cheesecake Tub', 'Sponge Cake Tub']

/**
 * Add the ₹0 "Free Gift" rows (one variant each, "Free") to Menu & Prices if
 * they're missing. Only ADDS, and matches on category + name, so a second
 * device or a re-run can't duplicate or overwrite one (same shape as the
 * importers above). Bump the flag's suffix to run it again.
 */
export async function ensureFreeGiftMenu() {
  const FLAG = 'cc_acc_freegift_v1'
  if (await alreadyRan(FLAG)) return
  const menu = await listDocs(ACC.MENU)
  for (const name of FREE_GIFT_ITEMS) {
    const exists = menu.some((m) => m.category === FREE_GIFT_CAT && m.name === name)
    if (!exists) await addDocRec(ACC.MENU, { category: FREE_GIFT_CAT, name, variant: 'Free', price: 0 })
  }
  await markRan(FLAG)
}

/**
 * One-time menu clean-up, 12 Nov 2026 (owner's ask: Menu & Prices to match the
 * website and the printed menu). Checked against a backup of the live menu:
 *  - deletes the Sprinkle cupcake "Per piece" row at ₹4 (a typo; the ₹25 row stays),
 *  - deletes the Diwali pack rows (the Diwali offers were removed that day),
 *  - adds the gift box under Specials at its website price, if no row has its name.
 * Matches on category + name + variant/price, never ids. Past orders keep their
 * own lines, so nothing booked changes. Once per book.
 */
export async function fixMenuNov2026() {
  const FLAG = 'cc_acc_menufix_nov26_v1'
  if (await alreadyRan(FLAG)) return
  const menu = await listDocs(ACC.MENU)
  const drop = menu.filter((m) =>
    (m.category === 'Cupcake' && m.name === 'Sprinkle' && isPerPieceVariant(m.variant) && Number(m.price) === 4) ||
    (['Cupcake', 'Cake Pop'].includes(m.category) && /^Diwali\s/i.test(String(m.variant || '')))
  )
  for (const m of drop) await deleteDocRec(ACC.MENU, m.id)
  const box = shopProducts.find((p) => p.id === 'sg-birthday-box')
  if (box && !menu.some((m) => String(m.name).trim().toLowerCase() === box.name.toLowerCase())) {
    await addDocRec(ACC.MENU, { category: 'Specials', name: box.name, variant: 'Box', price: box.price })
  }
  await markRan(FLAG)
}

/**
 * Set the owner's Cake Pop prices (per piece / box of 6 / box of 12) and add
 * Pistachio. Idempotent; only writes when a price is missing or different.
 */
export async function ensureCakePopPrices() {
  const FLAG = 'cc_acc_cakepop_v2'
  if (await alreadyRan(FLAG)) return
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
  await markRan(FLAG)
}

// ── The Excel importer is RETIRED. ──
// It used to seed acc_orders / acc_expenses from the owner's Apr–Jul 2026
// spreadsheet (`src/data/excelImport.js`, since deleted — the figures are
// in git history before Oct 2026 if they are ever needed). The owner cleared the books to start fresh from August 2026,
// and the importer rewrote its rows with `set` on any device that hadn't run it
// — so leaving it wired up would have refilled the fresh book with the old year.
// It is deliberately not called from anywhere. Don't reinstate it without the
// owner's explicit ask; `acc_settings/main.excelImport` is now a dead marker.

// ───────────────────── destructive: start a fresh book ─────────────────────

/** Delete every doc in a collection. Returns { deleted } or { error }. */
export async function clearCollection(coll) {
  writeLocal(coll, []) // pending rows go too — a later re-send would undo the wipe
  writeDead(coll, [])
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

// ───────────────────── when the last backup was taken ─────────────────────
// Kept in the cloud (`acc_settings/main.lastBackupAt`, merged beside the PIN
// hash) so a backup downloaded on the laptop counts on the phone too; mirrored
// to localStorage like everything else here, and never throws.
const BACKUP_LS = 'cc_acc_last_backup_v1'

/** ISO time of the newest backup known — cloud or this device — or null. */
export async function getLastBackupAt() {
  let local = null
  try { local = localStorage.getItem(BACKUP_LS) } catch { /* ignore */ }
  const db = await getDb()
  if (!db) return local
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(db, 'acc_settings', 'main'))
    const cloud = snap.exists() ? (snap.data().lastBackupAt || null) : null
    return [cloud, local].filter(Boolean).sort().pop() || null
  } catch (err) {
    reportCloudError('read', 'acc_settings', err)
    return local
  }
}

/** Record that a backup was just downloaded. Returns the time stamped. */
export async function markBackupTaken() {
  const at = new Date().toISOString()
  try { localStorage.setItem(BACKUP_LS, at) } catch { /* ignore */ }
  const db = await getDb()
  if (!db) return at
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'acc_settings', 'main'), { lastBackupAt: at }, { merge: true })
  } catch (err) {
    reportCloudError('write', 'acc_settings', err)
  }
  return at
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
  // crypto.subtle exists only on https and localhost. The dev server opened
  // from a phone on the same Wi-Fi (http://192.168…) has none, so the gate
  // failed there; the fallback gives the identical digest.
  const buf = globalThis.crypto?.subtle ? await crypto.subtle.digest('SHA-256', bytes) : sha256(bytes)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Plain SHA-256 (FIPS 180-4) for pages without crypto.subtle. Returns a Uint8Array. */
function sha256(msg) {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ])
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19])
  const len = msg.length
  const total = Math.ceil((len + 9) / 64) * 64
  const buf = new Uint8Array(total)
  buf.set(msg)
  buf[len] = 0x80
  const dv = new DataView(buf.buffer)
  dv.setUint32(total - 8, Math.floor((len * 8) / 0x100000000))
  dv.setUint32(total - 4, (len * 8) >>> 0)
  const W = new Uint32Array(64)
  const rotr = (x, n) => (x >>> n) | (x << (32 - n))
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4)
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3)
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10)
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0
    }
    let [a, b, c, d, e, f, g, h] = H
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h
  }
  const out = new Uint8Array(32)
  const ov = new DataView(out.buffer)
  H.forEach((v, i) => ov.setUint32(i * 4, v))
  return out
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

// ───────────────────── order numbers (DDMMYY-NN) ─────────────────────
//
// A short human handle for an accounting order — "CC-MF-300726-01" is Makbul
// Fatema's order, the first of 30 July 2026, and the count restarts each day.
// The owner reads these back instead of a customer name, which is long, repeats
// across orders, and gets typed three different ways for the same person.
//
// Shaped to match the storefront's `services/orderId.js` (CC-AB-DDMMYY-XXXXX) so
// the two books read alike; the last part differs on purpose — a website ID ends
// in random characters because its `tracking/{orderId}` doc is world-readable and
// must not be guessable, while this one is admin-only and wants a real sequence.
//
// The **sequence counts the month, not the day and not the customer**: the date
// segment still says which day the order was taken, but the counter keeps
// climbing until the month turns over — 010826-01, 010826-02, then 020826-03 the
// next morning. So the last number of a month is also that month's order count.
// (It counted the day until the owner asked for this; a per-day reset made the
// same "-01" come round thirty times a month and told them nothing.)
//
// IT IS A LABEL, NOT A KEY. The Firestore doc id stays the primary key and
// nothing looks an order up by this string. That matters because the counter is
// derived from the orders already on screen, so two devices adding an order for
// the same day at the same moment would both land on -01. As a label that's a
// cosmetic clash the owner can edit; as a key it would silently overwrite one of
// the two orders. This is the same trap `services/orderId.js` documents — a
// per-day counter there gave two customers the identical storefront ID.
//
// The number is assigned once and never regenerated — not when the date is
// corrected, and not when the customer name is fixed, so the initials can end up
// reflecting the name as first typed. It's an identifier; every money figure
// reads `date` and every list reads `customer`, never this.

/** DDMMYY stamp from a "YYYY-MM-DD" date. */
export function dayStamp(date) {
  const p = String(date || '').slice(0, 10).split('-')
  return p.length === 3 ? `${p[2]}${p[1]}${p[0].slice(2)}` : '000000'
}

/** First letters of the name, max 2, "CC" when there's nothing to take. */
export function customerInitials(name = '') {
  return (String(name).trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2) || 'CC').toUpperCase()
}

/** The sequence from an order number — the part after the last dash. */
const seqOf = (no) => parseInt(String(no || '').slice(String(no || '').lastIndexOf('-') + 1), 10)

/** The DDMMYY segment of an order number, whatever precedes it. Rows written
 *  before initials existed read "300726-01"; both shapes are matched. */
const stampOf = (no) => (String(no || '').match(/(\d{6})-\d+\s*$/) || [])[1] || ''

/**
 * The next free order number for `date`: CC-{initials}-DDMMYY-NN.
 *
 * Matched on the MONTH inside the date segment, not the whole prefix and not the
 * day: the count runs across every customer and every day of that month, so it
 * carries on until the month ends and then restarts at -01.
 *
 * Numbers are never reused: deleting this month's -02 still leaves the next one
 * -03, because a reused number would make two different bills agree.
 */
export function nextOrderNo(orders, date, customer = '') {
  const stamp = dayStamp(date)
  const month = stamp.slice(2) // MMYY — the period the counter runs for
  let max = 0
  for (const o of orders || []) {
    const s = stampOf(o?.orderNo)
    if (!s || s.slice(2) !== month) continue
    const seq = seqOf(o?.orderNo)
    if (Number.isFinite(seq) && seq > max) max = seq
  }
  return `CC-${customerInitials(customer)}-${stamp}-${String(max + 1).padStart(2, '0')}`
}

/**
 * Sort key that puts the newest order first: by date, then by the day's own
 * sequence, so -03 sits above -01 rather than wherever the collection happened
 * to return it. Sorting on the number itself wouldn't work — it leads with the
 * customer's initials, so it would group by name before date.
 */
export function orderSortKey(o) {
  // Padded numerically, not lexically: as a plain string the day's 100th order
  // would sort below its 99th.
  const seq = seqOf(o?.orderNo)
  return `${String(o?.date || '')}#${String(Number.isFinite(seq) ? seq : 0).padStart(4, '0')}`
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
    // orderCount is every order that still counts (cancelled ones are skipped);
    // paidCount is the subset that has actually been paid for. They were one
    // number, and "N paid orders" under Earnings counted the unpaid ones too.
    receivedCash: 0, receivedOnline: 0, toCollect: 0, orderCount: 0, paidCount: 0, unpaidCount: 0,
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
      s.paidCount++
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
  // The Dashboard's Earnings tile, the owner's way (Nov 2026): money taken out
  // comes off it and money put back in goes back on — ₹30,000 earned, ₹15,000
  // taken → ₹15,000; ₹15,000 put back → ₹30,000. Profit above is unchanged
  // (money received − expenses), and Money in hand = earnings − expenses.
  s.earnings = s.received - s.totalWithdrawn + s.invested
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
