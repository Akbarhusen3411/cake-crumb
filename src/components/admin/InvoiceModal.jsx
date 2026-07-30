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
 * Build a standalone document around the rendered invoice node for the mobile
 * print path.
 *
 * The app's own <style>/<link> tags are copied by reference so the sheet is
 * byte-for-byte the one on screen — no second copy of the invoice CSS to keep in
 * step. Two details make that safe:
 *   - <base> is required, or the copied stylesheet href (relative, and under the
 *     /cake-crumb/ base path) resolves against the new blank document and the
 *     page arrives unstyled.
 *   - the node is wrapped in .cc-invoice-overlay because index.css's print rule
 *     hides `body > *:not(.cc-invoice-overlay)`; a bare .cc-invoice child of
 *     <body> would be hidden by the very stylesheet we just copied in.
 * The trailing <style> block then neutralises the overlay's on-screen backdrop
 * and re-states the @page rules.
 *
 * The <title> matters beyond the tab: Chrome and Safari name the saved PDF after
 * it, so this is what puts "Invoice CC-INV-…pdf" in the customer's downloads.
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
  html, body { margin: 0; background: #fff; overflow: visible; }
  .cc-invoice-overlay {
    position: static; inset: auto; background: #fff;
    display: block; padding: 0; overflow: visible; z-index: auto;
  }
  .cc-invoice { max-width: 560px; margin: 0 auto; }
  .cc-print-again {
    display: block; margin: 0 auto 2rem; padding: 0.7rem 1.4rem;
    font: inherit; color: #fff; background: #e0617a;
    border: 0; border-radius: 999px; cursor: pointer;
  }
  @media print {
    .cc-print-again { display: none !important; }
    .cc-invoice { max-width: none; margin: 0; }
  }
</style>
</head><body>
<div class="cc-invoice-overlay">${node.outerHTML}</div>
<button type="button" class="cc-print-again" onclick="window.print()">Print / Save as PDF</button>
</body></html>`
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
  const sheetRef = useRef(null)
  const [printErr, setPrintErr] = useState('')
  const isMobile = useIsMobile()

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  /**
   * Desktop prints the page in place — proven, and it needs no popup.
   *
   * Phones don't get that path. Android Chrome and iOS Safari print the *whole
   * top-level document* through a very different pipeline than desktop Blink
   * (which is why the desktop devtools "mobile view" prints fine and a real
   * phone doesn't — devtools only resizes the viewport, the print engine stays
   * the desktop one). On a phone the modal's scroll-locked, portal-over-app
   * document either came out blank or silently did nothing. So hand the invoice
   * to its own top-level tab instead: one small document with nothing to hide,
   * where print() is the ordinary case every mobile browser handles. It also
   * leaves a real page behind if the auto-trigger is blocked — the browser's own
   * Share ▸ Print still works from there.
   */
  function handlePrint() {
    setPrintErr('')
    const node = sheetRef.current?.querySelector('.cc-invoice')

    if (!isMobile || !node) {
      if (typeof window.print !== 'function') {
        setPrintErr('This browser has no print support. Open the page in Chrome or Safari.')
        return
      }
      try { window.print() } catch { setPrintErr('Printing was blocked by the browser.') }
      return
    }

    // Opened synchronously inside the click handler, or mobile blocks the popup.
    const win = window.open('', '_blank')
    if (!win) {
      setPrintErr('Allow pop-ups for this site, then tap Print again.')
      return
    }
    win.document.open()
    win.document.write(standaloneInvoiceHtml(node, invoice.number))
    win.document.close()

    // Fire once the copied stylesheet and the webfonts have actually landed —
    // printing earlier renders the sheet in fallback fonts, or unstyled.
    const go = () => { try { win.focus(); win.print() } catch { /* the in-page button remains */ } }
    const whenReady = () => {
      const fonts = win.document.fonts
      if (fonts?.ready) fonts.ready.then(() => setTimeout(go, 150)).catch(() => setTimeout(go, 600))
      else setTimeout(go, 600)
    }
    if (win.document.readyState === 'complete') whenReady()
    else win.addEventListener('load', whenReady, { once: true })
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

          {/* Centred under both corners — the reference is what gets quoted back
              on the phone, so it shouldn't be tucked into a corner. */}
          <div className="cc-invoice-ids">
            <span className="cc-invoice-no">{invoice.number}</span>
            {invoice.reference ? <span className="cc-invoice-ref">Order {invoice.reference}</span> : null}
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
