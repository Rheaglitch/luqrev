import { getEvents } from '@/lib/data'
import EventsManager from '@/components/admin/EventsManager'

export default async function AdminEventsPage() {
  const events = await getEvents()
  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair text-2xl text-rose-800 mb-6">Kelola Momen</h1>
      <EventsManager events={events} />
    </div>
  )
}
