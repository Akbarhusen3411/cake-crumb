import { useState } from 'react'

/**
 * Image that shows a shimmer skeleton placeholder until the file loads,
 * then fades the real image in. Drop-in replacement for <img>.
 *
 *   <SmartImage src={url} alt="…" aspectRatio="1/1" radius={12} />
 */
export default function SmartImage({
  src,
  alt = '',
  aspectRatio = '1/1',
  radius = 0,
  className = '',
  style = {},
  imgStyle = {},
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <span
      className={`smart-img ${loaded || errored ? 'loaded' : ''} ${className}`}
      style={{
        aspectRatio,
        borderRadius: radius,
        ...style,
      }}
    >
      <span className="smart-img__sk skeleton" style={{ borderRadius: radius }} />
      <img
        src={src}
        alt={alt}
        className="smart-img__inner"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: radius,
          ...imgStyle,
        }}
        {...rest}
      />
    </span>
  )
}
