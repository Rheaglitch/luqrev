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
    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: 'linear-gradient(135deg, #4a1010, #2a0808)' }}>
      <span style={{ fontSize: 28, color: accent, opacity: 0.5 }}>♥</span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
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
          radial-gradient(ellipse at 20% 50%, rgba(120,20,20,0.65) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 30%, rgba(80,5,5,0.5) 0%, transparent 55%),
          #5c0f0f
        `,
        minHeight: '100vh',
      }}
    >
      {/* Fabric texture overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' x='0' y='0' fill='rgba(0,0,0,0.12)'/%3E%3Crect width='1' height='1' x='2' y='2' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E")`,
        backgroundSize: '4px 4px',
      }} />

      {/* ── Hearts decoration — bigger & brighter ── */}
      {[
        { top: '8%',  left: '40%', size: 20 },
        { top: '20%', left: '44%', size: 16 },
        { top: '38%', left: '38%', size: 18 },
        { top: '55%', left: '42%', size: 14 },
        { top: '72%', left: '36%', size: 17 },
        { top: '88%', left: '44%', size: 15 },
        { top: '12%', left: '58%', size: 16 },
        { top: '30%', left: '64%', size: 19 },
        { top: '50%', left: '70%', size: 15 },
        { top: '68%', left: '62%', size: 18 },
        { top: '82%', left: '75%', size: 14 },
        { top: '5%',  left: '80%', size: 17 },
        { top: '45%', left: '88%', size: 16 },
        { top: '75%', left: '90%', size: 14 },
      ].map((h, i) => (
        <span
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            top: h.top, left: h.left,
            fontSize: h.size,
            color: 'rgba(255,170,170,0.55)',
          }}
        >♥</span>
      ))}

      {/* ── MAIN LAYOUT ── */}
      <div className="relative z-10 flex min-h-screen">

        {/* ═══ LEFT — Photo collage ═══ */}
        <div
          className="flex-shrink-0 flex flex-col justify-center gap-5 px-6 py-10"
          style={{ width: '44%' }}
        >
          {/* Photo 1 — top, full width */}
          <div style={{
            position: 'relative',
            aspectRatio: '16/9',
            border: '3px solid rgba(255,255,255,0.9)',
            boxShadow: '5px 7px 24px rgba(0,0,0,0.6)',
            transform: 'rotate(-1.2deg)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            {photoLeft1 ? (
              <Image src={photoLeft1} alt={p1} fill className="object-cover grayscale" sizes="42vw" />
            ) : (
              <PhotoPlaceholder label="Foto 1" accent={accent} />
            )}
          </div>

          {/* Bottom row: Photo 2 + accent card */}
          <div className="flex gap-4 items-start">
            {/* Photo 2 */}
            <div style={{
              position: 'relative',
              flex: '1',
              aspectRatio: '4/3',
              border: '3px solid rgba(255,255,255,0.9)',
              boxShadow: '5px 7px 24px rgba(0,0,0,0.6)',
              transform: 'rotate(1.8deg)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              {photoLeft2 ? (
                <Image src={photoLeft2} alt={p2} fill className="object-cover grayscale" sizes="28vw" />
              ) : (
                <PhotoPlaceholder label="Foto 2" accent={accent} />
              )}
            </div>

            {/* Accent card — solid, uses photo1 */}
            <div style={{
              position: 'relative',
              flexShrink: 0,
              width: '30%',
              aspectRatio: '3/4',
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: '3px 5px 14px rgba(0,0,0,0.5)',
              transform: 'rotate(-2.5deg)',
              borderRadius: 3,
              overflow: 'hidden',
              background: '#3d0c0c',
            }}>
              {photoLeft1 ? (
                <Image src={photoLeft1} alt="" fill className="object-cover grayscale" sizes="15vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #4a1010, #2a0808)' }}>
                  <span style={{ fontSize: 20, color: accent, opacity: 0.55 }}>♥</span>
                </div>
              )}
            </div>
          </div>

          {/* Script text */}
          <div className="mt-1">
            <p className="font-playfair italic font-bold"
              style={{ fontSize: '1.75rem', color: 'white', textShadow: '1px 3px 10px rgba(0,0,0,0.8)' }}>
              Love
            </p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,200,200,0.65)', fontStyle: 'italic', marginTop: 2 }}>
              in wind, lost in gravity
            </p>
          </div>

          {/* Bottom quote */}
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,200,200,0.45)', fontStyle: 'italic', lineHeight: 1.6 }}>
            &ldquo;a sweet journey with you, coffee in the morning,<br />
            warm hugs at night, this is our love story.&rdquo;
          </p>
        </div>

        {/* ═══ RIGHT — Title + Polaroids + Quote ═══ */}
        <div className="flex-1 flex flex-col justify-between px-8 py-10">

          {/* TOP — Title */}
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="font-playfair italic font-bold"
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                  color: 'white',
                  textShadow: '2px 4px 14px rgba(0,0,0,0.55)',
                  lineHeight: 1.1,
                }}
              >
                {title}
              </h1>
              {days > 0 && (
                <p style={{ fontSize: '1rem', color: 'rgba(255,200,200,0.75)', marginTop: 8 }}>
                  ♥ {days} hari bersama
                </p>
              )}
            </div>
            <span style={{ fontSize: 20, color: 'rgba(255,170,170,0.5)', marginTop: 8 }}>♥</span>
          </div>

          {/* MIDDLE — Two polaroids, bigger, centered */}
          <div className="flex gap-6 justify-center items-end">
            {[
              { photo: photoRight1, name: p1, rotate: '-2.5deg' },
              { photo: photoRight2, name: p2, rotate:  '2deg'   },
            ].map(({ photo, name, rotate }) => (
              <div key={name} className="flex flex-col items-center">
                {/* Polaroid frame */}
                <div style={{
                  background: 'rgba(248,242,232,0.97)',
                  padding: '7px 7px 28px 7px',
                  transform: `rotate(${rotate})`,
                  boxShadow: '5px 7px 24px rgba(0,0,0,0.55)',
                  width: 'clamp(110px, 15vw, 170px)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                    {photo ? (
                      <Image src={photo} alt={name} fill className="object-cover grayscale" sizes="170px" />
                    ) : (
                      <PhotoPlaceholder label={name} accent={accent} />
                    )}
                  </div>
                  {/* Name inside polaroid caption area */}
                  <p className="font-playfair italic font-semibold text-center"
                    style={{ fontSize: '0.85rem', color: '#3d0c0c', marginTop: 4 }}>
                    {name}
                  </p>
                </div>
                {/* Star below */}
                <span style={{ fontSize: 13, color: 'rgba(200,150,50,0.75)', marginTop: 8 }}>★</span>
              </div>
            ))}
          </div>

          {/* BOTTOM — Quote */}
          <p
            className="font-playfair italic text-center"
            style={{
              fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
              color: 'rgba(255,210,210,0.65)',
              lineHeight: 1.7,
              maxWidth: 400,
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
