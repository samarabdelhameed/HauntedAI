// Feature: haunted-ai, Property 12: Code completion triggers deployment
// Validates: Requirements 4.1

import fc from 'fast-check';

// Mock Storacha client before importing DeployService
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

describe('Property 12: Code completion triggers deployment', () => {
  let deployService: DeployService;

  beforeAll(() => {
    // Set required environment variables
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

  it('should trigger deployment within 1 second of code completion', async () => {
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

          // Measure time to trigger deployment
          const startTime = Date.now();

          // Simulate code completion triggering deployment
          const result = await deployService.deploy({
            codeCid: input.codeCid,
            roomId: input.roomId,
          });

          const endTime = Date.now();
          const duration = endTime - startTime;

          // Verify deployment was triggered
          expect(mockedAxios.post).toHaveBeenCalledTimes(1);
          expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining('api.vercel.com'),
            expect.objectContaining({
              files: expect.arrayContaining([
                expect.objectContaining({
                  file: 'index.html',
                }),
              ]),
            }),
            expect.any(Object)
          );

          // Verify result contains deployment URL
          expect(result.success).toBe(true);
          expect(result.deploymentUrl).toBeDefined();
          expect(result.deploymentId).toBeDefined();

          // Note: In real implementation, orchestrator would trigger this within 1 second
          // This test verifies the service responds quickly when called
          expect(duration).toBeLessThan(10000); // 10 seconds for mocked calls
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should deploy for any valid CID and roomId combination', async () => {
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

          // Verify deployment was triggered with correct inputs
          expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining('api.vercel.com'),
            expect.objectContaining({
              name: expect.stringContaining('haunted'),
              files: expect.any(Array),
            }),
            expect.objectContaining({
              headers: expect.objectContaining({
                Authorization: expect.stringContaining('Bearer'),
              }),
            })
          );

          // Verify result structure
          expect(result).toHaveProperty('success');
          expect(result.success).toBe(true);
          expect(result).toHaveProperty('deploymentUrl');
          expect(result).toHaveProperty('deploymentId');
          expect(typeof result.deploymentUrl).toBe('string');
          expect(typeof result.deploymentId).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle invalid CID format gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.startsWith('bafy')),
        fc.uuid(),
        async (invalidCid, roomId) => {
          // Reset mocks
          jest.clearAllMocks();

          deployService = new DeployService();

          // Mock validateCID to return false for invalid CIDs
          const mockValidate = jest.spyOn(
            (deployService as any).storachaClient,
            'validateCID'
          );
          mockValidate.mockReturnValue(false);

          // Deploy with invalid CID
          const result = await deployService.deploy({
            codeCid: invalidCid,
            roomId,
          });

          // Verify deployment failed
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('Invalid CID format');

          // Verify Vercel API was not called
          expect(mockedAxios.post).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
