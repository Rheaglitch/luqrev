import { validateGateSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getSettings } from '@/lib/data'
import { resolveTheme, THEME_TOKENS } from '@/lib/theme'
import LoveHeader from '@/components/layout/LoveHeader'
import FloatingNav from '@/components/layout/FloatingNav'

export default async function LoveLayout({ children }: { children: React.ReactNode }) {
  const valid = await validateGateSession()
  if (!valid) redirect('/gate')

  const settings = await getSettings()
  const theme = resolveTheme(settings)
  const t = THEME_TOKENS[theme]

  return (
    <div className={`min-h-screen flex flex-col ${t.bg}`}>
      <LoveHeader settings={settings} theme={theme} />
      <main className="flex-1 pb-24">{children}</main>
      <FloatingNav theme={theme} />
    </div>
  )
}
