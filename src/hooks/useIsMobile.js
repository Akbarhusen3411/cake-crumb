import { useEffect, useState } from 'react'

/** True when the viewport is narrower than `bp` (default 768px). Re-renders on resize. */
export function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < bp
  )
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < bp)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [bp])
  return mobile
}
