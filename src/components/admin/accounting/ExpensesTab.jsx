import { useMemo, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import Modal from '../Modal.jsx'
import FilterChips from './FilterChips.jsx'
import PeriodSelect from './PeriodSelect.jsx'
import { ACC, addDocRec, updateDocRec, deleteDocRec, monthsFrom } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { todayIso, fmtDate, inPeriod } from '../../../utils/adminDate.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'

const METHOD_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Cash', label: 'Cash' },
  { key: 'Online', label: 'Online' },
]

// A one-line summary of what an expense contained.
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
  async function remove(e) {
    if (!window.confirm(`Delete this expense?\n${e.vendor} — ${inr(e.amount)}`)) return
    setBusy(true); await deleteDocRec(ACC.EXPENSES, e.id); await reload(); setBusy(false)
  }

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <button className="btn text-white d-inline-flex align-items-center gap-2" style={{ background: 'var(--cc-rose,#e0617a)', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => setEditing({})}>
          <FiPlus /> New Expense
        </button>
        <input
          className="form-control" style={{ maxWidth: 280 }}
          placeholder="Search shop, item or note…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }}
        />
        <div className="ms-auto text-end" style={{ background: '#fdeef0', border: '1px solid #f3d3d8', borderRadius: 12, padding: '6px 16px' }}>
          <div style={{ fontSize: 11, color: '#a06', letterSpacing: 0.3, textTransform: 'uppercase' }}>
            {filtered ? 'Spent — filtered' : 'Total spent'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#c23a2b', lineHeight: 1.1 }}>{inr(total)}</div>
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
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
              <div className="small mt-1" style={{ color: '#7a584d' }}>{itemsSummary(e)}</div>
              {Number(e.delivery) > 0 && <div className="small text-muted">+ {inr(e.delivery)} delivery</div>}
              <div className="mt-2 d-flex gap-2 justify-content-end">
                <button className="btn btn-sm btn-light" onClick={() => setEditing(e)}><FiEdit2 /> Edit</button>
                <button className="btn btn-sm btn-light text-danger" onClick={() => remove(e)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── desktop: table ──
        <div className="table-responsive" style={{ borderRadius: 12, border: '1px solid #f0e0e3' }}>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: 14 }}>
            <thead style={{ background: '#f9eef1' }}>
              <tr style={{ color: '#7a4a58' }}>
                <th>Date</th><th>Bought from</th><th>Items</th>
                <th className="text-end">Delivery</th><th className="text-end">Total</th>
                <th className="text-center">Paid from</th><th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((e) => (
                <tr key={e.id}>
                  <td className="text-nowrap">{fmtDate(e.date)}</td>
                  <td className="fw-semibold">{e.vendor}</td>
                  <td style={{ maxWidth: 320 }}><span className="small text-muted">{itemsSummary(e)}</span></td>
                  <td className="text-end">{Number(e.delivery) > 0 ? inr(e.delivery) : '—'}</td>
                  <td className="text-end fw-semibold">{inr(e.amount)}</td>
                  <td className="text-center">{e.method}</td>
                  <td className="text-nowrap text-end">
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

  const setItem = (i, key, val) => setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)))
  const addItem = () => setItems((p) => [...p, { name: '', qty: 1, price: '' }])
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
          <label className="form-label small fw-semibold mb-1">Items</label>
          <div className="d-flex gap-2 mb-1" style={{ fontSize: 11, color: '#8a8a8a' }}>
            <span style={{ flex: 1 }}>Item</span>
            <span style={{ width: 64, textAlign: 'center' }}>Qty</span>
            <span style={{ width: 96, textAlign: 'center' }}>₹ each</span>
            <span style={{ width: 40 }} />
          </div>
          <div className="d-flex flex-column gap-2">
            {items.map((it, i) => (
              <div className="d-flex gap-2" key={i}>
                <input
                  className="form-control" style={{ flex: 1 }} placeholder="e.g. Tropolite whipping cream"
                  value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)}
                />
                <input
                  type="number" min="1" className="form-control text-center" style={{ width: 64 }} placeholder="Qty"
                  value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)}
                />
                <input
                  type="number" min="0" className="form-control" style={{ width: 96 }} placeholder="₹"
                  value={it.price} onChange={(e) => setItem(i, 'price', e.target.value)}
                />
                <button type="button" className="btn btn-light" title="Remove" onClick={() => removeItem(i)} disabled={items.length === 1}>
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={addItem}>
            <FiPlus /> Add item
          </button>
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
