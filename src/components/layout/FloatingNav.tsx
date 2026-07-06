'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid3X3, BookOpen, Calendar, Gamepad2, Mail, Heart, X } from 'lucide-react'
import type { ThemeColor } from '@/lib/theme'
import { THEME_TOKENS } from '@/lib/theme'

const links = [
  { href: '/',          label: 'Beranda',   icon: Home },
  { href: '/gallery',   label: 'Galeri',    icon: Grid3X3 },
  { href: '/scrapbook', label: 'Scrapbook', icon: BookOpen },
  { href: '/events',    label: 'Momen',     icon: Calendar },
  { href: '/game',      label: 'Game',      icon: Gamepad2 },
  { href: '/letters',   label: 'Surat',     icon: Mail },
]

interface Props {
  theme: ThemeColor
}

export default function FloatingNav({ theme }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = THEME_TOKENS[theme]

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu items — appear above ball */}
      <div className={`fixed bottom-24 right-4 z-50 flex flex-col gap-2 transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-full shadow-lg text-sm font-medium transition-all ${
                active
                  ? `${t.button} text-white shadow-xl scale-105`
                  : `bg-white ${t.text} border ${t.border} hover:scale-105`
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </div>

      {/* Floating ball */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        className={`fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-2 border-white/40 ${t.navBall} ${open ? 'rotate-0 scale-110' : 'hover:scale-105'}`}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Heart className="w-6 h-6 text-white fill-white/80" />
        )}
      </button>
    </>
  )
}
