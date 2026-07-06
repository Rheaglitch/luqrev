'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { upsertLetter, deleteLetter } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface Letter {
  id: string
  title: string
  content: string
  letter_date: string
}

interface Props {
  letters: Letter[]
}

export default function LettersManager({ letters }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const editingLetter = editId ? letters.find((l) => l.id === editId) : null

  const handleSubmit = async (formData: FormData) => {
    if (editId) formData.set('id', editId)
    startTransition(async () => {
      await upsertLetter(formData)
      setShowForm(false)
      setEditId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <button onClick={() => { setShowForm(true); setEditId(null) }}
        className="flex items-center gap-2 px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-sm transition-colors">
        <Plus className="w-4 h-4" /> Tulis Surat Baru
      </button>

      {(showForm || editId) && (
        <form action={handleSubmit} className="bg-white rounded-2xl p-5 border border-rose-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-rose-700">{editId ? 'Edit Surat' : 'Surat Baru'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="text-rose-300 hover:text-rose-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input name="title" defaultValue={editingLetter?.title ?? ''} placeholder="Judul surat" required
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <input name="letter_date" type="date" defaultValue={editingLetter?.letter_date?.split('T')[0] ?? new Date().toISOString().split('T')[0]} required
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <textarea name="content" defaultValue={editingLetter?.content ?? ''} placeholder="Isi surat..." required rows={10}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none font-playfair" />
          <button type="submit" disabled={isPending}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            {isPending ? 'Menyimpan...' : 'Simpan Surat'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {letters.map((letter) => (
          <div key={letter.id} className="bg-white rounded-xl border border-rose-100 p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-rose-700 text-sm truncate">{letter.title}</p>
              <p className="text-rose-300 text-xs">{new Date(letter.letter_date).toLocaleDateString('id-ID')}</p>
              <p className="text-rose-500 text-xs mt-1 line-clamp-2">{letter.content}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => { setEditId(letter.id); setShowForm(false) }}
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
