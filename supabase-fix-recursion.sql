-- ============================================
-- FIX: Eliminar recursión en profiles + ver usuarios
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

-- Eliminar policies recursivas
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can insert profiles" on public.profiles;
drop policy if exists "Insert profiles" on public.profiles;

-- Profiles: cada usuario ve solo el suyo (sin recursión)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Profiles: cada usuario actualiza el suyo
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Profiles: insert permitido (para trigger de registro)
create policy "Insert profiles"
  on public.profiles for insert
  with check (true);

-- ============================================
-- VER USUARIOS CREADOS EN AUTH
-- ============================================
select id, email, created_at, raw_user_meta_data->>'nombre' as nombre,
       raw_user_meta_data->>'role' as role
from auth.users;

-- ============================================
-- VER PROFILES EXISTENTES
-- ============================================
select * from public.profiles;
