import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const CartContext = createContext(null)
// v2: lines gained `minQty`, and the cupcake ids changed meaning — `cup-vanilla`
// was a box of 6 at ₹150 and is now a single piece at ₹25. A v1 cart still holds
// the old price against that id, and `add()` merges by id keeping the STORED
// price, so a v1 cupcake line would bill new per-piece adds at the old box rate.
// Bumping the key drops those carts once rather than mispricing them.
// v3: the bakery's real counter prices landed (Aug 2026) and four cupcake ids
// kept their name while changing price — `cup-chocolate` went ₹30/₹180 →
// ₹28/₹170, `cup-pistachio`'s box ₹210 → ₹190, same for nutella and strawberry.
// Same trap as v2: `add()` merges by id and keeps the STORED price, so a v2 cart
// would quietly charge the old rate. `bk-cakepop` was retired in the same pass
// (one generic row became four flavours), which a v2 cart would still hold at
// ₹120. Dropping those carts once beats mispricing them.
//
// v3 also covers everything else in that same unreleased batch — the cakesicle
// reprice (Circle ₹120 → ₹150, Ice Cream ₹140 → ₹160) and the split of
// `bk-cakesickle-*` into eight flavour+shape ids. No customer can hold a v3
// cart from before those landed, because v3 ships for the first time with them.
// Bump to v4 only if a price or id changes AFTER this build is live.
const STORAGE_KEY = 'cc_cart_v3'

// Smallest quantity this line may sit at. Products carry `minQty` (cupcakes are
// per-piece with a minimum of 2 — the bakery won't bake a single one); anything
// without it behaves exactly as before at 1. Also covers carts restored from
// localStorage that predate the field.
const minQtyOf = (p) => Math.max(1, Number(p?.minQty) || 1)

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial)
  // Toast is a rich object { name, img, qty } so the CartToast can render a
  // product thumbnail — falls back gracefully when only a message is passed.
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // qty defaults to the product's minimum, not 1 — a first "Add" on a min-2
  // product must land on 2, or the cart would open in an unorderable state.
  // Topping up an existing line still moves one step at a time.
  function add(product, qty) {
    const min = minQtyOf(product)
    const addQty = qty == null ? min : Math.max(1, Number(qty) || 1)
    setItems((prev) => {
      const found = prev.find((p) => p.id === product.id)
      if (found) {
        return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + addQty } : p))
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price) || 0, img: product.img, qty: addQty, minQty: min }]
    })
    // `product.note` is an optional one-line aside for the toast — today the
    // batch-bake message on a small order of loose pieces. It is deliberately
    // NOT copied into the cart line above: it is about this add, not about the
    // item, and a stale note would ride along in the order forever.
    showToast({ name: product.name, img: product.img, qty: addQty, note: product.note })
  }

  function remove(id) {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  // Falling below a line's minimum drops it from the cart, which is the same
  // rule that already removed a line at qty 0 — there is just no valid quantity
  // between 0 and the minimum to stop at.
  function updateQty(id, qty) {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(0, qty) } : p))
        .filter((p) => p.qty >= minQtyOf(p))
    )
  }

  function increment(id) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)))
  }

  function decrement(id) {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty >= minQtyOf(p))
    )
  }

  function clear() {
    setItems([])
  }

  function showToast(payload) {
    const data = typeof payload === 'string' ? { name: payload } : payload
    setToast({ ...data, _t: Date.now() })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }

  const value = useMemo(() => {
    const count = items.reduce((s, p) => s + p.qty, 0)
    const subtotal = items.reduce((s, p) => s + p.price * p.qty, 0)
    // Delivery is never auto-charged — the bakery confirms it on WhatsApp.
    // Kept as 0 so any consumer of `total` matches the subtotal shown at checkout.
    const delivery = 0
    const total = subtotal
    return { items, count, subtotal, delivery, total, add, remove, updateQty, increment, decrement, clear, toast }
  }, [items, toast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
