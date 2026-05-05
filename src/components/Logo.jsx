import { asset } from '../data/images.js'

export default function Logo({ size = 'md' }) {
  const isLarge = size === 'lg'
  const isSmall = size === 'sm'

  // Defaults applied via inline (md size). Mobile overrides via CSS classes (.logo-icon etc.).
  const iconStyle = isLarge
    ? { height: 110 }
    : isSmall
      ? { height: 56 }
      : undefined // md → CSS .logo-icon decides

  const titleStyle = isLarge
    ? { fontSize: '2.4rem' }
    : isSmall
      ? { fontSize: '1.05rem' }
      : undefined // md → CSS .logo-text

  const taglineStyle = isLarge
    ? { fontSize: '1.05rem' }
    : isSmall
      ? { fontSize: '0.62rem' }
      : undefined // md → CSS .logo-tagline

  return (
    <span className="d-inline-flex align-items-center" style={{ gap: '0.65rem' }}>
      <img
        src={asset('logo-icon.png')}
        alt=""
        aria-hidden="true"
        className={size === 'md' ? 'logo-icon' : ''}
        style={{
          width: 'auto',
          display: 'block',
          flexShrink: 0,
          ...iconStyle,
        }}
      />
      <span className="d-inline-flex flex-column" style={{ lineHeight: 1.05, minWidth: 0 }}>
        <span
          className={size === 'md' ? 'logo-text' : ''}
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
            fontWeight: 700,
            color: '#1a1a1a',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            ...titleStyle,
          }}
        >
          CAKE
          <span
            style={{
              color: '#1a1a1a',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: '1.3em',
              margin: '0 0.04em',
              verticalAlign: '-0.06em',
            }}
          >
            &
          </span>
          CRUMB
        </span>
        <span
          className={size === 'md' ? 'logo-tagline' : ''}
          style={{
            fontFamily: "'Allura', cursive",
            color: '#1a1a1a',
            marginTop: '0.05em',
            whiteSpace: 'nowrap',
            ...taglineStyle,
          }}
        >
          The gourmet chocolate and berry boutique!
        </span>
      </span>
    </span>
  )
}
