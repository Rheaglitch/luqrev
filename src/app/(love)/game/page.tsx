import GameLanding from '@/components/game/GameLanding'

export const metadata = { title: 'Game 🎮' }

export default function GamePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-playfair text-2xl text-[#3d0c0c] mb-2">Mini Game</h1>
      <p className="text-[#a06060] mb-8 text-sm">Pilih game yang mau dimainkan 🎮</p>
      <GameLanding />
    </div>
  )
}
