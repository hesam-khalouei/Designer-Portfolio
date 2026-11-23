# Phase 3.2 — Project Structure & Dependency Architecture

**Status:** Proposed design, approved to proceed with detailed planning  
**Scope:** Architecture and migration plan only  
**Out of scope:** Moving source files, creating application modules, installing packages, configuring Supabase, database migrations, deployment

## 1. Goals

1. Preserve the existing portfolio's behavior and visual design.
2. Separate the public website, administration interface, application logic, domain model, and infrastructure.
3. Keep business logic independent of Supabase so a future self-hosted backend can replace the initial adapter.
4. Migrate incrementally; avoid a wholesale rewrite.
5. Make module ownership and dependency direction explicit.
6. Keep architecture decisions and implementation evidence in version-controlled Markdown documentation.

## 2. Target directory structure

```text
Designer-Portfolio/
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── phases/
│   └── operations/
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   ├── bootstrap/
│   │   ├── providers/
│   │   ├── routing/
│   │   └── config/
│   ├── domain/
│   │   ├── content/
│   │   ├── localization/
│   │   ├── publishing/
│   │   ├── media/
│   │   ├── design-system/
│   │   ├── seo/
│   │   └── identity/
│   ├── application/
│   │   ├── services/
│   │   ├── use-cases/
│   │   ├── repositories/
│   │   └── dto/
│   ├── infrastructure/
│   │   ├── supabase/
│   │   ├── repositories/
│   │   ├── storage/
│   │   ├── auth/
│   │   └── adapters/
│   ├── public-site/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── sections/
│   │   ├── blocks/
│   │   └── components/
│   ├── admin/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── content/
│   │   ├── localization/
│   │   ├── page-builder/
│   │   ├── design-system/
│   │   ├── media/
│   │   ├── seo/
│   │   ├── publishing/
│   │   └── settings/
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── constants/
│   │   └── styles/
│   ├── main.tsx
│   └── vite-env.d.ts
├── .figma/
├── AGENTS.md
├── CLAUDE.md
├── GEMINI.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

This is a target structure, not an instruction to create every directory immediately. A module directory should be introduced when its responsibility is implemented.

## 3. Module responsibilities

### `app/`
Composition root for the frontend: application bootstrap, providers, routing, environment configuration, and top-level assembly. It wires modules together but should not contain domain rules or database queries.

### `domain/`
Framework-independent business concepts, invariants, value objects, domain types, and domain-level policies. It must not import React, Vite, Supabase SDKs, browser UI components, or infrastructure implementations.

### `application/`
Use cases and application services. Defines the ports/contracts required by use cases, including repository interfaces. Coordinates domain behavior and returns application-level results. It must not depend on Supabase-specific types or SDKs.

### `infrastructure/`
Adapters that implement application contracts: initial Supabase repositories, authentication adapter, storage adapter, and future alternative backend adapters. Supabase-specific code stays here.

### `public-site/`
Public-facing layouts, pages, sections, trusted Page Builder block renderers, and presentation components. It consumes application-facing read services; it does not query Supabase directly.

### `admin/`
Admin layouts and feature modules: dashboard, content, localization, page builder, design system, media, SEO, publishing, and settings. It consumes application use cases and must not bypass them to access infrastructure.

### `shared/`
Truly reusable UI primitives, hooks, utilities, generic types, constants, and styles. It must not depend on `admin/` or `public-site/`. Avoid turning `shared/` into a dumping ground for feature-specific code.

## 4. Dependency rules

Allowed dependency direction:

```text
                 app
              /       \
       public-site    admin
              \       /
             application
                  |
                domain

infrastructure ---> application contracts
infrastructure ---> domain
```

More precisely:

| Consumer | May depend on | Must not depend on |
|---|---|---|
| Domain | Domain, minimal platform-neutral utilities | React, Vite, Supabase, Admin, Public Site |
| Application | Domain, application contracts | Supabase SDK, UI, browser components |
| Infrastructure | Application contracts, Domain | Admin/Public presentation modules |
| Public Site | Application public-facing services, Shared | Supabase SDK, Admin internals |
| Admin | Application use cases, Shared | Direct database access, Public Site internals |
| Shared | Platform-neutral shared modules | Admin, Public Site, Infrastructure |
| App | Module entry points and composition contracts | Duplicated business logic |

The infrastructure adapter implements ports defined inward (normally in Application). Runtime composition is performed by `app/`. No UI module imports a concrete Supabase repository.

## 5. Current-file migration map

| Current file | Target responsibility | Migration approach |
|---|---|---|
| `src/App.tsx` | `app/` composition plus `public-site/` pages/layout | Split incrementally; do not move wholesale before identifying boundaries |
| `src/components.tsx` | `shared/ui/` and `public-site/components/` | Classify each export by reuse and responsibility |
| `src/content.ts` | `domain/content/` types and application data access | Separate domain model, legacy seed data, and repository access |
| `src/locales.ts` | `domain/localization/` contracts plus UI locale resources | Separate UI labels from editable portfolio content |
| `src/theme.css` | `shared/styles/` initially; later Design System token output | Preserve current appearance while token model is introduced |
| `src/index.css` | `shared/styles/` and feature-owned styles | Split gradually; preserve responsive and RTL rules |
| `src/main.tsx` | `src/main.tsx` bootstrap | Keep as the stable Vite entry point |
| `src/vite-env.d.ts` | `src/vite-env.d.ts` | Keep at current location unless a concrete need arises |
| `vite.config.ts` | Repository root | Preserve Vite and Figma plugins initially; review separately |
| `scripts/` | Repository root | Preserve existing verification scripts |

No current source file should be deleted merely because its target module has been planned. A source is retired only after its replacement is integrated and verified.

## 6. TypeScript and import conventions

- Preserve the existing `@/` alias and align TypeScript and Vite resolution.
- Prefer explicit, traceable imports over deep chains of barrel exports.
- Avoid circular dependencies.
- Keep domain types separate from API DTOs, persistence records, and view models.
- Do not use `any` as an escape hatch for module boundaries.
- Introduce stricter compiler or lint rules only after checking compatibility with the current codebase.
- Do not add path aliases for every folder by default; use a small, stable set.

## 7. Routing and application composition

- Keep current hash-based public routing during the foundation phase.
- Do not introduce React Router solely for architectural fashion; revisit only when concrete route, nested-layout, or navigation requirements justify it.
- Admin routes must be separately composed and protected by real backend authorization when the backend phase is implemented. Hiding a link or route in the frontend is not security.
- `app/` owns route composition and provider setup.
- Public and Admin layouts remain independent, while generic primitives may be shared.

## 8. Page Builder boundary

- Store typed block data with stable block IDs, `block_type`, `schema_version`, and validated properties.
- Render only registered, trusted React components.
- Validate persisted block data before rendering and before publishing.
- Do not support arbitrary HTML, JavaScript, `eval`, or user-supplied executable code.
- Keep block schemas and renderers close to their owning feature, exposing only stable contracts where required.

## 9. Figma and Vite configuration

- Preserve existing Figma-specific Vite plugins during the initial structural migration.
- Do not remove or rewrite `vite.config.ts` as part of folder scaffolding.
- Review the current `base` behavior, Figma HTML injection slots, duplicated metadata risk, and `robots.index` behavior in a dedicated deployment/SEO task.
- Verify GitHub Pages repository-subpath behavior before production deployment.
- Keep build-time configuration separate from runtime CMS content.

## 10. Incremental implementation sequence

1. Record and commit the approved structure and dependency rules.
2. Establish the minimal directory skeleton required by the first implementation slice.
3. Confirm TypeScript and Vite alias consistency.
4. Extract a small set of genuinely shared UI primitives, with behavior and visual regression checks.
5. Separate Public Site composition from the application entry point.
6. Add the Admin shell as an independent route/layout without claiming frontend-only route hiding is authorization.
7. Define application repository contracts and result/error conventions.
8. Add infrastructure adapters only in the backend phase.
9. Migrate content and localization feature by feature.
10. Remove legacy modules only after references, tests, and build output confirm they are unused.

## 11. Definition of Done for Phase 3.2

- The target structure and module responsibilities are documented.
- Dependency direction is explicit and understood.
- Existing public portfolio behavior, routing, language switching, RTL, theme, responsive layouts, and case-study behavior are preserved.
- TypeScript compilation succeeds.
- Existing verification script succeeds.
- Production build succeeds.
- No Admin or Public UI module imports Supabase directly.
- No Domain/Application module imports React UI or Supabase SDKs.
- No legacy source is deleted before its replacement is verified.
- Changes and test evidence are recorded in a phase report.

## 12. Explicit non-goals

This phase does not:
- configure Supabase or create database tables;
- implement authentication or RLS;
- install packages without a demonstrated need;
- replace the current router by default;
- redesign the portfolio;
- migrate all content in one pass;
- create arbitrary HTML/JS Page Builder support;
- deploy or change GitHub settings.

## 13. Audit notes carried forward

- The existing project is a React/TypeScript/Vite SPA with static TypeScript content and no persistent CMS backend yet.
- Existing content and localization files have been reviewed; their current structures and known coupling points are recorded in the Phase 3.1 audit.
- `App.tsx` currently combines route selection, page composition, and some content-derived behavior; split responsibilities incrementally.
- Project-to-experience matching currently relies on fragile string comparisons and must become explicit relationships.
- Case-study section content and media rely on numeric positions; migrate to stable IDs and typed blocks.
- `MetricNumber` assumes a narrow numeric/percentage format; the future model should represent display values and accessible labels without parsing arbitrary strings.
- Theme tokens currently mix semantic, component, and decorative concerns; preserve visual output while introducing explicit token layers.
- Current fonts are Inter and Vazirmatn loaded externally; future Font Manager must validate actual script coverage and font metadata.
- The current HTML shell has initial SEO/social metadata; runtime metadata updates and static crawler behavior require a dedicated SEO strategy.
- Vite configuration contains Figma-specific plugins and a configurable `base`; preserve first, audit separately.
- The current Git working tree previously contained intentional `.gitattributes` modification and untracked audit artifacts; inspect `git status` before any future commit. Do not assume a clean tree.

## 14. Change-control rule

Any later deviation from these rules must be recorded as an Architecture Decision Record under `docs/decisions/`, including:
- context and problem;
- considered alternatives;
- decision and rationale;
- consequences and migration impact;
- date and status.

This document is the Phase 3.2 architecture baseline. Implementation reports must record actual files changed, commands run, test results, and known limitations. Planned work must never be reported as completed work.
