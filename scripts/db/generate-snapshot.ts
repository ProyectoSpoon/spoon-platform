/*
Generates a Markdown database snapshot from information_schema and pg_catalog.
Reads connection details from environment variables:
- PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, (optional) PGSCHEMA (default 'public')
Outputs to docs/db/snapshots/schema-YYYY-MM-DD_HH-mm-ss.md and prints path.
*/

import fs from 'node:fs';
import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';
import { Client, ClientConfig } from 'pg';

// Load .env and optionally .env.local if present
dotenvConfig();
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) dotenvConfig({ path: envLocalPath, override: false });

function env(name: string, def?: string) {
  const v = process.env[name];
  if (v === undefined) return def;
  return v;
}

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

const SCHEMA = env('PGSCHEMA', 'public')!;
const OUT_DIR = path.resolve(process.cwd(), 'docs', 'db', 'snapshots');

function requireEnv(names: string[]) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error(
      `Missing env vars: ${missing.join(', ')}. Configure PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD. Optional: PGSCHEMA, PGSSLMODE.`
    );
    process.exit(1);
  }
}

async function connectWithSslFallback(): Promise<Client> {
  let connectionString = env('DATABASE_URL') || env('SUPABASE_DB_URL') || env('SUPABASE_DB_CONNECTION');
  // Derive from NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD if available
  if (!connectionString) {
    const supaUrl = env('NEXT_PUBLIC_SUPABASE_URL');
    const supaPwd = env('SUPABASE_DB_PASSWORD');
    if (supaUrl && supaPwd) {
      try {
        const u = new URL(supaUrl);
        // Extract project ref from host: <ref>.supabase.co
        const hostParts = u.hostname.split('.');
        const ref = hostParts[0];
        const dbHost = `db.${ref}.supabase.co`;
  const user = env('SUPABASE_DB_USER', 'postgres') || 'postgres';
  const db = env('PGDATABASE', 'postgres') || 'postgres';
  connectionString = `postgres://` + encodeURIComponent(user) + `:` + encodeURIComponent(supaPwd || '') + `@${dbHost}:5432/${db}`;
        process.env.DATABASE_URL = connectionString; // cache for rest of script
        process.env.PGSSLMODE = process.env.PGSSLMODE || 'require';
      } catch {}
    }
  }
  const base: ClientConfig = {
    ...(connectionString
      ? { connectionString }
      : {
          host: env('PGHOST'),
          port: env('PGPORT') ? Number(env('PGPORT')) : undefined,
          database: env('PGDATABASE'),
          user: env('PGUSER'),
          password: env('PGPASSWORD'),
        }),
  };
  // First try: respect PGSSLMODE (default require)
  const sslMode = env('PGSSLMODE', 'require');
  const withSsl: ClientConfig = { ...base };
  if (sslMode !== 'disable') withSsl.ssl = { rejectUnauthorized: false };
  try {
    const c = new Client(withSsl);
    await c.connect();
    return c;
  } catch (e: any) {
    const msg = String(e?.message || e);
    // Retry without SSL if server doesn't support it
    if (msg.includes('does not support SSL') || msg.includes('no pg_hba.conf entry')) {
      const c2 = new Client(base);
      await c2.connect();
      return c2;
    }
    throw e;
  }
}

async function main() {
  if (
    !process.env.DATABASE_URL &&
    !process.env.SUPABASE_DB_URL &&
    !process.env.SUPABASE_DB_CONNECTION &&
    !(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD)
  ) {
    requireEnv(['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD']);
  }
  const client = await connectWithSslFallback();

  // Basic database info
  const dbVersion = await client.query("select version();");
  const now = await client.query('select now() as now');

  // Schemas present
  const schemas = await client.query(
    `select schema_name from information_schema.schemata order by schema_name;`
  );

  // Extensions installed
  const extensions = await client.query(
    `select e.extname, e.extversion, n.nspname as schema
     from pg_extension e
     join pg_namespace n on n.oid = e.extnamespace
     order by e.extname;`
  );

  // Tables in target schema
  const tables = await client.query(
    `select table_name from information_schema.tables where table_schema = $1 and table_type='BASE TABLE' order by table_name;`,
    [SCHEMA]
  );

  // Views in target schema
  const views = await client.query(
    `select table_name as view_name from information_schema.views where table_schema = $1 order by table_name;`,
    [SCHEMA]
  );

  // Columns per table
  const columns = await client.query(
    `select table_name, column_name, data_type, is_nullable, column_default
     from information_schema.columns
     where table_schema = $1
     order by table_name, ordinal_position;`,
    [SCHEMA]
  );

  // Constraints: PK, FK, UNIQUE, CHECK
  const constraints = await client.query(
    `select tc.table_name, tc.constraint_name, tc.constraint_type
           , kcu.column_name
           , ccu.table_name as foreign_table_name
           , ccu.column_name as foreign_column_name
     from information_schema.table_constraints tc
     left join information_schema.key_column_usage kcu
       on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
     left join information_schema.constraint_column_usage ccu
       on tc.constraint_name = ccu.constraint_name and tc.table_schema = ccu.table_schema
     where tc.table_schema = $1
     order by tc.table_name, tc.constraint_type, tc.constraint_name, kcu.ordinal_position;`,
    [SCHEMA]
  );

  // Indexes
  const indexes = await client.query(
    `select t.relname as table_name, i.relname as index_name
          , pg_get_indexdef(ix.indexrelid) as index_def
     from pg_class t
     join pg_index ix on t.oid = ix.indrelid
     join pg_class i on i.oid = ix.indexrelid
     join pg_namespace n on n.oid = t.relnamespace
     where n.nspname = $1 and t.relkind = 'r'
     order by t.relname, i.relname;`,
    [SCHEMA]
  );

  // Triggers
  const triggers = await client.query(
    `select event_object_table as table_name, trigger_name, event_manipulation as event
          , action_timing as timing
     from information_schema.triggers
     where trigger_schema = $1
     order by event_object_table, trigger_name;`,
    [SCHEMA]
  );

  // Functions
  const functions = await client.query(
    `select n.nspname as schema, p.proname as name
          , pg_get_functiondef(p.oid) as definition
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ($1, 'auth', 'storage', 'extensions')
     order by n.nspname, p.proname;`,
    [SCHEMA]
  );

  // RLS policies
  const rls = await client.query(
    `select schemaname as schema, tablename as table_name, policyname as policy_name
          , permissive, roles, cmd, qual, with_check
     from pg_policies
     where schemaname = $1
     order by tablename, policyname;`,
    [SCHEMA]
  );

  // Build Markdown
  const lines: string[] = [];
  lines.push(`# Database Snapshot (${SCHEMA})`);
  lines.push(`Generated at: ${now.rows[0].now.toISOString?.() ?? now.rows[0].now}`);
  lines.push('');
  lines.push('## Engine');
  lines.push('```');
  lines.push(dbVersion.rows[0].version);
  lines.push('```');
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push(`- Schemas: ${schemas.rows.length}`);
  lines.push(`- Tables (${SCHEMA}): ${tables.rows.length}`);
  lines.push(`- Views (${SCHEMA}): ${views.rows.length}`);
  lines.push(`- Functions (selected schemas): ${functions.rows.length}`);
  lines.push(`- Indexes (${SCHEMA}): ${indexes.rows.length}`);
  lines.push(`- Triggers (${SCHEMA}): ${triggers.rows.length}`);
  lines.push(`- RLS Policies (${SCHEMA}): ${rls.rows.length}`);
  lines.push('');

  lines.push('## Schemas');
  for (const r of schemas.rows) lines.push(`- ${r.schema_name}`);
  lines.push('');

  if (extensions.rows.length) {
    lines.push('## Extensions');
    for (const x of extensions.rows) lines.push(`- ${x.extname} v${x.extversion} (${x.schema})`);
    lines.push('');
  }

  lines.push('## Tables');
  for (const t of tables.rows) {
    lines.push(`### ${t.table_name}`);
    // columns
    const cols = columns.rows.filter((c: any) => c.table_name === t.table_name);
    lines.push('Columns:');
    for (const c of cols) {
      lines.push(`- ${c.column_name}: ${c.data_type} ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}${c.column_default ? `, default: ${c.column_default}` : ''}`);
    }
    // constraints
    const cons = constraints.rows.filter((c: any) => c.table_name === t.table_name);
    if (cons.length) {
      lines.push('Constraints:');
      for (const k of cons) {
        if (k.constraint_type === 'FOREIGN KEY') {
          lines.push(`- ${k.constraint_type} ${k.constraint_name}: ${k.column_name} -> ${k.foreign_table_name}.${k.foreign_column_name}`);
        } else if (k.column_name) {
          lines.push(`- ${k.constraint_type} ${k.constraint_name}: ${k.column_name}`);
        } else {
          lines.push(`- ${k.constraint_type} ${k.constraint_name}`);
        }
      }
    }
    // indexes
    const idx = indexes.rows.filter((i: any) => i.table_name === t.table_name);
    if (idx.length) {
      lines.push('Indexes:');
      for (const i of idx) lines.push(`- ${i.index_def}`);
    }
    // triggers
    const tr = triggers.rows.filter((tr: any) => tr.table_name === t.table_name);
    if (tr.length) {
      lines.push('Triggers:');
      for (const tg of tr) lines.push(`- ${tg.trigger_name}: ${tg.timing} ${tg.event}`);
    }
    // rls
    const pol = rls.rows.filter((p: any) => p.table_name === t.table_name);
    if (pol.length) {
      lines.push('RLS Policies:');
      for (const p of pol) lines.push(`- ${p.policy_name} (${p.cmd}) roles: ${p.roles}`);
    }

    lines.push('');
  }

  // Views
  if (views.rows.length) {
    lines.push('## Views');
    for (const v of views.rows) {
      lines.push(`### ${v.view_name}`);
      const cols = columns.rows.filter((c: any) => c.table_name === v.view_name);
      if (cols.length) {
        lines.push('Columns:');
        for (const c of cols) lines.push(`- ${c.column_name}: ${c.data_type}`);
      }
      lines.push('');
    }
  }

  // Functions (names only and fenced defs to avoid massive diffs; can be toggled)
  lines.push('## Functions (definitions)');
  for (const f of functions.rows) {
    lines.push(`### ${f.schema}.${f.name}`);
  lines.push('```sql');
    lines.push(f.definition);
  lines.push('```');
  }

  // Write file
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `schema-${SCHEMA}-${nowStamp()}.md`);
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  await client.end();
  console.log(outPath);
}

main().catch((err) => {
  console.error('Snapshot generation failed:', err);
  process.exit(1);
});
