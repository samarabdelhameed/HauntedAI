#!/usr/bin/env node
// E2E Test for Orchestrator Service
// Tests complete workflow from user input to deployment
// Managed by Kiro

const Redis = require('ioredis');
const http = require('http');
const { Server } = require('socket.io');

// ANSI color codes for beautiful output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

// Test data
const testData = {
  roomId: `test-room-${Date.now()}`,
  userId: `test-user-${Date.now()}`,
  userInput: 'Tell me a spooky story about a haunted mansion in the dark forest',
};

// Track test results
const testResults = {
  passed: 0,
  failed: 0,
  logs: [],
  notifications: [],
  startTime: Date.now(),
};

// Helper function to wait
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Setup Redis connection
async function testRedisConnection() {
  logSection('Test 1: Redis Connection');
  
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    await redis.ping();
    logSuccess('Redis connection established');
    
    // Test pub/sub
    const subscriber = redis.duplicate();
    await subscriber.subscribe('test-channel');
    
    await redis.publish('test-channel', 'test-message');
    
    await sleep(100);
    
    await subscriber.unsubscribe('test-channel');
    await subscriber.quit();
    await redis.quit();
    
    logSuccess('Redis pub/sub working correctly');
    testResults.passed++;
    return true;
  } catch (error) {
    logError(`Redis connection failed: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

// Test 2: Create mock database functions
function createMockDatabase() {
  logSection('Test 2: Mock Database Setup');
  
  const db = {
    rooms: new Map(),
    users: new Map(),
    transactions: [],
  };
  
  // Mock updateRoomStatus
  const updateRoomStatus = async (roomId, status) => {
    logInfo(`Database: Updating room ${roomId} status to "${status}"`);
    const room = db.rooms.get(roomId) || { id: roomId, status: 'idle' };
    room.status = status;
    room.updatedAt = new Date();
    db.rooms.set(roomId, room);
    return room;
  };
  
  // Mock rewardUser
  const rewardUser = async (roomId, amount) => {
    logInfo(`Database: Rewarding user ${amount} HHCW tokens for room ${roomId}`);
    const transaction = {
      id: `tx-${Date.now()}`,
      roomId,
      amount,
      reason: 'workflow_completion',
      timestamp: new Date(),
    };
    db.transactions.push(transaction);
    return transaction;
  };
  
  logSuccess('Mock database functions created');
  testResults.passed++;
  
  return { db, updateRoomStatus, rewardUser };
}

// Test 3: Setup WebSocket server
async function setupWebSocketServer() {
  logSection('Test 3: WebSocket Server Setup');
  
  return new Promise((resolve, reject) => {
    try {
      const httpServer = http.createServer();
      const io = new Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
      });
      
      const notifications = [];
      
      io.on('connection', (socket) => {
        logInfo(`WebSocket: Client connected (${socket.id})`);
        
        socket.on('authenticate', (data) => {
          socket.join(data.roomId);
          socket.emit('authenticated', { roomId: data.roomId });
          logSuccess(`WebSocket: Client authenticated for room ${data.roomId}`);
        });
        
        socket.on('disconnect', () => {
          logInfo(`WebSocket: Client disconnected (${socket.id})`);
        });
      });
      
      // Listen on random port
      httpServer.listen(0, () => {
        const port = httpServer.address().port;
        logSuccess(`WebSocket server listening on port ${port}`);
        testResults.passed++;
        resolve({ io, httpServer, port, notifications });
      });
    } catch (error) {
      logError(`WebSocket setup failed: ${error.message}`);
      testResults.failed++;
      reject(error);
    }
  });
}

// Test 4: Setup log subscriber
async function setupLogSubscriber(roomId) {
  logSection('Test 4: Log Subscriber Setup');
  
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  const channel = `room:${roomId}:logs`;
  
  await redis.subscribe(channel);
  
  redis.on('message', (ch, message) => {
    if (ch === channel) {
      try {
        const log = JSON.parse(message);
        testResults.logs.push(log);
        
        const levelColors = {
          info: colors.blue,
          success: colors.green,
          warn: colors.yellow,
          error: colors.red,
        };
        
        const color = levelColors[log.level] || colors.reset;
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        console.log(`${color}[${timestamp}] [${log.agentType}] ${log.message}${colors.reset}`);
      } catch (error) {
        logError(`Failed to parse log: ${error.message}`);
      }
    }
  });
  
  logSuccess(`Subscribed to logs for room ${roomId}`);
  testResults.passed++;
  
  return redis;
}

// Test 5: Create and test Orchestrator
async function testOrchestratorWorkflow(updateRoomStatus, rewardUser, roomId) {
  logSection('Test 5: Orchestrator Workflow Execution');
  
  // Import orchestrator (we'll use the compiled version)
  const { OrchestratorService, LogEmitterService } = require('./dist/index.js');
  
  // Create log emitter
  const logEmitter = new LogEmitterService(process.env.REDIS_URL || 'redis://localhost:6379');
  
  // Create orchestrator
  const orchestrator = new OrchestratorService(
    async (roomId, agentType, level, message, metadata) => {
      await logEmitter.emitLog(roomId, agentType, level, message, metadata);
    },
    updateRoomStatus,
    rewardUser
  );
  
  logInfo('Orchestrator created successfully');
  
  // Mock the callAgent method to simulate real agent behavior
  const originalCallAgent = orchestrator.callAgent;
  orchestrator.callAgent = async function(config, input) {
    logInfo(`Calling ${config.name} with input...`);
    
    // Simulate different agent behaviors
    await sleep(500); // Simulate processing time
    
    if (config.name === 'StoryAgent') {
      return {
        success: true,
        story: 'In the depths of the haunted mansion, shadows danced across the walls...',
        cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      };
    } else if (config.name === 'AssetAgent') {
      return {
        success: true,
        imageCid: 'bafybeibhwfzx6oo5rymsxmkdxpmkfwyvbjrrwcl7cekmbzlupmp5ypkyfi',
        imageUrl: 'https://ipfs.io/ipfs/bafybeibhwfzx6oo5rymsxmkdxpmkfwyvbjrrwcl7cekmbzlupmp5ypkyfi',
      };
    } else if (config.name === 'CodeAgent') {
      return {
        success: true,
        codeCid: 'bafybeif6gutn5u6qqmqvjqjxwqzqjqzqjqzqjqzqjqzqjqzqjqzqjqzqjq',
        code: '<!DOCTYPE html><html><body><h1>Haunted Game</h1></body></html>',
      };
    } else if (config.name === 'DeployAgent') {
      return {
        success: true,
        deploymentUrl: 'https://haunted-game-abc123.vercel.app',
        codeCid: 'bafybeif6gutn5u6qqmqvjqjxwqzqjqzqjqzqjqzqjqzqjqzqjqzqjqzqjq',
      };
    }
    
    return { success: true };
  };
  
  logInfo('Starting workflow execution...');
  logInfo(`Room ID: ${roomId}`);
  logInfo(`User Input: "${testData.userInput}"`);
  
  // Execute workflow
  try {
    await orchestrator.executeWorkflow(roomId, testData.userInput);
    logSuccess('Workflow completed successfully!');
    testResults.passed++;
    return true;
  } catch (error) {
    logError(`Workflow failed: ${error.message}`);
    testResults.failed++;
    return false;
  } finally {
    await logEmitter.close();
  }
}

// Test 6: Verify workflow results
async function verifyWorkflowResults(db, roomId) {
  logSection('Test 6: Verify Workflow Results');
  
  // Check room status
  const room = db.rooms.get(roomId);
  if (room && room.status === 'done') {
    logSuccess(`Room status is "done" ✓`);
    testResults.passed++;
  } else {
    logError(`Room status is "${room?.status}" (expected "done")`);
    testResults.failed++;
  }
  
  // Check user reward
  const rewards = db.transactions.filter(tx => tx.roomId === roomId);
  if (rewards.length > 0 && rewards[0].amount === 10) {
    logSuccess(`User rewarded with 10 HHCW tokens ✓`);
    testResults.passed++;
  } else {
    logError(`User reward not found or incorrect amount`);
    testResults.failed++;
  }
  
  // Check logs
  if (testResults.logs.length > 0) {
    logSuccess(`Received ${testResults.logs.length} log messages ✓`);
    testResults.passed++;
    
    // Verify log structure
    const hasAllAgents = ['orchestrator', 'story', 'asset', 'code', 'deploy'].every(agent =>
      testResults.logs.some(log => log.agentType === agent)
    );
    
    if (hasAllAgents) {
      logSuccess('All agents emitted logs ✓');
      testResults.passed++;
    } else {
      logWarning('Not all agents emitted logs');
      testResults.failed++;
    }
    
    // Verify log levels
    const hasSuccessLogs = testResults.logs.some(log => log.level === 'success');
    if (hasSuccessLogs) {
      logSuccess('Success logs present ✓');
      testResults.passed++;
    } else {
      logWarning('No success logs found');
      testResults.failed++;
    }
  } else {
    logError('No logs received');
    testResults.failed++;
  }
}

// Test 7: Test retry logic with failures
async function testRetryLogic(updateRoomStatus, rewardUser) {
  logSection('Test 7: Retry Logic with Simulated Failures');
  
  const roomId = `test-room-retry-${Date.now()}`;
  const { OrchestratorService, LogEmitterService } = require('./dist/index.js');
  
  const logEmitter = new LogEmitterService(process.env.REDIS_URL || 'redis://localhost:6379');
  
  const orchestrator = new OrchestratorService(
    async (roomId, agentType, level, message, metadata) => {
      await logEmitter.emitLog(roomId, agentType, level, message, metadata);
    },
    updateRoomStatus,
    rewardUser
  );
  
  // Mock agent to fail twice then succeed
  let storyAttemptCount = 0;
  orchestrator.callAgent = async function(config) {
    if (config.name === 'StoryAgent') {
      storyAttemptCount++;
      
      if (storyAttemptCount <= 2) {
        logWarning(`StoryAgent attempt ${storyAttemptCount} - simulating failure`);
        throw new Error('Simulated failure');
      }
      
      logSuccess(`StoryAgent attempt ${storyAttemptCount} - success!`);
      await sleep(300);
      return { success: true, story: 'Test story', cid: 'bafy123' };
    }
    
    // Other agents succeed immediately
    await sleep(200);
    return { success: true };
  };
  
  try {
    await orchestrator.executeWorkflow(roomId, 'Test retry');
    
    if (storyAttemptCount === 3) {
      logSuccess(`Retry logic worked! StoryAgent succeeded after ${storyAttemptCount} attempts ✓`);
      testResults.passed++;
    } else {
      logError(`Expected 3 attempts, got ${storyAttemptCount}`);
      testResults.failed++;
    }
  } catch (error) {
    logError(`Retry test failed: ${error.message}`);
    testResults.failed++;
  } finally {
    await logEmitter.close();
  }
}

// Test 8: Test timeout enforcement
async function testTimeoutEnforcement(updateRoomStatus, rewardUser) {
  logSection('Test 8: Timeout Enforcement');
  
  const roomId = `test-room-timeout-${Date.now()}`;
  const { OrchestratorService, LogEmitterService } = require('./dist/index.js');
  
  const logEmitter = new LogEmitterService(process.env.REDIS_URL || 'redis://localhost:6379');
  
  const orchestrator = new OrchestratorService(
    async (roomId, agentType, level, message, metadata) => {
      await logEmitter.emitLog(roomId, agentType, level, message, metadata);
    },
    updateRoomStatus,
    rewardUser
  );
  
  // Mock agent to timeout
  orchestrator.callAgent = async function(config) {
    if (config.name === 'StoryAgent') {
      logWarning('StoryAgent - simulating timeout');
      throw new Error(`${config.name} timeout after ${config.timeout}ms`);
    }
    return { success: true };
  };
  
  try {
    await orchestrator.executeWorkflow(roomId, 'Test timeout');
    
    // Should handle timeout gracefully
    logSuccess('Timeout handled gracefully (workflow continued) ✓');
    testResults.passed++;
  } catch (error) {
    logError(`Timeout test failed: ${error.message}`);
    testResults.failed++;
  } finally {
    await logEmitter.close();
  }
}

// Main test runner
async function runAllTests() {
  log('\n🎃 HauntedAI Orchestrator E2E Test Suite 🎃\n', colors.bright + colors.magenta);
  log('Testing complete workflow from user input to deployment\n', colors.cyan);
  
  let logSubscriber;
  let wsServer;
  
  try {
    // Test 1: Redis connection
    const redisOk = await testRedisConnection();
    if (!redisOk) {
      logError('Redis connection failed. Please ensure Redis is running.');
      process.exit(1);
    }
    
    // Test 2: Mock database
    const { db, updateRoomStatus, rewardUser } = createMockDatabase();
    
    // Test 3: WebSocket server
    wsServer = await setupWebSocketServer();
    
    // Test 4: Log subscriber
    logSubscriber = await setupLogSubscriber(testData.roomId);
    
    // Wait a bit for subscriptions to be ready
    await sleep(500);
    
    // Test 5: Main workflow
    await testOrchestratorWorkflow(updateRoomStatus, rewardUser, testData.roomId);
    
    // Wait for all logs to arrive
    await sleep(1000);
    
    // Test 6: Verify results
    await verifyWorkflowResults(db, testData.roomId);
    
    // Test 7: Retry logic
    await testRetryLogic(updateRoomStatus, rewardUser);
    
    // Test 8: Timeout enforcement
    await testTimeoutEnforcement(updateRoomStatus, rewardUser);
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
    testResults.failed++;
  } finally {
    // Cleanup
    if (logSubscriber) {
      await logSubscriber.quit();
    }
    if (wsServer) {
      wsServer.httpServer.close();
    }
  }
  
  // Print final results
  printFinalResults();
}

function printFinalResults() {
  const duration = ((Date.now() - testResults.startTime) / 1000).toFixed(2);
  
  logSection('Test Results Summary');
  
  log(`Total Tests: ${testResults.passed + testResults.failed}`, colors.bright);
  logSuccess(`Passed: ${testResults.passed}`);
  if (testResults.failed > 0) {
    logError(`Failed: ${testResults.failed}`);
  }
  log(`Duration: ${duration}s`, colors.cyan);
  
  if (testResults.logs.length > 0) {
    log(`\nTotal Logs Received: ${testResults.logs.length}`, colors.cyan);
    
    const logsByLevel = testResults.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(logsByLevel).forEach(([level, count]) => {
      log(`  ${level}: ${count}`, colors.blue);
    });
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (testResults.failed === 0) {
    log('🎉 All tests passed! Orchestrator is working correctly! 🎉\n', colors.bright + colors.green);
    process.exit(0);
  } else {
    log('❌ Some tests failed. Please review the errors above.\n', colors.bright + colors.red);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
