'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  id: string
  storage_path: string
  caption: string | null
  public_url: string
}

interface Props {
  slides: Slide[]
}

export default function Slideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const go = useCallback((next: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent((next + slides.length) % slides.length)
      setIsTransitioning(false)
    }, 300)
  }, [isTransitioning, slides.length])

  useEffect(() => {
    const t = setInterval(() => go(current + 1), 5000)
    return () => clearInterval(t)
  }, [current, go])

  // Touch/swipe
  let touchStart = 0
  const onTouchStart = (e: React.TouchEvent) => { touchStart = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) go(current + (diff > 0 ? 1 : -1))
  }

  const slide = slides[current]

  return (
    <div
      className="relative w-full h-full select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Image */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <Image
          src={slide.public_url}
          alt={slide.caption ?? 'Kenangan'}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Caption */}
      {slide.caption && (
        <div className="absolute bottom-16 left-0 right-0 text-center px-6">
          <p className="inline-block text-white font-playfair text-xl bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full">
            {slide.caption}
          </p>
        </div>
      )}

      {/* Controls */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
