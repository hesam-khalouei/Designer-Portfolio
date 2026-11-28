import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const path = new URL("../supabase/migrations/20261128000100_project_cms_draft_rpcs.sql", import.meta.url);
const migration = readFileSync(path, "utf8");

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

function functionDefinition(name) {
  const start = migration.indexOf(`create or replace function public.${name}(`);
  assert.ok(start >= 0, `${name} definition must exist`);
  const end = migration.indexOf("$$;", start);
  assert.ok(end > start, `${name} body must terminate`);
  return migration.slice(start, end + 3);
}

const createFunction = functionDefinition("create_project_draft");
const saveFunction = functionDefinition("save_project_draft");

test("migration defines exactly two project CMS RPC functions", () => {
  const definitions = migration.match(/create or replace function public\.(?:create_project_draft|save_project_draft)\(/gi) ?? [];
  assert.equal(definitions.length, 2);
});

test("direct authenticated write privileges are revoked", () => {
  match(migration, /revoke insert \(entity_type,\s*entity_key,\s*sort_order\)[\s\S]*?content_entities from authenticated/i);
  match(migration, /revoke insert \(entity_id,\s*locale_code\)[\s\S]*?publication_units from authenticated/i);
  match(migration, /revoke insert \(publication_unit_id,\s*revision_number,\s*schema_version,\s*payload,\s*checksum\)[\s\S]*?content_revisions from authenticated/i);
  match(migration, /revoke update \(draft_revision_id\)[\s\S]*?publication_units from authenticated/i);
});

test("both RPC functions require active administrator authorization", () => {
  for (const definition of [createFunction, saveFunction]) {
    match(definition, /private\.is_active_admin\(\)/i);
    match(definition, /errcode = '42501',\s*message = 'ACCESS_DENIED'/i);
    match(definition, /security definer/i);
    match(definition, /set search_path = ''/i);
  }
});

test("project creation validates stable identity, locale, order and payload", () => {
  match(createFunction, /p_project_key is null[\s\S]*?INVALID_PROJECT_KEY/i);
  match(createFunction, /p_initial_locale is null[\s\S]*?INVALID_LOCALE/i);
  match(createFunction, /p_sort_order is null or p_sort_order < 0/i);
  match(createFunction, /p_shared_payload is null[\s\S]*?p_localized_payload is null/i);
  match(createFunction, /INVALID_SHARED_PROJECT_DATA/i);
});

test("project creation atomically creates shared and initial locale revisions", () => {
  match(createFunction, /insert into public\.content_entities[\s\S]*?values \('project',\s*p_project_key,\s*p_sort_order\)/i);
  match(createFunction, /values \(v_entity_id,\s*'und'\)/i);
  match(createFunction, /values \(v_shared_unit_id,\s*1,\s*1,\s*p_shared_payload/i);
  match(createFunction, /values \(v_entity_id,\s*p_initial_locale\)/i);
  match(createFunction, /values \(v_locale_unit_id,\s*1,\s*1,\s*p_localized_payload/i);
  match(createFunction, /set draft_revision_id = v_shared_revision_id/i);
  match(createFunction, /set draft_revision_id = v_locale_revision_id/i);
});

test("draft save validates locale, expected revision and payload", () => {
  match(saveFunction, /p_locale is null or p_locale not in \('en',\s*'fa',\s*'ar',\s*'und'\)/i);
  match(saveFunction, /p_expected_revision is not null and p_expected_revision < 1/i);
  match(saveFunction, /p_payload is null or pg_catalog\.jsonb_typeof\(p_payload\) <> 'object'/i);
  match(saveFunction, /INVALID_SHARED_PROJECT_DATA/i);
});

test("draft save locks the entity and publication unit", () => {
  match(saveFunction, /from public\.content_entities[\s\S]*?for update/i);
  match(saveFunction, /from public\.publication_units[\s\S]*?for update/i);
});

test("localized drafts require an existing shared draft", () => {
  match(saveFunction, /pu\.locale_code = 'und'/i);
  match(saveFunction, /if p_locale <> 'und' and v_shared_revision is null then[\s\S]*?SHARED_DRAFT_NOT_FOUND/i);
});

test("optimistic concurrency rejects stale revisions", () => {
  match(saveFunction, /v_current_revision is distinct from p_expected_revision/i);
  match(saveFunction, /REVISION_CONFLICT/i);
  match(saveFunction, /v_next_revision := coalesce\(v_current_revision,\s*0\) \+ 1/i);
});

test("draft revisions are inserted immutably and pointers advance afterward", () => {
  const insertPosition = saveFunction.indexOf("insert into public.content_revisions");
  const pointerPosition = saveFunction.indexOf("set draft_revision_id = v_new_revision_id");
  assert.ok(insertPosition >= 0 && pointerPosition > insertPosition);
  match(saveFunction, /created_by[\s\S]*?\(select auth\.uid\(\)\)/i);
});

test("shared revision and sort order are returned consistently", () => {
  match(saveFunction, /if p_locale = 'und' then\s*v_shared_revision := v_next_revision/i);
  match(saveFunction, /'shared_revision',\s*v_shared_revision/i);
  match(saveFunction, /'revision',\s*v_next_revision/i);
  match(saveFunction, /p_locale = 'und' and p_sort_order is not null/i);
  match(saveFunction, /SORT_ORDER_REQUIRES_SHARED_LOCALE/i);
});

test("RPC ownership, execute grants and public access restrictions are explicit", () => {
  match(migration, /alter function public\.create_project_draft\(text,\s*text,\s*integer,\s*jsonb,\s*jsonb\) owner to postgres/i);
  match(migration, /alter function public\.save_project_draft\(text,\s*text,\s*integer,\s*jsonb,\s*integer\) owner to postgres/i);
  match(migration, /revoke all on function public\.create_project_draft[\s\S]*?from public,\s*anon,\s*authenticated/i);
  match(migration, /revoke all on function public\.save_project_draft[\s\S]*?from public,\s*anon,\s*authenticated/i);
  match(migration, /grant execute on function public\.create_project_draft[\s\S]*?to authenticated/i);
  match(migration, /grant execute on function public\.save_project_draft[\s\S]*?to authenticated/i);
});

console.log(`\n${passed} Project CMS migration static verification groups passed.`);
console.log("Static SQL inspection only; no PostgreSQL connection or migration execution was performed.");
