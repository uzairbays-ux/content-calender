import { useRef, useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { PLATFORMS, STATUSES } from '../data/constants'

const STATUS_COLORS = {
  draft: '#78909c',
  ready: '#f57c00',
  scheduled: '#1976d2',
  published: '#388e3c',
}

const VIEWS = [
  { id: 'dayGridMonth', label: 'Month' },
  { id: 'timeGridWeek', label: 'Week' },
  { id: 'timeGridDay', label: 'Day' },
]

export default function CalendarView({ cards, brands, filters, onDayClick, onCardClick, onCardDrop, onStash }) {
  const calRef = useRef(null)
  const backlogRef = useRef(null)
  const [title, setTitle] = useState('')
  const [activeView, setActiveView] = useState('dayGridMonth')
  const [showBacklog, setShowBacklog] = useState(true)

  const filtered = cards.filter(c => {
    if (filters.brand && c.brand_id !== filters.brand) return false
    if (filters.platform && c.platform !== filters.platform) return false
    if (filters.status && c.status !== filters.status) return false
    return true
  })

  // Only dated, non-stashed cards become calendar events
  const events = filtered.filter(c => c.date && !c.stashed).map(card => {
    const brand = brands.find(b => b.id === card.brand_id)
    const platform = PLATFORMS.find(p => p.id === card.platform)
    const brandColor = brand?.color || STATUS_COLORS[card.status] || '#1976d2'

    const start = card.time
      ? `${card.date.slice(0, 10)}T${card.time.slice(0, 5)}`
      : card.date.slice(0, 10)

    const stepBadge = card.flow_step ? `${card.flow_step}/${card.flow_total} ` : ''
    return {
      id: card.id,
      title: `${stepBadge}${platform?.icon || ''} ${card.title || card.product_name || card.collection || 'Untitled'}`,
      start,
      allDay: !card.time,
      backgroundColor: brandColor,
      borderColor: brandColor,
      extendedProps: { card: { ...card, _brandColor: brandColor } },
    }
  })

  // Undated cards = backlog; stashed cards = parked for later (both draggable onto dates)
  const backlog = filtered.filter(c => !c.date && !c.stashed)
  const stash = filtered.filter(c => c.stashed)

  // Register the drawer (backlog + stash) as an external drag source for FullCalendar
  useEffect(() => {
    if (!backlogRef.current) return
    const draggable = new Draggable(backlogRef.current, {
      itemSelector: '[data-card-id]',
    })
    return () => draggable.destroy()
  }, [showBacklog, backlog.length, stash.length])

  const api = () => calRef.current?.getApi()

  function changeView(viewId) {
    api()?.changeView(viewId)
    setActiveView(viewId)
  }

  function handleEventDrop({ event, revert }) {
    const dateStr = event.startStr.slice(0, 10)
    onCardDrop(event.id, dateStr).catch(() => revert())
  }

  // External drop from backlog panel
  function handleExternalDrop(info) {
    const cardId = info.draggedEl.dataset.cardId
    if (cardId) onCardDrop(cardId, info.dateStr.slice(0, 10)).catch(() => {})
  }

  return (
    <div className="flex gap-3 h-full">
      <div className="bg-white rounded-2xl p-3 md:p-4 card-shadow flex-1 min-w-0 flex flex-col
        [&_.fc]:flex-1 [&_.fc]:min-h-0
        [&_.fc-day-today]:!bg-blue-50
        [&_.fc-event]:cursor-pointer [&_.fc-event]:rounded-lg [&_.fc-event]:text-xs [&_.fc-event]:px-1
        [&_.fc-timegrid-slot]:h-10
        [&_.fc-timegrid-axis]:text-xs [&_.fc-timegrid-axis]:text-gray-400
        [&_.fc-col-header-cell]:font-semibold [&_.fc-col-header-cell]:text-gray-600 [&_.fc-col-header-cell]:text-xs [&_.fc-col-header-cell]:py-2
        [&_.fc-scrollgrid]:border-gray-100
        [&_.fc-daygrid-day-number]:text-sm [&_.fc-daygrid-day-number]:text-gray-600
      ">
        {/* Custom toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => api()?.prev()}
              aria-label="Previous"
              className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={() => api()?.next()}
              aria-label="Next"
              className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </button>
            <button
              onClick={() => api()?.today()}
              className="h-9 px-3.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
            >
              Today
            </button>
          </div>

          <h2 className="text-base md:text-xl font-bold text-gray-800 order-first w-full sm:order-none sm:w-auto text-center sm:text-left">
            {title}
          </h2>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-full p-1">
              {VIEWS.map(v => (
                <button
                  key={v.id}
                  onClick={() => changeView(v.id)}
                  className={`px-3.5 h-7 rounded-full text-xs font-semibold transition-all
                    ${activeView === v.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            {/* Backlog toggle — desktop only */}
            <button
              onClick={() => setShowBacklog(v => !v)}
              className={`hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-semibold transition-colors
                ${showBacklog
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              📚 Backlog
              {(backlog.length + stash.length) > 0 && (
                <span className="bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                  {backlog.length + stash.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          editable={true}
          droppable={true}
          drop={handleExternalDrop}
          eventDrop={handleEventDrop}
          dateClick={({ dateStr }) => onDayClick(dateStr.slice(0, 10))}
          eventClick={({ event }) => onCardClick(event.extendedProps.card)}
          height="100%"
          headerToolbar={false}
          datesSet={(info) => setTitle(info.view.title)}
          dayMaxEvents={4}
          eventDisplay="block"
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
          allDayText="All Day"
          nowIndicator={true}
        />
      </div>

      {/* Backlog + Stash drawer — desktop only */}
      {showBacklog && (
        <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white rounded-2xl card-shadow overflow-hidden">
          <div ref={backlogRef} className="flex-1 overflow-y-auto">
            {/* Backlog section */}
            <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">📚 Backlog <span className="text-gray-400 font-semibold">({backlog.length})</span></p>
              <p className="text-[11px] text-gray-400 mt-0.5">Drag onto a date to schedule</p>
            </div>
            <div className="p-2 space-y-1.5">
              {backlog.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No unscheduled cards 🎉</p>
              )}
              {backlog.map(card => (
                <DrawerChip key={card.id} card={card} brands={brands} onCardClick={onCardClick}
                  action={{ icon: '🗃', title: 'Stash for later', onClick: () => onStash(card.id, true) }} />
              ))}
            </div>

            {/* Stash section */}
            <div className="px-4 py-3 border-y border-gray-100 sticky top-0 bg-amber-50/70 z-10">
              <p className="font-bold text-amber-800 text-sm flex items-center gap-1.5">🗃 Stash <span className="text-amber-500 font-semibold">({stash.length})</span></p>
              <p className="text-[11px] text-amber-600/80 mt-0.5">Unused cards parked for later — drag onto a date to reuse</p>
            </div>
            <div className="p-2 space-y-1.5 bg-amber-50/40 min-h-16">
              {stash.length === 0 && (
                <p className="text-xs text-amber-600/60 text-center py-4">Empty — stash cards you don't need yet</p>
              )}
              {stash.map(card => (
                <DrawerChip key={card.id} card={card} brands={brands} onCardClick={onCardClick}
                  action={{ icon: '↩', title: 'Return to backlog', onClick: () => onStash(card.id, false) }} />
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

function DrawerChip({ card, brands, onCardClick, action }) {
  const brand = brands.find(b => b.id === card.brand_id)
  return (
    <div
      data-card-id={card.id}
      onClick={() => onCardClick(card)}
      className="group rounded-lg border border-gray-100 bg-white px-2.5 py-2 cursor-grab active:cursor-grabbing hover:border-blue-200 hover:bg-blue-50/40 transition-colors select-none relative"
      style={{ borderLeft: `3px solid ${brand?.color || '#94a3b8'}` }}
    >
      <p className="text-xs font-semibold text-gray-700 leading-snug line-clamp-2 pr-5">
        {card.title || card.product_name || card.collection || 'Untitled'}
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5">{brand?.name || card.brand_name}</p>
      <button
        title={action.title}
        onClick={e => { e.stopPropagation(); action.onClick() }}
        className="absolute top-1.5 right-1.5 text-xs opacity-0 group-hover:opacity-100 hover:scale-125 transition-all"
      >
        {action.icon}
      </button>
    </div>
  )
}
