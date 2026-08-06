import { photoFor } from './productImages.js'
import { inr } from './format.js'

// All prices in INR. Sourced from menu.html.

// PHOTOS ARE NOT LISTED HERE. Every product's picture is looked up by its NAME
// in productImages.js — one file, one line per product, name on the left and
// file name on the right. Pairing them by hand on these lines is what let a
// product called "Strawberry Cheesecake" quietly carry the mango photo: the
// name and the picture sat in two different columns and nothing checked them.
// Rename a product below → rename its key in productImages.js too, or it falls
// back to a generic shot (and says so in the dev console).
const withPhoto = (p) => ({ ...p, img: photoFor(p.name) })

// Default allergen sets per category — most baked goods share these.
const A_BAKED   = ['contains-egg', 'contains-dairy', 'contains-gluten', 'eggless-option']
const A_NUTS    = [...A_BAKED, 'contains-nuts']

// Featured cards on Home — visually distinctive picks across categories.
export const featured = [
  { id: 'feat-1', name: 'Blueberry Cheesecake', price: 410, category: 'Cheesecakes', allergens: A_BAKED },
  { id: 'feat-2', name: 'Red Velvet Cupcakes (Box of 6)', price: 180, category: 'Cupcakes', allergens: A_BAKED },
  { id: 'feat-3', name: 'Triple Choc Cookies (Box of 6)', price: 340, category: 'Cookies', allergens: A_BAKED },
  { id: 'feat-4', name: 'Pistachio Milk Cake (Bento)', price: 520, category: 'Milk Cakes', allergens: A_NUTS },
].map(withPhoto)

// Flat list for /shop — full PDF menu, every item orderable.
// `slice` field gives a second price option (rendered as a second add-to-cart button).
export const shopProducts = [
  // ───── CHEESECAKES — Banto 4" whole / per slice ─────
  // Classic
  { id: 'cc-strawberry', name: 'Strawberry Cheesecake', price: 350, slice: 120, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-blueberry', name: 'Blueberry Cheesecake', price: 410, slice: 140, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-raspberry', name: 'Raspberry Cheesecake', price: 410, slice: 140, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-orange', name: 'Orange Creamsicle Cheesecake', price: 380, slice: 130, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-lemon', name: 'Lemon Cheesecake', price: 350, slice: 120, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  { id: 'cc-rose', name: 'Rose Cheesecake', price: 350, slice: 120, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Classic' },
  // Exotic
  { id: 'cc-mango', name: 'Mango Cheesecake', price: 350, slice: 120, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-passion', name: 'Passion Fruit Cheesecake', price: 380, slice: 130, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-cherry', name: 'Cherry Cheesecake', price: 380, slice: 130, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-guava', name: 'Guava Cheesecake', price: 350, slice: 120, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-mango-passion', name: 'Mango & Passion Cheesecake', price: 410, slice: 140, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  { id: 'cc-coconut', name: 'Coconut Cheesecake', price: 410, slice: 140, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Exotic' },
  // Chocolate
  { id: 'cc-choc', name: 'Chocolate Cheesecake (Milk & Dark)', price: 380, slice: 130, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-choc-orange', name: 'Chocolate Orange Cheesecake', price: 380, slice: 130, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-blackforest', name: 'Black Forest Cheesecake', price: 380, slice: 130, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-choc-chunk', name: 'Chocolate Chunk Cheesecake', price: 380, slice: 130, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-nutella', name: 'Nutella Cheesecake', price: 440, slice: 150, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  { id: 'cc-biscoff', name: 'Biscoff Cheesecake', price: 410, slice: 140, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Chocolate' },
  // Premium
  { id: 'cc-cookies-cream', name: 'Cookies & Cream Cheesecake', price: 430, slice: 150, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Premium' },
  { id: 'cc-caramel', name: 'Caramel Cheesecake', price: 430, slice: 150, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Premium' },
  { id: 'cc-coffee', name: 'Coffee Cheesecake', price: 430, slice: 150, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', group: 'Premium' },
  { id: 'cc-pistachio', name: 'Pistachio Cheesecake', price: 470, slice: 160, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', badge: 'Premium', group: 'Premium' },
  { id: 'cc-dubai', name: 'Dubai Cheesecake', price: 500, slice: 170, category: 'Cheesecakes', sizeLabel: 'Banto 4" (inch)', badge: 'Special', group: 'Premium' },

  // ───── MILK CAKES — Bento / Tub ─────
  { id: 'mc-tres', name: 'Trés Léches Milk Cake', price: 420, slice: 120, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-rose', name: 'Rose Milk Cake', price: 420, slice: 120, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-mango', name: 'Mango Milk Cake', price: 440, slice: 120, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-biscoff', name: 'Biscoff Milk Cake', price: 480, slice: 130, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-nutella', name: 'Nutella Milk Cake', price: 480, slice: 130, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-turkish', name: 'Turkish (Caramel) Milk Cake', price: 480, slice: 130, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub' },
  { id: 'mc-pistachio', name: 'Pistachio Milk Cake', price: 520, slice: 140, category: 'Milk Cakes', sizeLabel: 'Bento', sliceLabel: 'Tub', badge: 'Premium' },

  // ───── SPONGE CAKES — Whole (Bento) / Tub ─────
  { id: 'sp-vanilla', name: 'Vanilla Sponge Cake', price: 450, slice: 100, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-chocolate', name: 'Chocolate Sponge Cake', price: 470, slice: 100, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-strawberry', name: 'Strawberry Sponge Cake', price: 470, slice: 110, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-redvelvet', name: 'Red Velvet Sponge Cake', price: 470, slice: 110, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-mango', name: 'Mango Sponge Cake', price: 480, slice: 120, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-blueberry', name: 'Blueberry Sponge Cake', price: 480, slice: 120, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-biscoff', name: 'Biscoff Sponge Cake', price: 490, slice: 130, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-nutella', name: 'Nutella Sponge Cake', price: 490, slice: 130, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },
  { id: 'sp-pistachio', name: 'Pistachio Sponge Cake', price: 510, slice: 150, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub', badge: 'Premium' },
  { id: 'sp-choc-chunk', name: 'Chocolate Chunk Sponge Cake', price: 480, slice: 120, category: 'Sponge Cakes', sizeLabel: 'Whole (Bento)', sliceLabel: 'Tub' },

  // ───── COOKIES — Box of 6 / Box of 12 ─────
  { id: 'ck-triple', name: 'Triple Choc Cookies', price: 340, slice: 700, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-white', name: 'White Choc Cookies', price: 280, slice: 580, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-classic', name: 'Classic Cookies', price: 280, slice: 580, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-redvelvet', name: 'Red Velvet Cookies', price: 340, slice: 700, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-almond', name: 'Almond Cookies', price: 400, slice: 820, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-coconut', name: 'Coconut Cookies', price: 340, slice: 700, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12' },
  { id: 'ck-pistachio', name: 'Pistachio & Rose Cookies', price: 400, slice: 820, category: 'Cookies', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12', badge: 'Special' },

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
  { id: 'cup-vanilla', name: 'Vanilla Cupcakes', price: 25, slice: 150, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-redvelvet', name: 'Red Velvet Cupcakes', price: 30, slice: 180, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-chocolate', name: 'Chocolate Cupcakes', price: 30, slice: 180, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-pistachio', name: 'Pistachio Cupcakes', price: 35, slice: 210, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2, badge: 'Premium' },
  { id: 'cup-biscoff', name: 'Biscoff Cupcakes', price: 30, slice: 180, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-nutella', name: 'Nutella Cupcakes', price: 30, slice: 180, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },
  { id: 'cup-strawberry', name: 'Strawberry Cupcakes', price: 30, slice: 180, category: 'Cupcakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', minQty: 2 },

  // ───── BROWNIES — 1 pc / Box of 6 (also sold in 4 & 12) ─────
  { id: 'bk-brownie-classic', name: 'Classic Brownie', price: 60, slice: 350, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-nutella', name: 'Nutella Brownie', price: 70, slice: 410, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-biscoff', name: 'Biscoff Brownie', price: 70, slice: 410, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-oreo', name: 'Oreo Brownie', price: 70, slice: 410, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-pistachio', name: 'Pistachio Brownie', price: 80, slice: 470, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Brownies' },
  { id: 'bk-brownie-redvelvet', name: 'Red Velvet Brownie', price: 80, slice: 470, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', badge: 'Premium', group: 'Brownies' },

  // ───── BLONDIES — 1 pc / Box of 6 ─────
  { id: 'bk-blondie-classic', name: 'Classic Blondie', price: 60, slice: 350, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },
  { id: 'bk-blondie-white', name: 'White Chocolate Blondie', price: 70, slice: 410, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },
  { id: 'bk-blondie-strawberry', name: 'Strawberry Blondie', price: 80, slice: 470, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },
  { id: 'bk-blondie-mango', name: 'Mango Blondie', price: 70, slice: 410, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },
  { id: 'bk-blondie-blueberry', name: 'Blueberry Blondie', price: 80, slice: 470, category: 'Bakes', sizeLabel: '1 pc', sliceLabel: 'Box of 6', group: 'Blondies' },

  // ───── CAKESICLES — by shape (min 6) ─────
  { id: 'bk-cakesickle-heart', name: 'Cakesicle (Heart)', price: 110, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },
  { id: 'bk-cakesickle-cir', name: 'Cakesicle (Circle)', price: 120, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },
  { id: 'bk-cakesickle-sq', name: 'Cakesicle (Square)', price: 130, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },
  { id: 'bk-cakesickle-ice', name: 'Cakesicle (Ice Cream)', price: 140, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },

  // ───── CAKE POPS — Box of 6 / Box of 12 ─────
  { id: 'bk-cakepop', name: 'Cake Pops', price: 120, slice: 230, category: 'Bakes', sizeLabel: 'Box of 6', sliceLabel: 'Box of 12', group: 'Cake Pops' },

  { id: 'bk-strawberry', name: 'Choc Covered Strawberry', price: 40, category: 'Bakes', sizeLabel: 'Per piece', group: 'Cakesicles & More' },

  // ───── PLATTERS ─────
  { id: 'pl-pancakes', name: 'Pancake (stack of 3)', price: 180, category: 'Platters' },
  { id: 'pl-crepes', name: 'Crêpe Roll (Nutella filled)', price: 70, category: 'Platters' },

  // ───── DESSERT CUPS ─────
  { id: 'dc-custard-vanilla', name: 'Vanilla Custard Cup', price: 60, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-custard-chocolate', name: 'Chocolate Custard Cup', price: 70, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-custard-mango', name: 'Mango Custard Cup', price: 80, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-trifle', name: 'Trifle Cup', price: 100, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-jelly', name: 'Jelly Cup', price: 50, category: 'Dessert Cups', sizeLabel: '150ml' },
  { id: 'dc-grass', name: 'Milk Pudding (Ghas) Cup', price: 40, category: 'Dessert Cups', sizeLabel: '150ml' },

  // ───── DRINKS — Mojitos ─────
  { id: 'dr-virginmojito', name: 'Virgin Mojito', price: 180, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-bluelagoon', name: 'Blue Lagoon Mojito', price: 190, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-strawberrydelight', name: 'Strawberry Delight Mojito', price: 200, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-watermelonwave', name: 'Watermelon Wave Mojito', price: 200, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-mangodream', name: 'Mango Dream Mojito', price: 190, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-blueberrybliss', name: 'Blueberry Bliss Mojito', price: 190, category: 'Drinks', group: 'Mojitos' },
  { id: 'dr-lycheemist', name: 'Lychee Mist Mojito', price: 190, category: 'Drinks', group: 'Mojitos' },

  // ───── DRINKS — Milkshakes ─────
  { id: 'dr-lotus-shake', name: 'Lotus Luxury Milkshake (Biscoff)', price: 240, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-hazelnut-shake', name: 'Hazelnut Heaven Milkshake (Nutella)', price: 240, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-oreo-shake', name: 'Oreo Monster Milkshake', price: 240, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-strawberry-shake', name: 'Strawberry Cheesecake Milkshake', price: 230, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-blueberry-shake', name: 'Blueberry Bomb Milkshake', price: 230, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-mango-shake', name: 'Golden Velvet Milkshake (Mango)', price: 220, category: 'Drinks', group: 'Milkshakes' },
  { id: 'dr-pistachio-shake', name: 'Pistachio Paradise Milkshake', price: 250, category: 'Drinks', group: 'Milkshakes' },

  // ───── DRINKS — Iced Coffee ─────
  { id: 'dr-iced-classic', name: 'Classic Iced Coffee', price: 220, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-mocha', name: 'Mocha Madness Iced Latte', price: 240, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-caramel', name: 'Caramel Craze Latte', price: 230, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-vanilla', name: 'Vanilla Bean Dream (Iced)', price: 230, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-strawberry', name: 'Strawberry Silk Latte', price: 230, category: 'Drinks', group: 'Iced Coffee' },
  { id: 'dr-iced-cookie', name: 'Cookie Monster Brew', price: 240, category: 'Drinks', group: 'Iced Coffee' },

  // ───── DRINKS — Hot Coffee (+₹10 for cream) ─────
  { id: 'dr-hot-classic', name: 'Classic Hot Coffee', price: 200, category: 'Drinks', group: 'Hot Coffee' },
  { id: 'dr-hot-mochaccino', name: 'Mochaccino', price: 210, category: 'Drinks', group: 'Hot Coffee' },
  { id: 'dr-hot-macchiato', name: 'Caramel Macchiato', price: 210, category: 'Drinks', group: 'Hot Coffee' },
  { id: 'dr-hot-vanilla', name: 'Vanilla Bean Dream (Hot)', price: 210, category: 'Drinks', group: 'Hot Coffee' },

  // ───── LOOK OUT FOR — new additions ─────
  { id: 'lo-cookie-fries', name: 'Cookie Fries', price: 200, category: 'Bakes', sizeLabel: 'Serving', group: 'Look Out For' },
  { id: 'lo-macarons', name: 'Macarons', price: 120, category: 'Bakes', sizeLabel: 'Per piece', group: 'Look Out For' },
  { id: 'lo-rice-krispies', name: 'Rice Krispies Treats', price: 90, category: 'Bakes', sizeLabel: 'Per piece', group: 'Look Out For' },
  { id: 'lo-brownie-cheesecake', name: 'Brownie Cheesecake (Whole)', price: 750, category: 'Cheesecakes', sizeLabel: 'Whole', group: 'Look Out For' },
  { id: 'lo-dipped-slice', name: 'Dipped Cheesecake Slice', price: 200, category: 'Cheesecakes', sizeLabel: 'Per slice', group: 'Look Out For' },
  { id: 'lo-cookie-box', name: 'Cookie Dipping Box', price: 420, category: 'Bakes', sizeLabel: 'Box', group: 'Look Out For' },
  { id: 'lo-brownie-box', name: 'Brownie Dipping Box', price: 450, category: 'Bakes', sizeLabel: 'Box', group: 'Look Out For' },
  { id: 'lo-brookie-box', name: 'Brookie Dipping Box', price: 470, category: 'Bakes', sizeLabel: 'Box', group: 'Look Out For' },
].map(attachAllergens).map(withPhoto)

// ─────────────────────── how a product is priced on screen ───────────────────
// These three live here, not in the pages, because the rule has been got wrong
// twice by being re-implemented per file. Shop, SearchOverlay and
// RelatedProducts all import them; nothing re-derives them.

/**
 * The entry price. **Never `slice || price`** — `slice` is the *cheaper*
 * per-slice tier for cheesecakes but the *pricier* box-of-12 for cookies (26 of
 * the products here), so assuming it's the smaller one made a ₹340 cookie box
 * advertise "From ₹700".
 */
export const lowestPrice = (p) => (p.slice != null ? Math.min(p.price, p.slice) : p.price)

/** Sold by the piece with a minimum — cupcakes today. `price` is one piece. */
export const isPerPiece = (p) => p.slice != null && (p.minQty || 1) > 1

/**
 * What a card, a search result or a suggestion should QUOTE.
 *
 * A per-piece product quotes its BOX price, never the per-piece rate: "From
 * ₹25" under "Vanilla Cupcakes" beside a photo of six reads as six for ₹25, and
 * customers did read it that way. The rate belongs in the quick view, where the
 * count is chosen. Filters and sort still use `lowestPrice()` — see CLAUDE.md.
 */
export const cardPrice = (p) => (isPerPiece(p) ? p.slice : lowestPrice(p))

/** …and the words around it, so three surfaces can't word it three ways. */
export const priceLabel = (p) =>
  isPerPiece(p) ? inr(p.slice)
    : p.slice != null ? `From ${inr(lowestPrice(p))}`
      : inr(p.price)

// ─────────────────────────── what a product IS ───────────────────────────
// Every product carried the same sentence in the quick view — "Handcrafted with
// the finest ingredients…" — which told a customer choosing between two
// cheesecakes precisely nothing, and left the JSON-LD `Product` with no
// description at all. Built from the name and the category rather than typed
// 111 times, so a new product is never left blank; set `desc` on any entry to
// overrule it.

// "Vanilla Bean Dream (Iced)" → "Vanilla Bean Dream"; "Pistachio (Premium)
// Cheesecake" → "Pistachio". What's left is the flavour, which is the only part
// worth putting in a sentence — the rest is the category, said twice.
const NOUN = /\s*(cheesecakes?|milk cakes?|sponge cakes?|cookies?|cupcakes?|mojito|iced latte|latte|macchiato|mochaccino|brew|iced coffee|hot coffee|coffee|milkshake|brownie|blondie|cup)\s*$/i
const flavourOf = (p) =>
  p.name.replace(/\s*\((premium|iced|hot|nutella filled|stack of \d+)\)\s*/gi, ' ')
    .replace(NOUN, '').trim() || p.name

// Mid-sentence the flavour is lower case — "a triple choc cookie", not "a
// triple Choc cookie" — but the brands in it keep their capital.
const PROPER = /^(nutella|biscoff|oreo|lotus|turkish|trés|tres|léches|leches|ghas|krispies|dubai|ferrero|kitkat)$/i
const lower = (s) =>
  s.split(/\s+/)
    .map((w) => (PROPER.test(w) ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(' ')

/** One sentence saying what it is. `p.desc` wins when an entry sets it. */
export function describe(p) {
  if (p.desc) return p.desc
  const f = lower(flavourOf(p))
  const two = p.slice != null
  const name = p.name.toLowerCase()

  switch (p.category) {
    case 'Cheesecakes':
      return `A baked ${f} cheesecake on a buttery biscuit base${two ? ', whole or by the slice' : ''}.`
    case 'Milk Cakes':
      return `Sponge soaked in sweetened milk and finished with ${f} cream${two ? ' — whole, or a single-serve tub' : ''}.`
    case 'Sponge Cakes':
      return `A light ${f} sponge layered with fresh cream${two ? ' — a whole bento cake, or a tub for one' : ''}.`
    case 'Cookies':
      return `A thick, chewy ${f} cookie baked to order${two ? ' — singly or by the box' : ''}.`
    case 'Cupcakes':
      return `A ${f} cupcake under a swirl of buttercream — by the piece (two or more) or as a box of six.`
    case 'Dessert Cups':
      return `A chilled ${f} cup, layered and ready to spoon.`
    case 'Platters':
      return /pancake/.test(name)
        ? 'A stack of three warm pancakes, served with syrup and fruit.'
        : 'Thin crêpes rolled around Nutella and finished with a dusting of cocoa.'
    case 'Drinks':
      if (/mojito|lagoon/.test(name)) return `A chilled ${f} mojito — fizzy, sharp and not sweet.`
      if (/milkshake/.test(name)) {
        // "Lotus Luxury Milkshake (Biscoff)" — the word sits mid-name and the
        // bracket repeats the flavour, so strip both or it reads "milkshake
        // (biscoff) milkshake".
        const shake = lower(p.name.replace(/\(.*?\)/g, '').replace(/milkshake/i, '').trim())
        return `A thick ${shake} milkshake, blended to order and served cold.`
      }
      // `group` is 'Hot Coffee' / 'Iced Coffee' and says it outright; the name
      // doesn't (a "Caramel Macchiato" is hot, a "Strawberry Silk Latte" iced).
      return /hot/i.test(p.group || '')
        ? `${p.name} — pulled fresh and served hot.`
        : `${p.name} — brewed fresh and served over ice.`
    case 'Bakes':
      if (/brownie box|dipping box/.test(name)) return `${p.name} — a sharing box with a warm dip on the side.`
      if (/brownie/.test(name)) return `A dense, fudgy ${f} brownie${two ? ' — one piece or a box of six' : ''}.`
      if (/blondie/.test(name)) return `A chewy white-chocolate blondie with ${f}${two ? ' — one piece or a box of six' : ''}.`
      if (/cakesicle/.test(name)) return 'Cake on a stick, dipped in chocolate and decorated by hand.'
      if (/cake pops/.test(name)) return 'Bite-size cake rolled and dipped in chocolate — sold by the piece.'
      if (/strawberry/.test(name)) return 'Fresh strawberries dipped in chocolate and set to a snap.'
      if (/cookie fries/.test(name)) return 'Cookie dough cut into fries and baked crisp — made for dipping.'
      if (/macaron/.test(name)) return 'Almond shells with a soft centre, in the day’s flavours.'
      if (/krispies/.test(name)) return 'Crisp rice and marshmallow, set into squares.'
      return `${p.name} — freshly baked to order.`
    default:
      return `${p.name} — freshly made to order.`
  }
}

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
      } else if (isMojito) {
        // Fruit, lime and soda. This said `[]`, and an empty list renders
        // nothing at all — indistinguishable from "we never checked". Say the
        // true thing instead: there's nothing in it to avoid.
        tags = ['eggless', 'vegan']
      } else if (isCoffee || /coffee/i.test(p.group || '') || /latte|macchiato|mochaccino|brew/.test(name)) {
        // Also `[]` before, which was simply wrong — a latte, mocha or
        // macchiato is milk. If any of these is ever served black, drop the tag
        // on that entry rather than here.
        tags = ['contains-dairy']
        if (/cookie|biscoff|oreo/.test(name)) tags.push('contains-gluten')
        if (hasNuts) tags.push('contains-nuts')
      }
      break
    default:
      tags = []
  }
  return { ...p, allergens: tags }
}
