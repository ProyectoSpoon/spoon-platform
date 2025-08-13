# DB Snapshots y Comparación

Este módulo genera un snapshot Markdown del esquema de la base de datos y un diff contra `documentacion modulos/BASE DE DATOS.txt`.

## Requisitos
- Node 20+
- Variables de entorno para Postgres:
	- Opción A (recomendada): `DATABASE_URL` (postgresql://…)
	- Opción B: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
	- `PGSCHEMA` (opcional, por defecto `public`)
	- `PGSSLMODE=require`

## Ejecución local
```powershell
# PowerShell (Windows)
$env:DATABASE_URL="<postgresql://usuario:password@host:5432/db>"
$env:PGSSLMODE="require"
npm run db:snapshot
```

Los archivos generados se guardan en `docs/db/snapshots/` como:
- `schema-<schema>-<timestamp>.md`
- `diff-<timestamp>.txt`

## Supabase: notas importantes
- Copia el `DATABASE_URL` desde: Supabase → Settings → Database → Connection string → URI.
- Si el host `db.<ref>.supabase.co` solo resuelve a IPv6 (AAAA), tu máquina podría no poder conectarse. En ese caso:
	1) Usa GitHub Actions (runner con IPv6) y define un secreto `DATABASE_URL` en el repo.
	2) O utiliza Connection Pooling (cuando esté habilitado en tu proyecto) que habitualmente expone IPv4.

## Ejecución en CI (GitHub Actions)
Configura estos secretos en el repositorio:
- `DATABASE_URL` (preferido) o los `PG*` (PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD)

Luego, dispara manualmente el workflow “DB Snapshot” desde la pestaña Actions.

