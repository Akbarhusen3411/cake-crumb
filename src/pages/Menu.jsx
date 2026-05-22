import { Link } from 'react-router-dom'
import { FiArrowRight, FiHeart } from 'react-icons/fi'
import { TbCake } from 'react-icons/tb'
import HeartDivider from '../components/HeartDivider.jsx'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'

// Curated 5-item lists per card — keeps the page light. Full lists live in /shop.
const CARDS = [
  {
    title: 'Cakes',
    image: img.milkcakeRosePistachio,
    link: '/shop',
    items: [
      { n: 'Rose Milk Cake', p: 800 },
      { n: 'Biscoff Milk Cake', p: 800 },
      { n: 'Trés Léches Milk Cake', p: 800 },
      { n: 'Chocolate Milk Cake', p: 850 },
      { n: 'Pistachio Milk Cake', p: 950, badge: 'Premium' },
    ],
  },
  {
    title: 'Cupcakes',
    image: img.cupcakesRose,
    link: '/shop',
    items: [
      { n: 'Chocolate Cupcake', p: 100 },
      { n: 'Vanilla Cupcake', p: 100 },
      { n: 'Pink Rose Cupcake', p: 110 },
      { n: 'Red Velvet Cupcake', p: 110 },
      { n: 'Pistachio & Rose', p: 120, badge: 'Special' },
    ],
  },
  {
    title: 'Cookies',
    image: img.cookies,
    link: '/shop',
    items: [
      { n: 'Triple Choc', p: 60 },
      { n: 'Double Chocolate', p: 60 },
      { n: 'White Choc Berry', p: 60 },
      { n: 'Almond', p: 70 },
      { n: 'Pistachio & Rose', p: 70, badge: 'Special' },
    ],
  },
  {
    title: 'Chocolates',
    image: img.truffleBox,
    link: '/shop',
    items: [
      { n: 'Classic Truffles (Box of 6)', p: 340 },
      { n: 'Berry Truffles (Box of 6)', p: 360 },
      { n: 'Heart Truffles (Box of 6)', p: 380 },
      { n: 'Chocolate Hearts', p: 60 },
      { n: 'Assorted Box', p: 599, badge: 'Gift' },
    ],
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

function PriceRow({ name, price, badge }) {
  return (
    <div className="cc-menu-row">
      <span className="cc-menu-row__name">
        {name}
        {badge && <span className="cc-menu-row__badge">{badge}</span>}
      </span>
      <span className="cc-menu-row__price">
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
                src={u(img.cheesecakeQuartet, 1000, 800)}
                alt="Assorted cheesecake quartet from Cake & Crumb's menu"
                className="cc-menu-hero__img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── OUR DELICIOUS TREATS — 4 category cards (2x2) ───── */}
      <section className="cc-menu-treats">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="eyebrow">Our Delicious Treats</span>
            <div className="cc-menu-flourish" aria-hidden>
              <TbCake size={22} />
            </div>
          </div>

          <div className="cc-menu-grid">
            {CARDS.map((card) => (
              <article className="cc-menu-card" key={card.title}>
                <img
                  src={u(card.image, 600, 700)}
                  alt={card.title}
                  className="cc-menu-card__img"
                  loading="lazy"
                />
                <div className="cc-menu-card__body">
                  <h3 className="cc-menu-card__title">{card.title}</h3>
                  <span className="cc-menu-card__rule" aria-hidden />
                  <div className="cc-menu-card__items">
                    {card.items.map((it) => (
                      <PriceRow key={it.n} name={it.n} price={it.p} badge={it.badge} />
                    ))}
                  </div>
                  <Link to={card.link} className="cc-menu-card__viewall">
                    View All {card.title} <FiArrowRight />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Sweet Treats & More */}
          <div className="row g-4 align-items-center mt-5">
            <div className="col-md-4">
              <img
                src={u(img.macarons, 700, 600)}
                alt="Sweet Treats — macarons and cake pops"
                className="cc-menu-sweet__img"
              />
            </div>
            <div className="col-md-8">
              <h3 className="cc-menu-sweet__title">Sweet Treats &amp; More</h3>
              <span className="cc-menu-card__rule" aria-hidden />
              <div className="row g-md-4 mt-2">
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
              <Link to="/shop" className="cc-menu-card__viewall mt-3">
                View All Treats <FiArrowRight />
              </Link>
            </div>
          </div>

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
