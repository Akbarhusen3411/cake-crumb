import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

/** Simple brand-styled centered modal used across the accounting admin forms.
 *  `xl` is for the order sheet only — its items are one row each, and the row
 *  needs the width to stay one row on a laptop.
 *
 *  `full` + `flush` are the entry sheets (New Order, New Expense): they fill the
 *  height they're given and lay out their own panes, so the body must not add
 *  padding and must NOT be a scroller. A scrolling body around a scrolling item
 *  list is two nested scrollers with `overscroll-behavior: contain` between
 *  them — the wheel stops dead at the bottom of the inner list and the sheet
 *  reads as frozen, which is what it did on shorter laptop screens. One
 *  scroller per pane, never one inside another. */
export default function Modal({ title, subtitle, icon, onClose, children, footer, wide = false, xl = false, full = false, flush = false }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div
      className="cc-modal-backdrop"
      onMouseDown={onClose}
      // The sheet never outgrows the screen: it's centred in a backdrop that
      // doesn't scroll, and the body inside it does. A tall form used to push
      // the buttons off the bottom, and on a phone the page behind scrolled
      // with it.
      style={{
        position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(60,30,40,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4vh 16px', overflow: 'hidden',
      }}
    >
      <div
        className="cc-modal"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: full ? 1180 : xl ? 900 : wide ? 640 : 480, background: '#fff',
          // A full sheet takes all the height it's offered, so its item list has
          // a stable place to scroll instead of growing the dialog off-screen.
          maxHeight: '100%', height: full ? '100%' : undefined,
          display: 'flex', flexDirection: 'column',
          borderRadius: 16, boxShadow: '0 24px 60px rgba(120,40,70,0.3)',
        }}
      >
        <div className="cc-modal-head" style={{ flex: '0 0 auto', padding: '16px 20px', borderBottom: '1px solid #f3e3e6', display: 'flex', alignItems: 'flex-start' }}>
          {icon ? (
            <span aria-hidden="true" style={{
              flex: '0 0 auto', width: 40, height: 40, marginRight: 12, borderRadius: 12,
              background: '#fdeef2', display: 'grid', placeItems: 'center', fontSize: 20,
            }}>{icon}</span>
          ) : null}
          <div style={{ flex: 1 }}>
            <h5 style={{ margin: 0, fontFamily: 'var(--font-heading, serif)', color: '#cf3e63' }}>{title}</h5>
            {subtitle ? <div style={{ fontSize: 13, color: '#977' }}>{subtitle}</div> : null}
          </div>
          <button type="button" aria-label="Close" onClick={onClose}
            style={{ border: 0, background: 'transparent', color: '#a88', fontSize: 20, cursor: 'pointer' }}>
            <FiX />
          </button>
        </div>
        {/* Flush leaves overflow to the stylesheet: the panes scroll on a wide
            screen, the body itself scrolls once they stack. An inline
            `overflowY` here would outrank both. */}
        <div
          className={`cc-modal-body${flush ? ' cc-modal-body--flush' : ''}`}
          style={flush
            ? { flex: '1 1 auto', minHeight: 0 }
            : { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: 20 }}
        >{children}</div>
        {footer ? (
          <div className="cc-modal-foot" style={{ flex: '0 0 auto', padding: '14px 20px', borderTop: '1px solid #f3e3e6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
