import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiChevronLeft, FiChevronRight, FiShoppingBag, FiMessageCircle } from 'react-icons/fi'
import { u, srcSet } from '../data/images.js'
import { shopProducts } from '../data/products.js'

/**
 * Gallery photo → somewhere to buy it.
 *
 * The page used to be a dead end: a customer scrolled the best work, tapped a
 * cake and had no way to order it. Most of these photos ARE product photos, and
 * `p.img` is the same `/products/<file>` string the gallery lists, so the link
 * can be resolved rather than hand-maintained on 47 entries.
 *
 * Three outcomes, in order of how useful they are:
 *   • exactly one product uses the photo → deep-link straight to it. `?product=`
 *     already widens the filters, turns to the right page, scrolls to the card
 *     and flashes it (see Shop.jsx) — nothing new needed.
 *   • several products share it → the photo can't say which, so link to the
 *     category. Half the catalogue still shares photos, so this is the common case.
 *   • none → it's custom work (the "mum" cake, the birthday cakes). Those aren't
 *     orderable from the shop at all, so they point at Contact instead, which is
 *     exactly the enquiry the photo is likely to provoke.
 */
const BY_PHOTO = shopProducts.reduce((m, p) => {
  ;(m[p.img] ||= []).push(p)
  return m
}, {})

/**
 * Gallery filter name → the Shop filter that sells it. Needed because plenty of
 * gallery shots are extra angles that no product entry uses, so matching on the
 * photo alone dropped real catalogue items into "custom cake". 'Chocolates' has
 * no Shop category of its own (the truffles aren't in the catalogue), so it is
 * deliberately absent and falls through to the enquiry link.
 */
const CAT_TO_SHOP = {
  Cakes: 'Sponge Cakes',
  Cupcakes: 'Cupcakes',
  Cheesecakes: 'Cheesecakes',
  'Milk Cakes': 'Milk Cakes',
  Bakes: 'Bakes',
  'Dessert Cups': 'Dessert Cups',
}

function buyLink(photo) {
  const matches = BY_PHOTO[photo.id]

  // Best case — this photo belongs to exactly one product.
  if (matches?.length === 1) {
    const p = matches[0]
    return {
      to: `/shop?category=${encodeURIComponent(p.category)}&product=${encodeURIComponent(p.id)}`,
      label: `Order ${p.name}`,
    }
  }
  // Shared photo: it can't say which product, so open its category.
  if (matches?.length > 1) {
    const cat = matches[0].category
    return { to: `/shop?category=${encodeURIComponent(cat)}`, label: `Browse ${cat}` }
  }
  // A one-off made to order — no catalogue row will ever match it.
  if (photo.custom) return { to: '/contact', label: 'Ask about a custom cake', custom: true }

  // An extra angle of something we do sell: fall back to its own filter.
  const shopCat = CAT_TO_SHOP[photo.cat]
  if (shopCat) return { to: `/shop?category=${encodeURIComponent(shopCat)}`, label: `Browse ${shopCat}` }

  // Nothing in the catalogue matches and no Shop filter fits. Chocolates is the
  // live case (see CAT_TO_SHOP) — and "Ask about a custom cake" under a box of
  // truffles reads like the wrong button, so name what is in the photo.
  return {
    to: '/contact',
    label: photo.cat ? `Ask about ${photo.cat.toLowerCase()}` : 'Ask about a custom cake',
    custom: true,
  }
}

/**
 * GALLERY MOSAIC — 47 photos without a 12-screen page.
 *
 * The old page rendered all 47 as square `col-lg-3` tiles: twelve rows deep on
 * desktop, and every portrait cake photo centre-cropped to a square, which cut
 * the top off tall cakes. Three things fix that:
 *
 *   1. FILTERS. Seven categories, so "Dessert Cups" (16 photos) and "Cakes" (9)
 *      are browsed separately instead of as one undifferentiated wall.
 *   2. A PAGE LIMIT. Only PAGE_SIZE tiles render until "Show more" is pressed,
 *      so the page opens short whichever filter is active.
 *   3. 4:5 TILES, not 1:1. Nearly every photo here is a portrait phone capture
 *      (3:4 or 9:16), so a 4:5 frame crops far less than a square did — and the
 *      lightbox shows the whole uncropped image.
 *
 * Deliberately NOT a CSS-columns masonry: `columns` fills column-by-column, so
 * the bakery's own photos — which are ordered first on purpose — would all stack
 * into the left-hand column instead of reading across the top row.
 */

// 18, not 12: the tiles are thumbnail-sized (up to 6 per row on a wide screen),
// so 12 filled only two short rows and "Show more" came up almost immediately.
// 18 is three full rows at 6 columns and still LESS page height than the 12
// large tiles this replaced.
const PAGE_SIZE = 18

// Order matters: 'All' first, then roughly by how much a customer cares.
const FILTERS = ['All', 'Cakes', 'Cupcakes', 'Cheesecakes', 'Milk Cakes', 'Bakes', 'Dessert Cups', 'Chocolates']

export default function GalleryGrid({ photos }) {
  const [filter, setFilter] = useState('All')
  const [shown, setShown] = useState(PAGE_SIZE)
  const [lightbox, setLightbox] = useState(null) // index into `visible`, or null

  const visible = useMemo(
    () => (filter === 'All' ? photos : photos.filter((p) => p.cat === filter)),
    [filter, photos],
  )

  // Only offer a filter that actually has photos, and show its count — a chip
  // that filters to nothing reads as a broken page.
  const chips = useMemo(
    () =>
      FILTERS.map((f) => ({
        name: f,
        count: f === 'All' ? photos.length : photos.filter((p) => p.cat === f).length,
      })).filter((c) => c.count > 0),
    [photos],
  )

  function pick(f) {
    setFilter(f)
    setShown(PAGE_SIZE) // a new filter starts short again
  }

  const page = visible.slice(0, shown)
  const more = visible.length - page.length

  return (
    <>
      <div className="cc-gallery-filters" role="tablist" aria-label="Filter photos">
        {chips.map((c) => (
          <button
            key={c.name}
            type="button"
            role="tab"
            aria-selected={filter === c.name}
            className={`cc-gallery-chip${filter === c.name ? ' is-active' : ''}`}
            onClick={() => pick(c.name)}
          >
            {c.name}
            <span className="cc-gallery-chip__n">{c.count}</span>
          </button>
        ))}
      </div>

      <div className="cc-gallery-mosaic">
        {page.map((p, i) => (
          <button
            type="button"
            className="cc-gallery-cell"
            key={p.id + i}
            onClick={() => setLightbox(i)}
            aria-label={`View larger: ${p.alt}`}
          >
            {/* `sizes` must track the column counts in .cc-gallery-mosaic — it
                is what lets the browser pick the 400w variant instead of the
                800w one for a ~200px tile. Overstating it silently doubles the
                bytes for every photo on the page. */}
            <img
              src={u(p.id, 600, 750)}
              srcSet={srcSet(p.id)}
              sizes="(min-width: 1400px) 16vw, (min-width: 992px) 19vw, (min-width: 768px) 24vw, (min-width: 576px) 31vw, 47vw"
              alt={p.alt}
              loading={i < 12 ? 'eager' : 'lazy'}
              className="cc-gallery-tile"
            />
            <span className="cc-gallery-cell__cap">{p.alt}</span>
          </button>
        ))}
      </div>

      {more > 0 && (
        <div className="text-center mt-4">
          <button type="button" className="cc-gallery-more" onClick={() => setShown((s) => s + PAGE_SIZE)}>
            Show {Math.min(more, PAGE_SIZE)} more
            <span className="cc-gallery-more__n">{more} left</span>
          </button>
        </div>
      )}

      {lightbox != null && (
        <Lightbox photos={visible} index={lightbox} onClose={() => setLightbox(null)} onMove={setLightbox} />
      )}
    </>
  )
}

/**
 * Full-size view. No body scroll-lock on purpose: the documented iOS
 * jump-to-top bug in this codebase comes from mutating `body`/`html` overflow
 * (see the Navbar notes in CLAUDE.md), and a fixed, opaque overlay already hides
 * whatever moves behind it. `overscroll-behavior` keeps a swipe from chaining.
 */
function Lightbox({ photos, index, onClose, onMove }) {
  const closeRef = useRef(null)
  const photo = photos[index]
  const link = buyLink(photo)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onMove((i) => (i + 1) % photos.length)
      if (e.key === 'ArrowLeft') onMove((i) => (i - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length, onClose, onMove])

  return (
    <div
      className="cc-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onClick={onClose} // backdrop click closes; the figure stops propagation
    >
      <button ref={closeRef} type="button" className="cc-lightbox__x" onClick={onClose} aria-label="Close">
        <FiX />
      </button>

      <button
        type="button"
        className="cc-lightbox__nav cc-lightbox__nav--prev"
        aria-label="Previous photo"
        onClick={(e) => { e.stopPropagation(); onMove((i) => (i - 1 + photos.length) % photos.length) }}
      >
        <FiChevronLeft />
      </button>

      <figure className="cc-lightbox__figure" onClick={(e) => e.stopPropagation()}>
        {/* No width/height hints — the whole point of this view is the photo's
            own proportions, uncropped. */}
        <img src={u(photo.id, 1400, 1400)} alt={photo.alt} className="cc-lightbox__img" />
        <figcaption className="cc-lightbox__cap">
          {photo.alt}
          <span className="cc-lightbox__count">{index + 1} / {photos.length}</span>
        </figcaption>
        {/* The way out of the gallery and into an order. */}
        <Link to={link.to} className="cc-lightbox__buy" onClick={onClose}>
          {link.custom ? <FiMessageCircle size={15} /> : <FiShoppingBag size={15} />}
          {link.label}
        </Link>
      </figure>

      <button
        type="button"
        className="cc-lightbox__nav cc-lightbox__nav--next"
        aria-label="Next photo"
        onClick={(e) => { e.stopPropagation(); onMove((i) => (i + 1) % photos.length) }}
      >
        <FiChevronRight />
      </button>
    </div>
  )
}
