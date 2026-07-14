'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import Image from 'next/image'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Upload, Loader2, Trash2, Sparkles, Check, X, CropIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Stamp {
  id: string
  name: string
  image_url: string
}

interface PendingStamp {
  file: File
  originalUrl: string       // before remove.bg
  processedUrl: string | null  // after remove.bg (transparent PNG)
  processing: boolean
  error: string
  name: string
  crop: Crop | undefined
  cropping: boolean
}

interface Props {
  stamps: Stamp[]
}

function getCroppedBlob(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width  = crop.width  * scaleX
  canvas.height = crop.height * scaleY
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, canvas.width, canvas.height
  )
  return new Promise(res => canvas.toBlob(b => res(b!), 'image/png', 1))
}

function initCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, 4 / 5, width, height),
    width, height
  )
}

export default function StampsManager({ stamps }: Props) {
  const [pending, setPending] = useState<PendingStamp[]>([])
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const cropImgRef = useRef<HTMLImageElement | null>(null)
  const router = useRouter()

  // ── Pick files → remove.bg each one ──────────────────────────────────────
  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return

    const newItems: PendingStamp[] = files.map(f => ({
      file: f,
      originalUrl: URL.createObjectURL(f),
      processedUrl: null,
      processing: true,
      error: '',
      name: f.name.replace(/\.[^.]+$/, ''),
      crop: undefined,
      cropping: false,
    }))
    setPending(prev => [...prev, ...newItems])

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const idx = pending.length + i
      try {
        const form = new FormData()
        form.append('image', files[i])
        const res = await fetch('/api/remove-bg', { method: 'POST', body: form })
        if (!res.ok) throw new Error('remove.bg gagal')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setPending(prev => prev.map((p, pi) =>
          pi === idx ? { ...p, processedUrl: url, processing: false } : p
        ))
      } catch {
        setPending(prev => prev.map((p, pi) =>
          pi === idx ? { ...p, processedUrl: p.originalUrl, processing: false, error: 'Background tidak dihapus' } : p
        ))
      }
    }
  }

  // ── Toggle crop mode ──────────────────────────────────────────────────────
  const toggleCrop = (idx: number) => {
    setPending(prev => prev.map((p, pi) =>
      pi === idx ? { ...p, cropping: !p.cropping, crop: p.crop ?? undefined } : p
    ))
  }

  const onCropChange = (idx: number, crop: Crop) => {
    setPending(prev => prev.map((p, pi) => pi === idx ? { ...p, crop } : p))
  }

  const onImageLoaded = useCallback((idx: number, img: HTMLImageElement) => {
    cropImgRef.current = img
    setPending(prev => prev.map((p, pi) =>
      pi === idx && !p.crop
        ? { ...p, crop: initCrop(img.width, img.height) }
        : p
    ))
  }, [])

  const applyCrop = async (idx: number) => {
    const item = pending[idx]
    if (!cropImgRef.current || !item.crop) return
    try {
      const blob = await getCroppedBlob(cropImgRef.current, item.crop)
      const url = URL.createObjectURL(blob)
      setPending(prev => prev.map((p, pi) =>
        pi === idx ? { ...p, processedUrl: url, cropping: false } : p
      ))
    } catch (e) {
      console.error(e)
    }
  }

  const removePending = (idx: number) => {
    setPending(prev => prev.filter((_, pi) => pi !== idx))
  }

  // ── Save all pending stamps ───────────────────────────────────────────────
  const saveAll = async () => {
    const ready = pending.filter(p => !p.processing && p.processedUrl)
    if (!ready.length) return
    setUploading(true)
    try {
      const supabase = createClient()
      for (const item of ready) {
        const res = await fetch(item.processedUrl!)
        const blob = await res.blob()
        const path = `stamps/${Date.now()}-${item.name.replace(/\s+/g, '-')}.png`
        const { error } = await supabase.storage
          .from('love-media')
          .upload(path, blob, { contentType: 'image/png', upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('love-media').getPublicUrl(path)
        await supabase.from('love_stamps').insert({ name: item.name, image_url: data.publicUrl })
      }
      setPending([])
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan beberapa perangko.')
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

  const allReady = pending.length > 0 && pending.every(p => !p.processing)

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-medium text-rose-700">Upload Perangko Baru</h2>
        <label className="flex flex-col items-center justify-center gap-2 w-full py-5 border-2 border-dashed border-rose-200 rounded-xl cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors">
          <Upload className="w-5 h-5 text-rose-400" />
          <span className="text-sm text-rose-400">Pilih gambar (bisa beberapa sekaligus)</span>
          <div className="flex items-center gap-1 text-xs text-rose-300">
            <Sparkles className="w-3 h-3" />
            <span>Background otomatis dihapus</span>
          </div>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFilePick} />
        </label>

        {/* Pending stamps */}
        {pending.length > 0 && (
          <div className="space-y-4 mt-2">
            {pending.map((item, idx) => (
              <div key={idx} className="border border-rose-100 rounded-2xl p-4 space-y-3 bg-rose-50/50">
                <div className="flex items-start gap-3">
                  {/* Preview */}
                  <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-rose-200 bg-white"
                    style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIElEQVQoU2NkYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==")' }}>
                    {item.processing ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                      </div>
                    ) : item.processedUrl ? (
                      <img src={item.processedUrl} alt="" className="w-full h-full object-contain" />
                    ) : null}
                  </div>

                  {/* Name + status */}
                  <div className="flex-1 min-w-0">
                    <input
                      value={item.name}
                      onChange={e => setPending(prev => prev.map((p, pi) => pi === idx ? { ...p, name: e.target.value } : p))}
                      className="w-full px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      placeholder="Nama perangko"
                    />
                    {item.processing && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin" /> Menghapus background...
                      </p>
                    )}
                    {item.error && <p className="text-xs text-orange-500 mt-1">⚠️ {item.error}</p>}
                    {!item.processing && !item.error && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Background dihapus
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {!item.processing && (
                      <button
                        onClick={() => toggleCrop(idx)}
                        title="Crop gambar"
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${item.cropping ? 'bg-rose-500 text-white' : 'text-rose-400 hover:bg-rose-100'}`}
                      >
                        <CropIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => removePending(idx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-300 hover:bg-rose-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Crop editor */}
                {item.cropping && item.processedUrl && (
                  <div className="space-y-2">
                    <p className="text-xs text-rose-500 font-medium">Drag untuk memilih area crop</p>
                    <div className="rounded-xl overflow-hidden border border-rose-200">
                      <ReactCrop
                        crop={item.crop}
                        onChange={c => onCropChange(idx, c)}
                        aspect={undefined}
                      >
                        <img
                          src={item.processedUrl}
                          alt="crop"
                          style={{ maxWidth: '100%', maxHeight: 300 }}
                          onLoad={e => onImageLoaded(idx, e.currentTarget)}
                        />
                      </ReactCrop>
                    </div>
                    <button
                      onClick={() => applyCrop(idx)}
                      className="w-full py-2 rounded-xl text-white text-sm font-medium"
                      style={{ background: '#8b2e2e' }}
                    >
                      ✓ Terapkan Crop
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Save all button */}
            <button
              onClick={saveAll}
              disabled={!allReady || uploading}
              className="w-full py-3 rounded-2xl text-white font-semibold transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8b2e2e, #3d0c0c)' }}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </span>
              ) : `Simpan ${pending.filter(p => !p.processing).length} Perangko`}
            </button>
          </div>
        )}
      </div>

      {/* Existing stamps */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100">
        <h2 className="font-medium text-rose-700 mb-4">Perangko Tersimpan ({stamps.length})</h2>
        {stamps.length === 0 ? (
          <p className="text-center text-rose-300 py-8 font-playfair">Belum ada perangko~</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {stamps.map(stamp => (
              <div key={stamp.id} className="group relative">
                <div
                  className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-rose-100"
                  style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIElEQVQoU2NkYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==")' }}
                >
                  <Image src={stamp.image_url} alt={stamp.name} fill className="object-contain p-1" sizes="100px" />
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
    </div>
  )
}
