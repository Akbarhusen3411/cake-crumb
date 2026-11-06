import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiPlus, FiMinus, FiTrash2, FiX, FiSearch, FiChevronLeft, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { inr } from '../../../data/format.js'
import { isPerPieceVariant, isFreeGiftLine } from '../../../services/accounting.js'
import { variantLabel, displayVariant } from '../../../utils/orderItems.js'
import { useKeyboardInset } from '../../../hooks/useKeyboardInset.js'

const lineTotal = (l) => Math.round(Math.round(Number(l.qty) || 0) * (Number(l.unitPrice) || 0))
const sizeName = (v) => (v && v !== 'Standard' ? variantLabel(v) : 'One size')

/**
 * The phone's item list for a new order. The desktop table (three dropdowns
 * per line) became a tall card per item on a phone, and a long order turned
 * into a page of empty-looking boxes. Here each item is one short row, and
 * items are added from a picker that slides up: category → item → size, one
 * tap each, with a search box across the whole menu.
 *
 * Works on the same `lines` as the desktop table, so a sheet opened on one
 * and saved on the other is the same order.
 */
export default function OrderItemsMobile({ lines, setLines, index, bad }) {
  const [picking, setPicking] = useState(false)
  const shown = lines.map((l, i) => ({ l, i })).filter(({ l }) => l.item)
  // The category the last item came from — the picker reopens there, since an
  // order is nearly always several things from one category.
  const lastCat = [...lines].reverse().find((l) => l.category)?.category || ''

  const bump = (i, d) => setLines((p) => p.map((x, k) => {
    if (k !== i) return x
    const min = isPerPieceVariant(x.variant) ? 2 : 1
    return { ...x, qty: Math.max(min, (Math.round(Number(x.qty)) || 0) + d) }
  }))
  const remove = (i) => setLines((p) => {
    const next = p.filter((_, k) => k !== i)
    return next.length ? next : [{ category: '', item: '', variant: '', qty: 1, unitPrice: '' }]
  })
  // Same item and size again → one more of it, not a second line.
  const add = (category, item, row) => {
    const variant = row.variant || 'Standard'
    const pp = isPerPieceVariant(variant)
    setLines((p) => {
      const real = p.filter((l) => l.item)
      const at = real.findIndex((l) => l.category === category && l.item === item && (l.variant || 'Standard') === variant)
      if (at >= 0) return real.map((l, k) => (k === at ? { ...l, qty: (Math.round(Number(l.qty)) || 0) + 1 } : l))
      return [...real, { category, item, variant, qty: pp ? 2 : 1, unitPrice: row.price }]
    })
  }

  return (
    <div className={`cc-mo-items${bad ? ' cc-mo-items--bad' : ''}`}>
      {shown.length === 0 ? (
        <button type="button" className="cc-mo-empty" onClick={() => setPicking(true)}>
          <span className="cc-mo-empty__ico"><FiPlus /></span>
          <span>
            <b>Add the first item</b>
            <small>Pick from Menu &amp; Prices</small>
          </span>
        </button>
      ) : (
        <ul className="cc-mo-list">
          {shown.map(({ l, i }) => {
            const rate = Number(l.unitPrice) || 0
            const pp = isPerPieceVariant(l.variant)
            const qty = Math.round(Number(l.qty)) || 0
            const unpriced = rate <= 0 && !isFreeGiftLine(l)
            const size = displayVariant(l.variant)
            return (
              <li key={i} className={`cc-mo-line${unpriced ? ' cc-mo-line--bad' : ''}`}>
                <div className="cc-mo-line__text">
                  <span className="cc-mo-line__name">
                    {l.item}{size ? <em> · {variantLabel(size)}</em> : null}
                  </span>
                  <span className="cc-mo-line__sub">
                    {unpriced
                      ? <><FiAlertCircle /> No rate — add it in Menu &amp; Prices</>
                      : <>{l.category} · {inr(rate)}{pp ? ' each' : ''}</>}
                  </span>
                </div>
                <div className="cc-mo-line__qty">
                  <button type="button" aria-label={`One less ${l.item}`} disabled={qty <= (pp ? 2 : 1)}
                    onClick={() => bump(i, -1)}><FiMinus /></button>
                  <span aria-live="polite">{qty}</span>
                  <button type="button" aria-label={`One more ${l.item}`} onClick={() => bump(i, 1)}><FiPlus /></button>
                </div>
                <b className="cc-mo-line__amt">{inr(lineTotal(l))}</b>
                <button type="button" className="cc-mo-line__del" aria-label={`Remove ${l.item}`} onClick={() => remove(i)}>
                  <FiTrash2 />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {shown.length > 0 ? (
        <button type="button" className="cc-mo-add" onClick={() => setPicking(true)}>
          <FiPlus /> Add another item
        </button>
      ) : null}

      {picking ? (
        <MenuPicker index={index} startCat={lastCat} lines={lines} onAdd={add} onClose={() => setPicking(false)} />
      ) : null}
    </div>
  )
}

/** Category → item → size, as tiles. Stays open so several items go in one go. */
function MenuPicker({ index, startCat, lines, onAdd, onClose }) {
  const [cat, setCat] = useState(index.byCat.has(startCat) ? startCat : '')
  const [item, setItem] = useState('')
  const [q, setQ] = useState('')
  const [flash, setFlash] = useState('')
  const kb = useKeyboardInset(true)

  // Escape closes the picker only — the order sheet behind stays open.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])
  useEffect(() => {
    if (!flash) return undefined
    const t = setTimeout(() => setFlash(''), 1600)
    return () => clearTimeout(t)
  }, [flash])

  const hits = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return null
    const out = []
    for (const c of index.categories) {
      for (const n of index.byCat.get(c).names) {
        const hay = `${n} ${c}`.toLowerCase()
        if (words.every((w) => hay.includes(w))) out.push({ c, n })
      }
    }
    return out.slice(0, 60)
  }, [q, index])

  const inCart = (c, n, v) => {
    const l = lines.find((x) => x.category === c && x.item === n && (x.variant || 'Standard') === (v || 'Standard'))
    return l ? Math.round(Number(l.qty)) || 0 : 0
  }
  const pick = (c, n, row) => {
    onAdd(c, n, row)
    setFlash(`${n} · ${sizeName(row.variant)}`)
    setItem(''); setCat(c); setQ('')
  }
  const openItem = (c, n) => {
    const sizes = index.byCat.get(c)?.variants.get(n) || []
    if (sizes.length === 1) pick(c, n, sizes[0])
    else { setCat(c); setItem(n); setQ('') }
  }

  const sizes = item ? index.byCat.get(cat)?.variants.get(item) || [] : []
  const title = item || cat || 'Add an item'
  const back = item ? () => setItem('') : cat ? () => setCat('') : null

  return createPortal(
    <div className="cc-ssheet cc-mpick" style={{ '--cc-kb': `${kb}px` }}>
      <div className="cc-ssheet__backdrop" onClick={onClose} />
      <div className="cc-ssheet__panel" role="dialog" aria-modal="true" aria-label="Add an item">
        <div className="cc-ssheet__head">
          {back && !hits ? (
            <button type="button" className="cc-mpick__back" onClick={back} aria-label="Back">
              <FiChevronLeft />
            </button>
          ) : null}
          <span className="cc-ssheet__title">{hits ? 'Search the menu' : title}</span>
          <button type="button" className="cc-mpick__done" onClick={onClose}>Done</button>
        </div>
        <label className="cc-ssheet__search">
          <FiSearch aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the menu"
            placeholder="Search any item…" enterKeyHint="search" autoComplete="off" spellCheck={false} autoCorrect="off" />
          {q ? <button type="button" className="cc-mpick__clear" aria-label="Clear search" onClick={() => setQ('')}><FiX /></button> : null}
        </label>
        {flash ? <div className="cc-mpick__flash" role="status"><FiCheck /> Added {flash}</div> : null}

        <div className="cc-ssheet__list cc-mpick__body">
          {hits ? (
            hits.length ? (
              <div className="cc-mpick__rows">
                {hits.map(({ c, n }) => (
                  <button key={`${c}|${n}`} type="button" className="cc-mpick__row" onClick={() => openItem(c, n)}>
                    <span>{n}</span><small>{c}</small>
                  </button>
                ))}
              </div>
            ) : <div className="cc-ssheet__empty">Nothing on the menu matches. Add it in Menu &amp; Prices first.</div>
          ) : item ? (
            <div className="cc-mpick__grid">
              {sizes.map((r) => {
                const n = inCart(cat, item, r.variant)
                return (
                  <button key={r.id || r.variant} type="button" className={`cc-mpick__tile cc-mpick__tile--size${n ? ' is-in' : ''}`}
                    onClick={() => pick(cat, item, r)}>
                    <span>{sizeName(r.variant)}</span>
                    <b>{inr(r.price)}</b>
                    {n ? <i className="cc-mpick__count">{n}</i> : null}
                  </button>
                )
              })}
            </div>
          ) : cat ? (
            <div className="cc-mpick__grid">
              {(index.byCat.get(cat)?.names || []).map((n) => {
                const vs = index.byCat.get(cat).variants.get(n)
                const lo = Math.min(...vs.map((v) => Number(v.price) || 0))
                const count = lines.filter((l) => l.category === cat && l.item === n).reduce((s, l) => s + (Math.round(Number(l.qty)) || 0), 0)
                return (
                  <button key={n} type="button" className={`cc-mpick__tile${count ? ' is-in' : ''}`} onClick={() => openItem(cat, n)}>
                    <span>{n}</span>
                    <small>{vs.length > 1 ? `${vs.length} sizes · from ${inr(lo)}` : inr(lo)}</small>
                    {count ? <i className="cc-mpick__count">{count}</i> : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="cc-mpick__grid">
              {index.categories.map((c) => (
                <button key={c} type="button" className="cc-mpick__tile cc-mpick__tile--cat" onClick={() => setCat(c)}>
                  <span>{c}</span>
                  <small>{index.byCat.get(c).names.length} items</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
