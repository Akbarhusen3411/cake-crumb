import { exportAccountingBackup, markBackupTaken } from '../services/accounting.js'

/**
 * Download the whole book as JSON and stamp the backup date. Shared by the
 * Danger zone button and the Dashboard's backup reminder, so a backup taken
 * from either one resets the reminder. Resolves to the time stamped.
 */
export async function downloadAccountingBackup() {
  const obj = await exportAccountingBackup()
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cake-crumb-accounting-backup-${obj.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return markBackupTaken()
}
