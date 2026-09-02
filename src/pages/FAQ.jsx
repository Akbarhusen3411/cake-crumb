import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiChevronDown, FiHelpCircle, FiTruck, FiHeart, FiClock,
  FiAlertCircle, FiCreditCard, FiPackage,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import PageHero from '../components/PageHero.jsx'
import { img, u } from '../data/images.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useJsonLd } from '../hooks/useJsonLd.js'
import { buildWhatsAppLink } from '../components/WhatsAppButton.jsx'
import { BULK_ORDER_MIN, DEPOSIT_PCT } from '../data/shopConfig.js'
import { inr } from '../data/format.js'

// Read from shopConfig, never typed: these two figures are what Checkout
// actually enforces, and /refund-policy quotes them the same way. An FAQ that
// says one thing while the pay button does another is the drift the `more`
// links below exist to prevent.
const DEPOSIT_PCT_LABEL = Math.round(DEPOSIT_PCT * 100)

const SECTIONS = [
  {
    id: 'allergens',
    Icon: FiAlertCircle,
    title: 'Allergens & Dietary',
    questions: [
      {
        q: 'Are eggless options available?',
        a: 'Yes — most cheesecakes, milk cakes, cupcakes, and bakes can be made eggless on request. Mention "eggless" when you place the order. There may be a small upcharge depending on the item.',
      },
      {
        q: 'Which products contain nuts?',
        a: 'Pistachio, Almond, Nutella, Coconut, Hazelnut, and Dubai-style products contain nuts. We bake everything in the same kitchen, so even nut-free items may carry trace amounts. Customers with severe allergies should let us know in advance.',
      },
      {
        q: 'Do you offer gluten-free options?',
        a: 'Most of our baked goods contain gluten (wheat flour). We can attempt gluten-free versions for custom orders — please discuss on WhatsApp before ordering.',
      },
      {
        q: 'Are your products vegan?',
        a: 'Most are not — they typically contain dairy and/or eggs. Jelly cups and Grass cups are vegan-friendly. We can craft vegan-friendly custom orders on request.',
      },
    ],
  },
  {
    id: 'delivery',
    Icon: FiTruck,
    title: 'Delivery & Pickup',
    questions: [
      {
        q: 'What areas do you deliver to?',
        a: 'We deliver across Vaso, Kheda, and surrounding Gujarat districts. Delivery charges depend on distance — we confirm the exact rate on WhatsApp once you share your address.',
      },
      {
        q: 'Is there a delivery fee?',
        // The last sentence used to read "Your checkout total shows the item
        // subtotal only." That stopped being true when checkout started pricing
        // delivery from the pincode — the fee is added to the total there, and
        // it is only the CART page that still shows the subtotal alone.
        a: 'The delivery charge depends on your area. Enter your pincode at checkout and it is added to your total; until then the cart shows the items only. Self-pickup is always free, and we confirm the final charge on WhatsApp.',
      },
      {
        q: 'Can I pick up the order myself?',
        a: 'Yes. Self-pickup is free from our home boutique in Vaso, Kheda. We will share the exact location and pickup time on WhatsApp.',
      },
      {
        // WAS: "Same-day for ready items if ordered before 11 AM." That promised
        // stock on a shelf and a fixed cutoff, and contradicted the other five
        // places that say everything is baked to order — the About page even
        // says "nothing sits on a shelf". It also reintroduced a fixed time on a
        // site where the hours were removed precisely because they aren't fixed.
        q: 'How soon can I get my order?',
        a: 'Everything is baked to order, so please allow at least a day. Order late in the day and it will be ready the next day. You choose your date at checkout and we confirm it on WhatsApp.',
      },
    ],
  },
  {
    id: 'customization',
    Icon: FiHeart,
    title: 'Custom Orders & Designs',
    questions: [
      {
        q: 'Can I get a custom-designed cake?',
        a: 'Absolutely! Send us inspiration photos on WhatsApp with your occasion, theme, servings, and date. We usually send a quote within a few hours.',
      },
      {
        q: 'How far in advance should I place a custom order?',
        a: 'For simple custom cakes — 2 days minimum. For elaborate designs (multi-tier, photo-print, custom toppers) — 4–7 days. Festival peak times need extra lead time.',
      },
      {
        q: 'Can I write a message on the cake?',
        a: 'Yes — just include the exact message when ordering. Ideal length: under 30 characters.',
      },
      {
        q: 'Can you replicate a cake from a photo?',
        a: 'We can usually create something inspired by your reference, but exact replicas are not guaranteed. We will share what is possible with your budget on WhatsApp.',
      },
      {
        q: 'Do you do corporate / bulk orders?',
        // WAS: "Discounts apply on bulk." There is no discount system on this
        // site, by decision — and what a large order actually meets at checkout
        // is the opposite of a discount: COD is withdrawn and an advance is
        // required. Promising money off and then asking for money up front is
        // the worst possible order to learn those two facts in.
        a: `Yes — for offices, weddings, and large events. Contact us at least a week in advance so we can plan the bake. Orders at or above ${inr(BULK_ORDER_MIN)} take a ${DEPOSIT_PCT_LABEL}% advance to reserve the date; the balance is paid on delivery or pickup.`,
      },
    ],
  },
  {
    id: 'payment',
    Icon: FiCreditCard,
    title: 'Payment',
    more: { to: '/refund-policy', label: 'Refund terms in full' },
    questions: [
      {
        q: 'What payment methods do you accept?',
        // Bank transfer was listed here and is not one of the three options
        // checkout offers (UPI in full / advance / COD), so it promised a
        // method the order form has no way to record.
        a: 'UPI (GPay, PhonePe, Paytm, BHIM), Cash on Delivery, and cash on self-pickup. UPI is preferred — it is fastest.',
      },
      {
        q: 'Do I pay in advance or on delivery?',
        // "when our delivery partner arrives" was shown to self-pickup
        // customers too, who collect the order themselves.
        a: 'For Cash on Delivery: pay when your order is handed over — at your door, or when you collect it. For UPI: pay during checkout, and we confirm on WhatsApp once we have matched the payment in our account.',
      },
      {
        // The most surprising thing a customer meets at checkout, and this
        // section did not mention it at all.
        q: 'Do larger orders need an advance?',
        a: `Yes. Orders at or above ${inr(BULK_ORDER_MIN)} take a ${DEPOSIT_PCT_LABEL}% advance by UPI to reserve your date, or you can pay in full — the balance is settled on delivery or pickup. Full cash-on-delivery is not available on orders that size.`,
      },
      {
        q: 'Can I get a refund?',
        a: 'Refunds are available only for cancelled orders within the 30-minute cancellation window, or if there is a quality issue confirmed by us upon receipt.',
      },
    ],
  },
  {
    id: 'cancellation',
    Icon: FiClock,
    title: 'Cancellation',
    more: { to: '/refund-policy', label: 'Read the full cancellation & refund policy' },
    questions: [
      {
        q: 'Can I cancel my order?',
        a: 'Cancellations are accepted within 30 minutes of placing the order. After that, baking has typically started and we cannot cancel.',
      },
      {
        q: 'How do I cancel?',
        a: 'Send us a WhatsApp message with your Order ID as soon as possible. We will confirm the cancellation when received.',
      },
      {
        q: 'What if you need to cancel my order?',
        a: 'In rare cases (ingredient shortage, equipment issue), we may need to cancel. We will notify you immediately on WhatsApp and refund 100% within 24 hours.',
      },
    ],
  },
  {
    id: 'storage',
    Icon: FiPackage,
    title: 'Storage & Freshness',
    questions: [
      {
        q: 'How should I store the cake?',
        a: 'Refrigerate cheesecakes and milk cakes immediately. Take them out 15–20 minutes before serving. Cookies and brownies stay fresh in an airtight container at room temperature for 3–4 days.',
      },
      {
        q: 'How long will it stay fresh?',
        a: 'Cheesecakes: 3 days refrigerated. Milk cakes: 2 days refrigerated. Cookies: 4–5 days at room temperature. Drinks/mojitos: consume same day.',
      },
      {
        q: 'Can I freeze it?',
        a: 'Cheesecakes can be frozen up to 30 days. Milk cakes can be frozen up to 14 days. Thaw in the refrigerator overnight before serving.',
      },
    ],
  },
]

function AccordionSection({ section, expanded, onToggle }) {
  const Icon = section.Icon
  return (
    <div
      className="mb-3"
      style={{
        background: '#fff',
        border: '1px solid var(--cc-border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-100 d-flex align-items-center px-3 px-md-4 py-3 border-0 bg-transparent text-start"
        style={{ gap: '0.8rem' }}
        aria-expanded={expanded}
      >
        <span
          className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--cc-blush)', color: 'var(--cc-rose)',
          }}
        >
          <Icon size={18} />
        </span>
        <h3
          style={{
            flex: 1,
            margin: 0,
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--cc-cocoa)',
            fontWeight: 700,
          }}
        >
          {section.title}
        </h3>
        <FiChevronDown
          size={20}
          style={{
            color: 'var(--cc-rose)',
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'none',
            flexShrink: 0,
          }}
        />
      </button>

      {expanded && (
        <div className="px-3 px-md-4 pb-3" style={{ animation: 'qv-up 0.2s ease-out' }}>
          <div style={{ borderTop: '1px solid var(--cc-border)', paddingTop: '0.8rem' }}>
            {section.questions.map((qa, i) => (
              <details
                key={i}
                className="faq-question"
                style={{
                  borderBottom: i < section.questions.length - 1 ? '1px dashed var(--cc-border)' : 'none',
                }}
              >
                <summary>
                  {qa.q}
                  <FiChevronDown size={16} className="faq-question__arrow" />
                </summary>
                <p style={{ fontSize: '0.92rem', margin: '0.5rem 0 1rem', color: 'var(--cc-text)' }}>
                  {qa.a}
                </p>
              </details>
            ))}
            {/* Payment and Cancellation restate the same terms as
                /refund-policy. Whichever a customer lands on should point at
                the other, or the two quietly drift apart. */}
            {section.more && (
              <Link to={section.more.to} className="faq-section__more">
                {section.more.label} <FiChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  usePageMeta({
    title: 'FAQ',
    description: 'Frequently asked questions about Cake & Crumb — allergens, delivery, customization, payment, cancellation, and storage.',
  })

  useJsonLd('faq-page', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SECTIONS.flatMap((s) => s.questions).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  })

  const [expanded, setExpanded] = useState('allergens')

  return (
    <>
      <PageHero
        eyebrow="Help & FAQ"
        title={<>Got Questions?<br />We've Got Answers</>}
        text="Everything you need to know about ordering, allergens, delivery, customization, and storage. Still stuck? WhatsApp us anytime."
        cta={null}
        image={u(img.cheesecakeQuartet, 1000, 750)}
        imageAlt="Assorted cheesecakes"
      />

      <section className="py-4 py-md-5" style={{ background: 'var(--cc-cream)' }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <div className="text-center mb-4 mb-md-5">
            <span className="eyebrow"><FiHelpCircle /> Help Centre</span>
            <h2 className="section-title mt-3">Frequently Asked</h2>
            <div className="heart-divider"><span aria-hidden>♥</span></div>
          </div>

          {SECTIONS.map((s) => (
            <AccordionSection
              key={s.id}
              section={s}
              expanded={expanded === s.id}
              onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
            />
          ))}

          {/* Still need help banner */}
          <div
            className="mt-5 p-4 p-md-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between"
            style={{
              background: 'linear-gradient(135deg, #fff0eb 0%, #fce4e9 100%)',
              borderRadius: 16,
              gap: '1.2rem',
              border: '1px solid rgba(224, 97, 122, 0.2)',
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--cc-cocoa)', fontWeight: 700 }}>
                Still have questions?
              </h4>
              <p className="mb-0 mt-1" style={{ fontSize: '0.9rem', color: 'var(--cc-cocoa-soft)' }}>
                We usually reply within a few hours on WhatsApp.
              </p>
            </div>
            <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-rose"
                style={{ background: '#25D366' }}
              >
                <FaWhatsapp size={16} /> WhatsApp Us
              </a>
              <Link to="/contact" className="btn-outline-rose">
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
