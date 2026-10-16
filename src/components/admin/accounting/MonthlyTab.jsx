import { useMemo } from 'react'
import { FiDownload } from 'react-icons/fi'
import { computeSummary, monthsFrom } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { monthLabel, todayIso } from '../../../utils/adminDate.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'
import { downloadCsv } from '../../../utils/csv.js'

export default function MonthlyTab({ orders, expenses, withdrawals }) {
  const mobile = useIsMobile()
  const months = useMemo(() => monthsFrom(orders, expenses, withdrawals), [orders, expenses, withdrawals])
  const rows = useMemo(
    () => months.map((m) => ({ m, s: computeSummary(orders, expenses, withdrawals, m) })),
    [months, orders, expenses, withdrawals]
  )
  // Every month added up — the same sums as the CSV's TOTAL row, so the card,
  // the table's last row and the file all agree. Summed from the months shown
  // rather than recomputed, so it can only ever be the total of what's listed.
  const all = useMemo(() => {
    const keys = ['orderCount', 'paidCount', 'invested', 'received', 'totalExpenses', 'totalWithdrawn', 'toCollect', 'profit']
    const t = Object.fromEntries(keys.map((k) => [k, 0]))
    for (const { s } of rows) for (const k of keys) t[k] += Number(s[k]) || 0
    return t
  }, [rows])

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
      {/* The rule in one line beside the CSV button; the long version is the
          paragraph's tooltip. Four lines of it pushed the first month off a phone. */}
      <div className="cc-mrep__intro">
        <p title="Money you invest or take out is your own, so it changes neither earnings nor profit. An unpaid order counts only once the customer pays — until then it sits in “To collect”.">
          <strong>Profit = Earnings − Expenses</strong> — money received, not invoiced. Your own money in/out isn’t counted.
        </p>
        <button className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
          onClick={exportCsv} disabled={!rows.length} title="Download this table as a spreadsheet">
          <FiDownload /> CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="text-center text-muted py-4" style={{ border: '1px solid #f0e0e3', borderRadius: 12 }}>No data yet.</div>
      ) : mobile ? (
        // ── mobile: one card per month ──
        // Profit leads, as the answer to "how did the month go"; a bar shows how
        // much of the earnings the expenses ate; then the three figures it's made
        // from; the owner's own money only when there was any. Six equal
        // label/value pairs gave the month no headline.
        <div className="cc-mrep">
          {/* All months at the top — on a phone this was nowhere but the CSV. */}
          {rows.length > 1 ? (
            <article className={`cc-mrep__card cc-mrep__card--total${all.profit < 0 ? ' cc-mrep__card--loss' : ''}`}>
              <div className="cc-mrep__head">
                <div className="cc-mrep__month">
                  <b>All months</b>
                  <small>{monthLabel(rows[rows.length - 1].m)} – {monthLabel(rows[0].m)} · {all.orderCount} orders</small>
                </div>
                <div className="cc-mrep__profit">
                  <small>{all.profit < 0 ? 'Loss' : 'Profit'}</small>
                  <b>{inr(all.profit)}</b>
                </div>
              </div>
              <dl className="cc-mrep__stats">
                <div><dt>Earnings</dt><dd className="cc-mrep__v--earn">{inr(all.received)}</dd></div>
                <div><dt>Expenses</dt><dd className="cc-mrep__v--exp">{inr(all.totalExpenses)}</dd></div>
                <div><dt>To collect</dt><dd className="cc-mrep__v--due">{inr(all.toCollect)}</dd></div>
              </dl>
            </article>
          ) : null}
          {rows.map(({ m, s }) => {
            const loss = s.profit < 0
            const spentPct = s.received > 0
              ? Math.min(100, Math.round((s.totalExpenses / s.received) * 100))
              : (s.totalExpenses > 0 ? 100 : 0)
            return (
              <article key={m} className={`cc-mrep__card${loss ? ' cc-mrep__card--loss' : ''}`}>
                <div className="cc-mrep__head">
                  <div className="cc-mrep__month">
                    <b>{monthLabel(m)}</b>
                    <small>{s.orderCount} order{s.orderCount === 1 ? '' : 's'} · {s.paidCount} paid</small>
                  </div>
                  <div className="cc-mrep__profit">
                    <small>{loss ? 'Loss' : 'Profit'}</small>
                    <b>{inr(s.profit)}</b>
                  </div>
                </div>

                <div className="cc-mrep__bar" role="img"
                  aria-label={`Expenses were ${spentPct}% of earnings`}>
                  <i style={{ width: `${spentPct}%` }} />
                </div>
                <div className="cc-mrep__barnote">
                  {s.received > 0
                    ? `${spentPct}% of earnings went on expenses`
                    : (s.totalExpenses > 0 ? 'Expenses with no earnings yet' : 'Nothing earned or spent')}
                </div>

                <dl className="cc-mrep__stats">
                  <div><dt>Earnings</dt><dd className="cc-mrep__v--earn">{inr(s.received)}</dd></div>
                  <div><dt>Expenses</dt><dd className="cc-mrep__v--exp">{inr(s.totalExpenses)}</dd></div>
                  <div><dt>To collect</dt><dd className="cc-mrep__v--due">{inr(s.toCollect)}</dd></div>
                </dl>

                {s.invested > 0 || s.totalWithdrawn > 0 ? (
                  <div className="cc-mrep__own">
                    Your money: <span>in {inr(s.invested)}</span> · <span>out {inr(s.totalWithdrawn)}</span>
                  </div>
                ) : null}
              </article>
            )
          })}
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
            {rows.length > 1 ? (
              <tfoot>
                <tr className="cc-mrep__totalrow">
                  <td className="text-nowrap">All months</td>
                  <td>{all.orderCount}</td>
                  <td className="text-nowrap" style={{ color: '#1b7f5e' }}>{inr(all.invested)}</td>
                  <td className="text-nowrap">{inr(all.received)}</td>
                  <td className="text-nowrap" style={{ color: '#b23b3b' }}>{inr(all.totalExpenses)}</td>
                  <td className="text-nowrap">{inr(all.totalWithdrawn)}</td>
                  <td className="text-nowrap" style={{ color: '#9a5a0c' }}>{inr(all.toCollect)}</td>
                  <td className="text-nowrap" style={{ color: all.profit >= 0 ? '#1b7f5e' : '#b23b3b' }}>{inr(all.profit)}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      )}
    </div>
  )
}
