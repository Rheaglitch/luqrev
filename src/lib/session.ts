/**
 * Password gate session — stored in a cookie, validated server-side.
 * The actual password lives only in Supabase (love_settings table).
 */
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SESSION_COOKIE = 'love_session'
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'fallback-dev-secret-change-in-prod'
)

export async function createGateSession() {
  const token = await new SignJWT({ gate: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

export async function validateGateSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return false
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}

export async function destroyGateSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
