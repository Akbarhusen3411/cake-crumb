import { useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi'

// A brand-styled searchable dropdown. Type to filter; click / Enter to pick.
// options: array of strings, or { value, label, sub? } objects.
// allowCustom: keep whatever the user typed even if it isn't in the list.
function normalise(options) {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  allowCustom = false,
  disabled = false,
  autoOpen = false,
}) {
  const opts = useMemo(() => normalise(options), [options])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hi, setHi] = useState(0)
  const boxRef = useRef(null)
  const listRef = useRef(null)

  const selected = opts.find((o) => o.value === value)
  const labelForValue = selected ? selected.label : (value || '')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return opts
    return opts.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sub && String(o.sub).toLowerCase().includes(q))
    )
  }, [opts, query])

  // Close (and commit any custom text) when clicking outside.
  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) commitAndClose()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query])

  useEffect(() => {
    if (autoOpen && !disabled) openList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen])

  // Keep the highlighted row scrolled into view.
  useEffect(() => {
    const el = listRef.current?.children?.[hi]
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [hi])

  function commitAndClose() {
    if (open && allowCustom && query.trim() && query.trim() !== labelForValue) {
      onChange(query.trim())
    }
    setOpen(false)
    setQuery('')
  }
  function select(o) { onChange(o.value); setOpen(false); setQuery('') }
  function openList() { if (disabled) return; setOpen(true); setQuery(''); setHi(0) }

  function onKey(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { openList(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[hi]) select(filtered[hi])
      else if (allowCustom && query.trim()) { onChange(query.trim()); setOpen(false); setQuery('') }
    } else if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <FiSearch
          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#b78', pointerEvents: 'none' }}
        />
        <input
          type="text"
          className="form-control"
          style={{ paddingLeft: 32, paddingRight: 52, borderColor: open ? 'var(--cc-rose, #e0617a)' : undefined }}
          placeholder={placeholder}
          disabled={disabled}
          value={open ? query : labelForValue}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(0) }}
          onFocus={openList}
          onKeyDown={onKey}
          autoComplete="off"
        />
        {!open && value ? (
          <button
            type="button"
            aria-label="Clear"
            onMouseDown={(e) => { e.preventDefault(); onChange(''); setQuery(''); }}
            style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: '#c99', padding: 4, cursor: 'pointer' }}
          >
            <FiX />
          </button>
        ) : null}
        <FiChevronDown
          onMouseDown={(e) => { e.preventDefault(); open ? commitAndClose() : openList() }}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#b78', cursor: 'pointer' }}
        />
      </div>

      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute', zIndex: 40, top: 'calc(100% + 4px)', left: 0, right: 0,
            maxHeight: 260, overflowY: 'auto', background: '#fff',
            border: '1px solid #f0d9dd', borderRadius: 12,
            boxShadow: '0 12px 28px rgba(160,60,90,0.18)',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 14px', color: '#a08' }}>
              {allowCustom ? `Press Enter to use "${query}"` : 'No matches'}
            </div>
          ) : (
            filtered.map((o, i) => (
              <button
                key={o.value + i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(o) }}
                onMouseEnter={() => setHi(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
                  width: '100%', textAlign: 'left', border: 0,
                  padding: '9px 14px', cursor: 'pointer',
                  background: i === hi ? '#fce9ee' : (o.value === value ? '#fff4f7' : '#fff'),
                  color: '#5b3e36',
                }}
              >
                <span style={{ fontWeight: o.value === value ? 700 : 500 }}>{o.label}</span>
                {/* `sub` is always a price. It's the figure being compared when
                    picking a size, so it gets its own weight and a chip pushed to
                    the right edge — as trailing 12px grey text it read like an
                    afterthought and the sizes all looked alike. Lining/tabular
                    figures so ₹90 and ₹240 line up down the list. */}
                {o.sub ? (
                  <span style={{
                    fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap',
                    color: 'var(--cc-rose-deep, #cf3e63)',
                    background: '#fdeef2', border: '1px solid #f6d9e1',
                    borderRadius: 999, padding: '1px 9px',
                    fontVariantNumeric: 'lining-nums tabular-nums',
                  }}>{o.sub}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
