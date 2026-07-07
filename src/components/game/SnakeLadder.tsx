'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react'

interface TruthDare {
  id: string
  type: 'truth' | 'dare'
  content: string
}

interface Props {
  onBack: () => void
  truthDare: TruthDare[]
}

// ── Board config ──────────────────────────────────────────────────────────────
// Snakes: head → tail (go down)
const SNAKES: Record<number, number> = {
  17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78,
}
// Ladders: bottom → top (go up)
const LADDERS: Record<number, number> = {
  4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91,
}
// Cells with truth/dare labels (distributed evenly)
const TRUTH_CELLS = new Set([5,11,16,22,27,33,42,48,53,61,66,72,80,86,94])
const DARE_CELLS  = new Set([3,8,15,23,30,37,43,50,57,65,70,76,83,89,97])

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

// Build board: row 0 = bottom (1-10), row 9 = top (91-100)
// Each row alternates direction
function buildBoard(): number[][] {
  const rows: number[][] = []
  for (let r = 0; r < 10; r++) {
    const row: number[] = []
    const start = r * 10 + 1
    for (let c = 0; c < 10; c++) row.push(start + c)
    // Even rows go left→right, odd rows right→left (when displayed bottom to top)
    if (r % 2 !== 0) row.reverse()
    rows.unshift(row) // add to front so row 9 is displayed at top
  }
  return rows
}

const BOARD = buildBoard()

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function SnakeLadder({ onBack, truthDare }: Props) {
  const [mode, setMode] = useState<'normal' | 'truth-dare' | null>(null)
  const [positions, setPositions] = useState([0, 0]) // 0 = not started
  const [turn, setTurn] = useState(0) // 0 = P1 (♥), 1 = P2 (★)
  const [dice, setDice] = useState(1)
  const [rolling, setRolling] = useState(false)
  const [challenge, setChallenge] = useState<TruthDare | null>(null)
  const [winner, setWinner] = useState<number | null>(null)
  const [lastEvent, setLastEvent] = useState<string>('')

  const truths = truthDare.filter(t => t.type === 'truth')
  const dares  = truthDare.filter(t => t.type === 'dare')

  const rollDice = useCallback(() => {
    if (rolling || winner !== null || challenge) return
    setRolling(true)
    setLastEvent('')

    // Animate dice
    let count = 0
    const interval = setInterval(() => {
      setDice(Math.ceil(Math.random() * 6))
      count++
      if (count >= 8) {
        clearInterval(interval)
        const result = Math.ceil(Math.random() * 6)
        setDice(result)
        setRolling(false)

        setPositions(prev => {
          const newPos = [...prev]
          let pos = newPos[turn] + result

          if (pos > 100) {
            setLastEvent('Terlalu jauh! Tetap di tempat.')
            setTurn(t => 1 - t)
            return prev
          }
          if (pos === 100) {
            newPos[turn] = 100
            setWinner(turn)
            return newPos
          }

          // Check snake
          if (SNAKES[pos]) {
            const dest = SNAKES[pos]
            setLastEvent(`🐍 Kena ular! Turun dari ${pos} ke ${dest}`)
            pos = dest
          }
          // Check ladder
          else if (LADDERS[pos]) {
            const dest = LADDERS[pos]
            setLastEvent(`🪜 Kena tangga! Naik dari ${pos} ke ${dest}`)
            pos = dest
          }
          // Check truth/dare
          else if (mode === 'truth-dare') {
            if (TRUTH_CELLS.has(pos) && truths.length > 0) {
              setChallenge(getRandomItem(truths))
            } else if (DARE_CELLS.has(pos) && dares.length > 0) {
              setChallenge(getRandomItem(dares))
            }
          }

          newPos[turn] = pos
          if (!TRUTH_CELLS.has(pos) && !DARE_CELLS.has(pos)) {
            setTurn(t => 1 - t)
          } else if (mode !== 'truth-dare') {
            setTurn(t => 1 - t)
          }
          // If truth/dare: turn changes after dismissing challenge
          return newPos
        })
      }
    }, 80)
  }, [rolling, winner, challenge, turn, mode, truths, dares])

  const dismissChallenge = () => {
    setChallenge(null)
    setTurn(t => 1 - t)
  }

  const reset = () => {
    setPositions([0, 0])
    setTurn(0)
    setDice(1)
    setChallenge(null)
    setWinner(null)
    setLastEvent('')
  }

  const DiceIcon = DICE_ICONS[dice - 1]
  const playerColors = ['#8b2e2e', '#2e5e8b']
  const playerLabels = ['♥ Pemain 1', '★ Pemain 2']

  // Mode selection
  if (!mode) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="text-center py-4">
          <p className="font-playfair text-2xl text-[#3d0c0c] mb-1">Ular Tangga</p>
          <p className="text-sm text-[#a06060]">Pilih mode permainan</p>
        </div>
        <button onClick={() => setMode('truth-dare')}
          className="w-full py-4 rounded-2xl font-semibold text-white shadow-md transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}>
          💕 Truth or Dare Mode
          <p className="text-xs font-normal mt-1 opacity-75">Singgahi kotak truth/dare, jawab tantangan!</p>
        </button>
        <button onClick={() => setMode('normal')}
          className="w-full py-4 rounded-2xl font-semibold border-2 border-[#c9a0a0] text-[#6b2020] transition-all hover:scale-[1.02] hover:bg-[#f5e8e8]">
          🐍 Mode Normal
          <p className="text-xs font-normal mt-1 opacity-60">Ular tangga biasa</p>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ background: '#f5e8e8', color: '#6b2020' }}>
          {mode === 'truth-dare' ? '💕 Truth or Dare' : '🐍 Normal'}
        </span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-[#a06060] hover:text-[#6b2020]">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map(p => (
          <div key={p} className={`rounded-2xl py-3 px-4 text-center transition-all ${turn === p && !winner ? 'ring-2 ring-offset-1' : ''}`}
            style={{ background: '#f5e8e8', ringColor: playerColors[p] }}>
            <p className="text-xs" style={{ color: '#a06060' }}>{playerLabels[p]}</p>
            <p className="text-2xl font-bold font-playfair" style={{ color: playerColors[p] }}>
              {positions[p] === 0 ? 'START' : positions[p]}
            </p>
            {turn === p && !winner && <p className="text-[10px] text-[#a06060]">giliran kamu!</p>}
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="rounded-2xl overflow-hidden border-2 border-[#c9a0a0] shadow-lg"
        style={{ background: '#fff5f5' }}>
        <div className="grid gap-0" style={{ gridTemplateRows: `repeat(10, 1fr)` }}>
          {BOARD.map((row, ri) => (
            <div key={ri} className="grid grid-cols-10">
              {row.map(cell => {
                const isSnakeHead = SNAKES[cell] !== undefined
                const isLadderBot = LADDERS[cell] !== undefined
                const isTruth = TRUTH_CELLS.has(cell)
                const isDare  = DARE_CELLS.has(cell)
                const p1Here  = positions[0] === cell
                const p2Here  = positions[1] === cell

                let bg = (ri + row.indexOf(cell)) % 2 === 0 ? '#ffe8e8' : '#fff0f0'
                if (isTruth) bg = '#e8f0ff'
                if (isDare)  bg = '#ffe8f0'
                if (isSnakeHead) bg = '#fff0e0'
                if (isLadderBot) bg = '#e8ffe8'

                return (
                  <div key={cell}
                    className="relative flex flex-col items-center justify-center border border-[#f5d0d0]"
                    style={{ background: bg, aspectRatio: '1', minWidth: 0, fontSize: '6px' }}>
                    <span style={{ color: '#888', fontSize: '0.45rem', lineHeight: 1 }}>{cell}</span>
                    {isTruth  && <span style={{ fontSize: '0.38rem', color: '#4466cc' }}>T</span>}
                    {isDare   && <span style={{ fontSize: '0.38rem', color: '#cc4488' }}>D</span>}
                    {isSnakeHead && <span style={{ fontSize: '0.5rem' }}>🐍</span>}
                    {isLadderBot && <span style={{ fontSize: '0.5rem' }}>🪜</span>}
                    {/* Players */}
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                      {p1Here && <span style={{ fontSize: '0.7rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>♥</span>}
                      {p2Here && <span style={{ fontSize: '0.7rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))', color: '#2e5e8b' }}>★</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-[10px] px-1">
        <span className="flex items-center gap-1"><span style={{width:10,height:10,background:'#e8f0ff',display:'inline-block',border:'1px solid #ccc'}}/>Truth</span>
        <span className="flex items-center gap-1"><span style={{width:10,height:10,background:'#ffe8f0',display:'inline-block',border:'1px solid #ccc'}}/>Dare</span>
        <span className="flex items-center gap-1">🐍 Ular (turun)</span>
        <span className="flex items-center gap-1">🪜 Tangga (naik)</span>
        <span className="flex items-center gap-1" style={{color:'#8b2e2e'}}>♥ P1</span>
        <span className="flex items-center gap-1" style={{color:'#2e5e8b'}}>★ P2</span>
      </div>

      {/* Event message */}
      {lastEvent && (
        <div className="text-center text-sm px-4 py-2 rounded-xl" style={{ background: '#f5e8e8', color: '#6b2020' }}>
          {lastEvent}
        </div>
      )}

      {/* Dice + Roll */}
      {!winner && !challenge && (
        <div className="flex items-center gap-4 justify-center">
          <DiceIcon className="w-10 h-10" style={{ color: playerColors[turn] }} />
          <button onClick={rollDice} disabled={rolling}
            className="px-8 py-3 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${playerColors[turn]}, #1a0404)` }}>
            {rolling ? 'Mengocok...' : `🎲 Lempar Dadu`}
          </button>
        </div>
      )}

      {/* Winner */}
      {winner !== null && (
        <div className="text-center py-4 rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${playerColors[winner]}, #1a0404)`, color: 'white' }}>
          <p className="font-playfair text-2xl font-bold">{playerLabels[winner]} Menang! 🎉</p>
          <button onClick={reset} className="mt-3 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm">
            Main Lagi ↺
          </button>
        </div>
      )}

      {/* Challenge modal */}
      {challenge && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="py-4 px-6 text-center font-bold text-2xl tracking-widest"
              style={{ background: challenge.type === 'truth' ? '#2244aa' : '#aa2244', color: 'white' }}>
              {challenge.type === 'truth' ? '💙 TRUTH' : '💕 DARE'}
            </div>
            <div className="bg-white px-6 py-8">
              <p className="font-playfair text-lg text-center text-gray-800 leading-relaxed">
                {challenge.content}
              </p>
            </div>
            <button onClick={dismissChallenge}
              className="w-full py-4 font-bold text-white text-base"
              style={{ background: challenge.type === 'truth' ? '#2244aa' : '#aa2244' }}>
              Selesai ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
