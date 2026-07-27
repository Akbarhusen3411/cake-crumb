import { useEffect, useState } from 'react'
import { FiCloud, FiUploadCloud, FiRefreshCw, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi'
import { probeCloud, pushLocalToCloud, resetExcelImport, importExcelDataIfNeeded } from '../../../services/accounting.js'

// Firestore failures elsewhere in this app are silent by design (customers must
// never see a stack trace). On the admin page that silence is the bug: the
// dashboard renders cached localStorage rows whether or not the cloud has them,
// so the same account shows different totals on a laptop and a phone. This panel
// is the only place that reads the cloud WITHOUT the localStorage fallback.

const LABEL = {
  acc_orders: 'Orders',
  acc_expenses: 'Expenses',
  acc_withdrawals: 'Withdrawals',
  acc_menu: 'Menu items',
}

export default function CloudSyncPanel({ reload }) {
  const [rows, setRows] = useState(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState(null)

  async function probe() {
    setBusy('probe'); setMsg(null)
    try { setRows(await probeCloud()) } finally { setBusy('') }
  }

  useEffect(() => { probe() }, [])

  async function push() {
    setBusy('push'); setMsg(null)
    const res = await pushLocalToCloud()
    const total = Object.values(res.pushed || {}).reduce((a, b) => a + b, 0)
    setMsg(res.ok
      ? { kind: 'ok', text: `Uploaded ${total} records to Firestore. They will now show on every device.` }
      : { kind: 'err', text: `Upload failed — ${res.error}` })
    await probe()
    if (res.ok) await reload?.()
    setBusy('')
  }

  async function reimport() {
    setBusy('import'); setMsg(null)
    resetExcelImport()
    const res = await importExcelDataIfNeeded()
    setMsg(res?.error
      ? { kind: 'err', text: `Excel import failed — ${res.error}` }
      : { kind: 'ok', text: `Imported ${res?.orders ?? 0} orders and ${res?.expenses ?? 0} expenses.` })
    await probe()
    if (!res?.error) await reload?.()
    setBusy('')
  }

  const anyError = rows?.some((r) => r.error)
  const anyDrift = rows?.some((r) => r.error == null && r.cloud !== r.local)

  return (
    <div style={{ maxWidth: 560, margin: '28px auto 0' }}>
      <details style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', boxShadow: '0 4px 16px rgba(160,60,90,0.08)' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#7a4a58', listStyle: 'revert' }}>
          <FiCloud aria-hidden /> Cloud sync
          {rows == null ? null : anyError ? (
            <span className="ms-2 small" style={{ color: '#c23a2b' }}><FiAlertTriangle aria-hidden /> not saving to cloud</span>
          ) : anyDrift ? (
            <span className="ms-2 small" style={{ color: '#8a5d05' }}>this device differs from the cloud</span>
          ) : (
            <span className="ms-2 small" style={{ color: '#1d6f3a' }}><FiCheckCircle aria-hidden /> in sync</span>
          )}
        </summary>

        <p className="small text-muted mt-3 mb-2">
          “Cloud” is what Firestore returns right now — that is what the live site shows on any
          device. “This device” is the local copy in this browser only.
        </p>

        <table className="table table-sm align-middle mb-2" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr><th>Collection</th><th className="text-end">Cloud</th><th className="text-end">This device</th></tr>
          </thead>
          <tbody>
            {(rows || []).map((r) => (
              <tr key={r.coll}>
                <td>{LABEL[r.coll] || r.coll}</td>
                <td className="text-end">
                  {r.error
                    ? <span style={{ color: '#c23a2b' }} title={r.error}>error</span>
                    : <strong>{r.cloud}</strong>}
                </td>
                <td className="text-end">{r.local}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {anyError && (
          <div className="alert alert-danger py-2 small">
            Firestore rejected the read: <code>{rows.find((r) => r.error)?.error}</code>
            <div className="mt-1">
              <code>permission-denied</code> means the <code>acc_*</code> rules in the Firebase console
              aren’t matching — check they sit <em>inside</em> the
              <code> match /databases/&#123;database&#125;/documents</code> block. The snippet is in
              <code> ACCOUNTING_SETUP.md</code>.
            </div>
          </div>
        )}

        {msg && (
          <div className={`alert py-2 small ${msg.kind === 'ok' ? 'alert-success' : 'alert-danger'}`}>{msg.text}</div>
        )}

        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={probe} disabled={!!busy}>
            <FiRefreshCw aria-hidden /> {busy === 'probe' ? 'Checking…' : 'Re-check'}
          </button>
          <button className="btn btn-sm text-white" style={{ background: 'var(--cc-rose,#e0617a)' }} onClick={push} disabled={!!busy}>
            <FiUploadCloud aria-hidden /> {busy === 'push' ? 'Uploading…' : 'Upload this device → Cloud'}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={reimport} disabled={!!busy}>
            {busy === 'import' ? 'Importing…' : 'Re-run Excel import'}
          </button>
        </div>
        <p className="small text-muted mt-2 mb-0">
          Upload preserves Excel row ids, so running it twice does not duplicate those rows.
        </p>
      </details>
    </div>
  )
}
