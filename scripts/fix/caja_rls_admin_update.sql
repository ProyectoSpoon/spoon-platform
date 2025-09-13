-- Permitir que admin/owner también puedan actualizar (cerrar) sesiones de caja
-- Ejecutar en la base de datos

-- Elimina política anterior si existe
DROP POLICY IF EXISTS "Cajeros can update their own active sessions" ON caja_sesiones;

-- Política combinada: cajero original O admin/owner del mismo restaurante
CREATE POLICY "Caja update by cajero or admin" 
ON caja_sesiones FOR UPDATE
USING (
  (
    cajero_id = auth.uid()
    AND restaurant_id IN (
      SELECT u.restaurant_id FROM users u WHERE u.id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
      AND u.restaurant_id = caja_sesiones.restaurant_id
      AND (u.role = 'admin' OR u.role = 'owner')
  )
)
WITH CHECK (
  (
    cajero_id = auth.uid()
    AND restaurant_id IN (
      SELECT u.restaurant_id FROM users u WHERE u.id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
      AND u.restaurant_id = caja_sesiones.restaurant_id
      AND (u.role = 'admin' OR u.role = 'owner')
  )
);

-- (Opcional) Asegurar que la función cerrar_caja_atomico esté concedida
-- GRANT EXECUTE ON FUNCTION public.cerrar_caja_atomico(UUID, TEXT, NUMERIC) TO authenticated;
