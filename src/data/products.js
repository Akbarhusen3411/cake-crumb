import { img } from './images.js'

// All prices in INR. Sourced from menu.html.

// Default allergen sets per category — most baked goods share these.
const A_BAKED   = ['contains-egg', 'contains-dairy', 'contains-gluten', 'eggless-option']
const A_NUTS    = [...A_BAKED, 'contains-nuts']
const A_DRINK   = []
const A_SHAKE   = ['contains-dairy']
const A_VEGGY   = ['eggless']

// Featured cards on Home — visually distinctive picks across categories.
export const featured = [
  { id: 'feat-1', name: 'Strawberry Cheesecake', price: 350, img: img.cheesecakeStrawberry, category: 'Cheesecakes', allergens: A_BAKED },
  { id: 'feat-2', name: 'Pink Rose Cupcakes', price: 100, img: img.cupcakesRose, category: 'Cupcakes', allergens: A_BAKED },
  { id: 'feat-3', name: 'Triple Choc Cookies (Box of 6)', price: 340, img: img.cookiesTripleChoc, category: 'Cookies', allergens: A_BAKED },
  { id: 'feat-4', name: 'Pistachio Milk Cake 6"', price: 950, img: img.milkcakeRosePistachio, category: 'Milk Cakes', allergens: A_NUTS },
]

// Flat list for /shop — full PDF menu, every item orderable.
// `slice` field gives a second price option (rendered as a second add-to-cart button).
export const shopProducts = [
  // ───── CHEESECAKES — Banto 4" whole / per slice ─────
  // Classic
  { id: 'cc-strawberry', name: 'Strawberry Cheesecake', price: 350, slice: 120, img: img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-blueberry', name: 'Blueberry Cheesecake', price: 410, slice: 140, img: img.cheesecakeBlueberry, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-raspberry', name: 'Raspberry Cheesecake', price: 410, slice: 140, img: img.cheesecakeStrawberryCups, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-orange', name: 'Orange Creamsicle Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocMango, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-lemon', name: 'Lemon Cheesecake', price: 350, slice: 120, img: img.cheesecakeCookiesCream, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-rose', name: 'Rose Cheesecake', price: 350, slice: 120, img: img.cheesecakeStrawberryRose || img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  // Exotic
  { id: 'cc-mango', name: 'Mango Cheesecake', price: 350, slice: 120, img: img.cheesecakeMango, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-passion', name: 'Passion Fruit Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocMango, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-cherry', name: 'Cherry Cheesecake', price: 380, slice: 130, img: img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-guava', name: 'Guava Cheesecake', price: 350, slice: 120, img: img.cheesecakeMango, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-mango-passion', name: 'Mango & Passion Cheesecake', price: 410, slice: 140, img: img.cheesecakeMango, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-coconut', name: 'Coconut Cheesecake', price: 410, slice: 140, img: img.cheesecakeCookiesCream, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  // Chocolate
  { id: 'cc-choc', name: 'Chocolate Cheesecake (Milk & Dark)', price: 380, slice: 130, img: img.cheesecakeChocRose, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-choc-orange', name: 'Chocolate Orange Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocMango, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-blackforest', name: 'Black Forest Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocRoseBowl, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-choc-chunk', name: 'Chocolate Chunk Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocPistachio, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-nutella', name: 'Nutella Cheesecake', price: 440, slice: 150, img: img.cheesecakeNutella, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-biscoff', name: 'Biscoff Cheesecake', price: 410, slice: 140, img: img.cheesecakeCaramel, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  // Premium
  { id: 'cc-cookies-cream', name: 'Cookies & Cream Cheesecake', price: 430, slice: 150, img: img.cheesecakeCookiesCream, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-caramel', name: 'Caramel Cheesecake', price: 430, slice: 150, img: img.cheesecakeCaramel, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-coffee', name: 'Coffee Cheesecake', price: 430, slice: 150, img: img.cheesecakeCoffee, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-pistachio', name: 'Pistachio Cheesecake', price: 470, slice: 160, img: img.cheesecakePistachio, category: 'Cheesecakes', sizeLabel: 'Banto 4"', badge: 'Premium' },
  { id: 'cc-dubai', name: 'Dubai Cheesecake', price: 500, slice: 170, img: img.cheesecakeChocPistachio, category: 'Cheesecakes', sizeLabel: 'Banto 4"', badge: 'Special' },

  // ───── MILK CAKES — 6" whole / per slice ─────
  { id: 'mc-biscoff', name: 'Biscoff Milk Cake', price: 800, slice: 100, img: img.cakeNakedYellow, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-tres', name: 'Trés Léches Milk Cake', price: 800, slice: 100, img: img.milkcakeRosePistachio, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-rose', name: 'Rose Milk Cake', price: 800, slice: 100, img: img.milkcakeRose, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-turkish', name: 'Turkish Milk Cake', price: 850, slice: 110, img: img.cakeYellowFlowers, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-chocolate', name: 'Chocolate Milk Cake', price: 850, slice: 110, img: img.cakeChocolateBirthday, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-raspberry', name: 'Raspberry Milk Cake', price: 900, slice: 115, img: img.milkcakePomegranate || img.berryCake, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-pistachio', name: 'Pistachio Milk Cake', price: 950, slice: 120, img: img.cheesecakePistachioSlices, category: 'Milk Cakes', sizeLabel: '6"', badge: 'Premium' },

  // ───── COOKIES — Box of 6 / Box of 12 ─────
  { id: 'ck-triple', name: 'Triple Choc Cookies', price: 340, slice: 700, img: img.cookiesTripleChoc, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-white', name: 'White Choc Cookies', price: 280, slice: 580, img: img.cookiesChunky, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-classic', name: 'Classic Cookies', price: 280, slice: 580, img: img.cookies, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-redvelvet', name: 'Red Velvet Cookies', price: 340, slice: 700, img: img.cookiesTripleChoc, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-almond', name: 'Almond Cookies', price: 400, slice: 820, img: img.cookiesChunky, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-coconut', name: 'Coconut Cookies', price: 340, slice: 700, img: img.cookies, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-pistachio', name: 'Pistachio & Rose Cookies', price: 400, slice: 820, img: img.cookiesChunky, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12', badge: 'Special' },

  // ───── CUPCAKES — per piece ─────
  { id: 'cup-chocolate', name: 'Chocolate Cupcake', price: 100, img: img.cupcakesAssorted, category: 'Cupcakes' },
  { id: 'cup-vanilla', name: 'Vanilla Cupcake', price: 100, img: img.cupcakesPink, category: 'Cupcakes' },

  // ───── BAKES — per piece ─────
  { id: 'bk-brownie', name: 'Brownie', price: 80, img: img.bakesChocolateSquare, category: 'Bakes' },
  { id: 'bk-blondie', name: 'Blondie', price: 80, img: img.bakesPlain, category: 'Bakes' },
  { id: 'bk-cakesickle-sq', name: 'Cakesickle (Square)', price: 120, img: img.cakePinkLetter, category: 'Bakes' },
  { id: 'bk-cakesickle-cir', name: 'Cakesickle (Circle)', price: 120, img: img.bakesCreamCones, category: 'Bakes' },
  { id: 'bk-cakepop', name: 'Cake Pop', price: 90, img: img.cakePinkLetter, category: 'Bakes' },
  { id: 'bk-strawberry', name: 'Choc Covered Strawberry', price: 70, img: img.cheesecakeStrawberryCups, category: 'Bakes' },

  // ───── PLATTERS ─────
  { id: 'pl-pancakes', name: 'Pancakes (stack of 3)', price: 170, img: img.bakesCreamCones, category: 'Platters' },
  { id: 'pl-crepes', name: 'Crêpes (stack of 3)', price: 170, img: img.bakesRosePetal, category: 'Platters' },

  // ───── DESSERT CUPS ─────
  { id: 'dc-custard', name: 'Custard Cup', price: 90, img: img.dessertCupsLemon, category: 'Dessert Cups' },
  { id: 'dc-cheesecake', name: 'Cheesecake Cup', price: 150, img: img.dessertCupsTrio, category: 'Dessert Cups' },
  { id: 'dc-trifle', name: 'Trifle Cup', price: 100, img: img.dessertCupsLemon, category: 'Dessert Cups' },
  { id: 'dc-jelly', name: 'Jelly Cup', price: 80, img: img.jellyCupsRainbow, category: 'Dessert Cups' },
  { id: 'dc-grass', name: 'Grass Cup (Ghas)', price: 90, img: img.jellyCupsRainbow, category: 'Dessert Cups' },

  // ───── DRINKS — Mojitos ─────
  { id: 'dr-virginmojito', name: 'Virgin Mojito', price: 120, img: img.drinkVirginMojito, category: 'Drinks' },
  { id: 'dr-bluemojito', name: 'Blue Lagoon Mojito', price: 120, img: img.drinkBlueLagoon, category: 'Drinks' },
  { id: 'dr-strawberrymojito', name: 'Strawberry Mojito', price: 120, img: img.drinkStrawberryMojito, category: 'Drinks' },
  { id: 'dr-fruitmojito', name: 'Fruit Flavour Mojito', price: 130, img: img.drinkStrawberryMojito, category: 'Drinks' },

  // ───── DRINKS — Coffee ─────
  { id: 'dr-icedcoffee', name: 'Iced Coffee', price: 100, img: img.drinkBlueLagoon, category: 'Drinks' },
  { id: 'dr-hotcoffee', name: 'Hot Coffee', price: 90, img: img.drinkVirginMojito, category: 'Drinks' },

  // ───── DRINKS — Milkshakes ─────
  { id: 'dr-fruitshake', name: 'Fruit Flavour Milkshake', price: 160, img: img.drinkStrawberryMojito, category: 'Drinks' },
  { id: 'dr-biscoff-shake', name: 'Biscoff Milkshake', price: 180, img: img.drinkVirginMojito, category: 'Drinks' },
  { id: 'dr-nutella-shake', name: 'Nutella Milkshake', price: 180, img: img.drinkVirginMojito, category: 'Drinks' },
  { id: 'dr-oreo-shake', name: 'Oreo Milkshake', price: 180, img: img.drinkBlueLagoon, category: 'Drinks' },
  { id: 'dr-choc-shake', name: 'Choc Flavour Milkshake', price: 180, img: img.drinkVirginMojito, category: 'Drinks' },
].map(attachAllergens)

// Auto-attach allergen tags based on product category + name keywords.
// Lets us avoid pasting `allergens: [...]` on every line.
function attachAllergens(p) {
  const name = p.name.toLowerCase()
  const isMojito = /mojito|lagoon/.test(name)
  const isShake = /milkshake|shake/.test(name)
  const isCoffee = /coffee/.test(name)
  const hasNuts = /pistach|almond|nutella|hazelnut|coconut|dubai/.test(name)

  let tags = []
  switch (p.category) {
    case 'Cheesecakes':
    case 'Milk Cakes':
    case 'Cookies':
    case 'Cupcakes':
    case 'Bakes':
    case 'Platters':
      tags = ['contains-egg', 'contains-dairy', 'contains-gluten', 'eggless-option']
      if (hasNuts) tags.push('contains-nuts')
      break
    case 'Dessert Cups':
      if (/jelly|grass/.test(name)) tags = ['eggless']
      else tags = ['contains-egg', 'contains-dairy', 'eggless-option']
      break
    case 'Drinks':
      if (isShake) tags = ['contains-dairy']
      else if (isMojito || isCoffee) tags = []
      break
    default:
      tags = []
  }
  return { ...p, allergens: tags }
}

// Structured menu (used on /menu).
export const cheesecakes = {
  classic: [
    { name: 'Strawberry', whole: 350, slice: 120 },
    { name: 'Blueberry', whole: 410, slice: 140 },
    { name: 'Raspberry', whole: 410, slice: 140 },
    { name: 'Orange Creamsicle', whole: 380, slice: 130 },
    { name: 'Lemon', whole: 350, slice: 120 },
    { name: 'Rose', whole: 350, slice: 120 },
  ],
  exotic: [
    { name: 'Mango', whole: 350, slice: 120 },
    { name: 'Passion Fruit', whole: 380, slice: 130 },
    { name: 'Cherry', whole: 380, slice: 130 },
    { name: 'Guava', whole: 350, slice: 120 },
    { name: 'Mango & Passion', whole: 410, slice: 140 },
    { name: 'Coconut', whole: 410, slice: 140 },
  ],
  chocolate: [
    { name: 'Chocolate (Milk & Dark)', whole: 380, slice: 130 },
    { name: 'Chocolate Orange', whole: 380, slice: 130 },
    { name: 'Black Forest', whole: 380, slice: 130 },
    { name: 'Chocolate Chunk', whole: 380, slice: 130 },
    { name: 'Nutella', whole: 440, slice: 150 },
    { name: 'Biscoff', whole: 410, slice: 140 },
  ],
  premium: [
    { name: 'Cookies & Cream', whole: 430, slice: 150 },
    { name: 'Caramel', whole: 430, slice: 150 },
    { name: 'Coffee', whole: 430, slice: 150 },
    { name: 'Pistachio', whole: 470, slice: 160, badge: 'Premium' },
    { name: 'Dubai', whole: 500, slice: 170, badge: 'Special' },
  ],
}

export const cookies = [
  { name: 'Triple Choc', each: 60, six: 340, twelve: 700 },
  { name: 'White Choc', each: 50, six: 280, twelve: 580 },
  { name: 'Classic', each: 50, six: 280, twelve: 580 },
  { name: 'Red Velvet', each: 60, six: 340, twelve: 700 },
  { name: 'Almond', each: 70, six: 400, twelve: 820 },
  { name: 'Coconut', each: 60, six: 340, twelve: 700 },
  { name: 'Pistachio & Rose', each: 70, six: 400, twelve: 820, badge: 'Special' },
]

export const milkCakes = [
  { name: 'Biscoff', whole: 800, slice: 100 },
  { name: 'Trés Léches', whole: 800, slice: 100 },
  { name: 'Rose', whole: 800, slice: 100 },
  { name: 'Turkish', whole: 850, slice: 110 },
  { name: 'Chocolate', whole: 850, slice: 110 },
  { name: 'Raspberry', whole: 900, slice: 115 },
  { name: 'Pistachio', whole: 950, slice: 120, badge: 'Premium' },
]

export const cakesAndBakes = {
  cupcakes: [
    { name: 'Chocolate', price: 100 },
    { name: 'Vanilla', price: 100 },
  ],
  bakes: [
    { name: 'Brownie', price: 80 },
    { name: 'Blondie', price: 80 },
    { name: 'Cakesickle (Square)', price: 120 },
    { name: 'Cakesickle (Circle)', price: 120 },
    { name: 'Cake Pop', price: 90 },
    { name: 'Choc Covered Strawberry', price: 70 },
  ],
  platters: [
    { name: 'Pancakes (stack of 3)', price: 170 },
    { name: 'Crêpes (stack of 3)', price: 170 },
  ],
}

export const dessertCups = [
  { name: 'Custard Cup', price: 90 },
  { name: 'Cheesecake Cup', price: 150 },
  { name: 'Trifle Cup', price: 100 },
  { name: 'Jelly Cup', price: 80 },
  { name: 'Grass Cup (Ghas)', price: 90 },
]

export const drinks = {
  mojitos: [
    { name: 'Virgin Mojito', price: 120 },
    { name: 'Blue Lagoon Mojito', price: 120 },
    { name: 'Strawberry Mojito', price: 120 },
    { name: 'Any Fruit Flavour', price: 130 },
  ],
  coffee: [
    { name: 'Iced Coffee', price: 100 },
    { name: 'Hot Coffee', price: 90 },
  ],
  milkshakes: [
    { name: 'Any Fruit Flavour', price: 160 },
    { name: 'Biscoff', price: 180 },
    { name: 'Nutella', price: 180 },
    { name: 'Oreo', price: 180 },
    { name: 'Any Choc Flavour', price: 180 },
  ],
}

export const comingSoon = [
  { name: 'Doughnuts', price: null, soon: true },
  { name: 'Bombolone', price: null, soon: true },
  { name: 'Cookie Fries', price: 200 },
  { name: 'Brownie Cheesecake (whole)', price: 750 },
  { name: 'Macarons (per piece)', price: 120 },
  { name: 'Dipped Cheesecake Slice', price: 200 },
  { name: 'Rice Krispies Treats', price: 90 },
  { name: 'Cookie Dipping Box', price: 420 },
  { name: 'Brownie Dipping Box', price: 450 },
  { name: 'Brookie Dipping Box', price: 470 },
]

export const reviews = [
  {
    id: 1,
    name: 'Emily R.',
    rating: 5,
    when: '5 days ago',
    title: 'Absolutely Perfect!',
    text: 'The cake was not only beautiful but tasted even better! So fresh and full of flavor. Perfect for our anniversary celebration. Highly recommend Cake & Crumb!',
    img: img.berryCake,
  },
  {
    id: 2,
    name: 'Jessica L.',
    rating: 5,
    when: '1 week ago',
    title: 'My Go-To Bakery!',
    text: 'I order cupcakes for every special occasion and they never disappoint. Always fresh, pretty, and delicious!',
    img: img.cupcakesPink,
  },
  {
    id: 3,
    name: 'Michael T.',
    rating: 5,
    when: '2 weeks ago',
    title: 'Amazing Quality',
    text: 'The chocolates are rich, smooth, and beautifully packaged. You can really taste the quality in every bite.',
    img: img.truffleBox,
  },
  {
    id: 4,
    name: 'Sarah K.',
    rating: 5,
    when: '3 weeks ago',
    title: 'So Cute & Delicious!',
    text: 'The cake pops were a hit at my daughter\'s birthday party! Everyone loved them. Will definitely order again.',
    img: img.cakePops,
  },
]
