-- ========================================
-- VER CÓDIGO DE LA FUNCIÓN TRIGGER
-- ========================================

-- Ver el código completo de la función handle_new_user_app
SELECT 
    p.proname as function_name,
    p.prosrc as function_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user_app'
AND n.nspname = 'public';

-- Ver los parámetros que espera la función
SELECT 
    p.proname,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user_app'
AND n.nspname = 'public';
