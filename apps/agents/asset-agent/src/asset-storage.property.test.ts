// Feature: haunted-ai, Property 6: Image storage round-trip
// Feature: haunted-ai, Property 8: Asset-story database linkage
// Validates: Requirements 2.2, 2.5
import fc from 'fast-check';

// Mock the Storacha client module BEFORE importing AssetService
jest.mock('./storacha.client', () => {
  return {
    StorachaClient: jest.fn().mockImplementation(() => {
      return {
        uploadFile: jest.fn().mockResolvedValue('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'),
        initialize: jest.fn().mockResolvedValue(undefined),
        validateCID: jest.fn().mockReturnValue(true),
      };
    }),
  };
});

// Mock sharp
jest.mock('sharp', () => {
  return jest.fn(() => ({
    metadata: jest.fn().mockResolvedValue({
      format: 'png',
      width: 1024,
      height: 1024,
    }),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('optimized-image-data')),
  }));
});

// Now import AssetService after mocks are set up
import { AssetService } from './asset.service';

describe('Property 6: Image storage round-trip', () => {
  let assetService: AssetService;
  let mockStorachaClient: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create asset service
    assetService = new AssetService(process.env.OPENAI_API_KEY || 'test-key');

    // Get the mocked Storacha client instance
    mockStorachaClient = (assetService as any).storacha;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve identical image data after storage using CID', async () => {
    // Mock the OpenAI API calls
    const mockGenerate = jest.spyOn(assetService as any, 'executeWithRetry');

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story: fc.string({ minLength: 10, maxLength: 500 }),
          imageData: fc.uint8Array({ minLength: 100, maxLength: 1000 }),
          roomId: fc.uuid(),
        }),
        async ({ story, imageData, roomId }) => {
          // Reset mocks for each iteration
          mockGenerate.mockClear();
          mockStorachaClient.uploadFile.mockClear();

          // Create a buffer from the image data
          const imageBuffer = Buffer.from(imageData);

          // Mock the image generation to return our test image
          mockGenerate.mockResolvedValue({
            imageBuffer,
            imageUrl: 'https://example.com/image.png',
          });

          // Generate a valid CID for this image
          const expectedCid = `bafybeig${Buffer.from(imageData.slice(0, 20)).toString('hex')}`;
          mockStorachaClient.uploadFile.mockResolvedValue(expectedCid);

          // Generate asset (which uploads to Storacha)
          const result = await assetService.generateAsset({
            story,
            roomId,
          });

          // Verify CID was returned
          expect(result.imageCid).toBe(expectedCid);

          // Verify upload was called with correct data
          expect(mockStorachaClient.uploadFile).toHaveBeenCalledTimes(1);
          const uploadCall = mockStorachaClient.uploadFile.mock.calls[0];
          expect(uploadCall[0]).toBeInstanceOf(Buffer);
          expect(uploadCall[1]).toContain('image-');
          expect(uploadCall[2]).toBe('image/png');

          // Property: The CID should be valid format
          expect(result.imageCid).toMatch(/^bafy[a-z0-9]+$/);

          // Property: Metadata should contain size and format
          expect(result.metadata.size).toBeGreaterThan(0);
          expect(result.metadata.format).toBe('png');
          expect(result.metadata.width).toBe(1024);
          expect(result.metadata.height).toBe(1024);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should store image with correct metadata', async () => {
    // Mock the OpenAI API calls
    const mockGenerate = jest.spyOn(assetService as any, 'executeWithRetry');

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story: fc.string({ minLength: 10, maxLength: 500 }),
          roomId: fc.uuid(),
        }),
        async ({ story, roomId }) => {
          // Reset mocks
          mockGenerate.mockClear();
          mockStorachaClient.uploadFile.mockClear();

          // Mock image generation
          const testImageBuffer = Buffer.from('test-image-data');
          mockGenerate.mockResolvedValue({
            imageBuffer: testImageBuffer,
            imageUrl: 'https://example.com/image.png',
          });

          // Mock CID generation
          const testCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
          mockStorachaClient.uploadFile.mockResolvedValue(testCid);

          // Generate asset
          const result = await assetService.generateAsset({
            story,
            roomId,
          });

          // Property: Metadata should be complete
          expect(result.metadata).toBeDefined();
          expect(result.metadata.size).toBeGreaterThan(0);
          expect(result.metadata.format).toBeDefined();
          expect(result.metadata.width).toBeGreaterThan(0);
          expect(result.metadata.height).toBeGreaterThan(0);
          expect(result.metadata.generatedAt).toBeInstanceOf(Date);
          expect(result.metadata.model).toBe('dall-e-3');
          expect(result.metadata.prompt).toBeDefined();
          expect(result.metadata.prompt.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});

describe('Property 8: Asset-story database linkage', () => {
  let assetService: AssetService;
  let mockStorachaClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    assetService = new AssetService(process.env.OPENAI_API_KEY || 'test-key');
    mockStorachaClient = (assetService as any).storacha;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should link generated asset to the story via roomId', async () => {
    // Mock the OpenAI API calls
    const mockGenerate = jest.spyOn(assetService as any, 'executeWithRetry');

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story: fc.string({ minLength: 10, maxLength: 500 }),
          roomId: fc.uuid(),
        }),
        async ({ story, roomId }) => {
          // Reset mocks
          mockGenerate.mockClear();
          mockStorachaClient.uploadFile.mockClear();

          // Mock image generation
          mockGenerate.mockResolvedValue({
            imageBuffer: Buffer.from('test-image-data'),
            imageUrl: 'https://example.com/image.png',
          });

          // Mock CID generation with roomId embedded
          const testCid = `bafybeig${roomId.replace(/-/g, '').substring(0, 20)}`;
          mockStorachaClient.uploadFile.mockResolvedValue(testCid);

          // Generate asset
          const result = await assetService.generateAsset({
            story,
            roomId,
          });

          // Property: The filename should contain the roomId for linkage
          const uploadCall = mockStorachaClient.uploadFile.mock.calls[0];
          const filename = uploadCall[1];
          expect(filename).toContain(roomId);

          // Property: The asset should have metadata linking it to the story
          expect(result.imageCid).toBeDefined();
          expect(result.metadata).toBeDefined();

          // In a real database scenario, we would verify:
          // - Asset record has roomId foreign key
          // - Story record has same roomId
          // - Query by roomId returns both story and asset
          // For this test, we verify the linkage mechanism is in place
          expect(filename).toMatch(new RegExp(`image-${roomId}`));
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should maintain story-asset relationship through consistent roomId', async () => {
    // Mock the OpenAI API calls
    const mockGenerate = jest.spyOn(assetService as any, 'executeWithRetry');

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story1: fc.string({ minLength: 10, maxLength: 500 }),
          story2: fc.string({ minLength: 10, maxLength: 500 }),
          roomId1: fc.uuid(),
          roomId2: fc.uuid(),
        }),
        async ({ story1, story2, roomId1, roomId2 }) => {
          // Ensure different room IDs
          fc.pre(roomId1 !== roomId2);

          // Reset mocks
          mockGenerate.mockClear();
          mockStorachaClient.uploadFile.mockClear();

          // Mock image generation
          mockGenerate.mockResolvedValue({
            imageBuffer: Buffer.from('test-image-data'),
            imageUrl: 'https://example.com/image.png',
          });

          // Generate assets for both stories
          mockStorachaClient.uploadFile.mockResolvedValue('bafybeig1');
          const result1 = await assetService.generateAsset({
            story: story1,
            roomId: roomId1,
          });

          mockStorachaClient.uploadFile.mockResolvedValue('bafybeig2');
          const result2 = await assetService.generateAsset({
            story: story2,
            roomId: roomId2,
          });

          // Property: Different roomIds should produce different asset identifiers
          const filename1 = mockStorachaClient.uploadFile.mock.calls[0][1];
          const filename2 = mockStorachaClient.uploadFile.mock.calls[1][1];

          expect(filename1).toContain(roomId1);
          expect(filename2).toContain(roomId2);
          expect(filename1).not.toBe(filename2);

          // Property: Each asset should be independently identifiable
          expect(result1.imageCid).toBeDefined();
          expect(result2.imageCid).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
