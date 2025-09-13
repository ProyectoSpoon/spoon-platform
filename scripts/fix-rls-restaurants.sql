-- ========================================
-- DIAGNÓSTICO Y CORRECCIÓN DE POLÍTICAS RLS PARA RESTAURANTS
-- ========================================

-- 1. VERIFICAR POLÍTICAS EXISTENTES
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'restaurants';

-- 2. VERIFICAR SI RLS ESTÁ HABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'restaurants';

-- 3. VERIFICAR ESTRUCTURA DE LA TABLA
\d restaurants;

-- ========================================
-- CORRECCIÓN DE POLÍTICAS RLS
-- ========================================

-- Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view their own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can create their own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can manage their restaurant" ON restaurants;

-- Habilitar RLS si no está habilitado
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Permitir que los usuarios vean su propio restaurante
CREATE POLICY "Restaurant owners can view their restaurant" ON restaurants
    FOR SELECT 
    USING (owner_id = auth.uid());

-- POLÍTICA 2: Permitir que los usuarios creen su restaurante
CREATE POLICY "Restaurant owners can create their restaurant" ON restaurants
    FOR INSERT 
    WITH CHECK (owner_id = auth.uid());

-- POLÍTICA 3: Permitir que los usuarios actualicen su restaurante
CREATE POLICY "Restaurant owners can update their restaurant" ON restaurants
    FOR UPDATE 
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- POLÍTICA 4: Permitir que los usuarios eliminen su restaurante (opcional)
CREATE POLICY "Restaurant owners can delete their restaurant" ON restaurants
    FOR DELETE 
    USING (owner_id = auth.uid());

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

-- Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'restaurants'
ORDER BY policyname;

-- Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'restaurants';
