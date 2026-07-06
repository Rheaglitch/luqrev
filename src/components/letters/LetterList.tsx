'use client'

import { useState } from 'react'
import { Mail, ChevronDown, ChevronUp } from 'lucide-react'

interface Letter {
  id: string
  title: string
  content: string
  letter_date: string
}

interface Props {
  letters: Letter[]
}

export default function LetterList({ letters }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (letters.length === 0) {
    return <p className="text-center text-rose-300 py-20 font-playfair text-lg">Belum ada surat~ ✉️</p>
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {letters.map((letter) => {
        const isOpen = openId === letter.id
        return (
          <div
            key={letter.id}
            className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${isOpen ? 'border-rose-300 shadow-md' : 'border-rose-100'}`}
          >
            {/* Envelope header */}
            <button
              className="w-full p-5 flex items-center gap-4 text-left"
              onClick={() => setOpenId(isOpen ? null : letter.id)}
              aria-expanded={isOpen}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-rose-400' : 'bg-rose-100'}`}>
                <Mail className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-rose-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-playfair text-rose-800 text-lg">{letter.title}</h3>
                <p className="text-rose-300 text-sm">{formatDate(letter.letter_date)}</p>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-rose-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-rose-300 flex-shrink-0" />
              )}
            </button>

            {/* Letter content */}
            {isOpen && (
              <div className="px-6 pb-6">
                <div className="border-t border-rose-100 pt-4">
                  <div className="bg-rose-50 rounded-xl p-5 font-playfair text-rose-700 leading-relaxed whitespace-pre-wrap text-base">
                    {letter.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
