import { FiShield, FiAward } from 'react-icons/fi'
import { FSSAI, UDYAM } from '../data/certifications.js'

const CERTS = [
  { ...FSSAI, Icon: FiShield },
  { ...UDYAM, Icon: FiAward },
]

/**
 * FSSAI + Udyam (MSME) registration badges — the numbers only, never the
 * certificate scans (see src/data/certifications.js for why).
 *
 *   variant="pills"  (default) — bordered pills with icon + label + number.
 *                                Used on Home (under the feature strip) and
 *                                inside the About "Registered & Certified"
 *                                section, which adds its own heading + links.
 *   variant="line"             — one compact dot-separated line for the
 *                                footer and the checkout summary card.
 */
export default function CertBadges({ variant = 'pills', className = '' }) {
  if (variant === 'line') {
    return (
      <span className={`cc-cert-line ${className}`.trim()}>
        <FiShield size={14} aria-hidden />
        <span>FSSAI Reg. No. <strong>{FSSAI.number}</strong></span>
        <span className="cc-cert-line__sep" aria-hidden>·</span>
        <span>Udyam <strong>{UDYAM.number}</strong></span>
      </span>
    )
  }

  return (
    <div className={`cc-cert-pills ${className}`.trim()}>
      {CERTS.map(({ number, label, Icon }) => (
        <div className="cc-cert-pill" key={number}>
          <span className="cc-cert-pill__icon"><Icon size={16} /></span>
          <span className="cc-cert-pill__body">
            <span className="cc-cert-pill__label">{label}</span>
            <span className="cc-cert-pill__num">{number}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
