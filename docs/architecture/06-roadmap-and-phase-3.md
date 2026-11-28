# Roadmap and Phase 3 Execution Plan

## 1. Roadmap مصوب

  -----------------------------------------------------------------------
  فاز                     عنوان                   خروجی اصلی
  ----------------------- ----------------------- -----------------------
  Phase 3                 Project Foundation      ساختار Frontend و
                                                  مرزهای معماری

  Phase 4                 Backend Foundation      Supabase، Schema، Auth،
                                                  RLS، Repository Adapter

  Phase 5                 Core CMS                مدیریت محتوای اصلی

  Phase 6                 Localization            ترجمه مستقل و مدیریت
                                                  Locale

  Phase 7                 Page Builder            Block Registry و Visual
                                                  Builder

  Phase 8                 Design System Manager   Palette، Tokens،
                                                  Typography و Fonts

  Phase 9                 Media Library & SEO     رسانه، Variantها و SEO

  Phase 10                Publishing & Preview    Draft، Preview،
                                                  Publish، History و
                                                  Rollback

  Phase 11                Production & Deployment Hardening، مانیتورینگ و
                                                  انتشار Production
  -----------------------------------------------------------------------

ترتیب بالا نقشه راه مفهومی است. بعضی قابلیت‌های پایه Publishing و Media
برای گردش‌کار Draft ممکن است زودتر و به‌شکل حداقلی لازم شوند؛ این
وابستگی‌ها در طراحی اجرایی ثبت می‌شوند.
### Phase 4 and Phase 7 — Dynamic Section boundary

Phase 4 Backend Foundation establishes the persistence contract for the
existing PortfolioContent model. Case Study sections use stable semantic
identifiers independent of array position, display order and locale.
The Infrastructure Adapter provides the compatibility mapping required
by the existing Public contract. The data model must preserve historical
revisions and support future section lifecycle changes.

Phase 4 does not implement Section authoring, a Section Manager UI,
visual block editing or a complete Page Builder.

Phase 7 Page Builder owns the future Section Registry and management
workflows, including section creation, reordering, disabling or
archiving, versioned section definitions and block editing. These
capabilities must build on the stable identity and revision rules
established by the data model.

The detailed initial payload contract and compatibility rules are
documented in `architecture/03-data-model-and-publishing.md`,
Section 12.

## 2. Phase 3 --- Project Foundation

هدف: آماده‌سازی Frontend برای مهاجرت تدریجی به CMS، بدون راه‌اندازی
Backend در این فاز.

### 3.1 Pre-Implementation Audit

**وضعیت:** تکمیل‌شده، Read-only

خروجی: ممیزی وضعیت موجود، شناسایی ریسک‌ها و پیشنهاد ساختار مقصد.

### 3.2 Project Structure

**وضعیت:** تقسیم‌بندی کلی تأییدشده؛ جزئیات و اجرا باز

کارها: - تعریف مرز `app`, `domain`, `application`, `infrastructure`,
`admin`, `public-site`, `shared`. - تعیین قواعد Import و Dependency
Direction. - جلوگیری از Circular Dependency. - مشخص‌کردن مالکیت Typeها و
قراردادها. - تعیین اینکه کدام فایل‌های موجود در هر مرحله منتقل یا به‌تدریج
Refactor می‌شوند.

### 3.3 TypeScript Foundation

-   تعریف Branded/Domain Types در صورت نیاز واقعی.
-   تعریف Locale، IDs، Result و AppError.
-   تعریف قراردادهای اولیه Entity و Repository.
-   فعال نگه‌داشتن Strict TypeScript.
-   عدم ایجاد Abstractionهای بدون مصرف واقعی.

### 3.4 Application Shell

-   ایجاد پوسته مشترک برنامه.
-   جداسازی Public و Admin.
-   حفظ Theme، Locale، Direction و Global Providers.
-   جلوگیری از تغییر ناخواسته رفتار سایت عمومی.

### 3.5 Routing

-   تفکیک مسیرهای Public و Admin.
-   حفظ Hash Routing در ابتدا مگر اینکه نیاز فنی مشخصی برای تغییر وجود
    داشته باشد.
-   Unknown Route باید رفتار مشخص داشته باشد.
-   Route Guard فقط برای UX است؛ مجوزدهی واقعی در Backend انجام می‌شود.

**Execution status:**

-   Phase 3.5.1 — Routing Baseline Audit: Completed.
-   Phase 3.5.2 — Hash Router Adapter: Completed.
-   Phase 3.5.3 — Public/Admin Separation: Completed.
-   Phase 3.5.4 — Root Error Boundary: Implemented; TypeScript, production build, and UI regression passed. Direct crash-path test not run.
-   Phase 3.5.5 — Routing Regression Tests: Completed; anchor navigation, browser Back/Forward, Admin/Public separation, and invalid/unknown route fallback coverage verified through the UI regression suite.

### 3.6 Repository Foundation

-   تعریف Repository Interfaces / Contracts در `src/application/repositories`.
-   استفاده Application Services و Use Cases از این قراردادها، بدون وابستگی مستقیم به دیتابیس.
-   پیاده‌سازی Adapter موقت Local/Static در `src/infrastructure` برای حفظ رفتار سایت فعلی.
-   پیاده‌سازی Supabase Adapter در لایه Infrastructure طی Phase 4.
-   Domain و Application نباید به Supabase SDK یا جزئیات Persistence وابسته باشند.
-   UI نباید مستقیماً از Supabase Query یا پیاده‌سازی‌های Infrastructure استفاده کند.

**Execution status: Completed — 2026-11-23**

- Repository Contract در `src/application/repositories/PortfolioRepository.ts` تعریف شد.
- Aggregate محتوای Portfolio و Entityهای مرتبط در Domain تعریف شدند.
- Localization Types از فایل محتوای ثابت جدا شدند.
- Static Adapter در Infrastructure ایجاد شد؛ داده‌های اصلی فعلاً در `src/content.ts` باقی مانده‌اند.
- Use Case دریافت Portfolio Content و Composition Root ایجاد شدند.
- وابستگی‌ها در Entry Point ساخته و به Application تزریق شدند.
- Public UI از دریافت مستقیم محتوای ثابت جدا شد و Loading، Error و Retry اضافه شدند.
- مسیر Admin مستقل باقی ماند و Repository را مصرف نمی‌کند.
- TypeScript، Production Build و UI Regression با موفقیت اجرا شدند.
- تست اختصاصی شکست Repository و Retry اجرا نشد.
### 3.7 UI Foundation

-   پایه کامپوننت‌های مشترک.
-   Design Tokens اولیه برای Admin، جدا از Public Site در صورت نیاز.
-   دسترس‌پذیری، RTL، Responsive و Dark Mode.
-   عدم ساخت کامل Design System Manager در این مرحله.

**Execution status:**

- Phase 3.7 implementation completed; details and verification evidence are documented in `docs/phases/phase-3-7-admin-ui-foundation.md`.
- Admin-specific Light/Dark tokens and scoped styles implemented.
- Admin Shell and responsive navigation foundation implemented.
- Initial React primitives implemented: `AdminButton`, `AdminInput`, `AdminCard`, `AdminBadge`, and `AdminSectionHeading`.
- Existing Language and Theme Providers reused without changing their contracts.
- English, Persian, Arabic, RTL/LTR, keyboard focus, and reduced-motion foundations preserved.
- ADR-012 records the accepted application-owned Design System decision.
- TypeScript check, production build, and UI regression suite passed.
- Dedicated visual inspection and isolated interactive tests for each primitive were not run; see the phase report.
- Full Design System Manager and advanced managers remain outside this phase.
### 3.8 Verification

**Status: Completed with documented limitations — 2026-11-24.**

- [x] TypeScript Check.
- [x] Production Build.
- [x] Existing Verification script.
- [x] Route tests.
- [x] Language and RTL tests.
- [x] Theme tests.
- [x] Admin visual review by the user.
- [x] Isolated Playwright tests for all five Design System primitives.
- [x] Native attributes, Button interaction, disabled state, keyboard focus, and Input accessibility relationships.
- [x] Console and Network checks in the isolated fixture.
- [x] Static Base Path build-output verification using `/portfolio/`.
- [ ] Live GitHub Pages deployment — NOT RUN.
- [ ] Comprehensive WCAG and Screen Reader audit — NOT RUN.

Detailed report: `docs/phases/phase-3-8-verification.md`
### Phase 4 - Backend Foundation execution status

**Status: Local implementation and verification completed with operational limitations - 2026-11-24.**

- [x] Initial schema and security foundation migrations authored.
- [x] Supabase client foundation and public environment typing added.
- [x] Published Portfolio Content decoder implemented with locale, identity, schema, payload, and section validation.
- [x] Supabase Portfolio Repository implemented behind the existing Application contract.
- [x] Decoder and Repository isolated tests passed (8 and 7 tests respectively).
- [x] TypeScript, Admin Design System, Public UI regression, and production build passed.
- [ ] Live Supabase migrations - NOT RUN.
- [ ] Live database connectivity and RLS/security verification - NOT RUN.
- [ ] Authentication provisioning and login/MFA flows - NOT COMPLETED.
- [x] Explicit Supabase Repository bootstrap selection implemented; Static remains the default source. Local bootstrap source-selection test: 4 scenarios PASS; static migration verification: 12 groups PASS. Live Supabase connectivity, migration execution, and runtime security verification remain pending.
- [x] Admin Authentication and session architecture reviewed and documented (Batch 4.6); login, provisioning, MFA, route guard, and backend enforcement implementation remain pending.

Detailed report: `docs/phases/phase-4-backend-foundation.md`

## 3. ترتیب وابستگی‌ها

پیشنهاد ترتیب: 1. 3.2 ساختار و قواعد وابستگی. 2. 3.3 TypeScript و
قراردادهای پایه. 3. 3.4 Application Shell. 4. 3.5 Routing. 5. 3.6 Repository Contracts در Application و Adapter موقت در Infrastructure. 6. 3.7 UI Foundation. 7. 3.8
Verification.

در صورت آشکارشدن وابستگی جدید، ترتیب می‌تواند با ثبت دلیل اصلاح شود.

## 4. Definition of Done برای Phase 3

-   سایت فعلی قابل اجرا باقی بماند.
-   ظاهر و رفتار اصلی Public بدون Regression جدی حفظ شود.
-   Public و Admin مرز مشخص داشته باشند.
-   Domain و Application به Supabase وابسته نباشند.
-   Repository Contracts تعریف و قابل تست باشند.
-   TypeScript Strict برقرار باشد.
-   Locale و RTL/LTR حفظ شوند.
-   Theme فعلی حفظ شود.
-   هیچ Secret در Frontend وجود نداشته باشد.
-   تست‌های پایه موفق باشند.
-   مستندات ساختار، قراردادها و روش اجرای پروژه به‌روز باشند.

## 5. روش اجرای هر گام

برای هر گام: 1. ابتدا هدف و Scope مشخص شود. 2. فایل‌های درگیر و اثرات
احتمالی شناسایی شوند. 3. طرح تغییر ارائه و تأیید شود، مگر اینکه کاربر
قبلاً اختیار اجرای همان تغییر محدود را داده باشد. 4. تغییرات کوچک و قابل
بازبینی باشند. 5. تست‌های مرتبط اجرا شوند. 6. خروجی واقعی تست گزارش شود.
7. مستندات همان گام به‌روزرسانی شوند. 8. Git Diff و وضعیت فایل‌ها بررسی
شوند. 9. هیچ Commit/Push بدون درخواست یا تأیید صریح انجام نشود.

## 6. استاندارد دستورهای PowerShell

-   مسیر پروژه همیشه
    `C:\\Users\\a.khalouei\\Desktop\\Designer-Portfolio` است.
-   دستورها با PowerShell سازگار باشند.
-   از فرض نصب بودن `pnpm` در PATH خودداری شود؛ ابتدا وضعیت ابزار بررسی
    شود.
-   تا زمان رفع مسئله ابزار، اجرای باینری محلی مانند
    `node_modules\\.bin\\tsc.cmd` قابل استفاده است.
-   از دستورهای مخرب یا حذف فایل بدون تأیید صریح استفاده نشود.
-   در مرحله Read-only فقط دستورات خواندن/بررسی ارائه شوند.

## 7. مستندسازی تغییرات بعدی

هر قابلیت یا تغییر مهم باید در Markdown مربوط ثبت شود. در صورت نیاز: -
`docs/decisions/ADR-NNN-*.md` - `docs/architecture/*.md` -
`docs/runbooks/*.md` - `docs/testing/*.md`

برای هر مرحله گزارش کوتاه شامل Scope، فایل‌های تغییرکرده، تصمیم‌ها، تست‌ها،
نتیجه و کارهای باز ارائه شود.

## 8. Relationship between the two phase models

`GEMINI.md` describes a high-level product lifecycle using PHASE 0 through
PHASE 7, from audit and architecture through implementation, testing and
deployment.

This lifecycle is not a replacement for, or a numeric mapping to, the
project execution Roadmap defined in this document.

The Phase 3–11 Roadmap and its 3.x subphases remain the canonical plan for
execution order, task scope, dependencies, acceptance criteria and status.

The two models serve different purposes:

- The Constitution lifecycle describes broad product-development concerns.
- This Roadmap describes the approved project execution sequence.

Do not infer a one-to-one correspondence between phase numbers. When a
specific task is planned, identify its applicable Roadmap phase and record
any relevant Constitution requirement in that task's scope and acceptance
criteria.

**Batch 4.7 update — 2026-11-25:** Provider-neutral Authentication Domain/Application contracts and five independent fake-repository tests are implemented. Actual login integration, Supabase Auth adapter, active-admin authorization, provisioning, MFA/AAL2 enforcement, and route guard remain pending.

- [x] Batch 4.8 — Supabase Authentication Infrastructure adapter implemented and independently verified with 12 fake-client scenarios. Application Authentication contract tests: 5 PASS. TypeScript, production build, Admin Design System, and Public UI regression passed. The adapter maps sessions conservatively to AAL1; active-admin authorization, Login UI, Auth provider integration, provisioning, MFA/AAL2 enforcement, and live Supabase verification remain pending.

**Batch 4.8 update — 2026-11-25:** Supabase Auth adapter and fake-client tests are complete. No live Supabase Auth or database connection was used. Authentication remains distinct from active-admin authorization.

**Batch 4.9 update — 2026-11-25:** React Authentication lifecycle, Email/Password login page, and fail-closed Admin route gate are implemented. The lifecycle suite passes 10 scenarios; TypeScript, formatting, and production build pass. The gate is UX-only. Active-admin authorization, provisioning, live Supabase/RLS verification, MFA, and AAL2 enforcement remain pending.

**Batch 4.10 update — 2026-11-28:** Active-admin authorization repository and client-side Authentication race protection are implemented and locally verified.

- [x] Active-admin authorization adapter integrated with the Application contract.
- [x] Fail-closed handling for missing, inactive, malformed, and RLS-hidden admin profiles.
- [x] Authorization error classification for database and network/provider failures.
- [x] Request-generation protection against stale asynchronous Authentication and authorization responses.
- [x] Regression test confirms a delayed authorization response cannot restore access after sign-out.
- [x] Admin Authentication lifecycle: 14 PASS.
- [x] Active-admin authorization repository: 7 PASS.
- [x] Supabase Authentication adapter: 12 PASS.
- [x] TypeScript, Oxfmt, production build, and `git diff --check` passed.

**Current Phase 4 implementation status:** Authentication contracts and Supabase adapter, React session lifecycle, Email/Password login UI, Admin route gate, and active-admin authorization integration are implemented and locally verified.

**Remaining operational and security work:** Live Supabase connectivity, migration execution, database/RLS runtime verification, trusted Admin provisioning, TOTP enrollment and verification, authoritative AAL2 enforcement, account recovery, and emergency administrator replacement. No live database operation or provisioning was performed in Batch 4.10.

### Phase 5 — Core CMS execution status

**Batch 5.1 — Project CMS Persistence Foundation — 2026-11-28**

**Status:** Local implementation and static verification completed; Admin UI not started.

- [x] Provider-neutral Project Draft Domain model created.
- [x] Application repository contract and typed persistence errors created.
- [x] List, Get, Create and Save Project Draft use cases implemented.
- [x] Shared (`und`) and locale-specific (`en`, `fa`, `ar`) draft revisions modeled independently.
- [x] Stable project identity and independent sort order supported.
- [x] Supabase Project Draft Repository implemented.
- [x] Chunked entity/revision queries and pagination implemented for scalable project listing.
- [x] Versioned migration defines atomic project creation and revision-aware draft save RPCs.
- [x] Direct authenticated write privileges used by the RPC workflow revoked; RPC execution restricted to authenticated callers and active-admin checks enforced.
- [x] Project Draft use-case tests: 5 PASS.
- [x] Supabase Project Draft Repository tests: 7 PASS.
- [x] Project CMS migration static verification: 12 groups PASS.
- [x] TypeScript check completed without reported errors.
- [x] `git diff --check` completed without reported errors.

**Scope boundaries:** No Project CMS UI, category manager, Page Builder, Block Editor, Dynamic Section Manager, full Localization workflow, Publish, Rollback or Archive operation is included in Batch 5.1.

**Operational limitations:** Migration was statically inspected only. No live Supabase connection, SQL execution, database integration test, runtime RLS verification, MFA or AAL2 enforcement was performed.

**Next execution batch:** Build the dynamic Admin Project list, project creation and editing workflows, locale-specific draft editing and sort-order management on top of the implemented contracts. Preserve existing project content and do not hardcode the number or names of projects.

Detailed report: `docs/phases/phase-5-core-cms-project-persistence.md`
