-- ========================================
-- FORMATEAR TABLAS GEOGRÁFICAS SEGURO
-- Limpiar con manejo de foreign keys
-- ========================================

-- 1. VERIFICAR REFERENCIAS EXISTENTES
SELECT 
    'Restaurants con city_id' as descripcion,
    COUNT(*) as cantidad
FROM restaurants 
WHERE city_id IS NOT NULL
UNION ALL
SELECT 
    'Restaurants con department_id' as descripcion,
    COUNT(*) as cantidad
FROM restaurants 
WHERE department_id IS NOT NULL;

-- 2. DESVINCULAR RESTAURANTES COMPLETAMENTE
UPDATE restaurants 
SET city_id = NULL, department_id = NULL
WHERE city_id IS NOT NULL OR department_id IS NOT NULL;

-- 3. AHORA SÍ ELIMINAR CIUDADES
DELETE FROM cities;

-- 4. ELIMINAR DEPARTAMENTOS
DELETE FROM departments;

-- 5. VERIFICAR LIMPIEZA
SELECT 
    'Cities' as tabla,
    COUNT(*) as registros
FROM cities
UNION ALL
SELECT 
    'Departments' as tabla,
    COUNT(*) as registros
FROM departments
UNION ALL
SELECT 
    'Restaurants sin vínculos geográficos' as tabla,
    COUNT(*) as registros
FROM restaurants 
WHERE city_id IS NULL AND department_id IS NULL;

-- 6. VERIFICAR QUE COLOMBIA SIGUE EXISTIENDO
SELECT 
    id,
    name,
    code,
    iso_code
FROM countries 
WHERE iso_code = 'CO';

SELECT 'Limpieza completada de forma segura' as resultado;
