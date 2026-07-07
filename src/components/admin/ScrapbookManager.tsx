'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Upload, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { deleteBook } from '@/lib/actions/admin'
import { uploadFile, UploadError } from '@/lib/upload'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ScrapPage {
  id: string
  page_number: number
  public_url: string
  caption: string | null
}

interface Book {
  id: string
  title: string
  cover_url: string | null
  sort_order: number
  love_scrapbook_pages: ScrapPage[]
}

interface Props {
  books: Book[]
}

export default function ScrapbookManager({ books }: Props) {
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [expandedBook, setExpandedBook] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const createBook = async () => {
    if (!newTitle.trim()) return
    const supabase = createClient()
    await supabase.from('love_scrapbooks').insert({ title: newTitle.trim(), sort_order: books.length })
    setNewTitle('')
    setCreating(false)
    router.refresh()
  }

  const uploadCover = async (bookId: string, file: File) => {
    setUploading(bookId + '-cover')
    try {
      const path = `scrapbook/${bookId}/cover-${Date.now()}.${file.name.split('.').pop()}`
      const publicUrl = await uploadFile(file, path)
      const supabase = createClient()
      await supabase.from('love_scrapbooks').update({ cover_url: publicUrl }).eq('id', bookId)
      router.refresh()
    } catch (err) {
      alert(err instanceof UploadError ? err.message : 'Upload gagal.')
    } finally {
      setUploading(null)
    }
  }

  const uploadPage = async (bookId: string, files: FileList, startPageNum: number) => {
    setUploading(bookId + '-page')
    try {
      const supabase = createClient()
      let pageNum = startPageNum
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()
        const path = `scrapbook/${bookId}/page-${Date.now()}-${pageNum}.${ext}`
        const publicUrl = await uploadFile(file, path)
        await supabase.from('love_scrapbook_pages').insert({
          book_id: bookId,
          page_number: pageNum,
          storage_path: path,
          public_url: publicUrl,
          file_type: file.type.includes('pdf') ? 'pdf' : 'image',
        })
        pageNum++
      }
      router.refresh()
    } catch (err) {
      alert(err instanceof UploadError ? err.message : 'Upload gagal.')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* New book */}
      {creating ? (
        <div className="bg-white rounded-2xl p-4 border border-rose-200 flex gap-2">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Judul buku baru"
            className="flex-1 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
            onKeyDown={(e) => e.key === 'Enter' && createBook()} />
          <button onClick={createBook} className="px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-sm transition-colors">Buat</button>
          <button onClick={() => setCreating(false)} className="px-4 py-2 text-rose-300 hover:text-rose-500 rounded-xl text-sm">Batal</button>
        </div>
      ) : (
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> Buat Buku Baru
        </button>
      )}

      {/* Books list */}
      {books.map((book) => {
        const isExpanded = expandedBook === book.id
        const pages = book.love_scrapbook_pages ?? []
        return (
          <div key={book.id} className="bg-white rounded-2xl border border-rose-100 overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              {/* Cover preview */}
              <div className="relative w-12 h-16 bg-rose-100 rounded-lg overflow-hidden flex-shrink-0">
                {book.cover_url ? (
                  <Image src={book.cover_url} alt="" fill className="object-cover" sizes="48px" />
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-rose-200 transition-colors">
                    <Upload className="w-4 h-4 text-rose-300" />
                    <input type="file" accept="image/*" className="sr-only"
                      onChange={(e) => e.target.files?.[0] && uploadCover(book.id, e.target.files[0])} />
                  </label>
                )}
                {uploading === book.id + '-cover' && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-rose-700 truncate">{book.title}</p>
                <p className="text-rose-300 text-xs">{pages.length} halaman</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setExpandedBook(isExpanded ? null : book.id)}
                  className="w-8 h-8 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button onClick={() => { if (confirm('Hapus buku ini?')) startTransition(() => deleteBook(book.id)) }}
                  disabled={isPending}
                  className="w-8 h-8 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-rose-100 p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {pages.sort((a, b) => a.page_number - b.page_number).map((page) => (
                    <div key={page.id} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-rose-50">
                      {page.public_url.endsWith('.pdf') || page.file_type === 'pdf' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-red-50">
                          <span className="text-2xl">📄</span>
                          <span className="text-[9px] text-rose-400">PDF</span>
                        </div>
                      ) : (
                        <Image src={page.public_url} alt="" fill className="object-cover" sizes="80px" />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-center py-0.5">
                        <span className="text-white text-xs">{page.page_number}</span>
                      </div>
                    </div>
                  ))}
                  <label className="aspect-[3/4] rounded-lg border-2 border-dashed border-rose-200 hover:border-rose-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-rose-50 gap-1">
                    {uploading === book.id + '-page' ? (
                      <Loader2 className="w-5 h-5 text-rose-300 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-rose-300" />
                        <span className="text-[9px] text-rose-300 text-center px-1">Foto / PDF</span>
                      </>
                    )}
                    <input type="file" accept="image/*,application/pdf" multiple className="sr-only"
                      onChange={(e) => e.target.files && uploadPage(book.id, e.target.files, pages.length + 1)} />
                  </label>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
