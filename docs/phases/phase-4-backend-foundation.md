# Phase 4 - Backend Foundation

## Status

**Local implementation and verification completed for the current Backend Foundation scope - 2026-11-24.**

Live Supabase integration and operational security verification remain pending.

## Scope delivered

### Database and security foundation

- Authored the initial migrations for admin profiles, content entities, publication units, content revisions, and publish events.
- Added RLS policies, restricted grants, active-admin checks, immutable-record triggers, and a published-content read boundary.
- Added the published-content read function and view.
- Migrations have NOT been executed against the live Supabase project.

### Supabase client foundation

- Added the Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Missing configuration results in a null client.
- Environment values remain local and are not recorded here.
- Actual database connectivity has not been verified.

### Portfolio content decoder

- Added an Infrastructure-level decoder for published portfolio rows.
- Reconstructs the existing `PortfolioContent` aggregate.
- Validates row structure, entity types, locale completeness, duplicate identities/locales, sort order, schema version, payload shape, and Case Study section identifiers.
- Reconstructs localized `en`, `fa`, and `ar` values and preserves shared `und` fields.
- Maps semantic Case Study section keys to the existing numeric Public contract at the Infrastructure boundary.
- Added typed decoding errors and an isolated Vite SSR / Node assertion test suite.

### Supabase Portfolio Repository

- Added `SupabasePortfolioRepository` implementing the existing Application repository contract.
- Uses an injected client and reads only `published_portfolio_content`.
- Selects an explicit column list.
- Distinguishes missing configuration, read failures, invalid responses, and decoder failures.
- Does not silently fall back to static content.
- Added typed repository errors and an isolated test suite.
- Application bootstrap supports explicit Static/Supabase Repository selection through `VITE_PORTFOLIO_CONTENT_SOURCE`. Static remains the default; Supabase requires explicit opt-in.

## Architecture decisions preserved

- Domain and Application remain independent of the Supabase SDK.
- Supabase-specific code remains in Infrastructure.
- Existing `PortfolioContent` and Public contracts remain intact.
- Static content remains the default application data source. Setting `VITE_PORTFOLIO_CONTENT_SOURCE=supabase` explicitly selects Supabase; read failures do not silently fall back to Static.
- Published content is read through the dedicated public view.
- No implicit Project, Experience, or Metric relationships are introduced.
- Locale history and shared `und` data remain independent.
- CMS authoring, Page Builder, media processing, and complete publishing workflows remain outside this scope.

## Implementation files

- `supabase/migrations/20261124000100_backend_foundation.sql`
- `supabase/migrations/20261124000200_security_foundation.sql`
- `src/infrastructure/supabase/client.ts`
- `src/vite-env.d.ts`
- `src/infrastructure/content/supabase/portfolio-content-errors.ts`
- `src/infrastructure/content/supabase/portfolio-content-decoder.ts`
- `src/infrastructure/repositories/SupabasePortfolioRepository.ts`
- `src/infrastructure/repositories/supabase-portfolio-repository-errors.ts`
- `scripts/test-portfolio-content-decoder.mjs`
- `scripts/test-supabase-portfolio-repository.mjs`
- `package.json`

## Verification evidence

| Check | Result |
|---|---|
| TypeScript strict check | PASS |
| Portfolio Content Decoder | 8 tests PASS |
| Supabase Portfolio Repository | 7 tests PASS |
| Admin Design System | 9 checks PASS |
| Public UI regression | PASS |
| Production build | PASS |

The Public UI regression covered English, Persian, and Arabic at 1440, 1280, 768, and 390 pixel viewports, Admin/Public route isolation, localization and preference persistence, mobile menu and Escape behavior, all 39 localized Case Studies, documented metrics, email behavior, and runtime-error checks.

### Development server incident

An initial Public UI regression attempt failed because the existing Vite server served an untransformed Vite client containing an unresolved `__BUNDLED_DEV__` identifier. A fresh isolated Vite server transformed the client correctly. Restarting the existing server resolved the issue, after which rendering and the full Public UI regression suite passed.

No application source or dependency changes were needed to resolve this incident.

### Build note

The production build passed. Node emitted a non-blocking `DEP0205` deprecation warning concerning `module.register()`.

## Not completed / operational limitations

- Live Supabase migrations - NOT RUN.
- Live database connectivity and real query behavior - NOT VERIFIED.
- RLS policies, grants, SECURITY DEFINER ownership, and public-view behavior against a live Supabase instance - NOT VERIFIED.
- Authentication setup, admin provisioning, login UI, and MFA flows - NOT COMPLETED.
- Local Supabase Repository bootstrap selection - IMPLEMENTED; live Supabase connectivity and behavior - NOT VERIFIED.
- Live publishing, rollback, and unpublish operations - NOT IMPLEMENTED OR TESTED.
- Storage buckets and media upload workflows - OUT OF SCOPE.

Static code review and local fake-client tests are not substitutes for live database security verification.

## Documentation reviewed

- `AGENTS.md`
- `docs/README.md`
- `docs/operations/documentation-governance.md`
- `docs/architecture/02-architecture-decisions.md`
- `docs/architecture/03-data-model-and-publishing.md`
- `docs/architecture/04-security-storage-api.md`
- `docs/architecture/06-roadmap-and-phase-3.md`

## Documentation updated

- `docs/README.md`
- `docs/architecture/06-roadmap-and-phase-3.md`
- This Phase 4 execution report.

## Follow-up work

1. Review migration SQL and obtain explicit approval before applying it to the live Supabase project.
2. Apply migrations in a controlled environment and verify schema, constraints, grants, RLS, and published-view behavior.
3. Provision the authorized admin identity and verify authentication and admin authorization.
4. Add integration tests against a real Supabase test project.
5. Verify the explicit Supabase bootstrap path against a controlled Supabase test project after migrations and security checks pass.
6. Preserve Static as the default source until real Supabase integration is verified.

## Batch 4.3 — Migration Readiness & Security Review

**Status: Static migration and security review completed; live migration readiness remains conditional.**

### Scope

This batch reviewed the two Phase 4 SQL migrations, their dependency order, access-control design, local Supabase tooling readiness, and the consistency of the implementation with the approved architecture and security requirements.

No SQL migration was executed. No live Supabase connection was attempted. No database or application data was changed.

### Documents reviewed

- `AGENTS.md`
- `docs/README.md`
- `docs/operations/documentation-governance.md`
- `docs/architecture/02-architecture-decisions.md`
- `docs/architecture/03-data-model-and-publishing.md`
- `docs/architecture/04-security-storage-api.md`
- `docs/architecture/06-roadmap-and-phase-3.md`
- `docs/phases/phase-4-backend-foundation.md`

### Migration review

Reviewed:

- `supabase/migrations/20261124000100_backend_foundation.sql`
- `supabase/migrations/20261124000200_security_foundation.sql`

The schema migration defines the five approved foundation tables: `admin_profiles`, `content_entities`, `publication_units`, `content_revisions`, and `publish_events`.

The reviewed constraints include supported entity and locale values, non-negative ordering, unique entity keys and publication-unit locale pairs, positive revision/schema versions, JSON object payloads, and composite foreign keys that ensure draft and published revision pointers belong to their corresponding publication unit.

The security migration defines the private schema and admin-check function, timestamp and immutability triggers, RLS policies, explicit table/column grants, the published-content read function, and the restricted public view.

Static review confirmed the following design properties:

- RLS is enabled on all five foundation tables.
- Direct table access is revoked from `public`, `anon`, and `authenticated` before the intended authenticated grants are applied.
- Authenticated administrative policies rely on `private.is_active_admin()`.
- Revision and publish-event records have update/delete prevention triggers.
- Direct authenticated insertion into `publish_events` is not granted.
- The published-content function reads through `published_revision_id`; its output does not expose draft pointers.
- The public view uses `security_invoker` and `security_barrier`, with explicit function execution and view selection grants.
- Security-sensitive functions use an empty `search_path` and qualified object names; the relevant SECURITY DEFINER functions are assigned to `postgres`.

These are static SQL findings, not proof of runtime PostgreSQL or Supabase behavior.

### Ordering and migration execution model

The migration filenames establish the intended order: schema foundation first, security foundation second.

The circular revision-pointer relationship is handled by adding the composite foreign keys after the relevant tables exist.

The migration files are not designed for manual repeated execution: table, trigger, and policy creation statements do not generally use `IF NOT EXISTS`. This is acceptable for versioned migrations applied once through a migration runner while preserving migration history. `CREATE OR REPLACE FUNCTION` and `CREATE SCHEMA IF NOT EXISTS` do not make the complete migration files idempotent.

Do not manually rerun an already-applied migration or alter migration history to force a rerun.

### Security limitations and deferred requirements

- `FORCE ROW LEVEL SECURITY` is not enabled. The published-content SECURITY DEFINER function is intentionally owned by `postgres` and reads the published pointer. This bypass behavior must remain deliberate and its output must remain restricted.
- Anonymous, active-admin, and inactive-admin behavior has not been verified against a live database.
- The public view and SECURITY DEFINER execution path require controlled runtime verification.
- Admin provisioning, authentication UI, and MFA are not implemented.
- AAL2 enforcement is not present in these foundation migrations. It remains a requirement for future sensitive publishing, rollback, and security-management operations; those privileged RPCs are not implemented in this batch.
- Publishing, rollback, unpublish, audit workflow execution, and optimistic-concurrency enforcement remain future implementation work.
- Trigger-based immutability protects normal application roles, not database owners or superusers capable of changing triggers or schema objects.

The absence of AAL2 checks in the current foundation SQL is recorded as a deferred requirement for future privileged operations, not as evidence that an implemented publishing RPC is currently exposed.

### Local environment readiness

Observed local state:

- `supabase/` directory: present.
- `supabase/migrations/`: present.
- `supabase/config.toml`: absent.
- Supabase CLI command: unavailable in the inspected environment.
- `.env.local`: present.
- `VITE_SUPABASE_URL` key: present.
- `VITE_SUPABASE_PUBLISHABLE_KEY` key: present.
- `.env.local` ignore rule: confirmed by `git check-ignore`.

Secret values were not displayed or inspected in the report. No service-role key, database password, or other privileged secret was requested.

The missing CLI and local configuration mean the repository is not yet prepared for a local Supabase CLI workflow. Environment-key presence alone does not establish that the URL, key, project, or database connection is valid.

### Verification record

| Check | Result |
|---|---|
| Static review of both migration files | COMPLETED |
| Schema constraints and foreign-key dependency review | COMPLETED |
| Grants, RLS policies, triggers, and security-function review | COMPLETED |
| Migration ordering and rerun behavior review | COMPLETED |
| Local Supabase directory/config/CLI presence inspection | COMPLETED |
| Environment-key presence inspection without displaying values | COMPLETED |
| `.env.local` Git ignore check | PASS |
| Live Supabase connection | NOT RUN |
| Migration execution | NOT RUN |
| Anonymous/admin/inactive-admin database scenarios | NOT RUN |
| Live RLS, grants, view, and function behavior verification | NOT RUN |

No independent database test-scenario batch was introduced; that work remains intentionally outside this batch.

### Readiness conclusion

**Static design review: satisfactory with documented limitations.**

**Live migration execution: not yet approved or ready to proceed.**

Before a controlled database test, the project needs an explicitly selected test environment, a configured Supabase CLI/local project workflow or equivalent controlled database environment, and a reviewed migration application plan. The migrations must only be applied after explicit approval.

After application, runtime verification must establish the actual behavior of grants, RLS, the published view, and SECURITY DEFINER functions. Admin provisioning and authentication/MFA work remain separate prerequisites for exercising administrative workflows.

Static must remain the default application content source until the controlled Supabase integration is verified.

### Files changed in this batch

- `docs/phases/phase-4-backend-foundation.md` — this report section.
- `docs/README.md` — Phase 4 report index description.

No migration, application source, dependency, environment, or database files were changed in this batch.

### Follow-up work

1. Obtain approval before installing/configuring the local Supabase workflow or applying migrations to any database.
2. Select a controlled test project/environment and preserve migration history.
3. Apply the migrations once in that controlled environment after approval.
4. Verify anonymous, active-admin, and inactive-admin access, including the public view and SECURITY DEFINER execution path.
5. Implement and verify admin provisioning, authentication, MFA, and AAL2 enforcement for future privileged operations.
6. Implement secure publishing/rollback/unpublish operations with server-side authorization, audit events, idempotency, and optimistic concurrency.
7. Keep Static as the default source until real Supabase integration is verified.
