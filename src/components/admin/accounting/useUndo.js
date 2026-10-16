import { useCallback, useRef, useState } from 'react'

/**
 * State for <UndoToast>: `offerUndo(msg, undo)` shows the bar, and pressing
 * Undo runs `undo` and then `reload()` so the list shows the row back.
 * Shared by Orders, Expenses and My Money so the three behave the same.
 */
export function useUndo(reload) {
  const [toast, setToast] = useState(null) // { id, msg, undo }
  const seq = useRef(0)
  const closeToast = useCallback(() => setToast(null), [])
  const offerUndo = useCallback((msg, undo) => {
    setToast({ id: ++seq.current, msg, undo: async () => { await undo(); await reload() } })
  }, [reload])
  return { toast, offerUndo, closeToast }
}

/** A deleted row's fields minus its id, so re-adding it makes a fresh doc. */
export const withoutId = (row) => {
  const rest = { ...row }
  delete rest.id
  return rest
}
