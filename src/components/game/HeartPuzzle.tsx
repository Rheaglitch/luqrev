'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Shuffle, Trophy } from 'lucide-react'

interface Props {
  onBack: () => void
  imageUrl?: string
}

const SIZE = 4                          // 4×4 grid
const TOTAL = SIZE * SIZE               // 16 cells
const EMPTY = TOTAL - 1                 // piece id 15 = empty slot
const PIECE_PX = 72                     // px per cell

// ── Solvability check ──────────────────────────────────────────────────────
// A 4×4 sliding puzzle is solvable if:
// (inversions even AND blank on odd row from bottom) OR
// (inversions odd  AND blank on even row from bottom)
function isSolvable(tiles: number[]): boolean {
  // Count inversions (ignore blank)
  let inv = 0
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === EMPTY) continue
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[j] === EMPTY) continue
      if (tiles[i] > tiles[j]) inv++
    }
  }
  const blankRow = Math.floor(tiles.indexOf(EMPTY) / SIZE)
  const blankFromBottom = SIZE - blankRow   // 1-indexed from bottom

  if (SIZE % 2 === 1) return inv % 2 === 0
  if (blankFromBottom % 2 === 0) return inv % 2 === 1
  return inv % 2 === 0
}

function generateSolvable(): number[] {
  const arr = Array.from({ length: TOTAL }, (_, i) => i)
  let shuffled: number[]
  do {
    // Fisher-Yates
    shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
  } while (!isSolvable(shuffled) || shuffled.every((v, i) => v === i))
  return shuffled
}

// ── Piece component ────────────────────────────────────────────────────────
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
  const col = pieceId % SIZE
  const row = Math.floor(pieceId / SIZE)
  const bgX = -(col * size)
  const bgY = -(row * size)
  const totalPx = SIZE * size

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
          ? `hsl(${(pieceId * 23) % 360}, 55%, 72%)`
          : undefined,
        cursor: isMovable ? 'pointer' : 'default',
        borderRadius: 3,
        border: isCorrect
          ? '2px solid rgba(100,200,100,0.5)'
          : '2px solid rgba(255,255,255,0.4)',
        boxShadow: isMovable
          ? '0 0 0 2px rgba(139,46,46,0.4), 0 2px 6px rgba(0,0,0,0.2)'
          : '0 1px 4px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.15s',
        userSelect: 'none',
      }}
    />
  )
}

// ── Main Game ──────────────────────────────────────────────────────────────
export default function HeartPuzzle({ onBack, imageUrl }: Props) {
  // tiles[position] = pieceId  (EMPTY = 15 = blank)
  const [tiles, setTiles] = useState<number[]>(() =>
    Array.from({ length: TOTAL }, (_, i) => i)  // solved state initially
  )
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)

  const emptyPos = tiles.indexOf(EMPTY)

  // Positions adjacent to a given position
  const adjacentTo = (pos: number): number[] => {
    const row = Math.floor(pos / SIZE)
    const col = pos % SIZE
    const result: number[] = []
    if (row > 0)        result.push(pos - SIZE)   // up
    if (row < SIZE - 1) result.push(pos + SIZE)   // down
    if (col > 0)        result.push(pos - 1)      // left
    if (col < SIZE - 1) result.push(pos + 1)      // right
    return result
  }

  const isMovable = (pos: number) => adjacentTo(pos).includes(emptyPos)

  const move = useCallback((pos: number) => {
    if (!isMovable(pos) || won) return
    const newTiles = [...tiles]
    ;[newTiles[pos], newTiles[emptyPos]] = [newTiles[emptyPos], newTiles[pos]]
    setTiles(newTiles)
    setMoves(m => m + 1)

    // Check win: every tile is in its correct position
    if (newTiles.every((v, i) => v === i)) {
      setTimeout(() => setWon(true), 150)
    }
  }, [tiles, emptyPos, won])

  const scramble = () => {
    setTiles(generateSolvable())
    setMoves(0)
    setWon(false)
    setStarted(true)
  }

  const correctCount = tiles.filter((v, i) => v === i && v !== EMPTY).length

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
          className="flex items-center gap-1 text-sm font-medium text-white px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: '#8b2e2e' }}
        >
          <Shuffle className="w-3.5 h-3.5" /> Acak
        </button>
      </div>

      {/* Stats */}
      {started && !won && (
        <div className="flex justify-center gap-6 text-sm text-[#a06060]">
          <span>Langkah: <strong className="text-[#3d0c0c]">{moves}</strong></span>
          <span>Benar: <strong className="text-[#3d0c0c]">{correctCount}/{TOTAL - 1}</strong></span>
        </div>
      )}

      {/* Win banner */}
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

      {/* Puzzle board */}
      <div className="flex justify-center">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${SIZE}, ${PIECE_PX}px)`,
            gridTemplateRows:    `repeat(${SIZE}, ${PIECE_PX}px)`,
            gap: 3,
            padding: 8,
            borderRadius: 16,
            background: '#f5e8e8',
            boxShadow: '0 4px 20px rgba(139,46,46,0.15)',
          }}
        >
          {tiles.map((pieceId, pos) => {
            if (pieceId === EMPTY) {
              // Empty slot
              return (
                <div
                  key={`empty-${pos}`}
                  style={{
                    width: PIECE_PX,
                    height: PIECE_PX,
                    borderRadius: 3,
                    background: 'rgba(139,46,46,0.08)',
                    border: '2px dashed rgba(139,46,46,0.2)',
                  }}
                />
              )
            }

            const movable = isMovable(pos)
            const correct = pieceId === pos

            return (
              <div
                key={pieceId}
                style={{
                  transition: 'transform 0.1s ease',
                  transform: movable ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <Piece
                  pieceId={pieceId}
                  imageUrl={imageUrl}
                  size={PIECE_PX}
                  onClick={() => move(pos)}
                  isMovable={movable}
                  isCorrect={correct}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Initial state hint */}
      {!started && (
        <p className="text-center text-sm text-[#a06060] font-playfair">
          Tekan <strong>Acak</strong> untuk mulai bermain ✨
        </p>
      )}
      {started && !won && (
        <p className="text-center text-xs text-[#c9a0a0]">
          Klik piece yang bersebelahan dengan kotak kosong untuk menggesernya
        </p>
      )}
    </div>
  )
}
