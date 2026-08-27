import { useEffect, useRef, useState } from 'react'
import { FiX, FiShoppingBag, FiMinus, FiPlus, FiInfo } from 'react-icons/fi'
import { u, srcSet } from '../data/images.js'
import { inr } from '../data/format.js'
import { describe, hasUnit } from '../data/products.js'
import { useCart } from '../context/CartContext.jsx'
import AllergenTags from './AllergenTags.jsx'

/** Show the batch-bake note at or below this many loose pieces. */
const BATCH_NOTE_UPTO = 3

/**
 * Why a small order is still welcome.
 *
 * The kitchen bakes in trays: it will not fire one for a single cookie or
 * brownie, so a one-or-two order rides along with that flavour's batch.
 *
 * This started as a four-line paragraph inside the options list, which dwarfed
 * the prices it sat between. It is now split in two: a quiet one-liner while
 * the customer is choosing, and the full sentence in the add-to-cart toast,
 * where there is room for it and it lands at the moment it matters.
 */
const BATCH_HINT = 'Small orders bake with the day’s batch'

const batchToastNote = (qty) =>
  qty === 1
    ? 'We don’t bake a tray for one — yours joins the day’s batch of this flavour.'
    : 'Small orders join the day’s batch of this flavour.'

function BatchHint() {
  return (
    <p className="qv-batch-hint">
      <FiInfo size={12} />
      {BATCH_HINT}
    </p>
  )
}

/**
 * Modal dialog showing one product with bigger image, full info, allergens, and
 * dual add-to-cart (whole/slice) where applicable.
 *
 * For a per-piece product (`minQty > 1` — cupcakes) the base tier also gets a
 * quantity stepper with a live total, because the Shop card deliberately shows
 * the BOX price: this modal is the only place the customer sees the per-piece
 * rate, so it has to be where they choose how many pieces they want.
 *
 * A `unit` product (cookies) is the same idea with a third row: both its listed
 * prices are boxes, and the loose single is the tier the card can't show.
 */
export default function ProductQuickView({ product, onClose }) {
  const { add } = useCart()
  // Applies to the base (`price`) tier only — a box is orderable on its own.
  const minQty = Math.max(1, Number(product?.minQty) || 1)
  // Shop keys this component by product id, so opening a different product
  // remounts it and qty re-initialises to that product's minimum.
  const [qty, setQty] = useState(minQty)
  // The loose-piece row keeps its own count — it is a separate cart line
  // (`<id>-unit`) from the boxes, so sharing one stepper would be wrong.
  const [unitQty, setUnitQty] = useState(1)
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
  // The base (`price`) tier is one loose piece. Cupcakes say so with a minimum
  // of 2; brownies and blondies sell singly and carry `piece: true`. Either way
  // it earns a counter instead of a bare Add button.
  const perPiece = minQty > 1 || p?.piece === true
  // …but only the no-minimum ones get the batch note: a cupcake order already
  // starts at 2, and the note is about orders too small to bake for.
  const showBatchNote = p?.piece === true

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
                            addAndClose(
                              {
                                ...p,
                                name: `${p.name} (${p.sizeLabel || 'Whole'})`,
                                note: showBatchNote && qty <= BATCH_NOTE_UPTO ? batchToastNote(qty) : undefined,
                              },
                              qty,
                            )
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

                {/* Brownies and blondies: the note belongs under the BASE tier,
                    because that is where their single piece is chosen. */}
                {showBatchNote && qty <= BATCH_NOTE_UPTO && <BatchHint />}

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

                {/* Third tier — a single loose piece (cookies). Its own stepper,
                    because this is the tier people buy in ones and twos, and the
                    only one that needs the batch-bake note below. */}
                {hasUnit(p) && (
                  <div className="qv-option qv-option--qty">
                    <div className="qv-option__info">
                      <div className="qv-option__label">{p.unitLabel || 'Per piece'}</div>
                      <div className="qv-option__price">
                        {inr(p.unit)}
                        <span className="qv-option__sub">each</span>
                      </div>
                    </div>

                    <div className="qv-qty">
                      <span className="qv-qty__ask">How many?</span>
                      <div className="qv-qty__row">
                        <div className="qv-qty__stepper">
                          <button
                            type="button"
                            onClick={() => setUnitQty((q) => Math.max(1, q - 1))}
                            disabled={unitQty <= 1}
                            aria-label="One fewer"
                          >
                            <FiMinus size={13} />
                          </button>
                          <span className="qv-qty__val" aria-live="polite">{unitQty}</span>
                          <button type="button" onClick={() => setUnitQty((q) => q + 1)} aria-label="One more">
                            <FiPlus size={13} />
                          </button>
                        </div>
                        <button
                          className="qv-btn qv-btn--filled qv-qty__add"
                          onClick={() =>
                            addAndClose(
                              {
                                id: p.id + '-unit',
                                name: `${p.name} (${p.unitLabel || 'Per piece'})`,
                                price: p.unit,
                                img: p.img,
                                note: unitQty <= BATCH_NOTE_UPTO ? batchToastNote(unitQty) : undefined,
                              },
                              unitQty,
                            )
                          }
                        >
                          <FiShoppingBag size={13} /> Add {unitQty} — {inr(p.unit * unitQty)}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cookies: the note belongs under the UNIT tier — its boxes
                    are ordinary orders, only the loose single is a small one. */}
                {hasUnit(p) && unitQty <= BATCH_NOTE_UPTO && <BatchHint />}
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
        /* ── Opening motion ────────────────────────────────────────────────
           The sheet RISES and settles rather than popping: a short overshoot
           on the way up, none on the way back, which reads as something being
           lifted onto the counter. The photo lands a beat later on a slow
           settling zoom (food looks best still moving), and the text plates
           itself in order — category, name, tags, description, prices.

           Timings are deliberately short. This fires on every Add to Cart tap
           on a 120-product grid, so anything that makes a returning customer
           wait for the price rows is a tax, not a flourish. Everything the
           customer needs has settled by ~0.6s.

           All of it collapses to a plain fade under prefers-reduced-motion,
           at the end of this block. */
        @keyframes qv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qv-veil {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to   { opacity: 1; backdrop-filter: blur(4px); }
        }
        @keyframes qv-rise {
          from { opacity: 0; transform: translateY(30px) scale(0.93); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* Slow settle — starts wide and eases down, so the photo is never
           static on arrival. 1.06 is enough to read; more looks like a glitch. */
        @keyframes qv-settle {
          from { transform: scale(1.06); }
          to   { transform: scale(1); }
        }
        @keyframes qv-plate {
          from { opacity: 0; transform: translateY(9px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes qv-pop {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }

        .qv-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(91, 62, 54, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: qv-veil 0.28s ease-out;
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
          /* Overshoot only on the rise (the 1.2 in the curve). */
          animation: qv-rise 0.42s cubic-bezier(0.22, 1.2, 0.36, 1);
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
          /* The settling zoom starts at 1.06, so the column has to clip it —
             and it needs the image's own radius, or the rounded corners scale
             out past the square column and the corners flash sharp. */
          overflow: hidden;
          border-radius: 16px 16px 0 0;
        }
        .qv-image {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
          border-radius: 16px 16px 0 0;
          animation: qv-settle 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
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
          animation: qv-pop 0.4s cubic-bezier(0.34, 1.4, 0.5, 1) 0.24s backwards;
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
        /* Plated in reading order. Driven off nth-child rather than a class per
           block, so the optional allergen row can come and go without the
           delays needing to be renumbered. backwards holds each child hidden
           through its delay — without it they all flash in at once first.
           The step is capped so a long product never trails on. */
        .qv-info-col > * {
          animation: qv-plate 0.34s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        .qv-info-col > *:nth-child(1) { animation-delay: 0.10s; }
        .qv-info-col > *:nth-child(2) { animation-delay: 0.14s; }
        .qv-info-col > *:nth-child(3) { animation-delay: 0.18s; }
        .qv-info-col > *:nth-child(4) { animation-delay: 0.22s; }
        .qv-info-col > *:nth-child(n+5) { animation-delay: 0.26s; }

        /* On desktop the photo must NOT decide how tall the modal is. It used to:
           height: 100% on an <img> inside a grid row of indefinite height
           resolves to auto, so the image fell back to its own aspect ratio and
           a portrait photo stretched the row far past what the text needed —
           leaving a tall white gap under the price rows, while a landscape
           photo left none. Same product type, two different modal heights.

           Taking the image out of flow (absolute + inset) makes the INFO column
           the only thing that sets the height, so every product of the same
           shape opens at the same size and the photo crops to fit. */
        @media (min-width: 720px) {
          .qv-grid { grid-template-columns: 5fr 7fr; }
          .qv-image-col { min-height: 380px; border-radius: 16px 0 0 16px; }
          .qv-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            aspect-ratio: auto;
            object-fit: cover;
            border-radius: 16px 0 0 16px;
          }
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

        /* ONE bordered price table with divided rows.
           Each size used to be its own card — own border, own shadow, own gap,
           label stacked above the price. Three sizes then filled the modal and
           pushed the Add buttons below the fold on a phone. As a table the same
           three sizes read at a glance and take about half the height: name and
           price share one baseline, the action sits on the right, and the rule
           between rows does the separating that the gaps used to. */
        .qv-options {
          margin-top: 0.9rem;
          border: 1px solid var(--cc-border);
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }
        .qv-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.7rem;
          padding: 0.5rem 0.75rem;
        }
        .qv-option + .qv-option,
        .qv-batch-hint { border-top: 1px solid var(--cc-border); }

        /* Label and price on ONE line, sharing a baseline. */
        .qv-option__info {
          min-width: 0;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .qv-option__label {
          font-size: 0.8rem;
          color: var(--cc-cocoa);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .qv-option__min {
          background: var(--cc-blush-soft);
          color: var(--cc-rose-deep);
          border-radius: 999px;
          padding: 1px 6px;
          font-size: 0.6rem;
          font-weight: 700;
        }
        .qv-option__price {
          font-size: 1rem;
          color: var(--cc-rose);
          font-weight: 700;
          line-height: 1.2;
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          font-variant-numeric: lining-nums tabular-nums;
        }
        .qv-option__sub {
          font-size: 0.66rem;
          font-weight: 600;
          color: var(--cc-cocoa-soft);
        }
        .qv-option .qv-btn {
          flex: 0 0 auto;
          min-width: 0;
          padding: 0.4rem 0.9rem;
          font-size: 0.8rem;
        }

        /* One quiet line under the loose-piece row. The paragraph this replaced
           was four lines tall and out-shouted the prices it sat between; the
           full sentence now rides on the add-to-cart toast instead. */
        .qv-batch-hint {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin: 0;
          padding: 0.45rem 0.85rem;
          background: var(--cc-cream);
          border-top: 1px dashed var(--cc-blush-soft);
          color: var(--cc-cocoa-soft);
          font-size: 0.73rem;
          line-height: 1.3;
        }
        .qv-batch-hint svg {
          flex: 0 0 auto;
          color: var(--cc-rose);
        }

        /* Per-piece tier: label/price on top, then "How many?" + stepper + a
           live-total Add button. Stacks so the row never gets cramped. */
        /* The counted row stays on ONE line too: label + price on the left,
           stepper and Add on the right. It only wraps when there genuinely
           isn't room, rather than always stacking as it did before. */
        .qv-option--qty {
          flex-wrap: wrap;
          row-gap: 0.5rem;
        }
        .qv-qty { margin-left: auto; }
        /* "How many?" is dropped visually — a − 1 + control says it — but kept
           for screen readers, which otherwise meet three unlabelled buttons. */
        .qv-qty__ask {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        .qv-qty__row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }
        .qv-qty__stepper {
          display: inline-flex;
          align-items: center;
          background: #fff;
          border: 1px solid var(--cc-rose-soft);
          border-radius: 999px;
          padding: 0.12rem;
          flex: 0 0 auto;
        }
        .qv-qty__stepper button {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--cc-rose);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--cc-dur) var(--cc-ease),
                      transform var(--cc-dur) var(--cc-ease);
        }
        .qv-qty__stepper button:hover:not(:disabled) { background: var(--cc-blush); transform: scale(1.1); }
        .qv-qty__stepper button:active:not(:disabled) { transform: scale(0.9); transition-duration: var(--cc-dur-fast); }
        .qv-qty__stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
        .qv-qty__val {
          min-width: 22px;
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
          transition: background var(--cc-dur) var(--cc-ease),
                      color var(--cc-dur) var(--cc-ease),
                      transform var(--cc-dur) var(--cc-ease),
                      box-shadow var(--cc-dur) var(--cc-ease);
        }
        /* These are the buttons the whole modal exists to get tapped, so they
           carry the same press as every other button on the site. */
        .qv-btn:active {
          transform: translateY(0) scale(0.97);
          transition-duration: var(--cc-dur-fast);
        }
        .qv-btn:focus-visible {
          outline: 2px solid var(--cc-rose-deep);
          outline-offset: 2px;
        }
        .qv-btn--outline {
          background: #fff;
          color: var(--cc-rose);
          border: 1.5px solid var(--cc-rose);
        }
        .qv-btn--outline:hover {
          background: var(--cc-blush);
          transform: translateY(-1px);
        }
        .qv-btn--filled:active { box-shadow: 0 2px 6px rgba(207, 62, 99, 0.3); }
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


        /* Vestibular disorders: a rising, zooming, staggering sheet is exactly
           the pattern that triggers them. Everything above collapses to one
           quiet fade — the modal still announces itself, nothing travels. */
        @media (prefers-reduced-motion: reduce) {
          .qv-backdrop { animation: qv-fade 0.2s ease-out; }
          .qv-modal { animation: qv-fade 0.2s ease-out; }
          .qv-image,
          .qv-badge,
          .qv-info-col > * { animation: none; }
          .qv-btn:hover,
          .qv-btn:active,
          .qv-btn--outline:hover,
          .qv-btn--filled:hover,
          .qv-qty__stepper button:hover:not(:disabled),
          .qv-qty__stepper button:active:not(:disabled) { transform: none; }
        }
      `}</style>
    </div>
  )
}
