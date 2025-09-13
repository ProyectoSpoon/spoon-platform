-- ========================================
-- FASE 2: TRIGGERS Y CAMPOS CALCULADOS
-- SISTEMA DE CAJA - MIGRACIÓN DE BASE DE DATOS
-- ========================================

-- 2.1 Función para calcular diferencia automáticamente
CREATE OR REPLACE FUNCTION calcular_diferencia_caja()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo calcular si ambos valores están presentes
    IF NEW.saldo_final_calculado IS NOT NULL AND NEW.saldo_final_reportado IS NOT NULL THEN
        NEW.diferencia_caja = NEW.saldo_final_reportado - NEW.saldo_final_calculado;
    ELSE
        NEW.diferencia_caja = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.2 Trigger para actualizar diferencia automáticamente
DROP TRIGGER IF EXISTS trigger_calcular_diferencia_caja ON caja_sesiones;
CREATE TRIGGER trigger_calcular_diferencia_caja
    BEFORE INSERT OR UPDATE ON caja_sesiones
    FOR EACH ROW
    EXECUTE FUNCTION calcular_diferencia_caja();

-- 2.3 Función para validar estado de sesión
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

-- 2.4 Trigger para validar estado de sesión
DROP TRIGGER IF EXISTS trigger_validar_estado_caja ON caja_sesiones;
CREATE TRIGGER trigger_validar_estado_caja
    BEFORE INSERT OR UPDATE ON caja_sesiones
    FOR EACH ROW
    EXECUTE FUNCTION validar_estado_caja_sesion();

-- 2.5 Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_estado ON caja_sesiones(estado);
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_cajero_estado ON caja_sesiones(cajero_id, estado);
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_abierta_at ON caja_sesiones(abierta_at);
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_cerrada_at ON caja_sesiones(cerrada_at);

-- 2.6 Comentarios en columnas para documentación
COMMENT ON COLUMN caja_sesiones.saldo_final_reportado IS 'Saldo final reportado por el cajero al cerrar la sesión (en centavos)';
COMMENT ON COLUMN caja_sesiones.diferencia_caja IS 'Diferencia entre saldo reportado y calculado (reportado - calculado) en centavos';

-- ========================================
-- VALIDACIÓN DE FASE 2
-- ========================================

-- Verificar que las funciones se crearon correctamente
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname IN ('calcular_diferencia_caja', 'validar_estado_caja_sesion');

-- Verificar que los triggers se crearon correctamente
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgtype,
    tgenabled
FROM pg_trigger 
WHERE tgname IN ('trigger_calcular_diferencia_caja', 'trigger_validar_estado_caja');

-- Verificar que los índices se crearon correctamente
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'caja_sesiones' 
AND indexname LIKE 'idx_caja_sesiones_%';

-- Mensaje de confirmación
SELECT 'FASE 2 COMPLETADA: Triggers y campos calculados implementados correctamente' AS resultado;
