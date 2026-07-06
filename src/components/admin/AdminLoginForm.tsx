'use client'

import { useActionState } from 'react'
import { Lock } from 'lucide-react'

// useActionState signature: (prevState, payload) => newState
type ActionFn = (prevState: { error: string } | undefined, formData: FormData) => Promise<{ error: string } | undefined>

interface Props {
  action: ActionFn
}

export default function AdminLoginForm({ action }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  return (
    <div className="w-full max-w-sm px-8 py-12 bg-white rounded-3xl shadow-xl border border-rose-100 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
          <Lock className="w-7 h-7 text-rose-400" />
        </div>
      </div>
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Admin Panel</h1>

      <form action={formAction} className="space-y-4 text-left">
        <div>
          <label className="block text-xs text-rose-400 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 text-rose-800"
          />
        </div>
        <div>
          <label className="block text-xs text-rose-400 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 text-rose-800"
          />
        </div>

        {state?.error && (
          <p className="text-rose-500 text-sm text-center">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
        >
          {isPending ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
