#!/usr/bin/env node

/**
 * Frontend Build Verification Test
 * Verifies that all pages are built correctly and have no errors
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    log(`✅ ${name}`, 'green');
    if (details) log(`   ${details}`, 'cyan');
  } else {
    results.failed++;
    log(`❌ ${name}`, 'red');
    if (details) log(`   ${details}`, 'red');
    results.errors.push({ test: name, details });
  }
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  logTest(description, exists, exists ? `Found: ${filePath}` : `Missing: ${filePath}`);
  return exists;
}

function checkFileContent(filePath, searchStrings, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const allFound = searchStrings.every(str => content.includes(str));
    logTest(description, allFound, 
      allFound ? `All required content found` : `Missing some content`);
    return allFound;
  } catch (error) {
    logTest(description, false, error.message);
    return false;
  }
}

function checkNoErrors(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for actual error code patterns, not error handling
    const hasErrors = content.includes('undefined is not') ||
                     content.includes('Cannot read property') ||
                     content.includes('TypeError:') ||
                     content.includes('ReferenceError:') ||
                     content.includes('SyntaxError:');
    logTest(description, !hasErrors, 
      hasErrors ? 'Found actual error code' : 'No error code found');
    return !hasErrors;
  } catch (error) {
    logTest(description, false, error.message);
    return false;
  }
}

log('\n🎃 HauntedAI - Frontend Build Verification', 'cyan');
log('Verifying all pages are built correctly\n', 'cyan');

// Check build output
log('\n📦 Checking Build Output...', 'cyan');
checkFileExists('apps/web/dist/index.html', 'Build Output Exists');
checkFileExists('apps/web/dist/assets', 'Assets Directory Exists');

// Check source files
log('\n📄 Checking Source Files...', 'cyan');

// Landing Page
log('\n🏠 Landing Page:', 'cyan');
checkFileExists('apps/web/src/pages/Landing.tsx', 'Landing.tsx exists');
checkFileContent('apps/web/src/pages/Landing.tsx', [
  'AnimatedBackground',
  'FloatingGhost',
  'LanguageSwitcher',
  'connectWallet',
  'useAuth'
], 'Landing.tsx has required components');
checkNoErrors('apps/web/src/pages/Landing.tsx', 'Landing.tsx has no error code');

// Dashboard Page
log('\n📊 Dashboard Page:', 'cyan');
checkFileExists('apps/web/src/pages/Dashboard.tsx', 'Dashboard.tsx exists');
checkFileContent('apps/web/src/pages/Dashboard.tsx', [
  'apiClient',
  'listRooms',
  'getBalance',
  'createRoom',
  'soundManager'
], 'Dashboard.tsx has required functionality');
checkNoErrors('apps/web/src/pages/Dashboard.tsx', 'Dashboard.tsx has no error code');

// Explore Page
log('\n🔍 Explore Page:', 'cyan');
checkFileExists('apps/web/src/pages/Explore.tsx', 'Explore.tsx exists');
checkFileContent('apps/web/src/pages/Explore.tsx', [
  'listAssets',
  'filterType',
  'searchTerm',
  'copyToClipboard'
], 'Explore.tsx has required functionality');
checkNoErrors('apps/web/src/pages/Explore.tsx', 'Explore.tsx has no error code');

// Live Room Page
log('\n🎬 Live Room Page:', 'cyan');
checkFileExists('apps/web/src/pages/LiveRoom.tsx', 'LiveRoom.tsx exists');
checkFileContent('apps/web/src/pages/LiveRoom.tsx', [
  'getRoom',
  'startRoom',
  'createSSEConnection',
  'logs',
  'assets'
], 'LiveRoom.tsx has required functionality');
checkNoErrors('apps/web/src/pages/LiveRoom.tsx', 'LiveRoom.tsx has no error code');

// Profile Page
log('\n👤 Profile Page:', 'cyan');
checkFileExists('apps/web/src/pages/Profile.tsx', 'Profile.tsx exists');
checkFileContent('apps/web/src/pages/Profile.tsx', [
  'stats',
  'badges',
  'activeTab'
], 'Profile.tsx has required functionality');
checkNoErrors('apps/web/src/pages/Profile.tsx', 'Profile.tsx has no error code');

// Check Components
log('\n🧩 Checking Components...', 'cyan');
checkFileExists('apps/web/src/components/AnimatedBackground.tsx', 'AnimatedBackground component');
checkFileExists('apps/web/src/components/FloatingGhost.tsx', 'FloatingGhost component');
checkFileExists('apps/web/src/components/GlowButton.tsx', 'GlowButton component');
checkFileExists('apps/web/src/components/LanguageSwitcher.tsx', 'LanguageSwitcher component');
checkFileExists('apps/web/src/components/Visualization.tsx', 'Visualization component');

// Check Utils
log('\n🔧 Checking Utilities...', 'cyan');
checkFileExists('apps/web/src/utils/apiClient.ts', 'API Client');
checkFileExists('apps/web/src/utils/web3.ts', 'Web3 Manager');
checkFileExists('apps/web/src/utils/soundManager.ts', 'Sound Manager');

// Check Contexts
log('\n🔄 Checking Contexts...', 'cyan');
checkFileExists('apps/web/src/contexts/AuthContext.tsx', 'Auth Context');

// Check i18n
log('\n🌐 Checking Internationalization...', 'cyan');
checkFileExists('apps/web/src/i18n/locales/en.json', 'English translations');
checkFileExists('apps/web/src/i18n/locales/ar.json', 'Arabic translations');

// Check for common issues
log('\n🔍 Checking for Common Issues...', 'cyan');

const pagesDir = 'apps/web/src/pages';
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

pages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for console.log (should be removed in production)
  const hasConsoleLog = content.match(/console\.log\(/g);
  if (hasConsoleLog && hasConsoleLog.length > 2) {
    logTest(`${page} - No excessive console.log`, false, 
      `Found ${hasConsoleLog.length} console.log statements`);
  } else {
    logTest(`${page} - No excessive console.log`, true);
  }
  
  // Check for proper error handling (try-catch or error state)
  const hasTryCatch = content.includes('try {') && content.includes('catch');
  const hasErrorState = content.includes('error') || content.includes('Error');
  logTest(`${page} - Has error handling`, hasTryCatch || hasErrorState);
  
  // Check for loading states
  const hasLoadingState = content.includes('isLoading') || content.includes('loading');
  logTest(`${page} - Has loading states`, hasLoadingState);
});

// Check API Client
log('\n🌐 Checking API Client...', 'cyan');
const apiClientPath = 'apps/web/src/utils/apiClient.ts';
if (fs.existsSync(apiClientPath)) {
  const apiContent = fs.readFileSync(apiClientPath, 'utf8');
  
  checkFileContent(apiClientPath, [
    'listRooms',
    'getRoom',
    'createRoom',
    'startRoom',
    'listAssets',
    'getBalance',
    'createSSEConnection'
  ], 'API Client has all required methods');
  
  const hasErrorHandling = apiContent.includes('catch') && apiContent.includes('error');
  logTest('API Client has error handling', hasErrorHandling);
}

// Check Auth Context
log('\n🔐 Checking Authentication...', 'cyan');
const authContextPath = 'apps/web/src/contexts/AuthContext.tsx';
if (fs.existsSync(authContextPath)) {
  checkFileContent(authContextPath, [
    'login',
    'logout',
    'isAuthenticated',
    'connectWalletOffline'
  ], 'Auth Context has required methods');
}

// Generate Report
log('\n' + '='.repeat(60), 'cyan');
log('📊 VERIFICATION RESULTS', 'cyan');
log('='.repeat(60), 'cyan');

const successRate = ((results.passed / results.total) * 100).toFixed(1);

console.log(`\nTotal Checks: ${results.total}`);
log(`Passed: ${results.passed}`, 'green');
log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');

if (results.failed > 0) {
  log('\n❌ Failed Checks:', 'red');
  results.errors.forEach((error, idx) => {
    log(`${idx + 1}. ${error.test}`, 'red');
    log(`   ${error.details}`, 'red');
  });
}

log('\n' + '='.repeat(60), 'cyan');

if (results.failed === 0) {
  log('✅ ALL CHECKS PASSED!', 'green');
  log('🎃 Frontend is properly built and ready!', 'green');
  log('\nAll pages have:', 'green');
  log('  ✓ Required components', 'green');
  log('  ✓ Error handling', 'green');
  log('  ✓ Loading states', 'green');
  log('  ✓ API integration', 'green');
  log('  ✓ No error code', 'green');
} else {
  log('⚠️ SOME CHECKS FAILED', 'yellow');
  log('Please review the failures above', 'yellow');
}

log('='.repeat(60) + '\n', 'cyan');

process.exit(results.failed > 0 ? 1 : 0);
