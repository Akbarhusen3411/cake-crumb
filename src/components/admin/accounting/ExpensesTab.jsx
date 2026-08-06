import { useMemo, useRef, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiDownload } from 'react-icons/fi'
import Modal from '../Modal.jsx'
import FilterChips from './FilterChips.jsx'
import PeriodSelect from './PeriodSelect.jsx'
import { ACC, addDocRec, updateDocRec, deleteDocRec, monthsFrom } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { todayIso, fmtDate, inPeriod } from '../../../utils/adminDate.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'
import { downloadCsv } from '../../../utils/csv.js'

const METHOD_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Cash', label: 'Cash' },
  { key: 'Online', label: 'Online' },
]

/**
 * Every thing bought on its own line with what it came to — the same shape the
 * orders list uses. As one run-on string ("Duplex Cake box 12 inch ×5, Cake base
 * 10 inch ×5, …") against a single total, there was no way to see what any one
 * of them cost without opening the expense.
 */
const ExpenseLines = ({ expense }) => {
  const items = (expense.items || []).filter((it) => it.name || it.price)
  if (!items.length) return <span className="small text-muted">{expense.notes || '—'}</span>
  return (
    <div className="cc-items-cell">
      {items.map((it, i) => {
        const qty = Number(it.qty) || 0
        const rate = Number(it.price) || 0
        return (
          <div className="cc-item-line" key={i}>
            <span className="cc-item-line__name">{it.name || '—'}</span>
            <span className="cc-item-line__qty">{qty} × {inr(rate)}</span>
            <span className="cc-item-line__amt">{inr(Math.round(qty * rate))}</span>
          </div>
        )
      })}
    </div>
  )
}

// A one-line summary of what an expense contained — for the delete confirm,
// where a list can't go.
const itemsSummary = (e) => {
  const parts = (e.items || [])
    .map((it) => (it.name || '') + (Number(it.qty) > 1 ? ` ×${it.qty}` : ''))
    .filter((s) => s.trim())
  if (parts.length) return parts.join(', ')
  return e.notes || '—'
}
// Searchable text: shop name, every item bought, and the notes.
const searchText = (e) =>
  [e.vendor, ...(e.items || []).map((it) => it.name), e.notes].filter(Boolean).join(' ').toLowerCase()

export default function ExpensesTab({ expenses, reload }) {
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const [methodFilter, setMethodFilter] = useState('all') // all | Cash | Online
  const [period, setPeriod] = useState('all')             // all | today | YYYY-MM
  const mobile = useIsMobile()

  const months = useMemo(() => monthsFrom(expenses), [expenses])
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    let list = [...expenses].sort((a, b) => String(b.date).localeCompare(String(a.date)))
    if (s) list = list.filter((e) => searchText(e).includes(s))
    if (methodFilter !== 'all') list = list.filter((e) => e.method === methodFilter)
    if (period !== 'all') list = list.filter((e) => inPeriod(e.date, period))
    return list
  }, [expenses, q, methodFilter, period])

  const filtered = methodFilter !== 'all' || period !== 'all' || q.trim() !== ''
  // Total follows the filter, so "Cash" answers "how much cash went out".
  const total = rows.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const pageSize = mobile ? 10 : 25
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const p = Math.min(page, pageCount)
  const pageRows = rows.slice((p - 1) * pageSize, p * pageSize)

  async function save(data) {
    setBusy(true)
    if (editing?.id) await updateDocRec(ACC.EXPENSES, editing.id, data)
    else await addDocRec(ACC.EXPENSES, data)
    setEditing(null); await reload(); setBusy(false)
  }
  /**
   * The rows on screen, filters and all — one line per thing bought, with the
   * expense's own fields repeated down its lines. Delivery and `Expense total`
   * are written on the **first line only**, so those columns add up to the real
   * figure rather than multiplying by the number of items. Closing TOTAL row.
   */
  function exportCsv() {
    const out = []
    let qtySum = 0, amountSum = 0, deliverySum = 0, expenseSum = 0
    for (const e of rows) {
      const items = (e.items || []).filter((it) => it.name || it.price)
      const delivery = Number(e.delivery) || 0
      const total = Number(e.amount) || 0
      ;(items.length ? items : [{}]).forEach((it, i) => {
        const qty = Number(it.qty) || 0
        const price = Number(it.price) || 0
        const amount = Math.round(qty * price)
        qtySum += qty; amountSum += amount
        out.push([
          e.date || '', e.vendor || '', it.name || '', qty, price, amount,
          i === 0 ? delivery : '', i === 0 ? total : '',
          e.method || '', i === 0 ? (e.notes || '') : '',
        ])
      })
      deliverySum += delivery
      expenseSum += total
    }
    out.push(['TOTAL', '', '', qtySum, '', amountSum, deliverySum, expenseSum, '', ''])
    downloadCsv(
      `cake-crumb-expenses-${todayIso()}.csv`,
      ['Date', 'Bought from', 'Item', 'Qty', '₹ each', 'Amount', 'Delivery', 'Expense total', 'Paid from', 'Notes'],
      out
    )
  }

  async function remove(e) {
    if (!window.confirm(`Delete this expense?\n${e.vendor} — ${itemsSummary(e)} (${inr(e.amount)})`)) return
    setBusy(true); await deleteDocRec(ACC.EXPENSES, e.id); await reload(); setBusy(false)
  }

  return (
    <div>
      <div className="cc-admin-toolbar d-flex flex-wrap gap-2 align-items-center mb-3">
        <button className="cc-admin-toolbar-btn btn text-white d-inline-flex align-items-center gap-2" style={{ background: 'var(--cc-rose,#e0617a)', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => setEditing({})}>
          <FiPlus /> New Expense
        </button>
        <input
          className="form-control" style={{ maxWidth: 280 }}
          placeholder="Search shop, item or note…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }}
        />
        <button className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
          onClick={exportCsv} disabled={!rows.length} title="Download what's on screen as a spreadsheet">
          <FiDownload /> CSV
        </button>
        <div className="cc-admin-count ms-auto text-end" style={{ background: '#fdeef0', border: '1px solid #f3d3d8', borderRadius: 12, padding: '6px 16px' }}>
          <div style={{ fontSize: 11, color: '#a06', letterSpacing: 0.3, textTransform: 'uppercase' }}>
            {filtered ? 'Spent — filtered' : 'Total spent'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#c23a2b', lineHeight: 1.1 }}>{inr(total)}</div>
        </div>
      </div>

      <div className="cc-admin-filters d-flex flex-wrap align-items-center gap-3 mb-3">
        <FilterChips
          label="Paid from" options={METHOD_FILTERS} value={methodFilter}
          onChange={(v) => { setMethodFilter(v); setPage(1) }}
        />
        <PeriodSelect value={period} months={months} onChange={(v) => { setPeriod(v); setPage(1) }} />
        {filtered && (
          <button
            type="button" className="btn btn-sm btn-link text-secondary p-0"
            onClick={() => { setQ(''); setMethodFilter('all'); setPeriod('all'); setPage(1) }}
          >
            Clear filters
          </button>
        )}
        <span className="ms-auto text-muted small">{rows.length} expense{rows.length === 1 ? '' : 's'}</span>
      </div>

      {rows.length === 0 ? (
        <div className="text-center text-muted py-4" style={{ border: '1px solid #f0e0e3', borderRadius: 12 }}>
          {filtered ? 'No expenses match these filters.' : 'No expenses yet. Click “New Expense”.'}
        </div>
      ) : mobile ? (
        // ── mobile: stacked cards ──
        <div className="d-flex flex-column gap-2">
          {pageRows.map((e) => (
            <div key={e.id} style={{ border: '1px solid #f0e0e3', borderRadius: 12, padding: 12, background: '#fff' }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold" style={{ color: '#5b3e36' }}>{e.vendor}</div>
                  <div className="small text-muted">{fmtDate(e.date)} · {e.method}</div>
                </div>
                <div className="fw-bold" style={{ color: '#b23b3b', fontSize: 18 }}>{inr(e.amount)}</div>
              </div>
              <div className="mt-2" style={{ color: '#7a584d' }}><ExpenseLines expense={e} /></div>
              {Number(e.delivery) > 0 && <div className="small text-muted mt-1">+ {inr(e.delivery)} delivery</div>}
              <div className="cc-card-actions">
                <button className="cc-card-action" style={{ color: '#cf3e63' }} title="Edit" aria-label="Edit"
                  onClick={() => setEditing(e)}><FiEdit2 /></button>
                <button className="cc-card-action text-danger" title="Delete" aria-label="Delete"
                  onClick={() => remove(e)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── desktop: table ──
        // Ruled, centred and ten rows deep before it scrolls — same as Orders.
        <div className="table-responsive cc-table-scroll" style={{ borderRadius: 12, border: '1px solid #f0e0e3' }}>
          <table className="table table-hover align-middle mb-0 cc-grid-table" style={{ fontSize: 14 }}>
            <thead style={{ background: '#f9eef1' }}>
              <tr style={{ color: '#7a4a58' }}>
                <th>Date</th><th>Bought from</th><th>Items</th>
                <th>Delivery</th><th>Total</th>
                <th>Paid from</th><th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((e) => (
                <tr key={e.id}>
                  <td className="text-nowrap">{fmtDate(e.date)}</td>
                  <td className="fw-semibold">{e.vendor}</td>
                  <td><ExpenseLines expense={e} /></td>
                  <td className="text-nowrap">{Number(e.delivery) > 0 ? inr(e.delivery) : '—'}</td>
                  <td className="fw-semibold text-nowrap" style={{ color: '#b23b3b' }}>{inr(e.amount)}</td>
                  <td>{e.method}</td>
                  <td className="text-nowrap">
                    <button className="cc-row-action" style={{ color: '#cf3e63' }} title="Edit" onClick={() => setEditing(e)}><FiEdit2 /></button>
                    <button className="cc-row-action text-danger" title="Delete" onClick={() => remove(e)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pageCount > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <button className="btn btn-sm btn-light" disabled={p <= 1} onClick={() => setPage(p - 1)}>‹ Prev</button>
          <span className="small text-muted">Page {p} of {pageCount}</span>
          <button className="btn btn-sm btn-light" disabled={p >= pageCount} onClick={() => setPage(p + 1)}>Next ›</button>
        </div>
      )}
      {busy ? <div className="text-muted small mt-2">Saving…</div> : null}

      {editing !== null && (
        <ExpenseForm initial={editing.id ? editing : null} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function ExpenseForm({ initial, onSave, onClose }) {
  const [date, setDate] = useState(initial?.date || todayIso())
  const [vendor, setVendor] = useState(initial?.vendor || '')
  const [method, setMethod] = useState(initial?.method || 'Cash')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [delivery, setDelivery] = useState(initial?.delivery ?? '')
  const [items, setItems] = useState(() => {
    const src = initial?.items?.length ? initial.items : [{ name: '', qty: 1, price: '' }]
    return src.map((it) => ({ name: it.name || '', qty: it.qty ?? 1, price: it.price ?? '' }))
  })
  const listRef = useRef(null)

  const setItem = (i, key, val) => setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)))
  const addItem = () => {
    setItems((p) => [...p, { name: '', qty: 1, price: '' }])
    requestAnimationFrame(() => {
      const el = listRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }
  const removeItem = (i) => setItems((p) => (p.length === 1 ? p : p.filter((_, idx) => idx !== i)))

  const itemsTotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0)
  const total = itemsTotal + (Number(delivery) || 0)

  function submit() {
    if (!date) return alert('Please pick a date.')
    if (total <= 0) return alert('Add at least one item price (or a delivery charge).')
    const cleanItems = items
      .map((it) => ({ name: it.name.trim(), qty: Math.round(Number(it.qty) || 1), price: Number(it.price) || 0 }))
      .filter((it) => it.name || it.price)
    onSave({
      date,
      vendor: vendor.trim() || 'Supplies',
      method,
      notes: notes.trim(),
      items: cleanItems,
      delivery: Number(delivery) || 0,
      amount: total, // total = items + delivery (used by all money summaries)
    })
  }

  return (
    <Modal
      wide
      title={initial ? 'Edit Expense' : 'New Expense'}
      subtitle="Add each thing you bought with its price, plus delivery — the total adds up for you."
      onClose={onClose}
      footer={<>
        <button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn text-white" style={{ background: 'var(--cc-rose,#e0617a)' }} onClick={submit}>Save</button>
      </>}
    >
      <div className="row g-3">
        <div className="col-12 col-sm-4"><label className="form-label small fw-semibold">Date</label>
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="col-12 col-sm-5"><label className="form-label small fw-semibold">Bought from (shop / venue)</label>
          <input className="form-control" placeholder="e.g. Blinkit, D-Mart…" value={vendor} onChange={(e) => setVendor(e.target.value)} /></div>
        <div className="col-12 col-sm-3"><label className="form-label small fw-semibold">Paid from</label>
          <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="Cash">Cash</option><option value="Online">Online</option>
          </select></div>

        <div className="col-12">
          <div className="cc-oitems__head">
            <label className="form-label small fw-semibold mb-0">Items</label>
            <button type="button" className="cc-oadd" onClick={addItem}
              aria-label="Add item" title="Add item"><FiPlus /></button>
          </div>
          <div className="cc-exp-row cc-exp-row--head">
            <span className="cc-exp-name">Item</span>
            <span className="cc-exp-qty">Qty</span>
            <span className="cc-exp-rate">₹ each</span>
            <span className="cc-exp-total">Total</span>
            <span className="cc-exp-del" />
          </div>
          {/* Past six, the list scrolls inside the sheet — a long shopping trip
              used to push the delivery charge and the total off the bottom. */}
          <div ref={listRef} className={`d-flex flex-column gap-2${items.length > 6 ? ' cc-explist--scroll' : ''}`}>
            {items.map((it, i) => (
              <div className="cc-exp-row" key={i}>
                <input
                  className="form-control cc-exp-name" placeholder="e.g. Tropolite whipping cream"
                  value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)} spellCheck={false}
                />
                <input
                  type="number" min="1" className="form-control text-center cc-exp-qty" placeholder="Qty"
                  value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)}
                />
                <input
                  type="number" min="0" className="form-control text-center cc-exp-rate" placeholder="₹"
                  value={it.price} onChange={(e) => setItem(i, 'price', e.target.value)}
                />
                {/* What this one line came to. Five items at two figures each and
                    no line total meant checking the bill in your head. */}
                <span className="cc-exp-total">
                  {inr(Math.round((Number(it.qty) || 0) * (Number(it.price) || 0)))}
                </span>
                <button type="button" className="btn btn-light cc-exp-del" title="Remove item"
                  onClick={() => removeItem(i)} disabled={items.length === 1}>
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-6"><label className="form-label small fw-semibold">Delivery charge (₹)</label>
          <input type="number" min="0" className="form-control" placeholder="0" value={delivery} onChange={(e) => setDelivery(e.target.value)} /></div>
        <div className="col-6"><label className="form-label small fw-semibold">Total</label>
          <div className="form-control" style={{ background: '#fff4f7', fontWeight: 700, color: '#b23b3b', fontSize: 18 }}>{inr(total)}</div></div>

        <div className="col-12"><label className="form-label small fw-semibold">Notes</label>
          <input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" /></div>
      </div>
    </Modal>
  )
}
