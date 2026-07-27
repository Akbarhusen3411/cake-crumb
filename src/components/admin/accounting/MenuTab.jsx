import { useMemo, useState } from 'react'
import { FiPlus, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import Modal from '../Modal.jsx'
import SearchableSelect from '../SearchableSelect.jsx'
import { ACC, addDocRec, updateDocRec, deleteDocRec } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'

export default function MenuTab({ menu, reload }) {
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(() => new Set()) // manually-expanded categories
  const mobile = useIsMobile()

  const categories = useMemo(() => [...new Set(menu.map((m) => m.category).filter(Boolean))].sort(), [menu])

  // filter → group by category → group by item name
  const grouped = useMemo(() => {
    const s = q.trim().toLowerCase()
    const g = {}
    for (const m of menu) {
      if (cat && m.category !== cat) continue
      if (s && !(m.name || '').toLowerCase().includes(s)) continue
      const c = m.category || 'Other'
      ;(g[c] ||= {})
      ;(g[c][m.name] ||= []).push(m)
    }
    return g
  }, [menu, cat, q])

  const shownCats = Object.keys(grouped).sort()
  const filtering = !!(q.trim() || cat)
  const totalShown = shownCats.reduce((n, c) => n + Object.values(grouped[c]).reduce((k, v) => k + v.length, 0), 0)
  const isOpen = (c) => filtering || open.has(c)
  const toggle = (c) => setOpen((p) => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n })

  async function save(data) {
    setBusy(true)
    if (editing?.id) await updateDocRec(ACC.MENU, editing.id, data)
    else await addDocRec(ACC.MENU, data)
    setEditing(null); await reload(); setBusy(false)
  }
  async function remove(m) {
    if (!window.confirm(`Delete this price?\n${m.category} — ${m.name} (${m.variant || 'Standard'})`)) return
    setBusy(true); await deleteDocRec(ACC.MENU, m.id); await reload(); setBusy(false)
  }

  return (
    <div>
      <p className="text-muted small mb-3">These items feed the New Order form. Tap a category to open it; tap any price to edit.</p>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <button className="btn text-white d-inline-flex align-items-center gap-2" style={{ background: 'var(--cc-rose,#e0617a)', whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => setEditing({})}>
          <FiPlus /> New Item
        </button>
        <div style={{ minWidth: 190 }}>
          <SearchableSelect value={cat} onChange={setCat} options={categories} placeholder="All categories" />
        </div>
        <input className="form-control" style={{ maxWidth: 220 }} placeholder="Search item…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="ms-auto text-muted small">{totalShown} of {menu.length}</span>
      </div>

      {shownCats.length === 0 ? (
        <div className="text-center text-muted py-4" style={{ border: '1px solid #f0e0e3', borderRadius: 12 }}>No items.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 8, alignItems: 'start' }}>
          {shownCats.map((c) => {
            const items = grouped[c]
            const itemNames = Object.keys(items).sort()
            const priceCount = itemNames.reduce((n, name) => n + items[name].length, 0)
            const opened = isOpen(c)
            return (
              <div key={c} style={{ gridColumn: !mobile && opened ? '1 / -1' : 'auto' }}>
              <div style={{ border: '1px solid #f0e0e3', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                <button
                  type="button" onClick={() => toggle(c)}
                  style={{ width: '100%', textAlign: 'left', border: 0, background: '#f9eef1', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, color: '#7a4a58' }}
                >
                  {opened ? <FiChevronDown /> : <FiChevronRight />}
                  {c}
                  <span className="text-muted fw-normal" style={{ fontSize: 12 }}>
                    · {itemNames.length} item{itemNames.length === 1 ? '' : 's'} · {priceCount} price{priceCount === 1 ? '' : 's'}
                  </span>
                </button>
                {opened && (
                  <div className="d-flex flex-column">
                    {itemNames.map((name) => (
                      <div key={name} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
                        padding: '10px 14px', borderTop: '1px solid #f6e6ea' }}>
                        <div style={{ minWidth: 150, flex: '0 0 auto', fontWeight: 600, color: '#5b3e36' }}>{name}</div>
                        <div className="d-flex flex-wrap gap-2">
                          {items[name]
                            .slice()
                            .sort((a, b) => (a.price || 0) - (b.price || 0))
                            .map((m) => (
                              <span key={m.id}
                                onClick={() => setEditing(m)}
                                title="Click to edit"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                  border: '1px solid #eccdd4', borderRadius: 999, padding: '3px 10px', fontSize: 13,
                                  background: '#fff6f8', color: '#5b3e36' }}
                              >
                                <span style={{ color: '#977' }}>{m.variant || 'Standard'}</span>
                                <strong style={{ color: '#1b7f5e' }}>{inr(m.price)}</strong>
                                <button type="button" aria-label="Delete"
                                  onClick={(e) => { e.stopPropagation(); remove(m) }}
                                  style={{ border: 0, background: 'transparent', color: '#c99', padding: 0, lineHeight: 1, cursor: 'pointer' }}>
                                  <FiTrash2 size={12} />
                                </button>
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            )
          })}
        </div>
      )}
      {busy ? <div className="text-muted small mt-2">Saving…</div> : null}

      {editing !== null && (
        <MenuItemForm initial={editing.id ? editing : null} categories={categories} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function MenuItemForm({ initial, categories, onSave, onClose }) {
  const [f, setF] = useState({
    category: initial?.category || '',
    name: initial?.name || '',
    variant: initial?.variant || '',
    price: initial?.price ?? '',
  })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  function submit() {
    if (!f.name.trim()) return alert('Please enter an item name.')
    if ((Number(f.price) || 0) < 0) return alert('Price cannot be negative.')
    onSave({ category: f.category.trim(), name: f.name.trim(), variant: f.variant.trim(), price: Number(f.price) || 0 })
  }
  return (
    <Modal
      title={initial ? 'Edit Menu Item' : 'New Menu Item'}
      onClose={onClose}
      footer={<>
        <button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn text-white" style={{ background: 'var(--cc-rose,#e0617a)' }} onClick={submit}>Save</button>
      </>}
    >
      <div className="row g-3">
        <div className="col-12"><label className="form-label small fw-semibold">Category</label>
          <SearchableSelect value={f.category} onChange={(v) => set('category', v)} options={categories} placeholder="Pick / type…" allowCustom /></div>
        <div className="col-12"><label className="form-label small fw-semibold">Item name</label>
          <input className="form-control" value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div className="col-7"><label className="form-label small fw-semibold">Variant / Size</label>
          <input className="form-control" placeholder="e.g. Tub, Whole, Per slice" value={f.variant} onChange={(e) => set('variant', e.target.value)} /></div>
        <div className="col-5"><label className="form-label small fw-semibold">Price (₹)</label>
          <input type="number" min="0" className="form-control" value={f.price} onChange={(e) => set('price', e.target.value)} /></div>
      </div>
    </Modal>
  )
}
