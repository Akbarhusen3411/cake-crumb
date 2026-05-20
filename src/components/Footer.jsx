import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiFacebook,
} from 'react-icons/fi'
import { FaPinterestP } from 'react-icons/fa'
import Newsletter from './Newsletter.jsx'
import Logo from './Logo.jsx'
import { asset } from '../data/images.js'

const QUICK_LINKS = [
  { to: '/',        label: 'Home' },
  { to: '/about',   label: 'About' },
  { to: '/menu',    label: 'Menu' },
  { to: '/shop',    label: 'Shop' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/faq',     label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="cc-footer">
      {/* ───── MOBILE FOOTER (< lg) ───── */}
      <div className="cc-footer-m d-lg-none">
        {/* Brand block — icon + wordmark + tagline + heart divider + quote + socials */}
        <div className="cc-footer-m__brand">
          <img
            src={asset('logo-icon.png')}
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
            <a href="#" aria-label="Facebook" className="cc-footer-m__social"><FiFacebook size={14} /></a>
            <a href="#" aria-label="Instagram" className="cc-footer-m__social"><FiInstagram size={14} /></a>
            <a href="#" aria-label="Pinterest" className="cc-footer-m__social"><FaPinterestP size={12} /></a>
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
        <ul className="cc-footer-m__info">
          <li>
            <span className="cc-footer-m__info-icon"><FiPhone size={12} /></span>
            <span>+91 90816 68490 &nbsp;·&nbsp; +91 91731 83440</span>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiInstagram size={12} /></span>
            <span>@cake_and_crumb_1</span>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiMapPin size={12} /></span>
            <span>Self-pickup &amp; home delivery</span>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiClock size={12} /></span>
            <span>Pre-order required — 1 day in advance</span>
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

        {/* Copyright bar */}
        <div className="cc-footer-m__copyright">
          © {new Date().getFullYear()} Cake &amp; Crumb &nbsp;·&nbsp; Made with <span aria-hidden style={{ color: '#ffe0e8' }}>♥</span> in India
        </div>
      </div>

      {/* ───── DESKTOP FOOTER (lg+) — original 4-column layout ───── */}
      <div className="d-none d-lg-block" style={{ background: '#fff' }}>
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-lg-3">
              <Logo size="sm" />
              <p className="mt-3 mb-3" style={{ fontSize: '0.85rem', maxWidth: 240 }}>
                The gourmet chocolate and berry boutique.
              </p>
              <div className="d-flex" style={{ gap: '0.5rem' }}>
                <a href="#" className="icon-circle" aria-label="Facebook"><FiFacebook size={16} /></a>
                <a href="#" className="icon-circle" aria-label="Instagram"><FiInstagram size={16} /></a>
                <a href="#" className="icon-circle" aria-label="Pinterest"><FaPinterestP size={14} /></a>
                <a href="#" className="icon-circle" aria-label="Email"><FiMail size={16} /></a>
              </div>
            </div>

            <div className="col-lg-2">
              <h6 className="tag-badge mb-3">Quick Links</h6>
              <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                <li className="mb-2"><Link to="/">Home</Link></li>
                <li className="mb-2"><Link to="/about">About Us</Link></li>
                <li className="mb-2"><Link to="/menu">Menu</Link></li>
                <li className="mb-2"><Link to="/shop">Shop</Link></li>
                <li className="mb-2"><Link to="/gallery">Gallery</Link></li>
                <li className="mb-2"><Link to="/faq">FAQ</Link></li>
                <li className="mb-2"><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>

            <div className="col-lg-4">
              <h6 className="tag-badge mb-3">Contact Us</h6>
              <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                <li className="mb-2 d-flex align-items-center" style={{ gap: '0.6rem' }}>
                  <span className="icon-circle" style={{ width: 28, height: 28, fontSize: 12 }}>
                    <FiPhone size={12} />
                  </span>
                  <span>+91 90816 68490<br />+91 91731 83440</span>
                </li>
                <li className="mb-2 d-flex align-items-center" style={{ gap: '0.6rem' }}>
                  <span className="icon-circle" style={{ width: 28, height: 28, fontSize: 12 }}>
                    <FiInstagram size={12} />
                  </span>
                  <span>@cake_and_crumb_1</span>
                </li>
                <li className="mb-2 d-flex align-items-start" style={{ gap: '0.6rem' }}>
                  <span className="icon-circle" style={{ width: 28, height: 28, fontSize: 12 }}>
                    <FiMapPin size={12} />
                  </span>
                  <span>Self-pickup &amp; home delivery<br />(charges apply)</span>
                </li>
              </ul>
            </div>

            <div className="col-lg-3">
              <h6 className="tag-badge mb-3">Hours</h6>
              <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
                <li className="mb-2 d-flex align-items-start" style={{ gap: '0.6rem' }}>
                  <span className="icon-circle" style={{ width: 28, height: 28, fontSize: 12 }}>
                    <FiClock size={12} />
                  </span>
                  <span>Pre-order required<br />Order 1 day in advance</span>
                </li>
              </ul>
              <p className="script mt-3" style={{ fontSize: '1.4rem', lineHeight: 1.1 }}>
                We can't wait to<br />sweeten your day!
              </p>
            </div>
          </div>

          <div
            className="mt-4 pt-4 row align-items-center g-3"
            style={{ borderTop: '1px solid var(--cc-border)' }}
          >
            <div className="col-md-5">
              <h6 className="tag-badge mb-1">Newsletter</h6>
              <p style={{ fontSize: '0.82rem', color: 'var(--cc-cocoa-soft)', margin: 0 }}>
                Sweet news, festival specials & treat-of-the-week — never spam.
              </p>
            </div>
            <div className="col-md-7">
              <Newsletter compact />
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--cc-rose)',
            color: '#fff',
            textAlign: 'center',
            padding: '0.8rem 1rem',
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
          }}
        >
          © {new Date().getFullYear()} Cake &amp; Crumb. All Rights Reserved. <span aria-hidden>♥</span>
        </div>
      </div>
    </footer>
  )
}
