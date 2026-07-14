-- ============================================================
-- Luqrev — Supabase schema
-- Semua tabel pakai prefix love_ agar tidak bentrok
-- Jalankan ini di Supabase SQL Editor
-- ============================================================

-- 1. Settings (password gate, nama, tanggal)
create table if not exists love_settings (
  key   text primary key,
  value text not null
);

-- Seed default values
insert into love_settings (key, value) values
  ('gate_password',           '150326'),
  ('partner1_name',           'Kamu'),
  ('partner2_name',           'Aku'),
  ('relationship_start',      '2024-01-01'),
  ('next_event_date',         '2025-03-15'),
  ('next_event_label',        'Anniversary 🎉'),
  -- Tema warna: format MM-DD
  ('theme_event_blue_date',   '3-15'),
  ('theme_event_blue_label',  'Anniversary'),
  ('theme_event_blue_desc',   ''),
  ('theme_event_red_date',    '10-4'),
  ('theme_event_red_label',   'Hari Spesial'),
  ('theme_event_red_desc',    ''),
  ('theme_event_pink_date',   '8-3'),
  ('theme_event_pink_label',  'Hari Spesial'),
  ('theme_event_pink_desc',   ''),
  -- Header template
  ('header_title',          'Best Couple'),
  ('header_quote_bottom',   'Two people who met because of fate, I hope we will always be together'),
  ('header_photo_left1',    ''),
  ('header_photo_left2',    ''),
  ('header_photo_right1',   ''),
  ('header_photo_right2',   ''),
  ('header_quote',          'My love'),
  ('header_sub',            'Soulmate'),
  ('header_photo_url',      ''),
  ('music_title',     'Our Song'),
  ('music_artist',    'Unknown Artist'),
  ('music_url',       ''),
  ('music_cover_url', '')
on conflict (key) do nothing;

-- 2. Slideshow
create table if not exists love_slideshow (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url   text not null,
  caption      text,
  sort_order   int  not null default 0,
  created_at   timestamptz default now()
);

-- 3. Gallery
create table if not exists love_gallery (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url   text not null,
  caption      text,
  category     text,
  created_at   timestamptz default now()
);

-- 4. Events / Kalender
create table if not exists love_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  event_date  date not null,
  description text,
  created_at  timestamptz default now()
);

-- 5. Scrapbooks
create table if not exists love_scrapbooks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  cover_url  text,
  sort_order int  not null default 0,
  created_at timestamptz default now()
);

-- 6. Scrapbook pages
create table if not exists love_scrapbook_pages (
  id           uuid primary key default gen_random_uuid(),
  book_id      uuid not null references love_scrapbooks(id) on delete cascade,
  page_number  int  not null default 1,
  storage_path text not null,
  public_url   text not null,
  caption      text,
  created_at   timestamptz default now()
);

-- 7. Letters / Surat
create table if not exists love_letters (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null,
  letter_date date not null default current_date,
  created_at  timestamptz default now()
);

-- 8. Quiz / Mini Game
create table if not exists love_quiz (
  id         uuid primary key default gen_random_uuid(),
  question   text    not null,
  answer     text    not null,
  options    jsonb   not null default '[]',
  created_at timestamptz default now()
);

-- 9. Truth or Dare questions
create table if not exists love_truth_dare (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('truth', 'dare')),
  content    text not null,
  created_at timestamptz default now()
);

-- Seed some default questions
insert into love_truth_dare (type, content) values
  ('truth', 'Apa hal paling konyol yang pernah kamu lakukan untukku?'),
  ('truth', 'Apa momen favoritmu bersama aku?'),
  ('truth', 'Apa yang pertama kali kamu pikirkan waktu pertama kali ketemu aku?'),
  ('truth', 'Apa yang paling kamu suka dari aku?'),
  ('truth', 'Kalau bisa mengulang satu momen kita, momen apa yang kamu pilih?'),
  ('truth', 'Apa hal yang belum pernah kamu ceritakan ke aku?'),
  ('truth', 'Sebutkan 3 kata yang menggambarkan perasaanmu tentang aku!'),
  ('truth', 'Apa mimpimu yang melibatkan kita berdua?'),
  ('dare', 'Peluk aku selama 10 detik!'),
  ('dare', 'Nyanyikan lagu favorit kita untuk aku!'),
  ('dare', 'Tulis kata "I love you" di tanganku pakai jarimu!'),
  ('dare', 'Kasih aku pujian yang tulus selama 30 detik!'),
  ('dare', 'Ceritakan ulang momen pertama kita ketemu dengan dramatis!'),
  ('dare', 'Buat aku tertawa dalam 30 detik!'),
  ('dare', 'Bisikkan sesuatu yang romantis ke telingaku!'),
  ('dare', 'Gambarkan wajahku di kertas dalam 1 menit!');

-- RLS
alter table love_truth_dare enable row level security;
create policy "public read truth_dare" on love_truth_dare for select using (true);
create policy "admin write truth_dare" on love_truth_dare for all using (auth.role() = 'authenticated');
-- Aktifkan RLS agar data hanya bisa diakses via API yang sah
-- ============================================================

alter table love_settings      enable row level security;
alter table love_slideshow     enable row level security;
alter table love_gallery       enable row level security;
alter table love_events        enable row level security;
alter table love_scrapbooks    enable row level security;
alter table love_scrapbook_pages enable row level security;
alter table love_letters       enable row level security;
alter table love_quiz          enable row level security;

-- Public read (semua data bisa dibaca setelah gate — tidak ada user auth)
create policy "public read settings"       on love_settings       for select using (true);
create policy "public read slideshow"      on love_slideshow      for select using (true);
create policy "public read gallery"        on love_gallery        for select using (true);
create policy "public read events"         on love_events         for select using (true);
create policy "public read scrapbooks"     on love_scrapbooks     for select using (true);
create policy "public read scrapbook_pages" on love_scrapbook_pages for select using (true);
create policy "public read letters"        on love_letters        for select using (true);
create policy "public read quiz"           on love_quiz           for select using (true);

-- Authenticated (admin) write
create policy "admin write settings"       on love_settings       for all  using (auth.role() = 'authenticated');
create policy "admin write slideshow"      on love_slideshow      for all  using (auth.role() = 'authenticated');
create policy "admin write gallery"        on love_gallery        for all  using (auth.role() = 'authenticated');
create policy "admin write events"         on love_events         for all  using (auth.role() = 'authenticated');
create policy "admin write scrapbooks"     on love_scrapbooks     for all  using (auth.role() = 'authenticated');
create policy "admin write scrapbook_pages" on love_scrapbook_pages for all using (auth.role() = 'authenticated');
create policy "admin write letters"        on love_letters        for all  using (auth.role() = 'authenticated');
create policy "admin write quiz"           on love_quiz           for all  using (auth.role() = 'authenticated');

-- ============================================================
-- Storage bucket: love-media
-- Buat bucket ini manual di Supabase Dashboard → Storage
-- Atau jalankan perintah berikut:
-- ============================================================

-- insert into storage.buckets (id, name, public) values ('love-media', 'love-media', true);

-- ============================================================
-- Love Letter enhancements
-- ============================================================

-- 10. Postage stamps (admin uploads)
CREATE TABLE IF NOT EXISTS love_stamps (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  image_url  text not null,
  created_at timestamptz default now()
);

ALTER TABLE love_stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read stamps"  ON love_stamps FOR SELECT USING (true);
CREATE POLICY "admin write stamps"  ON love_stamps FOR ALL    USING (auth.role() = 'authenticated');

-- Add new columns to love_letters for love letter fields
ALTER TABLE love_letters ADD COLUMN IF NOT EXISTS to_name      text;
ALTER TABLE love_letters ADD COLUMN IF NOT EXISTS from_name    text;
ALTER TABLE love_letters ADD COLUMN IF NOT EXISTS greeting     text;
ALTER TABLE love_letters ADD COLUMN IF NOT EXISTS stamp1_url   text;
ALTER TABLE love_letters ADD COLUMN IF NOT EXISTS stamp2_url   text;
ALTER TABLE love_letters ADD COLUMN IF NOT EXISTS created_by   text default 'user';
