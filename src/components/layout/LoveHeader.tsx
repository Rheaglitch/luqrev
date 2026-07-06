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

export default function LoveHeader({ settings, theme }: Props) {
  const [days, setDays] = useState(0)
  const t = THEME_TOKENS[theme]

  useEffect(() => {
    if (settings.relationship_start) setDays(getDayCount(settings.relationship_start))
  }, [settings.relationship_start])

  const p1       = settings.partner1_name ?? 'Kamu'
  const p2       = settings.partner2_name ?? 'Aku'
  const quote    = settings.header_quote  ?? 'My love'
  const sub      = settings.header_sub    ?? 'Soulmate'
  const photoUrl = settings.header_photo_url || null
  const accent   = t.accent

  const startDate = settings.relationship_start
  const monthLabel = startDate
    ? new Date(startDate).toLocaleDateString('id-ID', { month: 'long' })
    : 'Since'
  const fullDate = startDate
    ? new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Since forever'

  return (
    <header
      className="relative w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, #200404 50%, #140202 100%)`,
        height: 300,
      }}
    >
      {/* ── Scattered hearts ── */}
      {[
        { top: '12%', left: '38%', size: 13, delay: '0s'    },
        { top: '55%', left: '35%', size: 10, delay: '0.4s'  },
        { top: '20%', left: '58%', size: 11, delay: '0.7s'  },
        { top: '70%', left: '60%', size: 9,  delay: '1.1s'  },
        { top: '8%',  left: '72%', size: 10, delay: '0.2s'  },
        { top: '80%', left: '75%', size: 8,  delay: '0.9s'  },
      ].map((h, i) => (
        <span
          key={i}
          className="absolute pointer-events-none animate-bounce"
          style={{
            top: h.top, left: h.left,
            fontSize: h.size,
            color: 'rgba(255,170,170,0.3)',
            animationDelay: h.delay,
            animationDuration: '3s',
          }}
        >♥</span>
      ))}

      {/* ── TOP BADGES ── */}
      <div className="absolute top-4 left-4 z-20">
        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: 'rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          My World ♥
        </span>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <span
          className="text-xs px-3 py-1.5 rounded-sm font-bold tracking-wide"
          style={{ background: 'rgba(100,5,5,0.8)', color: 'white', border: '1px solid rgba(255,150,150,0.25)' }}
        >
          i love you
        </span>
      </div>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div className="absolute inset-0 flex items-center px-4 pt-8 pb-4 gap-4">

        {/* COL 1 — Heart frame (big, left) */}
        <div className="flex-shrink-0" style={{ width: 240, height: 240 }}>
          <svg
            viewBox="0 0 200 200"
            width="240"
            height="240"
            style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))' }}
          >
            <defs>
              <clipPath id="heartClipMain">
                {/* Heart path centered in 200×200 */}
                <path d="M100,168 C55,142 18,116 18,72 C18,43 38,28 58,28 C74,28 89,38 100,54 C111,38 126,28 142,28 C162,28 182,43 182,72 C182,116 145,142 100,168 Z" />
              </clipPath>
            </defs>

            {/* Lace dots */}
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i / 40) * Math.PI * 2
              // Parametric heart slightly outside
              const tx = Math.pow(Math.sin(angle), 3)
              const ty = Math.cos(angle) - 0.5 * Math.cos(2*angle) - 0.25 * Math.cos(3*angle) - 0.125 * Math.cos(4*angle)
              const cx = 100 + 87 * tx
              const cy = 100 - 83 * ty - 2
              return <circle key={i} cx={cx} cy={cy} r="3.8" fill="white" opacity="0.88" />
            })}

            {/* White heart fill */}
            <path
              d="M100,168 C55,142 18,116 18,72 C18,43 38,28 58,28 C74,28 89,38 100,54 C111,38 126,28 142,28 C162,28 182,43 182,72 C182,116 145,142 100,168 Z"
              fill="white"
              opacity="0.97"
            />

            {/* Photo inside heart */}
            {photoUrl && (
              <image
                href={photoUrl}
                x="18" y="28"
                width="164" height="140"
                clipPath="url(#heartClipMain)"
                preserveAspectRatio="xMidYMid slice"
              />
            )}

            {/* Placeholder ♥ if no photo */}
            {!photoUrl && (
              <text x="100" y="108" textAnchor="middle" fontSize="40" fill={accent} opacity="0.4">♥</text>
            )}

            {/* Inner thin border */}
            <path
              d="M100,168 C55,142 18,116 18,72 C18,43 38,28 58,28 C74,28 89,38 100,54 C111,38 126,28 142,28 C162,28 182,43 182,72 C182,116 145,142 100,168 Z"
              fill="none"
              stroke="rgba(200,200,200,0.4)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* COL 2 — Text (center) */}
        <div className="flex-1 flex flex-col justify-center gap-3 pl-2 min-w-0">
          {/* Big script name */}
          <h1
            className="font-playfair font-bold italic leading-none"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              color: 'white',
              textShadow: '2px 4px 12px rgba(0,0,0,0.6), 0 0 30px rgba(255,150,150,0.2)',
            }}
          >
            {p1} & {p2}
          </h1>

          {/* Love Love Love */}
          <p
            className="italic font-medium"
            style={{ fontSize: '1rem', color: 'rgba(255,190,190,0.75)', letterSpacing: '0.02em' }}
          >
            Love! Love! Love!
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className="text-xs px-3 py-1.5 rounded-sm font-bold tracking-widest uppercase"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {sub}
            </span>
            <span
              className="text-xs px-3 py-1.5 rounded-sm font-bold"
              style={{ background: 'rgba(100,5,5,0.75)', color: 'white', border: '1px solid rgba(255,150,150,0.2)' }}
            >
              {quote}
            </span>
          </div>

          {/* Day count */}
          {days > 0 && (
            <p
              className="font-playfair italic"
              style={{ fontSize: '1.1rem', color: 'rgba(255,210,210,0.85)' }}
            >
              You are ♥ — {days} hari bersama
            </p>
          )}
        </div>

        {/* COL 3 — Polaroid strip (right) */}
        <div className="flex-shrink-0 flex flex-col gap-2 items-center" style={{ width: 110 }}>
          {/* Month label */}
          <p
            className="font-playfair italic text-center"
            style={{ fontSize: '1rem', color: 'rgba(255,200,200,0.9)', textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}
          >
            {monthLabel}
          </p>

          {/* Polaroid 1 — bigger, slight tilt */}
          <div
            className="overflow-hidden shadow-xl"
            style={{
              width: 90,
              background: 'white',
              padding: '4px 4px 16px 4px',
              transform: 'rotate(2deg)',
              boxShadow: '2px 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <div className="relative overflow-hidden" style={{ width: 82, height: 100 }}>
              {photoUrl ? (
                <Image src={photoUrl} alt="Foto" fill className="object-cover" sizes="82px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: '#f0d0d0' }}>
                  <span style={{ fontSize: 24, color: accent, opacity: 0.4 }}>♥</span>
                </div>
              )}
            </div>
            <p className="text-center mt-1" style={{ fontSize: 7, color: '#888', fontFamily: 'serif' }}>
              {fullDate}
            </p>
          </div>

          {/* Polaroid 2 — smaller, opposite tilt, overlapping */}
          <div
            className="overflow-hidden shadow-lg"
            style={{
              width: 75,
              background: 'white',
              padding: '3px 3px 12px 3px',
              transform: 'rotate(-3deg) translateY(-8px)',
              boxShadow: '2px 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <div className="relative overflow-hidden" style={{ width: 69, height: 80 }}>
              {photoUrl ? (
                <Image src={photoUrl} alt="" fill className="object-cover opacity-80" sizes="69px" />
              ) : (
                <div className="w-full h-full" style={{ background: '#e8c0c0' }} />
              )}
            </div>
          </div>

          {/* Polaroid 3 — tiny, more tilt */}
          <div
            className="overflow-hidden shadow-md"
            style={{
              width: 65,
              background: 'white',
              padding: '3px 3px 10px 3px',
              transform: 'rotate(4deg) translateY(-14px)',
              boxShadow: '2px 3px 10px rgba(0,0,0,0.35)',
            }}
          >
            <div className="relative overflow-hidden" style={{ width: 59, height: 65 }}>
              {photoUrl ? (
                <Image src={photoUrl} alt="" fill className="object-cover opacity-60" sizes="59px" />
              ) : (
                <div className="w-full h-full" style={{ background: '#d8b0b0' }} />
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}
