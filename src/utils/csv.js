// CSV for the admin lists — "give this to the accountant" in one click. The
// Danger-zone backup is JSON, which restores the app but doesn't open in Excel.

/** One cell, quoted only when it has to be. */
const cell = (v) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCsv = (headers, rows) =>
  [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')

/**
 * Download `rows` as a .csv.
 *
 * Money goes in as **plain numbers, never `inr()` strings** — "₹1,880.00" is
 * text to a spreadsheet and won't sum, which is the one thing this file is for.
 * Dates go in as ISO so they sort. The leading BOM is what makes Excel read it
 * as UTF-8; without it ₹ and any non-ASCII name arrive as mojibake.
 */
export function downloadCsv(filename, headers, rows) {
  const blob = new Blob(['﻿', toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
