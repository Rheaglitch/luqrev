'use client'

import { useActionState } from 'react'
import { checkPassword } from '@/lib/actions/gate'
import { Heart } from 'lucide-react'

const initialState = { error: '' }

export default function GateForm() {
  const [state, formAction, isPending] = useActionState(checkPassword, initialState)

  return (
    <div className="w-full max-w-sm px-8 py-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 text-center">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center animate-pulse">
          <Heart className="w-8 h-8 text-rose-400 fill-rose-300" />
        </div>
      </div>

      <h1 className="font-playfair text-2xl text-rose-800 mb-2">Halo Sayang 🌸</h1>
      <p className="text-sm text-rose-400 mb-8">Masukkan sandi untuk masuk ya</p>

      <form action={formAction} className="space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Sandi rahasia..."
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300 text-center text-lg tracking-widest"
          required
        />

        {state?.error && (
          <p className="text-rose-500 text-sm animate-bounce">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-rose-400 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
        >
          {isPending ? 'Sebentar...' : 'Masuk 💕'}
        </button>
      </form>
    </div>
  )
}
