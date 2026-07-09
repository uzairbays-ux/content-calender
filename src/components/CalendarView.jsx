import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
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

export default function CalendarView({ cards, brands, filters, onDayClick, onCardClick, onCardDrop }) {
  const calRef = useRef(null)
  const [title, setTitle] = useState('')
  const [activeView, setActiveView] = useState('dayGridMonth')

  const filtered = cards.filter(c => {
    if (filters.brand && c.brand_id !== filters.brand) return false
    if (filters.platform && c.platform !== filters.platform) return false
    if (filters.status && c.status !== filters.status) return false
    return true
  })

  const events = filtered.map(card => {
    const brand = brands.find(b => b.id === card.brand_id)
    const platform = PLATFORMS.find(p => p.id === card.platform)
    const brandColor = brand?.color || STATUS_COLORS[card.status] || '#1976d2'

    const start = card.date
      ? card.time
        ? `${card.date.slice(0, 10)}T${card.time.slice(0, 5)}`
        : card.date.slice(0, 10)
      : null

    return {
      id: card.id,
      title: `${platform?.icon || ''} ${card.title || card.product_name || card.collection || 'Untitled'}`,
      start,
      allDay: !card.time,
      backgroundColor: brandColor,
      borderColor: brandColor,
      extendedProps: { card: { ...card, _brandColor: brandColor } },
    }
  })

  const api = () => calRef.current?.getApi()

  function changeView(viewId) {
    api()?.changeView(viewId)
    setActiveView(viewId)
  }

  function handleEventDrop({ event, revert }) {
    const dateStr = event.startStr.slice(0, 10)
    onCardDrop(event.id, dateStr).catch(() => revert())
  }

  return (
    <div className="bg-white rounded-2xl p-3 md:p-4 card-shadow h-full flex flex-col
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

        {/* Left: navigation */}
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

        {/* Center: title */}
        <h2 className="text-base md:text-xl font-bold text-gray-800 order-first w-full sm:order-none sm:w-auto text-center sm:text-left">
          {title}
        </h2>

        {/* Right: view switcher */}
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
      </div>

      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={true}
        droppable={true}
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
  )
}
