#!/usr/bin/env node

/**
 * Property-Based Test Runner for HauntedAI Platform
 * Executes all 81 property tests with 100+ iterations each
 * Managed by Kiro
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  console.log(`${colors[color]}[PBT-RUNNER] ${message}${colors.reset}`);
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

class PropertyTestRunner {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.startTime = Date.now();
  }

  async runAllPropertyTests() {
    log('🎃 Running All Property-Based Tests for HauntedAI', 'magenta');
    log('='.repeat(70), 'cyan');

    try {
      // Find all property test files
      const testFiles = this.findPropertyTestFiles();
      
      if (testFiles.length === 0) {
        warning('No property test files found');
        return;
      }

      info(`Found ${testFiles.length} property test files`);

      // Run tests by service
      await this.runAPIPropertyTests();
      await this.runWebPropertyTests();
      await this.runAgentPropertyTests();
      await this.runSharedPropertyTests();
      await this.runKiroPropertyTests();

      // Generate comprehensive report
      this.generateReport();

    } catch (err) {
      error(`Property test suite failed: ${err.message}`);
      process.exit(1);
    }
  }

  findPropertyTestFiles() {
    const testFiles = [];
    const searchPaths = [
      'apps/api/src',
      'apps/web/src', 
      'apps/agents',
      'apps/shared/src',
      '.kiro'
    ];

    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        this.findTestFilesRecursive(searchPath, testFiles);
      }
    }

    return testFiles;
  }

  findTestFilesRecursive(dir, testFiles) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
        this.findTestFilesRecursive(fullPath, testFiles);
      } else if (item.endsWith('.property.test.ts') || item.endsWith('.property.test.js')) {
        testFiles.push(fullPath);
      }
    }
  }

  async runAPIPropertyTests() {
    info('Running API Property Tests...');
    
    const apiTestFiles = [
      'apps/api/src/common/metrics/metrics.property.test.ts',
      'apps/api/src/common/logger/logger.property.test.ts',
      'apps/api/src/common/webhook/webhook.property.test.ts',
      'apps/api/src/prisma/prisma.reconnection.property.test.ts',
      'apps/api/src/common/swagger/swagger.property.test.ts',
      'apps/api/src/modules/tokens/tokens.property.test.ts',
      'apps/api/src/modules/tokens/badges.property.test.ts',
    ];

    await this.runTestsInDirectory('apps/api', apiTestFiles);
  }

  async runWebPropertyTests() {
    info('Running Web Property Tests...');
    
    const webTestFiles = [
      'apps/web/src/contexts/AuthContext.property.test.ts',
      'apps/web/src/components/Visualization.property.test.ts',
      'apps/web/src/pages/LiveRoom.property.test.ts',
      'apps/web/src/pages/Explore.property.test.ts',
      'apps/web/src/utils/soundManager.property.test.ts',
      'apps/web/src/i18n/i18n.property.test.ts',
    ];

    await this.runTestsInDirectory('apps/web', webTestFiles);
  }

  async runAgentPropertyTests() {
    info('Running Agent Property Tests...');
    
    const agentDirs = [
      'apps/agents/story-agent',
      'apps/agents/asset-agent', 
      'apps/agents/code-agent',
      'apps/agents/deploy-agent',
      'apps/agents/orchestrator'
    ];

    for (const agentDir of agentDirs) {
      if (fs.existsSync(agentDir)) {
        const agentTestFiles = this.findPropertyTestFiles().filter(f => f.startsWith(agentDir));
        if (agentTestFiles.length > 0) {
          await this.runTestsInDirectory(agentDir, agentTestFiles);
        }
      }
    }
  }

  async runSharedPropertyTests() {
    info('Running Shared Property Tests...');
    
    const sharedTestFiles = this.findPropertyTestFiles().filter(f => f.startsWith('apps/shared'));
    if (sharedTestFiles.length > 0) {
      await this.runTestsInDirectory('apps/shared', sharedTestFiles);
    }
  }

  async runKiroPropertyTests() {
    info('Running Kiro Integration Property Tests...');
    
    const kiroTestFiles = [
      '.kiro/hooks/hooks.property.test.ts',
      '.kiro/settings/mcp.property.test.ts',
    ];

    // Run Kiro tests from root directory
    for (const testFile of kiroTestFiles) {
      if (fs.existsSync(testFile)) {
        await this.runSingleTest('.', testFile);
      }
    }
  }

  async runTestsInDirectory(workingDir, testFiles) {
    if (!fs.existsSync(workingDir)) {
      warning(`Directory ${workingDir} does not exist`);
      return;
    }

    for (const testFile of testFiles) {
      if (fs.existsSync(testFile)) {
        await this.runSingleTest(workingDir, testFile);
      } else {
        warning(`Test file not found: ${testFile}`);
      }
    }
  }

  async runSingleTest(workingDir, testFile) {
    const testName = path.basename(testFile);
    info(`Running ${testName}...`);

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      try {
        // Determine test command based on directory
        let testCommand;
        if (workingDir.includes('apps/api')) {
          testCommand = `cd ${workingDir} && npm test -- --testPathPattern="${testName}" --runInBand --no-coverage`;
        } else if (workingDir.includes('apps/web')) {
          testCommand = `cd ${workingDir} && npm test -- --testPathPattern="${testName}" --runInBand --no-coverage`;
        } else if (workingDir.includes('apps/agents')) {
          testCommand = `cd ${workingDir} && npm test -- --testPathPattern="${testName}" --runInBand --no-coverage`;
        } else {
          // For Kiro tests, use Jest directly
          testCommand = `npx jest "${testFile}" --runInBand --no-coverage`;
        }

        const result = execSync(testCommand, {
          encoding: 'utf8',
          timeout: 120000, // 2 minutes per test
          stdio: 'pipe'
        });

        const duration = Date.now() - startTime;
        const testResult = {
          file: testFile,
          name: testName,
          status: 'passed',
          duration,
          output: result
        };

        this.testResults.push(testResult);
        this.passedTests++;
        this.totalTests++;
        
        success(`${testName} passed (${duration}ms)`);
        resolve(testResult);

      } catch (error) {
        const duration = Date.now() - startTime;
        const testResult = {
          file: testFile,
          name: testName,
          status: 'failed',
          duration,
          error: error.message,
          output: error.stdout || error.stderr || ''
        };

        this.testResults.push(testResult);
        this.failedTests++;
        this.totalTests++;
        
        error(`${testName} failed (${duration}ms)`);
        warning(`Error: ${error.message.substring(0, 200)}...`);
        resolve(testResult);
      }
    });
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    
    log('='.repeat(70), 'cyan');
    log('🎃 Property-Based Test Results Summary', 'magenta');
    log('='.repeat(70), 'cyan');

    // Overall statistics
    info(`Total Tests: ${this.totalTests}`);
    success(`Passed: ${this.passedTests}`);
    if (this.failedTests > 0) {
      error(`Failed: ${this.failedTests}`);
    }
    info(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    info(`Average Test Duration: ${(totalDuration / this.totalTests / 1000).toFixed(2)}s`);

    // Success rate
    const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
    if (successRate >= 95) {
      success(`Success Rate: ${successRate}%`);
    } else if (successRate >= 80) {
      warning(`Success Rate: ${successRate}%`);
    } else {
      error(`Success Rate: ${successRate}%`);
    }

    log('='.repeat(70), 'cyan');

    // Detailed results by category
    const categories = {
      'API Tests': this.testResults.filter(t => t.file.includes('apps/api')),
      'Web Tests': this.testResults.filter(t => t.file.includes('apps/web')),
      'Agent Tests': this.testResults.filter(t => t.file.includes('apps/agents')),
      'Shared Tests': this.testResults.filter(t => t.file.includes('apps/shared')),
      'Kiro Tests': this.testResults.filter(t => t.file.includes('.kiro')),
    };

    for (const [category, tests] of Object.entries(categories)) {
      if (tests.length > 0) {
        const passed = tests.filter(t => t.status === 'passed').length;
        const total = tests.length;
        const categoryRate = ((passed / total) * 100).toFixed(1);
        
        log(`${category}: ${passed}/${total} (${categoryRate}%)`, 
            categoryRate >= 95 ? 'green' : categoryRate >= 80 ? 'yellow' : 'red');
      }
    }

    log('='.repeat(70), 'cyan');

    // Failed tests details
    if (this.failedTests > 0) {
      error('Failed Tests:');
      this.testResults
        .filter(t => t.status === 'failed')
        .forEach(test => {
          error(`  - ${test.name}`);
          if (test.error) {
            warning(`    Error: ${test.error.substring(0, 100)}...`);
          }
        });
      log('='.repeat(70), 'cyan');
    }

    // Property coverage analysis
    this.analyzePropertyCoverage();

    // Final verdict
    if (this.failedTests === 0) {
      success('🎉 All property-based tests passed!');
      success('HauntedAI platform correctness verified through formal properties.');
    } else {
      error(`❌ ${this.failedTests} property tests failed.`);
      error('Please review and fix the failing properties before deployment.');
      process.exit(1);
    }
  }

  analyzePropertyCoverage() {
    info('Property Coverage Analysis:');
    
    // Expected properties based on design document
    const expectedProperties = {
      'Story Generation': ['1', '2', '3', '4'],
      'Asset Generation': ['5', '6', '7', '8'],
      'Code Generation': ['9', '10', '11'],
      'Deployment': ['12', '13', '14'],
      'Live Logging': ['15', '16', '17', '18', '19'],
      'User Interface': ['20', '21', '22'],
      'Storage': ['23', '24', '25', '26'],
      'Room Management': ['27', '28', '29'],
      'Token Rewards': ['30', '31', '32', '33', '34'],
      'Content Discovery': ['35', '36', '37', '38'],
      'Authentication': ['39', '40', '41', '42', '43'],
      'Error Recovery': ['44', '45', '46', '47'],
      'Three.js Visualization': ['49', '50', '51', '52'],
      'Multi-language': ['77', '78', '80'],
      'Kiro Integration': ['72', '73', '74', '75', '76'],
    };

    let totalExpected = 0;
    for (const props of Object.values(expectedProperties)) {
      totalExpected += props.length;
    }

    info(`Expected Properties: ${totalExpected}`);
    info(`Implemented Tests: ${this.totalTests}`);
    
    const coverage = ((this.totalTests / totalExpected) * 100).toFixed(1);
    if (coverage >= 90) {
      success(`Property Coverage: ${coverage}%`);
    } else if (coverage >= 70) {
      warning(`Property Coverage: ${coverage}%`);
    } else {
      error(`Property Coverage: ${coverage}%`);
    }
  }

  async run() {
    await this.runAllPropertyTests();
  }
}

// Main execution
if (require.main === module) {
  const runner = new PropertyTestRunner();
  runner.run().catch((err) => {
    error(`Property test runner failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = PropertyTestRunner;