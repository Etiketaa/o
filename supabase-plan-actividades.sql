-- ============================================
-- MIGRACIÓN: Plan-Actividades y Turnos Fijos
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

-- 1. Tabla de relación plan-actividades
create table if not exists public.plan_actividades (
  id uuid default gen_random_uuid() primary key,
  plan text not null check (plan in ('Full', '3x semana', '2x semana')),
  actividad text not null,
  created_at timestamptz default now(),
  unique(plan, actividad)
);

-- Habilitar RLS
alter table public.plan_actividades enable row level security;

-- Todos los autenticados pueden ver las relaciones plan-actividad
create policy "Authenticated users can view plan_actividades"
  on public.plan_actividades for select
  using (auth.role() = 'authenticated');

-- Solo admin puede gestionar
create policy "Admins can manage plan_actividades"
  on public.plan_actividades for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 2. Agregar campo es_fijo a reservas
alter table public.reservas add column if not exists es_fijo boolean default false;

-- 3. Datos iniciales: qué plan incluye qué actividades
-- Plan 2x semana: Movilidad y Pesas Libres
insert into public.plan_actividades (plan, actividad) values
  ('2x semana', 'Movilidad'),
  ('2x semana', 'Pesas Libres')
on conflict (plan, actividad) do nothing;

-- Plan 3x semana: Funcional, Pesas Libres y Movilidad
insert into public.plan_actividades (plan, actividad) values
  ('3x semana', 'Funcional'),
  ('3x semana', 'Pesas Libres'),
  ('3x semana', 'Movilidad')
on conflict (plan, actividad) do nothing;

-- Plan Full: todas las actividades
insert into public.plan_actividades (plan, actividad) values
  ('Full', 'Funcional'),
  ('Full', 'Pesas Libres'),
  ('Full', 'CrossTraining'),
  ('Full', 'Movilidad')
on conflict (plan, actividad) do nothing;

-- ============================================
-- Vista útil: turnos con actividades permitidas por plan
-- ============================================
create or replace view public.turnos_por_plan as
select
  t.*,
  pa.plan
from public.turnos t
inner join public.plan_actividades pa on pa.actividad = t.actividad
where t.activo = true;
