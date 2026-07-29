import { useMemo, useState } from 'react'
import { computeSummary, monthsFrom } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { monthLabel } from '../../../utils/adminDate.js'

// Two-series categorical palette, validated against the #ffffff card surface
// (lightness band, chroma floor, CVD separation, normal-vision floor, contrast).
// Slot 1 is the brand rose so the dashboard still reads as Cake & Crumb.
const SERIES_SALES = '#cf3e63'
const SERIES_EXPENSES = '#6b5bb0'
const INK_MUTED = '#898781'
const INK_IN = '#1b7f5e'

function monthShort(ym) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short' })
}
// Axis ticks only — the readable figures elsewhere all go through inr().
function short(n) {
  const v = Number(n) || 0
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `₹${Math.round(v / 1000)}k`
  return `₹${v}`
}

function Stat({ label, value, note, color }) {
  return (
    <div className="cc-acc-card">
      <div className="cc-acc-label">{label}</div>
      <div className="cc-acc-value mt-1" style={color ? { color } : undefined}>{value}</div>
      {note ? <div className="cc-acc-note">{note}</div> : null}
    </div>
  )
}

/**
 * Sales vs Expenses over the last 6 months with data. Grouped bars, because the
 * two measures are compared per month rather than summed — a stack would imply
 * a total that means nothing here. Single shared axis; the Monthly Report tab is
 * the table view of the same numbers.
 */
function TrendChart({ orders, expenses, withdrawals, months }) {
  const data = useMemo(() => {
    return months.slice(0, 6).reverse().map((m) => {
      const s = computeSummary(orders, expenses, withdrawals, m)
      return { month: m, sales: s.received, expenses: s.totalExpenses }
    })
  }, [orders, expenses, withdrawals, months])

  if (data.length < 2) return null

  const W = 640, H = 200, PAD_L = 46, PAD_R = 8, PAD_T = 12, PAD_B = 26
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B
  const max = Math.max(...data.flatMap((d) => [d.sales, d.expenses]), 1)
  const ticks = [0, max / 2, max]
  const slot = plotW / data.length
  const barW = Math.min(22, (slot - 10) / 2)
  const y = (v) => PAD_T + plotH - (v / max) * plotH

  return (
    <div className="cc-acc-card mt-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="cc-acc-label">Received vs expenses · last {data.length} months</div>
        <div className="d-flex gap-3" style={{ fontSize: '0.78rem', color: '#52514e' }}>
          <span className="d-inline-flex align-items-center gap-1">
            <span style={{ width: 10, height: 10, borderRadius: 3, background: SERIES_SALES, display: 'inline-block' }} />
            Received
          </span>
          <span className="d-inline-flex align-items-center gap-1">
            <span style={{ width: 10, height: 10, borderRadius: 3, background: SERIES_EXPENSES, display: 'inline-block' }} />
            Expenses
          </span>
        </div>
      </div>

      <svg className="cc-acc-chart mt-2" viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
        aria-label={`Money received versus expenses for the last ${data.length} months`}>
        <defs>
          <clipPath id="ccAccPlot">
            <rect x={PAD_L} y={PAD_T} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        <g className="cc-acc-chart-grid">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} />
              <text x={PAD_L - 8} y={y(t) + 4} textAnchor="end">{short(t)}</text>
            </g>
          ))}
        </g>

        <g clipPath="url(#ccAccPlot)">
          {data.map((d, i) => {
            const cx = PAD_L + slot * i + slot / 2
            // +4 height with rx=4, clipped at the baseline: rounded data-end on top,
            // square where it meets the axis.
            return (
              <g key={d.month} className="col">
                <rect className="bar" x={cx - barW - 1} y={y(d.sales)} width={barW}
                  height={plotH + PAD_T - y(d.sales) + 4} rx="4" fill={SERIES_SALES}>
                  <title>{`${monthLabel(d.month)} · Received ${inr(d.sales)}`}</title>
                </rect>
                <rect className="bar" x={cx + 1} y={y(d.expenses)} width={barW}
                  height={plotH + PAD_T - y(d.expenses) + 4} rx="4" fill={SERIES_EXPENSES}>
                  <title>{`${monthLabel(d.month)} · Expenses ${inr(d.expenses)}`}</title>
                </rect>
              </g>
            )
          })}
        </g>

        <line className="cc-acc-chart-base" x1={PAD_L} x2={W - PAD_R} y1={y(0)} y2={y(0)} />
        {data.map((d, i) => (
          <text key={d.month} x={PAD_L + slot * i + slot / 2} y={H - 8} textAnchor="middle">
            {monthShort(d.month)}
          </text>
        ))}
      </svg>
      <div className="cc-acc-note">Hover a bar for the exact figure · full table in Monthly Report.</div>
    </div>
  )
}

/**
 * The dashboard the owner asked for: invest → earn → spend → what's left, and
 * nothing else. It used to carry Total sales, a received-by-method breakdown,
 * two big pocket cards and a legacy hand-typed note; that was more numbers than
 * decisions, and the owner said so. The cash/bank split survives as one small line
 * because the "In bank → Taken to cash" button on an online order feeds it.
 */
export default function DashboardTab({ orders, expenses, withdrawals }) {
  const months = useMemo(() => monthsFrom(orders, expenses, withdrawals), [orders, expenses, withdrawals])
  const [period, setPeriod] = useState('ALL')
  const sel = months.includes(period) ? period : 'ALL'
  const allTime = sel === 'ALL'

  const s = useMemo(
    () => computeSummary(orders, expenses, withdrawals, allTime ? null : sel),
    [orders, expenses, withdrawals, allTime, sel]
  )

  return (
    <div className="cc-acc-dash">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h5 m-0" style={{ fontFamily: 'var(--font-heading,serif)', color: '#7a4a58' }}>
          {monthLabel(sel)}
        </h2>
        <div className="d-flex align-items-center gap-2">
          <span className="small" style={{ color: INK_MUTED }}>Show</span>
          <select className="form-select form-select-sm" style={{ width: 'auto', borderColor: 'rgba(207,62,99,0.25)' }}
            value={sel} onChange={(e) => setPeriod(e.target.value)}>
            <option value="ALL">All time</option>
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>
      </div>

      <div className="cc-acc-hero">
        <div className="cc-acc-card cc-acc-card--hero cc-acc-card--accent">
          <div className="cc-acc-label">Money in hand</div>
          <div className="cc-acc-value mt-1" style={{ color: s.moneyInHand < 0 ? '#c23a2b' : '#c23a2b' }}>
            {inr(s.moneyInHand)}
          </div>
          <div className="cc-acc-note">
            Invested {inr(s.invested)} + earnings {inr(s.received)} − expenses {inr(s.totalExpenses)}
            {' '}− taken out {inr(s.totalWithdrawn)}
          </div>
        </div>

        <div className="cc-acc-card cc-acc-card--hero">
          <div className="cc-acc-label">Profit</div>
          <div className="cc-acc-value mt-1" style={{ color: s.profit < 0 ? '#c23a2b' : '#1d6f3a' }}>
            {inr(s.profit)}
          </div>
          <div className="cc-acc-note">
            Earnings {inr(s.received)} − expenses {inr(s.totalExpenses)}. Money you put in is not
            profit — it is your own money coming back.
          </div>
        </div>
      </div>

      <div className="cc-acc-kpis mt-3">
        <Stat label="Invested" value={inr(s.invested)} color={INK_IN} note="Your own money put in" />
        <Stat label="Earnings" value={inr(s.received)} color={SERIES_SALES}
          note={`${s.orderCount} paid order${s.orderCount === 1 ? '' : 's'}`} />
        <Stat label="Expenses" value={inr(s.totalExpenses)} color={SERIES_EXPENSES} note="Material & supplies" />
        <Stat label="Taken out" value={inr(s.totalWithdrawn)} note="For yourself, not the bakery" />
      </div>

      <p className="cc-acc-note mt-3 mb-0 text-center">
        Still to collect <strong>{inr(s.toCollect)}</strong> from {s.unpaidCount} unpaid
        order{s.unpaidCount === 1 ? '' : 's'}
        {allTime ? <> · Cash <strong>{inr(s.cashInHand)}</strong> · In bank <strong>{inr(s.bankOnline)}</strong></> : null}
      </p>

      <TrendChart orders={orders} expenses={expenses} withdrawals={withdrawals} months={months} />

      <p className="cc-acc-note text-center mt-3 mb-0">
        Only paid orders count as earnings. Buying material goes in <strong>Expenses</strong>;
        money you put in or take out goes in <strong>My Money</strong>.
        Right after a big purchase profit dips — it comes back as those orders are sold.
      </p>
    </div>
  )
}
