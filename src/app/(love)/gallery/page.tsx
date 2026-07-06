import { getGalleryPhotos, getGalleryCategories } from '@/lib/data'
import GalleryGrid from '@/components/gallery/GalleryGrid'

export const metadata = { title: 'Galeri Kenangan' }

export default async function GalleryPage({
  searchParams,
}: PageProps<'/gallery'>) {
  const { category } = await searchParams ?? {}
  const [photos, categories] = await Promise.all([
    getGalleryPhotos(category as string | undefined),
    getGalleryCategories(),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl text-rose-800 mb-2">Galeri Kenangan</h1>
      <p className="text-rose-400 mb-6 text-sm">Setiap foto punya ceritanya sendiri 📸</p>
      <GalleryGrid photos={photos} categories={categories} activeCategory={category as string | undefined} />
    </div>
  )
}
