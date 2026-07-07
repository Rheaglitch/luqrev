'use client'

import { useActionState, useState } from 'react'
import PhotoUploadField from './PhotoUploadField'

type ActionFn = (prevState: { success?: boolean } | undefined, formData: FormData) => Promise<{ success?: boolean } | undefined>

interface Props {
  settings: Record<string, string>
  action: ActionFn
}

export default function AdminSettingsForm({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined)

  // Track uploaded photo URLs (overrides initial settings on upload)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({
    header_photo_left1:  settings.header_photo_left1  ?? '',
    header_photo_left2:  settings.header_photo_left2  ?? '',
    header_photo_right1: settings.header_photo_right1 ?? '',
    header_photo_right2: settings.header_photo_right2 ?? '',
  })

  const handleUploaded = (key: string, url: string) => {
    setPhotoUrls(prev => ({ ...prev, [key]: url }))
  }

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

  const themeSection = (
    color: 'blue' | 'red' | 'pink',
    label: string,
    emoji: string,
    colorClass: string
  ) => (
    <div className={`rounded-2xl p-4 border-2 ${colorClass} space-y-3`}>
      <h3 className="font-medium text-sm">{emoji} Tema {label}</h3>
      <div>
        <label className="block text-xs opacity-60 mb-1">Tanggal (MM-DD, contoh: 3-15 untuk 15 Maret)</label>
        <input
          type="text"
          name={`theme_event_${color}_date`}
          defaultValue={settings[`theme_event_${color}_date`] ?? ''}
          placeholder="contoh: 3-15"
          className="w-full px-3 py-2 rounded-xl border bg-white/80 focus:outline-none focus:ring-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs opacity-60 mb-1">Nama event</label>
        <input
          type="text"
          name={`theme_event_${color}_label`}
          defaultValue={settings[`theme_event_${color}_label`] ?? ''}
          placeholder="contoh: Anniversary"
          className="w-full px-3 py-2 rounded-xl border bg-white/80 focus:outline-none focus:ring-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs opacity-60 mb-1">Deskripsi (opsional)</label>
        <input
          type="text"
          name={`theme_event_${color}_desc`}
          defaultValue={settings[`theme_event_${color}_desc`] ?? ''}
          placeholder="keterangan singkat..."
          className="w-full px-3 py-2 rounded-xl border bg-white/80 focus:outline-none focus:ring-2 text-sm"
        />
      </div>
    </div>
  )

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields for photo URLs — updated by PhotoUploadField via onUploaded */}
      {Object.entries(photoUrls).map(([key, val]) => (
        <input key={key} type="hidden" name={key} value={val} />
      ))}

      {/* Password gate */}
      <section className="bg-white rounded-2xl p-5 border border-rose-100 space-y-4">
        <h2 className="font-medium text-rose-700">Sandi Pintu Masuk</h2>
        {field('gate_password', 'Sandi (angka 6 digit)', 'text', 'contoh: 150326')}
        <p className="text-xs text-rose-300">Pengunjung akan mengetik angka ini di numpad.</p>
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

      {/* Header template */}
      <section className="bg-white rounded-2xl p-5 border border-rose-100 space-y-5">
        <h2 className="font-medium text-rose-700">Header</h2>
        {field('header_title',        'Judul (contoh: Best Couple)', 'text', 'Best Couple')}
        {field('header_quote_bottom', 'Quote bawah', 'text', 'Two people who met because of fate...')}

        <div className="border-t border-rose-100 pt-4 space-y-4">
          <p className="text-xs font-medium text-rose-500">📸 Foto kiri (kolase bertumpuk)</p>
          <PhotoUploadField
            label="Foto kiri atas"
            settingKey="header_photo_left1"
            currentUrl={photoUrls.header_photo_left1}
            folder="header"
            onUploaded={handleUploaded}
          />
          <PhotoUploadField
            label="Foto kiri bawah"
            settingKey="header_photo_left2"
            currentUrl={photoUrls.header_photo_left2}
            folder="header"
            onUploaded={handleUploaded}
          />
        </div>

        <div className="border-t border-rose-100 pt-4 space-y-4">
          <p className="text-xs font-medium text-rose-500">🪪 Foto kanan (polaroid per orang)</p>
          <PhotoUploadField
            label={`Foto ${settings.partner1_name ?? 'Orang 1'}`}
            settingKey="header_photo_right1"
            currentUrl={photoUrls.header_photo_right1}
            folder="header"
            onUploaded={handleUploaded}
          />
          <PhotoUploadField
            label={`Foto ${settings.partner2_name ?? 'Orang 2'}`}
            settingKey="header_photo_right2"
            currentUrl={photoUrls.header_photo_right2}
            folder="header"
            onUploaded={handleUploaded}
          />
        </div>
      </section>

      {/* Theme events */}
      <section className="bg-white rounded-2xl p-5 border border-rose-100 space-y-4">
        <h2 className="font-medium text-rose-700">Tema Warna</h2>
        <p className="text-xs text-rose-400">
          Web akan otomatis ganti warna sesuai event yang paling dekat dengan hari ini.
        </p>
        {themeSection('blue',  'Biru',  '💙', 'border-blue-200 text-blue-700')}
        {themeSection('red',   'Merah', '❤️', 'border-red-200 text-red-700')}
        {themeSection('pink',  'Pink',  '🩷', 'border-pink-200 text-pink-700')}
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
