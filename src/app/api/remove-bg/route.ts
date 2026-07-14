import { NextRequest } from 'next/server'

const REMOVE_BG_API_KEY = 'i9j6QHmci7HeGeWkovFL2qgs1'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('image') as File

  if (!file) return Response.json({ error: 'No image provided' }, { status: 400 })

  const form = new FormData()
  form.append('image_file', file)
  form.append('size', 'auto')

  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
    body: form,
  })

  if (!res.ok) {
    const err = await res.text()
    return Response.json({ error: err }, { status: res.status })
  }

  const buffer = await res.arrayBuffer()
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline',
    },
  })
}
