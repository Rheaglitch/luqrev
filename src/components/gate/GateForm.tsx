'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import type { ThemeColor } from '@/lib/theme'
import { THEME_TOKENS } from '@/lib/theme'

interface Props {
  theme: ThemeColor
}

const PIN_LENGTH = 6

export default function GateForm({ theme }: Props) {
  const t = THEME_TOKENS[theme]

  const [digits, setDigits] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const submit = useCallback(async (pin: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pin }),
      })
      const data = await res.json()
      if (data.ok) {
        window.location.href = '/'
      } else {
        setDigits([])
        setError(data.message ?? 'Salah sandi!')
        setShake(true)
        setTimeout(() => setShake(false), 600)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const press = useCallback((digit: string) => {
    if (loading) return
    setError(null)
    setDigits((prev) => {
      if (prev.length >= PIN_LENGTH) return prev
      const next = [...prev, digit]
      if (next.length === PIN_LENGTH) {
        // auto-submit after state updates
        setTimeout(() => submit(next.join('')), 0)
      }
      return next
    })
  }, [loading, submit])

  const backspace = useCallback(() => {
    if (loading) return
    setDigits((prev) => prev.slice(0, -1))
  }, [loading])

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') press(e.key)
      else if (e.key === 'Backspace') backspace()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [press, backspace])

  const numpadKeys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div className={`w-full max-w-xs px-8 py-10 ${t.bgCard} backdrop-blur-sm rounded-3xl shadow-xl border ${t.border} text-center`}>
      {/* Icon */}
      <div className="flex justify-center mb-5">
        <div className={`w-14 h-14 ${t.bgMuted} rounded-full flex items-center justify-center animate-pulse`}>
          <Heart className={`w-7 h-7 ${t.text} fill-current opacity-70`} />
        </div>
      </div>

      <h1 className={`font-playfair text-2xl ${t.textHeading} mb-1`}>Halo Sayang 🌸</h1>
      <p className={`text-sm ${t.textMuted} mb-6`}>Masukkan sandi ya~</p>

      {/* PIN dots */}
      <div className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-150 ${
              i < digits.length
                ? `${t.dot} border-transparent scale-110`
                : `border-current ${t.textMuted} opacity-40`
            }`}
          />
        ))}
      </div>

      {/* Error popup */}
      {error && (
        <div className={`mb-4 px-4 py-2.5 rounded-2xl ${t.bgMuted} border ${t.border}`}>
          <p className={`text-sm font-medium ${t.textHeading}`}>
            {error}
          </p>
        </div>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2.5">
        {numpadKeys.map((key, i) => {
          if (key === '') return <div key={i} />

          if (key === '⌫') {
            return (
              <button
                key={i}
                onClick={backspace}
                disabled={loading || digits.length === 0}
                aria-label="Hapus"
                className={`h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 ${t.numpad} disabled:opacity-30`}
              >
                ⌫
              </button>
            )
          }

          return (
            <button
              key={i}
              onClick={() => press(key)}
              disabled={loading || digits.length >= PIN_LENGTH}
              className={`h-14 rounded-2xl text-xl font-bold transition-all active:scale-95 disabled:opacity-50 ${t.numpad}`}
            >
              {key}
            </button>
          )
        })}
      </div>

      {loading && (
        <p className={`mt-4 text-sm ${t.textMuted} animate-pulse`}>Sebentar...</p>
      )}
    </div>
  )
}
