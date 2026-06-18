// Read from Vite env (.env file). All vars must start with VITE_ to reach the browser.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Cheap, synchronous env check — safe to import anywhere without pulling the SDK.
export const isFirebaseEnabled =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId

let _dbPromise = null

/**
 * Lazily import + initialise Firebase only on first use, then memoise.
 * Keeps the ~80KB Firebase SDK out of the main bundle so it never loads on
 * pages that don't touch Firestore. Resolves to a Firestore `db` or `null`.
 */
export async function getDb() {
  if (!isFirebaseEnabled) {
    if (import.meta.env.DEV) {
      console.warn(
        '[firebase] Not configured — data falls back to localStorage. ' +
          'Add VITE_FIREBASE_* vars to .env to enable Firestore.'
      )
    }
    return null
  }
  if (!_dbPromise) {
    _dbPromise = (async () => {
      try {
        const [{ initializeApp }, { getFirestore }] = await Promise.all([
          import('firebase/app'),
          import('firebase/firestore'),
        ])
        const app = initializeApp(firebaseConfig)
        return getFirestore(app)
      } catch (err) {
        console.error('[firebase] init failed:', err)
        return null
      }
    })()
  }
  return _dbPromise
}
