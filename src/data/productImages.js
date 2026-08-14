/**
 * PRODUCT PHOTOS — the single place where a product NAME is paired with its PHOTO.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE EASY WAY — you never have to open this file:
 *
 *   1. Save the photo into  public/products/  named after the product, in
 *      lower case with dashes:
 *          Mango Sponge Cake   →  mango-sponge-cake.jpeg
 *          Rose Milk Cake      →  rose-milk-cake.jpeg
 *   2. Run   npm run photos
 *
 *   That links it here for you, makes the .webp (plus the -400 and -800 sizes
 *   phones use), and tells you if anything is still missing. See PHOTOS.md.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * THE MANUAL WAY — when you want a file name that isn't the product name
 * (shared artwork, a photo used for two products, a themed shot):
 *   1. Drop the picture into  public/products/  (.jpeg / .jpg / .png).
 *   2. Find the product's name in the list below and put the new file name on
 *      the right-hand side. Nothing else to edit — the whole site (Shop, Home,
 *      quick-view, search, cart, chat bot, invoices) reads from here.
 *   3. Run  npm run photos  (or just  npm run optimize-images) so the .webp is
 *      generated. The site always requests the .webp; without this step the
 *      photo will not appear.
 *
 * Rules of the road:
 *   • The KEY must match the product name in products.js EXACTLY (same spelling,
 *     same capitals, same brackets). Rename a product there → rename it here.
 *   • The VALUE is just a file name inside public/products/. A value that starts
 *     with "/" is treated as a path from the site root instead (e.g. '/hero-roses.jpeg').
 *   • Two products may share one photo — that is allowed, and it is exactly what
 *     causes "the name says Strawberry but the picture is Mango". Everywhere that
 *     happens below is visible at a glance; fix it by dropping in a real photo.
 *   • A name with no entry here falls back to a neutral bakery shot and logs a
 *     warning in the dev console — it never breaks the page.
 */

/** name (exactly as shown on the site) → file name inside public/products/ */
export const PRODUCT_IMAGES = {
  // ───── FEATURED — THE FOUR CARDS ON THE HOME PAGE ─────

  // ───── CHEESECAKES ─────
  'Blueberry Cheesecake':                 'cheesecake-blueberry-whole.jpeg',

  // ───── CUPCAKES ─────
  'Red Velvet Cupcakes (Box of 6)':       'cupcakes-red-velvet.jpeg',

  // ───── COOKIES ─────
  'Triple Choc Cookies (Box of 6)':       'cookies-double-chocolate.jpeg',

  // ───── MILK CAKES ─────
  'Pistachio Milk Cake (Bento)':          'milkcake-pistachio-bento.jpeg',


  // ───── CHEESECAKES — CLASSIC ─────
  'Strawberry Cheesecake':                'cheesecake-strawberry-berry-top.jpeg',
  // 'Blueberry Cheesecake' — already listed under Featured above.
  'Raspberry Cheesecake':                 'cheesecake-pomegranate-berry.jpeg',
  'Orange Creamsicle Cheesecake':         'cheesecake-choc-mango.jpeg',
  'Lemon Cheesecake':                     'cheesecake-cookies-cream.jpeg',
  'Rose Cheesecake':                      'dessertcup-rose-cream.jpeg',

  // ───── CHEESECAKES — EXOTIC ─────
  'Mango Cheesecake':                     'cheesecake-mango-bowl.jpeg',
  'Passion Fruit Cheesecake':             'cheesecake-choc-mango.jpeg',
  'Cherry Cheesecake':                    'milkcake-pomegranate.jpeg',
  'Guava Cheesecake':                     'dessertcup-strawberry-sprinkles.jpeg',
  'Mango & Passion Cheesecake':           'cheesecake-mango-bowl.jpeg',
  'Coconut Cheesecake':                   'cheesecake-cookies-cream.jpeg',

  // ───── CHEESECAKES — CHOCOLATE ─────
  'Chocolate Cheesecake (Milk & Dark)':   'cheesecake-chocolate-rose.jpeg',
  'Chocolate Orange Cheesecake':          'cheesecake-choc-mango.jpeg',
  'Black Forest Cheesecake':              'cheesecake-chocolate-rose-bowl.jpeg',
  'Chocolate Chunk Cheesecake':           'cheesecake-chocolate-pistachio.jpeg',
  'Nutella Cheesecake':                   'cheesecake-nutella.jpeg',
  'Biscoff Cheesecake':                   'dessertcup-biscoff-cream.jpeg',

  // ───── CHEESECAKES — PREMIUM ─────
  'Cookies & Cream Cheesecake':           'dessertcup-oreo-cookies-cream.jpeg',
  'Caramel Cheesecake':                   'cheesecake-caramel.jpeg',
  'Coffee Cheesecake':                    'cheesecake-trio-flavors.jpeg',
  'Pistachio Cheesecake':                 'cheesecake-pistachio-slices-board.jpeg',
  'Dubai Cheesecake':                     'cheesecake-pistachio-cup.jpeg',

  // ───── MILK CAKES ─────
  // The bakery's own bento-tub photos, shot Aug 2026. One flavour per tub, so
  // these are the real thing rather than a stand-in from another category.
  'Trés Léches Milk Cake':                'milkcake-tres-leches-bento.jpeg',
  'Rose Milk Cake':                       'milkcake-rose-bento.jpeg',
  'Mango Milk Cake':                      'milkcake-mango-bento.jpeg',
  'Biscoff Milk Cake':                    'milkcake-biscoff-bento.jpeg',
  'Nutella Milk Cake':                    'milkcake-chocolate-bento.jpeg',
  'Turkish (Caramel) Milk Cake':          'cake-coffee-caramel-birthday.jpeg',
  'Pistachio Milk Cake':                  'milkcake-pistachio-bento.jpeg',

  // ───── SPONGE CAKES ─────
  'Vanilla Sponge Cake':                  'cake-yellow-rose-buttercream.jpeg',
  'Chocolate Sponge Cake':                'cake-chocolate-caramel-birthday.jpeg',
  'Strawberry Sponge Cake':               'cake-pink-rose-mothers-day.jpeg',
  'Red Velvet Sponge Cake':               'cake-red-velvet-hearts.jpeg',
  'Mango Sponge Cake':                    'dessertcup-chocolate-mango-duo.jpeg',
  'Blueberry Sponge Cake':                'cake-blueberry-lavender-slice.jpeg',
  'Biscoff Sponge Cake':                  'cake-biscoff-drip.jpeg',
  'Nutella Sponge Cake':                  'cake-chocolate-birthday.jpeg',
  'Pistachio Sponge Cake':                'dessertcup-pistachio-cream.jpeg',
  'Chocolate Chunk Sponge Cake':          'dessertcup-chocolate-ganache.jpeg',

  // ───── COOKIES ─────
  'Triple Choc Cookies':                  'cookies-double-chocolate.jpeg',
  'White Choc Cookies':                   'cookies-chunky.jpeg',
  'Classic Cookies':                      'cookies-chocolate-nut-board.jpeg',
  'Red Velvet Cookies':                   'cookies-triple-choc-pan.jpeg',
  'Almond Cookies':                       'cookies-choc-chunk-nut.jpeg',
  'Coconut Cookies':                      'cookies-chocolate-board.jpeg',
  'Pistachio & Rose Cookies':             'cookies-pistachio-rose.jpeg',

  // ───── CUPCAKES ─────
  // Five of these are the bakery's OWN cupcakes, cropped one per flavour out of
  // a single box photo (IMG_8134, 2160×3840 — the crop coordinates are in the
  // commit that added them). Shot in kitchen light, so they are softer than the
  // library artwork they replaced; that was the trade for showing the actual
  // cupcake a customer receives instead of a stock one.
  'Vanilla Cupcakes':                     'cupcakes-funfetti-box.jpeg',
  'Red Velvet Cupcakes':                  'cupcake-redvelvet-single.jpeg',
  'Chocolate Cupcakes':                   'cupcake-chocolate-single.jpeg',
  'Pistachio Cupcakes':                   'cupcake-pistachio-single.jpeg',
  'Biscoff Cupcakes':                     'cupcake-biscoff-single.jpeg',
  'Nutella Cupcakes':                     'cupcake-nutella-single.jpeg',
  'Strawberry Cupcakes':                  'cupcakes-pink-rose-box.jpeg',
  'Sprinkle Cupcakes':                    'cupcakes-rainbow-sprinkle.jpeg',
  'Variety Cupcakes (Box of 6)':          'cupcakes-assorted-open-box.jpeg',

  // ───── BAKES — BROWNIES ─────
  'Classic Brownie':                      'brownie-fudgy-slab.jpeg',
  'Nutella Brownie':                      'brownie-lava-tub.jpeg',
  'Biscoff Brownie':                      'brownie-chocolate-boxes.jpeg',
  'Oreo Brownie':                         'bakes-chocolate-square.jpeg',
  'Pistachio Brownie':                    'brownie-chocolate-boxes.jpeg',
  'Red Velvet Brownie':                   'bakes-chocolate-lava.jpeg',

  // ───── BAKES — BLONDIES ─────
  'Classic Blondie':                      'bakes-plain.jpeg',
  'White Chocolate Blondie':              'bakes-plain.jpeg',
  'Strawberry Blondie':                   'bakes-rose-petal-bars.jpeg',
  'Mango Blondie':                        'bakes-plain.jpeg',
  'Blueberry Blondie':                    'bakes-blueberry.jpeg',

  // ───── BAKES — CAKESICLES & MORE ─────
  // TODO — all eight share two letter/number-cake photos that aren't cakesicles
  // at all. `npm run photos` lists them under "still sharing one photo" and
  // names the file to save for each, e.g. chocolate-cakesicle-heart.jpeg.
  'Chocolate Cakesicle (Heart)':          'cake-pink-letter.jpeg',
  'Chocolate Cakesicle (Square)':         'cake-pink-letter.jpeg',
  'Chocolate Cakesicle (Circle)':         'cake-pink-number-rosette.jpeg',
  'Chocolate Cakesicle (Ice Cream)':      'cake-pink-number-rosette.jpeg',
  'Vanilla Cakesicle (Heart)':            'cake-pink-letter.jpeg',
  'Vanilla Cakesicle (Square)':           'cake-pink-letter.jpeg',
  'Vanilla Cakesicle (Circle)':           'cake-pink-number-rosette.jpeg',
  'Vanilla Cakesicle (Ice Cream)':        'cake-pink-number-rosette.jpeg',

  // ───── BAKES — CAKE POPS ─────
  // Chocolate and Pistachio are the bakery's own (the pistachio shot was
  // recovered out of an Instagram screenshot, cropped free of the phone UI).
  // TODO — Vanilla and Red Velvet have NO photo of their own and borrow the
  // chocolate one, so both currently show the wrong colour. `npm run
  // check-images` lists them under "ONE PHOTO, SEVERAL PRODUCTS" until real
  // shots replace them.
  'Chocolate Cake Pops':                  'cakepops-chocolate-rocks.jpeg',
  'Pistachio Cake Pops':                  'cakepops-pistachio.jpeg',
  'Vanilla Cake Pops':                    'cakepops-chocolate-rocks.jpeg',
  'Red Velvet Cake Pops':                 'cakepops-chocolate-rocks.jpeg',

  // ───── BAKES — CAKESICLES & MORE ─────
  'Choc Covered Strawberry':              'cheesecake-strawberry-cups.jpeg',

  // ───── PLATTERS ─────
  'Pancake (stack of 3)':                 'platter-pancake-strawberry.jpeg',
  'Crêpe Roll (Nutella filled)':          'bakes-rose-petal-bars.jpeg',

  // ───── DESSERT CUPS ─────
  'Vanilla Custard Cup':                  'dessert-cups-lemon.jpeg',
  'Chocolate Custard Cup':                'dessertcup-chocolate-pudding.jpeg',
  'Mango Custard Cup':                    'dessertcup-mango-custard.jpeg',
  'Trifle Cup':                           'dessertcup-assorted-flatlay.jpeg',
  'Jelly Cup':                            'jellycups-rainbow-layered.jpeg',
  'Milk Pudding (Ghas) Cup':              'jelly-cups-rainbow.jpeg',

  // ───── DRINKS — MOJITOS ─────
  'Virgin Mojito':                        'drink-virgin-mojito.jpeg',
  'Blue Lagoon Mojito':                   'drink-blue-lagoon.jpeg',
  'Strawberry Delight Mojito':            'drink-strawberry-mojito.jpeg',
  'Watermelon Wave Mojito':               'drink-strawberry-mojito.jpeg',
  'Mango Dream Mojito':                   'drink-strawberry-mojito.jpeg',
  'Blueberry Bliss Mojito':               'drink-blue-lagoon.jpeg',
  'Lychee Mist Mojito':                   'drink-virgin-mojito.jpeg',

  // ───── DRINKS — MILKSHAKES ─────
  'Lotus Luxury Milkshake (Biscoff)':     'drink-virgin-mojito.jpeg',
  'Hazelnut Heaven Milkshake (Nutella)':  'drink-virgin-mojito.jpeg',
  'Oreo Monster Milkshake':               'drink-blue-lagoon.jpeg',
  'Strawberry Cheesecake Milkshake':      'drink-strawberry-mojito.jpeg',
  'Blueberry Bomb Milkshake':             'drink-blue-lagoon.jpeg',
  'Golden Velvet Milkshake (Mango)':      'drink-strawberry-mojito.jpeg',
  'Pistachio Paradise Milkshake':         'drink-virgin-mojito.jpeg',

  // ───── DRINKS — ICED COFFEE ─────
  'Classic Iced Coffee':                  'drink-blue-lagoon.jpeg',
  'Mocha Madness Iced Latte':             'drink-blue-lagoon.jpeg',
  'Caramel Craze Latte':                  'drink-blue-lagoon.jpeg',
  'Vanilla Bean Dream (Iced)':            'drink-blue-lagoon.jpeg',
  'Strawberry Silk Latte':                'drink-strawberry-mojito.jpeg',
  'Cookie Monster Brew':                  'drink-blue-lagoon.jpeg',

  // ───── DRINKS — HOT COFFEE ─────
  'Classic Hot Coffee':                   'drink-virgin-mojito.jpeg',
  'Mochaccino':                           'drink-virgin-mojito.jpeg',
  'Caramel Macchiato':                    'drink-virgin-mojito.jpeg',
  'Vanilla Bean Dream (Hot)':             'drink-virgin-mojito.jpeg',

  // ───── BAKES — LOOK OUT FOR ─────
  'Cookie Fries':                         'cookies-chunky.jpeg',
  'Macarons':                             'bakes-cream-cones.jpeg',
  'Rice Krispies Treats':                 'bakes-plain.jpeg',

  // ───── CHEESECAKES — LOOK OUT FOR ─────
  'Brownie Cheesecake (Whole)':           'dessertcup-chocolate-rosette.jpeg',
  'Dipped Cheesecake Slice':              'cheesecake-strawberry-rose.jpeg',

  // ───── BAKES — LOOK OUT FOR ─────
  'Cookie Dipping Box':                   'cookies-chocolate-nut-board.jpeg',
  'Brownie Dipping Box':                  'brownie-chocolate-boxes.jpeg',
  'Brookie Dipping Box':                  'cookies-choc-chunk-nut.jpeg',
}

/** The six category teaser cards on the Menu page (keyed by card title). */
export const MENU_CARD_IMAGES = {
  'Cheesecakes':     'cheesecake-blueberry-whole.jpeg',
  'Sponge Cakes':    'cake-yellow-rose-buttercream.jpeg',
  'Milk Cakes':      'milkcake-rose-pistachio-domes.jpeg',
  'Cupcakes':        'cupcakes-red-velvet.jpeg',
  'Cookies':         'cookies-double-chocolate.jpeg',
  'Dessert Cups':    'dessertcup-assorted-flatlay.jpeg',
  'Bakes':           'brownie-chocolate-boxes.jpeg',
  // Added with the Platters card on /menu — without an entry here the card
  // silently falls back to the generic bakery shot.
  'Platters':        'platter-pancake-strawberry.jpeg',
  'Drinks':          'drink-virgin-mojito.jpeg',
}

/** Shown when a name has no entry above — deliberately generic, never a flavour. */
export const FALLBACK_PHOTO = 'cheesecake-quartet.jpeg'

/**
 * DON'T USE: milkcake-tres-leche-rose.jpeg is an Instagram screenshot — it has
 * the phone's status bar, "View Insights" and the like count baked into the
 * picture. Re-shoot the tres leches before putting it on a product.
 */

const toPath = (fileOrPath) =>
  fileOrPath.startsWith('/') ? fileOrPath : `/products/${fileOrPath}`

/**
 * Resolve a product name to its photo path. Unknown names fall back to a
 * generic shot rather than a broken image; in dev we say so in the console so a
 * typo (or a renamed product) surfaces immediately instead of shipping quietly.
 */
export function photoFor(name, map = PRODUCT_IMAGES) {
  const file = map[name]
  if (!file) {
    if (import.meta.env?.DEV) {
      console.warn(`[productImages] No photo mapped for "${name}" — using the fallback. Add it to src/data/productImages.js.`)
    }
    return toPath(FALLBACK_PHOTO)
  }
  return toPath(file)
}

/** Same lookup for the Menu page's category cards. */
export const menuCardPhoto = (title) => photoFor(title, MENU_CARD_IMAGES)
