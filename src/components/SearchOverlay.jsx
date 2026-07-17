import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiX, FiShoppingBag } from 'react-icons/fi'
import { shopProducts } from '../data/products.js'
import { inr } from '../data/format.js'
import { u } from '../data/images.js'

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

  // Lock background scroll when open + clear query when opening.
  // setQuery is deferred to a microtask so the effect body itself doesn't
  // do a synchronous setState (which lint flags as cascading-render risk).
  useEffect(() => {
    if (!open) return
    document.body.classList.add('search-open')
    queueMicrotask(() => setQuery(''))
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('search-open')
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const results = useMemo(() => filterProducts(query), [query])

  return (
    <div
      className={`cc-search-overlay${open ? ' is-open' : ''}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
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
                to={`/shop?category=${encodeURIComponent(p.category)}`}
                onClick={onClose}
                className="cc-search-overlay__result"
              >
                <img src={u(p.img, 160, 160)} alt="" className="cc-search-overlay__thumb" />
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
  )
}
