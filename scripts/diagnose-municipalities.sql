-- ========================================
-- DIAGNÓSTICO IMPORTACIÓN MUNICIPIOS
-- Verificar por qué no se insertaron
-- ========================================

-- 1. VERIFICAR CÓDIGOS DE DEPARTAMENTOS EN BD
SELECT 
    code,
    name,
    id
FROM departments 
ORDER BY code;

-- 2. VERIFICAR SI CÓDIGO '11' EXISTE (BOGOTÁ)
SELECT 
    COUNT(*) as bogota_exists,
    MAX(name) as nombre_departamento
FROM departments 
WHERE code = '11';

-- 3. VERIFICAR ALGUNOS CÓDIGOS ESPECÍFICOS
SELECT 
    code,
    name
FROM departments 
WHERE code IN ('05', '08', '11', '13', '15')
ORDER BY code;

-- 4. VERIFICAR SI HAY ALGÚN MUNICIPIO YA INSERTADO
SELECT 
    COUNT(*) as total_cities,
    COUNT(CASE WHEN c.name LIKE '%BOGOTÁ%' THEN 1 END) as bogota_cities,
    COUNT(CASE WHEN c.name LIKE '%MEDELLÍN%' THEN 1 END) as medellin_cities
FROM cities c;

-- 5. PRUEBA MANUAL DE INSERCIÓN (UN SOLO MUNICIPIO)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento de Bogotá
    SELECT id INTO dept_id FROM departments WHERE code = '11';
    
    IF dept_id IS NOT NULL THEN
        RAISE NOTICE 'Departamento Bogotá encontrado con ID: %', dept_id;
        
        -- Intentar insertar un municipio de prueba
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PRUEBA BOGOTÁ',
            dept_id,
            4.649251,
            -74.106992,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;
        
        RAISE NOTICE 'Municipio de prueba insertado';
    ELSE
        RAISE NOTICE 'ERROR: No se encontró departamento con código 11';
    END IF;
END $$;
