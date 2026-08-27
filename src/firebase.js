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

// reCAPTCHA Enterprise key ID for Firebase App Check. Public by design — it
// ships in the bundle exactly like the Firebase config above.
//
// ENTERPRISE, not the classic v3 provider: the Firebase console marks plain
// reCAPTCHA deprecated for new integrations, and Enterprise covers this site's
// volume free (10k assessments/month) on the no-cost Spark plan. Enterprise
// issues a single key ID and NO secret — that is expected, not a missing step.
// Swapping providers means changing the class below AND re-registering in the
// console; the two must always agree.
//
// App Check is what makes a lifted config useless: `orders`, `tracking` and
// `reviews` all accept unauthenticated creates (they have to — customers are
// not signed in), so the Firestore rules validate WHAT is written but not WHO
// is writing it. App Check attests the request came from the real site.
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

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
        const app = initializeApp(firebaseConfig)
        await initAppCheck(app)
        return app
      } catch (err) {
        console.error('[firebase] init failed:', err)
        return null
      }
    })()
  }
  return _appPromise
}

/**
 * Attach App Check to the app, if a site key is configured.
 *
 * Must run HERE — inside the memoised init, before getDb()/getFirebaseAuth()
 * can hand out a service. A request that leaves before App Check is attached
 * carries no token, and once enforcement is on in the console it is rejected.
 *
 * No key set => no-op, matching how Firebase and EmailJS already degrade. That
 * means this is safe to ship before the console side is finished.
 *
 * NEVER let a failure here throw: App Check is a hardening layer, and a
 * reCAPTCHA hiccup must not take the storefront's Firestore access down with
 * it. Enforcement is decided in the console, not by this code.
 */
async function initAppCheck(app) {
  if (!RECAPTCHA_SITE_KEY) return
  try {
    const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import('firebase/app-check')
    // localhost cannot be attested by reCAPTCHA. This flag makes the SDK print
    // a debug token to the console on first run; register it once under
    // App Check -> Manage debug tokens and dev keeps working under enforcement.
    if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    })
  } catch (err) {
    console.error('[firebase] App Check init failed:', err)
  }
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
    const { getAuth, setPersistence, browserSessionPersistence } = await import('firebase/auth')
    const auth = getAuth(app)
    // Session-only login: the admin stays signed in while the tab is open, but
    // closing the tab/browser clears it — reopening requires email + password.
    try { await setPersistence(auth, browserSessionPersistence) } catch { /* keep default */ }
    return auth
  } catch (err) {
    console.error('[firebase] auth load failed:', err)
    return null
  }
}
