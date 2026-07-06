import { getScrapbooks } from '@/lib/data'
import ScrapbookList from '@/components/scrapbook/ScrapbookList'

export const metadata = { title: 'Scrapbook' }

export default async function ScrapbookPage() {
  const books = await getScrapbooks()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl text-rose-800 mb-2">Scrapbook</h1>
      <p className="text-rose-400 mb-8 text-sm">Buku-buku kenangan kita 📚</p>
      <ScrapbookList books={books} />
    </div>
  )
}
