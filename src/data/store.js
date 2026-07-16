import { useState, useEffect, useCallback } from 'react'
import { api } from './api.js'

export function useCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.cards.list()
      setCards(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCards() }, [fetchCards])

  async function addCard(card) {
    const created = await api.cards.create(card)
    setCards(prev => [...prev, created])
    return created
  }

  async function updateCard(id, updates) {
    const updated = await api.cards.update(id, updates)
    setCards(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }

  async function updateStatus(id, status) {
    const updated = await api.cards.updateStatus(id, status)
    setCards(prev => prev.map(c => c.id === id ? updated : c))
  }

  async function moveCard(id, date) {
    const updated = await api.cards.updateDate(id, date)
    setCards(prev => prev.map(c => c.id === id ? updated : c))
  }

  async function stashCard(id, stashed) {
    const updated = await api.cards.stash(id, stashed)
    setCards(prev => prev.map(c => c.id === id ? updated : c))
  }

  async function deleteCard(id) {
    await api.cards.delete(id)
    setCards(prev => prev.filter(c => c.id !== id))
  }

  return { cards, loading, error, addCard, updateCard, updateStatus, moveCard, stashCard, deleteCard, refetch: fetchCards }
}

export function useBrands() {
  const [brands, setBrands] = useState([])

  useEffect(() => {
    api.brands.list().then(setBrands).catch(() => {})
  }, [])

  async function addBrand(data) {
    const b = await api.brands.create(data)
    setBrands(prev => [...prev, b].sort((a, b) => a.name.localeCompare(b.name)))
    return b
  }

  async function deleteBrand(id) {
    await api.brands.delete(id)
    setBrands(prev => prev.filter(b => b.id !== id))
  }

  return { brands, addBrand, deleteBrand }
}

export function useAudiences() {
  const [audiences, setAudiences] = useState([])

  useEffect(() => {
    api.audiences.list().then(setAudiences).catch(() => {})
  }, [])

  async function addAudience(data) {
    const a = await api.audiences.create(data)
    setAudiences(prev => {
      const filtered = prev.filter(x => x.short_name !== a.short_name)
      return [...filtered, a].sort((x, y) => x.short_name.localeCompare(y.short_name))
    })
    return a
  }

  async function deleteAudience(id) {
    await api.audiences.delete(id)
    setAudiences(prev => prev.filter(a => a.id !== id))
  }

  return { audiences, addAudience, deleteAudience }
}
