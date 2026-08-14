import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiHeart, FiShoppingBag, FiX, FiPlus, FiMinus, FiCheckCircle, FiClock,
  FiShield, FiTruck, FiChevronDown, FiSliders,
} from 'react-icons/fi'
import { TbLeaf, TbToolsKitchen2 } from 'react-icons/tb'
import HeartDivider from '../components/HeartDivider.jsx'
import { shopProducts, lowestPrice, isPerPiece, cardPrice, priceLabel, describe, EXTRA_TIERS } from '../data/products.js'
import { img, u, srcSet } from '../data/images.js'
import { inr } from '../data/format.js'
import { useCart } from '../context/CartContext.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'
import ProductQuickView from '../components/ProductQuickView.jsx'
import AllergenTags from '../components/AllergenTags.jsx'

/**
 * The Category radio list.
 *
 * Every entry here is a product `category` EXCEPT the ones named in
 * GROUP_FILTERS below, which are a `group` inside one. 'Cake Pops' is the first
 * of those: it lives inside Bakes, but the bakery sells four flavours of it and
 * customers come looking for "cake pops" by name, so it earns its own filter
 * rather than being buried behind Bakes → scroll → Cake Pops.
 *
 * Kept as a flat list of STRINGS on purpose — `category` state, the
 * `?category=` deep link, `activeFilterCount` and the reset effects all compare
 * plain strings, so promoting a group costs one line here and one match rule
 * below instead of a refactor.
 */
const CATEGORIES = [
  'All Products', 'Cheesecakes', 'Milk Cakes', 'Sponge Cakes', 'Cookies', 'Cupcakes',
  'Bakes', 'Cake Pops', 'Cakesicles', 'Dessert Cups', 'Platters', 'Drinks',
]

// How many products render before "Show more". 120 products at 12 a page meant
// ten numbered pages to see the catalogue; appending keeps the customer's place
// and their scroll position instead of resetting both.
const PAGE_SIZE = 12

/** Filter names that match a `group` instead of a `category`. */
const GROUP_FILTERS = {
  'Cake Pops': (p) => p.group === 'Cake Pops',
  'Cakesicles': (p) => p.group === 'Cakesicles',
}

/** Does this product belong under the selected filter? */
const inFilter = (p, category) =>
  category === 'All Products' ? true
    : GROUP_FILTERS[category] ? GROUP_FILTERS[category](p)
      : p.category === category

// `lowestPrice` and `isPerPiece` now live in data/products.js — they were
// defined here, re-implemented in SearchOverlay and got wrong in
// RelatedProducts, which quoted a cookie box at nearly double its entry price.
// The rules and the reasoning are documented there.
//
// Filters and sort below still use lowestPrice(), while the CARD quotes the box
// for a per-piece product: the true entry price is 2 × the per-piece rate, not
// the box, so a cupcake can appear under a band its card price sits outside.
// That trade is deliberate — see CLAUDE.md.

const PRICE_RANGES = [
  { id: 'all',  label: 'All Prices',     test: () => true },
  { id: '0-200',    label: '₹0 – ₹200',  test: (p) => lowestPrice(p) <= 200 },
  { id: '200-500',  label: '₹200 – ₹500',test: (p) => lowestPrice(p) > 200 && lowestPrice(p) <= 500 },
  { id: '500-1000', label: '₹500 – ₹1000',test: (p) => lowestPrice(p) > 500 && lowestPrice(p) <= 1000 },
  { id: '1000+',    label: '₹1000+',     test: (p) => lowestPrice(p) > 1000 },
]

// No product count beside the label — it was tried and taken off: a bare
// number floating at the end of a filter row read as a price or a quantity,
// not as "how many products".
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
        // The same sentence the quick view shows — structured data that says
        // something different from the page is worse than none.
        description: describe(p),
        category: p.category,
        image: typeof window !== 'undefined'
          ? new URL(u(p.img, 800, 800), window.location.origin).href
          : u(p.img, 800, 800),
        brand: { '@type': 'Brand', name: 'Cake & Crumb' },
        offers: {
          // Must match the price the card actually shows, or search engines
          // flag the structured data as contradicting the landing page — so
          // per-piece products publish their box price, not the per-piece rate.
          '@type': 'Offer',
          price: cardPrice(p),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  })

  // Allow deep-linking to a filtered view, e.g. /shop?category=Cheesecakes (from the Menu page).
  // `?product=cc-biscoff` (from the search overlay) additionally jumps to that
  // one card and flashes it — see the jump effect below.
  const [searchParams, setSearchParams] = useSearchParams()
  const paramCategory = searchParams.get('category')
  const paramProduct = searchParams.get('product')
  const [category, setCategory] = useState(
    paramCategory && CATEGORIES.includes(paramCategory) ? paramCategory : 'All Products'
  )
  const [priceRange, setPriceRange] = useState('all')
  const [sort, setSort] = useState('featured')
  const [shown, setShown] = useState(PAGE_SIZE)
  const [quickView, setQuickView] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false) // mobile-only collapse
  const [flashId, setFlashId] = useState(null)          // product to scroll to + flash

  // Count of applied filters — shown on the mobile toggle so users know filters
  // are active even while the panel is collapsed.
  const activeFilterCount =
    (category !== 'All Products' ? 1 : 0) +
    (priceRange !== 'all' ? 1 : 0)
  const { items, count, subtotal, add, increment, decrement, remove, clear } = useCart()


  const filtered = useMemo(() => {
    const priceTest = PRICE_RANGES.find((r) => r.id === priceRange)?.test ?? (() => true)
    let list = shopProducts.filter((p) => inFilter(p, category) && priceTest(p))
    if (sort === 'lowhigh') list = [...list].sort((a, b) => lowestPrice(a) - lowestPrice(b))
    else if (sort === 'highlow') list = [...list].sort((a, b) => lowestPrice(b) - lowestPrice(a))
    return list
  }, [category, priceRange, sort])

  const visible = filtered.slice(0, shown)
  const remaining = filtered.length - visible.length

  // Sub-headings inside the grid (Classic · Exotic · Chocolate · Premium for
  // cheesecakes; Brownies · Blondies · Cakesicles for bakes; Mojitos ·
  // Milkshakes · Iced · Hot for drinks). `group` already rides on every product
  // — until now only the ChatBot read it, while the Shop showed 24 cheesecakes
  // as one undifferentiated wall.
  //
  // Only when one category is selected AND the order is still "Featured": a
  // price sort deliberately mixes the groups, so heading them would be a lie.
  // Not for a group filter: every row already shares that one group, so the
  // heading would just repeat the filter the customer just picked.
  const showGroups = category !== 'All Products' && sort === 'featured' && !GROUP_FILTERS[category]
  const sections = useMemo(() => {
    if (!showGroups) return [{ name: null, items: visible }]
    const out = []
    for (const p of visible) {
      const name = p.group || null
      const last = out[out.length - 1]
      if (last && last.name === name) last.items.push(p)
      else out.push({ name, items: [p] })
    }
    return out
  }, [showGroups, visible])

  // Follow the URL ?category= param (e.g. navigating between Menu "View All" links)
  useEffect(() => {
    if (paramCategory && CATEGORIES.includes(paramCategory)) setCategory(paramCategory)
  }, [paramCategory])

  // Reset to page 1 whenever filters/sort change so users don't land on an empty page
  useEffect(() => { setShown(PAGE_SIZE) }, [category, priceRange, sort])

  // ── Jump to one product (?product=cc-biscoff, from the search overlay) ──
  // Searching "biscoff" and landing on 24 cheesecakes is no answer: the customer
  // still has to find the row. So we widen the filters enough for the product to
  // be reachable, turn to its page, scroll it into view and flash it.
  //
  // Split in two because the target's page can only be worked out AFTER the
  // filters have settled — `filtered` is recomputed from state the first effect
  // sets, so the second re-runs once that lands. The URL param is consumed
  // immediately (a ref would do, but dropping it also keeps a shared/reloaded
  // link from re-flashing) and `flashId` carries the rest.
  const jumpedRef = useRef(null)
  useEffect(() => {
    // Cleared on the pass that follows dropping the param, so clicking the same
    // search result twice in a row flashes twice.
    if (!paramProduct) { jumpedRef.current = null; return }
    if (jumpedRef.current === paramProduct) return
    const target = shopProducts.find((p) => p.id === paramProduct)
    if (!target) return
    jumpedRef.current = paramProduct
    // A price band left over from an earlier visit could hide the product
    // outright, and the card's price may sit outside the band it filters under
    // (per-piece products — see lowestPrice). Clearing it is the honest move.
    setPriceRange('all')
    // Keep the current filter if the target is already visible under it — that
    // covers 'All Products', its own category, AND a group filter like
    // 'Cake Pops' (whose products report category 'Bakes', so comparing
    // categories alone would needlessly widen the view).
    setCategory((c) => (inFilter(target, c) ? c : target.category))
    setFlashId(paramProduct)
    const next = new URLSearchParams(searchParams)
    next.delete('product')
    setSearchParams(next, { replace: true })
  }, [paramProduct, searchParams, setSearchParams])

  const scrolledRef = useRef(null)
  useEffect(() => {
    if (!flashId) { scrolledRef.current = null; return }
    // Once we've scrolled, this effect is done — otherwise paging away during
    // the 2.6s flash would drag the customer straight back to our page.
    if (scrolledRef.current === flashId) return
    const idx = filtered.findIndex((p) => p.id === flashId)
    if (idx === -1) return
    // The target may sit past what's rendered — reveal up to it, then let the
    // effect re-run once those rows exist to scroll to.
    if (idx >= shown) { setShown(Math.ceil((idx + 1) / PAGE_SIZE) * PAGE_SIZE); return }
    scrolledRef.current = flashId
    document.getElementById(`product-${flashId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Long enough for the three pulses in .cc-product-card.is-flash to finish.
    const t = setTimeout(() => setFlashId(null), 2600)
    return () => clearTimeout(t)
  }, [flashId, filtered, shown])

  const clearFilters = () => {
    setCategory('All Products')
    setPriceRange('all')
  }

  // On phones/tablets the filter sidebar sits ABOVE the product grid, so after
  // picking a filter the user would otherwise have to scroll down to see the
  // results. Auto-scroll to the top of the grid (offset for the sticky header)
  // so the filtered products come straight into view. No-op on desktop (lg+),
  // where the sidebar is beside the grid and already visible.
  // The mobile panel also collapses itself on a pick: it's a radio list, so one
  // tap is the whole interaction, and leaving it open pushes the results the
  // user just asked for a screen further down.
  const gridRef = useRef(null)
  function scrollToProducts({ everyScreen = false } = {}) {
    if (typeof window === 'undefined') return
    if (!everyScreen && window.innerWidth >= 992) return
    setFiltersOpen(false)
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

  // Appending needs NO scroll, which is the point of it: the numbered pager had
  // to yank the viewport back to the top of the grid on every click, because the
  // next twelve products replaced the last twelve off-screen. These land
  // directly under the button the customer just pressed.
  const showMore = () => setShown((n) => n + PAGE_SIZE)

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
                  Showing {visible.length} of {filtered.length} results
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

              {/* Everything is baked to order — say so where the decision is
                  made, not only in the quick view and the footer. */}
              <p className="cc-shop-note cc-shop-note--lead">
                <FiClock size={12} /> Freshly baked to order — please order at least 1 day in advance.
              </p>

              {/* These notes are load-bearing, not decoration: a per-piece
                  product's CARD quotes its box price, so this line is the only
                  place a customer learns single pieces exist at all. Any new
                  per-piece category needs one — see CLAUDE.md. */}
              {category === 'Cupcakes' && (
                <p className="cc-shop-note">
                  <FiHeart size={12} /> Cupcakes come as a box of 6, or buy them by the piece (minimum 2) — tap any cupcake to choose how many. Add ₹20 for floral or additional decoration.
                </p>
              )}

              {category === 'Cake Pops' && (
                <p className="cc-shop-note">
                  <FiHeart size={12} /> Cake pops come as a box of 6, or by the piece (minimum 2) — tap any flavour to choose how many. A box of 12 is simply two sixes.
                </p>
              )}

              {/* Sizes sold at the counter that the site can't take an order for
                  (a product holds two prices). Figures come from EXTRA_TIERS so
                  the wording can't drift from the real price list. */}
              {category === 'Cookies' && (
                <p className="cc-shop-note">
                  <FiHeart size={12} /> Boxes of 6 and 12, or single cookies from {inr(EXTRA_TIERS.Cookies[0].from)} — tap any cookie to pick a size. Singles are baked into the day's batch, so a box is still the better value.
                </p>
              )}

              {category === 'Bakes' && (
                <p className="cc-shop-note">
                  <FiHeart size={12} /> Brownies and blondies also come in {EXTRA_TIERS.Brownies.map((t) => t.label).join(' and ')} — from {inr(EXTRA_TIERS.Brownies[0].from)} and {inr(EXTRA_TIERS.Brownies[1].from)}. Ask on WhatsApp for those.
                </p>
              )}

              <div className="cc-shop-grid">
                {sections.map((section) => (
                <Fragment key={section.name || '_'}>
                {section.name && (
                  <h3 className="cc-shop-group">{section.name}</h3>
                )}
                {section.items.map((p) => (
                  <article
                    key={p.id}
                    id={`product-${p.id}`}
                    className={'cc-product-card' + (p.id === flashId ? ' is-flash' : '')}
                  >
                    <button
                      type="button"
                      onClick={() => setQuickView(p)}
                      aria-label={`View ${p.name}`}
                      className="cc-product-card__img-btn"
                    >
                      <img
                        src={u(p.img, 500, 500)}
                        srcSet={srcSet(p.img)}
                        /* 2 across on a phone, 3 in the middle column on desktop */
                        // Measured against the real card: ~220px from 768px up
                        // (the grid is 2-across at lg, 3 elsewhere), ~46vw
                        // below. The old "48vw" claimed 369px for a 221px slot
                        // at 768px. With only 400w and 800w variants this
                        // rarely changes which file is picked — accuracy for
                        // when a third width is added, not a win today.
                        sizes="(min-width: 768px) 240px, 46vw"
                        alt={p.name}
                        loading="lazy"
                      />
                    </button>
                    <div className="cc-product-card__body">
                      <div className="cc-product-card__cat">
                        {p.category}
                        {/* Nut warnings and genuine free-from facts, at a
                            glance. 19 of the 120 products contain nuts, and
                            until now the ONLY place that was visible was
                            inside the quick view — so an allergy sufferer had
                            to open every card one by one to find out.
                            AllergenTags' compact mode was written for exactly
                            this and had never been wired up. */}
                        <AllergenTags allergens={p.allergens} />
                      </div>
                      {/* A real <button> inside the heading, not a clickable
                          <h6>: the title opens the quick view, so it has to be
                          reachable by keyboard and announced as a control. */}
                      <h6 className="cc-product-card__name">
                        <button
                          type="button"
                          className="cc-product-card__name-btn"
                          onClick={() => setQuickView(p)}
                          title={p.name}
                        >
                          {p.name}
                        </button>
                      </h6>
                      {/* The wording comes from priceLabel() — the per-piece
                          card keeps its own JSX only to append the size caption.
                          Don't re-derive the figure here: doing exactly that is
                          how a ₹340 cookie box once advertised "From ₹700". */}
                      <div className="cc-product-card__price">
                        {isPerPiece(p) ? (
                          <>
                            {inr(p.slice)}
                            <span className="cc-product-card__price-sub">{p.sliceLabel}</span>
                          </>
                        ) : (
                          priceLabel(p)
                        )}
                      </div>
                      <button
                        className="cc-product-card__add"
                        /* Twelve buttons all reading "Add to Cart" is what a
                           screen reader hears without this. Two-tier products
                           open the size chooser rather than adding. */
                        aria-label={
                          p.slice ? `Choose a size for ${p.name}` : `Add ${p.name} to cart`
                        }
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
                </Fragment>
                ))}
                {/* The recovery has to live HERE, not only in the sidebar. On a
                    phone the filter panel is a collapsed accordion above the
                    grid, so the existing "Clear Filters" button could be
                    off-screen exactly when it is the only thing that helps.
                    (Comment sits OUTSIDE the `&&` — a JSX comment cannot be the
                    first child of a conditional expression.) */}
                {filtered.length === 0 && (
                  <div className="cc-shop-empty">
                    <p className="mb-2">No products match your filters.</p>
                    <button type="button" className="cc-shop-empty__clear" onClick={clearFilters}>
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              {remaining > 0 && (
                <div className="cc-shop-more">
                  <button type="button" className="cc-shop-more__btn" onClick={showMore}>
                    Show {Math.min(remaining, PAGE_SIZE)} more
                    <span className="cc-shop-more__n">{remaining} left</span>
                  </button>
                </div>
              )}
            </div>

            {/* CART SIDEBAR */}
            <aside className="col-lg-3">
              <div className="cc-shop-cart">
                {/* The cart proper is desktop-only (hidden below lg in CSS). On a
                    phone this whole column lands UNDER twelve products, so the
                    reader scrolled past their own cart, the subtotal and two
                    buttons before reaching anything new — and the floating pill
                    already shows the count and total there. The Special card and
                    the trust strip below stay on every screen. */}
                <div className="cc-shop-cart__panel">
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
                      srcSet={srcSet(c.img)}
                      sizes="64px"
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
                {/* Must say the same thing as the Cart page's order summary —
                    delivery is worked out from the pincode at checkout now, not
                    agreed over WhatsApp. Two pages promising two different
                    things is how a customer ends up arguing about a fee. */}
                <p className="cc-shop-cart__note">
                  Delivery calculated at checkout. Self-pickup is always free.
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
                </div>

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

      {/* Floating cart pill — the sidebar sits BELOW 111 products on a phone, so
          without this the only sign an item landed is the toast and the header
          badge. Hidden on lg+ in CSS, where the sidebar is visible anyway; sits
          bottom-centre, clear of the back-to-top (bottom-left) and the chat and
          WhatsApp buttons (bottom-right). */}
      {count > 0 && (
        <Link to="/cart" className="shop-cart-pill">
          <FiShoppingBag size={15} />
          <span>
            <strong>{count}</strong> {count === 1 ? 'item' : 'items'} · {inr(subtotal)}
          </span>
          <span className="shop-cart-pill__cta">View cart</span>
        </Link>
      )}

      {/* Keyed by id: this modal stays mounted with product=null, so without a
          key its quantity state would never re-init for the next product. */}
      <ProductQuickView key={quickView?.id} product={quickView} onClose={() => setQuickView(null)} />
    </>
  )
}
