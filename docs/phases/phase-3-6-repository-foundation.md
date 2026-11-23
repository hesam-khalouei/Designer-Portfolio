# Phase 3.6 — Repository Foundation

**Status:** Completed — 2026-11-23

## 1. Objective

ایجاد مرز Repository در Application و جداسازی دریافت محتوای Portfolio از Public UI، با حفظ رفتار فعلی سایت و بدون اتصال به Backend یا Supabase.

## 2. Approved Scope

- تعریف Repository Contract در Application.
- تعریف Aggregate محتوای Portfolio در Domain.
- ایجاد Static Adapter در Infrastructure.
- ایجاد Use Case و Composition Root.
- تزریق وابستگی به Application Entry Point.
- حذف وابستگی مستقیم Public UI به فایل محتوای ثابت.
- حفظ Localization UI، Admin/Public separation و رفتار فعلی Portfolio.

## 3. Implementation

### Domain

- `src/domain/localization/LocalizedText.ts`
  - تعریف `Lang`، `Text` و تابع `text`.
- `src/domain/content/entities/PortfolioContent.ts`
  - تعریف `PortfolioContent` و انواع Profile، Project، Experience، Metric، Capability، Service و Certification.

### Application

- `src/application/repositories/PortfolioRepository.ts`
  - تعریف قرارداد Async برای دریافت Portfolio Content.
- `src/application/use-cases/GetPortfolioContent.ts`
  - اجرای Use Case از طریق Repository Contract.

### Infrastructure

- `src/infrastructure/content/static/portfolio-content.ts`
  - تجمیع داده‌های فعلی در ساختار `PortfolioContent`.
- `src/infrastructure/repositories/StaticPortfolioRepository.ts`
  - پیاده‌سازی موقت Repository با داده ثابت.

**Migration limitation:** داده‌های اصلی هنوز در `src/content.ts` نگهداری می‌شوند. Static Adapter فعلاً آن‌ها را تجمیع می‌کند؛ انتقال کامل منبع داده به ساختار جدید در این مرحله انجام نشده است.

### Composition Root and UI

- `src/app/bootstrap/createAppDependencies.ts`
  - ساخت Repository و Use Case.
- `src/main.tsx`
  - ساخت Dependencyها در Entry Point و تزریق به App.
- `src/App.tsx`
  - بارگذاری Async محتوای Public و مدیریت Loading، Error و Retry.
  - حفظ مسیر مستقل Admin بدون بارگذاری Portfolio.
- `src/public-site/PublicApp.tsx`
  - دریافت `PortfolioContent` از طریق Props، بدون Import مستقیم از منبع داده قدیمی.
- `src/components.tsx`، `src/admin/AdminApp.tsx`، `src/app/providers/LanguageProvider.tsx` و `src/locales.ts`
  - انتقال Importهای Localization و Domain Types به محل جدید.
- `src/locales.ts`
  - افزودن پیام‌های Loading، Error و Retry برای سه زبان.

## 4. Architecture Confirmed

- Repository Contracts در Application تعریف می‌شوند.
- پیاده‌سازی Repository در Infrastructure قرار دارد.
- Domain مستقل از Persistence و Supabase است.
- Public UI از Use Case استفاده می‌کند و به Infrastructure وابستگی مستقیم ندارد.
- Admin در این مرحله مصرف‌کننده Portfolio Repository نیست.
- AppProviders، RootErrorBoundary و Hash Routing حفظ شدند.
- Supabase، Auth، RLS و CMS در Scope این فاز نیستند.

## 5. Behavior Preservation

هدف حفظ موارد زیر بود:

- ترتیب و تعداد 13 پروژه.
- Case Studyها و منطق ارتباط فعلی پروژه‌ها و محتوا.
- زبان‌های `en`، `fa` و `ar`.
- RTL/LTR، Theme و Routing.
- جداسازی Public و Admin.

UI Regression موجود برای صفحات و Case Studyها موفق شد.

## 6. Verification

| Command | Result |
|---|---|
| `npx tsc --noEmit` | PASS — بدون خروجی و خطای TypeScript |
| `npm run build` | PASS — Build موفق |
| `npm run test:ui` | PASS — تمام سناریوهای گزارش‌شده موفق |
| `git diff --check` | PASS — بدون خطای whitespace پس از اصلاح |

### Build warnings

Vite دو Warning درباره `__dirname` و JSON import بدون import attributes در `vite.config.ts` گزارش کرد. Build با موفقیت تکمیل شد. این موارد در Scope تغییرات Repository Foundation اصلاح نشدند.

### UI regression evidence

- 12 ترکیب زبان و اندازه صفحه: 1440، 1280، 768 و 390 پیکسل.
- Admin route isolation، ترجمه‌های Admin، حفظ تنظیمات و بازگشت به Public.
- Fallback routeها.
- منوی موبایل و Escape focus.
- تمام 39 Case Study.
- Metrics، Email و Runtime error checks.

## 7. Not Run / Limitations

- تست اختصاصی Repository failure و Retry اجرا نشد.
- تست مستقل برای Async race/cancellation اجرا نشد.
- داده‌های اصلی هنوز از `src/content.ts` تأمین می‌شوند.
- Supabase Adapter، Backend، Authentication و RLS پیاده‌سازی نشده‌اند.
- اجرای موفق UI Regression موجود، جایگزین تست اختصاصی Use Case و Repository نیست.

## 8. Git and Repository Hygiene

- `git diff --check` پس از اصلاح دو خط خالی اضافه، بدون خطای whitespace اجرا شد.
- هشدارهای LF/CRLF ویندوز باقی ماندند.
- وضعیت Git شامل تغییرات و فایل‌های Untracked متعدد بود.
- فایل‌های ناشناس و Untracked حفظ شدند.
- هیچ فایل Stage، Commit یا Push نشد.

## 9. Outcome

Phase 3.6 در محدوده مصوب تکمیل شد. مرز Repository و مسیر تزریق وابستگی ایجاد شده‌اند و رفتار عمومی در Regression Suite موجود حفظ شده است.

گام بعدی طبق Roadmap، Phase 3.7 — UI Foundation است.
