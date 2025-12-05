# 👻 قصة مرعبة بالإنجليزية - للاستخدام في New Session

## 📝 القصة الجاهزة للنسخ:

انسخ هذا النص وألصقه في حقل الإدخال:

```
A haunted Victorian mansion where every midnight, the portraits on the walls come alive and whisper dark secrets. The previous owner's ghost still roams the halls, searching for someone to take their place. Strange shadows move in the corners, and the old grandfather clock strikes thirteen times instead of twelve. Visitors who stay past midnight never leave the same way they came in.
```

---

## 🎯 خطوة بخطوة - دليل الاختبار الكامل:

### الخطوة 1: ✅ افتح نافذة "New Session"

- اضغط على زر **"+ New Session"** في Dashboard
- ✅ يجب أن تفتح نافذة منبثقة

---

### الخطوة 2: ✅ انسخ القصة المرعبة

- انسخ النص أعلاه
- الصقه في حقل الإدخال الكبير

**أو اكتب قصة خاصة بك:**

- يجب أن تكون بالإنجليزية
- يجب أن تكون مرعبة/مخيفة
- مثال: "A dark forest where lost souls wander forever..."

---

### الخطوة 3: ✅ اضغط "Summon Agents"

- بعد إدخال القصة، اضغط الزر البرتقالي **"Summon Agents"**
- ✅ يجب أن تغلق النافذة المنبثقة

---

### الخطوة 4: ⏳ انتظر النتيجة

**سيناريو 1: إذا API متاح ✅**

- ستنتقل تلقائياً لصفحة **Live Room**
- ستظهر معلومات الغرفة
- ستظهر الأزرار: "Start Workflow"
- ✅ **هذا يعني أن كل شيء يعمل!**

**سيناريو 2: إذا API غير متاح ⚠️**

- ستظهر رسالة: "API غير متاح. لتشغيل API: npm run dev:api"
- ✅ **هذا طبيعي - يعني Frontend يعمل بشكل صحيح**
- لتشغيل API: افتح terminal جديد واكتب:
  ```bash
  npm run dev:api
  ```

---

### الخطوة 5: ✅ في Live Room - اضغط "Start Workflow"

**إذا وصلت لـ Live Room:**

1. **سترى:**
   - Room ID
   - Input Text (القصة التي أدخلتها)
   - Status: "idle"
   - زر "Start Workflow"

2. **اضغط "Start Workflow"**
   - ✅ يجب أن يتغير Status إلى "running"
   - ✅ يجب أن تظهر Live Logs في الوقت الفعلي
   - ✅ يجب أن تظهر Assets بعد اكتمال العمل

3. **انتظر حتى يكتمل:**
   - Status: idle → running → done
   - ✅ هذا يعني أن الـ Agents تعمل!

---

### الخطوة 6: ✅ تحقق من النتائج

**بعد اكتمال العمل، يجب أن ترى:**

1. **Live Logs:**
   - سجلات من Story Agent
   - سجلات من Asset Agent
   - سجلات من Code Agent
   - سجلات من Deploy Agent

2. **Assets:**
   - Story (القصة المولدة)
   - Images (الصور المرعبة)
   - Code (الكود/اللعبة)
   - IPFS Links

3. **Status:**
   - يجب أن يكون "done" ✅

---

## 🧪 قائمة التحقق (Checklist):

### ✅ Frontend يعمل:

- [ ] Dashboard يفتح بشكل صحيح
- [ ] زر "New Session" يعمل
- [ ] النافذة المنبثقة تفتح
- [ ] يمكن إدخال النص
- [ ] زر "Summon Agents" يعمل

### ✅ API يعمل (إذا كان مشغل):

- [ ] بعد "Summon Agents" تنتقل لـ Live Room
- [ ] Live Room يعرض معلومات الغرفة
- [ ] زر "Start Workflow" يعمل
- [ ] Live Logs تظهر
- [ ] Assets تظهر بعد اكتمال العمل

### ✅ الوضع بدون API:

- [ ] رسالة واضحة تظهر إذا API غير متاح
- [ ] لا توجد أخطاء في console
- [ ] Frontend يعمل بشكل طبيعي

---

## 📝 أمثلة أخرى للقصص المرعبة:

### مثال 1:

```
An abandoned asylum where the screams of past patients echo through empty corridors. The lights flicker on their own, and doors slam shut with no one around. The basement holds a secret that should never be discovered.
```

### مثال 2:

```
A cursed lighthouse on a remote island where ships mysteriously disappear. The keeper's journal reveals that every full moon, something emerges from the depths below. The last entry was written in blood.
```

### مثال 3:

```
A forgotten cemetery where the graves open at midnight. The spirits of the buried rise to dance in the moonlight, and anyone who witnesses their ritual becomes one of them forever.
```

---

## 🎯 النتيجة المتوقعة:

### إذا كل شيء يعمل بشكل صحيح:

1. ✅ **Dashboard** → يعمل
2. ✅ **New Session Modal** → يفتح
3. ✅ **إدخال القصة** → يعمل
4. ✅ **Summon Agents** → ينشئ Room
5. ✅ **Live Room** → يفتح تلقائياً
6. ✅ **Start Workflow** → يبدأ العمل
7. ✅ **Live Logs** → تظهر في الوقت الفعلي
8. ✅ **Assets** → تظهر بعد اكتمال العمل
9. ✅ **Status** → يتغير من idle → running → done

---

## 🆘 إذا واجهت مشكلة:

### المشكلة: لا يحدث شيء بعد "Summon Agents"

**الحل:**

- تأكد أن API يعمل: `npm run dev:api`
- تحقق من console للأخطاء

### المشكلة: لا تظهر Live Logs

**الحل:**

- تأكد أن API يعمل
- تأكد أن SSE connection يعمل
- تحقق من Network tab في DevTools

### المشكلة: لا تظهر Assets

**الحل:**

- انتظر حتى يكتمل العمل (قد يستغرق وقت)
- تحقق من Status (يجب أن يكون "done")
- تحقق من Live Logs للتأكد من أن العمل اكتمل

---

**🎃 الآن انسخ القصة وألصقها في حقل الإدخال!**
