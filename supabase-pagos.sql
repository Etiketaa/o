-- ============================================
-- MIGRACIÓN: Sistema de Pagos Completo
-- Ejecutá esto en Supabase → SQL Editor
-- ============================================

-- 1. Actualizar tabla pagos con campos necesarios
alter table public.pagos add column if not exists mes_pago int not null check (mes_pago between 1 and 12);
alter table public.pagos add column if not exists anio_pago int not null;
alter table public.pagos add column if not exists comprobante_url text;
alter table public.pagos add column if not exists comprobante_tipo text check (comprobante_tipo in ('imagen', 'pdf'));
alter table public.pagos add column if not exists comprobante_nombre text;
alter table public.pagos add column if not exists verificado boolean default false;
alter table public.pagos add column if not exists verificado_por uuid references public.profiles(id);
alter table public.pagos add column if not exists verificado_at timestamptz;
alter table public.pagos add column if not exists notas_admin text;

-- 2. Tabla de notificaciones de pago (para countdown y recordatorios)
create table if not exists public.pago_config (
  id uuid default gen_random_uuid() primary key,
  dia_limite int not null default 10 check (dia_limite between 1 and 28),
  monto_base numeric not null default 0,
  cvu text default '0000032160000007890123',
  alias text default 'OZENTRENAMIENTO',
  titular text default 'OZ Entrenamiento S.R.L.',
  banco text default 'Banco Nación',
  activo boolean default true,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.pago_config enable row level security;

-- Todos pueden ver la configuración de pago
create policy "Authenticated users can view pago_config"
  on public.pago_config for select
  using (auth.role() = 'authenticated');

-- Solo admin puede modificar
create policy "Admins can manage pago_config"
  on public.pago_config for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Bucket de Supabase Storage para comprobantes
-- Crear bucket 'comprobantes' manualmente en Supabase Dashboard → Storage
-- O ejecutar: INSERT INTO storage.buckets (id, name, public) VALUES ('comprobantes', 'comprobantes', false);

-- 4. Políticas de Storage para comprobantes
-- Los alumnos pueden subir comprobantes
create policy "Alumnos can upload comprobantes"
  on storage.objects for insert
  with check (
    bucket_id = 'comprobantes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Los alumnos pueden ver sus propios comprobantes
create policy "Alumnos can view own comprobantes"
  on storage.objects for select
  using (
    bucket_id = 'comprobantes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin puede ver todos los comprobantes
create policy "Admins can view all comprobantes"
  on storage.objects for select
  using (
    bucket_id = 'comprobantes'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin puede eliminar comprobantes
create policy "Admins can delete comprobantes"
  on storage.objects for delete
  using (
    bucket_id = 'comprobantes'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. Datos iniciales de configuración
insert into public.pago_config (dia_limite, monto_base, cvu, alias, titular, banco) values
  (10, 0, '0000032160000007890123', 'OZENTRENAMIENTO', 'OZ Entrenamiento S.R.L.', 'Banco Nación')
on conflict do nothing;

-- 6. Función para obtener el estado de pago de un alumno en un mes dado
create or replace function public.get_estado_pago(p_alumno_id uuid, p_mes int, p_anio int)
returns text as $$
declare
  v_pago record;
begin
  select * into v_pago
  from public.pagos
  where alumno_id = p_alumno_id
    and mes_pago = p_mes
    and anio_pago = p_anio
    and estado = 'pagado'
  limit 1;
  
  if found then
    return 'pagado';
  end if;
  
  select * into v_pago
  from public.pagos
  where alumno_id = p_alumno_id
    and mes_pago = p_mes
    and anio_pago = p_anio
    and estado = 'pendiente'
  limit 1;
  
  if found then
    if v_pago.comprobante_url is not null then
      return 'verificando';
    else
      return 'pendiente';
    end if;
  end if;
  
  return 'no_registrado';
end;
$$ language plpgsql security definer;
