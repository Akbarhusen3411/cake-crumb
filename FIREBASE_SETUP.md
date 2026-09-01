# Firebase Setup (for the customer review system)

The `/review` page lets customers submit reviews. Without Firebase configured, reviews are saved
to the browser's `localStorage` (visible only on that one device). To collect reviews from real
customers across devices, hook it up to Firebase Firestore — takes about 5 minutes.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com/
2. Click **Add project** → name it (e.g. "cake-and-crumb") → continue → continue (Google
   Analytics is optional, you can disable it).
3. Once the project is created, click **Continue**.

## 2. Add a web app

1. On the project Overview screen, click the **`</>`** (web) icon to add a web app.
2. Give it a nickname (e.g. "Cake & Crumb Site") → **Register app**.
3. Firebase will show you a `firebaseConfig` object. **Keep this tab open** — you need these values.

## 3. Enable Firestore

1. In the left sidebar of Firebase console, click **Build → Firestore Database → Create
   database**.
2. Pick **Start in production mode** → choose region (closest to you) → Enable.
3. Once created, go to the **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reviews/{review} {
      allow read: if true;
      // NOTE: there is deliberately no `email` clause here. The field was
      // removed from addReview() because this collection is world-readable, so
      // every address written to it was harvestable. Two leftover `email is
      // string` lines survived that removal and contradicted the hasOnly list
      // above — a create with an email failed hasOnly, one without failed the
      // `is string` check, so NO review could ever be written. Don't re-add it.
      allow create: if
        request.resource.data.keys().hasOnly(
          ['name','rating','title','text','orderItem','photo','createdAt']
        ) &&
        request.resource.data.name is string &&
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() < 100 &&
        request.resource.data.text is string &&
        request.resource.data.text.size() > 0 &&
        request.resource.data.text.size() < 2000 &&
        request.resource.data.rating is number &&
        request.resource.data.rating >= 1 &&
        request.resource.data.rating <= 5 &&
        request.resource.data.title is string &&
        request.resource.data.title.size() < 150 &&
        request.resource.data.orderItem is string &&
        request.resource.data.orderItem.size() < 200 &&
        request.resource.data.photo is string &&
        request.resource.data.photo.size() < 1000000;
      allow update: if false;
      // Deletes require a signed-in admin (same Firebase Auth account as the
      // orders dashboard). The Reviews page moderation UI is gated by real auth
      // now — there is no hardcoded password anymore.
      allow delete: if request.auth != null;
    }

    match /orders/{order} {
      // Customer can write their own order.
      allow create: if
        request.resource.data.orderId is string &&
        request.resource.data.orderId.size() > 4 &&
        request.resource.data.totals.total is number &&
        request.resource.data.totals.total > 0 &&
        request.resource.data.totals.total < 200000;
      // Admin dashboard (/admin/orders) reads + updates orders, but ONLY when a
      // Firebase-authenticated admin is signed in. Customer PII stays private —
      // anonymous visitors can create an order but cannot read any.
      allow read, update: if request.auth != null;
      allow delete: if false;
    }

    match /tracking/{orderId} {
      // Public, PII-FREE order status mirror so customers can track an order
      // from any device. Holds only orderId, status, items, totals, dates —
      // never name/phone/email/address. Anyone may read; the customer creates
      // it when ordering; only the signed-in admin updates the status.
      allow read: if true;
      allow create: if
        request.resource.data.orderId is string &&
        request.resource.data.orderId.size() > 4;
      allow update: if request.auth != null;
      allow delete: if false;
    }

    match /newsletter/{subscription} {
      // Anyone can subscribe; nobody reads/edits via the browser.
      allow create: if
        request.resource.data.email is string &&
        request.resource.data.email.matches('^[^@]+@[^@]+\\.[^@]+$') &&
        request.resource.data.email.size() < 250;
      allow read, update, delete: if false;
    }

  }
}
```

Click **Publish**. This lets anyone submit a review (with sane validation) and read reviews,
caps field sizes and rejects unknown fields (anti-spam), and allows deletes **only for a
signed-in admin** — the Reviews-page moderation UI now uses the same Firebase Auth account as
the orders dashboard (section 6), so there is no hardcoded password in the code anymore.

> **Optional review photo.** Reviews may include an optional `photo` field — a client-side
> compressed JPEG **data URL** (see `src/utils/compressImage.js`, downscaled to ≤1000px so it
> stays well under Firestore's 1 MB doc limit). No storage bucket is used; the image rides
> inside the review document. The `create` rule above validates only name/text/rating, so the
> extra `photo` field is accepted as-is — no rule change needed. On the Reviews page a stored
> `photo` is shown as the review thumbnail; when absent it falls back to the ordered item's
> catalog image, then a generic cake photo.

## 4. Plug the credentials into the site

1. In the project root, copy `.env.example` to a new file called `.env`:
   ```
   cp .env.example .env
   ```
2. Open `.env` and paste the values from `firebaseConfig`:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=cake-and-crumb.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=cake-and-crumb
   VITE_FIREBASE_STORAGE_BUCKET=cake-and-crumb.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef
   ```
3. **Restart the dev server**: stop it (Ctrl+C) and run `npm run dev` again. Vite only reads
   `.env` at startup.

## 5. Test it

1. Open `/review` and submit a test review.
2. Check the Firebase console → Firestore Database → you should see a `reviews` collection
   with the document.
3. Open `/reviews` — your test review appears in the list.

## 6. Admin login for the Orders dashboard (Firebase Auth)

The `/admin/orders` page lists every order with Confirm / Cancel buttons. To keep
customer data private, it requires a Firebase-authenticated admin login (the
`allow read, update: if request.auth != null;` rule above enforces this).

1. **Enable Email/Password sign-in.** Firebase console → **Build → Authentication
   → Get started** (first time only) → **Sign-in method** tab → click
   **Email/Password** → toggle **Enable** → **Save**.
2. **Create your admin account.** Authentication → **Users** tab → **Add user** →
   enter an email + a password you'll remember → **Add user**. This is the login
   you'll use on the dashboard. (Add more users the same way for multiple staff.)
3. **Publish the orders rule** from section 3 (`allow read, update: if request.auth != null;`).
4. **Test.** Visit `/admin/orders`, sign in with that account — all orders appear,
   from every device. Tap **Confirm**/**Cancel** to update status and message the
   customer on WhatsApp.

Notes:
- Email/Password sign-in works from any domain, so no "authorized domains" change
  is needed for GitHub Pages.
- The login is real auth — there's no hardcoded password in the code.
- To revoke access, delete or disable the user in Authentication → Users.

## 7. Turning on App Check enforcement — the order matters

Setting up App Check is covered in `.env.example` (`VITE_RECAPTCHA_SITE_KEY`,
plus `VITE_APPCHECK_DEBUG_TOKEN` for localhost). This section is only about the
last step: pressing **Enforce** in the console, and when it is safe to.

**Why it is last.** Every function in `src/services/*.js` catches, never throws,
and falls back to `localStorage`. So a Firestore request rejected for a missing
App Check token looks *identical to a healthy one*: the site keeps taking orders,
WhatsApp messages keep arriving, `/admin/orders` keeps listing rows from its local
mirror — and nothing reaches the cloud. There is no error banner, because from the
app's point of view nothing failed. Enforce before the client is attesting and you
lose orders quietly, for as long as it takes someone to notice. This is the same
trap CLAUDE.md describes as "a broken Firestore looks exactly like a healthy one".

1. **Put the site key in `.env`** and restart `npm run dev` — Vite reads `.env`
   only at startup. Blank key means App Check never runs, which is safe but
   attests nothing.
2. **Register a debug token** so your own machine attests. Generate it in
   App Check → your app → ⋮ → **Manage debug tokens**, paste it into `.env` as
   `VITE_APPCHECK_DEBUG_TOKEN`. It is per browser profile: a different browser, or
   a cleared profile, needs its own. Never set it in production.
3. **Deploy.** `npm run deploy`. Until the built site carries the key, nothing in
   the metrics reflects real customers.
4. **Wait for the metrics.** App Check → APIs → Cloud Firestore → request metrics,
   until **verified is at or near 100%** and invalid has fallen away. Days, not
   minutes: the window is 7 days, and browsers holding an old cached bundle keep
   arriving unattested until they reload. A high verified percentage *before* a
   deploy is not evidence of anything — it is not your storefront.
5. **Press Enforce, then immediately check a SECOND device.** Open
   `/admin/accounting` somewhere that has never been used for admin before and
   confirm the figures are still there. This is the only check that catches a
   silent break — the machine you enforced from has a `localStorage` mirror and
   will look correct either way.

**To undo:** the same screen has **Unenforce**. Press it first and diagnose
afterwards; every minute of enforced-but-broken is orders written to nothing but
the customer's own browser.

`initializeAppCheck()` lives inside the memoised `getFirebaseApp()` in
`src/firebase.js`, after `initializeApp()` and before any Firestore or Auth
service is handed out. Keep it there — called from a page instead, the first
request leaves without a token. It deliberately never throws.

## The shareable customer link

The `/reviews` page shows a copyable link customers can use:

```
https://your-domain.com/review
```

Click **Copy** to copy it, or **Share** to use the device share sheet (WhatsApp, etc).
While running locally it shows `http://localhost:5173/review`. Once you deploy the site
(Vercel, Netlify, Firebase Hosting), it becomes your real domain.

## Optional: SMS / WhatsApp customer flow

Print the review link as a QR code (any QR generator works) and put it on receipts /
packaging. Customer scans → lands on the form → submits in 30 seconds.
