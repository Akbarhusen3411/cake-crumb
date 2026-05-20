import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiHeart, FiShoppingBag, FiX, FiPlus, FiMinus, FiCheckCircle,
  FiShield, FiTruck, FiAward,
} from 'react-icons/fi'
import { TbLeaf } from 'react-icons/tb'
import PageHero from '../components/PageHero.jsx'
import { shopProducts } from '../data/products.js'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'
import { useCart } from '../context/CartContext.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'
import ProductQuickView from '../components/ProductQuickView.jsx'

const CATEGORIES = [
  'All Products',
  'Cheesecakes',
  'Milk Cakes',
  'Cookies',
  'Cupcakes',
  'Bakes',
  'Platters',
  'Dessert Cups',
  'Drinks',
]
const PRICES = [
  { id: 'a', label: 'Under ₹500', test: (p) => p < 500 },
  { id: 'b', label: '₹500 – ₹1,000', test: (p) => p >= 500 && p < 1000 },
  { id: 'c', label: '₹1,000 – ₹1,500', test: (p) => p >= 1000 && p < 1500 },
  { id: 'd', label: '₹1,500+', test: (p) => p >= 1500 },
]
const OCCASIONS = ['Birthday', 'Wedding', 'Anniversary', 'Thank You', 'Just Because', 'Other']

export default function Shop() {
  usePageMeta({
    title: 'Shop',
    description: 'Order from our full menu — 23 cheesecake flavours, 7 milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.',
  })
  useJsonLd('shop-products', {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cake & Crumb — Shop',
    numberOfItems: shopProducts.length,
    itemListElement: shopProducts.slice(0, 30).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        category: p.category,
        description: `${p.name} — handcrafted ${p.category.toLowerCase()} from Cake & Crumb. Pre-order at least 1 day in advance.`,
        image: typeof window !== 'undefined'
          ? new URL(u(p.img, 800, 800), window.location.origin).href
          : u(p.img, 800, 800),
        brand: { '@type': 'Brand', name: 'Cake & Crumb' },
        offers: {
          '@type': 'Offer',
          price: p.slice || p.price,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Bakery', name: 'Cake & Crumb' },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '245',
        },
      },
    })),
  })
  const [category, setCategory] = useState('All Products')
  const [priceIds, setPriceIds] = useState([])
  const [sort, setSort] = useState('featured')
  const [quickView, setQuickView] = useState(null) // product object or null
  const { items, count, subtotal, add, increment, decrement, remove, clear } = useCart()

  const filtered = useMemo(() => {
    let list = shopProducts.filter((p) => {
      const okCat = category === 'All Products' || p.category === category
      const okPrice =
        priceIds.length === 0 ||
        priceIds.some((id) => PRICES.find((x) => x.id === id)?.test(p.price))
      return okCat && okPrice
    })
    if (sort === 'lowhigh') list = [...list].sort((a, b) => a.price - b.price)
    else if (sort === 'highlow') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [category, priceIds, sort])

  return (
    <>
      <PageHero
        eyebrow="Shop Our Treats"
        title={<>Handcrafted<br />Just for You</>}
        text="Discover our handmade cakes, cupcakes, cookies, and chocolates — made with the finest ingredients and a whole lot of love."
        cta={null}
        image={u(img.pinkDripCake2, 1000, 750)}
        imageAlt="Pink drip cake"
      />

      <section className="py-5">
        <div className="container-fluid px-2 px-md-3 px-lg-4">
          <div className="row g-3">
            <aside className="col-12 col-lg-2">
              {/* Mobile: horizontal category chips + collapsible Price/Occasion */}
              <div className="cc-filter-mobile d-lg-none">
                <div className="cc-filter-mobile__chips" role="radiogroup" aria-label="Category">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={category === c}
                      className={'cc-chip' + (category === c ? ' is-active' : '')}
                      onClick={() => setCategory(c)}
                    >
                      {c === 'All Products' ? 'All' : c}
                    </button>
                  ))}
                </div>

                <details className="cc-filter-acc">
                  <summary>Price Range {priceIds.length > 0 && <span className="cc-filter-acc__count">{priceIds.length}</span>}</summary>
                  <div className="cc-filter-acc__body">
                    {PRICES.map((p) => (
                      <label key={p.id} className="filter-row">
                        <input
                          type="checkbox"
                          checked={priceIds.includes(p.id)}
                          onChange={(e) =>
                            setPriceIds((prev) =>
                              e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id)
                            )
                          }
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </details>

                <details className="cc-filter-acc">
                  <summary>Occasion</summary>
                  <div className="cc-filter-acc__body">
                    {OCCASIONS.map((o) => (
                      <label key={o} className="filter-row">
                        <input type="checkbox" />
                        {o}
                      </label>
                    ))}
                  </div>
                </details>

                {(category !== 'All Products' || priceIds.length > 0) && (
                  <button
                    type="button"
                    className="cc-filter-clear"
                    onClick={() => { setCategory('All Products'); setPriceIds([]) }}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Desktop: original sidebar layout */}
              <div
                className="d-none d-lg-block p-3 p-lg-4"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
              >
                <div className="tag-badge mb-3">Filter By</div>

                <div className="mb-4">
                  <div className="filter-label">Category</div>
                  {CATEGORIES.map((c) => (
                    <label key={c} className="filter-row">
                      <input
                        type="radio"
                        name="cat"
                        checked={category === c}
                        onChange={() => setCategory(c)}
                      />
                      {c}
                    </label>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="filter-label">Price Range</div>
                  {PRICES.map((p) => (
                    <label key={p.id} className="filter-row">
                      <input
                        type="checkbox"
                        checked={priceIds.includes(p.id)}
                        onChange={(e) =>
                          setPriceIds((prev) =>
                            e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id)
                          )
                        }
                      />
                      {p.label}
                    </label>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="filter-label">Occasion</div>
                  {OCCASIONS.map((o) => (
                    <label key={o} className="filter-row">
                      <input type="checkbox" />
                      {o}
                    </label>
                  ))}
                </div>

                <button
                  className="btn-outline-rose w-100 justify-content-center"
                  onClick={() => {
                    setCategory('All Products')
                    setPriceIds([])
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </aside>

            <div className="col-12 col-lg-8">
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                <div style={{ fontSize: '0.85rem' }}>
                  Showing 1–{filtered.length} of {shopProducts.length} results
                </div>
                <div className="d-flex align-items-center" style={{ gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span>Sort by:</span>
                  <select
                    className="cc-input"
                    style={{ width: 'auto', padding: '0.35rem 0.6rem' }}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="lowhigh">Price: low to high</option>
                    <option value="highlow">Price: high to low</option>
                  </select>
                </div>
              </div>

              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-3 row-cols-xl-4 g-2 g-md-3">
                {filtered.map((p) => {
                  const hasNuts = p.allergens?.includes('contains-nuts')
                  const isEggless = p.allergens?.includes('eggless')
                  return (
                    <div className="col" key={p.id}>
                      <article className="shop-card-mini">
                        {p.badge && (
                          <span className="shop-card-mini__badge">{p.badge}</span>
                        )}
                        {(hasNuts || isEggless) && (
                          <span
                            className="shop-card-mini__diet"
                            style={{
                              background: hasNuts ? 'rgba(184, 134, 11, 0.85)' : 'rgba(34, 139, 81, 0.85)',
                            }}
                            title={hasNuts ? 'Contains nuts' : 'Eggless'}
                          >
                            {hasNuts ? '🌰' : '🌱'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setQuickView(p)}
                          aria-label={`View ${p.name}`}
                          className="shop-card-mini__img-btn"
                        >
                          <img
                            src={u(p.img, 500, 500)}
                            alt={p.name}
                            loading="lazy"
                          />
                        </button>
                        <div className="shop-card-mini__body text-center">
                          <div className="shop-card-mini__cat">{p.category}</div>
                          <h6
                            className="shop-card-mini__name"
                            onClick={() => setQuickView(p)}
                            title={p.name}
                          >
                            {p.name}
                          </h6>
                          <div className="shop-card-mini__price">
                            {p.slice ? `From ${inr(p.slice)}` : inr(p.price)}
                          </div>
                          <button
                            aria-label={`Add ${p.name} to cart`}
                            className="shop-card-mini__add-full"
                            onClick={() => {
                              if (p.slice) setQuickView(p)
                              else add(p)
                            }}
                          >
                            <FiShoppingBag size={12} /> Add to Cart
                          </button>
                        </div>
                      </article>
                    </div>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="col-12 text-center py-5">
                    <p>No products match your filters.</p>
                  </div>
                )}
              </div>
            </div>

            <aside className="col-12 col-lg-2">
              <div
                className="p-3 sticky-lg-top"
                style={{
                  background: '#fff',
                  border: '1px solid var(--cc-border)',
                  borderRadius: 14,
                  top: 150,
                  marginTop: 20,
                  maxHeight: 'calc(100vh - 170px)',
                  overflowY: 'auto',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="tag-badge">Your Cart ({count})</div>
                  {count > 0 && (
                    <button
                      className="border-0 bg-transparent"
                      aria-label="Clear cart"
                      onClick={clear}
                      style={{ color: 'var(--cc-cocoa-soft)' }}
                    >
                      <FiX />
                    </button>
                  )}
                </div>

                {count === 0 && <p style={{ fontSize: '0.85rem' }}>Your cart is empty.</p>}

                {items.map((c) => (
                  <div key={c.id} className="d-flex mb-3" style={{ gap: '0.7rem' }}>
                    <img
                      src={u(c.img, 200, 200)}
                      alt=""
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    />
                    <div className="flex-grow-1" style={{ fontSize: '0.85rem', minWidth: 0 }}>
                      <div className="d-flex justify-content-between">
                        <strong style={{ color: 'var(--cc-cocoa)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</strong>
                        <button
                          className="border-0 bg-transparent p-0"
                          onClick={() => remove(c.id)}
                          aria-label="Remove"
                          style={{ color: 'var(--cc-cocoa-soft)', flexShrink: 0, marginLeft: 6 }}
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                      <div style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(c.price)}</div>
                      <div className="d-inline-flex align-items-center mt-1" style={{ gap: '0.4rem' }}>
                        <button className="qty-btn" onClick={() => decrement(c.id)} aria-label="Decrease">
                          <FiMinus size={12} />
                        </button>
                        <span>{c.qty}</span>
                        <button className="qty-btn" onClick={() => increment(c.id)} aria-label="Increase">
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <hr style={{ borderColor: 'var(--cc-border)' }} />
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.9rem' }}>
                  <span>Subtotal</span>
                  <strong style={{ color: 'var(--cc-cocoa)' }}>{inr(subtotal)}</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--cc-cocoa-soft)' }}>
                  Taxes and delivery calculated at checkout.
                </p>
                <Link
                  to="/cart"
                  className="btn-rose w-100 justify-content-center mb-2"
                  style={{ pointerEvents: count === 0 ? 'none' : 'auto', opacity: count === 0 ? 0.5 : 1 }}
                >
                  <FiShoppingBag size={14} /> View Cart
                </Link>
                <Link
                  to="/checkout"
                  className="btn-outline-rose w-100 justify-content-center"
                  style={{ pointerEvents: count === 0 ? 'none' : 'auto', opacity: count === 0 ? 0.5 : 1 }}
                >
                  <FiCheckCircle size={14} /> Checkout
                </Link>

                <div className="mt-4 p-3" style={{ background: 'var(--cc-cream)', borderRadius: 12 }}>
                  <div className="tag-badge mb-1">
                    <FiHeart size={12} style={{ marginRight: 4 }} /> Need Something Special?
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: '0.3rem 0 0.6rem' }}>
                    We love creating custom treats for your special moments.
                  </p>
                  <Link to="/contact" className="btn-outline-rose" style={{ fontSize: '0.7rem' }}>
                    Place Custom Order
                  </Link>
                </div>

                {/* Trust strip — vertical mini-list under the custom-order block */}
                <ul className="list-unstyled mt-4 mb-0">
                  {[
                    { Icon: FiHeart, title: 'Handcrafted with Love', text: 'Made in small batches with care.' },
                    { Icon: TbLeaf, title: 'Premium Ingredients', text: 'We use only the finest ingredients.' },
                    { Icon: FiShield, title: 'Secure Packaging', text: 'Your treats arrive fresh and beautifully.' },
                  ].map((it, i) => (
                    <li
                      key={i}
                      className="d-flex align-items-start"
                      style={{ gap: '0.6rem', padding: '0.6rem 0', borderTop: i ? '1px dashed var(--cc-border)' : 'none' }}
                    >
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: 'var(--cc-blush)',
                          color: 'var(--cc-rose)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <it.Icon size={14} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cc-rose)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.2 }}>
                          {it.title}
                        </div>
                        <p style={{ fontSize: '0.72rem', margin: '0.15rem 0 0', color: 'var(--cc-cocoa-soft)', lineHeight: 1.3 }}>
                          {it.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {/* Bottom-of-page promise strip — 4 across on desktop */}
          <div className="row g-3 g-md-4 mt-2 mt-md-3 pt-3 pt-md-4" style={{ borderTop: '1px solid var(--cc-border)' }}>
            {[
              { Icon: TbLeaf,    title: 'Fresh & Quality',  text: 'We source the freshest ingredients for the best taste and quality.' },
              { Icon: FiAward,   title: 'Made to Order',    text: 'Every treat is made to order just for you.' },
              { Icon: FiTruck,   title: 'On-Time Delivery', text: 'We deliver your treats fresh and on time, every time.' },
              { Icon: FiShield,  title: 'Safe & Secure',    text: 'Secure checkout and careful packaging always.' },
            ].map((it, i) => (
              <div key={i} className="col-6 col-lg-3 text-center px-3">
                <span
                  className="d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '1.5px solid var(--cc-rose)',
                    color: 'var(--cc-rose)',
                  }}
                >
                  <it.Icon size={20} />
                </span>
                <div className="tag-badge mb-1">{it.title}</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--cc-cocoa-soft)', maxWidth: 220, margin: '0 auto' }}>
                  {it.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  )
}
