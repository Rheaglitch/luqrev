'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  label: string
  settingKey: string          // nama field di love_settings, e.g. "header_photo_left1"
  currentUrl: string          // nilai saat ini dari settings
  folder?: string             // subfolder di bucket, default "header"
  onUploaded: (key: string, url: string) => void  // callback setelah upload sukses
}

export default function PhotoUploadField({ label, settingKey, currentUrl, folder = 'header', onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so same file can be re-selected
    e.target.value = ''

    setUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${folder}/${settingKey}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('love-media')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('love-media').getPublicUrl(path)
      setPreview(data.publicUrl)
      onUploaded(settingKey, data.publicUrl)
    } catch (err) {
      console.error(err)
      setError('Upload gagal, coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setPreview('')
    onUploaded(settingKey, '')
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs text-rose-400">{label}</label>

      <div className="flex gap-3 items-start">
        {/* Preview thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-rose-50 border border-rose-100 flex-shrink-0">
          {preview ? (
            <>
              <Image src={preview} alt={label} fill className="object-cover" sizes="64px" />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                aria-label="Hapus foto"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-rose-200">
              <Upload className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Upload button + URL display */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-sm ${
            uploading
              ? 'border-rose-200 bg-rose-50 text-rose-300'
              : 'border-rose-200 bg-white hover:bg-rose-50 text-rose-600'
          }`}>
            {uploading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Mengupload...</>
            ) : (
              <><Upload className="w-3.5 h-3.5" />Pilih foto</>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>

          {/* Hidden input to carry URL in form submit */}
          <input type="hidden" name={settingKey} value={preview} />

          {preview && (
            <p className="text-xs text-rose-300 truncate" title={preview}>
              ✓ Foto tersimpan
            </p>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  )
}
