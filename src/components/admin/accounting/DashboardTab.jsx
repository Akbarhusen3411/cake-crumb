import { useEffect, useMemo, useState } from 'react'
import { FiDatabase, FiDownload } from 'react-icons/fi'
import { computeSummary, monthsFrom, getLastBackupAt } from '../../../services/accounting.js'
import { downloadAccountingBackup } from '../../../utils/accBackup.js'
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

// `color` also tints the tile's top edge, so the four read as four kinds of money.
function Stat({ label, value, note, color, delta }) {
  return (
    <div className="cc-acc-card" style={color ? { '--tone': color } : undefined}>
      <div className="cc-acc-label">{label}</div>
      <div className="cc-acc-value mt-1" style={color ? { color } : undefined}>{value}</div>
      {delta}
      {note ? <div className="cc-acc-note">{note}</div> : null}
    </div>
  )
}

/** "YYYY-MM" of the calendar month before `ym`. */
function prevMonthOf(ym) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * "▲ 12% vs Sep" under a figure, when one month is picked. Rides under figures
 * already on the page rather than adding a tile — the Dashboard is kept sparse
 * on purpose. Nothing when last month was ₹0 (no percentage to state) or the
 * two are equal.
 */
function Delta({ cur, prev, month }) {
  if (!prev || cur === prev) return null
  const pct = Math.round(((cur - prev) / Math.abs(prev)) * 100)
  const up = cur > prev
  return (
    <div className={`cc-acc-delta ${up ? 'cc-acc-delta--up' : 'cc-acc-delta--down'}`}
      title={`${monthLabel(month)}: ${inr(prev)}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}% <span>vs {monthShort(month)}</span>
    </div>
  )
}

/**
 * When the books were last downloaded as a backup — the only backup there is.
 * Quiet while recent; amber with a button from 30 days, or if there's never
 * been one. The date is shared across devices (see getLastBackupAt).
 */
const BACKUP_DUE_DAYS = 30
function BackupLine() {
  const [state, setState] = useState(null) // null while loading, then { at, days }
  const [busy, setBusy] = useState(false)
  const stamp = (at) => setState({ at, days: at ? Math.floor((Date.now() - new Date(at).getTime()) / 86400000) : null })
  useEffect(() => {
    let live = true
    getLastBackupAt().then((at) => { if (live) stamp(at) })
    return () => { live = false }
  }, [])
  if (!state) return null

  async function backupNow() {
    setBusy(true)
    try { stamp(await downloadAccountingBackup()) } finally { setBusy(false) }
  }
  const due = state.at == null || state.days >= BACKUP_DUE_DAYS
  const when = state.at == null ? 'No backup taken yet'
    : state.days <= 0 ? 'Last backup: today'
      : state.days === 1 ? 'Last backup: yesterday'
        : `Last backup: ${state.days} days ago`
  return (
    <div className={`cc-acc-backup${due ? ' cc-acc-backup--due' : ''}`}>
      <FiDatabase aria-hidden="true" />
      <span>{when}{due ? ' — download one to keep the books safe.' : ''}</span>
      <button type="button" onClick={backupNow} disabled={busy}>
        <FiDownload /> {busy ? 'Saving…' : 'Back up now'}
      </button>
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
export default function DashboardTab({ orders, expenses, withdrawals, onShowUnpaid }) {
  const months = useMemo(() => monthsFrom(orders, expenses, withdrawals), [orders, expenses, withdrawals])
  const [period, setPeriod] = useState('ALL')
  const sel = months.includes(period) ? period : 'ALL'
  const allTime = sel === 'ALL'

  const s = useMemo(
    () => computeSummary(orders, expenses, withdrawals, allTime ? null : sel),
    [orders, expenses, withdrawals, allTime, sel]
  )
  // The calendar month before the one picked, for the "vs last month" lines.
  // All time has nothing to compare with, so it shows none.
  const prevMonth = allTime ? null : prevMonthOf(sel)
  const prev = useMemo(
    () => (prevMonth ? computeSummary(orders, expenses, withdrawals, prevMonth) : null),
    [orders, expenses, withdrawals, prevMonth]
  )

  return (
    <div className="cc-acc-dash">
      <div className="cc-acc-dash__top d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
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
          {/* One month on its own is that month's NET flow, not the money in
              the till — labelled so; All time is the real money in hand. */}
          <div className="cc-acc-label">{allTime ? 'Money in hand' : 'Net this month'}</div>
          {/* Both branches of this used to be the same colour, so a negative —
              more taken out than came in — read exactly like a healthy figure. */}
          <div className="cc-acc-value mt-1" style={{ color: s.moneyInHand < 0 ? '#a3172c' : '#c23a2b' }}>
            {inr(s.moneyInHand)}
            {s.moneyInHand < 0 ? <span className="cc-acc-note d-block">{allTime ? 'More has gone out than came in.' : 'More went out than came in this month.'}</span> : null}
          </div>
          {/* A phone gets the formula without the figures — the four tiles
              right below carry them, and with them it ran to three lines. */}
          <div className="cc-acc-note cc-acc-note--long">
            Invested {inr(s.invested)} + earnings {inr(s.received)} − expenses {inr(s.totalExpenses)}
            {' '}− taken out {inr(s.totalWithdrawn)}
          </div>
          <div className="cc-acc-note cc-acc-note--short">Invested + earnings − expenses − taken out</div>
        </div>

        <div className="cc-acc-card cc-acc-card--hero">
          <div className="cc-acc-label">Profit</div>
          <div className="cc-acc-value mt-1" style={{ color: s.profit < 0 ? '#c23a2b' : '#1d6f3a' }}>
            {inr(s.profit)}
          </div>
          {prev ? <Delta cur={s.profit} prev={prev.profit} month={prevMonth} /> : null}
          <div className="cc-acc-note cc-acc-note--long">
            Earnings {inr(s.received)} − expenses {inr(s.totalExpenses)}. Money you put in is not
            profit — it is your own money coming back.
          </div>
          <div className="cc-acc-note cc-acc-note--short">Earnings − expenses</div>
        </div>
      </div>

      <div className="cc-acc-kpis mt-3">
        <Stat label="Invested" value={inr(s.invested)} color={INK_IN} note="Your own money put in" />
        {/* paidCount, not orderCount — this figure is money received, and
            orderCount includes the ones still unpaid. */}
        <Stat label="Earnings" value={inr(s.received)} color={SERIES_SALES}
          delta={prev ? <Delta cur={s.received} prev={prev.received} month={prevMonth} /> : null}
          note={`${s.paidCount} paid order${s.paidCount === 1 ? '' : 's'} of ${s.orderCount}`} />
        <Stat label="Expenses" value={inr(s.totalExpenses)} color={SERIES_EXPENSES} note="Material & supplies" />
        <Stat label="Taken out" value={inr(s.totalWithdrawn)} note="For yourself, not the bakery" />
      </div>

      <p className="cc-acc-note cc-acc-strip mt-3 mb-0 text-center">
        {/* Money owed is the one figure here you can act on, so it opens the
            orders it refers to instead of leaving you to filter for them. */}
        {s.unpaidCount > 0 && onShowUnpaid ? (
          <button type="button" className="cc-acc-link" onClick={() => onShowUnpaid(allTime ? 'all' : sel)}
            title="Open these orders in the Orders tab">
            Still to collect <strong>{inr(s.toCollect)}</strong> from {s.unpaidCount} unpaid
            order{s.unpaidCount === 1 ? '' : 's'} →
          </button>
        ) : (
          <>Still to collect <strong>{inr(s.toCollect)}</strong> from {s.unpaidCount} unpaid
            order{s.unpaidCount === 1 ? '' : 's'}</>
        )}
        {allTime ? (
          <span className="cc-acc-strip__pockets">
            <span className="cc-acc-strip__sep"> · </span>Cash <strong>{inr(s.cashInHand)}</strong>
            {' '}· In bank <strong>{inr(s.bankOnline)}</strong>
          </span>
        ) : null}
      </p>

      <BackupLine />

      <TrendChart orders={orders} expenses={expenses} withdrawals={withdrawals} months={months} />

      <p className="cc-acc-note cc-acc-footnote text-center mt-3 mb-0">
        Only paid orders count as earnings. Buying material goes in <strong>Expenses</strong>;
        money you put in or take out goes in <strong>My Money</strong>.
        Right after a big purchase profit dips — it comes back as those orders are sold.
      </p>
    </div>
  )
}
