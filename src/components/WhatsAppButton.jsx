import { useLocation } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'

// Phone in E.164 (no plus, no spaces).
export const WHATSAPP_PHONE = '919081668490'

export function buildWhatsAppLink(message = '') {
  const text = encodeURIComponent(message || "Hi! I'd like to order from Cake & Crumb.")
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`
}

const HIDDEN_ROUTES = ['/checkout']

export default function WhatsAppButton() {
  const { pathname } = useLocation()
  // Strip the Vite base if present (e.g. /cake-crumb/checkout → /checkout).
  const route = pathname.replace(/^\/cake-crumb/, '') || '/'
  if (HIDDEN_ROUTES.includes(route)) return null

  return (
    <a
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="wa-float"
    >
      <FaWhatsapp size={28} />
      <span className="wa-label">Order on WhatsApp</span>
    </a>
  )
}
