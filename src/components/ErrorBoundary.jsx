import { Component } from 'react'
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

// Suspense handles a lazy chunk that is *pending*, not one that *rejects*. Without a
// boundary, a rejected import() unmounts the whole tree and the user gets a white
// screen. That is not hypothetical: on every deploy Vite emits new hashed chunk
// names, so anyone with the tab already open requests a chunk that no longer exists
// on GitHub Pages the moment they navigate.
// Each browser words this differently, and Vite's preload helper adds its own.
// Chrome/Edge: "Failed to fetch dynamically imported module: …"
// Firefox:     "error loading dynamically imported module"
// Safari:      "Importing a module script failed."
// Vite:        "Unable to preload CSS for /assets/Shop-x1.css"
const CHUNK_ERROR = /loading (css )?chunk|dynamically imported module|importing a module script failed|failed to fetch dynamically|unable to preload/i

const RELOADED_KEY = 'cc_chunk_reloaded'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    // A stale chunk is fixed by fetching the new index.html. Reload once, guarded by
    // sessionStorage so a genuinely broken build can't trap the user in a reload loop.
    if (!CHUNK_ERROR.test(error?.message || '')) return
    let alreadyTried = false
    try {
      alreadyTried = sessionStorage.getItem(RELOADED_KEY) === '1'
      if (!alreadyTried) sessionStorage.setItem(RELOADED_KEY, '1')
    } catch { /* storage blocked — fall through to the manual reload button */ }
    if (!alreadyTried) window.location.reload()
  }

  // One broken route shouldn't poison the rest of the session: clear the error when
  // the user navigates. Reset on a prop rather than remounting via `key`, so we don't
  // tear down <Suspense> and re-flash the page skeleton on every navigation.
  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="container text-center" style={{ padding: '5rem 1rem', minHeight: '60vh' }}>
        <FiAlertCircle size={44} style={{ color: 'var(--cc-rose, #e0617a)' }} aria-hidden />
        <h1 className="mt-3" style={{ fontSize: '1.6rem' }}>Something went wrong</h1>
        <p style={{ color: 'var(--cc-cocoa-soft, #7a584d)', maxWidth: 460, margin: '0.75rem auto 1.5rem' }}>
          Sorry — this page failed to load. Reloading usually fixes it. Your cart is safe.
        </p>
        <button type="button" className="btn-rose" onClick={() => window.location.reload()}>
          <FiRefreshCw aria-hidden /> Reload page
        </button>
      </div>
    )
  }
}

// Clear the one-shot reload guard once the app renders successfully, so a *later*
// stale-chunk error in the same tab can still self-heal.
export function clearChunkReloadGuard() {
  try { sessionStorage.removeItem(RELOADED_KEY) } catch { /* storage blocked */ }
}
