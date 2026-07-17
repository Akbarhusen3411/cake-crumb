import { FiHeart, FiGift, FiTruck } from 'react-icons/fi'
import { TbLeaf, TbCake } from 'react-icons/tb'
import { usePageMeta } from '../hooks/usePageMeta.js'
import HeartDivider from '../components/HeartDivider.jsx'
import CertBadges from '../components/CertBadges.jsx'
import { FSSAI, UDYAM } from '../data/certifications.js'
import { img, u } from '../data/images.js'

const STORY_FEATURES = [
  { Icon: FiHeart, title: 'Made with Love',     text: 'Every treat is handmade with care and attention to detail.' },
  { Icon: TbLeaf,  title: 'Finest Ingredients', text: 'We use only premium chocolate, fresh berries, and quality ingredients.' },
  { Icon: TbCake,  title: 'Crafted with Care',  text: 'Each order is crafted to perfection, just for you.' },
]

const WHY_FEATURES = [
  { Icon: TbLeaf,  title: 'Fresh & Quality',       text: 'We source the freshest ingredients for the best taste and quality.' },
  { Icon: FiGift,  title: 'Custom Orders',         text: 'From birthdays to weddings, we create custom treats just for your special moments.' },
  { Icon: FiHeart, title: 'Happiness Guaranteed',  text: 'Your smile is our reward. We ensure every bite brings joy and delight.' },
  { Icon: FiTruck, title: 'On-Time Delivery',      text: 'We deliver your treats fresh and on time, every time.' },
]

const KITCHEN_THUMBS = [
  img.milkcakeRose,
  img.cupcakesRose,
  img.flourSplash,
  img.cakeStand,
  img.truffleBox,
]

export default function About() {
  usePageMeta({
    title: 'About',
    description: 'Our story — Cake & Crumb is a small home boutique baking gourmet cheesecakes, milk cakes and cookies with love and the finest ingredients.',
  })

  return (
    <>
      {/* ───── HERO — soft warm-pink, split: text left, pink drip cake right ───── */}
      <section className="cc-about-hero">
        <div className="container py-5">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="eyebrow mb-3 d-inline-flex">About Cake &amp; Crumb</span>
              <h1 className="cc-about-hero__title">
                Our Story is<br />Baked with Love
              </h1>
              <HeartDivider width={50} />
              <p className="cc-about-hero__lede">
                At Cake &amp; Crumb, we believe every treat tells a story. From rich chocolate
                to sweet berries, our creations are made with love, the finest ingredients,
                and a passion for perfection.
              </p>
              <button className="btn-rose mt-3">
                <FiHeart /> Our Journey
              </button>
            </div>
            <div className="col-lg-6">
              <img
                src={u(img.heroAbout, 1000, 800)}
                alt="Pink cherry cake on a white footed tray"
                className="cc-about-hero__img"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── OUR STORY — 3 cols: baker image / text / bordered features card ───── */}
      <section className="cc-about-story">
        <div className="container py-5">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-5">
              <img
                src={u(img.pipingBags, 800, 900)}
                alt="Our baker piping a fresh cake"
                className="cc-about-story__img"
              />
            </div>
            <div className="col-lg-4">
              <span className="eyebrow">Our Story</span>
              <h2 className="cc-about-story__title">A Passion for Perfection</h2>
              <p>
                Cake &amp; Crumb was born from a simple love for baking and the joy it brings
                to people's lives. What started in a small home kitchen has grown into a
                boutique where every cake, cupcake, and cookie is crafted with care and creativity.
              </p>
              <p>
                We use the finest ingredients, combine timeless recipes with modern flavors,
                and add a personal touch to every creation. Whether it's a celebration or a
                quiet treat, we're here to make it sweeter.
              </p>
              <button className="btn-rose mt-2">
                <FiHeart /> Meet Our Baker
              </button>
            </div>
            <div className="col-lg-3">
              <div className="cc-features-card">
                {STORY_FEATURES.map(({ Icon, title, text }) => (
                  <div key={title} className="cc-features-card__row">
                    <span className="cc-features-card__icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <div className="cc-features-card__heading">{title}</div>
                      <p className="cc-features-card__text">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── WHY CHOOSE US — 4 features with vertical dividers ───── */}
      <section className="cc-about-why">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="eyebrow">Why Choose Us</span>
            <h2 className="section-title mt-3">More Than Just Desserts</h2>
            <HeartDivider width={50} />
          </div>
          <div className="feature-row cc-about-why__row">
            {WHY_FEATURES.map(({ Icon, title, text }) => (
              <div className="feature-cell cc-about-why__cell" key={title}>
                <span className="cc-features-card__icon cc-features-card__icon--lg">
                  <Icon size={24} />
                </span>
                <div className="cc-features-card__heading mt-3">{title}</div>
                <p className="cc-features-card__text mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── REGISTERED & CERTIFIED — FSSAI + Udyam numbers (no scans) ───── */}
      <section className="cc-about-certs">
        <div className="container py-5">
          <div className="text-center mb-4">
            <span className="eyebrow">Registered &amp; Certified</span>
            <h2 className="section-title mt-3">A Kitchen You Can Trust</h2>
            <HeartDivider width={50} />
            <p className="cc-about-certs__lede">
              Cake &amp; Crumb is a licensed food business. You're welcome to check either
              registration yourself on the Government of India portals below.
            </p>
          </div>

          <CertBadges />

          <ul className="cc-about-certs__notes">
            {[FSSAI, UDYAM].map((c) => (
              <li key={c.number}>
                <strong>{c.label}</strong> — {c.blurb}{' '}
                <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer">
                  Verify on the {c.verifyLabel}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── KITCHEN PEEK — 5 thumbs in a row ───── */}
      <section className="cc-about-kitchen">
        <div className="container py-5">
          <div className="text-center mb-4">
            <h2 className="section-title">A Peek Into Our Kitchen</h2>
            <HeartDivider width={50} />
          </div>
          <div className="cc-kitchen-grid">
            {KITCHEN_THUMBS.map((id, i) => (
              <img
                key={i}
                src={u(id, 500, 500)}
                alt=""
                loading="lazy"
                className="cc-kitchen-grid__img"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
