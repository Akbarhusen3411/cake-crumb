import Skeleton from '../Skeleton.jsx'

/**
 * Skeleton shown while a lazy-loaded route is fetching its JS chunk.
 * Mimics the rough shape of every page: hero band + a few content rows.
 */
export default function PageFallback() {
  return (
    <div aria-busy="true" aria-live="polite">
      {/* Hero placeholder */}
      <section style={{ background: 'var(--cc-cream)' }} className="py-4 py-md-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <Skeleton width={140} height={14} style={{ marginBottom: 16 }} />
              <Skeleton width="80%" height={36} style={{ marginBottom: 10 }} />
              <Skeleton width="60%" height={36} style={{ marginBottom: 18 }} />
              <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
              <Skeleton width="90%" height={12} style={{ marginBottom: 6 }} />
              <Skeleton width="70%" height={12} style={{ marginBottom: 22 }} />
              <Skeleton width={140} height={36} radius={999} />
            </div>
            <div className="col-lg-6">
              <Skeleton width="100%" aspectRatio="4/3" radius={14} />
            </div>
          </div>
        </div>
      </section>

      {/* Content rows */}
      <section className="py-4 py-md-5">
        <div className="container">
          <div className="text-center mb-4">
            <Skeleton width={180} height={14} style={{ margin: '0 auto 12px' }} />
            <Skeleton width={260} height={28} style={{ margin: '0 auto' }} />
          </div>
          <div className="row g-3">
            {[0, 1, 2, 3].map((i) => (
              <div className="col-6 col-md-3" key={i}>
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--cc-border)', overflow: 'hidden' }}>
                  <Skeleton width="100%" aspectRatio="1/1" radius={0} />
                  <div style={{ padding: 14 }}>
                    <Skeleton width="50%" height={10} style={{ marginBottom: 8 }} />
                    <Skeleton width="80%" height={14} style={{ marginBottom: 10 }} />
                    <Skeleton width="40%" height={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
