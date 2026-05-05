import { Link } from 'react-router-dom'
import {
  FiHeart, FiShoppingBag, FiInstagram, FiGift, FiCoffee,
} from 'react-icons/fi'
import { TbLeaf } from 'react-icons/tb'
import { featured } from '../data/products.js'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'
import { useCart } from '../context/CartContext.jsx'

function Ornament() {
  return (
    <span className="ornament" aria-hidden>
      <svg width="80" height="14" viewBox="0 0 80 14">
        <path
          d="M2 7 Q 14 -2 28 7 M 52 7 Q 66 -2 78 7"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M40 4 L37 9 L40 12 L43 9 Z" fill="currentColor" opacity="0.7" />
      </svg>
    </span>
  )
}

export default function Home() {
  const { add } = useCart()
  return (
    <>
      {/* HERO --- full-bleed split */}
      <section className="hero-split">
        <div className="container-fluid p-0">
          <div className="row g-0 align-items-stretch">
            <div className="col-lg-6 d-flex align-items-center">
              <div className="px-4 px-md-5 py-5" style={{ maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
                <span className="eyebrow mb-3 d-inline-flex">Welcome to Cake & Crumb</span>
                <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '1rem 0' }}>
                  Indulge in<br />Every Bite
                </h1>
                <Ornament />
                <p style={{ marginTop: '1rem', maxWidth: 420 }}>
                  Handcrafted chocolate and berry delights made with the finest ingredients and a
                  passion for perfection.
                </p>
                <Link to="/shop" className="btn-rose mt-4">
                  <FiShoppingBag /> Shop Now
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <img
                src={u(img.heroRoses, 1100, 900)}
                alt="Pink roses bouquet"
                className="hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP --- 3 cells with vertical dividers */}
      <section style={{ background: 'var(--cc-cream)' }}>
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
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE TREATS */}
      <section className="bg-cream py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow">Our Signature Treats</span>
            <h2 className="section-title mt-3">Handcrafted Just for You</h2>
            <Ornament />
          </div>
          <div className="row g-4">
            {featured.map((p) => (
              <div className="col-6 col-lg-3" key={p.id}>
                <article className="product-card">
                  <img src={u(p.img, 600, 600)} alt={p.name} loading="lazy" />
                  <div className="p-3 text-center">
                    <h5 style={{ fontSize: '1.05rem', margin: '0 0 0.4rem' }}>{p.name}</h5>
                    <div style={{ color: 'var(--cc-rose)', fontWeight: 700, marginBottom: '0.7rem' }}>
                      {inr(p.price)}
                    </div>
                    <button
                      className="btn-rose justify-content-center w-100"
                      style={{ fontSize: '0.7rem', padding: '0.5rem 1rem' }}
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

      {/* ABOUT US --- 3 columns: image / text / icon stack */}
      <section style={{ background: 'var(--cc-blush)' }} className="py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-4">
              <img
                src={u(img.pinkRoses, 700, 600)}
                alt="Pink roses"
                style={{ width: '100%', borderRadius: 14, aspectRatio: '5/4', objectFit: 'cover' }}
              />
            </div>
            <div className="col-lg-5 text-center text-lg-start">
              <span className="eyebrow">About Us</span>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', marginTop: '1rem' }}>
                A little sweetness<br />for every moment
              </h2>
              <Ornament />
              <p style={{ marginTop: '0.8rem' }}>
                At Cake & Crumb, we believe every treat tells a story. From rich chocolate to
                sweet berries, our creations are made with love, the finest ingredients, and a
                passion for perfection.
              </p>
              <Link to="/about" className="btn-rose mt-2">
                <FiHeart /> Learn More
              </Link>
            </div>
            <div className="col-lg-3">
              {[
                { Icon: FiCoffee, title: 'Freshly Made', text: 'Every order is made fresh with love.' },
                { Icon: TbLeaf, title: 'Quality First', text: 'We source the finest ingredients.' },
                { Icon: FiHeart, title: 'Custom Orders', text: 'We create your dream treats.' },
              ].map(({ Icon, title, text }) => (
                <div key={title} className="d-flex align-items-start mb-3" style={{ gap: '0.8rem' }}>
                  <span className="feature-icon" style={{ width: 48, height: 48 }}>
                    <Icon size={18} />
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
      </section>

      {/* SIGNATURE CAKE BANNER --- pink drip cake spotlight */}
      <section className="hero-split">
        <div className="container-fluid p-0">
          <div className="row g-0 align-items-stretch flex-lg-row-reverse">
            <div className="col-lg-7">
              <img
                src="/hero-cake.jpeg"
                alt="Signature pink drip cake with roses and raspberries"
                className="hero-img"
                style={{ borderRadius: 0 }}
              />
            </div>
            <div className="col-lg-5 d-flex align-items-center">
              <div className="px-4 px-md-5 py-5" style={{ maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                <span className="eyebrow mb-3 d-inline-flex">Our Signature</span>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', lineHeight: 1.1, margin: '1rem 0' }}>
                  Pink Drip Cake<br />with Roses
                </h2>
                <Ornament />
                <p style={{ marginTop: '1rem' }}>
                  A buttery vanilla milk cake draped in soft pink white-chocolate ganache, crowned
                  with fresh roses and raspberries. Hand-decorated to order — perfect for birthdays,
                  anniversaries, and every sweet celebration.
                </p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: '0.6rem' }}>
                  <Link to="/shop" className="btn-rose">
                    <FiShoppingBag /> Order Now
                  </Link>
                  <Link to="/menu" className="btn-outline-rose">
                    View Full Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTAGRAM --- 7 thumbnails */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow"><FiInstagram /> Follow Us on Instagram</span>
          </div>
          <div className="row g-2 g-md-3">
            {[
              img.pinkRoses, img.cupcakesRose, img.truffleBox,
              img.pinkDripCake2, img.cookies, img.cupcakesPink, img.berryCake,
            ].map((id, i) => (
              <div className="col-4 col-md" key={i}>
                <img
                  src={u(id, 400, 400)}
                  alt=""
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12 }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <a href="#" className="btn-rose"><FiInstagram /> View More</a>
          </div>
        </div>
      </section>
    </>
  )
}
