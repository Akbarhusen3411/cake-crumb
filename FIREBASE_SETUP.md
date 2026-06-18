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
      allow create: if
        request.resource.data.name is string &&
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() < 100 &&
        request.resource.data.text is string &&
        request.resource.data.text.size() > 0 &&
        request.resource.data.text.size() < 2000 &&
        request.resource.data.rating is number &&
        request.resource.data.rating >= 1 &&
        request.resource.data.rating <= 5;
      allow read: if true;
      allow update, delete: if false;
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

    // Reviews delete: opt-in.
    // The admin moderation UI (single hardcoded password, sessionStorage gate)
    // is *client-side only*. To actually allow deletes on the database, change
    // the line under /reviews from "allow update, delete: if false;" to:
    //   allow delete: if true;
    // Then any browser session that can match the password can also delete.
    // For real security, swap to Firebase Auth + uid-based rules.
  }
}
```

Click **Publish**. This lets anyone submit a review (with sane validation) and read reviews,
but nobody can edit/delete them from the browser — only you, via Firebase console.

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
