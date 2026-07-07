'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Trash2, Upload, Loader2 } from 'lucide-react'
import { deleteSlide } from '@/lib/actions/admin'
import { uploadFile, sanitizeFilename, UploadError } from '@/lib/upload'
import { useRouter } from 'next/navigation'

interface Slide {
  id: string
  public_url: string
  caption: string | null
  sort_order: number
}

interface Props {
  slides: Slide[]
}

export default function SlideshowManager({ slides }: Props) {
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient()
      for (const file of files) {
        const path = `slideshow/${Date.now()}-${sanitizeFilename(file.name)}`
        const publicUrl = await uploadFile(file, path)
        await supabase.from('love_slideshow').insert({
          storage_path: path,
          public_url: publicUrl,
          caption: files.length === 1 ? caption.trim() || null : null,
          sort_order: slides.length,
        })
      }
      setCaption('')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert(err instanceof UploadError ? err.message : 'Upload gagal, coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus foto ini?')) return
    startTransition(() => deleteSlide(id))
  }

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-medium text-rose-700">Upload Foto Baru</h2>
        <input
          type="text"
          placeholder="Caption (opsional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm text-rose-800"
        />
        <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-rose-300 bg-rose-50' : 'border-rose-200 hover:border-rose-400 hover:bg-rose-50'}`}>
          {uploading ? (
            <><Loader2 className="w-4 h-4 text-rose-400 animate-spin" /><span className="text-sm text-rose-400">Mengupload...</span></>
          ) : (
            <><Upload className="w-4 h-4 text-rose-400" /><span className="text-sm text-rose-400">Pilih foto</span></>
          )}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Slides list */}
      <div className="space-y-3">
        {slides.length === 0 && (
          <p className="text-center text-rose-300 py-10">Belum ada foto~ upload dulu!</p>
        )}
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-2xl border border-rose-100 p-4 flex items-center gap-4">
            <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={slide.public_url} alt={slide.caption ?? ''} fill className="object-cover" sizes="64px" />
            </div>
            <p className="flex-1 text-sm text-rose-600 truncate">{slide.caption ?? <span className="text-rose-300">Tidak ada caption</span>}</p>
            <button
              onClick={() => handleDelete(slide.id)}
              disabled={isPending}
              className="w-9 h-9 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              aria-label="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
