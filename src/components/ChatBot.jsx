import { useState, useRef, useEffect } from 'react'
import {
  FiX, FiSend, FiChevronRight, FiPlus, FiMinus,
  FiShoppingBag, FiHeart, FiAlertCircle, FiStar,
} from 'react-icons/fi'
import { asset } from '../data/images.js'
import { generateOrderId } from '../services/orderId.js'
import { saveOrder } from '../services/orders.js'
import { WHATSAPP_PHONE } from './WhatsAppButton.jsx'
import { useCart } from '../context/CartContext.jsx'

const WHATSAPP_NUMBER = WHATSAPP_PHONE

// ─── Category preview thumbnails (optional eye-candy when showing prices) ───
const CAT_IMAGES = {
  cheesecake: [
    { src: 'products/cheesecake-strawberry-rose.jpeg', label: 'Strawberry' },
    { src: 'products/cheesecake-blueberry.jpeg',       label: 'Blueberry' },
    { src: 'products/cheesecake-chocolate-rose.jpeg',  label: 'Chocolate' },
    { src: 'products/cheesecake-caramel.jpeg',         label: 'Biscoff' },
    { src: 'products/cheesecake-pistachio-cup.jpeg',   label: 'Pistachio' },
    { src: 'products/cheesecake-nutella.jpeg',         label: 'Nutella' },
  ],
  cookies: [
    { src: 'products/cookies-triple-choc-pan.jpeg',    label: 'Triple Choc' },
    { src: 'products/cookies-chocolate-board.jpeg',    label: 'Red Velvet' },
    { src: 'products/cookies-chunky.jpeg',             label: 'Pistachio Rose' },
    { src: 'products/cookies-chunky.jpeg',             label: 'Almond' },
  ],
  cakes: [
    { src: 'products/cupcakes-pink-purple.jpeg',       label: 'Cupcakes' },
    { src: 'products/milkcake-rose-purple.jpeg',       label: 'Rose Milk Cake' },
    { src: 'products/bakes-chocolate-square.jpeg',     label: 'Brownies' },
    { src: 'products/cake-pink-letter.jpeg',           label: 'Cakesicles' },
    { src: 'products/cake-pink-letter.jpeg',           label: 'Cake Pops' },
  ],
  desserts: [
    { src: 'products/dessert-cups-chocolate.jpeg',     label: 'Cheesecake Cup' },
    { src: 'products/dessert-cups-lemon.jpeg',         label: 'Custard Cup' },
    { src: 'products/dessert-cups-trio.jpeg',          label: 'Trifle Cup' },
    { src: 'products/jelly-cups-rainbow.jpeg',         label: 'Jelly Cup' },
  ],
  drinks: [
    { src: 'products/drink-virgin-mojito.jpeg',        label: 'Mojito' },
    { src: 'products/drink-blue-lagoon.jpeg',          label: 'Blue Lagoon' },
    { src: 'products/drink-strawberry-mojito.jpeg',    label: 'Milkshake' },
    { src: 'products/drink-blue-lagoon.jpeg',          label: 'Iced Coffee' },
    { src: 'products/drink-virgin-mojito.jpeg',        label: 'Hot Coffee' },
  ],
}

// ─── Orderable items with prices + category labels ───
const ORDER_ITEMS = {
  cheesecake_slice: [
    { name: 'Strawberry Slice', price: 120, cat: '🍰 Cheesecake' },
    { name: 'Blueberry Slice', price: 140, cat: '🍰 Cheesecake' },
    { name: 'Raspberry Slice', price: 140, cat: '🍰 Cheesecake' },
    { name: 'Orange Creamsicle Slice', price: 130, cat: '🍰 Cheesecake' },
    { name: 'Lemon Slice', price: 120, cat: '🍰 Cheesecake' },
    { name: 'Rose Slice', price: 120, cat: '🍰 Cheesecake' },
    { name: 'Mango Slice', price: 120, cat: '🍰 Cheesecake' },
    { name: 'Passion Fruit Slice', price: 130, cat: '🍰 Cheesecake' },
    { name: 'Cherry Slice', price: 130, cat: '🍰 Cheesecake' },
    { name: 'Chocolate Slice', price: 130, cat: '🍰 Cheesecake' },
    { name: 'Nutella Slice', price: 150, cat: '🍰 Cheesecake' },
    { name: 'Biscoff Slice', price: 140, cat: '🍰 Cheesecake' },
    { name: 'Cookies & Cream Slice', price: 150, cat: '🍰 Cheesecake' },
    { name: 'Caramel Slice', price: 150, cat: '🍰 Cheesecake' },
    { name: 'Coffee Slice', price: 150, cat: '🍰 Cheesecake' },
    { name: 'Pistachio Slice', price: 160, cat: '🍰 Cheesecake' },
    { name: 'Dubai Special Slice', price: 170, cat: '🍰 Cheesecake' },
  ],
  cheesecake_banto: [
    { name: 'Strawberry Banto', price: 350, cat: '🍰 Cheesecake' },
    { name: 'Blueberry Banto', price: 410, cat: '🍰 Cheesecake' },
    { name: 'Raspberry Banto', price: 410, cat: '🍰 Cheesecake' },
    { name: 'Mango Banto', price: 350, cat: '🍰 Cheesecake' },
    { name: 'Chocolate Banto', price: 380, cat: '🍰 Cheesecake' },
    { name: 'Nutella Banto', price: 440, cat: '🍰 Cheesecake' },
    { name: 'Biscoff Banto', price: 410, cat: '🍰 Cheesecake' },
    { name: 'Cookies & Cream Banto', price: 430, cat: '🍰 Cheesecake' },
    { name: 'Pistachio Banto', price: 470, cat: '🍰 Cheesecake' },
    { name: 'Dubai Special Banto', price: 500, cat: '🍰 Cheesecake' },
  ],
  cookies: [
    { name: 'Triple Choc Cookie', price: 60, cat: '🍪 Cookies' },
    { name: 'White Choc Cookie', price: 50, cat: '🍪 Cookies' },
    { name: 'Classic Cookie', price: 50, cat: '🍪 Cookies' },
    { name: 'Red Velvet Cookie', price: 60, cat: '🍪 Cookies' },
    { name: 'Almond Cookie', price: 70, cat: '🍪 Cookies' },
    { name: 'Coconut Cookie', price: 60, cat: '🍪 Cookies' },
    { name: 'Pistachio Rose Cookie', price: 70, cat: '🍪 Cookies' },
    { name: 'Cookie Box (6)', price: 340, cat: '🍪 Cookies' },
    { name: 'Cookie Box (12)', price: 700, cat: '🍪 Cookies' },
  ],
  cakes: [
    { name: 'Choc Cupcake', price: 100, cat: '🧁 Cupcakes' },
    { name: 'Vanilla Cupcake', price: 100, cat: '🧁 Cupcakes' },
    { name: 'Brownie', price: 80, cat: '🎂 Bakes' },
    { name: 'Blondie', price: 80, cat: '🎂 Bakes' },
    { name: 'Cakesicle', price: 120, cat: '🎂 Bakes' },
    { name: 'Cake Pop', price: 90, cat: '🎂 Bakes' },
    { name: 'Biscoff Milk Cake (Whole)', price: 800, cat: '🥛 Milk Cake' },
    { name: 'Rose Milk Cake (Whole)', price: 800, cat: '🥛 Milk Cake' },
    { name: 'Pistachio Milk Cake (Whole)', price: 950, cat: '🥛 Milk Cake' },
  ],
  desserts: [
    { name: 'Custard Cup', price: 90, cat: '🍮 Dessert Cup' },
    { name: 'Cheesecake Cup', price: 150, cat: '🍮 Dessert Cup' },
    { name: 'Trifle Cup', price: 100, cat: '🍮 Dessert Cup' },
    { name: 'Jelly Cup', price: 80, cat: '🍮 Dessert Cup' },
  ],
  drinks: [
    { name: 'Virgin Mojito', price: 120, cat: '🍹 Mojito' },
    { name: 'Blue Lagoon', price: 120, cat: '🍹 Mojito' },
    { name: 'Strawberry Mojito', price: 120, cat: '🍹 Mojito' },
    { name: 'Biscoff Milkshake', price: 180, cat: '🥤 Milkshake' },
    { name: 'Nutella Milkshake', price: 180, cat: '🥤 Milkshake' },
    { name: 'Iced Coffee', price: 100, cat: '☕ Coffee' },
    { name: 'Hot Coffee', price: 90, cat: '☕ Coffee' },
  ],
}

function getItemCat(name) {
  for (const items of Object.values(ORDER_ITEMS)) {
    const found = items.find((i) => i.name === name)
    if (found) return found.cat
  }
  return ''
}

// ─── Menu price display data ───
const MENU_DATA = {
  cheesecake: {
    title: 'Cheesecake', subtitle: 'Banto 4" · 3 slices | Per slice',
    groups: [
      { name: 'Classic', items: [
        { n: 'Strawberry', s: '₹120', w: '₹350' }, { n: 'Blueberry', s: '₹140', w: '₹410' },
        { n: 'Raspberry', s: '₹140', w: '₹410' }, { n: 'Orange Creamsicle', s: '₹130', w: '₹380' },
        { n: 'Lemon', s: '₹120', w: '₹350' }, { n: 'Rose', s: '₹120', w: '₹350' },
      ]},
      { name: 'Exotic', items: [
        { n: 'Mango', s: '₹120', w: '₹350' }, { n: 'Passion Fruit', s: '₹130', w: '₹380' },
        { n: 'Cherry', s: '₹130', w: '₹380' }, { n: 'Guava', s: '₹120', w: '₹350' },
        { n: 'Mango & Passion', s: '₹140', w: '₹410' }, { n: 'Coconut', s: '₹140', w: '₹410' },
      ]},
      { name: 'Chocolate', items: [
        { n: 'Chocolate', s: '₹130', w: '₹380' }, { n: 'Chocolate Orange', s: '₹130', w: '₹380' },
        { n: 'Black Forest', s: '₹130', w: '₹380' }, { n: 'Chocolate Chunk', s: '₹130', w: '₹380' },
        { n: 'Nutella', s: '₹150', w: '₹440' }, { n: 'Biscoff', s: '₹140', w: '₹410' },
      ]},
      { name: 'Premium', items: [
        { n: 'Cookies & Cream', s: '₹150', w: '₹430' }, { n: 'Caramel', s: '₹150', w: '₹430' },
        { n: 'Coffee', s: '₹150', w: '₹430' }, { n: 'Pistachio', s: '₹160', w: '₹470' },
        { n: 'Dubai Special', s: '₹170', w: '₹500' },
      ]},
    ],
  },
  cookies: {
    title: 'Cookies', subtitle: 'Per piece | Box of 6 | Box of 12',
    items: [
      { n: 'Triple Choc', p: '₹60 · ₹340 · ₹700' }, { n: 'White Choc', p: '₹50 · ₹280 · ₹580' },
      { n: 'Classic', p: '₹50 · ₹280 · ₹580' }, { n: 'Red Velvet', p: '₹60 · ₹340 · ₹700' },
      { n: 'Almond', p: '₹70 · ₹400 · ₹820' }, { n: 'Coconut', p: '₹60 · ₹340 · ₹700' },
      { n: 'Pistachio & Rose', p: '₹70 · ₹400 · ₹820' },
    ],
  },
  cakes: {
    title: 'Cakes & Treats', subtitle: 'Per piece / whole',
    groups: [
      { name: 'Cupcakes', items: [{ n: 'Chocolate', p: '₹100' }, { n: 'Vanilla', p: '₹100' }] },
      { name: 'Bakes', items: [
        { n: 'Brownie', p: '₹80' }, { n: 'Blondie', p: '₹80' }, { n: 'Cakesicle', p: '₹120' },
        { n: 'Cake Pop', p: '₹90' }, { n: 'Choc Strawberry', p: '₹70' },
      ]},
      { name: 'Milk Cake 6"', items: [
        { n: 'Biscoff', s: '₹100', w: '₹800' }, { n: 'Rose', s: '₹100', w: '₹800' },
        { n: 'Chocolate', s: '₹110', w: '₹850' }, { n: 'Pistachio', s: '₹120', w: '₹950' },
      ]},
    ],
  },
  desserts: {
    title: 'Dessert Cups', subtitle: 'Per cup',
    items: [
      { n: 'Custard Cup', p: '₹90' }, { n: 'Cheesecake Cup', p: '₹150' },
      { n: 'Trifle Cup', p: '₹100' }, { n: 'Jelly Cup', p: '₹80' }, { n: 'Grass Cup', p: '₹90' },
    ],
  },
  drinks: {
    title: 'Drinks', subtitle: 'Per glass / cup',
    groups: [
      { name: 'Mojitos', items: [
        { n: 'Virgin Mojito', p: '₹120' }, { n: 'Blue Lagoon', p: '₹120' }, { n: 'Strawberry', p: '₹120' },
      ]},
      { name: 'Milkshakes', items: [
        { n: 'Biscoff', p: '₹180' }, { n: 'Nutella', p: '₹180' }, { n: 'Oreo', p: '₹180' },
      ]},
      { name: 'Coffee', items: [{ n: 'Iced Coffee', p: '₹100' }, { n: 'Hot Coffee', p: '₹90' }] },
    ],
  },
}

const VISITED_KEY = 'cake-crumb-chatbot-visited'

function getInitialMessages() {
  let isReturning = false
  try { isReturning = localStorage.getItem(VISITED_KEY) === '1' } catch {}
  try { localStorage.setItem(VISITED_KEY, '1') } catch {}
  if (isReturning) {
    return [
      { from: 'bot', text: "Welcome back to *Cake & Crumb*! 🎂", delay: 0 },
      { from: 'bot', text: "Craving something sweet today? I can show you our menu, check prices, or take your order.", delay: 500 },
    ]
  }
  return [
    { from: 'bot', text: "Hello! Welcome to *Cake & Crumb* — The Gourmet Chocolate & Berry Boutique! 🎂", delay: 0 },
    { from: 'bot', text: "I'm here to help you explore our menu, check prices, or place an order. How can I help?", delay: 600 },
  ]
}

const MAIN_OPTIONS = [
  { label: '📋 View Menu', action: 'menu' },
  { label: '🛒 Place Order', action: 'order' },
  { label: '⏰ Delivery Info', action: 'delivery' },
  { label: '📍 Location', action: 'location' },
  { label: '📞 Contact Us', action: 'contact' },
]

const MENU_CATEGORIES = [
  { label: '🍰 Cheesecake', action: 'cat_cheesecake' },
  { label: '🍪 Cookies', action: 'cat_cookies' },
  { label: '🎂 Cakes & Treats', action: 'cat_cakes' },
  { label: '🍮 Dessert Cups', action: 'cat_desserts' },
  { label: '🥤 Drinks', action: 'cat_drinks' },
  { label: '◀️ Back to Main', action: 'home' },
]

const ORDER_CATEGORIES = [
  { label: '🍰 Cheesecake Slices', action: 'ord_cheesecake_slice' },
  { label: '🎂 Cheesecake Banto', action: 'ord_cheesecake_banto' },
  { label: '🍪 Cookies', action: 'ord_cookies' },
  { label: '🧁 Cakes & Treats', action: 'ord_cakes' },
  { label: '🍮 Dessert Cups', action: 'ord_desserts' },
  { label: '🥤 Drinks', action: 'ord_drinks' },
  { label: '✅ Review My Order', action: 'review_order' },
  { label: '🏠 Main Menu', action: 'home' },
]

function formatBold(text) {
  return text.split('*').map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

// ─── Price card ───
function PriceCard({ cat }) {
  const isSpecialName = (name) => /(special|dubai|premium)/i.test(name)

  const renderPrices = (item) => {
    if (item.s && item.w) {
      return (
        <div className="flex gap-2.5 shrink-0">
          <span className="w-11 text-right text-[12px] font-bold text-berry tabular-nums">{item.s}</span>
          <span className="w-12 text-right text-[12px] font-bold text-chocolate tabular-nums">{item.w}</span>
        </div>
      )
    }
    if (item.p && item.p.includes('·')) {
      const parts = item.p.split('·').map((s) => s.trim())
      return (
        <div className="flex gap-2 shrink-0">
          {parts.map((price, i) => (
            <span
              key={i}
              className={`w-11 text-right text-[12px] font-bold tabular-nums ${i === 0 ? 'text-berry' : 'text-chocolate'}`}
            >
              {price}
            </span>
          ))}
        </div>
      )
    }
    return <span className="text-[12px] font-bold text-berry shrink-0 tabular-nums">{item.p}</span>
  }

  const renderColumnHeaders = (items) => {
    const first = items[0]
    if (first.s && first.w) {
      return (
        <div className="flex justify-end gap-2.5 px-3 pb-1 pt-0.5">
          <span className="w-11 text-right text-[9px] font-bold tracking-[0.14em] uppercase text-chocolate-light/55">Slice</span>
          <span className="w-12 text-right text-[9px] font-bold tracking-[0.14em] uppercase text-chocolate-light/55">Whole</span>
        </div>
      )
    }
    if (first.p && first.p.includes('·')) {
      const parts = first.p.split('·').length
      const labels = parts === 3 ? ['Piece', 'Box 6', 'Box 12'] : ['Slice', 'Whole']
      return (
        <div className="flex justify-end gap-2 px-3 pb-1 pt-0.5">
          {labels.slice(0, parts).map((label) => (
            <span key={label} className="w-11 text-right text-[9px] font-bold tracking-[0.14em] uppercase text-chocolate-light/55">{label}</span>
          ))}
        </div>
      )
    }
    return null
  }

  const renderGroup = (items, groupName, key) => {
    const isPremium = groupName && /premium/i.test(groupName)
    return (
      <div key={key}>
        {groupName && (
          <div className="flex items-center gap-2 px-3 pt-3 pb-1">
            <span className={`inline-block w-1 h-3 rounded-full ${isPremium ? 'bg-gold' : 'bg-berry/60'}`} />
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-chocolate">{groupName}</span>
            {isPremium && <FiStar size={9} className="text-gold" />}
            <div className="flex-1 h-px bg-gradient-to-r from-gold/25 via-cream-dark/40 to-transparent" />
          </div>
        )}
        {renderColumnHeaders(items)}
        <div>
          {items.map((item, i) => {
            const showSpecial = isPremium || isSpecialName(item.n)
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-1.5 gap-2 ${i % 2 === 1 ? 'bg-cream/40' : ''}`}
              >
                <span className="text-[12.5px] text-chocolate flex-1 min-w-0 flex items-center gap-1.5 truncate">
                  {showSpecial && (
                    <span className="text-gold shrink-0 leading-none" aria-hidden>✦</span>
                  )}
                  <span className="truncate">{item.n}</span>
                  {/Dubai Special|Pistachio.*Rose Special/i.test(item.n) && (
                    <span className="shrink-0 text-[8px] font-bold tracking-[0.1em] uppercase bg-gold/20 text-chocolate px-1.5 py-0.5 rounded-full border border-gold/30">
                      Special
                    </span>
                  )}
                </span>
                {renderPrices(item)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-2xl rounded-bl-md shadow-md overflow-hidden border border-gold/15 max-w-[90%] w-[90%] chat-msg-in"
      style={{ animation: 'chat-msg-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="px-3 py-2.5 bg-gradient-to-r from-gold/20 via-cream/80 to-soft-pink/40 border-b border-gold/15">
        <div className="flex items-center gap-1.5">
          <FiStar size={11} className="text-gold" />
          <h4 className="text-[13px] font-bold text-chocolate" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>{cat.title}</h4>
        </div>
        <p className="text-[10px] text-chocolate-light/60 mt-0.5">{cat.subtitle}</p>
      </div>
      <div className="pb-2">
        {cat.groups
          ? cat.groups.map((g, i) => renderGroup(g.items, g.name, i))
          : renderGroup(cat.items, null, 'flat')}
      </div>
    </div>
  )
}

// ─── Order item selector ───
function OrderItemSelector({ items, cart, onUpdate, onDone }) {
  return (
    <div
      className="bg-white rounded-2xl rounded-tl-sm shadow-md overflow-hidden max-w-[90%] border border-gold/15"
      style={{ animation: 'chat-msg-in 0.25s ease-out' }}
    >
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-gold/15 via-cream/80 to-soft-pink/40 border-b border-gold/10 flex items-center gap-2">
        <FiStar size={12} className="text-gold" />
        <p className="text-[11px] font-semibold text-chocolate tracking-wide">Tap + to add to your order</p>
      </div>
      <div className="max-h-[260px] overflow-y-auto divide-y divide-cream-dark/40">
        {items.map((item) => {
          const qty = cart[item.name] || 0
          return (
            <div key={item.name} className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${qty > 0 ? 'bg-berry/5' : ''}`}>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[12.5px] font-medium text-chocolate truncate leading-tight">{item.name}</p>
                <p className="text-[11px] text-berry font-bold mt-0.5">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {qty > 0 && (
                  <>
                    <button
                      onClick={() => onUpdate(item.name, item.price, qty - 1)}
                      className="w-7 h-7 rounded-full bg-cream border border-chocolate/10 flex items-center justify-center text-chocolate active:scale-90 transition-transform"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-6 text-center text-[13px] font-bold text-chocolate">{qty}</span>
                  </>
                )}
                <button
                  onClick={() => onUpdate(item.name, item.price, qty + 1)}
                  className="w-7 h-7 rounded-full bg-berry flex items-center justify-center text-white active:scale-90 transition-transform"
                  style={{ boxShadow: '0 2px 6px rgba(224, 97, 122, 0.4)' }}
                >
                  <FiPlus size={12} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <button
        onClick={onDone}
        className="w-full py-3 text-white text-[12px] font-semibold tracking-wide flex items-center justify-center gap-1.5 active:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(to right, #e0617a, #cf3e63)' }}
      >
        <FiShoppingBag size={13} />
        Done — Review or Add More
      </button>
    </div>
  )
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [options, setOptions] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [orderCart, setOrderCart] = useState({})
  const [activeOrderCat, setActiveOrderCat] = useState(null)
  const [orderStep, setOrderStep] = useState(null)
  const [lastOrderId, setLastOrderId] = useState(null)
  const [lastOrderTime, setLastOrderTime] = useState(null)
  const [orderInfo, setOrderInfo] = useState({ name: '', phone: '', address: '', date: '' })
  const scrollRef = useRef(null)
  const chatPanelRef = useRef(null)
  const chatToggleRef = useRef(null)

  const { count: mainCartCount } = useCart()

  // Close the chat when the user clicks anywhere outside the panel/toggle.
  // Only desktop matters in practice — on mobile the panel is fullscreen.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      const panel = chatPanelRef.current
      const toggle = chatToggleRef.current
      if (panel && !panel.contains(e.target) && toggle && !toggle.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
  }

  const addBotMessage = (text, delay = 0, images = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setTyping(true)
        scrollToBottom()
        setTimeout(() => {
          setTyping(false)
          setMessages((prev) => [...prev, { from: 'bot', text, images }])
          scrollToBottom()
          resolve()
        }, 250 + Math.min(text.length * 2, 500))
      }, delay)
    })
  }

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { from: 'user', text }])
    scrollToBottom()
  }

  const addBotMenuMessage = (cat, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setTyping(true)
        scrollToBottom()
        setTimeout(() => {
          setTyping(false)
          setMessages((prev) => [...prev, { from: 'bot', menu: cat }])
          scrollToBottom()
          resolve()
        }, 400)
      }, delay)
    })
  }

  const getCartTotal = () =>
    Object.values(orderCart).reduce((sum, item) => sum + item.price * item.qty, 0)

  const getCartSummary = () => {
    const items = Object.entries(orderCart).filter(([, v]) => v.qty > 0)
    if (items.length === 0) return 'No items yet'
    return items.map(([name, { qty, price }]) => `• ${name} x${qty} = ₹${price * qty}`).join('\n')
  }

  const updateCartItem = (name, price, qty) => {
    setOrderCart((prev) => {
      const updated = { ...prev }
      if (qty <= 0) delete updated[name]
      else updated[name] = { qty, price }
      return updated
    })
  }

  const showMainMenu = async () => {
    setOptions([])
    setActiveOrderCat(null)
    setOrderStep(null)
    await addBotMessage('What would you like to do?')
    setOptions(MAIN_OPTIONS)
  }

  const showCategoryMenu = async () => {
    setOptions([])
    await addBotMessage('Choose a category to view prices:')
    setOptions(MENU_CATEGORIES)
  }

  const showCategoryPrices = async (catKey) => {
    setOptions([])
    const cat = MENU_DATA[catKey]
    const images = CAT_IMAGES[catKey]
    if (!cat) return
    if (images) await addBotMessage(`Here's our *${cat.title}* collection! 😍`, 0, images)
    await addBotMenuMessage(cat)
    await addBotMessage('Would you like to see another category or place an order?')
    setOptions([
      { label: '📋 More Categories', action: 'menu' },
      { label: '🛒 Place Order', action: 'order' },
      { label: '🏠 Main Menu', action: 'home' },
    ])
  }

  const showOrderCategories = async () => {
    setOptions([])
    setActiveOrderCat(null)
    const total = getCartTotal()
    if (total > 0) {
      await addBotMessage(`*Your cart so far:* ₹${total}\n\nSelect a category to add items, or review your order:`)
    } else {
      await addBotMessage('Select a category to start adding items to your order:')
    }
    setOptions(ORDER_CATEGORIES)
  }

  const sendOrderToWhatsApp = () => {
    const items = Object.entries(orderCart).filter(([, v]) => v.qty > 0)
    const total = getCartTotal()
    const deliveryFee = total >= 499 ? 0 : 49
    const grandTotal = total + deliveryFee
    const orderId = generateOrderId(orderInfo.name)
    setLastOrderId(orderId)
    setLastOrderTime(Date.now())

    // Persist to Firestore (fire-and-forget, never blocks WhatsApp open).
    saveOrder({
      orderId,
      items: items.map(([name, { qty, price }]) => ({ name, qty, price, id: name.toLowerCase().replace(/\s+/g, '-') })),
      totals: { subtotal: total, delivery: deliveryFee, total: grandTotal },
      customer: {
        name: orderInfo.name,
        phone: orderInfo.phone,
        address: orderInfo.address,
      },
      payment: { method: 'cod' },
      notes: `Delivery: ${orderInfo.date}`,
      source: 'chatbot',
    })

    const grouped = {}
    items.forEach(([name, { qty, price }]) => {
      const cat = getItemCat(name) || '📦 Other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push({ name, qty, price })
    })
    let orderLines = ''
    Object.entries(grouped).forEach(([cat, catItems]) => {
      orderLines += `\n*${cat}*\n`
      catItems.forEach(({ name, qty, price }) => {
        orderLines += `  • ${name} × ${qty} = ₹${price * qty}\n`
      })
    })

    const orderTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

    const msg =
      `🎂 *NEW ORDER — ${orderId}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*👤 Customer:* ${orderInfo.name}\n` +
      `*📞 Phone:* ${orderInfo.phone}\n` +
      `*📍 Address:* ${orderInfo.address}\n` +
      `*📅 Delivery:* ${orderInfo.date}\n` +
      `*🕐 Order Time:* ${orderTime}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*📋 Order Items:*${orderLines}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Subtotal:* ₹${total}\n` +
      `*Delivery:* ${deliveryFee === 0 ? 'FREE ✅' : '₹' + deliveryFee}\n` +
      `*💰 Total: ₹${grandTotal}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `⚠️ *Cancel window:* 30 min from order time.\n\n` +
      `Please confirm my order. Thank you! 🙏`

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  const handleAction = async (action, label) => {
    if (label) addUserMessage(label.replace(/^[^\s]+ /, ''))

    if (action.startsWith('ord_')) {
      const catKey = action.replace('ord_', '')
      const items = ORDER_ITEMS[catKey]
      if (items) {
        setOptions([])
        await addBotMessage('Tap *+* to add items. Tap *Done* when finished.')
        setActiveOrderCat(catKey)
        scrollToBottom()
      }
      return
    }

    switch (action) {
      case 'home':
        setOrderCart({})
        setOrderStep(null)
        setOrderInfo({ name: '', phone: '', address: '', date: '' })
        await showMainMenu()
        break
      case 'menu':
        await showCategoryMenu()
        break
      case 'cat_cheesecake':
      case 'cat_cookies':
      case 'cat_cakes':
      case 'cat_desserts':
      case 'cat_drinks':
        await showCategoryPrices(action.replace('cat_', ''))
        break
      case 'order':
        setOptions([])
        await addBotMessage("Let's build your order! 🛒\n\nSelect a category, add items with quantities, then review & checkout.")
        await showOrderCategories()
        break
      case 'review_order': {
        setOptions([])
        const items = Object.entries(orderCart).filter(([, v]) => v.qty > 0)
        if (items.length === 0) {
          await addBotMessage('Your cart is empty! Please add some items first. 🛒')
          await showOrderCategories()
          return
        }
        const total = getCartTotal()
        const fee = total >= 499 ? 0 : 49
        let summary = `*🛒 Your Order:*\n\n` + getCartSummary()
        summary += `\n\n*Subtotal:* ₹${total}\n*Delivery:* ${fee === 0 ? 'FREE ✅' : '₹' + fee}\n*Total: ₹${total + fee}*`
        await addBotMessage(summary)
        await addBotMessage("Looks good? Let's proceed with your details, or go back to add more items.")
        setOptions([
          { label: '✅ Confirm & Enter Details', action: 'collect_info' },
          { label: '➕ Add More Items', action: 'order' },
          { label: '🗑️ Clear Cart', action: 'clear_cart' },
          { label: '🏠 Cancel', action: 'home' },
        ])
        break
      }
      case 'clear_cart':
        setOrderCart({})
        setOptions([])
        await addBotMessage('Cart cleared! 🗑️')
        await showOrderCategories()
        break
      case 'collect_info':
        setOptions([])
        setActiveOrderCat(null)
        await addBotMessage('Great! I need a few details for delivery.\n\nPlease type your *full name*:')
        setOrderStep('name')
        break
      case 'confirm_send':
        setOptions([])
        sendOrderToWhatsApp()
        await addBotMessage('✅ *Order sent to WhatsApp!*\n\nOur team will confirm your order within minutes.\n\n⚠️ *Cancellation:* You can cancel within 30 minutes. After that, cancellation is not available.')
        setOrderCart({})
        setOrderStep(null)
        setOptions([
          { label: '🚫 Cancel My Order', action: 'user_cancel' },
          { label: '🏠 Main Menu', action: 'home' },
        ])
        break
      case 'user_cancel': {
        setOptions([])
        if (lastOrderTime && Date.now() - lastOrderTime > 30 * 60 * 1000) {
          await addBotMessage('⏰ Sorry! The 30-minute cancellation window has expired. This order can no longer be cancelled.\n\nFor help, contact: +91 90816 68490')
          setOptions([{ label: '🏠 Main Menu', action: 'home' }])
        } else {
          const cancelRequest =
            `🚫 *CANCEL REQUEST*\n\n` +
            `Order ID: *${lastOrderId || 'Recent Order'}*\n` +
            `Customer: ${orderInfo.name || 'Customer'}\n` +
            `Phone: ${orderInfo.phone || ''}\n\n` +
            `I would like to cancel my order. Please confirm cancellation.`
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(cancelRequest)}`, '_blank', 'noopener,noreferrer')
          await addBotMessage('🚫 *Cancel request sent!*\n\nOur team will confirm the cancellation on WhatsApp shortly.\n\nNote: Cancellation is final only after admin confirms it.')
          setOptions([{ label: '🏠 Main Menu', action: 'home' }])
        }
        break
      }
      case 'whatsapp':
        setOptions([])
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Cake & Crumb! I'd like to place an order.")}`, '_blank', 'noopener,noreferrer')
        await addBotMessage('WhatsApp opened! Our team typically replies within minutes. 😊')
        setOptions([{ label: '🏠 Main Menu', action: 'home' }])
        break
      case 'delivery':
        setOptions([])
        await addBotMessage('*Delivery Information*\n\n📍 *Area:* All Gujarat districts\n⏰ *Notice:* Please order 24 hours in advance\n🚗 *Free delivery* on orders above ₹499\n💰 *Delivery fee:* ₹49 (under ₹499)\n📦 *Packaging:* Included in price')
        setOptions([{ label: '🛒 Place Order', action: 'order' }, { label: '🏠 Main Menu', action: 'home' }])
        break
      case 'location':
        setOptions([])
        await addBotMessage('*Our Location*\n\n📍 Vaso, Kheda, Gujarat 387380\n🏠 Home bakery — we deliver across Gujarat!')
        setOptions([{ label: '🛒 Place Order', action: 'order' }, { label: '🏠 Main Menu', action: 'home' }])
        break
      case 'contact':
        setOptions([])
        await addBotMessage('*Contact Us*\n\n📱 *WhatsApp:* +91 90816 68490\n📱 *WhatsApp:* +91 91731 83440\n📞 *Call:* +91 90816 68490\n📷 *Instagram:* @cake_and_crumb_1')
        setOptions([{ label: '💬 Open WhatsApp', action: 'whatsapp' }, { label: '🏠 Main Menu', action: 'home' }])
        break
      default:
        break
    }
  }

  const handleTextInput = async (text) => {
    const lower = text.toLowerCase().trim()
    addUserMessage(text)
    setInput('')

    if (orderStep === 'name') {
      setOrderInfo((prev) => ({ ...prev, name: text }))
      setOrderStep('phone')
      await addBotMessage(`Thanks *${text}*! Now enter your *phone number*:`)
      return
    }
    if (orderStep === 'phone') {
      const cleaned = text.replace(/[\s\-()]/g, '')
      if (!/^\+?\d{7,15}$/.test(cleaned)) {
        await addBotMessage('Please enter a valid phone number (with country code for international):')
        return
      }
      setOrderInfo((prev) => ({ ...prev, phone: text }))
      setOrderStep('address')
      await addBotMessage('Enter your *full delivery address*\n(House/Flat, Street, Area, City, Pincode):')
      return
    }
    if (orderStep === 'address') {
      setOrderInfo((prev) => ({ ...prev, address: text }))
      setOrderStep('date')
      await addBotMessage('When would you like it delivered?\n(e.g., *Tomorrow 4 PM*, *31 March Evening*):')
      return
    }
    if (orderStep === 'date') {
      setOrderInfo((prev) => ({ ...prev, date: text }))
      setOrderStep(null)
      const total = getCartTotal()
      const fee = total >= 499 ? 0 : 49
      let finalSummary = `*📋 Order Summary*\n\n` + getCartSummary()
      finalSummary += `\n\n*Subtotal:* ₹${total}\n*Delivery:* ${fee === 0 ? 'FREE ✅' : '₹' + fee}\n*💰 Total: ₹${total + fee}*`
      finalSummary += `\n\n*👤* ${orderInfo.name}\n*📞* ${orderInfo.phone}\n*📍* ${orderInfo.address}\n*📅* ${text}`
      await addBotMessage(finalSummary)
      await addBotMessage('Ready to send this order to our bakery on WhatsApp? 🎂')
      setOptions([
        { label: '✅ Send Order via WhatsApp', action: 'confirm_send' },
        { label: '✏️ Edit Details', action: 'collect_info' },
        { label: '🏠 Cancel', action: 'home' },
      ])
      return
    }

    if (['hi', 'hello', 'hey', 'hii'].some((w) => lower.includes(w))) {
      await addBotMessage('Hi there! Welcome to *Cake & Crumb*! 😊')
      await showMainMenu()
    } else if (['menu', 'price', 'rate', 'list'].some((w) => lower.includes(w))) {
      await showCategoryMenu()
    } else if (['order', 'buy', 'want'].some((w) => lower.includes(w))) {
      await handleAction('order')
    } else if (['cheesecake', 'cheese'].some((w) => lower.includes(w))) {
      await showCategoryPrices('cheesecake')
    } else if (['cookie', 'biscuit'].some((w) => lower.includes(w))) {
      await showCategoryPrices('cookies')
    } else if (['cake', 'brownie', 'cupcake'].some((w) => lower.includes(w))) {
      await showCategoryPrices('cakes')
    } else if (['dessert', 'cup', 'custard'].some((w) => lower.includes(w))) {
      await showCategoryPrices('desserts')
    } else if (['drink', 'mojito', 'shake', 'coffee'].some((w) => lower.includes(w))) {
      await showCategoryPrices('drinks')
    } else if (['delivery', 'deliver'].some((w) => lower.includes(w))) {
      await handleAction('delivery')
    } else if (['contact', 'phone', 'whatsapp'].some((w) => lower.includes(w))) {
      await handleAction('contact')
    } else if (['thank', 'thanks', 'bye'].some((w) => lower.includes(w))) {
      await addBotMessage('Thank you! Have a sweet day! 🎂❤️')
      setOptions([{ label: '🏠 Main Menu', action: 'home' }])
    } else {
      await addBotMessage("I didn't understand that. Let me show you the menu! 😊")
      await showMainMenu()
    }
  }

  useEffect(() => {
    if (open && !initialized) {
      setInitialized(true)
      const init = async () => {
        const initialMessages = getInitialMessages()
        for (const msg of initialMessages) await addBotMessage(msg.text, msg.delay)
        setOptions(MAIN_OPTIONS)
      }
      init()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (open && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Toggle button */}
      <button
        ref={chatToggleRef}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open Cake & Crumb chat'}
        className={`fixed bottom-6 right-6 z-[90] flex items-center justify-center transition-all duration-300 active:scale-90 ${
          open ? '' : 'wa-btn-bounce'
        }`}
        style={{
          width: 64,
          height: 64,
          border: 'none',
          background: open ? '#ffffff' : 'transparent',
          color: '#cf3e63',
          borderRadius: '50%',
          padding: 0,
          boxShadow: open
            ? '0 6px 24px rgba(207, 62, 99, 0.25), 0 0 0 2px rgba(224, 97, 122, 0.3)'
            : '0 10px 24px rgba(207, 62, 99, 0.30)',
        }}
      >
        {open ? (
          <FiX size={24} strokeWidth={2.4} />
        ) : (
          <img
            src={asset('chat-icon.png')}
            alt=""
            aria-hidden="true"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}
      </button>

      {/* Chat window */}
      <div
        ref={chatPanelRef}
        className={`fixed z-[90] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          bottom-0 right-0 left-0 sm:bottom-24 sm:right-6 sm:left-auto
          ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <div
          className="sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-[560px] sm:w-[380px] border border-gold/20"
          style={{ background: '#fffcfa' }}
        >
          {/* Main-cart heads-up banner */}
          {mainCartCount > 0 && (
            <div className="bg-berry/10 border-b border-berry/20 px-4 py-2.5 flex items-start gap-2 shrink-0">
              <FiAlertCircle size={14} className="text-berry shrink-0 mt-0.5" />
              <p className="text-[11px] text-chocolate leading-snug">
                You have <strong>{mainCartCount} item{mainCartCount > 1 ? 's' : ''}</strong> in your main cart.
                Finish that order from the cart icon — the chatbot uses a separate basket.
              </p>
            </div>
          )}

          {/* Header — matches website nav (white + soft blush + black wordmark) */}
          <div
            className="relative px-4 py-3.5 flex items-center gap-3 shrink-0 border-b border-rose-200/60"
            style={{ background: 'linear-gradient(135deg, #fff0eb 0%, #ffffff 60%, #fce4e9 100%)' }}
          >
            <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full" style={{ background: 'rgba(224, 97, 122, 0.10)', filter: 'blur(28px)' }} />

            <div className="relative shrink-0">
              <img
                src={asset('logo-icon.png')}
                alt="Cake & Crumb"
                className="w-11 h-11 rounded-full object-cover shadow"
                style={{ background: '#fff', border: '2px solid #f7d6d4' }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400" style={{ border: '2px solid #fff' }} />
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <h3
                className="text-[20px] tracking-wide truncate"
                style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1a1a', fontWeight: 600, letterSpacing: '0.02em' }}
              >
                CAKE
                <span style={{ color: '#1a1a1a', fontStyle: 'italic', fontWeight: 500, fontSize: '1.2em', margin: '0 0.06em', verticalAlign: '-0.04em' }}>&</span>
                CRUMB
              </h3>
              <p className="text-[9.5px] font-semibold tracking-[0.18em] uppercase truncate" style={{ color: '#cf3e63' }}>
                Gourmet Chocolate &amp; Berry
              </p>
            </div>
            {Object.keys(orderCart).length > 0 && (
              <div
                className="chat-pop text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg"
                style={{ background: 'linear-gradient(to bottom right, #e0617a, #cf3e63)', boxShadow: '0 4px 12px rgba(207, 62, 99, 0.35)' }}
              >
                <FiShoppingBag size={11} />
                ₹{getCartTotal()}
              </div>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="active:scale-90 transition-all sm:hidden"
              style={{ color: '#5b3e36' }}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-4 space-y-2.5 chat-bg-pattern"
            style={{ background: 'linear-gradient(to bottom, #fffcfa, #fff6f2, rgba(252, 228, 233, 0.3))' }}
          >
            {messages.map((msg, i) => {
              const isUser = msg.from === 'user'
              const prevSameSender = i > 0 && messages[i - 1].from === msg.from
              return (
                <div key={i} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full overflow-hidden self-end ${prevSameSender ? 'invisible' : ''}`}
                      style={{
                        background: '#fff',
                        border: '2px solid #f7d6d4',
                        boxShadow: '0 2px 6px rgba(207, 62, 99, 0.12)',
                        marginBottom: 2,
                      }}
                    >
                      <img src={asset('logo-icon.png')} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {msg.menu ? (
                    <PriceCard cat={msg.menu} />
                  ) : (
                    <div
                      className="max-w-[80%] overflow-hidden"
                      style={{
                        animation: 'chat-msg-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                        background: isUser ? 'linear-gradient(135deg, #e0617a, #cf3e63)' : '#fff',
                        color: isUser ? '#fff' : '#1a1a1a',
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        boxShadow: isUser
                          ? '0 4px 14px rgba(207, 62, 99, 0.22)'
                          : '0 2px 8px rgba(91, 62, 54, 0.06)',
                        border: isUser ? 'none' : '1px solid rgba(241, 217, 212, 0.7)',
                      }}
                    >
                      {msg.images && (
                        <div className="flex overflow-x-auto gap-2 p-2 scrollbar-hide">
                          {msg.images.map((image, j) => (
                            <div key={j} className="shrink-0 w-28 rounded-xl overflow-hidden relative" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                              <img src={asset(image.src)} alt={image.label} className="w-28 h-28 object-cover" loading="lazy" />
                              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.2), transparent)' }}>
                                <p className="text-[10px] text-white font-semibold truncate">{image.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        className="text-[13.5px] leading-relaxed whitespace-pre-line"
                        style={{ padding: '10px 14px', fontFamily: "'Inter', system-ui, sans-serif" }}
                      >
                        {formatBold(msg.text)}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {activeOrderCat && ORDER_ITEMS[activeOrderCat] && (
              <div className="flex justify-start">
                <OrderItemSelector
                  items={ORDER_ITEMS[activeOrderCat]}
                  cart={Object.fromEntries(Object.entries(orderCart).map(([k, v]) => [k, v.qty]))}
                  onUpdate={updateCartItem}
                  onDone={async () => {
                    setActiveOrderCat(null)
                    const total = getCartTotal()
                    if (total > 0) await addBotMessage(`*Cart updated!* 🛒\nTotal so far: *₹${total}*`)
                    await showOrderCategories()
                  }}
                />
              </div>
            )}

            {typing && (
              <div className="flex items-end gap-2 justify-start">
                <div
                  className="shrink-0 w-8 h-8 rounded-full overflow-hidden self-end"
                  style={{
                    background: '#fff',
                    border: '2px solid #f7d6d4',
                    boxShadow: '0 2px 6px rgba(207, 62, 99, 0.12)',
                    marginBottom: 2,
                  }}
                >
                  <img src={asset('logo-icon.png')} alt="" className="w-full h-full object-cover" />
                </div>
                <div
                  className="flex items-center gap-1.5 px-4 py-3"
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(241, 217, 212, 0.7)',
                    borderRadius: '18px 18px 18px 4px',
                    boxShadow: '0 2px 8px rgba(91, 62, 54, 0.06)',
                  }}
                >
                  <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#e0617a', animationDelay: '0ms' }} />
                  <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#e0617a', animationDelay: '180ms' }} />
                  <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#e0617a', animationDelay: '360ms' }} />
                </div>
              </div>
            )}

            {options.length > 0 && !typing && !activeOrderCat && (
              <div className="flex flex-col gap-1.5 pt-2 pl-10" style={{ animation: 'chat-msg-in 0.3s ease-out' }}>
                {options.map((opt, idx) => {
                  const isPrimary = idx < 2 // first two options get filled-pink emphasis
                  return (
                    <button
                      key={opt.action}
                      onClick={() => handleAction(opt.action, opt.label)}
                      className="group text-[13px] font-semibold px-4 py-2.5 active:scale-[0.98] transition-all flex items-center justify-between gap-3 self-start"
                      style={{
                        color: isPrimary ? '#fff' : '#1a1a1a',
                        background: isPrimary ? 'linear-gradient(135deg, #e0617a, #cf3e63)' : '#fff',
                        border: isPrimary ? '1px solid transparent' : '1.5px solid rgba(224, 97, 122, 0.35)',
                        borderRadius: 14,
                        boxShadow: isPrimary
                          ? '0 4px 14px rgba(207, 62, 99, 0.28)'
                          : '0 2px 8px rgba(91, 62, 54, 0.06)',
                        minWidth: 220,
                      }}
                      onMouseEnter={(e) => {
                        if (!isPrimary) {
                          e.currentTarget.style.background = '#fdeae8'
                          e.currentTarget.style.borderColor = '#e0617a'
                        } else {
                          e.currentTarget.style.boxShadow = '0 6px 18px rgba(207, 62, 99, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPrimary) {
                          e.currentTarget.style.background = '#fff'
                          e.currentTarget.style.borderColor = 'rgba(224, 97, 122, 0.35)'
                        } else {
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(207, 62, 99, 0.28)'
                        }
                      }}
                    >
                      <span>{opt.label}</span>
                      <FiChevronRight
                        size={14}
                        style={{ color: isPrimary ? 'rgba(255,255,255,0.85)' : '#cf3e63', flexShrink: 0 }}
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 pt-2.5 pb-1 bg-white flex items-center gap-2 shrink-0" style={{ borderTop: '1px solid rgba(224, 97, 122, 0.18)' }}>
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) handleTextInput(input) }}
                placeholder={orderStep ? 'Type here…' : 'Ask about our menu…'}
                className="w-full rounded-full pl-4 pr-3 py-2.5 text-sm outline-none transition-all"
                style={{ background: '#fff6f2', color: '#1a1a1a', border: '1px solid #f1d9d4' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#e0617a')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#f1d9d4')}
              />
            </div>
            <button
              onClick={() => { if (input.trim()) handleTextInput(input) }}
              disabled={!input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-90 transition-all"
              style={{
                background: 'linear-gradient(to bottom right, #e0617a, #cf3e63)',
                boxShadow: '0 4px 14px rgba(207, 62, 99, 0.35)',
              }}
            >
              <FiSend size={17} />
            </button>
          </div>
          <div className="bg-white px-3 pb-1.5 flex items-center justify-center gap-1 shrink-0">
            <FiHeart size={9} style={{ color: '#e0617a', fill: '#e0617a' }} />
            <span className="text-[9.5px] font-medium tracking-wider uppercase" style={{ color: '#7a584d' }}>
              Baked with love · Cake & Crumb
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
