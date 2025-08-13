# Snapshot generator

Scripts:
- `scripts/db/generate-snapshot.ts`: Connects to Postgres and emits a Markdown snapshot of the schema, functions, triggers, indexes, constraints and RLS for a given schema.
- `scripts/db/compare-snapshot.ts`: Compares the latest snapshot with the human doc `documentacion modulos/BASE DE DATOS.txt` and produces a unified diff.

Usage:
1) Configure env (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSCHEMA).
2) `npm run db:snapshot`.

Notes:
- For Supabase, use your project's connection string variables.
- SSL is enabled by default; set PGSSLMODE=disable for local Docker.
