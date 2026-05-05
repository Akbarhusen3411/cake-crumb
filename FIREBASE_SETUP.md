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
