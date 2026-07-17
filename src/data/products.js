import { img } from './images.js'

// All prices in INR. Sourced from menu.html.

// Default allergen sets per category — most baked goods share these.
const A_BAKED   = ['contains-egg', 'contains-dairy', 'contains-gluten', 'eggless-option']
const A_NUTS    = [...A_BAKED, 'contains-nuts']

// Featured cards on Home — visually distinctive picks across categories.
export const featured = [
  { id: 'feat-1', name: 'Blueberry Cheesecake', price: 410, img: img.rcCheesecakeBlueberry, category: 'Cheesecakes', allergens: A_BAKED },
  { id: 'feat-2', name: 'Red Velvet Cupcakes (Box of 6)', price: 180, img: img.rcCupcakesRedVelvet, category: 'Cupcakes', allergens: A_BAKED },
  { id: 'feat-3', name: 'Triple Choc Cookies (Box of 6)', price: 340, img: img.rcCookiesDoubleChocolate, category: 'Cookies', allergens: A_BAKED },
  { id: 'feat-4', name: 'Pistachio Milk Cake (Bento)', price: 520, img: img.rcMilkcakeRosePistachioDomes, category: 'Milk Cakes', allergens: A_NUTS },
]

// Flat list for /shop — full PDF menu, every item orderable.
// `slice` field gives a second price option (rendered as a second add-to-cart button).
export const shopProducts = [
  // ───── CHEESECAKES — Banto 4" whole / per slice ─────
  // Classic
  { id: 'cc-strawberry', name: 'Strawberry Cheesecake', price: 350, slice: 120, img: img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-blueberry', name: 'Blueberry Cheesecake', price: 410, slice: 140, img: img.rcCheesecakeBlueberry, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-raspberry', name: 'Raspberry Cheesecake', price: 410, slice: 140, img: img.rcCheesecakePomegranate, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-orange', name: 'Orange Creamsicle Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocMango, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-lemon', name: 'Lemon Cheesecake', price: 350, slice: 120, img: img.cheesecakeCookiesCream, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-rose', name: 'Rose Cheesecake', price: 350, slice: 120, img: img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  // Exotic
  { id: 'cc-mango', name: 'Mango Cheesecake', price: 350, slice: 120, img: img.cheesecakeMango, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-passion', name: 'Passion Fruit Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocMango, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-cherry', name: 'Cherry Cheesecake', price: 380, slice: 130, img: img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-guava', name: 'Guava Cheesecake', price: 350, slice: 120, img: img.cheesecakeMango, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-mango-passion', name: 'Mango & Passion Cheesecake', price: 410, slice: 140, img: img.cheesecakeMango, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-coconut', name: 'Coconut Cheesecake', price: 410, slice: 140, img: img.cheesecakeCookiesCream, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  // Chocolate
  { id: 'cc-choc', name: 'Chocolate Cheesecake (Milk & Dark)', price: 380, slice: 130, img: img.cheesecakeChocRose, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-choc-orange', name: 'Chocolate Orange Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocMango, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-blackforest', name: 'Black Forest Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocRoseBowl, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-choc-chunk', name: 'Chocolate Chunk Cheesecake', price: 380, slice: 130, img: img.cheesecakeChocPistachio, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-nutella', name: 'Nutella Cheesecake', price: 440, slice: 150, img: img.cheesecakeNutella, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-biscoff', name: 'Biscoff Cheesecake', price: 410, slice: 140, img: img.cheesecakeCaramel, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  // Premium
  { id: 'cc-cookies-cream', name: 'Cookies & Cream Cheesecake', price: 430, slice: 150, img: img.cheesecakeCookiesCream, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Premium' },
  { id: 'cc-caramel', name: 'Caramel Cheesecake', price: 430, slice: 150, img: img.cheesecakeCaramel, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Premium' },
  { id: 'cc-coffee', name: 'Coffee Cheesecake', price: 430, slice: 150, img: img.cheesecakeCoffee, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Premium' },
  { id: 'cc-pistachio', name: 'Pistachio Cheesecake', price: 470, slice: 160, img: img.rcCheesecakePistachio, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', badge: 'Premium', group: 'Premium' },
  { id: 'cc-dubai', name: 'Dubai Cheesecake', price: 500, slice: 170, img: img.cheesecakeChocPistachio, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', badge: 'Special', group: 'Premium' },

  // ───── MILK CAKES — Bento / Tub ─────
  { id: 'mc-tres', name: 'Trés Léches Milk Cake', price: 420, slice: 120, img: img.rcMilkcakeTresDish, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-rose', name: 'Rose Milk Cake', price: 420, slice: 120, img: img.rcMilkcakeRosePistachioDomes, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-mango', name: 'Mango Milk Cake', price: 440, slice: 120, img: img.cakeYellowFlowers, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-biscoff', name: 'Biscoff Milk Cake', price: 480, slice: 130, img: img.cakeNakedYellow, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-nutella', name: 'Nutella Milk Cake', price: 480, slice: 130, img: img.cakeChocolateBirthday, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-turkish', name: 'Turkish (Caramel) Milk Cake', price: 480, slice: 130, img: img.cakeYellowFlowers, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-pistachio', name: 'Pistachio Milk Cake', price: 520, slice: 140, img: img.milkcakeRosePistachio, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub', badge: 'Premium' },

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

  // ───── CUPCAKES — per piece (min 2) or box of 6 (₹20 extra for floral / additional decoration) ─────
  // Two tiers like the brownies below, but with one extra rule: every box price
  // is an exact multiple of 6, so `price × 6 === slice`. Both tiers are quoted
  // side by side and customers do check the arithmetic — if the per-piece tier
  // were rounded, six singles would cost more (or less) than the box and one of
  // the two prices would look like a cheat. Keep the multiple-of-6 invariant if
  // you ever change a cupcake price: pick the BOX price first, then divide.
  //   `minQty: 2` — the bakery won't bake a single cupcake, so the per-piece
  //   tier enters the cart at 2 and drops out entirely below that. It applies to
  //   the `price` tier only; a box of 6 is orderable on its own. See
  //   CartContext.jsx (minQtyOf) for how it's enforced.
  { id: 'cup-vanilla', name: 'Vanilla Cupcakes', price: 25, slice: 150, img: img.rcCupcakesFunfetti, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-redvelvet', name: 'Red Velvet Cupcakes', price: 30, slice: 180, img: img.rcCupcakesRedVelvet, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-chocolate', name: 'Chocolate Cupcakes', price: 30, slice: 180, img: img.rcCupcakesChocolate, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-pistachio', name: 'Pistachio Cupcakes', price: 35, slice: 210, img: img.rcCupcakesMintGoldLeaf, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-biscoff', name: 'Biscoff Cupcakes', price: 30, slice: 180, img: img.cupcakesBox, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-nutella', name: 'Nutella Cupcakes', price: 30, slice: 180, img: img.cupcakesBoxLarge, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-strawberry', name: 'Strawberry Cupcakes', price: 30, slice: 180, img: img.rcCupcakesFloralRose, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },

  // ───── BROWNIES — 1 pc / Box of 6 (also sold in 4 & 12) ─────
  { id: 'bk-brownie-classic', name: 'Classic Brownie', price: 60, slice: 350, img: img.rcBrownieFudgy, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-nutella', name: 'Nutella Brownie', price: 70, slice: 410, img: img.rcBrownieLava, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-biscoff', name: 'Biscoff Brownie', price: 70, slice: 410, img: img.rcBrownieBoxes, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-oreo', name: 'Oreo Brownie', price: 70, slice: 410, img: img.bakesChocolateSquare, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-pistachio', name: 'Pistachio Brownie', price: 80, slice: 470, img: img.rcBrownieBoxes, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-redvelvet', name: 'Red Velvet Brownie', price: 80, slice: 470, img: img.bakesChocolateLava, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', badge: 'Premium', group: 'Brownies' },

  // ───── BLONDIES — 1 pc / Box of 6 ─────
  { id: 'bk-blondie-classic', name: 'Classic Blondie', price: 60, slice: 350, img: img.bakesPlain, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },
  { id: 'bk-blondie-white', name: 'White Chocolate Blondie', price: 70, slice: 410, img: img.bakesCreamCones, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },
  { id: 'bk-blondie-strawberry', name: 'Strawberry Blondie', price: 80, slice: 470, img: img.bakesRosePetal, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },
  { id: 'bk-blondie-mango', name: 'Mango Blondie', price: 70, slice: 410, img: img.bakesPlain, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },
  { id: 'bk-blondie-blueberry', name: 'Blueberry Blondie', price: 80, slice: 470, img: img.bakesBlueberry, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },

  // ───── CAKESICLES — by shape (min 6) ─────
  { id: 'bk-cakesickle-heart', name: 'Cakesicle (Heart)', price: 110, img: img.cakePinkLetter, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },
  { id: 'bk-cakesickle-cir', name: 'Cakesicle (Circle)', price: 120, img: img.bakesCreamCones, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },
  { id: 'bk-cakesickle-sq', name: 'Cakesicle (Square)', price: 130, img: img.cakePinkLetter, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },
  { id: 'bk-cakesickle-ice', name: 'Cakesicle (Ice Cream)', price: 140, img: img.bakesCreamCones, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },

  // ───── CAKE POPS — Box of 6 / Box of 12 ─────
  { id: 'bk-cakepop', name: 'Cake Pops', price: 120, slice: 230, img: img.cakePops, category: 'Bakes', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12', group: 'Cake Pops' },

  { id: 'bk-strawberry', name: 'Choc Covered Strawberry', price: 40, img: img.cheesecakeStrawberryCups, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },

  // ───── PLATTERS ─────
  { id: 'pl-pancakes', name: 'Pancake (stack of 3)', price: 180, img: img.rcPlatterPancakeStrawberry, category: 'Platters' },
  { id: 'pl-crepes', name: 'Crêpe Roll (Nutella filled)', price: 70, img: img.bakesRosePetal, category: 'Platters' },

  // ───── DESSERT CUPS ─────
  { id: 'dc-custard-vanilla', name: 'Vanilla Custard Cup', price: 60, img: img.dessertCupsLemon, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-custard-chocolate', name: 'Chocolate Custard Cup', price: 70, img: img.rcCupChocolatePudding, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-custard-mango', name: 'Mango Custard Cup', price: 80, img: img.rcCupMangoCustard, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-trifle', name: 'Trifle Cup', price: 100, img: img.rcCupAssortedFlatlay, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-jelly', name: 'Jelly Cup', price: 50, img: img.rcJellyRainbow, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-grass', name: 'Milk Pudding (Ghas) Cup', price: 40, img: img.jellyCupsRainbow, category: 'Dessert Cups', sizeLabel: '150ml' },

  // ───── DRINKS — Mojitos ─────
  { id: 'dr-virginmojito', name: 'Virgin Mojito', price: 180, img: img.drinkVirginMojito, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-bluelagoon', name: 'Blue Lagoon Mojito', price: 190, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-strawberrydelight', name: 'Strawberry Delight Mojito', price: 200, img: img.drinkStrawberryMojito, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-watermelonwave', name: 'Watermelon Wave Mojito', price: 200, img: img.drinkStrawberryMojito, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-mangodream', name: 'Mango Dream Mojito', price: 190, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-blueberrybliss', name: 'Blueberry Bliss Mojito', price: 190, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-lycheemist', name: 'Lychee Mist Mojito', price: 190, img: img.drinkVirginMojito, category: 'Drinks', group: 'Mojitos' },

  // ───── DRINKS — Milkshakes ─────
  { id: 'dr-lotus-shake', name: 'Lotus Luxury Milkshake (Biscoff)', price: 240, img: img.drinkVirginMojito, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-hazelnut-shake', name: 'Hazelnut Heaven Milkshake (Nutella)', price: 240, img: img.drinkVirginMojito, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-oreo-shake', name: 'Oreo Monster Milkshake', price: 240, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-strawberry-shake', name: 'Strawberry Cheesecake Milkshake', price: 230, img: img.drinkStrawberryMojito, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-blueberry-shake', name: 'Blueberry Bomb Milkshake', price: 230, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-mango-shake', name: 'Golden Velvet Milkshake (Mango)', price: 220, img: img.drinkStrawberryMojito, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-pistachio-shake', name: 'Pistachio Paradise Milkshake', price: 250, img: img.drinkVirginMojito, category: 'Drinks', group: 'Milkshakes' },

  // ───── DRINKS — Iced Coffee ─────
  { id: 'dr-iced-classic', name: 'Classic Iced Coffee', price: 220, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-mocha', name: 'Mocha Madness Iced Latte', price: 240, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-caramel', name: 'Caramel Craze Latte', price: 230, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-vanilla', name: 'Vanilla Bean Dream (Iced)', price: 230, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-strawberry', name: 'Strawberry Silk Latte', price: 230, img: img.drinkStrawberryMojito, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-cookie', name: 'Cookie Monster Brew', price: 240, img: img.drinkBlueLagoon, category: 'Drinks', group: 'Iced Coffee' },

  // ───── DRINKS — Hot Coffee (+₹10 for cream) ─────
  { id: 'dr-hot-classic', name: 'Classic Hot Coffee', price: 200, img: img.drinkVirginMojito, category: 'Drinks', group: 'Hot Coffee' },
  { id: 'dr-hot-mochaccino', name: 'Mochaccino', price: 210, img: img.drinkVirginMojito, category: 'Drinks', group: 'Hot Coffee' },
  { id: 'dr-hot-macchiato', name: 'Caramel Macchiato', price: 210, img: img.drinkVirginMojito, category: 'Drinks', group: 'Hot Coffee' },
  { id: 'dr-hot-vanilla', name: 'Vanilla Bean Dream (Hot)', price: 210, img: img.drinkVirginMojito, category: 'Drinks', group: 'Hot Coffee' },

  // ───── LOOK OUT FOR — new additions ─────
  { id: 'lo-cookie-fries', name: 'Cookie Fries', price: 200, img: img.cookiesChunky, category: 'Bakes', sizeLabel: 'Serving', group: 'Look Out For' },
  { id: 'lo-macarons', name: 'Macarons', price: 120, img: img.bakesCreamCones, category: 'Bakes', sizeLabel: 'Per piece', group: 'Look Out For' },
  { id: 'lo-rice-krispies', name: 'Rice Krispies Treats', price: 90, img: img.bakesPlain, category: 'Bakes', sizeLabel: 'Per piece', group: 'Look Out For' },
  { id: 'lo-brownie-cheesecake', name: 'Brownie Cheesecake (Whole)', price: 750, img: img.cheesecakeChocRose, category: 'Cheesecakes', sizeLabel: 'Whole', group: 'Look Out For' },
  { id: 'lo-dipped-slice', name: 'Dipped Cheesecake Slice', price: 200, img: img.cheesecakeStrawberry, category: 'Cheesecakes', sizeLabel: 'Per slice', group: 'Look Out For' },
  { id: 'lo-cookie-box', name: 'Cookie Dipping Box', price: 420, img: img.rcCookiesChocolateNutBoard, category: 'Bakes', sizeLabel: 'Box', group: 'Look Out For' },
  { id: 'lo-brownie-box', name: 'Brownie Dipping Box', price: 450, img: img.rcBrownieBoxes, category: 'Bakes', sizeLabel: 'Box', group: 'Look Out For' },
  { id: 'lo-brookie-box', name: 'Brookie Dipping Box', price: 470, img: img.rcCookiesChocChunkNut, category: 'Bakes', sizeLabel: 'Box', group: 'Look Out For' },
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
      if (isShake) {
        tags = ['contains-dairy']
        if (hasNuts) tags.push('contains-nuts')
      } else if (isMojito || isCoffee) tags = []
      break
    default:
      tags = []
  }
  return { ...p, allergens: tags }
}
