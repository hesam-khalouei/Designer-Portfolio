# Design System, Typography, Page Builder and Admin UX

## 1. رنگ‌ها و Theme

### پالت فعلی Light

-   Background: `#faf9f6`
-   Surface: `#ffffff`
-   Surface Secondary: `#f0eeea`
-   Text: `#262326`
-   Text Secondary: `#77716f`
-   Primary: `#643349`
-   Accent: `#ad7d8e`
-   Accent Soft: `#eee3e7`
-   Border: `#e4e0dc`

### پالت فعلی Dark

-   Background: `#1e1b1e`
-   Surface: `#282428`
-   Surface Secondary: `#302a2e`
-   Text: `#f1ece8`
-   Text Secondary: `#b6abae`
-   Primary: `#d5a4b8`
-   Accent: `#ba8ba0`
-   Accent Soft: `#3d2c35`
-   Border: `#41373c`

این رنگ‌ها وضعیت فعلی‌اند، نه الزاماً مقادیر نهایی Design System آینده.

## 2. لایه‌های Design System

سه لایه مستقل: 1. **Brand Palette:** رنگ‌های پایه و طیف‌های مشتق‌شده. 2.
**Semantic Tokens:** مانند background, surface, text, border, primary,
danger, success. 3. **Component Assignments:** نگاشت Tokenها به اجزای
UI.

Brand Palette نباید مستقیماً در تمام Componentها مصرف شود.

## 3. Color Generation و Validation

-   تولید Tint/Shade با OKLCH.
-   طیف 50 تا 950.
-   امکان Override دستی هر مقدار.
-   Light و Dark مستقل.
-   نگاشت صریح رنگ به Semantic Token.
-   WCAG contrast validation.
-   نمایش جفت رنگ، نسبت کنتراست و نتیجه.
-   هشدار و جلوگیری از Publish Theme نامعتبر، مگر با Override صریح و
    Audit Event.
-   اعتبارسنجی باید روی رنگ‌های نهایی Renderشده انجام شود؛ صرف مقایسه نام
    Token کافی نیست.

## 4. Typography Manager

نقش‌های Typography: - Display - H1 تا H4 - Body Large - Body - Body
Small - Caption - Eyebrow - Label - Button

ویژگی‌های قابل کنترل: - Font Family - Size - Weight - Line Height -
Letter Spacing - Responsive Scaling

تنظیمات باید زبان‌محور و نقش‌محور باشند. متن فارسی و عربی باید از نظر
شکل‌دهی حروف، فاصله‌گذاری، ارتفاع خط، اعداد و شکست خطوط آزمایش شوند.

## 5. Font Manager

فرمت‌های قابل پذیرش: - WOFF2 ترجیحی - WOFF - TTF - OTF

Metadata: - Family - Filename - Language/Script Coverage - Weight -
Style - Variable Axes - Format - License - Upload Date - Active State

الزامات: - بررسی واقعی نوع و محتوای فایل. - بررسی Glyph Coverage تا حد
امکان. - Fallback مناسب. - تولید `@font-face` از Metadata معتبر. - عدم
پذیرش CSS دلخواه. - هشدار حذف فونت فعال. - فونت Draft تا زمان انتشار
عمومی نشود.

فونت فعلی سایت: - Inter برای LTR - Vazirmatn برای RTL هر دو از Google
Fonts بارگیری می‌شوند. فونت‌های پیشنهادی دیگری که در بحث مطرح شده‌اند، تا
زمان تصمیم و تأیید، فونت فعلی محسوب نمی‌شوند.

## 6. Page Builder

-   Flexible و قابل توسعه.
-   Section و Block با Registry.
-   Schema Version برای هر نوع Block.
-   Stable ID برای Section و Block.
-   Drag & Drop، Inspector، Preview، Undo/Redo در تجربه Admin.
-   اعتبارسنجی داده هنگام ذخیره و Publish.
-   Renderer عمومی فقط کامپوننت‌های ثبت‌شده و مورد اعتماد را اجرا کند.
-   عدم پشتیبانی از arbitrary HTML/JS، `eval` یا Dynamic Code Execution.

## 7. Admin UX

بخش‌های اصلی: - Dashboard - Content - Localization - Page Builder -
Design System - Media Library - SEO - Publishing - Settings

الزامات تجربه: - Responsive و RTL. - Empty Stateهای راهنما. - Contextual
Help. - Keyboard Navigation. - Focus Management. - فرم‌های دارای
Validation و پیام خطای روشن. - نمایش وضعیت Draft/Published و تفاوت
آن‌ها. - Preview قبل از Publish. - Revision History و Rollback. - جلوگیری
از گم‌شدن تغییرات و هشدار برای خروج با تغییر ذخیره‌نشده.

## 8. Admin Theme

پوسته Admin باید توکن‌های کنترل‌شده خود را داشته باشد. نباید با تغییر
Theme عمومی پورتفولیو، خوانایی یا عملکرد پنل مدیریت خراب شود. امکان
Preview Theme عمومی در پنل فراهم می‌شود، اما پوسته Admin از نظر عملیاتی
مستقل و قابل استفاده باقی می‌ماند.

## 9. Live Design Preview and media requirements

The following items refine the target product requirements from the
Product Constitution. They are planned capabilities and must not be
described as implemented until verified.

### 9.1 Language-aware typography

Typography configuration must be independently adjustable for `en`, `fa`
and `ar`, with role-based settings.

In addition to the existing scale, support the roles Display, Heading,
Body, UI, Accent and Fallback, and the detailed levels Display, H1–H4,
Body Large, Body, Body Small, Caption, Eyebrow, Label and Button.

Configurable attributes include font family, size, weight, line height,
letter spacing, text transform and responsive scaling.

The Constitution's initial font suggestions are recommendations, not
locked product decisions:

- English: Poppins for headings, DM Sans for body and Georgia as an
  editorial serif accent.
- Persian: Estedad for headings, Vazirmatn for body and a compatible
  Persian display accent.
- Arabic: IBM Plex Sans Arabic for headings, Noto Sans Arabic for body
  and Noto Naskh Arabic as an accent.

The current website fonts remain Inter for LTR and Vazirmatn for RTL
until a separate selection is reviewed and approved. Any future selection
must consider licensing, actual glyph coverage, shaping, fallback behavior
and visual regression tests.

### 9.2 Live Design Preview

The Design System Manager must provide a controlled preview workflow for:

- Light and Dark themes.
- English, Persian and Arabic.
- Desktop, Tablet and Mobile viewports.
- Reset to the original or last published theme.
- Save as Draft, Publish and Rollback.

Theme configuration must be versioned. Draft changes must not affect the
public website, and the last known good published theme must remain
recoverable.

### 9.3 Media Library requirements

The target Media Library must support upload, preview, replacement,
alternative text, file metadata, dimensions, file size, validation,
categorization and project assignment.

Custom fonts must use the controlled font-storage and validation workflow
defined in the architecture and security documents.

Existing `ProjectMedia` behavior and Phone, Laptop, Tablet, Browser,
Monitor and Multi-device compositions must be preserved. These requirements
do not authorize replacing existing public presentation behavior during
the current documentation-only alignment.
