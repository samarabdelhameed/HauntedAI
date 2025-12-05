#!/usr/bin/env node

/**
 * End-to-End Integration Test for HauntedAI Platform
 * Tests complete workflow: input → story → image → code → deploy
 * Managed by Kiro
 */

const axios = require('axios');
const WebSocket = require('ws');
const { EventSource } = require('eventsource');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const WS_URL = process.env.WS_URL || 'ws://localhost:3001';
const TEST_TIMEOUT = 300000; // 5 minutes

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}[E2E-TEST] ${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test data
const testUser = {
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
  signature: '0x' + 'a'.repeat(130), // Mock signature
  message: 'Sign this message to authenticate with HauntedAI',
};

const testInput = {
  inputText: 'A haunted mansion with mysterious shadows and ancient secrets',
};

class E2ETestRunner {
  constructor() {
    this.authToken = null;
    this.userId = null;
    this.roomId = null;
    this.testResults = {
      authentication: false,
      roomCreation: false,
      workflowExecution: false,
      storyGeneration: false,
      assetGeneration: false,
      codeGeneration: false,
      deployment: false,
      tokenRewards: false,
      badgeCheck: false,
      contentDiscovery: false,
    };
  }

  async runAllTests() {
    log('🎃 Starting HauntedAI End-to-End Integration Tests', 'magenta');
    log('='.repeat(60), 'cyan');

    try {
      // Test sequence
      await this.testHealthChecks();
      await this.testAuthentication();
      await this.testRoomCreation();
      await this.testWorkflowExecution();
      await this.testTokenRewards();
      await this.testBadgeSystem();
      await this.testContentDiscovery();
      await this.testCIDValidation();

      // Generate report
      this.generateReport();

    } catch (err) {
      error(`Test suite failed: ${err.message}`);
      process.exit(1);
    }
  }

  async testHealthChecks() {
    info('Testing service health checks...');

    const services = [
      { name: 'API Gateway', url: `${API_BASE_URL}/health` },
      { name: 'Metrics', url: `${API_BASE_URL}/metrics` },
    ];

    for (const service of services) {
      try {
        const response = await axios.get(service.url, { timeout: 10000 });
        if (response.status === 200) {
          success(`${service.name} is healthy`);
        } else {
          warning(`${service.name} returned status ${response.status}`);
        }
      } catch (err) {
        error(`${service.name} health check failed: ${err.message}`);
        throw new Error(`Service ${service.name} is not available`);
      }
    }
  }

  async testAuthentication() {
    info('Testing Web3 authentication...');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        walletAddress: testUser.walletAddress,
        signature: testUser.signature,
        message: testUser.message,
      });

      if (response.status === 200 && response.data.accessToken) {
        this.authToken = response.data.accessToken;
        this.userId = response.data.user.id;
        this.testResults.authentication = true;
        success('Authentication successful');
        info(`User ID: ${this.userId}`);
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (err) {
      error(`Authentication failed: ${err.message}`);
      throw err;
    }
  }

  async testRoomCreation() {
    info('Testing room creation...');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/rooms`,
        testInput,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (response.status === 201 && response.data.id) {
        this.roomId = response.data.id;
        this.testResults.roomCreation = true;
        success('Room created successfully');
        info(`Room ID: ${this.roomId}`);
      } else {
        throw new Error('Invalid room creation response');
      }
    } catch (err) {
      error(`Room creation failed: ${err.message}`);
      throw err;
    }
  }

  async testWorkflowExecution() {
    info('Testing agent workflow execution...');

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Workflow execution timeout'));
      }, TEST_TIMEOUT);

      try {
        // Start workflow
        const startResponse = await axios.post(
          `${API_BASE_URL}/api/v1/rooms/${this.roomId}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.authToken}`,
            },
          }
        );

        if (startResponse.status !== 200) {
          throw new Error('Failed to start workflow');
        }

        success('Workflow started');

        // Monitor progress via SSE
        const eventSource = new EventSource(
          `${API_BASE_URL}/api/v1/rooms/${this.roomId}/logs`,
          {
            headers: {
              Authorization: `Bearer ${this.authToken}`,
            },
          }
        );

        const agentProgress = {
          story: false,
          asset: false,
          code: false,
          deploy: false,
        };

        eventSource.onmessage = (event) => {
          try {
            const logData = JSON.parse(event.data);
            info(`Agent Log: ${logData.agentType} - ${logData.message}`);

            // Track agent completion
            if (logData.level === 'success') {
              if (logData.agentType === 'story' && logData.message.includes('completed')) {
                agentProgress.story = true;
                this.testResults.storyGeneration = true;
                success('Story generation completed');
              } else if (logData.agentType === 'asset' && logData.message.includes('completed')) {
                agentProgress.asset = true;
                this.testResults.assetGeneration = true;
                success('Asset generation completed');
              } else if (logData.agentType === 'code' && logData.message.includes('completed')) {
                agentProgress.code = true;
                this.testResults.codeGeneration = true;
                success('Code generation completed');
              } else if (logData.agentType === 'deploy' && logData.message.includes('completed')) {
                agentProgress.deploy = true;
                this.testResults.deployment = true;
                success('Deployment completed');
              }
            }

            // Check if all agents completed
            if (Object.values(agentProgress).every(Boolean)) {
              this.testResults.workflowExecution = true;
              success('Complete workflow execution successful');
              eventSource.close();
              clearTimeout(timeout);
              resolve();
            }
          } catch (parseErr) {
            warning(`Failed to parse log data: ${parseErr.message}`);
          }
        };

        eventSource.onerror = (err) => {
          error(`SSE connection error: ${err.message}`);
          eventSource.close();
          clearTimeout(timeout);
          reject(err);
        };

      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }

  async testTokenRewards() {
    info('Testing token reward system...');

    try {
      // Check user balance
      const balanceResponse = await axios.get(
        `${API_BASE_URL}/api/v1/users/${this.userId}/balance`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (balanceResponse.status === 200) {
        const balance = balanceResponse.data.balance;
        info(`User token balance: ${balance} HHCW`);

        // Should have received upload reward (10 HHCW)
        if (balance >= 10) {
          this.testResults.tokenRewards = true;
          success('Token rewards working correctly');
        } else {
          warning('Token balance lower than expected');
        }
      }

      // Check transaction history
      const txResponse = await axios.get(
        `${API_BASE_URL}/api/v1/users/${this.userId}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (txResponse.status === 200 && txResponse.data.length > 0) {
        success('Transaction history available');
        info(`Found ${txResponse.data.length} transactions`);
      }

    } catch (err) {
      warning(`Token reward test failed: ${err.message}`);
    }
  }

  async testBadgeSystem() {
    info('Testing NFT badge system...');

    try {
      // Check for badges
      const badgeResponse = await axios.get(
        `${API_BASE_URL}/api/v1/users/${this.userId}/badges`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (badgeResponse.status === 200) {
        const badges = badgeResponse.data;
        info(`User has ${badges.length} badges`);

        if (badges.length > 0) {
          this.testResults.badgeCheck = true;
          success('Badge system working');
        } else {
          info('No badges yet (expected for new user)');
          this.testResults.badgeCheck = true; // Still working
        }
      }

    } catch (err) {
      warning(`Badge system test failed: ${err.message}`);
    }
  }

  async testContentDiscovery() {
    info('Testing content discovery...');

    try {
      // Test explore endpoint
      const exploreResponse = await axios.get(
        `${API_BASE_URL}/api/v1/assets/explore?page=1&pageSize=10`
      );

      if (exploreResponse.status === 200) {
        const content = exploreResponse.data;
        info(`Found ${content.data?.length || 0} public assets`);
        this.testResults.contentDiscovery = true;
        success('Content discovery working');
      }

    } catch (err) {
      warning(`Content discovery test failed: ${err.message}`);
    }
  }

  async testCIDValidation() {
    info('Testing CID validation and retrieval...');

    try {
      // Get room details to check for generated assets
      const roomResponse = await axios.get(
        `${API_BASE_URL}/api/v1/rooms/${this.roomId}`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (roomResponse.status === 200 && roomResponse.data.assets) {
        const assets = roomResponse.data.assets;
        info(`Room has ${assets.length} generated assets`);

        for (const asset of assets) {
          if (asset.cid) {
            // Validate CID format
            const cidPattern = /^bafy[a-z0-9]+$/;
            if (cidPattern.test(asset.cid)) {
              success(`Valid CID format: ${asset.cid.substring(0, 20)}...`);
            } else {
              warning(`Invalid CID format: ${asset.cid}`);
            }
          }
        }
      }

    } catch (err) {
      warning(`CID validation test failed: ${err.message}`);
    }
  }

  generateReport() {
    log('='.repeat(60), 'cyan');
    log('🎃 HauntedAI E2E Test Results', 'magenta');
    log('='.repeat(60), 'cyan');

    const results = Object.entries(this.testResults);
    const passed = results.filter(([_, status]) => status).length;
    const total = results.length;

    results.forEach(([test, status]) => {
      const icon = status ? '✅' : '❌';
      const color = status ? 'green' : 'red';
      log(`${icon} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`, color);
    });

    log('='.repeat(60), 'cyan');
    log(`Overall Result: ${passed}/${total} tests passed`, passed === total ? 'green' : 'red');

    if (passed === total) {
      success('🎉 All E2E tests passed! HauntedAI is working correctly.');
    } else {
      error(`❌ ${total - passed} tests failed. Please check the issues above.`);
      process.exit(1);
    }

    // Additional info
    log('='.repeat(60), 'cyan');
    info('Test Environment:');
    info(`API Base URL: ${API_BASE_URL}`);
    info(`WebSocket URL: ${WS_URL}`);
    info(`Test Duration: ${Date.now() - this.startTime}ms`);
    
    if (this.roomId) {
      info(`Test Room ID: ${this.roomId}`);
      info(`Room URL: ${API_BASE_URL.replace('3001', '3000')}/room/${this.roomId}`);
    }
  }

  async run() {
    this.startTime = Date.now();
    await this.runAllTests();
  }
}

// Main execution
if (require.main === module) {
  const runner = new E2ETestRunner();
  runner.run().catch((err) => {
    error(`E2E test suite failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = E2ETestRunner;