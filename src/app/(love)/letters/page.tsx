import { createClient } from '@/lib/supabase/server'
import LetterPageClient from '@/components/letters/LetterPageClient'

export const metadata = { title: 'Love Letters 💌' }

export default async function LettersPage() {
  const supabase = await createClient()

  const [{ data: letters }, { data: stamps }] = await Promise.all([
    supabase.from('love_letters').select('*').order('letter_date', { ascending: false }),
    supabase.from('love_stamps').select('*').order('created_at', { ascending: true }),
  ])

  return (
    <LetterPageClient
      letters={letters ?? []}
      stamps={stamps ?? []}
    />
  )
}
