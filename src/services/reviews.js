import { getDb } from '../firebase.js'

const COLLECTION = 'reviews'
const STORAGE_KEY = 'cc_reviews_local_v1'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

/**
 * Submit a review.
 * Shape: { name, email?, rating (1-5), title?, text, orderItem? }
 */
export async function addReview(input) {
  const review = {
    name: String(input.name || '').trim(),
    email: String(input.email || '').trim(),
    rating: Math.max(1, Math.min(5, Number(input.rating) || 5)),
    title: String(input.title || '').trim(),
    text: String(input.text || '').trim(),
    orderItem: String(input.orderItem || '').trim(),
  }
  if (!review.name || !review.text) {
    throw new Error('Name and review text are required.')
  }

  const db = await getDb()
  if (db) {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...review,
      createdAt: serverTimestamp(),
    })
    return { id: docRef.id, ...review, createdAt: new Date().toISOString() }
  }

  // localStorage fallback
  const id = 'local-' + Date.now()
  const stored = { id, ...review, createdAt: new Date().toISOString() }
  const list = readLocal()
  list.unshift(stored)
  writeLocal(list)
  return stored
}

/**
 * Fetch all reviews, newest first.
 */
export async function getReviews() {
  const db = await getDb()
  if (db) {
    try {
      const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          // Convert Firestore Timestamp → ISO string for the UI layer
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        }
      })
    } catch (err) {
      console.error('[reviews] fetch failed, falling back to local:', err)
      return readLocal()
    }
  }
  return readLocal()
}

/**
 * Delete a review by id (admin moderation).
 * Returns true on success. Falls through to localStorage when not on Firestore.
 */
export async function deleteReview(id) {
  if (!id) return false

  if (!id.startsWith('local-')) {
    const db = await getDb()
    if (db) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore')
        await deleteDoc(doc(db, COLLECTION, id))
        return true
      } catch (err) {
        console.error('[reviews] delete failed:', err)
        return false
      }
    }
  }

  // Local fallback
  const list = readLocal().filter((r) => r.id !== id)
  writeLocal(list)
  return true
}

/**
 * Compute aggregate stats for a reviews list.
 */
export function summarize(reviews) {
  const total = reviews.length
  if (total === 0) {
    return {
      total: 0,
      avg: 0,
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
    }
  }
  const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0)
  const avg = sum / total
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Number(r.rating) === stars).length,
  }))
  return { total, avg, breakdown }
}

/**
 * Format ISO timestamp → "5 days ago"-style.
 */
export function timeAgo(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (isNaN(t)) return ''
  const diff = Date.now() - t
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} day${day > 1 ? 's' : ''} ago`
  const wk = Math.floor(day / 7)
  if (wk < 5) return `${wk} week${wk > 1 ? 's' : ''} ago`
  const mo = Math.floor(day / 30)
  return `${mo} month${mo > 1 ? 's' : ''} ago`
}
