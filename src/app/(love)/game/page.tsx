import { getQuizQuestions } from '@/lib/data'
import QuizGame from '@/components/game/QuizGame'

export const metadata = { title: 'Mini Game' }

export default async function GamePage() {
  const questions = await getQuizQuestions()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl text-rose-800 mb-2">Seberapa Kenal Aku?</h1>
      <p className="text-rose-400 mb-8 text-sm">Yuk, buktikan seberapa kenal kamu sama aku 💝</p>
      <QuizGame questions={questions} />
    </div>
  )
}
