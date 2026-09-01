# Offers — the plan behind the posters

Eight offers, built from the live catalogue in `src/data/products.js` (120 products), which was
itself reconciled against **Menu & Prices** in `/admin/accounting` — the list a walk-in is
actually charged. Every price quoted on a poster is a real price from that list.

Posters are in this folder; open `index.html` for the contact sheet and the export instructions.

---

## The rule these follow

**No menu price is discounted.** A cheesecake costs what the menu says. A box of six cupcakes
costs ₹150 for Vanilla and ₹180 for Red Velvet, exactly as it always did. The offer is a **free
item added to the order**, never a reduction.

Exactly one offer moves a figure at all — Slice & Sip takes **₹20** off a slice-and-a-drink — and
it says on its own poster that it is the only one.

This is the right shape for this menu. These are the owner's real counter prices and there is no
fat in them: 20% off a ₹450 bento hands away ₹90 on a made-to-order item whose ingredients and two
hours of work are already spent. A free cupcake costs the kitchen a cupcake's ingredients, and the
customer values it at the ₹35 on the menu. The gift is cheaper to give and reads as more generous.

It also keeps the posters honest against the site. A bundle price like "₹849" is a number a
customer cannot check against anything; "your cake at menu price, two cupcakes free" is a claim
they can verify on `/shop` in ten seconds.

**Two of each free item, not one.** The bakery won't bake a single cupcake or a single cake pop —
`minQty: 2` in `products.js`, enforced in the cart. Giving one free would contradict the site's own
minimum, so the gifts come in twos.

---

## The eight

| | Offer | The customer pays | They get free | Costs you |
|---|---|---|---|---|
| 1 | Two Cheesecakes | 2 × ₹350–500, menu price | 2 cupcakes + 2 cake pops | ≤ ₹110 at menu value |
| 2 | Cupcake Box | ₹150–190, menu price | 2 cake pops | ≤ ₹40 |
| 3 | Order a Cake | ₹420–520, menu price | 2 cupcakes | ≤ ₹70 |
| 4 | Seven for Six | ₹280–470, menu price | a 7th, same flavour | ≤ ₹80 |
| 5 | Slice & Sip | ₹20 off the pair | — | ₹20 |
| 6 | Six on Us | ₹999+, menu price | box of 6 cake pops | ₹90 |
| 7 | Bring a Friend | their ₹500+ first order | a ₹90 box each | ₹180, after ₹500 lands |
| 8 | The Sixth Is Ours | five paid orders | a cheesecake slice | ≤ ₹140 |

Every "costs you" figure above is the **menu value** of the free item — what the customer thinks
they got. The ingredient cost is a fraction of it, which is the whole point of giving goods rather
than money.

### Why these particular gifts

**Cake pops and cupcakes carry almost every offer**, on purpose. They are the cheapest things on
the menu to make (₹15–35 a piece), they photograph well, and they are the two items a customer is
least likely to have ordered — so the gift introduces a product rather than discounting one they
were already buying. Four of the eight offers end with cake pops in the bag.

**Offer 1 is the one to lead with.** Two whole cheesecakes is a ₹700–1,000 order, and the gift
costs ₹110 at menu value. It also turns the most common single-item order — one cheesecake — into
a two-item one, which is a far bigger lift than any discount would buy.

**Offer 2 quietly fixes the cupcake box.** Chocolate, Nutella and Strawberry boxes are ₹170 against
₹168 for six singles, and Sprinkle is ₹155 against ₹150 — `products.js` flags this as the
arithmetic customers check. Two free cake pops make the box the better buy again without touching a
single price.

**Offer 6 stops at ₹999 on purpose.** At a ₹1,000 subtotal `shopConfig.js` makes the order bulk:
plain COD disappears and a 50% advance applies. That rule should stay, but the threshold that lifts
an everyday basket shouldn't be the one that adds payment friction.

**Offers 7 and 8 give goods, not money.** An earlier draft took ₹100 off, which is real cash out of
a thin margin. A ₹90 box of cake pops reads as worth more and costs less.

---

## Running these without touching the site

**The website has no coupon field, and shouldn't get one.** A discount system was scoped and
explicitly deferred by the owner, and adding one means moving `total` in five places at once
(`shopConfig.js`, `CartContext.jsx`, `Checkout.jsx`, `ChatBot.jsx`) plus the order record, the
tracking mirror, the EmailJS template and the Firestore create rules.

None of that is needed here — and that is largely *because* these are free items rather than
discounts. Seven of the eight leave every total exactly as the site already computes it. Only
Slice & Sip changes a figure, and ₹20 is adjusted by hand when confirming.

All eight run **manually, on WhatsApp and at the counter**:

1. The customer orders as normal, on the site or on WhatsApp.
2. The bakery adds the free item when confirming, and says so in the reply.
3. In `/admin/accounting`, book the order at **what the customer actually pays**. Free items go in
   as lines at ₹0 — never at menu price with a mental note, because `computeSummary` counts money
   received and the Dashboard would overstate earnings.
4. If the payment is UPI, the bakery verifies the credit **by matching the amount** in
   `/admin/orders`. So the amount the customer is told must be the amount they pay.

## Keeping the posters honest

These follow the same rules the website is held to:

- **No opening hours.** Made-to-order kitchen, not a shop counter. The wording is the site's own:
  *order a day ahead; message late and it's ready the next day.*
- **No distances.** Delivery is worked out from the pincode behind the scenes and the customer only
  ever sees the amount. No poster says "free within 10 km".
- **No ratings, no guarantees.** Nothing claims a star score or promises "on time, every time" —
  three fabrications of exactly that kind were removed from the site and must not come back through
  the marketing.
- **FSSAI 20726012000837** on every poster; displaying it is required of a food business. The
  certificate scans are never published — they carry the owner's photograph, an Aadhaar reference
  and a home address.
- **Offers don't stack.** Stated once, on the counter card.

## A suggested order of release

| When | Put out | Why |
|---|---|---|
| Week 1 | 1 · Two Cheesecakes, 2 · Cupcake Box | The two that lift the commonest orders, and both are instant. |
| Week 2 | 4 · Seven for Six, 5 · Slice & Sip | Everyday habits — the box and the walk-in slice. |
| Week 3 | 3 · Order a Cake, 6 · Six on Us | Birthday and big-basket, once people are ordering more often. |
| Week 4 | 7 · Bring a Friend, 8 · The Sixth Is Ours | Retention only pays once there are regulars to retain. |
| Counter | 9 · The A4 card | In the bag with every order, and pinned in the kitchen so the free items are given consistently. |

Reprice the posters whenever `products.js` and Menu & Prices change — every figure on them is
quoted from that list, and a poster that contradicts the menu is worse than no poster.
