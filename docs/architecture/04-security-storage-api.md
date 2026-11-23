# Security, Storage and API Architecture

## 1. Authentication و Admin

-   Supabase Auth برای ورود مدیر.
-   Signup عمومی غیرفعال.
-   نسخه اول فقط یک حساب مدیر فعال.
-   MFA از نوع TOTP توصیه می‌شود.
-   عملیات Publish، Rollback و تغییرات امنیتی به AAL2 نیاز دارند.
-   پروفایل مجوز مدیر در `admin_profiles` نگهداری می‌شود.
-   هویت فقط از `auth.uid()` معتبر استخراج می‌شود؛ به `user_id` ارسالی
    کلاینت برای تشخیص مدیر اعتماد نمی‌شود.

مخفی‌کردن Route یا دکمه Admin امنیت محسوب نمی‌شود. تمام عملیات باید در
Backend مجوزدهی شوند.

## 2. RLS

-   RLS روی همه جداول حساس فعال باشد.
-   کاربر ناشناس فقط داده Published مجاز را بخواند.
-   Draft حتی در صورت دانستن UUID برای Anonymous قابل دسترسی نباشد.
-   Revisionها immutable باشند.
-   Publish و Rollback از مسیر RPC امن یا Edge Function کنترل‌شده انجام
    شوند؛ نه UPDATE مستقیم از Browser.
-   تابع `is_active_admin()` در صورت استفاده از SECURITY DEFINER باید
    `search_path` ثابت، مالکیت محدود و EXECUTE Grant کنترل‌شده داشته
    باشد.
-   از RLS recursion جلوگیری شود.
-   View عمومی فقط فیلدهای لازم را ارائه کند و در صورت امکان
    `security_invoker = true` داشته باشد.
-   دسترسی مستقیم Anonymous به `publication_units` نباید ناخواسته Draft
    Pointer یا داده داخلی را افشا کند. RLS به‌تنهایی Column-level
    Security نیست.

سیاست‌های دقیق باید با تست Anonymous، Admin و کاربر غیرفعال بررسی شوند.

## 3. Storage Buckets

Bucketهای پیشنهادی: - `portfolio-quarantine`: خصوصی، برای فایل خام
آپلودشده. - `portfolio-drafts`: خصوصی، برای رسانه اعتبارسنجی‌شده Draft. -
`portfolio-public`: خواندن عمومی، فقط برای رسانه منتشرشده.

آپلود مستقیم به Public ممنوع است. فایل ابتدا وارد Quarantine می‌شود.

## 4. Upload Workflow

1.  ایجاد Upload Intent.
2.  دریافت فایل در Quarantine.
3.  بررسی اندازه، پسوند، MIME و Magic Bytes.
4.  محاسبه Checksum.
5.  بررسی محتوای فایل و Metadata.
6.  پردازش تصویر/فونت در Worker یا Edge Function کنترل‌شده.
7.  ایجاد Variantهای لازم.
8.  انتقال به Draft.
9.  ثبت ارتباط Media با Revision.

برای SVG، Sanitization الزامی است. HTML، JavaScript، Executable و
Archive در نسخه اول پذیرفته نمی‌شوند. PDF در صورت نیاز و با سیاست مشخص
قابل بررسی است.

فرمت فونت‌های قابل بررسی: WOFF2، WOFF، TTF، OTF؛ WOFF2 ترجیح دارد. صرف
پسوند برای اعتبارسنجی کافی نیست.

## 5. Media Variants

Variantهای مفهومی: - Original - Thumbnail - Small - Medium - Large

WebP فرمت پیش‌فرض خروجی تصویر باشد؛ AVIF در صورت نیاز بعدی اضافه شود.
Original حفظ می‌شود. ابعاد و کیفیت دقیق باید بر اساس UI و تست عملکرد
تعیین شوند.

## 6. Font Security

-   فایل فونت تا زمان فعال و منتشرشدن عمومی نیست.
-   Metadata شامل family، weight، style، format، language/script
    coverage، variable axes، license، upload date و active state است.
-   CSS دلخواه از مدیر دریافت نمی‌شود.
-   `@font-face` از Metadata معتبر و مسیر فایل کنترل‌شده تولید می‌شود.
-   حذف فونت فعال باید مسدود یا با هشدار و جایگزینی کنترل‌شده انجام شود.

## 7. حذف رسانه

حذف فیزیکی Asset متصل به Draft یا Published Revision ممنوع است. ابتدا
Archive، سپس بررسی وابستگی‌ها و پاک‌سازی با تأخیر. Orphan cleanup باید
کنترل‌شده و قابل Audit باشد.

## 8. Preview

Draft Preview باید با Signed URL کوتاه‌عمر یا مکانیزم مجوزدهی معادل
محافظت شود. URL نباید دسترسی دائمی یا عمومی به Draft ایجاد کند.

## 9. Application API و Repository

لایه‌ها: 1. UI 2. Application Services 3. Domain Contracts 4. Repository
Interfaces 5. Infrastructure Adapters (Supabase در نسخه اول)

قراردادهای Repository نباید نوع‌های داخلی Supabase را به UI نشت دهند.

### Result و Error

الگوی مشترک `Result<T>` و `AppError` برای خطاهای قابل پیش‌بینی استفاده
شود. خطاهای امنیتی و داخلی نباید اطلاعات حساس را به کلاینت افشا کنند.

### عملیات حساس

-   Publish/Rollback idempotent باشند.
-   Optimistic concurrency داشته باشند.
-   Audit Event ثبت کنند.
-   اعتبارسنجی سمت سرور انجام شود.

### مرز API

در شروع، REST Server جداگانه لازم نیست. Supabase Client برای عملیات مجاز
و RPC/Edge Function برای عملیات حساس استفاده می‌شود. قرارداد منطقی API
مستقل از Supabase باقی می‌ماند.

## 10. Secrets

هیچ Service Role Key، Database Password، Signing Secret یا Secret دیگر
در Frontend، Repository عمومی یا Build Artifact قرار نگیرد. Public/Anon
key فقط با RLS درست قابل استفاده است.
