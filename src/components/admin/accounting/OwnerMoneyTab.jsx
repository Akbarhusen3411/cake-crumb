import { useMemo, useState } from 'react'
import { FiArrowDownLeft, FiArrowUpRight, FiEdit2, FiTrash2 } from 'react-icons/fi'
import Modal from '../Modal.jsx'
import FilterChips from './FilterChips.jsx'
import { ACC, addDocRec, updateDocRec, deleteDocRec } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { todayIso, fmtDate } from '../../../utils/adminDate.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'

// The owner's own money moving in and out of the bakery. Both live in
// acc_withdrawals, told apart by `direction` — a row without one is 'out',
// which is what every row meant before investing was a thing.
const IN = 'in'
const OUT = 'out'
const dirOf = (w) => (w.direction === IN ? IN : OUT)

const DIR_FILTERS = [
  { key: 'all', label: 'All' },
  { key: IN, label: 'Money in' },
  { key: OUT, label: 'Money out' },
]
const METHOD_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Cash', label: 'Cash' },
  { key: 'Online', label: 'Online' },
]

const IN_INK = '#1b7f5e'
const OUT_INK = '#7a5bb0'

export default function OwnerMoneyTab({ withdrawals, reload }) {
  const [q, setQ] = useState('')
  const [dirFilter, setDirFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [editing, setEditing] = useState(null) // row, or { direction } for new
  const [busy, setBusy] = useState(false)
  const mobile = useIsMobile()

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    let list = [...withdrawals].sort((a, b) => String(b.date).localeCompare(String(a.date)))
    if (s) list = list.filter((w) => String(w.notes || '').toLowerCase().includes(s))
    if (dirFilter !== 'all') list = list.filter((w) => dirOf(w) === dirFilter)
    if (methodFilter !== 'all') list = list.filter((w) => w.method === methodFilter)
    return list
  }, [withdrawals, q, dirFilter, methodFilter])

  const filtered = dirFilter !== 'all' || methodFilter !== 'all' || q.trim() !== ''
  const totals = useMemo(() => {
    let put = 0, took = 0
    for (const w of rows) {
      const a = Number(w.amount) || 0
      if (dirOf(w) === IN) put += a; else took += a
    }
    return { put, took }
  }, [rows])

  async function save(data) {
    setBusy(true)
    if (editing?.id) await updateDocRec(ACC.WITHDRAWALS, editing.id, data)
    else await addDocRec(ACC.WITHDRAWALS, data)
    setEditing(null); await reload(); setBusy(false)
  }
  async function remove(w) {
    const what = dirOf(w) === IN ? 'money you put in' : 'money you took out'
    if (!window.confirm(`Delete this entry?\n${inr(w.amount)} — ${what}${w.notes ? ` (${w.notes})` : ''}`)) return
    setBusy(true); await deleteDocRec(ACC.WITHDRAWALS, w.id); await reload(); setBusy(false)
  }

  return (
    <div>
      <p className="text-muted small mb-3">
        Your <strong>own</strong> money moving in and out — not customer money.
        <strong> Money in</strong> is what you invest from your pocket; it raises Money in Hand but
        is not earnings. <strong>Money out</strong> is what you take for yourself; it lowers Money in
        Hand but is not a business cost. Neither one changes Profit.
        <br />
        Buying material is <strong>not</strong> recorded here — that goes in the Expenses tab.
      </p>

      <div className="cc-admin-toolbar d-flex flex-wrap gap-2 align-items-center mb-3">
        <button className="cc-admin-toolbar-btn btn text-white d-inline-flex align-items-center gap-2"
          style={{ background: IN_INK, whiteSpace: 'nowrap' }} onClick={() => setEditing({ direction: IN })}>
          <FiArrowDownLeft /> Put money in
        </button>
        <button className="cc-admin-toolbar-btn btn text-white d-inline-flex align-items-center gap-2"
          style={{ background: OUT_INK, whiteSpace: 'nowrap' }} onClick={() => setEditing({ direction: OUT })}>
          <FiArrowUpRight /> Take money out
        </button>
        <input
          className="form-control" style={{ maxWidth: 240 }}
          placeholder="Search reason…" value={q} onChange={(e) => setQ(e.target.value)}
        />
        <div className="cc-admin-count ms-auto text-end small">
          <div style={{ color: IN_INK, fontWeight: 700 }}>In {inr(totals.put)}</div>
          <div style={{ color: OUT_INK, fontWeight: 700 }}>Out {inr(totals.took)}</div>
        </div>
      </div>

      <div className="cc-admin-filters d-flex flex-wrap align-items-center gap-3 mb-3">
        <FilterChips label="Direction" options={DIR_FILTERS} value={dirFilter} onChange={setDirFilter} />
        <FilterChips label="Cash/Online" options={METHOD_FILTERS} value={methodFilter} onChange={setMethodFilter} />
        {filtered && (
          <button
            type="button" className="btn btn-sm btn-link text-secondary p-0"
            onClick={() => { setQ(''); setDirFilter('all'); setMethodFilter('all') }}
          >
            Clear filters
          </button>
        )}
        <span className="ms-auto text-muted small">{rows.length} entr{rows.length === 1 ? 'y' : 'ies'}</span>
      </div>

      {rows.length === 0 ? (
        <div className="text-center text-muted py-4" style={{ border: '1px solid #f0e0e3', borderRadius: 12 }}>
          {filtered ? 'No entries match these filters.' : 'Nothing yet. Use “Put money in” when you invest your own money.'}
        </div>
      ) : mobile ? (
        <div className="d-flex flex-column gap-2">
          {rows.map((w) => {
            const isIn = dirOf(w) === IN
            return (
              <div key={w.id} style={{ border: '1px solid #f0e0e3', borderRadius: 12, padding: 12, background: '#fff' }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-bold" style={{ color: isIn ? IN_INK : OUT_INK, fontSize: 18 }}>
                      {isIn ? '+' : '−'} {inr(w.amount)}
                    </div>
                    <div className="small text-muted">
                      {fmtDate(w.date)} · {isIn ? 'put in as' : 'taken from'} {w.method}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-light" onClick={() => setEditing(w)}><FiEdit2 /></button>
                    <button className="btn btn-sm btn-light text-danger" onClick={() => remove(w)}><FiTrash2 /></button>
                  </div>
                </div>
                {w.notes ? <div className="small mt-1" style={{ color: '#7a584d' }}>{w.notes}</div> : null}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="table-responsive" style={{ borderRadius: 12, border: '1px solid #f0e0e3' }}>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: 14 }}>
            <thead style={{ background: '#f9eef1' }}>
              <tr style={{ color: '#7a4a58' }}>
                <th>Date</th><th>In / Out</th><th className="text-end">Amount</th>
                <th className="text-center">Cash/Online</th><th>Reason</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => {
                const isIn = dirOf(w) === IN
                return (
                  <tr key={w.id}>
                    <td className="text-nowrap">{fmtDate(w.date)}</td>
                    <td style={{ color: isIn ? IN_INK : OUT_INK, fontWeight: 600 }}>
                      {isIn ? 'Money in' : 'Money out'}
                    </td>
                    <td className="text-end fw-semibold" style={{ color: isIn ? IN_INK : OUT_INK }}>
                      {isIn ? '+' : '−'} {inr(w.amount)}
                    </td>
                    <td className="text-center">{w.method}</td>
                    <td>{w.notes}</td>
                    <td className="text-nowrap text-end">
                      <button className="cc-row-action" style={{ color: '#cf3e63' }} title="Edit" onClick={() => setEditing(w)}><FiEdit2 /></button>
                      <button className="cc-row-action text-danger" title="Delete" onClick={() => remove(w)}><FiTrash2 /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {busy ? <div className="text-muted small mt-2">Saving…</div> : null}

      {editing !== null && (
        <OwnerMoneyForm initial={editing.id ? editing : null} direction={dirOf(editing)}
          onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function OwnerMoneyForm({ initial, direction, onSave, onClose }) {
  const isIn = direction === IN
  const [f, setF] = useState({
    date: initial?.date || todayIso(),
    amount: initial?.amount ?? '',
    method: initial?.method || 'Cash',
    notes: initial?.notes || '',
  })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  function submit() {
    if (!f.date) return alert('Please pick a date.')
    if ((Number(f.amount) || 0) <= 0) return alert('Amount must be more than 0.')
    onSave({
      date: f.date, amount: Number(f.amount) || 0, method: f.method,
      notes: f.notes.trim(), direction,
    })
  }
  return (
    <Modal
      title={isIn ? 'Put money in' : 'Take money out'}
      subtitle={isIn
        ? 'Your own money going into the bakery — it is not earnings.'
        : 'Money taken out for personal / home use — it is not a business cost.'}
      onClose={onClose}
      footer={<>
        <button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn text-white" style={{ background: isIn ? IN_INK : OUT_INK }} onClick={submit}>Save</button>
      </>}
    >
      <div className="row g-3">
        <div className="col-6"><label className="form-label small fw-semibold">Date</label>
          <input type="date" className="form-control" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div className="col-6"><label className="form-label small fw-semibold">Amount (₹)</label>
          <input type="number" min="0" className="form-control" value={f.amount} onChange={(e) => set('amount', e.target.value)} /></div>
        <div className="col-6"><label className="form-label small fw-semibold">{isIn ? 'Put in as' : 'Taken from'}</label>
          <select className="form-select" value={f.method} onChange={(e) => set('method', e.target.value)}>
            <option value="Cash">Cash</option><option value="Online">Online</option>
          </select></div>
        <div className="col-12"><label className="form-label small fw-semibold">Reason</label>
          <input className="form-control" value={f.notes} onChange={(e) => set('notes', e.target.value)}
            placeholder={isIn ? 'e.g. Starting money for August' : 'e.g. Household'} /></div>
      </div>
      {isIn ? (
        <p className="small text-muted mt-3 mb-0">
          Remember to record what you <strong>buy</strong> with this money in the Expenses tab —
          this entry only says the money came in.
        </p>
      ) : null}
    </Modal>
  )
}
