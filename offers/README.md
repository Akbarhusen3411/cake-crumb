# Offers — the plan behind the posters

Eight offers, built from the live catalogue in `src/data/products.js` (120 products), which was
itself reconciled against **Menu & Prices** in `/admin/accounting` — the list a walk-in is
actually charged. Every regular price quoted on a poster is a real price from that list. Nothing
here is rounded, guessed, or invented.

Posters are in this folder; open `index.html` for the contact sheet and the export instructions.

---

## What the price list actually told me

Reading the whole catalogue, one thing stands out and it shapes every offer below.

**There is no fat to cut.** These are the owner's real counter prices as of Aug 2026, and the
margins are already thin in the places where a discount would be most tempting:

| Category | Entry | Top |
|---|---|---|
| Cake pops | ₹15 / pc · ₹90 box of 6 | ₹20 · ₹120 |
| Cupcakes | ₹25 / pc · ₹150 box of 6 | ₹35 · ₹190 |
| Choc-covered strawberry | ₹40 each | — |
| Dessert cups (150 ml) | ₹40 | ₹100 |
| Cookies | ₹50 / pc · ₹280 box of 6 | ₹70 · ₹400 · ₹820 box of 12 |
| Brownies & blondies | ₹60 / pc · ₹350 box of 6 | ₹80 · ₹470 |
| Cheesecake | ₹120 slice · ₹350 Banto 4" | ₹170 · ₹500 (Dubai) |
| Sponge cake | ₹100 tub · ₹450 whole Bento | ₹150 · ₹510 |
| Milk cake | ₹120 tub · ₹420 Bento | ₹140 · ₹520 |
| Cakesicles | ₹110 (heart) | ₹160 (ice cream) |
| Mojitos | ₹180 | ₹200 |
| Iced / hot coffee | ₹200 | ₹240 |
| Milkshakes | ₹220 | ₹250 |

A blanket "20% off cakes" hands away ₹90 on a ₹450 bento — on a made-to-order item where the
ingredients, the box and two hours of work are already spent. So **none of these offers is a
percentage off the menu.** They are three other things, in order of how much they earn:

1. **Attach a drink.** A mojito is ₹180 and a milkshake ₹240 — the highest-priced lines on the
   menu, on ingredients that cost a fraction of a cheesecake's. They are also the least attached:
   nothing on the site or the counter currently asks a slice buyer whether they want something to
   drink. Offer 1 does exactly that. *This is the single biggest lever here.*
2. **Raise the basket to a threshold.** A gift costs the kitchen its ingredients, not its menu
   price. Six cake pops are ₹90 on the list; the flour, chocolate and sticks are a small share of
   that. Offers 3 and 4 buy a ₹150–400 basket increase for that.
3. **Make them come back and bring someone.** Offers 7 and 8. A bakery with no shop counter lives
   on repeat orders, and both of these run off the phone number already sitting in the order book.

Two more notes that fell out of reading the data:

- **The cupcake box barely beats six singles, and for four flavours it loses.** Chocolate, Nutella
  and Strawberry boxes are ₹170 against ₹168 for six singles; Sprinkle is ₹155 against ₹150.
  `products.js` flags this as the thing customers check. Offer 2 settles it — the box now gets you
  eight, so it is unambiguously the better buy, without touching a single price.
- **₹1,000 is a wall, so offer 4 stops at ₹999.** At a ₹1,000 subtotal `shopConfig.js` makes the
  order "bulk": plain COD disappears and a 50% advance is required. That rule is there for good
  reason and should stay — but the threshold used to *lift* an everyday basket should not be the
  one that adds payment friction. ₹999 sits one rupee under it on purpose.

---

## The eight offers

### 1 · Slice & Sip — ₹249
> One cheesecake slice + one Virgin Mojito. Regular ₹300. Any other slice or drink: pay the
> difference on top of ₹249.

- **Math:** cheapest slice ₹120 + Virgin Mojito ₹180 = ₹300 → ₹249. **Saves ₹51.** Upgrades are
  priced off the ₹300 base, so the ₹51 is constant however they trade up — a ₹170 Dubai slice with
  a ₹250 Pistachio Paradise milkshake is ₹420 regular, ₹369 on the offer.
- **Why:** it makes an existing ₹120 sale into a ₹249 one. Even at the deepest upgrade the bakery
  never gives away more than ₹51.
- **Watch:** don't let it become "any dessert + any drink" — a ₹15 cake pop plus a mojito for ₹249
  would be the same discount on a fifth of the sale.

### 2 · Cupcake Tuesday — eight for the price of six
> Order any box of six cupcakes for a Tuesday and we bake eight.

- **Cost:** two cupcakes' ingredients. Menu value ₹50–70.
- **Why:** it gives the box a reason to exist (see the note above), and it plants one weekday
  people learn. A day-of-the-week offer is the cheapest habit a small kitchen can build.
- **Note:** the poster says *order Monday*, because everything here is baked to order and the site
  says so everywhere. It does not promise same-day.

### 3 · Six on us — ₹599+ gets a free box of six cake pops
- **Cost:** ₹90 at menu price, far less in ingredients.
- **Why:** a typical order sits around ₹300–500 (a cheesecake, or a box of brownies and a drink).
  ₹599 is a believable stretch — one more slice, or a box of cake pops added on purpose.
- **Threshold is the subtotal, before delivery.** Say so, or every borderline order becomes an
  argument.

### 4 · The ₹999 Table — free six cupcakes + six cake pops
- **Cost:** ₹240 at menu price on a ₹999 order — under a quarter, and much less in ingredients.
- **Why:** it turns a single-cake order into a small spread, and it stops one rupee short of the
  bulk-advance rule (above).

### 5 · Celebration Pack — ₹849
| | |
|---|---|
| Vanilla Sponge Cake, whole Bento | ₹450 |
| Six cupcakes | ₹150 |
| Six cake pops | ₹90 |
| Six chocolate-covered strawberries | ₹240 |
| **Regular** | **₹930** |
| **Pack** | **₹849 — saves ₹81** |

- Chocolate / Strawberry / Red Velvet sponge is ₹470, so those packs are ₹869 (the poster says
  "+₹20"). Pistachio sponge is ₹510 → ₹909 ("+₹60").
- **Why:** a birthday customer currently buys one bento cake for ₹450 and leaves. This is the same
  customer at ₹849, and the extras are the cheap-to-make items.
- Stays under ₹1,000, so no advance is needed and the order closes on the spot.

### 6 · Grand Party Board — ₹1,999
| | |
|---|---|
| Chocolate Sponge Cake, whole Bento | ₹470 |
| Blueberry Cheesecake, Banto 4" | ₹410 |
| Twelve cupcakes (two boxes) | ₹300 |
| Twelve cake pops (two boxes) | ₹180 |
| Six Classic Cookies | ₹280 |
| Six Classic Brownies | ₹350 |
| Six Vanilla Custard Cups | ₹360 |
| **Regular** | **₹2,350** |
| **Board** | **₹1,999 — saves ₹351 (15%)** |

- **Why:** this is the order worth chasing. One board is thirteen ordinary orders' worth of
  revenue, baked in one session, with one delivery.
- It is deliberately over ₹1,000, so the 50% advance applies — and here that's a feature. It
  confirms the date and covers the ingredients before a large bake starts. The poster says so
  plainly.
- **Three days' notice** on the poster. Don't shorten it; seven components in one session is a real
  constraint.

### 7 · Bring a Friend — ₹100 each
> Their first order of ₹500+ gets ₹100 off. ₹100 waits against your number for your next one.

- **Cost:** ₹200 total, and only ever after ₹500 of new business has actually landed.
- **How it is enforced, honestly:** the friend gives the referrer's phone number on WhatsApp; the
  bakery checks it against past orders before confirming. This is the same pattern the site already
  uses for UPI — the customer *claims*, the bakery verifies — and it is the only pattern that works
  without accounts. `CLAUDE.md` spells out why a per-customer offer can't be enforced in the
  browser: a `localStorage` flag dies with an incognito tab.

### 8 · The Sixth Is Ours — every sixth order, a free cheesecake slice
- **Cost:** up to ₹170, after five paid orders.
- **Why:** no card to print, no card to lose. `/admin/orders` and the accounting order book are
  already keyed by customer, and the customer list dedupes by name case-insensitively — the count
  is a lookup, not new bookkeeping.
- **Qualifying floor of ₹200** keeps someone from placing six ₹40 orders for a ₹170 slice.

---

## Running these without touching the site

**The website has no coupon field, and shouldn't get one.** A discount system was scoped and
explicitly deferred by the owner, and adding one means moving `total` in five places at once
(`shopConfig.js`, `CartContext.jsx`, `Checkout.jsx`, `ChatBot.jsx`) plus the order record, the
tracking mirror, the EmailJS template and the Firestore create rules. None of that is needed here.

All eight run **manually, on WhatsApp and at the counter**:

1. The customer orders as normal, on the site or on WhatsApp.
2. The bakery applies the offer when confirming, and says the final figure in the reply.
3. In `/admin/accounting`, the order is written at **what the customer actually pays** — free items
   go in as lines at ₹0, or are simply not billed. Never book the full price and "remember" the
   discount; `computeSummary` counts money received, and the Dashboard would overstate earnings.
4. If the payment is UPI, the bakery verifies the credit **by matching the amount** in
   `/admin/orders`. So the amount the customer is told must be the amount they pay — no "adjust
   later".

## Keeping the posters honest

These follow the same rules the website is held to, and they should stay that way:

- **No opening hours.** The bakery is made-to-order, not a shop counter — the site publishes no
  hours anywhere and neither do these. The wording is the site's own: *order a day ahead; message
  late and it's ready the next day.*
- **No distances.** Delivery is worked out from the pincode behind the scenes and the customer is
  only ever shown the amount. No poster says "free within 10 km".
- **No ratings, no guarantees.** Nothing here claims a star score or promises "on time, every
  time" — three fabrications of exactly that kind were removed from the site and must not come back
  through the marketing.
- **FSSAI 20726012000837** appears on every poster; displaying it is required of a food business.
  The certificate scans are never published — they carry the owner's photograph, an Aadhaar
  reference and a home address.
- **Offers don't stack.** Stated once on the counter card. Decide it now rather than at the till.

## A suggested order of release

| When | Put out | Why |
|---|---|---|
| Week 1 | 1 · Slice & Sip, 3 · Six on us | The two that change everyday behaviour. Both are instant. |
| Week 2 | 2 · Cupcake Tuesday | Needs a week of "every Tuesday" before anyone remembers it. |
| Week 3 | 5 · Celebration Pack, 4 · The ₹999 Table | Basket-lifters, once people are already ordering more often. |
| Week 4 | 7 · Bring a Friend, 8 · The Sixth Is Ours | Retention only pays once there are regulars to retain. |
| Standing | 6 · Grand Party Board | Not a campaign — send it to anyone who asks about a party, and put it in the delivery bag. |
| Counter | 9 · The A4 card | In the bag with every order, and pinned in the kitchen so the offers are applied consistently. |

Reprice the posters whenever `products.js` and Menu & Prices change — every regular price on them
is quoted from that list, and a poster that contradicts the menu is worse than no poster.
