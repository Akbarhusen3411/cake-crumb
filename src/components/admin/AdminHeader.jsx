import Logo from '../Logo.jsx'

// App.jsx hides the storefront Navbar on /admin/*, which left the admin tool
// opening on a bare heading against white. This is the same brand bar with
// everything a customer needs stripped out — no nav links, no search, no cart,
// and the mark deliberately isn't a link, so there's no accidental exit from
// the tool into the shop. Private pages only; never rendered on a storefront route.
export default function AdminHeader() {
  return (
    <header className="cc-header cc-admin-header">
      <div className="container py-2 py-md-3">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <Logo size="md" />
          <span className="cc-admin-badge">Admin</span>
        </div>
      </div>
    </header>
  )
}
