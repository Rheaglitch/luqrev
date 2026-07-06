import { getSettings } from '@/lib/data'
import { updateSettings } from '@/lib/actions/admin'
import AdminSettingsForm from '@/components/admin/AdminSettingsForm'

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div className="max-w-xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Pengaturan</h1>
      <AdminSettingsForm settings={settings} action={updateSettings} />
    </div>
  )
}
