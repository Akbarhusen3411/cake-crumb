import { Link } from 'react-router-dom'
import { FiArrowRight, FiHeart } from 'react-icons/fi'
import { TbCake } from 'react-icons/tb'
import HeartDivider from '../components/HeartDivider.jsx'
import { img, u, srcSet } from '../data/images.js'
import { shopProducts } from '../data/products.js'
import { menuCardPhoto } from '../data/productImages.js'
import { inr } from '../data/format.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'

// Curated 5-item teasers per card — the page stays light, full lists live in /shop.
//
// ONLY THE PICKS ARE HAND-WRITTEN. The name, price and badge of every row are
// read out of products.js by product id, so this page can no longer quote a
// price the Shop has moved on from — it used to hold its own copy of ~30
// prices, which is what CLAUDE.md means by "the one place a price can drift".
// Change a price in products.js and this page follows on the next render.
//
//   picks   — product ids from shopProducts, in the order they should be listed
//   tier    — 'price' (default) or 'slice' when the card quotes the second tier
//             (cupcakes are quoted as a box of 6, which is the `slice` price)
//   strip   — trailing words to drop from the name; the card title already says
//             "Cheesecakes", so the row reads "Strawberry", not "Strawberry
//             Cheesecake"
//   suffix  — appended to every row on the card, e.g. "(Bento)"
//   note    — a function so the figures inside it are derived too
//
// The card photo is NOT set here: it's looked up by `title` in productImages.js
// (MENU_CARD_IMAGES), same as every product photo, so there is one place to edit.
const BY_ID = Object.fromEntries(shopProducts.map((p) => [p.id, p]))

/** Cheapest tier across a set of products — for "from ₹X" notes. */
const cheapest = (list, key = 'price') =>
  Math.min(...list.map((p) => p[key]).filter((n) => typeof n === 'number'))

const inCategory = (c) => shopProducts.filter((p) => p.category === c)
const inGroup = (g) => shopProducts.filter((p) => p.group === g)

const CARDS = [
  {
    title: 'Cheesecakes',
    category: 'Cheesecakes',
    strip: /\s*Cheesecake$/,
    picks: ['cc-strawberry', 'cc-mango', 'cc-blueberry', 'cc-nutella', 'cc-pistachio'],
  },
  {
    title: 'Sponge Cakes',
    category: 'Sponge Cakes',
    strip: /\s*Sponge Cake$/,
    suffix: '(Bento)',
    picks: ['sp-vanilla', 'sp-chocolate', 'sp-mango', 'sp-biscoff', 'sp-pistachio'],
    note: () => `♥ Also available as single-serve tubs from ₹${cheapest(inCategory('Sponge Cakes'), 'slice')}.`,
  },
  {
    title: 'Milk Cakes',
    category: 'Milk Cakes',
    strip: /\s*Milk Cake$/,
    suffix: '(Bento)',
    picks: ['mc-tres', 'mc-rose', 'mc-mango', 'mc-biscoff', 'mc-pistachio'],
    note: () => `♥ Also available as single-serve tubs from ₹${cheapest(inCategory('Milk Cakes'), 'slice')}.`,
  },
  {
    title: 'Cupcakes',
    category: 'Cupcakes',
    strip: /\s*Cupcakes$/,
    // Quoted as a box of 6 — the `slice` tier. Never the per-piece rate: a card
    // reading "from ₹25" beside a photo of six is read as six for ₹25.
    tier: 'slice',
    suffix: '(Box of 6)',
    picks: ['cup-vanilla', 'cup-chocolate', 'cup-strawberry', 'cup-redvelvet', 'cup-pistachio'],
    note: () =>
      `♥ Also sold by the piece from ₹${cheapest(inCategory('Cupcakes'))} (minimum 2). Add ₹20 for floral or additional decoration.`,
  },
  {
    title: 'Cookies',
    category: 'Cookies',
    strip: /\s*Cookies$/,
    suffix: '(Box of 6)',
    picks: ['ck-classic', 'ck-white', 'ck-triple', 'ck-almond', 'ck-pistachio'],
    note: () => `♥ Boxes of 12 from ₹${cheapest(inCategory('Cookies'), 'slice')}.`,
  },
  {
    title: 'Dessert Cups',
    category: 'Dessert Cups',
    picks: ['dc-grass', 'dc-jelly', 'dc-custard-vanilla', 'dc-custard-mango', 'dc-trifle'],
  },
  {
    // Bakes replaces the old hand-typed "Sweet Treats & More" block: same
    // treats, but the prices come from products.js and each row deep-links to
    // its product, and the category finally has a card of its own.
    title: 'Bakes',
    category: 'Bakes',
    picks: ['bk-brownie-classic', 'bk-brownie-nutella', 'bk-blondie-classic', 'bk-cakepop', 'bk-cakesickle-heart'],
    note: () =>
      `♥ Brownies & blondies also come by the box of 6, from ₹${cheapest(inGroup('Brownies'), 'slice')}. Macarons, cookie fries & dipping boxes in the shop.`,
  },
  {
    // Drinks were missing from this page entirely — 24 of them, and the
    // priciest things the kitchen sells.
    title: 'Drinks',
    category: 'Drinks',
    picks: ['dr-virginmojito', 'dr-strawberrydelight', 'dr-oreo-shake', 'dr-iced-classic', 'dr-hot-classic'],
    note: () => `♥ ${inCategory('Drinks').length} in all — mojitos, milkshakes, iced & hot coffee.`,
  },
]

/**
 * Resolve a card's picks into display rows. An id that no longer exists is
 * dropped rather than rendering a blank row — renaming a product in
 * products.js should never blank out the Menu page.
 */
function rowsFor(card) {
  return card.picks
    .map((id) => {
      const p = BY_ID[id]
      if (!p) return null
      const price = card.tier === 'slice' ? p.slice : p.price
      if (typeof price !== 'number') return null
      const base = card.strip ? p.name.replace(card.strip, '') : p.name
      return {
        id,
        name: card.suffix ? `${base} ${card.suffix}` : base,
        price,
        badge: p.badge,
        // Land on the product itself, flashing — not on 24 unlabelled siblings.
        to: `/shop?category=${encodeURIComponent(p.category)}&product=${encodeURIComponent(id)}`,
      }
    })
    .filter(Boolean)
}

function PriceRow({ name, price, badge, to }) {
  const inner = (
    <>
      <span className="cc-menu-row__name">
        {name}
        {badge && <span className="cc-menu-row__badge">{badge}</span>}
      </span>
      <span className="cc-menu-row__price">
        {typeof price === 'number' ? inr(price) : price}
      </span>
    </>
  )
  if (!to) return <div className="cc-menu-row">{inner}</div>
  return (
    <Link to={to} className="cc-menu-row cc-menu-row--link">
      {inner}
    </Link>
  )
}

export default function Menu() {
  usePageMeta({
    title: 'Menu',
    description: 'Cheesecakes, milk cakes, cookies, cupcakes, bakes, dessert cups and drinks. Banto 4" cakes, 6" milk cakes — whole or per slice.',
  })

  // Resolved once — the structured data and the visible rows must be the same
  // numbers, or search engines flag the page as contradicting itself.
  const cards = CARDS.map((c) => ({ ...c, rows: rowsFor(c) }))

  useJsonLd('menu', {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Cake & Crumb Menu',
    hasMenuSection: cards.map((c) => ({
      '@type': 'MenuSection',
      name: c.title,
      hasMenuItem: c.rows.map((it) => ({
        '@type': 'MenuItem',
        name: it.name,
        offers: { '@type': 'Offer', price: it.price, priceCurrency: 'INR' },
      })),
    })),
  })

  return (
    <>
      {/* ───── HERO — soft warm-pink, split: text left, pink cake image right ───── */}
      <section className="cc-menu-hero">
        <div className="container py-5">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="eyebrow mb-3 d-inline-flex">Our Menu</span>
              <h1 className="cc-menu-hero__title">
                Made with Love,<br />Baked for You
              </h1>
              <HeartDivider width={50} />
              <p className="cc-menu-hero__lede">
                Indulge in our handcrafted cakes, cupcakes, cookies, and chocolates —
                made with the finest ingredients and a touch of love.
              </p>
            </div>
            <div className="col-lg-6">
              <img
                src={u(img.heroMenu, 1000, 800)}
                alt="Assorted pastries arranged on ceramic trays"
                className="cc-menu-hero__img"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── OUR DELICIOUS TREATS — one card per Shop category (2 across) ───── */}
      <section className="cc-menu-treats">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="eyebrow">Our Delicious Treats</span>
            <div className="cc-menu-flourish" aria-hidden>
              <TbCake size={22} />
            </div>
          </div>

          <div className="cc-menu-grid">
            {cards.map((card) => (
              <article className="cc-menu-card" key={card.title}>
                <img
                  src={u(menuCardPhoto(card.title), 600, 700)}
                  srcSet={srcSet(menuCardPhoto(card.title))}
                  /* Image sits left of the text on tablet+, full width above it
                     on a phone. */
                  sizes="(min-width: 768px) 210px, 100vw"
                  alt={card.title}
                  className="cc-menu-card__img"
                  loading="lazy"
                />
                <div className="cc-menu-card__body">
                  <h3 className="cc-menu-card__title">{card.title}</h3>
                  <span className="cc-menu-card__rule" aria-hidden />
                  <div className="cc-menu-card__items">
                    {card.rows.map((it) => (
                      <PriceRow
                        key={it.id}
                        name={it.name}
                        price={it.price}
                        badge={it.badge}
                        to={it.to}
                      />
                    ))}
                  </div>
                  {card.note && (
                    <p className="cc-menu-card__note">{card.note()}</p>
                  )}
                  <Link
                    to={`/shop?category=${encodeURIComponent(card.category)}`}
                    className="cc-menu-card__viewall"
                  >
                    View All {card.title} <FiArrowRight />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* The old "Sweet Treats & More" block lived here: a second, hand-typed
              price list for brownies, blondies, cakesicles and cake pops. Those
              are the Bakes category, which now has a card of its own with
              derived prices — keeping both meant maintaining the same figures
              twice. Custom Orders kept its place in the banner below. */}

          {/* Custom Orders banner */}
          <div className="cc-menu-custom mt-5">
            <div className="cc-menu-custom__left">
              <span className="cc-menu-custom__icon">
                <FiHeart size={20} />
              </span>
              <div>
                <h4 className="cc-menu-custom__title">Custom Orders</h4>
                <p className="cc-menu-custom__text">
                  Have something special in mind? We love creating custom treats for
                  birthdays, weddings, and every celebration!
                </p>
              </div>
            </div>
            <Link to="/contact" className="btn-rose flex-shrink-0">
              Place a Custom Order <FiHeart />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
