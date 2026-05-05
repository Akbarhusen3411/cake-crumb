import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const isEmailNotifyEnabled =
  Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

let inited = false
function ensureInit() {
  if (inited || !isEmailNotifyEnabled) return
  emailjs.init({ publicKey: PUBLIC_KEY })
  inited = true
}

/**
 * Notify the bakery admin of a new order.
 *
 * Fires-and-forgets — never throws so it can't block the success page.
 * Wire up at https://emailjs.com:
 *   1. Add a Gmail/Outlook service.
 *   2. Create a template with these placeholders:
 *        {{order_id}}, {{customer_name}}, {{customer_phone}}, {{customer_email}},
 *        {{customer_address}}, {{items}}, {{subtotal}}, {{delivery}}, {{total}},
 *        {{payment_method}}, {{utr}}, {{notes}}, {{source}}, {{order_time}}
 *   3. Drop SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY into .env (VITE_EMAILJS_*).
 */
export async function sendOrderEmail(order) {
  if (!isEmailNotifyEnabled) {
    if (import.meta.env.DEV) {
      console.warn('[email] not configured — set VITE_EMAILJS_* in .env to enable.')
    }
    return { ok: false, reason: 'disabled' }
  }
  ensureInit()

  const c = order.customer || {}
  const t = order.totals || {}
  const itemsText = (order.items || [])
    .map((i) => `• ${i.name} × ${i.qty} = ₹${(i.price || 0) * (i.qty || 1)}`)
    .join('\n')

  const params = {
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
    notes: order.notes || '—',
    source: order.source || 'checkout',
    order_time: new Date().toLocaleString('en-IN', { hour12: true }),
  }

  try {
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params)
    return { ok: true, status: res.status }
  } catch (err) {
    console.error('[email] failed to send order notification:', err)
    return { ok: false, reason: err.message || 'send failed' }
  }
}
