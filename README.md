# Keepotion Cloud - Smart Notes with Hashtag Folders

تطبيق ملاحظات ذكي - لما تكتب #study بتنشئ الفولدر لحالها وبتحط الملاحظة فيه.
يعمل على كل الأجهزة مع Cloudflare D1 Database.

## المميزات
- 📝 Markdown Editor
- #️⃣ Hashtag auto-folder (#study, #work, #ideas)
- ☁️ Cloud sync على كل الأجهزة (D1)
- 📁 فولدرات بإيموجي وألوان
- 🔍 بحث سريع

## التركيب

### 1. D1 Database
Cloudflare Dashboard > D1 SQL > Create database `keepotion-db`
شغل محتوى ملف `schema.sql` في Console

### 2. ربط المشروع
Pages > Settings > Functions > D1 Bindings
- Variable name: `DB`
- Database: `keepotion-db`

### 3. Deploy
- اربط هذا الـ Repo بـ Cloudflare Pages
- Build settings: Framework preset = None, Build command = (فارغ), Output directory = /

## هيكل المشروع
```
/
├── index.html          # التطبيق الرئيسي
├── schema.sql          # جداول D1
└── functions/
    └── api/
        ├── folders.js  # API الفولدرات
        └── notes.js    # API الملاحظات + منطق الهاشتاغ
```

API:
- GET/POST/PUT/DELETE /api/folders
- GET/POST/PUT/DELETE /api/notes
