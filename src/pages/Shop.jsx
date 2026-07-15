import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiHeart, FiShoppingBag, FiX, FiPlus, FiMinus, FiCheckCircle,
  FiShield, FiTruck, FiChevronLeft, FiChevronRight, FiChevronDown, FiSliders,
} from 'react-icons/fi'
import { TbLeaf, TbToolsKitchen2 } from 'react-icons/tb'
import HeartDivider from '../components/HeartDivider.jsx'
import { shopProducts } from '../data/products.js'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'
import { useCart } from '../context/CartContext.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'
import ProductQuickView from '../components/ProductQuickView.jsx'

const CATEGORIES = [
  'All Products', 'Cheesecakes', 'Milk Cakes', 'Sponge Cakes', 'Cookies', 'Cupcakes', 'Bakes', 'Dessert Cups', 'Drinks',
]

// A product's lowest orderable price. `slice` is the SMALLER tier for cheesecakes
// (per-slice) but the LARGER box for cookies/brownies (box of 12), so never assume
// — take the min so "From" prices, filters and sort all use the true entry price.
const lowestPrice = (p) => (p.slice != null ? Math.min(p.price, p.slice) : p.price)

const PRICE_RANGES = [
  { id: 'all',  label: 'All Prices',     test: () => true },
  { id: '0-200',    label: '₹0 – ₹200',  test: (p) => lowestPrice(p) <= 200 },
  { id: '200-500',  label: '₹200 – ₹500',test: (p) => lowestPrice(p) > 200 && lowestPrice(p) <= 500 },
  { id: '500-1000', label: '₹500 – ₹1000',test: (p) => lowestPrice(p) > 500 && lowestPrice(p) <= 1000 },
  { id: '1000+',    label: '₹1000+',     test: (p) => lowestPrice(p) > 1000 },
]

function Radio({ checked, onChange, label }) {
  return (
    <label className="cc-shop-radio">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="cc-shop-radio__input"
      />
      <span className="cc-shop-radio__dot" aria-hidden />
      <span>{label}</span>
    </label>
  )
}

export default function Shop() {
  usePageMeta({
    title: 'Shop',
    description: 'Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.',
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
        image: typeof window !== 'undefined'
          ? new URL(u(p.img, 800, 800), window.location.origin).href
          : u(p.img, 800, 800),
        brand: { '@type': 'Brand', name: 'Cake & Crumb' },
        offers: {
          '@type': 'Offer',
          price: lowestPrice(p),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  })

  // Allow deep-linking to a filtered view, e.g. /shop?category=Cheesecakes (from the Menu page).
  const [searchParams] = useSearchParams()
  const paramCategory = searchParams.get('category')
  const [category, setCategory] = useState(
    paramCategory && CATEGORIES.includes(paramCategory) ? paramCategory : 'All Products'
  )
  const [priceRange, setPriceRange] = useState('all')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [quickView, setQuickView] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false) // mobile-only collapse

  // Count of applied filters — shown on the mobile toggle so users know filters
  // are active even while the panel is collapsed.
  const activeFilterCount =
    (category !== 'All Products' ? 1 : 0) +
    (priceRange !== 'all' ? 1 : 0)
  const { items, count, subtotal, add, increment, decrement, remove, clear } = useCart()

  const PAGE_SIZE = 12

  const filtered = useMemo(() => {
    const priceTest = PRICE_RANGES.find((r) => r.id === priceRange)?.test ?? (() => true)
    let list = shopProducts.filter(
      (p) => (category === 'All Products' || p.category === category) && priceTest(p)
    )
    if (sort === 'lowhigh') list = [...list].sort((a, b) => lowestPrice(a) - lowestPrice(b))
    else if (sort === 'highlow') list = [...list].sort((a, b) => lowestPrice(b) - lowestPrice(a))
    return list
  }, [category, priceRange, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length)

  // Follow the URL ?category= param (e.g. navigating between Menu "View All" links)
  useEffect(() => {
    if (paramCategory && CATEGORIES.includes(paramCategory)) setCategory(paramCategory)
  }, [paramCategory])

  // Reset to page 1 whenever filters/sort change so users don't land on an empty page
  useEffect(() => { setPage(1) }, [category, priceRange, sort])

  const clearFilters = () => {
    setCategory('All Products')
    setPriceRange('all')
  }

  // On phones/tablets the filter sidebar sits ABOVE the product grid, so after
  // picking a filter the user would otherwise have to scroll down to see the
  // results. Auto-scroll to the top of the grid (offset for the sticky header)
  // so the filtered products come straight into view. No-op on desktop (lg+),
  // where the sidebar is beside the grid and already visible.
  const gridRef = useRef(null)
  function scrollToProducts() {
    if (typeof window === 'undefined' || window.innerWidth >= 992) return
    requestAnimationFrame(() => {
      const el = gridRef.current
      if (!el) return
      const headerH =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cc-header-h'), 10) || 82
      const y = el.getBoundingClientRect().top + window.scrollY - headerH - 12
      window.scrollTo({ top: y, behavior: 'smooth' })
    })
  }
  const selectCategory = (c) => { setCategory(c); scrollToProducts() }
  const selectPriceRange = (id) => { setPriceRange(id); scrollToProducts() }

  return (
    <>
      {/* ───── HERO ───── */}
      <section className="cc-shop-hero">
        <div className="container py-4 py-md-5">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="eyebrow mb-3 d-inline-flex">Shop Our Treats</span>
              <h1 className="cc-shop-hero__title">
                Handcrafted<br />Just for You
              </h1>
              <HeartDivider width={50} />
              <p className="cc-shop-hero__lede">
                Discover our handmade cakes, cupcakes, cookies, and chocolates —
                made with the finest ingredients and a whole lot of love.
              </p>
            </div>
            <div className="col-lg-6">
              <img
                src={u(img.heroShop, 1000, 800)}
                alt="Cupcakes on tiered display stands"
                className="cc-shop-hero__img"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── MAIN — filter / grid / cart ───── */}
      <section className="cc-shop-main">
        <div className="container py-4">
          <div className="row g-4">

            {/* FILTER SIDEBAR */}
            <aside className="col-lg-3 col-xl-2">
              <div className="cc-shop-filter">
                <h6 className="cc-shop-filter__heading">Filter By</h6>

                {/* Mobile-only toggle — collapses the long filter list by default */}
                <button
                  type="button"
                  className="cc-shop-filter__toggle"
                  onClick={() => setFiltersOpen((o) => !o)}
                  aria-expanded={filtersOpen}
                >
                  <span className="cc-shop-filter__toggle-label">
                    <FiSliders size={15} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="cc-shop-filter__count">{activeFilterCount}</span>
                    )}
                  </span>
                  <FiChevronDown
                    size={18}
                    className={'cc-shop-filter__chevron' + (filtersOpen ? ' is-open' : '')}
                  />
                </button>

                <div className={'cc-shop-filter__body' + (filtersOpen ? ' is-open' : '')}>
                <div className="cc-shop-filter__group">
                  <div className="cc-shop-filter__label">Category</div>
                  {CATEGORIES.map((c) => (
                    <Radio
                      key={c}
                      label={c}
                      checked={category === c}
                      onChange={() => selectCategory(c)}
                    />
                  ))}
                </div>

                <div className="cc-shop-filter__group">
                  <div className="cc-shop-filter__label">Price Range</div>
                  {PRICE_RANGES.map((r) => (
                    <Radio
                      key={r.id}
                      label={r.label}
                      checked={priceRange === r.id}
                      onChange={() => selectPriceRange(r.id)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="cc-shop-filter__clear"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
                </div>
              </div>
            </aside>

            {/* PRODUCT GRID */}
            <div className="col-lg-6 col-xl-7" ref={gridRef}>
              <div className="cc-shop-toolbar">
                <span className="cc-shop-toolbar__count">
                  Showing {rangeStart}–{rangeEnd} of {filtered.length} results
                </span>
                <label className="cc-shop-toolbar__sort">
                  <span>Sort by:</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="lowhigh">Price: low to high</option>
                    <option value="highlow">Price: high to low</option>
                  </select>
                </label>
              </div>

              {category === 'Cupcakes' && (
                <p className="cc-shop-note">
                  <FiHeart size={12} /> Cupcakes are sold by the box of 6. Add ₹20 for floral or additional decoration.
                </p>
              )}

              <div className="cc-shop-grid">
                {visible.map((p) => (
                  <article key={p.id} className="cc-product-card">
                    <button
                      type="button"
                      onClick={() => setQuickView(p)}
                      aria-label={`View ${p.name}`}
                      className="cc-product-card__img-btn"
                    >
                      <img
                        src={u(p.img, 500, 500)}
                        alt={p.name}
                        loading="lazy"
                      />
                    </button>
                    <div className="cc-product-card__body">
                      <div className="cc-product-card__cat">{p.category}</div>
                      <h6
                        className="cc-product-card__name"
                        onClick={() => setQuickView(p)}
                        title={p.name}
                      >
                        {p.name}
                      </h6>
                      <div className="cc-product-card__price">
                        {p.slice != null ? `From ${inr(lowestPrice(p))}` : inr(p.price)}
                      </div>
                      <button
                        className="cc-product-card__add"
                        onClick={() => {
                          if (p.slice) setQuickView(p)
                          else add(p)
                        }}
                      >
                        <FiShoppingBag size={12} /> Add to Cart
                      </button>
                    </div>
                  </article>
                ))}
                {filtered.length === 0 && (
                  <div className="cc-shop-empty">
                    No products match your filters.
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <nav className="cc-shop-pagination" aria-label="Product pages">
                  <button
                    type="button"
                    className="cc-shop-pagination__btn"
                    onClick={() => setPage((n) => Math.max(1, n - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <FiChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={
                        'cc-shop-pagination__btn cc-shop-pagination__num' +
                        (n === page ? ' is-active' : '')
                      }
                      onClick={() => setPage(n)}
                      aria-current={n === page ? 'page' : undefined}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="cc-shop-pagination__btn"
                    onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <FiChevronRight size={14} />
                  </button>
                </nav>
              )}
            </div>

            {/* CART SIDEBAR */}
            <aside className="col-lg-3">
              <div className="cc-shop-cart">
                <div className="cc-shop-cart__head">
                  <span className="cc-shop-cart__title">Your Cart ({count})</span>
                  {count > 0 && (
                    <button
                      type="button"
                      className="cc-shop-cart__clear"
                      onClick={clear}
                      aria-label="Clear cart"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>

                {count === 0 && <p className="cc-shop-cart__empty">Your cart is empty.</p>}

                {items.map((c) => (
                  <div key={c.id} className="cc-shop-cart__item">
                    <img
                      src={u(c.img, 200, 200)}
                      alt=""
                      className="cc-shop-cart__item-img"
                    />
                    <div className="cc-shop-cart__item-body">
                      <div className="cc-shop-cart__item-top">
                        <strong className="cc-shop-cart__item-name">{c.name}</strong>
                        <button
                          type="button"
                          onClick={() => remove(c.id)}
                          aria-label="Remove"
                          className="cc-shop-cart__item-remove"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                      <div className="cc-shop-cart__item-price">{inr(c.price)}</div>
                      <div className="cc-shop-cart__qty">
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

                <div className="cc-shop-cart__subtotal">
                  <span>SUBTOTAL</span>
                  <strong>{inr(subtotal)}</strong>
                </div>
                <p className="cc-shop-cart__note">
                  Home delivery charges confirmed on WhatsApp. Pickup is free.
                </p>
                <Link
                  to="/cart"
                  className="btn-rose w-100 justify-content-center mb-2"
                  style={{ pointerEvents: count === 0 ? 'none' : 'auto', opacity: count === 0 ? 0.5 : 1 }}
                  tabIndex={count === 0 ? -1 : undefined}
                  aria-disabled={count === 0}
                >
                  <FiShoppingBag size={14} /> View Cart
                </Link>
                <Link
                  to="/checkout"
                  className="btn-outline-rose w-100 justify-content-center"
                  style={{ pointerEvents: count === 0 ? 'none' : 'auto', opacity: count === 0 ? 0.5 : 1 }}
                  tabIndex={count === 0 ? -1 : undefined}
                  aria-disabled={count === 0}
                >
                  <FiCheckCircle size={14} /> Checkout
                </Link>

                {/* Need Something Special card */}
                <div className="cc-shop-special">
                  <span className="cc-shop-special__icon">
                    <FiHeart size={16} />
                  </span>
                  <h6 className="cc-shop-special__title">Need Something Special?</h6>
                  <p className="cc-shop-special__text">
                    We love creating custom treats for your special moments.
                  </p>
                  <Link to="/contact" className="cc-shop-special__btn">
                    Place Custom Order
                  </Link>
                </div>

                {/* Trust strip */}
                <ul className="cc-shop-trust">
                  {[
                    { Icon: FiHeart, title: 'Handcrafted with Love', text: 'Made in small batches with care.' },
                    { Icon: TbLeaf,  title: 'Premium Ingredients',   text: 'We use only the finest ingredients.' },
                    { Icon: FiShield,title: 'Secure Packaging',      text: 'Your treats arrive fresh and beautiful.' },
                  ].map((it, i) => (
                    <li key={i} className="cc-shop-trust__row">
                      <span className="cc-shop-trust__icon"><it.Icon size={14} /></span>
                      <div>
                        <div className="cc-shop-trust__title">{it.title}</div>
                        <p className="cc-shop-trust__text">{it.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ───── BOTTOM PROMISE STRIP — 4 across ───── */}
      <section className="cc-shop-promise">
        <div className="container py-4 py-md-5">
          <div className="feature-row">
            {[
              { Icon: TbLeaf,           title: 'Fresh & Quality',  text: 'We source the freshest ingredients for the best taste and quality.' },
              { Icon: TbToolsKitchen2,  title: 'Made to Order',    text: 'Every treat is made to order just for you.' },
              { Icon: FiTruck,          title: 'On-Time Delivery', text: 'We deliver your treats fresh and on time, every time.' },
              { Icon: FiShield,         title: 'Safe & Secure',    text: 'Secure checkout and careful packaging always.' },
            ].map((it, i) => (
              <div key={i} className="feature-cell text-center cc-shop-promise__cell">
                <span className="cc-features-card__icon cc-features-card__icon--lg">
                  <it.Icon size={22} />
                </span>
                <div className="cc-features-card__heading mt-3">{it.title}</div>
                <p className="cc-features-card__text mt-1">{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  )
}
