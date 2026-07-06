import { validateGateSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getSettings } from '@/lib/data'
import Header from '@/components/layout/Header'
import Nav from '@/components/layout/Nav'

export default async function LoveLayout({ children }: { children: React.ReactNode }) {
  const valid = await validateGateSession()
  if (!valid) redirect('/gate')

  const settings = await getSettings()

  return (
    <div className="min-h-screen flex flex-col">
      <Header settings={settings} />
      <Nav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
