# Pendiente: Ajustes de Base de Datos para Módulo de Cierres de Caja

## 1. Contexto actual
Se implementó en el frontend un primer MVP del histórico de *cierres de caja* (pestaña "Arqueo"). La UI:
- Lista las sesiones cerradas (`caja_sesiones`) y muestra ventas, efectivo, gastos y (si existe la data) la diferencia.
- Calcula la **diferencia** y el **estado de cuadre** (cuadrado / faltante / sobrante) únicamente si puede leer un valor de **saldo final contado** (efectivo real contado al cierre).
- Hoy la columna `saldo_final_reportado` NO existe (o está siempre NULL), por eso `estado` y `diferencia` aparecen vacíos.
- El cierre actual (hook `useCajaSesion.cerrarCaja`) ya intenta enviar `saldo_final_reportado` cuando el usuario ingresa el valor, pero la actualización falla silenciosamente si la columna no está definida.

## 2. Problema
Sin un campo persistido para el efectivo contado al cierre, no se puede:
- Calcular diferencias reales entre efectivo teórico y efectivo contado.
- Clasificar el cierre (cuadrado / faltante / sobrante).
- Auditar discrepancias o generar reportes de arqueo confiables.

Esto deja el módulo a medias: se visualizan cifras de ventas/gastos pero no el resultado del arqueo.

## 3. Objetivo del cambio
Agregar los campos mínimos para soportar un flujo de arqueo completo y escalable:
1. Guardar el efectivo contado por el cajero al momento del cierre.
2. (Opcional inmediato) Guardar el resultado del cuadre y la diferencia para no recalcularlo cada vez.
3. (Opcional siguiente) Registrar estado de auditoría y notas internas.

## 4. Cambios mínimos requeridos (Fase 1 – indispensable)
```sql
-- 1. Agregar saldo final contado (en centavos) a la sesión
ALTER TABLE caja_sesiones
  ADD COLUMN IF NOT EXISTS saldo_final_reportado BIGINT; -- Centavos

-- (Opcional) Index si se harán filtros por discrepancias
-- CREATE INDEX IF NOT EXISTS idx_caja_sesiones_saldo_final ON caja_sesiones (saldo_final_reportado);
```
El frontend ya enviará este campo al cerrar (si el usuario lo digitó). Con esto la UI mostrará diferencia y estado en la lista.

## 5. Cambios recomendados (Fase 2 – performance / consistencia)
Persistir diferencia y estado de cuadre para evitar recalcular en cada consulta.
```sql
ALTER TABLE caja_sesiones
  ADD COLUMN IF NOT EXISTS diferencia_centavos BIGINT,      -- saldo_final_reportado - efectivo_teorico
  ADD COLUMN IF NOT EXISTS estado_cuadre TEXT;              -- 'cuadrado' | 'faltante' | 'sobrante'
```

### Trigger para calcular automáticamente
```sql
CREATE OR REPLACE FUNCTION fn_caja_calcular_cuadre()
RETURNS trigger AS $$
DECLARE
  v_total_efectivo BIGINT := 0;
  v_total_gastos   BIGINT := 0;
  v_efectivo_teorico BIGINT := 0;
BEGIN
  -- Sólo calcular si se marcó como cerrada y hay saldo_final_reportado
  IF (NEW.estado = 'cerrada' AND NEW.saldo_final_reportado IS NOT NULL) THEN
    SELECT COALESCE(SUM(monto_total),0)
      INTO v_total_efectivo
      FROM transacciones_caja
      WHERE caja_sesion_id = NEW.id AND metodo_pago = 'efectivo';

    SELECT COALESCE(SUM(monto),0)
      INTO v_total_gastos
      FROM gastos_caja
      WHERE caja_sesion_id = NEW.id;

    v_efectivo_teorico := COALESCE(NEW.monto_inicial,0) + v_total_efectivo - v_total_gastos;
    NEW.diferencia_centavos := NEW.saldo_final_reportado - v_efectivo_teorico;

    IF NEW.diferencia_centavos = 0 THEN
      NEW.estado_cuadre := 'cuadrado';
    ELSIF NEW.diferencia_centavos < 0 THEN
      NEW.estado_cuadre := 'faltante';
    ELSE
      NEW.estado_cuadre := 'sobrante';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_caja_calcular_cuadre ON caja_sesiones;
CREATE TRIGGER trg_caja_calcular_cuadre
BEFORE UPDATE ON caja_sesiones
FOR EACH ROW
WHEN (OLD.estado <> NEW.estado OR NEW.saldo_final_reportado IS NOT NULL)
EXECUTE FUNCTION fn_caja_calcular_cuadre();
```

## 6. Cambios futuros (Fase 3 – auditoría avanzada)
```sql
ALTER TABLE caja_sesiones
  ADD COLUMN IF NOT EXISTS audit_status TEXT,           -- 'pending' | 'audited' | 'flagged'
  ADD COLUMN IF NOT EXISTS notas_auditoria TEXT,
  ADD COLUMN IF NOT EXISTS audit_user_id UUID REFERENCES auth.users (id),
  ADD COLUMN IF NOT EXISTS audit_at TIMESTAMPTZ;
```

## 7. Consulta optimizada sugerida
Crear una vista para la lista rápida de cierres (si el volumen crece):
```sql
CREATE OR REPLACE VIEW v_caja_cierres_resumen AS
SELECT
  cs.id,
  cs.abierta_at,
  cs.cerrada_at,
  cs.cajero_id,
  cs.monto_inicial,
  cs.saldo_final_reportado,
  cs.diferencia_centavos,
  cs.estado_cuadre,
  (
    SELECT COALESCE(SUM(t.monto_total),0)
    FROM transacciones_caja t
    WHERE t.caja_sesion_id = cs.id
  ) AS total_ventas_centavos,
  (
    SELECT COALESCE(SUM(t.monto_total),0)
    FROM transacciones_caja t
    WHERE t.caja_sesion_id = cs.id AND t.metodo_pago = 'efectivo'
  ) AS total_efectivo_centavos,
  (
    SELECT COALESCE(SUM(g.monto),0)
    FROM gastos_caja g
    WHERE g.caja_sesion_id = cs.id
  ) AS total_gastos_centavos
FROM caja_sesiones cs
WHERE cs.estado = 'cerrada';
```
El frontend podría luego leer directamente `v_caja_cierres_resumen` en vez de hacer agregaciones manuales.

## 8. Resumen rápido
| Objetivo | Acción mínima | Beneficio |
|----------|---------------|-----------|
| Mostrar diferencia/estado | ADD COLUMN saldo_final_reportado | Desbloquea cuadre básico |
| Evitar recálculos | ADD diferencia_centavos + estado_cuadre | Lecturas más rápidas |
| Auditoría | ADD audit_status + notas_auditoria | Control y seguimiento |
| Escalabilidad | Crear vista resumen | Menos carga en frontend |

## 9. Riesgos / Consideraciones
- Asegurar unidades coherentes (centavos) para evitar errores de magnitud.
- Si ya existen datos históricos, las columnas nuevas quedarán NULL; no habrá estado retroactivo hasta que se re-procese o se ignore.
- El trigger depende de la consistencia: si se insertan transacciones o gastos después del cierre, la diferencia ya calculada quedará desfasada (mitigación: restringir inserciones post-cierre o recalcular con rutina administrativa).

## 10. Próximo paso recomendado
1. Ejecutar SQL de la Fase 1 (columna saldo_final_reportado).
2. Cerrar una sesión ingresando el saldo contado para validar que la UI muestre diferencia.
3. Luego implementar Fase 2 si el flujo queda aprobado.

---
**Autor:** Generado automáticamente (asistente)
**Fecha:** (actualizar si se versiona)

---

## 11. Fase 4+ (Ampliaciones y Endurecimiento)
Esta sección consolida mejoras avanzadas para robustecer el módulo de arqueo una vez operen las fases 1–3.

### 11.1 Integridad y Consistencia
```sql
-- Una sola sesión abierta por restaurante
CREATE UNIQUE INDEX IF NOT EXISTS ux_caja_sesion_abierta_restaurante
  ON caja_sesiones(restaurant_id)
  WHERE estado = 'abierta';

-- Secuencia de cierres (opcional si se requiere número legible de cierre)
ALTER TABLE caja_sesiones
  ADD COLUMN IF NOT EXISTS cierre_num BIGINT;

-- (Luego) Popular cierre_num retroactivamente y añadir índice compuesto
-- UPDATE caja_sesiones SET cierre_num = rn FROM (
--   SELECT id, ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY cerrada_at ASC) rn
--   FROM caja_sesiones WHERE estado='cerrada'
-- ) t WHERE t.id = caja_sesiones.id;
CREATE UNIQUE INDEX IF NOT EXISTS ux_caja_cierre_seq ON caja_sesiones(restaurant_id, cierre_num) WHERE cierre_num IS NOT NULL;

-- Check constraints adicionales
ALTER TABLE caja_sesiones
  ADD CONSTRAINT chk_caja_estado_fechas
    CHECK ((estado='abierta' AND cerrada_at IS NULL) OR (estado='cerrada' AND cerrada_at IS NOT NULL));
ALTER TABLE caja_sesiones
  ADD CONSTRAINT chk_caja_saldo_final_no_negativo
    CHECK (saldo_final_reportado IS NULL OR saldo_final_reportado >= 0);
```

### 11.2 Parámetros por Restaurante
```sql
CREATE TABLE IF NOT EXISTS caja_parametros (
  restaurant_id UUID PRIMARY KEY REFERENCES restaurantes(id) ON DELETE CASCADE,
  tolerancia_centavos BIGINT DEFAULT 0 NOT NULL,
  permite_post_cierre BOOLEAN DEFAULT FALSE NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
Integrar tolerancia en `fn_caja_calcular_cuadre` leyendo `caja_parametros` (fallback 0).

### 11.3 Evento, Ajustes y Auditoría Profunda
```sql
CREATE TABLE IF NOT EXISTS caja_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_sesion_id UUID REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL,              -- 'apertura','cierre','ajuste','recuento','recalculo'
  payload JSONB DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS caja_ajustes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_sesion_id UUID REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,                     -- 'gasto_tardio','correccion','ajuste_manual'
  monto_centavos BIGINT NOT NULL,
  notas TEXT,
  actor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```
Política: bloquear inserciones tardías en `transacciones_caja` y `gastos_caja` si la sesión ya está cerrada (RLS o constraint lógica).

### 11.4 Conteo Físico de Denominaciones (Opcional)
```sql
CREATE TABLE IF NOT EXISTS caja_conteos_denominaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_sesion_id UUID REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  denominacion_centavos BIGINT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad >= 0),
  subtotal_centavos BIGINT GENERATED ALWAYS AS (denominacion_centavos * cantidad) STORED
);

-- Trigger para sincronizar saldo_final_reportado
CREATE OR REPLACE FUNCTION fn_caja_sync_conteo() RETURNS trigger AS $$
BEGIN
  UPDATE caja_sesiones s
    SET saldo_final_reportado = (
      SELECT COALESCE(SUM(subtotal_centavos),0)
      FROM caja_conteos_denominaciones c
      WHERE c.caja_sesion_id = s.id
    )
  WHERE s.id = NEW.caja_sesion_id AND s.estado='cerrada';
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_caja_sync_conteo ON caja_conteos_denominaciones;
CREATE TRIGGER trg_caja_sync_conteo
AFTER INSERT OR UPDATE OR DELETE ON caja_conteos_denominaciones
FOR EACH ROW EXECUTE FUNCTION fn_caja_sync_conteo();
```

### 11.5 Índices y Performance
```sql
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_rest_estado_cerrada_at ON caja_sesiones(restaurant_id, estado, cerrada_at DESC);
CREATE INDEX IF NOT EXISTS idx_transacciones_sesion_metodo ON transacciones_caja(caja_sesion_id, metodo_pago);
CREATE INDEX IF NOT EXISTS idx_gastos_sesion ON gastos_caja(caja_sesion_id);
```
Para discrepancias: `CREATE INDEX IF NOT EXISTS idx_caja_sesiones_diff ON caja_sesiones(restaurant_id, diferencia_centavos);`

### 11.6 Materialized View (si alto volumen)
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_caja_cierres_resumen AS
SELECT * FROM v_caja_cierres_resumen;  -- Basada en la vista lógica previa

-- Refrescar tras cierre
CREATE OR REPLACE FUNCTION fn_refresh_mv_cierres() RETURNS trigger AS $$
BEGIN
  PERFORM REFRESH MATERIALIZED VIEW CONCURRENTLY mv_caja_cierres_resumen;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_refresh_mv_cierres ON caja_sesiones;
CREATE TRIGGER trg_refresh_mv_cierres
AFTER UPDATE OF estado ON caja_sesiones
FOR EACH ROW
WHEN (NEW.estado='cerrada' AND OLD.estado <> 'cerrada')
EXECUTE FUNCTION fn_refresh_mv_cierres();
```

### 11.7 Seguridad (RLS) – Esquema conceptual
1. Activar RLS: `ALTER TABLE caja_sesiones ENABLE ROW LEVEL SECURITY;` (igual para tablas relacionadas).
2. Policy lectura: usuarios solo ven filas de su `restaurant_id`.
3. Policy inserción transacciones/gastos: permitir solo si sesión.estado='abierta'.
4. Policy cierre: permitir UPDATE a estado='cerrada' solo rol cajero/admin y si coincide restaurant.
5. Policy ajustes: restringir `caja_ajustes` a roles admin/auditor.

### 11.8 ENUMs (fortalecer tipos)
```sql
CREATE TYPE IF NOT EXISTS estado_cuadre_type AS ENUM ('cuadrado','faltante','sobrante');
CREATE TYPE IF NOT EXISTS audit_status_type AS ENUM ('pending','audited','flagged');
ALTER TABLE caja_sesiones
  ALTER COLUMN estado_cuadre TYPE estado_cuadre_type USING estado_cuadre::estado_cuadre_type,
  ALTER COLUMN audit_status TYPE audit_status_type USING audit_status::audit_status_type;
```

### 11.9 Observabilidad
```sql
CREATE TABLE IF NOT EXISTS metrics_caja_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_sesion_id UUID REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ DEFAULT now(),
  total_ventas_centavos BIGINT,
  total_gastos_centavos BIGINT,
  total_efectivo_centavos BIGINT
);
```

### 11.10 Job de Reconciliación (opcional)
Script programado (cron) que revalida últimos N cierres y marca `flagged` si detecta nuevas transacciones/gastos posteriores al cierre.

### 11.11 Prioridad Sugerida (post Fase 3)
1. Índice sesión abierta + constraints.
2. Parámetros + tolerancia integrada.
3. RLS & policies.
4. Eventos / ajustes.
5. Denominaciones (si se usará en operación diaria).
6. MV de resumen (cuando el volumen lo justifique).

---
Fin sección Fase 4+.

---

## 12. Scripts Consolidados (Copiar / Ejecutar por Fases)

### 12.1 Fase 1 – Campo básico para saldo contado
```sql
-- FASE 1: agregar saldo final contado
ALTER TABLE caja_sesiones
  ADD COLUMN IF NOT EXISTS saldo_final_reportado BIGINT; -- En centavos

-- (Opcional) índice si se filtra por este campo
-- CREATE INDEX IF NOT EXISTS idx_caja_sesiones_saldo_final ON caja_sesiones (saldo_final_reportado);
```

### 12.2 Fase 2 – Persistir diferencia y estado (trigger)
```sql
-- FASE 2: columnas de diferencia y estado de cuadre
ALTER TABLE caja_sesiones
  ADD COLUMN IF NOT EXISTS diferencia_centavos BIGINT,
  ADD COLUMN IF NOT EXISTS estado_cuadre TEXT;

-- Trigger de cálculo
CREATE OR REPLACE FUNCTION fn_caja_calcular_cuadre() RETURNS trigger AS $$
DECLARE
  v_total_efectivo BIGINT := 0;
  v_total_gastos   BIGINT := 0;
  v_efectivo_teorico BIGINT := 0;
  v_tolerancia BIGINT := 0;
BEGIN
  -- (Opcional) leer tolerancia si existe tabla de parámetros
  BEGIN
    SELECT tolerancia_centavos INTO v_tolerancia
    FROM caja_parametros
    WHERE restaurant_id = NEW.restaurant_id;
  EXCEPTION WHEN undefined_table THEN
    v_tolerancia := 0; -- fallback
  END;

  IF (NEW.estado = 'cerrada' AND NEW.saldo_final_reportado IS NOT NULL) THEN
    SELECT COALESCE(SUM(monto_total),0)
      INTO v_total_efectivo
      FROM transacciones_caja
      WHERE caja_sesion_id = NEW.id AND metodo_pago = 'efectivo';

    SELECT COALESCE(SUM(monto),0)
      INTO v_total_gastos
      FROM gastos_caja
      WHERE caja_sesion_id = NEW.id;

    v_efectivo_teorico := COALESCE(NEW.monto_inicial,0) + v_total_efectivo - v_total_gastos;
    NEW.diferencia_centavos := NEW.saldo_final_reportado - v_efectivo_teorico;

    IF ABS(NEW.diferencia_centavos) <= v_tolerancia THEN
      NEW.estado_cuadre := 'cuadrado';
    ELSIF NEW.diferencia_centavos < 0 THEN
      NEW.estado_cuadre := 'faltante';
    ELSE
      NEW.estado_cuadre := 'sobrante';
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_caja_calcular_cuadre ON caja_sesiones;
CREATE TRIGGER trg_caja_calcular_cuadre
BEFORE UPDATE ON caja_sesiones
FOR EACH ROW
WHEN (OLD.estado <> NEW.estado OR NEW.saldo_final_reportado IS NOT NULL)
EXECUTE FUNCTION fn_caja_calcular_cuadre();
```

### 12.3 Fase 3 – Auditoría básica
```sql
ALTER TABLE caja_sesiones
  ADD COLUMN IF NOT EXISTS audit_status TEXT,
  ADD COLUMN IF NOT EXISTS notas_auditoria TEXT,
  ADD COLUMN IF NOT EXISTS audit_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS audit_at TIMESTAMPTZ;
```

### 12.4 Fase 4 (Opcional) – Integridad y parámetros
```sql
-- Única sesión abierta por restaurante
CREATE UNIQUE INDEX IF NOT EXISTS ux_caja_sesion_abierta_restaurante
  ON caja_sesiones(restaurant_id) WHERE estado='abierta';

-- Parámetros
CREATE TABLE IF NOT EXISTS caja_parametros (
  restaurant_id UUID PRIMARY KEY REFERENCES restaurantes(id) ON DELETE CASCADE,
  tolerancia_centavos BIGINT DEFAULT 0 NOT NULL,
  permite_post_cierre BOOLEAN DEFAULT FALSE NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 12.5 Fase 4+ – Eventos, ajustes y conteo físico
```sql
-- Eventos
CREATE TABLE IF NOT EXISTS caja_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_sesion_id UUID REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ajustes
CREATE TABLE IF NOT EXISTS caja_ajustes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_sesion_id UUID REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  monto_centavos BIGINT NOT NULL,
  notas TEXT,
  actor_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conteo de denominaciones
CREATE TABLE IF NOT EXISTS caja_conteos_denominaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_sesion_id UUID REFERENCES caja_sesiones(id) ON DELETE CASCADE,
  denominacion_centavos BIGINT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad >= 0),
  subtotal_centavos BIGINT GENERATED ALWAYS AS (denominacion_centavos * cantidad) STORED
);

CREATE OR REPLACE FUNCTION fn_caja_sync_conteo() RETURNS trigger AS $$
BEGIN
  UPDATE caja_sesiones s
    SET saldo_final_reportado = (
      SELECT COALESCE(SUM(subtotal_centavos),0)
      FROM caja_conteos_denominaciones c
      WHERE c.caja_sesion_id = s.id
    )
  WHERE s.id = NEW.caja_sesion_id AND s.estado='cerrada';
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_caja_sync_conteo ON caja_conteos_denominaciones;
CREATE TRIGGER trg_caja_sync_conteo
AFTER INSERT OR UPDATE OR DELETE ON caja_conteos_denominaciones
FOR EACH ROW EXECUTE FUNCTION fn_caja_sync_conteo();
```

### 12.6 Vista / Materialized View
```sql
CREATE OR REPLACE VIEW v_caja_cierres_resumen AS
SELECT
  cs.id,
  cs.abierta_at,
  cs.cerrada_at,
  cs.cajero_id,
  cs.monto_inicial,
  cs.saldo_final_reportado,
  cs.diferencia_centavos,
  cs.estado_cuadre,
  (SELECT COALESCE(SUM(t.monto_total),0) FROM transacciones_caja t WHERE t.caja_sesion_id = cs.id) AS total_ventas_centavos,
  (SELECT COALESCE(SUM(t.monto_total),0) FROM transacciones_caja t WHERE t.caja_sesion_id = cs.id AND t.metodo_pago='efectivo') AS total_efectivo_centavos,
  (SELECT COALESCE(SUM(g.monto),0) FROM gastos_caja g WHERE g.caja_sesion_id = cs.id) AS total_gastos_centavos
FROM caja_sesiones cs
WHERE cs.estado='cerrada';
```

### 12.7 ENUMs (si se decide migrar)
```sql
CREATE TYPE IF NOT EXISTS estado_cuadre_type AS ENUM ('cuadrado','faltante','sobrante');
CREATE TYPE IF NOT EXISTS audit_status_type AS ENUM ('pending','audited','flagged');

ALTER TABLE caja_sesiones
  ALTER COLUMN estado_cuadre TYPE estado_cuadre_type USING estado_cuadre::estado_cuadre_type;
-- (Solo ejecutar audit_status si la columna ya existe)
-- ALTER TABLE caja_sesiones
--   ALTER COLUMN audit_status TYPE audit_status_type USING audit_status::audit_status_type;
```

### 12.8 Índices recomendados
```sql
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_rest_estado_cerrada_at ON caja_sesiones(restaurant_id, estado, cerrada_at DESC);
CREATE INDEX IF NOT EXISTS idx_transacciones_sesion_metodo ON transacciones_caja(caja_sesion_id, metodo_pago);
CREATE INDEX IF NOT EXISTS idx_gastos_sesion ON gastos_caja(caja_sesion_id);
```

### 12.9 Rollback básico (solo para desarrollo)
```sql
ALTER TABLE caja_sesiones DROP COLUMN IF EXISTS saldo_final_reportado;
ALTER TABLE caja_sesiones DROP COLUMN IF EXISTS diferencia_centavos;
ALTER TABLE caja_sesiones DROP COLUMN IF EXISTS estado_cuadre;
-- Omitir auditoría/otros según necesidad.
DROP FUNCTION IF EXISTS fn_caja_calcular_cuadre();
DROP TRIGGER IF EXISTS trg_caja_calcular_cuadre ON caja_sesiones;
```

### 12.10 Orden sugerido de ejecución inicial mínima
1. Fase 1
2. Fase 2
3. (Probar en UI)
4. Fase 3 (si se requiere ya auditoría)
5. Vista resumen

---
Fin scripts consolidados.

## 13. Endurecimiento de Seguridad (RLS) y Prevención de Duplicados (Entrega / Caja)

### 13.1 Objetivo
Activar y hacer efectivas las políticas RLS de `caja_sesiones` (estaban definidas pero deshabilitadas), reforzar quién puede actualizar/cerrar, evitar transacciones duplicadas para pedidos delivery y documentar el ajuste en pagos (`pagada_at`).

### 13.2 Cambios Clave
1. Habilitar (y opcionalmente forzar) RLS en `caja_sesiones`.
2. Reemplazar la policy de UPDATE para exigir que sólo el cajero dueño de la sesión la modifique.
3. Re-crear la policy de INSERT (explícita) para sesiones.
4. (Opcional) FORCING RLS para impedir bypass del owner.
5. Índice único para impedir transacciones duplicadas por pedido delivery en una misma sesión.
6. (Opcional) FK compuesta que asegura que `cajero_id` de la transacción coincide con la sesión.
7. Documentar que el frontend ahora setea `paid_at` y `pagada_at` (compatibilidad con consultas de caja que dependen de `pagada_at`).

### 13.3 Script de Migración (Idempotente)
```sql
-- 1. Activar RLS en caja_sesiones (en producción ejecutar en ventana de mantenimiento breve)
ALTER TABLE public.caja_sesiones ENABLE ROW LEVEL SECURITY;
-- (Opcional) Forzar
-- ALTER TABLE public.caja_sesiones FORCE ROW LEVEL SECURITY;

-- 2. Policies caja_sesiones (DROP + CREATE para asegurar definiciones limpias)
DROP POLICY IF EXISTS "Users can create caja sesiones for their restaurant" ON public.caja_sesiones;
CREATE POLICY "Users can create caja sesiones for their restaurant"
  ON public.caja_sesiones
  FOR INSERT
  WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM users WHERE id = auth.uid())
    AND cajero_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their restaurant's caja sesiones" ON public.caja_sesiones;
CREATE POLICY "Users can update their restaurant caja sesiones"
  ON public.caja_sesiones
  FOR UPDATE
  USING (
    restaurant_id IN (SELECT restaurant_id FROM users WHERE id = auth.uid())
    AND cajero_id = auth.uid()
  );

-- (Conservar policy de SELECT existente si ya está correcta; opcionalmente recrearla)
-- DROP POLICY IF EXISTS "Users can view their restaurant's caja sesiones" ON public.caja_sesiones;
-- CREATE POLICY "Users can view their restaurant's caja sesiones"
--   ON public.caja_sesiones FOR SELECT USING (
--     restaurant_id IN (SELECT restaurant_id FROM users WHERE id = auth.uid())
--   );

-- 3. Índice sugerido para consultas por restaurante / estado
CREATE INDEX IF NOT EXISTS idx_caja_sesiones_rest_estado ON public.caja_sesiones(restaurant_id, estado);

-- 4. Único para evitar duplicados de transacciones delivery (ajustar valor de tipo_orden si difiere)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_tx_delivery'
  ) THEN
    CREATE UNIQUE INDEX uniq_tx_delivery
      ON public.transacciones_caja (tipo_orden, orden_id, caja_sesion_id)
      WHERE tipo_orden = 'delivery';
  END IF;
END$$;

-- 5. (Opcional) FK compuesta para reforzar coherencia cajero
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='transacciones_caja' AND constraint_name='transacciones_caja_cajero_matches_session'
  ) THEN
    ALTER TABLE public.transacciones_caja
      ADD CONSTRAINT transacciones_caja_cajero_matches_session
      FOREIGN KEY (caja_sesion_id, cajero_id)
      REFERENCES public.caja_sesiones(id, cajero_id)
      ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END$$;

-- 6. (Opcional) Forzar RLS también en tablas sensibles
-- ALTER TABLE public.transacciones_caja FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.delivery_orders FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.delivery_personnel FORCE ROW LEVEL SECURITY;

-- 7. Nota: el código de frontend ahora asegura UPDATE de delivery_orders estableciendo paid_at y pagada_at.
```

### 13.4 Manejo en Frontend (registrarPago)
- Capturar error de violación de índice único (`uniq_tx_delivery`) y mostrar mensaje tipo: *"La transacción de este pedido ya fue registrada en la caja abierta"*.
- Si la inserción falla por RLS (status 42501), guiar al usuario a reabrir sesión o verificar permisos.

### 13.5 Verificaciones Rápidas Post-Migración
```sql
-- Debe mostrar filtro/qual si RLS aplica (o al menos limitar filas visibles)
EXPLAIN ANALYZE SELECT id FROM public.caja_sesiones LIMIT 5;

-- Probar inserción duplicada (segunda vez debe fallar)
-- INSERT INTO transacciones_caja(... tipo_orden='delivery', orden_id=..., caja_sesion_id=...) VALUES (...);

-- Confirmar política UPDATE restringida
UPDATE public.caja_sesiones SET monto_inicial = monto_inicial WHERE id = 'UUID_SESION_OTRO_CAJERO'; -- Debe fallar si no eres el cajero.
```

### 13.6 Notas Operativas
- Activar FORCE sólo tras validar que ningún proceso interno confíe en bypass de RLS.
- FK compuesta puede fallar si existen filas históricas con cajero_id divergente; verificar antes con:
  ```sql
  SELECT t.* FROM transacciones_caja t
  LEFT JOIN caja_sesiones cs ON cs.id = t.caja_sesion_id AND cs.cajero_id = t.cajero_id
  WHERE cs.id IS NULL LIMIT 20;
  ```
- Añadir retry ligero (1 intento) si ocurre race condition entre lectura y creación de transacción delivery.

### 13.7 Resumen
| Componente | Acción | Estado |
|------------|--------|--------|
| RLS caja_sesiones | ENABLE (y opcional FORCE) | Pendiente aplicar en prod |
| Policies UPDATE/INSERT reforzadas | Re-creadas | Listo en script |
| Índice duplicados delivery | `uniq_tx_delivery` | En script |
| FK compuesta transacciones→sesión | Opcional | En script (guardado) |
| pagada_at sincronizada | registrarPago actualiza paid_at & pagada_at | Ya en frontend |

---
Fin sección 13.

