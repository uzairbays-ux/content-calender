import { format, parseISO } from 'date-fns'
import { PLATFORMS, STATUSES } from '../data/constants'

const THEME_STYLES = {
  Awareness: { bg: '#eff6ff', color: '#1d4ed8' },
  Conversion: { bg: '#fefce8', color: '#a16207' },
  Retargeting: { bg: '#faf5ff', color: '#7e22ce' },
  Closing: { bg: '#fef2f2', color: '#b91c1c' },
}

export default function FlowsView({ cards, brands, filters, onCardClick }) {
  // Group cards by flow
  const flows = {}
  for (const c of cards) {
    if (!c.flow_id) continue
    if (filters.brand && c.brand_id !== filters.brand) continue
    ;(flows[c.flow_id] ||= []).push(c)
  }

  const flowList = Object.values(flows)
    .map(steps => steps.sort((a, b) => (a.flow_step || 0) - (b.flow_step || 0)))
    .sort((a, b) => (a[0].date || '').localeCompare(b[0].date || ''))

  if (flowList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-2xl card-shadow">
        <span className="text-5xl mb-3">⚡</span>
        <p className="text-lg font-medium">No flows yet</p>
        <p className="text-sm">Cards grouped into campaign sequences will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl card-shadow px-4 py-3">
        <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          ⚡ Campaign Flows
          <span className="text-sm font-semibold text-gray-400">({flowList.length})</span>
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Each flow is a justified channel sequence: organic warms the audience → push reinforces free → ads retarget the engaged → email tells the full story → WhatsApp closes the hottest leads.
        </p>
      </div>

      {flowList.map(steps => <FlowCard key={steps[0].flow_id} steps={steps} brands={brands} onCardClick={onCardClick} />)}
    </div>
  )
}

function FlowCard({ steps, brands, onCardClick }) {
  const first = steps[0]
  const brand = brands.find(b => b.id === first.brand_id)
  const theme = first.notes?.match(/Week theme: (\w+)/)?.[1]
  const themeStyle = THEME_STYLES[theme] || { bg: '#f1f5f9', color: '#475569' }
  const published = steps.filter(s => s.status === 'published').length
  const dateRange = `${fmtDate(first.date)} → ${fmtDate(steps[steps.length - 1].date)}`

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Flow header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap"
        style={{ borderLeft: `4px solid ${brand?.color || '#94a3b8'}` }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand?.color || '#94a3b8' }} />
          <span className="font-bold text-gray-800 text-sm">{first.flow_name}</span>
          {theme && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: themeStyle.bg, color: themeStyle.color }}>
              {theme}
            </span>
          )}
          <span className="text-xs text-gray-400">{dateRange}</span>
        </div>
        <span className="text-xs font-medium text-gray-400">
          {published}/{steps.length} published
        </span>
      </div>

      {/* Steps timeline */}
      <div className="px-4 py-3">
        {steps.map((step, i) => {
          const platform = PLATFORMS.find(p => p.id === step.platform)
          const status = STATUSES.find(s => s.id === step.status)
          const isLast = i === steps.length - 1

          return (
            <div key={step.id} className="flex gap-3">
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onCardClick(step)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-transform hover:scale-110"
                  style={{
                    borderColor: brand?.color || '#94a3b8',
                    backgroundColor: step.status === 'published' ? (brand?.color || '#94a3b8') : '#fff',
                    color: step.status === 'published' ? '#fff' : (brand?.color || '#94a3b8'),
                  }}
                >
                  {step.status === 'published' ? '✓' : step.flow_step}
                </button>
                {!isLast && <div className="w-0.5 flex-1 my-1 rounded" style={{ backgroundColor: '#e2e8f0', minHeight: 24 }} />}
              </div>

              {/* Step content */}
              <div
                onClick={() => onCardClick(step)}
                className={`flex-1 min-w-0 cursor-pointer rounded-xl px-3 py-2 mb-2 hover:bg-gray-50 transition-colors ${isLast ? '' : ''}`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-500">{fmtDate(step.date)}{step.time ? ` · ${step.time.slice(0, 5)}` : ''}</span>
                  <span className="text-xs font-semibold text-gray-700">{platform?.icon} {platform?.name}</span>
                  {status && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.name}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 truncate mt-0.5">{step.title || step.product_name}</p>
                {step.step_reason && (
                  <p className="text-xs text-gray-400 italic mt-0.5 leading-snug">↳ {step.step_reason}</p>
                )}
                {step.audience_name && (
                  <p className="text-[11px] text-purple-600 mt-0.5">👥 {step.audience_name}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function fmtDate(d) {
  if (!d) return '—'
  try { return format(parseISO(d.slice(0, 10)), 'EEE, MMM d') } catch { return d.slice(0, 10) }
}
