import { useMemo, useRef, useState } from 'react'
import { FiPlus, FiTrash2, FiUser, FiCreditCard, FiDollarSign, FiFlag, FiXCircle, FiArrowRight } from 'react-icons/fi'
import Modal from '../Modal.jsx'
import SearchableSelect from '../SearchableSelect.jsx'
import { inr } from '../../../data/format.js'
import { todayIso } from '../../../utils/adminDate.js'
import { isPerPieceVariant } from '../../../services/accounting.js'
import { variantLabel, sortVariants } from '../../../utils/orderItems.js'

const emptyLine = () => ({ category: '', item: '', variant: '', qty: 1, unitPrice: '' })
const lineTotal = (l) => Math.round((Number(l.qty) || 0) * (Number(l.unitPrice) || 0))

const Label = ({ children }) => (
  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#7a584d', marginBottom: 2 }}>{children}</label>
)

/**
 * One item = one row: Category → Item → Size cascade, then qty, price and the
 * line's own total. Stacked field-per-line cards meant two items filled the
 * screen; the row reads like the bill it becomes.
 */
function OrderLine({ menu, line, index, onChange, onRemove, canRemove, autoOpenItem }) {
  const categories = useMemo(
    () => [...new Set(menu.map((m) => m.category).filter(Boolean))].sort(), [menu]
  )
  const items = useMemo(
    () => [...new Set(menu.filter((m) => m.category === line.category).map((m) => m.name))].sort(),
    [menu, line.category]
  )
  // Sorted so every item lists its sizes the same way — piece, slice, tub, box,
  // whole — rather than in whatever order they were typed into the menu.
  const variants = useMemo(
    () => sortVariants(menu.filter((m) => m.category === line.category && m.name === line.item)),
    [menu, line.category, line.item]
  )
  // `value` stays the raw stored variant — it's the key the menu price and the
  // per-piece minimum are matched on. Only the label is prettified, so a bare
  // "6" reads "Box of 6" without changing what gets saved.
  const variantOptions = variants.map((v) => ({
    value: v.variant || 'Standard',
    label: v.variant && v.variant !== 'Standard' ? variantLabel(v.variant) : 'One size',
    sub: inr(v.price), price: v.price,
  }))

  // Changing anything above the rate drops the rate with it. Clearing the
  // category used to leave the last price sitting in the row, so an empty line
  // still read "₹140.00" and counted toward the order total.
  const pickCategory = (cat) => onChange({ ...line, category: cat, item: '', variant: '', unitPrice: '' })
  const pickItem = (name) => {
    const vs = menu.filter((m) => m.category === line.category && m.name === name)
    onChange({
      ...line, item: name,
      variant: vs.length === 1 ? (vs[0].variant || 'Standard') : '',
      unitPrice: vs.length === 1 ? vs[0].price : '',
    })
  }
  const pickVariant = (vn) => {
    const row = variants.find((v) => (v.variant || 'Standard') === vn)
    const pp = isPerPieceVariant(vn) // per-piece → default to 2 pieces
    onChange({
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

  return (
    <div className={`cc-oline${short ? ' cc-oline--short' : ''}`}>
      <div className="cc-oline__cell cc-oline__n">{index + 1}</div>
      <div className="cc-oline__cell cc-oline__cat">
        <SearchableSelect compact value={line.category} onChange={pickCategory}
          options={categories} placeholder="Category…" />
      </div>
      <div className="cc-oline__cell cc-oline__item">
        <SearchableSelect compact allowCustom value={line.item} onChange={pickItem}
          options={items} autoOpen={autoOpenItem}
          placeholder={line.category ? 'Item…' : 'Category first'} />
      </div>
      <div className="cc-oline__cell cc-oline__size">
        <SearchableSelect compact value={line.variant} onChange={pickVariant}
          options={variantOptions} disabled={variantOptions.length === 0}
          placeholder={variantOptions.length ? 'Size…' : '—'} />
      </div>
      <div className="cc-oline__cell cc-oline__qty">
        <input type="number" min={perPiece ? 2 : 1} className="form-control form-control-sm"
          aria-label="Quantity" title={perPiece ? 'Sold per piece — minimum 2' : 'Quantity'}
          value={line.qty} onChange={(e) => onChange({ ...line, qty: e.target.value })} />
      </div>
      <div className="cc-oline__cell cc-oline__price">
        <span className={`cc-oline__fixed${rate ? '' : ' cc-oline__fixed--none'}`}
          title={rate ? 'Set in Menu & Prices' : 'Pick a size, or add this item in Menu & Prices'}>
          {rate ? inr(rate) : '—'}
        </span>
      </div>
      <div className="cc-oline__cell cc-oline__total">{inr(lineTotal(line))}</div>
      <div className="cc-oline__cell cc-oline__del">
        {canRemove ? (
          <button type="button" className="cc-row-action text-danger" title="Remove item" onClick={onRemove}>
            <FiTrash2 />
          </button>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Add / edit an order. One customer can have many items (e.g. Chocolate cake pop ×2,
 * Vanilla cake pop ×2) — each line auto-fills its price; the order total adds up.
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
  const tableRef = useRef(null)

  const setLine = (i, l) => setLines((p) => p.map((x, idx) => (idx === i ? l : x)))
  // Carry the category into the next item. A customer's order is nearly always
  // from one category (four sponge cakes, six cake pops), and re-picking it on
  // every line was the slowest part of writing a bill.
  const addLine = () => {
    const last = lines[lines.length - 1]
    const at = lines.length
    setLines((p) => [...p, { ...emptyLine(), category: last?.category || '' }])
    setAutoOpenIdx(last?.category ? at : null) // category already filled → open the item list
    // Once the grid is scrolling, the new row is below the fold — go to it.
    requestAnimationFrame(() => {
      const el = tableRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }
  const removeLine = (i) => {
    if (lines.length === 1) return
    setLines((p) => p.filter((_, idx) => idx !== i))
    setAutoOpenIdx(null)
  }

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
      xl
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
        <button className="btn btn-light d-inline-flex align-items-center gap-2" onClick={onClose}>
          Cancel <FiXCircle />
        </button>
        <button className="btn text-white d-inline-flex align-items-center gap-2"
          style={{ background: 'var(--cc-rose, #e0617a)', fontWeight: 600 }} onClick={submit}>
          {editing ? 'Save changes' : 'Add Order'} <FiArrowRight />
        </button>
      </>}
    >
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6"><Label>Date</Label>
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="col-12 col-sm-6"><Label>Customer</Label>
          <SearchableSelect value={customer} onChange={setCustomer} options={customers}
            icon={<FiUser />} placeholder="Type customer name…" allowCustom /></div>
      </div>

      <div className="cc-oitems__head">
        <span className="cc-oitems__title">Items</span>
        <span className="cc-oitems__hint">Rates come from Menu &amp; Prices</span>
        <button type="button" className="cc-additem" onClick={addLine}>
          <FiPlus /> Add Item
        </button>
      </div>

      {/* One table, not eight labelled fields per item: the captions are stated
          once and every value sits centred under the one that names it. */}
      <div ref={tableRef} className={`cc-otable${lines.length > 6 ? ' cc-otable--scroll' : ''}`}>
        <div className="cc-oline cc-oline--head">
          <span className="cc-oline__cell cc-oline__n">#</span>
          <span className="cc-oline__cell cc-oline__cat">Category</span>
          <span className="cc-oline__cell cc-oline__item">Item</span>
          <span className="cc-oline__cell cc-oline__size">Size</span>
          <span className="cc-oline__cell cc-oline__qty">Qty</span>
          <span className="cc-oline__cell cc-oline__price">Rate (₹)</span>
          <span className="cc-oline__cell cc-oline__total">Total (₹)</span>
          <span className="cc-oline__cell cc-oline__del">Action</span>
        </div>
        {lines.map((line, i) => (
          <OrderLine key={i} menu={menu} line={line} index={i}
            onChange={(l) => setLine(i, l)} onRemove={() => removeLine(i)}
            canRemove={lines.length > 1} autoOpenItem={autoOpenIdx === i} />
        ))}
        {/* Closes the table, so it reads as the sum of the column above it. */}
        <div className="cc-ototal">
          <span>Total ({filled.length} item{filled.length === 1 ? '' : 's'} · {totalQty} qty)</span>
          <b>{inr(total)}</b>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-6 col-md-4"><Label>Payment</Label>
          <div className="cc-isel"><FiCreditCard />
            <select className="form-select" value={paid ? 'paid' : 'unpaid'} onChange={(e) => setPaid(e.target.value === 'paid')}>
              <option value="paid">Paid</option><option value="unpaid">Not paid yet</option>
            </select></div></div>
        <div className="col-6 col-md-4"><Label>Cash or Online?</Label>
          <div className="cc-isel"><FiDollarSign />
            <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="Cash">Cash</option><option value="Online">Online</option>
            </select></div></div>
        <div className="col-12 col-md-4"><Label>Status</Label>
          {/* Pending = not started, In Progress = baking now, Completed = handed
              over. Only "Cancelled" changes the money (computeSummary drops it);
              the rest are for the baker's own tracking. */}
          <div className="cc-isel"><FiFlag />
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Completed</option><option>In Progress</option>
              <option>Pending</option><option>Cancelled</option>
            </select></div></div>
        <div className="col-12"><Label>Notes (optional)</Label>
          <textarea className="form-control" rows={2} value={notes} spellCheck={false}
            onChange={(e) => setNotes(e.target.value)} placeholder="Add notes…" /></div>
      </div>
    </Modal>
  )
}
