'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface TruthDare { id: string; type: 'truth' | 'dare'; content: string }
interface Props { onBack: () => void; truthDare: TruthDare[] }
type GameMode = 'normal' | 'truth-dare' | 'math'

// ── Board config ──────────────────────────────────────────────────────────────
const SNAKES:  Record<number,number> = { 17:7, 54:34, 62:19, 64:60, 87:24, 93:73, 99:78 }
const LADDERS: Record<number,number> = { 4:14, 9:31, 20:38, 28:84, 40:59, 51:67, 71:91 }
const TRUTH_CELLS = new Set([5,11,16,22,27,33,42,48,61,72,80,86,94])
const DARE_CELLS  = new Set([3,8,15,23,30,37,43,50,57,65,76,83,89,97])

const MATH_QUESTIONS = [
  { q:'2+3=', a:5 },  { q:'4×2=', a:8 },  { q:'9-4=', a:5 },
  { q:'3+6=', a:9 },  { q:'7-3=', a:4 },  { q:'5×2=', a:10 },
  { q:'8+4=', a:12 }, { q:'15-7=', a:8 }, { q:'6×3=', a:18 },
  { q:'12÷4=', a:3 }, { q:'7+8=', a:15 }, { q:'20-9=', a:11 },
  { q:'4×4=', a:16 }, { q:'25÷5=', a:5 }, { q:'9+7=', a:16 },
  { q:'3×7=', a:21 }, { q:'18÷6=', a:3 }, { q:'11+9=', a:20 },
]

const TIMER_OPTIONS = [5, 10, 20, 30, 40, 50]

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

const CS = 50
function cellCenter(cell: number) {
  let x = 0, y = 0
  BOARD.forEach((row, ri) => row.forEach((val, ci) => {
    if (val === cell) { x = ci * CS + CS / 2; y = ri * CS + CS / 2 }
  }))
  return { x, y }
}

function getRandomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

// ── SVG Board ─────────────────────────────────────────────────────────────────
function BoardSVG({ positions, mode }: { positions: number[]; mode: GameMode }) {
  const SVG = 500
  const snakeColors = ['#e05c2a','#2aae4f','#9b33cc','#e0b02a','#cc3366']
  let si = 0

  function ladderLines(bot: number, top: number) {
    const b = cellCenter(bot), t = cellCenter(top)
    const angle = Math.atan2(t.y - b.y, t.x - b.x)
    const px = Math.sin(angle) * 6, py = -Math.cos(angle) * 6
    const dist = Math.hypot(t.x - b.x, t.y - b.y)
    const rc = Math.max(3, Math.floor(dist / 28))
    const rails = [
      `M ${b.x-px} ${b.y-py} L ${t.x-px} ${t.y-py}`,
      `M ${b.x+px} ${b.y+py} L ${t.x+px} ${t.y+py}`,
    ]
    const rungs = Array.from({ length: rc - 1 }, (_, i) => {
      const f = (i + 1) / rc
      const rx = b.x + (t.x - b.x) * f, ry = b.y + (t.y - b.y) * f
      return `M ${rx-px} ${ry-py} L ${rx+px} ${ry+py}`
    })
    return { rails, rungs, b, t }
  }

  return (
    <svg viewBox={`0 0 ${SVG} ${SVG}`} width="100%" style={{ maxWidth: 500, display: 'block' }}>
      {/* Cells */}
      {BOARD.map((row, ri) => row.map((cell, ci) => {
        const x = ci * CS, y = ri * CS
        const even = (9 - ri) % 2 === 0
        const base = even ? (ci%2===0 ? '#ffe8e8' : '#fff5f5') : (ci%2===0 ? '#fff5f5' : '#ffe8e8')
        const isTD = mode === 'truth-dare'
        const bg = TRUTH_CELLS.has(cell) && isTD ? '#dde8ff'
                 : DARE_CELLS.has(cell)  && isTD ? '#ffe8f4' : base
        return (
          <g key={cell}>
            <rect x={x} y={y} width={CS} height={CS} fill={bg} stroke="rgba(139,46,46,0.12)" strokeWidth="0.5"/>
            <text x={x+3} y={y+11} fontSize="8" fill="rgba(100,20,20,0.45)" fontWeight="600">{cell}</text>
            {TRUTH_CELLS.has(cell) && isTD && <text x={x+CS/2} y={y+CS/2+3} fontSize="7" fill="#4466cc" textAnchor="middle" fontWeight="bold">T</text>}
            {DARE_CELLS.has(cell)  && isTD && <text x={x+CS/2} y={y+CS/2+3} fontSize="7" fill="#cc4488" textAnchor="middle" fontWeight="bold">D</text>}
          </g>
        )
      }))}

      {/* Ladders */}
      {Object.entries(LADDERS).map(([from, to]) => {
        const { rails, rungs, b, t } = ladderLines(Number(from), Number(to))
        return (
          <g key={`l${from}`}>
            {rails.map((d,i) => <path key={i} d={d} stroke="#7a4f1a" strokeWidth="2.5" fill="none"/>)}
            {rungs.map((d,i) => <path key={i} d={d} stroke="#7a4f1a" strokeWidth="2" fill="none"/>)}
            <circle cx={b.x} cy={b.y} r="5" fill="#7a4f1a" opacity="0.7"/>
            <circle cx={t.x} cy={t.y} r="4" fill="#4a2a05" opacity="0.9"/>
          </g>
        )
      })}

      {/* Snakes */}
      {Object.entries(SNAKES).map(([head, tail]) => {
        const color = snakeColors[si % snakeColors.length]; si++
        const hc = cellCenter(Number(head)), tc = cellCenter(Number(tail))
        const mx = (hc.x+tc.x)/2, my = (hc.y+tc.y)/2
        const off = si % 2 === 0 ? 38 : -38
        const d = `M ${hc.x} ${hc.y} C ${mx+off} ${hc.y}, ${mx-off} ${tc.y}, ${tc.x} ${tc.y}`
        return (
          <g key={`s${head}`}>
            <path d={d} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.82"/>
            <path d={d} stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" fill="none" strokeDasharray="4 7"/>
            <circle cx={hc.x} cy={hc.y} r="8" fill={color}/>
            <circle cx={hc.x-2.5} cy={hc.y-2.5} r="1.8" fill="white"/>
            <circle cx={hc.x+2.5} cy={hc.y-2.5} r="1.8" fill="white"/>
            <circle cx={hc.x-2.5} cy={hc.y-2.5} r="0.8" fill="#222"/>
            <circle cx={hc.x+2.5} cy={hc.y-2.5} r="0.8" fill="#222"/>
            <circle cx={tc.x} cy={tc.y} r="4" fill={color} opacity="0.6"/>
          </g>
        )
      })}

      {/* Players */}
      {positions.map((pos, pi) => {
        if (pos === 0) return null
        const c = cellCenter(pos)
        const ox = pi === 0 ? -9 : 9
        return (
          <g key={pi}>
            <circle cx={c.x+ox} cy={c.y} r="11"
              fill={pi===0 ? '#8b2020' : '#1a5c8b'} stroke="white" strokeWidth="2"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}/>
            <text x={c.x+ox} y={c.y+4} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
              {pi===0 ? '♥' : '★'}
            </text>
          </g>
        )
      })}

      <text x="5" y={SVG-4} fontSize="8" fill="rgba(100,20,20,0.5)" fontWeight="bold">START →</text>
      <text x={SVG-4} y="13" fontSize="8" fill="rgba(100,20,20,0.5)" fontWeight="bold" textAnchor="end">FINISH ★</text>
    </svg>
  )
}

// ── Timer ring ────────────────────────────────────────────────────────────────
function TimerRing({ total, left }: { total: number; left: number }) {
  const r = 22, circ = 2 * Math.PI * r
  const pct = left / total
  const color = left <= 5 ? '#e05c2a' : left <= 10 ? '#e0b02a' : '#3a7a20'
  return (
    <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
      <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e0e0e0" strokeWidth="4"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}/>
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color,
      }}>{left}</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SnakeLadder({ onBack, truthDare }: Props) {
  const [mode, setMode]           = useState<GameMode | null>(null)
  const [mathTimer, setMathTimer] = useState(10)
  const [positions, setPositions] = useState([0, 0])
  const [turn, setTurn]           = useState(0)
  const [dice, setDice]           = useState<number | null>(null)
  const [rolling, setRolling]     = useState(false)
  const [winner, setWinner]       = useState<number | null>(null)
  const [lastEvent, setLastEvent] = useState('')

  // Challenge state
  const [tdChallenge, setTdChallenge] = useState<TruthDare | null>(null)
  const [mathChallenge, setMathChallenge] = useState<{ q: string; a: number; input: string; wrong: boolean; timeLeft: number } | null>(null)

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const mathInputRef = useRef<HTMLInputElement>(null)

  const truths = truthDare.filter(t => t.type === 'truth')
  const dares  = truthDare.filter(t => t.type === 'dare')

  // Tick math timer
  useEffect(() => {
    if (!mathChallenge) return
    timerRef.current = setInterval(() => {
      setMathChallenge(prev => {
        if (!prev) return null
        if (prev.timeLeft <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          setTimeout(() => {
            setMathChallenge(null)
            setLastEvent('⏰ Waktu habis! Pemain tetap di tempat.')
            setTurn(t => 1 - t)
          }, 0)
          return null
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [mathChallenge?.q])  // restart only when question changes

  const openMath = (pos: number) => {
    const q = getRandomItem(MATH_QUESTIONS)
    if (timerRef.current) clearInterval(timerRef.current)
    setMathChallenge({ ...q, input: '', wrong: false, timeLeft: mathTimer })
  }

  const submitMath = () => {
    if (!mathChallenge) return
    const val = parseInt(mathChallenge.input, 10)
    if (val === mathChallenge.a) {
      clearInterval(timerRef.current!)
      timerRef.current = null
      setMathChallenge(null)
      setTurn(t => 1 - t)
    } else {
      setMathChallenge(p => p ? { ...p, wrong: true } : null)
      setTimeout(() => setMathChallenge(p => p ? { ...p, wrong: false, input: '' } : null), 700)
    }
  }

  const rollDice = useCallback(() => {
    if (rolling || winner !== null || tdChallenge || mathChallenge) return
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
          if (pos > 100) { setLastEvent('Terlalu jauh!'); setTurn(t => 1-t); return prev }
          if (pos === 100) { newPos[turn] = 100; setWinner(turn); return newPos }

          if (SNAKES[pos])  { const d = SNAKES[pos];  pos = d; setLastEvent(`🐍 Ular! →${d}`); newPos[turn]=pos; setTurn(t=>1-t); return newPos }
          if (LADDERS[pos]) { const d = LADDERS[pos]; pos = d; setLastEvent(`🪜 Tangga! →${d}`); newPos[turn]=pos; setTurn(t=>1-t); return newPos }

          newPos[turn] = pos
          if (mode === 'truth-dare') {
            const isTruth = TRUTH_CELLS.has(pos) && truths.length > 0
            const isDare  = DARE_CELLS.has(pos)  && dares.length > 0
            if (isTruth) setTdChallenge(getRandomItem(truths))
            else if (isDare) setTdChallenge(getRandomItem(dares))
            else setTurn(t => 1-t)
          } else if (mode === 'math') {
            // open math after state update
            setTimeout(() => openMath(pos), 0)
          } else {
            setTurn(t => 1-t)
          }
          return newPos
        })
      }
    }, 80)
  }, [rolling, winner, tdChallenge, mathChallenge, turn, mode, truths, dares])

  const reset = () => {
    clearInterval(timerRef.current!); timerRef.current = null
    setPositions([0,0]); setTurn(0); setDice(null)
    setTdChallenge(null); setMathChallenge(null); setWinner(null); setLastEvent('')
  }

  const PC = ['#8b2020','#1a5c8b']
  const PL = ['♥ Pemain 1','★ Pemain 2']

  // ── Mode selection ────────────────────────────────────────────────────────
  if (!mode) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060]">
          <ArrowLeft className="w-4 h-4"/> Kembali
        </button>
        <div className="text-center py-2">
          <p className="font-playfair text-2xl text-[#3d0c0c] mb-1">Ular Tangga</p>
          <p className="text-sm text-[#a06060]">Pilih mode permainan</p>
        </div>
        {[
          { id:'normal'    as GameMode, label:'🎲 Mode Normal',            sub:'Ular tangga klasik' },
          { id:'truth-dare'as GameMode, label:'💕 Truth or Dare',           sub:'Kotak khusus ada tantangan' },
          { id:'math'      as GameMode, label:'🔢 Ular Tangga Matematika',  sub:'Jawab soal sebelum lanjut' },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className="w-full py-4 rounded-2xl font-semibold text-white shadow-md hover:scale-[1.02] transition-all mb-2"
            style={{ background:'linear-gradient(135deg, #6b2020, #3d0c0c)' }}>
            {m.label}
            <p className="text-xs font-normal mt-0.5 opacity-75">{m.sub}</p>
          </button>
        ))}

        {/* Timer picker (shown always, relevant for math) */}
        <div className="bg-white rounded-2xl p-4 border border-[#e8d0d0] space-y-2">
          <p className="text-xs text-[#a06060] font-medium">⏱ Waktu per soal matematika</p>
          <div className="flex gap-2 flex-wrap">
            {TIMER_OPTIONS.map(s => (
              <button key={s} onClick={() => setMathTimer(s)}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: mathTimer === s ? '#8b2020' : '#f5e8e8',
                  color: mathTimer === s ? 'white' : '#6b2020',
                }}>
                {s}s
              </button>
            ))}
          </div>
          <p className="text-xs text-[#c9a0a0]">Aktif di mode matematika. Dipilih: <strong>{mathTimer} detik</strong></p>
        </div>
      </div>
    )
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060]">
          <ArrowLeft className="w-4 h-4"/> Kembali
        </button>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f5e8e8] text-[#6b2020]">
          {mode==='normal' ? '🎲 Normal' : mode==='truth-dare' ? '💕 Truth or Dare' : `🔢 Matematika (${mathTimer}s)`}
        </span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-[#a06060]">
          <RotateCcw className="w-3.5 h-3.5"/> Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[0,1].map(p => (
          <div key={p} className="rounded-2xl py-3 px-4 text-center"
            style={{ background:'#f5e8e8', outline: turn===p&&!winner ? `2px solid ${PC[p]}` : 'none', outlineOffset:2 }}>
            <p className="text-xs text-[#a06060]">{PL[p]}</p>
            <p className="text-2xl font-bold font-playfair" style={{ color:PC[p] }}>
              {positions[p]===0 ? 'START' : positions[p]}
            </p>
            {turn===p && !winner && <p className="text-[10px] text-[#a06060]">giliran kamu!</p>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-[#e8d0d0] shadow-md">
        <BoardSVG positions={positions} mode={mode}/>
      </div>

      <div className="flex gap-3 flex-wrap text-[10px] px-1 text-[#a06060]">
        <span className="flex items-center gap-1"><span style={{width:14,height:4,background:'#e05c2a',display:'inline-block',borderRadius:2}}/>Ular↓</span>
        <span className="flex items-center gap-1"><span style={{width:3,height:14,background:'#7a4f1a',display:'inline-block'}}/>Tangga↑</span>
        {mode==='truth-dare' && <>
          <span className="flex items-center gap-1"><span style={{width:10,height:10,background:'#dde8ff',display:'inline-block',border:'1px solid #99b'}}/>T</span>
          <span className="flex items-center gap-1"><span style={{width:10,height:10,background:'#ffe8f4',display:'inline-block',border:'1px solid #b99'}}/>D</span>
        </>}
      </div>

      {lastEvent && (
        <div className="text-center text-sm px-4 py-2 rounded-xl bg-[#f5e8e8] text-[#6b2020]">
          {lastEvent}
        </div>
      )}

      {winner !== null && (
        <div className="text-center py-4 rounded-2xl text-white"
          style={{ background:`linear-gradient(135deg, ${PC[winner]}, #1a0404)` }}>
          <p className="font-playfair text-2xl font-bold">{PL[winner]} Menang! 🎉</p>
          <button onClick={reset} className="mt-3 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm">
            Main Lagi ↺
          </button>
        </div>
      )}

      {!winner && !tdChallenge && !mathChallenge && (
        <div className="flex items-center gap-4 justify-center">
          {dice && <span className="text-5xl select-none">{['⚀','⚁','⚂','⚃','⚄','⚅'][dice-1]}</span>}
          <button onClick={rollDice} disabled={rolling}
            className="px-8 py-3 rounded-2xl text-white font-bold text-lg active:scale-95 disabled:opacity-60"
            style={{ background:`linear-gradient(135deg, ${PC[turn]}, #1a0404)` }}>
            {rolling ? 'Mengocok...' : '🎲 Lempar Dadu'}
          </button>
        </div>
      )}

      {/* Truth/Dare modal */}
      {tdChallenge && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="py-4 px-6 text-center font-bold text-2xl tracking-widest"
              style={{ background: tdChallenge.type==='truth' ? '#2244aa' : '#aa2244', color:'white' }}>
              {tdChallenge.type==='truth' ? '💙 TRUTH' : '💕 DARE'}
            </div>
            <div className="bg-white px-6 py-8">
              <p className="font-playfair text-lg text-center text-gray-800 leading-relaxed">{tdChallenge.content}</p>
            </div>
            <button onClick={() => { setTdChallenge(null); setTurn(t=>1-t) }}
              className="w-full py-4 font-bold text-white text-base"
              style={{ background: tdChallenge.type==='truth' ? '#2244aa' : '#aa2244' }}>
              Selesai ✓
            </button>
          </div>
        </div>
      )}

      {/* Math modal */}
      {mathChallenge && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl bg-white">
            <div className="py-4 px-6 text-center font-bold text-xl" style={{ background:'#3a7a20', color:'white' }}>
              🔢 Soal Matematika
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Timer ring + question */}
              <div className="flex items-center justify-center gap-4">
                <TimerRing total={mathTimer} left={mathChallenge.timeLeft}/>
                <p className="font-playfair text-4xl font-bold text-gray-800">{mathChallenge.q}</p>
              </div>
              <input
                ref={mathInputRef}
                type="number"
                value={mathChallenge.input}
                onChange={e => setMathChallenge(p => p ? {...p, input:e.target.value, wrong:false} : null)}
                onKeyDown={e => e.key==='Enter' && submitMath()}
                autoFocus
                className={`w-full text-center text-2xl font-bold py-3 rounded-xl border-2 focus:outline-none transition-colors ${
                  mathChallenge.wrong ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50'}`}
                placeholder="?"
              />
              {mathChallenge.wrong && <p className="text-red-500 text-sm text-center">❌ Salah! Coba lagi.</p>}
              <button onClick={submitMath}
                className="w-full py-3 rounded-2xl text-white font-bold text-lg"
                style={{ background:'#3a7a20' }}>
                Jawab ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
