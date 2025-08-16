-- Fix: cambiar registrado_at a timestamptz en gastos_caja con policy dependiente
-- Fecha: 2025-08-14
-- Contexto: La policy "Users can delete their own recent expenses" depende de registrado_at.
-- Estrategia: dropear policy, alterar tipo, recrear policy.

BEGIN;

-- 1) Dropear policy que referencia registrado_at
DROP POLICY IF EXISTS "Users can delete their own recent expenses" ON public.gastos_caja;

-- 2) Alterar tipo preservando intención local (America/Bogota -> UTC)
ALTER TABLE public.gastos_caja
  ALTER COLUMN registrado_at TYPE timestamptz USING (registrado_at AT TIME ZONE 'America/Bogota');

-- 3) Default coherente
ALTER TABLE public.gastos_caja ALTER COLUMN registrado_at SET DEFAULT now();

-- 4) Recrear policy (igual a la existente según audit):
--    roles: public | operación: DELETE | using: (registrado_por = auth.uid()) AND (registrado_at > now() - interval '24 hours')
CREATE POLICY "Users can delete their own recent expenses"
  ON public.gastos_caja
  FOR DELETE
  TO public
  USING ((registrado_por = auth.uid()) AND (registrado_at > (now() - interval '24 hours')));

COMMIT;
