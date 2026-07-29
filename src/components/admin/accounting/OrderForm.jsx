import { useMemo, useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import Modal from '../Modal.jsx'
import SearchableSelect from '../SearchableSelect.jsx'
import { inr } from '../../../data/format.js'
import { todayIso } from '../../../utils/adminDate.js'
import { isPerPieceVariant } from '../../../services/accounting.js'

const emptyLine = () => ({ category: '', item: '', variant: '', qty: 1, unitPrice: '' })

const Label = ({ children }) => (
  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#7a584d', marginBottom: 2 }}>{children}</label>
)

// One item row inside an order — Category → Item → Size cascade, free quantity.
function OrderLine({ menu, line, onChange, onRemove, canRemove }) {
  const categories = useMemo(
    () => [...new Set(menu.map((m) => m.category).filter(Boolean))].sort(), [menu]
  )
  const items = useMemo(
    () => [...new Set(menu.filter((m) => m.category === line.category).map((m) => m.name))].sort(),
    [menu, line.category]
  )
  const variants = useMemo(
    () => menu.filter((m) => m.category === line.category && m.name === line.item),
    [menu, line.category, line.item]
  )
  const variantOptions = variants.map((v) => ({
    value: v.variant || 'Standard',
    label: v.variant && v.variant !== 'Standard' ? v.variant : 'Standard',
    sub: inr(v.price), price: v.price,
  }))
  const total = Math.round((Number(line.qty) || 0) * (Number(line.unitPrice) || 0))

  const pickCategory = (cat) => onChange({ ...line, category: cat, item: '', variant: '' })
  const pickItem = (name) => {
    const vs = menu.filter((m) => m.category === line.category && m.name === name)
    onChange({
      ...line, item: name,
      variant: vs.length === 1 ? (vs[0].variant || 'Standard') : '',
      unitPrice: vs.length === 1 ? vs[0].price : line.unitPrice,
    })
  }
  const pickVariant = (vn) => {
    const row = variants.find((v) => (v.variant || 'Standard') === vn)
    const pp = isPerPieceVariant(vn) // per-piece → default to 2 pieces
    onChange({
      ...line, variant: vn,
      unitPrice: row ? row.price : line.unitPrice,
      qty: pp && (Number(line.qty) || 0) < 2 ? 2 : line.qty,
    })
  }
  const perPiece = isPerPieceVariant(line.variant)

  return (
    <div style={{ border: '1px solid #f0e0e3', borderRadius: 12, padding: 12, background: '#fdf6f8', position: 'relative' }}>
      <div className="row g-2">
        <div className="col-12 col-md-4"><Label>Category</Label>
          <SearchableSelect value={line.category} onChange={pickCategory} options={categories} placeholder="Pick / search…" /></div>
        <div className="col-12 col-md-5"><Label>Item</Label>
          <SearchableSelect value={line.item} onChange={pickItem} options={items}
            placeholder={line.category ? 'Pick / search…' : 'Choose a category first'} allowCustom /></div>
        <div className="col-12 col-md-3"><Label>Size</Label>
          <SearchableSelect value={line.variant} onChange={pickVariant} options={variantOptions}
            placeholder={variantOptions.length ? 'Size…' : '—'} disabled={variantOptions.length === 0} /></div>
        <div className="col-4"><Label>{perPiece ? 'Pieces (min 2)' : 'Qty'}</Label>
          <input type="number" min={perPiece ? 2 : 1} className="form-control" value={line.qty} onChange={(e) => onChange({ ...line, qty: e.target.value })} /></div>
        <div className="col-4"><Label>Unit Price (₹)</Label>
          <input type="number" min="0" className="form-control" value={line.unitPrice} onChange={(e) => onChange({ ...line, unitPrice: e.target.value })} /></div>
        <div className="col-4"><Label>Line total</Label>
          <div className="form-control" style={{ background: '#fff', fontWeight: 700, color: '#1b7f5e' }}>{inr(total)}</div></div>
      </div>
      {canRemove && (
        <button type="button" className="btn btn-sm btn-link text-danger p-0 mt-1" onClick={onRemove}>
          <FiX /> remove item
        </button>
      )}
    </div>
  )
}

/**
 * Add / edit an order. One customer can have many items (e.g. Chocolate cake pop ×2,
 * Vanilla cake pop ×2) — each line auto-fills its price; the order total adds up.
 */
export default function OrderForm({ menu = [], customers = [], initial = null, onSave, onClose }) {
  const editing = !!initial
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

  const setLine = (i, l) => setLines((p) => p.map((x, idx) => (idx === i ? l : x)))
  const addLine = () => setLines((p) => [...p, emptyLine()])
  const removeLine = (i) => setLines((p) => (p.length === 1 ? p : p.filter((_, idx) => idx !== i)))

  const total = lines.reduce((s, l) => s + Math.round((Number(l.qty) || 0) * (Number(l.unitPrice) || 0)), 0)

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
    // The Pieces box says "min 2" and picking the size bumps it, but until now
    // nothing stopped you typing 1 back in — the bakery won't bake a single one.
    const single = clean.find((l) => isPerPieceVariant(l.variant) && l.qty < 2)
    if (single) return alert(`${single.item} is sold per piece — the minimum is 2 pieces.`)
    onSave({ date, customer: customer.trim(), items: clean, amount: total, paid, method, status, notes: notes.trim() })
  }

  return (
    <Modal
      wide
      title={editing ? 'Edit Order' : 'New Order'}
      subtitle="One customer can order several items. Add each item, pick its size — the total adds up."
      onClose={onClose}
      footer={<>
        <button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn text-white" style={{ background: 'var(--cc-rose, #e0617a)' }} onClick={submit}>
          {editing ? 'Save changes' : 'Add order'}
        </button>
      </>}
    >
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6"><Label>Date</Label>
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="col-12 col-sm-6"><Label>Customer</Label>
          <SearchableSelect value={customer} onChange={setCustomer} options={customers} placeholder="Type a name…" allowCustom /></div>
      </div>

      <Label>Items</Label>
      <div className="d-flex flex-column gap-2">
        {lines.map((line, i) => (
          <OrderLine key={i} menu={menu} line={line}
            onChange={(l) => setLine(i, l)} onRemove={() => removeLine(i)} canRemove={lines.length > 1} />
        ))}
      </div>
      <div className="d-flex align-items-center justify-content-between mt-2 mb-3">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addLine}>
          <FiPlus /> Add another item
        </button>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#1b7f5e' }}>Order total: {inr(total)}</div>
      </div>

      <div className="row g-3">
        <div className="col-6 col-md-4"><Label>Payment</Label>
          <select className="form-select" value={paid ? 'paid' : 'unpaid'} onChange={(e) => setPaid(e.target.value === 'paid')}>
            <option value="paid">Paid</option><option value="unpaid">Not paid yet</option>
          </select></div>
        <div className="col-6 col-md-4"><Label>Cash or Online?</Label>
          <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="Cash">Cash</option><option value="Online">Online</option>
          </select></div>
        <div className="col-12 col-md-4"><Label>Status</Label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Completed</option><option>Pending</option><option>Cancelled</option>
          </select></div>
        <div className="col-12"><Label>Notes</Label>
          <input type="text" className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" /></div>
      </div>
    </Modal>
  )
}
