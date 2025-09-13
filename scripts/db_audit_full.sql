-- ============================================================================
-- Database Audit & Remediation Script (Enterprise Restaurant Platform)
-- Version: 1.0
-- Purpose: Comprehensive integrity, security (RLS), performance & metadata audit
-- Safe-by-default: Generates remediation statements without executing destructive ops.
-- Execution: Run in psql / Supabase SQL editor (adjust search_path if needed)
-- ============================================================================
\timing on;

-- ----------------------------------------------------------------------------
-- CONFIGURATION FLAGS (toggle as needed)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  -- Set to true to actually CREATE missing FK indexes
  PERFORM set_config('audit.apply_create_fk_indexes', 'false', false);
  -- Set to true to create placeholder RLS policies for unprotected tables
  PERFORM set_config('audit.apply_rls_placeholders', 'false', false);
  -- Set to true to enable RLS automatically on tables missing it (after creating placeholder)
  PERFORM set_config('audit.enable_rls_missing', 'false', false);
  -- Set to true to output JSON summary row at end
  PERFORM set_config('audit.output_json_summary', 'true', false);
END $$;

-- Helper to read config
CREATE OR REPLACE FUNCTION audit_flag(name text, default_bool boolean)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT coalesce(current_setting(name, true)::boolean, default_bool)
$$;

-- ----------------------------------------------------------------------------
-- SECTION 1: BASIC METADATA
-- ----------------------------------------------------------------------------
SELECT 'version' AS k, version() AS v;
SELECT 'current_database' AS k, current_database() AS v;
SELECT 'current_user' AS k, current_user AS v;

-- Count objects in public schema
WITH objs AS (
  SELECT
         COUNT(*) FILTER (WHERE c.relkind='r') AS tables,
         COUNT(*) FILTER (WHERE c.relkind='v') AS views,
         COUNT(*) FILTER (WHERE c.relkind='m') AS matviews
  FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public'
)
SELECT tables, views, matviews FROM objs;

SELECT 'functions' AS metric, COUNT(*) AS count
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public';

SELECT 'triggers' AS metric, COUNT(*) AS count
FROM pg_trigger t
JOIN pg_class c ON c.oid=t.tgrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE NOT t.tgisinternal AND n.nspname='public';

SELECT 'indexes' AS metric, COUNT(*) AS count
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE c.relkind='i' AND n.nspname='public';

SELECT 'constraints_total' AS metric, COUNT(*)
FROM pg_constraint;

SELECT 'foreign_keys' AS metric, COUNT(*)
FROM pg_constraint WHERE contype='f';

SELECT 'extensions' AS metric, COUNT(*) FROM pg_extension;

-- ----------------------------------------------------------------------------
-- SECTION 2: ORPHAN TABLE DETECTION (no FK in or out except self)
-- ----------------------------------------------------------------------------
WITH fks AS (
  SELECT conname, conrelid, confrelid FROM pg_constraint WHERE contype='f'
), rels AS (
  SELECT c.oid, c.relname
  FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE c.relkind='r' AND n.nspname='public'
), refs AS (
  SELECT DISTINCT conrelid AS oid FROM fks
  UNION
  SELECT DISTINCT confrelid AS oid FROM fks
)
SELECT r.relname AS orphan_table
FROM rels r
LEFT JOIN refs rf ON rf.oid=r.oid
WHERE rf.oid IS NULL
ORDER BY 1;

-- ----------------------------------------------------------------------------
-- SECTION 3: FOREIGN KEYS WITHOUT SUPPORTING CHILD INDEX
-- ----------------------------------------------------------------------------
-- A child index is required on referencing columns for performance & lock reduction.
WITH fk AS (
  SELECT conname, conrelid, confrelid, conkey
  FROM pg_constraint
  WHERE contype='f'
), att AS (
  SELECT attrelid, attnum, attname FROM pg_attribute WHERE attnum>0 AND NOT attisdropped
), fk_expanded AS (
  SELECT fk.conname,
         fk.conrelid,
         fk.confrelid,
         (
           SELECT array_agg(a2.attname ORDER BY u.ord)
           FROM unnest(fk.conkey) WITH ORDINALITY AS u(attnum, ord)
           JOIN att a2 ON a2.attrelid = fk.conrelid AND a2.attnum = u.attnum
         ) AS child_cols
  FROM fk
), child_idx AS (
  SELECT i.indexrelid,
         i.indrelid,
         i.indkey,
         (
           SELECT array_agg(a.attname ORDER BY gs.ord)
           FROM generate_subscripts(i.indkey,1) gs(ord)
           JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=i.indkey[gs.ord]
         ) AS idx_cols
  FROM pg_index i
), missing AS (
  SELECT f.conname,
         (SELECT relname FROM pg_class WHERE oid=f.conrelid) AS child_table,
         f.child_cols,
           'CREATE INDEX IF NOT EXISTS idx_' ||
             (SELECT relname FROM pg_class WHERE oid=f.conrelid) || '_' ||
             array_to_string(f.child_cols, '_') || '_fk ON ' ||
             quote_ident((SELECT relname FROM pg_class WHERE oid=f.conrelid)) || '(' ||
             (SELECT string_agg(quote_ident(col), ', ')
                FROM unnest(f.child_cols) AS col) || ');' AS create_stmt
  FROM fk_expanded f
  WHERE NOT EXISTS (
    SELECT 1 FROM child_idx ci
    WHERE ci.indrelid=f.conrelid AND ci.idx_cols = f.child_cols
  )
  GROUP BY f.conname, f.conrelid, f.child_cols
)
SELECT * FROM missing ORDER BY child_table;

-- Optional application of missing indexes
DO $$
DECLARE r record;
BEGIN
  IF audit_flag('audit.apply_create_fk_indexes', false) THEN
    FOR r IN (
      WITH fk AS (
        SELECT conname, conrelid, confrelid, conkey FROM pg_constraint WHERE contype='f'
      ), att AS (
        SELECT attrelid, attnum, attname FROM pg_attribute WHERE attnum>0 AND NOT attisdropped
      ), fk_expanded AS (
        SELECT fk.conname, fk.conrelid, fk.confrelid,
               (
                 SELECT array_agg(a2.attname ORDER BY u.ord)
                 FROM unnest(fk.conkey) WITH ORDINALITY AS u(attnum, ord)
                 JOIN att a2 ON a2.attrelid=fk.conrelid AND a2.attnum=u.attnum
               ) AS child_cols
        FROM fk
      ), child_idx AS (
        SELECT i.indrelid,
               (
                 SELECT array_agg(a.attname ORDER BY gs.ord)
                 FROM generate_subscripts(i.indkey,1) gs(ord)
                 JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=i.indkey[gs.ord]
               ) AS idx_cols
        FROM pg_index i
      ), missing AS (
        SELECT f.conname,
               (SELECT relname FROM pg_class WHERE oid=f.conrelid) AS child_table,
               f.child_cols,
               'CREATE INDEX IF NOT EXISTS idx_' ||
                 (SELECT relname FROM pg_class WHERE oid=f.conrelid) || '_' ||
                 array_to_string(f.child_cols, '_') || '_fk ON ' ||
                 quote_ident((SELECT relname FROM pg_class WHERE oid=f.conrelid)) || '(' ||
                 (SELECT string_agg(quote_ident(col), ', ')
                    FROM unnest(f.child_cols) AS col) || ');' AS create_stmt
        FROM fk_expanded f
        WHERE NOT EXISTS (
          SELECT 1 FROM child_idx ci
          WHERE ci.indrelid=f.conrelid AND ci.idx_cols = f.child_cols
        )
        GROUP BY f.conname, f.conrelid, f.child_cols
      )
      SELECT create_stmt FROM missing
    ) LOOP
      RAISE NOTICE 'Applying: %', r.create_stmt;
      EXECUTE r.create_stmt;
    END LOOP;
  ELSE
    RAISE NOTICE 'Skipping index creation (audit.apply_create_fk_indexes=false)';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- SECTION 4: RLS STATUS
-- ----------------------------------------------------------------------------
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS force_rls,
       COUNT(p.policyname) AS policies
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
LEFT JOIN pg_policies p ON p.tablename = c.relname AND p.schemaname=n.nspname
WHERE n.nspname='public' AND c.relkind='r'
GROUP BY 1,2,3
ORDER BY 1;

-- Tables without any RLS policies but RLS enabled false
WITH tbl AS (
  SELECT c.relname
  FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r'
), pol AS (
  SELECT DISTINCT tablename FROM pg_policies WHERE schemaname='public'
)
SELECT t.relname AS no_rls_table
FROM tbl t
LEFT JOIN pol p ON p.tablename=t.relname
JOIN pg_class c ON c.relname=t.relname
WHERE p.tablename IS NULL AND NOT c.relrowsecurity
ORDER BY 1;

-- ----------------------------------------------------------------------------
-- SECTION 5: OPTIONAL PLACEHOLDER RLS FOR UNPROTECTED TABLES
-- ----------------------------------------------------------------------------
DO $$
DECLARE r record; stmt text;
BEGIN
  IF audit_flag('audit.apply_rls_placeholders', false) THEN
    FOR r IN (
      WITH tbl AS (
        SELECT c.relname, c.oid
        FROM pg_class c
        JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind='r'
      ), pol AS (
        SELECT DISTINCT tablename FROM pg_policies WHERE schemaname='public'
      )
      SELECT t.relname
      FROM tbl t
      LEFT JOIN pol p ON p.tablename=t.relname
      JOIN pg_class c ON c.relname=t.relname
      WHERE p.tablename IS NULL
    ) LOOP
      RAISE NOTICE 'Creating placeholder policy on %', r.relname;
      stmt := format('CREATE POLICY %I_select_all ON public.%I FOR SELECT USING (true);', r.relname||'_placeholder', r.relname);
      EXECUTE stmt;
      IF audit_flag('audit.enable_rls_missing', false) THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.relname);
      END IF;
    END LOOP;
  ELSE
    RAISE NOTICE 'Skipping placeholder policies (audit.apply_rls_placeholders=false)';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- SECTION 6: POLICY RECURSION / SELF-REFERENCE HEURISTIC
-- ----------------------------------------------------------------------------
-- Flags policies whose qual or with_check text references their own table name.
SELECT policyname, tablename, (qual IS NOT NULL) AS has_qual,
       (with_check IS NOT NULL) AS has_check,
       ( (qual ILIKE '%'||tablename||'%') OR (with_check ILIKE '%'||tablename||'%') ) AS possible_self_reference,
       qual, with_check
FROM pg_policies
WHERE schemaname='public'
ORDER BY possible_self_reference DESC, tablename;

-- ----------------------------------------------------------------------------
-- SECTION 7: SECURITY DEFINER FUNCTIONS HARDENING CHECK
-- ----------------------------------------------------------------------------
SELECT p.proname,
       pg_get_userbyid(p.proowner) AS owner,
       p.prosecdef AS security_definer,
       l.lanname,
       pg_get_functiondef(p.oid) LIKE '%search_path%' AS sets_search_path,
       provolatile
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
JOIN pg_language l ON l.oid=p.prolang
WHERE n.nspname='public' AND p.prosecdef = true
ORDER BY 1;

-- ----------------------------------------------------------------------------
DO $$
DECLARE has_view boolean; has_new boolean; dyn_sql text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class WHERE relname='pg_stat_statements'
  ) INTO has_view;
  IF NOT has_view THEN
    RAISE NOTICE 'pg_stat_statements not available (extension not installed in this database).';
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pg_stat_statements' AND column_name='total_exec_time'
  ) INTO has_new;

  IF has_new THEN
    RAISE NOTICE 'Using pg_stat_statements exec_time columns (v13+).';
  dyn_sql := 'SELECT query, calls, total_exec_time AS total_time_ms, mean_exec_time AS mean_time_ms ' ||
         'FROM pg_stat_statements ' ||
         'ORDER BY total_exec_time DESC ' ||
         'LIMIT 15';
  ELSE
    RAISE NOTICE 'Using pg_stat_statements legacy time columns.';
  dyn_sql := 'SELECT query, calls, total_time AS total_time_ms, mean_time AS mean_time_ms ' ||
         'FROM pg_stat_statements ' ||
         'ORDER BY total_time DESC ' ||
         'LIMIT 15';
  END IF;
  EXECUTE dyn_sql;
END $$;

-- ----------------------------------------------------------------------------
-- SECTION 9: INDEX QUALITY (BLOAT / UNUSED) *Advisory*
-- Requires pg_stat_statements & optionally pgstattuple extension.
-- Simple heuristic: indexes with few scans vs size.
-- ----------------------------------------------------------------------------
SELECT idx.relname AS index_name,
       tab.relname AS table_name,
       pg_size_pretty(pg_relation_size(idx.oid)) AS index_size,
       coalesce(s.idx_scan,0) AS idx_scans
FROM pg_class idx
JOIN pg_namespace n ON n.oid=idx.relnamespace
JOIN pg_index i ON i.indexrelid=idx.oid
JOIN pg_class tab ON tab.oid=i.indrelid
LEFT JOIN pg_stat_user_indexes s ON s.indexrelid=idx.oid
WHERE n.nspname='public'
ORDER BY coalesce(s.idx_scan,0) ASC, pg_relation_size(idx.oid) DESC
LIMIT 25;

-- ----------------------------------------------------------------------------
-- SECTION 10: OPTIONAL JSON SUMMARY
-- ----------------------------------------------------------------------------
DO $$
DECLARE js jsonb; tbls int; fks int; pols int; missing_fk_idx int; recursion int;
BEGIN
  IF audit_flag('audit.output_json_summary', true) THEN
    SELECT COUNT(*) INTO tbls FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r';
    SELECT COUNT(*) INTO fks FROM pg_constraint WHERE contype='f';
    SELECT COUNT(*) INTO pols FROM pg_policies WHERE schemaname='public';
    WITH missing AS (
      WITH fk AS (
        SELECT conname, conrelid, confrelid, conkey FROM pg_constraint WHERE contype='f'
      ), att AS (
        SELECT attrelid, attnum, attname FROM pg_attribute WHERE attnum>0 AND NOT attisdropped
      ), fk_expanded AS (
        SELECT fk.conname, fk.conrelid, fk.confrelid,
               (
                 SELECT array_agg(a2.attname ORDER BY u.ord)
                 FROM unnest(fk.conkey) WITH ORDINALITY AS u(attnum, ord)
                 JOIN att a2 ON a2.attrelid=fk.conrelid AND a2.attnum=u.attnum
               ) AS child_cols
        FROM fk
      ), child_idx AS (
        SELECT i.indrelid,
               (
                 SELECT array_agg(a.attname ORDER BY gs.ord)
                 FROM generate_subscripts(i.indkey,1) gs(ord)
                 JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=i.indkey[gs.ord]
               ) AS idx_cols
        FROM pg_index i
      )
      SELECT 1 FROM fk_expanded f
      WHERE NOT EXISTS (
        SELECT 1 FROM child_idx ci
        WHERE ci.indrelid=f.conrelid AND ci.idx_cols = f.child_cols
      )
    ) SELECT COUNT(*) INTO missing_fk_idx FROM missing;

    SELECT COUNT(*) INTO recursion FROM (
      SELECT 1 FROM pg_policies p
      WHERE schemaname='public'
        AND ((qual ILIKE '%'||tablename||'%') OR (with_check ILIKE '%'||tablename||'%'))
    ) x;

    js := jsonb_build_object(
      'tables', tbls,
      'foreign_keys', fks,
      'policies', pols,
      'missing_fk_indexes', missing_fk_idx,
      'potential_recursive_policies', recursion,
      'timestamp', now()
    );
    RAISE NOTICE 'AUDIT_SUMMARY: %', js::text;
  ELSE
    RAISE NOTICE 'JSON summary disabled';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- SECTION 11: SAMPLE SAFE RLS POLICY (ADAPT)
-- ----------------------------------------------------------------------------
-- Example for table users (avoid self-recursive subqueries):
-- DROP POLICY IF EXISTS users_select ON public.users;
-- CREATE POLICY users_select ON public.users FOR SELECT USING (
--   id = auth.uid() OR EXISTS (
--     SELECT 1 FROM user_roles ur
--     JOIN system_roles sr ON sr.id = ur.role_id
--     WHERE ur.user_id = auth.uid()
--       AND ur.restaurant_id = users.restaurant_id
--       AND sr.name IN ('propietario','administrador','gerente')
--   )
-- );

-- ----------------------------------------------------------------------------
-- END OF SCRIPT
-- ----------------------------------------------------------------------------
