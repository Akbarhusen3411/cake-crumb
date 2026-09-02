import { Link } from 'react-router-dom'
import { FiClock, FiCreditCard, FiAlertCircle, FiMessageCircle } from 'react-icons/fi'
import HeartDivider from '../components/HeartDivider.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'
import { BULK_ORDER_MIN, DEPOSIT_PCT } from '../data/shopConfig.js'
import { inr } from '../data/format.js'

/**
 * CANCELLATION & REFUNDS
 *
 * Every term here is the one already answered on /faq — the 30-minute window,
 * refunds only for a cancellation inside it or a confirmed quality issue, and a
 * 100% refund within 24 hours if the bakery has to cancel. This page exists
 * because a customer paying a 50% advance looks for a policy page, not an FAQ
 * accordion, and because the footer of a shop that takes money online is where
 * people expect to find one.
 *
 * DO NOT let the two drift. If a term changes, change /faq and this page
 * together — a policy that contradicts the FAQ is worse than neither.
 *
 * The deposit figures are read from shopConfig so they can never fall out of
 * step with what checkout actually charges.
 */
// Bumped BY HAND, and only when a term on this page actually changes. A date
// computed from the clock would claim a revision that never happened, which on
// a policy page is worse than no date at all.
const LAST_UPDATED = '2 September 2026'

export default function RefundPolicy() {
  usePageMeta({
    title: 'Cancellation & Refunds',
    description:
      'How to cancel an order with Cake & Crumb, when refunds apply, and how advance payments on bulk orders are handled.',
  })

  const depositPct = Math.round(DEPOSIT_PCT * 100)

  return (
    <>
      {/* A plain document header, not the image hero the other pages use — this
          is something a customer READS when something has gone wrong, and a
          400px photo above it just pushes the answer off the screen. */}
      <header className="cc-policy-head">
        <div className="container py-4 py-md-5 text-center">
          <span className="eyebrow mb-3 d-inline-flex">Our Promise</span>
          <h1 className="cc-policy-head__title">Cancellation &amp; Refunds</h1>
          <HeartDivider width={50} />
        </div>
      </header>

      <section className="cc-policy">
        <div className="container py-5">
          <div className="cc-policy__body">

            <p className="cc-policy__intro">
              We are a made-to-order kitchen. Nothing sits on a shelf — your order
              is baked for you, which is why the cancellation window is short and
              why we would always rather you asked us first.
            </p>

            <h2 className="cc-policy__h2"><FiClock size={18} /> Cancelling an order</h2>
            <ul className="cc-policy__list">
              <li>
                <strong>Within 30 minutes of placing your order</strong> — cancel for any
                reason, no questions asked, and any money you have paid is refunded in full.
              </li>
              <li>
                <strong>After 30 minutes</strong> — baking has usually started and
                ingredients are committed, so we cannot cancel. If something has gone
                wrong, message us anyway: we will do what we can.
              </li>
              <li>
                <strong>To cancel</strong>, send a WhatsApp message with your Order ID
                (the <code>CC-…</code> code on your receipt). We reply to confirm — a
                cancellation is not final until we have confirmed it.
              </li>
            </ul>

            <h2 className="cc-policy__h2"><FiCreditCard size={18} /> Refunds</h2>
            <ul className="cc-policy__list">
              <li>
                Refunds apply to orders <strong>cancelled inside the 30-minute window</strong>,
                or where there is a <strong>quality issue confirmed by us</strong> when you
                receive the order.
              </li>
              <li>
                Refunds go back the way they came — UPI to the paying UPI ID, bank
                transfer to the sending account — normally within <strong>24 hours</strong>,
                and always within 5 working days.
              </li>
              <li>
                Orders at or above {inr(BULK_ORDER_MIN)} take a <strong>{depositPct}% advance</strong>.
                That advance follows the same rules: refunded in full if you cancel inside
                the window, or if we cancel.
              </li>
            </ul>

            <h2 className="cc-policy__h2"><FiAlertCircle size={18} /> If we have to cancel</h2>
            <p>
              Rarely — an ingredient we cannot source, or a problem in the kitchen — we may
              have to cancel. If that happens we tell you immediately on WhatsApp and refund{' '}
              <strong>100% within 24 hours</strong>, whatever stage the order had reached.
              You are never out of pocket for our problem.
            </p>

            <h2 className="cc-policy__h2">Something not right?</h2>
            <p>
              Tell us on the day you receive it, with a photo if you can. Food is
              perishable and we cannot assess a complaint about an order eaten days ago,
              but if something was wrong when it reached you we want to know and we will
              put it right.
            </p>

            <div className="cc-policy__cta">
              <a href={buildWhatsAppLink('Hi! I need help with my order — Order ID: ')} target="_blank" rel="noopener noreferrer" className="btn-rose">
                <FiMessageCircle size={15} /> Message us about an order
              </a>
              <Link to="/faq" className="cc-policy__link">Read the full FAQs</Link>
            </div>

            <p className="cc-policy__note">
              <strong>Last updated {LAST_UPDATED}.</strong> These terms sit alongside the
              answers on our <Link to="/faq">FAQ page</Link>.
              Cake &amp; Crumb, Vaso, Kheda, Gujarat 387380. FSSAI-registered — the number
              is in the footer of every page.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
