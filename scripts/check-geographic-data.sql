-- ========================================
-- CONSULTAR DATOS GEOGRÁFICOS EXISTENTES
-- ========================================

-- 1. Verificar tabla countries
SELECT 
    id,
    name,
    code,
    phone_code,
    is_active
FROM countries 
ORDER BY name;

-- 2. Verificar tabla departments
SELECT 
    id,
    name,
    code,
    country_id,
    is_active,
    COUNT(*) OVER() as total_departments
FROM departments 
ORDER BY name;

-- 3. Verificar tabla cities (primeras 20)
SELECT 
    id,
    name,
    department_id,
    latitude,
    longitude,
    is_capital,
    population,
    COUNT(*) OVER() as total_cities
FROM cities 
ORDER BY population DESC NULLS LAST
LIMIT 20;

-- 4. Verificar estructura completa
\d countries;
\d departments;
\d cities;

-- 5. Resumen de datos
SELECT 
    'Countries' as table_name,
    COUNT(*) as record_count
FROM countries
UNION ALL
SELECT 
    'Departments' as table_name,
    COUNT(*) as record_count
FROM departments
UNION ALL
SELECT 
    'Cities' as table_name,
    COUNT(*) as record_count
FROM cities;
