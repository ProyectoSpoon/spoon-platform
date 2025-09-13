-- ========================================
-- DIAGNÓSTICO DE TRIGGERS Y FUNCTIONS (SIMPLIFICADO)
-- Ejecutar en el editor SQL de Supabase
-- ========================================

-- 1. Verificar triggers en auth.users que puedan estar causando el error
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 2. Verificar triggers en public.users
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'public';

-- 3. Verificar funciones que puedan ejecutarse automáticamente
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name ILIKE '%user%';

-- 4. Verificar triggers en auth.users (método directo)
SELECT 
    n.nspname as schemaname,
    c.relname as tablename,
    t.tgname as trigname,
    t.tgfoid::regproc as trigger_function
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users'
AND NOT t.tgisinternal;

-- 5. Verificar políticas en public.users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 6. Verificar funciones de trigger relacionadas con usuarios
SELECT 
    p.proname as function_name,
    n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth')
AND p.proname ILIKE '%user%'
AND p.prokind = 'f';

-- 7. Verificar si existe alguna función handle_new_user (común en Supabase)
SELECT 
    p.proname as function_name,
    n.nspname as schema_name,
    'Esta función puede estar causando el error' as note
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('handle_new_user', 'create_user_profile', 'new_user_signup');

-- NOTA: Para configurar auto-confirmación, ve a:
-- Supabase Dashboard → Authentication → Settings → Email Auth
-- Desactiva "Confirm email" o activa "Autoconfirm users"
