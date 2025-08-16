-- SQL Audit Pack v2 (PostgreSQL / Supabase)
-- Schema fixed to 'public'. Run each section independently. Read-only.
-- Tip: In Supabase SQL Editor, run complete statements (do not split CTEs).

\echo 'Using schema: public'

-- 1) Tables overview with estimated row counts and sizes
WITH tables AS (
  SELECT n.nspname AS schema,
         c.relname AS table,
         c.oid     AS oid,
         c.reltuples AS est_rows
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' AND n.nspname = 'public'
)
SELECT t.schema,
       t.table,
       COALESCE(t.est_rows, 0)::bigint AS est_rows,
       pg_size_pretty(pg_total_relation_size(t.oid)) AS total_size,
       pg_size_pretty(pg_relation_size(t.oid))       AS table_size,
       pg_size_pretty(pg_indexes_size(t.oid))        AS index_size
FROM tables t
ORDER BY pg_total_relation_size(t.oid) DESC, t.table;

-- 2) Columns and defaults
SELECT c.table_schema   AS schema,
       c.table_name     AS table,
       c.column_name    AS column,
       c.ordinal_position AS position,
       c.data_type,
       c.udt_name,
       c.is_nullable,
       c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY c.table_schema, c.table_name, c.ordinal_position;

-- 3) Primary keys
SELECT n.nspname AS schema,
       c.relname AS table,
       con.conname AS constraint_name,
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE con.contype = 'p' AND n.nspname = 'public'
ORDER BY n.nspname, c.relname, con.conname;

-- 4) Foreign keys
SELECT n.nspname AS schema,
       c.relname AS table,
       con.conname AS constraint_name,
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE con.contype = 'f' AND n.nspname = 'public'
ORDER BY n.nspname, c.relname, con.conname;

-- 5) Unique constraints
SELECT n.nspname AS schema,
       c.relname AS table,
       con.conname AS constraint_name,
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE con.contype = 'u' AND n.nspname = 'public'
ORDER BY n.nspname, c.relname, con.conname;

-- 6) Check constraints
SELECT n.nspname AS schema,
       c.relname AS table,
       con.conname AS constraint_name,
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE con.contype = 'c' AND n.nspname = 'public'
ORDER BY n.nspname, c.relname, con.conname;

-- 7) Indexes
SELECT schemaname AS schema,
       tablename  AS table,
       indexname  AS index,
       indexdef   AS definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY schemaname, tablename, indexname;

-- 8) Triggers
SELECT event_object_schema AS schema,
       event_object_table  AS table,
       trigger_name,
       action_timing,
       event_manipulation  AS event,
       action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_schema, event_object_table, trigger_name;

-- 9) Views
SELECT table_schema AS schema,
       table_name   AS view,
       view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_schema, table_name;

-- 10) Materialized views
SELECT schemaname AS schema,
       matviewname AS matview,
       definition
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY schemaname, matviewname;

-- 11) RLS policies
SELECT schemaname AS schema,
       tablename  AS table,
       policyname AS policy,
       permissive,
       roles,
       cmd,
       qual,
       with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY schemaname, tablename, policyname;

-- 12) RLS enabled tables
SELECT n.nspname AS schema,
       c.relname AS table,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r','p') AND n.nspname = 'public'
ORDER BY n.nspname, c.relname;

-- 13) Sequences
SELECT sequence_schema AS schema,
       sequence_name,
       data_type,
       start_value,
       minimum_value,
       maximum_value,
       increment,
       cycle_option
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_schema, sequence_name;

-- 14) Functions (signatures only)
SELECT n.nspname AS schema,
       p.proname AS function,
       pg_get_function_identity_arguments(p.oid) AS args,
       l.lanname AS language
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_language l ON l.oid = p.prolang
WHERE n.nspname = 'public'
ORDER BY n.nspname, p.proname, args;

-- 15) Table privileges (GRANTS)
SELECT table_schema AS schema,
       table_name   AS table,
       grantee,
       privilege_type,
       is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
ORDER BY table_schema, table_name, grantee, privilege_type;

-- 16) Extensions
SELECT e.extname   AS extension,
       e.extversion AS version,
       n.nspname   AS schema
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
ORDER BY e.extname;
