/**
 * K6 Load Test for HauntedAI Platform
 * Tests with 50 concurrent users
 * Verifies 95th percentile response time < 5s and error rate < 10%
 * Managed by Kiro
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '3m', target: 25 }, // Ramp up to 25 users
    { duration: '5m', target: 50 }, // Ramp up to 50 users (peak load)
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '3m', target: 25 }, // Ramp down to 25 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95th percentile < 5s
    http_req_failed: ['rate<0.1'],     // Error rate < 10%
    errors: ['rate<0.1'],              // Custom error rate < 10%
  },
};

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:3001';
const WEB_URL = __ENV.WEB_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  {
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    signature: '0x' + 'a'.repeat(130),
    message: 'Sign this message to authenticate with HauntedAI',
  },
  {
    walletAddress: '0x8ba1f109551bD432803012645Hac136c30C6C88',
    signature: '0x' + 'b'.repeat(130),
    message: 'Sign this message to authenticate with HauntedAI',
  },
  {
    walletAddress: '0x9cb2f209661cE543904023756Iac247d40D7D99',
    signature: '0x' + 'c'.repeat(130),
    message: 'Sign this message to authenticate with HauntedAI',
  },
];

const storyPrompts = [
  'A haunted mansion with mysterious shadows',
  'An ancient cemetery at midnight',
  'A ghostly figure in the attic',
  'Whispers from the basement',
  'A cursed mirror in the hallway',
  'Strange noises from the walls',
  'A phantom in the garden',
  'Eerie lights in the forest',
  'A spectral presence in the library',
  'Mysterious footsteps upstairs',
];

// Helper functions
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function getRandomPrompt() {
  return storyPrompts[Math.floor(Math.random() * storyPrompts.length)];
}

function authenticate() {
  const user = getRandomUser();
  
  const response = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    walletAddress: user.walletAddress,
    signature: user.signature,
    message: user.message,
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const success = check(response, {
    'authentication status is 200': (r) => r.status === 200,
    'authentication returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.accessToken !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);

  if (success && response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      return {
        token: body.accessToken,
        userId: body.user.id,
      };
    } catch (e) {
      console.error('Failed to parse auth response:', e);
      return null;
    }
  }

  return null;
}

function testHealthEndpoints() {
  const endpoints = [
    `${BASE_URL}/health`,
    `${BASE_URL}/metrics`,
  ];

  endpoints.forEach(endpoint => {
    const response = http.get(endpoint);
    
    const success = check(response, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} response time < 2s`]: (r) => r.timings.duration < 2000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
  });
}

function testRoomOperations(authData) {
  if (!authData) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authData.token}`,
  };

  // Create room
  const createResponse = http.post(`${BASE_URL}/api/v1/rooms`, JSON.stringify({
    inputText: getRandomPrompt(),
  }), { headers });

  const createSuccess = check(createResponse, {
    'room creation status is 201': (r) => r.status === 201,
    'room creation returns room ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!createSuccess);
  responseTime.add(createResponse.timings.duration);

  if (!createSuccess || createResponse.status !== 201) {
    return;
  }

  let roomId;
  try {
    const body = JSON.parse(createResponse.body);
    roomId = body.id;
  } catch (e) {
    console.error('Failed to parse room creation response:', e);
    return;
  }

  // Get room details
  const getResponse = http.get(`${BASE_URL}/api/v1/rooms/${roomId}`, { headers });
  
  const getSuccess = check(getResponse, {
    'room get status is 200': (r) => r.status === 200,
    'room get returns room data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id === roomId;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!getSuccess);
  responseTime.add(getResponse.timings.duration);

  // List user rooms
  const listResponse = http.get(`${BASE_URL}/api/v1/rooms`, { headers });
  
  const listSuccess = check(listResponse, {
    'room list status is 200': (r) => r.status === 200,
    'room list returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!listSuccess);
  responseTime.add(listResponse.timings.duration);

  return roomId;
}

function testAssetEndpoints() {
  // Test public explore endpoint (no auth required)
  const exploreResponse = http.get(`${BASE_URL}/api/v1/assets/explore?page=1&pageSize=10`);
  
  const exploreSuccess = check(exploreResponse, {
    'explore status is 200': (r) => r.status === 200,
    'explore returns paginated data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data !== undefined && body.pagination !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!exploreSuccess);
  responseTime.add(exploreResponse.timings.duration);
}

function testTokenEndpoints(authData) {
  if (!authData) return;

  const headers = {
    'Authorization': `Bearer ${authData.token}`,
  };

  // Get user balance
  const balanceResponse = http.get(`${BASE_URL}/api/v1/users/${authData.userId}/balance`, { headers });
  
  const balanceSuccess = check(balanceResponse, {
    'balance status is 200': (r) => r.status === 200,
    'balance returns balance data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.balance !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!balanceSuccess);
  responseTime.add(balanceResponse.timings.duration);

  // Get transaction history
  const txResponse = http.get(`${BASE_URL}/api/v1/users/${authData.userId}/transactions`, { headers });
  
  const txSuccess = check(txResponse, {
    'transactions status is 200': (r) => r.status === 200,
    'transactions returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!txSuccess);
  responseTime.add(txResponse.timings.duration);
}

function testFrontendPages() {
  const pages = [
    `${WEB_URL}/`,
    `${WEB_URL}/explore`,
  ];

  pages.forEach(page => {
    const response = http.get(page);
    
    const success = check(response, {
      [`${page} status is 200`]: (r) => r.status === 200,
      [`${page} response time < 3s`]: (r) => r.timings.duration < 3000,
      [`${page} contains HTML`]: (r) => r.body.includes('<html'),
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
  });
}

// Main test function
export default function () {
  // Test health endpoints (lightweight)
  testHealthEndpoints();

  // Test frontend pages
  testFrontendPages();

  // Test public API endpoints
  testAssetEndpoints();

  // Authenticate user (25% of the time to simulate real usage)
  let authData = null;
  if (Math.random() < 0.25) {
    authData = authenticate();
    
    if (authData) {
      // Test authenticated endpoints
      testRoomOperations(authData);
      testTokenEndpoints(authData);
    }
  }

  // Random sleep between 1-5 seconds to simulate user behavior
  sleep(Math.random() * 4 + 1);
}

// Setup function (runs once per VU)
export function setup() {
  console.log('🎃 Starting HauntedAI Load Test');
  console.log(`API URL: ${BASE_URL}`);
  console.log(`Web URL: ${WEB_URL}`);
  console.log('Target: 50 concurrent users');
  console.log('Duration: 20 minutes');
  console.log('Thresholds: 95th percentile < 5s, error rate < 10%');
  
  // Verify services are running
  const healthResponse = http.get(`${BASE_URL}/health`);
  if (healthResponse.status !== 200) {
    throw new Error(`API health check failed: ${healthResponse.status}`);
  }
  
  console.log('✅ Services are healthy, starting load test...');
}

// Teardown function (runs once after all VUs finish)
export function teardown(data) {
  console.log('🎃 HauntedAI Load Test Complete');
}

// Handle summary (custom summary output)
export function handleSummary(data) {
  const summary = {
    'load-test-results.json': JSON.stringify(data, null, 2),
  };

  // Console summary
  console.log('='.repeat(60));
  console.log('🎃 HauntedAI Load Test Results');
  console.log('='.repeat(60));
  
  const metrics = data.metrics;
  
  // HTTP metrics
  if (metrics.http_req_duration) {
    console.log(`Response Time (avg): ${metrics.http_req_duration.values.avg.toFixed(2)}ms`);
    console.log(`Response Time (95th): ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
    console.log(`Response Time (max): ${metrics.http_req_duration.values.max.toFixed(2)}ms`);
  }
  
  if (metrics.http_req_failed) {
    const errorRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    console.log(`Error Rate: ${errorRate}%`);
  }
  
  if (metrics.http_reqs) {
    console.log(`Total Requests: ${metrics.http_reqs.values.count}`);
    console.log(`Request Rate: ${metrics.http_reqs.values.rate.toFixed(2)}/s`);
  }
  
  // VU metrics
  if (metrics.vus) {
    console.log(`Peak VUs: ${metrics.vus.values.max}`);
  }
  
  // Thresholds
  console.log('='.repeat(60));
  console.log('Threshold Results:');
  
  if (data.thresholds) {
    Object.entries(data.thresholds).forEach(([name, threshold]) => {
      const passed = threshold.ok ? '✅' : '❌';
      console.log(`${passed} ${name}: ${threshold.ok ? 'PASSED' : 'FAILED'}`);
    });
  }
  
  console.log('='.repeat(60));
  
  // Overall result
  const allThresholdsPassed = data.thresholds && Object.values(data.thresholds).every(t => t.ok);
  if (allThresholdsPassed) {
    console.log('🎉 Load test PASSED! HauntedAI can handle the target load.');
  } else {
    console.log('❌ Load test FAILED! Performance thresholds not met.');
  }
  
  return summary;
}