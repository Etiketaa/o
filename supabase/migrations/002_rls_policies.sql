-- ============================================
-- MIGRACIÓN 002: Políticas de Row Level Security (RLS)
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

-- ------------------------------------------------------------
-- Habilitar RLS en todas las tablas
-- ------------------------------------------------------------
alter table public.gym_config enable row level security;
alter table public.perfiles enable row level security;
alter table public.turnos enable row level security;
alter table public.sesiones enable row level security;
alter table public.inscripciones enable row level security;
alter table public.pagos enable row level security;
alter table public.pago_config enable row level security;
alter table public.plan_actividades enable row level security;
alter table public.push_subscriptions enable row level security;

-- ------------------------------------------------------------
-- gym_config — solo admin gestiona; lectura autenticada
-- ------------------------------------------------------------
create policy "Authenticated users can view gym_config"
  on public.gym_config for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage gym_config"
  on public.gym_config for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- perfiles — cada uno ve el suyo; admin ve todos
-- ------------------------------------------------------------
create policy "Users can view own profile"
  on public.perfiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.perfiles for select
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update own profile"
  on public.perfiles for update
  using (auth.uid() = id);

create policy "Admins can update profiles"
  on public.perfiles for update
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Insert profiles"
  on public.perfiles for insert
  with check (true);

-- ------------------------------------------------------------
-- turnos — lectura pública autenticada; admin gestiona
-- ------------------------------------------------------------
create policy "Authenticated users can view turnos"
  on public.turnos for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage turnos"
  on public.turnos for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- sesiones — lectura pública autenticada; admin gestiona
-- ------------------------------------------------------------
create policy "Authenticated users can view sesiones"
  on public.sesiones for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage sesiones"
  on public.sesiones for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- inscripciones — alumno ve las suyas; admin ve todas e inserta
-- ------------------------------------------------------------
create policy "Alumnos can view own inscripciones"
  on public.inscripciones for select
  using (auth.uid() = alumno_id);

create policy "Admins can view all inscripciones"
  on public.inscripciones for select
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Alumnos can insert inscripciones"
  on public.inscripciones for insert
  with check (auth.uid() = alumno_id);

create policy "Admins can manage inscripciones"
  on public.inscripciones for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- pagos — admin gestiona todo; alumno ve los suyos
-- ------------------------------------------------------------
create policy "Users can view own pagos"
  on public.pagos for select
  using (auth.uid() = alumno_id);

create policy "Admins can manage pagos"
  on public.pagos for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- pago_config — lectura autenticada; admin gestiona
-- ------------------------------------------------------------
create policy "Authenticated users can view pago_config"
  on public.pago_config for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage pago_config"
  on public.pago_config for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- plan_actividades — lectura autenticada; admin gestiona
-- ------------------------------------------------------------
create policy "Authenticated users can view plan_actividades"
  on public.plan_actividades for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage plan_actividades"
  on public.plan_actividades for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- push_subscriptions — cada uno gestiona la suya
-- ------------------------------------------------------------
create policy "Users can manage own push subscription"
  on public.push_subscriptions for all
  using (auth.uid() = user_id);
