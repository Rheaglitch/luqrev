import { getScrapbooks } from '@/lib/data'
import ScrapbookManager from '@/components/admin/ScrapbookManager'

export default async function AdminScrapbookPage() {
  const books = await getScrapbooks()
  return (
    <div className="max-w-3xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Kelola Scrapbook</h1>
      <ScrapbookManager books={books} />
    </div>
  )
}
