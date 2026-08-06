import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiChevronRight } from 'react-icons/fi'
import { u } from '../data/images.js'
import { shopProducts, priceLabel } from '../data/products.js'
import { useCart } from '../context/CartContext.jsx'

/**
 * Suggest 3 products related to what's already in the cart.
 * Logic: pick products from the same categories, excluding ones already in cart.
 * Falls back to top-priced (likely most popular) items when cart is empty.
 */
export default function RelatedProducts() {
  const { items, add } = useCart()

  const suggestions = useMemo(() => {
    const cartIds = new Set(items.map((i) => i.id))
    // Strip the "-slice" suffix when matching against the catalog
    const baseCartIds = new Set([...cartIds].map((id) => id.replace(/-slice$/, '')))

    const cartCategories = new Set(
      items
        .map((it) => shopProducts.find((p) => p.id === it.id.replace(/-slice$/, ''))?.category)
        .filter(Boolean)
    )

    let pool = shopProducts.filter((p) => !baseCartIds.has(p.id))

    if (cartCategories.size > 0) {
      const sameCat = pool.filter((p) => cartCategories.has(p.category))
      if (sameCat.length >= 3) pool = sameCat
    }

    // Stable rotation: hash-by-day so suggestions don't shuffle every render.
    const seed = new Date().getDate() + items.length
    const rotated = [...pool.slice(seed % pool.length), ...pool.slice(0, seed % pool.length)]

    return rotated.slice(0, 3)
  }, [items])

  if (suggestions.length === 0) return null

  return (
    <section className="mt-5">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <span className="eyebrow">For You</span>
          <h3 style={{ fontSize: 'clamp(1.2rem, 2.4vw, 1.6rem)', margin: '0.4rem 0 0' }}>
            You might also like
          </h3>
        </div>
      </div>

      <div className="row g-3">
        {suggestions.map((p) => (
          <div className="col-12 col-sm-6 col-md-4" key={p.id}>
            <article
              className="d-flex p-2 h-100"
              style={{
                background: '#fff',
                border: '1px solid var(--cc-border)',
                borderRadius: 12,
                gap: '0.8rem',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 22px rgba(176, 46, 82, 0.12)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <img
                src={u(p.img, 200, 200)}
                alt={p.name}
                loading="lazy"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 8,
                  flexShrink: 0,
                }}
              />
              <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--cc-rose)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                  {p.category}
                </div>
                <div
                  style={{
                    fontFamily: "'Lato', system-ui, sans-serif",
                    fontSize: '0.9rem',
                    color: 'var(--cc-cocoa)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}
                </div>
                {/* The shared rule, not a local guess: this quoted `p.slice`
                    outright, which for the 26 products whose second tier is the
                    *pricier* one (a cookie box of 12) advertised nearly double
                    the entry price — and then the button added the other one. */}
                <div style={{ fontSize: '0.85rem', color: 'var(--cc-rose)', fontWeight: 700, marginTop: 'auto' }}>
                  {priceLabel(p)}
                </div>
              </div>
              {/* A two-tier product can't be added from here — which size, at
                  which price? It used to guess "Whole" and bill that while the
                  card quoted the other tier. Shop opens its size chooser for
                  exactly this case; with no quick view here, the button takes
                  you to the product instead. */}
              {p.slice != null ? (
                <Link
                  to={`/shop?product=${p.id}`}
                  aria-label={`Choose a size for ${p.name}`}
                  title={`Choose a size for ${p.name}`}
                  className="cc-related__btn align-self-center"
                >
                  <FiChevronRight size={18} />
                </Link>
              ) : (
                <button
                  onClick={() => add(p)}
                  aria-label={`Add ${p.name} to cart`}
                  title={`Add ${p.name} to cart`}
                  className="cc-related__btn border-0 align-self-center"
                >
                  <FiPlus size={18} />
                </button>
              )}
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}
