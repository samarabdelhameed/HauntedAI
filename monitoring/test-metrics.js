#!/usr/bin/env node

/**
 * Test script for HauntedAI metrics endpoints
 * Managed by Kiro
 */

const http = require('http');

const services = [
  { name: 'API Gateway', host: 'localhost', port: 3001 },
  { name: 'StoryAgent', host: 'localhost', port: 3002 },
  { name: 'AssetAgent', host: 'localhost', port: 3003 },
  { name: 'CodeAgent', host: 'localhost', port: 3004 },
  { name: 'DeployAgent', host: 'localhost', port: 3005 },
];

async function testMetricsEndpoint(service) {
  return new Promise((resolve) => {
    const options = {
      hostname: service.host,
      port: service.port,
      path: '/metrics',
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200 && data.includes('hauntedai_');
        resolve({
          service: service.name,
          status: success ? 'OK' : 'FAIL',
          statusCode: res.statusCode,
          hasMetrics: data.includes('hauntedai_'),
          metricsCount: (data.match(/hauntedai_/g) || []).length,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        service: service.name,
        status: 'ERROR',
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        service: service.name,
        status: 'TIMEOUT',
        error: 'Request timeout',
      });
    });

    req.end();
  });
}

async function testAllServices() {
  console.log('🔍 Testing HauntedAI Metrics Endpoints...\n');
  
  const results = await Promise.all(
    services.map(service => testMetricsEndpoint(service))
  );
  
  console.log('Results:');
  console.log('========');
  
  results.forEach(result => {
    const status = result.status === 'OK' ? '✅' : '❌';
    console.log(`${status} ${result.service.padEnd(15)} - ${result.status}`);
    
    if (result.statusCode) {
      console.log(`   Status Code: ${result.statusCode}`);
    }
    
    if (result.metricsCount) {
      console.log(`   Metrics Found: ${result.metricsCount}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    console.log('');
  });
  
  const successCount = results.filter(r => r.status === 'OK').length;
  console.log(`Summary: ${successCount}/${results.length} services responding with metrics`);
  
  if (successCount === results.length) {
    console.log('🎉 All metrics endpoints are working!');
    console.log('\nNext steps:');
    console.log('1. Start Prometheus: docker-compose up prometheus -d');
    console.log('2. Start Grafana: docker-compose up grafana -d');
    console.log('3. Access Grafana: http://localhost:3010 (admin/hauntedai2024)');
  } else {
    console.log('⚠️  Some services are not responding. Make sure all services are running.');
  }
}

testAllServices().catch(console.error);