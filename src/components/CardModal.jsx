import { useState, useRef } from 'react'
import { PLATFORMS, STATUSES } from '../data/constants'
import { CHECKLIST } from './checklist.js'

const EMPTY = {
  title: '', brand_id: '', brand_name: '',
  promote_type: 'product', // 'product' | 'collection'
  collection: '', product_name: '', product_url: '',
  platform: '', audience_name: '', audience_description: '',
  copy: '', hashtags: '', image_data: null,
  notes: '', status: 'draft', date: '', time: '', created_by: '',
}


function getProgress(form) {
  const done = CHECKLIST.filter(c => c.check(form)).length
  return { done, total: CHECKLIST.length, pct: Math.round((done / CHECKLIST.length) * 100) }
}

export default function CardModal({ card, defaultDate, brands, audiences, onSave, onClose, onDelete }) {
  const isEdit = Boolean(card)
  const [form, setForm] = useState(card ? mapCard(card) : { ...EMPTY, date: defaultDate || '' })
  const [tab, setTab] = useState('brief')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const fileRef = useRef()

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function showToast(msg, type = 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

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
      showToast('Platform and Date are required before saving.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch {
      showToast('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const brand = brands.find(b => b.id === form.brand_id)
  const status = STATUSES.find(s => s.id === form.status)
  const { done, total, pct } = getProgress(form)
  const isComplete = done === total

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Toast */}
        {toast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse
            ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px]" style={{ borderColor: brand?.color || '#e0e0e0' }}>
          <div className="flex items-center gap-3">
            {brand && <span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: brand.color }}>{brand.name}</span>}
            <span className="font-semibold text-gray-800 text-lg">{form.title || (isEdit ? 'Edit Card' : 'New Content Card')}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">Content Completeness</span>
            <span className={`text-xs font-bold ${isComplete ? 'text-green-600' : pct >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
              {pct}% — {done}/{total} fields
              {isComplete && ' ✅ Ready'}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: isComplete ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444',
              }}
            />
          </div>
          {/* Checklist pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {CHECKLIST.map(c => {
              const checked = c.check(form)
              return (
                <span key={c.key} className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium
                  ${checked ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {checked ? '✓' : '○'} {c.label}
                </span>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50 mt-2">
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
                <Field label="Brand *">
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

              {/* Collection OR Product toggle */}
              <Field label="Promoting *">
                <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-3">
                  {[['product', '📦 A Product'], ['collection', '🗂️ A Collection']].map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => set('promote_type', val)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors
                        ${form.promote_type === val ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {form.promote_type === 'product' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.product_name} onChange={e => set('product_name', e.target.value)}
                      placeholder="Product / SKU name" className={inp} />
                    <input value={form.product_url} onChange={e => set('product_url', e.target.value)}
                      placeholder="Product URL" className={inp} />
                  </div>
                ) : (
                  <input value={form.collection} onChange={e => set('collection', e.target.value)}
                    placeholder="e.g. Summer 2026, Eid Edit…" className={inp} />
                )}
              </Field>

              {/* Audience */}
              <Field label="Audience (Shopify Segment) *">
                <div className="flex gap-2 mb-2">
                  <select value={form.audience_name} onChange={e => {
                    const aud = audiences.find(a => a.short_name === e.target.value)
                    setForm(f => ({ ...f, audience_name: e.target.value, audience_description: aud?.description || f.audience_description }))
                  }} className={inp + ' flex-1'}>
                    <option value="">Select saved audience…</option>
                    {audiences.map(a => <option key={a.id} value={a.short_name}>{a.short_name}</option>)}
                  </select>
                  <input value={form.audience_name} onChange={e => set('audience_name', e.target.value)}
                    placeholder="or type short name" className={inp + ' flex-1'} />
                </div>
                <textarea value={form.audience_description} onChange={e => set('audience_description', e.target.value)}
                  rows={2} placeholder="Audience description…" className={inp + ' resize-none'} />
              </Field>

              <Field label="Creator Name">
                <input value={form.created_by} onChange={e => set('created_by', e.target.value)} placeholder="Your name" className={inp} />
              </Field>
            </div>
          )}

          {tab === 'creative' && (
            <div className="space-y-4">
              <Field label="Caption / Copy *">
                <textarea value={form.copy} onChange={e => set('copy', e.target.value)} rows={5}
                  placeholder="Write the exact caption to be posted…" className={inp + ' resize-none'} />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.copy?.length || 0} chars</p>
              </Field>
              <Field label="Hashtags">
                <textarea value={form.hashtags} onChange={e => set('hashtags', e.target.value)} rows={2}
                  placeholder="#brand #campaign …" className={inp + ' resize-none'} />
              </Field>
              <Field label="Creative Image / Asset *">
                <div onClick={() => fileRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[140px]
                    ${form.image_data ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}>
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
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                  placeholder="Sizing, link in bio, special instructions…" className={inp + ' resize-none'} />
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div>
            {isEdit && <button onClick={() => { onDelete(card.id); onClose() }} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete Card</button>}
          </div>
          <div className="flex items-center gap-3">
            {!isComplete && (
              <span className="text-xs text-gray-400">{total - done} field{total - done !== 1 ? 's' : ''} missing</span>
            )}
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
    promote_type: c.collection ? 'collection' : 'product',
    collection: c.collection || '', product_name: c.product_name || '', product_url: c.product_url || '',
    platform: c.platform || '', audience_name: c.audience_name || '',
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

function statusIcon(id) {
  return { draft: '✏️', ready: '🚀', scheduled: '🕐', published: '✅' }[id] || ''
}

const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow'
