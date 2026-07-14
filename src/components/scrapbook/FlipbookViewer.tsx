'use client'

import { useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Template } from './BookCover'

interface Page {
  id: string
  page_number: number
  public_url: string
  caption: string | null
}

interface Props {
  pages: Page[]
  template?: Template
}

const PAGE_W = 300
const PAGE_H = 400

export default function FlipbookViewer({ pages: rawPages, template = 'standard' }: Props) {
  const book = useRef<{ pageFlip: () => { flipPrev: () => void; flipNext: () => void } }>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [...rawPages].sort((a, b) => a.page_number - b.page_number)

  if (pages.length === 0) {
    return <p className="text-center text-white/50 py-10">Buku ini masih kosong~</p>
  }

  const bookWidth = PAGE_W * 2
  const bookHeight = PAGE_H

  // Dekorasi tengah berdasarkan template
  const CenterDecoration = () => {
    if (template === 'spiral') {
      const ringCount = 14
      return (
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0,
          transform: 'translateX(-50%)',
          width: 24, zIndex: 20, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
          padding: '8px 0',
        }}>
          {Array.from({ length: ringCount }).map((_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #d8d8d8 0%, #a0a0a0 40%, #ebebeb 70%, #b8b8b8 100%)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.5)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '25%', left: '25%',
                width: '50%', height: '50%', borderRadius: '50%',
                background: '#777', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
              }} />
            </div>
          ))}
        </div>
      )
    }

    if (template === 'binder') {
      const ringCount = 5
      return (
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0,
          transform: 'translateX(-50%)',
          width: 28, zIndex: 20, pointerEvents: 'none',
          background: 'linear-gradient(to right, #c08090, #d4919a, #c08090)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
          padding: '20px 0',
        }}>
          {Array.from({ length: ringCount }).map((_, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #c8c8c8 0%, #888 40%, #e0e0e0 70%, #aaa 100%)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'linear-gradient(135deg, #555, #777)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
              }} />
            </div>
          ))}
        </div>
      )
    }

    // Standard — shadow spine tipis
    return (
      <div style={{
        position: 'absolute', left: '50%', top: 0, bottom: 0, width: 6,
        transform: 'translateX(-50%)',
        background: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.05), rgba(0,0,0,0.2))',
        zIndex: 20, pointerEvents: 'none',
      }} />
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 select-none w-full">
      <div style={{
        width: bookWidth, height: bookHeight,
        maxWidth: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: template === 'binder' ? 8 : 4,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)',
      }}>
        <CenterDecoration />

        {/* @ts-expect-error — react-pageflip types don't match exactly */}
        <HTMLFlipBook
          ref={book}
          width={PAGE_W}
          height={PAGE_H}
          showCover={false}
          className=""
          style={{ margin: 0 }}
          startPage={0}
          size="fixed"
          minWidth={PAGE_W} maxWidth={PAGE_W}
          minHeight={PAGE_H} maxHeight={PAGE_H}
          drawShadow={true}
          flippingTime={650}
          usePortrait={false}
          startZIndex={1}
          autoSize={false}
          clickEventForward={false}
          useMouseEvents={true}
          swipeDistance={15}
          showPageCorners={true}
          disableFlipByClick={true}
          mobileScrollSupport={false}
          onFlip={(e: { data: number }) => setCurrentPage(e.data)}
          onChangeOrientation={() => {}}
          onChangeState={() => {}}
        >
          {pages.map((page) => (
            <div key={page.id} style={{
              width: PAGE_W, height: PAGE_H,
              position: 'relative',
              background: '#fff',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}>
              <Image
                src={page.public_url}
                alt={page.caption ?? `Halaman ${page.page_number}`}
                fill
                className="object-cover"
                sizes={`${PAGE_W}px`}
                draggable={false}
              />
              {/* Paper sheen */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)',
              }} />
              {page.caption && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '8px 12px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                }}>
                  <p style={{ color: 'white', fontSize: 11, textAlign: 'center', margin: 0 }}>
                    {page.caption}
                  </p>
                </div>
              )}
              <div style={{
                position: 'absolute', top: 8, right: 10,
                fontSize: 10, color: 'rgba(0,0,0,0.2)',
                fontFamily: 'serif', pointerEvents: 'none',
              }}>
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
          className="w-11 h-11 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full flex items-center justify-center text-white transition-all"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-white/50 text-sm tabular-nums">
          {Math.min(currentPage + 2, pages.length)} / {pages.length}
        </span>
        <button
          onClick={() => book.current?.pageFlip().flipNext()}
          className="w-11 h-11 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full flex items-center justify-center text-white transition-all"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <p className="text-white/25 text-xs">Seret ujung halaman untuk membalik</p>
    </div>
  )
}
