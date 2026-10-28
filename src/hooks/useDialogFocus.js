import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Focus handling for a modal dialog (the Diwali welcome, the product quick
 * view): while `active`, focus moves into `ref` (the dialog itself, which
 * should carry tabIndex={-1}), Tab and Shift+Tab wrap inside it instead of
 * walking onto the blurred page behind, and on close focus goes back to
 * whatever had it before (the Shop card that opened the quick view). When
 * that element is gone, it falls back to the page's <main>.
 *
 * Deliberately NOT applied to the admin Modal (see CLAUDE.md — its
 * SearchableSelect portals outside the sheet).
 */
export function useDialogFocus(ref, active) {
  useEffect(() => {
    if (!active) return undefined
    const before = document.activeElement
    const node = ref.current
    node?.focus({ preventScroll: true })

    const onKey = (e) => {
      if (e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (!items.length) { e.preventDefault(); return }
      const first = items[0]
      const last = items[items.length - 1]
      const inside = ref.current.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current || !inside)) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      const back = before && document.contains(before) && before !== document.body ? before : document.querySelector('main')
      if (back) {
        if (back.tagName === 'MAIN' && !back.hasAttribute('tabindex')) back.setAttribute('tabindex', '-1')
        back.focus?.({ preventScroll: true })
      }
    }
  }, [ref, active])
}
