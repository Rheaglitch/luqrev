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

function PhotoPlaceholder({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1"
      style={{ background: 'rgba(80,10,10,0.4)' }}>
      <span style={{ fontSize: 22, color: accent, opacity: 0.5 }}>♥</span>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
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

  const p1          = settings.partner1_name       ?? 'Revalin'
  const p2          = settings.partner2_name       ?? 'Luqman'
  const title       = settings.header_title        ?? 'Best Couple'
  const quoteBottom = settings.header_quote_bottom ?? 'Two people who met because of fate, I hope we will always be together'
  const photoLeft1  = settings.header_photo_left1  || null
  const photoLeft2  = settings.header_photo_left2  || null
  const photoRight1 = settings.header_photo_right1 || null
  const photoRight2 = settings.header_photo_right2 || null

  return (
    <header
      className="relative w-full overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(120,20,20,0.6) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 50%, rgba(80,5,5,0.4) 0%, transparent 60%),
          #5c0f0f
        `,
        minHeight: '100vh',
      }}
    >
      {/* Fabric texture overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' x='0' y='0' fill='rgba(0,0,0,0.15)'/%3E%3Crect width='1' height='1' x='2' y='2' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E")`,
        backgroundSize: '4px 4px',
      }} />

      {/* Scattered hearts */}
      {[
        { top: '10%', left: '38%', size: 13 },
        { top: '45%', left: '42%', size: 10 },
        { top: '75%', left: '36%', size: 11 },
        { top: '15%', left: '55%', size: 9  },
        { top: '60%', left: '50%', size: 11 },
        { top: '25%', left: '65%', size: 10 },
        { top: '80%', left: '70%', size: 9  },
        { top: '5%',  left: '78%', size: 11 },
        { top: '50%', left: '85%', size: 10 },
        { top: '30%', left: '32%', size: 8  },
        { top: '90%', left: '48%', size: 9  },
      ].map((h, i) => (
        <span key={i} className="absolute pointer-events-none select-none"
          style={{ top: h.top, left: h.left, fontSize: h.size, color: 'rgba(255,200,200,0.3)' }}>
          ♥
        </span>
      ))}

      {/* ── MAIN LAYOUT: fills full height ── */}
      <div className="relative z-10 flex min-h-screen">

        {/* ═══ LEFT — Two photos side by side, stacked ═══ */}
        <div
          className="flex-shrink-0 flex flex-col justify-center gap-4 px-5 py-8"
          style={{ width: '42%' }}
        >
          {/* Top row: Photo 1 full width */}
          <div
            className="overflow-hidden shadow-2xl"
            style={{
              border: '3px solid rgba(255,255,255,0.88)',
              boxShadow: '4px 6px 20px rgba(0,0,0,0.55)',
              transform: 'rotate(-1deg)',
              borderRadius: 4,
              aspectRatio: '16/9',
              position: 'relative',
            }}
          >
            {photoLeft1 ? (
              <Image src={photoLeft1} alt={p1} fill className="object-cover grayscale" sizes="40vw" />
            ) : (
              <PhotoPlaceholder label="Foto 1" accent={accent} />
            )}
          </div>

          {/* Bottom row: Photo 2 + small accent card side by side */}
          <div className="flex gap-3 items-start">
            {/* Photo 2 — wider */}
            <div
              className="overflow-hidden shadow-xl flex-1"
              style={{
                border: '3px solid rgba(255,255,255,0.88)',
                boxShadow: '4px 6px 20px rgba(0,0,0,0.55)',
                transform: 'rotate(1.5deg)',
                borderRadius: 4,
                aspectRatio: '4/3',
                position: 'relative',
              }}
            >
              {photoLeft2 ? (
                <Image src={photoLeft2} alt={p2} fill className="object-cover grayscale" sizes="28vw" />
              ) : (
                <PhotoPlaceholder label="Foto 2" accent={accent} />
              )}
            </div>

            {/* Accent card — solid, not transparent */}
            <div
              className="flex-shrink-0 overflow-hidden shadow-lg"
              style={{
                width: '32%',
                aspectRatio: '3/4',
                border: '2px solid rgba(255,255,255,0.75)',
                boxShadow: '2px 4px 12px rgba(0,0,0,0.45)',
                transform: 'rotate(-2deg)',
                borderRadius: 4,
                background: '#3d0c0c',
                position: 'relative',
              }}
            >
              {/* Solid background, show photo 1 again as accent without transparency */}
              {photoLeft1 ? (
                <Image src={photoLeft1} alt="" fill className="object-cover grayscale" sizes="120px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #4a1010, #2a0808)' }}>
                  <span style={{ fontSize: 18, color: accent, opacity: 0.6 }}>♥</span>
                </div>
              )}
            </div>
          </div>

          {/* Script text */}
          <div>
            <p className="font-playfair italic text-white font-bold"
              style={{ fontSize: '1.4rem', textShadow: '1px 2px 8px rgba(0,0,0,0.8)' }}>
              Love
            </p>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,200,200,0.6)', fontStyle: 'italic' }}>
              in wind, lost in gravity
            </p>
          </div>

          {/* Bottom quote small */}
          <p style={{ fontSize: '0.55rem', color: 'rgba(255,200,200,0.45)', fontStyle: 'italic' }}>
            &ldquo;a sweet journey with you, coffee in the morning,<br />warm hugs at night, this is our love story.&rdquo;
          </p>
        </div>

        {/* ═══ RIGHT — Title + Polaroids ═══ */}
        <div className="flex-1 flex flex-col justify-between px-6 py-8">

          {/* Top: title + day count */}
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="font-playfair italic font-bold"
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  color: 'white',
                  textShadow: '2px 4px 12px rgba(0,0,0,0.5)',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h1>
              {days > 0 && (
                <p className="mt-1" style={{ fontSize: '0.7rem', color: 'rgba(255,200,200,0.65)' }}>
                  ♥ {days} hari bersama
                </p>
              )}
            </div>
            <span style={{ fontSize: 16, color: 'rgba(255,180,180,0.45)', marginTop: 6 }}>♥</span>
          </div>

          {/* Middle: two polaroids */}
          <div className="flex gap-4 justify-center items-end">
            {[
              { photo: photoRight1, name: p1, rotate: '-2deg' },
              { photo: photoRight2, name: p2, rotate: '1.5deg' },
            ].map(({ photo, name, rotate }) => (
              <div key={name} className="flex flex-col items-center">
                <div
                  className="overflow-hidden shadow-2xl"
                  style={{
                    background: 'rgba(248,242,232,0.97)',
                    padding: '6px 6px 24px 6px',
                    transform: `rotate(${rotate})`,
                    boxShadow: '4px 6px 20px rgba(0,0,0,0.5)',
                    width: 'clamp(90px, 13vw, 140px)',
                    borderRadius: 2,
                  }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    {photo ? (
                      <Image src={photo} alt={name} fill className="object-cover grayscale" sizes="140px" />
                    ) : (
                      <PhotoPlaceholder label={name} accent={accent} />
                    )}
                  </div>
                </div>
                <p className="font-playfair italic font-bold mt-2"
                  style={{ fontSize: 'clamp(0.8rem, 2.2vw, 1.1rem)', color: 'white', textShadow: '1px 2px 6px rgba(0,0,0,0.7)' }}>
                  {name}
                </p>
                <span style={{ fontSize: 11, color: 'rgba(200,150,50,0.7)' }}>★</span>
              </div>
            ))}
          </div>

          {/* Bottom: quote */}
          <p
            className="font-playfair italic text-center"
            style={{
              fontSize: 'clamp(0.6rem, 1.3vw, 0.8rem)',
              color: 'rgba(255,210,210,0.6)',
              lineHeight: 1.6,
              maxWidth: 360,
              margin: '0 auto',
            }}
          >
            {quoteBottom}
          </p>
        </div>
      </div>
    </header>
  )
}
