import { Link } from 'react-router-dom'
import {
  FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiFacebook,
  FiHome, FiInfo, FiBook, FiShoppingBag, FiImage, FiHelpCircle,
} from 'react-icons/fi'
import { FaPinterestP } from 'react-icons/fa'
import Newsletter from './Newsletter.jsx'
import { asset } from '../data/images.js'

const QUICK_LINKS = [
  { to: '/',        icon: FiHome,         label: 'Home' },
  { to: '/about',   icon: FiInfo,         label: 'About' },
  { to: '/menu',    icon: FiBook,         label: 'Menu' },
  { to: '/shop',    icon: FiShoppingBag,  label: 'Shop' },
  { to: '/gallery', icon: FiImage,        label: 'Gallery' },
  { to: '/faq',     icon: FiHelpCircle,   label: 'FAQ' },
  { to: '/contact', icon: FiPhone,        label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="cc-footer">
      {/* Brand hero — big logo, italic quote, social icons */}
      <div className="cc-footer__hero">
        <div className="container">
          <img
            src={asset('logo-icon.png')}
            alt=""
            aria-hidden="true"
            className="cc-footer__brand-icon"
          />
          <div className="cc-footer__wordmark">
            CAKE<span className="cc-footer__amp">&amp;</span>CRUMB
          </div>
          <p className="cc-footer__tagline">The gourmet chocolate &amp; berry boutique</p>
          <p className="cc-footer__quote">Where every bite tells a sweet story</p>
          <div className="cc-footer__socials">
            <a href="#" className="cc-footer__social" aria-label="Facebook"><FiFacebook size={16} /></a>
            <a href="#" className="cc-footer__social" aria-label="Instagram"><FiInstagram size={16} /></a>
            <a href="#" className="cc-footer__social" aria-label="Pinterest"><FaPinterestP size={14} /></a>
            <a href="#" className="cc-footer__social" aria-label="Email"><FiMail size={16} /></a>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="container cc-footer__info text-center text-lg-start">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <h6 className="cc-footer__heading">Quick Links</h6>
            <ul className="cc-footer__links">
              {QUICK_LINKS.map(({ to, icon: Icon, label }, i) => (
                <li key={to}>
                  {i > 0 && <span className="cc-footer__dot" aria-hidden>•</span>}
                  <Link to={to}>
                    <Icon size={13} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-lg-4">
            <h6 className="cc-footer__heading">Visit Us</h6>
            <ul className="cc-footer__contact">
              <li>
                <span className="cc-footer__contact-icon"><FiPhone size={12} /></span>
                <span className="text-start">+91 90816 68490<br />+91 91731 83440</span>
              </li>
              <li>
                <span className="cc-footer__contact-icon"><FiInstagram size={12} /></span>
                <span>@cake_and_crumb_1</span>
              </li>
              <li>
                <span className="cc-footer__contact-icon"><FiMapPin size={12} /></span>
                <span className="text-start">Self-pickup &amp; home delivery<br />(charges apply)</span>
              </li>
            </ul>
          </div>

          <div className="col-12 col-lg-4">
            <h6 className="cc-footer__heading">Hours</h6>
            <ul className="cc-footer__contact">
              <li>
                <span className="cc-footer__contact-icon"><FiClock size={12} /></span>
                <span className="text-start">Pre-order required<br />Order 1 day in advance</span>
              </li>
            </ul>
            <p className="cc-footer__script">We can't wait to sweeten your day!</p>
          </div>
        </div>
      </div>

      {/* Newsletter band */}
      <div className="cc-footer__newsletter">
        <div className="container">
          <span className="tag-badge">Stay Sweet</span>
          <h5 className="cc-footer__newsletter-heading">Sweet news in your inbox</h5>
          <p className="cc-footer__newsletter-sub">
            Festival specials &amp; treat-of-the-week — never spam.
          </p>
          <div className="cc-footer__newsletter-form">
            <Newsletter compact />
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="cc-footer__copyright">
        © {new Date().getFullYear()} Cake &amp; Crumb · Made with <span aria-hidden>♥</span> in India
      </div>
    </footer>
  )
}
