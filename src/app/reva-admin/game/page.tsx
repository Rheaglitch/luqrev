import { getQuizQuestions } from '@/lib/data'
import GameManager from '@/components/admin/GameManager'

export default async function AdminGamePage() {
  const questions = await getQuizQuestions()
  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Kelola Quiz</h1>
      <GameManager questions={questions} />
    </div>
  )
}
