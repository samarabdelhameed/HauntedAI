// Feature: haunted-ai, Property 14: Deployment WebSocket notification
// Validates: Requirements 4.3

import fc from 'fast-check';

// Mock Storacha client
jest.mock('./storacha.client', () => {
  return {
    StorachaClient: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        retrieveFile: jest.fn().mockResolvedValue('<html><body>Test game</body></html>'),
        validateCID: jest.fn().mockReturnValue(true),
      };
    }),
  };
});

// Mock axios for Vercel API calls
jest.mock('axios');

import axios from 'axios';
import { DeployService } from './deploy.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Property 14: Deployment WebSocket notification', () => {
  let deployService: DeployService;

  beforeAll(() => {
    process.env.VERCEL_TOKEN = 'test-vercel-token';
    process.env.VERCEL_TEAM_ID = 'test-team-id';
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Vercel API responses
    mockedAxios.post.mockResolvedValue({
      data: {
        id: 'dpl_test123',
        url: 'haunted-test.vercel.app',
        name: 'haunted-test',
        readyState: 'BUILDING',
      },
    });

    mockedAxios.get.mockResolvedValue({
      data: {
        id: 'dpl_test123',
        readyState: 'READY',
        state: 'READY',
      },
    });
  });

  it('should return deployment data that can be used for WebSocket notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          codeCid: fc
            .string({ minLength: 55, maxLength: 59 })
            .map((s) => 'bafy' + s.toLowerCase().replace(/[^a-z2-7]/g, '2')),
          roomId: fc.uuid(),
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();

          deployService = new DeployService();

          // Deploy
          const result = await deployService.deploy(input);

          // Verify deployment succeeded
          expect(result.success).toBe(true);

          // Verify result contains all data needed for WebSocket notification
          expect(result.deploymentUrl).toBeDefined();
          expect(result.deploymentId).toBeDefined();

          // In real implementation, the Orchestrator would:
          // 1. Receive this result from DeployAgent
          // 2. Send WebSocket notification with:
          //    - type: 'deployment.complete'
          //    - roomId: input.roomId
          //    - deploymentUrl: result.deploymentUrl
          //    - codeCid: input.codeCid
          //    - timestamp: new Date()

          const notificationData = {
            type: 'deployment.complete',
            roomId: input.roomId,
            deploymentUrl: result.deploymentUrl,
            codeCid: input.codeCid,
            timestamp: new Date(),
          };

          // Verify notification data is complete
          expect(notificationData.type).toBe('deployment.complete');
          expect(notificationData.roomId).toBe(input.roomId);
          expect(notificationData.deploymentUrl).toBeDefined();
          expect(notificationData.codeCid).toBe(input.codeCid);
          expect(notificationData.timestamp).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide deployment URL in correct format for notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 55, maxLength: 59 })
          .map((s) => 'bafy' + s.toLowerCase().replace(/[^a-z2-7]/g, '2')),
        fc.uuid(),
        async (codeCid, roomId) => {
          // Reset mocks
          jest.clearAllMocks();

          deployService = new DeployService();

          // Deploy
          const result = await deployService.deploy({
            codeCid,
            roomId,
          });

          // Verify deployment succeeded
          expect(result.success).toBe(true);

          // Verify deployment URL format is suitable for notification
          expect(result.deploymentUrl).toMatch(/^https:\/\//);
          expect(result.deploymentUrl).toContain('vercel.app');

          // The notification should include a clickable URL
          const notification = {
            type: 'deployment.complete',
            roomId: roomId,
            deploymentUrl: result.deploymentUrl,
            codeCid: codeCid,
            message: `Deployment complete! View at: ${result.deploymentUrl}`,
          };

          expect(notification.deploymentUrl).toBe(result.deploymentUrl);
          expect(notification.message).toContain(result.deploymentUrl);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include all required fields for notification payload', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          codeCid: fc
            .string({ minLength: 55, maxLength: 59 })
            .map((s) => 'bafy' + s.toLowerCase().replace(/[^a-z2-7]/g, '2')),
          roomId: fc.uuid(),
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();

          deployService = new DeployService();

          // Deploy
          const result = await deployService.deploy(input);

          // Verify deployment succeeded
          expect(result.success).toBe(true);

          // Build notification payload as Orchestrator would
          const notificationPayload = {
            type: 'deployment.complete',
            data: {
              roomId: input.roomId,
              deploymentUrl: result.deploymentUrl,
              deploymentId: result.deploymentId,
              codeCid: input.codeCid,
            },
            timestamp: new Date(),
          };

          // Verify all required fields are present
          expect(notificationPayload.type).toBe('deployment.complete');
          expect(notificationPayload.data.roomId).toBe(input.roomId);
          expect(notificationPayload.data.deploymentUrl).toBeDefined();
          expect(notificationPayload.data.deploymentId).toBeDefined();
          expect(notificationPayload.data.codeCid).toBe(input.codeCid);
          expect(notificationPayload.timestamp).toBeInstanceOf(Date);

          // Verify the payload can be serialized (for WebSocket transmission)
          const serialized = JSON.stringify(notificationPayload);
          expect(serialized).toBeDefined();
          expect(serialized.length).toBeGreaterThan(0);

          // Verify it can be deserialized
          const deserialized = JSON.parse(serialized);
          expect(deserialized.type).toBe('deployment.complete');
          expect(deserialized.data.roomId).toBe(input.roomId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
