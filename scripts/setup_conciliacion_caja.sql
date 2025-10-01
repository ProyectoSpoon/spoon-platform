-- =====================================================
-- SETUP SIMPLIFICADO: CONCILIACIÓN DE CAJA
-- Ejecutar paso a paso en Supabase SQL Editor
-- =====================================================

-- PASO 1: Crear tablas
CREATE TABLE IF NOT EXISTS conciliaciones_caja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  saldo_calculado integer NOT NULL,
  saldo_fisico_real integer NOT NULL,
  diferencia integer NOT NULL,
  justificacion text,
  evidencia_url text,
  conciliado_por uuid NOT NULL REFERENCES users(id),
  conciliado_at timestamptz NOT NULL DEFAULT now(),
  requiere_supervisor boolean DEFAULT false,
  aprobado_por uuid REFERENCES users(id),
  aprobado_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT conciliacion_sesion_unica UNIQUE (sesion_id)
);

CREATE TABLE IF NOT EXISTS ajustes_contables_caja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conciliacion_id uuid REFERENCES conciliaciones_caja(id) ON DELETE CASCADE,
  sesion_id uuid NOT NULL REFERENCES caja_sesiones(id),
  tipo text NOT NULL CHECK (tipo IN ('sobrante', 'faltante', 'ajuste_manual')),
  monto integer NOT NULL CHECK (monto > 0),
  descripcion text NOT NULL,
  responsable uuid NOT NULL REFERENCES users(id),
  aprobado_por uuid REFERENCES users(id),
  aprobado_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- PASO 2: Extender tabla caja_sesiones
ALTER TABLE caja_sesiones
ADD COLUMN IF NOT EXISTS conciliada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS saldo_final_calculado integer,
ADD COLUMN IF NOT EXISTS diferencia_caja integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tipo_cierre text DEFAULT 'manual' CHECK (tipo_cierre IN ('manual', 'automatico', 'forzado'));

-- PASO 3: Crear función para calcular saldo
CREATE OR REPLACE FUNCTION calcular_saldo_final_automatico(p_sesion_id uuid)
RETURNS integer AS $$
DECLARE
  v_monto_inicial integer;
  v_total_ingresos integer := 0;
  v_total_egresos integer := 0;
  v_saldo_final integer;
BEGIN
  SELECT monto_inicial INTO v_monto_inicial FROM caja_sesiones WHERE id = p_sesion_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sesión no encontrada'; END IF;

  SELECT COALESCE(SUM(monto_total), 0) INTO v_total_ingresos
  FROM transacciones_caja
  WHERE caja_sesion_id = p_sesion_id AND metodo_pago = 'efectivo'
    AND procesada_at >= (SELECT abierta_at FROM caja_sesiones WHERE id = p_sesion_id);

  SELECT COALESCE(SUM(monto), 0) INTO v_total_egresos
  FROM gastos_caja
  WHERE caja_sesion_id = p_sesion_id
    AND registrado_at >= (SELECT abierta_at FROM caja_sesiones WHERE id = p_sesion_id);

  v_saldo_final := v_monto_inicial + v_total_ingresos - v_total_egresos;
  RETURN v_saldo_final;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 4: Función para cerrar caja automáticamente
CREATE OR REPLACE FUNCTION cerrar_caja_automatico(p_sesion_id uuid, p_notas text DEFAULT 'Cierre automático')
RETURNS jsonb AS $$
DECLARE v_saldo_calculado integer;
BEGIN
  v_saldo_calculado := calcular_saldo_final_automatico(p_sesion_id);

  UPDATE caja_sesiones SET
    estado = 'cerrada',
    cerrada_at = now(),
    notas_cierre = p_notas,
    tipo_cierre = 'automatico',
    saldo_final_calculado = v_saldo_calculado,
    conciliada = false,
    updated_at = now()
  WHERE id = p_sesion_id AND estado = 'abierta';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sesión no encontrada');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'sesion_id', p_sesion_id,
    'saldo_calculado', v_saldo_calculado
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 5: Función para conciliar físicamente
CREATE OR REPLACE FUNCTION conciliar_caja_fisica(
  p_sesion_id uuid,
  p_conteo_fisico integer,
  p_justificacion text,
  p_conciliado_por uuid DEFAULT auth.uid()
)
RETURNS jsonb AS $$
DECLARE
  v_sesion RECORD;
  v_diferencia integer;
  v_conciliacion_id uuid;
BEGIN
  SELECT * INTO v_sesion FROM caja_sesiones
  WHERE id = p_sesion_id AND estado = 'cerrada' AND tipo_cierre = 'automatico';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sesión no requiere conciliación');
  END IF;

  v_diferencia := p_conteo_fisico - COALESCE(v_sesion.saldo_final_calculado, 0);

  INSERT INTO conciliaciones_caja (
    sesion_id, saldo_calculado, saldo_fisico_real, diferencia,
    justificacion, conciliado_por
  ) VALUES (
    p_sesion_id, COALESCE(v_sesion.saldo_final_calculado, 0),
    p_conteo_fisico, v_diferencia, p_justificacion, p_conciliado_por
  ) RETURNING id INTO v_conciliacion_id;

  UPDATE caja_sesiones SET
    saldo_final_reportado = p_conteo_fisico,
    diferencia_caja = v_diferencia,
    conciliada = true,
    updated_at = now()
  WHERE id = p_sesion_id;

  IF v_diferencia != 0 THEN
    INSERT INTO ajustes_contables_caja (
      conciliacion_id, sesion_id, tipo, monto, descripcion, responsable
    ) VALUES (
      v_conciliacion_id, p_sesion_id,
      CASE WHEN v_diferencia > 0 THEN 'sobrante' ELSE 'faltante' END,
      abs(v_diferencia),
      CASE WHEN v_diferencia > 0 THEN 'Sobrante' ELSE 'Faltante' END || ' conciliación: ' || p_justificacion,
      p_conciliado_por
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'conciliacion_id', v_conciliacion_id,
    'diferencia', v_diferencia
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 6: Función para verificar conciliaciones pendientes
CREATE OR REPLACE FUNCTION verificar_conciliaciones_pendientes(p_restaurant_id uuid)
RETURNS TABLE (
  sesion_id uuid,
  business_day date,
  saldo_calculado integer,
  cerrada_at timestamptz,
  horas_desde_cierre numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id, cs.business_day, cs.saldo_final_calculado, cs.cerrada_at,
    EXTRACT(EPOCH FROM (now() - cs.cerrada_at)) / 3600
  FROM caja_sesiones cs
  WHERE cs.restaurant_id = p_restaurant_id
    AND cs.estado = 'cerrada'
    AND cs.tipo_cierre = 'automatico'
    AND cs.conciliada = false
    AND cs.cerrada_at >= now() - interval '7 days'
  ORDER BY cs.cerrada_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 7: Políticas RLS (simplificadas)
ALTER TABLE conciliaciones_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes_contables_caja ENABLE ROW LEVEL SECURITY;

-- Políticas básicas - acceso para usuarios autenticados
-- Nota: Estas políticas pueden refinarse según la estructura de roles específica
CREATE POLICY "conciliaciones_caja_access" ON conciliaciones_caja
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "ajustes_contables_caja_access" ON ajustes_contables_caja
  FOR ALL USING (auth.uid() IS NOT NULL);

-- PASO 8: Índices básicos
CREATE INDEX IF NOT EXISTS idx_conciliaciones_sesion ON conciliaciones_caja(sesion_id);
CREATE INDEX IF NOT EXISTS idx_ajustes_sesion ON ajustes_contables_caja(sesion_id);
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_conciliada ON caja_sesiones(conciliada) WHERE conciliada = false;

-- CONFIRMACIÓN
SELECT '✅ Sistema de conciliación instalado correctamente' as status;
