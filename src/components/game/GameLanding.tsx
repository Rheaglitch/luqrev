'use client'

import { useState } from 'react'
import TicTacToe from './TicTacToe'
import SnakeLadder from './SnakeLadder'
import ChessGame from './ChessGame'
import HeartPuzzle from './HeartPuzzle'

interface TruthDare {
  id: string
  type: 'truth' | 'dare'
  content: string
}

interface Props {
  truthDare: TruthDare[]
  puzzleImageUrl?: string
}

type ActiveGame = 'tictactoe' | 'snakeladder' | 'chess' | 'puzzle' | null

export default function GameLanding({ truthDare, puzzleImageUrl }: Props) {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null)

  if (activeGame === 'tictactoe')   return <TicTacToe onBack={() => setActiveGame(null)} />
  if (activeGame === 'snakeladder') return <SnakeLadder onBack={() => setActiveGame(null)} truthDare={truthDare} />
  if (activeGame === 'chess')       return <ChessGame onBack={() => setActiveGame(null)} />
  if (activeGame === 'puzzle')      return <HeartPuzzle onBack={() => setActiveGame(null)} imageUrl={puzzleImageUrl} />

  const games = [
    {
      id: 'tictactoe' as ActiveGame,
      title: 'Tic-Tac-Toe',
      desc: '♥ vs ○ — berdua atau vs AI',
      thumbnail: (
        <div className="grid grid-cols-3 gap-1">
          {['♥','','○','','♥','','○','','♥'].map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.12)', color: c === '♥' ? '#ffb3b3' : '#b3d4ff' }}>
              {c}
            </div>
          ))}
        </div>
      ),
      bg: 'linear-gradient(135deg, #3d0c0c, #6b2020)',
    },
    {
      id: 'snakeladder' as ActiveGame,
      title: 'Ular Tangga',
      desc: 'Truth or Dare / Mode Normal',
      thumbnail: <span className="text-5xl">🐍</span>,
      bg: 'linear-gradient(135deg, #6b2020, #8b4040)',
    },
    {
      id: 'chess' as ActiveGame,
      title: 'Catur',
      desc: '2 pemain — papan maroon elegan',
      thumbnail: <span className="text-5xl">♟</span>,
      bg: 'linear-gradient(135deg, #2a0808, #4a1a10)',
    },
    {
      id: 'puzzle' as ActiveGame,
      title: 'Puzzle Hati',
      desc: 'Susun puzzle bentuk hati bersama',
      thumbnail: <span className="text-5xl">🧩</span>,
      bg: 'linear-gradient(135deg, #6b1a3a, #3d0c1c)',
    },
  ]

  return (
    <div className="space-y-3">
      {games.map(g => (
        <button key={g.id} onClick={() => setActiveGame(g.id)} className="w-full text-left group">
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 px-5 py-4 shadow-lg transition-all duration-200 group-hover:scale-[1.01] group-hover:shadow-xl"
            style={{ background: g.bg }}
          >
            <div className="relative z-10 flex items-center gap-4">
              {/* Thumbnail — fixed size, centered */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-2xl"
                style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.08)' }}
              >
                {g.thumbnail}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h2 className="font-playfair text-xl font-bold text-white">{g.title}</h2>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,200,200,0.75)' }}>{g.desc}</p>
              </div>

              {/* Arrow */}
              <span className="text-white/40 group-hover:text-white/70 transition-colors text-xl flex-shrink-0">→</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
