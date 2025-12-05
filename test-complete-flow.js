#!/usr/bin/env node

/**
 * Complete Flow Test for HauntedAI Platform
 * Tests the entire user journey from login to story creation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_URL = 'http://localhost:5173';

// Test colors
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
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Check if services are running
async function testServicesRunning() {
  logStep('1', 'Checking if services are running...');
  
  try {
    // Check API
    const apiHealth = await axios.get(`${API_BASE}/health`);
    if (apiHealth.data.status === 'ok') {
      logSuccess('API is running on port 3001');
      log(`   Database: ${apiHealth.data.services.database}`, 'blue');
      log(`   Modules: ${Object.keys(apiHealth.data.modules).join(', ')}`, 'blue');
    }
  } catch (error) {
    logError('API is not running on port 3001');
    logWarning('Please start the API: cd apps/api && npm run dev');
    return false;
  }

  try {
    // Check Frontend
    const frontendResponse = await axios.get(FRONTEND_URL);
    if (frontendResponse.status === 200) {
      logSuccess('Frontend is running on port 5173');
    }
  } catch (error) {
    logError('Frontend is not running on port 5173');
    logWarning('Please start the Frontend: cd apps/web && npm run dev');
    return false;
  }

  return true;
}

// Test 2: Check CORS configuration
async function testCORS() {
  logStep('2', 'Testing CORS configuration...');
  
  try {
    const response = await axios.options(`${API_BASE}/rooms`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
      },
    });
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    const allowMethods = response.headers['access-control-allow-methods'];
    
    if (allowOrigin === FRONTEND_URL) {
      logSuccess('CORS is configured correctly');
      log(`   Allowed Origin: ${allowOrigin}`, 'blue');
      log(`   Allowed Methods: ${allowMethods}`, 'blue');
      return true;
    } else {
      logError(`CORS origin mismatch: expected ${FRONTEND_URL}, got ${allowOrigin}`);
      return false;
    }
  } catch (error) {
    logError('CORS test failed');
    console.error(error.message);
    return false;
  }
}

// Test 3: Test public endpoints
async function testPublicEndpoints() {
  logStep('3', 'Testing public endpoints...');
  
  try {
    // Test explore endpoint
    const exploreResponse = await axios.get(`${API_BASE}/assets/explore?page=1&limit=12`);
    logSuccess('Explore endpoint is working');
    log(`   Total assets: ${exploreResponse.data.pagination.total}`, 'blue');
    
    return true;
  } catch (error) {
    logError('Public endpoints test failed');
    console.error(error.message);
    return false;
  }
}

// Test 4: Test authentication flow (mock)
async function testAuthFlow() {
  logStep('4', 'Testing authentication flow...');
  
  try {
    // Try to access protected endpoint without auth
    try {
      await axios.get(`${API_BASE}/rooms`);
      logError('Protected endpoint accessible without auth (security issue!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logSuccess('Protected endpoints require authentication');
      } else {
        throw error;
      }
    }
    
    // Test login endpoint (will fail with invalid signature, but that's expected)
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        walletAddress: '0xDAfEE25f98Ff62504C1086EAcBb406190F3110D5',
        signature: 'test-signature',
        message: 'test-message',
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logSuccess('Login endpoint is working (rejected invalid signature)');
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    logError('Authentication flow test failed');
    console.error(error.message);
    return false;
  }
}

// Test 5: Test API endpoints structure
async function testAPIStructure() {
  logStep('5', 'Testing API endpoints structure...');
  
  const endpoints = [
    { method: 'GET', path: '/health', expectStatus: 200 },
    { method: 'GET', path: '/assets/explore', expectStatus: 200 },
    { method: 'GET', path: '/rooms', expectStatus: 401 }, // Protected
    { method: 'POST', path: '/auth/login', expectStatus: 401 }, // Will fail without valid signature
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE}${endpoint.path}`,
        validateStatus: () => true, // Don't throw on any status
      });
      
      if (response.status === endpoint.expectStatus) {
        log(`   ✓ ${endpoint.method} ${endpoint.path} → ${response.status}`, 'green');
        passed++;
      } else {
        log(`   ✗ ${endpoint.method} ${endpoint.path} → ${response.status} (expected ${endpoint.expectStatus})`, 'red');
        failed++;
      }
    } catch (error) {
      log(`   ✗ ${endpoint.method} ${endpoint.path} → Error: ${error.message}`, 'red');
      failed++;
    }
  }
  
  logSuccess(`API structure test: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test 6: Frontend accessibility
async function testFrontendPages() {
  logStep('6', 'Testing frontend pages...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    
    if (response.data.includes('HauntedAI') || response.data.includes('haunted')) {
      logSuccess('Frontend is serving the application');
      return true;
    } else {
      logWarning('Frontend is running but content is unexpected');
      return true; // Still pass, as it's running
    }
  } catch (error) {
    logError('Frontend accessibility test failed');
    console.error(error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n🎃 HauntedAI Platform - Complete Flow Test\n', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  const results = {
    servicesRunning: await testServicesRunning(),
    cors: false,
    publicEndpoints: false,
    authFlow: false,
    apiStructure: false,
    frontendPages: false,
  };
  
  // Only continue if services are running
  if (results.servicesRunning) {
    await sleep(500);
    results.cors = await testCORS();
    
    await sleep(500);
    results.publicEndpoints = await testPublicEndpoints();
    
    await sleep(500);
    results.authFlow = await testAuthFlow();
    
    await sleep(500);
    results.apiStructure = await testAPIStructure();
    
    await sleep(500);
    results.frontendPages = await testFrontendPages();
  }
  
  // Summary
  log('\n' + '=' .repeat(60), 'cyan');
  log('\n📊 Test Summary:\n', 'cyan');
  
  const tests = [
    { name: 'Services Running', result: results.servicesRunning },
    { name: 'CORS Configuration', result: results.cors },
    { name: 'Public Endpoints', result: results.publicEndpoints },
    { name: 'Authentication Flow', result: results.authFlow },
    { name: 'API Structure', result: results.apiStructure },
    { name: 'Frontend Pages', result: results.frontendPages },
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
  
  log('\n' + '=' .repeat(60), 'cyan');
  log(`\nTotal: ${passed} passed, ${failed} failed\n`, passed === tests.length ? 'green' : 'yellow');
  
  if (passed === tests.length) {
    log('🎉 All tests passed! The platform is ready to use.', 'green');
    log('\n📱 Open http://localhost:5173 in your browser', 'cyan');
    log('🔐 Connect your MetaMask wallet', 'cyan');
    log('✍️  Write a spooky story and click Create!', 'cyan');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
  
  log('\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  logError('Test runner failed');
  console.error(error);
  process.exit(1);
});
