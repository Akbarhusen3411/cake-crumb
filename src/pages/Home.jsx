import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta.js'
import {
  FiHeart, FiShoppingBag, FiGift,
  FiSearch, FiMessageCircle, FiClock, FiStar, FiArrowRight,
} from 'react-icons/fi'
import { TbLeaf, TbCake } from 'react-icons/tb'
import { featured } from '../data/products.js'
import { img, u, srcSet } from '../data/images.js'
import { inr } from '../data/format.js'
import { useCart } from '../context/CartContext.jsx'
import HeartDivider from '../components/HeartDivider.jsx'
import CertBadges from '../components/CertBadges.jsx'
import InstagramFeed from '../components/InstagramFeed.jsx'

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
              {/* "chocolate and berry delights" named a line the shop does not
                  sell (there is no chocolate category, and none of the 207 rows
                  on the counter menu is a truffle) while leaving out most of
                  what it does. It also said "the finest ingredients" for the
                  first of what used to be three times on this page. */}
              <p className="cc-home-hero__lede">
                Cheesecakes, milk cakes, cupcakes and cookies — handmade to order
                for birthdays, festivals and ordinary Tuesdays.
              </p>
              <Link to="/shop" className="btn-rose mt-3">
                <FiShoppingBag /> Shop Now
              </Link>
            </div>
            <div className="col-lg-6">
              {/* The bakery's own work, not a stock bouquet. The hero of a
                  bakery — the LCP image, above the fold — was a photograph of
                  roses, while 47 real photos sat unused on /gallery. srcSet
                  keeps the swap weight-neutral: at these sizes nearly every
                  viewport takes the 800w variant (39 KB, against the 40 KB the
                  roses cost). The frame is 5/4 and the source is 16/9, so cover
                  trims the dark glass at each edge and leaves the tubs. */}
              <img
                src={u(img.rcOwnMilkcakeTubs)}
                srcSet={srcSet(img.rcOwnMilkcakeTubs)}
                sizes="(min-width: 992px) 50vw, 100vw"
                alt="Eight bento tubs of milk cake — chocolate, blueberry, vanilla, Biscoff, strawberry, pistachio and mango"
                className="cc-home-hero__img"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── FEATURE STRIP — 3 cells with vertical dividers ───── */}
      <section className="cc-home-features">
        <div className="container py-4">
          <div className="feature-row">
            {/* Home's own three, not a third copy of everyone else's.
                These used to be "Premium Ingredients / Made With Love / Perfect
                for Any Occasion" — near-identical to the About strip AND the
                Reviews strip, so browsing Home → About → Reviews read the same
                reassurance three times in slightly different words.
                These say things only Home needs to: how much there is, that
                nothing is pre-made, and that custom work is welcome. */}
            {[
              { Icon: TbCake, title: '120+ Treats', text: 'Cheesecakes, milk cakes, cookies, cupcakes, bakes and drinks.' },
              { Icon: TbLeaf, title: 'Nothing Pre-Made', text: 'Your order is baked after you place it — never off a shelf.' },
              { Icon: FiGift, title: 'Made to Your Brief', text: 'Send a photo and an occasion; we quote custom work on WhatsApp.' },
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
          <CertBadges className="mt-4" />
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

      {/* ───── HOW TO ORDER ─────
          The home page had exactly one link to /shop and never explained how
          ordering works, so a first-time visitor had to infer it. Three steps,
          then the two things people actually hesitate over: when it's ready and
          how they pay.

          NOTE: no distance is quoted here. The delivery km is bakery-side only
          — the customer sees a fee, never a radius (see CLAUDE.md, Delivery). */}
      <section className="cc-home-how">
        <div className="container py-5">
          <div className="text-center mb-4">
            <span className="eyebrow mb-3 d-inline-flex">How It Works</span>
            <h2 className="cc-home-how__title">Ordering Is Simple</h2>
            <HeartDivider width={50} />
          </div>

          <div className="cc-home-how__steps">
            {[
              {
                Icon: FiSearch,
                step: '01',
                title: 'Choose your treats',
                text: 'Browse the shop and pick your flavours and sizes — by the piece or by the box.',
              },
              {
                Icon: FiMessageCircle,
                step: '02',
                title: 'Send the order',
                text: 'Checkout opens WhatsApp with your basket ready. We reply to confirm the date and the total.',
              },
              {
                Icon: FiGift,
                step: '03',
                title: 'Baked fresh for you',
                text: 'Everything is made to order, then packed for pickup or delivery to your door.',
              },
            ].map(({ Icon, step, title, text }) => (
              <div key={step} className="cc-home-how__step">
                <span className="cc-home-how__num">{step}</span>
                <span className="cc-features-card__icon cc-features-card__icon--lg">
                  <Icon size={22} />
                </span>
                <h3 className="cc-home-how__step-title">{title}</h3>
                <p className="cc-home-how__step-text">{text}</p>
              </div>
            ))}
          </div>

          <div className="cc-home-how__facts">
            <span><FiClock size={14} /> Order a day ahead — order late and it's ready the next day</span>
            <span><FiShoppingBag size={14} /> UPI or Cash on Delivery</span>
            <span><FiHeart size={14} /> Delivery charge shown at checkout</span>
          </div>

          <div className="cc-home-how__cta">
            <Link to="/shop" className="btn-rose">
              <FiShoppingBag size={15} /> Start your order
            </Link>
            <Link to="/reviews" className="cc-home-how__link">
              <FiStar size={14} /> Read customer reviews <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ───── ABOUT — full-bleed split: image / text ─────
          There was a third column of icons here: Freshly Made / Quality First /
          Custom Orders. It restated the feature strip at the top of this same
          page almost line for line — "Freshly Made" against "Nothing Pre-Made",
          "Custom Orders" against "Made to Your Brief" — so Home told you twice
          in one scroll. The top strip is the more specific of the two and it
          carries the registration badges, so it stayed. The two remaining
          columns are 6/6 where they were 4/5/3. */}
      <section className="cc-home-about">
        <div className="container-fluid p-0">
          <div className="row g-0 align-items-stretch">
            <div className="col-lg-6">
              {/* Also the roses, so the same file appeared twice on one page.
                  A tall shot suits this slot: the column stretches to the height
                  of the text beside it, and cover keeps the drip and the biscuit
                  crown. */}
              <img
                src={u(img.rcOwnBiscoffDripTop)}
                srcSet={srcSet(img.rcOwnBiscoffDripTop)}
                sizes="(min-width: 992px) 50vw, 100vw"
                alt="Biscoff drip cake topped with Lotus biscuits"
                className="cc-home-about__img"
              />
            </div>
            <div className="col-lg-6 d-flex align-items-center">
              <div className="cc-home-about__text">
                <span className="eyebrow">About Us</span>
                <h2 className="cc-home-about__title">
                  A little sweetness<br />for every moment
                </h2>
                <HeartDivider width={50} />
                {/* Was the About page's hero lede word for word — and it said
                    "the finest ingredients and a passion for perfection" for the
                    second time on this page, the hero above having said it
                    already. Someone reading Home then About met the same
                    paragraph twice. This says something neither of them does. */}
                <p className="cc-home-about__lede">
                  Cake &amp; Crumb began in a home kitchen in Vaso and still bakes like
                  one — small batches, piped and finished by hand, and nothing made
                  until you have ordered it.
                </p>
                <Link to="/about" className="btn-rose">
                  <FiHeart /> Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── INSTAGRAM ─────
          Was a hand-rolled grid of seven library photos under a "Follow Us on
          Instagram" heading — i.e. not Instagram. InstagramFeed already existed
          for exactly this, fully written and imported nowhere: it renders the
          real SnapWidget feed when VITE_SNAPWIDGET_ID is set and an honest
          fallback when it isn't. */}
      <InstagramFeed />
    </>
  )
}
