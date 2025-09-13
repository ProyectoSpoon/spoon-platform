-- ========================================
-- COMPLETAR LIMPIEZA DE DEPARTAMENTOS
-- Finalizar el proceso de limpieza iniciado
-- ========================================

-- 1. VERIFICAR ESTADO ACTUAL
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
    'Restaurants con department_id' as tabla,
    COUNT(*) as registros
FROM restaurants 
WHERE department_id IS NOT NULL;

-- 2. DESVINCULAR RESTAURANTES DE DEPARTAMENTOS
UPDATE restaurants 
SET department_id = NULL 
WHERE department_id IS NOT NULL;

-- 3. AHORA ELIMINAR DEPARTAMENTOS
DELETE FROM departments;

-- 4. VERIFICAR LIMPIEZA FINAL
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
    'Restaurants totalmente desvinculados' as tabla,
    COUNT(*) as registros
FROM restaurants 
WHERE city_id IS NULL AND department_id IS NULL;

-- 5. VERIFICAR COLOMBIA
SELECT 
    id,
    name,
    code,
    iso_code
FROM countries 
WHERE iso_code = 'CO';

SELECT 'Limpieza COMPLETADA - Listo para reimportar' as resultado;
