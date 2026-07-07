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

/** Foto placeholder box */
function PhotoPlaceholder({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1"
      style={{ background: 'rgba(255,255,255,0.07)' }}>
      <span style={{ fontSize: 20, color: accent, opacity: 0.4 }}>♥</span>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{label}</span>
    </div>
  )
}

export default function LoveHeader({ settings, theme }: Props) {
  const [days, setDays] = useState(0)
  const t = THEME_TOKENS[theme]
  const accent = t.accent

  useEffect(() => {
    if (settings.relationship_start) setDays(getDayCount(settings.relationship_start))
  }, [settings.relationship_start])

  const p1             = settings.partner1_name      ?? 'Revalin'
  const p2             = settings.partner2_name      ?? 'Luqman'
  const title          = settings.header_title       ?? 'Best Couple'
  const quoteBottom    = settings.header_quote_bottom ?? 'Two people who met because of fate, I hope we will always be together'
  const photoLeft1     = settings.header_photo_left1  || null
  const photoLeft2     = settings.header_photo_left2  || null
  const photoRight1    = settings.header_photo_right1 || null
  const photoRight2    = settings.header_photo_right2 || null

  return (
    <header
      className="relative w-full overflow-hidden"
      style={{
        // Fabric/textile texture feel — dark maroon with subtle noise
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(120,20,20,0.6) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 50%, rgba(80,5,5,0.4) 0%, transparent 60%),
          #5c0f0f
        `,
        minHeight: 320,
      }}
    >
      {/* Fabric texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' x='0' y='0' fill='rgba(0,0,0,0.15)'/%3E%3Crect width='1' height='1' x='2' y='2' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E")`,
          backgroundSize: '4px 4px',
        }}
      />

      {/* Scattered hearts */}
      {[
        { top: '10%', left: '38%', size: 11 },
        { top: '45%', left: '42%', size: 9  },
        { top: '75%', left: '36%', size: 10 },
        { top: '15%', left: '55%', size: 8  },
        { top: '60%', left: '50%', size: 10 },
        { top: '25%', left: '65%', size: 9  },
        { top: '80%', left: '70%', size: 8  },
        { top: '5%',  left: '78%', size: 10 },
        { top: '50%', left: '85%', size: 9  },
      ].map((h, i) => (
        <span key={i} className="absolute pointer-events-none select-none"
          style={{ top: h.top, left: h.left, fontSize: h.size, color: 'rgba(255,200,200,0.35)' }}>
          ♥
        </span>
      ))}

      {/* ── MAIN LAYOUT ── */}
      <div className="relative z-10 flex gap-0 h-full" style={{ minHeight: 320 }}>

        {/* ═══ LEFT — Photo collage ═══ */}
        <div className="relative flex-shrink-0" style={{ width: '45%', padding: '16px 12px 16px 16px' }}>

          {/* Photo 1 — top, slight right tilt */}
          <div
            className="absolute overflow-hidden shadow-xl"
            style={{
              top: 14, left: 14,
              width: '62%', aspectRatio: '4/3',
              transform: 'rotate(-1.5deg)',
              border: '3px solid rgba(255,255,255,0.85)',
              boxShadow: '3px 4px 16px rgba(0,0,0,0.5)',
              zIndex: 2,
            }}
          >
            {photoLeft1 ? (
              <Image src={photoLeft1} alt={p1} fill className="object-cover grayscale" sizes="200px" />
            ) : (
              <PhotoPlaceholder label="Foto 1" accent={accent} />
            )}
          </div>

          {/* Photo 2 — bottom right, slight left tilt, overlaps */}
          <div
            className="absolute overflow-hidden shadow-xl"
            style={{
              bottom: 14, right: 10,
              width: '60%', aspectRatio: '4/3',
              transform: 'rotate(2deg)',
              border: '3px solid rgba(255,255,255,0.85)',
              boxShadow: '3px 4px 16px rgba(0,0,0,0.5)',
              zIndex: 3,
            }}
          >
            {photoLeft2 ? (
              <Image src={photoLeft2} alt={p2} fill className="object-cover grayscale" sizes="200px" />
            ) : (
              <PhotoPlaceholder label="Foto 2" accent={accent} />
            )}
          </div>

          {/* Small inset photo — top right corner of left panel */}
          <div
            className="absolute overflow-hidden shadow-lg"
            style={{
              top: 10, right: 6,
              width: '28%', aspectRatio: '3/4',
              transform: 'rotate(3deg)',
              border: '2px solid rgba(255,255,255,0.7)',
              boxShadow: '2px 3px 10px rgba(0,0,0,0.4)',
              zIndex: 4,
            }}
          >
            {photoLeft1 ? (
              <Image src={photoLeft1} alt="" fill className="object-cover grayscale opacity-80" sizes="80px" />
            ) : (
              <div className="w-full h-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            )}
          </div>

          {/* Script text overlays */}
          <div className="absolute bottom-6 left-4 z-10">
            <p className="font-playfair italic text-white font-bold"
              style={{ fontSize: '1.3rem', textShadow: '1px 2px 6px rgba(0,0,0,0.8)', opacity: 0.85 }}>
              Love
            </p>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,200,200,0.65)', fontStyle: 'italic' }}>
              in wind, lost in gravity
            </p>
          </div>

          {/* Bottom quote */}
          <div className="absolute bottom-2 left-0 right-0 px-3 z-10">
            <p style={{ fontSize: '0.5rem', color: 'rgba(255,200,200,0.5)', fontStyle: 'italic', textAlign: 'center' }}>
              &ldquo;a sweet journey with you, coffee in the morning, warm hugs at night, this is our love story.&rdquo;
            </p>
          </div>
        </div>

        {/* ═══ RIGHT — Polaroids + title ═══ */}
        <div className="flex-1 flex flex-col justify-between px-4 py-4">

          {/* Title */}
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="font-playfair italic font-bold"
                style={{
                  fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                  color: 'white',
                  textShadow: '2px 3px 8px rgba(0,0,0,0.5)',
                  letterSpacing: '0.01em',
                }}
              >
                {title}
              </h1>
              {days > 0 && (
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,200,200,0.6)', marginTop: 2 }}>
                  ♥ {days} hari bersama
                </p>
              )}
            </div>
            {/* Heart deco top right */}
            <span style={{ fontSize: 14, color: 'rgba(255,180,180,0.5)', marginTop: 4 }}>♥</span>
          </div>

          {/* Two polaroid photos side by side */}
          <div className="flex gap-3 justify-center items-end">
            {/* Polaroid 1 — person 1 */}
            <div className="flex flex-col items-center">
              <div
                className="overflow-hidden shadow-xl"
                style={{
                  background: 'rgba(245,235,225,0.95)',
                  padding: '5px 5px 20px 5px',
                  transform: 'rotate(-2deg)',
                  boxShadow: '3px 5px 18px rgba(0,0,0,0.45)',
                  width: 'clamp(80px, 12vw, 120px)',
                }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {photoRight1 ? (
                    <Image src={photoRight1} alt={p1} fill className="object-cover grayscale" sizes="120px" />
                  ) : (
                    <PhotoPlaceholder label={p1} accent={accent} />
                  )}
                </div>
              </div>
              {/* Name below polaroid */}
              <p
                className="font-playfair italic font-bold mt-1"
                style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)', color: 'white', textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}
              >
                {p1}
              </p>
              {/* Star decoration */}
              <span style={{ fontSize: 10, color: 'rgba(200,150,50,0.7)' }}>★</span>
            </div>

            {/* Polaroid 2 — person 2 */}
            <div className="flex flex-col items-center">
              <div
                className="overflow-hidden shadow-xl"
                style={{
                  background: 'rgba(245,235,225,0.95)',
                  padding: '5px 5px 20px 5px',
                  transform: 'rotate(1.5deg)',
                  boxShadow: '3px 5px 18px rgba(0,0,0,0.45)',
                  width: 'clamp(80px, 12vw, 120px)',
                }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {photoRight2 ? (
                    <Image src={photoRight2} alt={p2} fill className="object-cover grayscale" sizes="120px" />
                  ) : (
                    <PhotoPlaceholder label={p2} accent={accent} />
                  )}
                </div>
              </div>
              <p
                className="font-playfair italic font-bold mt-1"
                style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)', color: 'white', textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}
              >
                {p2}
              </p>
              <span style={{ fontSize: 10, color: 'rgba(200,150,50,0.7)' }}>★</span>
            </div>
          </div>

          {/* Bottom quote */}
          <p
            className="font-playfair italic text-center"
            style={{ fontSize: 'clamp(0.55rem, 1.2vw, 0.72rem)', color: 'rgba(255,210,210,0.65)', lineHeight: 1.5 }}
          >
            {quoteBottom}
          </p>
        </div>

      </div>
    </header>
  )
}
