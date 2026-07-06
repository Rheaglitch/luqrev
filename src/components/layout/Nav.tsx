'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Image, BookOpen, Grid3X3, Calendar, Gamepad2, Mail } from 'lucide-react'

const links = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/gallery', label: 'Galeri', icon: Grid3X3 },
  { href: '/scrapbook', label: 'Scrapbook', icon: BookOpen },
  { href: '/events', label: 'Momen', icon: Calendar },
  { href: '/game', label: 'Game', icon: Gamepad2 },
  { href: '/letters', label: 'Surat', icon: Mail },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-rose-100">
      <div className="max-w-4xl mx-auto px-4">
        <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-rose-100 text-rose-700 font-medium'
                      : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
