import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { PLATFORMS, STATUSES } from '../data/constants'

export default function ExecutorView({ cards, brands, onCardClick, onStatusChange }) {
  const readyCards = cards
    .filter(c => c.status === 'ready')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  const scheduledCards = cards
    .filter(c => c.status === 'scheduled')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  const hasAnything = readyCards.length > 0 || scheduledCards.length > 0

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-5xl mb-3">🎯</span>
        <p className="text-lg font-medium">No cards in the queue</p>
        <p className="text-sm">Cards marked "Ready to Execute" will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* ── READY TO EXECUTE ── */}
      {readyCards.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 text-orange-600 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-lg">🚀</span>
              <span className="font-semibold text-sm">{readyCards.length} Ready to Execute</span>
            </div>
            <p className="text-sm text-gray-400">Pick up a card, grab the creative, and schedule it in your tool.</p>
          </div>
          <CardGroup cards={readyCards} brands={brands} onCardClick={onCardClick}
            onAction={(id) => onStatusChange(id, 'scheduled')}
            actionLabel="Mark Scheduled"
            actionColor="bg-blue-500 hover:bg-blue-600"
          />
        </section>
      )}

      {/* ── SCHEDULED — GOING LIVE ── */}
      {scheduledCards.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 text-blue-700 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-lg">🕐</span>
              <span className="font-semibold text-sm">{scheduledCards.length} Scheduled — Going Live</span>
            </div>
            <p className="text-sm text-gray-400">These are queued in your marketing tool. Mark published once live.</p>
          </div>
          <CardGroup cards={scheduledCards} brands={brands} onCardClick={onCardClick}
            onAction={(id) => onStatusChange(id, 'published')}
            actionLabel="✅ Mark Published"
            actionColor="bg-green-500 hover:bg-green-600"
            showCountdown
          />
        </section>
      )}
    </div>
  )
}

function CardGroup({ cards, brands, onCardClick, onAction, actionLabel, actionColor, showCountdown }) {
  const grouped = cards.reduce((acc, card) => {
    const date = card.date ? card.date.slice(0, 10) : 'no-date'
    if (!acc[date]) acc[date] = []
    acc[date].push(card)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, dayCards]) => (
        <div key={date}>
          <DateLabel date={date} showCountdown={showCountdown} />
          <div className="space-y-3 mt-2">
            {dayCards.map(card => (
              <ExecutorCard key={card.id} card={card} brands={brands}
                onClick={() => onCardClick(card)}
                onAction={() => onAction(card.id)}
                actionLabel={actionLabel}
                actionColor={actionColor}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DateLabel({ date, showCountdown }) {
  if (date === 'no-date') {
    return <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">📅 No Date Set</p>
  }

  const d = parseISO(date)
  const label = isToday(d) ? '📅 Today' : isTomorrow(d) ? '📅 Tomorrow' : `📅 ${format(d, 'EEEE, MMM d yyyy')}`
  const overdue = showCountdown && isPast(d) && !isToday(d)

  return (
    <div className="flex items-center gap-2">
      <p className={`text-sm font-bold uppercase tracking-wider ${overdue ? 'text-red-500' : 'text-gray-500'}`}>
        {label}
      </p>
      {overdue && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Overdue</span>}
      {showCountdown && isToday(d) && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Going live today</span>}
    </div>
  )
}

function ExecutorCard({ card, brands, onClick, onAction, actionLabel, actionColor }) {
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
                {card.time && <span className="text-xs text-gray-500 font-medium">🕐 {card.time?.slice(0, 5)}</span>}
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
              View Card
            </button>
            {card.image_data && (
              <a href={card.image_data} download={`creative-${card.id}.jpg`}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
                onClick={e => e.stopPropagation()}>
                ⬇️ Download Creative
              </a>
            )}
            <button onClick={e => { e.stopPropagation(); onAction() }}
              className={`text-xs px-3 py-1.5 rounded-lg text-white font-medium ${actionColor}`}>
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
