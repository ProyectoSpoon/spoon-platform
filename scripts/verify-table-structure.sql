-- ========================================
-- VERIFICAR ESTRUCTURA DE TABLAS GEOGRÁFICAS
-- Antes de ejecutar import-colombia-geography.sql
-- ========================================

-- 1. ESTRUCTURA COMPLETA DE COUNTRIES
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'countries'
ORDER BY ordinal_position;

-- 2. CONSTRAINTS DE COUNTRIES
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'countries';

-- 3. ESTRUCTURA COMPLETA DE DEPARTMENTS
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'departments'
ORDER BY ordinal_position;

-- 4. CONSTRAINTS DE DEPARTMENTS
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'departments';

-- 5. DATOS EXISTENTES EN COUNTRIES
SELECT 
    COUNT(*) as total_countries,
    COUNT(CASE WHEN code = 'CO' THEN 1 END) as colombia_by_code,
    COUNT(CASE WHEN iso_code = 'CO' THEN 1 END) as colombia_by_iso
FROM countries;

-- 6. DATOS EXISTENTES EN DEPARTMENTS  
SELECT 
    COUNT(*) as total_departments,
    COUNT(CASE WHEN country_id IS NOT NULL THEN 1 END) as with_country
FROM departments;

-- 7. FOREIGN KEYS
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('countries', 'departments');
