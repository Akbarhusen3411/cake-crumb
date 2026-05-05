import { FiCheckCircle } from 'react-icons/fi'
import { useCart } from '../context/CartContext.jsx'

export default function CartToast() {
  const { toast } = useCart()
  if (!toast) return null
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#fff',
        color: 'var(--cc-cocoa)',
        padding: '0.7rem 1.2rem',
        borderRadius: 999,
        boxShadow: '0 10px 30px rgba(176,46,82,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        zIndex: 100,
        border: '1px solid var(--cc-border)',
        fontSize: '0.9rem',
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      <FiCheckCircle color="var(--cc-rose)" />
      {toast}
    </div>
  )
}
