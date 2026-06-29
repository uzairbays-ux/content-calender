import { format, parseISO } from 'date-fns'
import { PLATFORMS, STATUSES } from '../data/constants'

export default function ExecutorView({ cards, brands, onCardClick, onStatusChange }) {
  const readyCards = cards
    .filter(c => c.status === 'ready' || c.status === 'scheduled')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  const grouped = readyCards.reduce((acc, card) => {
    const date = card.date ? card.date.slice(0, 10) : 'No Date'
    if (!acc[date]) acc[date] = []
    acc[date].push(card)
    return acc
  }, {})

  if (readyCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-5xl mb-3">🎯</span>
        <p className="text-lg font-medium">No cards ready to execute</p>
        <p className="text-sm">Cards marked "Ready to Execute" will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <span className="text-lg">🚀</span>
        <span className="text-sm font-medium text-amber-800">
          {readyCards.length} post{readyCards.length !== 1 ? 's' : ''} ready — grab the creative and schedule.
        </span>
      </div>

      {Object.entries(grouped).map(([date, dayCards]) => (
        <div key={date}>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>📅</span>
            {date !== 'No Date' ? format(parseISO(date), 'EEEE, MMM d yyyy') : 'No Date Set'}
          </h3>
          <div className="space-y-3">
            {dayCards.map(card => (
              <ExecutorCard key={card.id} card={card} brands={brands}
                onClick={() => onCardClick(card)}
                onMarkScheduled={() => onStatusChange(card.id, 'scheduled')}
                onMarkPublished={() => onStatusChange(card.id, 'published')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ExecutorCard({ card, brands, onClick, onMarkScheduled, onMarkPublished }) {
  const brand = brands.find(b => b.id === card.brand_id)
  const platform = PLATFORMS.find(p => p.id === card.platform)
  const status = STATUSES.find(s => s.id === card.status)

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden" style={{ borderLeft: `5px solid ${brand?.color || '#ccc'}` }}>
      <div className="p-4 flex gap-4">
        {card.image_data && (
          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
            <img src={card.image_data} alt="Creative" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-800">{card.title || card.product_name || 'Untitled'}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {brand && <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: brand.color }}>{brand.name}</span>}
                {platform && <span className="text-xs text-gray-600 font-medium">{platform.icon} {platform.name}</span>}
                {card.collection && <span className="text-xs text-gray-400">{card.collection}</span>}
                {card.time && <span className="text-xs text-gray-400">🕐 {card.time?.slice(0,5)}</span>}
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium shrink-0" style={{ backgroundColor: status?.bg, color: status?.color }}>
              {status?.name}
            </span>
          </div>

          {card.audience_name && (
            <div className="text-xs text-purple-700 bg-purple-50 rounded px-2 py-1 mb-2 inline-block">
              👥 {card.audience_name}{card.audience_description ? ` — ${card.audience_description}` : ''}
            </div>
          )}

          {card.copy && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Copy</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{card.copy}</p>
              {card.hashtags && <p className="text-xs text-blue-500 mt-1">{card.hashtags}</p>}
            </div>
          )}

          {card.notes && (
            <div className="bg-amber-50 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs font-semibold text-amber-600 uppercase mb-0.5">Notes</p>
              <p className="text-xs text-amber-800">{card.notes}</p>
            </div>
          )}

          {card.product_url && (
            <a href={card.product_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mb-3">
              🔗 {card.product_url}
            </a>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onClick} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
              View Full Card
            </button>
            {card.image_data && (
              <a href={card.image_data} download={`creative-${card.id}.jpg`}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
                onClick={e => e.stopPropagation()}>
                ⬇️ Download Creative
              </a>
            )}
            {card.status === 'ready' && (
              <button onClick={e => { e.stopPropagation(); onMarkScheduled() }}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium">
                Mark Scheduled
              </button>
            )}
            {card.status === 'scheduled' && (
              <button onClick={e => { e.stopPropagation(); onMarkPublished() }}
                className="text-xs px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium">
                ✅ Mark Published
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
