-- Cierre automático de caja: función + job programado (pg_cron)
-- Ejecuta un cierre para sesiones abiertas de días anteriores (zona America/Bogota)

-- Asegurar extensión pg_cron (en Supabase suele estar disponible)
create extension if not exists pg_cron;

-- Función: cerrar_cajas_pendientes
create or replace function public.cerrar_cajas_pendientes()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bogota_start_utc timestamptz;
  v_cerradas int := 0;
begin
  -- Inicio del día actual en Bogotá convertido a UTC
  v_bogota_start_utc := (date_trunc('day', (now() at time zone 'America/Bogota')) at time zone 'UTC');

  -- Cerrar sesiones abiertas cuyo abierta_at sea antes del inicio de hoy (Bogotá)
  with candidates as (
    select cs.id, cs.restaurant_id
    from caja_sesiones cs
    where cs.estado = 'abierta'
      and cs.abierta_at < v_bogota_start_utc
  ),
  elegibles as (
    select c.id
    from candidates c
    where not exists (
      select 1 from ordenes_mesa om
      where om.restaurant_id = c.restaurant_id
        and om.estado = 'activa'
        and om.pagada_at is null
    )
    and not exists (
      select 1 from delivery_orders d
      where d.restaurant_id = c.restaurant_id
        and d.status = 'delivered'
        and d.pagada_at is null
    )
  )
  update caja_sesiones cs
     set estado = 'cerrada',
         cerrada_at = now(),
         notas_cierre = coalesce(notas_cierre, '') || case when notas_cierre is null or notas_cierre = '' then '' else ' ' end || '[Cierre automático]'
   where cs.id in (select id from elegibles);

  GET DIAGNOSTICS v_cerradas = ROW_COUNT;

  return json_build_object(
    'cerradas', v_cerradas,
    'ejecutado_a', now(),
    'bogota_dia_inicio_utc', v_bogota_start_utc
  );
end $$;

comment on function public.cerrar_cajas_pendientes is 'Cierra automáticamente sesiones de caja antiguas si no hay órdenes pendientes (zona America/Bogota).';

-- Programar job diario a las 05:05 UTC (00:05 Bogotá)
-- Idempotente: elimina si existe con el mismo nombre y recrea
do $$
begin
  if exists (select 1 from cron.job where jobname = 'auto_cerrar_caja_diario') then
    perform cron.unschedule('auto_cerrar_caja_diario');
  end if;
  perform cron.schedule('auto_cerrar_caja_diario', '5 5 * * *', 'SELECT public.cerrar_cajas_pendientes()');
end $$;
