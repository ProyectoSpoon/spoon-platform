-- ========================================
-- Function: cerrar_caja_atomico
-- Purpose: Cerrar una sesión de caja de forma atómica respetando reglas de negocio
-- Bypasa limitaciones de RLS para administradores/owners mediante SECURITY DEFINER,
-- pero valida que el usuario ejecutor tenga permiso (cajero original o admin/owner del restaurante).
-- ========================================

CREATE OR REPLACE FUNCTION public.cerrar_caja_atomico(
  p_sesion_id UUID,
  p_notas TEXT DEFAULT NULL,
  p_saldo_final_reportado NUMERIC DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_restaurant_id UUID;
  v_cajero_id UUID;
  v_user_role TEXT;
  v_now TIMESTAMPTZ := now();
  v_row caja_sesiones%ROWTYPE;
BEGIN
  -- Bloqueo / verificación de existencia
  SELECT * INTO v_row FROM caja_sesiones WHERE id = p_sesion_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'SESION_NO_ENCONTRADA');
  END IF;

  v_restaurant_id := v_row.restaurant_id;
  v_cajero_id := v_row.cajero_id;

  -- Obtener rol del usuario
  SELECT role INTO v_user_role FROM users WHERE id = auth.uid();

  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NO_AUTENTICADO');
  END IF;

  -- Permisos: cajero original o admin/owner mismo restaurante
  IF NOT (
       (v_cajero_id IS NOT NULL AND v_cajero_id = auth.uid())
       OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid()
            AND u.restaurant_id = v_restaurant_id
            AND (u.role = 'admin' OR u.role = 'owner')
       )
     ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NO_PERMISO');
  END IF;

  -- Ya cerrada
  IF v_row.estado = 'cerrada' THEN
    RETURN jsonb_build_object('success', true, 'already_closed', true, 'sesion_id', v_row.id);
  END IF;

  -- Validación mínima: no cerrar si abierta_at > ahora (reloj desync)
  IF v_row.abierta_at IS NOT NULL AND v_row.abierta_at > v_now THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RELOJ_INVALIDO');
  END IF;

  UPDATE caja_sesiones
     SET estado = 'cerrada',
         cerrada_at = v_now,
         notas_cierre = COALESCE(p_notas, notas_cierre),
         saldo_final_reportado = COALESCE(p_saldo_final_reportado, saldo_final_reportado)
   WHERE id = p_sesion_id;

  RETURN jsonb_build_object('success', true, 'sesion_id', p_sesion_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error_code', 'EXCEPTION', 'message', SQLERRM);
END;
$$;

-- Opcional: GRANT EXECUTE (ajustar roles reales)
-- GRANT EXECUTE ON FUNCTION public.cerrar_caja_atomico(UUID, TEXT, NUMERIC) TO authenticated;
