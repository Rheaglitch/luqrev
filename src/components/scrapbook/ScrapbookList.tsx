'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookOpen, X } from 'lucide-react'
import dynamic from 'next/dynamic'

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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => setActiveBook(book)}
            className="group text-left"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow bg-rose-100">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-rose-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-playfair text-sm leading-tight">{book.title}</p>
                <p className="text-white/60 text-xs">{book.love_scrapbook_pages?.length ?? 0} halaman</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Flipbook modal */}
      {activeBook && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between text-white mb-4">
              <h2 className="font-playfair text-xl">{activeBook.title}</h2>
              <button
                onClick={() => setActiveBook(null)}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FlipbookViewer pages={activeBook.love_scrapbook_pages ?? []} />
          </div>
        </div>
      )}
    </>
  )
}
