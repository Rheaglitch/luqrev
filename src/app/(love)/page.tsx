import Link from 'next/link'
import Image from 'next/image'
import {
  getSlides, getGalleryPhotos, getScrapbooks,
  getLetters, getEvents,
} from '@/lib/data'
import Slideshow from '@/components/home/Slideshow'
import { ChevronRight, Calendar, Heart, BookOpen, Mail, Gamepad2 } from 'lucide-react'

export default async function HomePage() {
  const [slides, photos, books, letters, events] = await Promise.all([
    getSlides(),
    getGalleryPhotos(),
    getScrapbooks(),
    getLetters(),
    getEvents(),
  ])

  const now = new Date()
  const upcomingEvents = events
    .filter(e => new Date(e.event_date) >= now)
    .slice(0, 4)
  const pastEvents = events
    .filter(e => new Date(e.event_date) < now)
    .slice(0, 2)

  const previewPhotos  = photos.slice(0, 4)
  const previewBooks   = books.slice(0, 3)
  const previewLetters = letters.slice(0, 2)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  const getDaysTo = (d: string) => {
    const diff = new Date(d).getTime() - now.getTime()
    return Math.ceil(diff / 86400000)
  }

  return (
    <div className="pb-8">

      {/* ── Section 1: Slideshow + Momen ── */}
      {/* Slideshow pakai aspect-video (16:9) supaya foto tidak terpotong */}
      <section className="flex gap-0 w-full">

        {/* Slideshow — 65% lebar, tinggi mengikuti aspek rasio */}
        <div className="relative min-w-0" style={{ width: '65%', aspectRatio: '4/3' }}>
          {slides.length > 0 ? (
            <Slideshow slides={slides} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f5e8e8]">
              <p className="text-[#a06060] text-sm font-playfair">Upload foto dari admin ~</p>
            </div>
          )}
        </div>

        {/* Momen — 35% lebar, tinggi mengikuti slideshow */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #2a0808 0%, #3d0c0c 100%)' }}
        >
          <div className="px-5 pt-5 pb-2 flex items-center justify-between flex-shrink-0">
            <h2 className="font-playfair text-base font-bold text-white">Momen Spesial</h2>
            <Link href="/events" className="text-xs text-[rgba(255,200,200,0.6)] hover:text-white transition-colors flex items-center gap-0.5">
              Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 scrollbar-none">
            {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'rgba(255,180,180,0.4)' }}>
                Belum ada momen~
              </p>
            ) : (
              <>
                {upcomingEvents.map(event => {
                  const d = getDaysTo(event.event_date)
                  return (
                    <div key={event.id} className="rounded-2xl p-3 flex gap-3 items-start border border-white/10"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,180,180,0.15)' }}>
                        <Calendar className="w-4 h-4" style={{ color: 'rgba(255,180,180,0.8)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight" style={{ color: 'white' }}>{event.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,180,180,0.6)' }}>
                          {formatDate(event.event_date)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color: 'rgba(255,180,180,0.9)' }}>
                          {d === 0 ? '🎉' : d}
                        </p>
                        {d > 0 && <p className="text-[9px]" style={{ color: 'rgba(255,180,180,0.4)' }}>hari lagi</p>}
                      </div>
                    </div>
                  )
                })}
                {upcomingEvents.length > 0 && pastEvents.length > 0 && (
                  <p className="text-[10px] uppercase tracking-wider px-1 pt-1" style={{ color: 'rgba(255,180,180,0.35)' }}>Kenangan</p>
                )}
                {pastEvents.map(event => (
                  <div key={event.id} className="rounded-2xl p-3 flex gap-3 items-start opacity-55"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,180,180,0.08)' }}>
                      <Heart className="w-4 h-4" style={{ color: 'rgba(255,180,180,0.4)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm leading-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>{event.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,180,180,0.4)' }}>{formatDate(event.event_date)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 2: Galeri ── */}
      <section className="px-4 pt-8 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-bold text-[#3d0c0c]">Galeri Kenangan</h2>
          <Link href="/gallery" className="text-xs text-[#a06060] hover:text-[#6b2020] flex items-center gap-1">
            Lihat semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {previewPhotos.length === 0 ? (
          <p className="text-sm text-[#c9a0a0] text-center py-8 font-playfair">Belum ada foto~</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {previewPhotos.map(photo => (
              <Link key={photo.id} href="/gallery" className="group">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm">
                  <Image
                    src={photo.public_url}
                    alt={photo.caption ?? ''}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 3: Scrapbook ── */}
      <section className="px-4 pt-8 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-bold text-[#3d0c0c] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8b2e2e]" /> Scrapbook
          </h2>
          <Link href="/scrapbook" className="text-xs text-[#a06060] hover:text-[#6b2020] flex items-center gap-1">
            Lihat semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {previewBooks.length === 0 ? (
          <p className="text-sm text-[#c9a0a0] text-center py-8 font-playfair">Belum ada scrapbook~</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {previewBooks.map(book => (
              <Link key={book.id} href="/scrapbook" className="group">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md"
                  style={{ background: '#f5e8e8' }}>
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-[#c9a0a0]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-2 left-0 right-0 text-center text-white text-xs font-playfair px-2 truncate">
                    {book.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 4: Surat ── */}
      <section className="px-4 pt-8 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-bold text-[#3d0c0c] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#8b2e2e]" /> Surat Untukmu
          </h2>
          <Link href="/letters" className="text-xs text-[#a06060] hover:text-[#6b2020] flex items-center gap-1">
            Lihat semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {previewLetters.length === 0 ? (
          <p className="text-sm text-[#c9a0a0] text-center py-8 font-playfair">Belum ada surat~</p>
        ) : (
          <div className="space-y-3">
            {previewLetters.map(letter => (
              <Link key={letter.id} href="/letters">
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#e8d0d0] bg-white hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#f5e8e8' }}>
                    <Mail className="w-5 h-5 text-[#8b2e2e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair font-medium text-[#3d0c0c] truncate">{letter.title}</p>
                    <p className="text-xs text-[#a06060]">{formatDate(letter.letter_date)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#c9a0a0] flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 5: Game ── */}
      <section className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-bold text-[#3d0c0c] flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#8b2e2e]" /> Mini Game
          </h2>
          <Link href="/game" className="text-xs text-[#a06060] hover:text-[#6b2020] flex items-center gap-1">
            Main sekarang <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tic-Tac-Toe', emoji: null, grid: ['♥','','○','','♥','','○','','♥'], bg: 'linear-gradient(135deg, #3d0c0c, #6b2020)' },
            { label: 'Ular Tangga', emoji: '🐍', grid: null, bg: 'linear-gradient(135deg, #6b2020, #8b4040)' },
            { label: 'Catur',       emoji: '♟', grid: null, bg: 'linear-gradient(135deg, #2a0808, #4a1a10)' },
          ].map(g => (
            <Link key={g.label} href="/game">
              <div className="rounded-2xl overflow-hidden shadow-sm aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ background: g.bg }}>
                {g.grid ? (
                  <div className="grid grid-cols-3 gap-0.5">
                    {g.grid.map((c, i) => (
                      <div key={i} className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[7px] font-bold"
                        style={{ background: 'rgba(255,255,255,0.1)', color: c === '♥' ? '#ffb3b3' : '#b3d4ff' }}>
                        {c}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-2xl">{g.emoji}</span>
                )}
                <p className="text-white text-[10px] font-medium px-1 text-center">{g.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
