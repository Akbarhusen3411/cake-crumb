import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FiPlus, FiTrash2, FiUser, FiXCircle, FiArrowRight,
  FiCheck, FiClock, FiDollarSign, FiSmartphone,
} from 'react-icons/fi'
import Modal from '../Modal.jsx'
import SearchableSelect from '../SearchableSelect.jsx'
import { inr } from '../../../data/format.js'
import { todayIso } from '../../../utils/adminDate.js'
import { isPerPieceVariant } from '../../../services/accounting.js'
import { variantLabel, sortVariants } from '../../../utils/orderItems.js'

// One shared empty array, so a row with no category still gets a stable prop and
// stays memoised instead of re-rendering on every keystroke elsewhere.
const EMPTY = Object.freeze([])
const emptyLine = () => ({ category: '', item: '', variant: '', qty: 1, unitPrice: '' })
const lineTotal = (l) => Math.round((Number(l.qty) || 0) * (Number(l.unitPrice) || 0))

/** A captioned control in the details pane. */
const Field = ({ label, hint, children }) => (
  <div className="cc-field">
    <span className="cc-field__label">{label}{hint ? <i>{hint}</i> : null}</span>
    {children}
  </div>
)

/**
 * A choice made by pressing the answer, not by opening a list and picking it.
 * Paid / Cash / Status were three identical grey selects — three taps each on a
 * touchscreen, and nothing on the sheet said which answer was the usual one.
 */
const Seg = ({ value, onChange, options }) => (
  <div className="cc-seg">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        className={`cc-seg__btn${o.tone ? ` cc-seg__btn--${o.tone}` : ''}`}
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
      >
        {o.icon ? <span className="cc-seg__ico">{o.icon}</span> : null}
        {o.label}
      </button>
    ))}
  </div>
)

/**
 * Category → its item names → each item's sizes, indexed once per menu load.
 *
 * Every row used to map + Set + sort all 207 menu rows three times over, on
 * mount and on any change to its own category or item. A twenty-item order did
 * that sixty times for one sheet, which is what made a long order crawl (and
 * feel stuck) on a slower laptop. Now a row does three Map lookups.
 */
function buildMenuIndex(menu) {
  const raw = new Map()
  for (const m of menu) {
    const cat = String(m.category || '').trim()
    const name = String(m.name || '').trim()
    if (!cat || !name) continue
    let byName = raw.get(cat)
    if (!byName) { byName = new Map(); raw.set(cat, byName) }
    const rows = byName.get(name)
    if (rows) rows.push(m)
    else byName.set(name, [m])
  }
  const byCat = new Map()
  for (const [cat, byName] of raw) {
    // Sorted so every item lists its sizes the same way — piece, slice, tub,
    // box, whole — rather than in whatever order they were typed into the menu.
    const variants = new Map()
    for (const [name, rows] of byName) variants.set(name, sortVariants(rows))
    byCat.set(cat, { names: [...byName.keys()].sort((a, b) => a.localeCompare(b)), variants })
  }
  return { categories: [...byCat.keys()].sort((a, b) => a.localeCompare(b)), byCat }
}

/**
 * One item = one row: Category → Item → Size cascade, then qty, the menu's rate
 * and the line's own total. Memoised on its own line, so typing in row 12
 * doesn't re-render the other nineteen.
 */
const OrderLine = memo(function OrderLine({
  index, line, catEntry, categories, canRemove, autoOpenItem, onChange, onRemove, onAddRow,
}) {
  const variantRows = (line.item && catEntry?.variants.get(line.item)) || EMPTY
  // `value` stays the raw stored variant — it's the key the menu price and the
  // per-piece minimum are matched on. Only the label is prettified, so a bare
  // "6" reads "Box of 6" without changing what gets saved.
  const variantOptions = useMemo(
    () => variantRows.map((v) => ({
      value: v.variant || 'Standard',
      label: v.variant && v.variant !== 'Standard' ? variantLabel(v.variant) : 'One size',
      sub: inr(v.price),
    })),
    [variantRows]
  )

  // Changing anything above the rate drops the rate with it. Clearing the
  // category used to leave the last price sitting in the row, so an empty line
  // still read "₹140.00" and counted toward the order total.
  const pickCategory = (cat) => onChange(index, { ...line, category: cat, item: '', variant: '', unitPrice: '' })
  const pickItem = (name) => {
    const vs = catEntry?.variants.get(name) || EMPTY
    onChange(index, {
      ...line, item: name,
      variant: vs.length === 1 ? (vs[0].variant || 'Standard') : '',
      unitPrice: vs.length === 1 ? vs[0].price : '',
    })
  }
  const pickVariant = (vn) => {
    const row = variantRows.find((v) => (v.variant || 'Standard') === vn)
    const pp = isPerPieceVariant(vn) // per-piece → default to 2 pieces
    onChange(index, {
      ...line, variant: vn,
      unitPrice: row ? row.price : '',
      qty: pp && (Number(line.qty) || 0) < 2 ? 2 : line.qty,
    })
  }

  const perPiece = isPerPieceVariant(line.variant)
  const short = perPiece && (Number(line.qty) || 0) < 2
  // The rate is the menu's, never typed here. A figure typed over it made the
  // bill disagree with Menu & Prices with nothing to say which was right —
  // change the price there and every future order follows. An item with no rate
  // yet (no size picked, or one hand-typed) shows a dash and the save says so.
  const rate = Number(line.unitPrice) || 0
  // Flagged on the row rather than only at save: a named item with no rate is
  // the one mistake that books an order worth ₹0.
  const unpriced = !!line.item && rate <= 0

  return (
    <div className={`cc-sline${short ? ' cc-sline--short' : ''}${unpriced ? ' cc-sline--noprice' : ''}`}>
      <div className="cc-sline__cell cc-sline__n">{index + 1}</div>
      <div className="cc-sline__cell cc-sline__cat">
        <SearchableSelect compact value={line.category} onChange={pickCategory}
          options={categories} placeholder="Category…" />
      </div>
      <div className="cc-sline__cell cc-sline__item">
        <SearchableSelect compact allowCustom value={line.item} onChange={pickItem}
          options={catEntry?.names || EMPTY} autoOpen={autoOpenItem}
          placeholder={line.category ? 'Item…' : 'Category first'} />
      </div>
      <div className="cc-sline__cell cc-sline__size">
        <SearchableSelect compact value={line.variant} onChange={pickVariant}
          options={variantOptions} disabled={variantOptions.length === 0}
          placeholder={variantOptions.length ? 'Size…' : '—'} />
      </div>
      <div className="cc-sline__cell cc-sline__qty">
        <span className="cc-sline__cap">Qty</span>
        <input type="number" min={perPiece ? 2 : 1} className="form-control form-control-sm"
          aria-label="Quantity" title={perPiece ? 'Sold per piece — minimum 2' : 'Quantity'}
          value={line.qty} onChange={(e) => onChange(index, { ...line, qty: e.target.value })}
          // Enter finishes the line and opens the next one: writing a long bill
          // is then type · pick · Enter without reaching for the mouse.
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddRow() } }} />
      </div>
      <div className="cc-sline__cell cc-sline__rate">
        <span className="cc-sline__cap">Rate</span>
        <span className={`cc-sline__fixed${rate ? '' : ' cc-sline__fixed--none'}`}
          title={rate ? 'Set in Menu & Prices' : 'Pick a size, or add this item in Menu & Prices'}>
          {rate ? inr(rate) : '—'}
        </span>
      </div>
      <div className="cc-sline__cell cc-sline__amt">
        <span className="cc-sline__cap">Total</span>
        <span className="cc-sline__money">{inr(lineTotal(line))}</span>
      </div>
      <div className="cc-sline__cell cc-sline__del">
        {canRemove ? (
          <button type="button" className="cc-srow-del" title="Remove item"
            aria-label={`Remove item ${index + 1}`} onClick={() => onRemove(index)}>
            <FiTrash2 />
          </button>
        ) : null}
      </div>
    </div>
  )
})

/**
 * Add / edit an order. One customer can have many items (e.g. Chocolate cake pop ×2,
 * Vanilla cake pop ×2) — each line auto-fills its price; the order total adds up.
 *
 * Laid out as a workbench, not a stack of fields: the items table takes the
 * width and the height, and everything that is asked once per order (date,
 * customer, payment, status) sits in a column beside it. A thirty-item order
 * scrolls one list; nothing else on the sheet moves.
 */
export default function OrderForm({ menu = [], customers = [], initial = null, onSave, onClose }) {
  // Editing is decided by the id, not by `initial` being present: a duplicate
  // arrives fully prefilled but with no id, so it saves as a new order and gets
  // its own number.
  const editing = !!initial?.id
  const [date, setDate] = useState(initial?.date || todayIso())
  const [customer, setCustomer] = useState(initial?.customer || '')
  const [paid, setPaid] = useState(initial ? !!initial.paid : true)
  const [method, setMethod] = useState(initial?.method || 'Cash')
  const [status, setStatus] = useState(initial?.status || 'Completed')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [lines, setLines] = useState(() => {
    if (initial?.items?.length) {
      return initial.items.map((it) => ({
        category: it.category || '', item: it.item || '', variant: it.variant || '',
        qty: it.qty ?? 1, unitPrice: it.unitPrice ?? '',
      }))
    }
    if (initial) {
      return [{
        category: initial.category || '', item: initial.item || '', variant: initial.variant || '',
        qty: initial.qty ?? 1, unitPrice: initial.unitPrice ?? '',
      }]
    }
    return [emptyLine()]
  })
  const [autoOpenIdx, setAutoOpenIdx] = useState(null)
  const scrollRef = useRef(null)
  // The add button has to read the latest lines without being rebuilt when they
  // change: a fresh `onAddRow` on every keystroke would re-render every row and
  // undo the memo above.
  const linesRef = useRef(lines)
  useEffect(() => { linesRef.current = lines }, [lines])

  const index = useMemo(() => buildMenuIndex(menu), [menu])

  // Stable callbacks, or every row re-renders on each keystroke and the memo
  // above buys nothing. The row hands its own index back.
  const setLine = useCallback((i, l) => setLines((p) => p.map((x, idx) => (idx === i ? l : x))), [])
  // Carry the category into the next item. A customer's order is nearly always
  // from one category (four sponge cakes, six cake pops), and re-picking it on
  // every line was the slowest part of writing a bill.
  const addLine = useCallback(() => {
    const prev = linesRef.current
    const last = prev[prev.length - 1]
    setLines((p) => [...p, { ...emptyLine(), category: last?.category || '' }])
    setAutoOpenIdx(last?.category ? prev.length : null) // category filled → open the item list
    // The new row is below the fold once the list is scrolling — go to it.
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])
  const removeLine = useCallback((i) => {
    setLines((p) => (p.length === 1 ? p : p.filter((_, idx) => idx !== i)))
    setAutoOpenIdx(null)
  }, [])

  // Only lines that name an item count — a row still being filled in is not
  // part of the bill, and `submit` saves exactly these.
  const filled = lines.filter((l) => l.item)
  const totalQty = filled.reduce((s, l) => s + (Number(l.qty) || 0), 0)
  const total = filled.reduce((s, l) => s + lineTotal(l), 0)

  function submit() {
    if (!date) return alert('Please pick a date.')
    if (!customer.trim()) return alert('Please enter a customer name.')
    const clean = lines
      .map((l) => ({
        category: l.category.trim(), item: l.item.trim(),
        variant: l.variant && l.variant !== 'Standard' ? l.variant : '',
        qty: Math.round(Number(l.qty) || 0), unitPrice: Number(l.unitPrice) || 0,
      }))
      .filter((l) => l.item)
    if (!clean.length) return alert('Add at least one item.')
    if (clean.some((l) => l.qty <= 0)) return alert('Each item quantity must be 1 or more.')
    // The rate can't be typed on the row any more, so a line with none is a
    // size that was never picked (or an item that isn't on the menu) — saving it
    // would book an order worth ₹0.
    const unpriced = clean.find((l) => l.unitPrice <= 0)
    if (unpriced) {
      return alert(`${unpriced.item} has no rate.\n\nPick its size, or add it in Menu & Prices first — rates come from there.`)
    }
    // The Qty box carries min 2 for per-piece items and picking the size bumps
    // it, but nothing stops you typing 1 back in — the bakery won't bake one.
    const single = clean.find((l) => isPerPieceVariant(l.variant) && l.qty < 2)
    if (single) return alert(`${single.item} is sold per piece — the minimum is 2 pieces.`)
    onSave({ date, customer: customer.trim(), items: clean, amount: total, paid, method, status, notes: notes.trim() })
  }

  return (
    <Modal
      full
      flush
      icon="🧁"
      title={editing ? 'Edit Order' : 'New Order'}
      // When editing, lead with the order number — it's how the owner identifies
      // which order this is, and it's assigned by OrdersTab on save, not here.
      subtitle={
        editing && initial?.orderNo ? `Order ${initial.orderNo}`
          : initial?.copyOf ? `Copy of ${initial.copyOf} — check the date and items`
            : 'Add items and place the order'
      }
      onClose={onClose}
      footer={<>
        {/* The total follows the buttons on every screen size, so it's still in
            front of you when the summary card has scrolled away on a phone. */}
        <div className="cc-sheet__foottotal me-auto">
          <span>Order total</span>
          <b>{inr(total)}</b>
        </div>
        <button className="btn btn-light d-inline-flex align-items-center gap-2" onClick={onClose}>
          Cancel <FiXCircle />
        </button>
        <button className="btn text-white d-inline-flex align-items-center gap-2"
          style={{ background: 'var(--cc-rose, #e0617a)', fontWeight: 600 }} onClick={submit}>
          {editing ? 'Save changes' : 'Add Order'} <FiArrowRight />
        </button>
      </>}
    >
      <div className="cc-sheet">
        {/* Asked once per order, so it sits out of the way of the list that is
            filled in over and over. Second in the DOM, first on a phone. */}
        <aside className="cc-sheet__side">
          <div className="cc-sheet__sidetitle">Order details</div>

          <Field label="Date">
            <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Customer">
            <SearchableSelect value={customer} onChange={setCustomer} options={customers}
              icon={<FiUser />} placeholder="Type customer name…" allowCustom />
          </Field>
          <Field label="Payment">
            <Seg
              value={paid ? 'paid' : 'unpaid'} onChange={(v) => setPaid(v === 'paid')}
              options={[
                { value: 'paid', label: 'Paid', tone: 'ok', icon: <FiCheck /> },
                { value: 'unpaid', label: 'Not yet', tone: 'warn', icon: <FiClock /> },
              ]}
            />
          </Field>
          <Field label="Money in">
            <Seg
              value={method} onChange={setMethod}
              options={[
                { value: 'Cash', label: 'Cash', icon: <FiDollarSign /> },
                { value: 'Online', label: 'Online', icon: <FiSmartphone /> },
              ]}
            />
          </Field>
          {/* Pending = not started, In Progress = baking now, Completed = handed
              over. Only "Cancelled" changes the money (computeSummary drops it);
              the rest are for the baker's own tracking. */}
          <Field label="Status">
            <Seg
              value={status} onChange={setStatus}
              options={[
                { value: 'Completed', label: 'Completed' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Cancelled', label: 'Cancelled', tone: 'danger' },
              ]}
            />
          </Field>
          <Field label="Notes" hint="optional">
            <textarea className="form-control" rows={2} value={notes} spellCheck={false}
              onChange={(e) => setNotes(e.target.value)} placeholder="Anything to remember…" />
          </Field>

          <div className="cc-ssum">
            <div className="cc-ssum__row">
              <span>Items</span><b>{filled.length}</b>
            </div>
            <div className="cc-ssum__row">
              <span>Total quantity</span><b>{totalQty}</b>
            </div>
            <div className="cc-ssum__grand">
              <span>Order total</span><b>{inr(total)}</b>
            </div>
          </div>
        </aside>

        {/* One table, not eight labelled fields per item: the captions are stated
            once and every value sits centred under the one that names it. */}
        <section className="cc-sheet__main">
          <div className="cc-sheet__panehead">
            <span className="cc-sheet__title">Items</span>
            <span className="cc-sheet__hint">Rates come from Menu &amp; Prices · press Enter on Qty for the next item</span>
          </div>

          <div className="cc-stable cc-stable--order">
            <div className="cc-sline cc-sline--head">
              <span className="cc-sline__cell cc-sline__n">#</span>
              <span className="cc-sline__cell cc-sline__cat">Category</span>
              <span className="cc-sline__cell cc-sline__item">Item</span>
              <span className="cc-sline__cell cc-sline__size">Size</span>
              <span className="cc-sline__cell cc-sline__qty">Qty</span>
              <span className="cc-sline__cell cc-sline__rate">Rate</span>
              <span className="cc-sline__cell cc-sline__amt">Total</span>
              <span className="cc-sline__cell cc-sline__del" />
            </div>
            {/* The one scrolling region on the sheet — see Modal's `flush`. */}
            <div ref={scrollRef} className="cc-stable__scroll">
              {lines.map((line, i) => (
                <OrderLine
                  key={i} index={i} line={line}
                  categories={index.categories}
                  catEntry={index.byCat.get(line.category)}
                  canRemove={lines.length > 1} autoOpenItem={autoOpenIdx === i}
                  onChange={setLine} onRemove={removeLine} onAddRow={addLine}
                />
              ))}
            </div>
            {/* Outside the scroller on purpose — it stays directly under the
                last visible row however long the list gets. */}
            <button type="button" className="cc-saddrow" onClick={addLine}>
              <FiPlus /> Add item
            </button>
            {/* Closes the table, so it reads as the sum of the column above it. */}
            <div className="cc-stotal">
              <span>{filled.length} item{filled.length === 1 ? '' : 's'} · {totalQty} qty</span>
              <b>{inr(total)}</b>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  )
}
