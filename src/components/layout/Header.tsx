'use client'

import { useEffect, useState } from 'react'
import { Heart, Calendar } from 'lucide-react'

interface Props {
  settings: Record<string, string>
}

function getDayCount(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getCountdown(targetDate: string): string {
  const target = new Date(targetDate)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return 'Hari ini! 🎉'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days} hari lagi`
  if (hours > 0) return `${hours} jam ${minutes} menit lagi`
  return `${minutes} menit lagi`
}

export default function Header({ settings }: Props) {
  const [days, setDays] = useState(0)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (settings.relationship_start) {
      setDays(getDayCount(settings.relationship_start))
    }
    if (settings.next_event_date) {
      setCountdown(getCountdown(settings.next_event_date))
      const interval = setInterval(() => {
        setCountdown(getCountdown(settings.next_event_date))
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [settings])

  const p1 = settings.partner1_name ?? 'Kamu'
  const p2 = settings.partner2_name ?? 'Aku'

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Names */}
        <div className="flex items-center gap-2 font-playfair text-rose-700 text-lg">
          <span>{p1}</span>
          <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
          <span>{p2}</span>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-4 text-sm text-rose-500">
          {days > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 fill-rose-300 text-rose-300" />
              <span className="font-semibold text-rose-700">{days}</span>
              <span>hari bersama</span>
            </div>
          )}
          {countdown && settings.next_event_label && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-rose-400" />
              <span>{settings.next_event_label}:</span>
              <span className="font-semibold text-rose-700">{countdown}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
