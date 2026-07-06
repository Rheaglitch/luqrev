import { createClient } from '@/lib/supabase/server'
import { createGateSession } from '@/lib/session'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password?.trim()) {
    return Response.json(
      { ok: false, message: 'Masukkan sandinya dulu ya sayang 🥺' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('love_settings')
    .select('value')
    .eq('key', 'gate_password')
    .single()

  if (error || !data) {
    return Response.json(
      { ok: false, message: 'Terjadi kesalahan, coba lagi.' },
      { status: 500 }
    )
  }

  if (password.trim() !== data.value) {
    return Response.json(
      { ok: false, message: 'hayoloh, lupa unniversarry kita yaa!!' },
      { status: 401 }
    )
  }

  await createGateSession()
  return Response.json({ ok: true })
}
