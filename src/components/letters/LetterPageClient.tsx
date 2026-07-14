'use client'

import { useState } from 'react'
import { Plus, Mail } from 'lucide-react'
import LoveLetterCard from './LoveLetterCard'
import NewLetterModal from './NewLetterModal'

interface Letter {
  id: string
  title: string
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

export default function LetterPageClient({ letters, stamps }: Props) {
  const [openLetter, setOpenLetter] = useState<Letter | null>(null)
  const [showNew, setShowNew] = useState(false)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-playfair text-3xl text-[#3d0c0c]">Love Letters</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-white text-sm font-medium transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #8b2e2e, #3d0c0c)' }}
        >
          <Plus className="w-4 h-4" /> Tulis Surat
        </button>
      </div>
      <p className="text-[#a06060] mb-8 text-sm">Kata-kata yang tersimpan untukmu 💌</p>

      {/* Letter list */}
      {letters.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">💌</p>
          <p className="font-playfair text-lg text-[#c9a0a0]">Belum ada surat~</p>
          <button onClick={() => setShowNew(true)}
            className="mt-4 px-5 py-2 rounded-full text-white text-sm"
            style={{ background: '#8b2e2e' }}>
            Tulis surat pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {letters.map(letter => (
            <button key={letter.id} onClick={() => setOpenLetter(letter)}
              className="w-full text-left group">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#e8d0d0] bg-white hover:shadow-md transition-all hover:border-[#c9a0a0]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: '#f5e8e8' }}>
                  <Mail className="w-5 h-5 text-[#8b2e2e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair font-medium text-[#3d0c0c] truncate">
                    {letter.title || 'A Love Letter'}
                  </p>
                  <p className="text-xs text-[#a06060]">{formatDate(letter.letter_date)}</p>
                  {(letter.to_name || letter.from_name) && (
                    <p className="text-xs text-[#c9a0a0] mt-0.5">
                      {letter.from_name && `Dari: ${letter.from_name}`}
                      {letter.from_name && letter.to_name && ' → '}
                      {letter.to_name && `Untuk: ${letter.to_name}`}
                    </p>
                  )}
                </div>
                {/* Stamp previews */}
                <div className="flex gap-1 flex-shrink-0">
                  {[letter.stamp1_url, letter.stamp2_url].filter(Boolean).map((s, i) => (
                    s && <div key={i} className="w-6 h-7 relative overflow-hidden rounded-sm border border-[#c9a0a0]">
                      <img src={s} alt="" className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Letter view modal */}
      {openLetter && (
        <LoveLetterCard
          letter={openLetter}
          onClose={() => setOpenLetter(null)}
        />
      )}

      {/* New letter modal */}
      {showNew && (
        <NewLetterModal
          stamps={stamps}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  )
}
