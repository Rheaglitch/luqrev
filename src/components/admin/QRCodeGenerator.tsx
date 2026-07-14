'use client'

import { useRef, useState, useTransition, useEffect, useMemo } from 'react'
import QRCodeLib from 'qrcode'
import { Download, Printer, Heart, Save } from 'lucide-react'
import { updateSettings } from '@/lib/actions/admin'

interface Props {
  settings: Record<string, string>
  fallbackUrl: string
}

export default function QRCodeGenerator({ settings, fallbackUrl }: Props) {
  const [url, setUrl]           = useState(settings.qr_url       || fallbackUrl)
  const [color, setColor]       = useState(settings.qr_color     || '#8b2020')
  const [bgColor, setBgColor]   = useState(settings.qr_bg_color  || '#ffffff')
  const [label, setLabel]       = useState(settings.qr_label     || 'Scan untuk membuka')
  const [sublabel, setSublabel] = useState(settings.qr_sublabel  || 'Luqrev — A private space just for us 💕')
  const [shape, setShape]       = useState<'square' | 'heart'>((settings.qr_shape as 'square' | 'heart') || 'heart')
  const [saved, setSaved]       = useState(false)
  const [isPending, startTransition] = useTransition()
  const printRef = useRef<HTMLDivElement>(null)

  const handleSave = () => {
    setSaved(false)
    const fd = new FormData()
    fd.set('qr_url',      url)
    fd.set('qr_label',    label)
    fd.set('qr_sublabel', sublabel)
    fd.set('qr_color',    color)
    fd.set('qr_bg_color', bgColor)
    fd.set('qr_shape',    shape)
    startTransition(async () => {
      await updateSettings(undefined, fd)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const handlePrint = () => {
    if (!printRef.current) return
    const svgEl = printRef.current.querySelector('svg')
    if (!svgEl) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgEl)
    const win = window.open('', '_blank', 'width=600,height=700')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>QR Code — Luqrev</title>
        <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:white;font-family:serif;gap:12px;}@media print{body{margin:0;}}</style>
      </head><body>
        ${label ? `<p style="font-family:serif;font-size:1rem;color:${color};font-weight:600;">${label}</p>` : ''}
        ${svgStr}
        ${sublabel ? `<p style="font-family:serif;font-size:0.75rem;color:#888;">${sublabel}</p>` : ''}
        <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>`)
    win.document.close()
  }

  const handleDownloadSVG = () => {
    if (!printRef.current) return
    const svgEl = printRef.current.querySelector('svg')
    if (!svgEl) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgEl)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'luqrev-qr.svg'
    a.click()
  }

  const handleDownloadPNG = async () => {
    if (!printRef.current) return
    const svgEl = printRef.current.querySelector('svg')
    if (!svgEl) return
    const size = 500
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgEl)
    const img = new window.Image()
    img.width = size; img.height = size
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))
    await new Promise(r => { img.onload = r })
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0, size, size)
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'luqrev-qr.png'
    a.click()
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-playfair text-2xl text-rose-800">QR Code Luqrev</h1>
      <p className="text-rose-400 text-sm">Generate QR code untuk dibagikan atau dicetak.</p>

      {/* Settings */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-4">
        <h2 className="font-medium text-rose-700">Pengaturan</h2>

        <div>
          <label className="block text-xs text-rose-400 mb-1">URL tujuan</label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300"/>
        </div>
        <div>
          <label className="block text-xs text-rose-400 mb-1">Teks label atas</label>
          <input value={label} onChange={e => setLabel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300"/>
        </div>
        <div>
          <label className="block text-xs text-rose-400 mb-1">Teks label bawah</label>
          <input value={sublabel} onChange={e => setSublabel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300"/>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-rose-400 mb-1">Warna QR</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-rose-200 cursor-pointer p-1"/>
              <input value={color} onChange={e => setColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none"/>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-rose-400 mb-1">Background</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-rose-200 cursor-pointer p-1"/>
              <input value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none"/>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-rose-400 mb-2">Bentuk QR</label>
          <div className="flex gap-2">
            {(['square', 'heart'] as const).map(s => (
              <button key={s} onClick={() => setShape(s)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: shape === s ? '#8b2020' : '#f5e8e8', color: shape === s ? 'white' : '#6b2020' }}>
                {s === 'square' ? '⬛ Kotak' : '❤️ Hati'}
              </button>
            ))}
          </div>
        </div>

        {/* ── SAVE BUTTON ── */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 hover:opacity-90"
          style={{ background: saved ? '#16a34a' : '#8b2020' }}
        >
          <Save className="w-4 h-4"/>
          {isPending ? 'Menyimpan...' : saved ? 'Tersimpan ✅' : 'Simpan Pengaturan QR'}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl p-6 border border-rose-100 flex flex-col items-center gap-4">
        <h2 className="font-medium text-rose-700 self-start">Preview</h2>

        <div ref={printRef} style={{ textAlign: 'center' }}>
          {label && (
            <p style={{ fontFamily: 'serif', fontSize: '1rem', color, marginBottom: 12, fontWeight: 600 }}>
              {label}
            </p>
          )}

          {shape === 'square'
            ? <SquareQR url={url} color={color} bgColor={bgColor} />
            : <HeartQR  url={url} color={color} bgColor={bgColor} />
          }

          {sublabel && (
            <p style={{ fontFamily: 'serif', fontSize: '0.75rem', color: '#888', marginTop: 12 }}>
              {sublabel}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap justify-center w-full">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: '#8b2020' }}>
            <Printer className="w-4 h-4"/> Cetak
          </button>
          <button onClick={handleDownloadPNG}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 border-[#c9a0a0] text-[#6b2020] hover:bg-[#f5e8e8] transition-colors">
            <Download className="w-4 h-4"/> Download PNG
          </button>
          <button onClick={handleDownloadSVG}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 border-[#c9a0a0] text-[#6b2020] hover:bg-[#f5e8e8] transition-colors">
            <Download className="w-4 h-4"/> Download SVG
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-rose-300 text-center">
          <Heart className="w-3 h-3 flex-shrink-0"/>
          <span>QR code mengarah ke halaman gate — pengunjung tetap perlu masukkan sandi</span>
        </div>
      </div>
    </div>
  )
}

// ─── helpers: get QR module matrix via qrcode lib ────────────────────────────

function useQRMatrix(url: string) {
  const [matrix, setMatrix] = useState<boolean[][]>([])
  useEffect(() => {
    try {
      const qr = QRCodeLib.create(url || 'https://example.com', { errorCorrectionLevel: 'H' })
      const size = qr.modules.size
      const data = qr.modules.data
      const rows: boolean[][] = []
      for (let r = 0; r < size; r++) {
        const row: boolean[] = []
        for (let c = 0; c < size; c++) {
          row.push(!!data[r * size + c])
        }
        rows.push(row)
      }
      setMatrix(rows)
    } catch {
      // invalid url, skip
    }
  }, [url])
  return matrix
}

// ─── Square QR — pure SVG rects ──────────────────────────────────────────────

function SquareQR({ url, color, bgColor }: { url: string; color: string; bgColor: string }) {
  const matrix = useQRMatrix(url)
  if (!matrix.length) return <div style={{ width: 220, height: 220, background: bgColor }} />

  const SIZE = 220
  const n = matrix.length
  const cell = SIZE / n
  const margin = cell * 2

  return (
    <svg width={SIZE + margin * 2} height={SIZE + margin * 2}
      viewBox={`0 0 ${SIZE + margin * 2} ${SIZE + margin * 2}`}
      xmlns="http://www.w3.org/2000/svg">
      <rect width={SIZE + margin * 2} height={SIZE + margin * 2} fill={bgColor} />
      {matrix.flatMap((row, r) =>
        row.map((on, c) => on ? (
          <rect key={`${r}-${c}`}
            x={margin + c * cell} y={margin + r * cell}
            width={cell} height={cell}
            fill={color} />
        ) : null)
      )}
    </svg>
  )
}

// ─── Heart QR ─────────────────────────────────────────────────────────────────
// - QR asli (kotak) di tengah, ukuran ~50% canvas, fully intact & scannable
// - Partikel acak menyerupai QR mengisi area hati di luar QR
// - Clear zone 2px di sekeliling QR agar scanner tidak confused
// - Border hati = bgColor (tidak kelihatan)

function HeartQR({ url, color, bgColor }: { url: string; color: string; bgColor: string }) {
  const matrix = useQRMatrix(url)

  const SIZE = 320

  // QR kotak di tengah — 50% dari SIZE agar tidak melewati batas hati
  const QR_DISPLAY = SIZE * 0.50
  const QR_X = (SIZE - QR_DISPLAY) / 2
  const QR_Y = (SIZE - QR_DISPLAY) / 2 - SIZE * 0.02  // sedikit ke atas agar center di hati

  // Clear zone di sekeliling QR (dalam px), partikel tidak boleh masuk ke sini
  const CLEAR = 6

  // Heart path
  const heartD = buildHeartPath(SIZE)

  // QR rects (asli, valid)
  const qrRects = useMemo(() => {
    if (!matrix.length) return []
    const n = matrix.length
    const cell = QR_DISPLAY / n
    const rects: { x: number; y: number; s: number }[] = []
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r][c]) {
          rects.push({ x: QR_X + c * cell, y: QR_Y + r * cell, s: cell })
        }
      }
    }
    return rects
  }, [matrix, QR_X, QR_Y, QR_DISPLAY])

  // Partikel dekoratif — acak, di dalam hati, di luar clear zone QR
  const PCELL = 5  // ukuran tiap partikel
  const particles = useMemo(() => {
    const pts: { x: number; y: number; r: number }[] = []
    const cols = Math.floor(SIZE / PCELL)
    const rows = Math.floor(SIZE / PCELL)
    let seed = 7
    const rng = (s: number) => { const x = Math.sin(s) * 9301 + 49297; return x - Math.floor(x) }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        seed++
        const tx = col * PCELL
        const ty = row * PCELL
        const cx = tx + PCELL / 2
        const cy = ty + PCELL / 2

        // Hanya di dalam hati
        if (!isInHeart(cx, cy, SIZE)) continue

        // Jangan masuk clear zone QR
        if (
          tx + PCELL > QR_X - CLEAR &&
          tx < QR_X + QR_DISPLAY + CLEAR &&
          ty + PCELL > QR_Y - CLEAR &&
          ty < QR_Y + QR_DISPLAY + CLEAR
        ) continue

        // ~50% density
        if (rng(seed) > 0.50) continue

        // radius rounded — variasi kecil biar natural
        const radius = PCELL * (0.15 + rng(seed + 500) * 0.25)
        pts.push({ x: tx, y: ty, r: radius })
      }
    }
    return pts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SIZE, PCELL, QR_X, QR_Y, QR_DISPLAY, CLEAR])

  if (!matrix.length) {
    return <div style={{ width: SIZE, height: SIZE, background: bgColor }} />
  }

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="hqr-clip">
          <path d={heartD} />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width={SIZE} height={SIZE} fill={bgColor} />

      {/* Partikel dekoratif — clipped ke hati, di luar clear zone QR */}
      <g clipPath="url(#hqr-clip)">
        {particles.map((p, i) => (
          <rect
            key={i}
            x={p.x} y={p.y}
            width={PCELL - 1} height={PCELL - 1}
            rx={p.r} ry={p.r}
            fill={color}
          />
        ))}
      </g>

      {/* Heart border — warna sama dengan background = tidak kelihatan */}
      <path d={heartD} fill="none" stroke={bgColor} strokeWidth="1.5" />

      {/* White background di belakang QR biar partikel tidak tembus */}
      <rect
        x={QR_X - CLEAR} y={QR_Y - CLEAR}
        width={QR_DISPLAY + CLEAR * 2} height={QR_DISPLAY + CLEAR * 2}
        fill={bgColor}
      />

      {/* QR asli — kotak, intact, scannable */}
      {qrRects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.s} height={r.s} fill={color} />
      ))}
    </svg>
  )
}

// ─── heart path & formula ─────────────────────────────────────────────────────

function buildHeartPath(S: number): string {
  const cx = S / 2
  return `
    M ${cx},${S * 0.85}
    C ${cx},${S * 0.85} ${S * 0.05},${S * 0.58} ${S * 0.05},${S * 0.35}
    C ${S * 0.05},${S * 0.14} ${S * 0.22},${S * 0.05} ${S * 0.37},${S * 0.05}
    C ${S * 0.46},${S * 0.05} ${S * 0.5},${S * 0.12} ${cx},${S * 0.22}
    C ${S * 0.5},${S * 0.12} ${S * 0.54},${S * 0.05} ${S * 0.63},${S * 0.05}
    C ${S * 0.78},${S * 0.05} ${S * 0.95},${S * 0.14} ${S * 0.95},${S * 0.35}
    C ${S * 0.95},${S * 0.58} ${cx},${S * 0.85} ${cx},${S * 0.85} Z
  `
}

function isInHeart(px: number, py: number, S: number): boolean {
  const nx = (px / S - 0.5) * 2
  const ny = -(py / S - 0.85) * 2.4
  return (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny * ny * ny < 0
}
