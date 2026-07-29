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

## 2. First run

- `npm run dev` → open `/admin/accounting` → sign in.
- On first visit the **207-item menu** seeds itself into `acc_menu` automatically.
- Data model (all admin-only):
  - `acc_orders` — `{ date, customer, category, item, variant, qty, unitPrice, paid, method, status, notes }`
  - `acc_expenses` — `{ date, vendor, amount, method, notes }`
  - `acc_withdrawals` — `{ date, amount, method, notes }`
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
- **Cash vs Online** tracked on every order/expense/personal-use entry.
- **Dashboard**: overall Money in Hand = Cash in Hand + In Bank (online), plus a
  month picker that recalculates Sales / Received / Expenses / Profit per month.
- **Menu & Prices** tab to edit the catalogue; **Monthly Report** tab.

Separate from the storefront `orders` collection — this is the bakery's private
bookkeeping, not website customer orders.
