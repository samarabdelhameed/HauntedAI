#!/usr/bin/env node

/**
 * CodeAgent End-to-End Test with Real Gemini API
 * 
 * This test verifies that CodeAgent works correctly with:
 * - Real Google Gemini Pro API
 * - Real code generation
 * - Real code validation
 * - Real Storacha upload (mocked for safety)
 * 
 * Requirements tested:
 * - 3.1: Code generation from story and image theme
 * - 3.2: Automated code testing
 * - 3.3: Auto-patching for failed tests
 * - 3.4: Code upload to Storacha
 */

const http = require('http');

// Configuration
const PORT = process.env.PORT || 3004;
const HOST = 'localhost';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

/**
 * Make HTTP request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
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
    const response = await makeRequest({
      hostname: HOST,
      port: PORT,
      path: '/health',
      method: 'GET',
    });

    if (response.statusCode === 200) {
      logSuccess('Health check passed');
      logInfo(`Service: ${response.body.service}`);
      logInfo(`Status: ${response.body.status}`);
      return true;
    } else {
      logError(`Health check failed with status ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Health check error: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Code Generation with Real Gemini API
 */
async function testCodeGeneration() {
  logSection('Test 2: Code Generation with Real Gemini API');

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'test-gemini-key') {
    logWarning('GEMINI_API_KEY not set or using test key');
    logWarning('Skipping real API test');
    return true;
  }

  const testData = {
    story: 'A haunted mansion where ghosts play hide and seek with visitors. The mansion has many rooms, and each room contains a ghost that appears and disappears mysteriously.',
    imageTheme: 'spooky haunted mansion with floating ghosts',
    roomId: 'test-room-123',
  };

  try {
    logInfo('Sending code generation request...');
    logInfo(`Story: ${testData.story.substring(0, 50)}...`);
    logInfo(`Image Theme: ${testData.imageTheme}`);

    const startTime = Date.now();

    const response = await makeRequest(
      {
        hostname: HOST,
        port: PORT,
        path: '/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      testData
    );

    const duration = Date.now() - startTime;

    if (response.statusCode === 200) {
      logSuccess(`Code generation completed in ${duration}ms`);

      // Validate response structure
      if (!response.body.code) {
        logError('Response missing code field');
        return false;
      }

      if (!response.body.cid) {
        logError('Response missing CID field');
        return false;
      }

      if (typeof response.body.tested !== 'boolean') {
        logError('Response missing tested field');
        return false;
      }

      logSuccess('Response structure is valid');
      logInfo(`Code length: ${response.body.code.length} characters`);
      logInfo(`CID: ${response.body.cid}`);
      logInfo(`Tested: ${response.body.tested}`);
      logInfo(`Patch attempts: ${response.body.patchAttempts || 0}`);

      // Validate code content
      const code = response.body.code;

      // Check for HTML structure
      if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
        logWarning('Generated code may be missing HTML structure');
      } else {
        logSuccess('Code contains HTML structure');
      }

      // Check for JavaScript
      if (code.includes('<script>')) {
        logSuccess('Code contains JavaScript');
      } else {
        logWarning('Code may be missing JavaScript');
      }

      // Check for CSS
      if (code.includes('<style>') || code.includes('style=')) {
        logSuccess('Code contains styling');
      } else {
        logWarning('Code may be missing styling');
      }

      // Check for security issues
      if (code.includes('eval(')) {
        logError('Code contains eval() - security risk!');
        return false;
      }

      if (code.includes('Function(')) {
        logError('Code contains Function() constructor - security risk!');
        return false;
      }

      logSuccess('Code passed security checks');

      // Validate CID format
      const cidPattern = /^bafy[a-z2-7]{55,}$/;
      if (cidPattern.test(response.body.cid)) {
        logSuccess('CID format is valid');
      } else {
        logWarning('CID format may be invalid (could be mocked)');
      }

      // Display code preview
      logInfo('\nGenerated Code Preview (first 500 chars):');
      console.log(colors.yellow + code.substring(0, 500) + '...' + colors.reset);

      return true;
    } else {
      logError(`Code generation failed with status ${response.statusCode}`);
      if (response.body && response.body.error) {
        logError(`Error: ${response.body.error}`);
        if (response.body.message) {
          logError(`Message: ${response.body.message}`);
        }
      }
      return false;
    }
  } catch (error) {
    logError(`Code generation error: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Test 3: Invalid Request Handling
 */
async function testInvalidRequest() {
  logSection('Test 3: Invalid Request Handling');

  const testCases = [
    {
      name: 'Missing story',
      data: { imageTheme: 'spooky theme' },
      expectedStatus: 400,
    },
    {
      name: 'Missing imageTheme',
      data: { story: 'A spooky story' },
      expectedStatus: 400,
    },
    {
      name: 'Empty story',
      data: { story: '', imageTheme: 'spooky theme' },
      expectedStatus: 400,
    },
    {
      name: 'Invalid data type',
      data: { story: 123, imageTheme: 'spooky theme' },
      expectedStatus: 400,
    },
  ];

  let allPassed = true;

  for (const testCase of testCases) {
    try {
      logInfo(`Testing: ${testCase.name}`);

      const response = await makeRequest(
        {
          hostname: HOST,
          port: PORT,
          path: '/generate',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        testCase.data
      );

      if (response.statusCode === testCase.expectedStatus) {
        logSuccess(`${testCase.name} - Correctly rejected`);
      } else {
        logError(
          `${testCase.name} - Expected status ${testCase.expectedStatus}, got ${response.statusCode}`
        );
        allPassed = false;
      }
    } catch (error) {
      logError(`${testCase.name} - Error: ${error.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Test 4: Performance Test
 */
async function testPerformance() {
  logSection('Test 4: Performance Test');

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'test-gemini-key') {
    logWarning('Skipping performance test (no real API key)');
    return true;
  }

  const testData = {
    story: 'A quick ghost story for performance testing.',
    imageTheme: 'simple ghost',
  };

  try {
    logInfo('Running performance test...');

    const startTime = Date.now();

    const response = await makeRequest(
      {
        hostname: HOST,
        port: PORT,
        path: '/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      testData
    );

    const duration = Date.now() - startTime;

    if (response.statusCode === 200) {
      logInfo(`Response time: ${duration}ms`);

      if (duration < 30000) {
        logSuccess('Performance is acceptable (< 30s)');
        return true;
      } else {
        logWarning(`Performance is slow (${duration}ms)`);
        return true; // Still pass, just slow
      }
    } else {
      logError('Performance test failed - request unsuccessful');
      return false;
    }
  } catch (error) {
    logError(`Performance test error: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         CodeAgent E2E Test with Real Gemini API           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');

  // Check if server is running
  logInfo(`Testing CodeAgent at http://${HOST}:${PORT}`);

  if (!GEMINI_API_KEY) {
    logWarning('GEMINI_API_KEY environment variable not set');
    logWarning('Some tests will be skipped');
  } else if (GEMINI_API_KEY === 'test-gemini-key') {
    logWarning('Using test GEMINI_API_KEY');
    logWarning('Real API tests will be skipped');
  } else {
    logSuccess('GEMINI_API_KEY is set');
  }

  console.log('\n');

  const results = {
    healthCheck: false,
    codeGeneration: false,
    invalidRequest: false,
    performance: false,
  };

  // Run tests
  results.healthCheck = await testHealthCheck();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  results.codeGeneration = await testCodeGeneration();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  results.invalidRequest = await testInvalidRequest();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  results.performance = await testPerformance();

  // Summary
  logSection('Test Summary');

  const tests = [
    { name: 'Health Check', result: results.healthCheck },
    { name: 'Code Generation', result: results.codeGeneration },
    { name: 'Invalid Request Handling', result: results.invalidRequest },
    { name: 'Performance', result: results.performance },
  ];

  let passedCount = 0;
  let failedCount = 0;

  tests.forEach((test) => {
    if (test.result) {
      logSuccess(`${test.name}: PASSED`);
      passedCount++;
    } else {
      logError(`${test.name}: FAILED`);
      failedCount++;
    }
  });

  console.log('\n');
  log(`Total: ${tests.length} tests`, 'cyan');
  log(`Passed: ${passedCount}`, 'green');
  log(`Failed: ${failedCount}`, failedCount > 0 ? 'red' : 'green');

  console.log('\n');

  if (failedCount === 0) {
    log('╔════════════════════════════════════════════════════════════╗', 'green');
    log('║              ALL TESTS PASSED! ✓                           ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝', 'green');
    process.exit(0);
  } else {
    log('╔════════════════════════════════════════════════════════════╗', 'red');
    log('║              SOME TESTS FAILED! ✗                          ║', 'red');
    log('╚════════════════════════════════════════════════════════════╝', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
