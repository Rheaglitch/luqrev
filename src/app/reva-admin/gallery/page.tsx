import { getGalleryPhotos, getGalleryCategories } from '@/lib/data'
import GalleryManager from '@/components/admin/GalleryManager'

export default async function AdminGalleryPage() {
  const [photos, categories] = await Promise.all([getGalleryPhotos(), getGalleryCategories()])
  return (
    <div className="max-w-3xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Kelola Galeri</h1>
      <GalleryManager photos={photos} categories={categories} />
    </div>
  )
}
