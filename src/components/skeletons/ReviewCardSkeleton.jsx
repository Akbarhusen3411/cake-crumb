import Skeleton from '../Skeleton.jsx'

export default function ReviewCardSkeleton() {
  return (
    <article
      className="d-flex flex-column flex-md-row p-3 p-md-4 mb-3"
      style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 14, gap: '1rem' }}
    >
      <Skeleton circle size={72} style={{ flexShrink: 0 }} />
      <div className="flex-grow-1">
        <div className="d-flex flex-wrap align-items-center mb-2" style={{ gap: '0.6rem' }}>
          <Skeleton width={110} height={14} />
          <Skeleton width={70} height={18} radius={999} />
          <Skeleton width={60} height={12} />
        </div>
        <Skeleton width={100} height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="55%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={12} />
      </div>
    </article>
  )
}
