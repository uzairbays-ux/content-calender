import { useState } from 'react'
import { PLATFORMS, STATUSES } from '../data/constants'

export default function Sidebar({ cards, brands, filters, onFilterChange, onClearFilters, activeView, onViewChange, onAddBrand }) {
  const [newBrand, setNewBrand] = useState({ name: '', color: '#1976d2' })
  const [showBrandForm, setShowBrandForm] = useState(false)

  const counts = {
    draft: cards.filter(c => c.status === 'draft').length,
    ready: cards.filter(c => c.status === 'ready').length,
    scheduled: cards.filter(c => c.status === 'scheduled').length,
    published: cards.filter(c => c.status === 'published').length,
  }

  async function handleAddBrand(e) {
    e.preventDefault()
    if (!newBrand.name.trim()) return
    await onAddBrand(newBrand)
    setNewBrand({ name: '', color: '#1976d2' })
    setShowBrandForm(false)
  }

  const hasFilters = filters.brand || filters.platform || filters.status

  return (
    <aside className="flex flex-col gap-5 h-full overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-2xl">📆</span>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">Content</p>
          <p className="font-bold text-gray-900 text-sm leading-tight">Calendar</p>
        </div>
      </div>

      {/* Views */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Views</p>
        {[
          { id: 'calendar', icon: '📅', label: 'Calendar' },
          { id: 'flows', icon: '⚡', label: 'Campaign Flows', badge: new Set(cards.filter(c => c.flow_id).map(c => c.flow_id)).size },
          { id: 'library', icon: '📚', label: 'Content Library', badge: cards.filter(c => !c.date).length },
          { id: 'executor', icon: '🚀', label: 'Executor Queue', badge: counts.ready + counts.scheduled },
        ].map(v => (
          <button key={v.id} onClick={() => onViewChange(v.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1
              ${activeView === v.id ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>{v.icon}</span>
            <span className="flex-1 text-left">{v.label}</span>
            {v.badge > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeView === v.id ? 'bg-blue-400' : 'bg-red-100 text-red-600'}`}>
                {v.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button onClick={onClearFilters}
          className="w-full text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 text-left flex items-center gap-2 transition-colors">
          <span>✕</span> Clear All Filters
        </button>
      )}

      {/* Status */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
        {STATUSES.map(s => (
          <button key={s.id} onClick={() => onFilterChange('status', filters.status === s.id ? '' : s.id)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors mb-0.5 hover:bg-gray-50"
            style={filters.status === s.id ? { backgroundColor: s.bg } : {}}>
            <span style={{ color: filters.status === s.id ? s.color : '#555' }} className="font-medium">
              {statusIcon(s.id)} {s.name}
            </span>
            <span className="text-xs font-bold rounded-full px-1.5 py-0.5" style={{ backgroundColor: s.bg, color: s.color }}>
              {counts[s.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Brands */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Brands</p>
          <button onClick={() => setShowBrandForm(v => !v)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">+ Add</button>
        </div>

        {showBrandForm && (
          <form onSubmit={handleAddBrand} className="mb-2 flex gap-1.5">
            <input value={newBrand.name} onChange={e => setNewBrand(p => ({ ...p, name: e.target.value }))}
              placeholder="Brand name" className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            <input type="color" value={newBrand.color} onChange={e => setNewBrand(p => ({ ...p, color: e.target.value }))}
              className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5" />
            <button type="submit" className="text-xs bg-blue-500 text-white px-2 rounded-lg">✓</button>
          </form>
        )}

        <button onClick={() => onFilterChange('brand', '')}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium mb-0.5 ${!filters.brand ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}>
          All Brands <span className="text-xs text-gray-400 ml-1">({brands.length})</span>
        </button>

        {brands.map(b => (
          <button key={b.id} onClick={() => onFilterChange('brand', filters.brand === b.id ? '' : b.id)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50 mb-0.5"
            style={filters.brand === b.id ? { backgroundColor: b.color + '20' } : {}}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
            <span className="flex-1 text-left truncate" style={{ color: filters.brand === b.id ? b.color : '#555' }}>{b.name}</span>
            <span className="text-gray-400">{cards.filter(c => c.brand_id === b.id).length}</span>
          </button>
        ))}
      </div>

      {/* Platform */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Platform</p>
        <button onClick={() => onFilterChange('platform', '')}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium mb-0.5 ${!filters.platform ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}>
          All Platforms
        </button>
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => onFilterChange('platform', filters.platform === p.id ? '' : p.id)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors mb-0.5 ${filters.platform === p.id ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <span>{p.icon}</span>
            <span className="flex-1 text-left">{p.name}</span>
            <span className="text-gray-400">{cards.filter(c => c.platform === p.id).length}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}

function statusIcon(id) {
  return { draft: '✏️', ready: '🚀', scheduled: '🕐', published: '✅' }[id] || ''
}
