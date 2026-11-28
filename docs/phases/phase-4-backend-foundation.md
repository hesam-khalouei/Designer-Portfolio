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
- `scripts/test-app-bootstrap.mjs`
- `scripts/test-supabase-migrations.mjs`
- `package.json`

## Verification evidence

| Check | Result |
|---|---|
| TypeScript strict check | PASS |
| Portfolio Content Decoder | 8 tests PASS |
| Supabase Portfolio Repository | 7 tests PASS |
| Application Bootstrap | 4 scenarios PASS |
| Supabase Migration Static Verification | 12 groups PASS |
| Admin Design System | 9 checks PASS |
| Public UI regression | PASS |
| Production build | PASS |

The Public UI regression covered English, Persian, and Arabic at 1440, 1280, 768, and 390 pixel viewports, Admin/Public route isolation, localization and preference persistence, mobile menu and Escape behavior, all 39 localized Case Studies, documented metrics, email behavior, and runtime-error checks.

### Application Bootstrap verification

Added `test:app-bootstrap` to verify application bootstrap source selection through isolated Vite SSR module loading.

- Missing `VITE_PORTFOLIO_CONTENT_SOURCE` selects Static and returns static portfolio content.
- Explicit `supabase` selects the Supabase Repository.
- An unconfigured Supabase client produces `SUPABASE_NOT_CONFIGURED`; no Static fallback occurs.
- Unsupported source values are rejected during bootstrap module evaluation.

Command: `npx --yes pnpm@10.34.3 run test:app-bootstrap` ? 4 scenarios PASS.

The test injects environment values into isolated Vite servers. It does not read or modify `.env.local`, connect to a database, or verify live Supabase behavior. Vite logs the expected invalid-source rejection during the negative test.

### Supabase Migration static verification

Added test:supabase-migrations to inspect both SQL migrations without connecting to PostgreSQL or executing database changes.

The 12 passing groups cover migration ordering, tables and RLS, identity and locale constraints, composite foreign keys, publish-event constraints, privileges, admin policies, immutable records, SECURITY DEFINER configuration, published-only reads, and public view grants.

Command: npx --yes pnpm@10.34.3 run test:supabase-migrations — 12 groups PASS.

Static SQL inspection only; PostgreSQL syntax/runtime validity, live grants, RLS behavior, and database security remain unverified. Live migration execution remains NOT RUN.

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

## Batch 4.6 — Authentication and Admin Access Design

**Status: Architecture review and authentication design completed; implementation NOT STARTED.**

### Scope

This batch reviewed the existing Supabase client, Admin shell, application routing, provider composition, database admin model, and approved security architecture. It defines the proposed Authentication and Admin access design without implementing login UI, session management, provisioning, MFA, or database changes.

### Documents reviewed

- `docs/operations/documentation-governance.md`
- `docs/README.md`
- `docs/architecture/02-architecture-decisions.md`
- `docs/architecture/03-data-model-and-publishing.md`
- `docs/architecture/04-security-storage-api.md`
- `docs/architecture/06-roadmap-and-phase-3.md`
- This Phase 4 report

### Current implementation findings

- `src/infrastructure/supabase/client.ts` creates an optional Supabase client and configures persistent sessions, automatic token refresh, and URL session detection.
- These SDK settings do not constitute an implemented Authentication lifecycle.
- `src/admin/AdminApp.tsx` currently renders the Admin shell without an authentication or active-admin check.
- `src/App.tsx` directly renders `AdminApp` for `#/admin`; no route guard currently exists.
- `AppProviders` currently composes only language and theme providers.
- No Application Authentication repository, use case, session provider, login flow, or MFA implementation exists.
- `admin_profiles.user_id` references `auth.users(id)`. The profile defaults to inactive, and a partial unique index permits at most one active admin.
- The security migration derives identity through `auth.uid()` and restricts administrative database access through `private.is_active_admin()`.
- Authenticated browser clients do not have direct privileges to provision or modify admin profiles.

### Confirmed security requirements

The following requirements are already established by the approved security architecture and remain unchanged:

- Supabase Auth is the initial Authentication provider.
- Public sign-up is disabled.
- The initial release supports one active admin account.
- Admin identity is derived from `auth.uid()`, never from a client-supplied user ID.
- TOTP MFA is recommended.
- Publish, Rollback, and security-sensitive operations require AAL2.
- Route visibility is not an authorization boundary. Backend authorization and RLS remain mandatory.
- Privileged publishing operations must use secure server-side functions rather than direct browser pointer updates.

### Proposed Authentication architecture

The implementation should preserve the existing dependency boundaries:

| Layer | Responsibility |
|---|---|
| Domain | Provider-neutral identity, session, and assurance concepts where needed |
| Application | Authentication repository contract and use cases |
| Infrastructure | Supabase Auth adapter and provider-specific error mapping |
| App Providers | Admin authentication state and lifecycle subscription |
| Admin Routing | User experience guard for signed-out and unauthorized states |
| Backend | Authoritative active-admin, RLS, and AAL2 enforcement |

The UI and Application layers must not depend on Supabase SDK types.

The proposed session lifecycle includes initial session resolution, subscription to authentication state changes, token refresh through the SDK, explicit sign-out, and subscription cleanup. Tokens must not be manually managed by application code.

The Admin access state should distinguish at least loading, anonymous, authenticated active admin, unauthorized/inactive account, and access-check failure. A failed or unavailable authorization check must never grant access.

### Login and admin provisioning

Email/password is the proposed initial login method, subject to confirmation before implementation. Public registration remains disabled.

Admin account creation and activation must use a controlled trusted provisioning process. The browser must not receive a Service Role key or gain profile-provisioning privileges.

An Auth session alone is insufficient for Admin access: the authenticated identity must also have an active `admin_profiles` record. Deactivation must deny database access even if an Auth session remains valid.

Account recovery and the operational provisioning procedure must be defined before production activation.

### MFA and elevated assurance

TOTP enrollment and verification should be part of the admin security workflow.

A normal authenticated session may have AAL1. Sensitive operations must require AAL2. Client-side assurance checks may guide the interface, but the backend must independently validate the assurance level before executing a privileged operation.

The current foundation migrations do not implement AAL2 enforcement or privileged publishing RPCs. These remain prerequisites before enabling Publish, Rollback, or security-management operations.

### Route guard and backend authorization

A future Admin route guard should prevent the Admin shell from appearing before authentication and active-admin checks complete. It should provide distinct login, loading, unauthorized, and recoverable error states.

This guard is a user-experience control only. RLS, trusted server-side operations, and database identity checks remain the actual security boundary.

### Verification plan for the future implementation

- Authentication repository contract tests using a fake provider.
- Initial session resolution and authentication-state subscription tests.
- Sign-in, sign-out, refresh, and subscription cleanup tests.
- Signed-out, active-admin, inactive-admin, and authorization-error route tests.
- TOTP enrollment and verification tests.
- AAL1 rejection and AAL2 acceptance tests for sensitive operations.
- Backend tests proving that client-supplied user IDs cannot grant admin access.
- Live controlled-database tests for active and inactive admin RLS behavior.
- Regression checks for Public routing, localization, and existing Static/Supabase content-source behavior.

### Verification record

| Check | Result |
|---|---|
| Existing Authentication and Admin source inspection | COMPLETED |
| Application routing and provider inspection | COMPLETED |
| Admin database model and security migration inspection | COMPLETED |
| Approved data-model and security architecture review | COMPLETED |
| Authentication implementation tests | NOT RUN — implementation not started |
| Live Supabase Authentication and RLS tests | NOT RUN |
| Database migrations or provisioning | NOT RUN |

### Files changed in this batch

Documentation-only changes are planned for:

- `docs/phases/phase-4-backend-foundation.md`
- `docs/architecture/04-security-storage-api.md`
- `docs/architecture/06-roadmap-and-phase-3.md`
- `docs/README.md`

No application source, dependency, environment, migration, or database changes are part of this batch.

### Remaining risks and follow-up

- Final login method and account recovery procedure require confirmation before implementation.
- Admin provisioning must be operationally defined and tested.
- Session storage and browser security protections must be reviewed against the final hosting architecture.
- TOTP enrollment, recovery, and AAL2 enforcement are not implemented.
- Route protection and backend authorization integration remain pending.
- Live Supabase behavior remains unverified.

**Batch 4.6 conclusion:** Authentication and Admin access design review completed. Implementation and live security verification remain pending.

## Batch 4.7 — Authentication Application Contract (2026-11-25)

### Scope and decisions

- Confirmed Email/Password through Supabase Auth as the initial login method.
- Public sign-up remains disabled; the initial release supports one active admin.
- Added provider-neutral Domain Authentication models:
  - `AdminIdentity`: stable identity ID and email.
  - `AdminSession`: identity, optional Unix-millisecond expiration timestamp, and assurance level.
  - `AuthAssuranceLevel`: `aal1` and `aal2`.
- Added the Application `AdminAuthRepository` contract for sign-in, current-session restoration, sign-out, and authentication-state subscription.
- Added `SignInAdmin`, `SignOutAdmin`, and `GetAdminSession` use cases.
- Added typed `AdminAuthError` codes for credentials, session, authorization, MFA, rate limiting, provider availability, and general operation failures.
- Authentication remains separate from active-admin authorization. A valid session alone does not authorize Admin access.
- No Supabase SDK dependency was added to Domain or Application.

### Verification

| Check | Result |
|---|---|
| Admin Authentication contract tests | 5 PASS |
| Portfolio content decoder | 8 PASS |
| Supabase portfolio repository | 7 PASS |
| Application bootstrap | 4 PASS |
| Static migration verification | 12 groups PASS |
| TypeScript strict check | PASS (exit 0) |
| Production build | PASS |

The authentication tests use a fake in-memory repository. They verify signed-out session restoration, successful sign-in, invalid credentials, sign-out notification, and typed authentication errors.

Node emitted a `DEP0205` deprecation warning during Vite SSR test execution. Tests completed successfully. The bootstrap test also intentionally exercises an invalid source value, which produces an expected Vite SSR error log before the test passes.

### Files added or changed

- `src/domain/auth/AdminIdentity.ts`
- `src/domain/auth/AdminSession.ts`
- `src/domain/auth/AuthAssuranceLevel.ts`
- `src/application/repositories/AdminAuthRepository.ts`
- `src/application/use-cases/SignInAdmin.ts`
- `src/application/use-cases/SignOutAdmin.ts`
- `src/application/use-cases/GetAdminSession.ts`
- `src/application/errors/AdminAuthError.ts`
- `scripts/test-admin-auth-contract.mjs`
- `package.json` — `test:admin-auth-contract` script

### Limitations and follow-up

- The fake repository verifies the Application contract only; no real Supabase Auth adapter exists yet.
- Login UI, Auth provider integration, session lifecycle integration, and route guard remain pending.
- Active-admin profile lookup and authorization remain a separate responsibility and are not implemented by this contract.
- TOTP enrollment, MFA verification, AAL2 enforcement, account provisioning, and recovery procedures remain pending.
- No live Supabase connection, migration execution, or database provisioning was performed.
- No commit or push was performed.

**Batch 4.7 conclusion:** Provider-neutral Domain and Application Authentication contracts and independent fake-repository tests are implemented and locally verified. This does not constitute production Authentication or Admin authorization.

## Batch 4.8 — Supabase Authentication Adapter (2026-11-25)

### Scope and implementation

- Implemented `SupabaseAdminAuthRepository` in Infrastructure behind the existing Application `AdminAuthRepository` contract.
- Added Supabase Session mapping to provider-neutral `AdminSession`:
  - Identity ID and email are validated.
  - Supabase expiry seconds are converted to Unix milliseconds.
  - Raw access and refresh tokens are not exposed through Domain/Application sessions.
  - Assurance is conservatively represented as `aal1`; no AAL2 claim is made.
- Implemented password sign-in, persisted-session restoration, sign-out, Authentication state subscription, and unsubscribe handling.
- Added provider error mapping for invalid credentials, expired/missing sessions, rate limits, network/provider failures, and generic operation failures.
- Authentication remains separate from active-admin authorization. The adapter does not treat a valid session as proof of an active admin profile.

### Verification

| Check | Result |
|---|---|
| Admin Authentication contract tests | 5 PASS |
| Supabase Admin Authentication adapter tests | 12 PASS |
| Portfolio content decoder | 8 PASS |
| Supabase portfolio repository | 7 PASS |
| Application bootstrap | 4 PASS |
| Static migration verification | 12 groups PASS |
| Admin Design System | PASS |
| Public UI regression (`test:ui`) | PASS |
| TypeScript strict check | PASS (exit 0) |
| Production build | PASS |

The UI regression suite was run against the already-running Vite Preview at `http://localhost:8443/` by setting `PREVIEW_URL`. It verified responsive layouts at 1440, 1280, 768, and 390 pixels in English, Persian, and Arabic; Admin route isolation; localization and preference persistence; mobile menu and Escape focus behavior; all 39 localized case studies; documented metrics; email behavior; and absence of runtime errors.

The Node `DEP0205` deprecation warning was observed during local test execution; it did not prevent successful test completion.

### Files added or changed

- `src/infrastructure/repositories/SupabaseAdminAuthRepository.ts`
- `scripts/test-supabase-admin-auth-repository.mjs`
- `package.json` — `test:supabase-admin-auth-repository` script
- Documentation updates are recorded in this report and the related architecture, roadmap, and index documents.

### Limitations and follow-up

- Verification uses a fake Supabase client; no live Supabase Auth request or database connection was made.
- No Login UI, Auth provider integration, or Admin route guard was implemented in this batch.
- Active-admin profile lookup, authorization, provisioning, and RLS runtime verification remain separate pending work.
- MFA enrollment/verification and authoritative AAL2 enforcement remain unimplemented. The adapter's `aal1` mapping must not be interpreted as MFA support.
- No migrations were executed and no account was provisioned.
- No commit or push was performed.

**Batch 4.8 conclusion:** The Supabase Authentication Infrastructure adapter and its isolated fake-client tests are implemented and locally verified. This does not constitute end-to-end Authentication, active-admin authorization, or production security verification.

### Batch 4.9 — React Authentication Lifecycle & Login Flow — 2026-11-25

Implemented:
- React `AdminAuthProvider` with session restoration, auth-state subscription, sign-in, sign-out, and loading/authenticated/unauthenticated/error states.
- Fail-closed behavior for session restoration and synchronous subscription-registration failures.
- Email/Password Admin login page with generic authentication error messages.
- Admin route gate. Public routes remain outside the Admin Authentication provider.
- Playwright fixture and lifecycle tests, including subscription failure.

Verification:
| Check | Result |
|---|---|
| Admin Authentication lifecycle | 10 PASS |
| Authentication Application contract | 5 PASS |
| Supabase Auth adapter fake-client tests | 12 PASS |
| Portfolio content decoder | 8 PASS |
| Supabase portfolio repository | 7 PASS |
| Application bootstrap | 4 PASS |
| Static migration verification | 12 groups PASS |
| Admin Design System | PASS |
| Public UI regression | PASS |
| TypeScript strict check | PASS |
| Oxfmt check on 5 changed files | PASS |
| Production build | PASS |

Security boundaries and limitations:
- The route gate is a UX boundary only. Backend authorization and RLS remain authoritative.
- A valid Auth session does not establish an active Admin profile.
- Admin provisioning, active-admin authorization integration, live Supabase Auth/database/RLS verification, MFA enrollment, and authoritative AAL2 enforcement remain pending.
- The adapter continues to map assurance conservatively to AAL1.
- No live migrations, account provisioning, or database operations were performed.
- No commit or push was performed.

**Batch 4.9 conclusion:** React Authentication lifecycle, login flow, and fail-closed Admin route gating are implemented and locally verified. This is not production authorization or MFA/AAL2 completion.

### Batch 4.10 — Active Admin Authorization & Authentication Race Protection — 2026-11-28

#### Implementation

- Implemented and verified `SupabaseAdminAuthorizationRepository` behind the Application `AdminAuthorizationRepository` contract.
- Active-admin authorization is checked through the authenticated Supabase client and the RLS-protected `admin_profiles` table.
- Missing or RLS-hidden profiles, malformed profile data, and `PGRST116` do not grant authorization.
- Database authorization failures map to `ACCESS_DENIED`; network/provider failures map to `AUTH_PROVIDER_UNAVAILABLE`.
- Added isolated fake-client tests for the authorization repository.
- Hardened `AdminAuthProvider` with a monotonic request-generation guard:
  - Older asynchronous authorization responses cannot overwrite newer authentication state.
  - Sign-in, sign-out, session restoration, and auth-state events are protected against stale asynchronous results.
  - Superseded operations cannot restore protected Admin UI after a newer sign-out event.
- Added a Playwright regression scenario reproducing the stale-authorization-response race.
- Removed temporary debugging output from the lifecycle test fixture and runner.

#### Verification

| Check | Result |
|---|---|
| Admin Authentication lifecycle | 14 PASS |
| Supabase Admin Authorization repository | 7 PASS |
| Supabase Admin Authentication repository | 12 PASS |
| TypeScript strict check | PASS |
| Oxfmt check on 5 changed files | PASS |
| Production build | PASS |
| Git diff whitespace check | PASS |

The lifecycle suite specifically verified that a delayed authorization response cannot restore authenticated access after sign-out. No browser runtime errors were reported.

The Node `DEP0205` deprecation warning appeared during test/build execution but did not prevent successful completion.

#### Files added or changed

- `src/admin/auth/AdminAuthProvider.tsx`
- `src/infrastructure/repositories/SupabaseAdminAuthorizationRepository.ts`
- `scripts/test-supabase-admin-authorization-repository.mjs`
- `scripts/test-admin-auth-lifecycle.mjs`
- `tests/admin/auth/main.tsx`
- `package.json` — authorization repository test script

#### Security boundaries and limitations

- The React route gate and request-generation guard protect client-side UI state; neither replaces backend authorization.
- Supabase RLS and database-side authorization remain authoritative.
- Tests use fake repositories/clients; no live Supabase Auth request, database connection, or RLS runtime verification was performed.
- No migrations were executed and no Admin account was provisioned.
- TOTP enrollment/verification and authoritative AAL2 enforcement remain pending.
- Account provisioning, recovery procedures, and emergency Admin replacement remain pending.
- No commit or push was performed.

**Batch 4.10 conclusion:** Active-admin authorization adapter integration and client-side stale-request protection are implemented and locally verified. The targeted Authentication and Authorization test suites pass. Production Supabase authorization, live RLS behavior, and MFA/AAL2 security requirements remain unverified or incomplete.
