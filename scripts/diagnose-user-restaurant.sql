-- ========================================
-- DIAGNÓSTICO DEL USUARIO ACTUAL Y SUS RESTAURANTES
-- ========================================

-- 1. VERIFICAR USUARIO AUTENTICADO ACTUAL
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. VERIFICAR DATOS EN TABLA USERS
SELECT 
    id,
    email,
    first_name,
    last_name,
    restaurant_id,
    role,
    is_active,
    created_at
FROM users 
WHERE id = auth.uid();

-- 3. VERIFICAR RESTAURANTES DEL USUARIO
SELECT 
    id,
    name,
    owner_id,
    status,
    setup_completed,
    setup_step,
    created_at
FROM restaurants 
WHERE owner_id = auth.uid();

-- 4. VERIFICAR SI HAY PROBLEMAS DE PERMISOS
-- (Esto debería funcionar si las políticas están bien)
SELECT 
    'Test query successful' as result,
    count(*) as restaurant_count
FROM restaurants 
WHERE owner_id = auth.uid();

-- 5. VERIFICAR EL ID ESPECÍFICO DEL ERROR
-- El error mencionaba: owner_id=eq.da5d3600-b79e-4371-acf8-0e9de5232bb8
SELECT 
    id,
    name,
    owner_id,
    status
FROM restaurants 
WHERE owner_id = 'da5d3600-b79e-4371-acf8-0e9de5232bb8';

-- 6. VERIFICAR SI ESE USUARIO EXISTE
SELECT 
    id,
    email,
    first_name,
    last_name
FROM users 
WHERE id = 'da5d3600-b79e-4371-acf8-0e9de5232bb8';
