import emailjs from '@emailjs/browser'

const SERVICE_ID           = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID          = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID
const PUBLIC_KEY           = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const isEmailNotifyEnabled =
  Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

export const isCustomerEmailEnabled =
  Boolean(SERVICE_ID && CUSTOMER_TEMPLATE_ID && PUBLIC_KEY)

let inited = false
function ensureInit() {
  if (inited || !PUBLIC_KEY) return
  emailjs.init({ publicKey: PUBLIC_KEY })
  inited = true
}

function buildParams(order) {
  const c = order.customer || {}
  const t = order.totals || {}
  const itemsText = (order.items || [])
    .map((i) => `• ${i.name} × ${i.qty} = ₹${(i.price || 0) * (i.qty || 1)}`)
    .join('\n')

  return {
    order_id: order.orderId || '',
    customer_name: c.name || '',
    customer_phone: c.phone ? `+91 ${c.phone}` : '',
    customer_email: c.email || '—',
    customer_address: [c.address, c.city, c.pincode].filter(Boolean).join(', '),
    items: itemsText,
    subtotal: `₹${t.subtotal || 0}`,
    delivery: t.delivery === 0 ? 'FREE' : `₹${t.delivery || 0}`,
    total: `₹${t.total || 0}`,
    payment_method: order.payment?.method === 'upi' ? 'UPI / QR' : 'Cash on Delivery',
    utr: order.payment?.utr || '—',
    delivery_date: order.deliveryDate || '—',
    notes: order.notes || '—',
    source: order.source || 'checkout',
    order_time: new Date().toLocaleString('en-IN', { hour12: true }),
    // Used by EmailJS dynamic-recipient templates ({{to_email}}, {{to_name}}).
    to_email: c.email || '',
    to_name: c.name || '',
  }
}

/**
 * Notify the bakery admin of a new order.
 * Wire up at https://emailjs.com — set VITE_EMAILJS_* in .env. Template
 * placeholders include {{order_id}}, {{customer_*}}, {{items}}, {{total}},
 * {{payment_method}}, {{utr}}, {{delivery_date}}, {{notes}}, {{order_time}}.
 * Fires-and-forgets — never throws.
 */
export async function sendOrderEmail(order) {
  if (!isEmailNotifyEnabled) {
    if (import.meta.env.DEV) {
      console.warn('[email] admin notification disabled — set VITE_EMAILJS_* in .env.')
    }
    return { ok: false, reason: 'disabled' }
  }
  ensureInit()
  try {
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, buildParams(order))
    return { ok: true, status: res.status }
  } catch (err) {
    console.error('[email] admin notification failed:', err)
    return { ok: false, reason: err.message || 'send failed' }
  }
}

/**
 * Send a confirmation email to the customer (only if they provided one).
 * Requires a separate EmailJS template configured with {{to_email}} as the
 * recipient. Set VITE_EMAILJS_CUSTOMER_TEMPLATE_ID to enable.
 */
export async function sendCustomerConfirmation(order) {
  if (!isCustomerEmailEnabled) return { ok: false, reason: 'disabled' }
  if (!order.customer?.email) return { ok: false, reason: 'no email' }
  ensureInit()
  try {
    const res = await emailjs.send(SERVICE_ID, CUSTOMER_TEMPLATE_ID, buildParams(order))
    return { ok: true, status: res.status }
  } catch (err) {
    console.error('[email] customer confirmation failed:', err)
    return { ok: false, reason: err.message || 'send failed' }
  }
}
