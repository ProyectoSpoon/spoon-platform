-- Audit triggers for users, user_roles, restaurant_role_configs, role_permissions
-- Run in Supabase/PostgreSQL (schema: public)

-- 0) Ensure audit_log table exists
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  operation text not null check (operation in ('INSERT','UPDATE','DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid,
  timestamp timestamptz not null default now()
);

-- 1) Generic trigger function
create or replace function public.fn_audit_log() returns trigger as $$
declare
  v_user uuid;
begin
  -- Supabase auth uid() available when RLS context is set, else null
  begin
    v_user := auth.uid();
  exception when others then
    v_user := null;
  end;

  if (tg_op = 'INSERT') then
    insert into public.audit_log(table_name, operation, new_data, user_id)
    values (tg_table_name, 'INSERT', to_jsonb(NEW), v_user);
    return NEW;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_log(table_name, operation, old_data, new_data, user_id)
    values (tg_table_name, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), v_user);
    return NEW;
  elsif (tg_op = 'DELETE') then
    insert into public.audit_log(table_name, operation, old_data, user_id)
    values (tg_table_name, 'DELETE', to_jsonb(OLD), v_user);
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- 2) Attach triggers to target tables
do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_audit_users'
  ) then
    create trigger trg_audit_users
    after insert or update or delete on public.users
    for each row execute function public.fn_audit_log();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trg_audit_user_roles'
  ) then
    create trigger trg_audit_user_roles
    after insert or update or delete on public.user_roles
    for each row execute function public.fn_audit_log();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trg_audit_restaurant_role_configs'
  ) then
    create trigger trg_audit_restaurant_role_configs
    after insert or update or delete on public.restaurant_role_configs
    for each row execute function public.fn_audit_log();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trg_audit_role_permissions'
  ) then
    create trigger trg_audit_role_permissions
    after insert or update or delete on public.role_permissions
    for each row execute function public.fn_audit_log();
  end if;
end $$;

-- 3) Helpful index on timestamp and table_name for filtering
create index if not exists idx_audit_log_ts on public.audit_log (timestamp desc);
create index if not exists idx_audit_log_table_ts on public.audit_log (table_name, timestamp desc);

-- 4) Optional: RLS allowing read for authenticated users and insert via trigger only
alter table public.audit_log enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'audit_log' and policyname = 'allow_select_auth'
  ) then
    create policy allow_select_auth on public.audit_log for select using ( auth.role() = 'authenticated' );
  end if;
end $$;
