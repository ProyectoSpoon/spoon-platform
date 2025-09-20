-- Ensure required columns exist in transacciones_caja for payment processing flows
-- Safe to run multiple times (IF NOT EXISTS guards)

DO $$
BEGIN
  -- Add orden_id (nullable) if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transacciones_caja' AND column_name = 'orden_id'
  ) THEN
    ALTER TABLE public.transacciones_caja
      ADD COLUMN orden_id uuid;
  END IF;

  -- Add tipo_orden if missing (mesa|delivery)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transacciones_caja' AND column_name = 'tipo_orden'
  ) THEN
    ALTER TABLE public.transacciones_caja
      ADD COLUMN tipo_orden text;
  END IF;

  -- Add procesada_at if missing (timestamp without time zone)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transacciones_caja' AND column_name = 'procesada_at'
  ) THEN
    ALTER TABLE public.transacciones_caja
      ADD COLUMN procesada_at timestamp without time zone DEFAULT now();
  END IF;
END
$$;

-- Optional: comment for documentation
COMMENT ON COLUMN public.transacciones_caja.orden_id IS 'ID de la orden asociada (mesa o delivery). Puede ser NULL para movimientos sin orden.';
COMMENT ON COLUMN public.transacciones_caja.tipo_orden IS 'Tipo de orden asociada: mesa|delivery';
COMMENT ON COLUMN public.transacciones_caja.procesada_at IS 'Marca de tiempo de procesamiento de la transacción (usada por reportes diarios).';