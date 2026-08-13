# Salawat PWA — صلّوا عليه ﷺ

صفحة جماعية قابلة للتثبيت على الجوال كـ PWA، مع عداد مشترك بين جميع المشاركات.

## الملفات
- `index.html` واجهة الصفحة
- `styles.css` التصميم
- `app.js` منطق الصفحة والربط
- `manifest.webmanifest` معلومات التطبيق عند إضافته للشاشة الرئيسية
- `service-worker.js` دعم PWA
- `google-apps-script.gs` كود Google Apps Script لحفظ العداد في Google Sheet

## 1) إنشاء Google Sheet
1. أنشئي Google Sheet جديد.
2. من القائمة: Extensions → Apps Script.
3. احذفي الكود الموجود والصقي محتوى `google-apps-script.gs`.
4. Save.
5. Deploy → New deployment → Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Deploy ثم انسخي رابط الـ Web App.

## 2) ربط الصفحة
افتحي `app.js` وبدّلي:
`PUT_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
برابط Web App الذي نسختيه.

## 3) رفعها على GitHub Pages
ارفعي كل محتويات هذا المجلد إلى Repository عام.
ثم:
Settings → Pages → Deploy from a branch → main / root

بعدها سيظهر رابط الصفحة.

## 4) تثبيت الصفحة كتطبيق
- Android/Chrome: سيظهر زر "ثبّتيها كتطبيق على الجوال" عندما يكون التثبيت متاحًا.
- iPhone/iPad: افتحي الرابط في Safari → Share → Add to Home Screen.

## إعدادات الحملة
داخل `app.js`:
- `GOAL = 200000`
- `START_DATE = "2026-08-14"`
- `TOTAL_DAYS = 12`

يمكن تعديلهم بسهولة.


## تحديث النوايا
- لا توجد أسماء نهائيًا.
- العداد يسجل فقط الوقت والعدد.
- يوجد قسم "نوايانا" لكتابة نية مجهولة.
- النوايا تحفظ في Sheet منفصل باسم `Intentions`.
- الصفحة تعرض آخر 50 نية.
