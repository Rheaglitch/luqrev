import { createClient } from '@/lib/supabase/server'
import LettersManager from '@/components/admin/LettersManager'

export default async function AdminLettersPage() {
  const supabase = await createClient()
  const [{ data: letters }, { data: stamps }] = await Promise.all([
    supabase.from('love_letters').select('*').order('letter_date', { ascending: false }),
    supabase.from('love_stamps').select('*').order('created_at'),
  ])

  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Kelola Surat</h1>
      <LettersManager letters={letters ?? []} stamps={stamps ?? []} />
    </div>
  )
}
