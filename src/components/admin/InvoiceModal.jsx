import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { FiPrinter, FiX } from 'react-icons/fi'
import Logo from '../Logo.jsx'
import HeartDivider from '../HeartDivider.jsx'
import { inr } from '../../data/format.js'
import { fmtDate } from '../../utils/adminDate.js'
import { invoiceQuote } from '../../utils/invoice.js'
import { FSSAI, UDYAM } from '../../data/certifications.js'

// Bakery details, matching index.html's meta/JSON-LD and the Footer.
const BAKERY = {
  address: 'Vaso, Kheda, Gujarat 387380, India',
  phone: '+91 91731 83440',
  email: 'cakeandcrumb.in@gmail.com',
}

/**
 * A printable invoice. Shared by both admin pages — `invoice` is the normalised
 * shape the builders in utils/invoice.js produce, so this component never has to
 * know whether it came from a walk-in in the accounting book or a customer order
 * off the website.
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
export default function InvoiceModal({ invoice, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  if (!invoice) return null

  const { customer = {}, lines = [] } = invoice
  // Only worth breaking the total down when there's something to break out.
  const showBreakdown = Number(invoice.delivery) > 0

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
              <div className="cc-invoice-no">{invoice.number}</div>
              {invoice.reference ? <div className="cc-invoice-ref">Order {invoice.reference}</div> : null}
              <div className="cc-invoice-date">{fmtDate(invoice.date)}</div>
            </div>
          </div>

          <div className="cc-invoice-contact">
            {BAKERY.address}<br />
            {BAKERY.phone} · {BAKERY.email}
          </div>

          <div className="text-center"><HeartDivider width={54} /></div>

          <div className="cc-invoice-billto">
            <span className="cc-invoice-label">Billed to</span>
            <span>
              <span className="cc-invoice-customer">{customer.name || '—'}</span>
              {customer.phone ? <span className="cc-invoice-sub"> · {customer.phone}</span> : null}
              {customer.address ? <div className="cc-invoice-sub">{customer.address}</div> : null}
            </span>
          </div>

          {invoice.fulfilment ? <div className="cc-invoice-fulfil">{invoice.fulfilment}</div> : null}

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
              {lines.map((l, i) => (
                <tr key={i}>
                  <td>
                    {l.label}
                    {l.sub ? <span className="cc-invoice-variant"> — {l.sub}</span> : null}
                  </td>
                  <td className="num">{l.qty}</td>
                  <td className="num">{inr(l.rate)}</td>
                  <td className="num">{inr(l.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {showBreakdown ? (
                <>
                  <tr className="cc-invoice-subrow">
                    <td colSpan={3} className="num">Subtotal</td>
                    <td className="num">{inr(invoice.subtotal)}</td>
                  </tr>
                  <tr className="cc-invoice-subrow">
                    <td colSpan={3} className="num">Delivery</td>
                    <td className="num">{inr(invoice.delivery)}</td>
                  </tr>
                </>
              ) : null}
              <tr>
                <td colSpan={3} className="num cc-invoice-total-label">Total</td>
                <td className="num cc-invoice-total">{inr(invoice.total)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="cc-invoice-pay">
            <span className={`cc-invoice-status ${invoice.paid ? 'is-paid' : 'is-unpaid'}`}>
              {invoice.statusLabel}
            </span>
            {invoice.methodLabel ? <span className="cc-invoice-method">{invoice.methodLabel}</span> : null}
          </div>
          {invoice.balanceNote ? <div className="cc-invoice-balance">{invoice.balanceNote}</div> : null}

          {invoice.notes ? <div className="cc-invoice-notes"><strong>Note:</strong> {invoice.notes}</div> : null}

          <div className="cc-invoice-foot">
            <div className="cc-invoice-quote">{invoiceQuote(invoice.quoteKey)}</div>
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
