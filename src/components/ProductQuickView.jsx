import { useEffect, useRef, useState } from 'react'
import { FiX, FiShoppingBag, FiMinus, FiPlus } from 'react-icons/fi'
import { u, srcSet } from '../data/images.js'
import { inr } from '../data/format.js'
import { describe } from '../data/products.js'
import { useCart } from '../context/CartContext.jsx'
import AllergenTags from './AllergenTags.jsx'

/**
 * Modal dialog showing one product with bigger image, full info, allergens, and
 * dual add-to-cart (whole/slice) where applicable.
 *
 * For a per-piece product (`minQty > 1` — cupcakes) the base tier also gets a
 * quantity stepper with a live total, because the Shop card deliberately shows
 * the BOX price: this modal is the only place the customer sees the per-piece
 * rate, so it has to be where they choose how many pieces they want.
 */
export default function ProductQuickView({ product, onClose }) {
  const { add } = useCart()
  // Applies to the base (`price`) tier only — a box is orderable on its own.
  const minQty = Math.max(1, Number(product?.minQty) || 1)
  // Shop keys this component by product id, so opening a different product
  // remounts it and qty re-initialises to that product's minimum.
  const [qty, setQty] = useState(minQty)
  const modalRef = useRef(null)

  useEffect(() => {
    if (!product) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [product, onClose])

  // Scroll lock — event-based, like the mobile menu and the search overlay.
  // This used to set `document.body.style.overflow = 'hidden'`, which is the
  // pattern that gives iOS Safari its jump-to-top bug and (because html carries
  // `overflow-x: clip`) doesn't even lock the page — it just turns body into a
  // scroll container and un-sticks the header. Cancelling touchmove/wheel
  // outside the modal locks it for real; the modal's own scroll still works.
  useEffect(() => {
    if (!product) return
    const blockOutside = (e) => {
      if (!modalRef.current?.contains(e.target)) e.preventDefault()
    }
    document.addEventListener('touchmove', blockOutside, { passive: false })
    document.addEventListener('wheel', blockOutside, { passive: false })
    return () => {
      document.removeEventListener('touchmove', blockOutside)
      document.removeEventListener('wheel', blockOutside)
    }
  }, [product])

  if (!product) return null
  const p = product
  const perPiece = minQty > 1

  function addAndClose(item, addQty) {
    add(item, addQty)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
      onClick={onClose}
      className="qv-backdrop"
    >
      <div ref={modalRef} onClick={(e) => e.stopPropagation()} className="qv-modal">
        <button
          onClick={onClose}
          aria-label="Close"
          className="qv-close"
        >
          <FiX size={18} />
        </button>

        <div className="qv-grid">
          {/* IMAGE — fills its column on desktop, stays square on mobile */}
          <div className="qv-image-col">
            <img
              src={u(p.img, 800, 800)}
              srcSet={srcSet(p.img)}
              /* The modal caps at 720px; the image column is 5/12 of it on
                 desktop and the full width on a phone. */
              sizes="(min-width: 720px) 300px, 100vw"
              alt={p.name}
              className="qv-image"
            />
            {p.badge && <span className="qv-badge">{p.badge}</span>}
          </div>

          {/* DETAILS */}
          <div className="qv-info-col">
            <div className="tag-badge mb-1" style={{ fontSize: '0.65rem' }}>{p.category}</div>
            <h3 className="qv-title">{p.name}</h3>

            {p.allergens?.length > 0 && (
              <div className="mt-2">
                <AllergenTags allergens={p.allergens} verbose />
              </div>
            )}

            {/* What this one actually is. Every product used to carry the same
                sentence, which told a customer choosing between two cheesecakes
                nothing at all. The making-and-timing line stays, smaller. */}
            <p className="qv-desc">{describe(p)}</p>
            <p className="qv-desc" style={{ fontSize: '0.82rem', opacity: 0.85 }}>
              Handcrafted with the finest ingredients and freshly prepared.
              Please pre-order at least 1 day in advance.
            </p>

            {/* Options — each size on its own row with price + Add button */}
            {p.slice ? (
              <div className="qv-options">
                <div className={`qv-option${perPiece ? ' qv-option--qty' : ''}`}>
                  <div className="qv-option__info">
                    <div className="qv-option__label">
                      {p.sizeLabel || 'Whole'}
                      {perPiece && <span className="qv-option__min">Min {minQty}</span>}
                    </div>
                    <div className="qv-option__price">
                      {inr(p.price)}
                      {perPiece && <span className="qv-option__sub">each</span>}
                    </div>
                  </div>

                  {perPiece ? (
                    <div className="qv-qty">
                      <span className="qv-qty__ask">How many?</span>
                      <div className="qv-qty__row">
                        <div className="qv-qty__stepper">
                          <button
                            type="button"
                            onClick={() => setQty((q) => Math.max(minQty, q - 1))}
                            disabled={qty <= minQty}
                            aria-label="One fewer"
                          >
                            <FiMinus size={13} />
                          </button>
                          <span className="qv-qty__val" aria-live="polite">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty((q) => q + 1)}
                            aria-label="One more"
                          >
                            <FiPlus size={13} />
                          </button>
                        </div>
                        {/* Name carries the TIER, never the count — add() merges
                            by id, so "(2 pcs)" would go stale the moment the
                            customer added more. The count lives in cart qty. */}
                        <button
                          className="qv-btn qv-btn--filled qv-qty__add"
                          onClick={() =>
                            addAndClose({ ...p, name: `${p.name} (${p.sizeLabel || 'Whole'})` }, qty)
                          }
                        >
                          <FiShoppingBag size={13} /> Add {qty} — {inr(p.price * qty)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="qv-btn qv-btn--filled"
                      onClick={() =>
                        addAndClose({ ...p, name: `${p.name} (${p.sizeLabel || 'Whole'})` }, minQty)
                      }
                    >
                      <FiShoppingBag size={13} /> Add
                    </button>
                  )}
                </div>
                <div className="qv-option">
                  <div className="qv-option__info">
                    <div className="qv-option__label">{p.sliceLabel || 'Slice'}</div>
                    <div className="qv-option__price">{inr(p.slice)}</div>
                  </div>
                  <button
                    className="qv-btn qv-btn--outline"
                    onClick={() =>
                      addAndClose({
                        id: p.id + '-slice',
                        name: `${p.name} (${p.sliceLabel || 'Slice'})`,
                        price: p.slice,
                        img: p.img,
                      })
                    }
                  >
                    <FiShoppingBag size={13} /> Add
                  </button>
                </div>
              </div>
            ) : (
              <div className="qv-actions">
                <button
                  className="qv-btn qv-btn--filled w-100"
                  onClick={() => addAndClose(p)}
                >
                  <FiShoppingBag size={13} /> Add to Cart — {inr(p.price)}
                </button>
              </div>
            )}

            {/* No "Save to favourites" button here. There was one, with no
                handler and nowhere to view a saved list — it did nothing when
                tapped. Build favourites properly (storage + a list page) before
                putting the control back. */}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes qv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qv-up { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .qv-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(91, 62, 54, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: qv-fade 0.2s ease-out;
        }
        .qv-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 720px;
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
          position: relative;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          animation: qv-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .qv-close {
          position: absolute; top: 12px; right: 12px; z-index: 2;
          width: 34px; height: 34px;
          border-radius: 50%; border: none;
          background: #fff; color: var(--cc-cocoa);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Grid: image left / info right on desktop; stacked on mobile */
        .qv-grid {
          display: grid;
          grid-template-columns: 1fr;
          align-items: stretch;
        }
        .qv-image-col {
          position: relative;
          background: var(--cc-cream);
        }
        .qv-image {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
          border-radius: 16px 16px 0 0;
        }
        /* On a phone the modal scrolls internally, and a 4:3 photo pushed the
           price and the Add button below the fold — the customer opened a
           product and saw no way to buy it without scrolling. A 16:9 band buys
           back ~90px and the allergen tags collapse to one line. */
        @media (max-width: 480px) {
          .qv-image { aspect-ratio: 16/9; }
          .qv-info-col { padding: 1rem 1.1rem 1.2rem; }
          .qv-desc { font-size: 0.78rem; margin-top: 0.6rem; }
          .qv-options { margin-top: 0.75rem; gap: 0.5rem; }
        }
        .qv-badge {
          position: absolute; top: 12px; left: 12px;
          background: var(--cc-rose); color: #fff;
          font-size: 0.65rem; font-weight: 700;
          padding: 4px 10px; border-radius: 999px;
          letter-spacing: 0.08em; text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(207, 62, 99, 0.35);
        }
        .qv-info-col {
          padding: 1.2rem 1.4rem 1.4rem;
          display: flex; flex-direction: column;
        }

        @media (min-width: 720px) {
          .qv-grid { grid-template-columns: 5fr 7fr; }
          .qv-image { aspect-ratio: auto; height: 100%; min-height: 360px; border-radius: 16px 0 0 16px; }
          .qv-info-col { padding: 1.4rem 1.6rem 1.6rem; }
        }

        .qv-title {
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          margin: 0.3rem 0 0;
          color: var(--cc-cocoa);
          font-weight: 700;
          line-height: 1.2;
        }
        .qv-price-pair {
          display: flex;
          border: 1px solid var(--cc-border);
          border-radius: 10px;
          overflow: hidden;
        }
        .qv-price-pair > .qv-price-cell + .qv-price-cell {
          border-left: 1px solid var(--cc-border);
        }
        .qv-price-cell {
          flex: 1;
          text-align: center;
          padding: 0.55rem 0.5rem;
        }
        .qv-price-single {
          padding: 0.6rem;
          background: var(--cc-cream);
          border-radius: 10px;
          text-align: center;
        }
        .qv-price-label {
          font-size: 0.6rem;
          color: var(--cc-cocoa-soft);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
        }
        .qv-price-amount {
          font-size: 1.15rem;
          color: var(--cc-rose);
          font-weight: 700;
          margin-top: 2px;
        }

        .qv-desc {
          font-size: 0.82rem;
          color: var(--cc-cocoa-soft);
          margin: 0.8rem 0 0;
          line-height: 1.5;
        }

        /* Stacked size options — replaces the side-by-side price pair */
        .qv-options {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 1rem;
          padding-top: 0.4rem;
        }
        .qv-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          padding: 0.7rem 0.95rem;
          background: var(--cc-cream);
          border: 1px solid var(--cc-border);
          border-radius: 12px;
        }
        .qv-option + .qv-option { background: #fff; }
        .qv-option__info { min-width: 0; }
        .qv-option__label {
          font-size: 0.62rem;
          color: var(--cc-cocoa-soft);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .qv-option__min {
          background: var(--cc-blush-soft);
          color: var(--cc-rose-deep);
          border-radius: 999px;
          padding: 1px 7px;
          letter-spacing: 0.08em;
          font-size: 0.58rem;
        }
        .qv-option__price {
          font-size: 1.25rem;
          color: var(--cc-rose);
          font-weight: 700;
          line-height: 1.1;
          margin-top: 2px;
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
        }
        .qv-option__sub {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--cc-cocoa-soft);
          letter-spacing: 0.02em;
        }
        .qv-option .qv-btn { flex: 0 0 auto; min-width: 96px; padding: 0.6rem 1rem; }

        /* Per-piece tier: label/price on top, then "How many?" + stepper + a
           live-total Add button. Stacks so the row never gets cramped. */
        .qv-option--qty {
          flex-direction: column;
          align-items: stretch;
          gap: 0.6rem;
        }
        .qv-qty__ask {
          display: block;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cc-cocoa-soft);
          margin-bottom: 0.35rem;
        }
        .qv-qty__row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .qv-qty__stepper {
          display: inline-flex;
          align-items: center;
          gap: 0.15rem;
          background: #fff;
          border: 1.5px solid var(--cc-rose-soft);
          border-radius: 999px;
          padding: 0.2rem;
          flex: 0 0 auto;
        }
        .qv-qty__stepper button {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--cc-rose);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .qv-qty__stepper button:hover:not(:disabled) { background: var(--cc-blush); }
        .qv-qty__stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
        .qv-qty__val {
          min-width: 26px;
          text-align: center;
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--cc-cocoa);
          font-variant-numeric: tabular-nums;
        }
        .qv-option--qty .qv-qty__add {
          flex: 1 1 auto;
          min-width: 0;
        }

        .qv-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 0.4rem;
        }
        .qv-btn {
          flex: 1;
          border: none;
          border-radius: 999px;
          padding: 0.55rem 0.7rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          white-space: nowrap;
          line-height: 1;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .qv-btn--outline {
          background: #fff;
          color: var(--cc-rose);
          border: 1.5px solid var(--cc-rose);
        }
        .qv-btn--outline:hover {
          background: var(--cc-blush);
        }
        .qv-btn--filled {
          background: var(--cc-rose);
          color: #fff;
          box-shadow: 0 3px 10px rgba(207, 62, 99, 0.25);
        }
        .qv-btn--filled:hover {
          background: var(--cc-rose-deep);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(207, 62, 99, 0.4);
        }

      `}</style>
    </div>
  )
}
