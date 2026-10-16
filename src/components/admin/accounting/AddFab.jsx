import { FiPlus } from 'react-icons/fi'

/**
 * A round "+" fixed bottom-right on a phone, for the Orders and Expenses lists.
 * Their New button sits at the top of the toolbar and scrolls away with a long
 * list; this keeps it under the thumb. Phone only (the tab decides), and only
 * while no form is open. `label` is its accessible name.
 */
export default function AddFab({ label, onClick }) {
  return (
    <button type="button" className="cc-fab" onClick={onClick} aria-label={label} title={label}>
      <FiPlus aria-hidden="true" />
    </button>
  )
}
