import { FiLock, FiLogOut, FiRefreshCw } from 'react-icons/fi'
import AdminNav from './AdminNav.jsx'

/**
 * The header both admin pages share: an icon badge, the title with one line
 * of context under it, the page switcher, and the page's tools (refresh,
 * optional lock, sign out) grouped in one framed toolbar.
 *
 * One component on purpose — /admin/orders and /admin/accounting each built
 * their own, and the two drifted until the switcher sat above the title on one
 * page and below it on the other.
 *
 * Laptop: one row, switcher and tools pushed right. Phone: badge · title ·
 * tools on the first row, the switcher as a full-width segmented control under
 * it. The refresh icon spins while `loading`, replacing a "Loading…" word
 * that pushed the row about. Each tool shows only when its handler is passed
 * (the PIN screen has nothing to refresh and is already locked).
 */
export default function AdminPageHead({ icon: Icon, title, sub, loading, onRefresh, onLock, onSignOut }) {
  return (
    <header className="cc-acc-head">
      {Icon ? <span className="cc-acc-head__badge" aria-hidden="true"><Icon /></span> : null}
      <div className="cc-acc-head__text">
        <h1 className="cc-acc-head__title">{title}</h1>
        {sub ? <p className="cc-acc-head__sub">{sub}</p> : null}
      </div>
      <AdminNav className="cc-acc-head__nav" />
      <div className="cc-acc-head__tools" role="toolbar" aria-label="Page tools">
        {onRefresh ? (
          <button type="button" className={`cc-acc-head__tool${loading ? ' cc-acc-head__tool--busy' : ''}`}
            onClick={onRefresh} disabled={loading} aria-busy={loading || undefined}
            title={loading ? 'Loading…' : 'Refresh'} aria-label="Refresh">
            <FiRefreshCw />
          </button>
        ) : null}
        {onLock ? (
          <button type="button" className="cc-acc-head__tool" onClick={onLock}
            title="Lock without signing out — leaving this page locks it too" aria-label="Lock">
            <FiLock />
          </button>
        ) : null}
        <button type="button" className="cc-acc-head__tool cc-acc-head__tool--out" onClick={onSignOut}
          title="Sign out" aria-label="Sign out">
          <FiLogOut />
        </button>
      </div>
    </header>
  )
}
