-- ========================================
-- SOLUCIÓN DIRECTA: HABILITAR AUTO-CONFIRMACIÓN
-- ========================================

-- Verificar configuración actual
SELECT 
    setting_name,
    setting_value
FROM auth.config
WHERE setting_name = 'MAILER_AUTOCONFIRM';

-- Si la tabla auth.config no existe o no funciona,
-- ve a la interfaz de Supabase:
-- Authentication > Settings > Email Auth
-- Activa "Enable email confirmations" = OFF
-- O "Confirm email" = Disabled
