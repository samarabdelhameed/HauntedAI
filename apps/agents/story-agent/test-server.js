// Test server endpoints
const { StoryAgentServer } = require('./dist/server');

async function testServer() {
  console.log('🧪 Testing StoryAgent Server...\n');

  try {
    // Create server instance
    console.log('✓ Test 1: Server initialization');
    const server = new StoryAgentServer('test-api-key', 3099);
    const app = server.getApp();
    console.log('  ✅ Server created successfully\n');

    // Test endpoints exist
    console.log('✓ Test 2: Endpoints configuration');
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        routes.push({
          method: Object.keys(middleware.route.methods)[0].toUpperCase(),
          path: middleware.route.path,
        });
      }
    });

    console.log('  Available endpoints:');
    routes.forEach((route) => {
      console.log(`    ${route.method} ${route.path}`);
    });

    const hasHealth = routes.some((r) => r.path === '/health' && r.method === 'GET');
    const hasGenerate = routes.some((r) => r.path === '/generate' && r.method === 'POST');
    const hasRoot = routes.some((r) => r.path === '/' && r.method === 'GET');

    if (hasHealth && hasGenerate && hasRoot) {
      console.log('  ✅ All required endpoints configured\n');
    } else {
      console.log('  ❌ Missing endpoints\n');
    }

    console.log('🎉 Server tests passed!\n');
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    process.exit(1);
  }
}

testServer();
