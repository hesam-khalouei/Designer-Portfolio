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

### 1.1 Admin Authentication and Session Lifecycle

The Authentication implementation must preserve the existing application dependency boundaries:

- Domain: provider-neutral identity, session, and assurance concepts where needed.
- Application: Authentication repository contract and use cases.
- Infrastructure: Supabase Auth adapter and provider-specific error mapping.
- App Providers: Admin authentication state and session lifecycle.
- Admin Routing: user-experience guard for signed-out and unauthorized states.
- Backend: authoritative active-admin, RLS, and assurance enforcement.

Supabase SDK types must not leak into Domain, Application, or UI contracts.

The proposed session lifecycle includes:

1. Resolve the initial persisted session.
2. Subscribe to Authentication state changes.
3. Use the Supabase SDK for token refresh.
4. Support explicit sign-out.
5. Unsubscribe when the owning provider is disposed.

Application code must not manually store or manage access and refresh tokens.

Admin access states should distinguish:

- Loading.
- Anonymous.
- Authenticated active admin.
- Authenticated but unauthorized or inactive admin.
- Authorization check failure.

A failed or unavailable active-admin check must fail closed. An Authentication session alone does not establish Admin authorization.

### 1.2 Active Admin Authorization and Provisioning

The authenticated identity must be derived exclusively from `auth.uid()`. The active `admin_profiles` record must correspond to that identity.

Admin account creation and activation require a trusted provisioning process. Browser clients must not receive the Supabase Service Role key or receive privileges to provision or activate admin profiles.

An inactive admin may retain a valid Supabase Auth session, but must not receive administrative database access. RLS and backend authorization remain authoritative.

The initial login method is confirmed as Email/Password through Supabase Auth. Public sign-up remains disabled.

Account recovery, administrator replacement, and emergency recovery procedures must be defined before production activation.

### 1.3 MFA and Elevated Assurance

TOTP MFA is the recommended second factor.

A normal authenticated session may have Authentication Assurance Level AAL1. Sensitive operations must require AAL2, including:

- Publish.
- Rollback.
- Security-sensitive account or permission changes.

Client-side assurance checks may control the visibility or enabled state of UI actions, but must never be the sole enforcement mechanism.

The backend RPC or Edge Function responsible for a sensitive operation must independently validate the authenticated identity, active-admin status, and required assurance level before performing the operation.

The current foundation migrations do not implement AAL2 enforcement or privileged publishing RPCs. These are implementation prerequisites before enabling the corresponding operations.

TOTP enrollment, verification, factor recovery, and loss-of-device procedures must be tested before production activation.

### 1.4 Admin Route Guard and Backend Boundary

The Admin route should eventually resolve Authentication and active-admin authorization before rendering the Admin shell.

Expected route states include loading, login required, unauthorized, recoverable authorization error, and authorized Admin access.

The route guard is strictly a user-experience boundary. It does not replace:

- Database RLS policies.
- `auth.uid()` identity derivation.
- Active-admin checks.
- Backend authorization for privileged operations.
- AAL2 enforcement.

Direct navigation, manipulated client state, or a valid Authentication session must never bypass backend authorization.

### 1.5 Browser Session Security

The existing Supabase client enables persistent sessions and automatic token refresh. This configuration does not by itself constitute a complete session security implementation.

The implementation must avoid manual token storage, use HTTPS in production, preserve safe React rendering practices, and include appropriate browser security protections such as Content Security Policy where supported by the final hosting architecture.

The final session-storage strategy must be reviewed again if the hosting architecture introduces server-side rendering or server-managed sessions.

### Batch 4.7 follow-up — 2026-11-25

Provider-neutral Authentication Domain models, the Application repository contract, sign-in/sign-out/session use cases, typed Application errors, and five fake-repository contract tests are now implemented and locally verified. Actual Supabase Auth integration, login UI, active-admin authorization, provisioning, MFA/AAL2 enforcement, and route protection remain pending.


### Batch 4.8 follow-up — 2026-11-25

The Supabase Authentication Infrastructure adapter now implements the Application `AdminAuthRepository` contract. It maps Supabase sessions to provider-neutral `AdminSession` values, restores persisted sessions, handles password sign-in and sign-out, subscribes to Authentication state changes, and supports subscription cleanup.

Security boundaries and limitations:

- Supabase SDK types and raw access/refresh tokens must not cross the Infrastructure boundary.
- Missing or invalid identity data must fail closed.
- Session expiry is represented in Unix milliseconds.
- The adapter currently reports `aal1` conservatively. It does not establish or claim AAL2, and factor enrollment alone must not be used to infer assurance.
- Authentication state is not active-admin authorization. The adapter does not replace the active `admin_profiles` check or backend RLS enforcement.
- Adapter tests use a fake Supabase client. Live Supabase Auth, database, RLS, provisioning, MFA, and AAL2 behavior remain unverified.
- Login UI, Auth provider lifecycle integration, and Admin route protection remain pending.

### Batch 4.9 follow-up — 2026-11-25

The React Admin Authentication lifecycle and Email/Password login flow are implemented:
- `AdminAuthProvider` restores the session and subscribes to Auth changes.
- Loading, authenticated, unauthenticated, and error states are represented explicitly.
- Session restoration and synchronous subscription-registration failures fail closed.
- The login page displays generic authentication errors.
- `AdminAuthGate` prevents Admin UI rendering until a session is restored and authenticated.

The gate is a client-side UX control, not an authorization boundary. Authentication does not establish active-admin authorization. Backend checks and RLS remain authoritative. Active-admin profile integration, provisioning, live Supabase/RLS verification, MFA enrollment, and AAL2 enforcement remain pending. The current adapter reports AAL1 conservatively.
