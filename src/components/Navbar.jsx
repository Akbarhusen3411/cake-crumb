import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  FiSearch, FiShoppingBag, FiHome, FiInfo, FiBook, FiImage,
  FiStar, FiPhone, FiFacebook, FiInstagram, FiMail, FiX,
} from 'react-icons/fi'
import { FaPinterestP, FaWhatsapp } from 'react-icons/fa'
import Logo from './Logo.jsx'
import SearchOverlay from './SearchOverlay.jsx'
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
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count } = useCart()

  // Lock background scroll while the fullscreen mobile menu is open.
  // Body gets position:fixed via the menu-open class. We save the current
  // scrollY into a ref (NOT into body.style.top, because the cleanup
  // function would clear that before the close branch could read it back —
  // that's what caused the "header missing after tab click" bug).
  const savedScrollY = useRef(0)
  useEffect(() => {
    if (open) {
      savedScrollY.current = window.scrollY
      document.body.style.top = `-${savedScrollY.current}px`
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
      document.body.style.top = ''
      if (savedScrollY.current) {
        window.scrollTo(0, savedScrollY.current)
        savedScrollY.current = 0
      }
    }
    return () => {
      // Defensive unmount cleanup — strip the lock so the body never gets
      // left in position:fixed if the Navbar unmounts mid-open.
      document.body.classList.remove('menu-open')
      document.body.style.top = ''
    }
  }, [open])

  // Basic focus trap for the mobile menu — when open, Tab/Shift+Tab wrap
  // around within the panel; Escape closes the menu.
  const panelRef = useRef(null)
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

  return (
    <header className={`cc-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between">
          {/* LEFT — brand */}
          <Link to="/" aria-label="Cake & Crumb home" style={{ display: 'inline-flex' }}>
            <Logo size="md" />
          </Link>

          {/* RIGHT — nav + icons grouped together */}
          <div className="d-flex align-items-center" style={{ gap: '1.4rem' }}>
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
          </div>{/* /.mobile-menu__inner */}
        </div>{/* /.mobile-menu__panel */}
      </div>{/* /.mobile-menu-overlay */}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
