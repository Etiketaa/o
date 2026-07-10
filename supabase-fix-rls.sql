-- ============================================
-- FIX: Arreglar RLS policies
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

-- Eliminar policies existentes problemáticas
drop policy if exists "Authenticated users can view turnos" on public.turnos;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Alumnos can view own reservas" on public.reservas;
drop policy if exists "Admins can view all reservas" on public.reservas;
drop policy if exists "Alumnos can insert reservas" on public.reservas;
drop policy if exists "Alumnos can delete own reservas" on public.reservas;
drop policy if exists "Admins can manage asistencias" on public.asistencias;
drop policy if exists "Admins can manage pagos" on public.pagos;
drop policy if exists "Alumnos can view own membresia" on public.membresias;
drop policy if exists "Admins can manage membresias" on public.membresias;

-- TURNOS: todos pueden leer (logueados o no)
create policy "Anyone can view turnos"
  on public.turnos for select
  using (true);

-- TURNOS: solo admin puede insertar/update/delete
create policy "Admins can insert turnos"
  on public.turnos for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update turnos"
  on public.turnos for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete turnos"
  on public.turnos for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- PROFILES
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

create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (true);

create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RESERVAS
create policy "Users can view own reservas"
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

create policy "Users can insert own reservas"
  on public.reservas for insert
  with check (auth.uid() = alumno_id);

create policy "Users can delete own reservas"
  on public.reservas for delete
  using (auth.uid() = alumno_id);

create policy "Admins can manage all reservas"
  on public.reservas for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ASISTENCIAS
create policy "Admins can manage asistencias"
  on public.asistencias for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- PAGOS
create policy "Admins can manage pagos"
  on public.pagos for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can view own pagos"
  on public.pagos for select
  using (auth.uid() = alumno_id);

-- MEMBRESÍAS
create policy "Users can view own membresia"
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
-- DATOS INICIALES (si turnos está vacío)
-- ============================================
insert into public.turnos (dia, hora, actividad, coach, cupo)
select * from (values
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
  ('Sáb', '10:00', 'Funcional', 'Vale', 12)
) as v(dia, hora, actividad, coach, cupo)
where not exists (select 1 from public.turnos limit 1);
