import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  FiSearch, FiShoppingBag, FiHome, FiInfo, FiBook, FiImage,
  FiStar, FiPhone, FiFacebook, FiInstagram, FiMail,
} from 'react-icons/fi'
import { FaPinterestP, FaWhatsapp } from 'react-icons/fa'
import Logo from './Logo.jsx'
import { asset } from '../data/images.js'
import { useCart } from '../context/CartContext.jsx'
import { WHATSAPP_PHONE } from './WhatsAppButton.jsx'

const links = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/about', label: 'About', icon: FiInfo },
  { to: '/menu', label: 'Menu', icon: FiBook },
  { to: '/shop', label: 'Shop', icon: FiShoppingBag },
  { to: '/gallery', label: 'Gallery', icon: FiImage },
  { to: '/reviews', label: 'Reviews', icon: FiStar },
  { to: '/contact', label: 'Contact', icon: FiPhone },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()

  // Lock background scroll while the fullscreen mobile menu is open.
  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  return (
    <header
      style={{
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 0 rgba(176, 46, 82, 0.08)',
      }}
    >
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/" aria-label="Cake & Crumb home" style={{ display: 'inline-flex' }}>
            <Logo size="md" />
          </Link>

          <nav className="d-none d-lg-flex align-items-center" style={{ gap: '2.2rem' }}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => 'nav-link-cc' + (isActive ? ' active' : '')}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="d-flex align-items-center" style={{ gap: '1.2rem' }}>
            <button
              aria-label="Search"
              className="border-0 p-0"
              style={{ background: 'transparent', color: 'var(--cc-cocoa)' }}
            >
              <FiSearch size={20} strokeWidth={1.8} />
            </button>
            <Link
              to="/cart"
              aria-label={`Cart (${count} items)`}
              className="position-relative cc-cart-link"
              style={{ color: 'var(--cc-cocoa)' }}
            >
              <FiShoppingBag size={20} strokeWidth={1.8} />
              <span
                className="position-absolute"
                style={{
                  top: -6,
                  right: -8,
                  background: 'var(--cc-rose)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: '50%',
                  minWidth: 17,
                  height: 17,
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {count}
              </span>
            </Link>
            <button
              type="button"
              className={`cc-hamburger d-lg-none${open ? ' is-open' : ''}`}
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span className="cc-hamburger__lines" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen mobile menu overlay — sits at z:49 below the sticky header
          (z:50) so the close button stays clickable. Animated fade + stagger.
          visibility:hidden in CSS handles a11y when closed. */}
      <div
        className={`mobile-menu-overlay d-lg-none${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      >
        <div className="mobile-menu__inner" onClick={(e) => e.stopPropagation()}>
          {/* Brand block — icon + wordmark + tagline + heart divider + quote */}
          <div className="mobile-menu__header">
            <img
              src={asset('logo-icon.png')}
              alt=""
              aria-hidden="true"
              className="mobile-menu__logo"
            />
            <div className="mobile-menu__wordmark">
              CAKE<span className="mobile-menu__amp">&amp;</span>CRUMB
            </div>
            <div className="mobile-menu__tagline">The gourmet chocolate &amp; berry boutique</div>
            <div className="mobile-menu__heart-divider" aria-hidden>
              <span className="mobile-menu__heart-line" />
              <span className="mobile-menu__heart">♥</span>
              <span className="mobile-menu__heart-line" />
            </div>
            <p className="mobile-menu__quote">Baked with love. Loved by you.</p>
          </div>

          {/* Nav links — each with a small rose icon + grow-underline on active */}
          <nav className="mobile-menu__nav" aria-label="Mobile navigation">
            {links.map((l) => {
              const Icon = l.icon
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => 'mobile-menu__link' + (isActive ? ' active' : '')}
                >
                  <span className="mobile-menu__link-icon"><Icon size={15} /></span>
                  <span>{l.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Footer block — socials + WhatsApp CTA */}
          <div className="mobile-menu__footer">
            <div className="mobile-menu__socials">
              <a href="#" aria-label="Facebook" className="mobile-menu__social"><FiFacebook size={15} /></a>
              <a href="#" aria-label="Instagram" className="mobile-menu__social"><FiInstagram size={15} /></a>
              <a href="#" aria-label="Pinterest" className="mobile-menu__social"><FaPinterestP size={13} /></a>
              <a href="mailto:cakeandcrumb.in@gmail.com" aria-label="Email" className="mobile-menu__social"><FiMail size={15} /></a>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-menu__cta"
            >
              <FaWhatsapp size={16} /> +91 90816 68490
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
