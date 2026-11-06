import { useEffect, useState } from 'react'

/**
 * How far the on-screen keyboard covers the bottom of the screen, so a
 * bottom sheet can sit above it (iOS doesn't shrink the layout viewport).
 */
export function useKeyboardInset(active) {
  const [kb, setKb] = useState(0)
  useEffect(() => {
    if (!active) return undefined
    const vv = window.visualViewport
    if (!vv) return undefined
    const fit = () => setKb(Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop))))
    fit()
    vv.addEventListener('resize', fit)
    vv.addEventListener('scroll', fit)
    return () => { vv.removeEventListener('resize', fit); vv.removeEventListener('scroll', fit) }
  }, [active])
  return active ? kb : 0
}
