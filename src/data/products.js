import { img } from './images.js'

// All prices in INR. Sourced from menu.html.

// Default allergen sets per category — most baked goods share these.
const A_BAKED   = ['contains-egg', 'contains-dairy', 'contains-gluten', 'eggless-option']
const A_NUTS    = [...A_BAKED, 'contains-nuts']

// Featured cards on Home — visually distinctive picks across categories.
export const featured = [
  { id: 'feat-1', name: 'Blueberry Cheesecake', price: 410, img: img.rcCheesecakeBlueberry, category: 'Cheesecakes', allergens: A_BAKED },
  { id: 'feat-2', name: 'Red Velvet Cupcakes (6 pcs)', price: 180, img: img.rcCupcakesRedVelvet, category: 'Cupcakes', allergens: A_BAKED },
  { id: 'feat-3', name: 'Triple Choc Cookies (Box of 6)', price: 340, img: img.rcCookiesDoubleChocolate, category: 'Cookies', allergens: A_BAKED },
  { id: 'feat-4', name: 'Pistachio Milk Cake (Bento)', price: 520, img: img.rcMilkcakeRosePistachioDomes, category: 'Milk Cakes', allergens: A_NUTS },
]

// Flat list for /shop — full PDF menu, every item orderable.
// `slice` field gives a second price option (rendered as a second add-to-cart button).
export const shopProducts = [
  // ───── CHEESECAKES — Banto 4" whole / per slice ─────
  // Classic
  { id: 'cc-strawberry', name: 'Strawberry Cheesecake', price: 350, slice: 120, img: img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-blueberry', name: 'Blueberry Cheesecake', price: 410, slice: 140, img: img.rcCheesecakeBlueberry, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-raspberry', name: 'Raspberry Cheesecake', price: 410, slice: 140, img: img.rcCheesecakePomegranate, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-orange', name: 'Orange Creamsicle Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocMango, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-lemon', name: 'Lemon Cheesecake', price: 350, slice: 120, img: img.cheesecakeCookiesCream, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-rose', name: 'Rose Cheesecake', price: 350, slice: 120, img: img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
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
  { id: 'cc-pistachio', name: 'Pistachio Cheesecake', price: 470, slice: 160, img: img.rcCheesecakePistachio, category: 'Cheesecakes', sizeLabel: 'Banto 4"', badge: 'Premium' },
  { id: 'cc-dubai', name: 'Dubai Cheesecake', price: 500, slice: 170, img: img.cheesecakeChocPistachio, category: 'Cheesecakes', sizeLabel: 'Banto 4"', badge: 'Special' },

  // ───── MILK CAKES — Bento / Tub ─────
  { id: 'mc-tres', name: 'Trés Léches Milk Cake', price: 420, slice: 120, img: img.rcMilkcakeTresDish, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-rose', name: 'Rose Milk Cake', price: 420, slice: 120, img: img.rcMilkcakeRosePistachioDomes, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-mango', name: 'Mango Milk Cake', price: 440, slice: 120, img: img.cakeYellowFlowers, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-biscoff', name: 'Biscoff Milk Cake', price: 480, slice: 130, img: img.cakeNakedYellow, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-nutella', name: 'Nutella Milk Cake', price: 480, slice: 130, img: img.cakeChocolateBirthday, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-turkish', name: 'Turkish (Caramel) Milk Cake', price: 480, slice: 130, img: img.cakeYellowFlowers, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-pistachio', name: 'Pistachio Milk Cake', price: 520, slice: 140, img: img.milkcakeRosePistachio, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub', badge: 'Premium' },
  // Kept from earlier menu (not on the current 2-page menu) — 6" whole / per slice
  { id: 'mc-chocolate', name: 'Chocolate Milk Cake', price: 850, slice: 110, img: img.cakeChocolateBirthday, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-raspberry', name: 'Raspberry Milk Cake', price: 900, slice: 115, img: img.berryCake, category: 'Milk Cakes', sizeLabel: '6"' },

  // ───── SPONGE CAKES — Whole (Bento) / Tub ─────
  { id: 'sp-vanilla', name: 'Vanilla Sponge Cake', price: 450, slice: 100, img: img.rcCakeYellowRose, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-chocolate', name: 'Chocolate Sponge Cake', price: 470, slice: 100, img: img.rcCakeChocolateCaramel, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-strawberry', name: 'Strawberry Sponge Cake', price: 470, slice: 110, img: img.rcCakePinkRoseMothers, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-redvelvet', name: 'Red Velvet Sponge Cake', price: 470, slice: 110, img: img.rcCakeRedVelvetHearts, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-mango', name: 'Mango Sponge Cake', price: 480, slice: 120, img: img.cakeYellowFlowers, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-blueberry', name: 'Blueberry Sponge Cake', price: 480, slice: 120, img: img.rcCakeBlueberryLavender, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-biscoff', name: 'Biscoff Sponge Cake', price: 490, slice: 130, img: img.cakeNakedYellow, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-nutella', name: 'Nutella Sponge Cake', price: 490, slice: 130, img: img.cakeChocolateBirthday, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-pistachio', name: 'Pistachio Sponge Cake', price: 510, slice: 150, img: img.milkcakeRosePistachio, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-choc-chunk', name: 'Chocolate Chunk Sponge Cake', price: 480, slice: 120, img: img.cakeChocolateBirthday, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },

  // ───── COOKIES — Box of 6 / Box of 12 ─────
  { id: 'ck-triple', name: 'Triple Choc Cookies', price: 340, slice: 700, img: img.rcCookiesDoubleChocolate, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-white', name: 'White Choc Cookies', price: 280, slice: 580, img: img.cookiesChunky, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-classic', name: 'Classic Cookies', price: 280, slice: 580, img: img.rcCookiesChocolateNutBoard, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-redvelvet', name: 'Red Velvet Cookies', price: 340, slice: 700, img: img.cookiesTripleChoc, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-almond', name: 'Almond Cookies', price: 400, slice: 820, img: img.rcCookiesChocChunkNut, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-coconut', name: 'Coconut Cookies', price: 340, slice: 700, img: img.cookies, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-pistachio', name: 'Pistachio & Rose Cookies', price: 400, slice: 820, img: img.rcCookiesPistachioRose, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12', badge: 'Special' },

  // ───── CUPCAKES — box of 6 (₹20 extra for floral / additional decoration) ─────
  { id: 'cup-vanilla', name: 'Vanilla Cupcakes (6 pcs)', price: 150, img: img.rcCupcakesFunfetti, category: 'Cupcakes', sizeLabel: 'Box of 6' },
  { id: 'cup-redvelvet', name: 'Red Velvet Cupcakes (6 pcs)', price: 180, img: img.rcCupcakesRedVelvet, category: 'Cupcakes', sizeLabel: 'Box of 6' },
  { id: 'cup-chocolate', name: 'Chocolate Cupcakes (6 pcs)', price: 170, img: img.rcCupcakesChocolate, category: 'Cupcakes', sizeLabel: 'Box of 6' },
  { id: 'cup-pistachio', name: 'Pistachio Cupcakes (6 pcs)', price: 190, img: img.rcCupcakesMintGoldLeaf, category: 'Cupcakes', sizeLabel: 'Box of 6' },
  { id: 'cup-biscoff', name: 'Biscoff Cupcakes (6 pcs)', price: 180, img: img.cupcakesBox, category: 'Cupcakes', sizeLabel: 'Box of 6' },
  { id: 'cup-nutella', name: 'Nutella Cupcakes (6 pcs)', price: 170, img: img.cupcakesBoxLarge, category: 'Cupcakes', sizeLabel: 'Box of 6' },
  { id: 'cup-strawberry', name: 'Strawberry Cupcakes (6 pcs)', price: 170, img: img.rcCupcakesFloralRose, category: 'Cupcakes', sizeLabel: 'Box of 6' },
  { id: 'cup-mango', name: 'Mango Cupcakes (6 pcs)', price: 170, img: img.cupcakesGiftBox, category: 'Cupcakes', sizeLabel: 'Box of 6' },

  // ───── BROWNIES — 1 pc / Box of 6 (also sold in 4 & 12) ─────
  { id: 'bk-brownie-classic', name: 'Classic Brownie', price: 60, slice: 350, img: img.rcBrownieFudgy, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-brownie-nutella', name: 'Nutella Brownie', price: 70, slice: 410, img: img.rcBrownieLava, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-brownie-biscoff', name: 'Biscoff Brownie', price: 70, slice: 410, img: img.rcBrownieBoxes, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-brownie-oreo', name: 'Oreo Brownie', price: 70, slice: 410, img: img.bakesChocolateSquare, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-brownie-pistachio', name: 'Pistachio Brownie', price: 80, slice: 470, img: img.rcBrownieBoxes, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-brownie-redvelvet', name: 'Red Velvet Brownie', price: 80, slice: 470, img: img.bakesChocolateLava, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', badge: 'Premium' },

  // ───── BLONDIES — 1 pc / Box of 6 ─────
  { id: 'bk-blondie-classic', name: 'Classic Blondie', price: 60, slice: 350, img: img.bakesPlain, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-blondie-white', name: 'White Chocolate Blondie', price: 70, slice: 410, img: img.bakesCreamCones, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-blondie-strawberry', name: 'Strawberry Blondie', price: 80, slice: 470, img: img.bakesRosePetal, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-blondie-mango', name: 'Mango Blondie', price: 70, slice: 410, img: img.bakesPlain, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },
  { id: 'bk-blondie-blueberry', name: 'Blueberry Blondie', price: 80, slice: 470, img: img.bakesBlueberry, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6' },

  // ───── CAKESICLES — by shape (min 6) ─────
  { id: 'bk-cakesickle-heart', name: 'Cakesicle (Heart)', price: 110, img: img.cakePinkLetter, category: 'Bakes', sizeLabel: 'Per piece' },
  { id: 'bk-cakesickle-cir', name: 'Cakesicle (Circle)', price: 120, img: img.bakesCreamCones, category: 'Bakes', sizeLabel: 'Per piece' },
  { id: 'bk-cakesickle-sq', name: 'Cakesicle (Square)', price: 130, img: img.cakePinkLetter, category: 'Bakes', sizeLabel: 'Per piece' },
  { id: 'bk-cakesickle-ice', name: 'Cakesicle (Ice Cream)', price: 140, img: img.bakesCreamCones, category: 'Bakes', sizeLabel: 'Per piece' },

  // ───── CAKE POPS — Box of 6 / Box of 12 ─────
  { id: 'bk-cakepop', name: 'Cake Pops', price: 120, slice: 230, img: img.cakePops, category: 'Bakes', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },

  { id: 'bk-strawberry', name: 'Choc Covered Strawberry', price: 40, img: img.cheesecakeStrawberryCups, category: 'Bakes', sizeLabel: 'Per piece' },

  // ───── PLATTERS ─────
  { id: 'pl-pancakes', name: 'Pancake (stack of 3)', price: 180, img: img.rcPlatterPancakeStrawberry, category: 'Platters' },
  { id: 'pl-crepes', name: 'Crêpe Roll (Nutella filled)', price: 70, img: img.bakesRosePetal, category: 'Platters' },

  // ───── DESSERT CUPS ─────
  { id: 'dc-custard-vanilla', name: 'Vanilla Custard Cup', price: 60, img: img.dessertCupsLemon, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-custard-chocolate', name: 'Chocolate Custard Cup', price: 70, img: img.rcCupChocolatePudding, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-custard-mango', name: 'Mango Custard Cup', price: 80, img: img.rcCupMangoCustard, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-cheesecake', name: 'Cheesecake Cup', price: 150, img: img.rcCupAssortedFour, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-trifle', name: 'Trifle Cup', price: 100, img: img.rcCupAssortedFlatlay, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-jelly', name: 'Jelly Cup', price: 50, img: img.rcJellyRainbow, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-grass', name: 'Milk Pudding (Ghas) Cup', price: 40, img: img.jellyCupsRainbow, category: 'Dessert Cups', sizeLabel: '150ml' },

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
    case 'Sponge Cakes':
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
