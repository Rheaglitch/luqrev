import type { Metadata } from 'next'
import { Playfair_Display, Lato, Dancing_Script } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
})

const dancing = Dancing_Script({
  variable: '--font-dancing',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Luqrev',
  description: 'A private space just for us',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${playfair.variable} ${lato.variable} ${dancing.variable}`}>
      <body className="min-h-screen bg-rose-50 text-rose-900 font-lato antialiased">
        {children}
      </body>
    </html>
  )
}
