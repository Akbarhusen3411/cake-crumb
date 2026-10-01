import { useEffect, useState, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  FiSearch, FiShoppingBag, FiHome, FiInfo, FiBook, FiImage,
  FiStar, FiPhone, FiInstagram, FiMail, FiX, FiTruck, FiGift, FiChevronRight,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import Logo from './Logo.jsx'
import SearchOverlay from './SearchOverlay.jsx'
import { asset } from '../data/images.js'
import { useCart } from '../context/CartContext.jsx'
import { WHATSAPP_PHONE } from './WhatsAppButton.jsx'
import { OFFERS_ON } from '../data/offers.js'

// Order is the browsing journey, not the sitemap: look at what's on offer
// (Menu), buy it (Shop), then the softer pages. About sits last because it's
// the page a customer reads once, if at all — it used to sit second, ahead of
// everything the bakery actually sells.
const links = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/menu', label: 'Menu', icon: FiBook },
  { to: '/shop', label: 'Shop', icon: FiShoppingBag },
  { to: '/gallery', label: 'Gallery', icon: FiImage },
  { to: '/reviews', label: 'Reviews', icon: FiStar },
  { to: '/contact', label: 'Contact', icon: FiPhone },
  { to: '/about', label: 'About', icon: FiInfo },
]

// The phone menu also links /offers — it was reachable on a phone only through
// the Home page. Mobile only, by the owner's choice: the desktop bar is already
// tight on small laptops. Hidden with everything else when OFFERS_ON is false.
const mobileLinks = OFFERS_ON
  ? [...links.slice(0, 3), { to: '/offers', label: 'Offers', icon: FiGift, tag: 'Free gifts' }, ...links.slice(3)]
  : links

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count } = useCart()

  // Force close on any route change. Defensive — covers the case where a
  // link click slips past the onClick handler.
  const location = useLocation()
  useEffect(() => {
    queueMicrotask(() => setOpen(false))
  }, [location.pathname])

  // Scroll lock — event-based, not style-based. Mutating html.style.overflow
  // or body.style on mobile browsers (especially iOS Safari) snaps scroll
  // position back to 0, which is why opening the menu used to "jump to top".
  // Instead we cancel touchmove/wheel events whose target is outside the
  // panel; the panel's own internal scroll keeps working untouched.
  const panelRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const isOutsidePanel = (target) => !panelRef.current?.contains(target)
    const blockOutside = (e) => { if (isOutsidePanel(e.target)) e.preventDefault() }
    document.addEventListener('touchmove', blockOutside, { passive: false })
    document.addEventListener('wheel', blockOutside, { passive: false })
    return () => {
      document.removeEventListener('touchmove', blockOutside)
      document.removeEventListener('wheel', blockOutside)
    }
  }, [open])

  // Basic focus trap for the mobile menu — when open, Tab/Shift+Tab wrap
  // around within the panel; Escape closes the menu.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    // Focus the close button when menu opens
    const t = setTimeout(() => {
      panelRef.current?.querySelector('.mobile-menu__close')?.focus()
    }, 100)
    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open])

  // Track scroll so the header can deepen its shadow / tint as you scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // A utility row (Track Order · phone) and a green "Order on WhatsApp" button
  // were tried here and taken back out: above a delicate wordmark they read as
  // clutter, and both were already reachable elsewhere — WhatsApp and Track
  // Order sit in the footer on every page, and in the mobile menu. The header
  // stays brand, navigation, search and cart.
  return (
    <header className={`cc-header${scrolled ? ' is-scrolled' : ''}`}>
      {/* py-2, not py-3: the 16px freed goes to .logo-icon, so the mark grows
          without the header moving. Change one and change the other. */}
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between">
          {/* LEFT — brand */}
          <Link to="/" className="cc-brand">
            <Logo size="md" />
          </Link>

          {/* RIGHT — nav + icons grouped together */}
          <div className="d-flex align-items-center cc-header__right" style={{ gap: '1.4rem' }}>
            <nav className="d-none d-lg-flex align-items-center" style={{ gap: '0.35rem' }}>
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

            <div className="d-flex align-items-center" style={{ gap: '1.1rem' }}>
              <button
                type="button"
                aria-label="Search products"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen(true)}
                className="border-0 p-0 cc-cart-link"
                // A 20px glyph gave a 20x20 target, under the 24x24 minimum and
                // close to the cart beside it. The box grows, the glyph doesn't.
                style={{
                  background: 'transparent', color: 'var(--cc-cocoa)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 24, minHeight: 24,
                }}
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
                {count > 0 && (
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
                )}
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
      </div>

      {/* Glassmorphism mobile menu — centered panel over a blurred backdrop.
          Tap outside the panel (or the X) to close. */}
      <div
        className={`mobile-menu-overlay d-lg-none${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      >
        <div ref={panelRef} className="mobile-menu__panel" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="mobile-menu__close"
          >
            <FiX size={18} />
          </button>
          <div className="mobile-menu__inner">
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

          {/* Nav links — icon, label, an optional tag, and a chevron so each row
              reads as tappable. The current page carries a rose bar + solid icon. */}
          <nav className="mobile-menu__nav" aria-label="Mobile navigation">
            {mobileLinks.map((l) => {
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
                  <span className="mobile-menu__link-label">{l.label}</span>
                  {l.tag && <span className="mobile-menu__tag">{l.tag}</span>}
                  <FiChevronRight size={16} className="mobile-menu__chev" aria-hidden />
                </NavLink>
              )
            })}
          </nav>

          {/* Footer block — one row of actions.
              Four in a row. Track Order used to be a full-width nav link up
              with Home/Menu/Shop, where it sat oddly — it is not a place to
              browse, it is a thing you do once, after ordering. As an icon
              beside the other actions it stops competing with the nav.

              The big green "+91 …" button that used to sit under this row is
              gone: with WhatsApp in the row it was the same destination twice
              in the same block. The number itself is still on every page, in
              the footer and on /contact. */}
          <div className="mobile-menu__footer">
            {/* Each icon carries a caption — the truck alone did not say "Track
                order". The caption is the link's name, so no aria-label (one
                that differs from the visible words fails WCAG 2.5.3). */}
            <div className="mobile-menu__socials">
              <a href="https://www.instagram.com/cake_and_crumb_1/" target="_blank" rel="noopener noreferrer" className="mobile-menu__social-item">
                <span className="mobile-menu__social"><FiInstagram size={15} aria-hidden /></span>
                <span className="mobile-menu__social-label">Instagram</span>
              </a>
              <a href="mailto:cakeandcrumb.in@gmail.com" className="mobile-menu__social-item">
                <span className="mobile-menu__social"><FiMail size={15} aria-hidden /></span>
                <span className="mobile-menu__social-label">Email</span>
              </a>
              <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer" className="mobile-menu__social-item mobile-menu__social-item--wa">
                <span className="mobile-menu__social"><FaWhatsapp size={15} aria-hidden /></span>
                <span className="mobile-menu__social-label">WhatsApp</span>
              </a>
              <Link to="/track-order" onClick={() => setOpen(false)} className="mobile-menu__social-item">
                <span className="mobile-menu__social"><FiTruck size={15} aria-hidden /></span>
                <span className="mobile-menu__social-label">Track order</span>
              </Link>
            </div>
          </div>
          </div>{/* /.mobile-menu__inner */}
        </div>{/* /.mobile-menu__panel */}
      </div>{/* /.mobile-menu-overlay */}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
