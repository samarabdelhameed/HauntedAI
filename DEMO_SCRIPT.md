# 🎬 HauntedAI x Kiro - Demo Script for Hackathon

## 📋 Demo Overview (5-7 minutes)

This demo showcases how Kiro AI IDE was used to build the entire HauntedAI platform using spec-driven development, property-based testing, and AI-powered automation.

---

## 🎯 Demo Structure

### Part 1: Introduction (30 seconds)
### Part 2: Kiro Integration Overview (1 minute)
### Part 3: Spec-Driven Development (2 minutes)
### Part 4: Property-Based Testing (1.5 minutes)
### Part 5: Live Demo (2 minutes)
### Part 6: Results & Impact (30 seconds)

---

## 📝 Full Script

### Part 1: Introduction (30 seconds)

**[ENGLISH]**
"Hi! I'm demonstrating HauntedAI - an AI-powered platform that generates interactive horror experiences with NFTs and blockchain rewards. What makes this special is that the ENTIRE platform was built using Kiro AI IDE, showcasing the future of AI-assisted development."

**[ARABIC]**
"مرحباً! أنا بعرض HauntedAI - منصة بتستخدم الذكاء الاصطناعي لتوليد تجارب رعب تفاعلية مع NFTs ومكافآت بلوكتشين. المميز إن المنصة كلها اتبنت باستخدام Kiro AI IDE، وده بيوضح مستقبل البرمجة بمساعدة الذكاء الاصطناعي."

---

### Part 2: Kiro Integration Overview (1 minute)

**[ENGLISH]**
"Let me show you how Kiro transformed our development process. 

[SHOW: .kiro folder structure]

Kiro uses three powerful features:

1. **Specs** - Formal requirements and design documents that guide AI development
2. **Steering Rules** - Architecture guidelines that ensure code quality
3. **Agent Hooks** - Automated workflows that run tests on every save

This isn't just code generation - it's intelligent, spec-driven development with built-in quality assurance."

**[ARABIC]**
"خليني أوريك إزاي Kiro غيّر عملية التطوير عندنا.

[اعرض: هيكل مجلد .kiro]

Kiro بيستخدم 3 مميزات قوية:

1. **Specs** - مستندات متطلبات وتصميم رسمية بتوجه تطوير الذكاء الاصطناعي
2. **Steering Rules** - قواعد معمارية بتضمن جودة الكود
3. **Agent Hooks** - سير عمل تلقائي بيشغل الاختبارات مع كل حفظ

ده مش مجرد توليد كود - ده تطوير ذكي موجه بالمواصفات مع ضمان جودة مدمج."

---

### Part 3: Spec-Driven Development (2 minutes)

**[ENGLISH]**
"Here's the game-changer: our spec files.

[SHOW: .kiro/specs/haunted-ai/requirements.md]

We defined 17 acceptance criteria - from user authentication to blockchain rewards. Each requirement is clear and testable.

[SHOW: .kiro/specs/haunted-ai/design.md]

Then Kiro helped us translate these into 25 correctness properties - formal specifications that MUST hold true for the system to work correctly.

[SHOW: .kiro/specs/haunted-ai/tasks.md]

Finally, we broke it down into 21 implementation tasks. Kiro tracked our progress and ensured every task satisfied its properties.

[RUN COMMAND]
```bash
# Show property coverage
npx kiro spec coverage haunted-ai
```

100% property coverage - every requirement has corresponding tests!"

**[ARABIC]**
"ده اللي غيّر اللعبة: ملفات المواصفات بتاعتنا.

[اعرض: .kiro/specs/haunted-ai/requirements.md]

حددنا 17 معيار قبول - من مصادقة المستخدم لمكافآت البلوكتشين. كل متطلب واضح وقابل للاختبار.

[اعرض: .kiro/specs/haunted-ai/design.md]

بعدين Kiro ساعدنا نترجم دول ل 25 خاصية صحة - مواصفات رسمية لازم تكون صحيحة عشان النظام يشتغل صح.

[اعرض: .kiro/specs/haunted-ai/tasks.md]

أخيراً، قسمناها ل 17 مهمة تنفيذ. Kiro تتبع تقدمنا وضمن إن كل مهمة بتحقق خصائصها.

[شغل الأمر]
```bash
# اعرض تغطية الخصائص
npx kiro spec coverage haunted-ai
```

100% تغطية خصائص - كل متطلب عنده اختبارات مقابلة!"

---

### Part 4: Property-Based Testing (1.5 minutes)

**[ENGLISH]**
"Traditional testing checks specific examples. Property-based testing verifies universal truths.

[SHOW: apps/api/src/modules/tokens/tokens.property.test.ts]

Look at this test - instead of checking one token reward, we test 100 random scenarios automatically. This catches edge cases we'd never think of manually.

[SHOW: .kiro/steering/testing-standards.md]

Kiro's steering rules enforce our testing standards across the entire codebase:
- Minimum 100 iterations per property test
- 80% code coverage requirement
- Automatic test execution on file save

[SHOW: .kiro/hooks/on-save.sh]

Every time we save a file, Kiro automatically runs relevant tests. No manual testing needed!"

**[ARABIC]**
"الاختبار التقليدي بيفحص أمثلة محددة. اختبار الخصائص بيتحقق من حقائق عامة.

[اعرض: apps/api/src/modules/tokens/tokens.property.test.ts]

بص على الاختبار ده - بدل ما نفحص مكافأة توكن واحدة، بنختبر 100 سيناريو عشوائي تلقائياً. ده بيلاقي حالات حدية مكناش هنفكر فيها يدوياً.

[اعرض: .kiro/steering/testing-standards.md]

قواعد التوجيه في Kiro بتفرض معايير الاختبار على الكود كله:
- 100 تكرار كحد أدنى لكل اختبار خاصية
- متطلب تغطية كود 80%
- تنفيذ اختبار تلقائي عند حفظ الملف

[اعرض: .kiro/hooks/on-save.sh]

كل مرة نحفظ ملف، Kiro بيشغل الاختبارات المتعلقة تلقائياً. مفيش حاجة للاختبار اليدوي!"

---

### Part 5: Live Demo (2 minutes)

**[ENGLISH]**
"Now let's see it in action!

[RUN COMMAND]
```bash
./start-dev.sh
```

This starts our entire microservices architecture:
- API Gateway on port 3000
- 4 AI Agents (Story, Asset, Code, Deploy)
- Frontend on port 3001
- Redis for real-time logs

[OPEN BROWSER: http://localhost:3001]

Watch as I create a horror experience:

1. **Login** - JWT authentication with MetaMask
2. **Create Room** - Enter horror prompt
3. **Real-time Logs** - See AI agents working via Server-Sent Events
4. **Story Generation** - GPT-4 creates the narrative
5. **Asset Generation** - DALL-E generates horror image
6. **Code Generation** - AI writes the interactive experience
7. **Deployment** - Auto-deploy to Vercel
8. **Blockchain Rewards** - Earn HAUNT tokens and NFT badges

[SHOW: Real-time SSE logs streaming]

See these logs? That's Kiro's SSE implementation - every agent reports progress in real-time. This was built following our steering rules for SSE standards.

[SHOW: Final deployed experience]

And there it is - a fully deployed, interactive horror experience with blockchain rewards!"

**[ARABIC]**
"دلوقتي خلينا نشوفه شغال!

[شغل الأمر]
```bash
./start-dev.sh
```

ده بيشغل معمارية الخدمات الصغيرة كلها:
- API Gateway على بورت 3000
- 4 وكلاء ذكاء اصطناعي (قصة، أصول، كود، نشر)
- الواجهة الأمامية على بورت 3001
- Redis للسجلات الفورية

[افتح المتصفح: http://localhost:3001]

اتفرج وأنا بعمل تجربة رعب:

1. **تسجيل الدخول** - مصادقة JWT مع MetaMask
2. **إنشاء غرفة** - إدخال موجه الرعب
3. **سجلات فورية** - شوف وكلاء الذكاء الاصطناعي شغالين عبر Server-Sent Events
4. **توليد القصة** - GPT-4 بيعمل السرد
5. **توليد الأصول** - DALL-E بيولد صورة الرعب
6. **توليد الكود** - الذكاء الاصطناعي بيكتب التجربة التفاعلية
7. **النشر** - نشر تلقائي على Vercel
8. **مكافآت البلوكتشين** - اكسب توكنات HAUNT وشارات NFT

[اعرض: سجلات SSE الفورية بتتدفق]

شايف السجلات دي؟ ده تنفيذ SSE من Kiro - كل وكيل بيبلغ عن التقدم فورياً. ده اتبنى باتباع قواعد التوجيه بتاعتنا لمعايير SSE.

[اعرض: التجربة المنشورة النهائية]

وهي دي - تجربة رعب تفاعلية منشورة بالكامل مع مكافآت بلوكتشين!"

---

### Part 6: Results & Impact (30 seconds)

**[ENGLISH]**
"The results speak for themselves:

✅ 17 features implemented
✅ 100% property coverage
✅ 80%+ code coverage
✅ Zero manual testing
✅ Built in record time

Kiro didn't just help us write code - it ensured correctness, enforced standards, and automated quality assurance. This is the future of software development."

**[ARABIC]**
"النتائج بتتكلم عن نفسها:

✅ 17 ميزة منفذة
✅ 100% تغطية خصائص
✅ أكتر من 80% تغطية كود
✅ صفر اختبار يدوي
✅ اتبنت في وقت قياسي

Kiro مش بس ساعدنا نكتب كود - ضمن الصحة، فرض المعايير، وأتمت ضمان الجودة. ده مستقبل تطوير البرمجيات."

---

## 🎬 Camera Shots Guide

### Shot 1: Opening (0:00-0:30)
- **Frame**: You on camera
- **Show**: HauntedAI logo/landing page
- **Highlight**: "Built entirely with Kiro AI IDE"

### Shot 2: Kiro Structure (0:30-1:30)
- **Frame**: Screen recording
- **Show**: VS Code with .kiro folder open
- **Navigate**: specs/ → steering/ → hooks/
- **Highlight**: File structure and organization

### Shot 3: Spec Files (1:30-3:30)
- **Frame**: Screen recording
- **Show**: requirements.md → design.md → tasks.md
- **Highlight**: Traceability from requirements to implementation
- **Run**: `npx kiro spec coverage haunted-ai`

### Shot 4: Property Tests (3:30-5:00)
- **Frame**: Screen recording
- **Show**: tokens.property.test.ts
- **Highlight**: 100 iterations, automatic edge case detection
- **Show**: on-save.sh hook triggering tests

### Shot 5: Live Demo (5:00-7:00)
- **Frame**: Split screen (terminal + browser)
- **Show**: `./start-dev.sh` starting services
- **Show**: Browser with full user journey
- **Highlight**: Real-time SSE logs
- **End**: Deployed experience with blockchain rewards

### Shot 6: Closing (7:00-7:30)
- **Frame**: You on camera
- **Show**: Results summary
- **CTA**: "Check out the code on GitHub"

---

## 🎤 Presentation Tips

### Energy & Pacing
- Speak clearly and enthusiastically
- Pause after key points
- Use hand gestures to emphasize
- Smile and maintain energy

### Technical Clarity
- Don't rush through code
- Highlight key lines
- Explain WHY, not just WHAT
- Use analogies for complex concepts

### Visual Flow
- Smooth transitions between shots
- Use zoom/highlight for important details
- Keep terminal text readable (large font)
- Use cursor to guide viewer's eye

### Bilingual Approach
- Choose ONE language for the video
- Add subtitles in the other language
- Or create two versions (recommended)

---

## 📊 Key Metrics to Mention

- **17 Features**: Complete platform functionality
- **25 Properties**: Formal correctness specifications
- **100+ Tests**: Property-based with 100 iterations each
- **80% Coverage**: Comprehensive code coverage
- **4 AI Agents**: Orchestrated microservices
- **Real-time SSE**: Live progress streaming
- **Blockchain Integration**: HAUNT tokens + NFT badges
- **Zero Manual Testing**: Fully automated QA

---

## 🎯 Call to Action

**[ENGLISH]**
"Want to see how we built this? Check out our GitHub repo, read our documentation, and try Kiro for your next project. The future of development is here!"

**[ARABIC]**
"عاوز تشوف إزاي بنينا ده؟ شوف مستودع GitHub بتاعنا، اقرا التوثيق، وجرب Kiro في مشروعك الجاي. مستقبل التطوير هنا!"

---

## 📁 Files to Show in Demo

1. `.kiro/specs/haunted-ai/requirements.md`
2. `.kiro/specs/haunted-ai/design.md`
3. `.kiro/specs/haunted-ai/tasks.md`
4. `.kiro/steering/testing-standards.md`
5. `.kiro/steering/sse-implementation-standards.md`
6. `.kiro/hooks/on-save.sh`
7. `apps/api/src/modules/tokens/tokens.property.test.ts`
8. `apps/api/src/modules/rooms/rooms.service.ts` (SSE implementation)

---

## ⚡ Quick Commands Reference

```bash
# Start all services
./start-dev.sh

# Check property coverage
npx kiro spec coverage haunted-ai

# Run property tests
npm run test:property

# Run full test suite
npm test

# Check test coverage
npm run test:coverage
```

---

**Good luck with your demo! 🎬🚀**
