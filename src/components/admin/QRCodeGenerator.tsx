'use client'

import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Printer, Heart } from 'lucide-react'

interface Props {
  siteUrl: string
}

export default function QRCodeGenerator({ siteUrl }: Props) {
  const [url, setUrl] = useState(siteUrl)
  const [color, setColor] = useState('#8b2020')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [label, setLabel] = useState('Scan untuk membuka')
  const [sublabel, setSublabel] = useState('Luqrev — A private space just for us 💕')
  const [shape, setShape] = useState<'square' | 'heart'>('heart')
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=600,height=700')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code — Luqrev</title>
        <style>
          body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: white; font-family: serif; }
          .container { text-align: center; padding: 40px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="container">${content}</div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `)
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

    const size = 400
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

  // Heart clip-path for SVG (normalized 0-100)
  const heartClipPath = `
    M 50,85
    C 50,85 5,55 5,30
    C 5,15 17,5 30,5
    C 38,5 45,10 50,17
    C 55,10 62,5 70,5
    C 83,5 95,15 95,30
    C 95,55 50,85 50,85 Z
  `

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-playfair text-2xl text-rose-800">QR Code Luqrev</h1>
      <p className="text-rose-400 text-sm">Generate QR code untuk dibagikan atau dicetak. Scan akan langsung ke halaman masuk web.</p>

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
                style={{
                  background: shape === s ? '#8b2020' : '#f5e8e8',
                  color: shape === s ? 'white' : '#6b2020',
                }}>
                {s === 'square' ? '⬛ Kotak' : '❤️ Hati'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl p-6 border border-rose-100 flex flex-col items-center gap-4">
        <h2 className="font-medium text-rose-700 self-start">Preview</h2>

        <div ref={printRef} style={{ textAlign: 'center', padding: 16 }}>
          {/* Label atas */}
          {label && (
            <p style={{ fontFamily: 'serif', fontSize: '1rem', color: color, marginBottom: 12, fontWeight: 600 }}>
              {label}
            </p>
          )}

          {/* QR Code */}
          {shape === 'square' ? (
            <QRCodeSVG
              value={url || 'https://example.com'}
              size={220}
              fgColor={color}
              bgColor={bgColor}
              level="H"
              includeMargin
            />
          ) : (
            // Heart-shaped QR using SVG clipPath
            <svg width="220" height="220" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="heartQR">
                  <path d={heartClipPath}/>
                </clipPath>
              </defs>
              {/* Background */}
              <rect width="100" height="100" fill={bgColor}/>
              {/* Heart fill */}
              <path d={heartClipPath} fill={bgColor} stroke={color} strokeWidth="1"/>
              {/* QR code clipped to heart */}
              <foreignObject width="100" height="100" clipPath="url(#heartQR)">
                <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QRCodeSVG
                    value={url || 'https://example.com'}
                    size={100}
                    fgColor={color}
                    bgColor="transparent"
                    level="H"
                  />
                </div>
              </foreignObject>
              {/* Heart border overlay */}
              <path d={heartClipPath} fill="none" stroke={color} strokeWidth="1.5"/>
            </svg>
          )}

          {/* Label bawah */}
          {sublabel && (
            <p style={{ fontFamily: 'serif', fontSize: '0.75rem', color: '#888', marginTop: 12 }}>
              {sublabel}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap justify-center w-full">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:scale-[1.02]"
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
