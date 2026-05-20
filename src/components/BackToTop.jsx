import { useEffect, useState } from 'react'
import { FiArrowUp } from 'react-icons/fi'

/**
 * Floating round button that appears once the user has scrolled past 600px
 * and smoothly returns them to the top on click.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollUp() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Back to top"
      className={`cc-back-to-top${visible ? ' is-visible' : ''}`}
    >
      <FiArrowUp size={18} />
    </button>
  )
}
