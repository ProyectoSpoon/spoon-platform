-- Script: validar_cierre_caja.sql
-- Objetivo: Implementar la función validar_cierre_caja de forma defensiva sin asumir
-- el nombre exacto de la columna de estado en delivery_orders.
-- Detecta dinámicamente la primera columna existente entre:
--   estado, status, order_status, estado_actual, state
-- y cuenta pedidos "activos" según un conjunto amplio de valores posibles.
-- Devuelve JSONB: { bloqueado: bool, razones: [text] }
-- Razones posibles: mesas_activas, delivery_activos, otra_sesion_abierta, sesion_no_abierta

-- 1. Función principal
create or replace function public.validar_cierre_caja(
  p_restaurant_id uuid,
  p_sesion_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bloqueado boolean := false;
  v_razones text[] := '{}';
  v_open_mesas int := 0;
  v_open_delivery int := 0;
  v_otras_sesiones int := 0;
  v_delivery_col text := null;
  v_sql text;
begin
  -- Validar que la sesión está abierta
  if not exists (
    select 1 from caja_sesiones
     where id = p_sesion_id
       and restaurant_id = p_restaurant_id
       and estado = 'abierta'
  ) then
    return jsonb_build_object('bloqueado', false, 'razones', jsonb_build_array('sesion_no_abierta'));
  end if;

  -- Mesas activas (ajusta estados reales si difieren)
  select count(*) into v_open_mesas
  from ordenes_mesa
  where restaurant_id = p_restaurant_id
    and estado in ('activa','en_curso','pre_cuenta','por_cobrar');

  if v_open_mesas > 0 then
    v_bloqueado := true;
    v_razones := array_append(v_razones, 'mesas_activas');
  end if;

  -- Detectar columna de estado en delivery_orders (si la tabla existe)
  select column_name into v_delivery_col
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'delivery_orders'
    and column_name in ('estado','status','order_status','estado_actual','state')
  order by array_position(array['estado','status','order_status','estado_actual','state'], column_name)
  limit 1;

  if v_delivery_col is not null then
    -- Construir consulta dinámica; considerar múltiples valores posibles (ES/EN)
    v_sql := format(
      'select count(*) from public.delivery_orders where restaurant_id = $1 and %I in (%s)',
      v_delivery_col,
      '''pendiente'',''en_preparacion'',''por_cobrar'',''pending'',''preparing'',''to_charge'',''to_pay'''
    );
    execute v_sql into v_open_delivery using p_restaurant_id;

    if v_open_delivery > 0 then
      v_bloqueado := true;
      v_razones := array_append(v_razones, 'delivery_activos');
    end if;
  end if;

  -- Otra sesión abierta distinta (consistencia)
  select count(*) into v_otras_sesiones
  from caja_sesiones
  where restaurant_id = p_restaurant_id
    and estado = 'abierta'
    and id <> p_sesion_id;

  if v_otras_sesiones > 0 then
    v_bloqueado := true;
    v_razones := array_append(v_razones, 'otra_sesion_abierta');
  end if;

  return jsonb_build_object(
    'bloqueado', v_bloqueado,
    'razones', coalesce(to_jsonb(v_razones), '[]'::jsonb)
  );
end;
$$;

-- 2. Índices de soporte (creación condicional)
-- Mesas
create index if not exists idx_ordenes_mesa_rest_estado on ordenes_mesa(restaurant_id, estado);
-- Caja sesiones
create index if not exists idx_caja_sesiones_rest_estado on caja_sesiones(restaurant_id, estado);

-- Delivery (dinámico, depende de columna existente)
DO $$
DECLARE
  v_col text;
  v_stmt text;
BEGIN
  SELECT column_name INTO v_col
  FROM information_schema.columns
  WHERE table_schema='public'
    AND table_name='delivery_orders'
    AND column_name in ('estado','status','order_status','estado_actual','state')
  ORDER BY array_position(array['estado','status','order_status','estado_actual','state'], column_name)
  LIMIT 1;

  IF v_col IS NOT NULL THEN
    v_stmt := format('create index if not exists idx_delivery_orders_rest_%s on public.delivery_orders(restaurant_id, %I)', v_col, v_col);
    EXECUTE v_stmt;
  END IF;
END$$;

-- Notas:
-- * Usa SECURITY DEFINER, asegúrate que el owner (ALTER FUNCTION OWNER TO <rol_api>) tiene permisos SELECT sobre tablas.
-- * Si se agregan nuevos estados de delivery, ampliar la lista en la cláusula IN.
