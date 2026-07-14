'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'
import BookCover, { Template, TitlePos } from './BookCover'

const FlipbookViewer = dynamic(() => import('./FlipbookViewer'), { ssr: false })

interface Page {
  id: string
  page_number: number
  public_url: string
  caption: string | null
}

interface Book {
  id: string
  title: string
  cover_url: string | null
  template: string | null
  title_pos: string | null
  love_scrapbook_pages: Page[]
}

interface Props {
  books: Book[]
}

export default function ScrapbookList({ books }: Props) {
  const [activeBook, setActiveBook] = useState<Book | null>(null)

  if (books.length === 0) {
    return <p className="text-center text-rose-300 py-20 font-playfair text-lg">Belum ada scrapbook~ 📖</p>
  }

  // Cover image = halaman pertama yang diupload (page_number terkecil)
  const getCoverUrl = (book: Book): string | null => {
    if (book.cover_url) return book.cover_url
    const pages = [...(book.love_scrapbook_pages ?? [])].sort((a, b) => a.page_number - b.page_number)
    return pages[0]?.public_url ?? null
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {books.map((book) => {
          const template = (book.template ?? 'standard') as Template
          const titlePos = (book.title_pos ?? 'bottom') as TitlePos
          const coverUrl = getCoverUrl(book)
          const pageCount = book.love_scrapbook_pages?.length ?? 0

          return (
            <button
              key={book.id}
              onClick={() => setActiveBook(book)}
              className="group text-left focus:outline-none"
              style={{ transform: 'translateZ(0)' }}
            >
              <div
                className="transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-[0.98]"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
              >
                <BookCover
                  title={book.title}
                  coverUrl={coverUrl}
                  pageCount={pageCount}
                  template={template}
                  titlePos={titlePos}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Flipbook modal */}
      {activeBook && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
          style={{ background: 'rgba(15,10,10,0.92)' }}
        >
          <div className="w-full max-w-3xl flex flex-col items-center gap-3">
            {/* Header */}
            <div className="flex items-center justify-between w-full px-2">
              <h2 className="font-playfair text-lg text-white/90">{activeBook.title}</h2>
              <button
                onClick={() => setActiveBook(null)}
                className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <FlipbookViewer
              pages={activeBook.love_scrapbook_pages ?? []}
              template={(activeBook.template ?? 'standard') as Template}
            />
          </div>
        </div>
      )}
    </>
  )
}
