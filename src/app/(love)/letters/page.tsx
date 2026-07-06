import { getLetters } from '@/lib/data'
import LetterList from '@/components/letters/LetterList'

export const metadata = { title: 'Surat Untukmu' }

export default async function LettersPage() {
  const letters = await getLetters()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl text-rose-800 mb-2">Surat Untukmu</h1>
      <p className="text-rose-400 mb-8 text-sm">Kata-kata yang tidak selalu bisa aku ucapkan 💌</p>
      <LetterList letters={letters} />
    </div>
  )
}
