import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Read from Vite env (.env file). All vars must start with VITE_ to reach the browser.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseEnabled =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId

let _db = null
if (isFirebaseEnabled) {
  try {
    const app = initializeApp(firebaseConfig)
    _db = getFirestore(app)
  } catch (err) {
    console.error('[firebase] init failed:', err)
  }
} else if (import.meta.env.DEV) {
  console.warn(
    '[firebase] Not configured — reviews will use localStorage. ' +
      'Add VITE_FIREBASE_* vars to .env to enable Firestore.'
  )
}

export const db = _db
