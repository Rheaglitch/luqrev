'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Stamp {
  id: string
  name: string
  image_url: string
}

interface Props {
  stamps: Stamp[]
  onClose: () => void
}

export default function NewLetterModal({ stamps, onClose }: Props) {
  const [form, setForm] = useState({
    title: '', content: '', letter_date: new Date().toISOString().split('T')[0],
    to_name: '', from_name: '', greeting: '',
    stamp1_url: '', stamp2_url: '',
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const toggleStamp = (url: string) => {
    if (form.stamp1_url === url) { set('stamp1_url', ''); return }
    if (form.stamp2_url === url) { set('stamp2_url', ''); return }
    if (!form.stamp1_url) { set('stamp1_url', url); return }
    if (!form.stamp2_url) { set('stamp2_url', url); return }
    // Both filled — replace first
    set('stamp1_url', url)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('love_letters').insert({
        title:       form.title.trim()       || null,
        content:     form.content.trim()     || '',
        letter_date: form.letter_date        || new Date().toISOString().split('T')[0],
        to_name:     form.to_name.trim()     || null,
        from_name:   form.from_name.trim()   || null,
        greeting:    form.greeting.trim()    || null,
        stamp1_url:  form.stamp1_url         || null,
        stamp2_url:  form.stamp2_url         || null,
      })
      router.refresh()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full px-3 py-2 rounded-xl border border-[#e8d0d0] bg-white/80 text-[#6b2020] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a0a0]'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: '#fdf6f6', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8d0d0]">
          <h2 className="font-playfair text-lg font-bold text-[#3d0c0c]">Tulis Love Letter</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#a06060] hover:bg-[#f5e8e8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* To / From */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#a06060] mb-1">To (penerima)</label>
              <input className={inp} placeholder="Nama penerima" value={form.to_name} onChange={e => set('to_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[#a06060] mb-1">From (pengirim)</label>
              <input className={inp} placeholder="Nama pengirim" value={form.from_name} onChange={e => set('from_name', e.target.value)} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-[#a06060] mb-1">Judul surat</label>
            <input className={inp} placeholder="contoh: My Love, Olivia" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs text-[#a06060] mb-1">Isi surat</label>
            <textarea className={inp + ' resize-none'} rows={5} placeholder="Tulis isi suratmu di sini..." value={form.content} onChange={e => set('content', e.target.value)} />
          </div>

          {/* Greeting */}
          <div>
            <label className="block text-xs text-[#a06060] mb-1">Teks greeting (opsional)</label>
            <input className={inp} placeholder="contoh: happy Valentine's Day" value={form.greeting} onChange={e => set('greeting', e.target.value)} />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs text-[#a06060] mb-1">Tanggal</label>
            <input type="date" className={inp} value={form.letter_date} onChange={e => set('letter_date', e.target.value)} />
          </div>

          {/* Stamp picker — carousel */}
          {stamps.length > 0 && (
            <div>
              <label className="block text-xs text-[#a06060] mb-2">
                Pilih perangko (maks. 2) — geser untuk lihat semua
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {stamps.map(s => {
                  const sel = form.stamp1_url === s.image_url || form.stamp2_url === s.image_url
                  const selNum = form.stamp1_url === s.image_url ? 1 : form.stamp2_url === s.image_url ? 2 : null
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStamp(s.image_url)}
                      className="relative flex-shrink-0 flex flex-col items-center gap-1 transition-all"
                      style={{ width: 64 }}
                    >
                      <div
                        className="relative rounded-xl overflow-hidden transition-all"
                        style={{
                          width: 60, height: 72,
                          border: sel ? '2.5px solid #8b2020' : '1.5px solid #c9a0a0',
                          background: '#fdf6f6',
                          transform: sel ? 'scale(1.05)' : 'scale(1)',
                          backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIElEQVQoU2NkYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==")',
                        }}
                      >
                        <img src={s.image_url} alt={s.name} className="w-full h-full object-contain p-1" />
                        {/* Selection badge */}
                        {selNum && (
                          <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                            style={{ background: '#8b2020' }}>
                            {selNum}
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-[#a06060] text-center truncate w-full">{s.name}</p>
                    </button>
                  )
                })}
              </div>
              {(form.stamp1_url || form.stamp2_url) && (
                <div className="flex gap-2 mt-1.5">
                  {[form.stamp1_url, form.stamp2_url].map((url, i) => url && (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                      style={{ background: '#f5e8e8', color: '#6b2020' }}>
                      <span>Perangko {i + 1}</span>
                      <button type="button" onClick={() => {
                        if (i === 0) setForm(f => ({ ...f, stamp1_url: '' }))
                        else setForm(f => ({ ...f, stamp2_url: '' }))
                      }} className="text-[#c9a0a0] hover:text-[#8b2020] ml-1">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-2xl text-white font-semibold transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #8b2e2e, #3d0c0c)' }}>
            {saving ? 'Menyimpan...' : '✉️ Simpan Surat'}
          </button>
        </div>
      </div>
    </div>
  )
}
