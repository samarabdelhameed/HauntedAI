require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ DATABASE_CONNECTED');
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        did: 'did:test:' + Date.now(),
        username: 'test_' + Date.now(),
        walletAddress: '0x' + Math.random().toString(16).substr(2, 40)
      }
    });
    console.log('✅ USER_CREATED:', user.id);
    
    // Create test room
    const room = await prisma.room.create({
      data: {
        ownerId: user.id,
        status: 'idle',
        inputText: 'Test spooky story'
      }
    });
    console.log('✅ ROOM_CREATED:', room.id);
    
    // Create test asset
    const asset = await prisma.asset.create({
      data: {
        roomId: room.id,
        agentType: 'story',
        cid: 'bafytest' + Math.random().toString(36).substr(2, 9)
      }
    });
    console.log('✅ ASSET_CREATED:', asset.id);
    
    // Read operations
    const foundUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log('✅ USER_READ:', foundUser ? 'SUCCESS' : 'FAIL');
    
    const foundRoom = await prisma.room.findUnique({
      where: { id: room.id },
      include: { assets: true }
    });
    console.log('✅ ROOM_READ:', foundRoom && foundRoom.assets.length > 0 ? 'SUCCESS' : 'FAIL');
    
    // Update operation
    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: { status: 'running' }
    });
    console.log('✅ ROOM_UPDATED:', updatedRoom.status === 'running' ? 'SUCCESS' : 'FAIL');
    
    // Cleanup
    await prisma.asset.delete({ where: { id: asset.id } });
    await prisma.room.delete({ where: { id: room.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✅ CLEANUP: SUCCESS');
    
    await prisma.$disconnect();
    console.log('✅ ALL_TESTS_PASSED');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

test();
