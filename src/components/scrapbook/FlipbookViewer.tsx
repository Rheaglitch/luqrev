'use client'

import { useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Page {
  id: string
  page_number: number
  public_url: string
  caption: string | null
}

interface Props {
  pages: Page[]
}

export default function FlipbookViewer({ pages: rawPages }: Props) {
  const book = useRef<{ pageFlip: () => { flipPrev: () => void; flipNext: () => void } }>(null)

  const pages = [...rawPages].sort((a, b) => a.page_number - b.page_number)

  if (pages.length === 0) {
    return <p className="text-center text-white/50 py-10">Buku ini masih kosong~</p>
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* @ts-expect-error — react-pageflip types don't match exactly */}
      <HTMLFlipBook
        ref={book}
        width={320}
        height={420}
        showCover
        className="shadow-2xl"
        style={{}}
        startPage={0}
        size="fixed"
        minWidth={200}
        maxWidth={400}
        minHeight={300}
        maxHeight={500}
        drawShadow
        flippingTime={700}
        usePortrait
        startZIndex={0}
        autoSize
        clickEventForward
        useMouseEvents
        swipeDistance={30}
        showPageCorners
        disableFlipByClick={false}
        mobileScrollSupport
        onFlip={() => {}}
        onChangeOrientation={() => {}}
        onChangeState={() => {}}
      >
        {pages.map((page) => (
          <div key={page.id} className="relative bg-white w-full h-full overflow-hidden">
            <Image
              src={page.public_url}
              alt={page.caption ?? `Halaman ${page.page_number}`}
              fill
              className="object-cover"
              sizes="320px"
            />
            {page.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-xs text-center">{page.caption}</p>
              </div>
            )}
          </div>
        ))}
      </HTMLFlipBook>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => book.current?.pageFlip().flipPrev()}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-white/60 text-sm">{pages.length} halaman</span>
        <button
          onClick={() => book.current?.pageFlip().flipNext()}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
