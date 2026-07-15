import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMapPin, FiPhone, FiMail, FiClock, FiInstagram,
} from 'react-icons/fi'
import Newsletter from './Newsletter.jsx'
import Logo from './Logo.jsx'
import { asset } from '../data/images.js'

const QUICK_LINKS = [
  { to: '/',        label: 'Home' },
  { to: '/about',   label: 'About Us' },
  { to: '/menu',    label: 'Menu' },
  { to: '/shop',    label: 'Shop' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact Us' },
]

export default function Footer() {
  const year = new Date().getFullYear()

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
        <ul className="cc-footer-m__info">
          <li>
            <span className="cc-footer-m__info-icon"><FiPhone size={12} /></span>
            <span>+91 91731 83440</span>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiMail size={12} /></span>
            <span>cakeandcrumb.in@gmail.com</span>
          </li>
          <li>
            <span className="cc-footer-m__info-icon"><FiMapPin size={12} /></span>
            <span>Vaso, Kheda, Gujarat 387380, India</span>
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
          © {year} Cake &amp; Crumb &nbsp;·&nbsp; Made with <span aria-hidden style={{ color: '#ffe0e8' }}>♥</span> in India
        </div>
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
                <a href="https://www.instagram.com/cake_and_crumb_1/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="cc-footer-d__social">
                  <FiInstagram size={14} />
                </a>
                <a href="mailto:cakeandcrumb.in@gmail.com" aria-label="Email" className="cc-footer-d__social">
                  <FiMail size={14} />
                </a>
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
                  <span>Vaso, Kheda,<br />Gujarat 387380 — India</span>
                </li>
                <li>
                  <span className="cc-footer-d__info-icon"><FiPhone size={14} /></span>
                  <a href="tel:+919173183440">+91 91731 83440</a>
                </li>
                <li>
                  <span className="cc-footer-d__info-icon"><FiMail size={14} /></span>
                  <a href="mailto:cakeandcrumb.in@gmail.com">cakeandcrumb.in@gmail.com</a>
                </li>
              </ul>
            </div>

            {/* 4. Hours */}
            <div className="col-lg-3 cc-footer-d__col">
              <h6 className="cc-footer-d__heading">Hours</h6>
              <ul className="cc-footer-d__info">
                <li>
                  <span className="cc-footer-d__info-icon"><FiClock size={14} /></span>
                  <span>
                    Mon – Sat: 9am – 9pm<br />
                    Sunday: 10am – 7pm<br />
                    <span style={{ opacity: 0.85 }}>Pre-order 1 day in advance</span>
                  </span>
                </li>
              </ul>
              <p className="cc-footer-d__script">
                We can't wait to<br />sweeten your day! <span aria-hidden style={{ color: 'var(--cc-rose)' }}>♥</span>
              </p>
            </div>
          </div>
        </div>

        {/* Rose ribbon */}
        <div className="cc-footer-d__ribbon">
          © {year} Cake &amp; Crumb. All Rights Reserved. <span aria-hidden>♥</span>
        </div>
      </div>
    </footer>
  )
}
