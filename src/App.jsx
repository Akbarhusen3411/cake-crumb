import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import MiniFooter from './components/MiniFooter.jsx'
import CartToast from './components/CartToast.jsx'
import ChatBot from './components/ChatBot.jsx'
import FestivalBanner from './components/FestivalBanner.jsx'
import BackToTop from './components/BackToTop.jsx'
import Home from './pages/Home.jsx'
import PageFallback from './components/skeletons/PageFallback.jsx'
import ErrorBoundary, { clearChunkReloadGuard } from './components/ErrorBoundary.jsx'

// Lazy-loaded routes — keep initial bundle small.
// Firebase only loads when /reviews or /review are visited.
const About = lazy(() => import('./pages/About.jsx'))
const Menu = lazy(() => import('./pages/Menu.jsx'))
const Shop = lazy(() => import('./pages/Shop.jsx'))
const Gallery = lazy(() => import('./pages/Gallery.jsx'))
const Reviews = lazy(() => import('./pages/Reviews.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const ReviewSubmit = lazy(() => import('./pages/ReviewSubmit.jsx'))
const FAQ = lazy(() => import('./pages/FAQ.jsx'))
const ConfirmOrder = lazy(() => import('./pages/ConfirmOrder.jsx'))
const TrackOrder = lazy(() => import('./pages/TrackOrder.jsx'))
const AdminOrders = lazy(() => import('./pages/AdminOrders.jsx'))
const AdminAccounting = lazy(() => import('./pages/AdminAccounting.jsx'))

// Routes inside the buying / admin-confirm flow render without the footer
// so customers stay focused on the cart → checkout → done path.
const NO_FOOTER_ROUTES = ['/cart', '/checkout', '/confirm-order']

// Scroll the window back to the top on every route change. React Router
// preserves scroll across navigations by default, which leaves users at
// the bottom of the previous page when they tap a header/footer link.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function App() {
  const { pathname } = useLocation()
  const hideFooter = NO_FOOTER_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/')
  )
  // Admin pages are a private full-screen tool — no storefront navbar/footer/chatbot.
  const isAdmin = pathname.startsWith('/admin')

  // We rendered, so any stale-chunk reload already succeeded — re-arm the one-shot
  // guard for a future deploy in this same tab.
  useEffect(() => { clearChunkReloadGuard() }, [])

  return (
    <CartProvider>
      <ScrollToTop />
      <a href="#main" className="cc-skip-link">Skip to main content</a>
      <div className="d-flex flex-column min-vh-100">
        {!isAdmin && <FestivalBanner />}
        {!isAdmin && <Navbar />}
        <main id="main" className="flex-grow-1">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/review" element={<ReviewSubmit />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/confirm-order" element={<ConfirmOrder />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/accounting" element={<AdminAccounting />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        {isAdmin ? null : hideFooter ? <MiniFooter /> : <Footer />}
        {!isAdmin && <CartToast />}
        {!isAdmin && <ChatBot />}
        {!isAdmin && <BackToTop />}
      </div>
    </CartProvider>
  )
}

export default App
