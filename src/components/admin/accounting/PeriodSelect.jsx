import { monthLabel } from '../../../utils/adminDate.js'

// Date scope shared by the Orders and Expenses lists — this is a *daily* book,
// so the common case is "what happened today", not "all 224 rows".
// value: 'all' | 'today' | 'YYYY-MM'.
export default function PeriodSelect({ value, onChange, months = [] }) {
  return (
    <div className="d-flex align-items-center gap-1">
      <span className="small text-muted me-1">Dates</span>
      <select
        className="form-select form-select-sm"
        style={{ width: 'auto', borderColor: value === 'all' ? undefined : 'var(--cc-rose,#e0617a)' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All dates</option>
        <option value="today">Today</option>
        {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
      </select>
    </div>
  )
}
