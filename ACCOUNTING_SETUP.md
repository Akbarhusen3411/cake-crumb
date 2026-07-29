# Daily Accounting (admin) — setup

The private daily-accounting ERP lives at **`/admin/accounting`** and reuses your
existing bakery **admin login** (same Firebase Email/Password account as
`/admin/orders`).

## 1. Firestore security rules (required for cloud saving)

The accounting data uses four **admin-only** collections. In the
**Firebase console → Firestore → Rules**, add these four lines inside the
existing `match /databases/{database}/documents { … }` block (alongside
`reviews`, `orders`, `tracking`, `newsletter`), then **Publish**:

```
// ── Daily accounting (admin only) ──
match /acc_orders/{doc}      { allow read, write: if request.auth != null; }
match /acc_expenses/{doc}    { allow read, write: if request.auth != null; }
match /acc_withdrawals/{doc} { allow read, write: if request.auth != null; }
match /acc_menu/{doc}        { allow read, write: if request.auth != null; }
match /acc_settings/{doc}    { allow read, write: if request.auth != null; }
```

Same protection as the `orders` collection — sign-in required, never public.
Until these are published, saving falls back to this browser's local storage only
— the app never errors, but the page shows a **"Not saved to the cloud"** warning
and other devices will not see the entry. `acc_settings` is required, not
optional: it holds the "Expense taken for use" figure *and* the marker that stops
the one-time Excel import from re-running (and overwriting your edits) on every
new device.

## 2. The accounting PIN

After you sign in, Daily Accounting asks for a **4–8 digit PIN**. Website Orders
does not — only the money pages.

- **The first time**, the screen says *Choose an accounting PIN*. Type your PIN
  twice and it's saved. Only a scrambled version (a hash) is stored, in
  `acc_settings/main`, so the digits are nowhere in the website's code.
- It asks again **every time the tab is closed and reopened**. The **Lock**
  button beside *Sign out* re-locks without signing out.
- **Forgot it?** In the Firebase console open `acc_settings` → `main`, delete the
  `accPinHash` field, and the *Choose a PIN* screen comes back.

**What this is for, honestly:** it stops someone picking up a phone or laptop
that's already signed in. It is *not* a second password — your admin email and
password remain the real protection, and anyone who has those can see the
figures in the Firebase console anyway. Keep the admin password strong.

## 3. First run

- `npm run dev` → open `/admin/accounting` → sign in.
- On first visit the **207-item menu** seeds itself into `acc_menu` automatically.
- Data model (all admin-only):
  - `acc_orders` — `{ date, customer, category, item, variant, qty, unitPrice, paid, method, status, notes }`
  - `acc_expenses` — `{ date, vendor, amount, method, notes }`
  - `acc_withdrawals` — `{ date, amount, method, notes, direction }` where
    `direction` is `in` (you invest your own money) or `out` (you take money for
    yourself). Missing = `out`.
  - `acc_menu` — `{ category, name, variant, price }`
  - `date` = `YYYY-MM-DD`, `method` = `Cash | Online`, `paid` = boolean.

## Using it on more than one device

The page subscribes to Firestore **live**, so an order typed on the shop PC
appears on the home PC within a second — no refresh needed. If a figure looks
stale, check for the orange "Not saved to the cloud" banner: that means the write
never left the browser, and the two devices are each showing their own local copy.

## Starting a fresh book

At the bottom of `/admin/accounting` there is a collapsed **Danger zone**:

1. **Download backup first** — saves every order, expense, money-taken-out entry
   and the menu as a JSON file. Do this before anything else; there is no undo
   and no server-side backup.
2. **Delete N entries** — type `DELETE` to enable it. It clears `acc_orders`,
   `acc_expenses` and `acc_withdrawals` from the cloud and from every device, and
   resets the old "expense taken for use" note to ₹0.

**Menu & Prices are never touched**, so the New Order form still works straight
after. The Apr–Jul 2026 Excel importer is retired, so nothing refills the book.

## What it does

- **Searchable dropdowns** everywhere — type "cheese" to filter to cheesecakes.
- **New Order**: Category → Item → Size cascade, price auto-fills; qty × price = total.
- **Cash vs Online** tracked on every order/expense/owner-money entry.
- **Dashboard**: five figures and a graph, nothing else —

  - **Money in hand** = invested + earnings − expenses − taken out
  - **Profit** = earnings − expenses

  Money you invest is not earnings, and money you take out is not a cost, so
  neither changes profit. It counts cash, not stock: right after you buy
  material, profit dips and then recovers as those orders sell.
- **Invoice**: every order row has a 🗎 button. It opens a Cake & Crumb invoice
  with the items, prices and total, then **Print / Save as PDF**. In Chrome's
  print dialog pick *Save as PDF* as the destination. There is no GST line (no
  GSTIN); the FSSAI and Udyam numbers are printed on every invoice.
- **My Money (In/Out)**: record it here when you put your own money into the
  bakery, or take money out for yourself. Material you buy with it still has to
  be entered in **Expenses** — the two are separate entries.
- **Menu & Prices** tab to edit the catalogue; **Monthly Report** tab.

Separate from the storefront `orders` collection — this is the bakery's private
bookkeeping, not website customer orders.
