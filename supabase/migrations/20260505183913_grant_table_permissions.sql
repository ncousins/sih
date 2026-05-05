-- service_role: full access to all current and future tables
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

alter default privileges for role postgres in schema public
  grant all on tables to service_role;
alter default privileges for role postgres in schema public
  grant all on sequences to service_role;

-- anon/authenticated: schema access + per-table grants matching RLS policies
grant usage on schema public to anon, authenticated;

grant select on public.documents to anon, authenticated;
grant select on public.events to anon, authenticated;
grant insert on public.users to anon, authenticated;
grant select on public.users to anon, authenticated;
grant insert on public.downloads to anon, authenticated;
grant insert on public.transactions to anon, authenticated;
