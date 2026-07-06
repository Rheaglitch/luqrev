import { adminLogin } from '@/lib/actions/admin'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export const metadata = { title: 'Admin Login', robots: { index: false } }

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-rose-50">
      <AdminLoginForm action={adminLogin} />
    </main>
  )
}
