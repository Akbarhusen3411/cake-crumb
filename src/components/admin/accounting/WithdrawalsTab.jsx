import { useMemo, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import Modal from '../Modal.jsx'
import FilterChips from './FilterChips.jsx'
import { ACC, addDocRec, updateDocRec, deleteDocRec } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'

const METHOD_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Cash', label: 'Cash' },
  { key: 'Online', label: 'Online' },
]

const todayIso = () => new Date().toISOString().slice(0, 10)
const fmtDate = (iso) => {
  const d = new Date(iso)
  return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default function WithdrawalsTab({ withdrawals, reload }) {
  const [q, setQ] = useState('')
  const [methodFilter, setMethodFilter] = useState('all') // all | Cash | Online
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const mobile = useIsMobile()

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    let list = [...withdrawals].sort((a, b) => String(b.date).localeCompare(String(a.date)))
    if (s) list = list.filter((w) => String(w.notes || '').toLowerCase().includes(s))
    if (methodFilter !== 'all') list = list.filter((w) => w.method === methodFilter)
    return list
  }, [withdrawals, q, methodFilter])

  const filtered = methodFilter !== 'all' || q.trim() !== ''
  // Total follows the filter — "Cash" answers how much cash left the tin.
  const total = rows.reduce((s, w) => s + (Number(w.amount) || 0), 0)

  async function save(data) {
    setBusy(true)
    if (editing?.id) await updateDocRec(ACC.WITHDRAWALS, editing.id, data)
    else await addDocRec(ACC.WITHDRAWALS, data)
    setEditing(null); await reload(); setBusy(false)
  }
  async function remove(w) {
    if (!window.confirm(`Delete this entry?\n${inr(w.amount)} — ${w.notes}`)) return
    setBusy(true); await deleteDocRec(ACC.WITHDRAWALS, w.id); await reload(); setBusy(false)
  }

  return (
    <div>
      <p className="text-muted small mb-3">
        Money you took <strong>out</strong> of the bakery cash for personal / home use. It lowers
        Money&nbsp;in&nbsp;Hand but is not a business cost, so it does not change Profit.
      </p>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <button className="btn text-white" style={{ background: 'var(--cc-rose,#e0617a)' }} onClick={() => setEditing({})}>
          <FiPlus /> Take out money
        </button>
        <input
          className="form-control" style={{ maxWidth: 260 }}
          placeholder="Search reason…" value={q} onChange={(e) => setQ(e.target.value)}
        />
        <span className="ms-auto fw-semibold" style={{ color: '#7a5bb0' }}>
          {filtered ? 'Taken out (filtered)' : 'Total taken out'}: {inr(total)}
        </span>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <FilterChips label="Taken from" options={METHOD_FILTERS} value={methodFilter} onChange={setMethodFilter} />
        {filtered && (
          <button
            type="button" className="btn btn-sm btn-link text-secondary p-0"
            onClick={() => { setQ(''); setMethodFilter('all') }}
          >
            Clear filters
          </button>
        )}
        <span className="ms-auto text-muted small">{rows.length} entr{rows.length === 1 ? 'y' : 'ies'}</span>
      </div>

      {rows.length === 0 ? (
        <div className="text-center text-muted py-4" style={{ border: '1px solid #f0e0e3', borderRadius: 12 }}>
          {filtered ? 'No entries match these filters.' : 'Nothing taken out yet.'}
        </div>
      ) : mobile ? (
        <div className="d-flex flex-column gap-2">
          {rows.map((w) => (
            <div key={w.id} style={{ border: '1px solid #f0e0e3', borderRadius: 12, padding: 12, background: '#fff' }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold" style={{ color: '#7a5bb0', fontSize: 18 }}>{inr(w.amount)}</div>
                  <div className="small text-muted">{fmtDate(w.date)} · from {w.method}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-light" onClick={() => setEditing(w)}><FiEdit2 /></button>
                  <button className="btn btn-sm btn-light text-danger" onClick={() => remove(w)}><FiTrash2 /></button>
                </div>
              </div>
              {w.notes ? <div className="small mt-1" style={{ color: '#7a584d' }}>{w.notes}</div> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive" style={{ borderRadius: 12, border: '1px solid #f0e0e3' }}>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: 14 }}>
            <thead style={{ background: '#f9eef1' }}>
              <tr style={{ color: '#7a4a58' }}>
                <th>Date</th><th className="text-end">Amount</th><th className="text-center">Taken from</th><th>Reason</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id}>
                  <td className="text-nowrap">{fmtDate(w.date)}</td>
                  <td className="text-end fw-semibold">{inr(w.amount)}</td>
                  <td className="text-center">{w.method}</td>
                  <td>{w.notes}</td>
                  <td className="text-nowrap text-end">
                    <button className="btn btn-sm btn-link" style={{ color: '#cf3e63' }} onClick={() => setEditing(w)}><FiEdit2 /></button>
                    <button className="btn btn-sm btn-link text-danger" onClick={() => remove(w)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {busy ? <div className="text-muted small mt-2">Saving…</div> : null}

      {editing !== null && (
        <WithdrawalForm initial={editing.id ? editing : null} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function WithdrawalForm({ initial, onSave, onClose }) {
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
    onSave({ date: f.date, amount: Number(f.amount) || 0, method: f.method, notes: f.notes.trim() })
  }
  return (
    <Modal
      title={initial ? 'Edit' : 'Take out money'}
      subtitle="Record cash taken for personal use"
      onClose={onClose}
      footer={<>
        <button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn text-white" style={{ background: 'var(--cc-rose,#e0617a)' }} onClick={submit}>Save</button>
      </>}
    >
      <div className="row g-3">
        <div className="col-6"><label className="form-label small fw-semibold">Date</label>
          <input type="date" className="form-control" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div className="col-6"><label className="form-label small fw-semibold">Amount (₹)</label>
          <input type="number" min="0" className="form-control" value={f.amount} onChange={(e) => set('amount', e.target.value)} /></div>
        <div className="col-6"><label className="form-label small fw-semibold">Taken from</label>
          <select className="form-select" value={f.method} onChange={(e) => set('method', e.target.value)}>
            <option value="Cash">Cash</option><option value="Online">Online</option>
          </select></div>
        <div className="col-12"><label className="form-label small fw-semibold">Reason</label>
          <input className="form-control" value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="e.g. Household, personal use" /></div>
      </div>
    </Modal>
  )
}
