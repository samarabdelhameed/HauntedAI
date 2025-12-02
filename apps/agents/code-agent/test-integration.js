#!/usr/bin/env node

/**
 * CodeAgent Integration Test
 * Tests code generation with real Gemini API
 * 
 * Usage:
 *   GEMINI_API_KEY=your_key node test-integration.js
 */

require('dotenv').config();

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

async function runTest() {
  console.log('\n' + '='.repeat(60));
  log('CodeAgent Integration Test', colors.cyan);
  console.log('='.repeat(60) + '\n');
  
  // Check API key
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('test')) {
    log('⚠️  Warning: Using test API key', colors.yellow);
    log('Set GEMINI_API_KEY to test with real Gemini API', colors.yellow);
    console.log('');
  }
  
  try {
    // Import service
    log('📦 Loading CodeService...', colors.cyan);
    const { CodeService } = require('./dist/code.service.js');
    
    // Create service instance
    const codeService = new CodeService();
    log('✅ CodeService loaded successfully', colors.green);
    
    // Test data
    const testData = {
      story: `A ghost haunts an abandoned mansion. The spirit appears at midnight, 
searching for something lost long ago. Visitors report seeing pale hands reaching 
through mirrors and hearing whispers in empty rooms.`,
      imageTheme: 'haunted mansion with ghostly apparitions and fog',
    };
    
    log('\n📝 Test Data:', colors.cyan);
    log(`Story: ${testData.story.substring(0, 100)}...`);
    log(`Theme: ${testData.imageTheme}`);
    
    // Generate code
    log('\n🎮 Generating code...', colors.cyan);
    const startTime = Date.now();
    
    const result = await codeService.generateCode(testData);
    
    const duration = Date.now() - startTime;
    
    log(`✅ Code generated in ${duration}ms`, colors.green);
    
    // Validate result
    log('\n🔍 Validating result...', colors.cyan);
    
    if (!result.code) {
      throw new Error('Missing code in result');
    }
    log(`✅ Code length: ${result.code.length} characters`, colors.green);
    
    if (!result.cid) {
      throw new Error('Missing CID in result');
    }
    log(`✅ CID: ${result.cid}`, colors.green);
    
    if (typeof result.tested !== 'boolean') {
      throw new Error('Missing tested flag');
    }
    log(`✅ Tested: ${result.tested}`, colors.green);
    
    if (result.patchAttempts !== undefined) {
      log(`ℹ️  Patch attempts: ${result.patchAttempts}`, colors.cyan);
    }
    
    // Security checks
    log('\n🔒 Security checks...', colors.cyan);
    
    if (result.code.includes('eval(')) {
      throw new Error('Code contains eval() - SECURITY RISK!');
    }
    log('✅ No eval() found', colors.green);
    
    if (result.code.includes('Function(')) {
      throw new Error('Code contains Function() - SECURITY RISK!');
    }
    log('✅ No Function() constructor found', colors.green);
    
    if (result.code.match(/on\w+\s*=/)) {
      throw new Error('Code contains inline handlers - SECURITY RISK!');
    }
    log('✅ No inline event handlers found', colors.green);
    
    // Code preview
    log('\n📄 Code Preview:', colors.cyan);
    console.log(result.code.substring(0, 500) + '...\n');
    
    log('═'.repeat(60), colors.green);
    log('✅ ALL TESTS PASSED!', colors.green);
    log('═'.repeat(60), colors.green);
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    log('\n❌ TEST FAILED:', colors.red);
    log(error.message, colors.red);
    console.error(error);
    process.exit(1);
  }
}

runTest();
