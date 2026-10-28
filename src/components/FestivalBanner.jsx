import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import { FESTIVALS, getActiveFestival, isDiwaliPreview } from '../data/festivals.js'
import { offerNow } from '../data/offers.js' // honours ?testdate on the dev server

const DISMISS_KEY = 'cc_festival_dismissed_v1'

export default function FestivalBanner() {
  const [festival, setFestival] = useState(null)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    // ?diwali=preview: show the Diwali banner on any date, even if closed before.
    const preview = isDiwaliPreview()
    const f = preview ? FESTIVALS.find((x) => x.id === 'diwali') : getActiveFestival(offerNow())
    if (!f) return
    let dismissed = false
    if (!preview) try {
      const raw = localStorage.getItem(DISMISS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Dismissals are scoped to the festival id — a new festival re-shows the banner.
        dismissed = parsed.id === f.id
      }
    } catch { /* ignore malformed storage */ }
    if (!dismissed) {
      setFestival(f)
      setHidden(false)
    }
  }, [])

  function dismiss() {
    if (!festival) return
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify({ id: festival.id, t: Date.now() }))
    } catch { /* storage blocked */ }
    setHidden(true)
  }

  if (hidden || !festival) return null

  return (
    <div
      className="festival-banner"
      role="region"
      aria-label={`${festival.name} promotion`}
      style={{ background: festival.bg, color: festival.fg }}
    >
      <span aria-hidden style={{ fontSize: '1.2em', flexShrink: 0 }}>{festival.icon}</span>
      <span className="festival-banner__msg">{festival.message}</span>
      <Link
        to={festival.to || '/shop'}
        className="festival-banner__cta"
        style={{ color: festival.fg, borderColor: festival.accent }}
      >
        {festival.cta}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="festival-banner__close"
        style={{ color: festival.fg }}
      >
        <FiX size={16} />
      </button>
    </div>
  )
}
