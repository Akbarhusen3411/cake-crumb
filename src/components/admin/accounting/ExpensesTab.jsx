import { useMemo, useRef, useState } from 'react'
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiDownload,
  FiXCircle, FiArrowRight, FiDollarSign, FiSmartphone, FiMinus, FiAlertCircle,
} from 'react-icons/fi'
import Modal from '../Modal.jsx'
import UndoToast from './UndoToast.jsx'
import AddFab from './AddFab.jsx'
import { useUndo, withoutId } from './useUndo.js'
import FilterChips from './FilterChips.jsx'
import PeriodSelect from './PeriodSelect.jsx'
import { ACC, addDocRec, updateDocRec, deleteDocRec, monthsFrom } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { todayIso, fmtDate, inPeriod } from '../../../utils/adminDate.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'
import { downloadCsv } from '../../../utils/csv.js'
import { EXPENSE_CATS, catOf, catColor, spendByCat } from '../../../utils/expenseCats.js'

const CAT_FILTERS = [{ key: 'all', label: 'All' }, ...EXPENSE_CATS.map((c) => ({ key: c.key, label: c.key }))]

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

/** Names typed before, deduped on case and sorted — what the sheet suggests. */
const uniqueNames = (all) => {
  const seen = new Map()
  for (const raw of all) {
    const name = String(raw || '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (!seen.has(key)) seen.set(key, name)
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b))
}

export default function ExpensesTab({ expenses, reload }) {
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const savingRef = useRef(false)
  const { toast, offerUndo, closeToast } = useUndo(reload)
  const [page, setPage] = useState(1)
  const [methodFilter, setMethodFilter] = useState('all') // all | Cash | Online
  const [catFilter, setCatFilter] = useState('all')       // all | an EXPENSE_CATS key
  const [period, setPeriod] = useState('all')             // all | today | YYYY-MM
  const mobile = useIsMobile()

  const months = useMemo(() => monthsFrom(expenses), [expenses])
  // Deduped on case, the way the orders tab dedupes customers — "blinkit" and
  // "Blinkit" are one shop, and two entries in the list splits the history.
  const vendorNames = useMemo(() => uniqueNames(expenses.map((e) => e.vendor)), [expenses])
  const pastItemNames = useMemo(
    () => uniqueNames(expenses.flatMap((e) => (e.items || []).map((it) => it.name))),
    [expenses]
  )
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    let list = [...expenses].sort((a, b) => String(b.date).localeCompare(String(a.date)))
    if (s) list = list.filter((e) => searchText(e).includes(s))
    if (methodFilter !== 'all') list = list.filter((e) => e.method === methodFilter)
    if (catFilter !== 'all') list = list.filter((e) => catOf(e) === catFilter)
    if (period !== 'all') list = list.filter((e) => inPeriod(e.date, period))
    return list
  }, [expenses, q, methodFilter, catFilter, period])

  const filtered = methodFilter !== 'all' || catFilter !== 'all' || period !== 'all' || q.trim() !== ''
  // Where the money on screen went, by category — follows every other filter.
  const byCat = useMemo(() => spendByCat(rows), [rows])
  // Total follows the filter, so "Cash" answers "how much cash went out".
  const total = rows.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const pageSize = mobile ? 10 : 25
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const p = Math.min(page, pageCount)
  const pageRows = rows.slice((p - 1) * pageSize, p * pageSize)

  async function save(data) {
    // A ref, not `busy`: a fast double tap lands before the re-render that
    // would have disabled the button, and booked the expense twice.
    if (savingRef.current) return
    savingRef.current = true
    setBusy(true)
    try {
      if (editing?.id) await updateDocRec(ACC.EXPENSES, editing.id, data)
      else await addDocRec(ACC.EXPENSES, data)
      setEditing(null)
    } finally {
      setBusy(false)
      savingRef.current = false
    }
    reload() // not awaited — see OrdersTab
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
          e.date || '', e.vendor || '', catOf(e), it.name || '', qty, price, amount,
          i === 0 ? delivery : '', i === 0 ? total : '',
          e.method || '', i === 0 ? (e.notes || '') : '',
        ])
      })
      deliverySum += delivery
      expenseSum += total
    }
    out.push(['TOTAL', '', '', '', qtySum, '', amountSum, deliverySum, expenseSum, '', ''])
    downloadCsv(
      `cake-crumb-expenses-${todayIso()}.csv`,
      ['Date', 'Bought from', 'Category', 'Item', 'Qty', '₹ each', 'Amount', 'Delivery', 'Expense total', 'Paid from', 'Notes'],
      out
    )
  }

  async function remove(e) {
    if (!window.confirm(`Delete this expense?\n${e.vendor} — ${itemsSummary(e)} (${inr(e.amount)})`)) return
    setBusy(true); await deleteDocRec(ACC.EXPENSES, e.id); await reload(); setBusy(false)
    offerUndo(`Deleted · ${e.vendor || 'expense'} ${inr(e.amount)}`, () => addDocRec(ACC.EXPENSES, withoutId(e)))
  }

  return (
    <div>
      <div className="cc-admin-toolbar d-flex flex-wrap gap-2 align-items-center mb-2">
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

      <div className="cc-admin-filters d-flex flex-wrap align-items-center gap-3 mb-2">
        <FilterChips
          label="Paid from" options={METHOD_FILTERS} value={methodFilter}
          onChange={(v) => { setMethodFilter(v); setPage(1) }}
        />
        <FilterChips
          label="Category" options={CAT_FILTERS} value={catFilter}
          onChange={(v) => { setCatFilter(v); setPage(1) }}
        />
        <PeriodSelect value={period} months={months} onChange={(v) => { setPeriod(v); setPage(1) }} />
        {filtered && (
          <button
            type="button" className="btn btn-sm btn-link text-secondary p-0"
            onClick={() => { setQ(''); setMethodFilter('all'); setCatFilter('all'); setPeriod('all'); setPage(1) }}
          >
            Clear filters
          </button>
        )}
        <span className="ms-auto text-muted small">{rows.length} expense{rows.length === 1 ? '' : 's'}</span>
      </div>

      {/* Where it went: one bar split by category, and a legend that filters
          to its category on a tap. Only worth showing with two or more. */}
      {byCat.length > 1 ? (
        <div className="cc-expcats" aria-label="Spending by category">
          <div className="cc-expcats__bar" aria-hidden="true">
            {byCat.map((c) => (
              <i key={c.key} style={{ width: `${(c.amount / total) * 100}%`, background: c.color }} />
            ))}
          </div>
          <div className="cc-expcats__legend">
            {byCat.map((c) => (
              <button key={c.key} type="button" className="cc-expcats__item"
                onClick={() => { setCatFilter(c.key); setPage(1) }} title={`Show only ${c.key}`}>
                <i style={{ background: c.color }} />
                <span>{c.key}</span>
                <b>{inr(c.amount)}</b>
                <small>{Math.round((c.amount / total) * 100)}%</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="text-center text-muted py-4" style={{ border: '1px solid #f0e0e3', borderRadius: 12 }}>
          {filtered ? 'No expenses match these filters.' : 'No expenses yet. Click “New Expense”.'}
        </div>
      ) : mobile ? (
        // ── mobile: stacked cards ──
        // The same compact card as Orders: shop + total, then date · paid from,
        // one plain row per item, and the edit/delete icons on the meta line.
        <div className="cc-ocards">
          {pageRows.map((e) => {
            const items = (e.items || []).filter((it) => it.name || it.price)
            return (
              <article key={e.id} className="cc-ocard cc-ocard--expense">
                <div className="cc-ocard__row">
                  <button type="button" className="cc-name-link cc-ocard__name"
                    title={`Show what was bought from ${e.vendor}`}
                    onClick={() => { setQ(e.vendor || ''); setPage(1) }}>
                    {e.vendor || '—'}
                  </button>
                  <b className="cc-ocard__amt" style={{ color: '#b23b3b' }}>{inr(e.amount)}</b>
                </div>

                <div className="cc-ocard__row cc-ocard__meta">
                  <span className="cc-ocard__metatext">
                    <span className="cc-expcat"><i style={{ background: catColor(catOf(e)) }} />{catOf(e)}</span>
                    {' · '}{fmtDate(e.date)} · {e.method}
                    {Number(e.delivery) > 0 ? ` · incl. ${inr(e.delivery)} delivery` : ''}
                  </span>
                  <span className="cc-ocard__icons">
                    <button type="button" className="cc-ocard__ico cc-ocard__ico--edit" title="Edit"
                      aria-label="Edit" onClick={() => setEditing(e)}><FiEdit2 /></button>
                    <button type="button" className="cc-ocard__ico cc-ocard__ico--del" title="Delete"
                      aria-label="Delete" onClick={() => remove(e)}><FiTrash2 /></button>
                  </span>
                </div>

                {items.length ? (
                  <ul className="cc-ocard__items">
                    {items.map((it, i) => {
                      const qty = Number(it.qty) || 0
                      const rate = Number(it.price) || 0
                      return (
                        <li key={i}>
                          <span className="cc-ocard__iname">{it.name || '—'}</span>
                          <span className="cc-ocard__iqty">{qty} × {inr(rate)}</span>
                          {/* One item with no delivery is the total already, said at the top. */}
                          {items.length > 1 || Number(e.delivery) > 0 ? (
                            <b className="cc-ocard__iamt">{inr(Math.round(qty * rate))}</b>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
                {e.notes ? <p className="cc-ocard__note">{e.notes}</p> : null}
              </article>
            )
          })}
        </div>
      ) : (
        // ── desktop: table ──
        // Ruled, centred and ten rows deep before it scrolls — same as Orders.
        <div className="table-responsive cc-table-scroll" style={{ borderRadius: 12, border: '1px solid #f0e0e3' }}>
          <table className="table table-hover align-middle mb-0 cc-grid-table" style={{ fontSize: 14 }}>
            <thead style={{ background: '#f9eef1' }}>
              <tr style={{ color: '#7a4a58' }}>
                <th>Date</th><th>Bought from</th><th>Category</th><th>Items</th>
                <th>Delivery</th><th>Total</th>
                <th>Paid from</th><th></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((e) => (
                <tr key={e.id}>
                  <td className="text-nowrap">{fmtDate(e.date)}</td>
                  <td className="fw-semibold">{e.vendor}</td>
                  <td className="text-nowrap">
                    <span className="cc-expcat"><i style={{ background: catColor(catOf(e)) }} />{catOf(e)}</span>
                  </td>
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
        <ExpenseForm
          initial={editing.id ? editing : null}
          // Shops and things bought repeat week after week — the sheet offers
          // what has been typed before instead of asking for it again.
          vendors={vendorNames} itemNames={pastItemNames}
          saving={busy} onSave={save} onClose={() => setEditing(null)}
        />
      )}

      {mobile && editing === null ? <AddFab label="New expense" onClick={() => setEditing({})} /> : null}
      <UndoToast toast={toast} onClose={closeToast} />
    </div>
  )
}

/**
 * Add / edit an expense — the same workbench as the order sheet: the shopping
 * list takes the width and the height, and what is asked once (date, shop, how
 * it was paid, delivery) sits in a column beside it. A twenty-line grocery run
 * scrolls one list; the total and the Save button never move.
 */
function ExpenseForm({ initial, vendors = [], itemNames = [], saving = false, onSave, onClose }) {
  const [date, setDate] = useState(initial?.date || todayIso())
  const [vendor, setVendor] = useState(initial?.vendor || '')
  const [method, setMethod] = useState(initial?.method || 'Cash')
  // New expenses start on Ingredients, the usual answer; an old one without a
  // category opens on Other, which is how every total already counts it.
  const [category, setCategory] = useState(initial ? catOf(initial) : 'Ingredients')
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
    // The new line is below the fold once the list is scrolling — go to it.
    requestAnimationFrame(() => {
      const el = listRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }
  const removeItem = (i) => setItems((p) => (p.length === 1 ? p : p.filter((_, idx) => idx !== i)))

  const itemsTotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0)
  const total = itemsTotal + (Number(delivery) || 0)
  const named = items.filter((it) => it.name.trim() || Number(it.price) > 0)

  // Same as the order sheet: what's stopping a save, shown in the footer and
  // re-worked out as the form changes once Save has been pressed.
  function problem() {
    if (!date) return { field: 'date', msg: 'Pick a date.' }
    if (total <= 0) return { field: 'items', msg: 'Add at least one item price (or a delivery charge).' }
    return null
  }
  const [tried, setTried] = useState(false)
  const err = tried ? problem() : null

  function submit() {
    if (saving) return
    setTried(true)
    if (problem()) return
    const cleanItems = items
      .map((it) => ({ name: it.name.trim(), qty: Math.round(Number(it.qty) || 1), price: Number(it.price) || 0 }))
      .filter((it) => it.name || it.price)
    onSave({
      date,
      vendor: vendor.trim() || 'Supplies',
      category,
      method,
      notes: notes.trim(),
      items: cleanItems,
      delivery: Number(delivery) || 0,
      amount: total, // total = items + delivery (used by all money summaries)
    })
  }

  return (
    <Modal
      full
      flush
      icon="🧾"
      title={initial ? 'Edit Expense' : 'New Expense'}
      subtitle="Every thing bought on its own line — the total adds up for you."
      onClose={onClose}
      footer={<>
        {err ? <div className="cc-sheet__error" role="alert"><FiAlertCircle /> {err.msg}</div> : null}
        <div className="cc-sheet__foottotal cc-sheet__foottotal--spend me-auto">
          <span>Total spent</span>
          <b>{inr(total)}</b>
        </div>
        <button className="btn btn-light d-inline-flex align-items-center gap-2" onClick={onClose} disabled={saving}>
          Cancel <FiXCircle />
        </button>
        {/* Locked while saving, so a double tap can't book it twice. */}
        <button className="btn text-white d-inline-flex align-items-center gap-2"
          style={{ background: 'var(--cc-rose,#e0617a)', fontWeight: 600 }} onClick={submit}
          disabled={saving} aria-busy={saving || undefined}>
          {saving ? 'Saving…' : (initial ? 'Save changes' : 'Add Expense')} {saving ? null : <FiArrowRight />}
        </button>
      </>}
    >
      {/* Typed once, offered on every row — a browser datalist, so it costs one
          element for the whole list however many rows are open. */}
      <datalist id="cc-exp-items">
        {itemNames.map((n) => <option key={n} value={n} />)}
      </datalist>
      <datalist id="cc-exp-vendors">
        {vendors.map((n) => <option key={n} value={n} />)}
      </datalist>

      <div className="cc-sheet">
        <aside className="cc-sheet__side">
          <div className="cc-sheet__sidetitle">Expense details</div>

          <div className={`cc-field${err?.field === 'date' ? ' cc-field--bad' : ''}`}>
            <span className="cc-field__label">Date</span>
            <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="cc-field">
            <span className="cc-field__label">Bought from<i>shop / venue</i></span>
            <input className="form-control" list="cc-exp-vendors" placeholder="e.g. Blinkit, D-Mart…"
              value={vendor} onChange={(e) => setVendor(e.target.value)} spellCheck={false} />
          </div>
          {/* Pressed, like Paid from — six chips, one tap, and it's what splits
              the spending on the Expenses tab and in the Monthly Report. */}
          <div className="cc-field">
            <span className="cc-field__label">What for</span>
            <div className="cc-catpick" role="radiogroup" aria-label="Expense category">
              {EXPENSE_CATS.map((c) => (
                <button key={c.key} type="button" role="radio" aria-checked={category === c.key}
                  className={`cc-catpick__btn${category === c.key ? ' cc-catpick__btn--on' : ''}`}
                  style={{ '--cat': c.color }} onClick={() => setCategory(c.key)}>
                  <i aria-hidden="true" />{c.key}
                </button>
              ))}
            </div>
          </div>
          <div className="cc-field cc-field--half">
            <span className="cc-field__label">Paid from</span>
            <div className="cc-seg">
              {['Cash', 'Online'].map((m) => (
                <button key={m} type="button" className="cc-seg__btn" aria-pressed={method === m}
                  onClick={() => setMethod(m)}>
                  <span className="cc-seg__ico">{m === 'Cash' ? <FiDollarSign /> : <FiSmartphone />}</span>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="cc-field cc-field--half">
            <span className="cc-field__label">Delivery<i>₹</i></span>
            <input type="number" min="0" inputMode="decimal" className="form-control" placeholder="0"
              value={delivery} onChange={(e) => setDelivery(e.target.value)} />
          </div>
          <div className="cc-field">
            <span className="cc-field__label">Notes<i>optional</i></span>
            <input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything to remember…" />
          </div>

          {/* Items and delivery separately, because the delivery charge is part
              of the total but isn't one of the things bought. */}
          <div className="cc-ssum">
            <div className="cc-ssum__row"><span>Things bought</span><b>{named.length}</b></div>
            <div className="cc-ssum__row"><span>Items</span><b>{inr(itemsTotal)}</b></div>
            <div className="cc-ssum__row"><span>Delivery</span><b>{inr(Number(delivery) || 0)}</b></div>
            <div className="cc-ssum__grand cc-ssum__grand--spend">
              <span>Total spent</span><b>{inr(total)}</b>
            </div>
          </div>
        </aside>

        <section className={`cc-sheet__main${err?.field === 'items' ? ' cc-sheet__main--bad' : ''}`}>
          <div className="cc-sheet__panehead">
            <span className="cc-sheet__title">Shopping list</span>
            <span className="cc-sheet__hint">Press Enter on ₹ each for the next line</span>
          </div>

          <div className="cc-stable cc-stable--expense">
            <div className="cc-sline cc-sline--head">
              <span className="cc-sline__cell cc-sline__n">#</span>
              <span className="cc-sline__cell cc-sline__item">Item</span>
              <span className="cc-sline__cell cc-sline__qty">Qty</span>
              <span className="cc-sline__cell cc-sline__rate">₹ each</span>
              <span className="cc-sline__cell cc-sline__amt">Total</span>
              <span className="cc-sline__cell cc-sline__del" />
            </div>
            <div ref={listRef} className="cc-stable__scroll">
              {items.map((it, i) => (
                <div className="cc-sline" key={i}>
                  <div className="cc-sline__cell cc-sline__n">{i + 1}</div>
                  <div className="cc-sline__cell cc-sline__item">
                    <input
                      className="form-control form-control-sm" list="cc-exp-items"
                      placeholder="e.g. Tropolite whipping cream"
                      value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)} spellCheck={false}
                    />
                  </div>
                  <div className="cc-sline__cell cc-sline__qty">
                    <span className="cc-sline__cap">Qty</span>
                    {/* − / + show on a phone only, as on the order sheet. */}
                    <div className="cc-qty">
                      <button type="button" className="cc-qty__btn" aria-label="One less"
                        disabled={(Number(it.qty) || 0) <= 1}
                        onClick={() => setItem(i, 'qty', Math.max(1, (Number(it.qty) || 0) - 1))}>
                        <FiMinus />
                      </button>
                      <input type="number" min="1" inputMode="numeric" className="form-control form-control-sm" aria-label="Quantity"
                        value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} />
                      <button type="button" className="cc-qty__btn" aria-label="One more"
                        onClick={() => setItem(i, 'qty', (Number(it.qty) || 0) + 1)}>
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                  <div className="cc-sline__cell cc-sline__rate">
                    <span className="cc-sline__cap">₹ each</span>
                    <input type="number" min="0" inputMode="decimal" className="form-control form-control-sm" aria-label="Price each"
                      placeholder="0" value={it.price} onChange={(e) => setItem(i, 'price', e.target.value)}
                      // Enter finishes the line and opens the next one, so a long
                      // shopping trip is typed without reaching for the mouse.
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }} />
                  </div>
                  {/* What this one line came to. Five items at two figures each and
                      no line total meant checking the bill in your head. */}
                  <div className="cc-sline__cell cc-sline__amt">
                    <span className="cc-sline__cap">Total</span>
                    <span className="cc-sline__money cc-sline__money--spend">
                      {inr(Math.round((Number(it.qty) || 0) * (Number(it.price) || 0)))}
                    </span>
                  </div>
                  <div className="cc-sline__cell cc-sline__del">
                    {items.length > 1 ? (
                      <button type="button" className="cc-srow-del" title="Remove item"
                        aria-label={`Remove item ${i + 1}`} onClick={() => removeItem(i)}>
                        <FiX />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {/* Outside the scroller, so it stays under the last visible row. */}
            <button type="button" className="cc-saddrow" onClick={addItem}>
              <FiPlus /> Add item
            </button>
            <div className="cc-stotal cc-stotal--spend">
              <span>
                {named.length} item{named.length === 1 ? '' : 's'}
                {Number(delivery) > 0 ? ` · ${inr(Number(delivery))} delivery` : ''}
              </span>
              <b>{inr(total)}</b>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  )
}
