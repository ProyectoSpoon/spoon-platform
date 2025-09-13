-- ========================================
-- CORREGIR DEPARTAMENTO BOGOTÁ D.C.
-- Agregar el departamento faltante
-- ========================================

-- 1. VERIFICAR SI BOGOTÁ ESTÁ COMO DISTRITO ESPECIAL
SELECT 
    c.id,
    c.name as country,
    c.code as country_code
FROM countries c 
WHERE c.iso_code = 'CO';

-- 2. INSERTAR BOGOTÁ D.C. COMO DEPARTAMENTO
DO $$
DECLARE
    colombia_id UUID;
BEGIN
    -- Obtener ID de Colombia
    SELECT id INTO colombia_id FROM countries WHERE iso_code = 'CO';
    
    IF colombia_id IS NOT NULL THEN
        -- Verificar si ya existe un departamento con código '11'
        IF NOT EXISTS (SELECT 1 FROM departments WHERE code = '11') THEN
            -- Insertar Bogotá D.C. como departamento
            INSERT INTO departments (id, name, code, country_id, is_active)
            VALUES (
                gen_random_uuid(),
                'Bogotá D.C.',
                '11',
                colombia_id,
                true
            );
            
            RAISE NOTICE 'Departamento Bogotá D.C. insertado con código 11';
        ELSE
            RAISE NOTICE 'Departamento con código 11 ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'ERROR: No se encontró Colombia';
    END IF;
END $$;

-- 3. VERIFICAR INSERCIÓN
SELECT 
    code,
    name,
    id
FROM departments 
WHERE code = '11';

-- 4. PRUEBA DE INSERCIÓN DE MUNICIPIO
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento de Bogotá D.C.
    SELECT id INTO dept_id FROM departments WHERE code = '11';
    
    IF dept_id IS NOT NULL THEN
        RAISE NOTICE 'Departamento Bogotá D.C. encontrado con ID: %', dept_id;
        
        -- Intentar insertar Bogotá como municipio
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOGOTÁ D.C.',
            dept_id,
            4.649251,
            -74.106992,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;
        
        RAISE NOTICE 'Bogotá D.C. insertada como ciudad capital';
    ELSE
        RAISE NOTICE 'ERROR: No se encontró departamento Bogotá D.C.';
    END IF;
END $$;
