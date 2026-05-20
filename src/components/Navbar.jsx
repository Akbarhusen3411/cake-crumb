import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { FiSearch, FiShoppingBag } from 'react-icons/fi'
import Logo from './Logo.jsx'
import { asset } from '../data/images.js'
import { useCart } from '../context/CartContext.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/menu', label: 'Menu' },
  { to: '/shop', label: 'Shop' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
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
              className="position-relative"
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
          visibility:hidden in CSS handles a11y when closed (don't use
          aria-hidden, since focus inside a closing overlay triggers a warning). */}
      <div
        className={`mobile-menu-overlay d-lg-none${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      >
        <div className="mobile-menu__header">
          <img
            src={asset('logo-icon.png')}
            alt="Cake & Crumb"
            className="mobile-menu__logo"
          />
          <p className="mobile-menu__quote">
            Baked with love. Loved by you. <span aria-hidden>♥</span>
          </p>
        </div>
        <nav className="mobile-menu__nav" aria-label="Mobile navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => 'mobile-menu__link' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
