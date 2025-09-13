# Backfill Scripts

Este directorio contiene scripts de backfill para corregir o completar datos históricos.

## transacciones_caja_backfill.sql
Propósito: asegurar que todas las filas de `transacciones_caja` tienen:
- `procesada_at` (necesario para aparecer en reportes diarios)
- `restaurant_id` (útil para filtros e índices)
- Montos no nulos

### Ejecución
1. Revisa primero si la columna `restaurant_id` existe en `transacciones_caja`.
2. Ejecuta el script en tu consola SQL (Supabase SQL editor o psql).
3. Verifica con:
```sql
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE procesada_at IS NULL) AS faltan_procesada,
       COUNT(*) FILTER (WHERE restaurant_id IS NULL) AS faltan_restaurant
FROM transacciones_caja;
```

### Idempotencia
El script es seguro de ejecutar múltiples veces: solo completa campos nulos.

### Ajustes opcionales
Si tu esquema usa nombres distintos (ej: `created_at` vs `creada_at`), ajusta el script antes de ejecutar.

---
Si necesitas un script equivalente en JavaScript para correr dentro del monorepo, avísame y lo agrego.
