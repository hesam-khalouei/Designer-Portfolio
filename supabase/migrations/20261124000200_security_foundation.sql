-- Phase 4: Backend Foundation
-- Migration 2: Security, RLS, immutable records, and public read model

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = (select auth.uid())
      and ap.is_active = true
  );
$$;

revoke all on function private.is_active_admin() from public, anon;
grant execute on function private.is_active_admin() to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create or replace function private.prevent_record_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% records are immutable', tg_table_name
    using errcode = '55000';
end;
$$;

revoke all on function private.prevent_record_mutation() from public, anon, authenticated;

alter table public.admin_profiles
  alter column updated_at set default now();

alter table public.publication_units
  alter column updated_at set default now();

alter table public.content_revisions
  alter column created_by set default auth.uid();

create trigger admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function private.set_updated_at();

create trigger publication_units_updated_at
before update on public.publication_units
for each row execute function private.set_updated_at();

create trigger content_revisions_immutable
before update or delete on public.content_revisions
for each row execute function private.prevent_record_mutation();

create trigger publish_events_immutable
before update or delete on public.publish_events
for each row execute function private.prevent_record_mutation();

alter table public.admin_profiles enable row level security;
alter table public.content_entities enable row level security;
alter table public.publication_units enable row level security;
alter table public.content_revisions enable row level security;
alter table public.publish_events enable row level security;

revoke all on table
  public.admin_profiles,
  public.content_entities,
  public.publication_units,
  public.content_revisions,
  public.publish_events
from public, anon, authenticated;

grant select on public.admin_profiles to authenticated;
grant select on public.content_entities to authenticated;
grant insert (entity_type) on public.content_entities to authenticated;

grant select on public.publication_units to authenticated;
grant insert (entity_id, locale_code) on public.publication_units to authenticated;
grant update (draft_revision_id) on public.publication_units to authenticated;

grant select on public.content_revisions to authenticated;
grant insert (
  publication_unit_id,
  revision_number,
  schema_version,
  payload,
  checksum
) on public.content_revisions to authenticated;

grant select on public.publish_events to authenticated;

create policy admin_profiles_active_admin_select
on public.admin_profiles
for select
to authenticated
using (
  user_id = (select auth.uid())
  and (select private.is_active_admin())
);

create policy content_entities_active_admin_select
on public.content_entities
for select
to authenticated
using ((select private.is_active_admin()));

create policy content_entities_active_admin_insert
on public.content_entities
for insert
to authenticated
with check ((select private.is_active_admin()));

create policy publication_units_active_admin_select
on public.publication_units
for select
to authenticated
using ((select private.is_active_admin()));

create policy publication_units_active_admin_insert
on public.publication_units
for insert
to authenticated
with check ((select private.is_active_admin()));

create policy publication_units_active_admin_update_draft
on public.publication_units
for update
to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy content_revisions_active_admin_select
on public.content_revisions
for select
to authenticated
using ((select private.is_active_admin()));

create policy content_revisions_active_admin_insert
on public.content_revisions
for insert
to authenticated
with check (
  (select private.is_active_admin())
  and created_by = (select auth.uid())
);

create policy publish_events_active_admin_select
on public.publish_events
for select
to authenticated
using ((select private.is_active_admin()));

create or replace function public.read_published_portfolio_content()
returns table (
  entity_id uuid,
  entity_type text,
  locale_code text,
  schema_version integer,
  payload jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id,
    e.entity_type,
    pu.locale_code,
    cr.schema_version,
    cr.payload
  from public.content_entities e
  join public.publication_units pu
    on pu.entity_id = e.id
  join public.content_revisions cr
    on cr.id = pu.published_revision_id
    and cr.publication_unit_id = pu.id
  where pu.published_revision_id is not null;
$$;

revoke all on function public.read_published_portfolio_content()
  from public, anon, authenticated;

grant execute on function public.read_published_portfolio_content()
  to anon, authenticated;

create view public.published_portfolio_content
with (security_invoker = true, security_barrier = true)
as
select *
from public.read_published_portfolio_content();

revoke all on public.published_portfolio_content
  from public, anon, authenticated;

grant select on public.published_portfolio_content
  to anon, authenticated;

comment on view public.published_portfolio_content is
  'Public read model exposing only published payloads through a restricted security-definer function.';

-- Explicit ownership for SECURITY DEFINER functions.
alter function private.is_active_admin() owner to postgres;
alter function public.read_published_portfolio_content() owner to postgres;