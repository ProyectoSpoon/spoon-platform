-- =====================================================
-- FUNCIONES DE REPORTES PARA SISTEMA DE CAJA
-- Reportes de conciliaciones, transacciones y estado de caja
-- =====================================================

-- =====================================================
-- REPORTE 1: Conciliaciones realizadas por período
-- =====================================================

CREATE OR REPLACE FUNCTION reporte_conciliaciones_realizadas(
  p_restaurant_id uuid DEFAULT NULL,
  p_fecha_desde date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_fecha_hasta date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  fecha_conciliacion date,
  sesion_id uuid,
  business_day date,
  saldo_calculado integer,
  saldo_fisico_real integer,
  diferencia integer,
  tipo_diferencia text,
  justificacion text,
  conciliado_por text,
  requiere_supervisor boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.conciliado_at::date,
    cc.sesion_id,
    cs.business_day,
    cc.saldo_calculado,
    cc.saldo_fisico_real,
    cc.diferencia,
    CASE
      WHEN cc.diferencia > 0 THEN 'Sobrante'
      WHEN cc.diferencia < 0 THEN 'Faltante'
      ELSE 'Cuadrado'
    END as tipo_diferencia,
    cc.justificacion,
    u.first_name || ' ' || u.last_name as conciliado_por,
    cc.requiere_supervisor
  FROM conciliaciones_caja cc
  JOIN caja_sesiones cs ON cc.sesion_id = cs.id
  LEFT JOIN users u ON cc.conciliado_por = u.id
  WHERE (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
    AND cc.conciliado_at::date BETWEEN p_fecha_desde AND p_fecha_hasta
  ORDER BY cc.conciliado_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE 2: Sesiones cerradas automáticamente pendientes de conciliación
-- =====================================================

CREATE OR REPLACE FUNCTION reporte_sesiones_pendientes_conciliacion(
  p_restaurant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  sesion_id uuid,
  business_day date,
  cerrada_at timestamptz,
  horas_desde_cierre numeric,
  saldo_calculado integer,
  cajero text,
  restaurant_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.business_day,
    cs.cerrada_at,
    EXTRACT(EPOCH FROM (now() - cs.cerrada_at)) / 3600 as horas_desde_cierre,
    cs.saldo_final_calculado,
    u.first_name || ' ' || u.last_name as cajero,
    r.name as restaurant_name
  FROM caja_sesiones cs
  JOIN restaurants r ON cs.restaurant_id = r.id
  LEFT JOIN users u ON cs.cajero_id = u.id
  WHERE cs.estado = 'cerrada'
    AND cs.tipo_cierre = 'automatico'
    AND cs.conciliada = false
    AND cs.cerrada_at >= now() - interval '7 days'
    AND (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
  ORDER BY cs.cerrada_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE 3: Resumen de diferencias por período
-- =====================================================

CREATE OR REPLACE FUNCTION reporte_resumen_diferencias(
  p_restaurant_id uuid DEFAULT NULL,
  p_fecha_desde date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_fecha_hasta date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  periodo text,
  total_conciliaciones bigint,
  total_sobrantes bigint,
  total_faltantes bigint,
  monto_total_sobrantes bigint,
  monto_total_faltantes bigint,
  porcentaje_conciliado numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(cc.conciliado_at, 'YYYY-MM') as periodo,
    COUNT(*) as total_conciliaciones,
    COUNT(CASE WHEN cc.diferencia > 0 THEN 1 END) as total_sobrantes,
    COUNT(CASE WHEN cc.diferencia < 0 THEN 1 END) as total_faltantes,
    COALESCE(SUM(CASE WHEN cc.diferencia > 0 THEN cc.diferencia END), 0) as monto_total_sobrantes,
    COALESCE(SUM(CASE WHEN cc.diferencia < 0 THEN abs(cc.diferencia) END), 0) as monto_total_faltantes,
    ROUND(
      (COUNT(*)::numeric /
       NULLIF(COUNT(*) + (SELECT COUNT(*) FROM caja_sesiones cs
                          WHERE cs.estado = 'cerrada' AND cs.tipo_cierre = 'automatico'
                          AND cs.conciliada = false
                          AND (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)), 0)
      ) * 100, 2
    ) as porcentaje_conciliado
  FROM conciliaciones_caja cc
  JOIN caja_sesiones cs ON cc.sesion_id = cs.id
  WHERE (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
    AND cc.conciliado_at::date BETWEEN p_fecha_desde AND p_fecha_hasta
  GROUP BY to_char(cc.conciliado_at, 'YYYY-MM')
  ORDER BY periodo DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE 4: Estado actual de caja por restaurante
-- =====================================================

CREATE OR REPLACE FUNCTION reporte_estado_caja_actual(
  p_restaurant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  restaurant_id uuid,
  restaurant_name text,
  caja_abierta boolean,
  sesion_actual_id uuid,
  cajero_actual text,
  monto_inicial integer,
  tiempo_abierta_horas numeric,
  ultima_actividad timestamptz,
  conciliaciones_pendientes bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    CASE WHEN cs.id IS NOT NULL THEN true ELSE false END as caja_abierta,
    cs.id as sesion_actual_id,
    u.first_name || ' ' || u.last_name as cajero_actual,
    cs.monto_inicial,
    CASE WHEN cs.abierta_at IS NOT NULL
         THEN EXTRACT(EPOCH FROM (now() - cs.abierta_at)) / 3600
         ELSE 0 END as tiempo_abierta_horas,
    cs.abierta_at as ultima_actividad,
    (SELECT COUNT(*) FROM caja_sesiones cs2
     WHERE cs2.restaurant_id = r.id
       AND cs2.estado = 'cerrada'
       AND cs2.tipo_cierre = 'automatico'
       AND cs2.conciliada = false
       AND cs2.cerrada_at >= now() - interval '7 days'
    ) as conciliaciones_pendientes
  FROM restaurants r
  LEFT JOIN caja_sesiones cs ON r.id = cs.restaurant_id AND cs.estado = 'abierta'
  LEFT JOIN users u ON cs.cajero_id = u.id
  WHERE (p_restaurant_id IS NULL OR r.id = p_restaurant_id)
  ORDER BY r.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE 5: Transacciones y movimientos por sesión
-- =====================================================

CREATE OR REPLACE FUNCTION reporte_transacciones_sesion(
  p_sesion_id uuid
)
RETURNS TABLE (
  tipo_movimiento text,
  descripcion text,
  monto integer,
  fecha_hora timestamptz,
  metodo_pago text,
  categoria text
) AS $$
BEGIN
  RETURN QUERY
  -- Ingresos por transacciones
  SELECT
    'Ingreso'::text as tipo_movimiento,
    'Venta - ' || tc.tipo_orden as descripcion,
    tc.monto_total as monto,
    tc.procesada_at as fecha_hora,
    tc.metodo_pago,
    null::text as categoria
  FROM transacciones_caja tc
  WHERE tc.caja_sesion_id = p_sesion_id
    AND tc.metodo_pago = 'efectivo'

  UNION ALL

  -- Gastos
  SELECT
    'Egreso'::text as tipo_movimiento,
    'Gasto - ' || gc.concepto as descripcion,
    -gc.monto as monto,
    gc.registrado_at as fecha_hora,
    'efectivo'::text as metodo_pago,
    gc.categoria
  FROM gastos_caja gc
  WHERE gc.caja_sesion_id = p_sesion_id

  UNION ALL

  -- Ajustes contables
  SELECT
    CASE WHEN ac.tipo = 'sobrante' THEN 'Ajuste - Sobrante' ELSE 'Ajuste - Faltante' END as tipo_movimiento,
    'Ajuste contable - ' || ac.descripcion as descripcion,
    CASE WHEN ac.tipo = 'sobrante' THEN ac.monto ELSE -ac.monto END as monto,
    ac.created_at as fecha_hora,
    'efectivo'::text as metodo_pago,
    ac.tipo as categoria
  FROM ajustes_contables_caja ac
  WHERE ac.sesion_id = p_sesion_id

  ORDER BY fecha_hora;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE 6: Dashboard de caja (métricas principales)
-- =====================================================

CREATE OR REPLACE FUNCTION reporte_dashboard_caja(
  p_restaurant_id uuid DEFAULT NULL,
  p_dias_atras integer DEFAULT 30
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_total_conciliaciones bigint;
  v_total_sobrantes bigint;
  v_total_faltantes bigint;
  v_monto_sobrantes bigint;
  v_monto_faltantes bigint;
  v_sesiones_auto_cerradas bigint;
  v_sesiones_conciliadas bigint;
  v_conciliaciones_pendientes bigint;
  v_cajas_abiertas bigint;
BEGIN
  -- Calcular métricas
  SELECT COUNT(*) INTO v_total_conciliaciones
  FROM conciliaciones_caja cc
  JOIN caja_sesiones cs ON cc.sesion_id = cs.id
  WHERE (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
    AND cc.conciliado_at >= now() - (p_dias_atras || ' days')::interval;

  SELECT
    COUNT(CASE WHEN diferencia > 0 THEN 1 END),
    COUNT(CASE WHEN diferencia < 0 THEN 1 END),
    COALESCE(SUM(CASE WHEN diferencia > 0 THEN diferencia END), 0),
    COALESCE(SUM(CASE WHEN diferencia < 0 THEN abs(diferencia) END), 0)
  INTO v_total_sobrantes, v_total_faltantes, v_monto_sobrantes, v_monto_faltantes
  FROM conciliaciones_caja cc
  JOIN caja_sesiones cs ON cc.sesion_id = cs.id
  WHERE (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
    AND cc.conciliado_at >= now() - (p_dias_atras || ' days')::interval;

  SELECT COUNT(*) INTO v_sesiones_auto_cerradas
  FROM caja_sesiones cs
  WHERE (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
    AND cs.tipo_cierre = 'automatico'
    AND cs.cerrada_at >= now() - (p_dias_atras || ' days')::interval;

  SELECT COUNT(*) INTO v_sesiones_conciliadas
  FROM caja_sesiones cs
  WHERE (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
    AND cs.conciliada = true
    AND cs.cerrada_at >= now() - (p_dias_atras || ' days')::interval;

  SELECT COUNT(*) INTO v_conciliaciones_pendientes
  FROM caja_sesiones cs
  WHERE (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
    AND cs.estado = 'cerrada'
    AND cs.tipo_cierre = 'automatico'
    AND cs.conciliada = false
    AND cs.cerrada_at >= now() - interval '7 days';

  SELECT COUNT(*) INTO v_cajas_abiertas
  FROM caja_sesiones cs
  WHERE (p_restaurant_id IS NULL OR cs.restaurant_id = p_restaurant_id)
    AND cs.estado = 'abierta';

  -- Construir resultado JSON
  v_result := jsonb_build_object(
    'periodo_dias', p_dias_atras,
    'metricas_principales', jsonb_build_object(
      'total_conciliaciones', v_total_conciliaciones,
      'sesiones_auto_cerradas', v_sesiones_auto_cerradas,
      'sesiones_conciliadas', v_sesiones_conciliadas,
      'conciliaciones_pendientes', v_conciliaciones_pendientes,
      'cajas_abiertas', v_cajas_abiertas
    ),
    'diferencias', jsonb_build_object(
      'total_sobrantes', v_total_sobrantes,
      'total_faltantes', v_total_faltantes,
      'monto_total_sobrantes', v_monto_sobrantes,
      'monto_total_faltantes', v_monto_faltantes,
      'balance_neto', v_monto_sobrantes - v_monto_faltantes
    ),
    'porcentajes', jsonb_build_object(
      'tasa_conciliacion', CASE WHEN v_sesiones_auto_cerradas > 0
                               THEN ROUND((v_sesiones_conciliadas::numeric / v_sesiones_auto_cerradas) * 100, 2)
                               ELSE 0 END,
      'precision_caja', CASE WHEN v_total_conciliaciones > 0
                            THEN ROUND(((v_total_conciliaciones - v_total_sobrantes - v_total_faltantes)::numeric / v_total_conciliaciones) * 100, 2)
                            ELSE 0 END
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE 7: Reporte diario completo de caja
-- =====================================================

CREATE OR REPLACE FUNCTION reporte_diario_caja(
  p_restaurant_id uuid,
  p_fecha date DEFAULT CURRENT_DATE,
  p_turno text DEFAULT 'dia_completo'
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_fecha_inicio timestamptz;
  v_fecha_fin timestamptz;

  -- Variables para cálculos
  v_saldo_inicial integer := 0;
  v_ingresos jsonb;
  v_egresos jsonb;
  v_resumen jsonb;
  v_informacion_basica jsonb;

  -- Variables temporales para cálculos
  v_total_ordenes bigint := 0;
  v_ticket_promedio numeric := 0;
  v_propinas_recibidas integer := 0;
BEGIN
  -- Determinar rango de tiempo según turno
  CASE p_turno
    WHEN 'desayuno' THEN
      v_fecha_inicio := to_timestamp(p_fecha::text || ' 06:00:00', 'YYYY-MM-DD HH24:MI:SS');
      v_fecha_fin := to_timestamp(p_fecha::text || ' 12:00:00', 'YYYY-MM-DD HH24:MI:SS');
    WHEN 'almuerzo' THEN
      v_fecha_inicio := to_timestamp(p_fecha::text || ' 12:00:00', 'YYYY-MM-DD HH24:MI:SS');
      v_fecha_fin := to_timestamp(p_fecha::text || ' 18:00:00', 'YYYY-MM-DD HH24:MI:SS');
    WHEN 'cena' THEN
      v_fecha_inicio := to_timestamp(p_fecha::text || ' 18:00:00', 'YYYY-MM-DD HH24:MI:SS');
      v_fecha_fin := to_timestamp((p_fecha + interval '1 day')::text || ' 00:00:00', 'YYYY-MM-DD HH24:MI:SS');
    ELSE -- dia_completo
      v_fecha_inicio := to_timestamp(p_fecha::text || ' 00:00:00', 'YYYY-MM-DD HH24:MI:SS');
      v_fecha_fin := to_timestamp((p_fecha + interval '1 day')::text || ' 00:00:00', 'YYYY-MM-DD HH24:MI:SS');
  END CASE;

  -- Obtener saldo inicial (de la sesión de caja del día)
  SELECT COALESCE(monto_inicial, 0) INTO v_saldo_inicial
  FROM caja_sesiones
  WHERE restaurant_id = p_restaurant_id
    AND business_day = p_fecha
    AND estado IN ('abierta', 'cerrada')
  ORDER BY abierta_at DESC
  LIMIT 1;

  -- Calcular estadísticas de ventas
  SELECT
    COUNT(*) as total_ordenes,
    ROUND(AVG(tc.monto_total), 2) as ticket_promedio
  INTO v_total_ordenes, v_ticket_promedio
  FROM transacciones_caja tc
  JOIN caja_sesiones cs ON tc.caja_sesion_id = cs.id
  WHERE cs.restaurant_id = p_restaurant_id
    AND tc.procesada_at >= v_fecha_inicio
    AND tc.procesada_at < v_fecha_fin;

  -- Calcular ingresos por método de pago
  SELECT jsonb_build_object(
    'efectivo', COALESCE(SUM(CASE WHEN tc.metodo_pago = 'efectivo' THEN tc.monto_total END), 0),
    'tarjeta_debito', COALESCE(SUM(CASE WHEN tc.metodo_pago = 'tarjeta_debito' THEN tc.monto_total END), 0),
    'tarjeta_credito', COALESCE(SUM(CASE WHEN tc.metodo_pago = 'tarjeta_credito' THEN tc.monto_total END), 0),
    'transferencias', COALESCE(SUM(CASE WHEN tc.metodo_pago = 'transferencias' THEN tc.monto_total END), 0),
    'vales_comida', COALESCE(SUM(CASE WHEN tc.metodo_pago = 'vales_comida' THEN tc.monto_total END), 0),
    'apps_delivery', COALESCE(SUM(CASE WHEN tc.metodo_pago = 'apps_delivery' THEN tc.monto_total END), 0)
  ) INTO v_ingresos
  FROM transacciones_caja tc
  JOIN caja_sesiones cs ON tc.caja_sesion_id = cs.id
  WHERE cs.restaurant_id = p_restaurant_id
    AND tc.procesada_at >= v_fecha_inicio
    AND tc.procesada_at < v_fecha_fin;

  -- Agregar estadísticas de ventas al objeto ingresos
  v_ingresos := v_ingresos || jsonb_build_object(
    'desglose_ventas', jsonb_build_object(
      'total_ordenes', v_total_ordenes,
      'ticket_promedio', v_ticket_promedio,
      'propinas_recibidas', v_propinas_recibidas
    )
  );

  -- Calcular egresos
  SELECT jsonb_build_object(
    'compras_menores', COALESCE(SUM(CASE WHEN gc.categoria = 'compras_menores' THEN gc.monto END), 0),
    'gastos_operacion', COALESCE(SUM(CASE WHEN gc.categoria = 'gastos_operacion' THEN gc.monto END), 0),
    'propinas_pagadas', COALESCE(SUM(CASE WHEN gc.categoria = 'propinas_pagadas' THEN gc.monto END), 0),
    'cambio_entregado', COALESCE(SUM(CASE WHEN gc.categoria = 'cambio_entregado' THEN gc.monto END), 0),
    'devoluciones', COALESCE(SUM(CASE WHEN gc.categoria = 'devoluciones' THEN gc.monto END), 0)
  ) INTO v_egresos
  FROM gastos_caja gc
  JOIN caja_sesiones cs ON gc.caja_sesion_id = cs.id
  WHERE cs.restaurant_id = p_restaurant_id
    AND gc.registrado_at >= v_fecha_inicio
    AND gc.registrado_at < v_fecha_fin;

  -- Calcular totales para resumen
  DECLARE
    v_total_ingresos integer := 0;
    v_total_egresos integer := 0;
    v_saldo_teorico integer := 0;
  BEGIN
    -- Calcular total ingresos
    SELECT SUM(value::integer) INTO v_total_ingresos
    FROM jsonb_object_keys(v_ingresos) k
    CROSS JOIN LATERAL jsonb_extract_path(v_ingresos, k) as value
    WHERE k NOT IN ('desglose_ventas');

    -- Calcular total egresos
    SELECT SUM(value::integer) INTO v_total_egresos
    FROM jsonb_object_keys(v_egresos) k
    CROSS JOIN LATERAL jsonb_extract_path(v_egresos, k) as value;

    v_saldo_teorico := v_saldo_inicial + v_total_ingresos - v_total_egresos;

    -- Obtener información de conciliación si existe
    DECLARE
      v_conteo_fisico jsonb := 'null'::jsonb;
      v_diferencia integer := 0;
    BEGIN
      SELECT jsonb_build_object(
        'efectivo_caja', COALESCE(saldo_fisico_real, 0),
        'comprobantes_tarjetas', 0, -- TODO: calcular de vouchers
        'otros_comprobantes', 0,    -- TODO: calcular otros
        'total_fisico', COALESCE(saldo_fisico_real, 0)
      ),
      COALESCE(diferencia, 0)
      INTO v_conteo_fisico, v_diferencia
      FROM conciliaciones_caja cc
      JOIN caja_sesiones cs ON cc.sesion_id = cs.id
      WHERE cs.restaurant_id = p_restaurant_id
        AND cs.business_day = p_fecha
      ORDER BY cc.conciliado_at DESC
      LIMIT 1;

      -- Construir resumen
      v_resumen := jsonb_build_object(
        'saldo_inicial', v_saldo_inicial,
        'total_ingresos', v_total_ingresos,
        'total_egresos', v_total_egresos,
        'saldo_teorico', v_saldo_teorico,
        'conteo_fisico', v_conteo_fisico,
        'diferencia', v_diferencia
      );
    END;
  END;

  -- Información básica
  SELECT jsonb_build_object(
    'fecha', p_fecha,
    'turno', p_turno,
    'cajero', COALESCE(u.first_name || ' ' || u.last_name, 'Sistema'),
    'folio', 'RC-' || to_char(p_fecha, 'YYYY') || '-' || LPAD(EXTRACT(DAY FROM p_fecha)::text, 3, '0'),
    'hora_generacion', to_char(now(), 'HH24:MI:SS')
  ) INTO v_informacion_basica
  FROM caja_sesiones cs
  LEFT JOIN users u ON cs.cajero_id = u.id
  WHERE cs.restaurant_id = p_restaurant_id
    AND cs.business_day = p_fecha
  ORDER BY cs.abierta_at DESC
  LIMIT 1;

  -- Si no hay sesión, usar valores por defecto
  IF v_informacion_basica IS NULL THEN
    v_informacion_basica := jsonb_build_object(
      'fecha', p_fecha,
      'turno', p_turno,
      'cajero', 'Sistema',
      'folio', 'RC-' || to_char(p_fecha, 'YYYY') || '-' || LPAD(EXTRACT(DAY FROM p_fecha)::text, 3, '0'),
      'hora_generacion', to_char(now(), 'HH24:MI:SS')
    );
  END IF;

  -- Construir resultado final
  v_result := jsonb_build_object(
    'informacion_basica', v_informacion_basica,
    'ingresos', v_ingresos,
    'egresos', v_egresos,
    'resumen_caja', v_resumen
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONFIRMACIÓN DE CREACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funciones de reportes creadas exitosamente:';
  RAISE NOTICE '  📊 reporte_conciliaciones_realizadas';
  RAISE NOTICE '  📊 reporte_sesiones_pendientes_conciliacion';
  RAISE NOTICE '  📊 reporte_resumen_diferencias';
  RAISE NOTICE '  📊 reporte_estado_caja_actual';
  RAISE NOTICE '  📊 reporte_transacciones_sesion';
  RAISE NOTICE '  📊 reporte_dashboard_caja';
  RAISE NOTICE '  📊 reporte_diario_caja';
END $$;
