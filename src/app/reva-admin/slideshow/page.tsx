import { getSlides } from '@/lib/data'
import SlideshowManager from '@/components/admin/SlideshowManager'

export default async function AdminSlideshowPage() {
  const slides = await getSlides()
  return (
    <div className="max-w-3xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Kelola Slideshow</h1>
      <SlideshowManager slides={slides} />
    </div>
  )
}
