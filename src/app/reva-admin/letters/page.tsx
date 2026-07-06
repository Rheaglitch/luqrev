import { getLetters } from '@/lib/data'
import LettersManager from '@/components/admin/LettersManager'

export default async function AdminLettersPage() {
  const letters = await getLetters()
  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Kelola Surat</h1>
      <LettersManager letters={letters} />
    </div>
  )
}
