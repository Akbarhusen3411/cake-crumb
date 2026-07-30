import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { FiPrinter, FiX } from 'react-icons/fi'
import Logo from '../Logo.jsx'
import HeartDivider from '../HeartDivider.jsx'
import { inr } from '../../data/format.js'
import { fmtDate } from '../../utils/adminDate.js'
import { invoiceQuote } from '../../utils/invoice.js'
import { FSSAI, UDYAM } from '../../data/certifications.js'
import { useIsMobile } from '../../hooks/useIsMobile.js'

// Bakery details, matching index.html's meta/JSON-LD and the Footer.
const BAKERY = {
  address: 'Vaso, Kheda, Gujarat 387380, India',
  phone: '+91 91731 83440',
  email: 'cakeandcrumb.in@gmail.com',
  instagram: '@cake_and_crumb_1',
}

/**
 * The invoice as a self-contained document, for the mobile print path below.
 *
 * The app's own <style>/<link> tags are copied by reference, so the sheet is the
 * one already on screen and there's no second copy of the invoice CSS to keep in
 * step. Two details make that work and are easy to break:
 *   - <base> is required. The frame is written with srcdoc, whose base URL is
 *     `about:srcdoc`, so without it every relative href resolves to nothing and
 *     the sheet arrives unstyled.
 *   - the node is wrapped in .cc-invoice-overlay, because index.css's own print
 *     rule hides `body > *:not(.cc-invoice-overlay)` — a bare .cc-invoice would
 *     be hidden by the very stylesheet just copied in.
 * The trailing <style> then neutralises the overlay's on-screen backdrop and
 * restates @page, since this document must stand on its own.
 *
 * <title> is what names the saved PDF.
 */
function standaloneInvoiceHtml(node, number) {
  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  ).map((n) => n.outerHTML).join('\n')

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${document.baseURI}">
<title>Invoice ${String(number || '').replace(/[<>&"]/g, '')}</title>
${styles}
<style>
  @page { size: A4 landscape; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; overflow: visible; }
  .cc-invoice-overlay {
    position: static; inset: auto; background: #fff;
    display: block; padding: 0; overflow: visible; z-index: auto;
  }
  .cc-invoice-sheet, .cc-invoice { max-width: 190mm; margin: 0 auto; }
  .cc-invoice-actions, .cc-invoice-close { display: none; }
</style>
</head><body>
<div class="cc-invoice-overlay">${node.outerHTML}</div>
</body></html>`
}

/**
 * Print the invoice from a hidden iframe.
 *
 * Printing the page in place works on desktop and does NOT work on the owner's
 * phone — it was tried, and came back blank. Mobile browsers paginate from the
 * layout viewport rather than re-laying the document out for paged media, so the
 * modal's portal-over-app document defeats them however the CSS is written.
 * Handing them a small document with nothing to hide is what actually works.
 *
 * An iframe rather than window.open: a visible second tab worked too, but the
 * owner asked for the print dialog to come up on the tap with nothing in
 * between. Same isolation, no window.
 *
 * The frame is left in the DOM for a minute — removing it as soon as print()
 * returns cancels the job in browsers where the dialog is asynchronous.
 */
function printViaIframe(node, number) {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe')
    frame.setAttribute('aria-hidden', 'true')
    frame.setAttribute('tabindex', '-1')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;opacity:0;border:0;'
    frame.onload = () => {
      const win = frame.contentWindow
      if (!win) { frame.remove(); reject(new Error('no frame window')); return }
      const go = () => {
        try {
          win.focus()
          win.print()
          resolve()
        } catch (err) {
          frame.remove()
          reject(err)
          return
        }
        setTimeout(() => frame.remove(), 60000)
      }
      // Wait for the copied stylesheet and the webfonts, or the sheet prints in
      // fallback fonts at the wrong metrics.
      const fonts = win.document.fonts
      if (fonts?.ready) fonts.ready.then(() => setTimeout(go, 120)).catch(() => setTimeout(go, 500))
      else setTimeout(go, 500)
    }
    frame.onerror = () => { frame.remove(); reject(new Error('frame failed')) }
    document.body.appendChild(frame)
    frame.srcdoc = standaloneInvoiceHtml(node, number)
  })
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
  const titleRef = useRef('')
  const sheetRef = useRef(null)
  const [printErr, setPrintErr] = useState('')
  const isMobile = useIsMobile()
  // The single reference printed on the sheet (see the ids block in the markup).
  // It names the saved PDF too, so the file and the paper agree.
  const printRef = invoice?.reference || invoice?.number || ''

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  // Restore the page title if the modal closes mid-print — see handlePrint.
  useEffect(() => () => {
    if (titleRef.current) { document.title = titleRef.current; titleRef.current = '' }
  }, [])

  /**
   * Print the page itself. Correct on desktop, and the fallback everywhere else.
   *
   * The title swap is what names the saved PDF: browsers take the filename from
   * document.title, which here would otherwise be the admin page's own title.
   */
  function printInPlace() {
    const original = document.title
    const printTitle = `Invoice ${printRef}`.trim()
    titleRef.current = original
    document.title = printTitle

    const restore = () => {
      // Only if nothing else has claimed the title in the meantime.
      if (document.title === printTitle) document.title = original
      titleRef.current = ''
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    // iOS Safari never fires afterprint, so don't rely on it alone.
    setTimeout(restore, 20000)

    try { window.print() } catch { restore(); setPrintErr('Printing was blocked by the browser.') }
  }

  /**
   * Desktop prints in place; a phone prints from the hidden frame.
   *
   * Printing in place was tried on mobile and came back blank — twice — so the
   * split is empirical, not theoretical. Whatever the CSS says, mobile browsers
   * won't paginate this portal-over-app document; they will happily print a
   * small self-contained one. Note that devtools "mobile view" cannot reproduce
   * any of this: it resizes the viewport but keeps the desktop print engine, so
   * it reports success either way.
   */
  function handlePrint() {
    setPrintErr('')
    if (typeof window.print !== 'function') {
      setPrintErr('This browser has no print support. Open the page in Chrome or Safari.')
      return
    }
    const node = sheetRef.current?.querySelector('.cc-invoice')
    if (!isMobile || !node) { printInPlace(); return }

    printViaIframe(node, printRef).catch(() => {
      // Some mobile browsers (notably older iOS Safari) refuse to print a frame.
      // Falling back is better than a button that does nothing.
      printInPlace()
    })
  }

  if (!invoice) return null

  const { customer = {}, lines = [] } = invoice
  // Only worth breaking the total down when there's something to break out.
  const showBreakdown = Number(invoice.delivery) > 0

  return createPortal(
    <div className="cc-invoice-overlay" onMouseDown={onClose}>
      <div className="cc-invoice-sheet" ref={sheetRef} onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="cc-invoice-close" aria-label="Close" title="Close" onClick={onClose}>
          <FiX />
        </button>
        <div className="cc-invoice">
          <div className="cc-invoice-head">
            <div className="cc-invoice-brand"><Logo size="sm" /></div>
            <div className="cc-invoice-meta">
              <div className="cc-invoice-title">Invoice</div>
              <div className="cc-invoice-date">{fmtDate(invoice.date)}</div>
            </div>
          </div>

          {/* ONE reference, centred under both corners — it's what gets quoted
              back over the phone, so it shouldn't be tucked into a corner.
              It used to print two: this order's number AND a separate invoice
              number hashed from the doc id. Two near-identical codes on one small
              bill is a liability when someone reads one aloud, and the hashed one
              can't be looked up anywhere — the order number is the one that
              exists in the admin list and in search. The hash stays as the
              fallback for rows that predate order numbers, so a sheet is never
              unlabelled. */}
          <div className="cc-invoice-ids">
            <span className="cc-invoice-no">{printRef}</span>
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
            {showBreakdown ? (
              <tfoot>
                <tr className="cc-invoice-subrow">
                  <td colSpan={3} className="num">Subtotal</td>
                  <td className="num">{inr(invoice.subtotal)}</td>
                </tr>
                <tr className="cc-invoice-subrow">
                  <td colSpan={3} className="num">Delivery</td>
                  <td className="num">{inr(invoice.delivery)}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>

          {/* One closing line: how it was paid on the left, what it came to on
              the right. The two answer the same question and belong together. */}
          <div className="cc-invoice-summary">
            <div className="cc-invoice-pay">
              <span className={`cc-invoice-status ${invoice.paid ? 'is-paid' : 'is-unpaid'}`}>
                {invoice.statusLabel}
              </span>
              {invoice.methodLabel ? <span className="cc-invoice-method">{invoice.methodLabel}</span> : null}
            </div>
            <div className="cc-invoice-grand">
              <span className="cc-invoice-total-label">Total</span>
              <span className="cc-invoice-total">{inr(invoice.total)}</span>
            </div>
          </div>
          {invoice.balanceNote ? <div className="cc-invoice-balance">{invoice.balanceNote}</div> : null}

          {invoice.notes ? <div className="cc-invoice-notes"><strong>Note:</strong> {invoice.notes}</div> : null}

          <div className="cc-invoice-foot">
            <div className="cc-invoice-quote">{invoiceQuote(invoice.quoteKey)}</div>
            <div className="cc-invoice-thanks">Thank you for your order ♥</div>
            {/* Contact sits at the foot, not under the header: the items and the
                total are what the customer looks for, and the bakery's own
                details are what they come back to afterwards. */}
            <div className="cc-invoice-contact">
              {BAKERY.address}<br />
              {BAKERY.phone} · {BAKERY.email} · {BAKERY.instagram}
            </div>
            <div className="cc-invoice-regs">
              FSSAI {FSSAI.number} · {UDYAM.number}
            </div>
          </div>
        </div>

        <div className="cc-invoice-actions">
          <button className="btn text-white d-inline-flex align-items-center gap-2"
            style={{ background: 'var(--cc-rose,#e0617a)' }} onClick={handlePrint}>
            <FiPrinter /> Print / Save as PDF
          </button>
          {printErr ? <div className="cc-invoice-printerr">{printErr}</div> : null}
        </div>
      </div>
    </div>,
    document.body
  )
}
