'use client'

import { useState, useId } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'

interface Props {
  onBack: () => void
  imageUrl?: string
}

const COLS = 4
const ROWS = 3
const TOTAL = COLS * ROWS  // 12 pieces
const PIECE_PX = 80        // px per piece on the board

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// A single puzzle piece — shows the correct slice of the image
function Piece({
  id,
  imageUrl,
  sizePx,
  draggable: isDraggable,
  onDragStart,
}: {
  id: number
  imageUrl?: string
  sizePx: number
  draggable: boolean
  onDragStart: () => void
}) {
  const col = id % COLS
  const row = Math.floor(id / COLS)

  // Background position: shift so the right portion of the image shows
  const bgX = -(col * sizePx)
  const bgY = -(row * sizePx)
  const totalW = COLS * sizePx
  const totalH = ROWS * sizePx

  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      style={{
        width: sizePx,
        height: sizePx,
        backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
        backgroundSize: `${totalW}px ${totalH}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: 'no-repeat',
        backgroundColor: !imageUrl ? `hsl(${(id * 30) % 360}, 55%, 75%)` : undefined,
        cursor: isDraggable ? 'grab' : 'default',
        borderRadius: 4,
        border: '2px solid rgba(255,255,255,0.6)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    />
  )
}

export default function HeartPuzzle({ onBack, imageUrl }: Props) {
  // board: array of TOTAL slots, each holds pieceId or null
  const [board, setBoard] = useState<(number | null)[]>(() => Array(TOTAL).fill(null))
  // container: list of piece IDs not yet placed
  const [container, setContainer] = useState<number[]>(() =>
    shuffle(Array.from({ length: TOTAL }, (_, i) => i))
  )
  const [won, setWon] = useState(false)
  // dragging state — just a piece ID, stored in dataTransfer
  const [dragOver, setDragOver] = useState<number | 'container' | null>(null)

  const checkWin = (b: (number | null)[]) =>
    b.every((v, i) => v === i)

  // Called when a piece is dropped onto board slot `slot`
  const dropOnSlot = (slot: number, pieceId: number, fromSlot: number | null) => {
    const newBoard = [...board]
    const newContainer = [...container]

    // Remove from source
    if (fromSlot === null) {
      // came from container
      const ci = newContainer.indexOf(pieceId)
      if (ci !== -1) newContainer.splice(ci, 1)
    } else {
      // came from another slot
      const displaced = newBoard[fromSlot]
      if (displaced !== null) newContainer.push(displaced)
      newBoard[fromSlot] = null
    }

    // Displace anything in target slot back to container
    if (newBoard[slot] !== null && newBoard[slot] !== pieceId) {
      newContainer.push(newBoard[slot]!)
    }

    newBoard[slot] = pieceId
    setBoard(newBoard)
    setContainer(newContainer)

    if (checkWin(newBoard)) setTimeout(() => setWon(true), 200)
  }

  const dropOnContainer = (pieceId: number, fromSlot: number) => {
    const newBoard = [...board]
    const newContainer = [...container]
    newBoard[fromSlot] = null
    newContainer.push(pieceId)
    setBoard(newBoard)
    setContainer(newContainer)
  }

  const bongkar = () => {
    setBoard(Array(TOTAL).fill(null))
    setContainer(shuffle(Array.from({ length: TOTAL }, (_, i) => i)))
    setWon(false)
    setDragOver(null)
  }

  // Encode drag data as "pieceId,fromSlot" (fromSlot=-1 if from container)
  const encode = (pieceId: number, fromSlot: number | null) =>
    `${pieceId},${fromSlot ?? -1}`

  const decode = (s: string): [number, number | null] => {
    const [p, f] = s.split(',').map(Number)
    return [p, f === -1 ? null : f]
  }

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

      {/* Win banner */}
      {won && (
        <div className="text-center py-4 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}>
          <Trophy className="w-8 h-8 mx-auto mb-1 text-yellow-300" />
          <p className="font-playfair text-xl font-bold">Puzzle Selesai! 🎉</p>
          <button onClick={bongkar}
            className="mt-2 px-5 py-1.5 bg-white/20 rounded-full text-sm hover:bg-white/30">
            Main Lagi
          </button>
        </div>
      )}

      {/* Board: COLS×ROWS grid, each cell is a drop target */}
      <div className="flex justify-center overflow-x-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${PIECE_PX}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${PIECE_PX}px)`,
            gap: 0,
          }}
        >
          {Array.from({ length: TOTAL }, (_, slot) => {
            const piece = board[slot]
            const isOver = dragOver === slot

            return (
              <div
                key={slot}
                onDragOver={e => { e.preventDefault(); setDragOver(slot) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(null)
                  const data = e.dataTransfer.getData('text/plain')
                  if (!data) return
                  const [pieceId, fromSlot] = decode(data)
                  dropOnSlot(slot, pieceId, fromSlot)
                }}
                style={{
                  width: PIECE_PX,
                  height: PIECE_PX,
                  boxSizing: 'border-box',
                  // Guide outline when empty
                  border: piece === null
                    ? `1.5px dashed ${isOver ? '#8b2e2e' : 'rgba(139,46,46,0.25)'}`
                    : 'none',
                  borderRadius: 4,
                  background: piece === null
                    ? isOver ? 'rgba(139,46,46,0.08)' : 'rgba(139,46,46,0.04)'
                    : 'transparent',
                  position: 'relative',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {/* Slot number hint when empty */}
                {piece === null && (
                  <span style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: 'rgba(139,46,46,0.2)', fontWeight: 600,
                    pointerEvents: 'none', userSelect: 'none',
                  }}>
                    {slot + 1}
                  </span>
                )}

                {/* Placed piece */}
                {piece !== null && (
                  <div
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', encode(piece, slot))
                    }}
                    style={{
                      width: PIECE_PX,
                      height: PIECE_PX,
                      cursor: 'grab',
                    }}
                  >
                    <Piece id={piece} imageUrl={imageUrl} sizePx={PIECE_PX} draggable={false} onDragStart={() => {}} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress */}
      <p className="text-center text-xs text-[#a06060]">
        {TOTAL - container.length}/{TOTAL} terpasang
      </p>

      {/* Container — drop zone for returning pieces */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver('container') }}
        onDragLeave={() => setDragOver(null)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(null)
          const data = e.dataTransfer.getData('text/plain')
          if (!data) return
          const [pieceId, fromSlot] = decode(data)
          if (fromSlot !== null) dropOnContainer(pieceId, fromSlot)
        }}
        style={{
          minHeight: 80,
          background: dragOver === 'container' ? 'rgba(139,46,46,0.06)' : '#fdf6f6',
          borderRadius: 16,
          border: `2px dashed ${dragOver === 'container' ? '#8b2e2e' : '#c9a0a0'}`,
          padding: 12,
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        {container.length === 0 ? (
          <p className="text-center text-[#c9a0a0] text-sm py-2 font-playfair">
            {won ? '🎉 Semua terpasang!' : 'Kosong'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {container.map(pid => (
              <div
                key={pid}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData('text/plain', encode(pid, null))
                }}
              >
                <Piece
                  id={pid}
                  imageUrl={imageUrl}
                  sizePx={56}
                  draggable={false}
                  onDragStart={() => {}}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-[#c9a0a0]">
        Drag potongan ke kotak yang sesuai ↑ — angka kecil di kotak = nomor piece
      </p>
    </div>
  )
}
