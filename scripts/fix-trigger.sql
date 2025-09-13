-- ========================================
-- SOLUCIÓN: CORREGIR O ELIMINAR TRIGGER PROBLEMÁTICO
-- ========================================

-- OPCIÓN 1: Eliminar el trigger completamente (RECOMENDADO)
-- Ya que estamos manejando la inserción manualmente en nuestro código
DROP TRIGGER IF EXISTS on_auth_user_created_app ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_app();

-- OPCIÓN 2: Corregir el trigger para usar la tabla correcta
-- (Solo si quieres mantener el trigger automático)
/*
CREATE OR REPLACE FUNCTION handle_new_user_app()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email, 
        first_name, 
        last_name, 
        phone, 
        role, 
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'restaurant_owner',
        true,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
CREATE TRIGGER on_auth_user_created_app
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_app();
*/

-- VERIFICAR que el trigger fue eliminado
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_app';
