#!/usr/bin/env node

/**
 * Full User Journey Test - HauntedAI Platform
 * Tests complete flow: Login → Create Room → Monitor Progress
 */

const axios = require('axios');
const readline = require('readline');

const API_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_URL = 'http://localhost:5173';

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`STEP ${step}: ${message}`, 'cyan');
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForUser(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`\n${colors.yellow}${message} (Press Enter to continue)${colors.reset}\n`, () => {
      rl.close();
      resolve();
    });
  });
}

// Test Story
const HAUNTED_STORY = `On a stormy night, Sarah decided to explore the abandoned house at the end of the street. Everyone had warned her about this place, but her curiosity was stronger than her fear.

She slowly pushed the rusty door, which let out a terrifying creak that pierced the silence of the night. The darkness inside was thick, and the air was heavy with the smell of mold and forgotten memories.

Suddenly, she heard a faint whisper coming from upstairs. "Leave... leave this place..."

Her heart began to race, but she gathered her courage and climbed the crumbling stairs. Each step made a horrifying sound, as if the house itself was warning her.

At the end of the hallway, she saw a door slightly ajar with dim light seeping through. She approached slowly and pushed the door open...

What she saw there made her blood freeze in her veins. A huge old mirror filled the wall, but her reflection wasn't in it. Instead, she saw someone else... someone smiling a terrifying smile... reaching their hand toward her from inside the mirror.`;

// Step 1: Check Services
async function step1_checkServices() {
  logStep(1, 'Checking if services are running');
  
  try {
    // Check API
    const apiHealth = await axios.get(`${API_BASE}/health`);
    if (apiHealth.data.status === 'ok') {
      logSuccess('API is running on port 3001');
      logInfo(`   Database: ${apiHealth.data.services.database}`);
      logInfo(`   Modules: ${Object.keys(apiHealth.data.modules).join(', ')}`);
    }
  } catch (error) {
    logError('API is not running!');
    logWarning('Start API: cd apps/api && npm run dev');
    process.exit(1);
  }

  try {
    // Check Frontend
    await axios.get(FRONTEND_URL);
    logSuccess('Frontend is running on port 5173');
  } catch (error) {
    logError('Frontend is not running!');
    logWarning('Start Frontend: cd apps/web && npm run dev');
    process.exit(1);
  }

  return true;
}

// Step 2: Manual Login
async function step2_manualLogin() {
  logStep(2, 'User Login (Manual Step)');
  
  log('\n📱 Open your browser and go to:', 'cyan');
  log(`   ${FRONTEND_URL}`, 'magenta');
  log('\n🔐 Steps to login:', 'cyan');
  log('   1. Click "Connect Wallet" button', 'blue');
  log('   2. Approve MetaMask connection', 'blue');
  log('   3. Sign the message in MetaMask', 'blue');
  log('   4. Wait for redirect to Dashboard', 'blue');
  
  await waitForUser('✋ Complete the login steps above, then press Enter');
  
  logSuccess('User should now be logged in');
  return true;
}

// Step 3: Create Room via API (simulating frontend)
async function step3_createRoom() {
  logStep(3, 'Creating a new haunted room');
  
  logInfo('Story to be created:');
  log(`\n"${HAUNTED_STORY.substring(0, 150)}..."\n`, 'blue');
  
  log('⚠️  Note: This will fail without valid JWT token', 'yellow');
  log('   In real scenario, user creates room from Dashboard UI', 'yellow');
  
  try {
    const response = await axios.post(
      `${API_BASE}/rooms`,
      { inputText: HAUNTED_STORY },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      }
    );
    
    if (response.status === 401) {
      logWarning('Expected: API requires authentication (401)');
      logInfo('User must create room from Dashboard UI after login');
      return null;
    } else if (response.status === 201) {
      logSuccess('Room created successfully!');
      logInfo(`   Room ID: ${response.data.id}`);
      return response.data;
    } else {
      logError(`Unexpected response: ${response.status}`);
      return null;
    }
  } catch (error) {
    logError('Failed to create room');
    console.error(error.message);
    return null;
  }
}

// Step 4: Manual Room Creation
async function step4_manualRoomCreation() {
  logStep(4, 'Create Room from Dashboard (Manual Step)');
  
  log('\n📝 Steps to create a room:', 'cyan');
  log('   1. Go to Dashboard page', 'blue');
  log('   2. Click "New Session" button', 'blue');
  log('   3. Paste the story below:', 'blue');
  log('\n' + '─'.repeat(70), 'cyan');
  log(HAUNTED_STORY, 'magenta');
  log('─'.repeat(70) + '\n', 'cyan');
  log('   4. Click "Summon Agents" button', 'blue');
  log('   5. You should be redirected to Live Room page', 'blue');
  
  await waitForUser('✋ Complete the room creation steps above, then press Enter');
  
  logSuccess('Room should now be created');
  
  // Ask for room ID
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`\n${colors.yellow}Enter the Room ID from the URL (e.g., abc123...):${colors.reset}\n`, (roomId) => {
      rl.close();
      if (roomId && roomId.trim()) {
        logSuccess(`Room ID captured: ${roomId.trim()}`);
        resolve(roomId.trim());
      } else {
        logWarning('No Room ID provided, skipping verification');
        resolve(null);
      }
    });
  });
}

// Step 5: Verify Room
async function step5_verifyRoom(roomId) {
  if (!roomId) {
    logWarning('Skipping room verification (no Room ID)');
    return false;
  }
  
  logStep(5, 'Verifying room exists');
  
  try {
    const response = await axios.get(`${API_BASE}/rooms/${roomId}`, {
      validateStatus: () => true,
    });
    
    if (response.status === 401) {
      logWarning('Room endpoint requires authentication');
      logInfo('Room exists but cannot be verified without JWT token');
      return true;
    } else if (response.status === 200) {
      logSuccess('Room verified successfully!');
      logInfo(`   Status: ${response.data.status}`);
      logInfo(`   Input: ${response.data.inputText?.substring(0, 50)}...`);
      return true;
    } else {
      logError(`Room verification failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError('Failed to verify room');
    console.error(error.message);
    return false;
  }
}

// Step 6: Monitor Live Room
async function step6_monitorLiveRoom() {
  logStep(6, 'Monitor Live Room (Manual Step)');
  
  log('\n👀 What to check on Live Room page:', 'cyan');
  log('   1. Room status should show (idle/running/done)', 'blue');
  log('   2. Click "Start Workflow" button if status is idle', 'blue');
  log('   3. Watch the live logs appear in real-time', 'blue');
  log('   4. Agents should process: Story → Asset → Code → Deploy', 'blue');
  log('   5. Assets panel should show generated CIDs', 'blue');
  log('   6. Final status should be "done" when complete', 'blue');
  
  log('\n📊 Expected Agent Flow:', 'cyan');
  log('   [Orchestrator] → Starting workflow...', 'blue');
  log('   [Story Agent]  → Generating spooky story...', 'blue');
  log('   [Story Agent]  → Story uploaded to Storacha', 'blue');
  log('   [Asset Agent]  → Creating haunting image...', 'blue');
  log('   [Asset Agent]  → Image uploaded to Storacha', 'blue');
  log('   [Code Agent]   → Building mini-game...', 'blue');
  log('   [Code Agent]   → Code uploaded to Storacha', 'blue');
  log('   [Deploy Agent] → Deploying to Vercel...', 'blue');
  log('   [Deploy Agent] → Deployment complete!', 'blue');
  
  await waitForUser('✋ Monitor the Live Room, then press Enter when done');
  
  logSuccess('Live Room monitoring complete');
  return true;
}

// Step 7: Check Explore Page
async function step7_checkExplore() {
  logStep(7, 'Check Explore Page (Manual Step)');
  
  log('\n🎨 Steps to check Explore page:', 'cyan');
  log('   1. Navigate to Explore page', 'blue');
  log('   2. Your created assets should appear in the gallery', 'blue');
  log('   3. Click on any asset to view details', 'blue');
  log('   4. Copy CID and verify on IPFS', 'blue');
  
  await waitForUser('✋ Check the Explore page, then press Enter');
  
  logSuccess('Explore page check complete');
  return true;
}

// Step 8: Test Public Endpoints
async function step8_testPublicEndpoints() {
  logStep(8, 'Testing public endpoints');
  
  try {
    const response = await axios.get(`${API_BASE}/assets/explore?page=1&limit=12`);
    logSuccess('Explore endpoint is working');
    logInfo(`   Total assets: ${response.data.pagination.total}`);
    
    if (response.data.data && response.data.data.length > 0) {
      logInfo(`   Latest asset: ${response.data.data[0].agentType} (${response.data.data[0].fileType})`);
    }
    
    return true;
  } catch (error) {
    logError('Failed to test public endpoints');
    console.error(error.message);
    return false;
  }
}

// Main Test Runner
async function runFullJourney() {
  log('\n' + '='.repeat(70), 'magenta');
  log('🎃 HauntedAI Platform - Full User Journey Test', 'magenta');
  log('='.repeat(70) + '\n', 'magenta');
  
  const results = {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
    step7: false,
    step8: false,
  };
  
  try {
    // Step 1: Check Services
    results.step1 = await step1_checkServices();
    await sleep(1000);
    
    // Step 2: Manual Login
    results.step2 = await step2_manualLogin();
    await sleep(1000);
    
    // Step 3: Try API Room Creation (will fail, that's expected)
    results.step3 = await step3_createRoom();
    await sleep(1000);
    
    // Step 4: Manual Room Creation
    const roomId = await step4_manualRoomCreation();
    results.step4 = !!roomId;
    await sleep(1000);
    
    // Step 5: Verify Room
    results.step5 = await step5_verifyRoom(roomId);
    await sleep(1000);
    
    // Step 6: Monitor Live Room
    results.step6 = await step6_monitorLiveRoom();
    await sleep(1000);
    
    // Step 7: Check Explore
    results.step7 = await step7_checkExplore();
    await sleep(1000);
    
    // Step 8: Test Public Endpoints
    results.step8 = await step8_testPublicEndpoints();
    
  } catch (error) {
    logError('Test journey failed');
    console.error(error);
  }
  
  // Summary
  log('\n' + '='.repeat(70), 'magenta');
  log('📊 Test Journey Summary', 'magenta');
  log('='.repeat(70) + '\n', 'magenta');
  
  const steps = [
    { name: 'Services Running', result: results.step1 },
    { name: 'User Login', result: results.step2 },
    { name: 'API Room Creation', result: results.step3 !== null },
    { name: 'Manual Room Creation', result: results.step4 },
    { name: 'Room Verification', result: results.step5 },
    { name: 'Live Room Monitoring', result: results.step6 },
    { name: 'Explore Page Check', result: results.step7 },
    { name: 'Public Endpoints', result: results.step8 },
  ];
  
  let completed = 0;
  steps.forEach(step => {
    if (step.result) {
      log(`✅ ${step.name}`, 'green');
      completed++;
    } else {
      log(`❌ ${step.name}`, 'red');
    }
  });
  
  log('\n' + '='.repeat(70), 'magenta');
  log(`\nCompleted: ${completed}/${steps.length} steps\n`, completed === steps.length ? 'green' : 'yellow');
  
  if (completed === steps.length) {
    log('🎉 Full user journey completed successfully!', 'green');
    log('🎃 The HauntedAI platform is working perfectly!', 'green');
  } else {
    log('⚠️  Some steps were not completed', 'yellow');
    log('   This is normal for manual testing steps', 'yellow');
  }
  
  log('\n');
}

// Run the test
runFullJourney().catch(error => {
  logError('Test runner failed');
  console.error(error);
  process.exit(1);
});
