'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

interface Photo {
  id: string
  public_url: string
  caption: string | null
  category: string | null
}

interface Props {
  photos: Photo[]
  categories: string[]
  activeCategory?: string
}

export default function GalleryGrid({ photos, categories, activeCategory }: Props) {
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setCategory = (cat?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) params.set('category', cat)
    else params.delete('category')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      {/* Filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCategory(undefined)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${!activeCategory ? 'bg-rose-400 text-white' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeCategory === cat ? 'bg-rose-400 text-white' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {photos.length === 0 ? (
        <p className="text-center text-rose-300 py-20 font-playfair text-lg">Belum ada foto nih~ 🌸</p>
      ) : (
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setLightbox(photo)}
              className="w-full break-inside-avoid overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square">
                <Image
                  src={photo.public_url}
                  alt={photo.caption ?? 'Foto kenangan'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
              {photo.caption && (
                <p className="px-3 py-2 text-xs text-rose-600 bg-white text-left">{photo.caption}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
            onClick={() => setLightbox(null)}
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-2xl w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox.public_url}
              alt={lightbox.caption ?? ''}
              width={800}
              height={600}
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
            />
            {lightbox.caption && (
              <p className="text-center text-white/80 mt-3 font-playfair text-lg">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
