# Phase 3.5.2 — Hash Router Adapter

## Status

**Completed — implementation and targeted regression verification passed.**

**Date:** 2026-11-23

## Objective

Extract the existing browser Hash Routing subscription into a small React adapter while preserving the current public portfolio behavior and avoiding a new routing dependency.

## Scope

- Introduce a reusable hash route subscription adapter.
- Use React `useSyncExternalStore` to subscribe to browser hash changes.
- Replace local route state synchronization in `App.tsx`.
- Preserve existing route resolution, anchor scrolling, mobile menu behavior, and public case-study navigation.
- Verify browser Back and Forward navigation.
- Preserve the existing application providers above the application routing boundary.

## Documents Reviewed

- `AGENTS.md`
- `docs/README.md`
- `docs/operations/documentation-governance.md`
- `docs/architecture/02-architecture-decisions.md`
- `docs/architecture/06-roadmap-and-phase-3.md`
- `docs/architecture/phase-3-4-application-shell-design.md`
- `docs/phases/phase-3-5-1-routing-baseline-audit.md`

## Implementation

### Files changed in this phase

- `src/app/routing/useHashRoute.ts` — introduced the hash subscription adapter.
- `src/App.tsx` — replaced local route state and the component-level `hashchange` subscription with `useHashRoute()`.

### Adapter behavior

The adapter uses:

- `useSyncExternalStore` from React.
- A `hashchange` event subscription with a matching cleanup function.
- `window.location.hash` as the snapshot.
- An empty server snapshot for the existing client-rendered Vite application.

No URL decoding or route normalization was introduced.

### Preserved behavior

- Existing native browser Hash Routing.
- Existing public case-study route format, including `#/work/postex`.
- Existing anchor navigation and scroll behavior.
- Existing invalid-project fallback logic.
- Mobile menu closure after route changes.
- Existing LanguageProvider and ThemeProvider composition above the application.
- Existing Back and Forward browser history behavior.

The existing application providers and `main.tsx` composition were not modified as part of this phase.

## Architectural Decisions

1. Keep native browser Hash Routing.
2. Do not introduce React Router or another routing dependency.
3. Use `useSyncExternalStore` for the external browser hash subscription.
4. Keep route resolution and existing public rendering behavior in `App.tsx` for now.
5. Defer Public/Admin separation to Phase 3.5.3.
6. Defer root Error Boundary implementation to Phase 3.5.4.
7. Continue targeted routing verification during each implementation phase; do not defer all testing to Phase 3.5.5.

## Verification

All results below reflect commands executed during this phase.

| Check | Result | Details |
|---|---|---|
| `npx tsc --noEmit` | PASS | Exit code 0 |
| `npm run build` | PASS | Vite production build completed |
| `npm run test:ui` | PASS | 12 responsive locale combinations and remaining UI regression checks passed |
| Anchor navigation | PASS | Native `#work` navigation and page scrolling |
| Case-study route | PASS | Direct UI navigation to `#/work/postex` |
| Browser Back | PASS | Returned to the previous `#work` route |
| Browser Forward | PASS | Returned to `#/work/postex` |

### UI regression details

The existing Playwright suite passed:

- 1440px, 1280px, 768px, and 390px viewports.
- English, Persian, and Arabic at all four viewport widths.
- Mobile menu and Escape focus behavior.
- Preference persistence.
- All 39 localized case-study combinations.
- Documented metrics and email link.
- Runtime error checks.

### Targeted routing regression output

```text
PASS native anchor navigation and scrolling
PASS public case-study route
PASS browser Back navigation
PASS browser Forward navigation
```

### Build warnings

The production build completed successfully. The following Vite configuration warnings were observed and remain outside this phase:

- `__dirname` usage in `vite.config.ts`, with a recommendation to use `import.meta.dirname`.
- JSON import of `./.figma/make/site.json` without import attributes.

These warnings did not fail the production build and were not changed as part of this phase.

## Documentation Updated

- `docs/README.md` — phase status and report index.
- `docs/architecture/phase-3-4-application-shell-design.md` — routing sequence status and implementation record.
- `docs/architecture/06-roadmap-and-phase-3.md` — Phase 3.5 execution status.
- `docs/phases/phase-3-5-2-hash-router-adapter.md` — this execution report.

The Phase 3.5.1 baseline audit remains unchanged as historical evidence.

## Remaining Risks and Follow-up Work

- Phase 3.5.3 must introduce explicit Public/Admin route separation.
- Phase 3.5.4 must introduce the root React Error Boundary and accessible fallback.
- Phase 3.5.5 must complete and expand dedicated routing regression coverage.
- Unknown-route behavior, invalid project IDs, and future Admin route behavior still require explicit dedicated regression coverage.
- Client-side route separation must not be treated as authentication or authorization.
- Existing Vite configuration warnings remain outside this phase.

## Git and Repository Hygiene

The working tree contained unrelated modified and untracked files before documentation updates. They were not treated as part of this phase unless explicitly listed above.

No files were staged, committed, or deleted as part of this phase.

An unexpected untracked file was observed in the repository root and deliberately preserved. It must be inspected and handled separately with explicit approval.

## Result

Phase 3.5.2 is completed.

The Hash Router Adapter is implemented and the recorded TypeScript, production build, UI regression, anchor navigation, case-study navigation, and browser history checks passed.

The next implementation phase is **Phase 3.5.3 — Public/Admin Separation**.