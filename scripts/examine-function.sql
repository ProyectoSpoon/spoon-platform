-- ========================================
-- EXAMINAR FUNCIÓN PROBLEMÁTICA
-- ========================================

-- Ver el código de la función handle_new_user_app
SELECT 
    p.proname as function_name,
    p.prosrc as function_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user_app'
AND n.nspname = 'public';

-- Verificar parámetros de la función
SELECT 
    p.proname,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user_app'
AND n.nspname = 'public';
