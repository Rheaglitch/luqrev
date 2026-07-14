'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Settings, Image as ImageIcon, BookOpen, Grid3X3,
  Calendar, Mail, LogOut, Heart, Gamepad2, Stamp,
} from 'lucide-react'

const links = [
  { href: '/reva-admin',          label: 'Pengaturan',  icon: Settings  },
  { href: '/reva-admin/slideshow', label: 'Slideshow',   icon: ImageIcon },
  { href: '/reva-admin/gallery',   label: 'Galeri',      icon: Grid3X3   },
  { href: '/reva-admin/scrapbook', label: 'Scrapbook',   icon: BookOpen  },
  { href: '/reva-admin/events',    label: 'Momen',       icon: Calendar  },
  { href: '/reva-admin/game',      label: 'Truth & Dare',icon: Gamepad2  },
  { href: '/reva-admin/letters',   label: 'Surat',       icon: Mail      },
  { href: '/reva-admin/stamps',    label: 'Perangko',    icon: Stamp     },
]

interface Props {
  logoutAction: () => Promise<void>
}

export default function AdminNav({ logoutAction }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-rose-100 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-rose-100 flex items-center gap-2">
        <Heart className="w-5 h-5 text-rose-400 fill-rose-300" />
        <span className="font-playfair text-rose-700 font-semibold">Admin Panel</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-rose-100 text-rose-700 font-medium'
                      : 'text-rose-400 hover:text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-rose-100">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  )
}
