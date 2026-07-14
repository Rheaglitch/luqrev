'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { upsertLetter, deleteLetter } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface Letter {
  id: string
  title: string | null
  content: string
  letter_date: string
  to_name?: string | null
  from_name?: string | null
  greeting?: string | null
  stamp1_url?: string | null
  stamp2_url?: string | null
}

interface Stamp {
  id: string
  name: string
  image_url: string
}

interface Props {
  letters: Letter[]
  stamps: Stamp[]
}

export default function LettersManager({ letters, stamps }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [stamp1, setStamp1] = useState('')
  const [stamp2, setStamp2] = useState('')
  const router = useRouter()

  const editingLetter = editId ? letters.find(l => l.id === editId) : null

  const openEdit = (l?: Letter) => {
    setEditId(l?.id ?? null)
    setStamp1(l?.stamp1_url ?? '')
    setStamp2(l?.stamp2_url ?? '')
    setShowForm(true)
  }

  const toggleStamp = (url: string) => {
    if (stamp1 === url) { setStamp1(''); return }
    if (stamp2 === url) { setStamp2(''); return }
    if (!stamp1) { setStamp1(url); return }
    if (!stamp2) { setStamp2(url); return }
    setStamp1(url)
  }

  const handleSubmit = (formData: FormData) => {
    if (editId) formData.set('id', editId)
    formData.set('stamp1_url', stamp1)
    formData.set('stamp2_url', stamp2)
    startTransition(async () => {
      await upsertLetter(formData)
      setShowForm(false)
      setEditId(null)
      router.refresh()
    })
  }

  const inp = 'w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300'

  return (
    <div className="space-y-4">
      <button onClick={() => openEdit()}
        className="flex items-center gap-2 px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-sm transition-colors">
        <Plus className="w-4 h-4" /> Tulis Surat Baru
      </button>

      {showForm && (
        <form action={handleSubmit} className="bg-white rounded-2xl p-5 border border-rose-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-rose-700">{editId ? 'Edit Surat' : 'Surat Baru'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="text-rose-300 hover:text-rose-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-rose-400 mb-1">To (penerima)</label>
              <input name="to_name" defaultValue={editingLetter?.to_name ?? ''} placeholder="Nama penerima" className={inp} />
            </div>
            <div>
              <label className="block text-xs text-rose-400 mb-1">From (pengirim)</label>
              <input name="from_name" defaultValue={editingLetter?.from_name ?? ''} placeholder="Nama pengirim" className={inp} />
            </div>
          </div>

          <input name="title" defaultValue={editingLetter?.title ?? ''} placeholder="Judul surat (opsional)" className={inp} />
          <input name="letter_date" type="date" defaultValue={editingLetter?.letter_date?.split('T')[0] ?? new Date().toISOString().split('T')[0]} required className={inp} />
          <textarea name="content" defaultValue={editingLetter?.content ?? ''} placeholder="Isi surat..." required rows={6}
            className={inp + ' resize-none font-playfair'} />
          <input name="greeting" defaultValue={editingLetter?.greeting ?? ''} placeholder="Teks greeting (opsional, contoh: happy Valentine's Day)" className={inp} />

          {/* Stamp carousel */}
          {stamps.length > 0 && (
            <div>
              <label className="block text-xs text-rose-400 mb-2">Pilih perangko (maks. 2)</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {stamps.map(s => {
                  const sel = stamp1 === s.image_url || stamp2 === s.image_url
                  const selNum = stamp1 === s.image_url ? 1 : stamp2 === s.image_url ? 2 : null
                  return (
                    <button key={s.id} type="button" onClick={() => toggleStamp(s.image_url)}
                      className="relative flex-shrink-0 flex flex-col items-center gap-1 transition-all"
                      style={{ width: 60 }}>
                      <div className="relative rounded-xl overflow-hidden"
                        style={{
                          width: 56, height: 68,
                          border: sel ? '2.5px solid #8b2020' : '1.5px solid #c9a0a0',
                          background: '#fdf6f6',
                          transform: sel ? 'scale(1.05)' : 'scale(1)',
                        }}>
                        <img src={s.image_url} alt={s.name} className="w-full h-full object-contain p-1" />
                        {selNum && (
                          <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                            style={{ background: '#8b2020' }}>
                            {selNum}
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-rose-400 truncate w-full text-center">{s.name}</p>
                    </button>
                  )
                })}
              </div>
              {(stamp1 || stamp2) && (
                <div className="flex gap-2 mt-1">
                  {[stamp1, stamp2].map((url, i) => url && (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-rose-50 text-rose-600">
                      <span>Perangko {i + 1}</span>
                      <button type="button" onClick={() => i === 0 ? setStamp1('') : setStamp2('')}
                        className="text-rose-300 hover:text-rose-500 ml-1">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={isPending}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            {isPending ? 'Menyimpan...' : 'Simpan Surat'}
          </button>
        </form>
      )}

      {/* Letters list */}
      <div className="space-y-2">
        {letters.map(letter => (
          <div key={letter.id} className="bg-white rounded-xl border border-rose-100 p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-rose-700 text-sm truncate">{letter.title || 'A Love Letter'}</p>
              <p className="text-rose-300 text-xs">{new Date(letter.letter_date).toLocaleDateString('id-ID')}</p>
              {(letter.to_name || letter.from_name) && (
                <p className="text-rose-400 text-xs mt-0.5">
                  {letter.from_name && `Dari: ${letter.from_name}`}
                  {letter.from_name && letter.to_name && ' → '}
                  {letter.to_name && `Untuk: ${letter.to_name}`}
                </p>
              )}
              <p className="text-rose-500 text-xs mt-1 line-clamp-1">{letter.content}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {/* Stamp previews */}
              {[letter.stamp1_url, letter.stamp2_url].filter(Boolean).map((s, i) =>
                s && <div key={i} className="w-6 h-7 relative overflow-hidden rounded border border-rose-100">
                  <img src={s} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              <button onClick={() => openEdit(letter)}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                Edit
              </button>
              <button onClick={() => { if (confirm('Hapus surat ini?')) startTransition(() => deleteLetter(letter.id)) }}
                className="w-8 h-8 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
