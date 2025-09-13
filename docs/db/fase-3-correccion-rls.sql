-- ========================================
-- FASE 3 - CORRECCIÓN: POLÍTICAS RLS
-- SISTEMA DE CAJA - MIGRACIÓN DE BASE DE DATOS
-- ========================================

-- CORRECCIÓN: Usar la tabla 'users' en lugar de 'user_restaurants'
-- Basado en las políticas existentes que ya funcionan

-- 3.4 Políticas RLS para caja_sesiones (CORREGIDAS)

-- Eliminar políticas incorrectas que fallan
DROP POLICY IF EXISTS "Users can insert caja_sesiones in their restaurant" ON caja_sesiones;
DROP POLICY IF EXISTS "Cajeros can update their own active sessions" ON caja_sesiones;
DROP POLICY IF EXISTS "Only admins can delete caja_sesiones" ON caja_sesiones;

-- Política para inserción: solo usuarios autenticados pueden crear sesiones en su restaurante
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
-- (Esta política ya existe y funciona, pero la recreamos por consistencia)
DROP POLICY IF EXISTS "Users can update their restaurant caja sesiones" ON caja_sesiones;
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
-- Nota: Asumiendo que hay un campo 'role' en users o una tabla roles separada
CREATE POLICY "Only admins can delete caja_sesiones" 
ON caja_sesiones FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.restaurant_id = caja_sesiones.restaurant_id
        -- Ajustar según la estructura real de roles en tu sistema
        AND (u.role = 'admin' OR u.role = 'owner')
    )
);

-- 3.5 Políticas RLS para tabla de auditoría (CORREGIDAS)

-- Eliminar política incorrecta
DROP POLICY IF EXISTS "Only admins can view audit_caja_sesiones" ON audit_caja_sesiones;

-- Solo administradores pueden ver la auditoría
CREATE POLICY "Only admins can view audit_caja_sesiones" 
ON audit_caja_sesiones FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.restaurant_id = audit_caja_sesiones.restaurant_id
        -- Ajustar según la estructura real de roles en tu sistema
        AND (u.role = 'admin' OR u.role = 'owner')
    )
);

-- 3.7 Función helper para consultar historial (CORREGIDA)
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
-- VALIDACIÓN DE CORRECCIÓN
-- ========================================

-- Verificar que las políticas corregidas se crearon
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('caja_sesiones', 'audit_caja_sesiones')
AND policyname IN (
    'Users can insert caja_sesiones in their restaurant',
    'Cajeros can update their own active sessions', 
    'Only admins can delete caja_sesiones',
    'Only admins can view audit_caja_sesiones'
)
ORDER BY tablename, policyname;

-- Verificar estructura de la tabla users para validar campos disponibles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'restaurant_id', 'role')
ORDER BY column_name;

-- Mensaje de confirmación
SELECT 'FASE 3 CORREGIDA: Políticas RLS ajustadas a la estructura real de la base de datos' AS resultado;
