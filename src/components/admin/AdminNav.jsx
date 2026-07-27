import { Link, useLocation } from 'react-router-dom'
import { FiClipboard, FiDollarSign } from 'react-icons/fi'

// Shared sub-navigation shown on both admin pages so the dashboard feels like
// one place with two sections. Not linked anywhere public.
const LINKS = [
  { to: '/admin/orders', label: 'Website Orders', Icon: FiClipboard },
  { to: '/admin/accounting', label: 'Daily Accounting', Icon: FiDollarSign },
]

export default function AdminNav() {
  const { pathname } = useLocation()
  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {LINKS.map(({ to, label, Icon }) => {
        const on = pathname === to || pathname.endsWith(to)
        return (
          <Link
            key={to}
            to={to}
            style={{
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
              border: '1px solid var(--cc-rose-soft, #d7a7ae)', borderRadius: 999, padding: '6px 16px',
              fontWeight: 700, fontSize: '0.85rem',
              background: on ? 'var(--cc-rose, #e0617a)' : '#fff',
              color: on ? '#fff' : 'var(--cc-cocoa, #5b3e36)',
            }}
          >
            <Icon size={15} /> {label}
          </Link>
        )
      })}
    </div>
  )
}
