/**
 * Centralized upload utility for all file uploads.
 * Max size: 1GB for all files (photos + PDFs).
 */

import { createClient } from '@/lib/supabase/client'

const MAX_SIZE_BYTES = 1024 * 1024 * 1024 // 1 GB

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

export async function uploadFile(
  file: File,
  path: string,
  options?: { upsert?: boolean }
): Promise<string> {
  // Validate size
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError(
      `File terlalu besar (${(file.size / 1024 / 1024).toFixed(0)} MB). Maksimal 1 GB.`
    )
  }

  const supabase = createClient()

  const { error } = await supabase.storage
    .from('love-media')
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      cacheControl: '3600',
    })

  if (error) {
    // Translate common Supabase storage errors to Indonesian
    if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
      throw new UploadError('Akses ditolak. Pastikan kamu sudah login sebagai admin.')
    }
    if (error.message?.includes('Payload too large') || error.message?.includes('413')) {
      throw new UploadError('File terlalu besar. Maksimal 1 GB.')
    }
    if (error.message?.includes('already exists')) {
      throw new UploadError('File dengan nama ini sudah ada.')
    }
    throw new UploadError(`Upload gagal: ${error.message}`)
  }

  const { data } = supabase.storage.from('love-media').getPublicUrl(path)
  return data.publicUrl
}

export function sanitizeFilename(name: string): string {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
}

export const MAX_SIZE_MB = MAX_SIZE_BYTES / 1024 / 1024
