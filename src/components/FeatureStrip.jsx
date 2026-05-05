import { FiAward, FiHeart, FiGift, FiTruck, FiShield, FiCoffee } from 'react-icons/fi'

const ICONS = {
  premium: FiAward,
  love: FiHeart,
  gift: FiGift,
  truck: FiTruck,
  shield: FiShield,
  coffee: FiCoffee,
}

export default function FeatureStrip({ items, columns = 3 }) {
  return (
    <div className="row g-4">
      {items.map((it, i) => {
        const Icon = ICONS[it.icon] || FiHeart
        return (
          <div key={i} className={`col-12 col-md-${12 / columns} text-center`}>
            <span className="feature-icon mb-3">
              <Icon size={22} />
            </span>
            <div className="tag-badge mb-2">{it.title}</div>
            <p style={{ fontSize: '0.9rem', maxWidth: 240, margin: '0 auto' }}>{it.text}</p>
          </div>
        )
      })}
    </div>
  )
}
