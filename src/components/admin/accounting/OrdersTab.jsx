import { useMemo, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiRepeat, FiFileText } from 'react-icons/fi'
import OrderForm from './OrderForm.jsx'
import FilterChips from './FilterChips.jsx'
import PeriodSelect from './PeriodSelect.jsx'
import InvoiceModal from '../InvoiceModal.jsx'
import {
  ACC, addDocRec, updateDocRec, deleteDocRec, orderTotal, orderQty, monthsFrom,
  nextOrderNo, orderSortKey,
} from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { fmtDate, inPeriod } from '../../../utils/adminDate.js'
import { orderLines, fullItem, oneLine } from '../../../utils/orderItems.js'
import { buildAccountingInvoice } from '../../../utils/invoice.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'

// Compact summary: first two items, then "+N more". withQty shows ×N per item
// (used on mobile where there's no separate Qty column; the desktop table only
// shows ×N for multi-item orders since it has its own Qty column).
const itemsLabel = (o, withQty) => {
  const parts = orderLines(o).map((it) => oneLine(it, withQty))
  return parts.length <= 2 ? parts.join(', ') : `${parts.slice(0, 2).join(', ')} +${parts.length - 2} more`
}
const PAY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'unpaid', label: 'Unpaid' },
]
const METHOD_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Cash', label: 'Cash' },
  { key: 'Online', label: 'Online' },
]

const isBankable = (o) => o.paid && o.method === 'Online'
// Statuses are the baker's own tracking — only "Cancelled" changes any figure
// (computeSummary drops it from sales). Colour them so a list of mostly-done
// orders doesn't bury the one still in the oven.
const STATUS_INK = {
  completed: '#1d7a44',
  'in progress': '#c67c17',
  pending: '#7a6b66',
  cancelled: '#b23b3b',
}
const statusInk = (s) => STATUS_INK[String(s || '').toLowerCase()] || '#7a6b66'
// Search the label the row actually shows, so "cake pop" matches a "Chocolate"
// cake pop the same way it matches a legacy "Red velvet cake pop". The order
// number is in here too — it's the fastest way to find one order out of a day.
const searchText = (o) =>
  [o.orderNo, o.customer, ...orderLines(o).map((it) => `${fullItem(it)} ${it.variant || ''}`)]
    .filter(Boolean).join(' ').toLowerCase()

// Rows entered before order numbering show a dash rather than a fake number.
// They pick one up the next time they're edited — see save().
const OrderNo = ({ value, size = 13 }) => (
  <span style={{
    fontFamily: 'var(--font-body, Lato), sans-serif',
    fontVariantNumeric: 'lining-nums tabular-nums',
    fontWeight: 700, fontSize: size, color: value ? '#a34a67' : '#c3b4b0', whiteSpace: 'nowrap',
  }}>
    {value || '—'}
  </span>
)

export default function OrdersTab({ orders, menu, reload }) {
  const [q, setQ] = useState('')
  const [payFilter, setPayFilter] = useState('all')     // all | paid | unpaid
  const [methodFilter, setMethodFilter] = useState('all') // all | Cash | Online
  const [period, setPeriod] = useState('all')           // all | today | YYYY-MM
  const [editing, setEditing] = useState(null) // order or {} for new
  const [invoiceOf, setInvoiceOf] = useState(null) // order being printed
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const mobile = useIsMobile()

  const months = useMemo(() => monthsFrom(orders), [orders])
  // Dedupe on case, not exact text — "makbul varisali" and "Makbul Varisali" are
  // one customer, and two entries in this list splits their history in the form.
  const customers = useMemo(() => {
    const seen = new Map()
    for (const o of orders) {
      const name = String(o.customer || '').trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (!seen.has(key)) seen.set(key, name)
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b))
  }, [orders])
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    // Newest first, and within a day by its own sequence — so the list reads in
    // the same order as the numbers the owner quotes.
    let list = [...orders].sort((a, b) => orderSortKey(b).localeCompare(orderSortKey(a)))
    if (s) list = list.filter((o) => searchText(o).includes(s))
    if (payFilter !== 'all') list = list.filter((o) => (payFilter === 'paid' ? !!o.paid : !o.paid))
    if (methodFilter !== 'all') list = list.filter((o) => o.method === methodFilter)
    if (period !== 'all') list = list.filter((o) => inPeriod(o.date, period))
    return list
  }, [orders, q, payFilter, methodFilter, period])

  const filtered = payFilter !== 'all' || methodFilter !== 'all' || period !== 'all' || q.trim() !== ''
  // Total of what's on screen — handy when filtering to "Unpaid" or "Cash".
  const rowsTotal = useMemo(() => rows.reduce((s, o) => s + orderTotal(o), 0), [rows])

  // pagination — 10 per page on mobile, 25 on desktop
  const pageSize = mobile ? 10 : 25
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const p = Math.min(page, pageCount)
  const pageRows = rows.slice((p - 1) * pageSize, p * pageSize)

  async function save(data) {
    setBusy(true)
    if (editing && editing.id) {
      // An existing number is never regenerated — it's this order's identity,
      // even if the date or the customer name is being corrected. Rows from
      // before numbering existed pick one up here, which is why there's no bulk
      // backfill to run.
      await updateDocRec(ACC.ORDERS, editing.id, {
        ...data, orderNo: editing.orderNo || nextOrderNo(orders, data.date, data.customer),
      })
    } else {
      await addDocRec(ACC.ORDERS, { ...data, orderNo: nextOrderNo(orders, data.date, data.customer) })
    }
    setEditing(null)
    await reload()
    setBusy(false)
  }
  async function togglePaid(o) {
    setBusy(true)
    await updateDocRec(ACC.ORDERS, o.id, { paid: !o.paid })
    await reload()
    setBusy(false)
  }
  // Mark an online payment as withdrawn from the bank to cash (or back).
  async function toggleWithdrawn(o) {
    setBusy(true)
    await updateDocRec(ACC.ORDERS, o.id, { withdrawn: !o.withdrawn })
    await reload()
    setBusy(false)
  }
  async function remove(o) {
    const ref = o.orderNo ? `${o.orderNo} · ` : ''
    if (!window.confirm(`Delete this order?\n${ref}${o.customer} — ${itemsLabel(o, true)} (${inr(orderTotal(o))})`)) return
    setBusy(true)
    await deleteDocRec(ACC.ORDERS, o.id)
    await reload()
    setBusy(false)
  }

  return (
    <div>
      <div className="cc-admin-toolbar d-flex flex-wrap gap-2 align-items-center mb-3">
        <button className="cc-admin-toolbar-btn btn text-white d-inline-flex align-items-center gap-2" style={{ background: 'var(--cc-rose,#e0617a)', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => setEditing({})}>
          <FiPlus /> New Order
        </button>
        <input
          className="form-control" style={{ maxWidth: 280 }}
          placeholder="Search order no, customer or item…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }}
        />
        <span className="cc-admin-count ms-auto text-muted small">
          {rows.length} order{rows.length === 1 ? '' : 's'}
          {filtered && rows.length > 0 ? ` · ${inr(rowsTotal)}` : ''}
        </span>
      </div>

      <div className="cc-admin-filters d-flex flex-wrap align-items-center gap-3 mb-3">
        <FilterChips
          label="Payment" options={PAY_FILTERS} value={payFilter}
          onChange={(v) => { setPayFilter(v); setPage(1) }}
        />
        <FilterChips
          label="Cash/Online" options={METHOD_FILTERS} value={methodFilter}
          onChange={(v) => { setMethodFilter(v); setPage(1) }}
        />
        <PeriodSelect value={period} months={months} onChange={(v) => { setPeriod(v); setPage(1) }} />
        {filtered && (
          <button
            type="button" className="btn btn-sm btn-link text-secondary p-0"
            onClick={() => { setQ(''); setPayFilter('all'); setMethodFilter('all'); setPeriod('all'); setPage(1) }}
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="small text-muted mb-3" style={{ marginTop: -6 }}>
        💡 For <strong>Online</strong> orders, tap <span style={{ color: '#c67c17', fontWeight: 700 }}>In bank</span> once
        you’ve taken that money out — it flips to <span style={{ color: '#1b7f5e', fontWeight: 700 }}>Taken to cash</span>,
        so you always know which online payments are still sitting in the bank.
      </p>

      {rows.length === 0 ? (
        <div className="text-center text-muted py-4" style={{ border: '1px solid #f0e0e3', borderRadius: 12 }}>
          {filtered ? 'No orders match these filters.' : 'No orders yet. Click “New Order”.'}
        </div>
      ) : mobile ? (
        // ── mobile: stacked cards ──
        <div className="d-flex flex-column gap-2">
          {pageRows.map((o) => (
            <div key={o.id} style={{ border: '1px solid #f0e0e3', borderRadius: 12, padding: 12, background: o.paid ? '#fff' : '#fff7ec' }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <OrderNo value={o.orderNo} size={12} />
                  <div className="fw-bold" style={{ color: '#5b3e36' }}>{o.customer}</div>
                  <div className="small text-muted">
                    {fmtDate(o.date)} · {o.method} ·{' '}
                    <span style={{ color: statusInk(o.status), fontWeight: 600 }}>{o.status}</span>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold" style={{ color: '#1b7f5e', fontSize: 18 }}>{inr(orderTotal(o))}</div>
                  <span className="badge" style={{ background: o.paid ? '#d6f5e0' : '#ffe1c2', color: o.paid ? '#1d7a44' : '#a5591b' }}>
                    {o.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
              <div className="small mt-1" style={{ color: '#7a584d' }}>{itemsLabel(o, true)}</div>
              {isBankable(o) && (
                <button
                  className="btn btn-sm mt-2" onClick={() => toggleWithdrawn(o)}
                  style={{ border: '1px solid', borderRadius: 999, fontSize: 12, padding: '2px 12px',
                    borderColor: o.withdrawn ? '#bfe3cd' : '#f0d3a8',
                    background: o.withdrawn ? '#eafaf0' : '#fff6e9',
                    color: o.withdrawn ? '#1b7f5e' : '#c67c17' }}
                >
                  {o.withdrawn ? '✓ Taken to cash' : 'In bank — tap when withdrawn'}
                </button>
              )}
              <div className="mt-2 d-flex gap-2 justify-content-end">
                <button className="btn btn-sm btn-light" onClick={() => togglePaid(o)}><FiRepeat /> {o.paid ? 'Unpaid' : 'Paid'}</button>
                <button className="btn btn-sm btn-light" onClick={() => setInvoiceOf(o)}><FiFileText /> Invoice</button>
                <button className="btn btn-sm btn-light" onClick={() => setEditing(o)}><FiEdit2 /> Edit</button>
                <button className="btn btn-sm btn-light text-danger" onClick={() => remove(o)}><FiTrash2 /></button>
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
                <th>Order&nbsp;no</th><th>Date</th><th>Customer</th><th>Item</th><th className="text-center">Qty</th>
                <th className="text-end">Total</th><th className="text-center">Paid</th>
                <th className="text-center">Cash/Online</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((o) => (
                <tr key={o.id} style={{ background: o.paid ? undefined : '#fff7ec' }}>
                  <td><OrderNo value={o.orderNo} /></td>
                  <td className="text-nowrap">{fmtDate(o.date)}</td>
                  <td>{o.customer}</td>
                  <td>{itemsLabel(o, orderLines(o).length > 1)}</td>
                  <td className="text-center">{orderQty(o)}</td>
                  <td className="text-end fw-semibold">{inr(orderTotal(o))}</td>
                  <td className="text-center">
                    <span className="badge" style={{ background: o.paid ? '#d6f5e0' : '#ffe1c2', color: o.paid ? '#1d7a44' : '#a5591b' }}>
                      {o.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div>{o.method}</div>
                    {isBankable(o) && (
                      <button onClick={() => toggleWithdrawn(o)} title="Money withdrawn from bank?"
                        style={{ marginTop: 3, border: '1px solid', borderRadius: 999, fontSize: 11, padding: '1px 8px', cursor: 'pointer',
                          borderColor: o.withdrawn ? '#bfe3cd' : '#f0d3a8',
                          background: o.withdrawn ? '#eafaf0' : '#fff6e9',
                          color: o.withdrawn ? '#1b7f5e' : '#c67c17' }}>
                        {o.withdrawn ? '✓ Taken to cash' : 'In bank'}
                      </button>
                    )}
                  </td>
                  <td style={{ color: statusInk(o.status), fontWeight: 600, whiteSpace: 'nowrap' }}>{o.status}</td>
                  <td className="text-nowrap text-end">
                    <button className="cc-row-action text-secondary" title="Mark paid/unpaid" onClick={() => togglePaid(o)}><FiRepeat /></button>
                    <button className="cc-row-action text-secondary" title="Invoice" onClick={() => setInvoiceOf(o)}><FiFileText /></button>
                    <button className="cc-row-action" style={{ color: '#cf3e63' }} title="Edit" onClick={() => setEditing(o)}><FiEdit2 /></button>
                    <button className="cc-row-action text-danger" title="Delete" onClick={() => remove(o)}><FiTrash2 /></button>
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
        <OrderForm
          menu={menu}
          customers={customers}
          initial={editing.id ? editing : null}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      {invoiceOf && (
        <InvoiceModal
          invoice={buildAccountingInvoice(invoiceOf, {
            lines: orderLines(invoiceOf)
              .filter((it) => it.item || it.category)
              .map((it) => ({
                label: fullItem(it),
                sub: it.variant,
                qty: Number(it.qty) || 0,
                rate: Number(it.unitPrice) || 0,
                amount: Math.round((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)),
              })),
            total: orderTotal(invoiceOf),
          })}
          onClose={() => setInvoiceOf(null)}
        />
      )}
    </div>
  )
}
