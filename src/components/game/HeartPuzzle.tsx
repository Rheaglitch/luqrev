'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'

interface Props {
  onBack: () => void
  imageUrl?: string
}

// ── Puzzle configuration ────────────────────────────────────────────────────
// We use a 4×3 grid (12 pieces) clipped to a heart outline.
// Each piece is rendered as an SVG with a jigsaw path.

const COLS = 4
const ROWS = 3
const PIECE_W = 80   // px per piece in the solved board
const PIECE_H = 80
const TAB = 14       // size of the jigsaw tab

// Which grid cells (row, col) are part of the heart shape
// Heart fits in 4×3 grid:
//  Row 0:  cols 0,1,2,3  (full — top of heart, two bumps)
//  Row 1:  cols 0,1,2,3  (full — widest)
//  Row 2:  cols 1,2      (narrow — bottom point)
const HEART_CELLS: [number, number][] = [
  [0,0],[0,1],[0,2],[0,3],
  [1,0],[1,1],[1,2],[1,3],
  [2,1],[2,2],
]

const PIECE_IDS = HEART_CELLS.map(([r,c]) => r * COLS + c)
const PIECE_SET = new Set(PIECE_IDS)

// ── Jigsaw path generation ───────────────────────────────────────────────────
// Each piece has 4 edges (top, right, bottom, left).
// Edge direction: +1 = tab out, -1 = tab in, 0 = flat (border of heart)

// Pre-defined edge directions between adjacent pieces
// Key: `${r1},${c1}-${r2},${c2}` → direction from piece1's perspective
type EdgeDir = 1 | -1 | 0

function getEdgeDir(row: number, col: number, side: 'top'|'right'|'bottom'|'left'): EdgeDir {
  // Border edges of the heart shape are flat (0)
  const neighbor: Record<string, [number,number]> = {
    top:    [row-1, col],
    right:  [row, col+1],
    bottom: [row+1, col],
    left:   [row, col-1],
  }
  const [nr, nc] = neighbor[side]
  const neighborInHeart = HEART_CELLS.some(([r,c]) => r === nr && c === nc)
  if (!neighborInHeart) return 0  // border edge

  // Deterministic: use hash to decide tab direction
  const hash = (row * 13 + col * 7 + (side === 'top' ? 1 : side === 'right' ? 2 : side === 'bottom' ? 3 : 4)) % 2
  return hash === 0 ? 1 : -1
}

// Generate SVG path for a piece given its edge directions
// The path describes the piece boundary with jigsaw tabs
function makePiecePath(top: EdgeDir, right: EdgeDir, bottom: EdgeDir, left: EdgeDir): string {
  const w = PIECE_W
  const h = PIECE_H
  const t = TAB

  // Top edge (left → right)
  function topEdge(dir: EdgeDir): string {
    if (dir === 0) return `L ${w} 0`
    const mid = w / 2
    const bump = dir * t
    return `L ${mid - t} 0 C ${mid - t} ${-bump}, ${mid + t} ${-bump}, ${mid + t} 0 L ${w} 0`
  }
  // Right edge (top → bottom)
  function rightEdge(dir: EdgeDir): string {
    if (dir === 0) return `L ${w} ${h}`
    const mid = h / 2
    const bump = dir * t
    return `L ${w} ${mid - t} C ${w + bump} ${mid - t}, ${w + bump} ${mid + t}, ${w} ${mid + t} L ${w} ${h}`
  }
  // Bottom edge (right → left)
  function bottomEdge(dir: EdgeDir): string {
    if (dir === 0) return `L 0 ${h}`
    const mid = w / 2
    const bump = dir * t
    return `L ${mid + t} ${h} C ${mid + t} ${h + bump}, ${mid - t} ${h + bump}, ${mid - t} ${h} L 0 ${h}`
  }
  // Left edge (bottom → top)
  function leftEdge(dir: EdgeDir): string {
    if (dir === 0) return `L 0 0`
    const mid = h / 2
    const bump = dir * t
    return `L 0 ${mid + t} C ${-bump} ${mid + t}, ${-bump} ${mid - t}, 0 ${mid - t} L 0 0`
  }

  return `M 0 0 ${topEdge(top)} ${rightEdge(right)} ${bottomEdge(bottom)} ${leftEdge(left)} Z`
}

// Opposing edge direction
function opp(d: EdgeDir): EdgeDir {
  if (d === 0) return 0
  return d === 1 ? -1 : 1
}

// ── Piece data ───────────────────────────────────────────────────────────────
interface PieceData {
  id: number
  row: number
  col: number
  path: string
  // How much the piece SVG needs to be padded for tabs
  padTop: number
  padRight: number
  padBottom: number
  padLeft: number
}

function buildPieces(): PieceData[] {
  return HEART_CELLS.map(([row, col]) => {
    const id = row * COLS + col
    const top    = getEdgeDir(row, col, 'top')
    const right  = getEdgeDir(row, col, 'right')
    const bottom = getEdgeDir(row, col, 'bottom')
    const left   = getEdgeDir(row, col, 'left')

    // Neighbor checks are symmetric — ensure matching tabs
    // (right of piece (r,c) must be opposite of left of piece (r,c+1))
    const path = makePiecePath(top, right, bottom, left)

    const padTop    = top    < 0 ? TAB : 0
    const padRight  = right  > 0 ? TAB : 0
    const padBottom = bottom > 0 ? TAB : 0
    const padLeft   = left   < 0 ? TAB : 0

    return { id, row, col, path, padTop, padRight, padBottom, padLeft }
  })
}

const PIECES = buildPieces()

// ── Piece SVG component ──────────────────────────────────────────────────────
function PieceSVG({ piece, imageUrl, size = 1 }: { piece: PieceData; imageUrl?: string; size?: number }) {
  const s = size
  const w = PIECE_W * s
  const h = PIECE_H * s
  const t = TAB * s
  const padT = piece.padTop * s
  const padR = piece.padRight * s
  const padB = piece.padBottom * s
  const padL = piece.padLeft * s
  const svgW = w + padL + padR + (piece.padLeft < 0 ? t : 0) + (piece.padRight < 0 ? 0 : 0)
  const svgH = h + padT + padB

  // Image offset: position the image so the correct portion shows
  const imgX = piece.col * w - padL
  const imgY = piece.row * h - padT
  const totalImgW = COLS * w
  const totalImgH = ROWS * h

  const top    = getEdgeDir(piece.row, piece.col, 'top')
  const right  = getEdgeDir(piece.row, piece.col, 'right')
  const bottom = getEdgeDir(piece.row, piece.col, 'bottom')
  const left   = getEdgeDir(piece.row, piece.col, 'left')

  // Rebuild path scaled
  function topEdge(dir: EdgeDir): string {
    if (dir === 0) return `L ${w} 0`
    const mid = w / 2
    const bump = dir * t
    return `L ${mid - t} 0 C ${mid - t} ${-bump}, ${mid + t} ${-bump}, ${mid + t} 0 L ${w} 0`
  }
  function rightEdge(dir: EdgeDir): string {
    if (dir === 0) return `L ${w} ${h}`
    const mid = h / 2
    const bump = dir * t
    return `L ${w} ${mid - t} C ${w + bump} ${mid - t}, ${w + bump} ${mid + t}, ${w} ${mid + t} L ${w} ${h}`
  }
  function bottomEdge(dir: EdgeDir): string {
    if (dir === 0) return `L 0 ${h}`
    const mid = w / 2
    const bump = dir * t
    return `L ${mid + t} ${h} C ${mid + t} ${h + bump}, ${mid - t} ${h + bump}, ${mid - t} ${h} L 0 ${h}`
  }
  function leftEdge(dir: EdgeDir): string {
    if (dir === 0) return `L 0 0`
    const mid = h / 2
    const bump = dir * t
    return `L 0 ${mid + t} C ${-bump} ${mid + t}, ${-bump} ${mid - t}, 0 ${mid - t} L 0 0`
  }

  const clipPath = `M 0 0 ${topEdge(top)} ${rightEdge(right)} ${bottomEdge(bottom)} ${leftEdge(left)} Z`
  const clipId = `clip-${piece.id}-${Math.random().toString(36).slice(2,6)}`

  // Translate so tabs don't clip
  const tx = padL + (left < 0 ? t : 0)
  const ty = padT + (top < 0 ? t : 0)

  const actualSvgW = w + (left < 0 ? t : 0) + (right > 0 ? t : 0) + padL
  const actualSvgH = h + (top < 0 ? t : 0) + (bottom > 0 ? t : 0) + padT

  return (
    <svg
      width={actualSvgW}
      height={actualSvgH}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={clipPath} transform={`translate(${tx}, ${ty})`} />
        </clipPath>
      </defs>

      {/* Background/image */}
      {imageUrl ? (
        <image
          href={imageUrl}
          x={tx - padL - piece.col * w}
          y={ty - padT - piece.row * h}
          width={totalImgW}
          height={totalImgH}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <rect
          x={tx} y={ty} width={w} height={h}
          fill={`hsl(${(piece.id * 30) % 360}, 65%, 80%)`}
          clipPath={`url(#${clipId})`}
        />
      )}

      {/* Piece outline */}
      <path
        d={clipPath}
        transform={`translate(${tx}, ${ty})`}
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

// ── Main Game ────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function HeartPuzzle({ onBack, imageUrl }: Props) {
  const [board, setBoard] = useState<Record<number, number>>({}) // slotId → pieceId
  const [container, setContainer] = useState<number[]>(() => shuffle(PIECE_IDS))
  const [won, setWon] = useState(false)
  const [dragging, setDragging] = useState<{ pieceId: number; from: 'container' | number } | null>(null)

  const checkWin = useCallback((b: Record<number, number>) => {
    return PIECE_IDS.every(id => b[id] === id)
  }, [])

  const bongkar = () => {
    setBoard({})
    setContainer(shuffle(PIECE_IDS))
    setWon(false)
    setDragging(null)
  }

  const onDropSlot = (slotId: number) => {
    if (!dragging) return
    const newBoard = { ...board }
    const newContainer = [...container]

    // Remove from source
    if (dragging.from === 'container') {
      const ci = newContainer.indexOf(dragging.pieceId)
      if (ci !== -1) newContainer.splice(ci, 1)
    } else {
      const prev = newBoard[dragging.from]
      if (prev !== undefined) newContainer.push(prev)
      delete newBoard[dragging.from]
    }

    // Displace existing piece in slot
    if (newBoard[slotId] !== undefined) {
      newContainer.push(newBoard[slotId])
    }

    newBoard[slotId] = dragging.pieceId
    setBoard(newBoard)
    setContainer(newContainer)
    setDragging(null)

    if (checkWin(newBoard)) setTimeout(() => setWon(true), 300)
  }

  const onDropContainer = () => {
    if (!dragging || dragging.from === 'container') { setDragging(null); return }
    const newBoard = { ...board }
    const newContainer = [...container]
    newContainer.push(dragging.pieceId)
    delete newBoard[dragging.from]
    setBoard(newBoard)
    setContainer(newContainer)
    setDragging(null)
  }

  // Board dimensions for centering
  const boardW = COLS * PIECE_W
  const boardH = ROWS * PIECE_H

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="font-playfair text-base font-bold text-[#3d0c0c]">Puzzle Hati 🧩</span>
        <button onClick={bongkar} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <RotateCcw className="w-3.5 h-3.5" /> Bongkar
        </button>
      </div>

      {won && (
        <div className="text-center py-4 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}>
          <Trophy className="w-8 h-8 mx-auto mb-1 text-yellow-300" />
          <p className="font-playfair text-xl font-bold">Puzzle Selesai! 🎉</p>
          <button onClick={bongkar} className="mt-2 px-5 py-1.5 bg-white/20 rounded-full text-sm hover:bg-white/30">
            Main Lagi
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex justify-center overflow-x-auto">
        <div
          style={{ position: 'relative', width: boardW, height: boardH }}
          onDragOver={e => e.preventDefault()}
        >
          {HEART_CELLS.map(([row, col]) => {
            const slotId = row * COLS + col
            const piece = PIECES.find(p => p.id === slotId)!
            const placedPieceId = board[slotId]
            const placedPiece = placedPieceId !== undefined
              ? PIECES.find(p => p.id === placedPieceId)
              : null

            return (
              <div
                key={slotId}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDropSlot(slotId)}
                style={{
                  position: 'absolute',
                  left: col * PIECE_W,
                  top:  row * PIECE_H,
                  width: PIECE_W,
                  height: PIECE_H,
                  zIndex: placedPiece ? 2 : 1,
                }}
              >
                {/* Slot outline */}
                {!placedPiece && (
                  <svg width={PIECE_W} height={PIECE_H} style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
                    <rect width={PIECE_W} height={PIECE_H} fill="rgba(139,46,46,0.1)" rx="4" />
                    <rect width={PIECE_W} height={PIECE_H} fill="none" stroke="#8b2e2e" strokeWidth="1" strokeDasharray="4 3" rx="4" />
                  </svg>
                )}
                {/* Placed piece */}
                {placedPiece && (
                  <div
                    draggable
                    onDragStart={() => setDragging({ pieceId: placedPieceId!, from: slotId })}
                    style={{
                      position: 'absolute',
                      left: -placedPiece.padLeft,
                      top:  -placedPiece.padTop,
                      cursor: 'grab',
                      zIndex: 3,
                    }}
                  >
                    <PieceSVG piece={placedPiece} imageUrl={imageUrl} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-[#a06060]">{container.length} potongan tersisa</p>

      {/* Container */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={onDropContainer}
        className="min-h-24 rounded-2xl border-2 border-dashed border-[#c9a0a0] p-3"
        style={{ background: '#fdf6f6' }}
      >
        {container.length === 0 ? (
          <p className="text-center text-[#c9a0a0] text-sm py-4 font-playfair">
            {won ? '🎉 Semua terpasang!' : 'Kosong'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {container.map(pid => {
              const p = PIECES.find(x => x.id === pid)!
              return (
                <div
                  key={pid}
                  draggable
                  onDragStart={() => setDragging({ pieceId: pid, from: 'container' })}
                  style={{ cursor: 'grab' }}
                >
                  <PieceSVG piece={p} imageUrl={imageUrl} size={0.7} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-[#c9a0a0]">Drag potongan ke papan hati ↑</p>
    </div>
  )
}
