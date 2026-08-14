import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiMessageCircle,
} from 'react-icons/fi'
import Newsletter from './Newsletter.jsx'
import Logo from './Logo.jsx'
import CertBadges from './CertBadges.jsx'
import { asset } from '../data/images.js'
import { buildWhatsAppLink } from './WhatsAppButton.jsx'
import { DELIVERY } from '../data/shopConfig.js'

const QUICK_LINKS = [
  { to: '/',        label: 'Home' },
  { to: '/about',   label: 'About Us' },
  { to: '/menu',    label: 'Menu' },
  { to: '/shop',    label: 'Shop' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reviews', label: 'Reviews' },
  // Was reachable only by typing the URL or by hitting the 404 page, which is
  // no use to the one person who needs it — someone who has already ordered.
  { to: '/track-order', label: 'Track Order' },
  // Sits before Contact on purpose — read the answer first, message us second.
  // Both footers (the mobile dot-row and the desktop column) map this list, so
  // one entry covers both.
  { to: '/faq',     label: 'FAQs' },
  { to: '/contact', label: 'Contact Us' },
]

/** The small print, shared so the two layouts can't tell different stories. */
const LEGAL_LINKS = [
  { to: '/refund-policy', label: 'Cancellation & Refunds' },
  { to: '/privacy',       label: 'Privacy' },
]

const ADDRESS = 'Vaso, Kheda, Gujarat 387380, India'
// Straight to the pin rather than a name search — the bakery is a home kitchen,
// so searching the name finds nothing. Coordinates come from the same constant
// the delivery calculator uses, so they can never drift apart.
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${DELIVERY.origin.lat},${DELIVERY.origin.lng}`

// One line, both layouts. They used to differ — "Made with ♥ in India" on a
// phone, "All Rights Reserved" on a desktop.
//
// No "All rights reserved": copyright is automatic under the Berne Convention,
// so the phrase (a leftover from the 1910 Buenos Aires Convention) adds nothing
// legally. The © notice itself is optional too, but it is kept as a plain
// signal that the photos and copy are owned rather than free to lift.
//
// Never add ® to the name — that asserts a registered trademark and is a false
// claim without one. ™ would be the safe symbol if a mark is ever claimed.
// Exported because MiniFooter (cart / checkout / confirm-order) renders instead
// of this footer on those routes and was carrying a THIRD wording of its own —
// "Baked with ♥ in India" — so the line changed depending on which page you
// were on. One function, every footer.
export const COPYRIGHT = (year) => `© ${year} Cake & Crumb`

export default function Footer() {
  const year = new Date().getFullYear()
  const waHref = buildWhatsAppLink()

  return (
    <footer className="cc-footer">
      {/* ───── MOBILE FOOTER (< lg) ───── */}
      <div className="cc-footer-m d-lg-none">
        {/* Brand block — icon + wordmark + tagline + heart divider + quote + socials */}
        <div className="cc-footer-m__brand">
          <img
            src={asset('logo_final.webp')}
            alt=""
            aria-hidden="true"
            className="cc-footer-m__icon"
          />
          <div className="cc-footer-m__wordmark">
            CAKE<span className="cc-footer-m__amp">&amp;</span>CRUMB
          </div>
          <p className="cc-footer-m__tagline">The gourmet chocolate &amp; berry boutique</p>
          <div className="cc-footer-m__heart" aria-hidden>
            <span className="cc-footer-m__heart-line" />
            <span className="cc-footer-m__heart-char">♥</span>
            <span className="cc-footer-m__heart-line" />
          </div>
          <p className="cc-footer-m__quote">Where every bite tells a sweet story</p>

          <div className="cc-footer-m__socials">
            {/* WhatsApp first — it is how every order is actually placed, and
                the Ordering line below says so. It was missing entirely. */}
            <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="Order on WhatsApp" className="cc-footer-m__social cc-footer__social--wa"><FiMessageCircle size={14} /></a>
            <a href="https://www.instagram.com/cake_and_crumb_1/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="cc-footer-m__social"><FiInstagram size={14} /></a>
            <a href="mailto:cakeandcrumb.in@gmail.com" aria-label="Email" className="cc-footer-m__social"><FiMail size={14} /></a>
          </div>
        </div>

        {/* Inline link row, dot-separated */}
        <nav className="cc-footer-m__links" aria-label="Footer">
          {QUICK_LINKS.map((l, i) => (
            <Fragment key={l.to}>
              {i > 0 && <span className="cc-footer-m__sep" aria-hidden>·</span>}
              <Link to={l.to} className="cc-footer-m__link">{l.label}</Link>
            </Fragment>
          ))}
        </nav>

        {/* Info — phone / instagram / address / hours, single column with icons */}
        {/* Every one of these is now a real link. They were plain <span> text
            on mobile while the DESKTOP footer had tel:/mailto: anchors — exactly
            backwards, since tapping to call is what a phone is for. */}
        <ul className="cc-footer-m__info">
          <li>
            <span className="cc-footer-m__info-icon"><FiPhone size={12} /></span>
            <a href="tel:+919173183440">+91 91731 83440</a>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiMessageCircle size={12} /></span>
            <a href={waHref} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiMail size={12} /></span>
            <a href="mailto:cakeandcrumb.in@gmail.com">cakeandcrumb.in@gmail.com</a>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiMapPin size={12} /></span>
            <a href={MAP_URL} target="_blank" rel="noopener noreferrer">{ADDRESS}</a>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiClock size={12} /></span>
            <span>Baked to order — order a day ahead. Ordered late? Ready the next day.</span>
          </li>
        </ul>

        {/* Cursive flourish */}
        <p className="cc-footer-m__script">We can't wait to sweeten your day!</p>

        {/* Newsletter card */}
        <div className="cc-footer-m__newsletter">
          <span className="tag-badge">Stay Sweet</span>
          <h5 className="cc-footer-m__news-head">Sweet news in your inbox</h5>
          <p className="cc-footer-m__news-sub">
            Festival specials &amp; treat-of-the-week — never spam.
          </p>
          <Newsletter compact />
        </div>

        {/* Statutory registrations — numbers only, see data/certifications.js */}
        <div className="cc-footer__certs">
          <CertBadges variant="line" />
        </div>

        {/* Small print + copyright */}
        <nav className="cc-footer__legal" aria-label="Legal">
          {LEGAL_LINKS.map((l, i) => (
            <Fragment key={l.to}>
              {i > 0 && <span className="cc-footer-m__sep" aria-hidden>·</span>}
              <Link to={l.to}>{l.label}</Link>
            </Fragment>
          ))}
        </nav>
        <div className="cc-footer-m__copyright">{COPYRIGHT(year)}</div>
      </div>

      {/* ───── DESKTOP FOOTER (lg+) — matches mockup: brand / quick links / contact / hours ───── */}
      <div className="cc-footer-d d-none d-lg-block">
        <div className="container-fluid px-4 px-xl-5 py-5">
          <div className="row g-4 align-items-start">

            {/* 1. Brand + socials */}
            <div className="col-lg-3 cc-footer-d__col">
              <Logo size="sm" />
              <p className="cc-footer-d__tagline">
                The gourmet chocolate and<br />berry boutique!
              </p>
              <div className="cc-footer-d__socials">
                <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="Order on WhatsApp" className="cc-footer-d__social cc-footer__social--wa">
                  <FiMessageCircle size={14} />
                </a>
                <a href="https://www.instagram.com/cake_and_crumb_1/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="cc-footer-d__social">
                  <FiInstagram size={14} />
                </a>
                <a href="mailto:cakeandcrumb.in@gmail.com" aria-label="Email" className="cc-footer-d__social">
                  <FiMail size={14} />
                </a>
              </div>

              {/* Newsletter used to render on MOBILE ONLY, so half the visitors
                  were never offered it — and it is the site's only email capture. */}
              <div className="cc-footer-d__newsletter">
                <p className="cc-footer-d__news-head">Sweet news in your inbox</p>
                <Newsletter compact />
              </div>
            </div>

            {/* 2. Quick Links */}
            <div className="col-lg-2 cc-footer-d__col">
              <h6 className="cc-footer-d__heading">Quick Links</h6>
              <ul className="cc-footer-d__links">
                {QUICK_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Contact Us */}
            <div className="col-lg-4 cc-footer-d__col">
              <h6 className="cc-footer-d__heading">Contact Us</h6>
              <ul className="cc-footer-d__info">
                <li>
                  <span className="cc-footer-d__info-icon"><FiMapPin size={14} /></span>
                  <a href={MAP_URL} target="_blank" rel="noopener noreferrer">
                    Vaso, Kheda,<br />Gujarat 387380 — India
                  </a>
                </li>
                <li>
                  <span className="cc-footer-d__info-icon"><FiPhone size={14} /></span>
                  <a href="tel:+919173183440">+91 91731 83440</a>
                </li>
                <li>
                  <span className="cc-footer-d__info-icon"><FiMessageCircle size={14} /></span>
                  <a href={waHref} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
                </li>
                <li>
                  <span className="cc-footer-d__info-icon"><FiMail size={14} /></span>
                  <a href="mailto:cakeandcrumb.in@gmail.com">cakeandcrumb.in@gmail.com</a>
                </li>
              </ul>
            </div>

            {/* 4. Ordering — NOT "Hours".
                This column used to read "Mon – Sat: 9am – 9pm / Sunday: 10am –
                7pm", which was never true: nothing is baked in advance and sat
                on a shelf. An order comes in, the date is agreed, and the bake
                starts after that — so shop hours would only turn away someone
                messaging at 10pm, which is a perfectly good time to order. */}
            <div className="col-lg-3 cc-footer-d__col">
              <h6 className="cc-footer-d__heading">Ordering</h6>
              <ul className="cc-footer-d__info">
                <li>
                  <span className="cc-footer-d__info-icon"><FiClock size={14} /></span>
                  <span>
                    Orders any day, on WhatsApp<br />
                    Baked to order — we confirm your date when you order<br />
                    <span style={{ opacity: 0.85 }}>Ordered late? It's ready the next day</span>
                  </span>
                </li>
              </ul>
              <p className="cc-footer-d__script">
                We can't wait to<br />sweeten your day! <span aria-hidden style={{ color: 'var(--cc-rose)' }}>♥</span>
              </p>
            </div>
          </div>

          {/* Statutory registrations — numbers only, see data/certifications.js */}
          <div className="cc-footer__certs">
            <CertBadges variant="line" />
          </div>
        </div>

        {/* Rose ribbon */}
        <div className="cc-footer-d__ribbon">
          <span>{COPYRIGHT(year)}</span>
          <nav className="cc-footer__legal cc-footer__legal--ribbon" aria-label="Legal">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
