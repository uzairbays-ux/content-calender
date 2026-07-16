import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { PLATFORMS, STATUSES } from '../data/constants'

const THEME_STYLES = {
  Awareness: { bg: '#eff6ff', color: '#1d4ed8' },
  Conversion: { bg: '#fefce8', color: '#a16207' },
  Retargeting: { bg: '#faf5ff', color: '#7e22ce' },
  Closing: { bg: '#fef2f2', color: '#b91c1c' },
  'Sale Push': { bg: '#fff7ed', color: '#c2410c' },
}

const CANVAS_BG = {
  backgroundColor: '#fafafa',
  backgroundImage: 'radial-gradient(circle, #d6d6de 1px, transparent 1px)',
  backgroundSize: '18px 18px',
}

export default function FlowsView({ cards, brands, filters, onCardClick }) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const flows = useMemo(() => {
    const map = {}
    for (const c of cards) {
      if (!c.flow_id) continue
      if (filters.brand && c.brand_id !== filters.brand) continue
      ;(map[c.flow_id] ||= []).push(c)
    }
    return Object.values(map)
      .map(steps => steps.sort((a, b) => (a.flow_step || 0) - (b.flow_step || 0)))
      .filter(steps => !search || steps[0].flow_name?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a[0].date || '').localeCompare(b[0].date || ''))
  }, [cards, filters.brand, search])

  const selected = flows.find(f => f[0].flow_id === selectedId) || flows[0]

  if (flows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-2xl card-shadow">
        <span className="text-5xl mb-3">⚡</span>
        <p className="text-lg font-medium">No flows found</p>
        <p className="text-sm">Try clearing search or filters</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* Flow picker */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="font-bold text-gray-800 text-sm">⚡ Campaign Flows <span className="text-gray-400">({flows.length})</span></p>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search flows…"
            className="mt-2 w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {flows.map(steps => {
            const f = steps[0]
            const brand = brands.find(b => b.id === f.brand_id)
            const theme = f.notes?.match(/Week theme: ([\w ]+)/)?.[1]?.trim()
            const ts = THEME_STYLES[theme] || { bg: '#f1f5f9', color: '#475569' }
            const isActive = selected && f.flow_id === selected[0].flow_id
            const published = steps.filter(s => s.status === 'published').length
            return (
              <button
                key={f.flow_id}
                onClick={() => setSelectedId(f.flow_id)}
                className={`w-full text-left rounded-xl px-3 py-2 transition-colors border
                  ${isActive ? 'border-blue-300 bg-blue-50/60' : 'border-transparent hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: brand?.color || '#94a3b8' }} />
                  <span className="text-xs font-semibold text-gray-800 truncate flex-1">{f.flow_name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {theme && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: ts.bg, color: ts.color }}>{theme}</span>}
                  <span className="text-[10px] text-gray-400">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
                  <span className="text-[10px] text-gray-400">· {published}/{steps.length} live</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{fmtShort(f.date)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Canvas */}
      <main className="flex-1 min-w-0 rounded-2xl card-shadow overflow-auto" style={CANVAS_BG}>
        {/* Mobile flow picker */}
        <div className="md:hidden p-3">
          <select
            value={selected?.[0].flow_id || ''}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {flows.map(steps => (
              <option key={steps[0].flow_id} value={steps[0].flow_id}>{steps[0].flow_name}</option>
            ))}
          </select>
        </div>

        {selected && <FlowCanvas steps={selected} brands={brands} onCardClick={onCardClick} />}
      </main>
    </div>
  )
}

function FlowCanvas({ steps, brands, onCardClick }) {
  const first = steps[0]
  const brand = brands.find(b => b.id === first.brand_id)
  const theme = first.notes?.match(/Week theme: ([\w ]+)/)?.[1]?.trim()
  const ts = THEME_STYLES[theme] || { bg: '#f1f5f9', color: '#475569' }
  const isSale = theme === 'Sale Push'

  return (
    <div className="flex flex-col items-center py-10 px-4 min-w-fit">

      {/* Trigger node */}
      <div className="w-96 max-w-full bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-gray-900 text-sm leading-snug">
              Campaign trigger — {first.flow_name}
            </p>
            <span className="text-base shrink-0">⚡</span>
          </div>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            This flow starts on {fmtLong(first.date)} as part of the{' '}
            <span className="font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: ts.bg, color: ts.color }}>{theme || 'campaign'}</span>{' '}
            week for <span className="font-medium" style={{ color: brand?.color }}>{first.brand_name}</span>.
            {isSale ? ' Offer-led sequence — urgency messaging across owned channels.' : ' Funnel-ordered sequence — organic warms, paid amplifies, owned channels close.'}
          </p>
        </div>
      </div>

      {/* Steps */}
      {steps.map(step => (
        <StepNode key={step.id} step={step} brand={brand} onClick={() => onCardClick(step)} />
      ))}

      {/* End node */}
      <Connector />
      <div className="bg-white rounded-full border border-gray-200 shadow-sm px-4 py-1.5 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${steps.every(s => s.status === 'published') ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-xs font-medium text-gray-500">
          {steps.every(s => s.status === 'published') ? 'Campaign complete' : `${steps.filter(s => s.status === 'published').length}/${steps.length} steps live`}
        </span>
      </div>
    </div>
  )
}

function StepNode({ step, brand, onClick }) {
  const platform = PLATFORMS.find(p => p.id === step.platform)
  const status = STATUSES.find(s => s.id === step.status)

  return (
    <>
      <Connector />
      <div
        onClick={onClick}
        className="w-96 max-w-full bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
        style={{ borderTop: `3px solid ${brand?.color || '#94a3b8'}` }}
      >
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                {step.flow_step}
              </span>
              <p className="font-semibold text-gray-900 text-sm truncate">{platform?.name || 'Channel'}</p>
            </div>
            <span className="text-base shrink-0">{platform?.icon}</span>
          </div>

          <div className="flex gap-3 mt-2">
            {step.image_data && (
              <img src={step.image_data} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100" />
            )}
            <div className="min-w-0">
              <p className="text-sm text-gray-700 font-medium leading-snug line-clamp-2">{step.title || step.product_name}</p>
              {step.step_reason && (
                <p className="text-xs text-gray-400 italic mt-1 leading-snug line-clamp-2">{step.step_reason}</p>
              )}
            </div>
          </div>

          {step.audience_name && (
            <p className="text-[11px] text-purple-600 mt-2">👥 {step.audience_name}</p>
          )}
        </div>

        {/* Footer — Shopify condition-style row */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            📅 {fmtLong(step.date)}{step.time ? ` · ${step.time.slice(0, 5)}` : ''}
          </span>
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: status?.color }}>
            {step.status === 'published' ? '✓' : statusIcon(step.status)} {status?.name}
          </span>
        </div>
      </div>
    </>
  )
}

function Connector() {
  return (
    <svg width="24" height="36" className="shrink-0">
      <line x1="12" y1="0" x2="12" y2="28" stroke="#c4c7cf" strokeWidth="1.5" />
      <path d="M7 26 L12 35 L17 26 Z" fill="#c4c7cf" />
    </svg>
  )
}

function fmtLong(d) {
  if (!d) return 'unscheduled'
  try { return format(parseISO(d.slice(0, 10)), 'EEE, MMM d') } catch { return d.slice(0, 10) }
}
function fmtShort(d) {
  if (!d) return '—'
  try { return format(parseISO(d.slice(0, 10)), 'MMM d') } catch { return d.slice(0, 10) }
}
function statusIcon(id) {
  return { draft: '✏️', ready: '🚀', scheduled: '🕐' }[id] || ''
}
