'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import type { ThemeColor } from '@/lib/theme'
import { THEME_TOKENS } from '@/lib/theme'

const MusicPlayer = dynamic(() => import('./MusicPlayer'), { ssr: false })

interface Props {
  settings: Record<string, string>
  theme: ThemeColor
}

function getDayCount(start: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 86400000))
}

function PhotoPlaceholder({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: 'linear-gradient(135deg,#4a1010,#2a0808)' }}>
      <span style={{ fontSize: 24, color: accent, opacity: 0.5 }}>♥</span>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    </div>
  )
}

export default function LoveHeader({ settings, theme }: Props) {
  const [days, setDays] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const t = THEME_TOKENS[theme]
  const accent = t.accent

  useEffect(() => {
    if (settings.relationship_start) setDays(getDayCount(settings.relationship_start))
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [settings.relationship_start])

  const p1          = settings.partner1_name       ?? 'Revalin'
  const p2          = settings.partner2_name       ?? 'Luqman'
  const title       = settings.header_title        ?? 'Best Couple'
  const quoteBottom = settings.header_quote_bottom ?? 'Two people who met because of fate, I hope we will always be together'
  const photoLeft1  = settings.header_photo_left1  || null
  const photoLeft2  = settings.header_photo_left2  || null
  const photoRight1 = settings.header_photo_right1 || null
  const photoRight2 = settings.header_photo_right2 || null
  const musicTitle   = settings.music_title     ?? ''
  const musicArtist  = settings.music_artist    ?? ''
  const musicUrl     = settings.music_url       ?? ''
  const musicCover   = settings.music_cover_url ?? ''
  const hasMusicInfo = musicTitle || musicUrl

  // ── Shared elements ──────────────────────────────────────────────────────

  const heartDecorations = [
    { top:'8%', left:'40%', size:18 }, { top:'22%', left:'44%', size:14 },
    { top:'55%', left:'42%', size:15 }, { top:'12%', left:'60%', size:14 },
    { top:'35%', left:'66%', size:17 }, { top:'62%', left:'72%', size:13 },
    { top:'80%', left:'78%', size:15 }, { top:'5%',  left:'82%', size:14 },
  ]

  const headerBg = `
    radial-gradient(ellipse at 20% 50%, rgba(120,20,20,0.65) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 30%, rgba(80,5,5,0.5) 0%, transparent 55%),
    #5c0f0f
  `

  // Photo collage (left side)
  const PhotoCollage = () => (
    <div className="flex flex-col gap-3">
      {/* Photo 1 — landscape */}
      <div style={{
        position: 'relative', aspectRatio: '16/9',
        border: '3px solid rgba(255,255,255,0.9)',
        boxShadow: '4px 6px 20px rgba(0,0,0,0.6)',
        transform: 'rotate(-1deg)', borderRadius: 3, overflow: 'hidden',
      }}>
        {photoLeft1
          ? <Image src={photoLeft1} alt={p1} fill className="object-cover grayscale" sizes="(max-width:640px) 90vw, 42vw"/>
          : <PhotoPlaceholder label="Foto 1" accent={accent}/>}
      </div>

      {/* Photo 2 + accent */}
      <div className="flex gap-3">
        <div style={{ position:'relative', flex:1, aspectRatio:'4/3',
          border:'3px solid rgba(255,255,255,0.9)', boxShadow:'4px 6px 20px rgba(0,0,0,0.6)',
          transform:'rotate(1.5deg)', borderRadius:3, overflow:'hidden' }}>
          {photoLeft2
            ? <Image src={photoLeft2} alt={p2} fill className="object-cover grayscale" sizes="(max-width:640px) 60vw, 28vw"/>
            : <PhotoPlaceholder label="Foto 2" accent={accent}/>}
        </div>
        <div style={{ position:'relative', flexShrink:0, width:'28%', aspectRatio:'3/4',
          border:'2px solid rgba(255,255,255,0.8)', boxShadow:'3px 5px 14px rgba(0,0,0,0.5)',
          transform:'rotate(-2deg)', borderRadius:3, overflow:'hidden', background:'#3d0c0c' }}>
          {photoLeft1
            ? <Image src={photoLeft1} alt="" fill className="object-cover grayscale" sizes="15vw"/>
            : <div className="w-full h-full flex items-center justify-center" style={{background:'linear-gradient(135deg,#4a1010,#2a0808)'}}>
                <span style={{fontSize:16, color:accent, opacity:0.5}}>♥</span>
              </div>}
        </div>
      </div>

      {/* Script text */}
      <div>
        <p className="font-playfair italic font-bold"
          style={{ fontSize: isMobile ? '1.2rem' : '1.7rem', color:'white', textShadow:'1px 3px 8px rgba(0,0,0,0.8)' }}>
          Love
        </p>
        <p style={{ fontSize:'0.7rem', color:'rgba(255,200,200,0.6)', fontStyle:'italic' }}>in wind, lost in gravity</p>
      </div>
      <p style={{ fontSize:'0.55rem', color:'rgba(255,200,200,0.4)', fontStyle:'italic', lineHeight:1.6 }}>
        &ldquo;a sweet journey with you, coffee in the morning, warm hugs at night.&rdquo;
      </p>
    </div>
  )

  // Right panel (title + polaroids + music + quote)
  const RightPanel = () => (
    <div className="flex flex-col justify-between gap-4">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-playfair italic font-bold"
            style={{ fontSize: isMobile ? '1.8rem' : 'clamp(2.2rem,4.5vw,3.4rem)',
              color:'white', textShadow:'2px 4px 12px rgba(0,0,0,0.5)', lineHeight:1.1 }}>
            {title}
          </h1>
          {days > 0 && (
            <p style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', color:'rgba(255,200,200,0.75)', marginTop:4 }}>
              ♥ {days} hari bersama
            </p>
          )}
        </div>
        <span style={{ fontSize:16, color:'rgba(255,170,170,0.45)', marginTop:6 }}>♥</span>
      </div>

      {/* Polaroids */}
      <div className="flex gap-3 sm:gap-6 justify-center items-end">
        {[{photo:photoRight1,name:p1,rotate:'-2.5deg'},{photo:photoRight2,name:p2,rotate:'2deg'}].map(({photo,name,rotate})=>(
          <div key={name} className="flex flex-col items-center">
            <div style={{
              background:'rgba(248,242,232,0.97)',
              padding: isMobile ? '5px 5px 20px 5px' : '7px 7px 28px 7px',
              transform:`rotate(${rotate})`,
              boxShadow:'4px 6px 20px rgba(0,0,0,0.5)',
              width: isMobile ? 'clamp(80px,22vw,110px)' : 'clamp(100px,14vw,160px)',
              borderRadius:2, overflow:'hidden',
            }}>
              <div style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden' }}>
                {photo
                  ? <Image src={photo} alt={name} fill className="object-cover grayscale" sizes="160px"/>
                  : <PhotoPlaceholder label={name} accent={accent}/>}
              </div>
              <p className="font-playfair italic font-semibold text-center"
                style={{ fontSize: isMobile ? '0.7rem' : '0.85rem', color:'#3d0c0c', marginTop:3 }}>
                {name}
              </p>
            </div>
            <span style={{ fontSize:11, color:'rgba(200,150,50,0.7)', marginTop:6 }}>★</span>
          </div>
        ))}
      </div>

      {/* Music player */}
      {hasMusicInfo && (
        <MusicPlayer title={musicTitle||'Our Song'} artist={musicArtist} audioUrl={musicUrl} coverUrl={musicCover} accent={accent}/>
      )}

      {/* Quote */}
      <p className="font-playfair italic text-center"
        style={{ fontSize: isMobile ? '0.65rem' : 'clamp(0.7rem,1.4vw,0.9rem)',
          color:'rgba(255,210,210,0.6)', lineHeight:1.7, maxWidth:380, margin:'0 auto' }}>
        {quoteBottom}
      </p>
    </div>
  )

  // ── Mobile layout: vertical stack ────────────────────────────────────────
  if (isMobile) {
    return (
      <header className="relative w-full overflow-hidden" style={{ background: headerBg }}>
        {/* Hearts */}
        {heartDecorations.slice(0,5).map((h,i)=>(
          <span key={i} className="absolute pointer-events-none select-none"
            style={{ top:h.top, left:h.left, fontSize:h.size, color:'rgba(255,170,170,0.4)' }}>♥</span>
        ))}

        <div className="relative z-10 px-4 pt-6 pb-4 space-y-5">
          {/* Title + days at top */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-playfair italic font-bold text-white"
                style={{ fontSize:'1.9rem', textShadow:'2px 3px 10px rgba(0,0,0,0.6)', lineHeight:1.1 }}>
                {title}
              </h1>
              {days > 0 && (
                <p style={{ fontSize:'0.75rem', color:'rgba(255,200,200,0.75)', marginTop:3 }}>♥ {days} hari bersama</p>
              )}
            </div>
            <span style={{ fontSize:14, color:'rgba(255,170,170,0.4)' }}>♥</span>
          </div>

          {/* Photos row: collage left, polaroids right */}
          <div className="flex gap-3">
            {/* Left collage — 50% */}
            <div className="flex-1 flex flex-col gap-2">
              <div style={{ position:'relative', aspectRatio:'4/3',
                border:'2px solid rgba(255,255,255,0.88)', boxShadow:'3px 4px 12px rgba(0,0,0,0.5)',
                transform:'rotate(-1deg)', borderRadius:3, overflow:'hidden' }}>
                {photoLeft1
                  ? <Image src={photoLeft1} alt={p1} fill className="object-cover grayscale" sizes="45vw"/>
                  : <PhotoPlaceholder label="Foto 1" accent={accent}/>}
              </div>
              <div style={{ position:'relative', aspectRatio:'4/3',
                border:'2px solid rgba(255,255,255,0.88)', boxShadow:'3px 4px 12px rgba(0,0,0,0.5)',
                transform:'rotate(1.5deg)', borderRadius:3, overflow:'hidden' }}>
                {photoLeft2
                  ? <Image src={photoLeft2} alt={p2} fill className="object-cover grayscale" sizes="45vw"/>
                  : <PhotoPlaceholder label="Foto 2" accent={accent}/>}
              </div>
            </div>

            {/* Right polaroids — 45% */}
            <div className="flex-shrink-0 flex flex-col gap-2 items-center justify-center" style={{ width:'45%' }}>
              {[{photo:photoRight1,name:p1,rotate:'-2deg'},{photo:photoRight2,name:p2,rotate:'2deg'}].map(({photo,name,rotate})=>(
                <div key={name} className="flex flex-col items-center w-full">
                  <div style={{ background:'rgba(248,242,232,0.97)', padding:'4px 4px 16px 4px',
                    transform:`rotate(${rotate})`, boxShadow:'3px 4px 14px rgba(0,0,0,0.4)',
                    width:'100%', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ position:'relative', aspectRatio:'3/4', overflow:'hidden' }}>
                      {photo
                        ? <Image src={photo} alt={name} fill className="object-cover grayscale" sizes="40vw"/>
                        : <PhotoPlaceholder label={name} accent={accent}/>}
                    </div>
                    <p className="font-playfair italic font-semibold text-center"
                      style={{ fontSize:'0.65rem', color:'#3d0c0c', marginTop:2 }}>
                      {name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Music player */}
          {hasMusicInfo && (
            <MusicPlayer title={musicTitle||'Our Song'} artist={musicArtist} audioUrl={musicUrl} coverUrl={musicCover} accent={accent}/>
          )}

          {/* Quote */}
          <p className="font-playfair italic text-center"
            style={{ fontSize:'0.65rem', color:'rgba(255,210,210,0.55)', lineHeight:1.7 }}>
            {quoteBottom}
          </p>
        </div>
      </header>
    )
  }

  // ── Desktop layout: side by side ─────────────────────────────────────────
  return (
    <header className="relative w-full overflow-hidden" style={{ background: headerBg, minHeight:'100vh' }}>
      {/* Texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' x='0' y='0' fill='rgba(0,0,0,0.12)'/%3E%3Crect width='1' height='1' x='2' y='2' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E")`,
        backgroundSize:'4px 4px',
      }}/>

      {/* Hearts */}
      {heartDecorations.map((h,i)=>(
        <span key={i} className="absolute pointer-events-none select-none"
          style={{ top:h.top, left:h.left, fontSize:h.size, color:'rgba(255,170,170,0.5)' }}>♥</span>
      ))}

      <div className="relative z-10 flex min-h-screen">
        {/* Left */}
        <div className="flex-shrink-0 flex flex-col justify-center px-6 py-10" style={{ width:'44%' }}>
          <PhotoCollage/>
        </div>
        {/* Right */}
        <div className="flex-1 flex flex-col justify-between px-8 py-10">
          <RightPanel/>
        </div>
      </div>
    </header>
  )
}
