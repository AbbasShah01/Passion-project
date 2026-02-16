-- Supabase schema for Trend Generator
-- Note: auth.users is managed by Supabase Auth.

create extension if not exists "pgcrypto";

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook')),
  category text not null check (category in ('cricket', 'politics', 'tv_shows', 'campus_humor', 'trending_audio')),
  meme_text text not null,
  caption text not null,
  hashtags text[] not null default '{}',
  format text not null check (format in ('static_image', 'video', 'text_only')),
  created_at timestamptz not null default now()
);

create index if not exists ideas_user_id_idx on public.ideas(user_id);
create index if not exists ideas_created_at_idx on public.ideas(created_at desc);

alter table public.ideas enable row level security;

-- Users can read only their own ideas.
create policy "Users can view their own ideas"
  on public.ideas
  for select
  using (auth.uid() = user_id);

-- Users can insert only rows tied to their own user_id.
create policy "Users can insert their own ideas"
  on public.ideas
  for insert
  with check (auth.uid() = user_id);

-- Users can update only their own ideas.
create policy "Users can update their own ideas"
  on public.ideas
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete only their own ideas.
create policy "Users can delete their own ideas"
  on public.ideas
  for delete
  using (auth.uid() = user_id);
