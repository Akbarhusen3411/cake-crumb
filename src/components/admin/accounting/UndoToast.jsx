import { useEffect, useState } from 'react'
import { FiRotateCcw, FiX } from 'react-icons/fi'

/**
 * "Marked paid · Undo" — a short-lived bar at the bottom of the screen after a
 * one-tap action that moves money (Mark paid, To cash, Delete). Those are big
 * buttons on a phone card, easy to hit while scrolling, and each one changes
 * Earnings, Profit or Money in hand with nothing on screen to say so.
 *
 * `toast` is { id, msg, undo } or null. A new id restarts the timer, so a
 * second action replaces the first rather than queueing behind it. Undo runs
 * once and closes the bar.
 */
const SHOW_MS = 6000

export default function UndoToast({ toast, onClose }) {
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(onClose, SHOW_MS)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  async function undo() {
    if (running) return
    setRunning(true)
    try { await toast.undo() } finally { setRunning(false); onClose() }
  }

  return (
    <div className="cc-undo" role="status" aria-live="polite" key={toast.id}>
      <span className="cc-undo__msg">{toast.msg}</span>
      <button type="button" className="cc-undo__btn" onClick={undo} disabled={running}>
        <FiRotateCcw /> {running ? 'Undoing…' : 'Undo'}
      </button>
      <button type="button" className="cc-undo__x" onClick={onClose} aria-label="Dismiss"><FiX /></button>
    </div>
  )
}
