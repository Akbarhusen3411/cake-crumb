import { useEffect } from 'react'

const DEFAULT_TITLE = 'Cake & Crumb — Gourmet Cheesecakes, Milk Cakes & Cookies'
const DEFAULT_DESC =
  'Cake & Crumb — handcrafted cheesecakes, milk cakes, cookies and desserts. Order on WhatsApp.'

/**
 * Update <title>, <meta name="description">, og:title, og:description, twitter:title, twitter:description.
 * Pass a partial object — falls back to defaults.
 */
export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Cake & Crumb` : DEFAULT_TITLE
    document.title = fullTitle

    const desc = description || DEFAULT_DESC

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)

    // Per-route canonical + og:url so each SPA route has a distinct, correct URL.
    const url = window.location.origin + window.location.pathname
    setLink('canonical', url)
    setMeta('property', 'og:url', url)

    return () => {
      // restore defaults on unmount so a page that forgets to call this doesn't
      // inherit the previous route's title/description
      document.title = DEFAULT_TITLE
      setMeta('name', 'description', DEFAULT_DESC)
      setMeta('property', 'og:description', DEFAULT_DESC)
    }
  }, [title, description])
}

function setMeta(attrKey, attrValue, content) {
  let el = document.head.querySelector(`meta[${attrKey}="${attrValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrKey, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}
