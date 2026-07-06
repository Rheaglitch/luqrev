import { validateGateSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import GateForm from '@/components/gate/GateForm'

export const metadata = { title: 'Masuk — Luqrev', robots: { index: false } }

export default async function GatePage() {
  const valid = await validateGateSession()
  if (valid) redirect('/')

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-blush-100">
      <GateForm />
    </main>
  )
}
