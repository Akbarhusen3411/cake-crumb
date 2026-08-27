import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Content-Security-Policy — the browser-enforced allow-list of what this page
 * may load and talk to. It is the main hardening available to a static site:
 * GitHub Pages serves files and cannot set response headers, so this ships as
 * a <meta http-equiv> instead.
 *
 * BUILD ONLY, deliberately (see cspPlugin below). Vite's dev server injects the
 * React Refresh preamble as an INLINE <script>, which `script-src 'self'` would
 * block — so a policy hard-coded into index.html would break `npm run dev` on
 * every page. Injecting it at build time keeps dev working and still covers
 * everything that reaches a customer. Test it with `npm run preview`, never
 * with `npm run dev`.
 *
 * Two limits worth knowing, both inherent to <meta> rather than choices here:
 *   - `frame-ancestors` (clickjacking) is IGNORED in a meta tag. It only works
 *     as a real header, which GitHub Pages cannot send. Not available to us.
 *   - There is no Report-Only mode in a meta tag either, so this cannot be
 *     staged behind a warning phase — it is enforcing or it is absent.
 *
 * Every origin below is one the site genuinely uses. Adding an integration
 * means adding its origin here, or it fails silently in production only.
 */
const CSP = [
  // Nothing loads from anywhere unless a directive below says otherwise.
  "default-src 'self'",

  // Our own bundle, plus the Plausible analytics tag in index.html. NOTE there
  // is no 'unsafe-inline' here and it must stay that way — that single keyword
  // is what makes a CSP worth having, since it is what stops an injected
  // <script> from running. The JSON-LD blocks are type="application/ld+json",
  // which the browser never executes, so they are unaffected.
  // www.google.com + www.gstatic.com are for Firebase App Check: its reCAPTCHA
  // v3 attestation loads https://www.google.com/recaptcha/api.js, which pulls
  // from gstatic and opens an iframe on www.google.com. Without all three
  // App Check silently fails to get a token and, once enforcement is on in the
  // console, every Firestore write is rejected. Note this is a real widening —
  // www.google.com is a broad host — and it is the price of reCAPTCHA.
  "script-src 'self' https://plausible.io https://www.google.com https://www.gstatic.com",

  // 'unsafe-inline' IS required for styles: several components ship a real
  // <style> block (ProductQuickView and friends) and Google Fonts serves a
  // stylesheet. This is a far weaker concession than the script equivalent.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",

  // data: covers review photos, which are stored as data URLs rather than
  // Storage objects. blob: covers the invoice PDF path — html-to-image
  // rasterises the sheet through a blob/data URL before jspdf writes it.
  "img-src 'self' data: blob: https://images.unsplash.com",

  // Local product videos.
  "media-src 'self'",

  // Everything the app talks to over XHR/fetch/WebChannel:
  //   firestore          — orders, reviews, tracking, the acc_* collections
  //   identitytoolkit    — admin sign-in
  //   securetoken        — auth token refresh
  //   firebaseinstallations / googleapis — Firebase SDK housekeeping
  //   firebaseappcheck   — not enabled yet; listed so turning App Check on
  //                        does not fail here with a confusing CSP error
  //   emailjs            — order notification + customer confirmation
  //   nominatim          — pincode geocoding for the delivery fee
  //   plausible          — pageview beacon
  [
    "connect-src 'self'",
    'https://firestore.googleapis.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://firebaseinstallations.googleapis.com',
    'https://www.googleapis.com',
    'https://content-firebaseappcheck.googleapis.com',
    'https://api.emailjs.com',
    'https://nominatim.openstreetmap.org',
    'https://plausible.io',
    'https://www.google.com',
  ].join(' '),

  // snapwidget: the Instagram feed embed, when VITE_SNAPWIDGET_ID is set.
  // www.google.com: the invisible reCAPTCHA v3 frame App Check relies on.
  'frame-src https://snapwidget.com https://www.google.com',

  // jspdf can hand work to a blob worker.
  "worker-src 'self' blob:",

  // No <object>/<embed>; nothing may retarget relative URLs or post a form
  // off-site. All three are cheap and close real injection routes.
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/**
 * Injects the policy as the first thing in <head> — a meta CSP governs only
 * what comes after it, so it has to lead.
 */
const cspPlugin = {
  name: 'cc-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return {
      html,
      tags: [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ],
    }
  },
}

// https://vite.dev/config/
export default defineConfig({
  // Repo name on GitHub Pages — assets load from /cake-crumb/...
  base: '/cake-crumb/',
  plugins: [react(), tailwindcss(), cspPlugin],
  build: {
    rollupOptions: {
      output: {
        // Split the long-lived vendor code into its own chunk so app updates
        // don't bust the React/Router cache. Firebase is dynamically imported
        // (see firebase.js) so Rollup already emits it as a separate async chunk.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
          }
        },
      },
    },
  },
})
