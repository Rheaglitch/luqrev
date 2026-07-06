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

  const dateLabel = settings.relationship_start
    ? new Date(settings.relationship_start).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'Since forever'

  // accent color for this theme
  const accent = t.accent

  return (
    <header
      className="relative w-full overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, #1a0404 55%, #2a0808 100%)`,
        minHeight: 220,
      }}
    >
      {/* ── scattered small hearts ── */}
      {[
        { t: '10%', l: '4%',  s: 11, d: 0   },
        { t: '30%', l: '2%',  s: 8,  d: 0.3 },
        { t: '65%', l: '5%',  s: 12, d: 0.7 },
        { t: '80%', l: '25%', s: 9,  d: 1.1 },
        { t: '12%', l: '48%', s: 10, d: 0.5 },
        { t: '55%', l: '52%', s: 8,  d: 0.9 },
      ].map((h, i) => (
        <span
          key={i}
          className="absolute pointer-events-none animate-bounce"
          style={{
            top: h.t, left: h.l,
            fontSize: h.s,
            color: 'rgba(255,180,180,0.35)',
            animationDelay: `${h.d}s`,
            animationDuration: '3s',
          }}
        >♥</span>
      ))}

      {/* ── TOP LABELS ── */}
      <div className="absolute top-3 left-4 z-20">
        <span
          className="text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
        >
          My World
        </span>
      </div>
      <div className="absolute top-3 right-4 z-20">
        <span
          className="text-[10px] px-2.5 py-1 rounded-sm font-semibold"
          style={{ background: 'rgba(139,20,20,0.75)', color: 'white', border: '1px solid rgba(255,160,160,0.3)' }}
        >
          i love you
        </span>
      </div>

      {/* ── MAIN CONTENT ROW ── */}
      <div className="relative z-10 flex items-center px-4 pt-10 pb-5 gap-3">

        {/* LEFT — text */}
        <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
          {/* Names headline */}
          <h1
            className="font-playfair leading-tight font-bold"
            style={{
              fontSize: 'clamp(1.6rem, 7vw, 2.8rem)',
              color: 'white',
              textShadow: '2px 3px 10px rgba(0,0,0,0.6)',
            }}
          >
            {p1}
            <span style={{ color: 'rgba(255,190,190,0.8)' }}> & </span>
            {p2}
          </h1>

          {/* Love Love Love */}
          <p
            className="italic text-xs sm:text-sm"
            style={{ color: 'rgba(255,190,190,0.7)' }}
          >
            Love! Love! Love!
          </p>

          {/* Soulmate badge */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span
              className="self-start text-[10px] px-3 py-1 rounded-sm font-semibold tracking-widest uppercase"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
            >
              {sub}
            </span>

            {days > 0 && (
              <p className="text-xs" style={{ color: 'rgba(255,200,200,0.85)' }}>
                ♥ {days} hari bersama
              </p>
            )}

            <span
              className="self-start text-[10px] px-3 py-1.5 rounded-sm font-semibold"
              style={{
                background: 'rgba(100,10,10,0.7)',
                color: 'white',
                border: '1px solid rgba(255,160,160,0.25)',
              }}
            >
              {quote}
            </span>
          </div>
        </div>

        {/* CENTER — heart frame photo */}
        <div className="relative flex-shrink-0" style={{ width: 'clamp(110px, 30vw, 160px)' }}>
          {/* Lace heart SVG mask */}
          <div
            className="relative mx-auto"
            style={{ width: '100%', aspectRatio: '1 / 1' }}
          >
            {/* White lace heart border — SVG */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
            >
              {/* Outer lace ring — dotted circles around heart path */}
              <defs>
                <clipPath id="heartClip">
                  <path d="M100,170 C60,145 20,120 20,75 C20,45 40,30 60,30 C75,30 90,40 100,55 C110,40 125,30 140,30 C160,30 180,45 180,75 C180,120 140,145 100,170 Z" />
                </clipPath>
              </defs>

              {/* Lace dots around heart outline */}
              {Array.from({ length: 36 }).map((_, i) => {
                // Parametric heart for dot positions (slightly outside)
                const t2 = (i / 36) * Math.PI * 2
                const scale = 1.08
                const cx = 100 + 80 * scale * 16 * Math.pow(Math.sin(t2), 3) / 80
                const cy = 100 - 80 * scale * (13 * Math.cos(t2) - 5 * Math.cos(2*t2) - 2 * Math.cos(3*t2) - Math.cos(4*t2)) / 80
                return <circle key={i} cx={cx} cy={cy} r="3.5" fill="white" opacity="0.9" />
              })}

              {/* White heart fill */}
              <path
                d="M100,170 C60,145 20,120 20,75 C20,45 40,30 60,30 C75,30 90,40 100,55 C110,40 125,30 140,30 C160,30 180,45 180,75 C180,120 140,145 100,170 Z"
                fill="white"
                opacity="0.95"
              />

              {/* Photo clipped inside heart */}
              <image
                href={photoUrl ?? ''}
                x="20" y="30"
                width="160" height="140"
                clipPath="url(#heartClip)"
                preserveAspectRatio="xMidYMid slice"
                style={{ display: photoUrl ? 'block' : 'none' }}
              />

              {/* Placeholder if no photo */}
              {!photoUrl && (
                <text x="100" y="105" textAnchor="middle" fontSize="36" fill={accent} opacity="0.5">♥</text>
              )}

              {/* Thin inner border */}
              <path
                d="M100,170 C60,145 20,120 20,75 C20,45 40,30 60,30 C75,30 90,40 100,55 C110,40 125,30 140,30 C160,30 180,45 180,75 C180,120 140,145 100,170 Z"
                fill="none"
                stroke="rgba(200,200,200,0.6)"
                strokeWidth="1"
              />
            </svg>
          </div>
        </div>

        {/* RIGHT — polaroid strip */}
        <div className="flex-shrink-0 flex flex-col gap-1.5 items-center" style={{ width: 'clamp(60px, 16vw, 85px)' }}>
          {/* Month label */}
          <p
            className="font-playfair text-center leading-none"
            style={{
              fontSize: 'clamp(0.65rem, 2.5vw, 0.85rem)',
              color: 'rgba(255,200,200,0.9)',
            }}
          >
            {settings.relationship_start
              ? new Date(settings.relationship_start).toLocaleDateString('id-ID', { month: 'long' })
              : 'Since'}
          </p>

          {/* Polaroid 1 — main */}
          <div
            className="w-full rounded-sm overflow-hidden shadow-lg"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.2)',
              transform: 'rotate(1deg)',
            }}
          >
            <div className="relative" style={{ aspectRatio: '3/4' }}>
              {photoUrl ? (
                <Image src={photoUrl} alt="Foto" fill className="object-cover" sizes="85px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(80,10,10,0.5)' }}>
                  <span style={{ fontSize: 20, color: 'rgba(255,180,180,0.5)' }}>♥</span>
                </div>
              )}
            </div>
            <div className="py-1 px-1 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 7, color: 'rgba(255,200,200,0.7)', fontFamily: 'serif' }}>
                {dateLabel}
              </p>
            </div>
          </div>

          {/* Polaroid 2 — smaller rotated */}
          <div
            className="w-4/5 rounded-sm overflow-hidden shadow-md"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.15)',
              transform: 'rotate(-2deg)',
            }}
          >
            <div className="relative" style={{ aspectRatio: '1/1' }}>
              {photoUrl ? (
                <Image src={photoUrl} alt="" fill className="object-cover opacity-70" sizes="68px" />
              ) : (
                <div className="absolute inset-0" style={{ background: 'rgba(60,5,5,0.6)' }} />
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}
