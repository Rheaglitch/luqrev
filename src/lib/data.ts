import { createClient } from '@/lib/supabase/server'

export async function getSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from('love_settings').select('key, value')
  if (!data) return {}
  return Object.fromEntries(data.map(({ key, value }) => [key, value])) as Record<string, string>
}

export async function getSlides() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('love_slideshow')
    .select('*')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getGalleryPhotos(category?: string) {
  const supabase = await createClient()
  let query = supabase.from('love_gallery').select('*').order('created_at', { ascending: false })
  if (category) query = query.eq('category', category)
  const { data } = await query
  return data ?? []
}

export async function getGalleryCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('love_gallery').select('category')
  if (!data) return []
  const cats = [...new Set(data.map((r) => r.category).filter(Boolean))]
  return cats
}

export async function getEvents() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('love_events')
    .select('*')
    .order('event_date', { ascending: true })
  return data ?? []
}

export async function getLetters() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('love_letters')
    .select('*')
    .order('letter_date', { ascending: false })
  return data ?? []
}

export async function getScrapbooks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('love_scrapbooks')
    .select('*, love_scrapbook_pages(*)')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getQuizQuestions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('love_quiz')
    .select('*')
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getStorageUrl(path: string) {
  const supabase = await createClient()
  const { data } = supabase.storage.from('love-media').getPublicUrl(path)
  return data.publicUrl
}
