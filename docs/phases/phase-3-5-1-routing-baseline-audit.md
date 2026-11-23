# Phase 3.5.1 — Routing Baseline Audit

## Status

Completed — Read-only audit

## Objective

Document the existing Hash Routing behavior and establish compatibility requirements before extracting routing logic and separating Public/Admin application surfaces.

## Scope

- Inspect existing route state and hashchange handling.
- Identify page routes and in-page anchors.
- Inspect Case Study navigation and fallback behavior.
- Review existing Playwright verification coverage.
- Inspect the existing application providers and their composition.
- Verify current routing dependencies.
- Establish routing compatibility requirements.

No source code was modified during this audit.

## Findings

### Existing routing implementation

The current routing logic resides in `src/App.tsx`.

Responsibilities include:

- Reading `window.location.hash`.
- Listening to the `hashchange` event.
- Resolving Case Study projects using their IDs.
- Scrolling to page anchors.
- Closing the mobile navigation after route changes.

The current implementation combines route state management, route resolution, and parts of the Public application rendering within `App.tsx`.

### Route categories

| Category        | Examples                    | Current behavior                              |
| --------------- | --------------------------- | --------------------------------------------- |
| Home            | `#/`                        | Public homepage                               |
| Case Study      | `#/work/postex`             | Renders the matching project                  |
| Page anchor     | `#work`, `#contact`, `#top` | Scrolls to the matching element               |
| Invalid project | `#/work/invalid-id`         | Falls back to the existing homepage rendering |
| Admin           | `#/admin`                   | Not implemented                               |

### Route references

Public Case Study links are generated in:

- `src/App.tsx`
- `src/components.tsx`

The current application uses native anchor links and browser Hash Routing.

### Existing application providers

The application providers are located in `src/app/providers/`.

The current provider composition is implemented in:

`src/app/providers/AppProviders.tsx`

`AppProviders` composes both:

- `LanguageProvider`
- `ThemeProvider`

The provider composition is installed above the application in `src/main.tsx`.

Both providers currently preserve their existing storage contracts:

| Provider         | Storage key    | Supported values | Default |
| ---------------- | -------------- | ---------------- | ------- |
| LanguageProvider | `ahk-language` | `en`, `fa`, `ar` | `en`    |
| ThemeProvider    | `ahk-theme`    | `light`, `dark`  | `light` |

The providers also maintain their existing document-level behavior, including language and text direction, theme attributes, and theme-color synchronization.

The routing extraction must preserve these providers above the Public/Admin route boundary. Provider behavior and persistence must not regress during application-shell changes.

### Routing dependencies

The project does not currently have `react-router` or `react-router-dom` installed as top-level dependencies.

The existing routing implementation relies on native browser Hash Routing.

No additional routing dependency is justified by the current baseline findings.

### Existing verification coverage

`scripts/verify-portfolio.mjs` currently verifies:

- 1440, 1280, 768 and 390 pixel layouts.
- English, Persian and Arabic.
- RTL/LTR direction.
- Theme and language persistence.
- Mobile navigation and Escape focus restoration.
- All 13 project links and 39 localized Case Study combinations.
- Case Study structure and documented metrics.
- Skip Link behavior.
- Email link validity.
- Runtime JavaScript errors.

The existing Playwright suite provides meaningful regression coverage for the Public Portfolio.

However, the audit identified no explicit dedicated tests for:

- Admin routing.
- Unknown routes.
- Invalid project IDs.
- Anchor navigation after route transitions.
- Browser back/forward routing behavior.

These gaps must be addressed incrementally during routing implementation.

### Git and implementation scope

This phase was a read-only audit.

No application source code was modified as part of this audit.

The purpose of this phase was to establish the existing implementation baseline, identify dependencies and regression risks, and define the boundaries for subsequent implementation work.

Existing working-tree changes and untracked files are outside the scope of this audit and must not be modified, staged, or removed as part of the routing baseline work without separate inspection and approval.

## Architectural Decisions

1. Preserve Hash Routing.
2. Do not introduce React Router.
3. Preserve existing Public URLs and native anchor behavior.
4. Reserve `#/admin` for the Admin application.
5. Separate Public and Admin rendering explicitly.
6. Keep route resolution independent from authentication and authorization.
7. Do not claim that client-side route separation provides security.
8. Preserve existing invalid-project fallback behavior during the initial extraction.
9. Add explicit routing regression tests.
10. Keep `AppProviders` above the routing boundary so both LanguageProvider and ThemeProvider remain available to all application surfaces.
11. Preserve the existing language and theme storage contracts.
12. Implement routing changes incrementally without unnecessary Public Portfolio rewrites.

## Expected Implementation Boundaries

- `src/app/routing/`: route parsing and route state management.
- `src/public-site/`: Public application surface, extracted incrementally.
- `src/admin/`: Admin application surface.
- `src/app/`: shared application composition, providers, and error handling.

The implementation must preserve existing providers and avoid unnecessary changes to the Public Site.

These directories describe the intended architectural boundaries. Their final structure may be refined during implementation when justified by the existing codebase.

## Implementation Readiness

The baseline audit confirms that the project is ready to begin Phase 3.5.2 — Hash Router Adapter, subject to the following implementation constraints:

- Preserve the existing browser Hash Routing mechanism.
- Do not add `react-router`, `react-router-dom`, or another routing dependency without a separately approved architectural decision.
- Keep `AppProviders` above the routing boundary.
- Preserve LanguageProvider and ThemeProvider behavior, including their storage keys and supported values.
- Preserve existing Public URLs, Case Study navigation, page anchors, and invalid-project fallback behavior.
- Introduce route parsing and route state management incrementally.
- Keep Admin route separation independent from authentication and authorization.
- Do not treat `#/admin` or client-side route separation as a security boundary.
- Add and run targeted regression tests as each routing capability is implemented.
- Preserve the existing Public Portfolio layout, responsive behavior, localization, theme behavior, and interactions.

The following implementation sequence is approved as the planned continuation of the routing work:

| Phase | Title                    | Status    |
| ----- | ------------------------ | --------- |
| 3.5.1 | Routing Baseline Audit   | Completed |
| 3.5.2 | Hash Router Adapter      | Planned   |
| 3.5.3 | Public/Admin Separation  | Planned   |
| 3.5.4 | Root Error Boundary      | Planned   |
| 3.5.5 | Routing Regression Tests | Planned   |

Testing is not deferred until Phase 3.5.5. Each implementation phase must include the relevant targeted verification. Phase 3.5.5 is intended to complete and expand the dedicated routing regression coverage.

## Verification Requirements

The following checks are required during the subsequent implementation phases:

- TypeScript check.
- Production build.
- Existing `test:ui`.
- Direct navigation to existing Case Study routes.
- Browser back/forward navigation.
- Page anchor navigation.
- Admin route separation.
- Unknown route and invalid project behavior.
- All three locales and both themes.
- Language and theme persistence.
- No new runtime errors or Public layout regressions.
- Preservation of existing mobile navigation and accessibility behavior.

The exact test coverage must be expanded as each relevant routing capability is introduced.

## Files Inspected

- `src/App.tsx`
- `src/components.tsx`
- `src/main.tsx`
- `src/app/providers/AppProviders.tsx`
- `src/app/providers/LanguageProvider.tsx`
- `src/app/providers/ThemeProvider.tsx`
- `scripts/verify-portfolio.mjs`
- `package.json`
- Relevant architecture and governance documentation.

## Result

The existing routing implementation is sufficiently small to extract incrementally.

The audit confirms:

- Existing Hash Routing can be preserved without introducing another routing dependency.
- Both application providers are already extracted and composed through `AppProviders`.
- Existing provider storage contracts are established and must remain compatible.
- The current Playwright suite provides broad Public Portfolio regression coverage.
- Dedicated routing regression coverage remains an implementation requirement.
- Public/Admin separation can be introduced incrementally without rewriting the Public Portfolio.

No additional routing dependency or architectural rewrite is justified.

## Open Work

- Implement the Hash Router Adapter in Phase 3.5.2.
- Separate Public and Admin route surfaces in Phase 3.5.3.
- Add the root Error Boundary in Phase 3.5.4.
- Complete and expand routing regression tests in Phase 3.5.5.
- Update the architecture documentation and documentation index after each relevant implementation phase.
