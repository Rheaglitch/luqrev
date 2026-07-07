'use client'

import { useState } from 'react'
import TicTacToe from './TicTacToe'
import SnakeLadder from './SnakeLadder'
import ChessGame from './ChessGame'

interface TruthDare {
  id: string
  type: 'truth' | 'dare'
  content: string
}

interface Props {
  truthDare: TruthDare[]
}

type ActiveGame = 'tictactoe' | 'snakeladder' | 'chess' | null

export default function GameLanding({ truthDare }: Props) {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null)

  if (activeGame === 'tictactoe') return <TicTacToe onBack={() => setActiveGame(null)} />
  if (activeGame === 'snakeladder') return <SnakeLadder onBack={() => setActiveGame(null)} truthDare={truthDare} />
  if (activeGame === 'chess') return <ChessGame onBack={() => setActiveGame(null)} />

  const games = [
    {
      id: 'tictactoe' as ActiveGame,
      title: 'Tic-Tac-Toe',
      desc: '♥ vs ○ — berdua atau vs AI',
      emoji: null,
      grid: ['♥','','○','','♥','','○','','♥'],
      bg: 'linear-gradient(135deg, #3d0c0c, #6b2020)',
    },
    {
      id: 'snakeladder' as ActiveGame,
      title: 'Ular Tangga',
      desc: 'Truth or Dare / Mode Normal',
      emoji: '🐍',
      grid: null,
      bg: 'linear-gradient(135deg, #6b2020, #8b4040)',
    },
    {
      id: 'chess' as ActiveGame,
      title: 'Catur',
      desc: '2 pemain — papan maroon elegan',
      emoji: '♟',
      grid: null,
      bg: 'linear-gradient(135deg, #2a0808, #4a1a10)',
    },
  ]

  return (
    <div className="space-y-4">
      {games.map(g => (
        <button key={g.id} onClick={() => setActiveGame(g.id)} className="w-full text-left group">
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#c9a0a0] p-6 shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"
            style={{ background: g.bg }}>
            {/* Decorative bg text */}
            <div className="absolute inset-0 opacity-10 text-white text-4xl leading-tight overflow-hidden pointer-events-none select-none p-2">
              {'♥ ○ ♥ ○ '.repeat(20)}
            </div>

            <div className="relative z-10 flex items-center gap-5">
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                {g.grid ? (
                  <div className="grid grid-cols-3 gap-0.5">
                    {g.grid.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold"
                        style={{ background: 'rgba(255,255,255,0.15)', color: c === '♥' ? '#ffb3b3' : '#b3d4ff' }}>
                        {c}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-4xl">{g.emoji}</span>
                )}
              </div>

              {/* Text */}
              <div>
                <h2 className="font-playfair text-xl font-bold text-white">{g.title}</h2>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,200,200,0.8)' }}>{g.desc}</p>
              </div>

              {/* Arrow */}
              <div className="ml-auto flex-shrink-0">
                <span className="text-xl text-white/50 group-hover:text-white/80 transition-colors">→</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
