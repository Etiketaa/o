-- ============================================
-- TABLA: Push Subscriptions (notificaciones)
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Users can manage own push subscription"
  on public.push_subscriptions for all
  using (auth.uid() = user_id);
