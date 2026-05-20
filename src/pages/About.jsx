import { FiHeart } from 'react-icons/fi'
import PageHero from '../components/PageHero.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import FeatureStrip from '../components/FeatureStrip.jsx'
import { img, u } from '../data/images.js'

const valueIcons = [
  { icon: 'love', title: 'Made with Love', text: 'Every treat is handmade with care and attention to detail.' },
  { icon: 'premium', title: 'Finest Ingredients', text: 'We use only premium chocolate, fresh berries, and quality ingredients.' },
  { icon: 'gift', title: 'Crafted with Care', text: 'Each order is crafted to perfection, just for you.' },
]

const whyItems = [
  { icon: 'premium', title: 'Fresh & Quality', text: 'We source the freshest ingredients for the best taste and quality.' },
  { icon: 'gift', title: 'Custom Orders', text: 'From birthdays to weddings, we create custom treats just for your special moments.' },
  { icon: 'love', title: 'Happiness Guaranteed', text: 'Your smile is our reward. We ensure every bite brings joy and delight.' },
  { icon: 'truck', title: 'On-Time Delivery', text: 'We deliver your treats fresh and on time, every time.' },
]

export default function About() {
  usePageMeta({
    title: 'About',
    description: 'Our story — Cake & Crumb is a small home boutique baking gourmet cheesecakes, milk cakes and cookies with love and the finest ingredients.',
  })
  return (
    <>
      <PageHero
        eyebrow="About Cake & Crumb"
        title={<>Our Story is<br />Baked with Love</>}
        text="At Cake & Crumb, we believe every treat tells a story. From rich chocolate to sweet berries, our creations are made with love, the finest ingredients, and a passion for perfection."
        cta={
          <button className="btn-rose mt-4">
            <FiHeart /> Our Journey
          </button>
        }
        image={u(img.pipingBags, 1000, 750)}
        imageAlt="Behind-the-scenes piping bags at our bakery"
      />

      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <img
                src={u(img.pinkDripCake2, 800, 900)}
                alt="Milk cake with rose and pistachio — handcrafted by Cake & Crumb"
                style={{ width: '100%', borderRadius: 16, aspectRatio: '4/5', objectFit: 'cover' }}
              />
            </div>
            <div className="col-lg-4">
              <span className="tag-badge">Our Story</span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2rem)', margin: '0.6rem 0 1rem' }}>
                A Passion for Perfection
              </h2>
              <p>
                Cake & Crumb was born from a simple love for baking and the joy it brings to people's
                lives. What started in a small home kitchen has grown into a boutique where every cake,
                cupcake, and cookie is crafted with care and creativity.
              </p>
              <p>
                We use the finest ingredients, combine timeless recipes with modern flavors, and add a
                personal touch to every creation. Whether it's a celebration or a quiet treat, we're
                here to make it sweeter.
              </p>
              <button className="btn-rose mt-2">
                <FiHeart /> Meet Our Baker
              </button>
            </div>
            <div className="col-lg-3">
              <div
                className="p-4"
                style={{ background: 'var(--cc-cream)', borderRadius: 16 }}
              >
                {valueIcons.map((v, i) => (
                  <div key={i} className="d-flex mb-4" style={{ gap: '0.8rem' }}>
                    <span className="feature-icon" style={{ width: 42, height: 42, fontSize: '1rem', flexShrink: 0 }}>
                      <FiHeart size={16} />
                    </span>
                    <div>
                      <div className="tag-badge mb-1">{v.title}</div>
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>{v.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow">Why Choose Us</span>
            <h2 className="section-title mt-3">More Than Just Desserts</h2>
            <div className="heart-divider"><span aria-hidden>♥</span></div>
          </div>
          <FeatureStrip items={whyItems} columns={4} />
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title">A Peek Into Our Kitchen</h2>
            <div className="heart-divider"><span aria-hidden>♥</span></div>
          </div>
          <div className="row g-3">
            {[img.milkcakeRose, img.cupcakesRose, img.flourSplash, img.cakeStand, img.truffleBox].map(
              (id, i) => (
                <div className="col-6 col-md" key={i}>
                  <img
                    src={u(id, 500, 500)}
                    alt=""
                    style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12 }}
                    loading="lazy"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </>
  )
}
