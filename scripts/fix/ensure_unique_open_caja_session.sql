-- Enforce a single open cash session per restaurant (idempotent)
-- Run safely multiple times

CREATE UNIQUE INDEX IF NOT EXISTS ux_caja_sesion_abierta_restaurante
  ON public.caja_sesiones(restaurant_id)
  WHERE estado = 'abierta';

-- Optional: helpful supporting index for common lookups
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_rest_estado_abierta_at
  ON public.caja_sesiones(restaurant_id, estado, abierta_at DESC);
