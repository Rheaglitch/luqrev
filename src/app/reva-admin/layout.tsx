import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import { adminLogout } from '@/lib/actions/admin'

export const metadata = { title: 'Admin — Luqrev', robots: { index: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/reva-admin/login')

  return (
    <div className="min-h-screen bg-rose-50 flex">
      <AdminNav logoutAction={adminLogout} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
