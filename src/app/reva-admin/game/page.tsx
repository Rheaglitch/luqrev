import { createClient } from '@/lib/supabase/server'
import TruthDareManager from '@/components/admin/TruthDareManager'

export default async function AdminGamePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('love_truth_dare')
    .select('*')
    .order('type', { ascending: true })

  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-2">Kelola Truth & Dare</h1>
      <p className="text-rose-400 text-sm mb-6">Tambah atau hapus pertanyaan untuk game ular tangga.</p>
      <TruthDareManager items={data ?? []} />
    </div>
  )
}
