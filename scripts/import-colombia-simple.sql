-- ========================================
-- IMPORTACIÓN SIMPLIFICADA DE COLOMBIA
-- Sin bloques DO complejos
-- ========================================

-- 1. VERIFICAR COLOMBIA EXISTENTE
SELECT 
    id,
    name,
    code,
    iso_code
FROM countries 
WHERE iso_code = 'CO';

-- 2. CREAR COLOMBIA SI NO EXISTE (ejecutar solo si la consulta anterior está vacía)
-- DESCOMENTAR LA SIGUIENTE LÍNEA SI COLOMBIA NO EXISTE:
-- INSERT INTO countries (id, name, code, iso_code, phone_code, is_active) 
-- VALUES (gen_random_uuid(), 'Colombia', 'COL', 'CO', '+57', true);

-- 3. VERIFICAR DEPARTAMENTOS EXISTENTES
SELECT 
    COUNT(*) as departamentos_existentes
FROM departments d
JOIN countries c ON d.country_id = c.id
WHERE c.iso_code = 'CO';

-- 4. MOSTRAR DEPARTAMENTOS EXISTENTES (si los hay)
SELECT 
    d.code,
    d.name,
    c.name as country
FROM departments d
JOIN countries c ON d.country_id = c.id
WHERE c.iso_code = 'CO'
ORDER BY d.code;
