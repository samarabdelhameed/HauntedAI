#!/usr/bin/env node

/**
 * End-to-End Test for HauntedAI Agents
 * Tests the complete workflow with real APIs
 */

const axios = require('axios');

// Configuration
const STORY_AGENT_URL = process.env.STORY_AGENT_URL || 'http://localhost:3002';
const ASSET_AGENT_URL = process.env.ASSET_AGENT_URL || 'http://localhost:3003';
const CODE_AGENT_URL = process.env.CODE_AGENT_URL || 'http://localhost:3004';
const DEPLOY_AGENT_URL = process.env.DEPLOY_AGENT_URL || 'http://localhost:3005';

// Test data
const TEST_INPUT = 'A haunted mansion on a dark hill';

console.log('🎃 HauntedAI End-to-End Test\n');
console.log('Testing complete agent workflow with REAL APIs...\n');

async function testStoryAgent() {
  console.log('📖 Step 1: Testing StoryAgent...');
  
  try {
    const response = await axios.post(`${STORY_AGENT_URL}/generate`, {
      input: TEST_INPUT
    }, {
      timeout: 60000 // 60 seconds
    });

    if (!response.data.story) {
      throw new Error('No story returned');
    }

    if (!response.data.cid) {
      throw new Error('No CID returned');
    }

    console.log('✅ StoryAgent SUCCESS');
    console.log(`   Story length: ${response.data.story.length} characters`);
    console.log(`   CID: ${response.data.cid}`);
    console.log(`   Story preview: ${response.data.story.substring(0, 100)}...`);
    
    return response.data;
  } catch (error) {
    console.error('❌ StoryAgent FAILED:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    throw error;
  }
}

async fun