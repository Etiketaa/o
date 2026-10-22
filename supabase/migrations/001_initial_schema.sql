-- ============================================
-- MIGRACIÓN 001: Esquema inicial del turnero de gym (OZ Entrenamiento)
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

-- ------------------------------------------------------------
-- 1. gym_config — configuración del gimnasio (una sola fila, id = 'unica')
-- ------------------------------------------------------------
create table if not exists public.gym_config (
  id text primary key check (id = 'unica'),
  nombre text not null,
  direccion text,
  dias_activos text[] not null default array['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
  franjas jsonb not null default '[]'::jsonb,
  duracion_min int not null default 60 check (duracion_min > 0),
  paso_min int not null default 30 check (paso_min > 0),
  minutos_aviso int not null default 15 check (minutos_aviso >= 0),
  actualizado_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. perfiles — clientes y profesor (extiende auth.users)
-- ------------------------------------------------------------
create table if not exists public.perfiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nombre text not null,
  role text not null default 'alumno' check (role in ('admin', 'alumno')),
  plan text not null default '2x semana' check (plan in ('Full', '3x semana', '2x semana')),
  estado text not null default 'activo' check (estado in ('activo', 'vencido')),
  telefono text default '',
  avatar_url text,
  frecuencia_semana int,
  veces_mes_objetivo int,
  franja text,
  slots_preferidos jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 3. turnos — plantilla semanal definida por el profesor
-- ------------------------------------------------------------
create table if not exists public.turnos (
  id uuid default gen_random_uuid() primary key,
  dia text not null check (dia in ('Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom')),
  hora text not null,
  actividad text not null,
  coach text not null,
  cupo int not null default 10,
  activo boolean default true,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 4. sesiones — instancia con fecha real (lo que se reserva)
-- ------------------------------------------------------------
create table if not exists public.sesiones (
  id uuid default gen_random_uuid() primary key,
  fecha text not null check (fecha ~ '^\d{4}-\d{2}-\d{2}$'),
  hora text not null,
  actividad text not null,
  coach text not null,
  cupo int not null default 10,
  turno_id uuid references public.turnos(id) on delete set null,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 5. inscripciones — unen alumno y sesión
-- ------------------------------------------------------------
create table if not exists public.inscripciones (
  id uuid default gen_random_uuid() primary key,
  sesion_id uuid references public.sesiones(id) on delete cascade not null,
  alumno_id uuid references public.perfiles(id) on delete cascade not null,
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada', 'asistio', 'faltó')),
  feedback text check (feedback in ('up', 'down')),
  comentario text,
  feedback_at timestamptz,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 6. pagos
-- ------------------------------------------------------------
create table if not exists public.pagos (
  id uuid default gen_random_uuid() primary key,
  alumno_id uuid references public.perfiles(id) on delete cascade not null,
  monto numeric not null,
  fecha timestamptz not null default now(),
  metodo text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado', 'vencido')),
  descripcion text default '',
  mes_pago int not null check (mes_pago between 1 and 12),
  anio_pago int not null,
  comprobante_url text,
  comprobante_tipo text check (comprobante_tipo in ('imagen', 'pdf')),
  comprobante_nombre text,
  verificado boolean default false,
  verificado_por uuid references public.perfiles(id),
  verificado_at timestamptz,
  notas_admin text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 7. pago_config — una sola fila, id = 'unica'
-- ------------------------------------------------------------
create table if not exists public.pago_config (
  id uuid default gen_random_uuid() primary key check (true),
  dia_limite int not null default 10 check (dia_limite between 1 and 28),
  monto_base numeric not null default 0,
  cvu text default '',
  alias text default '',
  titular text default '',
  banco text default '',
  activo boolean default true,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 8. plan_actividades — qué actividades incluye cada plan
-- ------------------------------------------------------------
create table if not exists public.plan_actividades (
  id uuid default gen_random_uuid() primary key,
  plan text not null check (plan in ('Full', '3x semana', '2x semana')),
  actividad text not null,
  created_at timestamptz default now(),
  unique(plan, actividad)
);

-- ------------------------------------------------------------
-- 9. push_subscriptions — notificaciones Web Push
-- ------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.perfiles(id) on delete cascade not null unique,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- ============================================
-- TRIGGER: Auto-crear perfil al registrarse en Supabase Auth
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, email, nombre, role, plan, estado, telefono)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'alumno'),
    coalesce(new.raw_user_meta_data->>'plan', '2x semana'),
    'activo',
    coalesce(new.raw_user_meta_data->>'telefono', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- DATOS INICIALES: gym_config
-- ============================================

insert into public.gym_config (id, nombre, direccion, dias_activos, franjas, duracion_min, paso_min, minutos_aviso)
values (
  'unica',
  'OZ Entrenamiento',
  'Bahía Blanca, Buenos Aires',
  array['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
  '[
    {"inicio": "08:00", "fin": "11:00"},
    {"inicio": "13:00", "fin": "21:00"}
  ]'::jsonb,
  60,
  30,
  15
)
on conflict (id) do nothing;

-- ============================================
-- DATOS INICIALES: plan_actividades (catálogo del frontend)
-- ============================================

-- Plan 2x semana: Pesas Libres, Movilidad
insert into public.plan_actividades (plan, actividad) values
  ('2x semana', 'Pesas Libres'),
  ('2x semana', 'Movilidad')
on conflict (plan, actividad) do nothing;

-- Plan 3x semana: Funcional, Pesas Libres, Movilidad
insert into public.plan_actividades (plan, actividad) values
  ('3x semana', 'Funcional'),
  ('3x semana', 'Pesas Libres'),
  ('3x semana', 'Movilidad')
on conflict (plan, actividad) do nothing;

-- Plan Full: Funcional, Pesas Libres, CrossTraining, Movilidad
insert into public.plan_actividades (plan, actividad) values
  ('Full', 'Funcional'),
  ('Full', 'Pesas Libres'),
  ('Full', 'CrossTraining'),
  ('Full', 'Movilidad')
on conflict (plan, actividad) do nothing;
