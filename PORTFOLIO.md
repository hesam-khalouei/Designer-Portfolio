# Portfolio editing guide

This is a static React portfolio; no CMS or backend is required.

- **Colors:** `src/theme.css` is the single palette source for light and dark themes.
- **Fonts:** imports are first in `src/index.css`; family tokens live in `src/theme.css`. Separate RTL rules control script-appropriate typography.
- **Personal information:** edit `profile` in `src/content.ts`. Add verified LinkedIn, Dribbble, and Website URLs to `socials` to show real links. Until then, only the supplied LinkedIn handle is shown. `phone` is opt-in.
- **Translations:** `Text` tuples are `[English, Persian, Arabic]`. Interface copy is in `src/locales.ts`; factual content is in `src/content.ts`.
- **Screenshots:** place files in `public/projects/` and add `image: '/projects/name.png'` and optionally `secondaryImage` to a project. Add `imageAlt: ['English', 'فارسی', 'العربية']` for descriptive accessible labels. Device presentation is a visual choice, not a claim about an undocumented platform. Available frames are `phone`, `laptop`, `tablet`, `browser`, `monitor`, and `multi`. Images use `object-fit: cover`; adjust this for your export if needed.
- **Case studies:** add `caseContent: { 1: ['English context', 'متن فارسی', 'النص العربي'] }` to a project. Keys 0–9 follow `caseSections` in `src/locales.ts`. Unknown details remain marked placeholders. Postex and Vardast reuse their documented company contributions and metrics.
- **Independent case-study visuals:** add `caseMedia: { 5: { image: '/projects/journey.png', device: 'browser', imageAlt: ['User journey', 'سفر کاربر', 'رحلة المستخدم'] }, 7: { image: '/projects/final.png', device: 'monitor' } }`. Every section can have its own export; sections 5, 6 and 7 have full-width visual slots by default. Text and media can be added independently.
- **Projects:** the first five records are featured; others appear under “More selected projects.” Every project has a shareable route such as `#/work/postex`. Preferences persist during navigation.
- **Sharing:** static English metadata lives in `index.html`; runtime metadata is localized. `public/social-preview.png` is a 1200×630 branded preview. Its editable source, `scripts/social-preview.html`, reads the same theme tokens: open `/scripts/social-preview.html` in development and capture at 1200×630 to regenerate it after changing the palette. Update the canonical URL and use an absolute social image URL when a production domain is known. Hash-based project routes share the main portfolio social preview because no server-rendered project routes are present.
- **Checks:** `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm format --check`. Run `pnpm test:ui` against the existing preview for responsive layouts, all three locales, all 13 case studies, theme/language persistence, accessible mobile navigation and contact links. It does not start a server. Set `PREVIEW_URL` (default `http://localhost:3000`) and `CHROMIUM_PATH` if needed; otherwise it uses system Chromium or a Playwright-installed browser (`pnpm exec playwright install chromium`).

No fictional product screens, research findings, testimonials, or availability claims are included.
