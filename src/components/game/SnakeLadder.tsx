'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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

type GameMode = 'normal' | 'truth-dare' | 'math'

// ── Board config ─────────────────────────────────────────────────────────────
const SNAKES:  Record<number, number> = { 17:7, 54:34, 62:19, 64:60, 87:24, 93:73, 99:78 }
const LADDERS: Record<number, number> = { 4:14, 9:31, 20:38, 28:84, 40:59, 51:67, 71:91 }
const TRUTH_CELLS = new Set([5,11,16,22,27,33,42,48,61,72,80,86,94])
const DARE_CELLS  = new Set([3,8,15,23,30,37,43,50,57,65,76,83,89,97])

const MATH_QUESTIONS = [
  { q:'2+3', a:5 },{ q:'4×2', a:8 },{ q:'9-4', a:5 },
  { q:'3+6', a:9 },{ q:'7-3', a:4 },{ q:'5×2', a:10 },
  { q:'8+4', a:12 },{ q:'15-7', a:8 },{ q:'6×3', a:18 },
  { q:'12÷4', a:3 },{ q:'7+8', a:15 },{ q:'20-9', a:11 },
  { q:'4×4', a:16 },{ q:'25÷5', a:5 },{ q:'9+7', a:16 },
]

const TIMER_OPTIONS = [5,10,20,30,40,50]

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

const CS = 50 // cell size in SVG units (500×500 viewBox)
function cellCenter(cell: number) {
  let x = 0, y = 0
  BOARD.forEach((row, ri) => row.forEach((val, ci) => {
    if (val === cell) { x = ci*CS + CS/2; y = ri*CS + CS/2 }
  }))
  return { x, y }
}

// ── SVG Board ─────────────────────────────────────────────────────────────────
function BoardSVG({ positions, mode }: { positions: number[]; mode: GameMode }) {
  const snakeColors = ['#e05c2a','#2aae4f','#9b33cc','#e0b02a','#cc3366','#2a7ae0']
  let si = 0

  return (
    <svg viewBox="0 0 500 500" width="100%" style={{ display:'block', maxWidth:500 }}>
      {/* Cells */}
      {BOARD.map((row, ri) => row.map((cell, ci) => {
        const x = ci*CS, y = ri*CS
        const even = (9-ri) % 2 === 0
        const bg = even ? (ci%2===0 ? '#ffe8e8':'#fff4f4') : (ci%2===0 ? '#fff4f4':'#ffe8e8')
        const isTruth = TRUTH_CELLS.has(cell) && mode==='truth-dare'
        const isDare  = DARE_CELLS.has(cell)  && mode==='truth-dare'
        return (
          <g key={cell}>
            <rect x={x} y={y} width={CS} height={CS}
              fill={isTruth?'#dde8ff':isDare?'#ffe8f4':bg}
              stroke="rgba(139,46,46,0.12)" strokeWidth="0.5"/>
            <text x={x+3} y={y+10} fontSize="7" fill="rgba(100,20,20,0.45)" fontWeight="600">{cell}</text>
            {isTruth && <text x={x+CS/2} y={y+CS/2+3} fontSize="8" fill="#4466cc" textAnchor="middle" fontWeight="bold">T</text>}
            {isDare  && <text x={x+CS/2} y={y+CS/2+3} fontSize="8" fill="#cc4488" textAnchor="middle" fontWeight="bold">D</text>}
          </g>
        )
      }))}

      {/* Ladders */}
      {Object.entries(LADDERS).map(([from, to]) => {
        const b = cellCenter(+from), t = cellCenter(+to)
        const angle = Math.atan2(t.y-b.y, t.x-b.x)
        const px = Math.sin(angle)*5, py = -Math.cos(angle)*5
        const dist = Math.hypot(t.x-b.x, t.y-b.y)
        const rungs = Math.max(3, Math.floor(dist/28))
        return (
          <g key={`l${from}`}>
            <line x1={b.x-px} y1={b.y-py} x2={t.x-px} y2={t.y-py} stroke="#7a4e1a" strokeWidth="2.5"/>
            <line x1={b.x+px} y1={b.y+py} x2={t.x+px} y2={t.y+py} stroke="#7a4e1a" strokeWidth="2.5"/>
            {Array.from({length:rungs-1},(_,i)=>{
              const f=(i+1)/rungs
              const rx=b.x+(t.x-b.x)*f, ry=b.y+(t.y-b.y)*f
              return <line key={i} x1={rx-px} y1={ry-py} x2={rx+px} y2={ry+py} stroke="#7a4e1a" strokeWidth="1.8"/>
            })}
            <circle cx={b.x} cy={b.y} r="4.5" fill="#5a3a10"/>
            <circle cx={t.x} cy={t.y} r="3.5" fill="#3a2008"/>
          </g>
        )
      })}

      {/* Snakes */}
      {Object.entries(SNAKES).map(([head, tail]) => {
        const color = snakeColors[si++ % snakeColors.length]
        const h = cellCenter(+head), t = cellCenter(+tail)
        const mx=(h.x+t.x)/2, my=(h.y+t.y)/2
        const off = (si%2===0 ? 32:-32)
        const d = `M${h.x} ${h.y} C${mx+off} ${h.y} ${mx-off} ${t.y} ${t.x} ${t.y}`
        return (
          <g key={`s${head}`}>
            <path d={d} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.82"/>
            <path d={d} stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" fill="none" strokeDasharray="4 7"/>
            <circle cx={h.x} cy={h.y} r="7.5" fill={color}/>
            <circle cx={h.x-2.5} cy={h.y-2.5} r="1.8" fill="white" opacity="0.9"/>
            <circle cx={h.x+2.5} cy={h.y-2.5} r="1.8" fill="white" opacity="0.9"/>
            <circle cx={t.x} cy={t.y} r="4" fill={color} opacity="0.55"/>
          </g>
        )
      })}

      {/* Players */}
      {positions.map((pos, pi) => {
        if (pos===0) return null
        const c = cellCenter(pos)
        const ox = pi===0 ? -9 : 9
        return (
          <g key={pi}>
            <circle cx={c.x+ox} cy={c.y} r="10" fill={pi===0?'#8b2020':'#1a5c8b'}
              stroke="white" strokeWidth="2" style={{filter:'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'}}/>
            <text x={c.x+ox} y={c.y+4} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
              {pi===0?'♥':'★'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRandomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }

type MathChallenge = { q:string; a:number; input:string; wrong:boolean; timeLeft:number }
type AnyChallenge = TruthDare | MathChallenge
function isMath(c: AnyChallenge): c is MathChallenge { return 'q' in c }

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SnakeLadder({ onBack, truthDare }: Props) {
  const [mode,       setMode]      = useState<GameMode|null>(null)
  const [timerSecs,  setTimerSecs] = useState(10)
  const [positions,  setPositions] = useState([0,0])
  const [turn,       setTurn]      = useState(0)
  const [dice,       setDice]      = useState<number|null>(null)
  const [rolling,    setRolling]   = useState(false)
  const [challenge,  setChallenge] = useState<AnyChallenge|null>(null)
  const [winner,     setWinner]    = useState<number|null>(null)
  const [lastEvent,  setLastEvent] = useState('')
  const timerRef    = useRef<ReturnType<typeof setInterval>|null>(null)
  const inputRef    = useRef<HTMLInputElement>(null)

  const truths = truthDare.filter(t=>t.type==='truth')
  const dares  = truthDare.filter(t=>t.type==='dare')

  // Countdown for math
  const startCountdown = useCallback((secs: number, q: typeof MATH_QUESTIONS[0]) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const ch: MathChallenge = { ...q, input:'', wrong:false, timeLeft:secs }
    setChallenge(ch)
    let left = secs
    timerRef.current = setInterval(() => {
      left--
      if (left<=0) {
        clearInterval(timerRef.current!); timerRef.current=null
        setChallenge(null)
        setLastEvent('⏰ Waktu habis! Pemain tetap di tempat.')
        setTurn(t=>1-t)
      } else {
        setChallenge(prev => prev && isMath(prev) ? {...prev, timeLeft:left} : prev)
      }
    }, 1000)
  }, [])

  const clearTimer = () => { if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null } }

  const submitMath = () => {
    if (!challenge || !isMath(challenge)) return
    const val = parseInt(challenge.input, 10)
    if (val===challenge.a) {
      clearTimer(); setChallenge(null); setTurn(t=>1-t)
    } else {
      setChallenge({...challenge, wrong:true})
      setTimeout(()=>setChallenge(prev=>prev&&isMath(prev)?{...prev,wrong:false,input:''}:prev), 800)
    }
  }

  const dismissChallenge = () => { clearTimer(); setChallenge(null); setTurn(t=>1-t) }

  const doMove = useCallback((result: number, currentTurn: number) => {
    setPositions(prev => {
      const next = [...prev]
      let pos = next[currentTurn] + result

      if (pos>100) { setLastEvent('Terlalu jauh!'); setTurn(t=>1-t); return prev }
      if (pos===100) { next[currentTurn]=100; setWinner(currentTurn); return next }

      if (SNAKES[pos]) {
        const dest=SNAKES[pos]; setLastEvent(`🐍 Ular! ${pos}→${dest}`); pos=dest
        next[currentTurn]=pos; setTurn(t=>1-t); return next
      }
      if (LADDERS[pos]) {
        const dest=LADDERS[pos]; setLastEvent(`🪜 Tangga! ${pos}→${dest}`); pos=dest
        next[currentTurn]=pos; setTurn(t=>1-t); return next
      }

      next[currentTurn]=pos

      if (mode==='truth-dare') {
        if (TRUTH_CELLS.has(pos) && truths.length>0) setChallenge(getRandomItem(truths))
        else if (DARE_CELLS.has(pos) && dares.length>0) setChallenge(getRandomItem(dares))
        else setTurn(t=>1-t)
      } else if (mode==='math') {
        startCountdown(timerSecs, getRandomItem(MATH_QUESTIONS))
      } else {
        setTurn(t=>1-t)
      }
      return next
    })
  }, [mode, truths, dares, timerSecs, startCountdown])

  const rollDice = useCallback(() => {
    if (rolling||winner!==null||challenge) return
    setRolling(true); setLastEvent('')
    let count=0
    const iv = setInterval(()=>{
      setDice(Math.ceil(Math.random()*6))
      if (++count>=8) {
        clearInterval(iv)
        const result=Math.ceil(Math.random()*6)
        setDice(result); setRolling(false)
        doMove(result, turn)
      }
    }, 80)
  }, [rolling, winner, challenge, turn, doMove])

  const reset = () => {
    clearTimer()
    setPositions([0,0]); setTurn(0); setDice(null)
    setChallenge(null); setWinner(null); setLastEvent('')
  }

  const pColor = ['#8b2020','#1a5c8b']
  const pLabel = ['♥ Pemain 1','★ Pemain 2']

  // ── Mode selection ─────────────────────────────────────────────────────────
  if (!mode) return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060]">
        <ArrowLeft className="w-4 h-4"/> Kembali
      </button>
      <p className="font-playfair text-xl text-[#3d0c0c] text-center">Ular Tangga</p>
      {[
        {id:'normal'     as GameMode, label:'🎲 Mode Normal',          sub:'Ular tangga klasik'},
        {id:'truth-dare' as GameMode, label:'💕 Truth or Dare',        sub:'Kotak khusus ada tantangan'},
        {id:'math'       as GameMode, label:'🔢 Ular Tangga Matematika',sub:'Jawab soal sebelum lanjut'},
      ].map(m=>(
        <button key={m.id} onClick={()=>setMode(m.id)}
          className="w-full py-4 rounded-2xl font-semibold text-white shadow transition-all hover:scale-[1.01]"
          style={{background:'linear-gradient(135deg,#6b2020,#3d0c0c)'}}>
          {m.label}
          <p className="text-xs font-normal opacity-70 mt-0.5">{m.sub}</p>
        </button>
      ))}
      {/* Timer setting for math mode */}
      <div className="bg-white rounded-2xl p-4 border border-[#e8d0d0]">
        <p className="text-xs text-[#a06060] mb-2 font-medium">⏱ Waktu per soal (mode matematika)</p>
        <div className="flex gap-2 flex-wrap">
          {TIMER_OPTIONS.map(s=>(
            <button key={s} onClick={()=>setTimerSecs(s)}
              className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: timerSecs===s ? '#8b2020' : '#f5e8e8',
                color: timerSecs===s ? 'white' : '#6b2020',
              }}>
              {s}s
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Game ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#a06060]"><ArrowLeft className="w-4 h-4"/> Kembali</button>
        <span className="text-xs px-3 py-1 rounded-full bg-[#f5e8e8] text-[#6b2020] font-medium">
          {mode==='normal'?'🎲':mode==='truth-dare'?'💕':'🔢'} {timerSecs}s
        </span>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-[#a06060]"><RotateCcw className="w-3.5 h-3.5"/> Reset</button>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        {[0,1].map(p=>(
          <div key={p} className="rounded-2xl py-2.5 px-3 text-center"
            style={{background:'#f5e8e8', outline:turn===p&&!winner?`2px solid ${pColor[p]}`:'none', outlineOffset:2}}>
            <p className="text-xs text-[#a06060]">{pLabel[p]}</p>
            <p className="text-2xl font-bold" style={{color:pColor[p]}}>{positions[p]===0?'START':positions[p]}</p>
            {turn===p&&!winner&&<p className="text-[10px] text-[#a06060]">giliran!</p>}
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="rounded-xl overflow-hidden border border-[#e8d0d0] shadow-sm">
        <BoardSVG positions={positions} mode={mode}/>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-[10px] text-[#a06060]">
        <span>🐍 Ular = turun</span>
        <span style={{color:'#7a4e1a'}}>🪜 Tangga = naik</span>
        {mode==='truth-dare'&&<><span style={{color:'#4466cc'}}>■ Truth</span><span style={{color:'#cc4488'}}>■ Dare</span></>}
        {mode==='math'&&<span style={{color:'#3a7a20'}}>⏱ Waktu: {timerSecs}s per soal</span>}
      </div>

      {lastEvent && <div className="text-center text-sm px-3 py-2 rounded-xl bg-[#f5e8e8] text-[#6b2020]">{lastEvent}</div>}

      {winner!==null && (
        <div className="text-center py-4 rounded-2xl text-white" style={{background:`linear-gradient(135deg,${pColor[winner]},#1a0404)`}}>
          <p className="font-playfair text-xl font-bold">{pLabel[winner]} Menang! 🎉</p>
          <button onClick={reset} className="mt-2 px-5 py-1.5 bg-white/20 rounded-full text-sm">Main Lagi</button>
        </div>
      )}

      {!winner&&!challenge&&(
        <div className="flex items-center gap-4 justify-center">
          {dice&&<span className="text-5xl">{'⚀⚁⚂⚃⚄⚅'[dice-1]}</span>}
          <button onClick={rollDice} disabled={rolling}
            className="px-7 py-3 rounded-2xl text-white font-bold text-base disabled:opacity-60"
            style={{background:`linear-gradient(135deg,${pColor[turn]},#1a0404)`}}>
            {rolling?'Mengocok...':'🎲 Lempar Dadu'}
          </button>
        </div>
      )}

      {/* Truth/Dare modal */}
      {challenge&&!isMath(challenge)&&(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="py-4 px-6 text-center font-bold text-2xl"
              style={{background:(challenge as TruthDare).type==='truth'?'#2244aa':'#aa2244',color:'white'}}>
              {(challenge as TruthDare).type==='truth'?'💙 TRUTH':'💕 DARE'}
            </div>
            <div className="bg-white px-6 py-8">
              <p className="font-playfair text-lg text-center leading-relaxed text-gray-800">{(challenge as TruthDare).content}</p>
            </div>
            <button onClick={dismissChallenge} className="w-full py-4 font-bold text-white"
              style={{background:(challenge as TruthDare).type==='truth'?'#2244aa':'#aa2244'}}>
              Selesai ✓
            </button>
          </div>
        </div>
      )}

      {/* Math modal */}
      {challenge&&isMath(challenge)&&(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl bg-white">
            <div className="py-3 px-6 text-center font-bold text-lg" style={{background:'#3a7a20',color:'white'}}>
              🔢 Soal Matematika
            </div>
            <div className="px-6 py-5 text-center space-y-3">
              {/* Timer bar */}
              <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width:`${(challenge.timeLeft/timerSecs)*100}%`,
                    background: challenge.timeLeft<=5 ? '#e05c2a' : '#3a7a20',
                  }}/>
              </div>
              <p className="text-sm font-bold" style={{color:challenge.timeLeft<=5?'#e05c2a':'#3a7a20'}}>
                ⏱ {challenge.timeLeft}s
              </p>
              <p className="font-playfair text-4xl font-bold text-gray-800">{challenge.q} = ?</p>
              <input
                ref={inputRef}
                type="number"
                value={challenge.input}
                onChange={e=>setChallenge({...challenge,input:e.target.value,wrong:false})}
                onKeyDown={e=>e.key==='Enter'&&submitMath()}
                autoFocus
                className={`w-full text-center text-3xl font-bold py-3 rounded-xl border-2 focus:outline-none transition-colors ${
                  challenge.wrong?'border-red-400 bg-red-50 text-red-600':'border-gray-200 bg-gray-50 text-gray-800'
                }`}
                placeholder="?"
              />
              {challenge.wrong&&<p className="text-red-500 text-sm">❌ Salah! Coba lagi.</p>}
              <button onClick={submitMath}
                className="w-full py-3 rounded-2xl text-white font-bold text-lg"
                style={{background:'#3a7a20'}}>
                Jawab ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
