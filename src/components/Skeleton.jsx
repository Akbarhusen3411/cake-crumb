/**
 * Skeleton — shimmering placeholder block.
 *
 * Use as a low-level primitive:
 *   <Skeleton width="80%" height={20} />
 *   <Skeleton circle size={40} />
 *   <Skeleton width="100%" aspectRatio="1/1" radius={12} />
 *
 * Composed components (cards, lists) live in ./skeletons/*.
 */
export default function Skeleton({
  width,
  height,
  size,           // shorthand for circle: width = height = size
  circle = false,
  radius,
  aspectRatio,
  className = '',
  style = {},
}) {
  const finalWidth = size ?? width ?? '100%'
  const finalHeight = size ?? height
  const borderRadius = circle ? '50%' : (radius ?? 8)

  return (
    <span
      aria-hidden
      className={`skeleton ${className}`}
      style={{
        display: 'block',
        width: finalWidth,
        height: finalHeight,
        aspectRatio,
        borderRadius,
        ...style,
      }}
    />
  )
}
