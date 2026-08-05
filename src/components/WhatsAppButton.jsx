/**
 * WhatsApp link helpers. Despite the file name there is no longer a button
 * component here: a floating `.wa-float` FAB existed but nothing ever rendered
 * it, and bottom-right is already the chat launcher's corner — a second 60px
 * green circle would sit on top of it on a phone. The chat bot hands off to
 * WhatsApp itself, and Contact and FAQ both carry explicit WhatsApp links.
 *
 * The file keeps its name because five modules import WHATSAPP_PHONE from it.
 */

// Phone in E.164 (no plus, no spaces). Primary number.
export const WHATSAPP_PHONE = '919173183440'

export function buildWhatsAppLink(message = '') {
  const text = encodeURIComponent(message || "Hi! I'd like to order from Cake & Crumb.")
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`
}
