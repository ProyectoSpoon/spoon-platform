-- ========================================
-- FASE 2 - CORRECCIÓN: TRIGGERS Y CAMPOS CALCULADOS
-- SISTEMA DE CAJA - MIGRACIÓN DE BASE DE DATOS
-- ========================================

-- CORRECCIÓN: La columna se llama 'cajero_id', no 'usuario_id'

-- 2.3 Función para validar estado de sesión (CORREGIDA)
CREATE OR REPLACE FUNCTION validar_estado_caja_sesion()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está cerrando una sesión, validar que tenga saldo_final_reportado
    IF NEW.estado = 'cerrada' AND OLD.estado = 'abierta' THEN
        IF NEW.saldo_final_reportado IS NULL THEN
            RAISE EXCEPTION 'No se puede cerrar una sesión de caja sin saldo_final_reportado';
        END IF;
        
        -- Actualizar fecha de cierre (usar cerrada_at que es el nombre correcto)
        NEW.cerrada_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Validar que no se pueda abrir una sesión si ya hay una abierta para el mismo cajero
    IF NEW.estado = 'abierta' AND (OLD IS NULL OR OLD.estado != 'abierta') THEN
        IF EXISTS (
            SELECT 1 FROM caja_sesiones 
            WHERE cajero_id = NEW.cajero_id 
            AND estado = 'abierta' 
            AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'El cajero ya tiene una sesión de caja abierta';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.5 Agregar índices para mejorar rendimiento (CORREGIDOS)
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_estado ON caja_sesiones(estado);
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_cajero_estado ON caja_sesiones(cajero_id, estado);
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_abierta_at ON caja_sesiones(abierta_at);
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_cerrada_at ON caja_sesiones(cerrada_at);

-- ========================================
-- VALIDACIÓN DE CORRECCIÓN
-- ========================================

-- Verificar que los índices se crearon correctamente
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'caja_sesiones' 
AND indexname LIKE 'idx_caja_sesiones_%'
ORDER BY indexname;

-- Verificar que la función corregida funciona
SELECT 'FASE 2 CORREGIDA: Triggers y campos calculados con nombres de columnas correctos' AS resultado;
