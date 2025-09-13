-- ========================================
-- IMPORTACIÓN DE DATOS GEOGRÁFICOS DE COLOMBIA
-- Departamentos y Municipios con coordenadas
-- ========================================

-- 1. VERIFICAR SI COLOMBIA YA EXISTE Y OBTENER SU ID
DO $$
DECLARE
    colombia_id UUID;
    colombia_exists INTEGER;
    departments_exist INTEGER;
BEGIN
    -- Verificar si Colombia ya existe (por iso_code) y obtener su ID
    SELECT COUNT(*) INTO colombia_exists FROM countries WHERE iso_code = 'CO';
    
    IF colombia_exists = 0 THEN
        -- Crear Colombia si no existe
        INSERT INTO countries (id, name, code, iso_code, phone_code, is_active) 
        VALUES (
          gen_random_uuid(),
          'Colombia',
          'CO',
          'CO',
          '+57',
          true
        );
        
        -- Obtener el ID recién creado
        SELECT id INTO colombia_id FROM countries WHERE iso_code = 'CO';
        RAISE NOTICE 'Colombia creado con ID: %', colombia_id;
    ELSE
        -- Obtener el ID del país existente
        SELECT id INTO colombia_id FROM countries WHERE iso_code = 'CO' LIMIT 1;
        RAISE NOTICE 'Colombia ya existe con ID: %', colombia_id;
    END IF;
    
    -- Verificar si ya existen departamentos colombianos
    SELECT COUNT(*) INTO departments_exist 
    FROM departments WHERE country_id = colombia_id;
    
    IF departments_exist > 0 THEN
        RAISE NOTICE 'Ya existen % departamentos para Colombia', departments_exist;
        RAISE NOTICE 'Saltando inserción de departamentos para evitar duplicados';
    ELSE
        RAISE NOTICE 'Insertando departamentos de Colombia...';
        
        -- INSERTAR DEPARTAMENTOS ÚNICOS
        INSERT INTO departments (id, name, code, country_id, is_active) VALUES
        (gen_random_uuid(), 'ANTIOQUIA', '05', colombia_id, true),
        (gen_random_uuid(), 'ATLÁNTICO', '08', colombia_id, true),
        (gen_random_uuid(), 'BOGOTÁ D.C.', '11', colombia_id, true),
        (gen_random_uuid(), 'BOLÍVAR', '13', colombia_id, true),
        (gen_random_uuid(), 'BOYACÁ', '15', colombia_id, true),
        (gen_random_uuid(), 'CALDAS', '17', colombia_id, true),
        (gen_random_uuid(), 'CAQUETÁ', '18', colombia_id, true),
        (gen_random_uuid(), 'CAUCA', '19', colombia_id, true),
        (gen_random_uuid(), 'CESAR', '20', colombia_id, true),
        (gen_random_uuid(), 'CHOCÓ', '27', colombia_id, true),
        (gen_random_uuid(), 'CÓRDOBA', '23', colombia_id, true),
        (gen_random_uuid(), 'CUNDINAMARCA', '25', colombia_id, true),
        (gen_random_uuid(), 'HUILA', '41', colombia_id, true),
        (gen_random_uuid(), 'LA GUAJIRA', '44', colombia_id, true),
        (gen_random_uuid(), 'MAGDALENA', '47', colombia_id, true),
        (gen_random_uuid(), 'META', '50', colombia_id, true),
        (gen_random_uuid(), 'NARIÑO', '52', colombia_id, true),
        (gen_random_uuid(), 'NORTE DE SANTANDER', '54', colombia_id, true),
        (gen_random_uuid(), 'QUINDÍO', '63', colombia_id, true),
        (gen_random_uuid(), 'RISARALDA', '66', colombia_id, true),
        (gen_random_uuid(), 'SANTANDER', '68', colombia_id, true),
        (gen_random_uuid(), 'SUCRE', '70', colombia_id, true),
        (gen_random_uuid(), 'TOLIMA', '73', colombia_id, true),
        (gen_random_uuid(), 'VALLE DEL CAUCA', '76', colombia_id, true),
        (gen_random_uuid(), 'ARAUCA', '81', colombia_id, true),
        (gen_random_uuid(), 'CASANARE', '85', colombia_id, true),
        (gen_random_uuid(), 'PUTUMAYO', '86', colombia_id, true),
        (gen_random_uuid(), 'AMAZONAS', '91', colombia_id, true),
        (gen_random_uuid(), 'GUAINÍA', '94', colombia_id, true),
        (gen_random_uuid(), 'GUAVIARE', '95', colombia_id, true),
        (gen_random_uuid(), 'VAUPÉS', '97', colombia_id, true),
        (gen_random_uuid(), 'VICHADA', '99', colombia_id, true);
        
        RAISE NOTICE 'Departamentos insertados exitosamente';
    END IF;
    
END $$;

-- 3. VERIFICAR INSERCIÓN
SELECT 
    'Countries' as table_name,
    COUNT(*) as count
FROM countries 
WHERE iso_code = 'CO'
UNION ALL
SELECT 
    'Departments' as table_name,
    COUNT(*) as count
FROM departments d
JOIN countries c ON d.country_id = c.id
WHERE c.iso_code = 'CO';

-- 4. MOSTRAR DEPARTAMENTOS INSERTADOS
SELECT 
    d.code,
    d.name,
    c.name as country
FROM departments d
JOIN countries c ON d.country_id = c.id
WHERE c.iso_code = 'CO'
ORDER BY d.code;
