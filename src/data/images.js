// Vite's base path (e.g. "/cake-crumb/" on GitHub Pages, "/" on local dev without base).
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

// Helper for /public assets — prefix with base URL so they resolve correctly under Vite's `base`.
export const asset = (path) => BASE + (path.startsWith('/') ? path : '/' + path)

// All product/decorative images now point at real photos under /public/products/.
// `u()` accepts either a string starting with "/" (returns base + path) or any other ID
// (legacy Unsplash format kept for backwards compatibility — currently unused).
export const u = (idOrPath, w = 800, h = 800) => {
  if (typeof idOrPath === 'string' && idOrPath.startsWith('/')) return BASE + idOrPath
  return `https://images.unsplash.com/photo-${idOrPath}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

const p = (name) => `/products/${name}`

export const img = {
  // ───── Hero / decorative ─────
  heroRoses: '/hero-roses.jpeg',
  pinkRoses: '/hero-roses.jpeg',
  rosesBouquet: '/hero-roses.jpeg',
  pinkDripCake: p('cake-pink-letter.jpeg'),
  pinkDripCake2: p('milkcake-rose-pistachio.jpeg'),
  cakeStand: p('cake-yellow-flowers.jpeg'),
  dessertTable: p('cheesecake-trio-flavors.jpeg'),
  pipingBags: p('piping-bags.jpeg'),
  baker: p('piping-bags.jpeg'),
  bakerPiping: p('piping-bags.jpeg'),
  flourSplash: p('bakes-plain.jpeg'),

  // ───── Cheesecakes ─────
  cheesecake: p('cheesecake-quartet.jpeg'),
  cheesecakeAssorted: p('cheesecake-assortment.jpeg'),
  cheesecakeQuartet: p('cheesecake-quartet.jpeg'),
  cheesecakeStrawberry: p('cheesecake-strawberry-rose.jpeg'),
  cheesecakeBlueberry: p('cheesecake-blueberry.jpeg'),
  cheesecakeBlueberrySlate: p('cheesecake-blueberry-slate.jpeg'),
  cheesecakeMango: p('cheesecake-mango-bowl.jpeg'),
  cheesecakeChocMango: p('cheesecake-choc-mango.jpeg'),
  cheesecakeBoxesPair: p('cheesecake-boxes-pair.jpeg'),
  cheesecakeNutella: p('cheesecake-nutella.jpeg'),
  cheesecakeCookiesCream: p('cheesecake-cookies-cream.jpeg'),
  cheesecakeCaramel: p('cheesecake-caramel.jpeg'),
  cheesecakeCoffee: p('cheesecake-trio-flavors.jpeg'),
  cheesecakePistachio: p('cheesecake-pistachio-cup.jpeg'),
  cheesecakePistachioSlices: p('cheesecake-pistachio-slices.jpeg'),
  cheesecakeChocRose: p('cheesecake-chocolate-rose.jpeg'),
  cheesecakeChocRoseBowl: p('cheesecake-chocolate-rose-bowl.jpeg'),
  cheesecakeChocPistachio: p('cheesecake-chocolate-pistachio.jpeg'),
  cheesecakeStrawberryCups: p('cheesecake-strawberry-cups.jpeg'),
  berryCake: p('milkcake-pomegranate.jpeg'),
  chocolateCake: p('cake-chocolate-birthday.jpeg'),
  chocolateBerryCake: p('cake-chocolate-birthday.jpeg'),

  // ───── Milk cakes ─────
  milkcakeBiscoff: p('cake-naked-yellow.jpeg'),
  milkcakeTres: p('cake-naked-yellow.jpeg'),
  milkcakeRose: p('milkcake-rose-purple.jpeg'),
  milkcakeRosePistachio: p('milkcake-rose-pistachio.jpeg'),
  milkcakeTurkish: p('cake-yellow-flowers.jpeg'),
  milkcakeChoc: p('cake-chocolate-birthday.jpeg'),
  milkcakeRaspberry: p('milkcake-pomegranate.jpeg'),
  milkcakePistachio: p('cheesecake-pistachio-slices.jpeg'),
  milkcakeBlueberry: p('milkcake-blueberry.jpeg'),
  milkcakeBlueberrySliced: p('milkcake-blueberry-sliced.jpeg'),
  milkcakeLemon: p('cake-lemon-drip.jpeg'),

  // ───── Cookies ─────
  cookies: p('cookies-chocolate-board.jpeg'),
  cookiesTripleChoc: p('cookies-triple-choc-pan.jpeg'),
  cookiesChunky: p('cookies-chunky.jpeg'),
  cookiesBoard: p('cookies-chocolate-board.jpeg'),

  // ───── Cupcakes ─────
  cupcakesPink: p('cupcakes-pink-purple.jpeg'),
  cupcakesRose: p('cupcakes-rose-pink.jpeg'),
  cupcakesAssorted: p('cupcakes-assorted.jpeg'),
  cupcakesQuartet: p('cupcakes-quartet.jpeg'),
  cupcakesBox: p('cupcakes-box-pink-purple.jpeg'),
  cupcakesBoxLarge: p('cupcakes-box-large.jpeg'),
  cupcakesGiftBox: p('cupcakes-gift-box.jpeg'),
  cupcakesPlain: p('cupcakes-plain.jpeg'),

  // ───── Bakes ─────
  brownies: p('bakes-chocolate-square.jpeg'),
  bakesPlain: p('bakes-plain.jpeg'),
  bakesChocolateSquare: p('bakes-chocolate-square.jpeg'),
  bakesChocolateLava: p('bakes-chocolate-lava.jpeg'),
  bakesBlueberry: p('bakes-blueberry.jpeg'),
  bakesRosePetal: p('bakes-rose-petal-bars.jpeg'),
  bakesCreamCones: p('bakes-cream-cones.jpeg'),
  cakePops: p('cake-pink-letter.jpeg'),
  redVelvet: p('cake-chocolate-birthday.jpeg'),
  cakeSlice: p('cheesecake-pistachio-slices.jpeg'),
  cakeYellowFlowers: p('cake-yellow-flowers.jpeg'),
  cakeNakedYellow: p('cake-naked-yellow.jpeg'),
  cakeChocolateBirthday: p('cake-chocolate-birthday.jpeg'),
  cakePinkLetter: p('cake-pink-letter.jpeg'),
  cakeLemonDrip: p('cake-lemon-drip.jpeg'),

  // ───── Truffles / Chocolates ─────
  truffles: p('truffles-box.jpeg'),
  truffleBox: p('truffles-hearts.jpeg'),
  trufflesHearts: p('truffles-hearts.jpeg'),

  // ───── Dessert cups ─────
  dessertCupsTrio: p('dessert-cups-trio.jpeg'),
  dessertCupsChocolate: p('dessert-cups-chocolate.jpeg'),
  dessertCupsLemon: p('dessert-cups-lemon.jpeg'),
  jellyCupsRainbow: p('jelly-cups-rainbow.jpeg'),

  // ───── Drinks ─────
  drinkVirginMojito: p('drink-virgin-mojito.jpeg'),
  drinkBlueLagoon: p('drink-blue-lagoon.jpeg'),
  drinkStrawberryMojito: p('drink-strawberry-mojito.jpeg'),

  // ───── Misc ─────
  riceKrispies: p('rice-krispies.jpeg'),
  macarons: p('bakes-rose-petal-bars.jpeg'),
  cheesecakeChocPistachioBox: p('cheesecake-chocolate-pistachio.jpeg'),
}
