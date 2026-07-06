'use client'

import { useState } from 'react'
import TicTacToe from './TicTacToe'

export default function GameLanding() {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  if (activeGame === 'tictactoe') {
    return <TicTacToe onBack={() => setActiveGame(null)} />
  }

  return (
    <div className="space-y-4">
      {/* TicTacToe card */}
      <button
        onClick={() => setActiveGame('tictactoe')}
        className="w-full text-left group"
      >
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#c9a0a0] bg-gradient-to-br from-[#3d0c0c] to-[#6b2020] p-6 shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl">
          {/* Decorative hearts bg */}
          <div className="absolute inset-0 opacity-10 text-white text-4xl leading-tight overflow-hidden pointer-events-none select-none p-2">
            {'♥ ○ ♥ ○ ♥ ○ ♥ ○ '.repeat(20)}
          </div>

          <div className="relative z-10">
            {/* Thumbnail grid preview */}
            <div className="flex justify-center mb-4">
              <div className="grid grid-cols-3 gap-1.5 w-24">
                {['♥','','○','','♥','','○','','♥'].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-base font-bold"
                    style={{
                      background: c ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                      color: c === '♥' ? '#ffb3b3' : c === '○' ? '#b3d4ff' : 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <h2 className="font-playfair text-xl text-white text-center font-bold">Tic-Tac-Toe</h2>
            <p className="text-sm text-center mt-1" style={{ color: 'rgba(255,200,200,0.8)' }}>
              ♥ vs ○ — berdua atau lawan AI
            </p>

            <div className="mt-4 flex justify-center">
              <span
                className="text-xs px-4 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
              >
                Main sekarang →
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Coming soon placeholder */}
      <div className="w-full rounded-3xl border-2 border-dashed border-[#c9a0a0]/40 p-6 text-center opacity-50">
        <p className="text-2xl mb-2">🎲</p>
        <p className="text-sm text-[#a06060] font-medium">Game lain coming soon~</p>
      </div>
    </div>
  )
}
