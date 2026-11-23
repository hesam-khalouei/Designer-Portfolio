# Current State Audit --- Phase 3.1

## 1. دامنه ممیزی

ممیزی Phase 3.1 به‌صورت Read-only انجام شده است. فایل‌های اصلی بررسی‌شده: -
`package.json` - `tsconfig.json` - `.mise.toml` - `index.html` -
`vite.config.ts` - `src/main.tsx` - `src/App.tsx` -
`src/components.tsx` - `src/content.ts` - `src/locales.ts` -
`src/theme.css` - `src/index.css` - `scripts/verify-portfolio.mjs` -
فایل‌های مستندات و تنظیمات مرتبط در ریشه

هیچ نصب، Migration، تغییر فایل، Build/Deploy یا تغییر Git به‌عنوان بخشی
از Phase 3.1 انجام نشده است. TypeScript با
`node_modules/.bin/tsc.cmd --noEmit` بررسی شده و موفق بوده است.

## 2. مسیر و ابزار پروژه

مسیر معتبر پروژه: `C:\\Users\\a.khalouei\\Desktop\\Designer-Portfolio`

پوشه `C:\\Users\\a.khalouei\\Portfolio` پروژه هدف نیست و یک پوشه HTML
استاتیک جداگانه است.

مشخصات گزارش‌شده: - React 19 - TypeScript 5.7 در Range پکیج؛ نسخه نصب‌شده
5.9.3 - Vite 8؛ نسخه نصب‌شده 8.3.8 - Tailwind CSS 4 - Node نصب‌شده
26.12.1 - npm نصب‌شده 11.20.0 - `.mise.toml` نسخه Node 22 و pnpm 10.34.3
را تعریف می‌کند. - PowerShell فعلی `pnpm` و `corepack` را در PATH پیدا
نکرده است. - `node_modules/.bin/tsc.cmd` موجود است و TypeScript 5.9.3 را
اجرا می‌کند. - Vite و Plugin React نصب‌شده Node 20.19 یا 22.12 به بالا را
می‌پذیرند؛ با این حال برای همسانی محیط، Node 22 مطابق `.mise.toml` مرجع
پروژه است. - `pnpm-lock.yaml` فایل Lock مرجع است؛ `node_modules` نباید
Commit شود.

## 3. وضعیت Git گزارش‌شده

آخرین وضعیت گزارش‌شده: - `.gitattributes` تغییرکرده - `GEMINI.md`
untracked - `I18n_Audit_Report.md` untracked - `i18n_summary.json`
untracked

`package-lock.json` با تأیید کاربر حذف شده است؛ pnpm روش canonical پروژه
است.

قانون `*.png filter=lfs ...` از `.gitattributes` حذف شده است. بررسی Hash
نشان داد `public/social-preview.png` از نظر بایت‌های خام با نسخه HEAD
یکسان است؛ اختلاف قبلی Status ناشی از LFS filter بوده، نه تغییر تصویر.

`git lfs version` برابر 3.8.1 بوده و `git lfs ls-files` خروجی نداشته
است.

هیچ Commit یا Push انجام نشده است.

## 4. فایل‌ها و محتوا

### `src/content.ts`

-   نوع زبان: `en | fa | ar`
-   ترجمه‌ها به‌صورت Tuple سه‌عضوی `[en, fa, ar]`.
-   13 پروژه شناسایی شده‌اند.
-   اطلاعات پروژه شامل شناسه، نام، دسته، صنعت، دستگاه، تصاویر و داده
    Case Study است.
-   `caseContent` و `caseMedia` با index عددی به Case Study sections
    متصل‌اند.
-   برخی Skillها برای هر سه زبان رشته تکراری دارند.
-   `sector` در چند پروژه از `category` کپی شده و نیازمند داده
    مستقل/تصمیم محتوایی است.
-   Metrics به‌صورت رشته‌هایی مانند `+40%`, `−12%`, `−30%`, `−15%`,
    `+25%`, `−20%` تعریف شده‌اند.
-   Experience dateها رشته ترجمه‌شده‌اند و در مدل نهایی بهتر است داده
    ساختاریافته باشند.
-   اطلاعات profile، summary، services، capabilities، certifications و
    social links در فایل ثابت قرار دارند.

پیشنهاد مهاجرت: تبدیل Tupleها به مدل key-based مثل `{ en, fa, ar }` با
Migration و اصلاح تمام مصرف‌کننده‌ها؛ جایگزینی صرف Type بدون Data
Migration کافی نیست.

### `src/locales.ts`

-   ترجمه UI، متن‌های Homepage، Education و Case Study labels در یک
    ساختار ترکیب شده‌اند.
-   `caseSections` ترتیب ده بخش Case Study را با UIKey مشخص می‌کند.
-   این آرایه Label/Order را تعیین می‌کند و محتوای مستقل Case Study نیست.
-   در آینده UI Localization، Content Localization و Page/Block
    Configuration باید تفکیک شوند.

### `src/App.tsx`

-   Language و Theme در localStorage ذخیره می‌شوند.
-   `document.documentElement.lang` و `dir` در Runtime تنظیم می‌شوند.
-   Theme با `data-theme` تنظیم می‌شود.
-   Title، Description و OG/Twitter Meta به‌صورت Runtime تغییر می‌کنند.
-   Sections اصلی صفحه با JSX ثابت تعریف شده‌اند.
-   پنج پروژه اول نمایش داده می‌شوند و بقیه پشت Show More هستند.
-   Case Study ده Section با indexهای عددی دارد.
-   رابطه Experience/Metrics با Project از مقایسه رشته
    `company.toLowerCase()` و `project.id` به دست می‌آید؛ این رابطه
    شکننده و در چند مورد غلط است:
    -   Postex و Vardast به‌صورت اتفاقی Match می‌شوند.
    -   EBCOM با `ewano` Match نمی‌شود.
    -   ITSaaz پروژه متناظر ندارد.
-   Contact و Footer در Case Study نیز Render می‌شوند؛ تصمیم محصولی
    درباره حفظ این رفتار لازم است.
-   SEO پویا است، ولی Description در همه Routeها از Summary پروفایل
    استفاده می‌کند.
-   شواهد کافی برای Canonical، Structured Data یا Prerender در فایل
    بررسی‌شده وجود نداشت.
-   Hash Routing فعلی استفاده می‌شود؛ جایگزینی با Router دیگر بدون نیاز
    اثبات‌شده توصیه نمی‌شود.

### `src/components.tsx`

کامپوننت‌ها: - Icon - LanguageControl - Screen - Device - ProjectMedia -
ProjectCard - MetricNumber - useReveals - stagger

یافته‌ها: - `MetricNumber` منطق نمایش عدد و پسوند `%` را فرض می‌کند و برای
مقادیری مانند `8+`, `120K`, `$2.5M`, `4.8/5` مناسب نیست. -
`ProjectMedia` ترکیب‌های Phone/Multi/Single ثابت دارد؛ مدل رسانه در آینده
باید ساختاریافته باشد. - `ProjectCard` مسیر Hash را Hardcode کرده است. -
Screen fallback ساده دارد. - `useReveals` عناصر فعلی دارای `.reveal` را
Observe می‌کند؛ رفتار آن در ورود/خروج داینامیک بلوک‌ها باید بررسی شود. -
Reduced Motion رعایت شده است. - کامپوننت‌های بصری فعلی تا حد امکان حفظ و
از داده/Route جدا شوند.

### `src/theme.css`

-   CSS Variables متمرکز برای Light و Dark موجود است.
-   پالت فعلی:
    -   Light background `#faf9f6`, surface `#ffffff`, text `#262326`,
        primary `#643349`, accent `#ad7d8e`.
    -   Dark background `#1e1b1e`, surface `#282428`, text `#f1ece8`,
        primary `#d5a4b8`, accent `#ba8ba0`.
-   توکن‌های Semantic، Component و Decorative با هم ترکیب شده‌اند.
-   Button رنگ Primary را تکرار می‌کند.
-   OKLCH scale، WCAG validator و Typography Tokens وجود ندارد.
-   `--color-on-primary-muted` و `--color-primary-line` در Dark Theme
    Override نشده‌اند و مقادیر Light را حفظ می‌کنند؛ کنتراست واقعی باید
    بررسی شود.

### `src/index.css`

-   Inter برای LTR و Vazirmatn برای RTL از Google Fonts بارگیری می‌شوند.
-   CSS شامل Base، Layout، Components، Sections، Responsive و RTL در یک
    فایل بزرگ است.
-   اندازه Typography در بخش‌های مختلف و Media Queryها پراکنده است.
-   Breakpointهای 1500، 1150، 900 و 600 وجود دارند.
-   Focus-visible، Skip Link و Reduced Motion وجود دارند.
-   بسیاری از ویژگی‌ها از Logical Properties استفاده می‌کنند؛
    letter-spacing و transformهای فیزیکی در RTL/Arabic باید تست شوند.
-   طراحی Responsive فعلی باید حفظ و با Visual Regression/Manual QA
    کنترل شود.
-   CSS در آینده می‌تواند به لایه‌های Base/Tokens/Components/Sections
    تقسیم شود؛ این کار نباید بدون نیاز در ابتدای مهاجرت انجام شود.

### `index.html`

-   HTML shell ساده Vite و Root React.
-   زبان اولیه `en`.
-   Title و Description اولیه ثابت.
-   OG و Twitter Card تعریف شده‌اند.
-   تصویر `/social-preview.png` مسیر Root-absolute دارد؛ انتشار در
    GitHub Pages زیر مسیر Repository نیازمند بررسی Base Path است.
-   `theme-color` خالی است.
-   Favicon از `/monogram.svg` استفاده می‌کند.
-   کامنت‌های Figma حفظ شوند.
-   `App.tsx` زبان را پس از شروع React به‌روزرسانی می‌کند؛ اما زبان قبل از
    Hydration/Execution انگلیسی است.
-   Canonical و Structured Data در این فایل دیده نشدند.

### `vite.config.ts`

-   Base برابر `FIGMA_PUBLIC_URL` به‌علاوه `/` یا `/` است.
-   Sourcemap در Development به‌صورت inline و در Build عادی خاموش است.
-   Minify در حالت Development خاموش است.
-   Alias `@` به `src` تعریف شده است.
-   Host توسعه و Preview از Environment قابل تنظیم‌اند.
-   چند Plugin اختصاصی Figma وجود دارد:
    -   `figmaSiteConfiguration`
    -   `figmaErrorOverlayReplay`
    -   `figmaReactRefreshBoundaryFallback`
    -   `figmaMakeKitPlugin`
    -   `figmaLinkedPackageSourcemaps`
-   این Pluginها نباید بدون بررسی وابستگی Figma Make حذف شوند.
-   `figmaSiteConfiguration` از `.figma/make/site.json` تنظیمات
    title/description/language/robots/icons/OG/analytics/custom scripts
    را می‌خواند.
-   `index.html` کامنت‌های `figma:head-start/end` و
    `figma:body-start/end` دارد، ولی Plugin به دنبال Slotهایی مانند
    `figma:lang` و `figma:title` است؛ بنابراین بعضی replaceها در HTML
    فعلی Slot متناظر ندارند.
-   امکان تزریق Metaهای تکراری با Metaهای موجود در `index.html` وجود
    دارد.
-   مقدار `robots.index === false` باعث تزریق `noindex, nofollow` و
    تولید `robots.txt` با `Disallow: /` می‌شود. این وضعیت باید قبل از
    انتشار عمومی بررسی شود.
-   Custom Scripts از `site.json` به HTML تزریق می‌شوند؛ این ورودی باید
    فقط از منبع مورد اعتماد و با سیاست امنیتی مشخص باشد.
-   در Figma Site Configuration، مقدار Analytics ID پاک‌سازی می‌شود؛ ولی
    سفارشی‌سازی Scriptها نیازمند بازبینی امنیتی است.

## 5. فایل‌های ریشه و مستندات

-   `AGENTS.md` tracked و دستورالعمل اصلی پروژه است؛ حفظ شود.
-   `CLAUDE.md` فقط `@AGENTS.md` را ارجاع می‌دهد؛ حفظ شود.
-   `GEMINI.md` untracked و مستقل است؛ فعلاً نگهداری شود، اما Roadmap آن
    با فازهای مصوب همگام نیست.
-   `I18n_Audit_Report.md` و `i18n_summary.json` توسط ابزار محلی تولید
    شده‌اند؛ ادعاهایشان باید با شواهد کد اعتبارسنجی شوند و مرجع معماری
    محسوب نشوند.
-   `.figma/make/site.json` بررسی شده است؛ تنظیمات Robots و سایر تزریق‌ها
    باید در مرحله Build/SEO بررسی شوند.

## 6. نتیجه ممیزی

پروژه پایه React/TypeScript قابل حفظ دارد و TypeScript Check موفق بوده
است. اما CMS، Backend، Auth، Database، Publishing و Admin Panel هنوز
وجود ندارند. مدل محتوا و روابط آن برای CMS کافی نیست و باید با Migration
تدریجی توسعه یابد.

ریسک‌های اصلی: 1. روابط ضمنی و شکننده Project/Experience/Metrics. 2.
وابستگی Case Study به index عددی. 3. محتوای ثابت و Sections Hardcoded.
4. مدیریت ترجمه با Tupleهای positional. 5. SEO و Base Path در GitHub
Pages. 6. تنظیمات احتمالی `noindex` در Figma configuration. 7. وابستگی
Vite Config به Pluginهای اختصاصی Figma. 8. Typography و Theme Tokens
ناکافی برای Design System Manager. 9. نبود
Backend/Auth/RLS/Storage/Publishing.

## 7. محدودیت ممیزی

این ممیزی جایگزین تست کامل Runtime، Accessibility Audit، Security Audit،
Visual Regression، تست Deployment روی GitHub Pages یا بررسی کامل تمام
فایل‌های پروژه نیست. مواردی که در فایل‌های ارسال‌شده قابل مشاهده نبودند،
به‌عنوان «وجود ندارد» قطعی اعلام نشده‌اند؛ فقط «در دامنه بررسی‌شده مشاهده
نشد» تلقی می‌شوند.

## Post-audit addendum — Product Constitution approval (2026-11-23)

This addendum records a decision made after the historical Phase 3.1 audit.

At the time of the original audit, `GEMINI.md` was identified as an
untracked root-level document whose relationship to the project Roadmap
had not yet been aligned.

Subsequently, the project owner explicitly approved `GEMINI.md` as the
Product Constitution. It is now the reference for product intent,
requirements and expected capabilities, subject to the authority boundaries
defined in `docs/operations/documentation-governance.md`.

This approval does not retroactively change the original audit findings,
does not mean that every Constitution requirement is implemented, and does
not replace the canonical execution sequence in
`docs/architecture/06-roadmap-and-phase-3.md`.

The original Phase 3.1 observations remain historical evidence. Current
implementation status must be established from current repository and test
evidence.
