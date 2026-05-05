import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CartToast from './components/CartToast.jsx'
import ChatBot from './components/ChatBot.jsx'
import FestivalBanner from './components/FestivalBanner.jsx'
import Home from './pages/Home.jsx'
import PageFallback from './components/skeletons/PageFallback.jsx'

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

function App() {
  return (
    <CartProvider>
      <div className="d-flex flex-column min-vh-100">
        <FestivalBanner />
        <Navbar />
        <main className="flex-grow-1">
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
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <CartToast />
        <ChatBot />
      </div>
    </CartProvider>
  )
}

export default App
