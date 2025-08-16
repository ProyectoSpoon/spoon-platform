-- Migración: Convertir timestamps de CAJA a timestamptz (UTC)
-- Fecha: 2025-08-14
-- Contexto: Alinear datos con consultas que usan límites en UTC y UI en zona America/Bogota.
-- Seguridad: Colombia (America/Bogota) es UTC-5 sin DST. Las columnas actuales son timestamp (naive)
-- que representan hora local. Convertimos preservando la intención local -> UTC.

BEGIN;

-- 1) caja_sesiones.abierta_at
ALTER TABLE public.caja_sesiones
  ALTER COLUMN abierta_at TYPE timestamptz USING (abierta_at AT TIME ZONE 'America/Bogota');

-- 2) caja_sesiones.cerrada_at
ALTER TABLE public.caja_sesiones
  ALTER COLUMN cerrada_at TYPE timestamptz USING (cerrada_at AT TIME ZONE 'America/Bogota');

-- 3) transacciones_caja.procesada_at
ALTER TABLE public.transacciones_caja
  ALTER COLUMN procesada_at TYPE timestamptz USING (procesada_at AT TIME ZONE 'America/Bogota');

-- 4) gastos_caja.registrado_at
ALTER TABLE public.gastos_caja
  ALTER COLUMN registrado_at TYPE timestamptz USING (registrado_at AT TIME ZONE 'America/Bogota');

-- Restablecer defaults a now() (que devuelve timestamptz en UTC)
ALTER TABLE public.caja_sesiones ALTER COLUMN abierta_at SET DEFAULT now();
ALTER TABLE public.transacciones_caja ALTER COLUMN procesada_at SET DEFAULT now();
ALTER TABLE public.gastos_caja ALTER COLUMN registrado_at SET DEFAULT now();

COMMIT;

-- Revisión manual sugerida tras migración:
-- SELECT abierta_at, cerrada_at FROM public.caja_sesiones ORDER BY abierta_at DESC LIMIT 10;
-- SELECT procesada_at FROM public.transacciones_caja ORDER BY procesada_at DESC LIMIT 10;
-- SELECT registrado_at FROM public.gastos_caja ORDER BY registrado_at DESC LIMIT 10;
