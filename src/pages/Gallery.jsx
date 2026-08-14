import { usePageMeta } from '../hooks/usePageMeta.js'
import HeartDivider from '../components/HeartDivider.jsx'
import VideoStrip from '../components/VideoStrip.jsx'
import GalleryGrid from '../components/GalleryGrid.jsx'
import { img, u } from '../data/images.js'

// The bakery's own August 2026 photos lead the grid — real work first, the
// older library behind it.
//
// `cat` drives the filter chips in GalleryGrid and must be one of the names in
// its FILTERS list — a typo silently drops the photo out of every chip except
// "All", so keep the two in step.
const gallery = [
  { id: img.rcOwnMilkcakeTubs, alt: 'Eight bento tubs of milk cake in every flavour', cat: 'Milk Cakes' },
  { id: img.rcOwnBiscoffDripTop, alt: 'Biscoff drip cake topped with Lotus biscuits', cat: 'Cakes' },
  { id: img.rcOwnCupcakesOpenBox, alt: 'Open box of six assorted cupcakes', cat: 'Cupcakes' },
  { id: img.rcOwnCheesecakeMarble, alt: 'Strawberry cheesecake with piped cream', cat: 'Cheesecakes' },
  { id: img.rcOwnCakeMum, alt: 'Mum cake dressed with fresh rose petals', cat: 'Cakes', custom: true },
  { id: img.rcOwnCakeBirthdayRosettes, alt: 'Chocolate birthday cake with piped rosettes', cat: 'Cakes', custom: true },
  { id: img.rcOwnMilkcakeBlueberry, alt: 'Blueberry milk cake bento tub with gold leaf', cat: 'Milk Cakes' },
  { id: img.rcOwnCakeBirthdayBlack, alt: 'Dark chocolate birthday cake', cat: 'Cakes', custom: true },
  { id: img.rcOwnCupcakeMango, alt: 'Mango cupcake with fresh mango on top', cat: 'Cupcakes' },
  { id: img.rcOwnCakePops, alt: 'Chocolate cake pops with gold and silver leaf', cat: 'Bakes' },
  { id: img.rcOwnChocDiscsBox, alt: 'Box of dark chocolate discs', cat: 'Bakes' },
  { id: img.rcOwnCupcakesSix, alt: 'Six assorted cupcakes boxed', cat: 'Cupcakes' },

  { id: img.rcCakeYellowRose, alt: 'Yellow rose buttercream cake', cat: 'Cakes' },
  { id: img.rcCupcakesFloralRose, alt: 'Floral rose buttercream cupcakes', cat: 'Cupcakes' },
  { id: img.rcTrufflesRosePistachio, alt: 'Rose & pistachio heart truffles', cat: 'Chocolates' },
  { id: img.rcCheesecakeBlueberry, alt: 'Blueberry cheesecake', cat: 'Cheesecakes' },
  { id: img.rcCookiesDoubleChocolate, alt: 'Double chocolate cookies', cat: 'Bakes' },
  { id: img.rcCupcakesRedVelvet, alt: 'Red velvet cupcakes', cat: 'Cupcakes' },
  { id: img.rcCakeHeartMa, alt: 'Pink heart rose celebration cake', cat: 'Cakes' },
  { id: img.rcCakeChocolateCaramel, alt: 'Chocolate caramel drip cake', cat: 'Cakes' },
  { id: img.rcCupChocolateMangoDuo, alt: 'Chocolate & mango dessert cups', cat: 'Dessert Cups' },
  { id: img.rcMilkcakeRosePistachioDomes, alt: 'Rose & pistachio milk cakes', cat: 'Milk Cakes' },
  { id: img.rcBrownieLava, alt: 'Molten chocolate lava brownie', cat: 'Bakes' },
  { id: img.rcCheesecakePistachio, alt: 'Pistachio cheesecake slices', cat: 'Cheesecakes' },
  { id: img.rcCakePinkNumber, alt: 'Pink rosette number cake', cat: 'Cakes' },
  { id: img.rcJellyRainbow, alt: 'Rainbow layered jelly cups', cat: 'Dessert Cups' },
  { id: img.rcCakeRedVelvetHearts, alt: 'Red velvet celebration cake', cat: 'Cakes' },
  { id: img.rcCupcakesPinkPurpleSwirl, alt: 'Pink & purple swirl cupcakes', cat: 'Cupcakes' },
  { id: img.rcPlatterPancakeStrawberry, alt: 'Strawberry pancake stack', cat: 'Bakes' },
  { id: img.rcTrufflesDarkBox, alt: 'Dark chocolate heart truffle gift box', cat: 'Chocolates' },
  { id: img.rcCakeBlueberryLavender, alt: 'Blueberry lavender layer cake', cat: 'Cakes' },
  { id: img.rcCupNutella, alt: 'Nutella dessert cups', cat: 'Dessert Cups' },
  { id: img.rcCakeCoffeeCaramel, alt: 'Coffee caramel birthday cake', cat: 'Cakes' },
  { id: img.rcMilkcakeTresRose, alt: 'Trés léches with rose & pistachio', cat: 'Milk Cakes' },
  { id: img.rcTrufflesChocolateHearts, alt: 'Chocolate heart truffles', cat: 'Chocolates' },
  { id: img.rcCupcakesFloralMothersDay, alt: 'Floral buttercream cupcake gift box', cat: 'Cupcakes' },
  { id: img.rcCupcakesRainbow, alt: 'Rainbow sprinkle cupcakes', cat: 'Cupcakes' },
  { id: img.rcCupRedVelvetCream, alt: 'Red velvet cream dessert cup', cat: 'Dessert Cups' },
  { id: img.rcCupOreo, alt: 'Cookies & cream dessert cup', cat: 'Dessert Cups' },
  { id: img.rcCupRoseCream, alt: 'Rose cream dessert cups', cat: 'Dessert Cups' },
  { id: img.rcCupPistachioCream, alt: 'Pistachio cream dessert cup', cat: 'Dessert Cups' },
  { id: img.rcCupStrawberrySprinkles, alt: 'Strawberry cream dessert cup', cat: 'Dessert Cups' },
  { id: img.rcCupBiscoffCream, alt: 'Biscoff cream dessert cup', cat: 'Dessert Cups' },
  { id: img.rcCupChocolateGanache, alt: 'Chocolate ganache dessert cup', cat: 'Dessert Cups' },
  { id: img.rcCupChocolateMousseTray, alt: 'Tray of chocolate mousse cups', cat: 'Dessert Cups' },
  { id: img.rcCupChocolateRosette, alt: 'Chocolate rosette dessert cup', cat: 'Dessert Cups' },
  { id: img.rcCupRedVelvetPair, alt: 'Red velvet cream cups', cat: 'Dessert Cups' },
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
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───── REAL KITCHEN VIDEO ───── */}
      <VideoStrip />

      {/* ───── MOSAIC — filtered, paged, tap to enlarge ───── */}
      <section className="cc-gallery-grid-wrap">
        {/* Little padding on top — the video strip above already closes with
            its own. Together they leave one gap, not two stacked ones. */}
        <div className="container pt-2 pb-5">
          <GalleryGrid photos={gallery} />
        </div>
      </section>
    </>
  )
}
