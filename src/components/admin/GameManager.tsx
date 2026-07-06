'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { upsertQuizQuestion, deleteQuizQuestion } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  question: string
  answer: string
  options: string[]
}

interface Props {
  questions: Question[]
}

export default function GameManager({ questions }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [options, setOptions] = useState<string[]>(['', '', '', ''])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const editingQ = editId ? questions.find((q) => q.id === editId) : null

  const openForm = (q?: Question) => {
    setEditId(q?.id ?? null)
    setOptions(q?.options ?? ['', '', '', ''])
    setShowForm(true)
  }

  const handleSubmit = (formData: FormData) => {
    formData.set('options', JSON.stringify(options.filter(Boolean)))
    if (editId) formData.set('id', editId)
    startTransition(async () => {
      await upsertQuizQuestion(formData)
      setShowForm(false)
      setEditId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <button onClick={() => openForm()}
        className="flex items-center gap-2 px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-sm transition-colors">
        <Plus className="w-4 h-4" /> Tambah Pertanyaan
      </button>

      {showForm && (
        <form action={handleSubmit} className="bg-white rounded-2xl p-5 border border-rose-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-rose-700">{editId ? 'Edit Pertanyaan' : 'Pertanyaan Baru'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-rose-300 hover:text-rose-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input name="question" defaultValue={editingQ?.question ?? ''} placeholder="Pertanyaannya apa?" required
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <input name="answer" defaultValue={editingQ?.answer ?? ''} placeholder="Jawaban yang benar" required
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <div className="space-y-2">
            <label className="text-xs text-rose-400">Pilihan jawaban (minimal 2)</label>
            {options.map((opt, i) => (
              <input key={i} value={opt} onChange={(e) => setOptions(opts => opts.map((o, j) => j === i ? e.target.value : o))}
                placeholder={`Pilihan ${i + 1}`}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            ))}
          </div>
          <button type="submit" disabled={isPending}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl border border-rose-100 p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-rose-700 text-sm">{q.question}</p>
              <p className="text-green-600 text-xs mt-1">✅ {q.answer}</p>
              <p className="text-rose-300 text-xs">{q.options.join(' · ')}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openForm(q)} className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Edit</button>
              <button onClick={() => { if (confirm('Hapus?')) startTransition(() => deleteQuizQuestion(q.id)) }}
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
