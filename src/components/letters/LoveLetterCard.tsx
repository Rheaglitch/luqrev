'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Download, X } from 'lucide-react'

interface Letter {
  id: string
  title: string
  content: string
  letter_date: string
  to_name?: string | null
  from_name?: string | null
  greeting?: string | null
  stamp1_url?: string | null
  stamp2_url?: string | null
}

interface Props {
  letter: Letter
  onClose: () => void
}

export default function LoveLetterCard({ letter, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const date = new Date(letter.letter_date)
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`

  const handleDownload = async () => {
    const { toPng } = await import('html-to-image')
    const { jsPDF } = await import('jspdf')
    if (!cardRef.current) return

    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH)
      pdf.save(`${letter.title || 'love-letter'}.pdf`)
    } catch (e) {
      console.error(e)
      alert('Gagal download PDF.')
    }
  }

  const handleDownloadImage = async () => {
    const { toPng } = await import('html-to-image')
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${letter.title || 'love-letter'}.png`
      a.click()
    } catch (e) {
      console.error(e)
      alert('Gagal download gambar.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto py-6 px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4 w-full max-w-sm justify-end">
        <button onClick={handleDownloadImage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <Download className="w-3.5 h-3.5" /> PNG
        </button>
        <button onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <Download className="w-3.5 h-3.5" /> PDF
        </button>
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* The letter card itself */}
      <div
        ref={cardRef}
        className="w-full max-w-sm"
        style={{
          background: '#f5f0e8',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          padding: '0',
          position: 'relative',
        }}
      >
        {/* Perforated border using SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <rect
            x="12" y="12"
            width="calc(100% - 24px)" height="calc(100% - 24px)"
            fill="none"
            stroke="#c8b8a2"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            rx="2"
          />
        </svg>

        {/* Inner content */}
        <div className="relative z-10 px-8 py-8">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#8b2020',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              A Love Letter
            </h1>
          </div>

          {/* TO / FROM + Stamps */}
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              {(letter.to_name || letter.from_name) ? (
                <>
                  {letter.to_name && (
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'var(--font-lato)', fontSize: '0.65rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>To:</span>
                      <span style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '1.1rem', color: '#8b2020' }}>{letter.to_name}</span>
                    </div>
                  )}
                  {letter.from_name && (
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'var(--font-lato)', fontSize: '0.65rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>From:</span>
                      <span style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '1.1rem', color: '#8b2020' }}>{letter.from_name}</span>
                    </div>
                  )}
                </>
              ) : <div />}
            </div>

          {/* Stamps — tampil langsung tanpa border/postage */}
          <div className="flex gap-3 flex-shrink-0">
            {[letter.stamp1_url, letter.stamp2_url].map((s, i) =>
              s ? (
                <div key={i} className="relative flex-shrink-0" style={{ width: 52, height: 64 }}>
                  <Image src={s} alt="stamp" fill className="object-contain" sizes="52px" />
                </div>
              ) : null
            )}
          </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #c8b8a2', marginBottom: 16 }} />

          {/* Title */}
          {letter.title && (
            <div className="text-center mb-4">
              <h2 style={{
                fontFamily: 'var(--font-dancing), cursive',
                fontSize: '1.5rem',
                color: '#8b2020',
                lineHeight: 1.3,
              }}>
                {letter.title}
              </h2>
            </div>
          )}

          {/* Content */}
          <div style={{
            fontFamily: 'var(--font-dancing), cursive',
            fontSize: '0.95rem',
            color: '#6b2020',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            minHeight: 80,
          }}>
            {letter.content}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #c8b8a2', margin: '16px 0' }} />

          {/* Footer */}
          <div className="flex items-end justify-between">
            <span style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '0.9rem',
              color: '#8b2020',
              fontWeight: 600,
            }}>
              {dateStr}
            </span>

            {letter.greeting && (
              <div className="text-center">
                <p style={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '1rem', color: '#8b2020' }}>
                  {letter.greeting}
                </p>
              </div>
            )}

            {/* Postmark stamp */}
            <div style={{
              width: 48, height: 48,
              borderRadius: '50%',
              border: '2px solid rgba(139,32,32,0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
            }}>
              <div style={{ width: '80%', borderTop: '1px solid #8b2020', marginBottom: 2 }} />
              <div style={{ width: '60%', borderTop: '1px solid #8b2020', marginBottom: 2 }} />
              <div style={{ width: '80%', borderTop: '1px solid #8b2020' }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
