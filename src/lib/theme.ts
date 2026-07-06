/**
 * Sistem tema warna.
 * Default: maroon (selalu aktif kecuali saat hari event ±3 hari)
 * Event: pink / red / blue aktif H-3 sampai H+3 dari tanggal event
 */

export type ThemeColor = 'maroon' | 'pink' | 'red' | 'blue'

export interface ThemeEvent {
  key: string
  color: ThemeColor
  defaultMonth: number
  defaultDay: number
}

export const THEME_EVENTS: ThemeEvent[] = [
  { key: 'theme_event_blue_date', color: 'blue', defaultMonth: 3,  defaultDay: 15 },
  { key: 'theme_event_red_date',  color: 'red',  defaultMonth: 10, defaultDay: 4  },
  { key: 'theme_event_pink_date', color: 'pink', defaultMonth: 8,  defaultDay: 3  },
]

const EVENT_WINDOW_DAYS = 3

export function resolveTheme(settings: Record<string, string>): ThemeColor {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const currentYear = now.getFullYear()

  for (const { key, color, defaultMonth, defaultDay } of THEME_EVENTS) {
    const raw = settings[key]
    let month = defaultMonth
    let day = defaultDay

    if (raw) {
      const parts = raw.split('-')
      if (parts.length === 2) {
        month = parseInt(parts[0], 10)
        day   = parseInt(parts[1], 10)
      }
    }

    const eventDate = new Date(currentYear, month - 1, day)
    const diffDays = Math.round((eventDate.getTime() - now.getTime()) / 86400000)

    // Active if within ±EVENT_WINDOW_DAYS of event
    if (Math.abs(diffDays) <= EVENT_WINDOW_DAYS) {
      return color
    }
  }

  return 'maroon'
}

export const THEME_TOKENS: Record<ThemeColor, {
  // backgrounds
  bg: string
  bgMuted: string
  bgCard: string
  bgDark: string        // for header dark bg
  // borders
  border: string
  borderAccent: string
  // text
  text: string
  textMuted: string
  textHeading: string
  textOnDark: string
  // interactive
  button: string
  buttonHover: string
  ring: string
  // gate numpad
  dot: string
  numpad: string
  numpadActive: string
  // navbar ball
  navBall: string
  navBallBorder: string
  // accent for decorations
  accent: string
  accentLight: string
}> = {
  maroon: {
    bg:            'bg-[#fdf6f6]',
    bgMuted:       'bg-[#f5e8e8]',
    bgCard:        'bg-white/90',
    bgDark:        'bg-[#3d0c0c]',
    border:        'border-[#c9a0a0]',
    borderAccent:  'border-[#8b2e2e]',
    text:          'text-[#6b2020]',
    textMuted:     'text-[#a06060]',
    textHeading:   'text-[#3d0c0c]',
    textOnDark:    'text-[#f5e8e8]',
    button:        'bg-[#8b2e2e]',
    buttonHover:   'hover:bg-[#6b2020]',
    ring:          'focus:ring-[#c9a0a0]',
    dot:           'bg-[#8b2e2e]',
    numpad:        'bg-[#f5e8e8] hover:bg-[#e8d0d0] text-[#3d0c0c]',
    numpadActive:  'bg-[#8b2e2e] text-white',
    navBall:       'bg-[#8b2e2e]',
    navBallBorder: 'border-[#c9a0a0]',
    accent:        '#8b2e2e',
    accentLight:   '#f5e8e8',
  },
  pink: {
    bg:            'bg-pink-50',
    bgMuted:       'bg-pink-100',
    bgCard:        'bg-white/90',
    bgDark:        'bg-pink-800',
    border:        'border-pink-200',
    borderAccent:  'border-pink-400',
    text:          'text-pink-700',
    textMuted:     'text-pink-400',
    textHeading:   'text-pink-900',
    textOnDark:    'text-pink-50',
    button:        'bg-pink-500',
    buttonHover:   'hover:bg-pink-600',
    ring:          'focus:ring-pink-300',
    dot:           'bg-pink-400',
    numpad:        'bg-pink-100 hover:bg-pink-200 text-pink-800',
    numpadActive:  'bg-pink-500 text-white',
    navBall:       'bg-pink-500',
    navBallBorder: 'border-pink-200',
    accent:        '#ec4899',
    accentLight:   '#fce7f3',
  },
  red: {
    bg:            'bg-red-50',
    bgMuted:       'bg-red-100',
    bgCard:        'bg-white/90',
    bgDark:        'bg-red-900',
    border:        'border-red-200',
    borderAccent:  'border-red-500',
    text:          'text-red-700',
    textMuted:     'text-red-400',
    textHeading:   'text-red-900',
    textOnDark:    'text-red-50',
    button:        'bg-red-600',
    buttonHover:   'hover:bg-red-700',
    ring:          'focus:ring-red-300',
    dot:           'bg-red-500',
    numpad:        'bg-red-100 hover:bg-red-200 text-red-800',
    numpadActive:  'bg-red-600 text-white',
    navBall:       'bg-red-600',
    navBallBorder: 'border-red-200',
    accent:        '#dc2626',
    accentLight:   '#fee2e2',
  },
  blue: {
    bg:            'bg-blue-50',
    bgMuted:       'bg-blue-100',
    bgCard:        'bg-white/90',
    bgDark:        'bg-blue-900',
    border:        'border-blue-200',
    borderAccent:  'border-blue-500',
    text:          'text-blue-700',
    textMuted:     'text-blue-400',
    textHeading:   'text-blue-900',
    textOnDark:    'text-blue-50',
    button:        'bg-blue-500',
    buttonHover:   'hover:bg-blue-600',
    ring:          'focus:ring-blue-300',
    dot:           'bg-blue-400',
    numpad:        'bg-blue-100 hover:bg-blue-200 text-blue-800',
    numpadActive:  'bg-blue-500 text-white',
    navBall:       'bg-blue-500',
    navBallBorder: 'border-blue-200',
    accent:        '#3b82f6',
    accentLight:   '#dbeafe',
  },
}
