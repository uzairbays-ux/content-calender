const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  cards: {
    list: (params = {}) => {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()
      return request(`/cards${qs ? '?' + qs : ''}`)
    },
    create: (data) => request('/cards', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id, status) => request(`/cards/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    updateDate: (id, date) => request(`/cards/${id}/date`, { method: 'PATCH', body: JSON.stringify({ date }) }),
    stash: (id, stashed) => request(`/cards/${id}/stash`, { method: 'PATCH', body: JSON.stringify({ stashed }) }),
    delete: (id) => request(`/cards/${id}`, { method: 'DELETE' }),
  },
  brands: {
    list: () => request('/brands'),
    create: (data) => request('/brands', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/brands/${id}`, { method: 'DELETE' }),
  },
  audiences: {
    list: () => request('/audiences'),
    create: (data) => request('/audiences', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/audiences/${id}`, { method: 'DELETE' }),
  },
}
