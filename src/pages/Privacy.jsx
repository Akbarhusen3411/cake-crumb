import { Link } from 'react-router-dom'
import { FiShield, FiDatabase, FiEye, FiMessageCircle } from 'react-icons/fi'
import HeartDivider from '../components/HeartDivider.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'

/**
 * PRIVACY
 *
 * Written to describe what this site ACTUALLY does, not a template:
 *   • Order details go to Firestore (`orders`, admin-only) plus a PII-free
 *     public `tracking/{orderId}` mirror, and a last-50 localStorage mirror.
 *   • The WhatsApp receipt carries order ID, items and price — no admin links,
 *     no repeated personal details.
 *   • EmailJS sends the bakery a notification and, only when configured, a
 *     confirmation to the customer.
 *   • Delivery distance is geocoded from the PINCODE ONLY, via Nominatim. The
 *     street address is never sent to a third party.
 *   • Reviews are world-readable by design; review photos are stored as data
 *     URLs inside the review document, not in object storage. The form no
 *     longer collects an email — it used to, and because that collection is
 *     public the addresses were harvestable. Do not re-add a contact field to
 *     `reviews` without moving it to an admin-only collection first.
 *   • Plausible analytics is cookieless and collects no personal data.
 *   • Google reCAPTCHA Enterprise runs on EVERY page (Firebase App Check). It
 *     sends Google the visitor's IP, browser/device details and interaction
 *     signals, and sets a `_GRECAPTCHA` cookie. That is the site's one real
 *     third-party data flow beyond fonts, so it is stated plainly rather than
 *     buried — and it is why "we set no cookies" is no longer true site-wide.
 *     If App Check is ever removed, remove this section with it.
 *
 * If any of those change, change this page in the same commit. A privacy page
 * that describes something the site no longer does is the one kind of error
 * here that actually matters.
 */
export default function Privacy() {
  usePageMeta({
    title: 'Privacy',
    description:
      'What Cake & Crumb collects when you order, where it is stored, who it is shared with, and how to have it removed.',
  })

  return (
    <>
      <header className="cc-policy-head">
        <div className="container py-4 py-md-5 text-center">
          <span className="eyebrow mb-3 d-inline-flex">Your Data</span>
          <h1 className="cc-policy-head__title">Privacy</h1>
          <HeartDivider width={50} />
        </div>
      </header>

      <section className="cc-policy">
        <div className="container py-5">
          <div className="cc-policy__body">

            <p className="cc-policy__intro">
              We are a small bakery, not an advertising business. We collect what
              is needed to bake and deliver your order, and nothing else. We do
              not sell your details to anyone, ever.
            </p>

            <h2 className="cc-policy__h2"><FiDatabase size={18} /> What we collect</h2>
            <ul className="cc-policy__list">
              <li><strong>When you order</strong> — your name, phone number, delivery address and pincode, the delivery date you choose, and any notes you add. Email is optional.</li>
              <li><strong>When you leave a review</strong> — the name you type, your rating and comment, and a photo if you attach one. <strong>No email address</strong> — the review form does not ask for one.</li>
              <li><strong>When you join the newsletter</strong> — your email address, nothing more.</li>
              <li><strong>We never see your payment details.</strong> UPI happens in your own banking app; no card or bank credentials ever reach this website.</li>
            </ul>

            <h2 className="cc-policy__h2"><FiShield size={18} /> Where it goes</h2>
            <ul className="cc-policy__list">
              <li>Order details are stored in our private order book, readable only by the bakery.</li>
              <li>
                Your order also creates a <strong>public tracking record</strong> so you can
                check progress at <Link to="/track-order">Track Order</Link>. It holds the
                order ID and status only — <strong>no name, phone or address</strong>.
              </li>
              <li>Your order summary is sent to us over WhatsApp, and by email so we have a backup. That is between you and us.</li>
              <li>
                To work out a delivery charge we look up <strong>your pincode only</strong> —
                an area, not your street — using the OpenStreetMap service. Your address is
                never sent to any third party.
              </li>
              <li><strong>Reviews are public</strong> by design, including any photo you attach. Only post what you are happy for others to see.</li>
            </ul>

            <h2 className="cc-policy__h2"><FiEye size={18} /> Analytics</h2>
            <p>
              We use Plausible to count page visits. It is <strong>cookieless</strong>, stores
              no personal data and cannot follow you to other websites. It tells us which
              cakes people look at — not who looked at them.
            </p>

            <h2 className="cc-policy__h2"><FiShield size={18} /> Checking you are not a robot</h2>
            <p>
              Every page runs <strong>Google reCAPTCHA</strong>. It does the job of a
              tick-box that asks you to prove you are human, without asking you to tick
              anything. We need it because you can order and leave a review here without
              creating an account, so something has to tell real customers apart from
              automated scripts placing fake orders.
            </p>
            <p>
              To make that judgement it sends Google your IP address, details about your
              browser and device, and how you move and click on the page. It also stores a
              cookie called <code>_GRECAPTCHA</code> in your browser. We would rather say
              that plainly than leave it out: the information goes to Google, not to us,
              and is used to score whether traffic looks automated — not to work out who
              you are. Google's use of it is covered by their own{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>{' '}
              and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">terms</a>.
            </p>
            <p>
              The page fonts are also served by Google, which means Google sees the request
              for them. Nothing else on this site is shared with an advertising company.
            </p>

            <h2 className="cc-policy__h2">How long we keep it</h2>
            <p>
              Order records are kept as long as we need them for our books and for any
              question you might raise later. Newsletter emails are kept until you ask us
              to remove them. Reviews stay until you or we take them down.
            </p>

            <h2 className="cc-policy__h2">Having your data removed</h2>
            <p>
              Message us on WhatsApp or email <a href="mailto:cakeandcrumb.in@gmail.com">cakeandcrumb.in@gmail.com</a>{' '}
              and ask. We will delete your details, remove your review or take you off the
              newsletter — no explanation needed. We may keep the bare record of a completed
              sale where we are required to for accounting.
            </p>

            <div className="cc-policy__cta">
              <a href={buildWhatsAppLink('Hi! I have a question about my data / privacy.')} target="_blank" rel="noopener noreferrer" className="btn-rose">
                <FiMessageCircle size={15} /> Ask us about your data
              </a>
              <Link to="/refund-policy" className="cc-policy__link">Cancellation &amp; Refunds</Link>
            </div>

            <p className="cc-policy__note">
              Cake &amp; Crumb, Vaso, Kheda, Gujarat 387380, India ·{' '}
              <a href="mailto:cakeandcrumb.in@gmail.com">cakeandcrumb.in@gmail.com</a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
