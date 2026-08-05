import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { FiSearch, FiX, FiShoppingBag } from 'react-icons/fi'
import { shopProducts } from '../data/products.js'
import { inr } from '../data/format.js'
import { u, srcSet } from '../data/images.js'

const MAX_RESULTS = 12

function filterProducts(query) {
  const q = query.trim().toLowerCase()
  if (!q) return shopProducts.slice(0, MAX_RESULTS)
  return shopProducts
    .filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    })
    .slice(0, MAX_RESULTS)
}

/**
 * Full-screen product search overlay. Opens from the navbar search icon,
 * closes on Escape, backdrop click, or pressing the X.
 */
export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const panelRef = useRef(null)

  // Clear the query on open + close on Escape.
  // setQuery is deferred to a microtask so the effect body itself doesn't
  // do a synchronous setState (which lint flags as cascading-render risk).
  useEffect(() => {
    if (!open) return
    queueMicrotask(() => setQuery(''))
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Scroll lock — event-based, exactly like the mobile menu's. `body { overflow:
  // hidden }` did NOT lock anything here (html carries `overflow-x: clip`, so
  // body's overflow never propagates to the viewport) and it *did* turn body
  // into a scroll container, which un-stuck the sticky header for as long as
  // the overlay was open. Cancelling touchmove/wheel outside the panel locks
  // the page for real and leaves the header alone.
  useEffect(() => {
    if (!open) return
    const blockOutside = (e) => {
      if (!panelRef.current?.contains(e.target)) e.preventDefault()
    }
    document.addEventListener('touchmove', blockOutside, { passive: false })
    document.addEventListener('wheel', blockOutside, { passive: false })
    return () => {
      document.removeEventListener('touchmove', blockOutside)
      document.removeEventListener('wheel', blockOutside)
    }
  }, [open])

  const results = useMemo(() => filterProducts(query), [query])

  // Portalled onto <body>: the overlay is rendered from inside <header
  // class="cc-header">, whose `backdrop-filter` makes it a containing block for
  // `position: fixed` descendants — so `inset: 0` resolved against the HEADER,
  // not the viewport, and the overlay opened at the top of the document instead
  // of on screen. Escaping the header is the fix; don't render it in place.
  return createPortal((
    <div
      className={`cc-search-overlay${open ? ' is-open' : ''}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        ref={panelRef}
        className="cc-search-overlay__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
      >
        <div className="cc-search-overlay__header">
          <FiSearch size={18} className="cc-search-overlay__icon" />
          <input
            type="text"
            autoFocus={open}
            placeholder="Search cheesecakes, cookies, drinks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="cc-search-overlay__input"
            aria-label="Search"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="cc-search-overlay__close"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="cc-search-overlay__hint">
          {query ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Popular treats'}
        </div>

        <div className="cc-search-overlay__results">
          {results.length === 0 ? (
            <div className="cc-search-overlay__empty">
              <p>No products match "{query}".</p>
              <Link to="/shop" onClick={onClose} className="btn-rose mt-2">
                <FiShoppingBag size={14} /> Browse all products
              </Link>
            </div>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                /* Carry the product id, not just its category. Landing on 24
                   cheesecakes after searching "biscoff" leaves the customer to
                   hunt for the one they asked for; Shop reads `product=` and
                   jumps to that exact card with a flash. */
                to={`/shop?category=${encodeURIComponent(p.category)}&product=${encodeURIComponent(p.id)}`}
                onClick={onClose}
                className="cc-search-overlay__result"
              >
                <img
                  src={u(p.img, 160, 160)}
                  srcSet={srcSet(p.img)}
                  sizes="50px"
                  alt=""
                  className="cc-search-overlay__thumb"
                />
                <div className="cc-search-overlay__meta">
                  <div className="cc-search-overlay__cat">{p.category}</div>
                  <div className="cc-search-overlay__name">{p.name}</div>
                </div>
                <strong className="cc-search-overlay__price">
                  {/* Per-piece products (minQty > 1) quote the BOX price here for
                      the same reason the Shop card does — "from ₹25" beside the
                      name "Vanilla Cupcakes" reads as six of them for ₹25. */}
                  {p.slice == null
                    ? inr(p.price)
                    : (p.minQty || 1) > 1
                      ? inr(p.slice)
                      : `from ${inr(Math.min(p.price, p.slice))}`}
                </strong>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  ), document.body)
}
