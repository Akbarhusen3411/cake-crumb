import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiPlus, FiMinus, FiTrash2, FiX, FiCheck, FiChevronRight } from 'react-icons/fi'
import { inr } from '../../../data/format.js'
import { useKeyboardInset } from '../../../hooks/useKeyboardInset.js'

const qtyOf = (q) => Math.round((Number(q) || 0) * 1000) / 1000 // 0.5 kg, 0.25 L
const fmtQty = (q) => String(qtyOf(q))
const lineAmt = (it) => Math.round(qtyOf(it.qty) * (Number(it.price) || 0))
const isFilled = (it) => it.name.trim() || Number(it.price) > 0
const EMPTY_ITEM = { name: '', qty: 1, price: '' }

/**
 * The shopping list on a phone. The desktop table became a tall card of three
 * boxes per thing bought; here each one is a single row (name · qty × rate ·
 * amount), and a line is added or changed in a small sheet that slides up —
 * name with past purchases to tap, a − / + quantity, the price, and the line's
 * total. "Add & next" keeps the sheet open for a long shopping trip.
 *
 * Same `items` shape as the desktop table ({ name, qty, price }).
 */
export default function ExpenseItemsMobile({ items, setItems, itemNames = [], bad }) {
  const [edit, setEdit] = useState(null) // null | { index: number | -1 }
  const shown = items.map((it, i) => ({ it, i })).filter(({ it }) => isFilled(it))

  const put = (index, it) => setItems((p) => {
    const real = p.filter(isFilled)
    if (index < 0) return [...real, it]
    return p.map((x, k) => (k === index ? it : x)).filter(isFilled)
  })
  const remove = (index) => setItems((p) => {
    const next = p.filter((_, k) => k !== index).filter(isFilled)
    return next.length ? next : [{ ...EMPTY_ITEM }]
  })

  return (
    <div className={`cc-mo-items${bad ? ' cc-mo-items--bad' : ''}`}>
      {shown.length === 0 ? (
        <button type="button" className="cc-mo-empty" onClick={() => setEdit({ index: -1 })}>
          <span className="cc-mo-empty__ico cc-mo-empty__ico--spend"><FiPlus /></span>
          <span>
            <b>Add the first thing bought</b>
            <small>Name, quantity and price</small>
          </span>
        </button>
      ) : (
        <ul className="cc-mo-list">
          {shown.map(({ it, i }) => (
            <li key={i}>
              <div className="cc-mo-xline">
                <button type="button" className="cc-mo-xline__main" onClick={() => setEdit({ index: i })}
                  aria-label={`Change ${it.name || 'item'}`}>
                  <span className="cc-mo-line__text">
                    <span className="cc-mo-line__name">{it.name.trim() || 'Unnamed item'}</span>
                    <span className="cc-mo-line__sub">{fmtQty(it.qty)} × {inr(Number(it.price) || 0)}</span>
                  </span>
                  <b className="cc-mo-xline__amt">{inr(lineAmt(it))}</b>
                  <FiChevronRight className="cc-mo-xline__chev" aria-hidden="true" />
                </button>
                <button type="button" className="cc-mo-line__del" aria-label={`Remove ${it.name || 'item'}`} onClick={() => remove(i)}>
                  <FiTrash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {shown.length > 0 ? (
        <button type="button" className="cc-mo-add" onClick={() => setEdit({ index: -1 })}>
          <FiPlus /> Add another item
        </button>
      ) : null}

      {edit ? (
        <ItemSheet
          key={`${edit.index}-${edit.n || 0}`}
          start={edit.index >= 0 ? items[edit.index] : EMPTY_ITEM}
          isNew={edit.index < 0}
          itemNames={itemNames}
          onSave={(it, more) => {
            put(edit.index, it)
            if (more) setEdit({ index: -1, n: Math.random() }) // fresh sheet for the next line
            else setEdit(null)
          }}
          onRemove={edit.index >= 0 ? () => { remove(edit.index); setEdit(null) } : null}
          onClose={() => setEdit(null)}
        />
      ) : null}
    </div>
  )
}

function ItemSheet({ start, isNew, itemNames, onSave, onRemove, onClose }) {
  const [name, setName] = useState(start.name || '')
  const [qty, setQty] = useState(start.qty ?? 1)
  const [price, setPrice] = useState(start.price ?? '')
  const [tried, setTried] = useState(false)
  const kb = useKeyboardInset(true)
  const nameRef = useRef(null)
  const priceRef = useRef(null)

  useEffect(() => {
    if (isNew) requestAnimationFrame(() => nameRef.current?.focus({ preventScroll: true }))
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [isNew, onClose])

  // Past purchases matching what's typed — one tap fills the name.
  const sugg = useMemo(() => {
    const t = name.trim().toLowerCase()
    const list = t ? itemNames.filter((n) => n.toLowerCase().includes(t) && n.toLowerCase() !== t) : itemNames
    return list.slice(0, 8)
  }, [name, itemNames])

  const amt = lineAmt({ qty, price })
  const ok = Number(price) > 0
  const save = (more) => {
    setTried(true)
    if (!ok) { priceRef.current?.focus(); return }
    onSave({ name: name.trim(), qty: qtyOf(qty) || 1, price }, more)
  }

  return createPortal(
    <div className="cc-ssheet cc-xsheet" style={{ '--cc-kb': `${kb}px` }}>
      <div className="cc-ssheet__backdrop" onClick={onClose} />
      <div className="cc-ssheet__panel" role="dialog" aria-modal="true" aria-label={isNew ? 'Add item' : 'Change item'}>
        <div className="cc-ssheet__head">
          <span className="cc-ssheet__title">{isNew ? 'Add item' : 'Change item'}</span>
          <button type="button" className="cc-ssheet__close" aria-label="Close" onClick={onClose}><FiX /></button>
        </div>
        <div className="cc-xsheet__body">
          <label className="cc-xsheet__label" htmlFor="cc-xs-name">What did you buy?</label>
          <input id="cc-xs-name" ref={nameRef} className="form-control" value={name} spellCheck={false}
            placeholder="e.g. Tropolite whipping cream" autoComplete="off" enterKeyHint="next"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); priceRef.current?.focus() } }} />
          {sugg.length ? (
            <div className="cc-xsheet__sugg" aria-label="Bought before">
              {sugg.map((n) => (
                <button key={n} type="button" onClick={() => { setName(n); priceRef.current?.focus() }}>{n}</button>
              ))}
            </div>
          ) : null}

          <div className="cc-xsheet__row">
            <div>
              <span className="cc-xsheet__label">Quantity</span>
              <div className="cc-xsheet__qty">
                <button type="button" aria-label="One less" disabled={qtyOf(qty) <= 1}
                  onClick={() => setQty(Math.max(1, qtyOf(qty) - 1))}><FiMinus /></button>
                <input type="number" min="0" step="any" inputMode="decimal" aria-label="Quantity"
                  value={qty} onChange={(e) => setQty(e.target.value)} />
                <button type="button" aria-label="One more" onClick={() => setQty(qtyOf(qty) + 1)}><FiPlus /></button>
              </div>
            </div>
            <div>
              <label className="cc-xsheet__label" htmlFor="cc-xs-price">₹ each</label>
              <input id="cc-xs-price" ref={priceRef} type="number" min="0" inputMode="decimal" enterKeyHint="done"
                className={`form-control cc-xsheet__price${tried && !ok ? ' is-bad' : ''}`} placeholder="0"
                value={price} onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(isNew) } }} />
            </div>
          </div>
          {tried && !ok ? <div className="cc-xsheet__err">Enter the price.</div> : null}

          <div className="cc-xsheet__total">
            <span>{fmtQty(qty)} × {inr(Number(price) || 0)}</span>
            <b>{inr(amt)}</b>
          </div>
        </div>
        <div className="cc-xsheet__foot">
          {onRemove ? (
            <button type="button" className="cc-xsheet__btn cc-xsheet__btn--ghost" onClick={onRemove}>
              <FiTrash2 /> Remove
            </button>
          ) : (
            <button type="button" className="cc-xsheet__btn cc-xsheet__btn--ghost" onClick={() => save(true)}>
              <FiPlus /> Add &amp; next
            </button>
          )}
          <button type="button" className="cc-xsheet__btn" onClick={() => save(false)}>
            <FiCheck /> {isNew ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
