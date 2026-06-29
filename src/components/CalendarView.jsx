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

    // Build start datetime — use time if available so it shows on the time grid
    const start = card.date
      ? card.time
        ? `${card.date.slice(0, 10)}T${card.time.slice(0, 5)}`
        : card.date.slice(0, 10)
      : null

    return {
      id: card.id,
      title: `${platform?.icon || ''} ${card.title || card.product_name || 'Untitled'}`,
      start,
      // allDay if no time set
      allDay: !card.time,
      backgroundColor: brand?.color || STATUS_COLORS[card.status] || '#1976d2',
      borderColor: brand?.color || STATUS_COLORS[card.status] || '#1976d2',
      extendedProps: { card },
    }
  })

  function handleEventDrop({ event, revert }) {
    const dateStr = event.startStr.slice(0, 10)
    onCardDrop(event.id, dateStr).catch(() => revert())
  }

  function handleDateClick({ dateStr }) {
    onDayClick(dateStr.slice(0, 10))
  }

  function handleEventClick({ event }) {
    onCardClick(event.extendedProps.card)
  }

  return (
    <div className="bg-white rounded-2xl p-4 card-shadow h-full
      [&_.fc]:h-full
      [&_.fc-toolbar-title]:text-xl [&_.fc-toolbar-title]:font-bold
      [&_.fc-button]:!bg-blue-500 [&_.fc-button]:!border-blue-500
      [&_.fc-button:hover]:!bg-blue-600
      [&_.fc-button-active]:!bg-blue-700
      [&_.fc-day-today]:!bg-blue-50
      [&_.fc-event]:cursor-pointer [&_.fc-event]:rounded-lg [&_.fc-event]:text-xs [&_.fc-event]:px-1
      [&_.fc-timegrid-slot]:h-10
      [&_.fc-timegrid-axis]:text-xs [&_.fc-timegrid-axis]:text-gray-400
      [&_.fc-col-header-cell]:font-semibold [&_.fc-col-header-cell]:text-gray-600
      [&_.fc-scrollgrid]:border-gray-100
    ">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
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
