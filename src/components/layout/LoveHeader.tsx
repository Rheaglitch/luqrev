'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { ThemeColor } from '@/lib/theme'
import { THEME_TOKENS } from '@/lib/theme'

interface Props {
  settings: Record<string, string>
  theme: ThemeColor
}

function getDayCount(start: string) {
  const diff = Date.now() - new Date(start).getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

// Small floating heart decoration
function FloatingHeart({ style, size = 'sm' }: { style: React.CSSProperties; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  return (
    <span className={`absolute ${s} text-current opacity-40 animate-bounce`} style={style}>♥</span>
  )
}

export default function LoveHeader({ settings, theme }: Props) {
  const [days, setDays] = useState(0)
  const t = THEME_TOKENS[theme]

  useEffect(() => {
    if (settings.relationship_start) setDays(getDayCount(settings.relationship_start))
  }, [settings.relationship_start])

  const p1    = settings.partner1_name    ?? 'Kamu'
  const p2    = settings.partner2_name    ?? 'Aku'
  const quote = settings.header_quote     ?? 'My love'
  const sub   = settings.header_sub       ?? 'Soulmate'
  const dateLabel = settings.relationship_start
    ? new Date(settings.relationship_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  // Photo — use admin-set URL or placeholder
  const photoUrl = settings.header_photo_url ?? '/header-default.jpg'

  return (
    <header
      className="relative w-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${t.accent} 0%, #1a0505 60%, #2d0808 100%)` }}
    >
      {/* Scattered hearts decoration */}
      <div className={`absolute inset-0 ${t.textOnDark} pointer-events-none select-none`}>
        <FloatingHeart style={{ top: '8%',  left: '6%',  animationDelay: '0s',    fontSize: '0.6rem' }} />
        <FloatingHeart style={{ top: '15%', left: '22%', animationDelay: '0.4s',  fontSize: '0.5rem' }} />
        <FloatingHeart style={{ top: '60%', left: '8%',  animationDelay: '0.8s',  fontSize: '0.7rem' }} size="md" />
        <FloatingHeart style={{ top: '80%', left: '30%', animationDelay: '1.2s',  fontSize: '0.5rem' }} />
        <FloatingHeart style={{ top: '20%', right: '8%', animationDelay: '0.2s',  fontSize: '0.6rem' }} />
        <FloatingHeart style={{ top: '75%', right: '5%', animationDelay: '0.6s',  fontSize: '0.5rem' }} />
      </div>

      <div className="relative z-10 flex items-stretch min-h-[260px] sm:min-h-[300px]">

        {/* LEFT — text content */}
        <div className="flex-1 px-5 py-6 flex flex-col justify-between">
          {/* Top badge */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-3 py-1 rounded-full font-medium tracking-wide"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            >
              My World
            </span>
          </div>

          {/* Names */}
          <div>
            <h1
              className="font-playfair text-3xl sm:text-4xl font-bold leading-tight"
              style={{ color: 'white', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}
            >
              {p1}<span style={{ color: `rgba(255,200,200,0.8)` }}> &</span>
              <br />{p2}
            </h1>

            {/* Decorative text */}
            <p className="text-xs sm:text-sm mt-1 italic" style={{ color: 'rgba(255,200,200,0.7)' }}>
              Love! Love! Love!
            </p>
          </div>

          {/* Bottom info */}
          <div className="space-y-1.5">
            {/* Sub label */}
            <div
              className="inline-block text-xs px-3 py-1 rounded-sm font-medium tracking-widest uppercase"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
            >
              {sub}
            </div>

            {/* Day count */}
            {days > 0 && (
              <p className="text-sm font-playfair" style={{ color: 'rgba(255,200,200,0.9)' }}>
                ♥ {days} hari bersama
              </p>
            )}

            {/* Quote badge */}
            <div
              className="inline-block text-xs px-3 py-1.5 rounded-sm font-semibold"
              style={{ background: 'rgba(139,46,46,0.7)', color: 'white', border: '1px solid rgba(255,180,180,0.3)' }}
            >
              {quote}
            </div>
          </div>
        </div>

        {/* RIGHT — photo strip */}
        <div className="w-[140px] sm:w-[180px] flex-shrink-0 relative py-4 pr-4 flex flex-col gap-2 items-center justify-center">
          {/* Main photo — heart frame */}
          <div
            className="relative w-28 sm:w-36 aspect-square rounded-full overflow-hidden border-4 border-white/30 shadow-xl"
            style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
          >
            {/* fallback gradient if no photo */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${t.accent}88, #1a0505)` }}
            />
            <Image
              src={photoUrl}
              alt="Foto kenangan"
              fill
              className="object-cover"
              sizes="180px"
              onError={() => {}}
            />
          </div>

          {/* Polaroid strip below — small decorative */}
          <div
            className="w-20 sm:w-24 rounded-md overflow-hidden border-2 border-white/20 shadow-md rotate-2"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div className="aspect-[4/5] relative">
              <div className="absolute inset-0" style={{ background: 'rgba(80,10,10,0.6)' }} />
              <Image
                src={photoUrl}
                alt=""
                fill
                className="object-cover opacity-60"
                sizes="96px"
              />
            </div>
            <div className="px-1 py-1 text-center">
              <p className="text-[9px] font-playfair" style={{ color: 'rgba(255,200,200,0.8)' }}>
                {dateLabel || 'Since forever'}
              </p>
            </div>
          </div>

          {/* i love you badge */}
          <div
            className="absolute top-3 right-5 text-xs font-semibold px-2 py-1 rounded-sm rotate-3"
            style={{ background: 'rgba(139,46,46,0.8)', color: 'white', fontSize: '0.65rem' }}
          >
            i love you
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-4 overflow-hidden">
        <svg viewBox="0 0 400 16" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,8 Q100,0 200,8 Q300,16 400,8 L400,16 L0,16 Z" fill="white" opacity="0.06" />
        </svg>
      </div>
    </header>
  )
}
