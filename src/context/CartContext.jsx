import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function add(product, qty = 1) {
    setItems((prev) => {
      const found = prev.find((p) => p.id === product.id)
      if (found) {
        return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + qty } : p))
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, img: product.img, qty }]
    })
    showToast(`${product.name} added to cart`)
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

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  const value = useMemo(() => {
    const count = items.reduce((s, p) => s + p.qty, 0)
    const subtotal = items.reduce((s, p) => s + p.price * p.qty, 0)
    const delivery = subtotal > 0 && subtotal < 999 ? 49 : 0
    const total = subtotal + delivery
    return { items, count, subtotal, delivery, total, add, remove, updateQty, increment, decrement, clear, toast }
  }, [items, toast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
