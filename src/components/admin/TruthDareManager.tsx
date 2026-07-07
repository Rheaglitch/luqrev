'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  type: 'truth' | 'dare'
  content: string
}

interface Props {
  items: Item[]
}

export default function TruthDareManager({ items }: Props) {
  const [newType, setNewType] = useState<'truth' | 'dare'>('truth')
  const [newContent, setNewContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const truths = items.filter(i => i.type === 'truth')
  const dares  = items.filter(i => i.type === 'dare')

  const handleAdd = async () => {
    if (!newContent.trim()) return
    setAdding(true)
    const supabase = createClient()
    await supabase.from('love_truth_dare').insert({ type: newType, content: newContent.trim() })
    setNewContent('')
    setAdding(false)
    router.refresh()
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus pertanyaan ini?')) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('love_truth_dare').delete().eq('id', id)
      router.refresh()
    })
  }

  const Section = ({ type, list }: { type: 'truth' | 'dare'; list: Item[] }) => (
    <div className={`rounded-2xl border-2 p-4 space-y-2 ${type === 'truth' ? 'border-blue-200' : 'border-pink-200'}`}>
      <h3 className={`font-bold text-sm uppercase tracking-wide ${type === 'truth' ? 'text-blue-600' : 'text-pink-600'}`}>
        {type === 'truth' ? '💙 Truth' : '💕 Dare'} ({list.length})
      </h3>
      {list.length === 0 && (
        <p className="text-xs text-rose-300 italic">Belum ada pertanyaan~</p>
      )}
      {list.map(item => (
        <div key={item.id} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-rose-100">
          <p className="flex-1 text-sm text-rose-700">{item.content}</p>
          <button onClick={() => handleDelete(item.id)} disabled={isPending}
            className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-rose-300 hover:text-rose-500 rounded-lg">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Add new */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-medium text-rose-700">Tambah Pertanyaan Baru</h2>
        <div className="flex gap-2">
          <button onClick={() => setNewType('truth')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${newType === 'truth' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
            💙 Truth
          </button>
          <button onClick={() => setNewType('dare')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${newType === 'dare' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}>
            💕 Dare
          </button>
        </div>
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder={newType === 'truth' ? 'Tulis pertanyaan truth...' : 'Tulis tantangan dare...'}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
        />
        <button onClick={handleAdd} disabled={adding || !newContent.trim()}
          className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          {adding ? 'Menambahkan...' : 'Tambah'}
        </button>
      </div>

      <Section type="truth" list={truths} />
      <Section type="dare"  list={dares}  />
    </div>
  )
}
