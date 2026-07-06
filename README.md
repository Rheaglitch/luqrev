# Luqrev 💕

Web private untuk pacar — diproteksi password, dikelola lewat halaman admin tersembunyi.

## Stack

- **Next.js 16** (App Router) — framework
- **Supabase** — database + storage + auth admin
- **Tailwind CSS v4** — styling
- **Vercel** — deploy

---

## Setup Awal

### 1. Clone & Install

```bash
npm install
```

### 2. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → New project
2. Catat: **Project URL**, **Anon Key**, **Service Role Key**

### 3. Isi Environment Variables

Buka `.env.local` dan isi:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SESSION_SECRET=buat-string-acak-panjang-minimal-32-karakter
```

> **SESSION_SECRET**: buat string acak panjang, contoh pakai: `openssl rand -base64 32`

### 4. Jalankan SQL Schema

1. Buka Supabase Dashboard → **SQL Editor**
2. Copy-paste isi file `supabase-schema.sql`
3. Klik **Run**

### 5. Buat Storage Bucket

1. Supabase Dashboard → **Storage**
2. Klik **New bucket**
3. Name: `love-media`, centang **Public bucket**
4. Klik **Save**

### 6. Buat Admin User

1. Supabase Dashboard → **Authentication** → **Users**
2. Klik **Add user** → **Create new user**
3. Masukkan email & password → ini yang dipakai login di `/reva-admin`

### 7. Jalankan Dev Server

```bash
npm run dev
```

---

## Halaman-halaman

| URL | Fungsi |
|-----|--------|
| `/gate` | Halaman password untuk pengunjung |
| `/` | Slideshow foto utama |
| `/gallery` | Galeri kenangan + filter kategori |
| `/scrapbook` | Flipbook/scrapbook interaktif |
| `/events` | Kalender momen spesial |
| `/game` | Quiz "seberapa kenal aku?" |
| `/letters` | Surat-surat cinta |
| `/reva-admin` | Panel admin (tersembunyi) |

---

## Deploy ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables dari `.env.local` di Vercel Dashboard → **Settings → Environment Variables**
4. Deploy!

> Web ini pakai `robots: noindex` jadi tidak terindeks Google.

---

## Ubah Sandi Gate

Login ke `/reva-admin` → **Pengaturan** → ubah **Sandi Pintu Masuk** → Save.
