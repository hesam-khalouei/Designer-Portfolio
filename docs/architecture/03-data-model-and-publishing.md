# Data Model and Publishing Architecture

## 1. اصول مدل داده

-   داده‌های پایدار و روابط مهم در جداول Relational نگهداری می‌شوند.
-   Snapshotهای قابل انتشار و محتوای ساختاریافته می‌توانند در JSONB ذخیره
    شوند.
-   هر محتوای قابل انتشار به یک Content Entity و Publication Unit متصل
    است.
-   ترجمه‌ها Publication Unit مستقل دارند.
-   Revisionها immutable هستند.
-   ارتباط‌ها با Foreign Key صریح تعریف می‌شوند؛ نه با تطبیق رشته‌ای.

## 2. جداول هسته انتشار

### `content_entities`

ثبت مرکزی موجودیت‌های محتوایی: - `id` UUID PK - `entity_type` -
`created_at` - `updated_at`

Domain tables به این Registry ارجاع می‌دهند. سازگاری `entity_type` با
جدول دامنه باید با قید، Trigger یا منطق کنترل‌شده تضمین شود.

### `publication_units`

یک واحد انتشار برای هر Entity و Locale: - `id` - `entity_id` -
`locale_code` - `draft_revision_id` - `published_revision_id` -
timestamps

قید یکتا: `(entity_id, locale_code)`.

Localeهای اولیه `en`, `fa`, `ar` و Locale سیستمی `und` برای داده
غیرترجمه‌ای هستند.

### `content_revisions`

-   `id`
-   `publication_unit_id`
-   `revision_number`
-   `schema_version`
-   `payload JSONB`
-   `checksum`
-   `created_by`
-   `created_at`

قیود: - یکتایی `(publication_unit_id, revision_number)`. - یکتایی
`(id, publication_unit_id)`. - Pointerهای Draft و Published باید با
Composite Foreign Key به Revision متعلق به همان Publication Unit اشاره
کنند.

Revision بعد از ایجاد نباید UPDATE یا DELETE شود؛ تغییر محتوا با ایجاد
Revision جدید انجام می‌شود.

### `publish_events`

ثبت رویدادهای: - Publish - Rollback - Unpublish در صورت تعریف سیاست آن

فیلدهای مفهومی: - Publication Unit - Revision قبلی - Revision جدید -
Actor - Action - Timestamp - Metadata لازم برای Audit

## 3. جداول دامنه پیشنهادی

-   `profiles`
-   `projects`
-   `project_categories`
-   `categories`
-   `experiences`
-   `experience_projects`
-   `metrics`
-   `capabilities`
-   `services`
-   `certifications`
-   `education`
-   `social_links`

رابطه Project و Experience باید از طریق جدول رابطه‌ای یا Foreign Key مشخص
شود. رابطه چندبه‌چند در صورت نیاز از `experience_projects` استفاده می‌کند.

## 4. Page Builder و Case Study

Page/Case Study از مدل عمومی Section و Block استفاده می‌کند: -
`section_id` پایدار - `block_id` پایدار - `block_type` -
`schema_version` - `order` - `props` ساختاریافته - محتوای
locale-specific در Revision مربوط به همان زبان

ترتیب بخش‌ها نباید با index آرایه به‌عنوان شناسه معنایی پیاده‌سازی شود.
تغییر ترتیب نباید محتوا یا رسانه را به بخش دیگری متصل کند.

## 5. Theme و Typography

جداول مفهومی: - `design_themes` - `brand_palettes` - `brand_colors` -
`design_tokens` - `component_mappings` - `typography_tokens` -
`font_families` - `font_files`

Brand Palette، Semantic Tokens و Component Assignments سه مفهوم جدا
هستند. Light/Dark به‌صورت مجزا نگهداری می‌شوند.

## 6. SEO و Media

SEO: - `seo_settings` - `page_seo` - `seo_social_metadata` -
`indexing_settings`

Media: - `media_assets` - `media_variants` - `media_usages` -
`font_metadata`

## 7. چرخه انتشار مستقل

برای هر Publication Unit: 1. مدیر تغییر را در Draft ایجاد می‌کند. 2.
سیستم Schema و روابط را اعتبارسنجی می‌کند. 3. Preview با دسترسی کنترل‌شده
ارائه می‌شود. 4. وابستگی‌های Media بررسی می‌شوند. 5. فایل‌های لازم به مسیر
Public نسخه‌دار کپی می‌شوند. 6. مقصد و Checksum تأیید می‌شوند. 7. در تراکنش
دیتابیس Published Pointer تغییر می‌کند. 8. Publish Event ثبت می‌شود.

Storage و PostgreSQL تراکنش اتمیک مشترک ندارند. بنابراین باید فرایند
Saga/Outbox یا جبران خطا تعریف شود. اگر کپی فایل موفق و تغییر Pointer
ناموفق شد، فایل orphan باید قابل پاک‌سازی باشد. اگر Pointer تغییر کرد،
نباید به فایل تأییدنشده اشاره کند.

## 8. Rollback

Rollback با تغییر Published Pointer به Revision قبلی انجام می‌شود؛
تاریخچه حذف نمی‌شود. رویداد Rollback جدید ثبت می‌شود. عملیات باید
idempotent و دارای کنترل هم‌زمانی باشد.

## 9. Optimistic Concurrency

عملیات تغییر Draft یا Publish باید مقدار مورد انتظار Revision/Pointer را
دریافت کند. اگر داده از زمان خواندن تغییر کرده باشد، عملیات با Conflict
کنترل‌شده رد می‌شود؛ نباید آخرین تغییر بی‌صدا overwrite شود.

## 10. Schema Versioning و Migration

هر payload دارای `schema_version` است. تغییر ساختار Block یا Content
باید Migration قابل تست داشته باشد. Renderer نباید payload نسخه ناشناخته
را بدون سیاست fallback اجرا کند.

## 11. Product Constitution data-model traceability

The following requirements refine the conceptual model. They are product
and data-model requirements, not a claim that the corresponding tables,
services or workflows already exist.

### Language-specific typography

Typography configuration must support independent settings by locale and
typography role. The conceptual configuration should cover:

- Locale: `en`, `fa`, `ar`.
- Roles such as Display, Heading, Body, UI, Accent and Fallback.
- The detailed scale: Display, H1–H4, Body Large, Body, Body Small,
  Caption, Eyebrow, Label and Button Text.
- Font family, size, weight, line height, letter spacing, text transform
  and responsive scaling.

The final relational structure and constraints must be validated during
implementation. Avoid duplicating configuration where a normalized
relationship or versioned configuration is more appropriate.

### Font metadata

Font metadata should be able to represent family, original filename,
language/script coverage, weight, style, variable-font axes, format,
storage location, license, upload date and active status.

Metadata must be validated against the actual uploaded file. The filename
or browser-provided MIME type alone is not authoritative.

### Versioned theme preview

Theme configuration must be versionable and support draft and published
states. The publishing model must preserve the last known good published
theme so that a failed or unwanted publication can be rolled back without
losing revision history.

Draft theme changes must not mutate the public theme.

### Media relationships

The media model must support asset metadata, dimensions, file size,
categorization, project assignment, alternative text and usage relationships.
Existing project media presentation and device compositions must remain
representable; a data-model change must not assume that every project image
is a single generic image.

## 12. Current Portfolio Repository Payload Contract

This section defines the initial persistence contract for the existing
PortfolioContent model. It preserves the current Domain and Public
contracts while allowing future content structures to evolve.

### 12.1 Localization and shared data

- Each entity uses independent Publication Units for `en`, `fa`, `ar`
  and `und`.
- Localized text is stored as a scalar value in its corresponding locale
  payload, not as a three-element language array.
- The Infrastructure Adapter reconstructs the existing `Text` tuple
  (`[en, fa, ar]`) when reading published content.
- `und` stores shared, non-translated properties.
- Entities with only localized properties use an empty `{}` payload
  for `und`, keeping the initial publication structure consistent.
- Missing required locale content must produce a controlled data
  validation error; the Adapter must not silently substitute another
  language.

### 12.2 Entity payload responsibilities

The initial payload responsibilities are:

| Entity | Shared (`und`) | Localized (`en`, `fa`, `ar`) |
| --- | --- | --- |
| Profile | email, linkedinHandle, socials, phone | name, title |
| Summary | Empty object | summary value |
| Project | name, device, image, secondaryImage, shared case media | category, sector, imageAlt, case content, case media alternative text |
| Experience | company | role, dates, bullets |
| Metric | value, company | label, detail |
| Capability | Empty object | title, skills |
| Service | Empty object | title, description |
| Certification | Empty object | title, issuer, date |

Every entity must use an explicit, stable `entity_key`. Keys must not
depend on translated labels, array positions or mutable display names.
Existing source IDs should be retained where available. Other keys must
be curated explicitly.

The initial curated keys for entities without an existing source ID are:

| Entity type | Stable entity keys |
| --- | --- |
| Experience | `ebcom`, `postex`, `vardast`, `itsaaz`, `standard`, `freelance` |
| Metric | `itsaaz-design-efficiency`, `itsaaz-journey-friction`, `ebcom-handoff-time`, `vardast-onboarding-dropoff`, `ebcom-task-efficiency`, `postex-dispatch-task-time` |
| Capability | `product`, `design`, `leadership`, `tools` |
| Service | `product-discovery-strategy`, `ux-research-usability-testing`, `end-to-end-product-design`, `web-mobile-ux-ui`, `design-system-development`, `complex-b2b-workflow-design`, `dashboards-operational-interfaces`, `prototyping-developer-handoff` |
| Certification | `google-ui-ux-design`, `user-research-course`, `ui-ux-design-specialist`, `product-manager` |

These keys are initial migration identifiers, not generated values.
Changing a display label, translation or array order must never change
an existing entity key. Any future key change requires an explicit
data migration and preservation of revision history.

`sort_order` controls presentation order and is not an entity identity.

### 12.3 Project and Case Study payloads

Project-level shared media properties include `image`, `secondaryImage`
and `device`. The localized project payload includes `category`, `sector`
and `imageAlt`.

Case Study content uses stable semantic section identifiers rather than
numeric array indexes. The initial identifiers corresponding to the
existing Public sections are:

- `overview`
- `context`
- `role`
- `challengeSection`
- `research`
- `journey`
- `exploration`
- `final`
- `decisions`
- `results`

The initial persistence shape is conceptually:

- `caseContent`: localized text keyed by stable section ID.
- `caseMedia`: shared visual properties keyed by stable section ID,
  including image, secondary image and device where applicable.
- `caseMediaAlt`: localized alternative text keyed by stable section ID.

The Infrastructure Adapter maps these stable identifiers to the
existing numeric `caseContent` and `caseMedia` indexes required by
`PortfolioContent`. This mapping is an explicit compatibility boundary;
Domain and Public contracts must not become dependent on database
section identifiers or Supabase.

### 12.4 Dynamic Section lifecycle and extensibility

The data model must not assume a permanently fixed number or ordering
of Case Study sections.

Future Section management must support:

- Creating new sections with unique, stable identifiers.
- Reordering sections without changing their identifiers.
- Changing labels and localized presentation independently of identity.
- Disabling or archiving sections without destroying historical revisions.
- Introducing new section types through versioned definitions and
  validated schemas.
- Keeping section content, section definition and section media as
  distinct responsibilities.
- Supporting stable `block_id` values for individual block instances
  where a section contains multiple blocks.

A Section Definition describes the section's identity, type and
supported schema. Section Content contains locale-specific data.
Section Media represents its media relationships and presentation.

Section order is presentation metadata, never a semantic identifier.
Once a section is referenced by a saved revision, its identity must not
be reassigned to another section. Removal from the active structure
must preserve historical revision data. Physical deletion is not the
default lifecycle operation.

The future Page Builder may introduce a managed Section Registry and
Section Manager. This does not require implementing that management
interface or its workflows in Phase 4.

### 12.5 Compatibility and migration rules

- Existing `PortfolioContent` interfaces and Public rendering behavior
  remain intact during the initial backend integration.
- Numeric Case Study indexes are supported only at the compatibility
  boundary and must not be persisted as semantic section identities.
- Section identifier mappings must be explicit and deterministic.
- Adding, removing, disabling or reordering a section must not silently
  associate existing content or media with a different section.
- Payload changes must increment or otherwise correctly manage
  `schema_version` and have testable migration or compatibility rules.
- Unknown section types or unsupported payload versions must be handled
  through an explicit validation or fallback policy.
- No Project-Experience-Metric relationship may be inferred from names,
  labels or matching strings. Such relationships require explicit
  identifiers and constraints.

### 12.6 Phase boundaries

Phase 4 implements the initial payload contract, read Adapter and
compatibility mapping required by the existing PortfolioContent model.

Dynamic Section authoring, Section Registry management, block editing
and the Section Manager interface belong to the future Page Builder
scope in Phase 7. The Phase 4 data contract must preserve a clear
migration path toward those capabilities without prematurely
implementing them.

### 12.7 Decoder validation and error handling

The Infrastructure read Adapter must validate published rows before
constructing PortfolioContent.

- Every entity must have exactly one row for each required locale:
  `en`, `fa`, `ar` and `und`.
- Duplicate entity-locale records and unknown entity types are errors.
- Every payload must be a JSON object matching its entity contract.
- Required properties and their value types must be validated.
- Optional properties may be absent but must be validated when present.
- Unsupported schema versions must produce an explicit compatibility
  error. Silent interpretation of unknown versions is prohibited.
- Missing localized content must not be silently substituted from
  another locale.
- Case Study section mappings must be explicit, deterministic and
  covered by tests.
- Adapter failures must remain distinguishable from Supabase transport
  and authentication failures.
- A configured Supabase repository must not silently fall back to
  static content after a read failure.

Decoder tests must run without a live Supabase connection. The initial
test harness should use the existing Vite SSR module-loading capability
and Node.js assertions, without adding a test framework dependency.
