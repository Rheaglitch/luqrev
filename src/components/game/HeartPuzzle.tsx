'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Shuffle, Trophy } from 'lucide-react'

interface Props {
  onBack: () => void
  imageUrl?: string
}

/**
 * Sliding puzzle layout:
 *
 *  pos: 0  1  2  3
 *       4  5  6  7
 *       8  9  10 11
 *       12 13 14 15  [16]  ← slot kosong (pos 16) di kanan baris terakhir
 *
 * Piece id 0-15 = 16 potongan foto (grid 4×4 penuh)
 * Piece id 16   = kosong
 * Solved = tiles[i] === i untuk semua i 0-16
 */

const COLS = 4
const PHOTO_PIECES = 16      // 4×4
const TOTAL = 17             // 16 foto + 1 kosong
const EMPTY_ID = 16          // id kosong
const PIECE_PX = 70

// Koordinat (row, col) per posisi
function posToRC(pos: number): [number, number] {
  if (pos < 16) return [Math.floor(pos / COLS), pos % COLS]
  // pos 16 = baris 3, kolom 4 (di sebelah kanan baris terakhir)
  return [3, 4]
}

function isAdjacent(a: number, b: number): boolean {
  const [r1, c1] = posToRC(a)
  const [r2, c2] = posToRC(b)
  return (Math.abs(r1 - r2) === 1 && c1 === c2) ||
         (Math.abs(c1 - c2) === 1 && r1 === r2)
}

function generateSolvable(): number[] {
  const tiles = Array.from({ length: TOTAL }, (_, i) => i)
  let emptyPos = 16
  for (let i = 0; i < 500; i++) {
    const neighbors: number[] = []
    for (let p = 0; p < TOTAL; p++) {
      if (p !== emptyPos && isAdjacent(p, emptyPos)) neighbors.push(p)
    }
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)]
    ;[tiles[emptyPos], tiles[pick]] = [tiles[pick], tiles[emptyPos]]
    emptyPos = pick
  }
  if (tiles.every((v, i) => v === i)) return generateSolvable()
  return tiles
}

function Piece({ pieceId, imageUrl, size, onClick, isMovable }: {
  pieceId: number; imageUrl?: string; size: number
  onClick: () => void; isMovable: boolean
}) {
  const col = pieceId % COLS
  const row = Math.floor(pieceId / COLS)
  const totalPx = COLS * size
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size,
        backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
        backgroundSize: `${totalPx}px ${totalPx}px`,
        backgroundPosition: `${-(col * size)}px ${-(row * size)}px`,
        backgroundRepeat: 'no-repeat',
        backgroundColor: !imageUrl ? `hsl(${(pieceId * 22) % 360}, 50%, 72%)` : undefined,
        cursor: isMovable ? 'pointer' : 'default',
        borderRadius: 2,
        // Garis hampir tidak keliatan
        outline: '1px solid rgba(255,255,255,0.2)',
        boxShadow: isMovable ? 'inset 0 0 0 2px rgba(139,46,46,0.45)' : 'none',
        transition: 'box-shadow 0.1s',
        userSelect: 'none',
      }}
    />
  )
}

export default function HeartPuzzle({ onBack, imageUrl }: Props) {
  const [tiles, setTiles] = useState<number[]>(() => generateSolvable())
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  const emptyPos = tiles.indexOf(EMPTY_ID)

  const move = useCallback((pos: number) => {
    if (!isAdjacent(pos, emptyPos) || won) return
    const t = [...tiles]
    ;[t[pos], t[emptyPos]] = [t[emptyPos], t[pos]]
    setTiles(t)
    setMoves(m => m + 1)
    if (t.every((v, i) => v === i)) setTimeout(() => setWon(true), 150)
  }, [tiles, emptyPos, won])

  const scramble = () => {
    setTiles(generateSolvable())
    setMoves(0)
    setWon(false)
  }

  const correctCount = tiles.filter((v, i) => v === i && v !== EMPTY_ID).length

  // Build rows:
  // Row 0-2: cols 0-3 (pos 0-11)
  // Row 3: cols 0-3 (pos 12-15) + col 4 (pos 16, kosong)
  const rows: number[][] = [
    [0,1,2,3],
    [4,5,6,7],
    [8,9,10,11],
    [12,13,14,15,16],  // row terakhir + slot kosong
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="font-playfair text-base font-bold text-[#3d0c0c]">Puzzle Geser</span>
        <button onClick={scramble}
          className="flex items-center gap-1 text-sm font-medium text-white px-3 py-1.5 rounded-xl"
          style={{ background: '#8b2e2e' }}>
          <Shuffle className="w-3.5 h-3.5" /> Acak
        </button>
      </div>

      <div className="flex justify-center gap-6 text-sm text-[#a06060]">
        <span>Langkah: <strong className="text-[#3d0c0c]">{moves}</strong></span>
        <span>Benar: <strong className="text-[#3d0c0c]">{correctCount}/{PHOTO_PIECES}</strong></span>
      </div>

      {won && (
        <div className="text-center py-4 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}>
          <Trophy className="w-8 h-8 mx-auto mb-1 text-yellow-300" />
          <p className="font-playfair text-xl font-bold">Selesai dalam {moves} langkah! 🎉</p>
          <button onClick={scramble} className="mt-2 px-5 py-1.5 bg-white/20 rounded-full text-sm hover:bg-white/30">
            Main Lagi
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex justify-center overflow-x-auto">
        <div style={{
          padding: 5,
          borderRadius: 12,
          background: '#f5e8e8',
          boxShadow: '0 4px 20px rgba(139,46,46,0.1)',
          display: 'inline-block',
        }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 2, marginBottom: ri < rows.length - 1 ? 2 : 0 }}>
              {row.map(pos => {
                const pieceId = tiles[pos]
                const isEmpty = pieceId === EMPTY_ID
                const movable = isAdjacent(pos, emptyPos) && !won

                // Slot kosong
                if (isEmpty) {
                  return (
                    <div key={pos} style={{
                      width: PIECE_PX, height: PIECE_PX,
                      borderRadius: 2,
                      background: 'rgba(139,46,46,0.06)',
                      border: '1.5px dashed rgba(139,46,46,0.18)',
                    }} />
                  )
                }

                // Spacer: hanya baris terakhir perlu gap antara pos 15 dan 16
                // (tidak perlu, karena pos 16 langsung setelah 15 di row array)

                return (
                  <div key={pos} style={{ transform: movable ? 'scale(1.025)' : 'scale(1)', transition: 'transform 0.1s' }}>
                    <Piece
                      pieceId={pieceId}
                      imageUrl={imageUrl}
                      size={PIECE_PX}
                      onClick={() => move(pos)}
                      isMovable={movable}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-[#c9a0a0]">
        Klik piece bersebelahan dengan kotak kosong untuk menggeser
      </p>
    </div>
  )
}
