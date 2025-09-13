-- ========================================
-- FASE 3: AUDITORÍA Y SEGURIDAD
-- SISTEMA DE CAJA - MIGRACIÓN DE BASE DE DATOS
-- ========================================

-- 3.1 Crear tabla de auditoría para caja_sesiones
CREATE TABLE IF NOT EXISTS audit_caja_sesiones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_type VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name VARCHAR(50) NOT NULL DEFAULT 'caja_sesiones',
    record_id UUID NOT NULL, -- ID del registro original
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[], -- Array de campos que cambiaron
    user_id UUID,
    session_info JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    restaurant_id UUID -- Para filtrado por restaurante
);

-- 3.2 Función de auditoría para caja_sesiones
CREATE OR REPLACE FUNCTION audit_caja_sesiones_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_record JSONB;
    new_record JSONB;
    changed_fields TEXT[] := '{}';
    field_name TEXT;
BEGIN
    -- Obtener información del usuario actual (desde contexto de Supabase)
    DECLARE
        current_user_id UUID;
        current_session JSONB;
    BEGIN
        current_user_id := (current_setting('request.jwt.claims', true)::JSONB ->> 'sub')::UUID;
        current_session := current_setting('request.jwt.claims', true)::JSONB;
    EXCEPTION
        WHEN OTHERS THEN
            current_user_id := NULL;
            current_session := NULL;
    END;

    -- Procesar según el tipo de operación
    IF TG_OP = 'DELETE' THEN
        old_record := to_jsonb(OLD);
        
        INSERT INTO audit_caja_sesiones (
            operation_type,
            record_id,
            old_values,
            new_values,
            user_id,
            session_info,
            restaurant_id
        ) VALUES (
            'DELETE',
            OLD.id,
            old_record,
            NULL,
            current_user_id,
            current_session,
            OLD.restaurant_id
        );
        
        RETURN OLD;
        
    ELSIF TG_OP = 'UPDATE' THEN
        old_record := to_jsonb(OLD);
        new_record := to_jsonb(NEW);
        
        -- Identificar campos que cambiaron
        FOR field_name IN 
            SELECT key FROM jsonb_each(old_record)
            UNION
            SELECT key FROM jsonb_each(new_record)
        LOOP
            IF old_record->>field_name IS DISTINCT FROM new_record->>field_name THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
        
        -- Solo auditar si hubo cambios
        IF array_length(changed_fields, 1) > 0 THEN
            INSERT INTO audit_caja_sesiones (
                operation_type,
                record_id,
                old_values,
                new_values,
                changed_fields,
                user_id,
                session_info,
                restaurant_id
            ) VALUES (
                'UPDATE',
                NEW.id,
                old_record,
                new_record,
                changed_fields,
                current_user_id,
                current_session,
                NEW.restaurant_id
            );
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'INSERT' THEN
        new_record := to_jsonb(NEW);
        
        INSERT INTO audit_caja_sesiones (
            operation_type,
            record_id,
            old_values,
            new_values,
            user_id,
            session_info,
            restaurant_id
        ) VALUES (
            'INSERT',
            NEW.id,
            NULL,
            new_record,
            current_user_id,
            current_session,
            NEW.restaurant_id
        );
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.3 Trigger de auditoría
DROP TRIGGER IF EXISTS trigger_audit_caja_sesiones ON caja_sesiones;
CREATE TRIGGER trigger_audit_caja_sesiones
    AFTER INSERT OR UPDATE OR DELETE ON caja_sesiones
    FOR EACH ROW
    EXECUTE FUNCTION audit_caja_sesiones_changes();

-- 3.4 Políticas RLS para caja_sesiones (si no existen)
-- Habilitar RLS en caja_sesiones
ALTER TABLE caja_sesiones ENABLE ROW LEVEL SECURITY;

-- Política para lectura: usuarios solo pueden ver sesiones de su restaurante
DROP POLICY IF EXISTS "Users can view caja_sesiones from their restaurant" ON caja_sesiones;
CREATE POLICY "Users can view caja_sesiones from their restaurant" 
ON caja_sesiones FOR SELECT 
USING (
    restaurant_id IN (
        SELECT ur.restaurant_id 
        FROM user_restaurants ur 
        WHERE ur.user_id = auth.uid()
    )
);

-- Política para inserción: solo usuarios autenticados pueden crear sesiones en su restaurante
DROP POLICY IF EXISTS "Users can insert caja_sesiones in their restaurant" ON caja_sesiones;
CREATE POLICY "Users can insert caja_sesiones in their restaurant" 
ON caja_sesiones FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL AND
    restaurant_id IN (
        SELECT u.restaurant_id 
        FROM users u 
        WHERE u.id = auth.uid()
    )
);

-- Política para actualización: solo el cajero puede actualizar su sesión activa
DROP POLICY IF EXISTS "Cajeros can update their own active sessions" ON caja_sesiones;
CREATE POLICY "Cajeros can update their own active sessions" 
ON caja_sesiones FOR UPDATE 
USING (
    cajero_id = auth.uid() AND
    restaurant_id IN (
        SELECT u.restaurant_id 
        FROM users u 
        WHERE u.id = auth.uid()
    )
);

-- Política para eliminación: solo administradores pueden eliminar sesiones
DROP POLICY IF EXISTS "Only admins can delete caja_sesiones" ON caja_sesiones;
CREATE POLICY "Only admins can delete caja_sesiones" 
ON caja_sesiones FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.restaurant_id = caja_sesiones.restaurant_id
        AND (u.role = 'admin' OR u.role = 'owner')
    )
);

-- 3.5 Políticas RLS para tabla de auditoría
ALTER TABLE audit_caja_sesiones ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden ver la auditoría
DROP POLICY IF EXISTS "Only admins can view audit_caja_sesiones" ON audit_caja_sesiones;
CREATE POLICY "Only admins can view audit_caja_sesiones" 
ON audit_caja_sesiones FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.restaurant_id = audit_caja_sesiones.restaurant_id
        AND (u.role = 'admin' OR u.role = 'owner')
    )
);

-- La inserción en auditoría es solo por triggers (SECURITY DEFINER)
DROP POLICY IF EXISTS "System can insert audit records" ON audit_caja_sesiones;
CREATE POLICY "System can insert audit records" 
ON audit_caja_sesiones FOR INSERT 
WITH CHECK (true); -- El trigger maneja la seguridad

-- 3.6 Índices para optimizar consultas de auditoría
CREATE INDEX IF NOT EXISTS idx_audit_caja_sesiones_record_id ON audit_caja_sesiones(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_caja_sesiones_operation_type ON audit_caja_sesiones(operation_type);
CREATE INDEX IF NOT EXISTS idx_audit_caja_sesiones_created_at ON audit_caja_sesiones(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_caja_sesiones_restaurant_id ON audit_caja_sesiones(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_caja_sesiones_user_id ON audit_caja_sesiones(user_id);

-- 3.7 Función helper para consultar historial de una sesión
CREATE OR REPLACE FUNCTION get_caja_sesion_history(sesion_id UUID)
RETURNS TABLE (
    operation_type VARCHAR,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que el usuario tiene acceso a esta sesión
    IF NOT EXISTS (
        SELECT 1 FROM caja_sesiones cs
        JOIN users u ON u.restaurant_id = cs.restaurant_id
        WHERE cs.id = sesion_id 
        AND u.id = auth.uid()
        AND (u.role = 'admin' OR u.role = 'owner')
    ) THEN
        RAISE EXCEPTION 'No tienes permisos para ver el historial de esta sesión';
    END IF;
    
    RETURN QUERY
    SELECT 
        acs.operation_type,
        acs.old_values,
        acs.new_values,
        acs.changed_fields,
        acs.user_id,
        acs.created_at
    FROM audit_caja_sesiones acs
    WHERE acs.record_id = sesion_id
    ORDER BY acs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VALIDACIÓN DE FASE 3
-- ========================================

-- Verificar que la tabla de auditoría se creó
SELECT 
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'audit_caja_sesiones';

-- Verificar que las políticas RLS se crearon
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('caja_sesiones', 'audit_caja_sesiones')
ORDER BY tablename, policyname;

-- Verificar que los triggers se crearon
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgtype,
    tgenabled
FROM pg_trigger 
WHERE tgname = 'trigger_audit_caja_sesiones';

-- Verificar que los índices de auditoría se crearon
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'audit_caja_sesiones'
ORDER BY indexname;

-- Mensaje de confirmación
SELECT 'FASE 3 COMPLETADA: Auditoría y seguridad implementadas correctamente' AS resultado;
