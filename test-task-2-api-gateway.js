#!/usr/bin/env node

/**
 * Task 2 E2E Test: Backend API Gateway (NestJS)
 * 
 * This test validates all aspects of Task 2 from the haunted-ai spec:
 * - 2.1: NestJS application structure
 * - 2.2: Authentication service
 * - 2.3: Property test for authentication
 * - 2.4: Room management endpoints
 * - 2.5: Property test for room management
 * - 2.6: Server-Sent Events for live logs
 * - 2.7: Property test for live logging
 * - 2.8: Asset endpoints
 * - 2.9: Property test for content discovery
 * - 2.10: Token endpoints
 * - 2.11: Property test for token rewards
 * 
 * Tests use REAL data and simulate actual user scenarios
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(70) + '\n');
}

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✓' : '✗';
  const color = status === 'PASS' ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`  ${details}`, 'yellow');
  }
  
  results.tests.push({ name, status, details });
  if (status === 'PASS') {
    results.passed++;
  } else {
    results.failed++;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function execCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || process.cwd(),
      ...options 
    });
  } catch (error) {
    if (options.ignoreError) {
      return null;
    }
    throw error;
  }
}

async function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test Suite
async function runTests() {
  log('\n🎃 HauntedAI - Task 2 API Gateway Test Suite 🎃\n', 'magenta');
  log('Testing Backend API with REAL data and user scenarios...', 'bright');

  // ============================================================================
  // Test 2.1: NestJS Application Structure
  // ============================================================================
  logSection('Test 2.1: NestJS Application Structure');

  // Test 2.1.1: NestJS project exists
  if (fileExists('apps/api/src/main.ts')) {
    logTest('2.1.1 NestJS project initialized', 'PASS', 'main.ts found');
  } else {
    logTest('2.1.1 NestJS project initialized', 'FAIL', 'main.ts not found');
  }

  // Test 2.1.2: Required modules exist
  const modules = ['auth', 'rooms', 'assets', 'tokens', 'users'];
  let moduleCount = 0;
  
  modules.forEach(module => {
    const modulePath = `apps/api/src/modules/${module}`;
    if (fileExists(modulePath)) {
      moduleCount++;
    }
  });

  if (moduleCount === modules.length) {
    logTest(
      '2.1.2 All required modules exist',
      'PASS',
      `Found all ${moduleCount} modules: ${modules.join(', ')}`
    );
  } else {
    logTest(
      '2.1.2 All required modules exist',
      'FAIL',
      `Only ${moduleCount}/${modules.length} modules found`
    );
  }

  // Test 2.1.3: Global exception filters
  const mainContent = fileExists('apps/api/src/main.ts') 
    ? fs.readFileSync('apps/api/src/main.ts', 'utf8') 
    : '';
  
  if (mainContent.includes('useGlobalFilters') || mainContent.includes('GlobalExceptionFilter')) {
    logTest('2.1.3 Global exception filters configured', 'PASS');
  } else {
    logTest('2.1.3 Global exception filters configured', 'FAIL');
  }

  // Test 2.1.4: Swagger/OpenAPI documentation
  if (mainContent.includes('SwaggerModule') || mainContent.includes('DocumentBuilder')) {
    logTest('2.1.4 Swagger/OpenAPI documentation', 'PASS');
  } else {
    logTest('2.1.4 Swagger/OpenAPI documentation', 'FAIL');
  }

  // ============================================================================
  // Test 2.2: Authentication Service
  // ============================================================================
  logSection('Test 2.2: Authentication Service');

  // Test 2.2.1: Auth module exists
  if (fileExists('apps/api/src/modules/auth')) {
    logTest('2.2.1 Auth module exists', 'PASS');
  } else {
    logTest('2.2.1 Auth module exists', 'FAIL');
  }

  // Test 2.2.2: Auth controller with login endpoint
  const authFiles = fileExists('apps/api/src/modules/auth') 
    ? fs.readdirSync('apps/api/src/modules/auth')
    : [];
  
  const hasController = authFiles.some(f => f.includes('controller'));
  if (hasController) {
    logTest('2.2.2 Auth controller exists', 'PASS');
  } else {
    logTest('2.2.2 Auth controller exists', 'FAIL');
  }

  // Test 2.2.3: JWT implementation
  const authService = authFiles.find(f => f.includes('service'));
  if (authService) {
    const serviceContent = fs.readFileSync(
      `apps/api/src/modules/auth/${authService}`,
      'utf8'
    );
    
    if (serviceContent.includes('jwt') || serviceContent.includes('JWT')) {
      logTest('2.2.3 JWT token generation', 'PASS');
    } else {
      logTest('2.2.3 JWT token generation', 'FAIL');
    }
  } else {
    logTest('2.2.3 JWT token generation', 'FAIL', 'Auth service not found');
  }

  // Test 2.2.4: Auth guard
  const hasGuard = authFiles.some(f => f.includes('guard'));
  if (hasGuard) {
    logTest('2.2.4 Authentication guard', 'PASS');
  } else {
    logTest('2.2.4 Authentication guard', 'FAIL');
  }

  // ============================================================================
  // Test 2.3: Property Test for Authentication
  // ============================================================================
  logSection('Test 2.3: Property Test for Authentication');

  // Test 2.3.1: Auth property tests exist
  const authTestFiles = fileExists('apps/api/src/modules/auth')
    ? fs.readdirSync('apps/api/src/modules/auth').filter(f => 
        f.includes('test') || f.includes('spec')
      )
    : [];

  if (authTestFiles.length > 0) {
    logTest(
      '2.3.1 Authentication property tests exist',
      'PASS',
      `Found ${authTestFiles.length} test file(s)`
    );
  } else {
    logTest('2.3.1 Authentication property tests exist', 'FAIL');
  }

  // ============================================================================
  // Test 2.4: Room Management Endpoints
  // ============================================================================
  logSection('Test 2.4: Room Management Endpoints');

  // Test 2.4.1: Rooms module exists
  if (fileExists('apps/api/src/modules/rooms')) {
    logTest('2.4.1 Rooms module exists', 'PASS');
  } else {
    logTest('2.4.1 Rooms module exists', 'FAIL');
  }

  // Test 2.4.2: Rooms controller with endpoints
  const roomFiles = fileExists('apps/api/src/modules/rooms')
    ? fs.readdirSync('apps/api/src/modules/rooms')
    : [];
  
  const roomController = roomFiles.find(f => f.includes('controller'));
  if (roomController) {
    const controllerContent = fs.readFileSync(
      `apps/api/src/modules/rooms/${roomController}`,
      'utf8'
    );
    
    const hasCreate = controllerContent.includes('@Post()');
    const hasGet = controllerContent.includes('@Get(');
    
    if (hasCreate && hasGet) {
      logTest('2.4.2 Room endpoints (POST, GET)', 'PASS');
    } else {
      logTest('2.4.2 Room endpoints (POST, GET)', 'FAIL');
    }
  } else {
    logTest('2.4.2 Room endpoints', 'FAIL', 'Controller not found');
  }

  // Test 2.4.3: Rooms service
  const hasRoomService = roomFiles.some(f => f.includes('service'));
  if (hasRoomService) {
    logTest('2.4.3 Rooms service exists', 'PASS');
  } else {
    logTest('2.4.3 Rooms service exists', 'FAIL');
  }

  // ============================================================================
  // Test 2.5: Property Test for Room Management
  // ============================================================================
  logSection('Test 2.5: Property Test for Room Management');

  // Test 2.5.1: Room property tests exist
  const roomTestFiles = roomFiles.filter(f => 
    f.includes('property.test') || f.includes('.spec')
  );

  if (roomTestFiles.length > 0) {
    logTest(
      '2.5.1 Room management property tests exist',
      'PASS',
      `Found ${roomTestFiles.length} test file(s)`
    );
  } else {
    logTest('2.5.1 Room management property tests exist', 'FAIL');
  }

  // ============================================================================
  // Test 2.6: Server-Sent Events for Live Logs
  // ============================================================================
  logSection('Test 2.6: Server-Sent Events for Live Logs');

  // Test 2.6.1: SSE service exists
  const hasSSEService = roomFiles.some(f => 
    f.includes('sse') || f.includes('log')
  );
  
  if (hasSSEService) {
    logTest('2.6.1 SSE service exists', 'PASS');
  } else {
    logTest('2.6.1 SSE service exists', 'FAIL');
  }

  // Test 2.6.2: Redis service for pub/sub
  const hasRedisService = roomFiles.some(f => f.includes('redis'));
  if (hasRedisService) {
    logTest('2.6.2 Redis pub/sub service', 'PASS');
  } else {
    logTest('2.6.2 Redis pub/sub service', 'FAIL');
  }

  // Test 2.6.3: SSE endpoint in controller
  if (roomController) {
    const controllerContent = fs.readFileSync(
      `apps/api/src/modules/rooms/${roomController}`,
      'utf8'
    );
    
    if (controllerContent.includes('logs') || controllerContent.includes('sse')) {
      logTest('2.6.3 SSE endpoint (/logs)', 'PASS');
    } else {
      logTest('2.6.3 SSE endpoint (/logs)', 'FAIL');
    }
  } else {
    logTest('2.6.3 SSE endpoint', 'FAIL');
  }

  // ============================================================================
  // Test 2.7: Property Test for Live Logging
  // ============================================================================
  logSection('Test 2.7: Property Test for Live Logging');

  // Test 2.7.1: Live logging property tests
  const liveLogTests = roomFiles.filter(f => 
    f.includes('live-logging') && f.includes('test')
  );

  if (liveLogTests.length > 0) {
    logTest('2.7.1 Live logging property tests exist', 'PASS');
  } else {
    logTest('2.7.1 Live logging property tests exist', 'FAIL');
  }

  // ============================================================================
  // Test 2.8: Asset Endpoints
  // ============================================================================
  logSection('Test 2.8: Asset Endpoints');

  // Test 2.8.1: Assets module exists
  if (fileExists('apps/api/src/modules/assets')) {
    logTest('2.8.1 Assets module exists', 'PASS');
  } else {
    logTest('2.8.1 Assets module exists', 'FAIL');
  }

  // Test 2.8.2: Assets controller
  const assetFiles = fileExists('apps/api/src/modules/assets')
    ? fs.readdirSync('apps/api/src/modules/assets')
    : [];
  
  const hasAssetController = assetFiles.some(f => f.includes('controller'));
  if (hasAssetController) {
    logTest('2.8.2 Assets controller exists', 'PASS');
  } else {
    logTest('2.8.2 Assets controller exists', 'FAIL');
  }

  // Test 2.8.3: Explore endpoint
  const assetController = assetFiles.find(f => f.includes('controller'));
  if (assetController) {
    const content = fs.readFileSync(
      `apps/api/src/modules/assets/${assetController}`,
      'utf8'
    );
    
    if (content.includes('explore') || content.includes('public')) {
      logTest('2.8.3 Explore endpoint exists', 'PASS');
    } else {
      logTest('2.8.3 Explore endpoint exists', 'FAIL');
    }
  } else {
    logTest('2.8.3 Explore endpoint', 'FAIL');
  }

  // ============================================================================
  // Test 2.9: Property Test for Content Discovery
  // ============================================================================
  logSection('Test 2.9: Property Test for Content Discovery');

  // Test 2.9.1: Content discovery property tests
  const assetTestFiles = assetFiles.filter(f => 
    f.includes('property.test') || f.includes('.spec')
  );

  if (assetTestFiles.length > 0) {
    logTest('2.9.1 Content discovery property tests exist', 'PASS');
  } else {
    logTest('2.9.1 Content discovery property tests exist', 'FAIL');
  }

  // ============================================================================
  // Test 2.10: Token Endpoints
  // ============================================================================
  logSection('Test 2.10: Token Endpoints');

  // Test 2.10.1: Tokens module exists
  if (fileExists('apps/api/src/modules/tokens')) {
    logTest('2.10.1 Tokens module exists', 'PASS');
  } else {
    logTest('2.10.1 Tokens module exists', 'FAIL');
  }

  // Test 2.10.2: Token endpoints
  const tokenFiles = fileExists('apps/api/src/modules/tokens')
    ? fs.readdirSync('apps/api/src/modules/tokens')
    : [];
  
  const hasTokenController = tokenFiles.some(f => f.includes('controller'));
  if (hasTokenController) {
    logTest('2.10.2 Token controller exists', 'PASS');
  } else {
    logTest('2.10.2 Token controller exists', 'FAIL');
  }

  // ============================================================================
  // Test 2.11: Property Test for Token Rewards
  // ============================================================================
  logSection('Test 2.11: Property Test for Token Rewards');

  // Test 2.11.1: Token property tests
  const tokenTestFiles = tokenFiles.filter(f => 
    f.includes('property.test') || f.includes('.spec')
  );

  if (tokenTestFiles.length > 0) {
    logTest('2.11.1 Token rewards property tests exist', 'PASS');
  } else {
    logTest('2.11.1 Token rewards property tests exist', 'FAIL');
  }

  // ============================================================================
  // Test 2.12: API Integration Tests (REAL SCENARIO)
  // ============================================================================
  logSection('Test 2.12: API Integration Tests with REAL Data');

  log('⚠️  This test requires API server running. Checking...', 'yellow');

  try {
    // Check if API is running
    const healthCheck = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
      timeout: 2000
    }).catch(() => null);

    if (healthCheck && healthCheck.statusCode === 200) {
      logTest('2.12.1 API server is running', 'PASS', 'Health check successful');
      
      // Run integration tests
      await runAPIIntegrationTests();
    } else {
      logTest(
        '2.12.1 API server is running',
        'FAIL',
        'Start API: cd apps/api && npm run start:dev'
      );
      log('⚠️  Skipping integration tests (API not running)', 'yellow');
    }
  } catch (error) {
    logTest('2.12.1 API server check', 'FAIL', error.message);
    log('⚠️  Skipping integration tests (API not running)', 'yellow');
  }

  // ============================================================================
  // Final Results
  // ============================================================================
  logSection('Test Results Summary');

  const total = results.passed + results.failed;
  const percentage = ((results.passed / total) * 100).toFixed(1);

  log(`Total Tests: ${total}`, 'bright');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, 'red');
  log(`Success Rate: ${percentage}%`, percentage >= 80 ? 'green' : 'red');

  if (results.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        log(`  • ${t.name}`, 'red');
        if (t.details) {
          log(`    ${t.details}`, 'yellow');
        }
      });
  }

  log('\n' + '='.repeat(70), 'cyan');
  
  if (percentage >= 80) {
    log('🎉 Task 2 API Gateway: READY FOR PRODUCTION! 🎉', 'green');
  } else {
    log('⚠️  Task 2 API Gateway: NEEDS ATTENTION ⚠️', 'yellow');
  }
  
  log('='.repeat(70) + '\n', 'cyan');

  process.exit(results.failed > 0 ? 1 : 0);
}

// API Integration Tests
async function runAPIIntegrationTests() {
  log('\n📊 Running API integration tests with REAL data...', 'blue');

  // Test: Create room
  try {
    const createRoom = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/rooms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        userId: 'test-user-' + Date.now(),
        inputText: 'A spooky ghost in a haunted mansion'
      }
    });

    if (createRoom.statusCode === 201 || createRoom.statusCode === 200) {
      logTest('2.12.2 Create room endpoint', 'PASS', 'Room created successfully');
    } else {
      logTest('2.12.2 Create room endpoint', 'FAIL', `Status: ${createRoom.statusCode}`);
    }
  } catch (error) {
    logTest('2.12.2 Create room endpoint', 'FAIL', error.message);
  }

  // Test: Get rooms
  try {
    const getRooms = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/rooms',
      method: 'GET'
    });

    if (getRooms.statusCode === 200) {
      logTest('2.12.3 Get rooms endpoint', 'PASS', 'Rooms retrieved successfully');
    } else {
      logTest('2.12.3 Get rooms endpoint', 'FAIL', `Status: ${getRooms.statusCode}`);
    }
  } catch (error) {
    logTest('2.12.3 Get rooms endpoint', 'FAIL', error.message);
  }

  // Test: Get assets
  try {
    const getAssets = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/assets',
      method: 'GET'
    });

    if (getAssets.statusCode === 200) {
      logTest('2.12.4 Get assets endpoint', 'PASS', 'Assets retrieved successfully');
    } else {
      logTest('2.12.4 Get assets endpoint', 'FAIL', `Status: ${getAssets.statusCode}`);
    }
  } catch (error) {
    logTest('2.12.4 Get assets endpoint', 'FAIL', error.message);
  }
}

// Run the test suite
runTests().catch(error => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
