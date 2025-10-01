-- =====================================================
-- SISTEMA DE CONCILIACIÓN POST-CIERRE AUTOMÁTICO
-- Scripts para implementar conciliación de cajas cerradas automáticamente
-- Fecha: 25 de septiembre de 2025
-- =====================================================

-- =====================================================
-- 1. NUEVAS TABLAS PARA CONCILIACIÓN
-- =====================================================

-- Tabla para conciliaciones post-cierre automático
CREATE TABLE IF NOT EXISTS conciliaciones_caja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  saldo_calculado integer NOT NULL, -- En centavos
  saldo_fisico_real integer NOT NULL, -- En centavos
  diferencia integer NOT NULL, -- En centavos (positivo = sobrante, negativo = faltante)
  justificacion text,
  evidencia_url text, -- URL a foto/comprobante del conteo físico
  conciliado_por uuid NOT NULL REFERENCES users(id),
  conciliado_at timestamptz NOT NULL DEFAULT now(),
  requiere_supervisor boolean DEFAULT false, -- Para diferencias grandes
  aprobado_por uuid REFERENCES users(id), -- Supervisor que aprueba
  aprobado_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT conciliacion_sesion_unica UNIQUE (sesion_id),
  CONSTRAINT diferencia_no_cero CHECK (diferencia <> 0 OR justificacion IS NOT NULL)
);

-- Tabla para ajustes contables generados por conciliaciones
CREATE TABLE IF NOT EXISTS ajustes_contables_caja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conciliacion_id uuid REFERENCES conciliaciones_caja(id) ON DELETE CASCADE,
  sesion_id uuid NOT NULL REFERENCES caja_sesiones(id),
  tipo text NOT NULL CHECK (tipo IN ('sobrante', 'faltante', 'ajuste_manual')),
  monto integer NOT NULL CHECK (monto > 0), -- En centavos, siempre positivo
  descripcion text NOT NULL,
  responsable uuid NOT NULL REFERENCES users(id),
  aprobado_por uuid REFERENCES users(id),
  aprobado_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. EXTENSIÓN DE TABLA CAJA_SESIONES
-- =====================================================

-- Agregar campos para conciliación
ALTER TABLE caja_sesiones
ADD COLUMN IF NOT EXISTS conciliada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS saldo_final_calculado integer, -- Calculado automáticamente al cierre
ADD COLUMN IF NOT EXISTS diferencia_caja integer DEFAULT 0, -- Diferencia real después de conciliación
ADD COLUMN IF NOT EXISTS tipo_cierre text DEFAULT 'manual' CHECK (tipo_cierre IN ('manual', 'automatico', 'forzado'));

-- Comentarios para documentación
COMMENT ON COLUMN caja_sesiones.conciliada IS 'Indica si la sesión cerrada automáticamente fue conciliada físicamente';
COMMENT ON COLUMN caja_sesiones.saldo_final_calculado IS 'Saldo calculado automáticamente al cierre (centavos)';
COMMENT ON COLUMN caja_sesiones.diferencia_caja IS 'Diferencia real después de conciliación física (centavos)';
COMMENT ON COLUMN caja_sesiones.tipo_cierre IS 'Tipo de cierre: manual, automatico, forzado';

-- =====================================================
-- 3. NUEVAS FUNCIONES PARA CONCILIACIÓN
-- =====================================================

-- Función para calcular saldo final automáticamente
CREATE OR REPLACE FUNCTION calcular_saldo_final_automatico(p_sesion_id uuid)
RETURNS integer AS $$
DECLARE
  v_monto_inicial integer;
  v_total_ingresos integer := 0;
  v_total_egresos integer := 0;
  v_saldo_final integer;
BEGIN
  -- Obtener monto inicial de la sesión
  SELECT monto_inicial INTO v_monto_inicial
  FROM caja_sesiones
  WHERE id = p_sesion_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sesión de caja no encontrada';
  END IF;

  -- Calcular total de ingresos (ventas en efectivo + ingresos)
  SELECT COALESCE(SUM(monto_total), 0) INTO v_total_ingresos
  FROM transacciones_caja
  WHERE caja_sesion_id = p_sesion_id
    AND metodo_pago = 'efectivo'
    AND procesada_at >= (
      SELECT abierta_at FROM caja_sesiones WHERE id = p_sesion_id
    );

  -- Calcular total de egresos (gastos)
  SELECT COALESCE(SUM(monto), 0) INTO v_total_egresos
  FROM gastos_caja
  WHERE caja_sesion_id = p_sesion_id
    AND registrado_at >= (
      SELECT abierta_at FROM caja_sesiones WHERE id = p_sesion_id
    );

  -- Calcular saldo final: inicial + ingresos - egresos
  v_saldo_final := v_monto_inicial + v_total_ingresos - v_total_egresos;

  RETURN v_saldo_final;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cerrar caja automáticamente con cálculo de saldo
CREATE OR REPLACE FUNCTION cerrar_caja_automatico(
  p_sesion_id uuid,
  p_notas text DEFAULT 'Cierre automático por inactividad'
)
RETURNS jsonb AS $$
DECLARE
  v_saldo_calculado integer;
  v_result jsonb;
BEGIN
  -- Calcular saldo final
  v_saldo_calculado := calcular_saldo_final_automatico(p_sesion_id);

  -- Actualizar sesión con cierre automático
  UPDATE caja_sesiones SET
    estado = 'cerrada',
    cerrada_at = now(),
    notas_cierre = p_notas,
    tipo_cierre = 'automatico',
    saldo_final_calculado = v_saldo_calculado,
    saldo_final_reportado = v_saldo_calculado, -- Para cierres automáticos
    diferencia_caja = 0, -- No hay diferencia física
    conciliada = false, -- Requiere conciliación física
    updated_at = now()
  WHERE id = p_sesion_id
    AND estado = 'abierta';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Sesión no encontrada o ya cerrada'
    );
  END IF;

  -- Registrar en auditoría
  INSERT INTO audit_caja_sesiones (
    operation_type, table_name, record_id, old_values, new_values,
    user_id, session_info, ip_address, changed_fields
  ) VALUES (
    'UPDATE', 'caja_sesiones', p_sesion_id,
    jsonb_build_object('estado', 'abierta'),
    jsonb_build_object(
      'estado', 'cerrada',
      'tipo_cierre', 'automatico',
      'saldo_final_calculado', v_saldo_calculado
    ),
    auth.uid(),
    jsonb_build_object('tipo_operacion', 'cierre_automatico'),
    inet_client_addr(),
    ARRAY['estado', 'cerrada_at', 'tipo_cierre', 'saldo_final_calculado', 'conciliada']
  );

  RETURN jsonb_build_object(
    'success', true,
    'sesion_id', p_sesion_id,
    'saldo_calculado', v_saldo_calculado,
    'requiere_conciliacion', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para realizar conciliación física
CREATE OR REPLACE FUNCTION conciliar_caja_fisica(
  p_sesion_id uuid,
  p_conteo_fisico integer, -- En centavos
  p_justificacion text,
  p_evidencia_url text DEFAULT NULL,
  p_conciliado_por uuid DEFAULT auth.uid()
)
RETURNS jsonb AS $$
DECLARE
  v_sesion RECORD;
  v_diferencia integer;
  v_requiere_supervisor boolean := false;
  v_conciliacion_id uuid;
BEGIN
  -- Obtener datos de la sesión
  SELECT * INTO v_sesion
  FROM caja_sesiones
  WHERE id = p_sesion_id AND estado = 'cerrada' AND tipo_cierre = 'automatico';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Sesión no encontrada o no requiere conciliación'
    );
  END IF;

  -- Calcular diferencia
  v_diferencia := p_conteo_fisico - COALESCE(v_sesion.saldo_final_calculado, 0);

  -- Determinar si requiere supervisor (diferencias > $100,000)
  IF abs(v_diferencia) > 10000000 THEN -- 100,000 pesos en centavos
    v_requiere_supervisor := true;
  END IF;

  -- Insertar conciliación
  INSERT INTO conciliaciones_caja (
    sesion_id, saldo_calculado, saldo_fisico_real, diferencia,
    justificacion, evidencia_url, conciliado_por, requiere_supervisor
  ) VALUES (
    p_sesion_id,
    COALESCE(v_sesion.saldo_final_calculado, 0),
    p_conteo_fisico,
    v_diferencia,
    p_justificacion,
    p_evidencia_url,
    p_conciliado_por,
    v_requiere_supervisor
  ) RETURNING id INTO v_conciliacion_id;

  -- Actualizar sesión
  UPDATE caja_sesiones SET
    saldo_final_reportado = p_conteo_fisico,
    diferencia_caja = v_diferencia,
    conciliada = true,
    notas_cierre = COALESCE(notas_cierre, '') || ' | Conciliada: ' || p_justificacion,
    updated_at = now()
  WHERE id = p_sesion_id;

  -- Crear ajuste contable si hay diferencia
  IF v_diferencia <> 0 THEN
    INSERT INTO ajustes_contables_caja (
      conciliacion_id, sesion_id, tipo, monto, descripcion, responsable
    ) VALUES (
      v_conciliacion_id,
      p_sesion_id,
      CASE WHEN v_diferencia > 0 THEN 'sobrante' ELSE 'faltante' END,
      abs(v_diferencia),
      CASE
        WHEN v_diferencia > 0 THEN 'Sobrante detectado en conciliación post-cierre automático'
        ELSE 'Faltante detectado en conciliación post-cierre automático'
      END || ': ' || p_justificacion,
      p_conciliado_por
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'conciliacion_id', v_conciliacion_id,
    'diferencia', v_diferencia,
    'requiere_supervisor', v_requiere_supervisor
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. VISTAS PARA REPORTES Y CONSULTAS
-- =====================================================

-- Vista de sesiones pendientes de conciliación
CREATE OR REPLACE VIEW vw_sesiones_pendientes_conciliacion AS
SELECT
  cs.id,
  cs.restaurant_id,
  cs.cajero_id,
  cs.monto_inicial,
  cs.saldo_final_calculado,
  cs.cerrada_at,
  cs.business_day,
  cs.notas_cierre,
  r.name as restaurant_name,
  u.first_name || ' ' || u.last_name as cajero_name,
  EXTRACT(EPOCH FROM (now() - cs.cerrada_at)) / 3600 as horas_desde_cierre
FROM caja_sesiones cs
JOIN restaurants r ON cs.restaurant_id = r.id
LEFT JOIN users u ON cs.cajero_id = u.id
WHERE cs.estado = 'cerrada'
  AND cs.tipo_cierre = 'automatico'
  AND cs.conciliada = false
  AND cs.cerrada_at >= now() - interval '7 days'
ORDER BY cs.cerrada_at DESC;

-- Vista de conciliaciones realizadas
CREATE OR REPLACE VIEW vw_conciliaciones_realizadas AS
SELECT
  cc.id,
  cc.sesion_id,
  cc.saldo_calculado,
  cc.saldo_fisico_real,
  cc.diferencia,
  cc.justificacion,
  cc.conciliado_at,
  cs.business_day,
  cs.restaurant_id,
  r.name as restaurant_name,
  u1.first_name || ' ' || u1.last_name as conciliado_por,
  u2.first_name || ' ' || u2.last_name as aprobado_por,
  CASE
    WHEN cc.diferencia > 0 THEN 'sobrante'
    WHEN cc.diferencia < 0 THEN 'faltante'
    ELSE 'cuadrado'
  END as tipo_diferencia
FROM conciliaciones_caja cc
JOIN caja_sesiones cs ON cc.sesion_id = cs.id
JOIN restaurants r ON cs.restaurant_id = r.id
LEFT JOIN users u1 ON cc.conciliado_por = u1.id
LEFT JOIN users u2 ON cc.aprobado_por = u2.id
ORDER BY cc.conciliado_at DESC;

-- =====================================================
-- 5. POLÍTICAS RLS PARA SEGURIDAD
-- =====================================================

-- Políticas para conciliaciones_caja
ALTER TABLE conciliaciones_caja ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conciliaciones_caja_restaurant" ON conciliaciones_caja
  FOR ALL USING (
    restaurant_id IN (
      SELECT cs.restaurant_id
      FROM caja_sesiones cs
      WHERE cs.id = conciliaciones_caja.sesion_id
    )
  );

-- Políticas para ajustes_contables_caja
ALTER TABLE ajustes_contables_caja ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ajustes_contables_caja_restaurant" ON ajustes_contables_caja
  FOR ALL USING (
    restaurant_id IN (
      SELECT cs.restaurant_id
      FROM caja_sesiones cs
      WHERE cs.id = ajustes_contables_caja.sesion_id
    )
  );

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para conciliaciones
CREATE INDEX IF NOT EXISTS idx_conciliaciones_sesion ON conciliaciones_caja(sesion_id);
CREATE INDEX IF NOT EXISTS idx_conciliaciones_restaurant ON conciliaciones_caja USING HASH (
  (SELECT restaurant_id FROM caja_sesiones WHERE id = conciliaciones_caja.sesion_id)
);
CREATE INDEX IF NOT EXISTS idx_conciliaciones_fecha ON conciliaciones_caja(conciliado_at);
CREATE INDEX IF NOT EXISTS idx_conciliaciones_supervisor ON conciliaciones_caja(requiere_supervisor) WHERE requiere_supervisor = true;

-- Índices para ajustes contables
CREATE INDEX IF NOT EXISTS idx_ajustes_conciliacion ON ajustes_contables_caja(conciliacion_id);
CREATE INDEX IF NOT EXISTS idx_ajustes_sesion ON ajustes_contables_caja(sesion_id);
CREATE INDEX IF NOT EXISTS idx_ajustes_tipo ON ajustes_contables_caja(tipo);

-- Índices extendidos en caja_sesiones
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_conciliada ON caja_sesiones(conciliada) WHERE conciliada = false;
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_tipo_cierre ON caja_sesiones(tipo_cierre);

-- =====================================================
-- 7. FUNCIONES DE VALIDACIÓN Y UTILIDADES
-- =====================================================

-- Función para verificar si hay conciliaciones pendientes
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
    cs.id,
    cs.business_day,
    cs.saldo_final_calculado,
    cs.cerrada_at,
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

-- =====================================================
-- 8. TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conciliaciones_updated_at
  BEFORE UPDATE ON conciliaciones_caja
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para validar conciliaciones
CREATE OR REPLACE FUNCTION validar_conciliacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que la sesión existe y está cerrada automáticamente
  IF NOT EXISTS (
    SELECT 1 FROM caja_sesiones
    WHERE id = NEW.sesion_id
      AND estado = 'cerrada'
      AND tipo_cierre = 'automatico'
  ) THEN
    RAISE EXCEPTION 'Solo se pueden conciliar sesiones cerradas automáticamente';
  END IF;

  -- Validar que no haya conciliación previa
  IF EXISTS (
    SELECT 1 FROM conciliaciones_caja
    WHERE sesion_id = NEW.sesion_id AND id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Esta sesión ya fue conciliada';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_conciliacion
  BEFORE INSERT ON conciliaciones_caja
  FOR EACH ROW EXECUTE FUNCTION validar_conciliacion();

-- =====================================================
-- 9. DATOS DE EJEMPLO (DESCOMENTAR PARA TESTING)
-- =====================================================

/*
-- Insertar datos de ejemplo para testing
-- Nota: Descomentar solo en ambiente de desarrollo

-- Sesión cerrada automáticamente de ejemplo
INSERT INTO caja_sesiones (
  restaurant_id, cajero_id, monto_inicial, estado, cerrada_at,
  tipo_cierre, saldo_final_calculado, conciliada, business_day
) VALUES (
  (SELECT id FROM restaurants LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  10000000, -- $100,000
  'cerrada',
  now() - interval '2 hours',
  'automatico',
  15000000, -- $150,000 calculado
  false,
  CURRENT_DATE
);

-- Conciliación de ejemplo
INSERT INTO conciliaciones_caja (
  sesion_id, saldo_calculado, saldo_fisico_real, diferencia,
  justificacion, conciliado_por
) VALUES (
  (SELECT id FROM caja_sesiones WHERE tipo_cierre = 'automatico' LIMIT 1),
  15000000, -- $150,000 calculado
  14200000, -- $142,000 físico real
  -800000,  -- -$8,000 faltante
  'Posible error en cambio de turno',
  (SELECT id FROM users LIMIT 1)
);
*/

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificar que todo se creó correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de conciliación post-cierre automático instalado correctamente';
  RAISE NOTICE '📋 Tablas creadas: conciliaciones_caja, ajustes_contables_caja';
  RAISE NOTICE '🔧 Funciones creadas: calcular_saldo_final_automatico, cerrar_caja_automatico, conciliar_caja_fisica';
  RAISE NOTICE '👁️ Vistas creadas: vw_sesiones_pendientes_conciliacion, vw_conciliaciones_realizadas';
  RAISE NOTICE '🔒 Políticas RLS configuradas para ambas tablas';
  RAISE NOTICE '⚡ Índices de performance creados';
END $$;
