// Builds menu/menu-a4.html — the 8-page A4 print menu — from src/data/products.js.
//
//   node menu/build-menu.mjs
//
// Every name and price on the menu is READ from products.js (the website's
// catalogue, reconciled against the counter menu in /admin/accounting), so a
// price change there reaches the printed menu by re-running this script and
// re-exporting the PDF. Nothing here holds a price of its own.
//
// What IS hand-kept, like every file in cards/ and pamphlet/: the contact
// details, the address, the ₹1,000 / 50% advance rule (BULK_ORDER_MIN /
// DEPOSIT_PCT in shopConfig.js), the 30-minute cancellation line (/faq), the
// registration numbers (data/certifications.js), and which photo heads each page.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { shopProducts } from '../src/data/products.js'
import { FSSAI, UDYAM } from '../src/data/certifications.js'
import { inr } from '../src/data/format.js'

const here = path.dirname(fileURLToPath(import.meta.url))

// Prices go through the site's own inr() — ₹350.00, two decimals, exactly as the website shows them.
const rs = (n) => (n == null ? '—' : inr(n))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const byCat = (cat, group) =>
  shopProducts.filter((p) => p.category === cat && (group === undefined || p.group === group))
const byGroup = (group) => shopProducts.filter((p) => p.group === group)
const nuts = (p) => p.allergens?.includes('contains-nuts')

// Inside a section headed "Cheesecakes" the word is noise on every row.
const strip = (re) => (p) => p.name.replace(re, ' ').replace(/\s+/g, ' ').trim()

// ── table builders ──────────────────────────────────────────────────────────
function badge(p) {
  if (!p.badge) return ''
  return ` <span class="badge badge--${p.badge.toLowerCase()}">${esc(p.badge)}</span>`
}
function nameCell(p, label) {
  return `<td class="nm"><span class="dot">&#9829;</span>${esc(label(p))}${nuts(p) ? '<sup class="nut" title="Contains nuts">N</sup>' : ''}${badge(p)}</td>`
}

/** A priced table: `cols` = [{ head, get(p) }]. */
function table(items, { label = (p) => p.name, cols, groupBy } = {}) {
  const head = `<thead><tr><th class="nm">Flavour</th>${cols.map((c) => `<th>${c.head}</th>`).join('')}</tr></thead>`
  let body = ''
  let last
  for (const p of items) {
    if (groupBy && p[groupBy] !== last) {
      last = p[groupBy]
      body += `<tr class="grp"><td colspan="${cols.length + 1}">${esc(last)}</td></tr>`
    }
    body += `<tr>${nameCell(p, label)}${cols.map((c) => `<td class="pr">${rs(c.get(p))}</td>`).join('')}</tr>`
  }
  return `<table class="menu cols-${cols.length}">${head}<tbody>${body}</tbody></table>`
}

/** A one-price list with dotted leaders. */
function list(items, { label = (p) => p.name } = {}) {
  return `<ul class="list">${items
    .map((p) => `<li><span class="dot">&#9829;</span><span class="ln">${esc(label(p))}${nuts(p) ? '<sup class="nut">N</sup>' : ''}${badge(p)}</span><span class="lead"></span><span class="pr">${rs(p.price)}</span></li>`)
    .join('')}</ul>`
}

// `band: true` draws the heading as a pink category band (like Classic / Exotic).
const sub = (title, note = '', { band = false } = {}) =>
  `<h3 class="sub${band ? ' sub--band' : ''}"><span>${title}</span></h3>${note ? `<p class="subnote">${note}</p>` : ''}`

// A portrait photo either side of the title (page 2).
const sideFig = (src) => `<figure class="hero__img"><img src="../public/products/${src}-800.webp" alt="" /></figure>`

function page(n, { title, script, photos = [], side, body, cls = '' }) {
  const ph = photos.length
    ? `<div class="photos photos--${photos.length}">${photos
        .map((src) => `<figure><img src="../public/products/${src.replace(/.webp$/, '-800.webp')}" alt="" /></figure>`)
        .join('')}</div>`
    : ''
  return `
<section class="page ${cls}">
  <header class="run">
    <div class="run__brand">
      <img src="../public/logo_final-400.webp" alt="" />
      <div><div class="run__name">CAKE<i>&amp;</i>CRUMB</div><div class="run__tag">The gourmet chocolate &amp; berry boutique</div></div>
    </div>
    <div class="run__right">Homemade cakes &amp; desserts</div>
  </header>
  <div class="band">
    ${side ? `<div class="hero">${sideFig(side[0])}<div class="hero__mid">` : ''}
    <div class="eyebrow">Our Menu</div>
    <h2 class="title">${title}</h2>
    ${script ? `<div class="script">${script}</div>` : ''}
    <div class="divider" aria-hidden="true"><span></span><b>&#9829;</b><span></span></div>
    ${side ? `</div>${sideFig(side[1])}</div>` : ''}
    ${ph}
  </div>
  <div class="content"><div class="fit">${body}</div></div>
  <footer class="foot">
    <span>Order on WhatsApp · +91 91731 83440</span>
    <span class="pg">${n}</span>
    <span>Please pre-order a day ahead</span>
  </footer>
</section>`
}

// ── page bodies ─────────────────────────────────────────────────────────────
const cheesecakes = byCat('Cheesecakes').filter((p) => p.group !== 'Look Out For')
const pCheese = table(cheesecakes, {
  label: strip(/\s*Cheesecake\b/),
  groupBy: 'group',
  cols: [{ head: 'Banto', get: (p) => p.price }, { head: 'Tub', get: (p) => p.slice }],
}) + '<div class="sizekey"><div class="sizekey__t">Size guide</div><div class="sizekey__row"><span><b>Banto</b> — whole cake, 450–500 g</span><span><b>Tub</b> — single serve, for one person</span></div></div>'

const pCakes = `
  <div class="two">
    <div>
      ${sub('Milk Cakes', 'Sponge soaked in sweetened milk')}
      ${table(byCat('Milk Cakes'), { label: strip(/\s*Milk Cake\b/), cols: [{ head: 'Bento', get: (p) => p.price }, { head: 'Tub', get: (p) => p.slice }] })}
    </div>
    <div>
      ${sub('Sponge Cakes', 'Light sponge layered with fresh cream')}
      ${table(byCat('Sponge Cakes'), { label: strip(/\s*Sponge Cake\b/), cols: [{ head: 'Bento', get: (p) => p.price }, { head: 'Tub', get: (p) => p.slice }] })}
    </div>
  </div>
  ${sub('Cookies', 'Thick, chewy, baked to order · mixed or single flavour')}
  ${table(byCat('Cookies'), { label: strip(/\s*Cookies\b/), cols: [{ head: '1 Cookie', get: (p) => p.unit }, { head: 'Box of 6', get: (p) => p.price }, { head: 'Box of 12', get: (p) => p.slice }] })}
  <div class="note">Birthday or celebration cake in your own design? Custom cakes are made to order — message us with your idea.</div>
  <div class="sizekey"><div class="sizekey__t">Size guide</div><div class="sizekey__row"><span><b>Bento</b> — whole cake, 450–500 g</span><span><b>Tub</b> — single serve, for one person</span></div></div>`

const pieceCols = [{ head: '1 pc', get: (p) => p.price }, { head: 'Box of 6', get: (p) => p.slice }]
const cakesicles = byGroup('Cakesicles')
const shapes = ['Heart', 'Square', 'Circle', 'Ice Cream']
const cakesicleRow = (flav) =>
  `<tr><td class="nm"><span class="dot">&#9829;</span>${flav}</td>${shapes
    .map((s) => `<td class="pr">${rs(cakesicles.find((p) => p.name === `${flav} Cakesicle (${s})`)?.price)}</td>`)
    .join('')}</tr>`
const pTreats = `
  <div class="two">
    <div>
      ${sub('Cupcakes', 'Per piece (min. 2) or a box of 6')}
      ${table(byCat('Cupcakes'), {
        label: strip(/\s*Cupcakes\b/),
        cols: [
          { head: '1 pc', get: (p) => (p.slice != null ? p.price : null) },
          { head: 'Box of 6', get: (p) => (p.slice != null ? p.slice : p.price) },
        ],
      })}
    </div>
    <div>
      ${sub('Cake Pops', 'Per piece (min. 2) or a box of 6')}
      ${table(byGroup('Cake Pops'), { label: strip(/\s*Cake Pops\b/), cols: pieceCols })}
      ${sub('Dessert Cups', 'Chilled, layered, 150 ml')}
      ${list(byCat('Dessert Cups'))}
    </div>
  </div>
  ${sub('Cakesicles', 'Cake on a stick, dipped and decorated by hand · price per piece')}
  <table class="menu cols-4"><thead><tr><th class="nm">Flavour</th>${shapes.map((s) => `<th>${s}</th>`).join('')}</tr></thead>
  <tbody>${cakesicleRow('Chocolate')}${cakesicleRow('Vanilla')}</tbody></table>
  <div class="two two--top">
    <div>
      ${sub('Sweet Treats')}
      ${list(byGroup('Sweet Treats'))}
    </div>
    <div>
      ${sub('Platters')}
      ${list(byCat('Platters'))}
    </div>
  </div>`

const gift = shopProducts.find((p) => p.id === 'sg-birthday-box')
const lookOut = byGroup('Look Out For')
const newItems = lookOut.filter((p) => !/Dipping Box/.test(p.name))
const pBakes = `
  <div class="two">
    <div>
      ${sub('Brownies', 'Dense and fudgy', { band: true })}
      ${table(byGroup('Brownies'), { label: strip(/\s*Brownie\b/), cols: pieceCols })}
    </div>
    <div>
      ${sub('Blondies', 'Chewy white-chocolate bakes', { band: true })}
      ${table(byGroup('Blondies'), { label: strip(/\s*Blondie\b/), cols: pieceCols })}
      <p class="subnote subnote--c">Brownies &amp; blondies also come in a box of 4 or 12.</p>
    </div>
  </div>
  <div class="two two--top">
    <div>
      ${sub('New on the Menu', 'Coming soon: Doughnuts · Bombolone')}
      ${list(newItems)}
    </div>
    <div>
      ${sub('Dipping Boxes', 'A sharing box with a warm dip')}
      ${list(lookOut.filter((p) => /Dipping Box/.test(p.name)))}
    </div>
  </div>
  ${gift ? `
  <div class="gift">
    <figure><img src="../public/products/gift-box-birthday-flatlay.webp" alt="" /></figure>
    <div class="gift__txt">
      <div class="gift__kicker">Special Gifts · Birthday</div>
      <div class="gift__name">${esc(gift.name)}</div>
      <p>A birthday cake and fresh flowers, packed together in one gift box.</p>
      <p class="gift__free">&#9829; A dessert cup comes free with it</p>
      <div class="gift__price">${rs(gift.price)}</div>
    </div>
  </div>` : ''}`

const pDrinks = `
  <div class="two">
    <div>
      ${sub('Mojitos', 'Chilled, fizzy, per glass')}
      ${list(byGroup('Mojitos'))}
      ${sub('Iced Coffee')}
      ${list(byGroup('Iced Coffee'))}
    </div>
    <div>
      ${sub('Milkshakes', 'Thick, blended to order, per glass')}
      ${list(byGroup('Milkshakes'), { label: (p) => p.name.replace(/\s*Milkshake\b/, '') })}
      ${sub('Hot Coffee', 'Add cream for ₹10.00')}
      ${list(byGroup('Hot Coffee'))}
    </div>
  </div>
  <div class="note">Most of our cakes and bakes can be made eggless on request — just ask when you order.</div>`

// ── cover + contact ─────────────────────────────────────────────────────────
const cover = `
<section class="page cover">
  <div class="frame" aria-hidden="true"></div>
  <header class="masthead">
    <img class="masthead__logo" src="../public/logo_final.png" alt="" />
    <div class="masthead__text">
      <h1 class="cover__name">CAKE<i>&amp;</i>CRUMB</h1>
      <div class="cover__tag">The gourmet chocolate &amp; berry boutique</div>
      <div class="divider" aria-hidden="true"><span></span><b>&#9829;</b><span></span></div>
      <div class="cover__menu">Our Menu</div>
      <div class="cover__sub">Homemade cakes &amp; desserts · made to order</div>
    </div>
  </header>
  <div class="mosaic">
    ${['cake-biscoff-drip-top', 'cake-blueberry-lavender-slice', 'cake-heart-ma-pink-roses', 'cake-chocolate-caramel-birthday', 'cake-coffee-caramel-birthday']
      .map((n, i) => `<figure class="${i === 1 ? 'mosaic__big' : ''}"><img src="../public/products/${n}-800.webp" alt="" /></figure>`).join('')}
  </div>
  <div class="inside">
    <div class="inside__t"><span>What&rsquo;s inside</span></div>
    <ol class="inside__list">
      ${[['Cheesecakes', 2], ['Milk &amp; Sponge Cakes', 3], ['Cookies', 3], ['Cupcakes &amp; Cake Pops', 4], ['Dessert Cups &amp; Cakesicles', 4], ['Brownies &amp; Blondies', 5], ['Birthday Gift Box', 5], ['Drinks &amp; Coffee', 6], ['Order &amp; Contact', 7]]
        .map(([t, n]) => `<li><span>${t}</span><span class="lead"></span><b>${n}</b></li>`).join('')}
    </ol>
  </div>
  <div class="promises">
    <div><svg viewBox="0 0 24 24"><use href="#i-cake"/></svg><span>Made to order</span></div>
    <div><svg viewBox="0 0 24 24"><use href="#i-heart"/></svg><span>Eggless on request</span></div>
    <div><svg viewBox="0 0 24 24"><use href="#i-van"/></svg><span>Delivery &amp; pickup</span></div>
  </div>
  <div class="cover__line">&ldquo;Every cake is baked fresh, just for you.&rdquo;</div>
  <div class="cover__regs">
    <span>${FSSAI.prefix} <b>${FSSAI.number}</b></span>
    <span class="sep">&#9829;</span>
    <span>${UDYAM.prefix} <b>${UDYAM.number}</b></span>
  </div>
  <div class="cover__place">Vaso · Kheda · Gujarat</div>
</section>`

const contact = (n) => `
<section class="page contact">
  <div class="frame" aria-hidden="true"></div>
  <img class="contact__logo" src="../public/logo_final.png" alt="" />
  <div class="cover__name contact__name">CAKE<i>&amp;</i>CRUMB</div>
  <div class="cover__tag">The gourmet chocolate &amp; berry boutique</div>
  <div class="divider" aria-hidden="true"><span></span><b>&#9829;</b><span></span></div>
  <h2 class="title">Order &amp; Contact</h2>

  <div class="steps">
    <div class="step"><b>1</b><span>Choose from<br />this menu</span></div>
    <div class="step"><b>2</b><span>Message us<br />on WhatsApp</span></div>
    <div class="step"><b>3</b><span>Pick up, or we<br />deliver to you</span></div>
  </div>

  <div class="panel">
    <div class="row two-up">
      <div class="item"><span class="disc"><svg viewBox="0 0 24 24"><use href="#i-wa"/></svg></span><span class="val">+91 91731 83440<small>WhatsApp &amp; calls</small></span></div>
      <div class="item"><span class="disc"><svg viewBox="0 0 24 24"><use href="#i-insta"/></svg></span><span class="val">@cake_and_crumb_1<small>Instagram</small></span></div>
    </div>
    <div class="row"><div class="item"><span class="disc"><svg viewBox="0 0 24 24"><use href="#i-mail"/></svg></span><span class="val">cakeandcrumb.in@gmail.com</span></div></div>
    <div class="row"><div class="item"><span class="disc"><svg viewBox="0 0 24 24"><use href="#i-pin"/></svg></span><span class="val">386, Zahir Manzil, Venipura, Mominvad, Near Police Station,<br />Vaso, Kheda, Gujarat-387380, India</span></div></div>
  </div>

  <div class="facts">
    <div class="fact"><svg viewBox="0 0 24 24"><use href="#i-clock"/></svg><div><b>Pre-order required</b>Please order 1 day in advance</div></div>
    <div class="fact"><svg viewBox="0 0 24 24"><use href="#i-pay"/></svg><div><b>UPI (any app) · Cash</b>Orders of ₹1,000 or more: 50% advance by UPI</div></div>
    <div class="fact"><svg viewBox="0 0 24 24"><use href="#i-van"/></svg><div><b>Home delivery</b>Charges by distance</div></div>
    <div class="fact"><svg viewBox="0 0 24 24"><use href="#i-home"/></svg><div><b>Self-pickup</b>Free, from Vaso</div></div>
    <div class="fact"><svg viewBox="0 0 24 24"><use href="#i-alert"/></svg><div><b>Cancellation</b>Within 30 min of ordering only</div></div>
    <div class="fact"><svg viewBox="0 0 24 24"><use href="#i-cake"/></svg><div><b>Bulk &amp; custom orders</b>Always welcome — just ask</div></div>
  </div>

  <div class="codes">
    <div class="qr"><div class="qr__box"><img src="../cards/qr/whatsapp.svg" alt="QR: WhatsApp" /><span class="qr__badge"><svg viewBox="0 0 24 24"><use href="#i-wa"/></svg></span></div><div class="qr__label">Order on WhatsApp</div><div class="qr__sub">+91 91731 83440</div></div>
    <div class="qr"><div class="qr__box"><img src="../cards/qr/instagram.svg" alt="QR: Instagram" /><span class="qr__badge"><svg viewBox="0 0 24 24"><use href="#i-insta"/></svg></span></div><div class="qr__label">Follow on Instagram</div><div class="qr__sub">@cake_and_crumb_1</div></div>
    <div class="qr"><div class="qr__box"><img src="../cards/qr/reviews.svg" alt="QR: Google Maps" /><span class="qr__badge"><svg viewBox="0 0 24 24"><use href="#i-star"/></svg></span></div><div class="qr__label">Find us on Google</div><div class="qr__sub">Map &amp; reviews</div></div>
  </div>

  <div class="thanks">Thank you for supporting our small business!</div>
  <div class="cover__regs contact__regs">
    <span>${FSSAI.prefix} <b>${FSSAI.number}</b></span>
    <span class="sep">&#9829;</span>
    <span>${UDYAM.prefix} <b>${UDYAM.number}</b></span>
  </div>
  <div class="contact__small">Prices in ₹ · <sup class="nut">N</sup> contains nuts · prices may change — please confirm when ordering.</div>
  <footer class="foot"><span></span><span class="pg">${n}</span><span></span></footer>
</section>`

const pages = [
  cover,
  page(2, { title: 'Cheesecakes', script: 'Baked on a buttery biscuit base', side: ['cheesecake-pomegranate-berry', 'dessertcup-nutella'], body: pCheese }),
  page(3, { title: 'Cakes &amp; Cookies', script: 'Soft, creamy, made fresh', photos: ['milkcake-rose-pistachio.webp', 'dessertcup-red-velvet-cream.webp', 'cookies-chunky.webp'], body: pCakes }),
  page(4, { title: 'Cupcakes &amp; Treats', script: 'Little treats, big smiles', photos: ['cupcakes-red-velvet.webp', 'cupcakes-chocolate-box.webp', 'cakepops-pistachio.webp'], body: pTreats }),
  page(5, { title: 'Bakes &amp; Gifts', script: 'Brownies, blondies &amp; more', body: pBakes, cls: 'page--gift' }),
  page(6, { title: 'Drinks', script: 'Something cool to sip', photos: ['drink-virgin-mojito.webp', 'drink-blue-lagoon.webp', 'drink-strawberry-mojito.webp'], body: pDrinks }),
  contact(7),
]

const css = fs.readFileSync(path.join(here, 'menu.css'), 'utf8')
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Menu — Cake &amp; Crumb</title>
<!-- GENERATED by menu/build-menu.mjs from src/data/products.js — edit the script or menu.css, not this file. -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Allura&family=Great+Vibes&family=Dancing+Script:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Lato:wght@400;700&display=swap" rel="stylesheet" />
<script>
  // ?png = one page, no grey surround, for the screenshot export; ?page=N picks it.
  const q = new URLSearchParams(location.search)
  if (q.has('png')) document.documentElement.classList.add('png')
  if (q.has('page')) document.documentElement.dataset.page = q.get('page')
</script>
<style>
${css}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-wa" viewBox="0 0 24 24"><path d="M3.5 20.5l1.3-4.2A8.6 8.6 0 1 1 8 19.4z"/><path d="M9 8.6c0 3 2.6 6 6 6.4l1.2-1.4-1.9-1-1 .8c-1-.4-1.8-1.2-2.2-2.2l.8-1-1-1.9z"/></symbol>
  <symbol id="i-insta" viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".6"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 6.5-8 12-8 12s-8-5.5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4.5" width="20" height="15" rx="2"/><path d="m2.5 6 9.5 7 9.5-7"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.6 1.6M9.5 2.5h5"/></symbol>
  <symbol id="i-pay" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2.2"/><path d="M2 10h20M6 15h4"/></symbol>
  <symbol id="i-van" viewBox="0 0 24 24"><path d="M1.5 6.5h12v10h-12zM13.5 10h4.2l3.8 3.4v3.1h-8z"/><circle cx="6" cy="17.5" r="1.9"/><circle cx="17.5" cy="17.5" r="1.9"/></symbol>
  <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11.2 12 3.5l9 7.7"/><path d="M5.5 9.6V20.5h13V9.6"/><path d="M10 20.5v-6h4v6"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 3.2 22 20.5H2z"/><path d="M12 9.8v5M12 17.6v.2"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20.5S3.5 15 2.6 9.6C2 5.9 4.6 3.5 7.5 3.5c2 0 3.5 1.2 4.5 2.7 1-1.5 2.5-2.7 4.5-2.7 2.9 0 5.5 2.4 4.9 6.1C20.5 15 12 20.5 12 20.5z"/></symbol>
  <symbol id="i-cake" viewBox="0 0 24 24"><path d="M3 21h18M4.5 21v-7.5h15V21M4.5 16.5c2.5 1.5 4.5-1.5 7.5 0s5 -1.5 7.5 0M12 13.5V9.5M12 6.8c-1-1-1-2.3 0-3.3 1 1 1 2.3 0 3.3z"/><path d="M7 13.5v-2.5h10v2.5"/></symbol>
</svg>
<main class="sheet">
${pages.join('\n')}
</main>
<script>
  // Fill every menu page exactly: grow row spacing, then photo size, while the
  // content still fits above the footer. Shrinks below the default if it overflows.
  async function fit() {
    await document.fonts.ready
    await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r })))
    for (const page of document.querySelectorAll('.page')) {
      const box = page.querySelector('.content'), inner = box && box.querySelector('.fit')
      if (!inner) continue
      const fits = () => inner.scrollHeight <= box.clientHeight - 1
      const set = (k, v) => page.style.setProperty(k, v + 'mm')
      let rp = 1.1
      set('--rp', rp)
      while (!fits() && rp > 0.6) set('--rp', rp = +(rp - 0.05).toFixed(2))
      // Still too long: give up photo height before squeezing rows any further.
      for (let ph = 30; !fits() && ph > 16; ) set('--ph', --ph)
      while (!fits() && rp > 0.3) set('--rp', rp = +(rp - 0.05).toFixed(2))
      while (fits() && rp < 2.6) set('--rp', rp = +(rp + 0.05).toFixed(2))
      if (!fits()) set('--rp', rp = +(rp - 0.05).toFixed(2))
      if (rp >= 2.55) {
        for (const [k, start, max] of [['--ph', 30, 52], ['--gs', 64, 82]]) {
          let v = start
          while (fits() && v < max) set(k, ++v)
          if (!fits()) set(k, --v)
        }
      }
    }
    document.documentElement.classList.add('fitted')
  }
  fit()
</script>
</body>
</html>
`
fs.writeFileSync(path.join(here, 'menu-a4.html'), html)
console.log('wrote menu/menu-a4.html —', pages.length, 'pages,', shopProducts.length, 'products in catalogue')
