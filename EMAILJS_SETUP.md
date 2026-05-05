# Email Notification Setup (EmailJS)

Every new order placed via the checkout or chatbot can email you instantly so you
never miss one — even if the customer doesn't follow through with the WhatsApp prompt.

This is the **backup safety net** for the WhatsApp flow: WhatsApp is the primary
channel (still auto-opens on Place Order), email is the redundant backup.

## What you need

- An email account you read often (Gmail, Outlook, etc.)
- A free EmailJS account — https://www.emailjs.com
- 5 minutes

EmailJS free tier = **200 emails/month**. Enough for a small bakery.

## Setup (one-time)

### 1. Create an EmailJS account
Go to https://dashboard.emailjs.com/sign-up and register with the email you want to
receive orders at.

### 2. Add an email service
- Dashboard → **Email Services** → **Add New Service**
- Pick Gmail (or Outlook)
- Sign in to authorize EmailJS to send from your account
- Once connected, copy the **Service ID** (looks like `service_xxxxxxx`)

### 3. Create the email template
- Dashboard → **Email Templates** → **Create New Template**
- Set Subject: `🎂 New Order — {{order_id}}`
- Set From / To Email to your inbox
- Paste this body (HTML or plain text — both work):

```
🎂 NEW ORDER — {{order_id}}
========================================

CUSTOMER
Name:     {{customer_name}}
Phone:    {{customer_phone}}
Email:    {{customer_email}}
Address:  {{customer_address}}

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

- Save the template
- Copy the **Template ID** (looks like `template_xxxxxxx`)

### 4. Get your Public Key
- Dashboard → **Account → General** → **Public Key**
- Copy it (looks like `xxxxxxxxxxxxxxxx`)

### 5. Plug into the site

Open `.env` in the project root (create from `.env.example` if missing) and add:

```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

Restart the dev server (`npm run dev`) — that's it.

## Test it

1. `npm run dev`
2. Add a product → Checkout → fill details → Place Order
3. Within seconds you should get an email with the full order

If nothing arrives:
- Check spam/junk
- Open browser DevTools → Console — look for `[email]` errors
- Verify `.env` values match the EmailJS dashboard exactly (no spaces)

## How it works

1. Customer clicks **Place Order**
2. The site does THREE things in parallel (none blocks the others):
   - **Auto-opens WhatsApp** with the order pre-filled (customer presses Send)
   - **Saves to Firestore** `orders` collection
   - **Sends an email to you** via EmailJS
3. Even if WhatsApp gets blocked or the customer closes the tab, you still get the email.

## Notes on quotas

- Free tier: 200/month
- If you exceed it, EmailJS pauses sends until the next month
- Paid tiers start at $5/mo for 1,000 emails
- For a bakery doing 50–100 orders/month, free is plenty
