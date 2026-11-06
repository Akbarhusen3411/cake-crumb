import { useEffect, useMemo, useState } from 'react'
import { useKeyboardInset } from '../../../hooks/useKeyboardInset.js'
import { createPortal } from 'react-dom'
import { FiSearch, FiX, FiCheck, FiChevronDown, FiPhone, FiUserPlus, FiUser } from 'react-icons/fi'
import { inr } from '../../../data/format.js'
import { fmtDate } from '../../../utils/adminDate.js'

const initials = (name) => {
  const w = String(name).trim().split(/\s+/).filter(Boolean)
  return ((w[0]?.[0] || '') + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase() || '?'
}
// A steady colour per name, so a regular is recognisable at a glance.
const TONES = ['#cf3e63', '#6b5bb0', '#1b7f5e', '#b2621b', '#2a6f97', '#8a4f7d']
const toneOf = (name) => {
  let h = 0
  for (const c of String(name).toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TONES[h % TONES.length]
}

/**
 * The customer field on a phone. The generic list was a long column of bare
 * names in A–Z order — the regular from this morning sat under forty others.
 * Here: recent customers first, each with initials, order count, last order
 * and anything still owed; typing a new name puts "New customer" at the top.
 *
 * `stats` is { [lower-cased name]: { orders, last, owed, phone } }.
 */
export default function CustomerPickerMobile({ value, onChange, customers, stats = {}, bad = false }) {
  const [open, setOpen] = useState(false)
  const st = stats[String(value || '').trim().toLowerCase()]
  return (
    <>
      <button type="button" className={`cc-cpick-field${value ? ' is-set' : ''}${bad ? ' is-bad' : ''}`}
        onClick={() => setOpen(true)} aria-haspopup="dialog">
        {value ? (
          <>
            <span className="cc-cpick__av" style={{ background: toneOf(value) }}>{initials(value)}</span>
            <span className="cc-cpick-field__text">
              <b>{value}</b>
              <small>{st ? `${st.orders} order${st.orders === 1 ? '' : 's'} before` : 'New customer'}</small>
            </span>
          </>
        ) : (
          <>
            <span className="cc-cpick__av cc-cpick__av--empty"><FiUser /></span>
            <span className="cc-cpick-field__text"><b>Choose or type a name</b></span>
          </>
        )}
        <FiChevronDown className="cc-cpick-field__chev" />
      </button>
      {open ? (
        <Sheet value={value} customers={customers} stats={stats}
          onPick={(v) => { onChange(v); setOpen(false) }} onClose={() => setOpen(false)} />
      ) : null}
    </>
  )
}

function Sheet({ value, customers, stats, onPick, onClose }) {
  const [q, setQ] = useState('')
  const kb = useKeyboardInset(true)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const statOf = (n) => stats[n.toLowerCase()]
  const typed = q.trim()
  const words = typed.toLowerCase().split(/\s+/).filter(Boolean)
  const matches = useMemo(
    () => (words.length ? customers.filter((n) => words.every((w) => n.toLowerCase().includes(w))) : customers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers, typed]
  )
  const exact = typed && customers.some((n) => n.toLowerCase() === typed.toLowerCase())
  // Recent = the last eight people who ordered, newest first (only with no search).
  const recent = useMemo(
    () => (words.length ? [] : [...customers]
      .filter((n) => statOf(n)?.last)
      .sort((a, b) => String(statOf(b).last).localeCompare(String(statOf(a).last)))
      .slice(0, 8)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers, stats, typed]
  )

  const row = (n, key = n) => {
    const s = statOf(n)
    const on = n === value
    return (
      <button key={key} type="button" className={`cc-cpick__row${on ? ' is-on' : ''}`} onClick={() => onPick(n)} aria-pressed={on}>
        <span className="cc-cpick__av" style={{ background: toneOf(n) }}>{initials(n)}</span>
        <span className="cc-cpick__text">
          <b>{n}</b>
          {s ? (
            <small>
              {s.orders} order{s.orders === 1 ? '' : 's'}{s.last ? ` · last ${fmtDate(s.last)}` : ''}
              {s.phone ? <FiPhone className="cc-cpick__ph" aria-label="has phone" /> : null}
            </small>
          ) : null}
        </span>
        {s?.owed > 0 ? <span className="cc-cpick__owes">Owes {inr(s.owed)}</span> : null}
        {on ? <FiCheck className="cc-cpick__tick" /> : null}
      </button>
    )
  }

  return createPortal(
    <div className="cc-ssheet cc-cpick" style={{ '--cc-kb': `${kb}px` }}>
      <div className="cc-ssheet__backdrop" onClick={onClose} />
      <div className="cc-ssheet__panel" role="dialog" aria-modal="true" aria-label="Customer">
        <div className="cc-ssheet__head">
          <span className="cc-ssheet__title">Customer</span>
          <button type="button" className="cc-ssheet__close" aria-label="Close" onClick={onClose}><FiX /></button>
        </div>
        <label className="cc-ssheet__search">
          <FiSearch aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search or type a new name"
            placeholder="Search, or type a new name…" enterKeyHint="done" autoComplete="off" spellCheck={false} autoCorrect="off"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              if (matches.length === 1) onPick(matches[0])
              else if (typed) onPick(exact ? customers.find((n) => n.toLowerCase() === typed.toLowerCase()) : typed)
            }} />
          {q ? <button type="button" className="cc-mpick__clear" aria-label="Clear search" onClick={() => setQ('')}><FiX /></button> : null}
        </label>

        <div className="cc-ssheet__list cc-cpick__list">
          {typed && !exact ? (
            <button type="button" className="cc-cpick__new" onClick={() => onPick(typed)}>
              <span className="cc-cpick__av cc-cpick__av--new"><FiUserPlus /></span>
              <span className="cc-cpick__text"><b>New customer</b><small>“{typed}”</small></span>
            </button>
          ) : null}
          {recent.length ? (
            <>
              <div className="cc-cpick__sec">Recent</div>
              {recent.map((n) => row(n, `r-${n}`))}
              <div className="cc-cpick__sec">All customers · {customers.length}</div>
            </>
          ) : null}
          {matches.map((n) => row(n))}
          {typed && !matches.length ? <div className="cc-ssheet__empty">No one by that name yet — tap “New customer”.</div> : null}
          {!customers.length && !typed ? <div className="cc-ssheet__empty">No customers yet — type the first name above.</div> : null}
        </div>
      </div>
    </div>,
    document.body
  )
}
