'use client'

import { useState, useCallback, useRef } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface TruthDare {
  id: string
  type: 'truth' | 'dare'
  content: string
}

interface Props {
  onBack: () => void
  truthDare: TruthDare[]
}

// ── Board config ─────────────────────────────────────────────────────────────
const SNAKES: Record<number, number> = {
  17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 99: 78,
}
const LADDERS: Record<number, number> = {
  4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 71: 91,
}
const TRUTH_CELLS = new Set([5,11,16,22,27,33,42,48,61,72,80,86,94])
const DARE_CELLS  = new Set([3,8,15,23,30,37,43,50,57,65,76,83,89,97])

// Math questions for math mode
const MATH_QUESTIONS = [
  { q: '2+3=', a: 5 }, { q: '4×2=', a: 8 }, { q: '9-4=', a: 5 },
  { q: '3+6=', a: 9 }, { q: '7-3=', a: 4 }, { q: '5×2=', a: 10 },
  { q: '8+4=', a: 12 },{ q: '15-7=', a: 8 },{ q: '6×3=', a: 18 },
  { q: '12÷4=', a: 3 },{ q: '7+8=', a: 15 },{ q: '20-9=', a: 11 },
  { q: '4×4=', a: 16 },{ q: '25÷5=', a: 5 },{ q: '9+7=', a: 16 },
  { q: '3×7=', a: 21 },{ q: '18÷6=', a: 3 },{ q: '11+9=', a: 20 },
]

// Build serpentine board
function buildBoard(): number[][] {
  const rows: number[][] = []
  for (let r = 0; r < 10; r++) {
    const row = Array.from({ length: 10 }, (_, c) => r * 10 + c + 1)
    if (r % 2 !== 0) row.reverse()
    rows.unshift(row)
  }
  return rows
}
const BOARD = buildBoard()

// Get pixel center of a cell (1-100) on the board SVG (500×500)
const CELL_SIZE = 50  // 500px / 10 cols
function cellCenter(cell: number): { x: number; y: number } {
  let found = { x: 0, y: 0 }
  BOARD.forEach((row, ri) => {
    row.forEach((val, ci) => {
      if (val === cell) {
        found = {
          x: ci * CELL_SIZE + CELL_SIZE / 2,
          y: ri * CELL_SIZE + CELL_SIZE / 2,
        }
      }
    })
  })
  return found
}

// ── SVG Board ─────────────────────────────────────────────────────────────────
function BoardSVG({ positions, mode }: { positions: number[]; mode: string }) {
  const SVG = 500
  const CS  = CELL_SIZE

  // Snake SVG path: head → tail with wavy curve
  function snakePath(head: number, tail: number) {
    const h = cellCenter(head)
    const t = cellCenter(tail)
    const mx = (h.x + t.x) / 2 + (Math.random() > 0.5 ? 40 : -40)
    const my = (h.y + t.y) / 2
    return `M ${h.x} ${h.y} Q ${mx} ${my} ${t.x} ${t.y}`
  }

  // Ladder SVG: two parallel rails from bottom to top
  function ladderLines(bottom: number, top: number) {
    const b = cellCenter(bottom)
    const t = cellCenter(top)
    const dx = 6  // half-width of ladder
    const angle = Math.atan2(t.y - b.y, t.x - b.x)
    const perpX = Math.sin(angle) * dx
    const perpY = -Math.cos(angle) * dx
    // Rails
    const rails = [
      `M ${b.x - perpX} ${b.y - perpY} L ${t.x - perpX} ${t.y - perpY}`,
      `M ${b.x + perpX} ${b.y + perpY} L ${t.x + perpX} ${t.y + perpY}`,
    ]
    // Rungs
    const dist = Math.hypot(t.x - b.x, t.y - b.y)
    const rungs: string[] = []
    const rungCount = Math.max(3, Math.floor(dist / 30))
    for (let i = 1; i < rungCount; i++) {
      const frac = i / rungCount
      const rx = b.x + (t.x - b.x) * frac
      const ry = b.y + (t.y - b.y) * frac
      rungs.push(`M ${rx - perpX} ${ry - perpY} L ${rx + perpX} ${ry + perpY}`)
    }
    return { rails, rungs }
  }

  const snakeColors = ['#e05c2a','#2aae4f','#9b33cc','#e0b02a','#cc3366']
  let snakeIdx = 0

  return (
    <svg
      viewBox={`0 0 ${SVG} ${SVG}`}
      width="100%"
      style={{ maxWidth: 500, display: 'block' }}
    >
      {/* Board cells */}
      {BOARD.map((row, ri) =>
        row.map((cell, ci) => {
          const x = ci * CS
          const y = ri * CS
          const isEvenRow = (9 - ri) % 2 === 0
          const bg = isEvenRow
            ? (ci % 2 === 0 ? '#ffe8e8' : '#fff0f0')
            : (ci % 2 === 0 ? '#fff0f0' : '#ffe8e8')
          const isTruth = TRUTH_CELLS.has(cell) && mode === 'truth-dare'
          const isDare  = DARE_CELLS.has(cell)  && mode === 'truth-dare'
          const isMath  = mode === 'math' && cell % 7 === 0
          return (
            <g key={cell}>
              <rect x={x} y={y} width={CS} height={CS}
                fill={isTruth ? '#dde8ff' : isDare ? '#ffe8f4' : isMath ? '#e8ffdd' : bg}
                stroke="rgba(139,46,46,0.15)" strokeWidth="0.5"
              />
              {/* Cell number */}
              <text x={x+3} y={y+11} fontSize="8" fill="rgba(100,20,20,0.5)" fontWeight="600">{cell}</text>
              {/* Labels */}
              {isTruth && <text x={x+CS/2} y={y+CS/2+2} fontSize="7" fill="#4466cc" textAnchor="middle" fontWeight="bold">T</text>}
              {isDare  && <text x={x+CS/2} y={y+CS/2+2} fontSize="7" fill="#cc4488" textAnchor="middle" fontWeight="bold">D</text>}
            </g>
          )
        })
      )}

      {/* Ladders (draw first, under snakes) */}
      {Object.entries(LADDERS).map(([from, to]) => {
        const { rails, rungs } = ladderLines(Number(from), Number(to))
        return (
          <g key={`ladder-${from}`}>
            {rails.map((d, i) => (
              <path key={i} d={d} stroke="#8b5e2a" strokeWidth="2.5" fill="none" />
            ))}
            {rungs.map((d, i) => (
              <path key={i} d={d} stroke="#8b5e2a" strokeWidth="2" fill="none" />
            ))}
            {/* Bottom arrow */}
            <circle cx={cellCenter(Number(from)).x} cy={cellCenter(Number(from)).y} r="5"
              fill="#8b5e2a" opacity="0.7" />
            {/* Top arrow */}
            <circle cx={cellCenter(Number(to)).x} cy={cellCenter(Number(to)).y} r="4"
              fill="#5a3a10" opacity="0.9" />
          </g>
        )
      })}

      {/* Snakes */}
      {Object.entries(SNAKES).map(([head, tail]) => {
        const color = snakeColors[snakeIdx % snakeColors.length]
        snakeIdx++
        const hc = cellCenter(Number(head))
        const tc = cellCenter(Number(tail))
        // Wavy snake body using multiple curves
        const mx = (hc.x + tc.x) / 2
        const my = (hc.y + tc.y) / 2
        const offset = (snakeIdx % 2 === 0 ? 35 : -35)
        const d = `M ${hc.x} ${hc.y} C ${mx+offset} ${hc.y}, ${mx-offset} ${tc.y}, ${tc.x} ${tc.y}`
        return (
          <g key={`snake-${head}`}>
            {/* Body */}
            <path d={d} stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"
              opacity="0.85" />
            {/* Pattern dots */}
            <path d={d} stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none"
              strokeDasharray="4 6" strokeLinecap="round" />
            {/* Head circle */}
            <circle cx={hc.x} cy={hc.y} r="7" fill={color} />
            <circle cx={hc.x-2} cy={hc.y-2} r="1.5" fill="white" />
            <circle cx={hc.x+2} cy={hc.y-2} r="1.5" fill="white" />
            {/* Tail dot */}
            <circle cx={tc.x} cy={tc.y} r="4" fill={color} opacity="0.6" />
          </g>
        )
      })}

      {/* Player tokens */}
      {positions.map((pos, pi) => {
        if (pos === 0) return null
        const c = cellCenter(pos)
        const offset = pi === 0 ? -8 : 8
        const playerColors = ['#8b2020', '#1a5c8b']
        const labels = ['♥', '★']
        return (
          <g key={pi}>
            <circle cx={c.x + offset} cy={c.y} r="10"
              fill={playerColors[pi]} stroke="white" strokeWidth="2"
              style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
            />
            <text x={c.x + offset} y={c.y + 4} textAnchor="middle"
              fontSize="10" fill="white" fontWeight="bold">
              {labels[pi]}
            </text>
          </g>
        )
      })}

      {/* Start label */}
      <text x="5" y={SVG - 5} fontSize="8" fill="rgba(100,20,20,0.6)" fontWeight="bold">START →</text>
      {/* Finish label */}
      <text x={SVG - 5} y="15" fontSize="8" fill="rgba(100,20,20,0.6)" fontWeight="bold" textAnchor="end">FINISH ★</text>
    </svg>
  )
}

// ── Main Game ─────────────────────────────────────────────────────────────────
type GameMode = 'normal' | 'truth-dare' | 'math'

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function SnakeLadder({ onBack, truthDare }: Props) {
  const [mode, setMode] = useState<GameMode | null>(null)
  const [positions, setPositions] = useState([0, 0])
  const [turn, setTurn] = useState(0)
  const [dice, setDice] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [challenge, setChallenge] = useState<TruthDare | null | { q: string; a: number; input?: string; wrong?: boolean }>(null)
  const [winner, setWinner] = useState<number | null>(null)
  const [lastEvent, setLastEvent] = useState('')
  const mathInputRef = useRef<HTMLInputElement>(null)

  const truths = truthDare.filter(t => t.type === 'truth')
  const dares  = truthDare.filter(t => t.type === 'dare')

  const finishTurn = useCallback((newPos: number[], currentTurn: number, event: string) => {
    setPositions(newPos)
    setLastEvent(event)
    setTurn(1 - currentTurn)
  }, [])

  const rollDice = useCallback(() => {
    if (rolling || winner !== null || challenge) return
    setRolling(true)
    setLastEvent('')

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
            setLastEvent('Terlalu jauh! Tetap di sini.')
            setTurn(t => 1 - t)
            return prev
          }
          if (pos === 100) {
            newPos[turn] = 100
            setWinner(turn)
            return newPos
          }

          let event = ''

          if (SNAKES[pos]) {
            event = `🐍 Kena ular! ${pos}→${SNAKES[pos]}`
            pos = SNAKES[pos]
            newPos[turn] = pos
            finishTurn(newPos, turn, event)
            return newPos
          }

          if (LADDERS[pos]) {
            event = `🪜 Kena tangga! ${pos}→${LADDERS[pos]}`
            pos = LADDERS[pos]
            newPos[turn] = pos
            finishTurn(newPos, turn, event)
            return newPos
          }

          newPos[turn] = pos

          if (mode === 'truth-dare') {
            if (TRUTH_CELLS.has(pos) && truths.length > 0) {
              setChallenge(getRandomItem(truths))
            } else if (DARE_CELLS.has(pos) && dares.length > 0) {
              setChallenge(getRandomItem(dares))
            } else {
              setTurn(t => 1 - t)
            }
          } else if (mode === 'math') {
            // Random math question at every move
            setChallenge({ ...getRandomItem(MATH_QUESTIONS), input: '', wrong: false })
          } else {
            setTurn(t => 1 - t)
          }

          return newPos
        })
      }
    }, 80)
  }, [rolling, winner, challenge, turn, mode, truths, dares, finishTurn])

  const dismissChallenge = () => {
    setChallenge(null)
    setTurn(t => 1 - t)
  }

  const submitMath = () => {
    const ch = challenge as { q: string; a: number; input?: string; wrong?: boolean }
    const val = parseInt(ch.input ?? '', 10)
    if (val === ch.a) {
      setChallenge(null)
      setTurn(t => 1 - t)
    } else {
      setChallenge({ ...ch, wrong: true })
      setTimeout(() => setChallenge({ ...ch, wrong: false, input: '' }), 800)
    }
  }

  const reset = () => {
    setPositions([0, 0]); setTurn(0); setDice(null)
    setChallenge(null); setWinner(null); setLastEvent('')
  }

  const playerColors = ['#8b2020', '#1a5c8b']
  const playerLabels = ['♥ Pemain 1', '★ Pemain 2']
  const isMath = (ch: unknown): ch is { q: string; a: number; input?: string; wrong?: boolean } =>
    !!ch && typeof (ch as { q?: string }).q === 'string'

  // Mode selection
  if (!mode) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="text-center py-3">
          <p className="font-playfair text-2xl text-[#3d0c0c] mb-1">Ular Tangga</p>
          <p className="text-sm text-[#a06060]">Pilih mode permainan</p>
        </div>
        {[
          { id: 'normal' as GameMode,     label: '🎲 Mode Normal',       sub: 'Ular tangga klasik' },
          { id: 'truth-dare' as GameMode, label: '💕 Truth or Dare',     sub: 'Kotak khusus ada tantangan' },
          { id: 'math' as GameMode,       label: '🔢 Ular Tangga Matematika', sub: 'Jawab soal sebelum lanjut' },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className="w-full py-4 rounded-2xl font-semibold text-white shadow-md transition-all hover:scale-[1.02] mb-2"
            style={{ background: 'linear-gradient(135deg, #6b2020, #3d0c0c)' }}>
            {m.label}
            <p className="text-xs font-normal mt-0.5 opacity-75">{m.sub}</p>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060]">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f5e8e8] text-[#6b2020]">
          {mode === 'normal' ? '🎲 Normal' : mode === 'truth-dare' ? '💕 Truth or Dare' : '🔢 Matematika'}
        </span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-[#a06060]">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map(p => (
          <div key={p}
            className="rounded-2xl py-3 px-4 text-center"
            style={{
              background: '#f5e8e8',
              outline: turn === p && !winner ? `2px solid ${playerColors[p]}` : 'none',
              outlineOffset: 2,
            }}>
            <p className="text-xs text-[#a06060]">{playerLabels[p]}</p>
            <p className="text-2xl font-bold font-playfair" style={{ color: playerColors[p] }}>
              {positions[p] === 0 ? 'START' : positions[p]}
            </p>
            {turn === p && !winner && <p className="text-[10px] text-[#a06060]">giliran kamu!</p>}
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="rounded-2xl overflow-hidden border border-[#e8d0d0] shadow-md">
        <BoardSVG positions={positions} mode={mode} />
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-[10px] px-1">
        <span className="flex items-center gap-1">
          <span style={{width:12,height:4,background:'#e05c2a',display:'inline-block',borderRadius:2}}/>
          Ular (turun)
        </span>
        <span className="flex items-center gap-1">
          <span style={{width:3,height:14,background:'#8b5e2a',display:'inline-block'}}/>
          Tangga (naik)
        </span>
        {mode === 'truth-dare' && <>
          <span style={{width:8,height:8,background:'#dde8ff',display:'inline-block',border:'1px solid #ccc'}}/>Truth
          <span style={{width:8,height:8,background:'#ffe8f4',display:'inline-block',border:'1px solid #ccc'}}/>Dare
        </>}
      </div>

      {/* Event message */}
      {lastEvent && (
        <div className="text-center text-sm px-4 py-2 rounded-xl bg-[#f5e8e8] text-[#6b2020]">
          {lastEvent}
        </div>
      )}

      {/* Winner */}
      {winner !== null && (
        <div className="text-center py-4 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, ${playerColors[winner]}, #1a0404)` }}>
          <p className="font-playfair text-2xl font-bold">{playerLabels[winner]} Menang! 🎉</p>
          <button onClick={reset}
            className="mt-3 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm">
            Main Lagi ↺
          </button>
        </div>
      )}

      {/* Roll dice */}
      {!winner && !challenge && (
        <div className="flex items-center gap-4 justify-center">
          {dice && (
            <span className="text-5xl select-none">
              {['⚀','⚁','⚂','⚃','⚄','⚅'][dice - 1]}
            </span>
          )}
          <button onClick={rollDice} disabled={rolling}
            className="px-8 py-3 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${playerColors[turn]}, #1a0404)` }}>
            {rolling ? 'Mengocok...' : '🎲 Lempar Dadu'}
          </button>
        </div>
      )}

      {/* Truth/Dare challenge */}
      {challenge && !isMath(challenge) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="py-4 px-6 text-center font-bold text-2xl tracking-widest"
              style={{ background: (challenge as TruthDare).type === 'truth' ? '#2244aa' : '#aa2244', color: 'white' }}>
              {(challenge as TruthDare).type === 'truth' ? '💙 TRUTH' : '💕 DARE'}
            </div>
            <div className="bg-white px-6 py-8">
              <p className="font-playfair text-lg text-center text-gray-800 leading-relaxed">
                {(challenge as TruthDare).content}
              </p>
            </div>
            <button onClick={dismissChallenge}
              className="w-full py-4 font-bold text-white text-base"
              style={{ background: (challenge as TruthDare).type === 'truth' ? '#2244aa' : '#aa2244' }}>
              Selesai ✓
            </button>
          </div>
        </div>
      )}

      {/* Math challenge */}
      {challenge && isMath(challenge) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl bg-white">
            <div className="py-4 px-6 text-center font-bold text-xl" style={{ background: '#3a7a20', color: 'white' }}>
              🔢 Soal Matematika
            </div>
            <div className="px-6 py-6 text-center space-y-4">
              <p className="font-playfair text-3xl font-bold text-gray-800">{challenge.q}</p>
              <input
                ref={mathInputRef}
                type="number"
                value={challenge.input ?? ''}
                onChange={e => setChallenge({ ...challenge, input: e.target.value, wrong: false })}
                onKeyDown={e => e.key === 'Enter' && submitMath()}
                autoFocus
                className={`w-full text-center text-2xl font-bold py-3 rounded-xl border-2 focus:outline-none transition-colors ${
                  challenge.wrong ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50 text-gray-800'
                }`}
                placeholder="?"
              />
              {challenge.wrong && (
                <p className="text-red-500 text-sm">❌ Salah! Coba lagi.</p>
              )}
              <button onClick={submitMath}
                className="w-full py-3 rounded-2xl text-white font-bold text-lg"
                style={{ background: '#3a7a20' }}>
                Jawab ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
