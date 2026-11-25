import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const schemaPath = new URL("../supabase/migrations/20261124000100_backend_foundation.sql", import.meta.url);
const securityPath = new URL("../supabase/migrations/20261124000200_security_foundation.sql", import.meta.url);

const schema = readFileSync(schemaPath, "utf8");
const security = readFileSync(securityPath, "utf8");

let passed = 0;

function test(name, callback) {
  try {
    callback();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function match(source, pattern, message) {
  assert.match(source, pattern, message);
}

function table(name) {
  match(schema, new RegExp(`create table public\\.${name}\\s*\\(`, "i"), `${name} table must exist`);
  match(security, new RegExp(`alter table public\\.${name} enable row level security`, "i"), `${name} must enable RLS`);
}

test("migration files exist and preserve schema-before-security ordering", () => {
  assert.ok(schema.length > 0);
  assert.ok(security.length > 0);
  assert.match(schema, /Migration 1: Core relational schema/);
  assert.match(security, /Migration 2: Security, RLS/);
});

test("all five core tables exist and enable RLS", () => {
  for (const name of ["admin_profiles", "content_entities", "publication_units", "content_revisions", "publish_events"]) {
    table(name);
  }
});

test("single active admin and stable entity identity constraints exist", () => {
  match(schema, /unique index admin_profiles_single_active_admin[\s\S]*?where is_active = true/i);
  match(schema, /unique \(entity_type,\s*entity_key\)/i);
  match(schema, /entity_key text not null check \(length\(btrim\(entity_key\)\) > 0\)/i);
});

test("locale, revision, payload and publication constraints exist", () => {
  match(schema, /locale_code in \('en', 'fa', 'ar', 'und'\)/i);
  match(schema, /unique \(entity_id,\s*locale_code\)/i);
  match(schema, /revision_number integer not null check \(revision_number > 0\)/i);
  match(schema, /schema_version integer not null default 1 check \(schema_version > 0\)/i);
  match(schema, /jsonb_typeof\(payload\) = 'object'/i);
  match(schema, /unique \(publication_unit_id,\s*revision_number\)/i);
});

test("draft and published pointers use same-unit composite foreign keys", () => {
  match(schema, /foreign key \(draft_revision_id,\s*id\)\s*references public\.content_revisions \(id,\s*publication_unit_id\)/i);
  match(schema, /foreign key \(published_revision_id,\s*id\)\s*references public\.content_revisions \(id,\s*publication_unit_id\)/i);
});

test("publish events enforce revision ownership and action requirements", () => {
  match(schema, /foreign key \(old_revision_id,\s*publication_unit_id\)[\s\S]*?references public\.content_revisions \(id,\s*publication_unit_id\)/i);
  match(schema, /foreign key \(new_revision_id,\s*publication_unit_id\)[\s\S]*?references public\.content_revisions \(id,\s*publication_unit_id\)/i);
  match(schema, /action in \('publish', 'rollback', 'unpublish'\)/i);
  match(schema, /action = 'unpublish' and new_revision_id is null/i);
  match(schema, /action in \('publish', 'rollback'\) and new_revision_id is not null/i);
});

test("private schema and table privileges are restricted", () => {
  match(security, /revoke all on schema private from public,\s*anon,\s*authenticated/i);
  match(security, /grant usage on schema private to authenticated/i);
  match(security, /revoke all on table[\s\S]*?public\.publish_events[\s\S]*?from public,\s*anon,\s*authenticated/i);
  match(security, /grant update \(draft_revision_id\) on public\.publication_units to authenticated/i);
  match(security, /grant insert \([\s\S]*?checksum[\s\S]*?\) on public\.content_revisions to authenticated/i);
  assert.doesNotMatch(security, /grant\s+insert\s+on\s+public\.publish_events/i);
});

test("admin policies require active administrator authorization", () => {
  const policies = security.match(/create policy [\s\S]*?(?=create policy|create or replace function public\.read_published_portfolio_content)/gi) ?? [];
  assert.ok(policies.length >= 8, "Expected policies for protected tables");
  for (const policy of policies) {
    match(policy, /to authenticated/i);
    match(policy, /private\.is_active_admin\(\)/i);
  }
  match(security, /ap\.user_id = \(select auth\.uid\(\)\)[\s\S]*?ap\.is_active = true/i);
  match(security, /created_by = \(select auth\.uid\(\)\)/i);
});

test("revision and publication event records are immutable", () => {
  match(security, /create or replace function private\.prevent_record_mutation\(\)[\s\S]*?raise exception[\s\S]*?errcode = '55000'/i);
  match(security, /create trigger content_revisions_immutable\s*before update or delete on public\.content_revisions/i);
  match(security, /create trigger publish_events_immutable\s*before update or delete on public\.publish_events/i);
});

test("security definer functions use an empty search path and restricted ownership", () => {
  const functions = security.match(/create or replace function [\s\S]*?\$\$;/gi) ?? [];
  const definers = functions.filter((definition) => /security definer/i.test(definition));
  assert.equal(definers.length, 2, "Expected exactly two SECURITY DEFINER functions");
  for (const definition of definers) {
    match(definition, /set search_path = ''/i);
  }
  match(security, /alter function private\.is_active_admin\(\) owner to postgres/i);
  match(security, /alter function public\.read_published_portfolio_content\(\) owner to postgres/i);
  match(security, /revoke all on function private\.is_active_admin\(\) from public,\s*anon/i);
  match(security, /grant execute on function private\.is_active_admin\(\) to authenticated/i);
});

test("public read function exposes only published revision data", () => {
  const start = security.indexOf("create or replace function public.read_published_portfolio_content()");
  const end = security.indexOf("$$;", start);
  assert.ok(start >= 0 && end > start, "Public read function definition must exist");
  const definition = security.slice(start, end);
  match(definition, /security definer/i);
  match(definition, /set search_path = ''/i);
  match(definition, /cr\.id = pu\.published_revision_id/i);
  match(definition, /cr\.publication_unit_id = pu\.id/i);
  match(definition, /where pu\.published_revision_id is not null/i);
  assert.doesNotMatch(definition, /draft_revision_id/i);
  assert.doesNotMatch(definition, /admin_profiles/i);
});

test("public view uses restricted security options and read-only grants", () => {
  match(security, /create view public\.published_portfolio_content\s*with \(security_invoker = true,\s*security_barrier = true\)/i);
  match(security, /from public\.read_published_portfolio_content\(\)/i);
  match(security, /revoke all on public\.published_portfolio_content\s*from public,\s*anon,\s*authenticated/i);
  match(security, /grant select on public\.published_portfolio_content\s*to anon,\s*authenticated/i);
  match(security, /grant execute on function public\.read_published_portfolio_content\(\)\s*to anon,\s*authenticated/i);
});

console.log(`\n${passed} migration static verification groups passed.`);
console.log("Static SQL inspection only; no database connection or migration execution was performed.");
