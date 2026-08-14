import { Link } from 'react-router-dom'
import {
  FiHeart, FiGift, FiTruck, FiShield, FiMessageCircle,
  FiShoppingBag, FiArrowRight,
} from 'react-icons/fi'
import { TbLeaf, TbCake } from 'react-icons/tb'
import { usePageMeta } from '../hooks/usePageMeta.js'
import HeartDivider from '../components/HeartDivider.jsx'
import CertBadges from '../components/CertBadges.jsx'
import { img, u } from '../data/images.js'

/**
 * STORY_FEATURES sat beside the story text; WHY_FEATURES ran underneath it.
 * Seven tiles, four claims: "Made with Love" and "Crafted with Care" were the
 * same thing, "Finest Ingredients" and "Fresh & Quality" were the same thing,
 * and both also appear on the Reviews promise strip. Three beside the story,
 * four below, all saying you care — it read as filler.
 *
 * Now: three next to the story (how it's made), four below (what you get from
 * ordering), no overlap between them or with Reviews.
 *
 * TWO PROMISES WERE REMOVED, deliberately:
 *   • "On-Time Delivery — fresh and on time, every time" is an absolute
 *     guarantee one kitchen cannot make, and it contradicts a site that asks
 *     for a day's notice.
 *   • "Happiness Guaranteed" implies far more than the refund policy actually
 *     offers (a 30-minute cancellation window, or a confirmed quality issue).
 *     A guarantee written here and not honoured there is worse than no
 *     guarantee at all.
 */
const STORY_FEATURES = [
  { Icon: FiHeart, title: 'Made by hand',       text: 'Piped, layered and finished by hand — never machine-made.' },
  { Icon: TbLeaf,  title: 'Real ingredients',   text: 'Premium chocolate, fresh berries, real cream. No shortcuts.' },
  { Icon: TbCake,  title: 'Baked to order',     text: 'Nothing sits on a shelf. Your cake is made after you order it.' },
]

const WHY_FEATURES = [
  { Icon: FiGift,      title: 'Custom orders',    text: 'Birthdays, weddings, anniversaries — send us the idea and we will quote it.' },
  { Icon: FiTruck,     title: 'Delivery or pickup', text: 'Delivered to your door, or collect from us in Vaso.' },
  { Icon: FiShield,    title: 'Registered kitchen', text: 'FSSAI-registered and Udyam-registered — the numbers are below.' },
  { Icon: FiMessageCircle, title: 'One place to ask', text: 'Every order and question runs through one WhatsApp chat.' },
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
              {/* Was a <button> with no onClick and no link — the hero's main
                  call to action did nothing at all when tapped. It now takes
                  you to the story it is named after. */}
              <a href="#our-story" className="btn-rose mt-3">
                <FiHeart /> Our Journey
              </a>
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

      {/* ───── OUR STORY — 3 cols: baker image / text / bordered features card ─────
          `id` is the target of the hero's "Our Journey" button. `scroll-margin-top`
          in the CSS keeps the sticky header off the heading when it lands. */}
      <section className="cc-about-story" id="our-story">
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

          {/* The badges carry the numbers, which is the whole point — anyone who
              wants to check looks the number up on the government portal. The
              blurb-plus-"Verify on the …" list that used to sit here just said
              the same thing again in longer form. `blurb` / `verifyUrl` /
              `verifyLabel` stay in certifications.js as reference. */}
          <CertBadges />
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

      {/* ───── CLOSING CTA ─────
          This page had NO links at all — not one. Someone read the story,
          decided they liked the place, and hit a wall: no shop, no contact, no
          way to act on it. About is often the last page before a decision, so
          it now ends with the two things they might want to do next. */}
      <section className="cc-about-cta">
        <div className="container py-5 text-center">
          <h2 className="section-title">Shall We Bake for You?</h2>
          <HeartDivider width={50} />
          <p className="cc-about-cta__lede">
            Browse what we make, or tell us about the occasion and we'll quote it on WhatsApp.
          </p>
          <div className="cc-about-cta__actions">
            <Link to="/shop" className="btn-rose">
              <FiShoppingBag size={15} /> Browse the shop
            </Link>
            <Link to="/contact" className="cc-about-cta__link">
              Plan a custom cake <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
