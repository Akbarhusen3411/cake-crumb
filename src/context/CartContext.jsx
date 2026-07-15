import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'cc_cart_v1'

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

  function add(product, qty = 1) {
    setItems((prev) => {
      const found = prev.find((p) => p.id === product.id)
      if (found) {
        return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + qty } : p))
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price) || 0, img: product.img, qty }]
    })
    showToast({ name: product.name, img: product.img, qty })
  }

  function remove(id) {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  function updateQty(id, qty) {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(0, qty) } : p))
        .filter((p) => p.qty > 0)
    )
  }

  function increment(id) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)))
  }

  function decrement(id) {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
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
