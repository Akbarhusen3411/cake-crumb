import { usePageMeta } from '../hooks/usePageMeta.js'
import HeartDivider from '../components/HeartDivider.jsx'
import { img, u } from '../data/images.js'

const gallery = [
  { id: img.rcCakeYellowRose, alt: 'Yellow rose buttercream cake' },
  { id: img.rcCupcakesFloralRose, alt: 'Floral rose buttercream cupcakes' },
  { id: img.rcTrufflesRosePistachio, alt: 'Rose & pistachio heart truffles' },
  { id: img.rcCheesecakeBlueberry, alt: 'Blueberry cheesecake' },
  { id: img.rcCookiesDoubleChocolate, alt: 'Double chocolate cookies' },
  { id: img.rcCupcakesRedVelvet, alt: 'Red velvet cupcakes' },
  { id: img.rcCakeHeartMa, alt: 'Pink heart rose celebration cake' },
  { id: img.rcCakeChocolateCaramel, alt: 'Chocolate caramel drip cake' },
  { id: img.rcCupChocolateMangoDuo, alt: 'Chocolate & mango dessert cups' },
  { id: img.rcMilkcakeRosePistachioDomes, alt: 'Rose & pistachio milk cakes' },
  { id: img.rcBrownieLava, alt: 'Molten chocolate lava brownie' },
  { id: img.rcCheesecakePistachio, alt: 'Pistachio cheesecake slices' },
  { id: img.rcCakePinkNumber, alt: 'Pink rosette number cake' },
  { id: img.rcJellyRainbow, alt: 'Rainbow layered jelly cups' },
  { id: img.rcCakeRedVelvetHearts, alt: 'Red velvet celebration cake' },
  { id: img.rcCupcakesPinkPurpleSwirl, alt: 'Pink & purple swirl cupcakes' },
  { id: img.rcPlatterPancakeStrawberry, alt: 'Strawberry pancake stack' },
  { id: img.rcTrufflesDarkBox, alt: 'Dark chocolate heart truffle gift box' },
  { id: img.rcCakeBlueberryLavender, alt: 'Blueberry lavender layer cake' },
  { id: img.rcCupNutella, alt: 'Nutella dessert cups' },
  { id: img.rcCakeCoffeeCaramel, alt: 'Coffee caramel birthday cake' },
  { id: img.rcMilkcakeTresRose, alt: 'Trés léches with rose & pistachio' },
  { id: img.rcTrufflesChocolateHearts, alt: 'Chocolate heart truffles' },
  { id: img.rcCupcakesFloralMothersDay, alt: 'Floral buttercream cupcake gift box' },
  { id: img.rcCupcakesRainbow, alt: 'Rainbow sprinkle cupcakes' },
  { id: img.rcCupRedVelvetCream, alt: 'Red velvet cream dessert cup' },
  { id: img.rcCupOreo, alt: 'Cookies & cream dessert cup' },
  { id: img.rcCupRoseCream, alt: 'Rose cream dessert cups' },
  { id: img.rcCupPistachioCream, alt: 'Pistachio cream dessert cup' },
  { id: img.rcCupStrawberrySprinkles, alt: 'Strawberry cream dessert cup' },
  { id: img.rcCupBiscoffCream, alt: 'Biscoff cream dessert cup' },
  { id: img.rcCupChocolateGanache, alt: 'Chocolate ganache dessert cup' },
  { id: img.rcCupChocolateMousseTray, alt: 'Tray of chocolate mousse cups' },
  { id: img.rcCupChocolateRosette, alt: 'Chocolate rosette dessert cup' },
  { id: img.rcCupRedVelvetPair, alt: 'Red velvet cream cups' },
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
