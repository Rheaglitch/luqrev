'use client'

import { useRef, useState, useEffect } from 'react'
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

// Fixed dimensions — halaman tidak akan keluar dari batas ini
const PAGE_W = 300
const PAGE_H = 400

export default function FlipbookViewer({ pages: rawPages }: Props) {
  const book = useRef<{ pageFlip: () => { flipPrev: () => void; flipNext: () => void; getCurrentPageIndex: () => number; getPageCount: () => number } }>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const pages = [...rawPages].sort((a, b) => a.page_number - b.page_number)

  useEffect(() => {
    setTotalPages(pages.length)
  }, [pages.length])

  if (pages.length === 0) {
    return <p className="text-center text-white/50 py-10">Buku ini masih kosong~</p>
  }

  // Lebar total = 2 halaman berdampingan (landscape mode)
  // Di portrait/mobile, react-pageflip akan tampil 1 halaman
  const bookWidth = PAGE_W * 2
  const bookHeight = PAGE_H

  return (
    <div className="flex flex-col items-center gap-6 select-none">

      {/* ── Wrapper pembatas keras — halaman tidak bisa keluar dari sini ── */}
      <div
        style={{
          width: bookWidth,
          height: bookHeight,
          maxWidth: '100%',
          position: 'relative',
          // Ini yang paling penting: clip semua yang keluar batas
          overflow: 'hidden',
          borderRadius: 4,
          // Shadow di luar container, bukan di dalam
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Spine shadow di tengah (garis pemisah kiri-kanan halaman) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 4,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to right, rgba(0,0,0,0.25), rgba(0,0,0,0.05), rgba(0,0,0,0.25))',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />

        {/* @ts-expect-error — react-pageflip types don't match exactly */}
        <HTMLFlipBook
          ref={book}
          width={PAGE_W}
          height={PAGE_H}
          showCover={false}
          className=""
          style={{ margin: 0 }}
          startPage={0}
          // size="fixed" + autoSize=false = dimensi strict, tidak meresize sendiri
          size="fixed"
          minWidth={PAGE_W}
          maxWidth={PAGE_W}
          minHeight={PAGE_H}
          maxHeight={PAGE_H}
          drawShadow={true}
          flippingTime={600}
          usePortrait={false}
          startZIndex={1}
          autoSize={false}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={20}
          showPageCorners={true}
          disableFlipByClick={false}
          mobileScrollSupport={false}
          onFlip={(e: { data: number }) => setCurrentPage(e.data)}
          onChangeOrientation={() => {}}
          onChangeState={() => {}}
        >
          {pages.map((page) => (
            <div
              key={page.id}
              style={{
                width: PAGE_W,
                height: PAGE_H,
                position: 'relative',
                background: '#fff',
                overflow: 'hidden',
                // Border di tiap halaman sebagai pembatas visual
                boxSizing: 'border-box',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <Image
                src={page.public_url}
                alt={page.caption ?? `Halaman ${page.page_number}`}
                fill
                className="object-cover"
                sizes={`${PAGE_W}px`}
                draggable={false}
              />
              {/* Overlay gradient tipis biar ada kesan halaman kertas */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
                  pointerEvents: 'none',
                }}
              />
              {page.caption && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '8px 12px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                  }}
                >
                  <p style={{ color: 'white', fontSize: 11, textAlign: 'center', margin: 0 }}>
                    {page.caption}
                  </p>
                </div>
              )}
              {/* Nomor halaman */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 10,
                  fontSize: 10,
                  color: 'rgba(0,0,0,0.25)',
                  fontFamily: 'serif',
                  pointerEvents: 'none',
                }}
              >
                {page.page_number}
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => book.current?.pageFlip().flipPrev()}
          className="w-11 h-11 bg-white/20 hover:bg-white/35 active:scale-95 rounded-full flex items-center justify-center text-white transition-all"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-white/60 text-sm font-light tabular-nums">
          {Math.min(currentPage + 2, pages.length)} / {pages.length}
        </span>

        <button
          onClick={() => book.current?.pageFlip().flipNext()}
          className="w-11 h-11 bg-white/20 hover:bg-white/35 active:scale-95 rounded-full flex items-center justify-center text-white transition-all"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-white/30 text-xs">Geser halaman atau tap panah untuk membalik</p>
    </div>
  )
}
