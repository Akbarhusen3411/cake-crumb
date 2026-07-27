import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

/** Simple brand-styled centered modal used across the accounting admin forms. */
export default function Modal({ title, subtitle, onClose, children, footer, wide = false }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(60,30,40,0.45)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5vh 16px', overflowY: 'auto',
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: wide ? 640 : 480, background: '#fff',
          borderRadius: 16, boxShadow: '0 24px 60px rgba(120,40,70,0.3)', overflow: 'visible',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3e3e6', display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h5 style={{ margin: 0, fontFamily: 'var(--font-heading, serif)', color: '#cf3e63' }}>{title}</h5>
            {subtitle ? <div style={{ fontSize: 13, color: '#977' }}>{subtitle}</div> : null}
          </div>
          <button type="button" aria-label="Close" onClick={onClose}
            style={{ border: 0, background: 'transparent', color: '#a88', fontSize: 20, cursor: 'pointer' }}>
            <FiX />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
        {footer ? (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #f3e3e6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
