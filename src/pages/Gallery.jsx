import { usePageMeta } from '../hooks/usePageMeta.js'
import HeartDivider from '../components/HeartDivider.jsx'
import { img, u } from '../data/images.js'

const gallery = [
  { id: img.pinkDripCake, alt: 'Pink drip celebration cake' },
  { id: img.cupcakesPink, alt: 'Pink-frosted cupcakes' },
  { id: img.truffleBox, alt: 'Assorted chocolate truffle box' },
  { id: img.berryCake, alt: 'Fresh berry-topped cake' },
  { id: img.cookies, alt: 'Freshly baked cookies' },
  { id: img.cupcakesRose, alt: 'Rose-decorated cupcakes' },
  { id: img.macarons, alt: 'Colourful French macarons' },
  { id: img.chocolateCake, alt: 'Rich chocolate cake' },
  { id: img.cakePops, alt: 'Decorated cake pops' },
  { id: img.pinkDripCake2, alt: 'Pink drip cake with toppings' },
  { id: img.brownies, alt: 'Fudgy chocolate brownies' },
  { id: img.cheesecake, alt: 'Creamy cheesecake slice' },
  { id: img.bakerPiping, alt: 'Baker piping frosting onto a cake' },
  { id: img.dessertTable, alt: 'Dessert table spread of treats' },
  { id: img.cakeStand, alt: 'Tiered cake on a display stand' },
  { id: img.redVelvet, alt: 'Red velvet cake' },
]

export default function Gallery() {
  usePageMeta({
    title: 'Gallery',
    description: 'A peek at our handcrafted cakes, cupcakes, cookies and chocolates.',
  })
  return (
    <>
      {/* ───── HERO — matches About/Menu/Shop/Reviews ───── */}
      <section className="cc-gallery-hero">
        <div className="container py-4 py-md-5">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="eyebrow mb-3 d-inline-flex">Our Gallery</span>
              <h1 className="cc-gallery-hero__title">
                A Sweet Look<br />at Our Creations
              </h1>
              <HeartDivider width={50} />
              <p className="cc-gallery-hero__lede">
                Take a peek at the cakes, cupcakes, cookies, and chocolates we've
                handcrafted for our wonderful customers.
              </p>
            </div>
            <div className="col-lg-6">
              <img
                src={u(img.heroGallery, 1000, 800)}
                alt="Beautifully decorated cookies — flat-lay artistic shot"
                className="cc-gallery-hero__img"
                fetchpriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── GRID ───── */}
      <section className="cc-gallery-grid-wrap">
        <div className="container py-5">
          <div className="row g-3">
            {gallery.map((g, i) => (
              <div className="col-6 col-md-4 col-lg-3" key={i}>
                <img
                  src={u(g.id, 600, 600)}
                  alt={g.alt}
                  loading="lazy"
                  className="cc-gallery-tile"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
