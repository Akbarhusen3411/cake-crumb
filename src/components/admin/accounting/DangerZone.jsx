import { useState } from 'react'
import { FiAlertTriangle, FiDownload } from 'react-icons/fi'
import { clearAccountingBooks, exportAccountingBackup } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'

// One-time tool for starting a fresh book. Deliberately tucked below everything
// else, collapsed, and gated on typing DELETE — it destroys the bakery's
// bookkeeping and there is no undo. Menu & Prices are never touched.
const CONFIRM_WORD = 'DELETE'

function downloadJson(obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cake-crumb-accounting-backup-${obj.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function DangerZone({ orders, expenses, withdrawals }) {
  const [open, setOpen] = useState(false)
  const [word, setWord] = useState('')
  const [busy, setBusy] = useState('')
  const [done, setDone] = useState(null)
  const [backedUp, setBackedUp] = useState(false)

  const total = orders.length + expenses.length + withdrawals.length
  const money = orders.reduce((s, o) => s + (Number(o.amount) || 0), 0)

  async function backup() {
    setBusy('backup')
    try {
      downloadJson(await exportAccountingBackup())
      setBackedUp(true)
    } finally { setBusy('') }
  }

  async function wipe() {
    if (word.trim().toUpperCase() !== CONFIRM_WORD) return
    setBusy('wipe')
    try {
      const res = await clearAccountingBooks()
      setDone(res)
      setWord('')
    } finally { setBusy('') }
  }

  return (
    <div className="mt-5 pt-3" style={{ borderTop: '1px solid #f0e0e3' }}>
      <button
        type="button" onClick={() => setOpen((v) => !v)}
        className="btn btn-sm btn-link text-secondary p-0"
        style={{ textDecoration: 'none' }}
      >
        {open ? '▾' : '▸'} Danger zone
      </button>

      {open && (
        <div className="mt-2 p-3" style={{ border: '1px solid #f0c9c9', background: '#fff8f7', borderRadius: 12 }}>
          <div className="d-flex align-items-start gap-2 mb-3">
            <FiAlertTriangle className="flex-shrink-0 mt-1" style={{ color: '#c23a2b' }} />
            <div className="small" style={{ color: '#7a584d' }}>
              <strong>Start a fresh book.</strong> Deletes every order, expense and money-taken-out
              entry from the cloud and from every device — <strong>{total} entries</strong>
              {money > 0 ? <> covering {inr(money)} of orders</> : null}. <strong>Menu &amp; Prices
              are kept.</strong> The old “expense taken for use” note is reset to ₹0. This cannot be undone.
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={backup} disabled={!!busy}>
              <FiDownload /> {busy === 'backup' ? 'Preparing…' : 'Download backup first'}
            </button>
            {backedUp ? <span className="small" style={{ color: '#1b7f5e' }}>✓ Backup saved to your Downloads folder</span> : null}
          </div>

          <hr style={{ borderColor: '#f0d9d9' }} />

          {done ? (
            <div className="small" style={{ color: '#1b7f5e' }}>
              ✓ Cleared. {Object.entries(done).map(([k, v]) => `${k}: ${v.deleted}`).join(' · ')}
              {Object.values(done).some((v) => v.error)
                ? <div className="text-danger mt-1">Some deletes failed — see the warning banner at the top.</div>
                : <div className="text-muted mt-1">The other PC will empty on its own within a second.</div>}
            </div>
          ) : (
            <>
              <label className="small d-block mb-1" style={{ color: '#7a584d' }}>
                Type <strong>{CONFIRM_WORD}</strong> to confirm:
              </label>
              <div className="d-flex flex-wrap gap-2">
                <input
                  className="form-control form-control-sm" style={{ maxWidth: 180 }}
                  value={word} onChange={(e) => setWord(e.target.value)} placeholder={CONFIRM_WORD}
                  autoComplete="off"
                />
                <button
                  className="btn btn-sm text-white"
                  style={{ background: word.trim().toUpperCase() === CONFIRM_WORD ? '#c23a2b' : '#d9b5b5' }}
                  disabled={word.trim().toUpperCase() !== CONFIRM_WORD || !!busy}
                  onClick={wipe}
                >
                  {busy === 'wipe' ? 'Clearing…' : `Delete ${total} entries`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
