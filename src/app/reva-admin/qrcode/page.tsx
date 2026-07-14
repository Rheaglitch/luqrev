import QRCodePage from '@/components/admin/QRCodeGenerator'

export const metadata = { title: 'QR Code — Admin' }

export default function AdminQRPage() {
  // Get the site URL from env or use a placeholder
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://luqrevha.vercel.app/gate'
  return <QRCodePage siteUrl={siteUrl} />
}
