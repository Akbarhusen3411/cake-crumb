import { FiPhone } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_PHONE } from './WhatsAppButton.jsx'
import { COPYRIGHT } from './Footer.jsx'

/**
 * Slim footer used on the cart / checkout / confirm-order routes where the
 * full marketing footer would compete with the buying flow. Just copyright
 * + a WhatsApp ribbon so the page doesn't feel cut off.
 */
export default function MiniFooter() {
  return (
    <footer className="cc-mini-footer">
      <div className="container">
        <div className="cc-mini-footer__row">
          <span className="cc-mini-footer__copy">
            {COPYRIGHT(new Date().getFullYear())}
          </span>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cc-mini-footer__wa"
          >
            <FaWhatsapp size={14} /> +91 91731 83440
          </a>
          <a href="tel:+919173183440" className="cc-mini-footer__call" aria-label="Call Cake & Crumb">
            <FiPhone size={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
