import { useMemo } from 'react'
import { computeSummary, monthsFrom } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { monthLabel } from '../../../utils/adminDate.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'

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

  return (
    <div>
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
        <div className="table-responsive" style={{ borderRadius: 12, border: '1px solid #f0e0e3' }}>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: 14 }}>
            <thead style={{ background: '#f9eef1' }}>
              <tr style={{ color: '#7a4a58' }}>
                <th>Month</th><th className="text-center">Orders</th>
                <th className="text-end">Invested</th><th className="text-end">Earnings</th>
                <th className="text-end">Expenses</th><th className="text-end">Taken out</th>
                <th className="text-end">To Collect</th><th className="text-end">Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ m, s }) => (
                <tr key={m}>
                  <td className="fw-semibold">{monthLabel(m)}</td>
                  <td className="text-center">{s.orderCount}</td>
                  <td className="text-end" style={{ color: '#1b7f5e' }}>{inr(s.invested)}</td>
                  <td className="text-end">{inr(s.received)}</td>
                  <td className="text-end">{inr(s.totalExpenses)}</td>
                  <td className="text-end">{inr(s.totalWithdrawn)}</td>
                  <td className="text-end">{inr(s.toCollect)}</td>
                  <td className="text-end fw-semibold" style={{ color: s.profit >= 0 ? '#1b7f5e' : '#b23b3b' }}>{inr(s.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
