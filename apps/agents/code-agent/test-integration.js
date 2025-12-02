#!/usr/bin/env node

/**
 * CodeAgent Integration Test
 * 
 * Quick integration test to verify basic functionality
 */

const http = require('http');

const PORT = process.env.PORT || 3004;
const HOST = 'localhost';

console.log('\n🧪 CodeAgent Integration Test\n');

// Test data
const testRequest = {
  story: 'A haunted mansion with mysterious ghosts',
  imageTheme: 'spooky mansion',
};

// Make request
const data = JSON.stringify(testRequest);

const options = {
  hostname: HOST,
  port: PORT,
  path: '/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

console.log(`📡 Sending request to http://${HOST}:${PORT}/generate`);
console.log(`📝 Story: ${testRequest.story}`);
console.log(`🎨 Theme: ${testRequest.imageTheme}\n`);

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}\n`);

    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(body);

        console.log('✅ SUCCESS!\n');
        console.log(`📄 Code length: ${response.code?.length || 0} characters`);
        console.log(`🔗 CID: ${response.cid}`);
        console.log(`✓ Tested: ${response.tested}`);
        console.log(`🔧 Patch attempts: ${response.patchAttempts || 0}\n`);

        if (response.code) {
          console.log('📝 Code preview (first 300 chars):');
          console.log('─'.repeat(60));
          console.log(response.code.substring(0, 300) + '...');
          console.log('─'.repeat(60));
        }

        process.exit(0);
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.log('Response body:', body);
        process.exit(1);
      }
    } else {
      console.error(`❌ Request failed with status ${res.statusCode}`);
      console.log('Response:', body);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.log('\n💡 Make sure CodeAgent server is running:');
  console.log('   npm run dev\n');
  process.exit(1);
});

req.write(data);
req.end();
