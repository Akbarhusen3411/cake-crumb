import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { FiSearch, FiX, FiShoppingBag } from 'react-icons/fi'
import { shopProducts, priceLabel, describe } from '../data/products.js'
import { u, srcSet } from '../data/images.js'

const MAX_RESULTS = 12

/**
 * Everything one product can be found by.
 *
 * Name and category alone missed a lot of what people actually type: "eggless"
 * and "vegan" live in `allergens`, "bento"/"banto" are `sizeLabel`s, and
 * "birthday" or "gift" only appear in the generated description. Each of those
 * returned zero results on a site that sells them — and a customer searching
 * "eggless" concludes the bakery doesn't do eggless.
 *
 * `group` is in here too, so "brownies" or "cakesicles" find their whole set.
 * Allergen codes are hyphenated (`contains-nuts`, `eggless-option`), so the
 * hyphens are flattened to spaces — otherwise "eggless" would not match
 * "eggless-option".
 */
const haystack = (p) =>
  [
    p.name,
    p.category,
    p.group,
    p.sizeLabel,
    p.sliceLabel,
    p.unitLabel,
    p.badge,
    describe(p),
    // `eggless-option` is excluded on purpose. Nearly every baked product
    // carries it ("eggless on request"), so including it made "eggless" return
    // 105 of 120 — technically true and useless as a filter. Searching eggless
    // now returns only what is eggless AS BAKED (the `eggless` tag: mojitos,
    // black coffee). "Eggless on request" is still answered on /faq and in the
    // quick view, which lists every tag.
    (p.allergens || []).filter((a) => a !== 'eggless-option').join(' ').replace(/-/g, ' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

/**
 * ALL matches, unsliced. The caller decides how many to render — the count in
 * the UI has to reflect this length, not the visible slice. It used to slice
 * here, so searching "cake" (65 matches) reported "12 results" and hid 53 with
 * no way to reach them.
 */
function findProducts(query) {
  const q = query.trim().toLowerCase()
  if (!q) return shopProducts
  // Every word must appear somewhere, so "eggless cheesecake" narrows rather
  // than widening the way a plain substring match would.
  const words = q.split(/\s+/)
  return shopProducts.filter((p) => {
    const hay = haystack(p)
    return words.every((w) => hay.includes(w))
  })
}

/**
 * Did they ask about eggs at all? Covers "eggless", "egg free", "egg-free" and
 * plain "egg", so the reassurance below fires on any phrasing of the question.
 */
const mentionsEggless = (q) => /\begg/i.test(q)

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

  // `matches` is every hit; `results` is what fits on screen. Keeping them
  // separate is the whole point — the hint below counts `matches`.
  const matches = useMemo(() => findProducts(query), [query])
  const results = matches.slice(0, MAX_RESULTS)
  const hidden = matches.length - results.length

  // Arrow-key navigation. Without it the overlay could be typed into but not
  // traversed — no way to reach a result without a mouse or a tap.
  const [active, setActive] = useState(-1)

  const listRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (results.length === 0) return
        e.preventDefault() // stop the page scrolling behind the overlay
        setActive((i) => {
          const next = e.key === 'ArrowDown' ? i + 1 : i - 1
          // Wrap both ways so the list is a loop, not a dead end.
          return (next + results.length) % results.length
        })
      } else if (e.key === 'Enter' && active >= 0) {
        // Follow the highlighted row. The <a> owns the navigation, so click it
        // rather than duplicating the route-building here.
        listRef.current?.querySelectorAll('.cc-search-overlay__result')[active]?.click()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, results.length, active])

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
            onChange={(e) => { setQuery(e.target.value); setActive(-1) }}
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

        {/* Counts MATCHES, not the visible slice. */}
        <div className="cc-search-overlay__hint">
          {query
            ? `${matches.length} result${matches.length === 1 ? '' : 's'}${hidden > 0 ? ` — showing ${results.length}` : ''}`
            : 'Popular treats'}
        </div>

        <div className="cc-search-overlay__results" ref={listRef}>
          {results.length === 0 ? (
            <div className="cc-search-overlay__empty">
              <p>No products match "{query}".</p>
              {/* Strict matching means "eggless cheesecake" finds nothing —
                  no cheesecake is eggless as BAKED, they are eggless on
                  request. Without this line a zero-result read as "we don't do
                  eggless", which is the opposite of true. */}
              {mentionsEggless(query) && (
                <p className="cc-search-overlay__aside">
                  Only drinks are eggless as standard — but <strong>most cakes and
                  bakes can be made eggless on request</strong>. Add it to your order
                  notes at checkout, or ask us on WhatsApp.
                </p>
              )}
              <Link to="/shop" onClick={onClose} className="btn-rose mt-2">
                <FiShoppingBag size={14} /> Browse all products
              </Link>
            </div>
          ) : (
            results.map((p, i) => (
              <Link
                key={p.id}
                /* Carry the product id, not just its category. Landing on 24
                   cheesecakes after searching "biscoff" leaves the customer to
                   hunt for the one they asked for; Shop reads `product=` and
                   jumps to that exact card with a flash. */
                to={`/shop?category=${encodeURIComponent(p.category)}&product=${encodeURIComponent(p.id)}`}
                onClick={onClose}
                className={'cc-search-overlay__result' + (i === active ? ' is-active' : '')}
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
                {/* Shared with the Shop card and the cart suggestions, so the
                    same product can't be quoted three ways (it read "from ₹210"
                    here and "From ₹210" there). */}
                <strong className="cc-search-overlay__price">{priceLabel(p)}</strong>
              </Link>
            ))
          )}

          {/* The overflow used to be silently dropped — searching "cake" showed
              12 of 65 with no route to the rest. */}
          {hidden > 0 && (
            <Link
              to={`/shop?q=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
              className="cc-search-overlay__more"
            >
              See all {matches.length} matches in the shop
            </Link>
          )}
        </div>
      </div>
    </div>
  ), document.body)
}
