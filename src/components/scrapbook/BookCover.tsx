'use client'

import Image from 'next/image'

export type Template = 'standard' | 'spiral' | 'binder'
export type TitlePos = 'top' | 'bottom' | 'left' | 'right' | 'hidden'

interface Props {
  title: string
  coverUrl: string | null
  pageCount: number
  template: Template
  titlePos: TitlePos
}

export default function BookCover({ title, coverUrl, pageCount, template, titlePos }: Props) {
  if (template === 'spiral') return <SpiralCover title={title} coverUrl={coverUrl} pageCount={pageCount} titlePos={titlePos} />
  if (template === 'binder') return <BinderCover title={title} coverUrl={coverUrl} pageCount={pageCount} titlePos={titlePos} />
  return <StandardCover title={title} coverUrl={coverUrl} pageCount={pageCount} titlePos={titlePos} />
}

// ─── Title overlay ────────────────────────────────────────────────────────────

function TitleOverlay({ title, pageCount, titlePos }: { title: string; pageCount: number; titlePos: TitlePos }) {
  if (titlePos === 'hidden') return null

  const posStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    padding: '6px 8px',
    textAlign: 'center',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
    backdropFilter: 'blur(0px)',
    width: '100%',
    left: 0,
  }

  if (titlePos === 'top') {
    posStyle.top = 0
    posStyle.background = 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)'
  } else if (titlePos === 'bottom') {
    posStyle.bottom = 0
  } else if (titlePos === 'left' || titlePos === 'right') {
    posStyle.top = '50%'
    posStyle.transform = 'translateY(-50%)'
    posStyle.background = 'rgba(0,0,0,0.45)'
    posStyle.width = 'auto'
    posStyle.left = titlePos === 'left' ? 0 : 'auto'
    posStyle.right = titlePos === 'right' ? 0 : 'auto'
    posStyle.maxWidth = '60%'
    posStyle.borderRadius = titlePos === 'left' ? '0 8px 8px 0' : '8px 0 0 8px'
  }

  return (
    <div style={posStyle}>
      <p style={{ color: 'white', fontSize: 11, fontWeight: 600, fontFamily: 'serif', margin: 0, lineHeight: 1.3 }}>
        {title}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, margin: 0 }}>{pageCount} hal</p>
    </div>
  )
}

// ─── Standard — buku biasa dengan spine di kiri ───────────────────────────────

function StandardCover({ title, coverUrl, pageCount, titlePos }: Omit<Props, 'template'>) {
  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '133%' }}>
      {/* Stack halaman di kanan (efek ketebalan) */}
      {[8, 5, 2].map((offset, i) => (
        <div key={i} style={{
          position: 'absolute', top: offset, right: -offset, bottom: -offset,
          left: offset * 2,
          background: '#f0ebe5',
          borderRadius: '2px 6px 6px 2px',
          boxShadow: '1px 1px 3px rgba(0,0,0,0.15)',
          zIndex: i,
        }} />
      ))}

      {/* Spine */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 14,
        background: 'linear-gradient(to right, #b06060, #c97a7a)',
        borderRadius: '4px 0 0 4px',
        boxShadow: '2px 0 6px rgba(0,0,0,0.3)',
        zIndex: 5,
      }} />

      {/* Cover */}
      <div style={{
        position: 'absolute', inset: 0, left: 14,
        background: '#fdf0f0',
        borderRadius: '0 6px 6px 0',
        overflow: 'hidden',
        boxShadow: '4px 4px 15px rgba(0,0,0,0.25)',
        zIndex: 5,
      }}>
        {coverUrl && (
          <Image src={coverUrl} alt={title} fill className="object-cover" sizes="200px" />
        )}
        {!coverUrl && (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #fce8e8 0%, #f5d0d0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 32 }}>📖</span>
          </div>
        )}
        <TitleOverlay title={title} pageCount={pageCount} titlePos={titlePos} />
      </div>
    </div>
  )
}

// ─── Spiral — buku spiral dengan rings di kiri ────────────────────────────────

function SpiralCover({ title, coverUrl, pageCount, titlePos }: Omit<Props, 'template'>) {
  const ringCount = 12
  const rings = Array.from({ length: ringCount })

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '133%' }}>
      {/* Badan buku */}
      <div style={{
        position: 'absolute', inset: 0, left: 18,
        background: '#fff',
        borderRadius: '0 8px 8px 0',
        overflow: 'hidden',
        boxShadow: '4px 4px 20px rgba(0,0,0,0.2)',
      }}>
        {coverUrl && (
          <Image src={coverUrl} alt={title} fill className="object-cover" sizes="200px" />
        )}
        {!coverUrl && (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 32 }}>📓</span>
          </div>
        )}
        <TitleOverlay title={title} pageCount={pageCount} titlePos={titlePos} />
      </div>

      {/* Strip putih di kiri biar rings tidak overlap konten */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 22,
        background: '#f8f8f8',
        zIndex: 6,
      }} />

      {/* Rings spiral */}
      {rings.map((_, i) => {
        const pct = ((i + 0.5) / ringCount) * 100
        return (
          <div key={i} style={{
            position: 'absolute',
            left: 6,
            top: `calc(${pct}% - 7px)`,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d0d0d0 0%, #a8a8a8 40%, #e8e8e8 70%, #b0b0b0 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.5)',
            zIndex: 7,
          }}>
            {/* Inner hole */}
            <div style={{
              position: 'absolute', top: '25%', left: '25%',
              width: '50%', height: '50%',
              borderRadius: '50%',
              background: '#888',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
            }} />
          </div>
        )
      })}
    </div>
  )
}

// ─── Binder — ring binder kulit tebal ─────────────────────────────────────────

function BinderCover({ title, coverUrl, pageCount, titlePos }: Omit<Props, 'template'>) {
  const ringCount = 5

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '133%' }}>
      {/* Body binder — kulit tebal */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #e8b4b8 0%, #d4919a 30%, #c97a84 60%, #d4919a 100%)',
        borderRadius: 10,
        boxShadow: '0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
      }}>
        {/* Texture kulit */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 10,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }} />

        {/* Inner panel (area konten) */}
        <div style={{
          position: 'absolute',
          top: 8, left: 28, right: 8, bottom: 8,
          background: '#fff',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)',
        }}>
          {coverUrl && (
            <Image src={coverUrl} alt={title} fill className="object-cover" sizes="200px" />
          )}
          {!coverUrl && (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 32 }}>📁</span>
            </div>
          )}
          <TitleOverlay title={title} pageCount={pageCount} titlePos={titlePos} />
        </div>

        {/* Ring spine strip di kiri */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 26,
          background: 'linear-gradient(to right, #b06070, #c97a84)',
          borderRadius: '10px 0 0 10px',
          boxShadow: '2px 0 6px rgba(0,0,0,0.2)',
        }} />

        {/* D-rings */}
        {Array.from({ length: ringCount }).map((_, i) => {
          const pct = 15 + (i / (ringCount - 1)) * 70
          return (
            <div key={i} style={{
              position: 'absolute',
              left: 8,
              top: `calc(${pct}% - 11px)`,
              width: 22,
              height: 22,
              zIndex: 8,
            }}>
              {/* Ring outer */}
              <div style={{
                width: 22, height: 22,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c8c8c8 0%, #888 40%, #e0e0e0 70%, #aaa 100%)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Ring inner hole */}
                <div style={{
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #555, #777)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
                }} />
              </div>
            </div>
          )
        })}

        {/* Clasp di kanan tengah */}
        <div style={{
          position: 'absolute',
          right: -4,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 16,
          height: 28,
          background: 'linear-gradient(to right, #c8c8c8, #e8e8e8, #b0b0b0)',
          borderRadius: '0 6px 6px 0',
          boxShadow: '2px 0 6px rgba(0,0,0,0.3)',
          zIndex: 9,
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 8, height: 8,
            borderRadius: '50%',
            background: '#999',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
          }} />
        </div>
      </div>
    </div>
  )
}
