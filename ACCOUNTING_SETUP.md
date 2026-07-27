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
(the app never errors — it just won't sync to the cloud).

## 2. First run

- `npm run dev` → open `/admin/accounting` → sign in.
- On first visit the **207-item menu** seeds itself into `acc_menu` automatically.
- Data model (all admin-only):
  - `acc_orders` — `{ date, customer, category, item, variant, qty, unitPrice, paid, method, status, notes }`
  - `acc_expenses` — `{ date, vendor, amount, method, notes }`
  - `acc_withdrawals` — `{ date, amount, method, notes }`
  - `acc_menu` — `{ category, name, variant, price }`
  - `date` = `YYYY-MM-DD`, `method` = `Cash | Online`, `paid` = boolean.

## What it does

- **Searchable dropdowns** everywhere — type "cheese" to filter to cheesecakes.
- **New Order**: Category → Item → Size cascade, price auto-fills; qty × price = total.
- **Cash vs Online** tracked on every order/expense/personal-use entry.
- **Dashboard**: overall Money in Hand = Cash in Hand + In Bank (online), plus a
  month picker that recalculates Sales / Received / Expenses / Profit per month.
- **Menu & Prices** tab to edit the catalogue; **Monthly Report** tab.

Separate from the storefront `orders` collection — this is the bakery's private
bookkeeping, not website customer orders.
