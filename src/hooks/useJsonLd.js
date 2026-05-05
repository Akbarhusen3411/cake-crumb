import { useEffect } from 'react'

/**
 * Inject a <script type="application/ld+json"> tag with the given object.
 * Removes the tag on unmount so other pages don't inherit stale schema.
 *
 * Usage:
 *   useJsonLd('shop-products', { '@context': 'https://schema.org', '@type': 'ItemList', ... })
 */
export function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) return
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.dataset.jsonldId = id
    el.text = JSON.stringify(data)
    document.head.appendChild(el)
    return () => {
      const live = document.head.querySelector(`script[data-jsonld-id="${id}"]`)
      if (live) live.remove()
    }
  }, [id, JSON.stringify(data)])
}
