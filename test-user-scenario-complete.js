#!/usr/bin/env node

/**
 * Complete User Scenario Test
 * Tests all pages as a real user would interact with them
 * Checks for errors, data fetching, and functionality
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001/api/v1';

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  
  const color = colors[type] || colors.info;
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    log(`✅ ${name}`, 'success');
    if (details) log(`   ${details}`, 'info');
  } else {
    results.failed++;
    log(`❌ ${name}`, 'error');
    if (details) log(`   ${details}`, 'error');
    results.errors.push({ test: name, details });
  }
}

async function checkAPIAvailability() {
  log('\n🔌 Checking API Availability...', 'info');
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 3000 });
    logTest('API Health Check', true, `Status: ${response.data.status}`);
    return true;
  } catch (error) {
    logTest('API Health Check', false, 'API not running - tests will run in offline mode');
    return false;
  }
}

async function testLandingPage(browser) {
  log('\n🏠 Testing Landing Page...', 'info');
  const page = await browser.newPage();
  
  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    // Navigate to landing page
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 10000 });
    logTest('Landing Page Loads', true, 'Page loaded successfully');
    
    // Check for console errors
    logTest('No Console Errors', consoleErrors.length === 0, 
      consoleErrors.length > 0 ? `Found ${consoleErrors.length} errors` : 'Clean console');
    
    // Check page title
    const title = await page.title();
    logTest('Page Has Title', title.length > 0, `Title: ${title}`);
    
    // Check for main elements
    const hasLogo = await page.$('text/HauntedAI') !== null;
    logTest('Logo Present', hasLogo);
    
    const hasConnectButton = await page.$('button:has-text("Connect")') !== null || 
                             await page.$('button:has-text("Connecting")') !== null;
    logTest('Connect Wallet Button Present', hasConnectButton);
    
    const hasEnterButton = await page.$('text/Enter') !== null;
    logTest('Enter Room Button Present', hasEnterButton);
    
    const hasGalleryButton = await page.$('text/Gallery') !== null || 
                             await page.$('text/Explore') !== null;
    logTest('Gallery Button Present', hasGalleryButton);
    
    // Check for feature cards
    const featureCards = await page.$$('.glass');
    logTest('Feature Cards Present', featureCards.length >= 3, 
      `Found ${featureCards.length} cards`);
    
    // Test navigation to dashboard
    try {
      await page.click('text/Enter');
      await page.waitForNavigation({ timeout: 5000 });
      const url = page.url();
      logTest('Navigation to Dashboard Works', url.includes('/dashboard'));
    } catch (error) {
      logTest('Navigation to Dashboard Works', false, error.message);
    }
    
  } catch (error) {
    logTest('Landing Page Test', false, error.message);
  } finally {
    await page.close();
  }
}

async function testDashboardPage(browser) {
  log('\n📊 Testing Dashboard Page...', 'info');
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0', timeout: 10000 });
    logTest('Dashboard Page Loads', true);
    
    // Check console errors
    logTest('No Console Errors', consoleErrors.length === 0,
      consoleErrors.length > 0 ? `Found ${consoleErrors.length} errors` : 'Clean console');
    
    // Check sidebar
    const hasSidebar = await page.$('aside') !== null;
    logTest('Sidebar Present', hasSidebar);
    
    // Check navigation items
    const navItems = await page.$$('nav button');
    logTest('Navigation Items Present', navItems.length >= 4, 
      `Found ${navItems.length} nav items`);
    
    // Check token balance
    const hasBalance = await page.$('text/Token Balance') !== null || 
                       await page.$('text/HHCW') !== null;
    logTest('Token Balance Display', hasBalance);
    
    // Check agent cards
    const agentCards = await page.$$('.glass');
    logTest('Agent Cards Present', agentCards.length >= 4, 
      `Found ${agentCards.length} cards`);
    
    // Check for agent names
    const hasStoryAgent = await page.$('text/Story Agent') !== null;
    const hasAssetAgent = await page.$('text/Asset Agent') !== null;
    const hasCodeAgent = await page.$('text/Code Agent') !== null;
    const hasDeployAgent = await page.$('text/Deploy Agent') !== null;
    
    logTest('All Agents Displayed', 
      hasStoryAgent && hasAssetAgent && hasCodeAgent && hasDeployAgent,
      'Story, Asset, Code, Deploy agents');
    
    // Check New Session button
    const hasNewSessionBtn = await page.$('button:has-text("New Session")') !== null;
    logTest('New Session Button Present', hasNewSessionBtn);
    
    // Test modal opening
    if (hasNewSessionBtn) {
      try {
        await page.click('button:has-text("New Session")');
        await page.waitForSelector('textarea', { timeout: 3000 });
        logTest('New Session Modal Opens', true);
        
        // Check modal elements
        const hasTextarea = await page.$('textarea') !== null;
        const hasSummonBtn = await page.$('button:has-text("Summon")') !== null;
        logTest('Modal Has Required Elements', hasTextarea && hasSummonBtn);
      } catch (error) {
        logTest('New Session Modal Opens', false, error.message);
      }
    }
    
  } catch (error) {
    logTest('Dashboard Page Test', false, error.message);
  } finally {
    await page.close();
  }
}

async function testExplorePage(browser) {
  log('\n🔍 Testing Explore Page...', 'info');
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    await page.goto(`${FRONTEND_URL}/explore`, { waitUntil: 'networkidle0', timeout: 10000 });
    logTest('Explore Page Loads', true);
    
    // Check console errors
    logTest('No Console Errors', consoleErrors.length === 0,
      consoleErrors.length > 0 ? `Found ${consoleErrors.length} errors` : 'Clean console');
    
    // Check page title
    const hasTitle = await page.$('text/Haunted Gallery') !== null || 
                     await page.$('text/Explore') !== null;
    logTest('Page Title Present', hasTitle);
    
    // Check search bar
    const hasSearchBar = await page.$('input[placeholder*="Search"]') !== null;
    logTest('Search Bar Present', hasSearchBar);
    
    // Check filter dropdown
    const hasFilter = await page.$('select') !== null;
    logTest('Filter Dropdown Present', hasFilter);
    
    // Test filter options
    if (hasFilter) {
      const options = await page.$$('select option');
      logTest('Filter Has Options', options.length >= 5, 
        `Found ${options.length} filter options`);
    }
    
    // Check for asset grid or empty state
    const hasAssetGrid = await page.$('.grid') !== null;
    const hasEmptyState = await page.$('text/No assets') !== null;
    logTest('Asset Display Area Present', hasAssetGrid || hasEmptyState,
      hasEmptyState ? 'Empty state shown' : 'Asset grid present');
    
    // Test search functionality
    if (hasSearchBar) {
      try {
        await page.type('input[placeholder*="Search"]', 'test');
        await page.waitForTimeout(500);
        logTest('Search Input Works', true);
      } catch (error) {
        logTest('Search Input Works', false, error.message);
      }
    }
    
  } catch (error) {
    logTest('Explore Page Test', false, error.message);
  } finally {
    await page.close();
  }
}

async function testProfilePage(browser) {
  log('\n👤 Testing Profile Page...', 'info');
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    await page.goto(`${FRONTEND_URL}/profile`, { waitUntil: 'networkidle0', timeout: 10000 });
    logTest('Profile Page Loads', true);
    
    // Check console errors
    logTest('No Console Errors', consoleErrors.length === 0,
      consoleErrors.length > 0 ? `Found ${consoleErrors.length} errors` : 'Clean console');
    
    // Check user avatar
    const hasAvatar = await page.$('.rounded-full') !== null;
    logTest('User Avatar Present', hasAvatar);
    
    // Check wallet address
    const hasWallet = await page.$('text/Wallet Address') !== null || 
                      await page.$('.font-mono') !== null;
    logTest('Wallet Address Display', hasWallet);
    
    // Check stats cards
    const statsCards = await page.$$('.glass');
    logTest('Statistics Cards Present', statsCards.length >= 3,
      `Found ${statsCards.length} stat cards`);
    
    // Check tabs
    const hasTabs = await page.$('button:has-text("assets")') !== null ||
                    await page.$('button:has-text("badges")') !== null ||
                    await page.$('button:has-text("stats")') !== null;
    logTest('Profile Tabs Present', hasTabs);
    
    // Test tab switching
    try {
      const badgesTab = await page.$('button:has-text("badges")');
      if (badgesTab) {
        await badgesTab.click();
        await page.waitForTimeout(500);
        logTest('Tab Switching Works', true);
      }
    } catch (error) {
      logTest('Tab Switching Works', false, error.message);
    }
    
  } catch (error) {
    logTest('Profile Page Test', false, error.message);
  } finally {
    await page.close();
  }
}

async function testResponsiveness(browser) {
  log('\n📱 Testing Responsive Design...', 'info');
  const page = await browser.newPage();
  
  try {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 10000 });
    logTest('Mobile Viewport Loads', true, '375x667');
    
    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'networkidle0' });
    logTest('Tablet Viewport Loads', true, '768x1024');
    
    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await page.reload({ waitUntil: 'networkidle0' });
    logTest('Desktop Viewport Loads', true, '1920x1080');
    
  } catch (error) {
    logTest('Responsive Design Test', false, error.message);
  } finally {
    await page.close();
  }
}

async function generateReport() {
  log('\n' + '='.repeat(60), 'info');
  log('📊 TEST RESULTS SUMMARY', 'info');
  log('='.repeat(60), 'info');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  
  console.log(`\nTotal Tests: ${results.total}`);
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'success' : 'warning');
  
  if (results.failed > 0) {
    log('\n❌ Failed Tests:', 'error');
    results.errors.forEach((error, idx) => {
      log(`${idx + 1}. ${error.test}`, 'error');
      log(`   ${error.details}`, 'error');
    });
  }
  
  log('\n' + '='.repeat(60), 'info');
  
  if (results.failed === 0) {
    log('✅ ALL TESTS PASSED!', 'success');
    log('🎃 Frontend is working perfectly as a real user would experience it!', 'success');
  } else {
    log('⚠️ SOME TESTS FAILED', 'warning');
    log('Please review the failures above and fix them', 'warning');
  }
  
  log('='.repeat(60) + '\n', 'info');
}

async function main() {
  log('\n🎃 HauntedAI - Complete User Scenario Test', 'info');
  log('Testing all pages as a real user would interact with them\n', 'info');
  
  // Check if we need to install puppeteer
  try {
    require.resolve('puppeteer');
  } catch (e) {
    log('❌ Puppeteer not installed. Installing...', 'warning');
    log('Run: npm install puppeteer', 'warning');
    process.exit(1);
  }
  
  // Check API availability
  const apiAvailable = await checkAPIAvailability();
  if (!apiAvailable) {
    log('⚠️ API not available - tests will run in offline mode', 'warning');
  }
  
  // Launch browser
  log('\n🚀 Launching browser...', 'info');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Run all tests
    await testLandingPage(browser);
    await testDashboardPage(browser);
    await testExplorePage(browser);
    await testProfilePage(browser);
    await testResponsiveness(browser);
    
    // Generate report
    await generateReport();
    
  } catch (error) {
    log(`\n❌ Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    await browser.close();
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
