import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { PLATFORMS, STATUSES } from '../data/constants'

const STATUS_COLORS = {
  draft: '#78909c',
  ready: '#f57c00',
  scheduled: '#1976d2',
  published: '#388e3c',
}

export default function CalendarView({ cards, brands, filters, onDayClick, onCardClick, onCardDrop }) {
  const filtered = cards.filter(c => {
    if (filters.brand && c.brand_id !== filters.brand) return false
    if (filters.platform && c.platform !== filters.platform) return false
    if (filters.status && c.status !== filters.status) return false
    return true
  })

  const events = filtered.map(card => {
    const brand = brands.find(b => b.id === card.brand_id)
    const platform = PLATFORMS.find(p => p.id === card.platform)
    return {
      id: card.id,
      title: `${platform?.icon || ''} ${card.title || card.product_name || 'Untitled'}`,
      date: card.date,
      backgroundColor: brand?.color || STATUS_COLORS[card.status] || '#1976d2',
      borderColor: brand?.color || STATUS_COLORS[card.status] || '#1976d2',
      extendedProps: { card },
    }
  })

  function handleEventDrop({ event, revert }) {
    const date = event.startStr
    onCardDrop(event.id, date).catch(() => revert())
  }

  function handleDateClick({ dateStr }) {
    onDayClick(dateStr)
  }

  function handleEventClick({ event }) {
    onCardClick(event.extendedProps.card)
  }

  return (
    <div className="bg-white rounded-2xl p-4 card-shadow h-full [&_.fc]:h-full [&_.fc-toolbar-title]:text-xl [&_.fc-toolbar-title]:font-bold [&_.fc-button]:!bg-blue-500 [&_.fc-button]:!border-blue-500 [&_.fc-button:hover]:!bg-blue-600 [&_.fc-day-today]:!bg-blue-50 [&_.fc-event]:cursor-pointer [&_.fc-event]:rounded-lg [&_.fc-event]:text-xs [&_.fc-event]:px-1">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate="2026-07-01"
        events={events}
        editable={true}
        droppable={true}
        eventDrop={handleEventDrop}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="100%"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        dayMaxEvents={4}
        eventDisplay="block"
      />
    </div>
  )
}
