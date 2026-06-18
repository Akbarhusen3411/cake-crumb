import { getDb, isFirebaseEnabled } from '../firebase.js'

const COLLECTION = 'orders'
const STORAGE_KEY = 'cc_orders_local_v1'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // storage full or blocked — fail silently
  }
}

/**
 * Persist a customer order. Falls back to localStorage when Firebase isn't configured.
 *
 * Shape:
 *   {
 *     orderId: 'CC-...-NNNN',
 *     items:    [{ id, name, price, qty, img }],
 *     totals:   { subtotal, delivery, total },
 *     customer: { name, phone, email?, address?, city?, pincode? },
 *     payment:  { method: 'upi'|'cod', paid?: boolean },
 *     source:   'checkout' | 'chatbot',
 *     notes?:   string,
 *   }
 *
 * Returns the saved order with createdAt and an optional firebaseId.
 * Never throws — order saving is fire-and-forget; UX must not block on it.
 */
export async function saveOrder(input) {
  const order = {
    orderId: String(input.orderId || ''),
    items: Array.isArray(input.items) ? input.items.map(slimItem) : [],
    totals: {
      subtotal: Number(input.totals?.subtotal) || 0,
      delivery: Number(input.totals?.delivery) || 0,
      total: Number(input.totals?.total) || 0,
    },
    customer: {
      name: String(input.customer?.name || '').trim(),
      phone: String(input.customer?.phone || '').trim(),
      email: String(input.customer?.email || '').trim(),
      address: String(input.customer?.address || '').trim(),
      city: String(input.customer?.city || '').trim(),
      pincode: String(input.customer?.pincode || '').trim(),
    },
    payment: {
      method: input.payment?.method || 'cod',
      paid: !!input.payment?.paid,
      utr: String(input.payment?.utr || '').trim(),
    },
    source: input.source || 'checkout',
    notes: String(input.notes || ''),
    status: 'placed',
  }

  // Local mirror — always written, even when Firebase is enabled.
  // Keeps a customer-side history accessible without auth.
  const local = { ...order, createdAt: new Date().toISOString() }
  const list = readLocal()
  list.unshift(local)
  writeLocal(list.slice(0, 50)) // keep last 50

  const db = await getDb()
  if (!db) {
    return { ...local, firebaseId: null }
  }

  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...order,
      createdAt: serverTimestamp(),
    })
    return { ...local, firebaseId: docRef.id }
  } catch (err) {
    console.error('[orders] Firestore save failed:', err)
    return { ...local, firebaseId: null, error: err.message }
  }
}

function slimItem(it) {
  return {
    id: String(it.id || ''),
    name: String(it.name || ''),
    price: Number(it.price) || 0,
    qty: Number(it.qty) || 1,
    img: typeof it.img === 'string' ? it.img : '',
  }
}

/**
 * Look up an order by its public orderId (e.g. CC-AB-200526-0001). Reads
 * from Firestore; falls back to the local mirror when Firestore is off.
 * Returns the order document with `firebaseId` attached, or null.
 */
export async function getOrderByOrderId(orderId) {
  if (!orderId) return null

  const db = await getDb()
  if (!db) {
    const local = readLocal().find((o) => o.orderId === orderId)
    return local ? { ...local, firebaseId: null } : null
  }

  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore')
    const q = query(collection(db, COLLECTION), where('orderId', '==', orderId))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const docSnap = snap.docs[0]
    return { firebaseId: docSnap.id, ...docSnap.data() }
  } catch (err) {
    console.error('[orders] lookup failed:', err)
    return null
  }
}

/**
 * Mark a Firestore order as confirmed. No-op when Firebase isn't configured
 * or when we don't have the firebaseId. Idempotent — safe to call twice.
 */
export async function markOrderConfirmed(firebaseId) {
  if (!isFirebaseEnabled || !firebaseId) return false
  const db = await getDb()
  if (!db) return false
  try {
    const { doc, serverTimestamp, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, COLLECTION, firebaseId), {
      status: 'confirmed',
      confirmedAt: serverTimestamp(),
    })
    return true
  } catch (err) {
    console.error('[orders] confirm update failed:', err)
    return false
  }
}
