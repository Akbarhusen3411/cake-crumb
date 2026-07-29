// Pill-chip filter row shared by the Orders and Expenses tabs.
// `options` is [{ key, label }]; `value` is the selected key. The option lists
// live in the tabs (this file exports only the component, for fast refresh).
export default function FilterChips({ label, options, value, onChange }) {
  return (
    <div className="cc-filter-group d-flex align-items-center gap-1 flex-wrap">
      <span className="cc-filter-label small text-muted me-1">{label}</span>
      {options.map((o) => {
        const on = value === o.key
        return (
          <button
            key={o.key} type="button" onClick={() => onChange(o.key)}
            className="btn btn-sm"
            style={{
              borderRadius: 999, fontSize: 13, padding: '2px 12px', border: '1px solid',
              borderColor: on ? 'var(--cc-rose,#e0617a)' : '#f0e0e3',
              background: on ? 'var(--cc-rose,#e0617a)' : '#fff',
              color: on ? '#fff' : '#7a584d',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
