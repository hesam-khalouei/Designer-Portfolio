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
