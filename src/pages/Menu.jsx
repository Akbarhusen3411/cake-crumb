import { Link } from 'react-router-dom'
import { FiArrowRight, FiHeart } from 'react-icons/fi'
import PageHero from '../components/PageHero.jsx'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'

// Curated short lists per card — keeps the page light and inviting.
// Full lists live in /shop and the structured data in products.js.
const CARDS = [
  {
    title: 'Cheesecakes',
    image: img.cheesecakeQuartet,
    link: '/shop',
    items: [
      { n: 'Strawberry Banto', p: 350 },
      { n: 'Blueberry Banto', p: 410 },
      { n: 'Pistachio Banto', p: 470, badge: 'Premium' },
      { n: 'Biscoff Banto', p: 410 },
      { n: 'Dubai Banto', p: 500, badge: 'Special' },
    ],
  },
  {
    title: 'Milk Cakes',
    image: img.milkcakeRosePistachio,
    link: '/shop',
    items: [
      { n: 'Biscoff Milk Cake', p: 800 },
      { n: 'Trés Léches Milk Cake', p: 800 },
      { n: 'Rose Milk Cake', p: 800 },
      { n: 'Chocolate Milk Cake', p: 850 },
      { n: 'Pistachio Milk Cake', p: 950, badge: 'Premium' },
    ],
  },
  {
    title: 'Cookies',
    image: img.cookiesTripleChoc,
    link: '/shop',
    items: [
      { n: 'Triple Choc', p: 60 },
      { n: 'Red Velvet', p: 60 },
      { n: 'Almond', p: 70 },
      { n: 'White Choc', p: 50 },
      { n: 'Pistachio & Rose', p: 70, badge: 'Special' },
    ],
    suffix: 'per piece',
  },
  {
    title: 'Cakes & Bakes',
    image: img.cupcakesPink,
    link: '/shop',
    items: [
      { n: 'Chocolate Cupcake', p: 100 },
      { n: 'Vanilla Cupcake', p: 100 },
      { n: 'Brownie', p: 80 },
      { n: 'Cakesickle', p: 120 },
      { n: 'Cake Pop', p: 90 },
    ],
    suffix: 'per piece',
  },
]

const SWEET_TREATS_LEFT = [
  { n: 'Macarons (Box of 6)', p: '₹449' },
  { n: 'Cake Pops (Each)', p: '₹99' },
  { n: 'Brownies', p: '₹120' },
]
const SWEET_TREATS_RIGHT = [
  { n: 'Mini Cheesecake', p: '₹150' },
  { n: 'Seasonal Specials', p: 'Market Price' },
  { n: 'Gift Boxes', p: '₹799+' },
]

function PriceRow({ name, price, suffix, badge }) {
  return (
    <div
      className="d-flex align-items-baseline justify-content-between"
      style={{ padding: '0.6rem 0', borderBottom: '1px dashed var(--cc-border)', fontSize: '0.92rem', gap: '0.6rem' }}
    >
      <span style={{ color: 'var(--cc-cocoa)', minWidth: 0, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
        {badge && (
          <span
            className="ms-2"
            style={{
              fontSize: '0.6rem',
              padding: '1px 7px',
              borderRadius: 999,
              background: 'var(--cc-blush)',
              color: 'var(--cc-rose-deep)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              verticalAlign: 'middle',
            }}
          >
            {badge}
          </span>
        )}
      </span>
      <span style={{ color: 'var(--cc-rose)', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {typeof price === 'number' ? inr(price) : price}
      </span>
    </div>
  )
}

export default function Menu() {
  usePageMeta({
    title: 'Menu',
    description: 'Cheesecakes, milk cakes, cookies, cupcakes, bakes, dessert cups and drinks. Banto 4" cakes, 6" milk cakes — whole or per slice.',
  })
  useJsonLd('menu', {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Cake & Crumb Menu',
    hasMenuSection: CARDS.map((c) => ({
      '@type': 'MenuSection',
      name: c.title,
      hasMenuItem: c.items.map((it) => ({
        '@type': 'MenuItem',
        name: it.n,
        offers: { '@type': 'Offer', price: it.p, priceCurrency: 'INR' },
      })),
    })),
  })

  return (
    <>
      <PageHero
        eyebrow="Our Menu"
        title={<>Made with Love,<br />Baked for You</>}
        text="Indulge in our handcrafted cheesecakes, milk cakes, cookies, cupcakes, and bakes — made with the finest ingredients and a touch of love."
        cta={null}
        image={u(img.pinkDripCake2, 1000, 750)}
        imageAlt="Pink drip cake"
      />

      <section className="py-5" style={{ background: 'var(--cc-cream)' }}>
        <div className="container" style={{ maxWidth: 1180 }}>
          <div className="text-center mb-4 mb-md-5">
            <span className="eyebrow">Our Delicious Treats</span>
            <h2 className="section-title mt-3">Handcrafted Just for You</h2>
            <div className="heart-divider"><span aria-hidden>♥</span></div>
          </div>

          {/* 4 category cards in a 2×2 grid */}
          <div className="row g-3 g-md-4">
            {CARDS.map((card) => (
              <div className="col-md-6" key={card.title}>
                <div
                  className="d-flex h-100"
                  style={{
                    background: '#fff',
                    border: '1px solid var(--cc-border)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 10px 28px rgba(176, 46, 82, 0.10)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <img
                    src={u(card.image, 500, 700)}
                    alt={card.title}
                    className="menu-card-img"
                    style={{
                      flexShrink: 0,
                      objectFit: 'cover',
                      alignSelf: 'stretch',
                    }}
                  />
                  <div className="p-3 p-md-4 flex-grow-1 d-flex flex-column">
                    <h3
                      style={{
                        fontSize: '1.4rem',
                        margin: '0 0 0.6rem',
                        color: 'var(--cc-cocoa)',
                        fontWeight: 700,
                      }}
                    >
                      {card.title}
                      {card.suffix && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--cc-cocoa-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 8 }}>
                          {card.suffix}
                        </span>
                      )}
                    </h3>

                    <div>
                      {card.items.map((it) => (
                        <PriceRow key={it.n} name={it.n} price={it.p} badge={it.badge} />
                      ))}
                    </div>

                    <Link
                      to={card.link}
                      className="d-inline-flex align-items-center mt-3"
                      style={{
                        color: 'var(--cc-rose)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        gap: '0.4rem',
                      }}
                    >
                      View All {card.title} <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sweet Treats & More */}
          <div className="row g-4 align-items-center mt-4">
            <div className="col-md-4">
              <img
                src={u(img.macarons, 600, 500)}
                alt="Sweet Treats"
                style={{
                  width: '100%',
                  borderRadius: 16,
                  aspectRatio: '5/4',
                  objectFit: 'cover',
                  boxShadow: '0 8px 24px rgba(176, 46, 82, 0.08)',
                }}
              />
            </div>
            <div className="col-md-8">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--cc-cocoa)', fontWeight: 700 }}>
                Sweet Treats &amp; More
              </h3>
              <div className="row g-md-4">
                <div className="col-md-6">
                  {SWEET_TREATS_LEFT.map((it) => (
                    <PriceRow key={it.n} name={it.n} price={it.p} />
                  ))}
                </div>
                <div className="col-md-6">
                  {SWEET_TREATS_RIGHT.map((it) => (
                    <PriceRow key={it.n} name={it.n} price={it.p} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Orders banner */}
          <div
            className="mt-4 mt-md-5 p-4 p-md-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between position-relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fff0eb 0%, #fce4e9 100%)',
              borderRadius: 16,
              gap: '1.5rem',
              border: '1px solid rgba(224, 97, 122, 0.2)',
            }}
          >
            <div
              className="position-absolute"
              aria-hidden
              style={{ right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(224, 97, 122, 0.08)', filter: 'blur(8px)' }}
            />
            <div className="d-flex align-items-center" style={{ gap: '1rem', position: 'relative', zIndex: 1 }}>
              <span
                className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', color: 'var(--cc-rose)', boxShadow: '0 4px 12px rgba(207, 62, 99, 0.18)' }}
              >
                <FiHeart size={22} />
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--cc-cocoa)', fontWeight: 700 }}>
                  Custom Orders
                </h4>
                <p className="mb-0" style={{ fontSize: '0.92rem', color: 'var(--cc-cocoa-soft)' }}>
                  Have something special in mind? We love creating custom treats for birthdays, weddings, and every celebration.
                </p>
              </div>
            </div>
            <Link to="/contact" className="btn-rose flex-shrink-0" style={{ position: 'relative', zIndex: 1 }}>
              Place a Custom Order <FiHeart />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
