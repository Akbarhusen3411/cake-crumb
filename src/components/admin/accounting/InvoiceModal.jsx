import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { FiPrinter, FiX } from 'react-icons/fi'
import Logo from '../../Logo.jsx'
import HeartDivider from '../../HeartDivider.jsx'
import { inr } from '../../../data/format.js'
import { fmtDate } from '../../../utils/adminDate.js'
import { orderLines, fullItem } from '../../../utils/orderItems.js'
import { invoiceNumber, invoiceQuote } from '../../../utils/invoice.js'
import { orderTotal } from '../../../services/accounting.js'
import { FSSAI, UDYAM } from '../../../data/certifications.js'

// Bakery details, matching index.html's meta/JSON-LD and the Footer.
const BAKERY = {
  address: 'Vaso, Kheda, Gujarat 387380, India',
  phone: '+91 91731 83440',
  email: 'cakeandcrumb.in@gmail.com',
}

/**
 * A printable invoice for one accounting order.
 *
 * Print-to-PDF rather than a PDF library: jsPDF/html2canvas would add a few
 * hundred KB and rasterise the page, so the text couldn't be selected or
 * searched. Printing keeps real Playfair/Lato text, and the browser's
 * "Save as PDF" is one click in the same dialog as printing on paper.
 *
 * Rendered through a portal onto document.body so the print rule can simply
 * hide #root — hiding the app in place leaves its layout behind and Chrome
 * emits blank pages for it.
 *
 * No GST line: the bakery has no GSTIN, and a tax line without one would be
 * wrong. FSSAI and Udyam numbers DO belong here — showing the FSSAI number is
 * required of a food business, and an invoice is exactly where it's expected.
 * Numbers only, never the certificate scans (see data/certifications.js).
 */
export default function InvoiceModal({ order, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  if (!order) return null

  const lines = orderLines(order).filter((it) => it.item || it.category)
  const total = orderTotal(order)
  const paid = !!order.paid

  return createPortal(
    <div className="cc-invoice-overlay" onMouseDown={onClose}>
      <div className="cc-invoice-sheet" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="cc-invoice-close" aria-label="Close" title="Close" onClick={onClose}>
          <FiX />
        </button>
        <div className="cc-invoice">
          <div className="cc-invoice-head">
            <div className="cc-invoice-brand"><Logo size="sm" /></div>
            <div className="cc-invoice-meta">
              <div className="cc-invoice-title">Invoice</div>
              <div className="cc-invoice-no">{invoiceNumber(order)}</div>
              <div className="cc-invoice-date">{fmtDate(order.date)}</div>
            </div>
          </div>

          <div className="cc-invoice-contact">
            {BAKERY.address}<br />
            {BAKERY.phone} · {BAKERY.email}
          </div>

          <div className="text-center"><HeartDivider width={54} /></div>

          <div className="cc-invoice-billto">
            <span className="cc-invoice-label">Billed to</span>
            <span className="cc-invoice-customer">{order.customer || '—'}</span>
          </div>

          <table className="cc-invoice-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Qty</th>
                <th className="num">Rate</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((it, i) => {
                const qty = Number(it.qty) || 0
                const rate = Number(it.unitPrice) || 0
                return (
                  <tr key={i}>
                    <td>
                      {fullItem(it)}
                      {it.variant ? <span className="cc-invoice-variant"> — {it.variant}</span> : null}
                    </td>
                    <td className="num">{qty}</td>
                    <td className="num">{inr(rate)}</td>
                    <td className="num">{inr(Math.round(qty * rate))}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="num cc-invoice-total-label">Total</td>
                <td className="num cc-invoice-total">{inr(total)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="cc-invoice-pay">
            <span className={`cc-invoice-status ${paid ? 'is-paid' : 'is-unpaid'}`}>
              {paid ? 'Paid' : 'Payment pending'}
            </span>
            <span className="cc-invoice-method">{order.method}</span>
          </div>

          {order.notes ? <div className="cc-invoice-notes"><strong>Note:</strong> {order.notes}</div> : null}

          <div className="cc-invoice-foot">
            <div className="cc-invoice-quote">{invoiceQuote(order)}</div>
            <div className="cc-invoice-thanks">Thank you for your order ♥</div>
            <div className="cc-invoice-regs">
              FSSAI {FSSAI.number} · {UDYAM.number}
            </div>
          </div>
        </div>

        <div className="cc-invoice-actions">
          <button className="btn text-white d-inline-flex align-items-center gap-2"
            style={{ background: 'var(--cc-rose,#e0617a)' }} onClick={() => window.print()}>
            <FiPrinter /> Print / Save as PDF
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
