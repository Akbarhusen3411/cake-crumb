import { getDb, isFirebaseEnabled } from '../firebase.js'

const COLLECTION = 'orders'
// Public, PII-free status mirror so customers can track an order from any
// device. Holds NO name/phone/email/address — only status + items + totals.
const TRACKING = 'tracking'
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
    deliveryDate: String(input.deliveryDate || ''),
    deliveryMethod: String(input.deliveryMethod || ''),
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
    const { addDoc, collection, doc, serverTimestamp, setDoc } = await import('firebase/firestore')
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...order,
      createdAt: serverTimestamp(),
    })
    // Public, PII-free tracking mirror (keyed by orderId for direct lookup).
    try {
      await setDoc(doc(db, TRACKING, order.orderId), {
        orderId: order.orderId,
        status: order.status,
        items: order.items,
        totals: order.totals,
        deliveryDate: order.deliveryDate,
        deliveryMethod: order.deliveryMethod,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('[orders] tracking mirror write failed:', e)
    }
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
export async function markOrderConfirmed(firebaseId, orderId) {
  return setOrderStatus(firebaseId, orderId, 'confirmed', 'confirmedAt')
}

/**
 * Mark a Firestore order as cancelled. Same contract as markOrderConfirmed.
 */
export async function markOrderCancelled(firebaseId, orderId) {
  return setOrderStatus(firebaseId, orderId, 'cancelled', 'cancelledAt')
}

async function setOrderStatus(firebaseId, orderId, status, tsField) {
  if (!isFirebaseEnabled || !firebaseId) return false
  const db = await getDb()
  if (!db) return false
  try {
    const { doc, serverTimestamp, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, COLLECTION, firebaseId), {
      status,
      [tsField]: serverTimestamp(),
    })
    // Mirror the new status to the public tracking doc so customers see it.
    if (orderId) {
      try {
        await updateDoc(doc(db, TRACKING, orderId), { status, [tsField]: serverTimestamp() })
      } catch (e) {
        console.error('[orders] tracking status mirror failed:', e)
      }
    }
    return true
  } catch (err) {
    console.error(`[orders] status update (${status}) failed:`, err)
    return false
  }
}

/**
 * Public order tracking lookup by orderId — reads the PII-free `tracking`
 * mirror, so it works for any customer on any device (no auth needed).
 * Returns { orderId, status, items, totals, deliveryDate, deliveryMethod } or null.
 */
export async function getOrderTracking(orderId) {
  if (!orderId) return null
  const db = await getDb()
  if (!db) {
    // Local fallback: the customer's own-device order mirror.
    const local = readLocal().find((o) => o.orderId === orderId)
    return local || null
  }
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(db, TRACKING, orderId))
    if (snap.exists()) return snap.data()
    // Fall back to the local mirror if the tracking doc isn't there.
    return readLocal().find((o) => o.orderId === orderId) || null
  } catch (err) {
    console.error('[orders] tracking lookup failed:', err)
    return readLocal().find((o) => o.orderId === orderId) || null
  }
}

/**
 * Subscribe to all orders in real time (admin dashboard), newest first.
 * Calls onData(orders[]) on every change. Returns a Promise of an unsubscribe
 * function. Falls back to a one-shot local read when Firestore is off.
 */
export async function subscribeOrders(onData, onError) {
  const db = await getDb()
  if (!db) {
    onData(readLocal().map((o) => ({ ...o, firebaseId: null })))
    return () => {}
  }
  try {
    const { collection, onSnapshot, orderBy, query } = await import('firebase/firestore')
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        onData(snap.docs.map((d) => {
          const data = d.data()
          return {
            firebaseId: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
          }
        }))
      },
      (err) => {
        console.error('[orders] live subscription failed:', err)
        if (onError) onError(err)
      }
    )
  } catch (err) {
    console.error('[orders] subscribe failed:', err)
    if (onError) onError(err)
    return () => {}
  }
}

/**
 * List all orders, newest first. Reads from Firestore (admin dashboard);
 * falls back to the local mirror when Firestore is off. Never throws.
 */
export async function getAllOrders() {
  const db = await getDb()
  if (!db) {
    return readLocal().map((o) => ({ ...o, firebaseId: null }))
  }
  try {
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        firebaseId: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      }
    })
  } catch (err) {
    console.error('[orders] list failed, falling back to local:', err)
    return readLocal().map((o) => ({ ...o, firebaseId: null }))
  }
}
