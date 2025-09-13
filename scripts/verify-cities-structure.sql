-- ========================================
-- VERIFICAR ESTRUCTURA DE TABLA CITIES
-- Antes de importar municipios
-- ========================================

-- 1. ESTRUCTURA DE LA TABLA CITIES
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cities'
ORDER BY ordinal_position;

-- 2. CONSTRAINTS DE LA TABLA CITIES
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'cities';

-- 3. VERIFICAR SI EXISTEN MUNICIPIOS
SELECT 
    COUNT(*) as total_cities
FROM cities;

-- 4. VERIFICAR ALGUNAS CIUDADES DE MUESTRA
SELECT 
    c.name as city,
    d.name as department,
    co.name as country
FROM cities c
JOIN departments d ON c.department_id = d.id
JOIN countries co ON d.country_id = co.id
LIMIT 10;
