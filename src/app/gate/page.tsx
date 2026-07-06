import { validateGateSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getSettings } from '@/lib/data'
import { resolveTheme, THEME_TOKENS } from '@/lib/theme'
import GateForm from '@/components/gate/GateForm'

export const metadata = { title: 'Masuk', robots: { index: false } }

export default async function GatePage() {
  const valid = await validateGateSession()
  if (valid) redirect('/')

  const settings = await getSettings()
  const theme = resolveTheme(settings)
  const t = THEME_TOKENS[theme]

  return (
    <main className={`min-h-screen flex items-center justify-center ${t.bg} transition-colors duration-700`}>
      <GateForm theme={theme} />
    </main>
  )
}
