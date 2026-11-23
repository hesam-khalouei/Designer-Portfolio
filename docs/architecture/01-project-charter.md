# Project Charter --- Portfolio Panel

## 1. هدف پروژه

تبدیل وب‌سایت پورتفولیوی فعلی به یک سیستم مدیریت محتوای پویا (Dynamic
CMS) با پنل مدیریت اختصاصی؛ به‌گونه‌ای که محتوا، ترجمه‌ها، پروژه‌ها، Case
Studyها، طراحی بصری، رسانه‌ها، SEO و انتشار از پنل قابل مدیریت باشند.

هدف، بازنویسی یک‌باره وب‌سایت نیست. مسیر مورد تأیید، مهاجرت تدریجی و حفظ
رفتار و ظاهر فعلی در طول توسعه است.

## 2. محصول هدف

محصول از دو سطح اصلی تشکیل می‌شود:

-   **Public Website:** وب‌سایت عمومی پورتفولیو که محتوای منتشرشده را از
    Backend دریافت می‌کند.
-   **Admin Panel:** محیط مدیریت احراز هویت‌شده برای مدیریت محتوا،
    ترجمه‌ها، صفحات، طراحی، رسانه، SEO و انتشار.

## 3. الزامات اصلی

### مدیریت محتوا

-   مدیریت پروفایل، خلاصه معرفی، پروژه‌ها، دسته‌بندی‌ها، Case Studyها،
    تجربه‌های کاری، شاخص‌ها، قابلیت‌ها، خدمات، مدارک، تحصیلات، شبکه‌های
    اجتماعی، اطلاعات تماس و ناوبری.
-   مدیریت ترتیب و ساختار بخش‌های صفحات.
-   ارتباط صریح بین پروژه‌ها و تجربه‌های کاری؛ عدم اتکا به تطبیق رشته‌ای
    نام شرکت و شناسه پروژه.

### چندزبانه

-   زبان‌های نسخه اول: `en`, `fa`, `ar`.
-   ترجمه هر زبان مستقل است.
-   Draft و Publish هر زبان مستقل انجام می‌شود.
-   عدم اجبار به تکمیل هم‌زمان ترجمه‌ها.
-   پشتیبانی از LTR و RTL.

### Page Builder

-   انعطاف‌پذیر و قابل توسعه با انواع Section و Block.
-   هر Block دارای `block_type`, `schema_version`, شناسه پایدار و داده
    اعتبارسنجی‌شده است.
-   اجرای arbitrary HTML، JavaScript، `eval` یا کد دلخواه کاربر ممنوع
    است.
-   Renderer فقط از کامپوننت‌های مورد اعتماد ثبت‌شده در Block Registry
    استفاده می‌کند.

### Design System

-   مدیریت Brand Palette، Semantic Tokens و Component Assignments به‌صورت
    تفکیک‌شده.
-   تولید طیف رنگی با OKLCH، بازه 50 تا 950 و امکان Override دستی.
-   تعریف مجزای Light و Dark Theme.
-   اعتبارسنجی کنتراست WCAG و هشدار برای ترکیب‌های نامناسب.
-   جلوگیری از انتشار Theme نامعتبر، مگر با Override صریح و ثبت‌شده.
-   Typography Manager و Font Manager با تنظیمات زبان‌محور و نقش‌محور.

### انتشار

-   انتشار مستقل هر حوزه/موجودیت و هر زبان.
-   Draft، Preview، Publish، Revision History و Rollback.
-   عدم الزام به انتشار یک Release اتمیک برای کل سایت.

## 4. محدودیت‌های محصول و زیرساخت

-   میزبانی اولیه Frontend: GitHub Pages.
-   GitHub Pages به‌تنهایی Backend یا دیتابیس فراهم نمی‌کند.
-   Backend اولیه پیشنهادی و تأییدشده در طراحی: Supabase.
-   دیتابیس: PostgreSQL.
-   Auth: Supabase Auth.
-   Storage: Supabase Storage.
-   منطق برنامه نباید مستقیماً به Supabase وابسته شود؛ Repository Pattern
    باید امکان مهاجرت آینده به Backend خودمیزبان را حفظ کند.
-   هیچ Service Role Key یا Secret نباید در کد Frontend قرار گیرد.

## 5. اصول غیرقابل مذاکره

1.  حفظ طراحی و رفتار فعلی تا زمانی که جایگزینی مشخص و تأییدشده وجود
    داشته باشد.
2.  مهاجرت تدریجی؛ بدون بازنویسی یک‌باره غیرضروری.
3.  امنیت واقعی در Backend؛ مخفی‌کردن Route یا UI کنترل دسترسی محسوب
    نمی‌شود.
4.  عدم اجرای کد دلخواه واردشده توسط مدیر.
5.  اعتبارسنجی ورودی در مرزهای سیستم.
6.  ثبت تاریخچه تغییرات و عملیات حساس.
7.  جداسازی Draft از Public.
8.  قابلیت بازیابی از انتشار اشتباه.
9.  تست و مستندسازی هر قابلیت.
10. عدم ادعای انجام عملیات، تست یا تغییر فایلی که واقعاً انجام نشده است.

## 6. دامنه خارج از نسخه اول

-   چند مدیر و نقش‌های پیچیده RBAC؛ نسخه اول Single Admin است.
-   اجرای arbitrary HTML/JS در Page Builder.
-   مهاجرت فوری به SSR یا میزبانی خودکار Frontend.
-   پردازش پیشرفته رسانه که هنوز زیرساخت و نیاز آن تأیید نشده است.
-   امکانات چندمستاجری یا چند پروفایل فعال، مگر در توسعه بعدی.

## 7. Product Constitution and requirements traceability

`GEMINI.md` is the owner-approved Product Constitution and the detailed
reference for product intent, expected capabilities and product-level
working expectations.

This Charter summarizes the product scope and its governing principles.
The Constitution provides additional detail; it does not independently
approve technical implementation choices or change the execution order
defined by the project Roadmap.

When a Constitution requirement affects architecture, data, security or
phase scope, the relevant architecture document and phase specification
must be reviewed and updated through the documentation governance process.

Documenting a target capability does not imply that the capability has
already been implemented.
