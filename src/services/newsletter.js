import { getDb } from '../firebase.js'

const COLLECTION = 'newsletter'
const STORAGE_KEY = 'cc_newsletter_local_v1'

export async function subscribeNewsletter(email, source = 'footer') {
  const cleaned = String(email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    throw new Error('Please enter a valid email address.')
  }

  const db = await getDb()
  if (db) {
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      const docRef = await addDoc(collection(db, COLLECTION), {
        email: cleaned,
        source,
        createdAt: serverTimestamp(),
      })
      return { ok: true, id: docRef.id }
    } catch (err) {
      console.error('[newsletter] Firestore save failed:', err)
      // fall through to localStorage so user feedback is still positive
    }
  }

  // Local fallback (and resiliency if Firestore write fails)
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!list.includes(cleaned)) {
      list.push(cleaned)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }
  } catch { /* storage blocked — best effort only */ }
  return { ok: true, id: 'local' }
}
