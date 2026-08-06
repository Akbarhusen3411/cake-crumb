import { useMemo, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiRepeat, FiFileText, FiCopy, FiDownload } from 'react-icons/fi'
import OrderForm from './OrderForm.jsx'
import FilterChips from './FilterChips.jsx'
import PeriodSelect from './PeriodSelect.jsx'
import InvoiceModal from '../InvoiceModal.jsx'
import {
  ACC, addDocRec, updateDocRec, deleteDocRec, orderTotal, orderQty, monthsFrom,
  nextOrderNo, orderSortKey,
} from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { fmtDate, inPeriod, todayIso } from '../../../utils/adminDate.js'
import { orderLines, fullItem, oneLine, displayVariant, variantLabel } from '../../../utils/orderItems.js'
import { buildAccountingInvoice } from '../../../utils/invoice.js'
import { downloadCsv } from '../../../utils/csv.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'

// Compact one-string summary — used where a list can't go (the delete confirm).
const itemsLabel = (o, withQty) => {
  const parts = orderLines(o).map((it) => oneLine(it, withQty))
  return parts.length <= 2 ? parts.join(', ') : `${parts.slice(0, 2).join(', ')} +${parts.length - 2} more`
}

/**
 * Every item on its own line with what it came to.
 *
 * It used to read "Chocolate Sponge Cake — Tub, Red Velvet Sponge Cake — Tub +5
 * more" against one order total, so the only way to see what a single item cost
 * was to open the order. The row's Total column still holds the order's total —
 * these add up to it.
 */
const ItemLines = ({ order }) => (
  <div className="cc-items-cell">
    {orderLines(order).filter((it) => it.item || it.category).map((it, i) => {
      const qty = Number(it.qty) || 0
      const rate = Number(it.unitPrice) || 0
      return (
        <div className="cc-item-line" key={i}>
          <span className="cc-item-line__name">{oneLine(it)}</span>
          <span className="cc-item-line__qty">{qty} × {inr(rate)}</span>
          <span className="cc-item-line__amt">{inr(Math.round(qty * rate))}</span>
        </div>
      )
    })}
  </div>
)
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
// "What's still to bake" was the one daily question the filters couldn't answer.
// Matched on the lower-cased status, so rows typed before the select existed
// ("completed", "Completed") land in the same bucket.
const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]
const statusKey = (o) => String(o?.status || '').trim().toLowerCase()

const isBankable = (o) => o.paid && o.method === 'Online'
// The amount takes the colour of its Paid badge — a green figure beside an
// orange "Unpaid" chip read as money the bakery already had.
const PAID_INK = '#1d7a44'
const UNPAID_INK = '#a5591b'
const amountInk = (o) => (o.paid ? PAID_INK : UNPAID_INK)
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

// `preset` arrives from the Dashboard ("still to collect" opens the unpaid ones).
// The tab mounts fresh on every switch, so it's read in the state initialisers.
export default function OrdersTab({ orders, menu, reload, preset = null }) {
  const [q, setQ] = useState('')
  const [payFilter, setPayFilter] = useState(preset?.pay || 'all')     // all | paid | unpaid
  const [methodFilter, setMethodFilter] = useState('all') // all | Cash | Online
  const [statusFilter, setStatusFilter] = useState(preset?.status || 'all') // all | a status
  const [period, setPeriod] = useState(preset?.period || 'all')        // all | today | YYYY-MM
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
    if (statusFilter !== 'all') list = list.filter((o) => statusKey(o) === statusFilter)
    if (period !== 'all') list = list.filter((o) => inPeriod(o.date, period))
    return list
  }, [orders, q, payFilter, methodFilter, statusFilter, period])

  const filtered = payFilter !== 'all' || methodFilter !== 'all' || statusFilter !== 'all'
    || period !== 'all' || q.trim() !== ''
  // Total of what's on screen — handy when filtering to "Unpaid" or "Cash".
  // Cancelled orders are left out, because computeSummary drops them too and the
  // same screen quoting two different totals is worse than either number.
  const rowsTotal = useMemo(
    () => rows.filter((o) => statusKey(o) !== 'cancelled').reduce((s, o) => s + orderTotal(o), 0),
    [rows]
  )
  const cancelledShown = rows.filter((o) => statusKey(o) === 'cancelled').length

  // What each customer still owes, across every one of their orders — so a name
  // carries its debt even on a row that's paid. Keyed case-insensitively, the
  // same way the customer list dedupes.
  const owedByCustomer = useMemo(() => {
    const m = new Map()
    for (const o of orders) {
      if (o.paid || statusKey(o) === 'cancelled') continue
      const key = String(o.customer || '').trim().toLowerCase()
      if (!key) continue
      m.set(key, (m.get(key) || 0) + orderTotal(o))
    }
    return m
  }, [orders])
  // Hidden when this unpaid row *is* the whole debt — repeating its own amount
  // beside it says nothing.
  const owedBesides = (o) => {
    const owes = owedByCustomer.get(String(o.customer || '').trim().toLowerCase()) || 0
    return owes > 0 && !(!o.paid && owes === orderTotal(o)) ? owes : 0
  }

  // What today looks like, before any filter — this is a daily book, and every
  // other figure on the page is a month or all time.
  const today = todayIso()
  const todayStats = useMemo(() => {
    const t = { count: 0, received: 0, toCollect: 0 }
    for (const o of orders) {
      if (String(o.date || '').slice(0, 10) !== today) continue
      if (statusKey(o) === 'cancelled') continue
      t.count++
      if (o.paid) t.received += orderTotal(o); else t.toCollect += orderTotal(o)
    }
    return t
  }, [orders, today])

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
  // Same customer, same items, today's date, no id and no number — so save()
  // treats it as new and `nextOrderNo` hands it the next one. Everything else is
  // copied as it stands and can be changed in the form before saving; a repeat
  // customer's second order is the same order.
  function duplicate(o) {
    setEditing({ ...o, id: undefined, orderNo: undefined, date: todayIso(), copyOf: o.orderNo || '' })
  }

  /**
   * The rows on screen, filters and all — the count beside the button is what
   * lands in the file.
   *
   * **One line per item**, with the order's own fields repeated down its lines
   * so any column can be filtered or pivoted on its own. `Order total` is
   * written on an order's **first line only**, so the column still adds up to
   * the same figure as the Amount column instead of multiplying by the number
   * of items. A closing TOTAL row matches what the screen says — cancelled
   * orders are exported but left out of it, exactly as `computeSummary` does.
   */
  function exportCsv() {
    const out = []
    let qtySum = 0, amountSum = 0, orderSum = 0, receivedSum = 0, toCollectSum = 0
    for (const o of rows) {
      const counts = statusKey(o) !== 'cancelled'
      const lines = orderLines(o).filter((it) => it.item || it.category)
      const total = orderTotal(o)
      ;(lines.length ? lines : [{}]).forEach((it, i) => {
        const qty = Number(it.qty) || 0
        const rate = Number(it.unitPrice) || 0
        const amount = Math.round(qty * rate)
        if (counts) { qtySum += qty; amountSum += amount }
        out.push([
          o.orderNo || '', o.date || '', o.customer || '',
          it.category || '', it.item || '', variantLabel(it.variant || ''),
          qty, rate, amount,
          i === 0 ? total : '',
          o.paid ? 'Paid' : 'Unpaid', o.method || '', o.status || '',
          i === 0 ? (o.notes || '') : '',
        ])
      })
      if (counts) {
        orderSum += total
        if (o.paid) receivedSum += total; else toCollectSum += total
      }
    }
    // The Total column mixes paid and unpaid, so its raw sum is what was
    // *invoiced*, not what came in. Split it the same way the Dashboard does —
    // Earnings is money received, and Earnings + Still to collect = TOTAL — or
    // the file quotes a figure the books never claimed.
    out.push(['TOTAL — cancelled excluded', '', '', '', '', '', qtySum, '', amountSum, orderSum, '', '', '', ''])
    out.push(['EARNINGS — paid orders only', '', '', '', '', '', '', '', '', receivedSum, '', '', '', ''])
    out.push(['STILL TO COLLECT — unpaid', '', '', '', '', '', '', '', '', toCollectSum, '', '', '', ''])
    downloadCsv(
      `cake-crumb-orders-${todayIso()}.csv`,
      ['Order ID', 'Date', 'Customer', 'Category', 'Item', 'Size', 'Qty', 'Rate', 'Amount',
        'Order total', 'Payment', 'Cash/Online', 'Status', 'Notes'],
      out
    )
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
      {/* Today, before any filter. Cancelled orders are left out, same as every
          other figure in the book. */}
      <div className="cc-today">
        <span className="cc-today__label">Today</span>
        {todayStats.count ? (
          <>
            <span className="cc-today__stat">
              <b>{todayStats.count}</b> order{todayStats.count === 1 ? '' : 's'}
            </span>
            <span className="cc-today__stat">
              Received <b style={{ color: PAID_INK }}>{inr(todayStats.received)}</b>
            </span>
            {todayStats.toCollect > 0 ? (
              <span className="cc-today__stat">
                To collect <b style={{ color: UNPAID_INK }}>{inr(todayStats.toCollect)}</b>
              </span>
            ) : null}
          </>
        ) : (
          <span className="cc-today__stat text-muted">Nothing written down yet.</span>
        )}
        <button type="button" className="cc-today__btn"
          onClick={() => { setPeriod(period === 'today' ? 'all' : 'today'); setPage(1) }}>
          {period === 'today' ? 'Show all dates' : 'Show only today'}
        </button>
      </div>

      <div className="cc-admin-toolbar d-flex flex-wrap gap-2 align-items-center mb-3">
        <button className="cc-admin-toolbar-btn btn text-white d-inline-flex align-items-center gap-2" style={{ background: 'var(--cc-rose,#e0617a)', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => setEditing({})}>
          <FiPlus /> New Order
        </button>
        <input
          className="form-control" style={{ maxWidth: 280 }}
          placeholder="Search order ID, customer or item…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }}
        />
        <button className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
          onClick={exportCsv} disabled={!rows.length} title="Download what's on screen as a spreadsheet">
          <FiDownload /> CSV
        </button>
        <span className="cc-admin-count ms-auto text-muted small">
          {rows.length} order{rows.length === 1 ? '' : 's'}
          {filtered && rows.length > 0 ? ` · ${inr(rowsTotal)}` : ''}
          {cancelledShown > 0 ? ` · ${cancelledShown} cancelled, not counted` : ''}
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
        <FilterChips
          label="Status" options={STATUS_FILTERS} value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1) }}
        />
        <PeriodSelect value={period} months={months} onChange={(v) => { setPeriod(v); setPage(1) }} />
        {filtered && (
          <button
            type="button" className="btn btn-sm btn-link text-secondary p-0"
            onClick={() => {
              setQ(''); setPayFilter('all'); setMethodFilter('all')
              setStatusFilter('all'); setPeriod('all'); setPage(1)
            }}
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
            <div key={o.id}
              className={statusKey(o) === 'cancelled' ? 'cc-card-cancelled' : undefined}
              style={{
                border: '1px solid #f0e0e3', borderRadius: 12, padding: 12,
                background: statusKey(o) === 'cancelled' ? '#fafafa' : (o.paid ? '#fff' : '#fff7ec'),
              }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <OrderNo value={o.orderNo} size={12} />
                  <button type="button" className="cc-name-link fw-bold" style={{ color: '#5b3e36' }}
                    title={`Show ${o.customer}'s orders`}
                    onClick={() => { setQ(o.customer || ''); setPage(1) }}>
                    {o.customer}
                  </button>
                  {owedBesides(o) ? (
                    <span className="cc-owes" title="Unpaid across all of this customer's orders">
                      Owes {inr(owedBesides(o))}
                    </span>
                  ) : null}
                  <div className="small text-muted">
                    {fmtDate(o.date)} · {o.method} ·{' '}
                    <span style={{ color: statusInk(o.status), fontWeight: 600 }}>{o.status}</span>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold cc-amount" style={{ color: amountInk(o), fontSize: 18 }}>{inr(orderTotal(o))}</div>
                  <span className="badge" style={{ background: o.paid ? '#d6f5e0' : '#ffe1c2', color: o.paid ? '#1d7a44' : '#a5591b' }}>
                    {o.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
              <div className="mt-2" style={{ color: '#7a584d' }}><ItemLines order={o} /></div>
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
              {/* Icons only, centred. Three labelled buttons and one bare icon
                  sat unevenly against the right edge and ate the card's width;
                  the label is on the title/aria for anyone who needs it. */}
              <div className="cc-card-actions">
                <button className="cc-card-action" title={o.paid ? 'Mark unpaid' : 'Mark paid'}
                  aria-label={o.paid ? 'Mark unpaid' : 'Mark paid'} onClick={() => togglePaid(o)}><FiRepeat /></button>
                <button className="cc-card-action" title="Invoice" aria-label="Invoice"
                  onClick={() => setInvoiceOf(o)}><FiFileText /></button>
                <button className="cc-card-action" title="Duplicate — same items, today" aria-label="Duplicate"
                  onClick={() => duplicate(o)}><FiCopy /></button>
                <button className="cc-card-action" title="Edit" aria-label="Edit"
                  style={{ color: '#cf3e63' }} onClick={() => setEditing(o)}><FiEdit2 /></button>
                <button className="cc-card-action text-danger" title="Delete" aria-label="Delete"
                  onClick={() => remove(o)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── desktop: table ──
        // Ten rows deep, then it scrolls in place — the newest orders are at the
        // top, and the page below (Danger zone, the other tabs) stays reachable
        // without paging past a day's work.
        <div className="table-responsive cc-table-scroll" style={{ borderRadius: 12, border: '1px solid #f0e0e3' }}>
          {/* Ruled and centred — ten columns of left-aligned text with no
              vertical lines made it hard to keep a figure on its own row. */}
          <table className="table table-hover align-middle mb-0 cc-grid-table" style={{ fontSize: 14 }}>
            <thead style={{ background: '#f9eef1' }}>
              <tr style={{ color: '#7a4a58' }}>
                <th>Order&nbsp;ID</th><th>Date</th><th>Customer</th><th>Item</th><th>Qty</th>
                <th>Total</th><th>Paid</th>
                <th>Cash/Online</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((o) => (
                // Unpaid tints the whole row. It was set on the <tr>, where
                // Bootstrap's own cell background painted straight over it —
                // it has to land on the cells. Cancelled wins over unpaid: it
                // counts for nothing either way, so it shouldn't shout for money.
                <tr key={o.id} className={
                  statusKey(o) === 'cancelled' ? 'cc-row-cancelled' : (o.paid ? undefined : 'cc-row-unpaid')
                }>
                  <td><OrderNo value={o.orderNo} /></td>
                  <td className="text-nowrap">{fmtDate(o.date)}</td>
                  {/* Tapping a name searches for it — that customer's whole
                      history, and what they still owe, in one click. */}
                  <td>
                    <button type="button" className="cc-name-link" title={`Show ${o.customer}'s orders`}
                      onClick={() => { setQ(o.customer || ''); setPage(1) }}>
                      {o.customer}
                    </button>
                    {owedBesides(o) ? (
                      <span className="cc-owes" title="Unpaid across all of this customer's orders">
                        Owes {inr(owedBesides(o))}
                      </span>
                    ) : null}
                  </td>
                  <td><ItemLines order={o} /></td>
                  <td>{orderQty(o)}</td>
                  <td className="fw-semibold text-nowrap cc-amount" style={{ color: amountInk(o) }}>{inr(orderTotal(o))}</td>
                  <td>
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
                  <td className="text-nowrap">
                    <button className="cc-row-action text-secondary" title="Mark paid/unpaid" onClick={() => togglePaid(o)}><FiRepeat /></button>
                    <button className="cc-row-action text-secondary" title="Invoice" onClick={() => setInvoiceOf(o)}><FiFileText /></button>
                    <button className="cc-row-action text-secondary" title="Duplicate — same items, today" onClick={() => duplicate(o)}><FiCopy /></button>
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
          // Prefilled for an edit *and* for a duplicate; only the id says which.
          initial={editing.id || editing.items ? editing : null}
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
                // "Per piece" / "Per slice" are dropped — the Qty column already
                // says it. See displayVariant().
                sub: displayVariant(it.variant),
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
