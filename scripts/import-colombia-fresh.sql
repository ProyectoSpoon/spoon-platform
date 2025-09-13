-- ========================================
-- IMPORTACIÓN COMPLETA DE COLOMBIA
-- Departamentos y municipios desde cero
-- ========================================

-- 1. OBTENER ID DE COLOMBIA
DO $$
DECLARE
    colombia_id UUID;
BEGIN
    -- Obtener ID de Colombia
    SELECT id INTO colombia_id FROM countries WHERE iso_code = 'CO';
    
    IF colombia_id IS NULL THEN
        RAISE EXCEPTION 'Colombia no encontrada. Ejecutar primero import-colombia-geography.sql';
    END IF;
    
    RAISE NOTICE 'Colombia encontrada con ID: %', colombia_id;
    
    -- 2. INSERTAR TODOS LOS DEPARTAMENTOS EN UNA SOLA OPERACIÓN
    INSERT INTO departments (id, name, code, country_id, is_active) VALUES
    (gen_random_uuid(), 'Antioquia', '05', colombia_id, true),
    (gen_random_uuid(), 'Atlántico', '08', colombia_id, true),
    (gen_random_uuid(), 'Bogotá D.C.', '11', colombia_id, true),
    (gen_random_uuid(), 'Bolívar', '13', colombia_id, true),
    (gen_random_uuid(), 'Boyacá', '15', colombia_id, true),
    (gen_random_uuid(), 'Caldas', '17', colombia_id, true),
    (gen_random_uuid(), 'Caquetá', '18', colombia_id, true),
    (gen_random_uuid(), 'Cauca', '19', colombia_id, true),
    (gen_random_uuid(), 'Cesar', '20', colombia_id, true),
    (gen_random_uuid(), 'Córdoba', '23', colombia_id, true),
    (gen_random_uuid(), 'Cundinamarca', '25', colombia_id, true),
    (gen_random_uuid(), 'Chocó', '27', colombia_id, true),
    (gen_random_uuid(), 'Huila', '41', colombia_id, true),
    (gen_random_uuid(), 'La Guajira', '44', colombia_id, true),
    (gen_random_uuid(), 'Magdalena', '47', colombia_id, true),
    (gen_random_uuid(), 'Meta', '50', colombia_id, true),
    (gen_random_uuid(), 'Nariño', '52', colombia_id, true),
    (gen_random_uuid(), 'Norte de Santander', '54', colombia_id, true),
    (gen_random_uuid(), 'Quindío', '63', colombia_id, true),
    (gen_random_uuid(), 'Risaralda', '66', colombia_id, true),
    (gen_random_uuid(), 'Santander', '68', colombia_id, true),
    (gen_random_uuid(), 'Sucre', '70', colombia_id, true),
    (gen_random_uuid(), 'Tolima', '73', colombia_id, true),
    (gen_random_uuid(), 'Valle del Cauca', '76', colombia_id, true),
    (gen_random_uuid(), 'Arauca', '81', colombia_id, true),
    (gen_random_uuid(), 'Casanare', '85', colombia_id, true),
    (gen_random_uuid(), 'Putumayo', '86', colombia_id, true),
    (gen_random_uuid(), 'San Andrés y Providencia', '88', colombia_id, true),
    (gen_random_uuid(), 'Amazonas', '91', colombia_id, true),
    (gen_random_uuid(), 'Guainía', '94', colombia_id, true),
    (gen_random_uuid(), 'Guaviare', '95', colombia_id, true),
    (gen_random_uuid(), 'Vaupés', '97', colombia_id, true),
    (gen_random_uuid(), 'Vichada', '99', colombia_id, true);
    
    RAISE NOTICE 'Departamentos insertados exitosamente';
    
END $$;

-- 3. VERIFICAR INSERCIÓN DE DEPARTAMENTOS
SELECT 
    COUNT(*) as total_departamentos,
    COUNT(CASE WHEN code = '11' THEN 1 END) as bogota_existe
FROM departments;

-- 4. MOSTRAR DEPARTAMENTOS INSERTADOS
SELECT 
    code,
    name
FROM departments 
ORDER BY code;
