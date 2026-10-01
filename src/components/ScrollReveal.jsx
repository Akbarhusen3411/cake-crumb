import { useLayoutEffect } from 'react'

/**
 * ScrollReveal — text and images fade/slide in as they enter the screen.
 *
 * Site-wide and automatic: rather than wrapping every heading on every page,
 * it tags the blocks inside <main> that match REVEAL_SELECTOR and animates each
 * one the first time it scrolls into view. Whatever is on screen when a page
 * opens animates straight away, staggered, so the page "builds" on arrival.
 *
 * - An element can choose its own motion with data-reveal="up|down|left|right|zoom";
 *   anything already carrying data-reveal is left as authored. data-no-reveal on
 *   an ancestor opts a whole block out.
 * - Only the OUTERMOST match animates — a card's own heading doesn't animate a
 *   second time inside the card.
 * - Once an element has finished arriving, every trace is removed (attribute,
 *   class, delay), so a card's own hover lift and transition come back intact.
 * - The hidden starting state only applies under html.cc-reveal, which is added
 *   here and never under prefers-reduced-motion — with JS off or motion reduced,
 *   nothing is ever hidden.
 * - useLayoutEffect + a MutationObserver tag new content before it paints, so a
 *   lazy route or a "Show more" batch never flashes visible-then-hidden.
 */

const REVEAL_SELECTOR = [
  'h1', 'h2', 'h3', 'h4', 'h5',
  '.eyebrow', 'p', 'img', 'blockquote',
  '.btn-rose', '.btn-outline-rose',
  '.product-card', '.feature-cell', '.card',
  '[class*="__step"]', '[class*="-card"]', 'li',
].join(',')

// Never animate inside these: dialogs must be usable at once, and a skeleton is
// replaced before it would finish.
const SKIP_INSIDE = 'nav, [role="dialog"], .modal, [aria-busy="true"], [data-no-reveal], .cc-chat, .skeleton'

// Form fields never fade — a block holding one is skipped, and its headings and
// text are tagged on their own instead. That's what lets Checkout (one big form)
// animate without its inputs ever being unready to type in.
const CONTROLS = 'input, select, textarea'

const DURATION = 500
const STAGGER = 70
const MAX_DELAY = 400

function directionFor(el) {
  // In a two-column split, the left column comes in from the left and the
  // right one from the right — the "coming from the sides" look.
  const col = el.closest('[class*="col-lg-6"], [class*="col-md-6"]')
  const row = col?.parentElement
  if (row?.classList.contains('row') && row.children.length === 2) {
    return row.children[0] === col ? 'left' : 'right'
  }
  return el.tagName === 'IMG' ? 'zoom' : 'up'
}

function finish(el) {
  el.removeAttribute('data-reveal')
  el.classList.remove('is-revealed')
  el.style.removeProperty('--cc-reveal-delay')
}

export default function ScrollReveal({ enabled = true, routeKey }) {
  useLayoutEffect(() => {
    const root = document.getElementById('main')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!enabled || !root || reduce || !('IntersectionObserver' in window)) return undefined

    const html = document.documentElement
    html.classList.add('cc-reveal')
    const timers = new Set()

    const io = new IntersectionObserver((entries) => {
      let i = 0
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target
        io.unobserve(el)
        const delay = Math.min(i++ * STAGGER, MAX_DELAY)
        el.style.setProperty('--cc-reveal-delay', `${delay}ms`)
        el.classList.add('is-revealed')
        const t = setTimeout(() => { timers.delete(t); finish(el) }, DURATION + delay + 80)
        timers.add(t)
      }
    // A small POSITIVE bottom margin, not a negative one. At -8% (plus the 32px
    // the hidden pose is shifted down), a heading sitting at the foot of the
    // first screen — Home's "Something Extra, On Us" on a laptop — stayed
    // invisible after a refresh until the page was scrolled, and read as a
    // blank band. Anything on screen, or within 60px of it, now shows at once.
    }, { rootMargin: '0px 0px 60px 0px', threshold: 0 })

    const tag = () => {
      for (const el of root.querySelectorAll(REVEAL_SELECTOR)) {
        if (el.dataset.revealDone || el.closest(SKIP_INSIDE)) continue
        el.dataset.revealDone = '1'
        if (el.querySelector(CONTROLS)) continue
        // An ancestor already animating carries this one in with it.
        if (el.parentElement?.closest('[data-reveal]')) continue
        if (!el.dataset.reveal) el.dataset.reveal = directionFor(el)
        io.observe(el)
      }
    }

    tag()
    const mo = new MutationObserver(tag)
    mo.observe(root, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
      timers.forEach(clearTimeout)
      html.classList.remove('cc-reveal')
      // Anything left mid-flight or never reached must not stay invisible.
      root.querySelectorAll('[data-reveal]').forEach(finish)
      root.querySelectorAll('[data-reveal-done]').forEach((el) => el.removeAttribute('data-reveal-done'))
    }
  }, [enabled, routeKey])

  return null
}
