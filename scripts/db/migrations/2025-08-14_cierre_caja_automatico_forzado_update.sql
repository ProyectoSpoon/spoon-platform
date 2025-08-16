-- Actualización: cerrar sesiones automáticamente AUN con pendientes
-- Agrega nota diferenciando cierres forzados

create or replace function public.cerrar_cajas_pendientes()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bogota_start_utc timestamptz;
  v_cerradas int := 0;
  v_forzadas int := 0;
  r record;
  v_pend_mesa int;
  v_pend_del int;
  v_total_pend int;
  v_nota text;
begin
  v_bogota_start_utc := (date_trunc('day', (now() at time zone 'America/Bogota')) at time zone 'UTC');

  for r in
    select cs.id, cs.restaurant_id
    from caja_sesiones cs
    where cs.estado = 'abierta'
      and cs.abierta_at < v_bogota_start_utc
  loop
    select count(*) into v_pend_mesa
    from ordenes_mesa om
    where om.restaurant_id = r.restaurant_id
      and om.estado = 'activa'
      and om.pagada_at is null;

    select count(*) into v_pend_del
    from delivery_orders d
    where d.restaurant_id = r.restaurant_id
      and d.status = 'delivered'
      and d.pagada_at is null;

    v_total_pend := coalesce(v_pend_mesa,0) + coalesce(v_pend_del,0);

    if v_total_pend > 0 then
      v_nota := '[Cierre automático forzado con pendientes ('|| v_total_pend ||')]';
      v_forzadas := v_forzadas + 1;
    else
      v_nota := '[Cierre automático]';
    end if;

    update caja_sesiones cs
       set estado = 'cerrada',
           cerrada_at = now(),
           notas_cierre = coalesce(notas_cierre, '')
             || case when notas_cierre is null or notas_cierre = '' then '' else ' ' end
             || v_nota
     where cs.id = r.id;

    v_cerradas := v_cerradas + 1;
  end loop;

  return json_build_object(
    'cerradas', v_cerradas,
    'forzadas', v_forzadas,
    'ejecutado_a', now(),
    'bogota_dia_inicio_utc', v_bogota_start_utc
  );
end $$;

comment on function public.cerrar_cajas_pendientes is 'Cierra automáticamente sesiones de caja antiguas (forzado si hay pendientes) y añade nota en cierre.';
