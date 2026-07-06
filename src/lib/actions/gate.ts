'use server'

import { createClient } from '@/lib/supabase/server'
import { createGateSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function checkPassword(_prevState: { error: string } | undefined, formData: FormData) {
  const input = formData.get('password') as string

  if (!input?.trim()) {
    return { error: 'Masukkan sandinya dulu ya sayang 🥺' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('love_settings')
    .select('value')
    .eq('key', 'gate_password')
    .single()

  if (error || !data) {
    return { error: 'Terjadi kesalahan, coba lagi.' }
  }

  if (input.trim() !== data.value) {
    return { error: 'Salah sandi! Masa iya lupa sih 🙈' }
  }

  await createGateSession()
  redirect('/')
}
