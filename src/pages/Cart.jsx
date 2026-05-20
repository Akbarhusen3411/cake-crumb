import { Link } from 'react-router-dom'
import {
  FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiHeart,
} from 'react-icons/fi'
import { useCart } from '../context/CartContext.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import RelatedProducts from '../components/RelatedProducts.jsx'
import { inr } from '../data/format.js'
import { u } from '../data/images.js'

export default function Cart() {
  usePageMeta({ title: 'Your Cart' })
  const {
    items, count, subtotal,
    increment, decrement, remove, clear,
  } = useCart()

  if (count === 0) {
    return (
      <section className="bg-cream py-5">
        <div className="container py-5 text-center">
          <span className="feature-icon mb-3" style={{ width: 84, height: 84 }}>
            <FiShoppingBag size={32} />
          </span>
          <h2 className="section-title">Your cart is empty</h2>
          <p className="mt-2">Discover our handcrafted treats and add some sweetness to your day.</p>
          <Link to="/shop" className="btn-rose mt-3">
            <FiShoppingBag /> Continue Shopping
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream py-5">
      <div className="container">
        <div className="text-center mb-4">
          <span className="eyebrow">Your Cart</span>
          <h2 className="section-title mt-2">A Sweet Selection</h2>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div
              style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
            >
              <div className="d-none d-md-flex tag-badge px-4 py-3" style={{ borderBottom: '1px solid var(--cc-border)' }}>
                <span style={{ flex: 2 }}>Product</span>
                <span style={{ flex: 1, textAlign: 'center' }}>Price</span>
                <span style={{ flex: 1, textAlign: 'center' }}>Quantity</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Subtotal</span>
              </div>

              {items.map((it) => (
                <div
                  key={it.id}
                  className="d-flex flex-column flex-md-row align-items-md-center px-3 px-md-4 py-3"
                  style={{ borderBottom: '1px solid var(--cc-border)', gap: '1rem' }}
                >
                  <div className="d-flex align-items-center" style={{ flex: 2, gap: '0.9rem', minWidth: 0 }}>
                    <img
                      src={u(it.img, 200, 200)}
                      alt=""
                      style={{ width: 70, height: 70, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--cc-cocoa)', fontSize: '1rem' }}>
                        {it.name}
                      </div>
                      <button
                        className="border-0 bg-transparent p-0 mt-1"
                        onClick={() => remove(it.id)}
                        style={{
                          color: 'var(--cc-cocoa-soft)',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <FiTrash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', color: 'var(--cc-rose)', fontWeight: 700 }}>
                    {inr(it.price)}
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div className="d-inline-flex align-items-center" style={{ gap: '0.5rem' }}>
                      <button className="qty-btn" onClick={() => decrement(it.id)} aria-label="Decrease">
                        <FiMinus size={12} />
                      </button>
                      <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 600 }}>{it.qty}</span>
                      <button className="qty-btn" onClick={() => increment(it.id)} aria-label="Increase">
                        <FiPlus size={12} />
                      </button>
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right', color: 'var(--cc-cocoa)', fontWeight: 700 }}>
                    {inr(it.price * it.qty)}
                  </div>
                </div>
              ))}

              <div className="d-flex flex-wrap justify-content-between align-items-center px-4 py-3" style={{ gap: '0.6rem' }}>
                <Link to="/shop" className="btn-outline-rose">
                  <FiShoppingBag size={14} /> Continue Shopping
                </Link>
                <button className="border-0 bg-transparent" style={{ color: 'var(--cc-cocoa-soft)', fontSize: '0.85rem' }} onClick={clear}>
                  <FiTrash2 size={13} /> Clear cart
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div
              className="p-4"
              style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14 }}
            >
              <div className="tag-badge mb-3">Order Summary</div>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                <span>Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
                <strong style={{ color: 'var(--cc-cocoa)' }}>{inr(subtotal)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                <span>Delivery</span>
                <span style={{ color: 'var(--cc-cocoa-soft)' }}>Calculated at checkout</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--cc-cocoa-soft)', marginBottom: '0.5rem' }}>
                Based on your delivery address.
              </p>
              <hr style={{ borderColor: 'var(--cc-border)' }} />
              <div className="d-flex justify-content-between mb-3" style={{ fontSize: '1.05rem' }}>
                <span style={{ color: 'var(--cc-cocoa)' }}>Subtotal</span>
                <strong style={{ color: 'var(--cc-rose)', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '1.2rem' }}>
                  {inr(subtotal)}
                </strong>
              </div>
              <Link to="/checkout" className="btn-rose w-100 justify-content-center">
                Proceed to Checkout <FiArrowRight />
              </Link>

              <div className="mt-4 p-3" style={{ background: 'var(--cc-cream)', borderRadius: 10, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiHeart color="var(--cc-rose)" />
                <span>Pay via UPI QR or Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts />
      </div>
    </section>
  )
}
