import { FiCheck, FiShoppingBag } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { u } from '../data/images.js'

export default function CartToast() {
  const { toast } = useCart()
  if (!toast) return null

  const name = typeof toast === 'string' ? toast : toast.name
  const img = typeof toast === 'string' ? null : toast.img
  const qty = typeof toast === 'string' ? null : toast.qty
  // Optional aside — set by the caller of add(), e.g. the batch-bake message on
  // a one-or-two-piece order. Absent on every ordinary add.
  const note = typeof toast === 'string' ? null : toast.note

  return (
    <div className="cc-cart-toast" role="status" aria-live="polite">
      {/* `key` on the animating shell so re-adding the same item replays the pop */}
      <div className="cc-cart-toast__card" key={toast._t || name}>
        {img ? (
          <span className="cc-cart-toast__thumb">
            <img src={u(img, 120, 120)} alt="" />
            <span className="cc-cart-toast__check"><FiCheck size={12} strokeWidth={3} /></span>
          </span>
        ) : (
          <span className="cc-cart-toast__thumb cc-cart-toast__thumb--icon">
            <FiShoppingBag size={18} />
            <span className="cc-cart-toast__check"><FiCheck size={12} strokeWidth={3} /></span>
          </span>
        )}

        <span className="cc-cart-toast__text">
          <span className="cc-cart-toast__label">Added to cart</span>
          <span className="cc-cart-toast__name" title={name}>
            {qty > 1 ? `${qty} × ` : ''}{name}
          </span>
          {note && <span className="cc-cart-toast__note">{note}</span>}
        </span>

        <Link to="/cart" className="cc-cart-toast__cta" aria-label="View cart">
          <span>View</span> <FiShoppingBag size={13} />
        </Link>
      </div>
    </div>
  )
}
