'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(_prevState: { error: string } | undefined, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'Email atau password salah.' }
  redirect('/reva-admin')
}

export async function adminLogout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/reva-admin/login')
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function updateSettings(_prevState: { success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const updates = [
    'gate_password', 'partner1_name', 'partner2_name',
    'relationship_start', 'next_event_date', 'next_event_label',
    'theme_event_blue_date',  'theme_event_blue_label',  'theme_event_blue_desc',
    'theme_event_red_date',   'theme_event_red_label',   'theme_event_red_desc',
    'theme_event_pink_date',  'theme_event_pink_label',  'theme_event_pink_desc',
    'header_quote', 'header_sub', 'header_photo_url',
    'header_title', 'header_quote_bottom',
    'header_photo_left1', 'header_photo_left2',
    'header_photo_right1', 'header_photo_right2',
    'music_title', 'music_artist', 'music_url', 'music_cover_url',
    'puzzle_image_url',
    'qr_url', 'qr_label', 'qr_sublabel', 'qr_color', 'qr_bg_color', 'qr_shape',
  ]

  for (const key of updates) {
    const value = formData.get(key) as string
    if (value !== null) {
      await supabase.from('love_settings').upsert({ key, value }, { onConflict: 'key' })
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

// ─── Slideshow ────────────────────────────────────────────────────────────────

export async function deleteSlide(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: slide } = await supabase
    .from('love_slideshow')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (slide?.storage_path) {
    await supabase.storage.from('love-media').remove([slide.storage_path])
  }

  await supabase.from('love_slideshow').delete().eq('id', id)
  revalidatePath('/admin/slideshow')
}

export async function reorderSlides(ids: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  for (let i = 0; i < ids.length; i++) {
    await supabase.from('love_slideshow').update({ sort_order: i }).eq('id', ids[i])
  }

  revalidatePath('/admin/slideshow')
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export async function deleteGalleryPhoto(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: photo } = await supabase
    .from('love_gallery')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (photo?.storage_path) {
    await supabase.storage.from('love-media').remove([photo.storage_path])
  }

  await supabase.from('love_gallery').delete().eq('id', id)
  revalidatePath('/gallery')
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function upsertEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string | null
  const payload = {
    title: formData.get('title') as string,
    event_date: formData.get('event_date') as string,
    description: formData.get('description') as string,
  }

  if (id) {
    await supabase.from('love_events').update(payload).eq('id', id)
  } else {
    await supabase.from('love_events').insert(payload)
  }

  revalidatePath('/events')
  revalidatePath('/reva-admin/events')
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('love_events').delete().eq('id', id)
  revalidatePath('/events')
}

// ─── Letters ─────────────────────────────────────────────────────────────────

export async function upsertLetter(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string | null
  const payload = {
    title:       (formData.get('title')       as string)?.trim() || null,
    content:     formData.get('content')      as string,
    letter_date: formData.get('letter_date')  as string,
    to_name:     (formData.get('to_name')     as string)?.trim() || null,
    from_name:   (formData.get('from_name')   as string)?.trim() || null,
    greeting:    (formData.get('greeting')    as string)?.trim() || null,
    stamp1_url:  (formData.get('stamp1_url')  as string)?.trim() || null,
    stamp2_url:  (formData.get('stamp2_url')  as string)?.trim() || null,
  }

  if (id) {
    await supabase.from('love_letters').update(payload).eq('id', id)
  } else {
    await supabase.from('love_letters').insert(payload)
  }

  revalidatePath('/letters')
  revalidatePath('/reva-admin/letters')
}

export async function deleteLetter(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('love_letters').delete().eq('id', id)
  revalidatePath('/letters')
}

// ─── Scrapbook ────────────────────────────────────────────────────────────────

export async function deleteBook(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('love_scrapbook_pages').delete().eq('book_id', id)
  await supabase.from('love_scrapbooks').delete().eq('id', id)
  revalidatePath('/scrapbook')
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export async function upsertQuizQuestion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string | null
  const payload = {
    question: formData.get('question') as string,
    answer: formData.get('answer') as string,
    options: JSON.parse(formData.get('options') as string ?? '[]'),
  }

  if (id) {
    await supabase.from('love_quiz').update(payload).eq('id', id)
  } else {
    await supabase.from('love_quiz').insert(payload)
  }

  revalidatePath('/game')
  revalidatePath('/reva-admin/game')
}

export async function deleteQuizQuestion(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('love_quiz').delete().eq('id', id)
  revalidatePath('/game')
}
