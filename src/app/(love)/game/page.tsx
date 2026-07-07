import GameLanding from '@/components/game/GameLanding'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Game 🎮' }

export default async function GamePage() {
  const supabase = await createClient()
  const { data: truthDare } = await supabase
    .from('love_truth_dare')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-playfair text-2xl text-[#3d0c0c] mb-2">Mini Game</h1>
      <p className="text-[#a06060] mb-8 text-sm">Pilih game yang mau dimainkan 🎮</p>
      <GameLanding truthDare={truthDare ?? []} />
    </div>
  )
}
