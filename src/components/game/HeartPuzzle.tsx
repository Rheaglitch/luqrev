'use client'

import { useState, useCallback, useRef } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'

interface Props {
  onBack: () => void
  imageUrl?: string
}

// 4x4 grid = 16 pieces, heart shape mask per piece
// Heart is defined as which of the 16 cells (row 0-3, col 0-3) belong to the heart shape
const COLS = 4
const ROWS = 4
const TOTAL = COLS * ROWS

// Which grid cells are "inside" the heart shape (indices 0-15, row-major)
// Heart approximation on 4x4 grid:
//   Row 0: cols 1,2
//   Row 1: cols 0,1,2,3
//   Row 2: cols 0,1,2,3
//   Row 3: cols 1,2,3  (pointing down-right like a heart)
// Better heart:
//   Row 0: 1,2        (top bumps)
//   Row 1: 0,1,2,3    (full width)
//   Row 2: 0,1,2,3    (full width)
//   Row 3:   1,2      (bottom point)
const HEART_CELLS = new Set([1,2, 4,5,6,7, 8,9,10,11, 13,14])

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Each piece: { pieceId: original index, placedAt: slot index | null }
interface Piece {
  id: number       // original grid position (0-15)
  inContainer: boolean
}

export default function HeartPuzzle({ onBack, imageUrl }: Props) {
  const heartCells = Array.from(HEART_CELLS)

  // Container: shuffled list of piece IDs not yet placed
  const [containerPieces, setContainerPieces] = useState<number[]>(() =>
    shuffle(heartCells)
  )

  // Board: slot index → piece ID placed there (or null)
  const [board, setBoard] = useState<(number | null)[]>(() =>
    Array(TOTAL).fill(null)
  )

  const [dragging, setDragging] = useState<{ id: number; from: 'container' | number } | null>(null)
  const [won, setWon] = useState(false)

  const checkWin = useCallback((newBoard: (number | null)[]) => {
    for (const slot of heartCells) {
      if (newBoard[slot] !== slot) return false
    }
    return true
  }, [heartCells])

  // ── Drag handlers ────────────────────────────────────────────────────────

  const onDragStartContainer = (id: number) => {
    setDragging({ id, from: 'container' })
  }

  const onDragStartBoard = (slot: number, id: number) => {
    setDragging({ id, from: slot })
  }

  const onDropToSlot = (slot: number) => {
    if (!dragging) return
    if (!HEART_CELLS.has(slot)) return

    const newBoard = [...board]
    const newContainer = [...containerPieces]

    // Remove piece from source
    if (dragging.from === 'container') {
      const ci = newContainer.indexOf(dragging.id)
      if (ci !== -1) newContainer.splice(ci, 1)
    } else {
      // from another board slot — put displaced piece back
      const displaced = newBoard[dragging.from as number]
      if (displaced !== null) newContainer.push(displaced)
      newBoard[dragging.from as number] = null
    }

    // If slot occupied, send that piece back to container
    if (newBoard[slot] !== null) {
      newContainer.push(newBoard[slot]!)
    }

    newBoard[slot] = dragging.id
    setBoard(newBoard)
    setContainerPieces(newContainer)
    setDragging(null)

    if (checkWin(newBoard)) {
      setTimeout(() => setWon(true), 200)
    }
  }

  const onDropToContainer = () => {
    if (!dragging || dragging.from === 'container') { setDragging(null); return }
    const slot = dragging.from as number
    const newBoard = [...board]
    const newContainer = [...containerPieces]
    newContainer.push(dragging.id)
    newBoard[slot] = null
    setBoard(newBoard)
    setContainerPieces(newContainer)
    setDragging(null)
  }

  const bongkar = () => {
    setBoard(Array(TOTAL).fill(null))
    setContainerPieces(shuffle(heartCells))
    setWon(false)
  }

  // Piece visual: shows the portion of the image corresponding to its grid position
  const PieceView = ({ id, size }: { id: number; size: number }) => {
    const row = Math.floor(id / COLS)
    const col = id % COLS
    const bgX = -(col * size)
    const bgY = -(row * size)
    const totalW = COLS * size
    const totalH = ROWS * size

    return (
      <div
        style={{
          width: size, height: size,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: `${totalW}px ${totalH}px`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundRepeat: 'no-repeat',
          background: !imageUrl
            ? `hsl(${(id * 23) % 360}, 65%, 70%)`
            : undefined,
          ...(imageUrl ? {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${totalW}px ${totalH}px`,
            backgroundPosition: `${bgX}px ${bgY}px`,
          } : {}),
          borderRadius: 4,
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          cursor: 'grab',
          userSelect: 'none',
        }}
      />
    )
  }

  const SLOT_SIZE = 64
  const PIECE_SIZE = 56

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="font-playfair text-base font-bold text-[#3d0c0c]">Puzzle Hati 🧩</span>
        <button onClick={bongkar} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <RotateCcw className="w-3.5 h-3.5" /> Bongkar
        </button>
      </div>

      {/* Win */}
      {won && (
        <div className="text-center py-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)', color: 'white' }}>
          <Trophy className="w-8 h-8 mx-auto mb-1 text-yellow-300" />
          <p className="font-playfair text-xl font-bold">Puzzle Selesai! 🎉</p>
          <button onClick={bongkar} className="mt-2 px-5 py-1.5 bg-white/20 rounded-full text-sm hover:bg-white/30">
            Main Lagi
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex justify-center">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, ${SLOT_SIZE}px)`, gap: 4 }}
        >
          {Array.from({ length: TOTAL }).map((_, slot) => {
            const inHeart = HEART_CELLS.has(slot)
            const piece = board[slot]
            return (
              <div
                key={slot}
                onDragOver={inHeart ? (e) => e.preventDefault() : undefined}
                onDrop={inHeart ? () => onDropToSlot(slot) : undefined}
                style={{
                  width: SLOT_SIZE, height: SLOT_SIZE,
                  borderRadius: 6,
                  background: inHeart
                    ? piece !== null ? 'transparent' : 'rgba(139,46,46,0.12)'
                    : 'transparent',
                  border: inHeart && !piece ? '1.5px dashed rgba(139,46,46,0.25)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {piece !== null && (
                  <div
                    draggable
                    onDragStart={() => onDragStartBoard(slot, piece)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <PieceView id={piece} size={PIECE_SIZE} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-[#a06060]">
        {containerPieces.length} potongan tersisa
      </p>

      {/* Container */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropToContainer}
        className="min-h-24 rounded-2xl border-2 border-dashed border-[#c9a0a0] p-3"
        style={{ background: '#fdf6f6' }}
      >
        {containerPieces.length === 0 ? (
          <p className="text-center text-[#c9a0a0] text-sm py-4 font-playfair">
            {won ? '🎉 Semua terpasang!' : 'Kosong — semua sudah dipasang!'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {containerPieces.map((id) => (
              <div
                key={id}
                draggable
                onDragStart={() => onDragStartContainer(id)}
                style={{ cursor: 'grab' }}
              >
                <PieceView id={id} size={PIECE_SIZE} />
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-[#c9a0a0]">
        Drag potongan dari bawah ke papan hati ↑
      </p>
    </div>
  )
}
