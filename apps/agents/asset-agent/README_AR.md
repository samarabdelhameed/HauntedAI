# AssetAgent - خدمة توليد الصور المرعبة

**مُدار بواسطة Kiro** | جزء من منصة HauntedAI

## ✨ جديد: توليد صور مجاني!

AssetAgent الآن يستخدم **Pollination AI** - مجاني تماماً بدون الحاجة لمفتاح API!

## نظرة عامة

AssetAgent هي خدمة صغيرة تولد صوراً مرعبة باستخدام **Pollination AI (مجاني)** بناءً على محتوى القصة. تقوم تلقائياً بإنشاء صور رعب قوطية جوية وتخزينها على شبكة Storacha/IPFS اللامركزية.

## المميزات

- ✨ **Pollination AI (مجاني)**: لا يحتاج مفتاح API، استخدام غير محدود، توليد < 2 ثانية
- 🎨 **جودة عالية**: مشابهة لجودة DALL-E 2
- 📦 **تخزين Storacha**: تخزين لامركزي مع تتبع CID
- 🔄 **منطق إعادة المحاولة**: تأخير أسي للفشل في API (3 محاولات)
- 🗜️ **تحسين الصور**: ضغط تلقائي للصور > 1MB
- 🏥 **فحوصات الصحة**: نقطة نهاية مراقبة صحة مدمجة
- 📝 **تسجيل شامل**: تسجيل تفصيلي للعمليات

## لماذا Pollination AI؟

| الميزة | Pollination AI | DALL-E 3 |
|--------|---------------|----------|
| **التكلفة** | مجاني ∞ | $0.04/صورة |
| **مفتاح API** | غير مطلوب | مطلوب |
| **السرعة** | < 2 ثانية | 3-5 ثواني |
| **الجودة** | ≈ DALL-E 2 | الأعلى |
| **الحدود** | غير محدود | محدود بالمعدل |

## المتطلبات

- Node.js 20+
- npm أو yarn
- لا يوجد مفتاح API مطلوب! 🎉

## التثبيت

```bash
cd apps/agents/asset-agent
npm install
```

## الإعداد

### 1. ملف البيئة

أنشئ ملف `.env`:

```bash
# ✨ Pollination AI - مجاني (لا يحتاج مفتاح API!)
IMAGE_PROVIDER=pollination

# إعدادات الخادم
PORT=3003
NODE_ENV=development

# إعدادات Storacha (اختياري)
# STORACHA_DID=your_storacha_did_here
```

### 2. تشغيل الخدمة

```bash
# وضع التطوير
npm run dev

# بناء للإنتاج
npm run build
npm start
```

## استخدام API

### توليد صورة

**الطلب:**
```bash
POST http://localhost:3003/generate
Content-Type: application/json

{
  "story": "قصة مرعبة عن قلعة مسكونة في ليلة عاصفة",
  "storySummary": "قلعة مسكونة، ليلة عاصفة، أشباح",
  "roomId": "room-123"
}
```

**الاستجابة:**
```json
{
  "imageCid": "bafybeig...",
  "imageUrl": "https://image.pollinations.ai/prompt/...",
  "metadata": {
    "size": 245678,
    "format": "png",
    "width": 1024,
    "height": 1024,
    "generatedAt": "2024-12-02T...",
    "model": "pollination-ai-flux",
    "provider": "Pollination AI (FREE)",
    "prompt": "قلعة مسكونة..."
  }
}
```

### فحص الصحة

```bash
GET http://localhost:3003/health
```

**الاستجابة:**
```json
{
  "status": "ok",
  "service": "AssetAgent",
  "timestamp": "2024-12-02T...",
  "imageProvider": "Pollination AI (FREE)"
}
```

## الاختبار

### اختبار سريع لـ Pollination AI

```bash
node test-pollination.js
```

هذا سيولد 3 صور اختبارية ويحفظها محلياً.

### اختبارات الخصائص

```bash
npm test
```

### اختبارات التكامل

```bash
npm run test:integration
```

### اختبارات E2E

```bash
node test-asset-e2e.js
```

## كيف يعمل؟

### 1. استقبال القصة
```typescript
const request = {
  story: "قصة مرعبة...",
  roomId: "room-123"
};
```

### 2. توليد Prompt للصورة
```typescript
// استخراج العناصر الرئيسية من القصة
const prompt = "قلعة مسكونة، ليلة عاصفة، أسلوب رعب قوطي، إضاءة درامية...";
```

### 3. توليد الصورة (Pollination AI)
```typescript
const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}&width=1024&height=1024&nologo=true&enhance=true&model=flux`;

const response = await axios.get(imageUrl, {
  responseType: 'arraybuffer'
});
```

### 4. تحسين الصورة
```typescript
// ضغط إذا كانت > 1MB
if (imageBuffer.length > 1024 * 1024) {
  optimizedBuffer = await sharp(imageBuffer)
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();
}
```

### 5. رفع على Storacha
```typescript
const imageCid = await storacha.uploadFile(
  optimizedBuffer,
  'image.png',
  'image/png'
);
```

## مقارنة الأداء

| المقياس | Pollination AI | DALL-E 3 |
|---------|---------------|----------|
| وقت التوليد | 1-2 ثانية | 3-5 ثواني |
| التكلفة لكل صورة | $0 | $0.04 |
| الحد اليومي | ∞ | حسب الاشتراك |
| جودة الصورة | عالية (≈ DALL-E 2) | أعلى |
| سهولة الإعداد | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| يحتاج API key | ❌ لا | ✅ نعم |

## أمثلة على Prompts

### مثال 1: قلعة مسكونة
```
Input: "قصة عن قلعة مسكونة في ليلة عاصفة"
Prompt: "A haunted castle on a dark stormy night, gothic horror style, dramatic lighting, fog and shadows, eerie atmosphere, cinematic composition, highly detailed, photorealistic"
```

### مثال 2: غابة مظلمة
```
Input: "غابة مظلمة مع مخلوقات غامضة"
Prompt: "Dark mysterious forest with supernatural creatures, Halloween theme, eerie fog, moonlight through trees, spooky atmosphere, cinematic, highly detailed"
```

## استكشاف الأخطاء

### المشكلة: الصورة لا تتولد

**الحل:**
1. تحقق من الاتصال بالإنترنت
2. جرب prompt مختلف
3. انتظر قليلاً وحاول مرة أخرى

### المشكلة: الصورة بطيئة

**الحل:**
- Pollination AI قد يكون بطيئاً في أوقات الذروة
- الخدمة تعيد المحاولة تلقائياً 3 مرات
- عادة < 2 ثانية

### المشكلة: جودة الصورة منخفضة

**الحل:**
- أضف تفاصيل أكثر في الـ prompt
- استخدم كلمات مثل "highly detailed", "photorealistic", "4k"
- جرب نماذج مختلفة (flux, turbo)

## التكامل مع Orchestrator

```typescript
// في Orchestrator
const assetResult = await axios.post('http://localhost:3003/generate', {
  story: storyResult.story,
  storySummary: storyResult.summary,
  roomId: room.id
});

console.log(`Image generated: ${assetResult.data.imageCid}`);
```

## الأمان

- ✅ لا يوجد مفاتيح API للتسريب
- ✅ جميع الصور مخزنة على IPFS (لامركزي)
- ✅ لا بيانات حساسة في الـ logs
- ✅ التحقق من صحة المدخلات

## الأداء

- **وقت التوليد**: 1-2 ثانية (متوسط)
- **حجم الصورة**: 200-500 KB (بعد التحسين)
- **الدقة**: 1024x1024 بكسل
- **التنسيق**: PNG

## الترخيص

MIT

## المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch للميزة
3. Commit التغييرات
4. Push إلى Branch
5. فتح Pull Request

## الدعم

إذا واجهت مشاكل:
1. تحقق من [POLLINATION_AI_MIGRATION.md](./POLLINATION_AI_MIGRATION.md)
2. افتح Issue في GitHub
3. راجع الـ logs في `console`

## روابط مفيدة

- [Pollination AI](https://pollinations.ai/)
- [Storacha Documentation](https://docs.storacha.network/)
- [HauntedAI GitHub](https://github.com/your-repo)

---

**مُدار بواسطة Kiro** | منصة HauntedAI | هاكاثون 2024
