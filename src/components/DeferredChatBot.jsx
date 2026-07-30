import { lazy, Suspense, useEffect, useState } from 'react'

const ChatBot = lazy(() => import('./ChatBot.jsx'))

/**
 * Loads the ChatBot off the critical path.
 *
 * ChatBot.jsx is by far the largest component here — a whole conversational
 * ordering flow — and App.jsx imported it statically, so every visitor
 * downloaded and parsed the entire thing before the page they actually came for
 * could settle. On a phone, on mobile data, for the majority who never open it.
 *
 * It can't be lazy-loaded on click the way a route is, because the floating
 * launcher button lives inside the component. So it loads at the first *idle
 * moment* instead — or immediately on the first real interaction, if the visitor
 * beats the browser to it. Either way the bubble appears a beat after first
 * paint rather than competing with it, which is the right trade for a control
 * nobody reaches for in the first second.
 *
 * `Suspense fallback={null}` on purpose: a skeleton for a floating bubble would
 * be more distracting than its absence.
 */
export default function DeferredChatBot() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (show) return
    const load = () => setShow(true)
    // Whichever lands first — the browser going quiet, or the user doing
    // anything at all. `scroll` is in there because on mobile it's usually the
    // very first thing that happens.
    const events = ['pointerdown', 'touchstart', 'keydown', 'scroll']
    events.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }))

    const hasIdle = typeof window.requestIdleCallback === 'function'
    // The timeout is the backstop: on a busy page idle may never arrive.
    const handle = hasIdle
      ? window.requestIdleCallback(load, { timeout: 2500 })
      : setTimeout(load, 1500)

    return () => {
      events.forEach((e) => window.removeEventListener(e, load))
      if (hasIdle) window.cancelIdleCallback?.(handle)
      else clearTimeout(handle)
    }
  }, [show])

  if (!show) return null
  return (
    <Suspense fallback={null}>
      <ChatBot />
    </Suspense>
  )
}
