#!/usr/bin/env node

/**
 * Automated Backend Test - HauntedAI Platform
 * Tests all API endpoints and functionality
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

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

function logStep(step, message) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`TEST ${step}: ${message}`, 'cyan');
  log('='.repeat(70), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const STORY = `On a stormy night, Sarah decided to explore the abandoned house at the end of the street.`;

// Test 1: Health Check
async function test1_healthCheck() {
  logStep(1, 'Health Check');
  
  try {
    const response = await axios.get(`${API_BASE}/health`);
    
    if (response.data.status === 'ok') {
      logSuccess('API is healthy');
      logInfo(`   Database: ${response.data.services.database}`);
      logInfo(`   Version: ${response.data.version}`);
      
      const modules = Object.keys(response.data.modules);
      logInfo(`   Modules (${modules.length}): ${modules.join(', ')}`);
      
      return true;
    }
    
    logError('API health check failed');
    return false;
  } catch (error) {
    logError('Health check failed: ' + error.message);
    return false;
  }
}

// Test 2: CORS Configuration
async function test2_corsCheck() {
  logStep(2, 'CORS Configuration');
  
  try {
    const response = await axios.options(`${API_BASE}/rooms`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
      },
    });
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    const allowMethods = response.headers['access-control-allow-methods'];
    const allowCredentials = response.headers['access-control-allow-credentials'];
    
    logSuccess('CORS is configured');
    logInfo(`   Allow-Origin: ${allowOrigin}`);
    logInfo(`   Allow-Methods: ${allowMethods}`);
    logInfo(`   Allow-Credentials: ${allowCredentials}`);
    
    if (allowOrigin === 'http://localhost:5173') {
      logSuccess('CORS allows frontend origin');
      return true;
    } else {
      logError('CORS does not allow frontend origin');
      return false;
    }
  } catch (error) {
    logError('CORS check failed: ' + error.message);
    return false;
  }
}

// Test 3: Authentication Endpoints
async function test3_authEndpoints() {
  logStep(3, 'Authentication Endpoints');
  
  let passed = 0;
  let failed = 0;
  
  // Test 3.1: Login endpoint exists
  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      {
        walletAddress: '0xTest',
        signature: 'test',
        message: 'test',
      },
      { validateStatus: () => true }
    );
    
    if (response.status === 400 || response.status === 401) {
      logSuccess('Login endpoint exists and validates input');
      passed++;
    } else {
      logError(`Login endpoint returned unexpected status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    logError('Login endpoint test failed: ' + error.message);
    failed++;
  }
  
  logInfo(`   Auth tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 4: Protected Endpoints
async function test4_protectedEndpoints() {
  logStep(4, 'Protected Endpoints (Authorization)');
  
  const endpoints = [
    { method: 'GET', path: '/rooms', name: 'List Rooms' },
    { method: 'POST', path: '/rooms', name: 'Create Room' },
    { method: 'GET', path: '/assets', name: 'List Assets' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE}${endpoint.path}`,
        data: endpoint.method === 'POST' ? { inputText: 'test' } : undefined,
        validateStatus: () => true,
      });
      
      if (response.status === 401) {
        logSuccess(`${endpoint.name}: Requires authentication ✓`);
        passed++;
      } else {
        logError(`${endpoint.name}: Not protected (status ${response.status})`);
        failed++;
      }
    } catch (error) {
      logError(`${endpoint.name}: Test failed - ${error.message}`);
      failed++;
    }
  }
  
  logInfo(`   Protected endpoint tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 5: Public Endpoints
async function test5_publicEndpoints() {
  logStep(5, 'Public Endpoints');
  
  let passed = 0;
  let failed = 0;
  
  // Test 5.1: Explore endpoint
  try {
    const response = await axios.get(`${API_BASE}/assets/explore?page=1&limit=12`);
    
    if (response.status === 200 && response.data.data !== undefined) {
      logSuccess('Explore endpoint works');
      logInfo(`   Total assets: ${response.data.pagination.total}`);
      logInfo(`   Page size: ${response.data.pagination.pageSize}`);
      passed++;
    } else {
      logError('Explore endpoint returned unexpected response');
      failed++;
    }
  } catch (error) {
    logError('Explore endpoint test failed: ' + error.message);
    failed++;
  }
  
  // Test 5.2: Health endpoint
  try {
    const response = await axios.get(`${API_BASE}/health`);
    
    if (response.status === 200) {
      logSuccess('Health endpoint is public');
      passed++;
    } else {
      logError('Health endpoint failed');
      failed++;
    }
  } catch (error) {
    logError('Health endpoint test failed: ' + error.message);
    failed++;
  }
  
  logInfo(`   Public endpoint tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 6: API Documentation
async function test6_apiDocs() {
  logStep(6, 'API Documentation (Swagger)');
  
  try {
    const response = await axios.get('http://localhost:3001/api/docs', {
      validateStatus: () => true,
    });
    
    if (response.status === 200) {
      logSuccess('Swagger documentation is available');
      logInfo('   URL: http://localhost:3001/api/docs');
      return true;
    } else {
      logError(`Swagger returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError('Swagger documentation test failed: ' + error.message);
    return false;
  }
}

// Test 7: Error Handling
async function test7_errorHandling() {
  logStep(7, 'Error Handling');
  
  let passed = 0;
  let failed = 0;
  
  // Test 7.1: Invalid endpoint
  try {
    const response = await axios.get(`${API_BASE}/invalid-endpoint`, {
      validateStatus: () => true,
    });
    
    if (response.status === 404) {
      logSuccess('404 errors are handled correctly');
      passed++;
    } else {
      logError(`Invalid endpoint returned: ${response.status}`);
      failed++;
    }
  } catch (error) {
    logError('404 test failed: ' + error.message);
    failed++;
  }
  
  // Test 7.2: Invalid method
  try {
    const response = await axios.patch(`${API_BASE}/health`, {}, {
      validateStatus: () => true,
    });
    
    if (response.status === 404 || response.status === 405) {
      logSuccess('Invalid methods are rejected');
      passed++;
    } else {
      logError(`Invalid method returned: ${response.status}`);
      failed++;
    }
  } catch (error) {
    logError('Invalid method test failed: ' + error.message);
    failed++;
  }
  
  logInfo(`   Error handling tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 8: Response Format
async function test8_responseFormat() {
  logStep(8, 'Response Format Consistency');
  
  let passed = 0;
  let failed = 0;
  
  // Test 8.1: Success response format
  try {
    const response = await axios.get(`${API_BASE}/health`);
    
    if (response.data.status && response.data.timestamp) {
      logSuccess('Success responses have consistent format');
      passed++;
    } else {
      logError('Success response format is inconsistent');
      failed++;
    }
  } catch (error) {
    logError('Success response test failed: ' + error.message);
    failed++;
  }
  
  // Test 8.2: Error response format
  try {
    const response = await axios.get(`${API_BASE}/rooms`, {
      validateStatus: () => true,
    });
    
    if (response.data.success === false && response.data.error) {
      logSuccess('Error responses have consistent format');
      logInfo(`   Error structure: success, statusCode, timestamp, path, error`);
      passed++;
    } else {
      logError('Error response format is inconsistent');
      failed++;
    }
  } catch (error) {
    logError('Error response test failed: ' + error.message);
    failed++;
  }
  
  logInfo(`   Response format tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 9: Performance
async function test9_performance() {
  logStep(9, 'API Performance');
  
  const tests = [
    { name: 'Health Check', url: `${API_BASE}/health` },
    { name: 'Explore', url: `${API_BASE}/assets/explore?page=1&limit=12` },
  ];
  
  for (const test of tests) {
    try {
      const start = Date.now();
      await axios.get(test.url);
      const duration = Date.now() - start;
      
      if (duration < 1000) {
        logSuccess(`${test.name}: ${duration}ms (fast)`);
      } else if (duration < 3000) {
        logInfo(`${test.name}: ${duration}ms (acceptable)`);
      } else {
        logError(`${test.name}: ${duration}ms (slow)`);
      }
    } catch (error) {
      logError(`${test.name}: Failed - ${error.message}`);
    }
  }
  
  return true;
}

// Test 10: Database Connection
async function test10_databaseConnection() {
  logStep(10, 'Database Connection');
  
  try {
    const response = await axios.get(`${API_BASE}/health`);
    
    if (response.data.services && response.data.services.database === 'connected') {
      logSuccess('Database is connected');
      logInfo('   PostgreSQL connection is healthy');
      return true;
    } else {
      logError('Database connection issue');
      return false;
    }
  } catch (error) {
    logError('Database connection test failed: ' + error.message);
    return false;
  }
}

// Main Test Runner
async function runAllTests() {
  log('\n' + '='.repeat(70), 'cyan');
  log('🎃 HauntedAI Platform - Automated Backend Tests', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');
  
  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
    test5: false,
    test6: false,
    test7: false,
    test8: false,
    test9: false,
    test10: false,
  };
  
  try {
    results.test1 = await test1_healthCheck();
    await sleep(500);
    
    results.test2 = await test2_corsCheck();
    await sleep(500);
    
    results.test3 = await test3_authEndpoints();
    await sleep(500);
    
    results.test4 = await test4_protectedEndpoints();
    await sleep(500);
    
    results.test5 = await test5_publicEndpoints();
    await sleep(500);
    
    results.test6 = await test6_apiDocs();
    await sleep(500);
    
    results.test7 = await test7_errorHandling();
    await sleep(500);
    
    results.test8 = await test8_responseFormat();
    await sleep(500);
    
    results.test9 = await test9_performance();
    await sleep(500);
    
    results.test10 = await test10_databaseConnection();
    
  } catch (error) {
    logError('Test suite failed');
    console.error(error);
  }
  
  // Summary
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 Test Results Summary', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');
  
  const tests = [
    { name: 'Health Check', result: results.test1 },
    { name: 'CORS Configuration', result: results.test2 },
    { name: 'Authentication Endpoints', result: results.test3 },
    { name: 'Protected Endpoints', result: results.test4 },
    { name: 'Public Endpoints', result: results.test5 },
    { name: 'API Documentation', result: results.test6 },
    { name: 'Error Handling', result: results.test7 },
    { name: 'Response Format', result: results.test8 },
    { name: 'Performance', result: results.test9 },
    { name: 'Database Connection', result: results.test10 },
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    if (test.result) {
      log(`✅ ${test.name}`, 'green');
      passed++;
    } else {
      log(`❌ ${test.name}`, 'red');
      failed++;
    }
  });
  
  log('\n' + '='.repeat(70), 'cyan');
  const percentage = Math.round((passed / tests.length) * 100);
  log(`\nScore: ${passed}/${tests.length} (${percentage}%)\n`, passed === tests.length ? 'green' : 'yellow');
  
  if (passed === tests.length) {
    log('🎉 All tests passed! Backend is fully functional!', 'green');
  } else if (percentage >= 80) {
    log('✅ Most tests passed! Backend is working well.', 'green');
  } else if (percentage >= 60) {
    log('⚠️  Some tests failed. Check the errors above.', 'yellow');
  } else {
    log('❌ Many tests failed. Backend needs attention.', 'red');
  }
  
  log('\n📱 Frontend URL: http://localhost:5173', 'cyan');
  log('📚 API Docs: http://localhost:3001/api/docs', 'cyan');
  log('\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  logError('Test runner crashed');
  console.error(error);
  process.exit(1);
});
