# Phase 3.4 — Application Shell Design

## Status

**Approved design and implementation — LanguageProvider and ThemeProvider extraction, Hash Router Adapter, Public/Admin separation, Root Error Boundary, and dedicated routing regression coverage completed. TypeScript, production build, and UI regression verification passed; direct crash-path verification remains unperformed.**

No application source files are changed by this document.

## Objective

Introduce a stable application shell for the existing portfolio while preparing a separate Admin experience. Preserve the current public site, its visual design, hash-based navigation, language behavior, theme behavior, and existing verification coverage.

## Architectural shape

```text
src/
├── app/
│   ├── bootstrap/
│   │   ├── createApp.ts
│   │   └── initializeApp.ts
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── LanguageProvider.tsx
│   │   └── ThemeProvider.tsx
│   ├── routing/
│   │   ├── AppRouter.tsx
│   │   ├── routeConfig.ts
│   │   └── routeTypes.ts
│   └── config/
│       ├── appConfig.ts
│       └── environment.ts
├── public-site/
│   └── PublicApp.tsx
├── admin/
│   └── AdminApp.tsx
├── domain/
├── application/
├── infrastructure/
├── shared/
├── App.tsx
└── main.tsx
```

This is a target structure, not an instruction to create every file immediately. Files will be introduced incrementally as their responsibilities are migrated.

## Responsibilities

| Module           | Responsibility                                                     |
| ---------------- | ------------------------------------------------------------------ |
| `main.tsx`       | React DOM entry point and root mounting                            |
| `app/bootstrap`  | Compose and initialize application dependencies                    |
| `app/providers`  | Own shared React contexts and application-wide preferences         |
| `app/routing`    | Parse the current route and select the correct application surface |
| `app/config`     | Typed application and environment configuration                    |
| `public-site`    | Public portfolio experience                                        |
| `admin`          | Admin experience and its layout                                    |
| `application`    | Use cases, application services, and repository contracts          |
| `domain`         | Framework-independent domain model and rules                       |
| `infrastructure` | Supabase and other external adapters                               |
| `shared`         | Reusable primitives without dependencies on feature modules        |

## Startup flow

1. `main.tsx` locates the root DOM element and mounts React.
2. Bootstrap creates the application composition.
3. Configuration is read and validated.
4. Shared providers are mounted.
5. The router resolves the current hash route.
6. The router renders either the Public or Admin application surface.
7. Feature applications call application services through defined contracts; they do not import Supabase directly.

Repository and Supabase nodes describe the intended future dependency direction. They are not implemented in this phase.

## Providers

### Language provider

- Preserve `en`, `fa`, and `ar`.
- Preserve the existing `ahk-language` storage key and current default language (`en`).
- Own language changes and document `lang`/`dir` synchronization.
- Avoid duplicating translation content or introducing a second localization source.
- Do not force Public and Admin translations to share the same content model; the provider only exposes the active locale.

### Theme provider

- Preserve `light` and `dark`.
- Preserve the existing `ahk-theme` storage key and current default (`light`).
- Own theme changes, persistence, and `data-theme` synchronization.
- Keep design tokens in the existing theme system; do not move or redesign tokens during shell extraction.

### Provider composition

`AppProviders` composes only providers that are genuinely application-wide. Avoid adding a state-management library or global contexts for data that can remain local to a feature.

The current implementation composes `LanguageProvider` and `ThemeProvider` through `AppProviders`, mounted above the application in `main.tsx`.

Both providers must remain above the routing boundary so that Public and Admin application surfaces can access the shared locale and theme contexts.

## Routing

- Preserve the current hash-based routing in this phase.
- Do not add React Router or another routing dependency without a demonstrated requirement.
- Preserve all existing public routes, including all project/case-study URLs.
- Reserve an Admin route namespace (proposed: `#/admin`).
- An Admin route is not secure merely because it is hidden or routed separately. Real authentication, authorization, and backend enforcement belong to the security/backend phases.
- Unknown-route behavior must be explicitly tested and must not accidentally break the existing public fallback behavior during migration.

The existing routing implementation and its compatibility requirements are documented in:

`../phases/phase-3-5-1-routing-baseline-audit.md`

### Planned routing implementation sequence

The subsequent routing implementation is governed by the Phase 3.5.1 baseline audit and follows this sequence:

| Phase | Title                    | Status    |
| ----- | ------------------------ | --------- |
| 3.5.1 | Routing Baseline Audit   | Completed |
| 3.5.2 | Hash Router Adapter      | Completed |
| 3.5.3 | Public/Admin Separation  | Completed |
| 3.5.4 | Root Error Boundary      | Implemented — crash-path test not run |
| 3.5.5 | Routing Regression Tests | Completed |

Targeted regression tests must be added and executed during each implementation phase. Phase 3.5.5 completes and expands the dedicated routing regression coverage; it does not postpone testing until the end.

## Bootstrap and configuration

- `main.tsx` remains a thin entry point.
- Dependency construction belongs in the composition root under `app/bootstrap`.
- Environment access is centralized and typed.
- Do not add Supabase initialization, credentials, or backend calls in this phase.
- Keep dependencies injectable so tests can provide in-memory or mock implementations later.
- Never place service-role credentials or secrets in frontend configuration.

## Error handling

- Root-level React Error Boundary is implemented outside AppProviders, covering provider and application render/lifecycle errors.
- Keep expected application failures represented through the agreed `Result<T>` / `AppError` contracts in application services.
- Do not silently swallow unexpected errors.
- Error UI must respect current locale, direction, theme, and accessibility requirements.

## Incremental migration plan

1. Inspect current `main.tsx`, `App.tsx`, and the exact ownership of language/theme/navigation state.
2. Record current behavior and baseline test results.
3. Introduce typed app configuration without changing runtime behavior.
4. Extract language and theme state into providers while preserving storage keys and defaults. **Completed in Phases 3.4.2 and 3.4.3.**
5. Introduce the router adapter around the existing hash behavior. **Completed — Phase 3.5.2.**
6. Move the current public experience behind `PublicApp` without redesigning it. **Completed — Phase 3.5.3.**
7. Add the Admin route shell as a placeholder only when the routing boundary is stable; do not imply authentication is implemented. **Completed — Phase 3.5.3.**
8. Add the root Error Boundary and accessible fallback. **Implemented — Phase 3.5.4; direct crash-path verification not run.**
9. Run TypeScript, production build, and the full Playwright verification after each meaningful extraction.
10. Complete and expand dedicated routing regression coverage. **Completed — Phase 3.5.5.**
11. Remove old implementations only after their replacements pass the same behavior checks.

## Explicit non-goals

- No Supabase connection or database work.
- No authentication implementation.
- No new routing or state-management dependency.
- No wholesale rewrite of `App.tsx`.
- No visual redesign or content migration.
- No change to existing public URLs.
- No arbitrary HTML/JavaScript execution.
- No deployment or SEO indexing changes.

## Acceptance criteria

- Existing public site renders and behaves as before.
- All 3 locales and both themes continue to work and persist.
- Existing project and case-study routes remain valid.
- Admin route separation does not weaken security assumptions.
- `main.tsx` is a thin entry point.
- Public/Admin feature code does not import Supabase directly.
- Domain and application layers remain framework/infrastructure independent.
- TypeScript, production build, and Playwright UI verification pass.
- Each implementation step has a corresponding Markdown execution report.
- Routing regression tests cover the compatibility requirements established in Phase 3.5.1.

## Approval gate

Before implementation, confirm these decisions:

1. Keep hash routing and avoid adding a routing dependency.
2. Extract language and theme into shared providers, preserving current storage keys/defaults.
3. Keep a single React application composition root with separate Public and Admin route surfaces.
4. Reserve `#/admin` but do not claim it is protected until backend authentication and authorization exist.
5. Implement incrementally with full regression tests after each extraction.

These architectural decisions remain the approved baseline for the subsequent implementation phases.

## Implementation Record — Phase 3.4.2

**Date:** 2026-11-23  
**Status:** LanguageProvider extraction and regression verification completed.

- `LanguageProvider.tsx` owns active locale state, persistence, and document `lang`/`dir` synchronization.
- `AppProviders.tsx` composes the language provider.
- `App.tsx` consumes the shared language context; language-dependent metadata remains in `App.tsx`.
- `main.tsx` mounts the application inside `AppProviders`.
- TypeScript validation, production build, and reported browser regression tests passed.
- Theme state had not yet been extracted at the time of this implementation record. It was the next step, Phase 3.4.3.

See `../phases/phase-3-4-2-language-provider.md` for the execution report and verification details.

## Implementation Record — Phase 3.4.3

**Date:** 2026-11-23  
**Status:** ThemeProvider extraction and regression verification completed.

- `ThemeProvider.tsx` owns active theme state, persistence through `ahk-theme`, root `data-theme` synchronization, and `theme-color` synchronization.
- The default theme remains `light`; unavailable or invalid stored values fall back to `light`.
- `AppProviders.tsx` composes both `LanguageProvider` and `ThemeProvider`.
- `App.tsx` consumes the shared theme context through `useTheme()` and retains the existing theme toggle control.
- Existing CSS tokens, visual styling, language behavior, and hash-based routing were not redesigned.
- TypeScript validation, production build, and reported browser regression tests passed.
- Existing Vite configuration warnings remain outside this phase.

See `../phases/phase-3-4-3-theme-provider.md` for the execution report and verification details.
