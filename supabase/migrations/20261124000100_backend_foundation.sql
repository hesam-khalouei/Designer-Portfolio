-- Phase 4: Backend Foundation
-- Migration 1: Core relational schema

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index admin_profiles_single_active_admin
  on public.admin_profiles (is_active)
  where is_active = true;

create table public.content_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (
    entity_type in (
      'profile',
      'summary',
      'project',
      'experience',
      'metric',
      'capability',
      'service',
      'certification'
    )
  ),
  entity_key text not null check (length(btrim(entity_key)) > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_entities_entity_key_unique unique (entity_type, entity_key)
);

create table public.publication_units (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.content_entities(id) on delete restrict,
  locale_code text not null check (locale_code in ('en', 'fa', 'ar', 'und')),
  draft_revision_id uuid,
  published_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publication_units_entity_locale_unique unique (entity_id, locale_code),
  constraint publication_units_id_entity_unique unique (id, entity_id)
);

create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  publication_unit_id uuid not null references public.publication_units(id) on delete restrict,
  revision_number integer not null check (revision_number > 0),
  schema_version integer not null default 1 check (schema_version > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  checksum text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint content_revisions_unit_number_unique unique (publication_unit_id, revision_number),
  constraint content_revisions_id_unit_unique unique (id, publication_unit_id)
);

alter table public.publication_units
  add constraint publication_units_draft_revision_fk
  foreign key (draft_revision_id, id)
  references public.content_revisions (id, publication_unit_id)
  on delete restrict;

alter table public.publication_units
  add constraint publication_units_published_revision_fk
  foreign key (published_revision_id, id)
  references public.content_revisions (id, publication_unit_id)
  on delete restrict;

create table public.publish_events (
  id uuid primary key default gen_random_uuid(),
  publication_unit_id uuid not null references public.publication_units(id) on delete restrict,
  old_revision_id uuid,
  new_revision_id uuid,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('publish', 'rollback', 'unpublish')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  constraint publish_events_old_revision_fk
    foreign key (old_revision_id, publication_unit_id)
    references public.content_revisions (id, publication_unit_id)
    on delete restrict,
  constraint publish_events_new_revision_fk
    foreign key (new_revision_id, publication_unit_id)
    references public.content_revisions (id, publication_unit_id)
    on delete restrict,
  constraint publish_events_revision_action_check check (
    (action = 'unpublish' and new_revision_id is null)
    or
    (action in ('publish', 'rollback') and new_revision_id is not null)
  )
);

create index publication_units_entity_idx
  on public.publication_units (entity_id);

create index content_entities_order_idx
  on public.content_entities (entity_type, sort_order, entity_key);

create index content_revisions_created_at_idx
  on public.content_revisions (publication_unit_id, created_at desc);

create index publish_events_created_at_idx
  on public.publish_events (publication_unit_id, created_at desc);

comment on table public.admin_profiles is
  'Allowlisted administrator profiles linked to Supabase Auth users.';

comment on table public.content_entities is
  'Stable registry of publishable content entities.';

comment on table public.publication_units is
  'Independent publication lifecycle for each entity and locale, including und for shared data.';

comment on table public.content_revisions is
  'Immutable, versioned JSONB snapshots belonging to one publication unit.';

comment on table public.publish_events is
  'Audit history for publish, rollback, and unpublish operations.';
