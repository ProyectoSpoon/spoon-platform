-- ========================================
-- Function: abrir_caja_atomico
-- Purpose: Abrir una sesión de caja de forma atómica con validaciones de seguridad y negocio
-- Reglas:
--  - Requiere autenticación (auth.uid())
--  - El usuario debe pertenecer al restaurante y el restaurante debe estar activo
--  - Monto inicial en rango [0..10,000,000] COP (pesos, sin centavos)
--  - business_day automático en zona America/Bogota
--  - Una caja abierta por usuario (cajero) a la vez
--  - Una caja abierta por restaurante por día (business_day)
--  - Manejo de errores específicos y mensajes consistentes
-- ========================================

CREATE OR REPLACE FUNCTION public.abrir_caja_atomico(
  p_restaurant_id UUID,
  p_cajero_id UUID,
  p_monto_inicial NUMERIC,
  p_notas TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today_bogota DATE;
  v_now_bogota TIMESTAMPTZ;
  v_role TEXT;
  v_rest_active BOOLEAN;
  v_belongs BOOLEAN;
  v_exists_user_open BOOLEAN;
  v_exists_rest_open_today BOOLEAN;
  v_sesion_id UUID;
BEGIN
  -- 1) Autenticación
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NO_AUTENTICADO', 'message', 'Debe iniciar sesión.');
  END IF;

  -- 2) Normalizar y validar monto (pesos)
  IF p_monto_inicial IS NULL THEN p_monto_inicial := 0; END IF;
  p_monto_inicial := round(p_monto_inicial); -- pesos enteros
  IF p_monto_inicial < 0 OR p_monto_inicial > 10000000 THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'MONTO_FUERA_RANGO', 'message', 'Monto debe estar entre $0 y $10,000,000 COP.');
  END IF;

  -- 3) Validar pertenencia del usuario al restaurante y estado activo
  SELECT TRUE
    INTO v_belongs
    FROM users u
   WHERE u.id = v_user_id AND u.restaurant_id = p_restaurant_id
   LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NO_PERTENECE_RESTAURANTE', 'message', 'El usuario no pertenece a este restaurante.');
  END IF;

  SELECT COALESCE(is_active, true) INTO v_rest_active FROM restaurants WHERE id = p_restaurant_id;
  IF NOT COALESCE(v_rest_active, false) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESTAURANTE_INACTIVO', 'message', 'El restaurante no está activo.');
  END IF;

  -- 4) Business day en America/Bogota
  v_now_bogota := timezone('America/Bogota', now());
  v_today_bogota := (v_now_bogota AT TIME ZONE 'America/Bogota')::date;

  -- 5) Una caja abierta por usuario
  SELECT EXISTS (
    SELECT 1 FROM caja_sesiones
     WHERE estado = 'abierta'
       AND cajero_id = v_user_id
  ) INTO v_exists_user_open;
  IF v_exists_user_open THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'USUARIO_YA_TIENE_CAJA', 'message', 'El usuario ya tiene una caja abierta.');
  END IF;

  -- 6) Una caja abierta por restaurante en el business_day actual
  SELECT EXISTS (
    SELECT 1 FROM caja_sesiones
     WHERE estado = 'abierta'
       AND restaurant_id = p_restaurant_id
       AND business_day = v_today_bogota
  ) INTO v_exists_rest_open_today;
  IF v_exists_rest_open_today THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESTAURANTE_YA_TIENE_CAJA', 'message', 'Ya existe una caja abierta hoy en este restaurante.');
  END IF;

  -- 7) Insertar sesión bloqueando por unicidad lógica (advisory lock para evitar carrera)
  PERFORM pg_advisory_xact_lock(hashtext('abrir_caja_atomico:' || p_restaurant_id::text || ':' || v_today_bogota::text));

  INSERT INTO caja_sesiones (
    restaurant_id,
    cajero_id,
    monto_inicial,
    business_day,
    estado,
    abierta_at,
    notas_apertura
  ) VALUES (
    p_restaurant_id,
    v_user_id,
    p_monto_inicial,
    v_today_bogota,
    'abierta',
    now(),
    p_notas
  ) RETURNING id INTO v_sesion_id;

  RETURN jsonb_build_object('success', true, 'sesion_id', v_sesion_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error_code', 'EXCEPTION', 'message', SQLERRM);
END;
$$;

-- Grants recomendados (ajustar roles reales)
-- GRANT EXECUTE ON FUNCTION public.abrir_caja_atomico(UUID, UUID, NUMERIC, TEXT) TO authenticated;
