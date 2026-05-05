import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiHeart, FiShoppingBag, FiX, FiPlus, FiMinus, FiCheckCircle,
} from 'react-icons/fi'
import PageHero from '../components/PageHero.jsx'
import { shopProducts } from '../data/products.js'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'
import { useCart } from '../context/CartContext.jsx'

const CATEGORIES = ['All Products', 'Cakes', 'Cupcakes', 'Cookies', 'Chocolates', 'Sweet Treats', 'Gift Boxes']
const PRICES = [
  { id: 'a', label: 'Under ₹500', test: (p) => p < 500 },
  { id: 'b', label: '₹500 – ₹1,000', test: (p) => p >= 500 && p < 1000 },
  { id: 'c', label: '₹1,000 – ₹1,500', test: (p) => p >= 1000 && p < 1500 },
  { id: 'd', label: '₹1,500+', test: (p) => p >= 1500 },
]
const OCCASIONS = ['Birthday', 'Wedding', 'Anniversary', 'Thank You', 'Just Because', 'Other']

export default function Shop() {
  const [category, setCategory] = useState('All Products')
  const [priceIds, setPriceIds] = useState([])
  const [sort, setSort] = useState('featured')
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
        <div className="container">
          <div className="row g-4">
            <aside className="col-12 col-lg-3">
              <div
                className="p-3 p-lg-4"
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

            <div className="col-12 col-lg-6">
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

              <div className="row g-3">
                {filtered.map((p) => (
                  <div className="col-6 col-md-4" key={p.id}>
                    <article className="product-card position-relative h-100">
                      <button
                        aria-label="Favorite"
                        className="position-absolute"
                        style={{
                          top: 8, right: 8, background: '#fff', border: 'none',
                          borderRadius: '50%', width: 30, height: 30,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--cc-rose)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          zIndex: 2,
                        }}
                      >
                        <FiHeart size={14} />
                      </button>
                      {p.badge && (
                        <span
                          className="position-absolute"
                          style={{
                            top: 8, left: 8,
                            background: 'var(--cc-rose)',
                            color: '#fff',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 999,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            zIndex: 2,
                          }}
                        >
                          {p.badge}
                        </span>
                      )}
                      <img src={u(p.img, 500, 500)} alt={p.name} loading="lazy" />
                      <div className="p-3 d-flex flex-column flex-grow-1">
                        <div className="tag-badge mb-1 text-center" style={{ fontSize: '0.65rem' }}>{p.category}</div>
                        <h6 className="text-center" style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
                          {p.name}
                        </h6>

                        {p.slice ? (
                          <>
                            <div
                              className="d-flex justify-content-around mb-2 py-1"
                              style={{
                                background: 'var(--cc-cream)',
                                borderRadius: 8,
                                fontSize: '0.78rem',
                              }}
                            >
                              <div className="text-center">
                                <div style={{ fontSize: '0.6rem', color: 'var(--cc-cocoa-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                  Whole {p.sizeLabel || ''}
                                </div>
                                <div style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(p.price)}</div>
                              </div>
                              <div style={{ width: 1, background: 'var(--cc-border)' }} />
                              <div className="text-center">
                                <div style={{ fontSize: '0.6rem', color: 'var(--cc-cocoa-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                  Slice
                                </div>
                                <div style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(p.slice)}</div>
                              </div>
                            </div>
                            <div className="d-flex gap-2 mt-auto">
                              <button
                                className="btn-outline-rose flex-grow-1 justify-content-center"
                                style={{ fontSize: '0.65rem', padding: '0.4rem 0.5rem' }}
                                onClick={() =>
                                  add({
                                    id: p.id + '-slice',
                                    name: p.name + ' (Slice)',
                                    price: p.slice,
                                    img: p.img,
                                  })
                                }
                              >
                                + Slice
                              </button>
                              <button
                                className="btn-rose flex-grow-1 justify-content-center"
                                style={{ fontSize: '0.65rem', padding: '0.4rem 0.5rem' }}
                                onClick={() => add({ ...p, name: p.name + ' (Whole)' })}
                              >
                                + Whole
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-center mb-2" style={{ color: 'var(--cc-rose)', fontWeight: 700, fontSize: '0.95rem' }}>
                              {inr(p.price)}
                            </div>
                            <button
                              className="btn-rose mt-auto w-100 justify-content-center"
                              style={{ fontSize: '0.7rem', padding: '0.45rem 0.8rem' }}
                              onClick={() => add(p)}
                            >
                              <FiShoppingBag size={12} /> Add to Cart
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="col-12 text-center py-5">
                    <p>No products match your filters.</p>
                  </div>
                )}
              </div>
            </div>

            <aside className="col-12 col-lg-3">
              <div
                className="p-3 p-lg-4"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
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
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
