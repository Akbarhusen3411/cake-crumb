import { useMemo, useState } from 'react'
import { computeSummary, monthsFrom } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'

// Fixed figure (like the Excel cell). Tell me if this ever needs to change.
const EXPENSE_TAKEN_FOR_USE = 12300

function monthLabel(ym) {
  if (ym === 'ALL') return 'All time'
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// One label : amount line, like the Excel summary.
function Row({ label, value, color, sub, big, top }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16,
      padding: big ? '16px 0' : '11px 0',
      borderTop: top ? '2px solid #eccdd4' : '1px solid #f4e7ea',
    }}>
      <div>
        <div style={{ fontWeight: 700, color, fontSize: big ? 18 : 15 }}>{label}</div>
        {sub ? <div style={{ fontSize: 12, color: '#8a8a8a', marginTop: 2 }}>{sub}</div> : null}
      </div>
      <div style={{ fontWeight: 800, color, fontSize: big ? 28 : 20, whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  )
}

export default function DashboardTab({ orders, expenses, withdrawals }) {
  const months = useMemo(() => monthsFrom(orders, expenses, withdrawals), [orders, expenses, withdrawals])
  const [period, setPeriod] = useState('ALL')
  const sel = months.includes(period) ? period : 'ALL'
  const allTime = sel === 'ALL'

  const s = useMemo(
    () => computeSummary(orders, expenses, withdrawals, allTime ? null : sel),
    [orders, expenses, withdrawals, allTime, sel]
  )
  // Only PAID orders count as earnings (unpaid "to collect" and cancelled don't).
  const earnings = s.received
  const taken = allTime ? EXPENSE_TAKEN_FOR_USE : 0
  const moneyAtHand = earnings - taken
  const profit = earnings - s.totalExpenses

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h5 className="mb-0" style={{ color: '#7a4a58', fontFamily: 'var(--font-heading,serif)' }}>
          {monthLabel(sel)}
        </h5>
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">Show:</span>
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={sel} onChange={(e) => setPeriod(e.target.value)}>
            <option value="ALL">All time</option>
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: '8px 22px 18px', boxShadow: '0 4px 16px rgba(160,60,90,0.08)' }}>
        <Row label="Expenses" value={inr(s.totalExpenses)} color="#8a5bb0" />
        <Row label="Earnings (paid orders)" value={inr(earnings)} color="#3b7bb5" />

        {allTime && <Row top label="Expense Taken for Use" value={inr(taken)} color="#3a3a3a" />}

        {allTime && (
          <Row big label="Money At Hand" value={inr(moneyAtHand)} color="#c23a2b"
            sub={`Earnings ${inr(earnings)} − Taken for Use ${inr(taken)}`} />
        )}
        <Row big top={!allTime} label="Profit" value={inr(profit)} color="#2f6fb0"
          sub={`Earnings ${inr(earnings)} − Expenses ${inr(s.totalExpenses)}`} />
      </div>

      <div className="small text-muted mt-3 text-center">
        {s.orderCount} orders • {s.unpaidCount} unpaid ({inr(s.toCollect)} still to collect)
      </div>
      <div className="small text-muted mt-1 text-center">
        Only paid orders count as earnings. Unpaid &amp; cancelled are not counted — unpaid shows above as “still to collect”.
      </div>
    </div>
  )
}
