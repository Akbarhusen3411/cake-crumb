import { Link } from 'react-router-dom'
import { FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiFacebook } from 'react-icons/fi'
import { FaPinterestP } from 'react-icons/fa'
import Newsletter from './Newsletter.jsx'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer style={{ background: '#fff' }}>
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

          <div className="col-6 col-lg-2">
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

          <div className="col-6 col-lg-4">
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

          <div className="col-12 col-lg-3">
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
        © {new Date().getFullYear()} Cake & Crumb. All Rights Reserved. ♥
      </div>
    </footer>
  )
}
