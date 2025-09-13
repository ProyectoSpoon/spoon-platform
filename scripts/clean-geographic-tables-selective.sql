-- ========================================
-- ALTERNATIVA: LIMPIEZA SELECTIVA
-- Solo eliminar ciudades que NO tienen restaurantes
-- ========================================

-- 1. VERIFICAR SITUACIÓN ACTUAL
SELECT 
    'Total cities' as tipo,
    COUNT(*) as cantidad
FROM cities
UNION ALL
SELECT 
    'Cities con restaurantes' as tipo,
    COUNT(DISTINCT c.id) as cantidad
FROM cities c
INNER JOIN restaurants r ON r.city_id = c.id
UNION ALL
SELECT 
    'Cities sin restaurantes' as tipo,
    COUNT(*) as cantidad
FROM cities c
LEFT JOIN restaurants r ON r.city_id = c.id
WHERE r.city_id IS NULL;

-- 2. ELIMINAR SOLO CIUDADES SIN RESTAURANTES
DELETE FROM cities 
WHERE id NOT IN (
    SELECT DISTINCT city_id 
    FROM restaurants 
    WHERE city_id IS NOT NULL
);

-- 3. ELIMINAR DEPARTAMENTOS SIN CIUDADES
DELETE FROM departments 
WHERE id NOT IN (
    SELECT DISTINCT department_id 
    FROM cities 
    WHERE department_id IS NOT NULL
);

-- 4. VERIFICAR RESULTADO
SELECT 
    'Cities restantes' as tabla,
    COUNT(*) as registros
FROM cities
UNION ALL
SELECT 
    'Departments restantes' as tabla,
    COUNT(*) as registros
FROM departments;

SELECT 'Limpieza selectiva completada' as resultado;
