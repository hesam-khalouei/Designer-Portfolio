# Phase 3.5.3 — Public/Admin Separation

## Status

**Completed — implementation, TypeScript validation, production build, existing UI regression tests, and targeted Admin/routing tests passed.**

## Objective

Separate the existing public portfolio experience from the Admin route while preserving existing public behavior, hash URLs, language and theme providers, and the current application bootstrap.

## Approved Scope

- Keep `App.tsx` as the application routing boundary.
- Reserve the exact `#/admin` route for the Admin surface.
- Move the existing public experience behind `PublicApp`.
- Add a minimal localized Admin placeholder.
- Preserve `AppProviders` above the routing boundary.
- Preserve existing hash routing and public URLs.
- Preserve unknown-route and invalid-project fallback behavior.
- Add targeted tests for Admin/Public separation and preference persistence.
- Update affected architecture, roadmap, and documentation index records.

## Implementation

### Application routing boundary

`src/App.tsx` now reads the current hash route through the existing `useHashRoute` adapter.

- Exact `#/admin` renders `AdminApp`.
- Other routes render `PublicApp` and pass the current route as a prop.

### Public application

`src/public-site/PublicApp.tsx` contains the extracted public portfolio experience.

- Existing public content and components were retained.
- Route state is received from the root application shell.
- The component no longer subscribes independently to the hash router.
- Existing case-study and homepage fallback behavior remains in place.

### Admin placeholder

`src/admin/AdminApp.tsx` provides a minimal placeholder surface.

- Uses the existing language provider and locale content.
- Displays a localized title, explanatory text, and a link back to `#/`.
- Does not implement authentication, authorization, backend integration, or management functionality.

### Localization

Three UI keys were added to `src/locales.ts`:

- `adminTitle`
- `adminDescription`
- `adminBack`

English, Persian, and Arabic values were added using the existing locale structure.

### Provider and bootstrap preservation

`src/main.tsx` continues to mount `AppProviders` above `App`.

The existing language and theme providers therefore remain available across both application surfaces. Existing storage keys and defaults were not intentionally changed.

## Regression Verification

### TypeScript

- `npx tsc --noEmit`: executed after the Admin component and locale changes.
- The command produced no diagnostic output.

### Production build

- `npm run build`: passed.
- Vite completed the production build successfully.

Existing Vite configuration warnings remain:

- `__dirname` usage in `vite.config.ts`.
- JSON import of `./.figma/make/site.json` without import attributes.

These warnings were not introduced or addressed by this phase and remain outside its approved scope.

### Existing UI regression suite

`npm run test:ui`: passed.

Verified coverage included:

- Homepage layouts at 1440, 1280, 768, and 390 pixels.
- English, Persian, and Arabic.
- Mobile navigation and Escape focus behavior.
- Language and theme persistence.
- All 39 localized case-study combinations.
- Documented metrics, email link, and runtime error checks.

### Targeted Admin and routing tests

Additional assertions were added to `scripts/verify-portfolio.mjs`.

The targeted tests passed for:

- Direct navigation to `#/admin`.
- Admin title localization in English, Persian, and Arabic.
- Correct document language and text direction.
- Theme preference persistence on the Admin surface.
- Absence of the public hero and public header on Admin.
- Presence of the return-to-public link.
- Returning to the public experience.
- Invalid project route fallback.
- Unknown route fallback.

The final `npm run test:ui` execution passed both the targeted Admin checks and the existing regression suite.

## Security Boundary

The Admin route is a presentation and routing boundary only.

**`#/admin` is not authentication or authorization.**

No security guarantee is provided by hiding or separating a frontend route. Authentication, authorization, backend enforcement, and data access policies remain future work.

## Documentation Updated

- `docs/README.md`
  - Added the Phase 3.5.3 report index entry.
  - Marked Phase 3.5.3 completed.
  - Updated the next phase to 3.5.4.

- `docs/architecture/phase-3-4-application-shell-design.md`
  - Updated the overall implementation status.
  - Marked Phase 3.5.3 completed.
  - Updated the PublicApp and Admin placeholder execution steps.

- `docs/architecture/06-roadmap-and-phase-3.md`
  - Marked Phase 3.5.3 completed.

## Git Hygiene

- No Git staging was performed as part of this phase.
- No commit or push was performed.
- Existing unrelated working-tree changes and untracked files must remain untouched.
- Historical Phase 3.5.1 and 3.5.2 reports were not rewritten.

## Deferred Work

- Phase 3.5.4 — Root Error Boundary.
- Phase 3.5.5 — Dedicated routing regression coverage expansion.
- Admin authentication and authorization.
- Backend and CMS integration.

## Completion

Phase 3.5.3 is complete based on the implementation and validation results recorded above. The next planned implementation phase is Phase 3.5.4 — Root Error Boundary.
