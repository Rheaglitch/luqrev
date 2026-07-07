'use client'

import { useState, useCallback } from 'react'
import { Chess, Square, PieceSymbol, Color } from 'chess.js'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface Props {
  onBack: () => void
}

// Unicode chess pieces
const PIECES: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
}

const FILES = ['a','b','c','d','e','f','g','h']
const RANKS = ['8','7','6','5','4','3','2','1']

export default function ChessGame({ onBack }: Props) {
  const [game, setGame] = useState(() => new Chess())
  const [selected, setSelected] = useState<Square | null>(null)
  const [legalMoves, setLegalMoves] = useState<Square[]>([])
  const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null)
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null)
  const [capturedW, setCapturedW] = useState<string[]>([]) // captured by black
  const [capturedB, setCapturedB] = useState<string[]>([]) // captured by white

  const board = game.board()
  const turn = game.turn() // 'w' | 'b'
  const isCheck = game.inCheck()
  const isCheckmate = game.isCheckmate()
  const isStalemate = game.isStalemate()
  const isDraw = game.isDraw()
  const isGameOver = game.isGameOver()

  const handleSquareClick = useCallback((sq: Square) => {
    if (isGameOver) return

    // If promotion pending, ignore board clicks
    if (promotionPending) return

    const piece = game.get(sq)

    if (selected) {
      // Try to move
      if (legalMoves.includes(sq)) {
        // Check if pawn promotion
        const movingPiece = game.get(selected)
        const isPromotion =
          movingPiece?.type === 'p' &&
          ((movingPiece.color === 'w' && sq[1] === '8') ||
           (movingPiece.color === 'b' && sq[1] === '1'))

        if (isPromotion) {
          setPromotionPending({ from: selected, to: sq })
          setSelected(null)
          setLegalMoves([])
          return
        }

        const newGame = new Chess(game.fen())
        const moveResult = newGame.move({ from: selected, to: sq })
        if (moveResult) {
          if (moveResult.captured) {
            const cap = `${moveResult.color === 'w' ? 'b' : 'w'}${moveResult.captured}`
            if (moveResult.color === 'w') setCapturedB(p => [...p, PIECES[cap] ?? ''])
            else setCapturedW(p => [...p, PIECES[cap] ?? ''])
          }
          setLastMove({ from: selected, to: sq })
          setGame(newGame)
        }
        setSelected(null)
        setLegalMoves([])
      } else if (piece && piece.color === turn) {
        // Select different piece
        setSelected(sq)
        const moves = game.moves({ square: sq, verbose: true }).map(m => m.to as Square)
        setLegalMoves(moves)
      } else {
        setSelected(null)
        setLegalMoves([])
      }
    } else {
      if (piece && piece.color === turn) {
        setSelected(sq)
        const moves = game.moves({ square: sq, verbose: true }).map(m => m.to as Square)
        setLegalMoves(moves)
      }
    }
  }, [game, selected, legalMoves, turn, isGameOver, promotionPending])

  const handlePromotion = (piece: PieceSymbol) => {
    if (!promotionPending) return
    const newGame = new Chess(game.fen())
    const moveResult = newGame.move({ from: promotionPending.from, to: promotionPending.to, promotion: piece })
    if (moveResult) {
      setLastMove({ from: promotionPending.from, to: promotionPending.to })
      setGame(newGame)
    }
    setPromotionPending(null)
  }

  const reset = () => {
    setGame(new Chess())
    setSelected(null)
    setLegalMoves([])
    setLastMove(null)
    setPromotionPending(null)
    setCapturedW([])
    setCapturedB([])
  }

  const turnLabel = turn === 'w' ? '♔ Putih' : '♚ Hitam'
  const turnColor = turn === 'w' ? '#f5f0e8' : '#3d2010'

  return (
    <div className="space-y-3 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="font-playfair text-base font-bold text-[#3d0c0c]">Catur</span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Status */}
      <div className="rounded-2xl py-3 px-4 text-center"
        style={{ background: isGameOver ? '#3d0c0c' : '#f5e8e8' }}>
        {isCheckmate && (
          <p className="font-bold text-white text-lg">
            {turn === 'w' ? '♚ Hitam Menang! 🎉' : '♔ Putih Menang! 🎉'}
          </p>
        )}
        {isStalemate && <p className="font-bold text-white">Stalemate — Seri!</p>}
        {isDraw && !isStalemate && <p className="font-bold text-white">Draw!</p>}
        {!isGameOver && (
          <p className="text-sm font-medium" style={{ color: '#6b2020' }}>
            Giliran: <span className="font-bold">{turnLabel}</span>
            {isCheck && ' — ⚠️ Skak!'}
          </p>
        )}
      </div>

      {/* Captured by white (black pieces) */}
      {capturedB.length > 0 && (
        <div className="text-sm px-2" style={{ color: '#6b2020' }}>
          ♔ Tangkap: {capturedB.join(' ')}
        </div>
      )}

      {/* Board */}
      <div className="rounded-xl overflow-hidden shadow-xl border-2"
        style={{ borderColor: '#3d0c0c' }}>
        {/* File labels top */}
        <div className="grid grid-cols-8 text-center"
          style={{ background: '#3d0c0c' }}>
          {FILES.map(f => (
            <div key={f} className="text-[9px] py-0.5" style={{ color: 'rgba(255,220,200,0.6)' }}>{f}</div>
          ))}
        </div>

        {board.map((row, ri) => (
          <div key={ri} className="flex items-center">
            {/* Rank label */}
            <div className="text-[9px] w-4 text-center flex-shrink-0"
              style={{ background: '#3d0c0c', color: 'rgba(255,220,200,0.6)', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {RANKS[ri]}
            </div>
            <div className="flex-1 grid grid-cols-8">
              {row.map((cell, ci) => {
                const sq = `${FILES[ci]}${RANKS[ri]}` as Square
                const isLight = (ri + ci) % 2 === 0
                const isSelected = selected === sq
                const isLegal = legalMoves.includes(sq)
                const isLastFrom = lastMove?.from === sq
                const isLastTo   = lastMove?.to === sq
                const isKingInCheck = isCheck && cell?.type === 'k' && cell.color === turn

                let bg = isLight ? '#f5f0e8' : '#6b3520'
                if (isLastFrom || isLastTo) bg = isLight ? '#d4c88a' : '#a89a40'
                if (isSelected) bg = '#e8c04a'
                if (isKingInCheck) bg = '#ff6060'

                const pieceKey = cell ? `${cell.color}${cell.type}` : null

                return (
                  <button
                    key={sq}
                    onClick={() => handleSquareClick(sq)}
                    className="relative flex items-center justify-center transition-all"
                    style={{
                      background: bg,
                      aspectRatio: '1',
                      fontSize: 'clamp(1rem, 4vw, 1.6rem)',
                    }}
                  >
                    {/* Legal move indicator */}
                    {isLegal && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        {cell ? (
                          <div className="absolute inset-0 ring-4 ring-inset ring-yellow-400/60 rounded-sm" />
                        ) : (
                          <div className="w-1/3 h-1/3 rounded-full bg-yellow-400/50" />
                        )}
                      </div>
                    )}
                    {/* Piece */}
                    {pieceKey && (
                      <span style={{
                        color: cell?.color === 'w' ? '#f8f0e8' : '#1a0808',
                        textShadow: cell?.color === 'w'
                          ? '0 1px 3px rgba(0,0,0,0.8)'
                          : '0 1px 3px rgba(255,255,255,0.3)',
                        lineHeight: 1,
                        userSelect: 'none',
                      }}>
                        {PIECES[pieceKey]}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {/* Rank label right */}
            <div className="text-[9px] w-4 text-center flex-shrink-0"
              style={{ background: '#3d0c0c', color: 'rgba(255,220,200,0.6)', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {RANKS[ri]}
            </div>
          </div>
        ))}

        {/* File labels bottom */}
        <div className="grid grid-cols-8 text-center"
          style={{ background: '#3d0c0c' }}>
          {FILES.map(f => (
            <div key={f} className="text-[9px] py-0.5" style={{ color: 'rgba(255,220,200,0.6)' }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Captured by black */}
      {capturedW.length > 0 && (
        <div className="text-sm px-2" style={{ color: '#6b2020' }}>
          ♚ Tangkap: {capturedW.join(' ')}
        </div>
      )}

      {/* Promotion modal */}
      {promotionPending && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl">
            <p className="font-playfair text-lg font-bold mb-4 text-[#3d0c0c]">Promosi Pion</p>
            <div className="flex gap-4">
              {(['q','r','b','n'] as PieceSymbol[]).map(p => {
                const key = `${turn}${p}`
                return (
                  <button key={p} onClick={() => handlePromotion(p)}
                    className="w-14 h-14 rounded-xl text-4xl flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ background: '#f5e8e8' }}>
                    {PIECES[key]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Game over - play again */}
      {isGameOver && (
        <button onClick={reset}
          className="w-full py-3 rounded-2xl text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}>
          Main Lagi ↺
        </button>
      )}
    </div>
  )
}
