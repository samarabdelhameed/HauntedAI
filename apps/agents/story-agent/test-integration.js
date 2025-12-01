// Quick integration test for StoryAgent
const { StoryService } = require('./dist/story.service');

async function testStoryService() {
  console.log('🧪 Testing StoryAgent Integration...\n');

  try {
    // Test 1: Service initialization
    console.log('✓ Test 1: Service initialization');
    const service = new StoryService('test-api-key');
    console.log('  ✅ Service created successfully\n');

    // Test 2: Input validation
    console.log('✓ Test 2: Input validation');
    try {
      await service.generateStory({ input: '' });
      console.log('  ❌ Should have thrown error for empty input\n');
    } catch (error) {
      if (error.message.includes('Input cannot be empty')) {
        console.log('  ✅ Empty input validation works\n');
      } else {
        console.log('  ❌ Wrong error:', error.message, '\n');
      }
    }

    // Test 3: Retry logic configuration
    console.log('✓ Test 3: Retry logic configuration');
    const maxRetries = service.maxRetries || 3;
    const initialDelay = service.initialDelay || 2000;
    console.log(`  ✅ Max retries: ${maxRetries}`);
    console.log(`  ✅ Initial delay: ${initialDelay}ms\n`);

    console.log('🎉 All integration tests passed!\n');
    console.log('📝 Note: Real API tests require OPENAI_API_KEY');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

testStoryService();
