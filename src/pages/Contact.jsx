import { FiMail, FiMapPin, FiPhone, FiClock, FiSend, FiInstagram } from 'react-icons/fi'
import PageHero from '../components/PageHero.jsx'
import { img, u } from '../data/images.js'

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title={<>Let's Make Something<br />Sweet Together</>}
        text="Have a question, custom order, or just want to say hello? We'd love to hear from you."
        cta={null}
        image={u(img.cupcakesPink, 1000, 750)}
        imageAlt="Cupcakes"
      />

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-5">
              <h3 style={{ fontSize: '1.6rem' }}>Visit our boutique</h3>
              <p>Drop in for a sweet treat or stop by to chat about your custom order.</p>

              {[
                { icon: <FiPhone />, title: 'Call / WhatsApp', text: '+91 90816 68490\n+91 91731 83440' },
                { icon: <FiInstagram />, title: 'Instagram', text: '@cake_and_crumb_1' },
                { icon: <FiClock />, title: 'Pre-order', text: 'Please order at least\n1 day in advance' },
                { icon: <FiMapPin />, title: 'Delivery', text: 'Home delivery (charges apply)\nor self-pickup from our doorstep' },
              ].map((it, i) => (
                <div key={i} className="d-flex mb-3" style={{ gap: '0.8rem' }}>
                  <span className="feature-icon" style={{ width: 44, height: 44, flexShrink: 0 }}>
                    {it.icon}
                  </span>
                  <div>
                    <div className="tag-badge mb-1">{it.title}</div>
                    <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line', margin: 0 }}>{it.text}</p>
                  </div>
                </div>
              ))}

              <div className="d-flex mt-4" style={{ gap: '0.5rem' }}>
                <a href="#" className="icon-circle"><FiInstagram size={16} /></a>
                <a href="#" className="icon-circle"><FiMail size={16} /></a>
              </div>
            </div>

            <div className="col-lg-7">
              <form
                className="p-4 p-md-5"
                style={{ background: '#fff', border: '1px solid var(--cc-border)', borderRadius: 16 }}
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Thanks! We will get back to you soon.')
                }}
              >
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.2rem' }}>Send us a message</h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input className="cc-input" placeholder="Your Name" required />
                  </div>
                  <div className="col-md-6">
                    <input className="cc-input" placeholder="Your Email" type="email" required />
                  </div>
                  <div className="col-md-6">
                    <input className="cc-input" placeholder="Phone (optional)" />
                  </div>
                  <div className="col-md-6">
                    <select className="cc-input">
                      <option>Select a subject</option>
                      <option>Custom Order</option>
                      <option>Wedding Inquiry</option>
                      <option>General Question</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <textarea className="cc-input" rows={6} placeholder="Tell us about your sweet idea..." required />
                  </div>
                  <div className="col-12">
                    <button className="btn-rose" type="submit">
                      <FiSend /> Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
