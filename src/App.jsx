import { useState } from 'react'
import { useCards, useBrands, useAudiences } from './data/store'
import CalendarView from './components/CalendarView'
import ExecutorView from './components/ExecutorView'
import Sidebar from './components/Sidebar'
import CardModal from './components/CardModal'
import CardDetail from './components/CardDetail'

export default function App() {
  const { cards, loading, error, addCard, updateCard, updateStatus, moveCard, deleteCard } = useCards()
  const { brands, addBrand } = useBrands()
  const { audiences, addAudience } = useAudiences()

  // modal: null | { mode: 'new', date } | { mode: 'edit', card } | { mode: 'detail', card }
  const [modal, setModal] = useState(null)
  const [filters, setFilters] = useState({ brand: '', platform: '', status: '' })
  const [view, setView] = useState('calendar')

  function handleCardClick(card) {
    // Draft cards go to edit; everything else goes to read-only detail
    if (card.status === 'draft') {
      setModal({ mode: 'edit', card })
    } else {
      setModal({ mode: 'detail', card })
    }
  }

  function handleFilterChange(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  function clearFilters() {
    setFilters({ brand: '', platform: '', status: '' })
  }

  async function handleSave(form) {
    if (modal.mode === 'new') await addCard(form)
    else await updateCard(modal.card.id, form)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f2f5' }}>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📆</span>
          <div>
            <h1 className="font-bold text-gray-900 text-base">Content Calendar</h1>
            <p className="text-xs text-gray-400">Multi-brand campaign planner</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">⚠ API offline — connect Railway DB</span>}
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
          <span className="text-xs text-gray-400">{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
          <button onClick={() => setModal({ mode: 'new', date: '' })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
            + New Card
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 shrink-0 bg-white border-r border-gray-100 overflow-y-auto p-4">
          <Sidebar
            cards={cards}
            brands={brands}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            activeView={view}
            onViewChange={setView}
            onAddBrand={addBrand}
          />
        </div>

        {/* Main */}
        <main className="flex-1 overflow-auto p-5">
          {view === 'calendar' && (
            <CalendarView
              cards={cards}
              brands={brands}
              filters={filters}
              onDayClick={date => setModal({ mode: 'new', date })}
              onCardClick={handleCardClick}
              onCardDrop={moveCard}
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

      {/* Edit modal — drafts only */}
      {modal?.mode === 'new' && (
        <CardModal
          card={null}
          defaultDate={modal.date}
          brands={brands}
          audiences={audiences}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onDelete={deleteCard}
        />
      )}
      {modal?.mode === 'edit' && (
        <CardModal
          card={modal.card}
          brands={brands}
          audiences={audiences}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onDelete={deleteCard}
        />
      )}

      {/* Read-only detail — ready/scheduled/published */}
      {modal?.mode === 'detail' && (
        <CardDetail
          card={modal.card}
          brands={brands}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: 'edit', card: modal.card })}
          onStatusChange={updateStatus}
          onDelete={deleteCard}
        />
      )}
    </div>
  )
}
