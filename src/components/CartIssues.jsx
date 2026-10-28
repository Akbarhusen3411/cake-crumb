import { FiAlertCircle } from 'react-icons/fi'
import { useCart } from '../context/CartContext.jsx'
import { cartProblems } from '../data/offerRules.js'

/**
 * Anything in the cart that can't be ordered as it stands, with a one-tap fix,
 * shown in the Cart AND at Checkout (which also refuses to place the order):
 *  - Diwali pack lines once 5–15 Nov is over (they carry the Diwali price);
 *  - a loose line below its minimum (e.g. 1 cupcake left after removing a
 *    pack of 10) — the bakery doesn't bake a single one.
 * Renders nothing when the cart is fine. `id` lets Checkout scroll to it.
 */
export default function CartIssues({ id }) {
  const { items, remove, increment } = useCart()
  const { expired, belowMin } = cartProblems(items)
  if (!expired.length && !belowMin.length) return null
  return (
    <div id={id} className="cc-cart-issues" role="alert">
      {expired.length > 0 && (
        <div className="cc-cart-issue">
          <FiAlertCircle aria-hidden />
          <span>
            <strong>Diwali packs were 5–15 Nov only.</strong> Remove them to place your order — the regular sizes are still in the shop.
          </span>
          <button type="button" className="cc-cart-issue__btn" onClick={() => expired.forEach((it) => remove(it.id))}>
            Remove {expired.length === 1 ? 'pack' : 'packs'}
          </button>
        </div>
      )}
      {belowMin.map((it) => (
        <div key={it.id} className="cc-cart-issue">
          <FiAlertCircle aria-hidden />
          <span>
            <strong>{it.name}</strong> is sold {it.minQty} or more — you have {it.qty}.
          </span>
          <span className="cc-cart-issue__btns">
            <button type="button" className="cc-cart-issue__btn" onClick={() => { for (let n = it.qty; n < it.minQty; n++) increment(it.id) }}>
              Make it {it.minQty}
            </button>
            <button type="button" className="cc-cart-issue__btn cc-cart-issue__btn--ghost" onClick={() => remove(it.id)}>
              Remove
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}
