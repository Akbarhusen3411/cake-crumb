export default function PageHero({ eyebrow, title, text, cta, image, imageAlt = '' }) {
  return (
    <section className="fade-bg" style={{ overflow: 'hidden' }}>
      <div className="container py-5">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6 text-center text-lg-start">
            <span className="eyebrow mb-3 d-inline-flex">{eyebrow}</span>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                lineHeight: 1.1,
                margin: '1rem 0',
              }}
            >
              {title}
            </h1>
            <div
              className="heart-divider justify-content-center justify-content-lg-start mx-auto mx-lg-0"
              style={{ maxWidth: 200 }}
            >
              <span aria-hidden>♥</span>
            </div>
            <p className="mx-auto mx-lg-0" style={{ maxWidth: 460, marginTop: '1rem' }}>{text}</p>
            {cta}
          </div>
          <div className="col-lg-6">
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(176, 46, 82, 0.15)',
              }}
            >
              <img
                src={image}
                alt={imageAlt}
                loading="eager"
                fetchpriority="high"
                style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
