export default function Logo({ size = 'md' }) {
  const iconSize = size === 'lg' ? 110 : size === 'sm' ? 56 : 78
  const titleFont = size === 'lg' ? '2.4rem' : size === 'sm' ? '1.05rem' : '1.7rem'
  const taglineFont = size === 'lg' ? '1.05rem' : size === 'sm' ? '0.62rem' : '0.85rem'

  return (
    <span className="d-inline-flex align-items-center" style={{ gap: '0.7rem' }}>
      <img
        src="/logo-icon.png"
        alt=""
        aria-hidden="true"
        style={{
          height: iconSize,
          width: 'auto',
          display: 'block',
          flexShrink: 0,
          mixBlendMode: 'multiply',
        }}
      />
      <span className="d-inline-flex flex-column" style={{ lineHeight: 1.05 }}>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: titleFont,
            fontWeight: 600,
            color: 'var(--cc-cocoa)',
            letterSpacing: '0.04em',
          }}
        >
          CAKE<span style={{ color: 'var(--cc-rose)', margin: '0 0.08em' }}>&</span>CRUMB
        </span>
        <span
          style={{
            fontFamily: "'Allura', cursive",
            fontSize: taglineFont,
            color: 'var(--cc-rose)',
            marginTop: '0.05em',
            opacity: 0.9,
          }}
        >
          The gourmet chocolate and berry boutique!
        </span>
      </span>
    </span>
  )
}
