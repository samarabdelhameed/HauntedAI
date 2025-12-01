// Integration Test - Token Rewards with Real Database
// Feature: haunted-ai, Token Rewards Integration
// Validates: Requirements 9.1, 9.2, 9.5

import { Test, TestingModule } from '@nestjs/testing';

import { TokensService } from '../modules/tokens/tokens.service';
import { PrismaService } from '../prisma/prisma.service';

import { prisma, cleanDatabase, closeDatabaseConnection, createTestUser } from './setup';

describe('Token Rewards Integration Tests (Real Database)', () => {
  let service: TokensService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabaseConnection();
  });

  describe('Property 30: Upload reward amount', () => {
    it('should reward exactly 10 tokens for content upload', async () => {
      // Create real user
      const user = await createTestUser();

      // Reward user for upload
      const transaction = await service.rewardUser(user.id, 10, 'upload_story');

      // Verify transaction was created with correct amount
      expect(transaction.amount).toBe(BigInt(10));
      expect(transaction.userId).toBe(user.id);
      expect(transaction.reason).toBe('upload_story');

      // Verify in database
      const dbTransaction = await prisma.tokenTransaction.findUnique({
        where: { id: transaction.id },
      });

      expect(dbTransaction).not.toBeNull();
      expect(dbTransaction!.amount).toBe(BigInt(10));
    });

    it('should create multiple upload rewards correctly', async () => {
      const user = await createTestUser();

      // Create multiple upload rewards
      await service.rewardUser(user.id, 10, 'upload_story');
      await service.rewardUser(user.id, 10, 'upload_image');
      await service.rewardUser(user.id, 10, 'upload_code');

      // Get balance
      const balance = await service.getBalance(user.did);

      // Should have 30 tokens total (3 uploads × 10 tokens)
      expect(balance.balance).toBe(30);
      expect(balance.transactionCount).toBe(3);
    });
  });

  describe('Property 31: View reward amount', () => {
    it('should reward exactly 1 token for content view', async () => {
      // Create real user
      const user = await createTestUser();

      // Reward user for view
      const transaction = await service.rewardUser(user.id, 1, 'view_story');

      // Verify transaction was created with correct amount
      expect(transaction.amount).toBe(BigInt(1));
      expect(transaction.userId).toBe(user.id);
      expect(transaction.reason).toBe('view_story');

      // Verify in database
      const dbTransaction = await prisma.tokenTransaction.findUnique({
        where: { id: transaction.id },
      });

      expect(dbTransaction).not.toBeNull();
      expect(dbTransaction!.amount).toBe(BigInt(1));
    });

    it('should create multiple view rewards correctly', async () => {
      const user = await createTestUser();

      // Create multiple view rewards
      await service.rewardUser(user.id, 1, 'view_story');
      await service.rewardUser(user.id, 1, 'view_image');
      await service.rewardUser(user.id, 1, 'view_code');
      await service.rewardUser(user.id, 1, 'view_story');
      await service.rewardUser(user.id, 1, 'view_image');

      // Get balance
      const balance = await service.getBalance(user.did);

      // Should have 5 tokens total (5 views × 1 token)
      expect(balance.balance).toBe(5);
      expect(balance.transactionCount).toBe(5);
    });
  });

  describe('Property 34: Balance calculation correctness', () => {
    it('should calculate balance as sum of all transactions', async () => {
      const user = await createTestUser();

      // Create various transactions
      await service.rewardUser(user.id, 10, 'upload_story'); // +10
      await service.rewardUser(user.id, 1, 'view_story'); // +1
      await service.rewardUser(user.id, 10, 'upload_image'); // +10
      await service.rewardUser(user.id, 1, 'view_image'); // +1
      await service.rewardUser(user.id, 50, 'referral'); // +50

      // Get balance
      const balance = await service.getBalance(user.did);

      // Should have 72 tokens total
      expect(balance.balance).toBe(72);
      expect(balance.transactionCount).toBe(5);
      expect(balance.userId).toBe(user.id);
      expect(balance.did).toBe(user.did);
      expect(balance.username).toBe(user.username);
    });

    it('should handle empty transaction history with zero balance', async () => {
      const user = await createTestUser();

      // Get balance without any transactions
      const balance = await service.getBalance(user.did);

      // Should have 0 tokens
      expect(balance.balance).toBe(0);
      expect(balance.transactionCount).toBe(0);
    });

    it('should maintain balance consistency across multiple queries', async () => {
      const user = await createTestUser();

      // Create transactions
      await service.rewardUser(user.id, 10, 'upload');
      await service.rewardUser(user.id, 5, 'bonus');
      await service.rewardUser(user.id, 1, 'view');

      // Query balance multiple times
      const balance1 = await service.getBalance(user.did);
      const balance2 = await service.getBalance(user.did);
      const balance3 = await service.getBalance(user.did);

      // All queries should return same balance
      expect(balance1.balance).toBe(16);
      expect(balance2.balance).toBe(16);
      expect(balance3.balance).toBe(16);
      expect(balance1.transactionCount).toBe(3);
      expect(balance2.transactionCount).toBe(3);
      expect(balance3.transactionCount).toBe(3);
    });

    it('should correctly sum large number of transactions', async () => {
      const user = await createTestUser();

      // Create 100 transactions
      let expectedTotal = 0;
      for (let i = 0; i < 100; i++) {
        const amount = (i % 3 === 0) ? 10 : 1; // Mix of uploads and views
        await service.rewardUser(user.id, amount, `transaction_${i}`);
        expectedTotal += amount;
      }

      // Get balance
      const balance = await service.getBalance(user.did);

      // Should match expected total
      expect(balance.balance).toBe(expectedTotal);
      expect(balance.transactionCount).toBe(100);
    });

    it('should handle multiple users independently', async () => {
      // Create multiple users
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const user3 = await createTestUser();

      // Give different amounts to each user
      await service.rewardUser(user1.id, 10, 'upload');
      await service.rewardUser(user1.id, 10, 'upload');
      await service.rewardUser(user1.id, 1, 'view');

      await service.rewardUser(user2.id, 50, 'referral');
      await service.rewardUser(user2.id, 1, 'view');

      await service.rewardUser(user3.id, 10, 'upload');

      // Get balances
      const balance1 = await service.getBalance(user1.did);
      const balance2 = await service.getBalance(user2.did);
      const balance3 = await service.getBalance(user3.did);

      // Each user should have correct independent balance
      expect(balance1.balance).toBe(21); // 10 + 10 + 1
      expect(balance2.balance).toBe(51); // 50 + 1
      expect(balance3.balance).toBe(10); // 10
    });

    it('should retrieve transaction history correctly', async () => {
      const user = await createTestUser();

      // Create transactions with different reasons
      await service.rewardUser(user.id, 10, 'upload_story');
      await service.rewardUser(user.id, 1, 'view_story');
      await service.rewardUser(user.id, 10, 'upload_image');
      await service.rewardUser(user.id, 50, 'referral');

      // Get transaction history
      const transactions = await service.getTransactions(user.did);

      // Should have all 4 transactions
      expect(transactions).toHaveLength(4);

      // Verify transaction details
      const reasons = transactions.map((tx) => tx.reason);
      expect(reasons).toContain('upload_story');
      expect(reasons).toContain('view_story');
      expect(reasons).toContain('upload_image');
      expect(reasons).toContain('referral');

      // Verify amounts
      const amounts = transactions.map((tx) => Number(tx.amount));
      expect(amounts).toContain(10);
      expect(amounts).toContain(1);
      expect(amounts).toContain(50);
    });

    it('should order transactions by creation date (newest first)', async () => {
      const user = await createTestUser();

      // Create transactions with delays
      await service.rewardUser(user.id, 10, 'first');
      await new Promise((resolve) => setTimeout(resolve, 10));

      await service.rewardUser(user.id, 20, 'second');
      await new Promise((resolve) => setTimeout(resolve, 10));

      await service.rewardUser(user.id, 30, 'third');

      // Get transaction history
      const transactions = await service.getTransactions(user.did);

      // Should be ordered newest first
      expect(transactions[0].reason).toBe('third');
      expect(transactions[1].reason).toBe('second');
      expect(transactions[2].reason).toBe('first');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle complete user journey', async () => {
      // User signs up
      const user = await createTestUser();

      // User uploads story
      await service.rewardUser(user.id, 10, 'upload_story');
      let balance = await service.getBalance(user.did);
      expect(balance.balance).toBe(10);

      // User uploads image
      await service.rewardUser(user.id, 10, 'upload_image');
      balance = await service.getBalance(user.did);
      expect(balance.balance).toBe(20);

      // User views content 5 times
      for (let i = 0; i < 5; i++) {
        await service.rewardUser(user.id, 1, 'view_content');
      }
      balance = await service.getBalance(user.did);
      expect(balance.balance).toBe(25);

      // User refers a friend
      await service.rewardUser(user.id, 50, 'referral');
      balance = await service.getBalance(user.did);
      expect(balance.balance).toBe(75);

      // Verify transaction count
      expect(balance.transactionCount).toBe(8);
    });

    it('should handle concurrent transactions', async () => {
      const user = await createTestUser();

      // Create multiple transactions concurrently
      await Promise.all([
        service.rewardUser(user.id, 10, 'upload_1'),
        service.rewardUser(user.id, 10, 'upload_2'),
        service.rewardUser(user.id, 1, 'view_1'),
        service.rewardUser(user.id, 1, 'view_2'),
        service.rewardUser(user.id, 50, 'referral'),
      ]);

      // Get balance
      const balance = await service.getBalance(user.did);

      // Should have all transactions
      expect(balance.balance).toBe(72); // 10 + 10 + 1 + 1 + 50
      expect(balance.transactionCount).toBe(5);
    });
  });
});
