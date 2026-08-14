// Visual badges for product allergens / dietary attributes.
// Two flavors:
//   - "free"     → green-tinted, positive (Eggless, Vegan)
//   - "contains" → amber-tinted, warning (Contains Nuts)
//   - "option"   → outline, neutral (Eggless on request)

const STYLES = {
  // Positive / dietary-friendly
  eggless:        { label: 'Eggless',         icon: '🌱', kind: 'free' },
  vegan:          { label: 'Vegan',           icon: '🌿', kind: 'free' },
  'gluten-free':  { label: 'Gluten-Free',     icon: '🌾', kind: 'free' },
  // Warnings
  'contains-nuts':   { label: 'Contains Nuts',   icon: '🌰', kind: 'contains' },
  'contains-egg':    { label: 'Contains Egg',    icon: '🥚', kind: 'contains' },
  'contains-dairy':  { label: 'Contains Dairy',  icon: '🥛', kind: 'contains' },
  'contains-gluten': { label: 'Contains Gluten', icon: '🌾', kind: 'contains' },
  // Optional / on-request
  'eggless-option': { label: 'Eggless on request', icon: '🌱', kind: 'option' },
}

const COLORS = {
  free:     { bg: 'rgba(34, 139, 81, 0.10)',  fg: '#1d6f3a',  border: 'rgba(34, 139, 81, 0.35)' },
  contains: { bg: 'rgba(184, 134, 11, 0.12)', fg: '#8a5d05',  border: 'rgba(184, 134, 11, 0.35)' },
  option:   { bg: 'rgba(224, 97, 122, 0.08)', fg: 'var(--cc-rose-deep)', border: 'rgba(224, 97, 122, 0.4)' },
}

/**
 * Compact: shows only "important" tags (eggless/vegan + contains-nuts) — for product cards.
 * Verbose: shows everything — for the quick-view modal.
 */
export default function AllergenTags({ allergens, verbose = false, size = 'sm' }) {
  if (!Array.isArray(allergens) || allergens.length === 0) return null

  // What customers care about most at-a-glance: nut warnings and genuine
  // free-from facts.
  //
  // `eggless-option` is deliberately NOT here. Every baked product carries it,
  // so in compact mode it would put "Eggless on request" on all 120 cards —
  // a badge that appears everywhere tells you nothing, and it would drown the
  // nut warning that actually matters. It still shows in the quick view, where
  // `verbose` lists everything.
  const important = ['eggless', 'vegan', 'gluten-free', 'contains-nuts']
  const visible = verbose ? allergens : allergens.filter((a) => important.includes(a))
  if (visible.length === 0) return null

  const px = size === 'lg' ? '0.4rem 0.7rem' : '0.18rem 0.5rem'
  const fontSize = size === 'lg' ? '0.78rem' : '0.66rem'

  return (
    <div className="d-flex flex-wrap" style={{ gap: 4 }}>
      {visible.map((code) => {
        const meta = STYLES[code]
        if (!meta) return null
        const c = COLORS[meta.kind]
        return (
          <span
            key={code}
            title={meta.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize,
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: c.fg,
              background: c.bg,
              border: `1px solid ${c.border}`,
              padding: px,
              borderRadius: 999,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            <span aria-hidden style={{ fontSize: '0.9em' }}>{meta.icon}</span>
            {meta.label}
          </span>
        )
      })}
    </div>
  )
}
