import { getSlides } from '@/lib/data'
import Slideshow from '@/components/home/Slideshow'

export default async function HomePage() {
  const slides = await getSlides()

  return (
    <section className="relative w-full h-[calc(100vh-8rem)]">
      {slides.length > 0 ? (
        <Slideshow slides={slides} />
      ) : (
        <div className="flex items-center justify-center h-full text-rose-300 text-lg font-playfair">
          ✨ Upload foto kenangan dari halaman admin ya ~
        </div>
      )}
    </section>
  )
}
