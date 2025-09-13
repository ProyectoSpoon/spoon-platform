-- ========================================
-- SOLUCIÓN TEMPORAL: DESACTIVAR TRIGGER
-- ========================================

-- 1. Desactivar el trigger problemático
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created_app;

-- 2. Verificar que el trigger está desactivado
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    trigger_schema,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_app';

-- 3. Para reactivar después de corregir la función:
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created_app;
