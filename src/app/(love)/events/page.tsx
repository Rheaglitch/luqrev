import { getEvents } from '@/lib/data'
import { Calendar, Heart } from 'lucide-react'

export const metadata = { title: 'Momen Spesial' }

export default async function EventsPage() {
  const events = await getEvents()

  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.event_date) >= now)
  const past = events.filter((e) => new Date(e.event_date) < now)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const getDaysTo = (d: string) => {
    const diff = new Date(d).getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl text-rose-800 mb-2">Momen Spesial</h1>
      <p className="text-rose-400 mb-8 text-sm">Setiap tanggal yang kita ingat bersama 🗓️</p>

      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="text-rose-600 font-medium uppercase tracking-wide text-xs mb-4">Yang Akan Datang</h2>
          <div className="space-y-3">
            {upcoming.map((event) => {
              const daysTo = getDaysTo(event.event_date)
              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-rose-100 p-5 flex gap-4 items-start">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-playfair text-rose-800 text-lg">{event.title}</h3>
                    <p className="text-rose-400 text-sm">{formatDate(event.event_date)}</p>
                    {event.description && <p className="text-rose-600 text-sm mt-1">{event.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-rose-500 font-bold text-xl">{daysTo}</span>
                    <p className="text-rose-300 text-xs">hari lagi</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-rose-400 font-medium uppercase tracking-wide text-xs mb-4">Kenangan</h2>
          <div className="space-y-3">
            {[...past].reverse().map((event) => (
              <div key={event.id} className="bg-white/60 rounded-2xl border border-rose-100 p-5 flex gap-4 items-start opacity-80">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-rose-300 fill-rose-200" />
                </div>
                <div>
                  <h3 className="font-playfair text-rose-700 text-lg">{event.title}</h3>
                  <p className="text-rose-300 text-sm">{formatDate(event.event_date)}</p>
                  {event.description && <p className="text-rose-500 text-sm mt-1">{event.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p className="text-center text-rose-300 py-20 font-playfair text-lg">Belum ada momen ditambahkan~ 💕</p>
      )}
    </div>
  )
}
