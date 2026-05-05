import { img } from './images.js'

// All prices in INR. Sourced from menu.html.

// Featured cards on Home — visually distinctive picks across categories.
export const featured = [
  { id: 'feat-1', name: 'Strawberry Cheesecake', price: 350, img: img.berryCake, category: 'Cheesecakes' },
  { id: 'feat-2', name: 'Vanilla Cupcakes', price: 100, img: img.cupcakesRose, category: 'Cupcakes' },
  { id: 'feat-3', name: 'Triple Choc Cookies (Box of 6)', price: 340, img: img.cookies, category: 'Cookies' },
  { id: 'feat-4', name: 'Biscoff Milk Cake 6"', price: 800, img: img.pinkDripCake, category: 'Milk Cakes' },
]

// Flat list for /shop — single SKUs with cart-friendly prices.
// Items with `slice` show both Whole + Slice prices and two add-to-cart buttons.
export const shopProducts = [
  // Cheesecakes (Banto 4" whole / per slice)
  { id: 'cc-strawberry', name: 'Strawberry Cheesecake', price: 350, slice: 120, img: img.berryCake, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-blueberry', name: 'Blueberry Cheesecake', price: 410, slice: 140, img: img.berryCake, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-rose', name: 'Rose Cheesecake', price: 350, slice: 120, img: img.cupcakesRose, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-mango', name: 'Mango Cheesecake', price: 350, slice: 120, img: img.berryCake, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-nutella', name: 'Nutella Cheesecake', price: 440, slice: 150, img: img.chocolateCake, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-biscoff', name: 'Biscoff Cheesecake', price: 410, slice: 140, img: img.chocolateCake, category: 'Cheesecakes', sizeLabel: 'Banto 4"' },
  { id: 'cc-pistachio', name: 'Pistachio Cheesecake', price: 470, slice: 160, img: img.cheesecake, category: 'Cheesecakes', sizeLabel: 'Banto 4"', badge: 'Premium' },
  { id: 'cc-dubai', name: 'Dubai Cheesecake', price: 500, slice: 170, img: img.cheesecake, category: 'Cheesecakes', sizeLabel: 'Banto 4"', badge: 'Special' },

  // Milk Cakes (6" whole / per slice)
  { id: 'mc-biscoff', name: 'Biscoff Milk Cake', price: 800, slice: 100, img: img.pinkDripCake, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-rose', name: 'Rose Milk Cake', price: 800, slice: 100, img: img.pinkDripCake, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-chocolate', name: 'Chocolate Milk Cake', price: 850, slice: 110, img: img.chocolateCake, category: 'Milk Cakes', sizeLabel: '6"' },
  { id: 'mc-pistachio', name: 'Pistachio Milk Cake', price: 950, slice: 120, img: img.pinkDripCake, category: 'Milk Cakes', sizeLabel: '6"', badge: 'Premium' },

  // Cookies (Box of 6)
  { id: 'ck-triple-6', name: 'Triple Choc Cookies (Box of 6)', price: 340, img: img.cookies, category: 'Cookies' },
  { id: 'ck-classic-6', name: 'Classic Cookies (Box of 6)', price: 280, img: img.cookies, category: 'Cookies' },
  { id: 'ck-redvelvet-6', name: 'Red Velvet Cookies (Box of 6)', price: 340, img: img.cookies, category: 'Cookies' },
  { id: 'ck-almond-6', name: 'Almond Cookies (Box of 6)', price: 400, img: img.cookies, category: 'Cookies' },
  { id: 'ck-pistachio-6', name: 'Pistachio & Rose Cookies (Box of 6)', price: 400, img: img.cookies, category: 'Cookies' },

  // Bakes
  { id: 'bk-brownie', name: 'Brownie', price: 80, img: img.brownies, category: 'Bakes' },
  { id: 'bk-blondie', name: 'Blondie', price: 80, img: img.brownies, category: 'Bakes' },
  { id: 'bk-cakesickle-sq', name: 'Cakesickle (Square)', price: 120, img: img.cakePops, category: 'Bakes' },
  { id: 'bk-cakepop', name: 'Cake Pop', price: 90, img: img.cakePops, category: 'Bakes' },
  { id: 'bk-strawberry', name: 'Choc Covered Strawberry', price: 70, img: img.berryCake, category: 'Bakes' },

  // Cupcakes
  { id: 'cup-chocolate', name: 'Chocolate Cupcake', price: 100, img: img.cupcakesPink, category: 'Cupcakes' },
  { id: 'cup-vanilla', name: 'Vanilla Cupcake', price: 100, img: img.cupcakesRose, category: 'Cupcakes' },

  // Dessert Cups
  { id: 'dc-cheesecake', name: 'Cheesecake Cup', price: 150, img: img.cheesecake, category: 'Dessert Cups' },
  { id: 'dc-trifle', name: 'Trifle Cup', price: 100, img: img.berryCake, category: 'Dessert Cups' },
  { id: 'dc-custard', name: 'Custard Cup', price: 90, img: img.berryCake, category: 'Dessert Cups' },

  // Drinks
  { id: 'dr-virginmojito', name: 'Virgin Mojito', price: 120, img: img.berryCake, category: 'Drinks' },
  { id: 'dr-icedcoffee', name: 'Iced Coffee', price: 100, img: img.chocolateCake, category: 'Drinks' },
  { id: 'dr-biscoff-shake', name: 'Biscoff Milkshake', price: 180, img: img.chocolateCake, category: 'Drinks' },
  { id: 'dr-oreo-shake', name: 'Oreo Milkshake', price: 180, img: img.chocolateCake, category: 'Drinks' },
]

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
