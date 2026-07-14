import QRCodeGenerator from '@/components/admin/QRCodeGenerator'
import { getSettings } from '@/lib/data'

export const metadata = { title: 'QR Code — Admin' }

export default async function AdminQRPage() {
  const settings = await getSettings()
  const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://luqrevha.vercel.app/gate'
  return <QRCodeGenerator settings={settings} fallbackUrl={fallbackUrl} />
}
