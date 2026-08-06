import { useMemo } from 'react'
import { FiDownload } from 'react-icons/fi'
import { computeSummary, monthsFrom } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { monthLabel, todayIso } from '../../../utils/adminDate.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'
import { downloadCsv } from '../../../utils/csv.js'

// One label/value stat inside a mobile month card.
function Stat({ label, value, strong, color }) {
  return (
    <div style={{ flex: '1 1 45%', minWidth: 110 }}>
      <div style={{ fontSize: 11, color: '#8a8a8a' }}>{label}</div>
      <div style={{ fontWeight: strong ? 800 : 600, color: color || '#5b3e36' }}>{value}</div>
    </div>
  )
}

export default function MonthlyTab({ orders, expenses, withdrawals }) {
  const mobile = useIsMobile()
  const months = useMemo(() => monthsFrom(orders, expenses, withdrawals), [orders, expenses, withdrawals])
  const rows = useMemo(
    () => months.map((m) => ({ m, s: computeSummary(orders, expenses, withdrawals, m) })),
    [months, orders, expenses, withdrawals]
  )

  // Money as numbers, months as "YYYY-MM" so a spreadsheet sorts them, and an
  // all-months TOTAL row so the file answers "the year so far" on its own.
  function exportCsv() {
    const out = rows.map(({ m, s }) =>
      [m, s.orderCount, s.invested, s.received, s.totalExpenses, s.totalWithdrawn, s.toCollect, s.profit])
    const sum = (i) => out.reduce((n, r) => n + (Number(r[i]) || 0), 0)
    out.push(['TOTAL', sum(1), sum(2), sum(3), sum(4), sum(5), sum(6), sum(7)])
    downloadCsv(
      `cake-crumb-monthly-${todayIso()}.csv`,
      ['Month', 'Orders', 'Invested', 'Earnings', 'Expenses', 'Taken out', 'To collect', 'Profit'],
      out
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-end mb-2">
        <button className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
          onClick={exportCsv} disabled={!rows.length} title="Download this table as a spreadsheet">
          <FiDownload /> CSV
        </button>
      </div>
      <p className="text-muted small mb-3">
        Every month totalled automatically. <strong>Profit = Earnings − Expenses</strong>, the same
        figure the Dashboard shows. Money you invest or take out is your own, so it changes neither
        earnings nor profit. An unpaid order counts only once the customer pays — until then it sits
        in “To Collect”.
      </p>

      {rows.length === 0 ? (
        <div className="text-center text-muted py-4" style={{ border: '1px solid #f0e0e3', borderRadius: 12 }}>No data yet.</div>
      ) : mobile ? (
        // ── mobile: one card per month ──
        <div className="d-flex flex-column gap-2">
          {rows.map(({ m, s }) => (
            <div key={m} style={{ border: '1px solid #f0e0e3', borderRadius: 12, padding: 14, background: '#fff' }}>
              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <div className="fw-bold" style={{ color: '#cf3e63', fontFamily: 'var(--font-heading,serif)' }}>{monthLabel(m)}</div>
                <div className="small text-muted">{s.orderCount} orders</div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Stat label="Invested" value={inr(s.invested)} color="#1b7f5e" />
                <Stat label="Earnings" value={inr(s.received)} />
                <Stat label="Expenses" value={inr(s.totalExpenses)} color="#b23b3b" />
                <Stat label="Taken out" value={inr(s.totalWithdrawn)} />
                <Stat label="To Collect" value={inr(s.toCollect)} color="#c67c17" />
                <Stat label="Profit" value={inr(s.profit)} strong color={s.profit >= 0 ? '#1b7f5e' : '#b23b3b'} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── desktop: table ──
        // Ruled, centred and scrolling at ten rows — same as Orders and Expenses.
        <div className="table-responsive cc-table-scroll" style={{ borderRadius: 12, border: '1px solid #f0e0e3' }}>
          <table className="table table-hover align-middle mb-0 cc-grid-table" style={{ fontSize: 14 }}>
            <thead style={{ background: '#f9eef1' }}>
              <tr style={{ color: '#7a4a58' }}>
                <th>Month</th><th>Orders</th>
                <th>Invested</th><th>Earnings</th>
                <th>Expenses</th><th>Taken out</th>
                <th>To Collect</th><th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ m, s }) => (
                <tr key={m}>
                  <td className="fw-semibold text-nowrap">{monthLabel(m)}</td>
                  <td>{s.orderCount}</td>
                  <td className="text-nowrap" style={{ color: '#1b7f5e' }}>{inr(s.invested)}</td>
                  <td className="text-nowrap">{inr(s.received)}</td>
                  <td className="text-nowrap" style={{ color: '#b23b3b' }}>{inr(s.totalExpenses)}</td>
                  <td className="text-nowrap">{inr(s.totalWithdrawn)}</td>
                  <td className="text-nowrap" style={{ color: '#c67c17' }}>{inr(s.toCollect)}</td>
                  <td className="fw-semibold text-nowrap" style={{ color: s.profit >= 0 ? '#1b7f5e' : '#b23b3b' }}>{inr(s.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
