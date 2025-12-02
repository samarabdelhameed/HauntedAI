#!/usr/bin/env node

/**
 * CodeAgent End-to-End Test
 * Tests the complete code generation workflow with real data
 * 
 * This test:
 * 1. Starts the CodeAgent server
 * 2. Sends a real story and image theme
 * 3. Generates actual code using Gemini API
 * 4. Validates the generated code
 * 5. Verifies Storacha upload (if configured)
 * 6. Tests the complete user scenario
 */

const http = require('http');

// Configuration
const CODE_AGENT_URL = process.env.CODE_AGENT_URL || 'http://localhost:3004';
const USE_REAL_API = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'test-gemini-key';

// Test data - Real spooky story and theme
const TEST_DATA = {
  story: `In the depths of an abandoned mansion, a young explorer named Sarah discovered a dusty mirror. 
As she wiped away the grime, her reflection began to move independently, reaching out from the glass 
with pale, ghostly hands. The room grew cold as whispers echoed through the halls, and Sarah realized 
she was no longer alone. The spirits of the mansion had awakened, and they wanted her to stay... forever.`,
  
  imageTheme: 'haunted mansion with ghostly mirror and pale hands reaching out, dark atmosphere with fog',
  
  roomId: 'test-room-' + Date.now()
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

/**
 * Make HTTP request
 */
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  logSection('Test 1: Health Check');
  
  try {
    logInfo('Checking CodeAgent health...');
    const response = await makeRequest(`${CODE_AGENT_URL}/health`, { method: 'GET' });
    
    if (response.status === 200 && response.data.status === 'ok') {
      logSuccess('CodeAgent is healthy');
      logInfo(`Service: ${response.data.service}`);
      logInfo(`Timestamp: ${response.data.timestamp}`);
      return true;
    } else {
      logError('Health check failed');
      return false;
    }
  } catch (error) {
    logError(`Health check error: ${error.message}`);
    logWarning('Make sure CodeAgent is running: npm run dev');
    return false;
  }
}

/**
 * Test 2: Code Generation
 */
async function testCodeGeneration() {
  logSection('Test 2: Code Generation');
  
  if (!USE_REAL_API) {
    logWarning('Skipping real API test - GEMINI_API_KEY not configured');
    logInfo('Set GEMINI_API_KEY environment variable to test with real API');
    return { skipped: true };
  }
  
  try {
    logInfo('Sending code generation request...');
    logInfo(`Story length: ${TEST_DATA.story.length} characters`);
    logInfo(`Image theme: ${TEST_DATA.imageTheme}`);
    
    const startTime = Date.now();
    
    const response = await makeRequest(
      `${CODE_AGENT_URL}/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      TEST_DATA
    );
    
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      logSuccess(`Code generated successfully in ${duration}ms`);
      
      const result = response.data;
      
      // Validate response structure
      logInfo('Validating response structure...');
      
      if (!result.code) {
        logError('Missing code in response');
        return { success: false };
      }
      logSuccess(`Code length: ${result.code.length} characters`);
      
      if (!result.cid) {
        logError('Missing CID in response');
        return { success: false };
      }
      logSuccess(`CID: ${result.cid}`);
      
      if (typeof result.tested !== 'boolean') {
        logError('Missing tested flag in response');
        return { success: false };
      }
      logSuccess(`Tested: ${result.tested}`);
      
      if (result.patchAttempts !== undefined) {
        logInfo(`Patch attempts: ${result.patchAttempts}`);
      }
      
      // Validate code content
      logInfo('Validating generated code...');
      
      if (!result.code.includes('<html') && !result.code.includes('<!DOCTYPE')) {
        logWarning('Code may be missing HTML structure');
      } else {
        logSuccess('Code has HTML structure');
      }
      
      if (result.code.includes('<script>')) {
        logSuccess('Code includes JavaScript');
      } else {
        logWarning('Code may be missing JavaScript');
      }
      
      // Security checks
      logInfo('Running security checks...');
      
      if (result.code.includes('eval(')) {
        logError('Code contains eval() - SECURITY RISK!');
        return { success: false };
      }
      logSuccess('No eval() found');
      
      if (result.code.includes('Function(')) {
        logError('Code contains Function() constructor - SECURITY RISK!');
        return { success: false };
      }
      logSuccess('No Function() constructor found');
      
      if (result.code.match(/on\w+\s*=/)) {
        logError('Code contains inline event handlers - SECURITY RISK!');
        return { success: false };
      }
      logSuccess('No inline event handlers found');
      
      // Validate CID format
      if (result.cid.match(/^bafy[a-z2-7]{55,}$/)) {
        logSuccess('CID format is valid');
      } else {
        logWarning('CID format may be invalid');
      }
      
      // Display code preview
      logInfo('Code preview (first 500 characters):');
      console.log(colors.cyan + result.code.substring(0, 500) + '...' + colors.reset);
      
      return {
        success: true,
        result,
        duration,
      };
    } else {
      logError(`Code generation failed with status ${response.status}`);
      logError(`Error: ${JSON.stringify(response.data)}`);
      return { success: false };
    }
  } catch (error) {
    logError(`Code generation error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Error Handling
 */
async function testErrorHandling() {
  logSection('Test 3: Error Handling');
  
  try {
    logInfo('Testing with invalid input (empty story)...');
    
    const response = await makeRequest(
      `${CODE_AGENT_URL}/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        story: '',
        imageTheme: 'test',
      }
    );
    
    if (response.status === 400) {
      logSuccess('Server correctly rejected empty story');
      return true;
    } else {
      logWarning(`Expected 400, got ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Error handling test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Performance Test
 */
async function testPerformance() {
  logSection('Test 4: Performance Test');
  
  if (!USE_REAL_API) {
    logWarning('Skipping performance test - requires real API');
    return { skipped: true };
  }
  
  try {
    logInfo('Running performance test with shorter story...');
    
    const shortStory = 'A ghost haunts an old house.';
    const shortTheme = 'spooky house';
    
    const startTime = Date.now();
    
    const response = await makeRequest(
      `${CODE_AGENT_URL}/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        story: shortStory,
        imageTheme: shortTheme,
      }
    );
    
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      logSuccess(`Performance test completed in ${duration}ms`);
      
      if (duration < 30000) {
        logSuccess('Response time is acceptable (< 30s)');
      } else {
        logWarning('Response time is slow (> 30s)');
      }
      
      return { success: true, duration };
    } else {
      logError('Performance test failed');
      return { success: false };
    }
  } catch (error) {
    logError(`Performance test error: ${error.message}`);
    return { success: false };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', colors.bright);
  log('║         CodeAgent End-to-End Test Suite                   ║', colors.bright);
  log('╚════════════════════════════════════════════════════════════╝', colors.bright);
  console.log('\n');
  
  logInfo(`CodeAgent URL: ${CODE_AGENT_URL}`);
  logInfo(`Using Real API: ${USE_REAL_API ? 'Yes' : 'No (mocked)'}`);
  console.log('\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  };
  
  // Test 1: Health Check
  const healthCheck = await testHealthCheck();
  results.total++;
  if (healthCheck) {
    results.passed++;
  } else {
    results.failed++;
    logError('Cannot proceed without healthy service');
    process.exit(1);
  }
  
  // Test 2: Code Generation
  const codeGen = await testCodeGeneration();
  results.total++;
  if (codeGen.skipped) {
    results.skipped++;
  } else if (codeGen.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 3: Error Handling
  const errorHandling = await testErrorHandling();
  results.total++;
  if (errorHandling) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 4: Performance
  const performance = await testPerformance();
  results.total++;
  if (performance.skipped) {
    results.skipped++;
  } else if (performance.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Summary
  logSection('Test Summary');
  
  console.log(`Total Tests:   ${results.total}`);
  logSuccess(`Passed:        ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed:        ${results.failed}`);
  }
  if (results.skipped > 0) {
    logWarning(`Skipped:       ${results.skipped}`);
  }
  
  console.log('\n');
  
  if (results.failed === 0) {
    log('╔════════════════════════════════════════════════════════════╗', colors.green);
    log('║              ✅ ALL TESTS PASSED! ✅                       ║', colors.green);
    log('╚════════════════════════════════════════════════════════════╝', colors.green);
    console.log('\n');
    process.exit(0);
  } else {
    log('╔════════════════════════════════════════════════════════════╗', colors.red);
    log('║              ❌ SOME TESTS FAILED ❌                       ║', colors.red);
    log('╚════════════════════════════════════════════════════════════╝', colors.red);
    console.log('\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
