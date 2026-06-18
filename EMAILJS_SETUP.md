# EmailJS Setup — Order Notifications

The site sends **two emails** on every order:

1. **Admin notification** → you (the bakery owner) get a full order receipt
2. **Customer confirmation** → the customer gets a polite "we received your order" (only if they entered an email)

EmailJS free tier is 200 emails/month. Two emails per order = ~100 orders/month free. Plenty for a small bakery.

Both emails are **fire-and-forget** — the order is still saved to Firestore and WhatsApp opens even if email fails. Email is the safety net.

---

## Step 1 — Create the EmailJS account

1. Go to **https://dashboard.emailjs.com/sign-up**
2. Sign up with the email you want to *receive admin notifications at*
3. Verify the email; you land on the dashboard

---

## Step 2 — Connect an email service

This is the inbox EmailJS will *send from*.

1. Dashboard → **Email Services** → **Add New Service**
2. Pick **Gmail** (easiest) or Outlook / Yahoo / custom SMTP
3. Click **Connect Account** and sign in with the same email
4. Approve the OAuth permissions
5. Copy the **Service ID** (looks like `service_abc1234`) — you'll paste it into `.env` later

> Pro tip: use a Gmail address you actually monitor. The connected account is both the *sender* and the *receiver* for admin emails by default.

---

## Step 3 — Create Template #1 (Admin Notification)

This is the email *you* get every time someone orders.

1. Dashboard → **Email Templates** → **Create New Template**
2. **Settings tab:**
   - **Template Name:** `Cake & Crumb — Admin Order`
   - **Subject:** `🎂 New Order — {{order_id}}`
   - **From Name:** `Cake & Crumb Website`
   - **From Email:** (your connected Gmail — auto-filled)
   - **To Email:** **your own inbox** (the address that receives orders)
   - **Reply To:** `{{customer_email}}` (so you can reply directly to the customer)
3. **Content tab** — paste this body (plain text works; HTML is optional):

```
🎂 NEW ORDER — {{order_id}}
=========================================

CUSTOMER
  Name:     {{customer_name}}
  Phone:    {{customer_phone}}
  Email:    {{customer_email}}
  Address:  {{customer_address}}

DELIVERY
  Date:     {{delivery_date}}

ITEMS
{{items}}

TOTALS
  Subtotal: {{subtotal}}
  Delivery: {{delivery}}
  Total:    {{total}}

PAYMENT
  Method:   {{payment_method}}
  UTR:      {{utr}}

NOTES:    {{notes}}
SOURCE:   {{source}}
TIME:     {{order_time}}
```

4. Click **Save**
5. Copy the **Template ID** (looks like `template_abc1234`) — that's `VITE_EMAILJS_TEMPLATE_ID`

---

## Step 4 — Create Template #2 (Customer Confirmation)

This is the friendly email the *customer* gets, addressed to them.

1. Dashboard → **Email Templates** → **Create New Template**
2. **Settings tab:**
   - **Template Name:** `Cake & Crumb — Customer Confirmation`
   - **Subject:** `Your Cake & Crumb order — {{order_id}}`
   - **From Name:** `Cake & Crumb`
   - **From Email:** (your connected Gmail — auto-filled)
   - **To Email:** **`{{to_email}}`** ← important, this is the dynamic placeholder
   - **To Name:** `{{to_name}}`
   - **Reply To:** your own inbox (so customer replies reach you)
3. **Content tab** — paste this body:

```
Hi {{to_name}},

Thank you for ordering from Cake & Crumb! We're so excited to bake for you. ♥

Here's your order summary:

────────────────────────
Order ID:       {{order_id}}
Delivery date:  {{delivery_date}}
────────────────────────

ITEMS
{{items}}

Subtotal:  {{subtotal}}
Delivery:  {{delivery}}
Total:     {{total}}

Payment:   {{payment_method}}

We'll confirm everything on WhatsApp shortly. If you need to make
any changes, just reply to this email or message us on WhatsApp
at +91 91731 83440.

Baked with love,
Cake & Crumb
The gourmet chocolate & berry boutique
```

4. Click **Save**
5. Copy this second **Template ID** — that's `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID`

> **Important:** the To Email field must literally contain `{{to_email}}` (with the curly braces). That tells EmailJS to use the value the site passes in (the customer's email) instead of a fixed inbox.

---

## Step 5 — Get the Public Key

1. Dashboard → **Account** → **General**
2. Find **Public Key** (looks like `xVqXa2QyZ5tWnP0aB`)
3. Copy it

---

## Step 6 — Plug it all into `.env`

Open `.env` in the project root (create from `.env.example` if missing) and fill these four lines:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_CUSTOMER_TEMPLATE_ID=template_yyyyyyy
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

Where:
- `VITE_EMAILJS_SERVICE_ID` — from Step 2
- `VITE_EMAILJS_TEMPLATE_ID` — Admin template, from Step 3
- `VITE_EMAILJS_CUSTOMER_TEMPLATE_ID` — Customer template, from Step 4 *(optional — leave empty to skip the customer email entirely)*
- `VITE_EMAILJS_PUBLIC_KEY` — from Step 5

**Restart the dev server** — Vite only reads `.env` at startup:

```
Ctrl+C
npm run dev
```

For production, also redeploy after editing `.env`:

```
npm run deploy
```

---

## Step 7 — Test it

1. `npm run dev`
2. Add a product → Cart → Checkout
3. Fill the form, **include an email address** in the optional Email field, pick a delivery date, choose COD
4. Click **Place Order**
5. Within 5–15 seconds:
   - **Your inbox** receives the admin email with the full receipt
   - **The customer's inbox** receives the friendly confirmation

If either doesn't arrive:
- Check spam / junk folders
- Open DevTools → Console — look for `[email]` errors (the code logs failures)
- Verify the four env vars match the EmailJS dashboard exactly (no trailing spaces)
- In the EmailJS dashboard, **History** tab shows every send attempt with the error message

---

## How it fits the order flow

```
   ┌─────────────────┐
   │  Place Order    │
   └────────┬────────┘
            │
   ┌────────┴───────────────────────────────────┐
   │                                            │
   ▼                                            ▼
┌──────────┐                          ┌──────────────────┐
│ WhatsApp │  ← opens with order      │ Firestore        │
│ deeplink │     pre-filled            │ saveOrder()      │
└──────────┘                          └──────────────────┘
            │                                            │
            └────────────┬───────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                          ▼
   ┌──────────────────┐      ┌──────────────────┐
   │ Admin email      │      │ Customer email   │
   │ (Template #1)    │      │ (Template #2)    │
   │ → your inbox     │      │ → customer       │
   └──────────────────┘      └──────────────────┘
```

All four side-effects fire in parallel. If WhatsApp gets blocked or the customer closes the tab, **email is your backup** — you still get the order.

---

## Quota notes

- Free tier: **200 emails/month** total (admin + customer combined)
- At 2 emails/order, that's ~100 orders/month before hitting the cap
- If you exceed it, EmailJS pauses sends until the next month — orders still save to Firestore and WhatsApp still works
- Paid tier: $5/mo for 1,000 emails

---

## Available placeholders (both templates)

| Placeholder | Example |
|---|---|
| `{{order_id}}` | `CC-AB-200526-0017` |
| `{{customer_name}}` | `Priya Sharma` |
| `{{customer_phone}}` | `+91 9876543210` |
| `{{customer_email}}` | `priya@example.com` |
| `{{customer_address}}` | `A-7 Sunshine Apt, Mumbai, 400001` |
| `{{delivery_date}}` | `Tue, 21 May 2026` |
| `{{items}}` | Multi-line: `• Pistachio Cheesecake × 1 = ₹470` |
| `{{subtotal}}` | `₹1,250` |
| `{{delivery}}` | `FREE` or `₹49` |
| `{{total}}` | `₹1,250` |
| `{{payment_method}}` | `UPI / QR` or `Cash on Delivery` |
| `{{utr}}` | `123456789012` or `—` |
| `{{notes}}` | `Eggless, write "Happy Birthday Maya"` or `—` |
| `{{source}}` | `checkout` or `chatbot` |
| `{{order_time}}` | `20/05/2026, 10:45:30 am` |
| `{{to_email}}` | (customer email — for Template #2 To Email field) |
| `{{to_name}}` | (customer name — for Template #2 To Name field) |
