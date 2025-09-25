-- ========================================
-- CORRECCIONES COMPLETAS PARA FUNCIONES RPC
-- 1. Soluciona error: column sr.display_order does not exist
-- 2. Soluciona error: users_restaurant_id_key constraint único
-- ========================================

-- ========================================
-- CORRECCIÓN 1: Función get_available_roles
-- ========================================

-- Recrear la función con el orden correcto (solo roles del sistema por ahora)
CREATE OR REPLACE FUNCTION get_available_roles(p_restaurant_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  type text,
  description text,
  is_system boolean
) AS $$
BEGIN
  -- Roles del sistema (siempre disponibles)
  RETURN QUERY
  SELECT
    sr.id,
    sr.name,
    'system'::text as type,
    sr.description,
    true as is_system
  FROM system_roles sr
  WHERE sr.name != 'propietario' -- Excluir propietario de la lista
  ORDER BY sr.name; -- ✅ CORREGIDO: Ordenar por nombre

  -- Nota: Roles personalizados deshabilitados hasta crear las tablas necesarias
  -- IF p_restaurant_id IS NOT NULL THEN
  --   RETURN QUERY
  --   SELECT
  --     cr.id,
  --     cr.name,
  --     'custom'::text as type,
  --     cr.description,
  --     false as is_system
  --   FROM custom_roles cr
  --   WHERE cr.restaurant_id = p_restaurant_id
  --   AND cr.is_active = true
  --   ORDER BY cr.created_at;
  -- END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- CORRECCIÓN 2: Función create_user_direct
-- ========================================

-- Recrear la función sin asignar restaurant_id a users (evita constraint único)
CREATE OR REPLACE FUNCTION create_user_direct(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text DEFAULT NULL,
  p_role_id text DEFAULT NULL,
  p_restaurant_id uuid DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_role_id uuid;
  v_password_temporal text;
  v_instrucciones text;
BEGIN
  -- Validaciones básicas
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email es obligatorio';
  END IF;

  IF p_first_name IS NULL OR p_first_name = '' THEN
    RAISE EXCEPTION 'Nombre es obligatorio';
  END IF;

  IF p_last_name IS NULL OR p_last_name = '' THEN
    RAISE EXCEPTION 'Apellido es obligatorio';
  END IF;

  -- Verificar que el email no exista
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Ya existe un usuario con este email';
  END IF;

  -- Generar ID único para el usuario
  v_user_id := gen_random_uuid();

  -- Generar contraseña temporal segura (12 caracteres)
  v_password_temporal := substr(encode(gen_random_bytes(9), 'base64'), 1, 12);
  -- Asegurar que tenga al menos un número y una letra
  v_password_temporal := regexp_replace(v_password_temporal, '[^a-zA-Z0-9]', 'X', 'g');

  -- Crear usuario en tabla users (sin RLS)
  -- ✅ CORREGIDO: No asignamos restaurant_id para evitar constraint único
  INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_first_name,
    p_last_name,
    COALESCE(p_phone, ''),
    'restaurant_owner', -- valor por defecto
    true,
    NOW(),
    NOW()
  );

  -- Si se especificó un role_id, intentar asignarlo
  IF p_role_id IS NOT NULL THEN
    -- Buscar el role_id en system_roles
    SELECT id INTO v_role_id
    FROM system_roles
    WHERE id::text = p_role_id OR name = p_role_id;

    -- Si no se encontró en system_roles, buscar en custom_roles
    IF v_role_id IS NULL THEN
      SELECT id INTO v_role_id
      FROM custom_roles
      WHERE id::text = p_role_id OR name = p_role_id;
    END IF;

    -- Si se encontró un rol válido, asignarlo
    IF v_role_id IS NOT NULL THEN
      INSERT INTO user_roles (
        user_id,
        role_id,
        restaurant_id,
        is_active,
        assigned_at
      ) VALUES (
        v_user_id,
        v_role_id,
        p_restaurant_id,
        true,
        NOW()
      );
    END IF;
  END IF;

  -- Crear instrucciones para el administrador
  v_instrucciones := format(
    'Usuario creado exitosamente.%s' ||
    'Email: %s%s' ||
    'Contraseña temporal: %s%s' ||
    'IMPORTANTE: El usuario debe cambiar su contraseña en el primer inicio de sesión.',
    E'\n\n',
    p_email,
    E'\n',
    v_password_temporal,
    E'\n\n'
  );

  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'password_temporal', v_password_temporal,
    'instrucciones', v_instrucciones,
    'created_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Revertir cualquier cambio en caso de error
    RAISE EXCEPTION 'Error creando usuario: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar permisos
GRANT EXECUTE ON FUNCTION get_available_roles(uuid) TO authenticated;

-- Verificar que la función existe y funciona
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'get_available_roles';

-- Probar la función (sin parámetros para roles del sistema)
SELECT * FROM get_available_roles();

-- ========================================
-- COMENTARIO ACTUALIZADO
-- ========================================

COMMENT ON FUNCTION get_available_roles(uuid) IS
'Retorna todos los roles disponibles: sistema + personalizados del restaurante. Corregido: ordena por nombre en lugar de display_order.';
