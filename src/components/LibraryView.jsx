import { useState } from 'react'
import { PLATFORMS, STATUSES } from '../data/constants'
import { CHECKLIST } from './checklist.js'

export default function LibraryView({ cards, brands, filters, onCardClick, onStash }) {
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')

  const stashed = cards.filter(c => c.stashed)

  // Backlog = cards without a date (stashed cards live in their own section)
  const backlog = cards.filter(c => {
    if (c.date || c.stashed) return false
    if (filters.brand && c.brand_id !== filters.brand) return false
    if (filters.platform && c.platform !== filters.platform) return false
    if (filters.status && c.status !== filters.status) return false
    if (brandFilter && c.brand_id !== brandFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${c.title} ${c.product_name} ${c.collection} ${c.brand_name} ${c.notes} ${c.copy}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  // Group by brand for display
  const grouped = backlog.reduce((acc, card) => {
    const key = card.brand_name || 'No Brand'
    if (!acc[key]) acc[key] = []
    acc[key].push(card)
    return acc
  }, {})

  const brandsWithCards = brands.filter(b => cards.some(c => !c.date && c.brand_id === b.id))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl card-shadow p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              📚 Content Library
              <span className="text-sm font-semibold text-gray-400">({backlog.length})</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Backlog of products waiting for content. Complete a card, then drag it onto the calendar from the Calendar view.
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search products, USP, notes…"
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">All brands</option>
            {brandsWithCards.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({cards.filter(c => !c.date && c.brand_id === b.id).length})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty state */}
      {backlog.length === 0 && (
        <div className="flex flex-col items-center justify-center h-52 text-gray-400 bg-white rounded-2xl card-shadow">
          <span className="text-5xl mb-3">📚</span>
          <p className="text-lg font-medium">Library is empty</p>
          <p className="text-sm">Cards without a date land here — your content backlog</p>
        </div>
      )}

      {/* Stash — parked cards */}
      {stashed.length > 0 && (
        <section className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-amber-800 text-sm">🗃 Stash</h3>
            <span className="text-xs text-amber-500 font-semibold">({stashed.length})</span>
          </div>
          <p className="text-xs text-amber-600/80 mb-3">Unused cards parked for later — restore to backlog or drag onto the calendar from the Calendar view.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stashed.map(card => {
              const brand = brands.find(b => b.id === card.brand_id)
              return (
                <div key={card.id} className="relative">
                  <LibraryCard card={card} brand={brand} onClick={() => onCardClick(card)} />
                  <button
                    onClick={() => onStash(card.id, false)}
                    title="Return to backlog"
                    className="absolute top-2 right-2 text-xs bg-white/90 border border-amber-200 text-amber-700 rounded-full px-2 py-0.5 font-medium hover:bg-amber-100 shadow-sm">
                    ↩ Restore
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Groups */}
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([brandName, brandCards]) => {
        const brand = brands.find(b => b.name === brandName)
        return (
          <section key={brandName}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand?.color || '#94a3b8' }} />
              <h3 className="font-bold text-gray-700 text-sm">{brandName}</h3>
              <span className="text-xs text-gray-400">{brandCards.length} product{brandCards.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {brandCards.map(card => (
                <LibraryCard key={card.id} card={card} brand={brand} onClick={() => onCardClick(card)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function LibraryCard({ card, brand, onClick }) {
  const platform = PLATFORMS.find(p => p.id === card.platform)
  const status = STATUSES.find(s => s.id === card.status)

  const done = CHECKLIST.filter(c => c.check(card)).length
  const total = CHECKLIST.length
  const pct = Math.round((done / total) * 100)
  const isComplete = done === total

  // Extract USP line from notes if present
  const uspLine = card.notes?.split('\n').find(l => l.startsWith('USP:'))?.slice(4).trim()
  const needsRecording = card.notes?.toLowerCase().includes('needs to be recorded')

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl card-shadow hover:card-shadow-hover transition-all hover:-translate-y-0.5 cursor-pointer overflow-hidden flex flex-col"
      style={{ borderTop: `3px solid ${brand?.color || '#94a3b8'}` }}
    >
      {card.image_data && (
        <div className="h-24 bg-gray-100 overflow-hidden">
          <img src={card.image_data} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1.5 mb-1">
          <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 flex-1">
            {card.title || card.product_name || card.collection || 'Untitled'}
          </p>
          {platform && <span className="text-sm shrink-0">{platform.icon}</span>}
        </div>

        {uspLine && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{uspLine}</p>
        )}

        <div className="mt-auto space-y-2">
          {/* Content readiness flag */}
          {needsRecording ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              🎬 Needs recording
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ✓ Content available
            </span>
          )}

          {/* Progress */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isComplete ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444',
                }}
              />
            </div>
            <span className={`text-xs font-semibold ${isComplete ? 'text-green-600' : 'text-gray-400'}`}>
              {isComplete ? '✓' : `${pct}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
