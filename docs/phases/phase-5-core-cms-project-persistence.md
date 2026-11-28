# Phase 5 — Core CMS: Project Persistence Foundation

**Date:** 2026-11-28
**Status:** Persistence foundation implemented; UI not started.

## 1. Scope

Implemented the first Project CMS persistence batch:
- Application contracts for listing, reading, creating and saving project drafts.
- Shared (`und`) and locale-specific (`en`, `fa`, `ar`) draft data.
- Supabase repository adapter.
- Atomic database RPC migration for project creation and draft saving.
- Optimistic revision concurrency.
- Static tests for application, repository and migration behavior.

The work preserves the existing public PortfolioContent contract and does not change public website behavior.

## 2. Architecture

### Domain
- `ProjectDraft` models shared and localized draft data.
- `revision` identifies the requested locale revision.
- `sharedRevision` identifies the shared `und` revision.
- Project identity is represented by a stable project key.
- Sort order is independent of project identity.

### Application
- `ProjectDraftRepository` defines the persistence contract.
- Use cases:
  - `ListProjectDrafts`
  - `GetProjectDraft`
  - `CreateProject`
  - `SaveProjectDraft`
- `ProjectDraftError` provides typed persistence and concurrency errors.

### Infrastructure
- `SupabaseProjectDraftRepository` implements the repository.
- Reads shared and localized revisions independently.
- Uses chunked queries and pagination for larger project collections.
- Uses dedicated RPC operations for writes.
- Persistence errors are mapped to application-level errors.

### Database
Migration:
`supabase/migrations/20261128000100_project_cms_draft_rpcs.sql`

RPC functions:
- `create_project_draft`
- `save_project_draft`

The migration:
- Requires an active administrator.
- Revokes direct authenticated write privileges used by the RPC workflow.
- Creates the project entity, shared revision and initial locale revision atomically.
- Saves immutable revisions and advances draft pointers.
- Enforces optimistic concurrency.
- Updates project sort order through shared draft saves.
- Restricts RPC execution grants.

## 3. Localization and Draft Behavior

- Shared project data is stored in the `und` publication unit.
- Localized content is stored independently for `en`, `fa` and `ar`.
- Saving one locale does not overwrite another locale.
- Localized draft saving requires an existing shared draft.
- Project creation does not require complete case-study content or all translations.
- Shared and locale revision numbers are tracked separately.

## 4. Verification

### Application use cases
`node scripts/test-project-draft-use-cases.mjs`

Result: 5 tests passed.

### Supabase repository
`npx --yes pnpm@10.34.3 test:supabase-project-draft-repository`

Result: 7 tests passed.

### Migration static verification
`npx --yes pnpm@10.34.3 test:project-cms-migration`

Result: 12 verification groups passed.

### TypeScript
`npx --yes pnpm@10.34.3 exec tsc --noEmit`

Result: completed without reported errors.

### Git whitespace verification
`git diff --check`

Result: completed without reported errors. A line-ending warning for `package.json` was observed and is not a whitespace-check failure.

Node emitted a `module.register()` deprecation warning during Vite-based tests. It did not cause test failures.

## 5. Security and Runtime Limitations

- Migration was statically inspected only.
- No live Supabase connection was made.
- No SQL migration was executed against a database.
- RLS and RPC behavior have not been runtime-verified.
- No claim is made that MFA or AAL2 enforcement is implemented.
- No service-role key is used in browser code.
- Admin provisioning remains a separate trusted operation.

## 6. Not Included

- Project list or editor UI.
- Project category management.
- Page Builder or Block Editor.
- Dynamic Section Manager.
- Full localization workflow.
- Publish, rollback or archive operations.
- Live database migration or integration tests.

## 7. Next Batch

Build the actual Project CMS admin interface on top of the verified application and repository contracts:
- Dynamic project list.
- Create project flow.
- Project editing.
- Locale selection and independent draft editing.
- Sort-order management.

Preserve all existing project content and avoid hardcoded project counts or project-name assumptions.

## 8. Git

All current changes remain uncommitted and unstaged.
No commit or push was performed as part of this batch.
