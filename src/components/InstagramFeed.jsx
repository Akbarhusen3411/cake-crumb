import { FiInstagram, FiExternalLink } from 'react-icons/fi'
import { img, u } from '../data/images.js'

// SnapWidget embed ID. Sign up at https://snapwidget.com → create a free
// "Instagram Hashtag/Profile" widget pointing at @cake_and_crumb_1, then put
// the widget ID into VITE_SNAPWIDGET_ID inside .env (e.g. "1234567").
// While unset, this component falls back to a hand-picked static grid.
const WIDGET_ID = import.meta.env.VITE_SNAPWIDGET_ID

const FALLBACK_TILES = [
  img.cheesecakeStrawberry,
  img.cupcakesPink,
  img.truffleBox,
  img.cheesecakeChocRose,
  img.cookies,
  img.cheesecakePistachio,
  img.cakeChocolateBirthday,
]

export default function InstagramFeed() {
  return (
    <section className="py-5">
      <div className="container">
        {/* The heading tells the truth in BOTH states. Without a widget ID
            these are hand-picked photos from the site, not posts — heading them
            "Follow us on Instagram" (as the old Home markup did) implied a live
            feed that wasn't there. With the ID set, it genuinely is one. */}
        <div className="text-center mb-4">
          <span className="eyebrow">
            <FiInstagram /> {WIDGET_ID ? 'Follow Us on Instagram' : 'A Few of Our Favourites'}
          </span>
          <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', margin: '0.6rem 0 0' }}>
            @cake_and_crumb_1
          </h3>
          {!WIDGET_ID && (
            <p style={{ fontSize: '0.85rem', color: 'var(--cc-cocoa-soft)', margin: '0.5rem 0 0' }}>
              See the latest on Instagram
            </p>
          )}
        </div>

        {WIDGET_ID ? (
          <div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              maxWidth: 1100,
              margin: '0 auto',
            }}
          >
            <iframe
              src={`https://snapwidget.com/embed/${WIDGET_ID}`}
              title="Cake & Crumb Instagram"
              allowTransparency="true"
              frameBorder="0"
              scrolling="no"
              style={{
                border: 'none',
                overflow: 'hidden',
                width: '100%',
                height: 320,
              }}
            />
          </div>
        ) : (
          <div className="row g-2 g-md-3" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {FALLBACK_TILES.map((id, i) => (
              <div className="col-4 col-md-3 col-lg" key={i}>
                <a
                  href="https://www.instagram.com/cake_and_crumb_1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ig-tile"
                >
                  <img src={u(id, 400, 400)} alt="" loading="lazy" />
                  <span className="ig-tile__hover">
                    <FiInstagram size={22} />
                  </span>
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-4">
          <a
            href="https://www.instagram.com/cake_and_crumb_1/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rose"
          >
            <FiInstagram /> View Profile
            <FiExternalLink size={12} />
          </a>
        </div>
      </div>
    </section>
  )
}
