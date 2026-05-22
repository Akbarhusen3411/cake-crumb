import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta.js'
import {
  FiHeart, FiShoppingBag, FiGift, FiCoffee, FiInstagram,
} from 'react-icons/fi'
import { TbLeaf } from 'react-icons/tb'
import { featured } from '../data/products.js'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'
import { useCart } from '../context/CartContext.jsx'
import HeartDivider from '../components/HeartDivider.jsx'

// Instagram-style tile grid for the bottom of the home page.
const IG_TILES = [
  img.cupcakesRose,
  img.cupcakesPink,
  img.truffleBox,
  img.cakeChocolateBirthday,
  img.cookies,
  img.cheesecakeStrawberry,
  img.cupcakesQuartet,
]

export default function Home() {
  const { add } = useCart()
  usePageMeta({
    title: 'Home',
    description: 'Cake & Crumb — handcrafted cheesecakes, milk cakes, cookies and desserts. Made with love. Order on WhatsApp.',
  })

  return (
    <>
      {/* ───── HERO — professional width, split: text left, rounded-card image right ───── */}
      <section className="cc-home-hero">
        <div className="container py-5">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="eyebrow mb-3 d-inline-flex">Welcome to Cake &amp; Crumb</span>
              <h1 className="cc-home-hero__title">
                Indulge in<br />Every Bite
              </h1>
              <HeartDivider width={50} />
              <p className="cc-home-hero__lede">
                Handcrafted chocolate and berry delights made with the finest ingredients
                and a passion for perfection.
              </p>
              <Link to="/shop" className="btn-rose mt-3">
                <FiShoppingBag /> Shop Now
              </Link>
            </div>
            <div className="col-lg-6">
              <img
                src={u(img.pinkRoses, 1100, 900)}
                alt="Soft pink rose bouquet"
                className="cc-home-hero__img"
                fetchpriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── FEATURE STRIP — 3 cells with vertical dividers ───── */}
      <section className="cc-home-features">
        <div className="container py-4">
          <div className="feature-row">
            {[
              { Icon: TbLeaf, title: 'Premium Ingredients', text: 'We use only the finest chocolate and berries.' },
              { Icon: FiHeart, title: 'Made With Love', text: 'Handcrafted with care and attention to detail.' },
              { Icon: FiGift, title: 'Perfect for Any Occasion', text: 'From birthdays to weddings, we make every moment extra special.' },
            ].map(({ Icon, title, text }) => (
              <div className="feature-cell" key={title}>
                <span className="feature-icon"><Icon size={22} /></span>
                <div>
                  <div className="tag-badge mb-1">{title}</div>
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── SIGNATURE TREATS — 4 product cards in a row ───── */}
      <section className="cc-home-signature">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="eyebrow">Our Signature Treats</span>
            <h2 className="section-title mt-3">Handcrafted Just for You</h2>
            <HeartDivider width={50} />
          </div>
          <div className="row g-3 g-md-4">
            {featured.map((p) => (
              <div className="col-6 col-lg-3" key={p.id}>
                <article className="product-card cc-treat-card">
                  <img src={u(p.img, 600, 600)} alt={p.name} loading="lazy" />
                  <div className="p-3 text-center">
                    <h5 className="cc-treat-card__name">{p.name}</h5>
                    <div className="cc-treat-card__price">{inr(p.price)}</div>
                    <button
                      className="btn-rose justify-content-center w-100 cc-treat-card__btn"
                      onClick={() => add(p)}
                    >
                      <FiShoppingBag size={12} /> Add to Cart
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── ABOUT — full-bleed split: image / text / icon stack ───── */}
      <section className="cc-home-about">
        <div className="container-fluid p-0">
          <div className="row g-0 align-items-stretch">
            <div className="col-lg-4">
              <img
                src={u(img.pinkRoses, 800, 700)}
                alt="Soft pink roses bouquet"
                className="cc-home-about__img"
              />
            </div>
            <div className="col-lg-5 d-flex align-items-center">
              <div className="cc-home-about__text">
                <span className="eyebrow">About Us</span>
                <h2 className="cc-home-about__title">
                  A little sweetness<br />for every moment
                </h2>
                <HeartDivider width={50} />
                <p className="cc-home-about__lede">
                  At Cake &amp; Crumb, we believe every treat tells a story. From rich chocolate
                  to sweet berries, our creations are made with love, the finest ingredients,
                  and a passion for perfection.
                </p>
                <Link to="/about" className="btn-rose">
                  <FiHeart /> Learn More
                </Link>
              </div>
            </div>
            <div className="col-lg-3 d-flex align-items-center">
              <div className="cc-home-about__features">
                {[
                  { Icon: FiCoffee, title: 'Freshly Made', text: 'Every order is made fresh with love.' },
                  { Icon: TbLeaf, title: 'Quality First', text: 'We source the finest ingredients.' },
                  { Icon: FiHeart, title: 'Custom Orders', text: 'We create your dream treats.' },
                ].map(({ Icon, title, text }) => (
                  <div key={title} className="cc-home-about__feature">
                    <span className="feature-icon" style={{ width: 46, height: 46 }}>
                      <Icon size={16} />
                    </span>
                    <div>
                      <div className="tag-badge mb-1">{title}</div>
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── INSTAGRAM — 7 thumbs in a row + VIEW MORE ───── */}
      <section className="cc-home-ig">
        <div className="container py-5">
          <div className="text-center mb-4">
            <span className="eyebrow">Follow Us on Instagram</span>
          </div>
          <div className="cc-ig-grid">
            {IG_TILES.map((src, i) => (
              <a
                key={i}
                href="https://www.instagram.com/cake_and_crumb_1/"
                target="_blank"
                rel="noopener noreferrer"
                className="ig-tile"
              >
                <img src={u(src, 400, 400)} alt="" loading="lazy" />
                <span className="ig-tile__hover">
                  <FiInstagram size={22} />
                </span>
              </a>
            ))}
          </div>
          <div className="text-center mt-4">
            <a
              href="https://www.instagram.com/cake_and_crumb_1/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-rose"
            >
              <FiInstagram /> View More
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
