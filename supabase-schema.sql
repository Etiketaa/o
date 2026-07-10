-- ============================================
-- SCHEMA: Turnero Gym
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

-- 1. Tabla de perfiles (extendida desde auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nombre text not null,
  role text not null default 'alumno' check (role in ('admin', 'alumno')),
  plan text not null default '2x semana' check (plan in ('Full', '3x semana', '2x semana')),
  estado text not null default 'activo' check (estado in ('activo', 'vencido')),
  telefono text default '',
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Tabla de turnos
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

-- 3. Tabla de reservas
create table if not exists public.reservas (
  id uuid default gen_random_uuid() primary key,
  turno_id uuid references public.turnos(id) on delete cascade not null,
  alumno_id uuid references public.profiles(id) on delete cascade not null,
  fecha timestamptz default now(),
  estado text not null default 'activa' check (estado in ('activa', 'cancelada')),
  created_at timestamptz default now(),
  unique(turno_id, alumno_id)
);

-- 4. Tabla de asistencias
create table if not exists public.asistencias (
  id uuid default gen_random_uuid() primary key,
  turno_id uuid references public.turnos(id) on delete cascade not null,
  alumno_id uuid references public.profiles(id) on delete cascade not null,
  fecha timestamptz default now(),
  presente boolean default false,
  created_at timestamptz default now(),
  unique(turno_id, alumno_id)
);

-- 5. Tabla de pagos
create table if not exists public.pagos (
  id uuid default gen_random_uuid() primary key,
  alumno_id uuid references public.profiles(id) on delete cascade not null,
  monto numeric not null,
  fecha timestamptz default now(),
  metodo text not null check (metodo in ('efectivo', 'transferencia', 'tarjeta', 'mercadopago')),
  estado text not null default 'pagado' check (estado in ('pagado', 'pendiente', 'vencido')),
  descripcion text default '',
  created_at timestamptz default now()
);

-- 6. Tabla de membresías
create table if not exists public.membresias (
  id uuid default gen_random_uuid() primary key,
  alumno_id uuid references public.profiles(id) on delete cascade not null,
  plan text not null check (plan in ('Full', '3x semana', '2x semana')),
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null,
  estado text not null default 'activa' check (estado in ('activa', 'vencida', 'cancelada')),
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.turnos enable row level security;
alter table public.reservas enable row level security;
alter table public.asistencias enable row level security;
alter table public.pagos enable row level security;
alter table public.membresias enable row level security;

-- Profiles: los usuarios ven su propio perfil, los admins ven todos
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Turnos: todos los autenticados pueden ver
create policy "Authenticated users can view turnos"
  on public.turnos for select
  using (auth.role() = 'authenticated');

-- Reservas: los alumnos ven las suyas, los admin ven todas
create policy "Alumnos can view own reservas"
  on public.reservas for select
  using (auth.uid() = alumno_id);

create policy "Admins can view all reservas"
  on public.reservas for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Alumnos can insert reservas"
  on public.reservas for insert
  with check (auth.uid() = alumno_id);

create policy "Alumnos can delete own reservas"
  on public.reservas for delete
  using (auth.uid() = alumno_id);

-- Asistencias: solo admin puede gestionar
create policy "Admins can manage asistencias"
  on public.asistencias for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Pagos: solo admin
create policy "Admins can manage pagos"
  on public.pagos for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Membresías: alumnos ven la suya, admin ve todas
create policy "Alumnos can view own membresia"
  on public.membresias for select
  using (auth.uid() = alumno_id);

create policy "Admins can manage membresias"
  on public.membresias for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- TRIGGER: Auto-crear perfil al registrarse
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nombre, role, plan, estado, telefono)
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
-- DATOS INICIALES (turnos de ejemplo)
-- ============================================

insert into public.turnos (dia, hora, actividad, coach, cupo) values
  ('Lun', '07:00', 'Funcional', 'Nacho', 12),
  ('Lun', '09:00', 'Pesas Libres', 'Vale', 8),
  ('Lun', '18:30', 'CrossTraining', 'Nacho', 14),
  ('Lun', '20:00', 'Movilidad', 'Vale', 10),
  ('Mar', '08:00', 'Funcional', 'Nacho', 12),
  ('Mar', '19:00', 'Pesas Libres', 'Vale', 8),
  ('Mié', '07:00', 'Funcional', 'Nacho', 12),
  ('Mié', '18:30', 'CrossTraining', 'Nacho', 14),
  ('Jue', '09:00', 'Movilidad', 'Vale', 10),
  ('Vie', '07:00', 'Funcional', 'Nacho', 12),
  ('Vie', '18:30', 'CrossTraining', 'Nacho', 14),
  ('Sáb', '10:00', 'Funcional', 'Vale', 12);
