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
      // Key the doc by the email so a repeat subscribe doesn't create duplicate
      // docs. A create for a new email is allowed by the rules; an existing email
      // becomes an update (rules deny it) → caught below → dedup with no error to
      // the user. Emails are validated above so they're safe as a doc id.
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      await setDoc(doc(db, COLLECTION, cleaned), {
        email: cleaned,
        source,
        createdAt: serverTimestamp(),
      })
      return { ok: true, id: cleaned }
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
