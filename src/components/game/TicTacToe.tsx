'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'

type Cell = 'H' | 'O' | null  // H = ♥ (player 1), O = ○ (player 2 / bot)

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
]

function checkWinner(board: Cell[]): { winner: Cell; combo: number[] } | null {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo }
    }
  }
  return null
}

function getBotMove(board: Cell[]): number {
  // Try to win
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo
    const cells = [board[a], board[b], board[c]]
    if (cells.filter(x => x === 'O').length === 2 && cells.includes(null)) {
      return combo[cells.indexOf(null)]
    }
  }
  // Block player
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo
    const cells = [board[a], board[b], board[c]]
    if (cells.filter(x => x === 'H').length === 2 && cells.includes(null)) {
      return combo[cells.indexOf(null)]
    }
  }
  // Take center
  if (!board[4]) return 4
  // Take corners
  const corners = [0, 2, 6, 8].filter(i => !board[i])
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  // Take any
  const empty = board.map((c, i) => c === null ? i : -1).filter(i => i >= 0)
  return empty[Math.floor(Math.random() * empty.length)]
}

interface Props {
  onBack: () => void
}

export default function TicTacToe({ onBack }: Props) {
  const [mode, setMode] = useState<'vs-human' | 'vs-bot' | null>(null)
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [turn, setTurn] = useState<'H' | 'O'>('H')
  const [result, setResult] = useState<{ winner: Cell; combo: number[] } | null | 'draw'>(null)
  const [scores, setScores] = useState({ H: 0, O: 0, draw: 0 })

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null))
    setTurn('H')
    setResult(null)
  }, [])

  const handleClick = useCallback((i: number) => {
    if (!mode || board[i] || result) return
    if (mode === 'vs-bot' && turn === 'O') return

    const newBoard = [...board]
    newBoard[i] = turn

    const win = checkWinner(newBoard)
    if (win) {
      setBoard(newBoard)
      setResult(win)
      setScores(s => ({ ...s, [win.winner!]: s[win.winner as 'H' | 'O'] + 1 }))
      return
    }
    if (newBoard.every(Boolean)) {
      setBoard(newBoard)
      setResult('draw')
      setScores(s => ({ ...s, draw: s.draw + 1 }))
      return
    }

    if (mode === 'vs-bot') {
      // Bot plays immediately
      const botIdx = getBotMove(newBoard)
      newBoard[botIdx] = 'O'
      const winBot = checkWinner(newBoard)
      if (winBot) {
        setBoard(newBoard)
        setResult(winBot)
        setScores(s => ({ ...s, O: s.O + 1 }))
        return
      }
      if (newBoard.every(Boolean)) {
        setBoard(newBoard)
        setResult('draw')
        setScores(s => ({ ...s, draw: s.draw + 1 }))
        return
      }
      setBoard(newBoard)
      setTurn('H')
    } else {
      setBoard(newBoard)
      setTurn(turn === 'H' ? 'O' : 'H')
    }
  }, [mode, board, turn, result])

  const winCombo = result && result !== 'draw' ? result.combo : []

  // Mode selection screen
  if (!mode) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="text-center py-4">
          <p className="font-playfair text-2xl text-[#3d0c0c] mb-1">Tic-Tac-Toe</p>
          <p className="text-sm text-[#a06060]">♥ vs ○</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => setMode('vs-human')}
            className="w-full py-4 rounded-2xl font-semibold text-white shadow-md transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}
          >
            👫 Berdua (2 pemain)
          </button>
          <button
            onClick={() => setMode('vs-bot')}
            className="w-full py-4 rounded-2xl font-semibold border-2 border-[#c9a0a0] text-[#6b2020] transition-all hover:scale-[1.02] hover:bg-[#f5e8e8]"
          >
            🤖 Lawan AI
          </button>
        </div>
      </div>
    )
  }

  const label = {
    H: '♥',
    O: mode === 'vs-bot' ? '🤖' : '○',
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: '♥ Pemain 1', key: 'H', color: '#8b2e2e' },
          { label: 'Seri', key: 'draw', color: '#a06060' },
          { label: mode === 'vs-bot' ? '🤖 Bot' : '○ Pemain 2', key: 'O', color: '#2e5e8b' },
        ].map(({ label: l, key, color }) => (
          <div key={key} className="rounded-2xl py-2 px-1" style={{ background: '#f5e8e8' }}>
            <p className="text-xs" style={{ color: '#a06060' }}>{l}</p>
            <p className="text-2xl font-bold font-playfair" style={{ color }}>{scores[key as keyof typeof scores]}</p>
          </div>
        ))}
      </div>

      {/* Turn indicator */}
      {!result && (
        <p className="text-center text-sm font-medium" style={{ color: '#6b2020' }}>
          Giliran: <span className="text-lg">{label[turn]}</span>
          {mode === 'vs-bot' && turn === 'O' ? ' (Bot berpikir...)' : ''}
        </p>
      )}

      {/* Result banner */}
      {result && (
        <div
          className="text-center py-3 px-4 rounded-2xl font-semibold"
          style={{
            background: result === 'draw' ? '#f5e8e8' : 'linear-gradient(135deg, #6b2020, #3d0c0c)',
            color: result === 'draw' ? '#6b2020' : 'white',
          }}
        >
          {result === 'draw'
            ? '🤝 Seri!'
            : result.winner === 'H'
            ? '♥ Pemain 1 menang! 🎉'
            : mode === 'vs-bot'
            ? '🤖 Bot menang~ coba lagi!'
            : '○ Pemain 2 menang! 🎉'
          }
        </div>
      )}

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
        {board.map((cell, i) => {
          const isWinCell = winCombo.includes(i)
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!cell || !!result || (mode === 'vs-bot' && turn === 'O')}
              className="aspect-square rounded-2xl text-4xl font-bold flex items-center justify-center transition-all duration-150 active:scale-95 disabled:cursor-default"
              style={{
                background: isWinCell
                  ? 'linear-gradient(135deg, #8b2e2e, #6b2020)'
                  : cell
                  ? '#f5e8e8'
                  : 'white',
                border: `2px solid ${isWinCell ? '#8b2e2e' : '#e8d0d0'}`,
                color: cell === 'H' ? (isWinCell ? 'white' : '#8b2e2e') : (isWinCell ? 'white' : '#2e5e8b'),
                boxShadow: isWinCell ? '0 4px 12px rgba(139,46,46,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {cell === 'H' ? '♥' : cell === 'O' ? (mode === 'vs-bot' ? '🤖' : '○') : ''}
            </button>
          )
        })}
      </div>

      {/* Play again */}
      {result && (
        <button
          onClick={reset}
          className="w-full py-3 rounded-2xl text-white font-semibold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}
        >
          Main Lagi ↺
        </button>
      )}
    </div>
  )
}
