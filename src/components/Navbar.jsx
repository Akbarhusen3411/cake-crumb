import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { FiSearch, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi'
import Logo from './Logo.jsx'
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
              className="d-lg-none border-0 p-0"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              style={{ background: 'transparent', color: 'var(--cc-cocoa)' }}
            >
              {open ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="d-lg-none mt-3 pb-2 d-flex flex-column" style={{ gap: '0.8rem' }}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => 'nav-link-cc' + (isActive ? ' active' : '')}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
