import { useMemo, useRef, useState } from 'react'
import { FiPlus, FiTrash2, FiChevronDown, FiSearch, FiX, FiEdit2, FiCheck, FiMoreHorizontal } from 'react-icons/fi'
import Modal from '../Modal.jsx'
import SearchableSelect from '../SearchableSelect.jsx'
import { ACC, addDocRec, updateDocRec, deleteDocRec } from '../../../services/accounting.js'
import { inr } from '../../../data/format.js'
import { sortVariants, variantLabel } from '../../../utils/orderItems.js'

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export default function MenuTab({ menu, reload }) {
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const savingRef = useRef(false)
  const [open, setOpen] = useState('') // the one manually-expanded category

  const categories = useMemo(() => [...new Set(menu.map((m) => m.category).filter(Boolean))].sort(), [menu])
  // Items per category for the chips — counted over the whole menu, so a chip
  // doesn't drop to 0 just because a search is typed.
  const catCounts = useMemo(() => {
    const n = {}
    for (const m of menu) (n[m.category || 'Other'] ||= new Set()).add(m.name)
    return n
  }, [menu])

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
  const isOpen = (c) => filtering || open === c
  // One category at a time: opening Cheesecake closes Cake Pop. Several open at
  // once (Cheesecake alone is 23 items) buried the next heading pages down.
  // Filtering still opens everything that matched — that's the point of it.
  const toggle = (c) => setOpen((p) => (p === c ? '' : c))

  // Locked like the other forms: a double tap on Save made two price rows.
  async function save(data) {
    if (savingRef.current) return
    savingRef.current = true
    setBusy(true)
    try {
      if (editing?.id) await updateDocRec(ACC.MENU, editing.id, data)
      else await addDocRec(ACC.MENU, data)
      setEditing(null)
    } finally {
      setBusy(false)
      savingRef.current = false
    }
    reload()
  }
  // Just the price, from the tile itself — the full form was a whole sheet to
  // change one number.
  async function quickSave(m, price) {
    setBusy(true); await updateDocRec(ACC.MENU, m.id, { price }); await reload(); setBusy(false)
  }
  async function remove(m) {
    if (!window.confirm(`Delete this price?\n${m.category} — ${m.name} (${m.variant || 'Standard'})`)) return
    setBusy(true); await deleteDocRec(ACC.MENU, m.id); await reload(); setBusy(false)
  }

  return (
    <div className="cc-mmenu">
      {/* Search and New item share a line; the categories are a chip row under
          it. A dropdown was two taps and hid which categories existed. */}
      <div className="cc-mmenu__bar">
        <label className="cc-mmenu__search">
          <FiSearch aria-hidden="true" />
          <input type="search" placeholder="Search item…" value={q}
            onChange={(e) => setQ(e.target.value)} aria-label="Search menu items" spellCheck={false} />
          {q ? (
            <button type="button" className="cc-mmenu__clear" aria-label="Clear search" onClick={() => setQ('')}><FiX /></button>
          ) : null}
        </label>
        <button type="button" className="cc-mmenu__new" aria-label="New item" onClick={() => setEditing({ category: cat })}>
          <FiPlus /> <span>New item</span>
        </button>
      </div>

      <div className="cc-mmenu__chips" role="radiogroup" aria-label="Category">
        <button type="button" role="radio" aria-checked={!cat}
          className={`cc-mmenu__chip${!cat ? ' cc-mmenu__chip--on' : ''}`} onClick={() => setCat('')}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={cat === c}
            className={`cc-mmenu__chip${cat === c ? ' cc-mmenu__chip--on' : ''}`}
            onClick={() => setCat(cat === c ? '' : c)}>
            {c} <i>{catCounts[c]?.size || 0}</i>
          </button>
        ))}
      </div>

      <p className="cc-mmenu__hint">
        {filtering ? `${plural(totalShown, 'price')} shown of ${menu.length}` : `${plural(categories.length, 'category', 'categories')} · ${menu.length} prices`}
        {' — '}these feed the New Order form. Tap a price to change it.
      </p>

      {shownCats.length === 0 ? (
        <div className="cc-mmenu__empty">No items match.</div>
      ) : (
        <div className="cc-mmenu__cats">
          {shownCats.map((c) => {
            const items = grouped[c]
            const itemNames = Object.keys(items).sort()
            const rows = itemNames.flatMap((n) => items[n])
            const prices = rows.map((m) => Number(m.price) || 0).filter((p) => p > 0)
            const lo = prices.length ? Math.min(...prices) : 0
            const hi = prices.length ? Math.max(...prices) : 0
            const opened = isOpen(c)
            return (
              <section key={c} className={`cc-mcat${opened ? ' cc-mcat--open' : ''}`}>
                <button type="button" className="cc-mcat__head" onClick={() => toggle(c)} aria-expanded={opened}>
                  <span className="cc-mcat__badge" aria-hidden="true">{c.charAt(0)}</span>
                  <span className="cc-mcat__title">
                    <b>{c}</b>
                    <small>{plural(itemNames.length, 'item')} · {plural(rows.length, 'price')}</small>
                  </span>
                  {prices.length ? (
                    <span className="cc-mcat__range">{lo === hi ? inr(lo) : `${inr(lo)} – ${inr(hi)}`}</span>
                  ) : null}
                  <FiChevronDown className="cc-mcat__chev" aria-hidden="true" />
                </button>
                {opened && (
                  <div className="cc-mcat__body">
                    {itemNames.map((name) => (
                      <div key={name} className="cc-mitem">
                        <div className="cc-mitem__head">
                          <span className="cc-mitem__name">{name}</span>
                          <button type="button" className="cc-mitem__add" title={`Add a size to ${name}`}
                            aria-label={`Add a size to ${name}`}
                            onClick={() => setEditing({ category: c, name })}><FiPlus /> Size</button>
                        </div>
                        <ul className="cc-mitem__prices">
                          {sortVariants(items[name]).map((m) => (
                            <PriceTile key={m.id} m={m} name={name} onQuickSave={quickSave}
                              onFull={() => setEditing(m)} onDelete={() => remove(m)} />
                          ))}
                        </ul>
                      </div>
                    ))}
                    <button type="button" className="cc-mcat__additem" onClick={() => setEditing({ category: c })}>
                      <FiPlus /> Add an item to {c}
                    </button>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
      {busy ? <div className="text-muted small mt-2">Saving…</div> : null}

      {editing !== null && (
        <MenuItemForm initial={editing} categories={categories} saving={busy} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

/**
 * One size's price. Tapping it opens a price box right in the tile — Enter or
 * ✓ saves, Esc or ✕ cancels, and ⋯ opens the full form for renaming the size
 * or moving it to another item. Nothing saves on blur: a tap elsewhere while
 * typing shouldn't change what a walk-in is charged.
 */
function PriceTile({ m, name, onQuickSave, onFull, onDelete }) {
  const [val, setVal] = useState(null) // null = not editing
  const [saving, setSaving] = useState(false)
  const label = variantLabel(m.variant) || 'Standard'
  const n = Number(val)
  const bad = val !== null && (val.trim() === '' || !Number.isFinite(n) || n < 0)

  async function commit(e) {
    e.preventDefault()
    if (bad || saving) return
    if (n === Number(m.price)) { setVal(null); return }
    setSaving(true)
    await onQuickSave(m, n)
    setSaving(false)
    setVal(null)
  }

  if (val !== null) {
    return (
      <li className="cc-mitem__quick">
        <form onSubmit={commit}>
          <span className="cc-mitem__var">{label}</span>
          <label className={`cc-mitem__qbox${bad ? ' cc-mitem__qbox--bad' : ''}`}>
            <span aria-hidden="true">₹</span>
            <input autoFocus type="text" inputMode="decimal" value={val} disabled={saving}
              aria-label={`New price for ${name} — ${label}`} aria-invalid={bad || undefined}
              onChange={(e) => setVal(e.target.value.replace(/[^\d.]/g, ''))}
              onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setVal(null) } }}
              onFocus={(e) => e.target.select()} />
          </label>
          <button type="submit" className="cc-mitem__qbtn cc-mitem__qbtn--ok" disabled={bad || saving}
            aria-label="Save price" title="Save"><FiCheck /></button>
          <button type="button" className="cc-mitem__qbtn" onClick={() => setVal(null)} disabled={saving}
            aria-label="Cancel" title="Cancel"><FiX /></button>
          <button type="button" className="cc-mitem__qbtn" onClick={() => { setVal(null); onFull() }} disabled={saving}
            aria-label="Edit size and name" title="Edit size, name or category"><FiMoreHorizontal /></button>
        </form>
      </li>
    )
  }

  return (
    <li>
      <button type="button" className="cc-mitem__price" onClick={() => setVal(String(m.price ?? ''))}
        title="Change this price">
        <span className="cc-mitem__var">{label}</span>
        <b>{inr(m.price)}</b>
        <FiEdit2 className="cc-mitem__pen" aria-hidden="true" />
      </button>
      <button type="button" className="cc-mitem__del" aria-label={`Delete ${name} ${label}`}
        title="Delete this price" onClick={onDelete}><FiTrash2 /></button>
    </li>
  )
}

// `initial` may be a saved row (has an id → editing) or just a prefill —
// { category } from "Add an item to …", { category, name } from "+ Size".
function MenuItemForm({ initial, categories, saving, onSave, onClose }) {
  const editing = !!initial?.id
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
      title={editing ? 'Edit price' : (initial?.name ? `New size — ${initial.name}` : 'New menu item')}
      onClose={onClose}
      footer={<>
        <button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn text-white" style={{ background: 'var(--cc-rose,#e0617a)' }} onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </>}
    >
      <div className="row g-3">
        <div className="col-12"><label className="form-label small fw-semibold">Category</label>
          <SearchableSelect value={f.category} onChange={(v) => set('category', v)} options={categories}
            placeholder="Pick / type…" title="Category" allowCustom /></div>
        <div className="col-12"><label className="form-label small fw-semibold">Item name</label>
          <input className="form-control" value={f.name} onChange={(e) => set('name', e.target.value)} spellCheck={false} /></div>
        <div className="col-7"><label className="form-label small fw-semibold">Variant / Size</label>
          <input className="form-control" placeholder="e.g. Tub, Whole, Per slice" value={f.variant}
            onChange={(e) => set('variant', e.target.value)} autoFocus={!!initial?.name && !editing} /></div>
        <div className="col-5"><label className="form-label small fw-semibold">Price (₹)</label>
          <input type="number" min="0" inputMode="decimal" className="form-control" value={f.price}
            onChange={(e) => set('price', e.target.value)} /></div>
      </div>
    </Modal>
  )
}
