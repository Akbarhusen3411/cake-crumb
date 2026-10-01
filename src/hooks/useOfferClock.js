import { useEffect, useState } from 'react'
import { offerNow } from '../data/offers.js'

/**
 * The current time for offers, refreshed every minute and whenever the tab
 * comes back into view — so a page left open overnight swaps the Mid-Month
 * offer in at 00:00 on the 13th, and out at 00:00 on the 21st, without a
 * reload. Components that show offers read the time from here and pass it on.
 */
export function useOfferClock() {
  const [now, setNow] = useState(offerNow)
  useEffect(() => {
    const tick = () => setNow(offerNow())
    const id = setInterval(tick, 60000)
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  return now
}
