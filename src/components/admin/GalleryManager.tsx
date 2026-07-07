'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Trash2, Upload, Loader2 } from 'lucide-react'
import { deleteGalleryPhoto } from '@/lib/actions/admin'
import { uploadFile, sanitizeFilename, UploadError } from '@/lib/upload'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  public_url: string
  caption: string | null
  category: string | null
}

interface Props {
  photos: Photo[]
  categories: string[]
}

export default function GalleryManager({ photos, categories }: Props) {
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const effectiveCategory = newCategory.trim() || category

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient()
      for (const file of files) {
        const path = `gallery/${Date.now()}-${sanitizeFilename(file.name)}`
        const publicUrl = await uploadFile(file, path)
        await supabase.from('love_gallery').insert({
          storage_path: path,
          public_url: publicUrl,
          caption: files.length === 1 ? caption.trim() || null : null,
          category: effectiveCategory || null,
        })
      }
      setCaption('')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert(err instanceof UploadError ? err.message : 'Upload gagal.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-medium text-rose-700">Upload Foto Baru</h2>
        <input type="text" placeholder="Caption (opsional)" value={caption} onChange={(e) => setCaption(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm text-rose-800" />
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300">
            <option value="">Pilih kategori...</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="Atau buat baru" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300" />
        </div>
        <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-rose-300 bg-rose-50' : 'border-rose-200 hover:border-rose-400'}`}>
          {uploading ? <><Loader2 className="w-4 h-4 text-rose-400 animate-spin" /><span className="text-sm text-rose-400">Mengupload...</span></> : <><Upload className="w-4 h-4 text-rose-400" /><span className="text-sm text-rose-400">Pilih foto</span></>}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group rounded-xl overflow-hidden">
            <div className="aspect-square relative">
              <Image src={photo.public_url} alt={photo.caption ?? ''} fill className="object-cover" sizes="120px" />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => { if (confirm('Hapus?')) startTransition(() => deleteGalleryPhoto(photo.id)) }}
                disabled={isPending} className="w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {photo.category && <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1"><p className="text-white text-xs truncate">{photo.category}</p></div>}
          </div>
        ))}
      </div>
    </div>
  )
}
