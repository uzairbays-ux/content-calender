import { PLATFORMS, STATUSES } from '../data/constants'
import { CHECKLIST } from './checklist.js'

export default function ContentCard({ card, onClick }) {
  const brand = { color: card._brandColor }
  const platform = PLATFORMS.find(p => p.id === card.platform)
  const status = STATUSES.find(s => s.id === card.status)

  const done = CHECKLIST.filter(c => c.check(card)).length
  const total = CHECKLIST.length
  const pct = Math.round((done / total) * 100)
  const isComplete = done === total

  return (
    <div
      onClick={onClick}
      className="rounded-xl bg-white cursor-pointer card-shadow hover:card-shadow-hover transition-all hover:-translate-y-0.5 overflow-hidden text-left w-full"
      style={{ borderLeft: `3px solid ${card._brandColor || '#ccc'}` }}
    >
      {/* Thumbnail */}
      {card.image_data && (
        <div className="h-16 overflow-hidden bg-gray-100">
          <img src={card.image_data} alt="Creative" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 flex-1">
            {card.title || card.product_name || card.collection || 'Untitled'}
          </span>
          <span className="text-sm shrink-0">{platform?.icon || '📌'}</span>
        </div>

        {/* Progress + status row */}
        <div className="flex items-center justify-between gap-1 mt-1.5">
          {/* Progress bar + tick */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isComplete ? (
              <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white text-xs">✓</span>
                <span>Full</span>
              </span>
            ) : (
              <>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 70 ? '#f97316' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 shrink-0">{pct}%</span>
              </>
            )}
          </div>

          {/* Status pill */}
          {status && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
              style={{ backgroundColor: status.bg, color: status.color }}>
              {statusIcon(status.id)}
            </span>
          )}
        </div>

        {/* Time */}
        {card.time && (
          <p className="text-xs text-gray-400 mt-1">🕐 {card.time?.slice(0, 5)}</p>
        )}
      </div>
    </div>
  )
}

function statusIcon(id) {
  return { draft: '✏️', ready: '🚀', scheduled: '🕐', published: '✅' }[id] || ''
}
