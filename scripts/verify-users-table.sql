-- ========================================
-- SCRIPT DE VERIFICACIÓN DE TABLA USERS
-- Ejecutar en el editor SQL de Supabase
-- ========================================

-- 1. Verificar si la tabla 'users' existe
SELECT 
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 2. Si existe, mostrar estructura de columnas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS en la tabla users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- 4. Listar todas las tablas del esquema public
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 5. Verificar usuarios en auth.users (solo si tienes permisos)
-- NOTA: Esto puede fallar si no tienes permisos de administrador
SELECT 
    COUNT(*) as total_users_auth
FROM auth.users;

-- 6. Crear tabla users si no existe (OPCIONAL)
-- DESCOMENTA SOLO SI QUIERES CREARLA
/*
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'restaurant_owner',
    restaurant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política básica: los usuarios solo pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Política para inserción (solo durante registro)
CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);
*/
