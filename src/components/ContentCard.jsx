import { BRANDS, PLATFORMS, STATUSES } from '../data/constants'

export default function ContentCard({ card, onClick }) {
  const brand = BRANDS.find(b => b.id === card.brand)
  const platform = PLATFORMS.find(p => p.id === card.platform)
  const status = STATUSES.find(s => s.id === card.status)

  return (
    <div
      onClick={onClick}
      className="rounded-xl bg-white cursor-pointer card-shadow hover:card-shadow-hover transition-all hover:-translate-y-0.5 overflow-hidden"
      style={{ borderLeft: `4px solid ${brand?.color || '#ccc'}` }}
    >
      {card.image && (
        <div className="h-24 overflow-hidden">
          <img src={card.image} alt="Creative" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <span className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 flex-1">
            {card.title || card.productName || 'Untitled'}
          </span>
          <span className="text-base shrink-0">{platform?.icon || '📌'}</span>
        </div>

        {card.copy && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{card.copy}</p>
        )}

        <div className="flex items-center justify-between flex-wrap gap-1">
          {brand && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: brand.color }}>
              {brand.name}
            </span>
          )}
          {status && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
              {statusIcon(status.id)} {status.name}
            </span>
          )}
        </div>

        {card.time && (
          <div className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
            🕐 {card.time}
          </div>
        )}
      </div>
    </div>
  )
}

function statusIcon(id) {
  return { draft: '✏️', ready: '🚀', scheduled: '🕐', published: '✅' }[id] || ''
}
