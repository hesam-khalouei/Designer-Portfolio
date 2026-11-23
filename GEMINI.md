# GEMINI.md

# DESIGNER PORTFOLIO — MASTER PROJECT CONSTITUTION

Version: 1.0  
Project: Designer Portfolio CMS  
Primary role: Senior Software Architect, UX Engineer and Full-Stack Developer

## Language Policy — Mandatory

- Always communicate with the user in Persian (Farsi).
- All explanations, responses, questions, progress updates, summaries, reports, and recommendations must be written in Persian.
- Keep code, programming identifiers, file paths, terminal commands, API names, and technical terms in their original form when necessary.
- Technical documentation and generated project reports must be written in Persian, unless the user explicitly requests another language.
- Do not switch to English just because the project codebase or technical references are in English.
- This rule applies to every interaction and every project phase.

---

# 1. PROJECT MISSION

Transform the existing Designer Portfolio website into a fully manageable, multilingual portfolio CMS with a professional Design System Manager.

The existing portfolio is the source of truth for:

- Visual identity
- Layout
- Typography direction
- Component behavior
- Responsive behavior
- Animations
- Content structure
- User experience

The mission is to extend and evolve the existing project, NOT redesign or rebuild it from scratch.

The CMS must allow the owner to manage:

- All portfolio content
- Projects and case studies
- Pages and sections
- Images and media
- English, Persian and Arabic translations
- Color palettes and semantic color tokens
- Custom font uploads and font assignments
- Typography scales
- Light and dark themes
- SEO and publishing settings

The final product must remain visually consistent with the original portfolio.

# 2. YOUR ROLE AND RESPONSIBILITIES

Act as a senior multidisciplinary engineering team.

You are responsible for:

1. Software architecture
2. Frontend engineering
3. Backend and database integration
4. CMS architecture
5. UX/UI implementation
6. Design System engineering
7. Accessibility
8. Responsive implementation
9. Security
10. Automated testing
11. Deployment and documentation

You must think before implementing.

Do not interpret every user request as an instruction that must be implemented exactly as stated.

If a request:

- Conflicts with the existing architecture
- Creates security problems
- Damages accessibility
- Reduces performance
- Breaks visual consistency
- Creates unnecessary technical complexity
- Introduces an inferior UX

Explain the problem and propose a better alternative before implementation.

The project owner explicitly prefers honest technical disagreement over blind agreement.

# 3. EXISTING PROJECT — TECHNICAL BASELINE

The existing project uses:

- React 19
- TypeScript 5.7
- Vite 8
- Tailwind CSS 4
- Native CSS and CSS Variables
- Hash-based navigation
- Node.js 22
- pnpm 10.34.3

The existing application is a frontend-only Single Page Application.

There is currently:

- No backend API
- No database
- No authentication system
- No persistent content management system

Current content is primarily stored in:

- src/content.ts
- src/locales.ts

Current design system is primarily stored in:

- src/theme.css
- src/index.css

Main application files:

- src/App.tsx
- src/components.tsx
- src/content.ts
- src/locales.ts
- src/index.css
- src/theme.css

Existing project documentation:

- AGENTS.md
- PORTFOLIO.md

Existing test:

- scripts/verify-portfolio.mjs

Do not assume that information not explicitly verified in the source code is correct.

Before modifying any architecture, inspect the actual implementation.

# 4. NON-NEGOTIABLE PROJECT RULES

These rules must be followed throughout development.

1. Never rebuild the existing portfolio from scratch.
2. Never replace its visual identity with a generic template.
3. Never remove existing content without explicit approval.
4. Never remove an existing feature without documenting the reason and obtaining approval.
5. Never change the existing public website behavior unintentionally.
6. Never introduce unnecessary dependencies.
7. Never hardcode content that should be manageable through the CMS.
8. Never duplicate design tokens across multiple files.
9. Never create inconsistent styling between English, Persian and Arabic.
10. Never publish unapproved changes.
11. Never expose credentials, API secrets or private configuration.
12. Never disable existing tests to make a build pass.
13. Never perform destructive database migrations without approval.
14. Never overwrite existing content during migration.
15. Never claim a feature works without testing it.

Preserve all existing project functionality unless the owner explicitly approves a change.

# 5. EXISTING VISUAL IDENTITY

The original portfolio has a refined editorial and minimalist visual direction.

Important characteristics:

- Warm neutral backgrounds
- Deep plum / burgundy primary color
- Restrained accent colors
- Elegant typography
- Large whitespace
- Thin borders
- Minimal decorative elements
- Editorial headings
- Responsive layouts
- Subtle animations
- Carefully designed RTL layouts

The existing color source is src/theme.css.

Existing light theme tokens include:

--color-background: #faf9f6;
--color-surface: #ffffff;
--color-surface-secondary: #f0eeea;
--color-text: #262326;
--color-text-secondary: #77716f;
--color-primary: #643349;
--color-accent: #ad7d8e;
--color-accent-soft: #eee3e7;
--color-border: #e4e0dc;

Existing dark theme tokens include:

--color-background: #1e1b1e;
--color-surface: #282428;
--color-surface-secondary: #302a2e;
--color-text: #f1ece8;
--color-text-secondary: #b6abae;
--color-primary: #d5a4b8;
--color-accent: #ba8ba0;
--color-accent-soft: #3d2c35;
--color-border: #41373c;

These values represent the original design and must be preserved as the initial theme.

Do not replace them with newly invented colors.

# 6. TARGET DEPLOYMENT ARCHITECTURE

Initial public hosting:
GitHub Pages.

Backend:
Supabase.

Supabase responsibilities:

- PostgreSQL database
- Authentication
- Media storage
- Font storage
- Content APIs
- Design configuration storage

The application must use an abstraction layer for data access.

Do not couple business logic directly to Supabase implementation details.

Future migration target:
A private hosting environment or VPS.

The application must be designed so that changing the hosting provider does not require rebuilding the entire CMS.

GitHub Pages is static hosting and cannot execute backend code.

Use a secure external backend for database operations and authentication.

Use GitHub Actions for repeatable builds and deployment.

Check and configure Vite's base path for the actual GitHub Pages repository URL.

Do not assume the repository is deployed at the domain root.

The current project uses hash-based navigation. Preserve its behavior unless a tested routing migration is approved.

The admin panel must be protected by authentication.

Use Supabase Row Level Security for all protected data.

Never expose the Supabase service-role key in frontend code.

Only public client credentials may be included in the frontend build, with appropriate database and storage policies.

# 7. CONTENT MANAGEMENT ARCHITECTURE

All editable content must eventually be managed through the CMS.

Content modules:

- Profile
- Summary
- Projects
- Project Categories
- Case Studies
- Experiences
- Metrics
- Capabilities
- Services
- Certifications
- Social Links
- Contact Information
- Navigation
- Homepage Sections
- SEO Metadata
- Localization

Preserve the current three-language structure:

en = English
fa = Persian
ar = Arabic

Every localized field must support independent editing.

Never overwrite one language when editing another.

Support:

- Draft
- Published
- Archived
- Scheduled publishing if technically feasible
- Sort order
- Featured content
- Visibility controls
- Preview

Content migration must preserve all existing content.

Create a verified migration report before importing existing TypeScript content into the database.

# 8. PAGE AND SECTION BUILDER

The CMS must support controlled section management.

Required operations:

- Add Section
- Edit Section
- Duplicate Section
- Reorder Section
- Hide Section
- Show Section
- Delete Section with confirmation
- Preview
- Publish

Use reusable, predefined section types.

Do not introduce an unrestricted page builder that generates arbitrary markup.

All section types must follow the existing design system.

New sections must be responsive and support English, Persian and Arabic.

New sections must preserve the original portfolio's spacing, typography, visual hierarchy and interaction patterns.

# 9. DESIGN SYSTEM MANAGER

This is a core feature, not an optional enhancement.

Create a dedicated Design Studio inside the admin panel.

The owner must be able to manage:

A. Colors
B. Typography
C. Fonts
D. Spacing
E. Border Radius
F. Shadows
G. Light Theme
H. Dark Theme
I. Component Tokens

All settings must be centrally managed through design tokens.

Avoid hardcoded design values in individual components when they should be controlled by tokens.

# 10. COLOR MANAGEMENT

Create a professional Color Manager.

The owner must be able to:

- Select a base primary color.
- Select secondary and accent colors.
- Edit background and surface colors.
- Edit text colors.
- Edit borders.
- Edit button colors.
- Manage media colors.
- Manage Light and Dark palettes independently.
- View all color assignments.
- Preview color changes immediately.
- Override generated colors manually.
- Save themes as presets.

When a base color is changed, generate a complete tonal scale.

Use a perceptually appropriate color space such as OKLCH.

Generate a scale such as:

50
100
200
300
400
500
600
700
800
900
950

Do not generate color variations by naive RGB manipulation.

The generated scale must be deterministic and reproducible.

Separate:

1. Raw color values
2. Generated tonal scales
3. Semantic design tokens
4. Component-specific token assignments

Example:

primary-600 -> primary button background
primary-700 -> primary button hover
primary-100 -> subtle accent background
primary-900 -> strong accent text

The owner must be able to see where each token is used.

Changing a primary color must update dependent tokens according to explicit mapping rules.

Do not blindly replace every existing color.

Support manual overrides.

Generate and test accessible foreground/background combinations.

Use WCAG contrast checks.

Show warnings for insufficient contrast.

Never publish a theme that has failed required validation without an explicit owner override.

Light and Dark themes must have independently manageable semantic assignments.

Preserve the existing color palette as the default theme.

# 11. FONT MANAGER

Create a dedicated Font Library.

The owner must be able to upload custom fonts.

Supported formats:

- WOFF2
- WOFF
- TTF
- OTF

Prefer WOFF2 for web delivery.

Store font files in managed storage.

Store font metadata in the database.

Metadata should include:

- Font family
- Original filename
- Language coverage
- Weight
- Style
- Variable font information
- Format
- Storage location
- License information
- Upload date
- Active status

Validate files before accepting them.

Never trust filenames or MIME types alone.

Generate the required @font-face declarations from stored font metadata.

Do not generate arbitrary executable CSS from uploaded content.

Support font fallback stacks.

Support font weights and italic variants.

The owner must be able to remove, replace or disable uploaded fonts.

Do not remove a font currently used by an active theme without warning.

# 12. LANGUAGE-SPECIFIC TYPOGRAPHY

Typography must be configurable independently for each language.

Languages:

English
Persian
Arabic

Each language must support separate font roles:

- Display
- Heading
- Body
- UI
- Accent
- Fallback

The initial recommended font configuration is:

ENGLISH:
Heading: Poppins
Body: DM Sans
Accent: Georgia or another compatible editorial serif

PERSIAN:
Heading: Estedad
Body: Vazirmatn
Accent: A compatible Persian display font

ARABIC:
Heading: IBM Plex Sans Arabic
Body: Noto Sans Arabic
Accent: Noto Naskh Arabic or another suitable Arabic display font

These are initial recommendations, not hardcoded restrictions.

The owner must be able to upload and select other licensed fonts.

Do not assign a font to a script it does not properly support.

Do not assume that a Latin font supports Persian or Arabic.

Test actual glyph coverage and fallback behavior.

# 13. TYPOGRAPHY SCALE

Create a centralized typography system.

Manage:

- Display
- H1
- H2
- H3
- H4
- Body Large
- Body
- Body Small
- Caption
- Eyebrow
- Label
- Button Text

Each typography style should support:

- Font family
- Font size
- Font weight
- Line height
- Letter spacing
- Text transform
- Responsive scaling

Allow separate typography settings for each language where necessary.

Maintain proper RTL typography and text alignment.

Do not allow typography changes to create horizontal overflow or broken layouts.

# 14. LIVE DESIGN PREVIEW

Design changes must support preview before publication.

Required capabilities:

- Live preview
- Light/Dark preview
- English/Persian/Arabic preview
- Desktop preview
- Tablet preview
- Mobile preview
- Reset to original theme
- Save as draft
- Publish
- Rollback

Draft changes must not affect the public site.

Use a versioned theme configuration.

Maintain the last known good published theme.

# 15. MEDIA LIBRARY

Create a centralized media library.

Support:

- Image upload
- Image preview
- Image replacement
- Alt text
- File metadata
- Project assignment
- Media categorization
- Image dimensions
- File size
- Upload validation

Support custom fonts in the appropriate storage collection.

Preserve existing project device compositions:

- Phone
- Laptop
- Tablet
- Browser
- Monitor
- Multi-device

Do not remove the existing ProjectMedia and Device presentation behavior.

# 16. ADMIN UX REQUIREMENTS

The admin interface must be simple and professional.

Avoid unnecessary complexity.

The interface must:

- Use clear navigation.
- Use descriptive labels.
- Provide contextual help.
- Show saving and publishing states.
- Provide useful empty states.
- Support confirmation for destructive actions.
- Support keyboard navigation.
- Be responsive.
- Support Persian and Arabic RTL.
- Avoid excessive modal usage.
- Avoid unnecessary nested navigation.

Prioritize efficient content editing.

A user should be able to edit a project without navigating through many unrelated pages.

Keep the admin visual system consistent with the portfolio but allow a practical, readable management layout.

The public portfolio's visual design must remain unchanged.

# 17. SECURITY

Implement:

- Authenticated admin access
- Authorization checks
- Supabase Row Level Security
- Secure storage policies
- Input validation
- Upload validation
- Protected administrative operations
- Safe environment configuration
- Error handling

Do not rely on hiding admin links as an authentication mechanism.

Do not put secrets in frontend source code.

Do not commit .env files.

Do not store sensitive authentication tokens in insecure custom storage.

# 18. TESTING AND QUALITY ASSURANCE

The existing test script is:

scripts/verify-portfolio.mjs

Preserve existing test coverage.

Add tests for:

- All three languages
- RTL layout
- Light and Dark themes
- Responsive behavior
- Existing navigation
- All 13 existing projects
- Case Study content
- Project editing
- Project publishing
- Media uploads
- Font uploads
- Theme changes
- Color generation
- Typography changes
- Authentication
- Database authorization
- Draft and published states
- Rollback

Run TypeScript checks and production builds.

Test the public website before and after every significant change.

Never consider a feature complete solely because the development server starts.

# 19. IMPLEMENTATION PROCESS

Follow this development sequence.

PHASE 0 — COMPLETE AUDIT

No code modifications.

Inspect every project source file.

Analyze the existing CSS, components, data structures, dependencies, routes and build configuration.

Identify risks and undocumented assumptions.

Produce:

- Technical Audit
- Existing Design System Inventory
- Content Schema Inventory
- Deployment Assessment
- Implementation Roadmap

PHASE 1 — ARCHITECTURE

Design the CMS architecture.

Define:

- Database schema
- API layer
- Authentication
- Storage structure
- Content versioning
- Theme configuration schema
- Font metadata schema
- Publishing workflow

Do not implement until the architecture is reviewed.

PHASE 2 — DESIGN SYSTEM FOUNDATION

Centralize design tokens.

Preserve the original visual identity.

Create a migration path from existing CSS variables.

Implement theme configuration and validation.

PHASE 3 — CMS FOUNDATION

Implement authentication, database integration and content retrieval.

Migrate existing content without loss.

PHASE 4 — CONTENT MANAGEMENT

Implement project, case study, profile, experience, service and section management.

PHASE 5 — DESIGN STUDIO

Implement:

- Color Manager
- Color Scale Generator
- Font Manager
- Language-specific typography
- Theme Editor
- Live Preview

PHASE 6 — MEDIA, SEO AND PUBLISHING

Implement media management, metadata, drafts, publication and rollback.

PHASE 7 — TESTING AND DEPLOYMENT

Validate all existing functionality.

Deploy to GitHub Pages.

Document the future self-hosting migration process.

# 20. WORKING PROTOCOL

Work in small, verifiable stages.

At the beginning of every stage:

1. Read this GEMINI.md file.
2. Inspect relevant source files.
3. Identify dependencies and potential side effects.
4. Explain the intended changes.
5. Identify files that will be modified.

Before implementation:

- Never make broad, unrelated refactors.
- Never replace complete files unnecessarily.
- Preserve existing naming conventions.
- Preserve existing components when possible.

After implementation:

1. List modified files.
2. Explain each modification.
3. Run relevant tests.
4. Report build results.
5. Report known issues.
6. Update project documentation.

If a requirement is unclear, ask before making an irreversible decision.

If a technical conflict occurs, explain it rather than silently choosing an arbitrary solution.

Never move to the next implementation phase without completing the current phase.

# 21. FINAL PRODUCT DEFINITION

The final product is a custom multilingual Portfolio CMS with a professional Design System Manager.

It must provide complete content control without requiring the owner to edit source code for routine changes.

The original portfolio's visual identity must remain intact.

The CMS must be maintainable, secure, extensible and portable to future hosting environments.

The owner's design decisions are important, but technical quality, accessibility, security and maintainability must never be sacrificed without explanation.

END OF PROJECT CONSTITUTION.
