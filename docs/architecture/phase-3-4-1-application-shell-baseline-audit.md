# Phase 3.4.1 — Application Shell Baseline Audit

## Status

**Audit completed. No source files were changed during this audit.**

## Scope and evidence

Reviewed the user-provided source excerpts and command outputs for:

- `src/main.tsx`
- `src/App.tsx` (top, middle, and bottom sections; reported total: 683 lines)
- `package.json`
- Recursive searches for React state/effects and browser storage
- Recursive searches for hash routing
- `git status --short`
- `git log -1 --oneline`

This report reflects the supplied excerpts and outputs; it does not claim an independent fresh read of files beyond those outputs.

## Current entry point

`src/main.tsx` imports React, `react-dom/client`, `App`, and `index.css`, then mounts `<App />` inside `<React.StrictMode>`.

Assessment: this is already a suitably thin entry point. Do not rewrite it merely to introduce an abstraction. It can later import the composition root once that root has a concrete responsibility.

## Current App responsibilities

`src/App.tsx` currently combines:

1. Language preference initialization and updates.
2. Theme preference initialization and updates.
3. Hash route state and `hashchange` subscription.
4. Mobile navigation state and Escape-key handling.
5. Homepage "show more projects" state.
6. Scroll behavior and reduced-motion-aware main content animation.
7. Document language and direction synchronization.
8. Dynamic title and metadata updates.
9. Theme DOM attribute and theme-color metadata updates.
10. Homepage rendering.
11. Case-study rendering.
12. Shared contact section and footer rendering.

The file is reported as 683 lines.

## State ownership audit

| State / behavior         | Current owner    | Target ownership                                                                |
| ------------------------ | ---------------- | ------------------------------------------------------------------------------- |
| `lang`                   | `App.tsx`        | Shared `LanguageProvider`                                                       |
| `theme`                  | `App.tsx`        | Shared `ThemeProvider`                                                          |
| `route`                  | `App.tsx`        | Hash router / route adapter                                                     |
| `menu`                   | `App.tsx`        | Local Public Header state                                                       |
| `more`                   | `App.tsx`        | Local project-list state                                                        |
| image `failed`           | `components.tsx` | Remains local to image component                                                |
| metric `shown`           | `components.tsx` | Remains local to metric animation                                               |
| reveal observer behavior | `components.tsx` | Remains a focused hook/utility unless later evidence supports a different owner |

Only state genuinely shared across the application should be promoted to context. Do not turn every local UI state into global state.

## Language behavior

Current implementation:

- Supported locales: `en`, `fa`, `ar`.
- Storage key: `ahk-language`.
- Default: `en`.
- Invalid stored values fall back to `en`.
- `document.documentElement.lang` is updated.
- `document.documentElement.dir` is `ltr` for English and `rtl` for Persian and Arabic.
- UI and content localization read the active `lang`.

Migration requirements:

- Preserve the storage key, defaults, validation, and document synchronization.
- Avoid introducing a second translation source.
- Provider exposes the active locale and a typed setter.
- Keep language preference infrastructure independent of Admin-specific translation content.

## Theme behavior

Current implementation:

- Supported themes: `light`, `dark`.
- Storage key: `ahk-theme`.
- Default: `light`.
- Invalid stored values fall back to `light`.
- `document.documentElement.dataset.theme` is updated.
- `meta[name="theme-color"]` is updated from the active background token.

Migration requirements:

- Preserve keys, defaults, validation, `data-theme`, and theme-color behavior.
- Keep theme tokens in the existing CSS system.
- Do not redesign tokens or introduce a new theme library during extraction.

## Routing behavior

Current implementation:

- Hash-based route state initialized from `window.location.hash`.
- `hashchange` listener updates route and closes the mobile menu.
- Case-study route prefix: `#/work/`.
- Project links are emitted by `App.tsx` and `components.tsx`.
- Anchor navigation is used for homepage sections.
- Scroll behavior is tied to route changes.
- No routing dependency is declared in `package.json`.

Migration requirements:

- Preserve all existing public hashes and project URLs.
- Do not add React Router or another routing dependency without a demonstrated need.
- Keep hash parsing in a small route adapter.
- Preserve existing unknown-route behavior during the first extraction; characterize it with tests before intentionally changing it.
- Reserve `#/admin` as a future route, but do not claim that route hiding or routing provides security.

## Page composition

The current public experience has two primary route states:

- Homepage.
- Case study selected by `#/work/:projectId`.

The homepage contains Hero, Work, Impact, Experience, About, Capabilities, Services, Education, and Contact.

The Contact section and Footer are outside the homepage/case-study conditional and therefore appear in both states. This behavior must be preserved during extraction.

Suggested page boundaries:

- `public-site/pages/HomePage.tsx`
- `public-site/pages/CaseStudyPage.tsx`
- `public-site/layout/PublicLayout.tsx` only if a shared layout extraction is useful and behavior-preserving.
- Shared Contact and Footer components can be extracted later, after their dependencies are understood.

`SectionHeading` is presentational and can remain in a Public component module.

`CaseStudy` should move with minimal internal changes. Its current relationship lookup between project IDs and experience/metric company names is known to be brittle; fixing that data relationship is out of scope for this shell migration.

## Metadata and document effects

The current `App.tsx` updates:

- `document.title`
- Description metadata
- Open Graph title and description
- Open Graph image alt and locale
- Twitter title and description
- Document `lang` and `dir`
- Theme-color metadata

Do not combine metadata/SEO refactoring with the first provider extraction. Preserve existing behavior and keep the Vite duplicate-injection guard intact.

## Package and dependency assessment

The supplied `package.json` declares React 19 and React DOM 19. Routing libraries and state-management libraries are not declared.

Decision: no new dependency is required for the Application Shell baseline. Use React Context and the existing hash mechanism where appropriate.

## Git baseline

Latest reported commit:

`48e5778 fix: prevent duplicate SEO metadata injection`

Reported branch pointers:

`HEAD -> main, origin/main, origin/HEAD`

Therefore the metadata fix is present in the local branch and aligned with `origin/main`.

Reported working-tree items:

- Modified: `.gitattributes`
- Untracked: `GEMINI.md`
- Untracked: `I18n_Audit_Report.md`
- Untracked: `docs/README.md`
- Untracked: `docs/architecture/`
- Untracked: `i18n_summary.json`
- Untracked suspicious filename: `t Build failed. Commit aborted. -ForegroundColor Red`
- Untracked backup: `vite.config.ts.backup-20261122-183558`

No blanket staging, deletion, or cleanup is authorized by this audit. Review each item separately. Inspect the suspicious filename before deciding whether it is safe to remove. The `.gitattributes` change was previously intentional and should not be discarded.

## Historical planning note

> **Historical planning note:** The sequence below records the original Application Shell baseline recommendations. LanguageProvider and ThemeProvider extraction have since been completed in Phases 3.4.2 and 3.4.3. Routing work is now governed by the Phase 3.5.1 audit and its subsequent approved implementation plan.

## Recommended implementation sequence

### 3.4.2 — Shared preference providers

1. Add a typed locale context/provider.
2. Preserve `ahk-language`, `en` fallback, `lang`, and `dir`.
3. Add a typed theme context/provider.
4. Preserve `ahk-theme`, `light` fallback, `data-theme`, and theme-color updates.
5. Compose providers in one application-level provider component.
6. Keep menu and project expansion state local.
7. Run TypeScript, production build, and the full UI test.

Prefer extracting one provider at a time with a verification checkpoint between changes.

**Historical outcome:** LanguageProvider and ThemeProvider extraction were subsequently completed in Phases 3.4.2 and 3.4.3. Their implementation records and execution reports are retained separately.

### 3.4.3 — Hash routing adapter

1. Encapsulate current hash parsing and `hashchange` subscription.
2. Preserve existing route strings and anchor behavior.
3. Keep mobile menu closing behavior associated with navigation.
4. Verify all project URLs and unknown-route behavior.

**Historical planning:** This routing work was subsequently reassessed and renumbered under the Phase 3.5 routing plan. The approved implementation sequence is documented in `../phases/phase-3-5-1-routing-baseline-audit.md`.

### 3.4.4 — Public application boundary

1. Introduce `PublicApp` as a composition boundary.
2. Extract homepage and case-study page boundaries with minimal JSX movement.
3. Preserve Contact and Footer rendering on both route states.
4. Preserve all CSS class names and visual markup.
5. Run the full UI suite.

**Historical planning:** Public/Admin separation is now governed by Phase 3.5.3.

### 3.4.5 — Admin route placeholder and root error boundary

Only after the public boundary is stable:

- Reserve `#/admin`.
- Add a non-sensitive placeholder surface if appropriate.
- Add a root Error Boundary with accessible localized fallback.
- Do not represent the route as authenticated or secure before backend authorization exists.

**Historical planning:** Root Error Boundary implementation is now governed by Phase 3.5.4. Admin route separation is governed by Phase 3.5.3.

## Out of scope

- Supabase initialization or database work.
- Authentication and authorization implementation.
- SEO redesign or metadata behavior changes.
- Fixing project-to-experience/metric relationship modeling.
- CSS redesign, token changes, or visual refresh.
- Replacing hash routing.
- Introducing a global state library.
- Bulk file moves or wholesale rewrite of `App.tsx`.
- Cleanup of unrelated Git working-tree files.

## Acceptance criteria for the audit

- [x] Entry point reviewed.
- [x] Current App responsibilities identified.
- [x] Shared and local state distinguished.
- [x] Language and theme persistence contracts recorded.
- [x] Hash routing behavior and route prefix recorded.
- [x] Homepage/case-study composition and shared footer/contact behavior recorded.
- [x] Package dependencies reviewed.
- [x] Git baseline recorded.
- [x] Incremental implementation sequence proposed.
- [x] No source changes made during audit.

## Historical next approval gate

The original approval gate for this audit was:

Approve the implementation sequence beginning with **Phase 3.4.2 — LanguageProvider and ThemeProvider extraction**, one provider at a time, with a full verification checkpoint after each extraction.

**Historical outcome:** This approval gate was superseded by the subsequent implementation records for Phases 3.4.2 and 3.4.3. The next routing implementation approval and readiness requirements are documented in Phase 3.5.1.
