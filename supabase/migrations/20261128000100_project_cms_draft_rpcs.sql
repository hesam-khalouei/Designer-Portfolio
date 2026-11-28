-- Migration 3: Atomic Project CMS draft persistence.
-- All writes are performed through active-admin-only RPC functions.

revoke insert (entity_type, entity_key, sort_order)
  on table public.content_entities from authenticated;

revoke insert (entity_id, locale_code)
  on table public.publication_units from authenticated;

revoke insert (publication_unit_id, revision_number, schema_version, payload, checksum)
  on table public.content_revisions from authenticated;

revoke update (draft_revision_id)
  on table public.publication_units from authenticated;

create or replace function public.create_project_draft(
  p_project_key text,
  p_initial_locale text,
  p_sort_order integer,
  p_shared_payload jsonb,
  p_localized_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity_id uuid;
  v_shared_unit_id uuid;
  v_locale_unit_id uuid;
  v_shared_revision_id uuid;
  v_locale_revision_id uuid;
begin
  if not (select private.is_active_admin()) then
    raise exception using errcode = '42501', message = 'ACCESS_DENIED';
  end if;

  if p_project_key is null or length(pg_catalog.btrim(p_project_key)) = 0 then
    raise exception using errcode = '22023', message = 'INVALID_PROJECT_KEY';
  end if;

  if p_initial_locale is null or p_initial_locale not in ('en', 'fa', 'ar') then
    raise exception using errcode = '22023', message = 'INVALID_LOCALE';
  end if;

  if p_sort_order is null or p_sort_order < 0 then
    raise exception using errcode = '22023', message = 'INVALID_SORT_ORDER';
  end if;

  if p_shared_payload is null or pg_catalog.jsonb_typeof(p_shared_payload) <> 'object'
    or p_localized_payload is null or pg_catalog.jsonb_typeof(p_localized_payload) <> 'object' then
    raise exception using errcode = '22023', message = 'INVALID_PAYLOAD';
  end if;

  if pg_catalog.length(pg_catalog.btrim(coalesce(p_shared_payload ->> 'name', ''))) = 0
    or coalesce(p_shared_payload ->> 'device', '') not in ('phone', 'laptop', 'tablet', 'browser', 'monitor', 'multi') then
    raise exception using errcode = '22023', message = 'INVALID_SHARED_PROJECT_DATA';
  end if;

  insert into public.content_entities (entity_type, entity_key, sort_order)
  values ('project', p_project_key, p_sort_order)
  returning id into v_entity_id;

  insert into public.publication_units (entity_id, locale_code)
  values (v_entity_id, 'und')
  returning id into v_shared_unit_id;

  insert into public.content_revisions (
    publication_unit_id, revision_number, schema_version, payload, created_by
  )
  values (v_shared_unit_id, 1, 1, p_shared_payload, (select auth.uid()))
  returning id into v_shared_revision_id;

  update public.publication_units
  set draft_revision_id = v_shared_revision_id
  where id = v_shared_unit_id;

  insert into public.publication_units (entity_id, locale_code)
  values (v_entity_id, p_initial_locale)
  returning id into v_locale_unit_id;

  insert into public.content_revisions (
    publication_unit_id, revision_number, schema_version, payload, created_by
  )
  values (v_locale_unit_id, 1, 1, p_localized_payload, (select auth.uid()))
  returning id into v_locale_revision_id;

  update public.publication_units
  set draft_revision_id = v_locale_revision_id
  where id = v_locale_unit_id;

  return pg_catalog.jsonb_build_object(
    'project_id', p_project_key,
    'sort_order', p_sort_order,
    'shared_revision', 1,
    'revision', 1
  );
end;
$$;

create or replace function public.save_project_draft(
  p_project_key text,
  p_locale text,
  p_expected_revision integer,
  p_payload jsonb,
  p_sort_order integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity_id uuid;
  v_unit_id uuid;
  v_current_revision integer;
  v_next_revision integer;
  v_new_revision_id uuid;
  v_shared_revision integer;
begin
  if not (select private.is_active_admin()) then
    raise exception using errcode = '42501', message = 'ACCESS_DENIED';
  end if;

  if p_project_key is null or length(pg_catalog.btrim(p_project_key)) = 0 then
    raise exception using errcode = '22023', message = 'INVALID_PROJECT_KEY';
  end if;

  if p_locale is null or p_locale not in ('en', 'fa', 'ar', 'und') then
    raise exception using errcode = '22023', message = 'INVALID_LOCALE';
  end if;

  if p_expected_revision is not null and p_expected_revision < 1 then
    raise exception using errcode = '22023', message = 'INVALID_EXPECTED_REVISION';
  end if;

  if p_payload is null or pg_catalog.jsonb_typeof(p_payload) <> 'object' then
    raise exception using errcode = '22023', message = 'INVALID_PAYLOAD';
  end if;

  if p_locale = 'und' then
    if pg_catalog.length(pg_catalog.btrim(coalesce(p_payload ->> 'name', ''))) = 0
      or coalesce(p_payload ->> 'device', '') not in ('phone', 'laptop', 'tablet', 'browser', 'monitor', 'multi') then
      raise exception using errcode = '22023', message = 'INVALID_SHARED_PROJECT_DATA';
    end if;

    if p_sort_order is not null and p_sort_order < 0 then
      raise exception using errcode = '22023', message = 'INVALID_SORT_ORDER';
    end if;
  elsif p_sort_order is not null then
    raise exception using errcode = '22023', message = 'SORT_ORDER_REQUIRES_SHARED_LOCALE';
  end if;

  select id into v_entity_id
  from public.content_entities
  where entity_type = 'project'
    and entity_key = p_project_key
  for update;

  if v_entity_id is null then
    raise exception using errcode = 'P0002', message = 'NOT_FOUND';
  end if;

  select cr.revision_number into v_shared_revision
  from public.publication_units pu
  join public.content_revisions cr
    on cr.id = pu.draft_revision_id
    and cr.publication_unit_id = pu.id
  where pu.entity_id = v_entity_id
    and pu.locale_code = 'und';

  if p_locale <> 'und' and v_shared_revision is null then
    raise exception using errcode = 'P0002', message = 'SHARED_DRAFT_NOT_FOUND';
  end if;

  insert into public.publication_units (entity_id, locale_code)
  values (v_entity_id, p_locale)
  on conflict (entity_id, locale_code) do nothing;

  select id into v_unit_id
  from public.publication_units
  where entity_id = v_entity_id
    and locale_code = p_locale
  for update;

  select cr.revision_number into v_current_revision
  from public.content_revisions cr
  join public.publication_units pu
    on pu.draft_revision_id = cr.id
    and cr.publication_unit_id = pu.id
  where pu.id = v_unit_id;

  if v_current_revision is distinct from p_expected_revision then
    raise exception using errcode = 'P0001', message = 'REVISION_CONFLICT';
  end if;

  v_next_revision := coalesce(v_current_revision, 0) + 1;

  insert into public.content_revisions (
    publication_unit_id, revision_number, schema_version, payload, created_by
  )
  values (v_unit_id, v_next_revision, 1, p_payload, (select auth.uid()))
  returning id into v_new_revision_id;

  update public.publication_units
  set draft_revision_id = v_new_revision_id
  where id = v_unit_id;

  if p_locale = 'und' and p_sort_order is not null then
    update public.content_entities
    set sort_order = p_sort_order
    where id = v_entity_id;
  end if;

  if p_locale = 'und' then
    v_shared_revision := v_next_revision;
  end if;

  return pg_catalog.jsonb_build_object(
    'project_id', p_project_key,
    'locale', p_locale,
    'shared_revision', v_shared_revision,
    'revision', v_next_revision,
    'sort_order', case
      when p_locale = 'und' then coalesce(p_sort_order, (
        select sort_order from public.content_entities where id = v_entity_id
      ))
      else null
    end
  );
end;
$$;

alter function public.create_project_draft(text, text, integer, jsonb, jsonb) owner to postgres;
alter function public.save_project_draft(text, text, integer, jsonb, integer) owner to postgres;

revoke all on function public.create_project_draft(text, text, integer, jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function public.save_project_draft(text, text, integer, jsonb, integer)
  from public, anon, authenticated;

grant execute on function public.create_project_draft(text, text, integer, jsonb, jsonb)
  to authenticated;
grant execute on function public.save_project_draft(text, text, integer, jsonb, integer)
  to authenticated;
