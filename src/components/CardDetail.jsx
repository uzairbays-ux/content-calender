import { PLATFORMS, STATUSES } from '../data/constants'

export default function CardDetail({ card, brands, onClose, onEdit, onStatusChange, onDelete }) {
  const brand = brands.find(b => b.id === card.brand_id)
  const platform = PLATFORMS.find(p => p.id === card.platform)
  const status = STATUSES.find(s => s.id === card.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between gap-3" style={{ borderBottom: `3px solid ${brand?.color || '#e0e0e0'}` }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {brand && <span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: brand.color }}>{brand.name}</span>}
              {platform && <span className="text-xs font-medium text-gray-500">{platform.icon} {platform.name}</span>}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: status?.bg, color: status?.color }}>
                {statusIcon(status?.id)} {status?.name}
              </span>
            </div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{card.title || card.product_name || 'Untitled'}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl shrink-0">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Flow context */}
          {card.flow_id && (
            <div className="px-6 py-3 bg-indigo-50/60 border-b border-indigo-100">
              <p className="text-xs font-bold text-indigo-700">
                ⚡ {card.flow_name} — Step {card.flow_step} of {card.flow_total}
              </p>
              {card.step_reason && (
                <p className="text-xs text-indigo-500 italic mt-0.5">↳ {card.step_reason}</p>
              )}
            </div>
          )}

          {/* Creative image */}
          {card.image_data && (
            <div className="relative bg-gray-100">
              <img src={card.image_data} alt="Creative" className="w-full max-h-56 object-cover" />
              <a href={card.image_data} download={`creative-${card.id}.jpg`}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-xs px-3 py-1.5 rounded-lg font-medium text-blue-600 shadow flex items-center gap-1">
                ⬇️ Download Creative
              </a>
            </div>
          )}

          <div className="px-6 py-5 space-y-4">
            {/* Schedule info */}
            <div className="flex items-center gap-4 text-sm">
              {card.date && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span>📅</span>
                  <span className="font-medium">{card.date?.slice(0, 10)}</span>
                  {card.time && <span className="text-gray-400">@ {card.time?.slice(0, 5)}</span>}
                </div>
              )}
              {card.audience_name && (
                <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2 py-1 rounded-lg text-xs font-medium">
                  <span>👥</span> {card.audience_name}
                </div>
              )}
            </div>

            {/* Product or Collection */}
            {(card.product_name || card.collection) && (
              <Section label={card.collection ? '🗂️ Collection' : '📦 Product'}>
                <p className="text-sm font-medium text-gray-800">{card.collection || card.product_name}</p>
                {card.product_url && (
                  <a href={card.product_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-1 flex items-center gap-1">
                    🔗 {card.product_url}
                  </a>
                )}
              </Section>
            )}

            {/* Audience description */}
            {card.audience_description && (
              <Section label="👥 Audience">
                <p className="text-sm text-gray-700">{card.audience_description}</p>
              </Section>
            )}

            {/* Copy */}
            {card.copy && (
              <Section label="✍️ Caption / Copy">
                <div className="bg-gray-50 rounded-xl p-3 select-all cursor-text">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{card.copy}</p>
                  {card.hashtags && <p className="text-xs text-blue-500 mt-2">{card.hashtags}</p>}
                </div>
                <p className="text-xs text-gray-400 mt-1">Click to select all text</p>
              </Section>
            )}

            {/* Notes */}
            {card.notes && (
              <Section label="📌 Notes for Executor">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-sm text-amber-800">{card.notes}</p>
                </div>
              </Section>
            )}

            {/* Creator */}
            {card.created_by && (
              <p className="text-xs text-gray-400">Added by {card.created_by}</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between gap-3">
          <button onClick={() => { onDelete(card.id); onClose() }}
            className="text-red-400 hover:text-red-600 text-sm font-medium">
            Delete
          </button>
          <div className="flex gap-2">
            <button onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              ✏️ Edit Brief
            </button>
            {card.status === 'ready' && (
              <button onClick={() => { onStatusChange(card.id, 'scheduled'); onClose() }}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-blue-500 hover:bg-blue-600">
                🕐 Mark Scheduled
              </button>
            )}
            {card.status === 'scheduled' && (
              <button onClick={() => { onStatusChange(card.id, 'published'); onClose() }}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-green-500 hover:bg-green-600">
                ✅ Mark Published
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
      {children}
    </div>
  )
}

function statusIcon(id) {
  return { draft: '✏️', ready: '🚀', scheduled: '🕐', published: '✅' }[id] || ''
}
