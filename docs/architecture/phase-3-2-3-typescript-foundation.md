# Phase 3.2.3 — TypeScript Foundation

**Status:** Audit completed; proposed foundation pending approval  
**Implementation changes:** None  
**Package installation:** None  
**Source files modified:** None

## 1. Objective

Establish a safe TypeScript foundation for the incremental portfolio-to-CMS migration. The foundation must support the approved modular architecture without forcing a premature rewrite of existing source files.

## 2. Evidence collected

### Compiler configuration

The current `tsconfig.json` contains:

- `target: ES2020`
- `module: ESNext`
- `moduleResolution: bundler`
- `jsx: react-jsx`
- `strict: true`
- `noEmit: true`
- `isolatedModules: true`
- `skipLibCheck: true`
- `allowImportingTsExtensions: true`
- `resolveJsonModule: true`
- `baseUrl: "."`
- `paths: { "@/*": ["./src/*"] }`
- `include: ["src", "vite.config.ts"]`

### Vite alias

`vite.config.ts` defines:

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

The Vite alias and TypeScript path mapping currently target the same `src/` directory. No alias configuration change is required based on this audit.

### TypeScript version and validation

- Installed TypeScript version observed: `5.9.3`.
- `.
ode_modules\.bin	sc.cmd --noEmit` completed without diagnostics.
- This confirms static type-checking success under the current configuration. It does not establish runtime, browser, visual, or production-build correctness.

### Current source/import observations

The reviewed source tree currently has a small set of central TypeScript/TSX files:
- `src/main.tsx`
- `src/App.tsx`
- `src/components.tsx`
- `src/content.ts`
- `src/locales.ts`

Current internal imports are relative. The `@/*` alias exists but was not found in current application source imports.

`src/locales.ts` imports the `Text` type from `src/content.ts`, which is a small existing dependency between content definitions and localization labels. This should be reconsidered during domain extraction, not mechanically changed during this foundation step.

The first PowerShell `Select-String` import/export query returned no rows, while the subsequent relative-import query clearly showed import statements. Therefore, the empty first query is treated as a command/pattern issue, not evidence that imports do not exist.

### Package scripts observed

- `dev`: `vite`
- `build`: `vite build`
- `preview`: `vite preview`
- `format`: `oxfmt`
- `test:ui`: `node scripts/verify-portfolio.mjs`

`test:ui` is a project verification script; it should not be described as a unit-test suite without inspecting its implementation.

## 3. Assessment

The existing TypeScript configuration is already a reasonable Vite + React foundation:
- strict type checking is enabled;
- TypeScript does not emit application files;
- bundler module resolution is configured;
- JSX uses the modern React transform;
- TypeScript and Vite aliases are aligned.

No evidence from this audit justifies replacing the current configuration or introducing a new dependency.

## 4. Proposed decisions — pending approval

1. Preserve the existing `strict`, `noEmit`, `isolatedModules`, `moduleResolution: bundler`, and `jsx: react-jsx` settings.
2. Preserve the current `@/*` mapping and Vite alias; keep them synchronized.
3. Introduce `@/` imports gradually when files are moved into the approved architecture folders. Do not perform a repository-wide import rewrite solely for stylistic consistency.
4. Do not enable `exactOptionalPropertyTypes` or `noUncheckedIndexedAccess` in this step. Reassess them after domain models and indexed data access have been migrated.
5. Evaluate `noUnusedLocals` and `noUnusedParameters` against the current codebase before enabling them. If adopted, resolve diagnostics incrementally.
6. Do not add dependency-boundary or circular-dependency tooling yet. First establish real module boundaries and stable public entry points; then select the lightest suitable enforcement mechanism.
7. Keep `domain` independent of React, Vite, Supabase, and UI modules; keep `application` dependent on domain contracts; keep infrastructure as implementations of application contracts. Enforce these rules when the modules are populated, not by creating empty placeholder abstractions now.

## 5. Risks and items not yet established

- The current audit did not inspect every dependency edge in `vite.config.ts` or third-party packages.
- The actual behavior of `scripts/verify-portfolio.mjs` has not been reviewed in this step.
- A successful `tsc --noEmit` does not replace `vite build`, browser checks, or visual regression checks.
- The folder skeleton alone does not enforce architectural boundaries.
- The `baseUrl` option has been observed but no removal or migration is proposed based solely on this audit.

## 6. No-change record

This was an inspection and design step. No configuration or source file was edited, no package was installed, and no migration was run.

## 7. Next action

Obtain approval for the proposed decisions. After approval, implement only the explicitly approved TypeScript configuration changes, if any, and validate with:
1. `tsc --noEmit`;
2. `vite build`;
3. the existing `test:ui` verification script, after confirming its scope.

Record actual outcomes and changed files in a separate execution report.
