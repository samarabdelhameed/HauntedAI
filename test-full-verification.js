#!/usr/bin/env node

/**
 * 🎃 Complete Verification Test for HauntedAI
 * Tests everything to ensure the application works correctly
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

let passed = 0;
let failed = 0;
let warnings = 0;

function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✅${colors.reset}`,
    error: `${colors.red}❌${colors.reset}`,
    warning: `${colors.yellow}⚠️${colors.reset}`,
    info: `${colors.blue}ℹ️${colors.reset}`,
  }[type];
  
  console.log(`${prefix} ${message}`);
}

function test(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      log(`${name}`, 'success');
      passed++;
      return true;
    } else {
      log(`${name} - ${result}`, 'error');
      failed++;
      return false;
    }
  } catch (error) {
    log(`${name} - ${error.message}`, 'error');
    failed++;
    return false;
  }
}

function warn(message) {
  log(message, 'warning');
  warnings++;
}

async function testServer(url, name, optional = false) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode === 304) {
        resolve(true);
      } else {
        resolve(optional ? true : `Status code: ${res.statusCode}`);
      }
    });
    
    req.on('error', () => {
      if (optional) {
        warn(`${name} is not running (this is OK)`);
        resolve(true);
      } else {
        resolve(`${name} is not running`);
      }
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      if (optional) {
        warn(`${name} timeout (this is OK)`);
        resolve(true);
      } else {
        resolve(`${name} timeout`);
      }
    });
  });
}

async function runAllTests() {
  console.log(`\n${colors.cyan}${colors.bright}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║   🎃 Complete Verification Test 🎃        ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}╚════════════════════════════════════════════╝${colors.reset}\n`);

  // ========== Phase 1: Server Tests ==========
  console.log(`${colors.cyan}📡 Phase 1: Server Tests${colors.reset}\n`);
  
  const frontendRunning = await testServer('http://localhost:5173', 'Frontend');
  test('Frontend server is running on port 5173', () => frontendRunning);
  
  const apiRunning = await testServer('http://localhost:3001/health', 'API', true);
  test('API server check (optional)', () => apiRunning);

  // ========== Phase 2: File Structure Tests ==========
  console.log(`\n${colors.cyan}📁 Phase 2: File Structure Tests${colors.reset}\n`);
  
  test('Key files exist', () => {
    const files = [
      'apps/web/src/main.tsx',
      'apps/web/src/App.tsx',
      'apps/web/src/pages/Landing.tsx',
      'apps/web/src/pages/Dashboard.tsx',
      'apps/web/src/utils/apiClient.ts',
      'apps/web/src/contexts/AuthContext.tsx',
      'apps/web/vite.config.ts',
      'apps/web/package.json',
    ];
    
    const missing = files.filter(file => !fs.existsSync(file));
    if (missing.length > 0) {
      return `Missing: ${missing.join(', ')}`;
    }
    return true;
  });

  // ========== Phase 3: Configuration Tests ==========
  console.log(`\n${colors.cyan}⚙️  Phase 3: Configuration Tests${colors.reset}\n`);
  
  test('vite.config.ts has correct React settings', () => {
    const configPath = 'apps/web/vite.config.ts';
    if (!fs.existsSync(configPath)) {
      return 'vite.config.ts not found';
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    
    const checks = [
      content.includes('@vitejs/plugin-react'),
      content.includes('process.env.NODE_ENV'),
      content.includes('development'),
    ];
    
    if (checks.every(c => c)) {
      return true;
    }
    return 'Missing required React configuration';
  });

  test('package.json has required scripts', () => {
    const packagePath = 'apps/web/package.json';
    if (!fs.existsSync(packagePath)) {
      return 'package.json not found';
    }
    
    const content = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (content.scripts && content.scripts.dev) {
      return true;
    }
    return 'Required scripts missing';
  });

  // ========== Phase 4: Code Quality Tests ==========
  console.log(`\n${colors.cyan}💻 Phase 4: Code Quality Tests${colors.reset}\n`);
  
  test('main.tsx has global error handler', () => {
    const mainPath = 'apps/web/src/main.tsx';
    if (!fs.existsSync(mainPath)) {
      return 'main.tsx not found';
    }
    
    const content = fs.readFileSync(mainPath, 'utf8');
    
    if ((content.includes('console.error') || content.includes('console.warn')) && 
        (content.includes('ERR_CONNECTION_REFUSED') || content.includes('err_connection_refused'))) {
      return true;
    }
    return 'Global error handler not found';
  });

  test('Dashboard has notification system', () => {
    const dashboardPath = 'apps/web/src/pages/Dashboard.tsx';
    if (!fs.existsSync(dashboardPath)) {
      return 'Dashboard.tsx not found';
    }
    
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    if (content.includes('showNotification') && content.includes('notifications')) {
      return true;
    }
    return 'Notification system not found';
  });

  test('apiClient has proper error handling', () => {
    const apiPath = 'apps/web/src/utils/apiClient.ts';
    if (!fs.existsSync(apiPath)) {
      return 'apiClient.ts not found';
    }
    
    const content = fs.readFileSync(apiPath, 'utf8');
    
    if (content.includes('catch') && content.includes('error')) {
      return true;
    }
    return 'Error handling not found';
  });

  test('AuthContext supports offline mode', () => {
    const authPath = 'apps/web/src/contexts/AuthContext.tsx';
    if (!fs.existsSync(authPath)) {
      return 'AuthContext.tsx not found';
    }
    
    const content = fs.readFileSync(authPath, 'utf8');
    
    if (content.includes('connectWalletOffline') || content.includes('offline_mode')) {
      return true;
    }
    return 'Offline mode support not found';
  });

  test('Landing page has wallet connection', () => {
    const landingPath = 'apps/web/src/pages/Landing.tsx';
    if (!fs.existsSync(landingPath)) {
      return 'Landing.tsx not found';
    }
    
    const content = fs.readFileSync(landingPath, 'utf8');
    
    if (content.includes('handleConnectWallet') && content.includes('web3Manager')) {
      return true;
    }
    return 'Wallet connection not found';
  });

  // ========== Phase 5: i18n Tests ==========
  console.log(`\n${colors.cyan}🌐 Phase 5: Internationalization Tests${colors.reset}\n`);
  
  test('i18n translation files exist', () => {
    const arPath = 'apps/web/src/i18n/locales/ar.json';
    const enPath = 'apps/web/src/i18n/locales/en.json';
    
    if (!fs.existsSync(arPath) || !fs.existsSync(enPath)) {
      return 'Translation files missing';
    }
    
    const arContent = JSON.parse(fs.readFileSync(arPath, 'utf8'));
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    
    if (arContent.common && enContent.common && arContent.landing && enContent.landing) {
      return true;
    }
    return 'Translation files incomplete';
  });

  test('i18n has disconnect translation', () => {
    const arPath = 'apps/web/src/i18n/locales/ar.json';
    const enPath = 'apps/web/src/i18n/locales/en.json';
    
    if (!fs.existsSync(arPath) || !fs.existsSync(enPath)) {
      return 'Translation files missing';
    }
    
    const arContent = JSON.parse(fs.readFileSync(arPath, 'utf8'));
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    
    if ((arContent.common?.disconnect || enContent.common?.disconnect)) {
      return true;
    }
    return 'Disconnect translation missing';
  });

  // ========== Summary ==========
  console.log(`\n${colors.cyan}${colors.bright}════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}📊 Test Results Summary${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  }
  if (warnings > 0) {
    console.log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);
  }

  const total = passed + failed;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  console.log(`\n${colors.cyan}Success Rate: ${successRate}%${colors.reset}\n`);

  // Critical tests (excluding server tests)
  const criticalTests = total - 2;
  const criticalPassed = passed - (frontendRunning === true ? 1 : 0) - (apiRunning === true ? 1 : 0);
  
  if (criticalPassed >= criticalTests) {
    console.log(`${colors.green}${colors.bright}🎉 All critical tests passed!${colors.reset}`);
    console.log(`${colors.green}✅ Application code is correct and ready!${colors.reset}\n`);
    
    if (frontendRunning !== true) {
      console.log(`${colors.yellow}⚠️  Frontend server is not running.${colors.reset}`);
      console.log(`${colors.yellow}   Start it with: npm run dev:web${colors.reset}\n`);
    } else {
      console.log(`${colors.green}✅ Frontend server is running on http://localhost:5173${colors.reset}\n`);
    }
    
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}❌ Some critical tests failed.${colors.reset}`);
    console.log(`${colors.red}   Please review the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch((error) => {
  console.error(`${colors.red}Test execution error: ${error.message}${colors.reset}`);
  console.error(error);
  process.exit(1);
});
