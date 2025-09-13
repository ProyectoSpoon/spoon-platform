-- Backfill de transacciones_caja
-- Objetivo: asegurar que todas las filas tengan:
--  * procesada_at (timestamp usado en reportes diarios)
--  * restaurant_id (para índices / filtros futuros)
--  * coherencia básica de montos
-- Ejecutar UNA sola vez (o repetir de forma idempotente; solo actualiza filas incompletas)

BEGIN;

-- 1. Añadir restaurant_id si la columna existe y está NULL
-- (Si la columna no existe, este bloque fallará; en ese caso crea primero la columna.)
-- ALTER TABLE transacciones_caja ADD COLUMN restaurant_id uuid;  -- (solo si falta)

WITH sesion_rest AS (
  SELECT id AS caja_sesion_id, restaurant_id FROM caja_sesiones
)
UPDATE transacciones_caja t
SET restaurant_id = sr.restaurant_id
FROM sesion_rest sr
WHERE t.caja_sesion_id = sr.caja_sesion_id
  AND (t.restaurant_id IS NULL OR t.restaurant_id = '00000000-0000-0000-0000-000000000000');

-- 2. Rellenar procesada_at faltante usando (pagada_at | created_at | NOW())
ALTER TABLE transacciones_caja
  ALTER COLUMN procesada_at SET DEFAULT NOW();

-- Nota: la columna pagada_at no existe en transacciones_caja en tu esquema actual.
-- Ajustamos el fallback a (created_at | NOW()). Si tampoco tienes created_at,
-- comenta created_at abajo y se usará NOW().
UPDATE transacciones_caja
SET procesada_at = COALESCE(procesada_at, created_at, NOW())
WHERE procesada_at IS NULL;

-- 3. Normalizar montos nulos a 0 (si aplica)
UPDATE transacciones_caja
SET monto_total = 0
WHERE monto_total IS NULL;

-- 4. (Opcional) Validar integridad rápida
-- SELECT COUNT(*) FILTER (WHERE procesada_at IS NULL) AS faltan_procesada,
--        COUNT(*) FILTER (WHERE restaurant_id IS NULL) AS faltan_restaurant
-- FROM transacciones_caja;

COMMIT;

-- Para verificar después:
-- SELECT procesada_at, restaurant_id, metodo_pago, monto_total
-- FROM transacciones_caja
-- ORDER BY procesada_at DESC
-- LIMIT 50;
