import { Link } from 'react-router-dom'
import { FiHome, FiShoppingBag, FiSearch, FiMessageCircle } from 'react-icons/fi'
import HeartDivider from '../components/HeartDivider.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'

/**
 * A real "not here" page.
 *
 * The wildcard route used to render <Home />, so a mistyped or dead link showed
 * the homepage under the wrong URL — the customer thinks the link worked and
 * wonders where the cake went, and a search engine reads it as a soft 404 and
 * indexes the homepage twice over.
 *
 * A genuine 404 status isn't ours to send (GitHub Pages serves 404.html, which
 * is a copy of index.html so deep links can boot the app — that copy is what
 * makes /shop work on a refresh). What we can do is say so plainly and point at
 * the four places anyone who lands here actually wants.
 */
export default function NotFound() {
  usePageMeta({
    title: 'Page not found',
    description: 'That page has moved or never existed. Browse the shop, the menu, or say hello on WhatsApp.',
  })

  return (
    <section className="bg-cream py-5">
      <div className="container py-4 text-center" style={{ maxWidth: 620 }}>
        <span className="eyebrow">404</span>
        <h1 className="section-title mt-2">This page has crumbled</h1>
        <HeartDivider width={180} />
        <p className="mt-3" style={{ maxWidth: 460, margin: '0.75rem auto 0' }}>
          The link you followed has moved or never existed. Nothing is lost —
          everything we bake is a tap away.
        </p>

        <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
          <Link to="/shop" className="btn-rose">
            <FiShoppingBag /> Browse the Shop
          </Link>
          <Link to="/menu" className="btn-outline-rose">
            <FiSearch /> See the Menu
          </Link>
          <Link to="/" className="btn-outline-rose">
            <FiHome /> Back Home
          </Link>
          <Link to="/contact" className="btn-outline-rose">
            <FiMessageCircle /> Ask us
          </Link>
        </div>

        <p className="text-muted small mt-4 mb-0">
          Looking for an order you placed? Track it on{' '}
          <Link to="/track-order">Track Order</Link> with the ID from your WhatsApp receipt.
        </p>
      </div>
    </section>
  )
}
