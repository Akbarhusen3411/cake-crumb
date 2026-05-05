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
            color: '#1a1a1a',
            letterSpacing: '0.01em',
          }}
        >
          CAKE
          <span
            style={{
              color: '#1a1a1a',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: '1.25em',
              margin: '0 0.02em',
              verticalAlign: '-0.05em',
            }}
          >
            &
          </span>
          CRUMB
        </span>
        <span
          style={{
            fontFamily: "'Allura', cursive",
            fontSize: taglineFont,
            color: '#1a1a1a',
            marginTop: '0.05em',
          }}
        >
          The gourmet chocolate and berry boutique!
        </span>
      </span>
    </span>
  )
}
