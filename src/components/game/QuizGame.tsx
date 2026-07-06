'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react'

interface Question {
  id: string
  question: string
  answer: string
  options: string[]
}

interface Props {
  questions: Question[]
}

export default function QuizGame({ questions }: Props) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([])

  if (questions.length === 0) {
    return <p className="text-center text-rose-300 py-20 font-playfair text-lg">Belum ada pertanyaan~ 🎮</p>
  }

  const q = questions[current]
  const isCorrect = selected === q.answer
  const showResult = selected !== null

  const handleSelect = (opt: string) => {
    if (selected) return
    setSelected(opt)
    const correct = opt === q.answer
    if (correct) setScore((s) => s + 1)
    setAnswers((a) => [...a, { correct }])
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
    setAnswers([])
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    let msg = 'Masih perlu belajar lebih kenal aku~ 😅'
    if (pct >= 80) msg = 'Wah kamu emang yang paling kenal aku! 💕'
    else if (pct >= 60) msg = 'Lumayan! Tapi masih ada yang perlu dipelajari~ 😊'

    return (
      <div className="text-center py-10">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="font-playfair text-3xl text-rose-800 mb-2">Selesai!</h2>
        <p className="text-rose-500 mb-2">
          Kamu benar <span className="font-bold text-rose-700">{score}</span> dari{' '}
          <span className="font-bold">{questions.length}</span> pertanyaan
        </p>
        <p className="text-rose-400 mb-8">{msg}</p>

        {/* Score breakdown */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${a.correct ? 'bg-green-400' : 'bg-rose-300'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <button
          onClick={handleRestart}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-rose-400 hover:bg-rose-500 text-white rounded-full transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Main Lagi
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-2 text-sm text-rose-400">
        <span>Pertanyaan {current + 1} / {questions.length}</span>
        <span>✅ {score} benar</span>
      </div>
      <div className="w-full bg-rose-100 rounded-full h-2 mb-6">
        <div
          className="bg-rose-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((current) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 mb-6">
        <p className="font-playfair text-rose-800 text-xl leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {q.options.map((opt) => {
          let style = 'bg-white border-rose-100 text-rose-700 hover:border-rose-300 hover:bg-rose-50'
          if (showResult) {
            if (opt === q.answer) style = 'bg-green-50 border-green-300 text-green-700'
            else if (opt === selected) style = 'bg-rose-100 border-rose-300 text-rose-600'
            else style = 'bg-white border-rose-50 text-rose-300 opacity-60'
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={showResult}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-colors font-medium flex items-center justify-between ${style}`}
            >
              <span>{opt}</span>
              {showResult && opt === q.answer && <CheckCircle className="w-5 h-5 text-green-500" />}
              {showResult && opt === selected && opt !== q.answer && <XCircle className="w-5 h-5 text-rose-400" />}
            </button>
          )
        })}
      </div>

      {/* Feedback + Next */}
      {showResult && (
        <div className={`rounded-xl p-4 mb-4 text-center ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-600'}`}>
          {isCorrect ? '🎉 Benar banget!' : `❌ Yah, salah~ Jawabannya: ${q.answer}`}
        </div>
      )}

      {showResult && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-rose-400 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors"
        >
          {current + 1 >= questions.length ? 'Lihat Hasil' : 'Pertanyaan Berikutnya →'}
        </button>
      )}
    </div>
  )
}
