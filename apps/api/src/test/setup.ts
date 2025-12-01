// Test setup utilities
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/hauntedai_test',
    },
  },
});

// Clean database before each test
export async function cleanDatabase() {
  await prisma.badge.deleteMany();
  await prisma.tokenTransaction.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
}

// Close database connection after all tests
export async function closeDatabaseConnection() {
  await prisma.$disconnect();
}

// Create test user
export async function createTestUser(overrides = {}) {
  return await prisma.user.create({
    data: {
      did: `did:key:test${Date.now()}${Math.random()}`,
      username: `testuser${Date.now()}${Math.random()}`,
      walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
      ...overrides,
    },
  });
}

// Create test room
export async function createTestRoom(userId: string, overrides = {}) {
  return await prisma.room.create({
    data: {
      ownerId: userId,
      inputText: 'Test spooky story',
      status: 'idle',
      ...overrides,
    },
  });
}
