#!/usr/bin/env node

/**
 * End-to-End Test for DeployAgent
 * Tests the complete deployment flow with mocked Vercel API
 */

const axios = require('axios');

const DEPLOY_AGENT_URL = process.env.DEPLOY_AGENT_URL || 'http://localhost:3005';

async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  try {
    const response = await axios.get(`${DEPLOY_AGENT_URL}/health`);
    console.log('✓ Health check passed');
    console.log('  Status:', response.data.status);
    console.log('  Vercel configured:', response.data.vercelConfigured);
    return true;
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
    return false;
  }
}

async function testDeployment() {
  console.log('\n=== Testing Deployment ===');
  try {
    const testPayload = {
      codeCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      roomId: 'test-room-' + Date.now(),
      projectName: 'haunted-test',
    };

    console.log('Sending deployment request...');
    console.log('  CID:', testPayload.codeCid);
    console.log('  Room ID:', testPayload.roomId);

    const response = await axios.post(`${DEPLOY_AGENT_URL}/deploy`, testPayload, {
      timeout: 120000, // 2 minute timeout
    });

    if (response.data.success) {
      console.log('✓ Deployment succeeded');
      console.log('  Deployment URL:', response.data.deploymentUrl);
      console.log('  Deployment ID:', response.data.deploymentId);
      return true;
    } else {
      console.error('✗ Deployment failed:', response.data.error);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.error('✗ Deployment failed:', error.response.data);
    } else {
      console.error('✗ Deployment failed:', error.message);
    }
    return false;
  }
}

async function testInvalidCID() {
  console.log('\n=== Testing Invalid CID Handling ===');
  try {
    const testPayload = {
      codeCid: 'invalid-cid-format',
      roomId: 'test-room-' + Date.now(),
    };

    console.log('Sending deployment request with invalid CID...');

    const response = await axios.post(`${DEPLOY_AGENT_URL}/deploy`, testPayload);

    if (!response.data.success && response.data.error) {
      console.log('✓ Invalid CID correctly rejected');
      console.log('  Error:', response.data.error);
      return true;
    } else {
      console.error('✗ Invalid CID was not rejected');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 500) {
      console.log('✓ Invalid CID correctly rejected with error');
      return true;
    }
    console.error('✗ Unexpected error:', error.message);
    return false;
  }
}

async function testMissingFields() {
  console.log('\n=== Testing Missing Required Fields ===');
  try {
    const testPayload = {
      // Missing codeCid and roomId
    };

    console.log('Sending deployment request with missing fields...');

    const response = await axios.post(`${DEPLOY_AGENT_URL}/deploy`, testPayload);

    if (response.status === 400 || (!response.data.success && response.data.error)) {
      console.log('✓ Missing fields correctly rejected');
      console.log('  Error:', response.data.error);
      return true;
    } else {
      console.error('✗ Missing fields were not rejected');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ Missing fields correctly rejected');
      return true;
    }
    console.error('✗ Unexpected error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('DeployAgent End-to-End Tests');
  console.log('='.repeat(60));
  console.log('Target URL:', DEPLOY_AGENT_URL);

  const results = {
    healthCheck: false,
    deployment: false,
    invalidCID: false,
    missingFields: false,
  };

  // Run tests
  results.healthCheck = await testHealthCheck();
  results.deployment = await testDeployment();
  results.invalidCID = await testInvalidCID();
  results.missingFields = await testMissingFields();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));

  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✓' : '✗'} ${test}`);
  });

  console.log('\n' + `${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
