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

let _appPromise = null

// Lazily import + initialise the Firebase app once, then memoise. Keeps the SDK
// out of the main bundle so it only loads on pages that actually use it.
async function getFirebaseApp() {
  if (!isFirebaseEnabled) {
    if (import.meta.env.DEV) {
      console.warn(
        '[firebase] Not configured — data falls back to localStorage. ' +
          'Add VITE_FIREBASE_* vars to .env to enable Firestore.'
      )
    }
    return null
  }
  if (!_appPromise) {
    _appPromise = (async () => {
      try {
        const { initializeApp } = await import('firebase/app')
        return initializeApp(firebaseConfig)
      } catch (err) {
        console.error('[firebase] init failed:', err)
        return null
      }
    })()
  }
  return _appPromise
}

/** Resolve a Firestore `db` (or null). */
export async function getDb() {
  const app = await getFirebaseApp()
  if (!app) return null
  try {
    const { getFirestore } = await import('firebase/firestore')
    return getFirestore(app)
  } catch (err) {
    console.error('[firebase] firestore load failed:', err)
    return null
  }
}

/** Resolve a Firebase Auth instance (or null). Used by the admin dashboard. */
export async function getFirebaseAuth() {
  const app = await getFirebaseApp()
  if (!app) return null
  try {
    const { getAuth } = await import('firebase/auth')
    return getAuth(app)
  } catch (err) {
    console.error('[firebase] auth load failed:', err)
    return null
  }
}
