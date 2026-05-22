export default function HeartDivider({ width = 60 }) {
  return (
    <span
      className="cc-heart-divider"
      aria-hidden
      style={{ '--cc-hd-w': `${width}px` }}
    >
      <span className="cc-heart-divider__line" />
      <span className="cc-heart-divider__heart">♥</span>
      <span className="cc-heart-divider__line" />
    </span>
  )
}
