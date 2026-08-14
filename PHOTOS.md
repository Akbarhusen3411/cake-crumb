# Changing a photo on the website

Two steps. You do not need to touch any code.

```
1. Save your photo into  public/products/  named after the product
2. Run:  npm run photos
```

Then refresh the site. That is the whole job.

---

## Step 1 — name the file after the product

Take the product name exactly as it appears on the website, make it **lower
case**, and put **dashes** where the spaces are.

| Product on the website | Save the file as |
| --- | --- |
| Mango Sponge Cake | `mango-sponge-cake.jpeg` |
| Rose Milk Cake | `rose-milk-cake.jpeg` |
| Chocolate Cupcakes | `chocolate-cupcakes.jpeg` |
| Vanilla Cake Pops | `vanilla-cake-pops.jpeg` |
| Variety Cupcakes (Box of 6) | `variety-cupcakes-box-of-6.jpeg` |
| Trés Léches Milk Cake | `tres-leches-milk-cake.jpeg` |
| Chocolate Cheesecake (Milk & Dark) | `chocolate-cheesecake-milk-and-dark.jpeg` |

A few rules the last three rows show:

- **Brackets become dashes** — `(Box of 6)` → `-box-of-6`.
- **Accents drop** — `Trés Léches` → `tres-leches`, so you can type it on any keyboard.
- **`&` becomes `and`** — `Milk & Dark` → `milk-and-dark`.

`.jpeg`, `.jpg` and `.png` all work. Put it in the `public/products` folder.

**Not sure of the exact name?** Just run `npm run photos`. If the name is close
but not right, it tells you what it should have been:

```
❓ In public/products/ but not used anywhere — check the spelling:
   mango-sponge.jpeg   → did you mean  mango-sponge-cake.jpeg  (Mango Sponge Cake)?
```

## Step 2 — run one command

```bash
npm run photos
```

It does three things:

1. **Links** the photo to its product, writing it into `src/data/productImages.js`
   for you.
2. **Resizes** it — makes the `.webp` the website actually loads, plus the
   `-400.webp` and `-800.webp` versions used on phones and small cards. **Skipping
   this is the one thing that makes a photo not show up**, because the site always
   asks for the `.webp`.
3. **Checks** everything and prints what still needs attention.

You will see something like:

```
📌 Linked 1 photo(s) to their product:
   Mango Sponge Cake
      was  dessertcup-chocolate-mango-duo.jpeg
      now  mango-sponge-cake.jpeg

🖼  Resizing…
   ✔ Done. 1 converted, 140 unchanged, 0 skipped.

🔍 Checking…
   Every product has a photo, and every photo exists.
```

---

## Finding the photos that still look wrong

At the end of every run there is a list headed **"Still sharing one photo"**.
Those are products that don't have a picture of their own yet — they are
borrowing another product's, which is why the name and the picture sometimes
don't match. It also prints the exact file name to save for each one:

```
📷 Still sharing one photo — save a photo named like this to fix:
   cakepops-chocolate-rocks.jpeg
      vanilla-cake-pops.jpeg      → Vanilla Cake Pops
      red-velvet-cake-pops.jpeg   → Red Velvet Cake Pops
```

Work down that list whenever you have new photos. It gets shorter every time.

---

## Good to know

- **Replacing a photo:** save the new one under the *same* file name and run the
  command again. It will be re-made at every size automatically.
- **Nothing is deleted.** The command never removes a photo you already had. The
  only file it rewrites is `src/data/productImages.js`, and only the file name on
  the right-hand side of a line.
- **Two products can share one photo on purpose.** Set them by hand in
  `src/data/productImages.js` — the naming trick is only a shortcut, never a
  restriction.
- **Photo size:** anything from a phone is fine. Big files are shrunk
  automatically. Portrait or square works best — product cards are taller than
  they are wide.
- **Where the photo shows up:** everywhere at once — Shop, Home, the menu,
  search, the cart, the chat bot and printed invoices all read from the same
  place. Change it once and it changes on every page and every screen size.
- **Videos are separate.** Those go through `npm run convert-videos` — see
  `scripts/convert-videos.js`.
