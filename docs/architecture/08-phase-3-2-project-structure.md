# Phase 3.2 --- Project Structure and Module Boundaries

**Status:** Proposed detailed design, pending user approval\
**Phase:** 3 --- Project Foundation\
**Scope:** Architecture design only; no source files are moved or
created in the application repository in this step.

## 1. Goals

The project structure must: - Separate application composition, business
rules, use cases, infrastructure, and UI. - Keep the Public Website
working while the Admin Panel is introduced. - Prevent React components
from depending directly on Supabase. - Allow the current static content
to act as a temporary data source. - Support independent localization,
publishing, media, Page Builder, and Design System modules. - Keep the
migration incremental and reversible. - Avoid creating empty
abstractions or excessive folder nesting before they are needed.

## 2. Proposed target structure

``` text
src/
├── app/
│   ├── App.tsx
│   ├── bootstrap/
│   │   └── createAppDependencies.ts
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── LocaleProvider.tsx
│   │   └── ThemeProvider.tsx
│   └── routing/
│       ├── routes.ts
│       ├── resolveRoute.ts
│       └── RouteView.tsx
│
├── domain/
│   ├── shared/
│   │   ├── Locale.ts
│   │   ├── EntityId.ts
│   │   └── Result.ts
│   ├── content/
│   │   ├── entities/
│   │   └── value-objects/
│   ├── localization/
│   ├── publishing/
│   ├── page-builder/
│   ├── design-system/
│   └── media/
│
├── application/
│   ├── shared/
│   │   ├── AppError.ts
│   │   └── UseCase.ts
│   ├── repositories/
│   ├── content/
│   │   ├── use-cases/
│   │   └── dto/
│   ├── localization/
│   ├── publishing/
│   ├── page-builder/
│   ├── design-system/
│   ├── media/
│   └── seo/
│
├── infrastructure/
│   ├── content/
│   │   └── static/
│   ├── localization/
│   ├── publishing/
│   ├── media/
│   ├── supabase/
│   │   ├── client/
│   │   ├── repositories/
│   │   └── mappers/
│   └── monitoring/
│
├── public-site/
│   ├── pages/
│   ├── sections/
│   ├── components/
│   └── blocks/
│
├── admin/
│   ├── shell/
│   ├── dashboard/
│   ├── content/
│   ├── localization/
│   ├── page-builder/
│   ├── design-system/
│   ├── media/
│   ├── seo/
│   ├── publishing/
│   └── settings/
│
├── shared/
│   ├── ui/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── styles/
│
├── content.ts                 # temporary legacy source during migration
├── locales.ts                 # temporary legacy locale source during migration
├── components.tsx             # temporary legacy component module during migration
├── App.tsx                    # temporary compatibility entry during migration
├── main.tsx
├── index.css
├── theme.css
└── vite-env.d.ts
```

This is a target map, not a requirement to create every directory
immediately. A directory is created when its first real module is
introduced. Empty placeholder folders are not useful.

## 3. Responsibility and dependency direction

### `domain/`

Owns business concepts and rules:
- Entity and value-object types.
- Invariants and domain validation.
- Domain-level policies and domain types.

Domain does not own application repository contracts or persistence
adapters. It must not import React, browser APIs, Vite, Supabase, or
storage SDKs.

Domain should not import from `application`, `infrastructure`, `admin`,
`public-site`, or `shared/ui`.

### `application/`

Owns use cases and orchestration:
- Load published portfolio content.
- Save Draft content.
- Validate a revision.
- Publish or rollback a Publication Unit.
- Resolve localized content.
- Manage media lifecycle through ports.
- Coordinate Page Builder and Design System operations.

Application defines the repository ports/contracts required by its use
cases under `application/repositories`. Application Services and Use
Cases depend on these contracts, not on Infrastructure implementations
or database SDKs. Application depends on Domain and must not import
React UI or the Supabase SDK.

### `infrastructure/`

Implements contracts defined by Application:
- Temporary Local/Static repository adapters during Phase 3.
- Supabase repository implementations and mappers when Phase 4 begins.
- Storage adapters.
- External service integrations.

Infrastructure may depend on Application contracts, Domain types, and
vendor SDKs. Domain and Application must never depend on Infrastructure.



### `app/`

Composition root: - Creates concrete dependencies. - Connects
providers. - Resolves routes. - Selects the Public or Admin application
surface. - Owns global application lifecycle.

Vendor-specific construction should be isolated here or in
infrastructure factories, not scattered across UI components.

### `public-site/`

Owns public-facing pages, sections, and public rendering components. It
can call application use cases through injected dependencies or
application-facing hooks. It must not query Supabase directly.

### `admin/`

Owns Admin Panel UI and feature workflows. It can call application use
cases. It must not implement security decisions in the browser or access
Supabase tables directly.

### `shared/`

Only genuinely cross-cutting, presentation-agnostic utilities and
reusable UI primitives belong here. A component used by only one feature
should stay inside that feature. Avoid turning `shared/` into a
miscellaneous dumping ground.

## 4. Dependency rules

Allowed high-level direction:

``` text
app
 ├── admin ───────────────┐
 ├── public-site ─────────┤
 └── application          │
        └── domain        │
                          │
infrastructure ──────────┘
   implements application repository contracts
```

More precise rules: 1. `domain` imports only from `domain` and approved
language/runtime primitives. 2. `application` imports from `domain` and `application/shared`, and
   owns repository contracts under `application/repositories`. 3.
   `infrastructure` implements Application repository contracts and
   may import Domain types and external SDKs. 4. `admin` and `public-site` import
application contracts/use cases and `shared` UI/utilities. 5. `admin`
and `public-site` must not import each other's feature internals. 6.
`shared` must not import from `admin`, `public-site`, `infrastructure`,
or feature-specific application modules. 7. `app` is the composition
root and may assemble the layers. 8. No circular dependencies. 9. No
direct Supabase SDK imports outside `infrastructure/supabase` (and
narrowly scoped bootstrap wiring if required). 10. No direct
`localStorage`, `document`, or `window` access in domain/application.
Browser persistence and document effects belong in providers/adapters.

The rules should initially be enforced by code review and import
conventions. Add automated boundary linting only when the required lint
tooling is selected and configured; do not add a dependency solely for
an abstract future possibility.

## 5. Type and contract ownership

-   Domain entity types live with their domain module.
-   Use-case input/output DTOs live in the relevant application module.
-   Supabase row types and generated database types live under
    infrastructure/Supabase.
-   UI-only view models stay with the relevant UI feature.
-   Shared primitives such as `Locale` and `Result` live in
    `domain/shared` only if they are genuinely used across domains.
-   Avoid a single global `types.ts` containing unrelated models.
-   Avoid importing database row types into UI components.

## 6. Current file migration map

  ---------------------------------------------------------------------------
  Current file            Target responsibility   Migration approach
  ----------------------- ----------------------- ---------------------------
  `src/main.tsx`          Application entry       Keep entry point; later
                                                  render `app/App`

  `src/App.tsx`           App composition +       Extract incrementally into
                          Public route/page       `app/` and `public-site/`;
                          behavior                retain compatibility export
                                                  until verified

  `src/content.ts`        Legacy static content   First preserve as legacy
                          adapter + initial       source; add mapper/static
                          domain mapping          repository; do not move
                                                  data and redesign schema in
                                                  one change

  `src/locales.ts`        Legacy UI translations  Initially keep as static
                                                  localization adapter; later
                                                  separate UI messages from
                                                  content translations

  `src/components.tsx`    Mixed reusable and      Split by responsibility;
                          Public UI components    Public-only components to
                                                  `public-site/components`,
                                                  genuinely shared primitives
                                                  to `shared/ui`

  `src/theme.css`         Existing Public theme   Preserve; later split token
                          tokens                  source from
                                                  generated/runtime theme
                                                  data

  `src/index.css`         Global and Public       Preserve initially; split
                          styles                  only alongside component
                                                  migration with visual
                                                  checks

  `src/vite-env.d.ts`     Vite type declarations  Keep at source root unless
                                                  a specific tooling
                                                  convention requires
                                                  otherwise

  `vite.config.ts`        Build and Figma tooling Keep at repository root;
                          configuration           audit Figma plugins
                                                  separately before changing

  `index.html`            HTML document shell     Keep at repository root;
                                                  resolve metadata/base-path
                                                  ownership in the relevant
                                                  SEO/build task
  ---------------------------------------------------------------------------

No file should be moved solely to make the tree look like the target.
Each move must have a reason, a narrow diff, and a passing verification
step.

## 7. Routing boundary

The current Hash routing should be retained initially.

Proposed responsibilities: - `app/routing/resolveRoute.ts`: parse
current location and return a typed route descriptor. -
`app/routing/routes.ts`: route definitions and route constants. -
`app/routing/RouteView.tsx`: render the correct surface. - Public route
components live under `public-site/pages`. - Admin route components live
under `admin`.

A browser-side Admin guard improves navigation UX only. Backend
authorization remains mandatory and is implemented in Phase 4.

Do not introduce React Router until a concrete requirement justifies the
dependency and migration cost.

## 8. Static repository bridge

Before Supabase is introduced, preserve the current site through a
static adapter: -
`infrastructure/content/static/StaticPortfolioRepository.ts` - It
reads/maps existing static content into the application contract. -
Public UI consumes the same application-facing contract that a future
Supabase adapter will implement. - This allows Phase 3 to establish
architecture without requiring Backend work. - The static adapter is
transitional and should have an explicit removal/replacement plan.

The adapter must not silently pretend that static content is dynamically
editable or published from an Admin Panel.

## 9. CSS and asset policy

-   Do not move all CSS in one bulk operation.
-   Preserve existing selectors and visual output during structural
    migration.
-   New Admin styles should be scoped to Admin shell/feature boundaries.
-   Public and Admin themes should not accidentally overwrite one
    another.
-   Asset URLs must be compatible with Vite `base`; avoid adding new
    root-absolute paths without checking GitHub Pages subpath
    deployment.
-   Theme values should eventually be consumed through semantic tokens,
    not hard-coded ad hoc in new components.

## 10. Testing strategy for structure changes

For each extraction or move: 1. Run TypeScript check. 2. Run the
existing portfolio verification script. 3. Run production build when the
environment/toolchain is available. 4. Test homepage, each project
detail route, unknown route, language switch, RTL, theme switch, contact
links, and project navigation. 5. Check browser console and network
errors. 6. Compare key viewport screenshots before/after. 7. Verify
deployment base path separately before release.

Add unit tests for route resolution, static repository mapping, and use
cases as they are introduced. Do not claim a test passed unless it was
actually executed.

## 11. Out of scope for Phase 3.2

-   Creating or editing source files.
-   Installing packages.
-   Setting up Supabase.
-   Creating database migrations.
-   Implementing Admin features.
-   Replacing the router.
-   Rewriting CSS or redesigning the Public Website.
-   Removing Figma plugins.
-   Deploying or changing Git state.

## 12. Approval checklist

Before implementation, confirm: - \[ \] Layer boundaries and dependency
direction. - \[ \] Target folder structure. - \[ \] Static repository
bridge as the migration strategy. - \[ \] Keeping current Hash routing
initially. - \[ \] Incremental file migration map. - \[ \] Figma Vite
plugins remain untouched pending separate audit.

After approval, implementation should start with the smallest
foundational slice, not mass file movement.
