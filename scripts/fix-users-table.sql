-- ========================================
-- CORRECCIÓN DE LA TABLA USERS
-- Ejecutar en el editor SQL de Supabase
-- ========================================

-- 1. Verificar la estructura actual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name = 'id';

-- 2. Verificar si existe la foreign key constraint
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
AND contype = 'f';

-- 3. CORREGIR: Eliminar el default y agregar foreign key
-- CUIDADO: Solo ejecutar si no existe la foreign key

-- Eliminar el default gen_random_uuid() del campo id
ALTER TABLE public.users 
ALTER COLUMN id DROP DEFAULT;

-- Agregar foreign key constraint a auth.users
ALTER TABLE public.users 
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 4. Verificar que la corrección funcionó
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
AND contype = 'f';

-- 5. Verificar políticas RLS (deben permitir INSERT durante signup)
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users'
AND cmd = 'INSERT';
