import { useState, useRef } from 'react'
import { PLATFORMS, STATUSES, POST_TYPES } from '../data/constants'

const EMPTY = {
  title: '', brand_id: '', brand_name: '', collection: '',
  product_name: '', product_url: '', platform: '', post_type: '',
  audience_name: '', audience_description: '', copy: '', hashtags: '',
  image_data: null, notes: '', status: 'draft', date: '', time: '', created_by: '',
}

export default function CardModal({ card, defaultDate, brands, audiences, onSave, onClose, onDelete }) {
  const isEdit = Boolean(card)
  const [form, setForm] = useState(card ? mapCard(card) : { ...EMPTY, date: defaultDate || '' })
  const [tab, setTab] = useState('brief')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleBrandChange(id) {
    const brand = brands.find(b => b.id === id)
    setForm(f => ({ ...f, brand_id: id, brand_name: brand?.name || '' }))
  }

  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('image_data', ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!form.platform || !form.date) {
      alert('Platform and Date are required.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const brand = brands.find(b => b.id === form.brand_id)
  const status = STATUSES.find(s => s.id === form.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px]" style={{ borderColor: brand?.color || '#e0e0e0' }}>
          <div className="flex items-center gap-3">
            {brand && <span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: brand.color }}>{brand.name}</span>}
            <span className="font-semibold text-gray-800 text-lg">{form.title || (isEdit ? 'Edit Card' : 'New Content Card')}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {[['brief', '📋 Brief'], ['creative', '🎨 Creative'], ['schedule', '📅 Schedule']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${tab === id ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'brief' && (
            <div className="space-y-4">
              <Field label="Card Title">
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. ST London Lip Kit — Eid Campaign" className={inp} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand">
                  <select value={form.brand_id} onChange={e => handleBrandChange(e.target.value)} className={inp}>
                    <option value="">Select brand…</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Platform *">
                  <select value={form.platform} onChange={e => set('platform', e.target.value)} className={inp}>
                    <option value="">Select platform…</option>
                    {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Post Type">
                  <select value={form.post_type} onChange={e => set('post_type', e.target.value)} className={inp}>
                    <option value="">Select type…</option>
                    {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Collection">
                  <input value={form.collection} onChange={e => set('collection', e.target.value)} placeholder="e.g. Summer 2026" className={inp} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Product / SKU Name">
                  <input value={form.product_name} onChange={e => set('product_name', e.target.value)} placeholder="e.g. Matte Me Liquid Lip" className={inp} />
                </Field>
                <Field label="Product URL">
                  <input value={form.product_url} onChange={e => set('product_url', e.target.value)} placeholder="https://…" className={inp} />
                </Field>
              </div>

              {/* Audience */}
              <Field label="Audience (Shopify Segment)">
                <div className="flex gap-2">
                  <select value={form.audience_name} onChange={e => {
                    const aud = audiences.find(a => a.short_name === e.target.value)
                    setForm(f => ({ ...f, audience_name: e.target.value, audience_description: aud?.description || f.audience_description }))
                  }} className={inp + ' flex-1'}>
                    <option value="">Select saved audience…</option>
                    {audiences.map(a => <option key={a.id} value={a.short_name}>{a.short_name}</option>)}
                  </select>
                  <input value={form.audience_name} onChange={e => set('audience_name', e.target.value)} placeholder="or type short name" className={inp + ' flex-1'} />
                </div>
                <textarea value={form.audience_description} onChange={e => set('audience_description', e.target.value)} rows={2} placeholder="Audience description…" className={inp + ' resize-none mt-2'} />
              </Field>

              <Field label="Creator Name">
                <input value={form.created_by} onChange={e => set('created_by', e.target.value)} placeholder="Your name" className={inp} />
              </Field>
            </div>
          )}

          {tab === 'creative' && (
            <div className="space-y-4">
              <Field label="Caption / Copy">
                <textarea value={form.copy} onChange={e => set('copy', e.target.value)} rows={5} placeholder="Write the exact caption to be posted…" className={inp + ' resize-none'} />
              </Field>
              <Field label="Hashtags">
                <textarea value={form.hashtags} onChange={e => set('hashtags', e.target.value)} rows={2} placeholder="#brand #campaign …" className={inp + ' resize-none'} />
              </Field>
              <Field label="Creative Image / Asset">
                <div onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors flex flex-col items-center justify-center min-h-[140px]">
                  {form.image_data ? (
                    <div className="relative w-full">
                      <img src={form.image_data} alt="Creative" className="rounded-lg max-h-48 mx-auto object-contain" />
                      <button onClick={e => { e.stopPropagation(); set('image_data', null) }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">×</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl mb-2">🖼️</span>
                      <span className="text-sm text-gray-500">Click to upload creative image</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF</span>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </Field>
              <Field label="Notes for Executor">
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Sizing, link in bio, special instructions…" className={inp + ' resize-none'} />
              </Field>
            </div>
          )}

          {tab === 'schedule' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Post Date *">
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inp} />
                </Field>
                <Field label="Post Time">
                  <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inp} />
                </Field>
              </div>
              <Field label="Status">
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map(s => (
                    <button key={s.id} onClick={() => set('status', s.id)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium border-2 transition-all text-left"
                      style={{ borderColor: form.status === s.id ? s.color : 'transparent', backgroundColor: form.status === s.id ? s.bg : '#f5f5f5', color: form.status === s.id ? s.color : '#666' }}>
                      {statusIcon(s.id)} {s.name}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Summary */}
              <div className="rounded-xl p-4 bg-gray-50 border border-gray-200 mt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Card Summary</p>
                <div className="space-y-1.5 text-sm">
                  <Row label="Brand" value={brand?.name} />
                  <Row label="Platform" value={PLATFORMS.find(p => p.id === form.platform)?.name} />
                  <Row label="Collection" value={form.collection} />
                  <Row label="Product" value={form.product_name} />
                  <Row label="Audience" value={form.audience_name} />
                  <Row label="Date" value={form.date ? `${form.date}${form.time ? ' @ ' + form.time : ''}` : ''} />
                  <Row label="Status" value={status?.name} color={status?.color} />
                  <Row label="Copy" value={form.copy ? '✅ Ready' : '❌ Missing'} />
                  <Row label="Creative" value={form.image_data ? '✅ Uploaded' : '❌ Missing'} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div>
            {isEdit && <button onClick={() => { onDelete(card.id); onClose() }} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete Card</button>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 font-medium">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: brand?.color || '#1976d2' }}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add to Calendar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function mapCard(c) {
  return {
    title: c.title || '', brand_id: c.brand_id || '', brand_name: c.brand_name || '',
    collection: c.collection || '', product_name: c.product_name || '', product_url: c.product_url || '',
    platform: c.platform || '', post_type: c.post_type || '', audience_name: c.audience_name || '',
    audience_description: c.audience_description || '', copy: c.copy || '', hashtags: c.hashtags || '',
    image_data: c.image_data || null, notes: c.notes || '', status: c.status || 'draft',
    date: c.date ? c.date.slice(0, 10) : '', time: c.time ? c.time.slice(0, 5) : '',
    created_by: c.created_by || '',
  }
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Row({ label, value, color }) {
  if (!value) return null
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-24 shrink-0">{label}:</span>
      <span className="font-medium" style={{ color: color || '#1a1a2e' }}>{value}</span>
    </div>
  )
}

function statusIcon(id) {
  return { draft: '✏️', ready: '🚀', scheduled: '🕐', published: '✅' }[id] || ''
}

const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow'
