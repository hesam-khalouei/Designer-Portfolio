# Portfolio Panel — Documentation Index

این پوشه، مرجع مستندات معماری، تصمیم‌ها، ممیزی، سیاست‌های عملیاتی و اجرای پروژه Portfolio Panel است.

## اصول نگهداری مستندات

1. تصمیم‌های تأییدشده در اسناد معماری و تصمیم‌ها ثبت می‌شوند.
2. تحلیل وضعیت موجود در گزارش ممیزی نگهداری می‌شود.
3. برنامه اجرایی، معیارهای پذیرش و گزارش هر مرحله باید به‌روز باشند.
4. تصمیم جدید باید تاریخ، وضعیت، دلیل، پیامدها و جایگزین‌های ردشده داشته باشد.
5. هیچ تصمیم تأییدنشده‌ای نباید به‌عنوان واقعیت معماری نوشته شود.
6. پیش از هر تغییر، مستندات مرتبط باید بررسی و پس از تغییر، اسناد متأثر به‌روزرسانی شوند.
7. سیاست اجباری این فرایند در `operations/documentation-governance.md` تعریف شده است.
8. مستندات باید همراه تغییرات مرتبط در Git ثبت شوند.

## فهرست اسناد

### Architecture

| فایل                                                           | محتوا                                                     |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| `architecture/01-project-charter.md`                           | هدف، دامنه، الزامات محصول و اصول پروژه                    |
| `architecture/02-architecture-decisions.md`                    | تصمیم‌های مصوب معماری و ADRها                             |
| `architecture/03-data-model-and-publishing.md` | مدل داده، قرارداد Payload، Sectionهای پویا، Revision و انتشار |
| `architecture/04-security-storage-api.md`                      | امنیت، RLS، Storage، API و Repository Pattern             |
| `architecture/05-current-state-audit.md`                       | ممیزی وضعیت اولیه کد و ریسک‌ها                            |
| `architecture/06-roadmap-and-phase-3.md` | نقشه راه Phase 3 تا 11 و برنامه اجرای فازها |
| `architecture/07-design-system-and-admin-ux.md`                | Design System، Typography، Page Builder و Admin UX        |
| `architecture/08-phase-3-2-project-structure.md`               | ساختار هدف پروژه و مرزبندی ماژول‌ها                       |
| `architecture/phase-3-2-project-structure.md`                  | سند ساختار Phase 3.2؛ نیازمند بررسی هم‌پوشانی با سند قبلی |
| `architecture/phase-3-2-2-execution-report.md`                 | گزارش اجرای ساختار پوشه‌ها                                |
| `architecture/phase-3-2-3-typescript-foundation.md`            | تصمیم‌ها و بررسی TypeScript Foundation                    |
| `architecture/phase-3-2-4-metadata-and-ui-verification.md`     | گزارش اصلاح Metadata و تست رابط کاربری                    |
| `architecture/phase-3-4-application-shell-design.md`           | طراحی مصوب Application Shell                              |
| `architecture/phase-3-4-1-application-shell-baseline-audit.md` | گزارش ممیزی اولیه Application Shell                       |

### Operations

| فایل                                                     | محتوا                                       |
| -------------------------------------------------------- | ------------------------------------------- |
| `operations/documentation-governance.md`                 | سیاست اجباری بررسی و نگهداری مستندات        |
| `operations/documentation-governance-adoption-report.md` | گزارش استقرار و اعتبارسنجی سیاست Governance |

### Phases

| فایل                                           | محتوا                                                  |
| ---------------------------------------------- | ------------------------------------------------------ |
| `phases/metadata-duplicate-prevention.md`      | گزارش جلوگیری از تزریق Metadata تکراری                 |
| `phases/phase-3-4-2-language-provider.md`      | گزارش استخراج LanguageProvider و نتایج Regression Test |
| `phases/phase-3-4-3-theme-provider.md`         | گزارش استخراج ThemeProvider و نتایج Regression Test    |
| `phases/phase-3-5-1-routing-baseline-audit.md` | ممیزی Read-only رفتار Routing و الزامات سازگاری        |
| `phases/phase-3-6-repository-foundation.md` | گزارش اجرای Repository Foundation و نتایج اعتبارسنجی |
| `phases/phase-3-7-admin-ui-foundation.md` | گزارش پیاده‌سازی Admin UI Foundation و نتایج اعتبارسنجی Phase 3.7 |
| `phases/phase-3-8-verification.md` | گزارش Verification و نتایج تست‌های Phase 3.8 |
| `phases/phase-4-backend-foundation.md` | Phase 4 implementation, verification, migration readiness, security review, and operational limitations report |

## وضعیت پروژه

- Phase 0: تأیید شده.
- Phase 1: معماری و مدل داده مفهومی تأیید شده.
- Phase 2: طراحی معماری و زیرسیستم‌ها تأیید شده.
- Phase 3.1: ممیزی read-only تکمیل شده.
- Phase 3.2: ساختار پوشه‌ها ایجاد شده و تصمیم‌های TypeScript تأیید شده‌اند.
- Phase 3.2.3: اعتبارسنجی TypeScript و Build موفق بوده است.
- Phase 3.2.4: اصلاح Metadata و تست کامل UI موفق بوده است.
- Phase 3.4: طراحی Application Shell تأیید و ممیزی پایه تکمیل شده است.
- Phase 3.4.2: استخراج LanguageProvider و Regression Verification تکمیل شده است.
- Phase 3.4.3: استخراج ThemeProvider، اعتبارسنجی TypeScript، Build و Regression UI تکمیل شده است.
- Phase 3.5.1 تا Phase 3.5.5: تکمیل‌شده؛ جزئیات در گزارش‌های مربوط ثبت شده‌اند.
- Phase 3.6: Repository Foundation تکمیل‌شده؛ قرارداد Application، Static Adapter، Use Case و تزریق وابستگی پیاده‌سازی و اعتبارسنجی شدند.
- Phase 3.7: پیاده‌سازی Admin UI Foundation و اعتبارسنجی‌های اصلی تکمیل شده‌اند؛ محدودیت‌های تست در گزارش Phase 3.7 ثبت شده‌اند.
- Phase 3.8: Verification تکمیل شده؛ TypeScript، Build، Regression UI، تست مستقل پنج Primitive، Keyboard/Focus، روابط Accessibility، Theme، RTL، Console/Network و خروجی Static Base Path تأیید شده‌اند. انتشار واقعی GitHub Pages و ممیزی جامع WCAG/Screen Reader انجام نشده است.
- Phase 4: Backend Foundation local implementation and verification completed for migrations, Supabase client, content decoder, Supabase Repository, and explicit Static/Supabase bootstrap selection. Static remains the default source. Live migrations, database connectivity, operational RLS verification, and authentication flows remain pending; see the Phase 4 report.

> این فهرست وضعیت مستندات و شواهد موجود را منعکس می‌کند. تأیید طراحی به معنی تکمیل پیاده‌سازی نیست. موارد نیازمند بررسی یا اعتبارسنجی باید صریحاً مشخص شوند.
