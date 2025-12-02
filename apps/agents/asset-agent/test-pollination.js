#!/usr/bin/env node

/**
 * اختبار سريع لـ Pollination AI
 * Quick test for Pollination AI integration
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const POLLINATION_BASE_URL = 'https://image.pollinations.ai/prompt';

async function testPollinationAI() {
  console.log('='.repeat(60));
  console.log('🎨 اختبار Pollination AI - توليد صور مجاني');
  console.log('='.repeat(60));

  const testPrompts = [
    'A haunted castle on a dark stormy night, gothic horror style, dramatic lighting',
    'Spooky ghost in an abandoned mansion, eerie atmosphere, fog and shadows',
    'Dark forest with mysterious creatures, Halloween theme, cinematic',
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n📝 Test ${i + 1}/${testPrompts.length}`);
    console.log(`Prompt: "${prompt.substring(0, 60)}..."`);

    try {
      // Build Pollination AI URL
      const imageUrl = `${POLLINATION_BASE_URL}/${encodeURIComponent(prompt)}&width=512&height=512&nologo=true&enhance=true&model=flux`;

      console.log('🔄 Generating image...');
      const startTime = Date.now();

      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      const imageBuffer = Buffer.from(response.data);
      const sizeKB = (imageBuffer.length / 1024).toFixed(2);

      console.log(`✅ Image generated successfully!`);
      console.log(`   Size: ${sizeKB} KB`);
      console.log(`   Time: ${duration} seconds`);
      console.log(`   URL: ${imageUrl.substring(0, 80)}...`);

      // Save image for inspection
      const filename = `test-image-${i + 1}.png`;
      fs.writeFileSync(filename, imageBuffer);
      console.log(`   💾 Saved as: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ الاختبار انتهى - تحقق من الصور المحفوظة');
  console.log('='.repeat(60));
}

// Run test
testPollinationAI().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
