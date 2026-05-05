import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseEnabled } from '../firebase.js'

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

  if (!isFirebaseEnabled || !db) {
    return { ...local, firebaseId: null }
  }

  try {
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
