import { Link } from 'react-router-dom'
import { FiArrowRight, FiHeart } from 'react-icons/fi'
import { TbCake } from 'react-icons/tb'
import HeartDivider from '../components/HeartDivider.jsx'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'

// Curated 5-item lists per card — keeps the page light. Full lists live in /shop.
// Each card maps to a real Shop category — "View All" deep-links to /shop?category=…
const CARDS = [
  {
    title: 'Cheesecakes',
    category: 'Cheesecakes',
    image: img.rcCheesecakeBlueberry,
    items: [
      { n: 'Strawberry', p: 350 },
      { n: 'Mango', p: 350 },
      { n: 'Blueberry', p: 410 },
      { n: 'Nutella', p: 440 },
      { n: 'Pistachio', p: 470, badge: 'Premium' },
    ],
  },
  {
    title: 'Sponge Cakes',
    category: 'Sponge Cakes',
    image: img.rcCakeYellowRose,
    items: [
      { n: 'Vanilla (Bento)', p: 450 },
      { n: 'Chocolate (Bento)', p: 470 },
      { n: 'Mango (Bento)', p: 480 },
      { n: 'Biscoff (Bento)', p: 490 },
      { n: 'Pistachio (Bento)', p: 510, badge: 'Premium' },
    ],
    note: '♥ Also available as single-serve tubs from ₹100.',
  },
  {
    title: 'Milk Cakes',
    category: 'Milk Cakes',
    image: img.rcMilkcakeRosePistachioDomes,
    items: [
      { n: 'Trés Léches (Bento)', p: 420 },
      { n: 'Rose (Bento)', p: 420 },
      { n: 'Mango (Bento)', p: 440 },
      { n: 'Biscoff (Bento)', p: 480 },
      { n: 'Pistachio (Bento)', p: 520, badge: 'Premium' },
    ],
    note: '♥ Also available as single-serve tubs from ₹120.',
  },
  {
    title: 'Cupcakes',
    category: 'Cupcakes',
    image: img.rcCupcakesRedVelvet,
    items: [
      { n: 'Vanilla (Box of 6)', p: 150 },
      { n: 'Chocolate (Box of 6)', p: 170 },
      { n: 'Strawberry (Box of 6)', p: 170 },
      { n: 'Red Velvet (Box of 6)', p: 180 },
      { n: 'Pistachio (Box of 6)', p: 190, badge: 'Premium' },
    ],
    note: '♥ Add ₹20 for floral or additional decoration.',
  },
  {
    title: 'Cookies',
    category: 'Cookies',
    image: img.rcCookiesDoubleChocolate,
    items: [
      { n: 'Classic (Box of 6)', p: 280 },
      { n: 'White Choc (Box of 6)', p: 280 },
      { n: 'Triple Choc (Box of 6)', p: 340 },
      { n: 'Almond (Box of 6)', p: 400 },
      { n: 'Pistachio & Rose', p: 400, badge: 'Special' },
    ],
  },
  {
    title: 'Dessert Cups',
    category: 'Dessert Cups',
    image: img.rcCupAssortedFlatlay,
    items: [
      { n: 'Ghas (Milk Pudding) Cup', p: 40 },
      { n: 'Jelly Cup', p: 50 },
      { n: 'Vanilla Custard Cup', p: 60 },
      { n: 'Mango Custard Cup', p: 80 },
      { n: 'Trifle Cup', p: 100 },
    ],
  },
]

const SWEET_TREATS_LEFT = [
  { n: 'Brownies', p: 'from ₹60' },
  { n: 'Blondies', p: 'from ₹60' },
  { n: 'Cake Pops (Box of 6)', p: '₹120' },
]
const SWEET_TREATS_RIGHT = [
  { n: 'Cakesicles', p: 'from ₹110' },
  { n: 'Choc Covered Strawberry', p: '₹40' },
  { n: 'Custom Orders', p: 'Message us' },
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
                src={u(img.heroMenu, 1000, 800)}
                alt="Assorted pastries arranged on ceramic trays"
                className="cc-menu-hero__img"
                fetchpriority="high"
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
                  {card.note && (
                    <p className="cc-menu-card__note">{card.note}</p>
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

          {/* Sweet Treats & More */}
          <div className="row g-4 align-items-center mt-5">
            <div className="col-md-4">
              <img
                src={u(img.rcBrownieBoxes, 700, 600)}
                alt="Sweet Treats — brownies, blondies and cake pops"
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
