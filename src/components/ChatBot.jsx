import { useState, useRef, useEffect } from 'react'
import {
  FiX, FiSend, FiChevronRight, FiPlus, FiMinus,
  FiShoppingBag, FiHeart, FiAlertCircle, FiStar, FiCalendar, FiCheck,
} from 'react-icons/fi'
import { asset } from '../data/images.js'
import { generateOrderId } from '../services/orderId.js'
import { saveOrder } from '../services/orders.js'
import { deliveryFee, isBulkOrder, depositAmount, DEPOSIT_PCT } from '../data/shopConfig.js'
import { kmFromBakeryByPincode } from '../services/delivery.js'
import { WHATSAPP_PHONE } from './WhatsAppButton.jsx'
import { useCart } from '../context/CartContext.jsx'
import {
  MENU_DATA, ORDER_ITEMS, MENU_CATEGORIES, ORDER_CATEGORIES, getItemCat,
} from '../data/chatbotMenu.js'

const WHATSAPP_NUMBER = WHATSAPP_PHONE

// ─── Category preview thumbnails (optional eye-candy when showing prices) ───
// Keyed by the category keys in data/chatbotMenu.js. Purely decorative — a key
// with no entry just means no photo strip above that category's price card.
const CAT_IMAGES = {
  cheesecakes: [
    { src: 'products/cheesecake-strawberry-rose.jpeg',      label: 'Strawberry' },
    { src: 'products/cheesecake-blueberry-whole.jpeg',      label: 'Blueberry' },
    { src: 'products/cheesecake-pomegranate-berry.jpeg',    label: 'Raspberry' },
    { src: 'products/cheesecake-caramel.jpeg',              label: 'Biscoff' },
    { src: 'products/cheesecake-pistachio-slices-board.jpeg', label: 'Pistachio' },
    { src: 'products/cheesecake-nutella.jpeg',              label: 'Nutella' },
  ],
  'milk-cakes': [
    { src: 'products/milkcake-tres-leche-dish.jpeg',      label: 'Trés Léches' },
    { src: 'products/milkcake-rose-pistachio-domes.jpeg', label: 'Rose' },
    { src: 'products/milkcake-rose-pistachio.jpeg',       label: 'Pistachio' },
  ],
  'sponge-cakes': [
    { src: 'products/cake-yellow-rose-buttercream.jpeg',    label: 'Vanilla' },
    { src: 'products/cake-chocolate-caramel-birthday.jpeg', label: 'Chocolate' },
    { src: 'products/cake-red-velvet-hearts.jpeg',          label: 'Red Velvet' },
    { src: 'products/cake-blueberry-lavender-slice.jpeg',   label: 'Blueberry' },
  ],
  cupcakes: [
    { src: 'products/cupcakes-red-velvet.jpeg',    label: 'Red Velvet' },
    { src: 'products/cupcakes-funfetti-box.jpeg',  label: 'Vanilla' },
    { src: 'products/cupcakes-chocolate-box.jpeg', label: 'Chocolate' },
  ],
  cookies: [
    { src: 'products/cookies-double-chocolate.jpeg',   label: 'Triple Choc' },
    { src: 'products/cookies-chocolate-nut-board.jpeg', label: 'Classic' },
    { src: 'products/cookies-pistachio-rose.jpeg',     label: 'Pistachio Rose' },
    { src: 'products/cookies-choc-chunk-nut.jpeg',     label: 'Almond' },
  ],
  bakes: [
    { src: 'products/brownie-fudgy-slab.jpeg',      label: 'Brownies' },
    { src: 'products/brownie-chocolate-boxes.jpeg', label: 'Brownie Box' },
    { src: 'products/cake-pink-letter.jpeg',        label: 'Cakesicles' },
    { src: 'products/bakes-rose-petal-bars.jpeg',   label: 'Blondies' },
  ],
  'dessert-cups': [
    { src: 'products/dessertcup-chocolate-mango-duo.jpeg', label: 'Custard Cup' },
    { src: 'products/dessertcup-mango-custard.jpeg',       label: 'Mango Custard' },
    { src: 'products/dessertcup-assorted-flatlay.jpeg',    label: 'Trifle Cup' },
    { src: 'products/jellycups-rainbow-layered.jpeg',      label: 'Jelly Cup' },
  ],
  drinks: [
    { src: 'products/drink-virgin-mojito.jpeg',        label: 'Mojito' },
    { src: 'products/drink-blue-lagoon.jpeg',          label: 'Blue Lagoon' },
    { src: 'products/drink-strawberry-mojito.jpeg',    label: 'Milkshake' },
    { src: 'products/drink-blue-lagoon.jpeg',          label: 'Iced Coffee' },
    { src: 'products/drink-virgin-mojito.jpeg',        label: 'Hot Coffee' },
  ],
  platters: [
    { src: 'products/platter-pancake-strawberry.jpeg', label: 'Pancakes' },
    { src: 'products/bakes-rose-petal-bars.jpeg',      label: 'Crêpe Roll' },
  ],
}

const VISITED_KEY = 'cake-crumb-chatbot-visited'

function getInitialMessages() {
  let isReturning = false
  try { isReturning = localStorage.getItem(VISITED_KEY) === '1' } catch { /* storage blocked */ }
  try { localStorage.setItem(VISITED_KEY, '1') } catch { /* storage blocked */ }
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

// Above this many buttons, lay them out two-per-row instead of one long column.
// Tuned so the 9-category menu/order lists go grid but MAIN_OPTIONS (5, with longer
// labels like "⏰ Delivery Info") keeps its roomier single column.
const GRID_OPTIONS_THRESHOLD = 5

// Buttons that end a list rather than pick from it — full width in grid layout.
const NAV_ACTIONS = new Set(['home', 'review_order'])

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
    return <span className="text-[12px] font-bold text-berry shrink-0 tabular-nums">{item.p}</span>
  }

  // `cols` comes from the product's own size/slice labels (see data/chatbotMenu.js),
  // so a category with two price tiers always labels them correctly.
  const renderColumnHeaders = (cols) => {
    if (!cols) return null
    return (
      <div className="flex justify-end gap-2.5 px-3 pb-1 pt-0.5">
        <span className="w-11 text-right text-[9px] font-bold tracking-[0.14em] uppercase text-chocolate-light/55">{cols[0]}</span>
        <span className="w-12 text-right text-[9px] font-bold tracking-[0.14em] uppercase text-chocolate-light/55">{cols[1]}</span>
      </div>
    )
  }

  const renderGroup = ({ items, name: groupName, cols }, key) => {
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
        {renderColumnHeaders(cols)}
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
          <h4 className="text-[13px] font-bold text-chocolate" style={{ fontFamily: "'Lato', system-ui, sans-serif" }}>{cat.title}</h4>
        </div>
        <p className="text-[10px] text-chocolate-light/60 mt-0.5">{cat.subtitle}</p>
      </div>
      <div className="pb-2">
        {cat.groups.map((g, i) => renderGroup(g, i))}
      </div>
    </div>
  )
}

// ─── Order summary card (chat-styled version of the website checkout summary) ───
function OrderSummaryCard({ data }) {
  const { items, subtotal, delivery, total, bulk, deposit, info } = data
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl rounded-tl-sm shadow-md overflow-hidden border border-gold/15"
      style={{ background: '#fffbf8', animation: 'chat-msg-in 0.28s cubic-bezier(0.16,1,0.3,1)' }}
    >
      {/* Header */}
      <div
        className="px-3.5 py-2.5 flex items-center gap-2.5 border-b border-cream-dark/50"
        style={{ background: 'linear-gradient(135deg,#fff0eb 0%,#ffffff 60%,#fce4e9 100%)' }}
      >
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#e0617a,#cf3e63)', boxShadow: '0 4px 10px -3px rgba(207,62,99,0.5)' }}
        >
          <FiShoppingBag size={15} />
        </span>
        <div className="leading-tight">
          <div className="text-[14px] font-bold" style={{ fontFamily: "'Playfair Display',serif", color: '#5b3e36' }}>Order Summary</div>
          <div className="text-[9px] font-bold tracking-[0.14em] uppercase text-berry">{items.length} item{items.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Items */}
      <div className="px-2.5 py-2 flex flex-col gap-1.5">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2 rounded-xl border border-cream-dark/50 bg-white px-2.5 py-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold leading-tight" style={{ color: '#5b3e36' }}>{it.name}</p>
              <p className="text-[10.5px] mt-0.5">
                <span className="font-bold text-berry">×{it.qty}</span>{' '}
                <span className="text-chocolate-light/70">₹{it.price}</span>
              </p>
            </div>
            <span className="text-[12.5px] font-bold shrink-0" style={{ color: '#5b3e36' }}>₹{it.price * it.qty}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-3.5 pt-2 pb-1 mt-0.5 border-t border-dashed border-berry/30">
        <div className="flex justify-between text-[12px] mb-1">
          <span className="text-chocolate-light/70">Subtotal</span>
          <span className="font-semibold" style={{ color: '#5b3e36' }}>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-chocolate-light/70">Delivery</span>
          <span className={`font-bold ${delivery === 0 ? 'text-berry' : ''}`} style={delivery !== 0 ? { color: '#5b3e36' } : undefined}>
            {delivery === 0 ? 'FREE' : '₹' + delivery}
          </span>
        </div>
      </div>
      <div
        className="mx-3 my-2 flex items-center justify-between rounded-xl px-3 py-2"
        style={{ background: 'linear-gradient(135deg,rgba(224,97,122,0.12),rgba(247,227,223,0.55))', border: '1px solid #f3d7d9' }}
      >
        <span className="text-[13px] font-bold" style={{ fontFamily: "'Playfair Display',serif", color: '#5b3e36' }}>Total</span>
        <span className="text-[18px] font-extrabold" style={{ color: '#cf3e63' }}>₹{total}</span>
      </div>

      {bulk && (
        <div
          className="mx-3 mb-2 flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px]"
          style={{ background: '#fff', border: '1px dashed #d7a7ae', color: '#7a584d' }}
        >
          <span>Pay now · {Math.round(DEPOSIT_PCT * 100)}% advance</span>
          <strong style={{ color: '#cf3e63' }}>₹{deposit}</strong>
        </div>
      )}

      {/* Contact */}
      <div className="px-3.5 py-2 border-t border-cream-dark/50 text-[11px] leading-relaxed" style={{ color: '#7a584d' }}>
        <div className="truncate">👤 {info.name}{info.phone ? ` · 📞 ${info.phone}` : ''}</div>
        {info.address && <div className="truncate">📍 {info.address}{info.pincode ? `, ${info.pincode}` : ''}</div>}
        {info.date && <div>📅 {info.date}</div>}
      </div>
    </div>
  )
}

// ─── Cart preview card (pre-address review — items + subtotal, no delivery yet) ───
function CartPreviewCard({ items, subtotal }) {
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl rounded-tl-sm shadow-md overflow-hidden border border-gold/15"
      style={{ background: '#fffbf8', animation: 'chat-msg-in 0.28s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div
        className="px-3.5 py-2.5 flex items-center gap-2.5 border-b border-cream-dark/50"
        style={{ background: 'linear-gradient(135deg,#fff0eb 0%,#ffffff 60%,#fce4e9 100%)' }}
      >
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#e0617a,#cf3e63)', boxShadow: '0 4px 10px -3px rgba(207,62,99,0.5)' }}
        >
          <FiShoppingBag size={15} />
        </span>
        <div className="leading-tight">
          <div className="text-[14px] font-bold" style={{ fontFamily: "'Playfair Display',serif", color: '#5b3e36' }}>Your Order</div>
          <div className="text-[9px] font-bold tracking-[0.14em] uppercase text-berry">{items.length} item{items.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="px-2.5 py-2 flex flex-col gap-1.5">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2 rounded-xl border border-cream-dark/50 bg-white px-2.5 py-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold leading-tight" style={{ color: '#5b3e36' }}>{it.name}</p>
              <p className="text-[10.5px] mt-0.5">
                <span className="font-bold text-berry">×{it.qty}</span>{' '}
                <span className="text-chocolate-light/70">₹{it.price} each</span>
              </p>
            </div>
            <span className="text-[12.5px] font-bold shrink-0" style={{ color: '#5b3e36' }}>₹{it.price * it.qty}</span>
          </div>
        ))}
      </div>

      <div className="px-3.5 pt-2 pb-2.5 mt-0.5 border-t border-dashed border-berry/30">
        <div className="flex justify-between items-center">
          <span className="text-[13px] font-bold" style={{ fontFamily: "'Playfair Display',serif", color: '#5b3e36' }}>Subtotal</span>
          <span className="text-[16px] font-extrabold" style={{ color: '#cf3e63' }}>₹{subtotal}</span>
        </div>
        <p className="text-[10.5px] mt-1.5 text-chocolate-light/70">🚚 Delivery is added after you enter your address.</p>
      </div>
    </div>
  )
}

// ─── Delivery date picker (native date input + optional time slot) ───
function nextDayISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
function formatPickedDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
function DatePickerWidget({ onPick }) {
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const min = nextDayISO()
  const slots = ['Morning', 'Afternoon', 'Evening']
  return (
    <div
      className="w-full rounded-2xl rounded-tl-sm shadow-md overflow-hidden border border-gold/15 bg-white"
      style={{ animation: 'chat-msg-in 0.25s ease-out' }}
    >
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-gold/15 via-cream/80 to-soft-pink/40 border-b border-gold/10 flex items-center gap-2">
        <FiCalendar size={13} className="text-berry" />
        <p className="text-[11px] font-semibold text-chocolate tracking-wide">Pick your delivery date</p>
      </div>
      <div className="p-3 flex flex-col gap-2.5">
        <input
          type="date"
          min={min}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-cream-dark px-3 py-2 text-[13px] outline-none focus:border-berry"
          style={{ background: '#fffbf8', color: '#5b3e36' }}
        />
        <div className="flex gap-1.5">
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(s === slot ? '' : s)}
              className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold border transition-colors ${slot === s ? 'bg-berry text-white border-berry' : 'bg-white border-cream-dark text-chocolate'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!date}
          onClick={() => onPick(formatPickedDate(date) + (slot ? ` · ${slot}` : ''))}
          className="w-full h-9 rounded-xl text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: 'linear-gradient(to right,#e0617a,#cf3e63)' }}
        >
          <FiCheck size={14} /> Confirm Date
        </button>
      </div>
    </div>
  )
}

// ─── Order item selector ───
function OrderItemSelector({ items, cart, onUpdate, onDone, total = 0 }) {
  // Running count across the whole order (cart is the full name→qty map).
  const cartCount = Object.values(cart).reduce((sum, q) => sum + (q || 0), 0)
  return (
    <div
      className="bg-white rounded-2xl rounded-tl-sm shadow-md overflow-hidden w-full border border-gold/15"
      style={{ animation: 'chat-msg-in 0.25s ease-out' }}
    >
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-gold/15 via-cream/80 to-soft-pink/40 border-b border-gold/10 flex items-center gap-2">
        <FiStar size={12} className="text-gold" />
        <p className="text-[11px] font-semibold text-chocolate tracking-wide">Tap + to add to your order</p>
      </div>
      <div className="max-h-[46vh] overflow-y-auto divide-y divide-cream-dark/40">
        {items.map((item) => {
          // Two-price product → one row, name once, both tiers as compact
          // side-by-side add controls.
          if (item.variants) {
            return (
              <div key={item.name} className="px-3.5 py-2">
                <p className="text-[13.5px] font-semibold truncate leading-tight mb-1.5" style={{ color: '#5b3e36' }}>{item.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  {item.variants.map((v) => {
                    const q = cart[v.name] || 0
                    // Per-piece tiers can carry a minimum (cupcakes: 2). First
                    // tap lands on it; stepping below it clears the line, which
                    // matches the website cart exactly.
                    const min = Math.max(1, Number(v.min) || 1)
                    return (
                      <div
                        key={v.name}
                        className={`rounded-xl border p-1.5 flex flex-col gap-1.5 transition-colors ${q > 0 ? 'border-berry' : 'border-cream-dark/60'}`}
                        style={{ background: q > 0 ? '#fdeef1' : '#fffbf8' }}
                      >
                        <div className="flex items-baseline justify-between gap-1 px-0.5">
                          <span className="text-[13px] font-semibold truncate" style={{ color: '#5b3e36' }}>
                            {v.label}
                            {min > 1 && <span className="text-[10px] font-bold text-berry/70 ml-1">min {min}</span>}
                          </span>
                          <span className="text-[13px] font-bold text-berry shrink-0">₹{v.price}</span>
                        </div>
                        {q > 0 ? (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => onUpdate(v.name, v.price, q - 1 < min ? 0 : q - 1)}
                              aria-label={`Remove one ${v.label}`}
                              className="w-7 h-7 rounded-lg bg-white border border-berry/40 flex items-center justify-center text-berry active:scale-90 transition-transform"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="text-[14px] font-extrabold text-chocolate">{q}</span>
                            <button
                              onClick={() => onUpdate(v.name, v.price, q + 1)}
                              aria-label={`Add one ${v.label}`}
                              className="w-7 h-7 rounded-lg bg-berry flex items-center justify-center text-white active:scale-90 transition-transform"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onUpdate(v.name, v.price, min)}
                            className="w-full h-7 rounded-lg bg-berry/10 border border-berry/30 flex items-center justify-center text-berry active:scale-95 transition-transform"
                            aria-label={min > 1 ? `Add ${min} ${v.label}` : `Add ${v.label}`}
                          >
                            <FiPlus size={16} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }

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
                      aria-label={`Remove one ${item.name}`}
                      className="w-7 h-7 rounded-full bg-cream border border-chocolate/10 flex items-center justify-center text-chocolate active:scale-90 transition-transform"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-6 text-center text-[13px] font-bold text-chocolate">{qty}</span>
                  </>
                )}
                <button
                  onClick={() => onUpdate(item.name, item.price, qty + 1)}
                  aria-label={`Add ${item.name}`}
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
        className={`w-full py-3 text-white text-[12.5px] font-semibold tracking-wide flex items-center active:opacity-90 transition-opacity ${
          cartCount > 0 ? 'justify-between px-4' : 'justify-center gap-1.5'
        }`}
        style={{ background: 'linear-gradient(to right, #e0617a, #cf3e63)' }}
      >
        {cartCount > 0 ? (
          <>
            <span className="flex items-center gap-1.5">
              <FiShoppingBag size={14} />
              Done · {cartCount} item{cartCount > 1 ? 's' : ''}
            </span>
            <span className="text-[13.5px] font-bold">₹{total}</span>
          </>
        ) : (
          <>
            <FiShoppingBag size={13} />
            Done — Review or Add More
          </>
        )}
      </button>
    </div>
  )
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [options, setOptions] = useState([])
  const isGridOptions = options.length > GRID_OPTIONS_THRESHOLD
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [orderCart, setOrderCart] = useState({})
  const [activeOrderCat, setActiveOrderCat] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [orderStep, setOrderStep] = useState(null)
  const [lastOrderId, setLastOrderId] = useState(null)
  const [lastOrderTime, setLastOrderTime] = useState(null)
  const [lastWaUrl, setLastWaUrl] = useState(null) // fallback link if a pop-up is blocked
  const [orderInfo, setOrderInfo] = useState({ name: '', phone: '', address: '', pincode: '', date: '' })
  // Straight-line km from the bakery, geocoded from the pincode in the address —
  // drives the distance-based delivery fee so the bot matches the website checkout.
  const [deliveryKm, setDeliveryKm] = useState(null)
  const scrollRef = useRef(null)
  const chatPanelRef = useRef(null)
  const chatToggleRef = useRef(null)
  const inputRef = useRef(null)

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
    const subtotal = getCartTotal()
    // Distance-based delivery from the pincode in the address (geocoded at the date
    // step and stored in deliveryKm) — matches the website checkout so the same
    // address costs the same here. null (no pincode / lookup failed) → free.
    const fee = deliveryFee('delivery', deliveryKm)
    const total = subtotal + fee
    const orderId = generateOrderId(orderInfo.name)
    setLastOrderId(orderId)
    setLastOrderTime(Date.now())

    // Persist to Firestore (fire-and-forget, never blocks WhatsApp open).
    // deliveryKm is geocoded from the address pincode (same as website checkout);
    // stored so the admin dashboard shows "~N km away" for bot orders too.
    saveOrder({
      orderId,
      items: items.map(([name, { qty, price }]) => ({ name, qty, price, id: name.toLowerCase().replace(/\s+/g, '-') })),
      totals: { subtotal, delivery: fee, total },
      customer: {
        name: orderInfo.name,
        phone: orderInfo.phone,
        address: orderInfo.address,
        pincode: orderInfo.pincode,
      },
      payment: { method: 'cod' },
      deliveryMethod: 'delivery',
      deliveryKm,
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

    // Large orders: the bot can't take a UPI payment inline, so it flags that the
    // bakery will request a 50% advance on WhatsApp before baking (keeps big COD
    // orders from being a no-show fraud risk — mirrors the checkout deposit rule).
    const bulk = isBulkOrder(subtotal)
    const advanceLine = bulk
      ? `*💳 Advance:* ₹${depositAmount(total)} (${Math.round(DEPOSIT_PCT * 100)}%) requested before baking · balance on delivery\n`
      : ''

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
      `*Subtotal:* ₹${subtotal}\n` +
      `*Delivery:* ${fee === 0 ? 'FREE (far areas confirmed by us)' : '₹' + fee}\n` +
      `*💰 Total: ₹${total}*\n` +
      advanceLine +
      `\n━━━━━━━━━━━━━━━━━━━━\n\n` +
      `⚠️ *Cancel window:* 30 min from order time.\n\n` +
      `Please confirm my order. Thank you! 🙏`

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
    const win = window.open(waUrl, '_blank', 'noopener,noreferrer')
    // Report back so the caller can offer a manual link if the pop-up was blocked.
    return { url: waUrl, opened: !!win }
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

    // Categories are data-driven (data/chatbotMenu.js) — don't enumerate them here.
    if (action.startsWith('cat_')) {
      await showCategoryPrices(action.replace('cat_', ''))
      return
    }

    switch (action) {
      case 'home':
        setOrderCart({})
        setOrderStep(null)
        setOrderInfo({ name: '', phone: '', address: '', pincode: '', date: '' })
        setDeliveryKm(null)
        setShowDatePicker(false)
        await showMainMenu()
        break
      case 'menu':
        await showCategoryMenu()
        break
      case 'order':
        setOptions([])
        await addBotMessage("Let's build your order! 🛒\n\nSelect a category, add items with quantities, then review & checkout.")
        await showOrderCategories()
        break
      case 'review_order': {
        setOptions([])
        const cartItems = Object.entries(orderCart).filter(([, v]) => v.qty > 0)
        if (cartItems.length === 0) {
          await addBotMessage('Your cart is empty! Please add some items first. 🛒')
          await showOrderCategories()
          return
        }
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            cartPreview: {
              items: cartItems.map(([name, { qty, price }]) => ({ name, qty, price })),
              subtotal: getCartTotal(),
            },
          },
        ])
        scrollToBottom()
        await addBotMessage("Looks good? Let's add your delivery details, or go back for more treats. 🎂")
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
      case 'confirm_send': {
        setOptions([])
        const { url, opened } = sendOrderToWhatsApp()
        setLastWaUrl(url)
        if (opened) {
          await addBotMessage('✅ *Order sent to WhatsApp!*\n\nOur team will confirm your order within minutes.\n\n⚠️ *Cancellation:* You can cancel within 30 minutes. After that, cancellation is not available.')
        } else {
          await addBotMessage('✅ *Your order is ready!*\n\nYour browser blocked the WhatsApp pop-up — tap *Open WhatsApp to Send* below to deliver it to us. 👇')
        }
        setOrderCart({})
        setOrderStep(null)
        setOptions([
          ...(opened ? [] : [{ label: '💬 Open WhatsApp to Send', action: 'open_wa_fallback' }]),
          { label: '🚫 Cancel My Order', action: 'user_cancel' },
          { label: '🏠 Main Menu', action: 'home' },
        ])
        break
      }
      case 'open_wa_fallback':
        if (lastWaUrl) window.open(lastWaUrl, '_blank', 'noopener,noreferrer')
        break
      case 'user_cancel': {
        setOptions([])
        if (lastOrderTime && Date.now() - lastOrderTime > 30 * 60 * 1000) {
          await addBotMessage('⏰ Sorry! The 30-minute cancellation window has expired. This order can no longer be cancelled.\n\nFor help, contact: +91 91731 83440')
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
        await addBotMessage('*Delivery Information*\n\n📍 *Area:* All Gujarat districts\n⏰ *Notice:* Please order 24 hours in advance\n🚗 *Delivery:* Home delivery or free self-pickup — the charge (if any) is confirmed by Cake & Crumb on WhatsApp\n📦 *Packaging:* Included in price')
        setOptions([{ label: '🛒 Place Order', action: 'order' }, { label: '🏠 Main Menu', action: 'home' }])
        break
      case 'location':
        setOptions([])
        await addBotMessage('*Our Location*\n\n📍 Vaso, Kheda, Gujarat 387380\n🏠 Home bakery — we deliver across Gujarat!')
        setOptions([{ label: '🛒 Place Order', action: 'order' }, { label: '🏠 Main Menu', action: 'home' }])
        break
      case 'contact':
        setOptions([])
        await addBotMessage('*Contact Us*\n\n📱 *WhatsApp:* +91 91731 83440\n📞 *Call:* +91 91731 83440\n📷 *Instagram:* @cake_and_crumb_1')
        setOptions([{ label: '💬 Open WhatsApp', action: 'whatsapp' }, { label: '🏠 Main Menu', action: 'home' }])
        break
      default:
        break
    }
  }

  // Finalize the order once a delivery date is chosen (from the picker or typed):
  // render the styled summary card, show the bulk-advance note, then ask to send.
  const submitDate = async (dateStr) => {
    setOrderInfo((prev) => ({ ...prev, date: dateStr }))
    setOrderStep(null)
    setShowDatePicker(false)
    const subtotal = getCartTotal()
    // deliveryKm was geocoded from the pincode step (same rule as the website).
    const fee = deliveryFee('delivery', deliveryKm)
    const total = subtotal + fee
    const summaryItems = Object.entries(orderCart)
      .filter(([, v]) => v.qty > 0)
      .map(([name, { qty, price }]) => ({ name, qty, price }))
    setMessages((prev) => [
      ...prev,
      {
        from: 'bot',
        summary: {
          items: summaryItems,
          subtotal,
          delivery: fee,
          total,
          bulk: isBulkOrder(subtotal),
          deposit: depositAmount(total),
          info: {
            name: orderInfo.name,
            phone: orderInfo.phone,
            address: orderInfo.address,
            pincode: orderInfo.pincode,
            date: dateStr,
          },
        },
      },
    ])
    scrollToBottom()
    // Large-order advance notice — mirrors the website's bulk banner.
    if (isBulkOrder(subtotal)) {
      await addBotMessage(`💳 *This is a larger order.* We'll request a *${Math.round(DEPOSIT_PCT * 100)}% advance* (₹${depositAmount(total)}) on WhatsApp before baking — the balance is paid on delivery.`)
    }
    await addBotMessage('Ready to send this order to our bakery on WhatsApp? 🎂')
    setOptions([
      { label: '✅ Send Order via WhatsApp', action: 'confirm_send' },
      { label: '✏️ Edit Details', action: 'collect_info' },
      { label: '🏠 Cancel', action: 'home' },
    ])
  }

  const handleTextInput = async (text) => {
    const lower = text.toLowerCase().trim()
    addUserMessage(text)
    setInput('')

    if (orderStep === 'name') {
      if (text.trim().length < 2) {
        await addBotMessage('Please enter your name so we know who the order is for 🙂')
        return
      }
      setOrderInfo((prev) => ({ ...prev, name: text.trim() }))
      setOrderStep('phone')
      await addBotMessage(`Thanks *${text.trim()}*! Now enter your *phone number*:`)
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
      await addBotMessage('Enter your *full delivery address*\n(House/Flat, Street, Area, City):')
      return
    }
    if (orderStep === 'address') {
      if (text.trim().length < 6) {
        await addBotMessage('Please enter your *full address* (house/flat, street, area, city) so we can deliver correctly 📍')
        return
      }
      setOrderInfo((prev) => ({ ...prev, address: text.trim() }))
      setOrderStep('pincode')
      await addBotMessage('Enter your *6-digit pincode* 📮\n(so we can calculate delivery to your area):')
      return
    }
    if (orderStep === 'pincode') {
      const pin = text.replace(/\D/g, '')
      if (!/^\d{6}$/.test(pin)) {
        await addBotMessage('Please enter a valid *6-digit pincode* (numbers only):')
        return
      }
      setOrderInfo((prev) => ({ ...prev, pincode: pin }))
      // Brief feedback so the geocode round-trip doesn't feel like a freeze.
      await addBotMessage('Got it! Calculating delivery to your area… ⏳')
      // Geocode now (same as website checkout) so the delivery fee is ready for the
      // summary. null (lookup failed) → free, bakery confirms far areas.
      const km = await kmFromBakeryByPincode(pin)
      setDeliveryKm(km)
      setOrderStep('date')
      setShowDatePicker(true)
      await addBotMessage('Almost done! 📅 Pick your preferred *delivery date* below:')
      return
    }
    if (orderStep === 'date') {
      // Typing a date still works, but the date-picker widget is the primary path.
      await submitDate(text)
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
      await showCategoryPrices('cheesecakes')
    } else if (lower.includes('cupcake')) {
      await showCategoryPrices('cupcakes')
    } else if (['cookie', 'biscuit'].some((w) => lower.includes(w))) {
      await showCategoryPrices('cookies')
    } else if (['brownie', 'blondie', 'cakesicle', 'bake'].some((w) => lower.includes(w))) {
      await showCategoryPrices('bakes')
    } else if (['drink', 'mojito', 'shake', 'coffee', 'mocktail'].some((w) => lower.includes(w))) {
      await showCategoryPrices('drinks')
    } else if (['dessert', 'custard', 'cup'].some((w) => lower.includes(w))) {
      await showCategoryPrices('dessert-cups')
    } else if (['cake', 'sponge', 'milk'].some((w) => lower.includes(w))) {
      // "cake" is ambiguous (milk cake vs sponge cake) — let the customer pick.
      await showCategoryMenu()
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

  // Close the chat on Escape for keyboard users
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Move focus into the chat input when it opens (desktop only — on mobile this
  // would pop the keyboard over the greeting). Waits for the open animation.
  useEffect(() => {
    if (open && typeof window !== 'undefined' && window.innerWidth >= 640) {
      const t = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
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
          role="dialog"
          aria-modal="false"
          aria-label="Cake & Crumb chat assistant"
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

            <img
              src={asset('logo_final.webp')}
              alt="Cake & Crumb"
              className="shrink-0"
              style={{ height: 42, width: 'auto', display: 'block' }}
            />
            <div className="flex-1 min-w-0 leading-tight">
              <h3
                className="truncate"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif", color: '#1a1a1a', fontWeight: 700, letterSpacing: '0.03em', fontSize: 17 }}
              >
                CAKE
                <span style={{ fontStyle: 'italic', fontWeight: 500, fontSize: '1.28em', margin: '0 0.05em', verticalAlign: '-0.05em' }}>&</span>
                CRUMB
              </h3>
              <p
                className="truncate"
                style={{ fontFamily: "'Allura', cursive", color: '#1a1a1a', fontSize: 12.5, marginTop: 1, lineHeight: 1.1 }}
              >
                The gourmet chocolate and berry boutique!
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
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
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
                      <img src={asset('logo_final.webp')} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {msg.cartPreview ? (
                    <CartPreviewCard items={msg.cartPreview.items} subtotal={msg.cartPreview.subtotal} />
                  ) : msg.summary ? (
                    <OrderSummaryCard data={msg.summary} />
                  ) : msg.menu ? (
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
                        style={{ padding: '10px 14px', fontFamily: "'Lato', system-ui, sans-serif" }}
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
                  total={getCartTotal()}
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

            {showDatePicker && (
              <div className="flex justify-start">
                <DatePickerWidget onPick={(d) => submitDate(d)} />
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
              <div
                // Long category lists (9 categories + nav) would scroll for ages in a
                // single column, so pack them two-up and drop the conversational indent.
                className={isGridOptions
                  ? 'grid grid-cols-2 gap-1.5 pt-2 pl-2 pr-1'
                  : 'flex flex-col gap-1.5 pt-2 pl-10'}
                style={{ animation: 'chat-msg-in 0.3s ease-out' }}
              >
                {options.map((opt, idx) => {
                  const isPrimary = idx < 2 // first two options get filled-pink emphasis
                  // Nav actions read as a footer, not a category — give them the full row.
                  const isFullWidth = isGridOptions && NAV_ACTIONS.has(opt.action)
                  return (
                    <button
                      key={opt.action}
                      onClick={() => handleAction(opt.action, opt.label)}
                      className={`group font-semibold active:scale-[0.98] transition-all flex items-center justify-between self-start ${
                        isGridOptions
                          ? `text-[11.5px] px-2.5 py-2 gap-1 w-full ${isFullWidth ? 'col-span-2' : ''}`
                          : 'text-[13px] px-4 py-2.5 gap-3'
                      }`}
                      style={{
                        color: isPrimary ? '#fff' : '#1a1a1a',
                        background: isPrimary ? 'linear-gradient(135deg, #e0617a, #cf3e63)' : '#fff',
                        border: isPrimary ? '1px solid transparent' : '1.5px solid rgba(224, 97, 122, 0.35)',
                        borderRadius: 14,
                        boxShadow: isPrimary
                          ? '0 4px 14px rgba(207, 62, 99, 0.28)'
                          : '0 2px 8px rgba(91, 62, 54, 0.06)',
                        minWidth: isGridOptions ? 0 : 220,
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
                      <span className={isGridOptions ? 'truncate min-w-0' : undefined}>{opt.label}</span>
                      <FiChevronRight
                        size={isGridOptions ? 12 : 14}
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
                ref={inputRef}
                type="text"
                value={input}
                maxLength={200}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) handleTextInput(input) }}
                placeholder={orderStep ? 'Type here…' : 'Ask about our menu…'}
                aria-label="Type your message"
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
