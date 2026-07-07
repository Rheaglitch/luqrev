'use client'

import { useState } from 'react'
import { Music, Loader2, X, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, UploadError } from '@/lib/upload'

interface Props {
  currentUrl: string
  onUploaded: (url: string) => void
}

export default function MusicUploadField({ currentUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(currentUrl || '')
  const [error, setError] = useState('')
  const [filename, setFilename] = useState(
    currentUrl ? decodeURIComponent(currentUrl.split('/').pop() ?? '') : ''
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!file.type.includes('audio') && !file.name.endsWith('.mp3') && !file.name.endsWith('.m4a')) {
      setError('Hanya file audio (MP3, M4A) yang didukung.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const path = `music/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const publicUrl = await uploadFile(file, path, { upsert: true })
      setUrl(publicUrl)
      setFilename(file.name)
      onUploaded(publicUrl)
    } catch (err) {
      setError(err instanceof UploadError ? err.message : 'Upload gagal.')
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setUrl('')
    setFilename('')
    onUploaded('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs text-rose-400">File MP3</label>

      {url ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-green-700 font-medium truncate">{filename || 'Lagu tersimpan'}</p>
            <p className="text-xs text-green-500">✓ Siap diputar</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="w-6 h-6 flex items-center justify-center text-green-400 hover:text-red-500 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
        uploading
          ? 'border-rose-200 bg-rose-50 text-rose-300'
          : 'border-rose-200 bg-white hover:bg-rose-50 text-rose-600 border-dashed hover:border-rose-400'
      }`}>
        {uploading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Mengupload MP3...</span></>
        ) : (
          <><Music className="w-4 h-4" /><span className="text-sm">{url ? 'Ganti file MP3' : 'Upload file MP3'}</span></>
        )}
        <input
          type="file"
          accept="audio/mpeg,audio/mp3,audio/m4a,.mp3,.m4a"
          className="sr-only"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
