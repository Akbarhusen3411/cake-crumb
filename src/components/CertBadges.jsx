import { Fragment } from 'react'
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
    // Both registrations come out of the same loop, so they cannot end up
    // styled differently — which is exactly what happened when they were two
    // hand-written spans: one bolded only its number, the other bolded the
    // label too, and MSME sat darker than FSSAI on the same line.
    return (
      <span className={`cc-cert-line ${className}`.trim()}>
        <FiShield size={14} aria-hidden />
        {CERTS.map(({ number, prefix }, i) => (
          <Fragment key={number}>
            {i > 0 && <span className="cc-cert-line__sep" aria-hidden>·</span>}
            <span>{prefix} <strong>{number}</strong></span>
          </Fragment>
        ))}
      </span>
    )
  }

  return (
    <div className={`cc-cert-pills ${className}`.trim()}>
      {/* The pill's own label names the scheme ("MSME · Udyam Registered"), so
          the line below it is the bare number — no prefix repeated twice. */}
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
