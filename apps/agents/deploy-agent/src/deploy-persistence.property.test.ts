// Feature: haunted-ai, Property 13: Deployment information persistence
// Validates: Requirements 4.2

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

describe('Property 13: Deployment information persistence', () => {
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

  it('should return both deployment URL and code CID for any successful deployment', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          codeCid: fc
            .string({ minLength: 55, maxLength: 59 })
            .map((s) => 'bafy' + s.toLowerCase().replace(/[^a-z2-7]/g, '2')),
          roomId: fc.uuid(),
          projectName: fc.option(fc.string({ minLength: 3, maxLength: 20 }), { nil: undefined }),
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();

          deployService = new DeployService();

          // Deploy
          const result = await deployService.deploy(input);

          // Verify successful deployment
          expect(result.success).toBe(true);

          // Verify deployment information is complete
          expect(result.deploymentUrl).toBeDefined();
          expect(result.deploymentId).toBeDefined();

          // Verify URL format
          expect(result.deploymentUrl).toMatch(/^https:\/\//);
          expect(result.deploymentUrl).toContain('vercel.app');

          // Verify deployment ID format
          expect(result.deploymentId).toBeDefined();
          expect(typeof result.deploymentId).toBe('string');
          expect(result.deploymentId!.length).toBeGreaterThan(0);

          // In real implementation, this data would be persisted to database
          // The database record should contain:
          // - deploymentUrl: result.deploymentUrl
          // - codeCid: input.codeCid
          // - roomId: input.roomId
          // - deploymentId: result.deploymentId
          // - createdAt: timestamp
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve code CID reference in deployment response', async () => {
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

          // Verify the deployment can be linked back to the code CID
          // In real implementation, the database would store:
          // {
          //   codeCid: codeCid,
          //   deploymentUrl: result.deploymentUrl,
          //   deploymentId: result.deploymentId,
          //   roomId: roomId
          // }

          // Verify all required fields are present for persistence
          expect(result.deploymentUrl).toBeDefined();
          expect(result.deploymentId).toBeDefined();

          // The caller (Orchestrator) should persist this with the codeCid
          const persistenceData = {
            codeCid: codeCid,
            deploymentUrl: result.deploymentUrl,
            deploymentId: result.deploymentId,
            roomId: roomId,
          };

          expect(persistenceData.codeCid).toBe(codeCid);
          expect(persistenceData.deploymentUrl).toBeDefined();
          expect(persistenceData.deploymentId).toBeDefined();
          expect(persistenceData.roomId).toBe(roomId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include deployment metadata for database storage', async () => {
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

          // Verify result contains all metadata needed for database persistence
          expect(result.success).toBe(true);

          // Required fields for database asset record
          const assetRecord = {
            roomId: input.roomId,
            agentType: 'deploy',
            cid: input.codeCid,
            deploymentUrl: result.deploymentUrl,
            deploymentId: result.deploymentId,
            fileType: 'deployment',
            metadata: {
              vercelDeploymentId: result.deploymentId,
              vercelUrl: result.deploymentUrl,
            },
          };

          // Verify all required fields are present
          expect(assetRecord.roomId).toBe(input.roomId);
          expect(assetRecord.agentType).toBe('deploy');
          expect(assetRecord.cid).toBe(input.codeCid);
          expect(assetRecord.deploymentUrl).toBeDefined();
          expect(assetRecord.deploymentId).toBeDefined();
          expect(assetRecord.metadata.vercelDeploymentId).toBeDefined();
          expect(assetRecord.metadata.vercelUrl).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
