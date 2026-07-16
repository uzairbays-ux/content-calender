import { useState } from 'react'
import { useCards, useBrands, useAudiences } from './data/store'
import CalendarView from './components/CalendarView'
import ExecutorView from './components/ExecutorView'
import LibraryView from './components/LibraryView'
import FlowsView from './components/FlowsView'
import Sidebar from './components/Sidebar'
import CardModal from './components/CardModal'
import CardDetail from './components/CardDetail'

export default function App() {
  const { cards, loading, error, addCard, updateCard, updateStatus, moveCard, stashCard, deleteCard } = useCards()
  const { brands, addBrand } = useBrands()
  const { audiences } = useAudiences()

  const [modal, setModal] = useState(null)
  const [filters, setFilters] = useState({ brand: '', platform: '', status: '' })
  const [view, setView] = useState('calendar')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleCardClick(card) {
    if (card.status === 'draft') setModal({ mode: 'edit', card })
    else setModal({ mode: 'detail', card })
  }

  function handleFilterChange(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
    setSidebarOpen(false) // close drawer on mobile after filter pick
  }

  function clearFilters() {
    setFilters({ brand: '', platform: '', status: '' })
  }

  async function handleSave(form) {
    if (modal.mode === 'new') await addCard(form)
    else await updateCard(modal.card.id, form)
  }

  const readyCount = cards.filter(c => c.status === 'ready' || c.status === 'scheduled').length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f2f5' }}>

      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </button>
          <span className="text-xl">📆</span>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Content Calendar</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Multi-brand campaign planner</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="hidden sm:inline text-xs text-red-500 bg-red-50 px-2 py-1 rounded">⚠ API offline</span>}
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
          <span className="hidden sm:inline text-xs text-gray-400">{cards.length} cards</span>
          <button
            onClick={() => setModal({ mode: 'new', date: '' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">New Card</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — drawer on mobile, fixed on md+ */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-40 md:z-auto
          w-64 md:w-56 shrink-0 bg-white border-r border-gray-100
          overflow-y-auto p-4
          transform transition-transform duration-250 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          top-0 md:top-auto
        `}>
          {/* Close btn — mobile only */}
          <div className="flex items-center justify-between mb-3 md:hidden">
            <span className="font-bold text-gray-700 text-sm">Filters & Views</span>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-xl">×</button>
          </div>
          <Sidebar
            cards={cards}
            brands={brands}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            activeView={view}
            onViewChange={(v) => { setView(v); setSidebarOpen(false) }}
            onAddBrand={addBrand}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 pb-20 md:pb-5">
          {view === 'calendar' && (
            <CalendarView
              cards={cards}
              brands={brands}
              filters={filters}
              onDayClick={date => setModal({ mode: 'new', date })}
              onCardClick={handleCardClick}
              onCardDrop={moveCard}
              onStash={stashCard}
            />
          )}
          {view === 'flows' && (
            <FlowsView
              cards={cards}
              brands={brands}
              filters={filters}
              onCardClick={handleCardClick}
            />
          )}
          {view === 'library' && (
            <LibraryView
              cards={cards}
              brands={brands}
              filters={filters}
              onCardClick={handleCardClick}
              onStash={stashCard}
            />
          )}
          {view === 'executor' && (
            <ExecutorView
              cards={cards}
              brands={brands}
              onCardClick={handleCardClick}
              onStatusChange={updateStatus}
            />
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-20 shadow-lg">
        <button
          onClick={() => setView('calendar')}
          className={`flex-1 flex flex-col items-center py-3 text-xs font-medium gap-1 transition-colors
            ${view === 'calendar' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <span className="text-xl">📅</span>
          Calendar
        </button>
        <button
          onClick={() => setView('flows')}
          className={`flex-1 flex flex-col items-center py-3 text-xs font-medium gap-1 transition-colors
            ${view === 'flows' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <span className="text-xl">⚡</span>
          Flows
        </button>
        <button
          onClick={() => setView('library')}
          className={`flex-1 flex flex-col items-center py-3 text-xs font-medium gap-1 transition-colors
            ${view === 'library' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <span className="text-xl">📚</span>
          Library
        </button>
        <button
          onClick={() => setModal({ mode: 'new', date: '' })}
          className="flex-1 flex flex-col items-center py-3 text-xs font-medium gap-1"
        >
          <span className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl -mt-5 shadow-lg">+</span>
          <span className="text-gray-400">New</span>
        </button>
        <button
          onClick={() => setView('executor')}
          className={`flex-1 flex flex-col items-center py-3 text-xs font-medium gap-1 relative transition-colors
            ${view === 'executor' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <span className="text-xl">🚀</span>
          Queue
          {readyCount > 0 && (
            <span className="absolute top-2 right-6 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {readyCount}
            </span>
          )}
        </button>
      </nav>

      {/* Modals */}
      {(modal?.mode === 'new' || modal?.mode === 'edit') && (
        <CardModal
          card={modal.mode === 'edit' ? modal.card : null}
          defaultDate={modal.mode === 'new' ? modal.date : undefined}
          brands={brands}
          audiences={audiences}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onStash={stashCard}
          onDelete={deleteCard}
        />
      )}
      {modal?.mode === 'detail' && (
        <CardDetail
          card={modal.card}
          brands={brands}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: 'edit', card: modal.card })}
          onStatusChange={updateStatus}
          onStash={stashCard}
          onDelete={deleteCard}
        />
      )}
    </div>
  )
}
