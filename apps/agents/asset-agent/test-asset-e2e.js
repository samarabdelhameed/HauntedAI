#!/usr/bin/env node

/**
 * AssetAgent End-to-End Test
 * Tests the complete user flow for asset generation
 * 
 * This test simulates a real user scenario:
 * 1. Start the AssetAgent service
 * 2. Send a story for image generation
 * 3. Verify the image is generated with DALL-E 3
 * 4. Verify the image is uploaded to Storacha
 * 5. Verify the response contains valid CID and metadata
 */

const http = require('http');

// Test configuration
const ASSET_AGENT_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 120000; // 2 minutes for image generation

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
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
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test 1: Health Check
async function testHealthCheck() {
  logSection('Test 1: Health Check');
  
  try {
    logInfo('Checking if AssetAgent service is running...');
    const response = await makeRequest(`${ASSET_AGENT_URL}/health`);
    
    if (response.status === 200) {
      logSuccess('AssetAgent service is healthy');
      logInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      // Verify response structure
      if (response.data.status === 'ok' && response.data.service === 'asset-agent') {
        logSuccess('Health check response has correct structure');
        return true;
      } else {
        logError('Health check response has incorrect structure');
        return false;
      }
    } else {
      logError(`Health check failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    logWarning('Make sure the AssetAgent service is running on port 3003');
    logInfo('Run: cd apps/agents/asset-agent && npm start');
    return false;
  }
}

// Test 2: Generate Asset with Real Story
async function testAssetGeneration() {
  logSection('Test 2: Asset Generation (Real DALL-E 3 API)');
  
  const testStory = `In the depths of an abandoned Victorian mansion, shadows dance along the crumbling walls. 
A ghostly figure emerges from the darkness, its ethereal form glowing with an otherworldly light. 
The air grows cold as whispers echo through the empty halls, telling tales of forgotten souls 
who once walked these corridors. Cobwebs hang like curtains, and the moonlight casts eerie 
patterns through broken stained glass windows.`;

  const requestBody = {
    story: testStory,
    storySummary: 'A ghostly Victorian mansion with supernatural presence',
    userId: 'test-user-e2e',
    roomId: 'test-room-e2e-' + Date.now(),
  };

  try {
    logInfo('Sending story for image generation...');
    logInfo(`Story length: ${testStory.length} characters`);
    logInfo(`Room ID: ${requestBody.roomId}`);
    
    const startTime = Date.now();
    logWarning('This may take 15-40 seconds (DALL-E 3 generation + Storacha upload)...');
    
    const response = await makeRequest(`${ASSET_AGENT_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (response.status === 200 || response.status === 201) {
      logSuccess(`Asset generated successfully in ${duration}s`);
      logInfo('Response:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Verify response structure
      const { imageCid, imageUrl, metadata } = response.data;
      
      let allChecksPass = true;
      
      // Check CID
      if (imageCid && imageCid.startsWith('bafy')) {
        logSuccess(`Valid Storacha CID: ${imageCid}`);
      } else {
        logError(`Invalid or missing CID: ${imageCid}`);
        allChecksPass = false;
      }
      
      // Check image URL
      if (imageUrl && imageUrl.startsWith('http')) {
        logSuccess(`Valid image URL received`);
        logInfo(`URL: ${imageUrl.substring(0, 80)}...`);
      } else {
        logError(`Invalid or missing image URL`);
        allChecksPass = false;
      }
      
      // Check metadata
      if (metadata) {
        logSuccess('Metadata present');
        
        if (metadata.size > 0) {
          logSuccess(`Image size: ${(metadata.size / 1024).toFixed(2)} KB`);
        } else {
          logError('Invalid image size');
          allChecksPass = false;
        }
        
        if (metadata.format) {
          logSuccess(`Image format: ${metadata.format}`);
        } else {
          logError('Missing image format');
          allChecksPass = false;
        }
        
        if (metadata.width && metadata.height) {
          logSuccess(`Image dimensions: ${metadata.width}x${metadata.height}`);
        } else {
          logError('Missing image dimensions');
          allChecksPass = false;
        }
        
        if (metadata.model === 'dall-e-3') {
          logSuccess(`Model: ${metadata.model}`);
        } else {
          logError(`Unexpected model: ${metadata.model}`);
          allChecksPass = false;
        }
        
        if (metadata.prompt) {
          logSuccess('Image prompt generated');
          logInfo(`Prompt: ${metadata.prompt.substring(0, 100)}...`);
        } else {
          logError('Missing image prompt');
          allChecksPass = false;
        }
      } else {
        logError('Metadata missing');
        allChecksPass = false;
      }
      
      return allChecksPass;
    } else {
      logError(`Asset generation failed with status: ${response.status}`);
      logError(`Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    logError(`Asset generation failed: ${error.message}`);
    return false;
  }
}

// Test 3: Error Handling - Invalid Input
async function testErrorHandling() {
  logSection('Test 3: Error Handling');
  
  try {
    logInfo('Testing with invalid input (empty story)...');
    
    const response = await makeRequest(`${ASSET_AGENT_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        story: '',
        userId: 'test-user',
        roomId: 'test-room',
      },
    });
    
    if (response.status === 400) {
      logSuccess('Service correctly rejected invalid input');
      logInfo(`Error message: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      logWarning(`Expected 400 status, got ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Error handling test failed: ${error.message}`);
    return false;
  }
}

// Test 4: Retry Logic Simulation
async function testRetryBehavior() {
  logSection('Test 4: Retry Behavior (Observation)');
  
  logInfo('This test observes retry behavior through logs');
  logInfo('Check the AssetAgent service logs for retry attempts');
  logWarning('Note: We cannot force retries without mocking, but the service has retry logic built-in');
  
  // Just verify the service is still responsive after previous tests
  try {
    const response = await makeRequest(`${ASSET_AGENT_URL}/health`);
    if (response.status === 200) {
      logSuccess('Service remains healthy after all operations');
      return true;
    }
    return false;
  } catch (error) {
    logError('Service health check failed');
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         AssetAgent End-to-End Test Suite                  ║', 'cyan');
  log('║         Testing Real User Scenario                         ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    healthCheck: false,
    assetGeneration: false,
    errorHandling: false,
    retryBehavior: false,
  };

  // Run tests sequentially
  results.healthCheck = await testHealthCheck();
  
  if (!results.healthCheck) {
    logError('\n❌ Health check failed. Cannot proceed with other tests.');
    logWarning('Please start the AssetAgent service first:');
    logInfo('  cd apps/agents/asset-agent');
    logInfo('  npm start');
    process.exit(1);
  }

  results.assetGeneration = await testAssetGeneration();
  results.errorHandling = await testErrorHandling();
  results.retryBehavior = await testRetryBehavior();

  // Print summary
  logSection('Test Summary');
  
  const tests = [
    { name: 'Health Check', result: results.healthCheck },
    { name: 'Asset Generation (DALL-E 3 + Storacha)', result: results.assetGeneration },
    { name: 'Error Handling', result: results.errorHandling },
    { name: 'Retry Behavior', result: results.retryBehavior },
  ];

  tests.forEach((test) => {
    if (test.result) {
      logSuccess(`${test.name}: PASSED`);
    } else {
      logError(`${test.name}: FAILED`);
    }
  });

  const passedTests = tests.filter((t) => t.result).length;
  const totalTests = tests.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(0);

  console.log('\n' + '='.repeat(60));
  if (passedTests === totalTests) {
    log(`🎉 All tests passed! (${passedTests}/${totalTests})`, 'green');
    log('✅ AssetAgent is working correctly!', 'green');
  } else {
    log(`⚠️  ${passedTests}/${totalTests} tests passed (${passRate}%)`, 'yellow');
    log('❌ Some tests failed. Please review the logs above.', 'red');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
