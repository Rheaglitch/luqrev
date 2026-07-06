'use client'

import { useActionState } from 'react'

type ActionFn = (prevState: { success?: boolean } | undefined, formData: FormData) => Promise<{ success?: boolean } | undefined>

interface Props {
  settings: Record<string, string>
  action: ActionFn
}

export default function AdminSettingsForm({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  const field = (name: string, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-rose-400 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={settings[name] ?? ''}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 text-rose-800 text-sm"
      />
    </div>
  )

  return (
    <form action={formAction} className="space-y-6">
      {/* Password gate */}
      <section className="bg-white rounded-2xl p-5 border border-rose-100 space-y-4">
        <h2 className="font-medium text-rose-700">Sandi Pintu Masuk</h2>
        {field('gate_password', 'Sandi (teks biasa)', 'text', 'Contoh: sayangku123')}
        <p className="text-xs text-rose-300">Sandi ini yang harus dimasukkan pengunjung untuk mengakses web.</p>
      </section>

      {/* Names & dates */}
      <section className="bg-white rounded-2xl p-5 border border-rose-100 space-y-4">
        <h2 className="font-medium text-rose-700">Header & Nama</h2>
        {field('partner1_name', 'Nama Pasangan 1', 'text', 'Kamu')}
        {field('partner2_name', 'Nama Pasangan 2', 'text', 'Aku')}
        {field('relationship_start', 'Tanggal Mulai Pacaran', 'date')}
        {field('next_event_date', 'Tanggal Event Berikutnya', 'date')}
        {field('next_event_label', 'Label Event (contoh: Ultah kamu 🎂)', 'text', 'Ultah kamu')}
      </section>

      {state?.success && (
        <p className="text-green-600 text-sm text-center">Tersimpan! ✅</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
      >
        {isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </form>
  )
}
