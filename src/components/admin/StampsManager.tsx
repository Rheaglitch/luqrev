'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Upload, Loader2, Trash2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Stamp {
  id: string
  name: string
  image_url: string
}

interface Props {
  stamps: Stamp[]
}

export default function StampsManager({ stamps }: Props) {
  const [uploading, setUploading] = useState(false)
  const [removingBg, setRemovingBg] = useState(false)
  const [stampName, setStampName] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)

    try {
      let finalBlob: Blob = file

      // Auto remove background via our API
      setRemovingBg(true)
      try {
        const form = new FormData()
        form.append('image', file)
        const res = await fetch('/api/remove-bg', { method: 'POST', body: form })
        if (res.ok) {
          finalBlob = await res.blob()
        }
      } catch {
        // fallback to original if remove.bg fails
        console.warn('remove.bg failed, using original image')
      } finally {
        setRemovingBg(false)
      }

      const supabase = createClient()
      const path = `stamps/${Date.now()}-${file.name.replace(/\s+/g, '-').replace(/\.[^.]+$/, '')}.png`
      const { error } = await supabase.storage
        .from('love-media')
        .upload(path, finalBlob, { contentType: 'image/png', upsert: true })

      if (error) throw error

      const { data: urlData } = supabase.storage.from('love-media').getPublicUrl(path)
      await supabase.from('love_stamps').insert({
        name: stampName.trim() || file.name.replace(/\.[^.]+$/, ''),
        image_url: urlData.publicUrl,
      })

      setStampName('')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Upload perangko gagal.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus perangko ini?')) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('love_stamps').delete().eq('id', id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload new stamp */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-medium text-rose-700">Upload Perangko Baru</h2>
        <input
          type="text"
          placeholder="Nama perangko (opsional)"
          value={stampName}
          onChange={e => setStampName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />

        <label className={`flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading ? 'border-rose-300 bg-rose-50' : 'border-rose-200 hover:border-rose-400 hover:bg-rose-50'
        }`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
              <span className="text-xs text-rose-400">
                {removingBg ? '✨ Menghapus background...' : 'Mengupload...'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-rose-400" />
                <span className="text-sm text-rose-400">Pilih gambar perangko</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-rose-300">
                <Sparkles className="w-3 h-3" />
                <span>Background otomatis dihapus</span>
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Stamps grid */}
      {stamps.length === 0 ? (
        <p className="text-center text-rose-300 py-10 font-playfair">Belum ada perangko~ upload dulu!</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {stamps.map(stamp => (
            <div key={stamp.id} className="group relative">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-rose-100 bg-rose-50">
                <Image
                  src={stamp.image_url}
                  alt={stamp.name}
                  fill
                  className="object-contain p-1"
                  sizes="100px"
                />
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(stamp.id)}
                  disabled={isPending}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-rose-400 text-center mt-1 truncate">{stamp.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
