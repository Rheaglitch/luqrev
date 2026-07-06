/**
 * Sistem tema warna berdasarkan event terdekat.
 * Setiap event punya warna sendiri yang ditentukan admin.
 *
 * Tema:
 *   blue  → anniversary  (default 15 Mar)
 *   red   → event merah  (default 4 Okt)
 *   pink  → event pink   (default 3 Agu)
 */

export type ThemeColor = 'pink' | 'red' | 'blue'

export interface ThemeEvent {
  key: string          // settings key, e.g. "theme_event_blue_date"
  color: ThemeColor
  defaultMonth: number // 1-based
  defaultDay: number
}

export const THEME_EVENTS: ThemeEvent[] = [
  { key: 'theme_event_blue_date',  color: 'blue',  defaultMonth: 3,  defaultDay: 15 },
  { key: 'theme_event_red_date',   color: 'red',   defaultMonth: 10, defaultDay: 4  },
  { key: 'theme_event_pink_date',  color: 'pink',  defaultMonth: 8,  defaultDay: 3  },
]

/** Resolve the active theme based on today's date vs event dates */
export function resolveTheme(settings: Record<string, string>): ThemeColor {
  const now = new Date()
  const currentYear = now.getFullYear()

  // Build list of (color, nextOccurrence) pairs
  const occurrences = THEME_EVENTS.map(({ key, color, defaultMonth, defaultDay }) => {
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

    // Next occurrence this year or next
    let next = new Date(currentYear, month - 1, day)
    if (next < now) next = new Date(currentYear + 1, month - 1, day)

    return { color, next }
  })

  // Sort by closest upcoming
  occurrences.sort((a, b) => a.next.getTime() - b.next.getTime())

  return occurrences[0].color
}

/** Tailwind color tokens per theme */
export const THEME_TOKENS: Record<ThemeColor, {
  bg: string
  bgMuted: string
  bgCard: string
  border: string
  text: string
  textMuted: string
  textHeading: string
  button: string
  buttonHover: string
  ring: string
  dot: string
  numpad: string
  numpadActive: string
}> = {
  pink: {
    bg:           'bg-pink-50',
    bgMuted:      'bg-pink-100',
    bgCard:       'bg-white/80',
    border:       'border-pink-200',
    text:         'text-pink-700',
    textMuted:    'text-pink-400',
    textHeading:  'text-pink-800',
    button:       'bg-pink-400',
    buttonHover:  'hover:bg-pink-500',
    ring:         'focus:ring-pink-300',
    dot:          'bg-pink-300',
    numpad:       'bg-pink-100 hover:bg-pink-200 text-pink-800',
    numpadActive: 'bg-pink-400 text-white',
  },
  red: {
    bg:           'bg-red-50',
    bgMuted:      'bg-red-100',
    bgCard:       'bg-white/80',
    border:       'border-red-200',
    text:         'text-red-700',
    textMuted:    'text-red-400',
    textHeading:  'text-red-800',
    button:       'bg-red-500',
    buttonHover:  'hover:bg-red-600',
    ring:         'focus:ring-red-300',
    dot:          'bg-red-300',
    numpad:       'bg-red-100 hover:bg-red-200 text-red-800',
    numpadActive: 'bg-red-500 text-white',
  },
  blue: {
    bg:           'bg-blue-50',
    bgMuted:      'bg-blue-100',
    bgCard:       'bg-white/80',
    border:       'border-blue-200',
    text:         'text-blue-700',
    textMuted:    'text-blue-400',
    textHeading:  'text-blue-800',
    button:       'bg-blue-400',
    buttonHover:  'hover:bg-blue-500',
    ring:         'focus:ring-blue-300',
    dot:          'bg-blue-300',
    numpad:       'bg-blue-100 hover:bg-blue-200 text-blue-800',
    numpadActive: 'bg-blue-400 text-white',
  },
}
