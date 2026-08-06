import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi'

// A brand-styled searchable dropdown. Type to filter; click / Enter to pick.
// options: array of strings, or { value, label, sub? } objects.
// allowCustom: keep whatever the user typed even if it isn't in the list.
function normalise(options) {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

// Only one list open at a time, across every instance on the page. Outside-click
// alone left two lists overlapping when a click landed on another select — this
// is the guarantee, not the cleanup.
let closeActive = null

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  allowCustom = false,
  disabled = false,
  autoOpen = false,
  compact = false,
  icon = null, // replaces the search glyph — a person for a customer, say
}) {
  const opts = useMemo(() => normalise(options), [options])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hi, setHi] = useState(0)
  const boxRef = useRef(null)
  const listRef = useRef(null)
  // Where to draw the list. It's portalled onto <body> and positioned fixed,
  // because the dialog body and the items grid both scroll — as a child of the
  // field, an `overflow: auto` ancestor clipped the list to whatever was left of
  // the row.
  const [pos, setPos] = useState(null)

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

  // Track the field so the portalled list stays glued to it — including while
  // an ancestor scrolls (capture, so inner scrollers count too).
  const MAX_LIST_H = 260
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const r = boxRef.current?.getBoundingClientRect()
      if (!r) return
      // Flip above when the list wouldn't fit below and there's more room up.
      const below = window.innerHeight - r.bottom
      const flip = below < MAX_LIST_H && r.top > below
      setPos({
        left: r.left, width: r.width, flip,
        top: flip ? undefined : r.bottom + 4,
        bottom: flip ? window.innerHeight - r.top + 4 : undefined,
        space: Math.max(120, (flip ? r.top : below) - 12),
      })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  // Close (and commit any custom text) on a click or tap anywhere outside —
  // in the capture phase, so it still fires when the click lands on something
  // that stops propagation. Escape and the chevron close it too.
  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      // The list lives on <body>, so "outside" has to spare it too.
      if (listRef.current?.contains(e.target)) return
      if (boxRef.current && !boxRef.current.contains(e.target)) commitAndClose()
    }
    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('touchstart', onDoc, true)
    return () => {
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('touchstart', onDoc, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query])

  // Whoever opened last owns the page; anyone else shuts.
  useEffect(() => {
    if (!open) return
    const mine = () => { setOpen(false); setQuery('') }
    closeActive?.()
    closeActive = mine
    return () => { if (closeActive === mine) closeActive = null }
  }, [open])

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
    } else if (e.key === 'Escape') {
      // Esc shuts the list, not the whole dialog — Modal listens on the
      // document, so the event must stop at the root container.
      if (open) e.stopPropagation()
      setOpen(false); setQuery('')
    }
  }

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        {/* Compact sits in a one-line item row, where a 22px search glyph is
            22px of the item name. The placeholder already says it's a picker. */}
        {compact ? null : (
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#b78', pointerEvents: 'none', display: 'flex' }}>
            {icon || <FiSearch />}
          </span>
        )}
        <input
          type="text"
          className={compact ? 'form-control form-control-sm' : 'form-control'}
          style={{
            paddingLeft: compact ? 8 : 32,
            paddingRight: compact ? 38 : 52,
            textOverflow: 'ellipsis',
            borderColor: open ? 'var(--cc-rose, #e0617a)' : undefined,
          }}
          placeholder={placeholder}
          disabled={disabled}
          value={open ? query : labelForValue}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(0) }}
          onFocus={openList}
          onKeyDown={onKey}
          autoComplete="off"
          // Customer and item names aren't dictionary words — the red squiggle
          // under every one of them read like the form was rejecting the name.
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        {!open && value ? (
          <button
            type="button"
            aria-label="Clear"
            onMouseDown={(e) => { e.preventDefault(); onChange(''); setQuery(''); }}
            style={{ position: 'absolute', right: compact ? 22 : 30, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: '#c99', padding: compact ? 2 : 4, cursor: 'pointer' }}
          >
            <FiX />
          </button>
        ) : null}
        <FiChevronDown
          onMouseDown={(e) => { e.preventDefault(); open ? commitAndClose() : openList() }}
          title={open ? 'Close the list' : 'Open the list'}
          style={{
            position: 'absolute', right: compact ? 6 : 10, top: '50%', color: '#b78', cursor: 'pointer',
            // Flipped while open, so the same arrow that opened it plainly shuts it.
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: 'transform 0.15s ease',
          }}
        />
      </div>

      {open && pos && createPortal(
        <div
          ref={listRef}
          style={{
            // Wider than its control when it needs to be: in a quarter-width
            // column the list was so narrow that "Box of 6" wrapped onto two
            // lines with its price crushed beside it. Capped so it can't run
            // off a phone screen. Fixed to the viewport — see `pos`.
            position: 'fixed', zIndex: 2000,
            top: pos.top, bottom: pos.bottom, left: pos.left,
            minWidth: pos.width, width: 'max-content', maxWidth: 'min(320px, 82vw)',
            maxHeight: Math.min(MAX_LIST_H, pos.space), overflowY: 'auto', background: '#fff',
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
                <span style={{
                  fontWeight: o.value === value ? 700 : 500,
                  minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{o.label}</span>
                {/* `sub` is always a price. It's the figure being compared when
                    picking a size, so it gets its own weight and a chip pushed to
                    the right edge — as trailing 12px grey text it read like an
                    afterthought and the sizes all looked alike. Lining/tabular
                    figures so ₹90 and ₹240 line up down the list. */}
                {o.sub ? (
                  <span style={{
                    fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0,
                    color: 'var(--cc-rose-deep, #cf3e63)',
                    background: '#fdeef2', border: '1px solid #f6d9e1',
                    borderRadius: 999, padding: '1px 9px',
                    fontVariantNumeric: 'lining-nums tabular-nums',
                  }}>{o.sub}</span>
                ) : null}
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
