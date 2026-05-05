import PageHero from '../components/PageHero.jsx'
import { img, u } from '../data/images.js'

const gallery = [
  img.pinkDripCake, img.cupcakesPink, img.truffleBox, img.berryCake,
  img.cookies, img.cupcakesRose, img.macarons, img.chocolateCake,
  img.cakePops, img.pinkDripCake2, img.brownies, img.cheesecake,
  img.bakerPiping, img.dessertTable, img.cakeStand, img.redVelvet,
]

export default function Gallery() {
  return (
    <>
      <PageHero
        eyebrow="Our Gallery"
        title={<>A Sweet Look<br />at Our Creations</>}
        text="Take a peek at the cakes, cupcakes, cookies, and chocolates we've handcrafted for our wonderful customers."
        cta={null}
        image={u(img.dessertTable, 1000, 750)}
        imageAlt="Dessert table"
      />

      <section className="py-5">
        <div className="container">
          <div className="row g-3">
            {gallery.map((id, i) => (
              <div className="col-6 col-md-4 col-lg-3" key={i}>
                <img
                  src={u(id, 600, 600)}
                  alt=""
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    borderRadius: 12,
                    transition: 'transform 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
