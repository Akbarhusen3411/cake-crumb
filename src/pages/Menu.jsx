import { Link } from 'react-router-dom'
import { FiHeart, FiClock, FiPhone } from 'react-icons/fi'
import PageHero from '../components/PageHero.jsx'
import {
  cheesecakes, cookies, milkCakes, cakesAndBakes,
  dessertCups, drinks, comingSoon,
} from '../data/products.js'
import { img, u } from '../data/images.js'
import { inr } from '../data/format.js'

function Group({ title, children }) {
  return (
    <div className="mb-3">
      <div
        style={{
          color: 'var(--cc-rose)',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          margin: '0.4rem 0 0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ color: 'var(--cc-rose)' }}>✦</span> {title}
      </div>
      {children}
    </div>
  )
}

function Row({ name, badge, children }) {
  return (
    <div
      className="d-flex justify-content-between align-items-baseline py-2"
      style={{ borderBottom: '1px dashed var(--cc-border)', fontSize: '0.92rem', gap: '0.6rem' }}
    >
      <span style={{ color: 'var(--cc-cocoa)' }}>
        {name}
        {badge && (
          <span
            className="ms-2"
            style={{
              fontSize: '0.65rem',
              padding: '1px 8px',
              borderRadius: 999,
              background: 'var(--cc-blush)',
              color: 'var(--cc-rose)',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {badge}
          </span>
        )}
      </span>
      <span className="d-inline-flex align-items-baseline" style={{ gap: '1rem', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  )
}

function CategoryCard({ title, image, children, footerNote }) {
  return (
    <div
      className="p-3 p-md-4 h-100"
      style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 16 }}
    >
      <div className="d-flex align-items-center mb-3" style={{ gap: '1rem' }}>
        <img
          src={u(image, 200, 200)}
          alt={title}
          style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
        />
        <div>
          <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{title}</h3>
        </div>
      </div>
      {children}
      {footerNote && (
        <p style={{ fontSize: '0.75rem', color: 'var(--cc-cocoa-soft)', fontStyle: 'italic', marginTop: '0.6rem' }}>
          {footerNote}
        </p>
      )}
    </div>
  )
}

export default function Menu() {
  return (
    <>
      <PageHero
        eyebrow="Our Menu"
        title={<>Made with Love,<br />Baked for You</>}
        text="Indulge in our handcrafted cheesecakes, milk cakes, cookies, dessert cups, and drinks — made with the finest ingredients and a touch of love."
        cta={null}
        image={u(img.pinkDripCake2, 1000, 750)}
        imageAlt="Pink drip cake"
      />

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow">Our Delicious Treats</span>
            <h2 className="section-title mt-3">Handcrafted Just for You</h2>
            <div className="heart-divider"><span aria-hidden>♥</span></div>
          </div>

          {/* CHEESECAKES — full width */}
          <CategoryCard
            title="Cheesecake"
            image={img.cheesecake}
            footerNote='Banto 4" = 3 slices · per slice also available · *Customisable flavours on request*'
          >
            <div className="row g-3">
              {Object.entries(cheesecakes).map(([key, items]) => (
                <div className="col-md-6" key={key}>
                  <Group title={key}>
                    <div
                      className="d-flex justify-content-between"
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--cc-cocoa-soft)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        paddingBottom: '0.3rem',
                        borderBottom: '1px solid var(--cc-border)',
                        marginBottom: '0.2rem',
                      }}
                    >
                      <span>Flavour</span>
                      <span style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ minWidth: 60, textAlign: 'right' }}>Whole</span>
                        <span style={{ minWidth: 50, textAlign: 'right' }}>Slice</span>
                      </span>
                    </div>
                    {items.map((it) => (
                      <Row key={it.name} name={it.name} badge={it.badge}>
                        <span style={{ color: 'var(--cc-cocoa-soft)', fontStyle: 'italic', minWidth: 60, textAlign: 'right' }}>
                          {inr(it.whole)}
                        </span>
                        <span style={{ color: 'var(--cc-rose)', fontWeight: 700, minWidth: 50, textAlign: 'right' }}>
                          {inr(it.slice)}
                        </span>
                      </Row>
                    ))}
                  </Group>
                </div>
              ))}
            </div>
          </CategoryCard>

          <div className="row g-4 mt-1">
            {/* COOKIES */}
            <div className="col-lg-6">
              <CategoryCard title="Cookies" image={img.cookies} footerNote="*Mixed or single flavour*">
                <div
                  className="d-flex justify-content-between"
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--cc-cocoa-soft)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    paddingBottom: '0.3rem',
                    borderBottom: '1px solid var(--cc-border)',
                    marginBottom: '0.2rem',
                  }}
                >
                  <span>Flavour</span>
                  <span style={{ display: 'flex', gap: '0.7rem' }}>
                    <span style={{ minWidth: 36, textAlign: 'right' }}>Each</span>
                    <span style={{ minWidth: 44, textAlign: 'right' }}>Box 6</span>
                    <span style={{ minWidth: 50, textAlign: 'right' }}>Box 12</span>
                  </span>
                </div>
                {cookies.map((c) => (
                  <Row key={c.name} name={c.name} badge={c.badge}>
                    <span style={{ color: 'var(--cc-rose)', fontWeight: 700, minWidth: 36, textAlign: 'right' }}>
                      {inr(c.each)}
                    </span>
                    <span style={{ color: 'var(--cc-cocoa-soft)', fontStyle: 'italic', minWidth: 44, textAlign: 'right' }}>
                      {inr(c.six)}
                    </span>
                    <span style={{ color: 'var(--cc-cocoa-soft)', fontStyle: 'italic', minWidth: 50, textAlign: 'right' }}>
                      {inr(c.twelve)}
                    </span>
                  </Row>
                ))}
              </CategoryCard>
            </div>

            {/* MILK CAKES */}
            <div className="col-lg-6">
              <CategoryCard title='Milk Cake 6"' image={img.pinkDripCake} footerNote="Whole or per slice">
                <div
                  className="d-flex justify-content-between"
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--cc-cocoa-soft)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    paddingBottom: '0.3rem',
                    borderBottom: '1px solid var(--cc-border)',
                    marginBottom: '0.2rem',
                  }}
                >
                  <span>Flavour</span>
                  <span style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ minWidth: 60, textAlign: 'right' }}>Whole</span>
                    <span style={{ minWidth: 50, textAlign: 'right' }}>Slice</span>
                  </span>
                </div>
                {milkCakes.map((m) => (
                  <Row key={m.name} name={m.name} badge={m.badge}>
                    <span style={{ color: 'var(--cc-cocoa-soft)', fontStyle: 'italic', minWidth: 60, textAlign: 'right' }}>
                      {inr(m.whole)}
                    </span>
                    <span style={{ color: 'var(--cc-rose)', fontWeight: 700, minWidth: 50, textAlign: 'right' }}>
                      {inr(m.slice)}
                    </span>
                  </Row>
                ))}
              </CategoryCard>
            </div>

            {/* CAKES & BAKES */}
            <div className="col-lg-6">
              <CategoryCard title="Cakes & Bakes" image={img.cupcakesRose}>
                <Group title="Cupcakes — per piece">
                  {cakesAndBakes.cupcakes.map((it) => (
                    <Row key={it.name} name={it.name}>
                      <span style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(it.price)}</span>
                    </Row>
                  ))}
                </Group>
                <Group title="Bakes — per piece">
                  {cakesAndBakes.bakes.map((it) => (
                    <Row key={it.name} name={it.name}>
                      <span style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(it.price)}</span>
                    </Row>
                  ))}
                </Group>
                <Group title="Platters">
                  {cakesAndBakes.platters.map((it) => (
                    <Row key={it.name} name={it.name}>
                      <span style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(it.price)}</span>
                    </Row>
                  ))}
                </Group>
              </CategoryCard>
            </div>

            {/* DESSERT CUPS + DRINKS */}
            <div className="col-lg-6">
              <CategoryCard title="Desserts & Drinks" image={img.macarons}>
                <Group title="Dessert Cups">
                  {dessertCups.map((it) => (
                    <Row key={it.name} name={it.name}>
                      <span style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(it.price)}</span>
                    </Row>
                  ))}
                </Group>
                <Group title="Mojitos — per glass">
                  {drinks.mojitos.map((it) => (
                    <Row key={it.name} name={it.name}>
                      <span style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(it.price)}</span>
                    </Row>
                  ))}
                </Group>
                <Group title="Coffee">
                  {drinks.coffee.map((it) => (
                    <Row key={it.name} name={it.name}>
                      <span style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(it.price)}</span>
                    </Row>
                  ))}
                </Group>
                <Group title="Milkshakes — per glass">
                  {drinks.milkshakes.map((it) => (
                    <Row key={it.name} name={it.name}>
                      <span style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(it.price)}</span>
                    </Row>
                  ))}
                </Group>
              </CategoryCard>
            </div>
          </div>

          {/* COMING SOON */}
          <div className="mt-4">
            <CategoryCard title="Look out for…" image={img.truffleBox} footerNote="More sweetness on the way!">
              <div className="row g-2">
                {comingSoon.map((it) => (
                  <div className="col-md-6" key={it.name}>
                    <Row name={it.name}>
                      {it.soon ? (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 10px',
                            borderRadius: 999,
                            background: 'var(--cc-cream)',
                            color: 'var(--cc-rose)',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            border: '1px solid var(--cc-rose)',
                          }}
                        >
                          Coming Soon
                        </span>
                      ) : (
                        <span style={{ color: 'var(--cc-rose)', fontWeight: 700 }}>{inr(it.price)}</span>
                      )}
                    </Row>
                  </div>
                ))}
              </div>
            </CategoryCard>
          </div>

          {/* ORDER INFO */}
          <div
            className="mt-4 p-4 p-md-5"
            style={{ background: 'var(--cc-blush)', borderRadius: 16 }}
          >
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <div className="d-flex align-items-center" style={{ gap: '0.7rem' }}>
                  <span className="feature-icon" style={{ width: 44, height: 44 }}>
                    <FiClock size={18} />
                  </span>
                  <div>
                    <div className="tag-badge">Pre-order Required</div>
                    <p className="mb-0" style={{ fontSize: '0.85rem' }}>Please order at least 1 day in advance.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center" style={{ gap: '0.7rem' }}>
                  <span className="feature-icon" style={{ width: 44, height: 44 }}>
                    <FiPhone size={18} />
                  </span>
                  <div>
                    <div className="tag-badge">Place Order</div>
                    <p className="mb-0" style={{ fontSize: '0.85rem' }}>+91 90816 68490 · +91 91731 83440</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-md-end">
                <Link to="/contact" className="btn-rose">
                  Place a Custom Order <FiHeart />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
