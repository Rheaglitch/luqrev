import { createClient } from '@/lib/supabase/server'
import StampsManager from '@/components/admin/StampsManager'

export default async function AdminStampsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('love_stamps').select('*').order('created_at')
  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-2">Kelola Perangko</h1>
      <p className="text-rose-400 text-sm mb-6">Upload gambar perangko untuk dipakai di love letter. Background otomatis dihapus.</p>
      <StampsManager stamps={data ?? []} />
    </div>
  )
}
