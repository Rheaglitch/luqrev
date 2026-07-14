'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Shuffle, Trophy } from 'lucide-react'

interface Props {
  onBack: () => void
  imageUrl?: string
}

/**
 * Sliding puzzle — 4×4 foto + 1 slot kosong di pojok kanan bawah (posisi ke-16)
 * Grid display: 4 kolom × 5 baris (baris ke-5 hanya posisi 16 di kolom ke-4)
 *
 * Layout posisi (0-indexed):
 *   0  1  2  3
 *   4  5  6  7
 *   8  9  10 11
 *   12 13 14 15
 *   -- -- -- 16  ← slot kosong ada di sini (posisi 16, baris 4 kolom 3)
 *
 * Piece id 0-15 = 16 potongan foto, id 16 = kosong
 * Solved = tiles[i] === i untuk semua i
 */

const COLS = 4
const PHOTO_ROWS = 4
const PHOTO_PIECES = COLS * PHOTO_ROWS   // 16
const TOTAL_POS = PHOTO_PIECES + 1       // 17 positions (pos 16 = extra slot kosong)
const EMPTY_ID = PHOTO_PIECES            // 16 = id kosong
const EMPTY_SOLVED_POS = PHOTO_PIECES    // kosong ada di posisi 16 saat selesai
const PIECE_PX = 68

// Total rows in display grid: baris extra untuk slot kosong
// Layout: positions 0-15 di baris 0-3, position 16 di baris 4 col 3
function getRowCol(pos: number): [number, number] {
  if (pos < PHOTO_PIECES) {
    return [Math.floor(pos / COLS), pos % COLS]
  }
  // position 16 = baris 4, kolom 3 (pojok kanan bawah)
  return [PHOTO_ROWS, COLS - 1]
}

// Cek apakah dua posisi bersebelahan (bisa tukar)
function isAdjacent(pos1: number, pos2: number): boolean {
  const [r1, c1] = getRowCol(pos1)
  const [r2, c2] = getRowCol(pos2)
  const dr = Math.abs(r1 - r2)
  const dc = Math.abs(c1 - c2)
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

// Solvability untuk puzzle 4×5 custom
// Kita gunakan pendekatan: shuffle via random moves dari solved state
function generateSolvable(): number[] {
  // Start from solved
  const tiles = Array.from({ length: TOTAL_POS }, (_, i) => i)
  let emptyPos = EMPTY_SOLVED_POS

  // Do 300 random moves
  for (let i = 0; i < 300; i++) {
    // Find positions adjacent to empty
    const neighbors: number[] = []
    for (let p = 0; p < TOTAL_POS; p++) {
      if (p !== emptyPos && isAdjacent(p, emptyPos)) {
        neighbors.push(p)
      }
    }
    // Pick random neighbor and swap
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)]
    ;[tiles[emptyPos], tiles[pick]] = [tiles[pick], tiles[emptyPos]]
    emptyPos = pick
  }

  // Make sure it's not already solved
  if (tiles.every((v, i) => v === i)) return generateSolvable()
  return tiles
}

// ── Piece component ──────────────────────────────────────────────────────────
function Piece({
  pieceId,
  imageUrl,
  size,
  onClick,
  isMovable,
  isCorrect,
}: {
  pieceId: number
  imageUrl?: string
  size: number
  onClick: () => void
  isMovable: boolean
  isCorrect: boolean
}) {
  const col = pieceId % COLS
  const row = Math.floor(pieceId / COLS)
  const bgX = -(col * size)
  const bgY = -(row * size)
  const totalPx = COLS * size   // 4 × size (square crop)

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
        backgroundSize: `${totalPx}px ${totalPx}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: 'no-repeat',
        backgroundColor: !imageUrl
          ? `hsl(${(pieceId * 22) % 360}, 50%, 72%)`
          : undefined,
        cursor: isMovable ? 'pointer' : 'default',
        borderRadius: 3,
        border: isCorrect && !isMovable
          ? '2px solid rgba(80,200,80,0.35)'
          : '2px solid rgba(255,255,255,0.45)',
        boxShadow: isMovable
          ? '0 0 0 2.5px rgba(139,46,46,0.5), 0 2px 8px rgba(0,0,0,0.25)'
          : '0 1px 4px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.12s, border-color 0.12s',
        userSelect: 'none',
      }}
    />
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function HeartPuzzle({ onBack, imageUrl }: Props) {
  const [tiles, setTiles] = useState<number[]>(() =>
    Array.from({ length: TOTAL_POS }, (_, i) => i)  // solved initially
  )
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)

  const emptyPos = tiles.indexOf(EMPTY_ID)

  const move = useCallback((pos: number) => {
    if (!isAdjacent(pos, emptyPos) || won) return
    const newTiles = [...tiles]
    ;[newTiles[pos], newTiles[emptyPos]] = [newTiles[emptyPos], newTiles[pos]]
    setTiles(newTiles)
    setMoves(m => m + 1)
    if (newTiles.every((v, i) => v === i)) setTimeout(() => setWon(true), 150)
  }, [tiles, emptyPos, won])

  const scramble = () => {
    setTiles(generateSolvable())
    setMoves(0)
    setWon(false)
    setStarted(true)
  }

  const correctCount = tiles.filter((v, i) => v === i && v !== EMPTY_ID).length

  // Build grid rows for rendering
  // Row 0-3: 4 cells each (positions 0-15)
  // Row 4: 3 empty spacers + position 16
  const rows: (number | null)[][] = []
  for (let r = 0; r < PHOTO_ROWS; r++) {
    rows.push([r*COLS, r*COLS+1, r*COLS+2, r*COLS+3])
  }
  rows.push([null, null, null, PHOTO_PIECES]) // last row: 3 spacers + slot 16

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="font-playfair text-base font-bold text-[#3d0c0c]">Puzzle Geser</span>
        <button
          onClick={scramble}
          className="flex items-center gap-1 text-sm font-medium text-white px-3 py-1.5 rounded-xl"
          style={{ background: '#8b2e2e' }}
        >
          <Shuffle className="w-3.5 h-3.5" /> Acak
        </button>
      </div>

      {/* Stats */}
      {started && !won && (
        <div className="flex justify-center gap-6 text-sm text-[#a06060]">
          <span>Langkah: <strong className="text-[#3d0c0c]">{moves}</strong></span>
          <span>Benar: <strong className="text-[#3d0c0c]">{correctCount}/{PHOTO_PIECES}</strong></span>
        </div>
      )}

      {/* Win */}
      {won && (
        <div className="text-center py-4 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}>
          <Trophy className="w-8 h-8 mx-auto mb-1 text-yellow-300" />
          <p className="font-playfair text-xl font-bold">Selesai dalam {moves} langkah! 🎉</p>
          <button onClick={scramble}
            className="mt-2 px-5 py-1.5 bg-white/20 rounded-full text-sm hover:bg-white/30">
            Main Lagi
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex justify-center overflow-x-auto">
        <div style={{
          padding: 6,
          borderRadius: 14,
          background: '#f5e8e8',
          boxShadow: '0 4px 20px rgba(139,46,46,0.12)',
          display: 'inline-block',
        }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 3, marginBottom: ri < rows.length - 1 ? 3 : 0 }}>
              {row.map((pos, ci) => {
                // Spacer for last row cols 0-2
                if (pos === null) {
                  return <div key={ci} style={{ width: PIECE_PX, height: PIECE_PX }} />
                }

                const pieceId = tiles[pos]
                const isEmpty = pieceId === EMPTY_ID
                const movable = isAdjacent(pos, emptyPos) && !won

                if (isEmpty) {
                  return (
                    <div
                      key={pos}
                      style={{
                        width: PIECE_PX,
                        height: PIECE_PX,
                        borderRadius: 3,
                        background: 'rgba(139,46,46,0.07)',
                        border: '2px dashed rgba(139,46,46,0.2)',
                      }}
                    />
                  )
                }

                return (
                  <div
                    key={pos}
                    style={{
                      transition: 'transform 0.1s',
                      transform: movable ? 'scale(1.03)' : 'scale(1)',
                    }}
                  >
                    <Piece
                      pieceId={pieceId}
                      imageUrl={imageUrl}
                      size={PIECE_PX}
                      onClick={() => move(pos)}
                      isMovable={movable}
                      isCorrect={pieceId === pos}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {!started && (
        <p className="text-center text-sm text-[#a06060] font-playfair">
          Tekan <strong>Acak</strong> untuk mulai ✨
        </p>
      )}
      {started && !won && (
        <p className="text-center text-xs text-[#c9a0a0]">
          Klik piece yang bersebelahan dengan kotak kosong untuk menggeser
        </p>
      )}
    </div>
  )
}
