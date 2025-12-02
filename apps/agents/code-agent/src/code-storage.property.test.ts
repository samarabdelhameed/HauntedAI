// Feature: haunted-ai, Property 11: Code storage round-trip
// Validates: Requirements 3.4

import fc from 'fast-check';

// Mock Storacha client before importing CodeService
jest.mock('./storacha.client', () => {
  return {
    StorachaClient: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        uploadFile: jest
          .fn()
          .mockResolvedValue('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'),
        validateCID: jest.fn().mockReturnValue(true),
      };
    }),
  };
});

import { CodeService } from './code.service';

describe('Property 11: Code storage round-trip', () => {
  let codeService: CodeService;

  beforeAll(() => {
    // Set required environment variable
    process.env.GEMINI_API_KEY = 'test-gemini-key-for-testing';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload passing code to Storacha and return valid CID', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story: fc.string({ minLength: 10, maxLength: 500 }),
          imageTheme: fc.string({ minLength: 5, maxLength: 100 }),
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Mock Gemini to return safe code
          const mockGemini = jest.spyOn(codeService as any, 'callGeminiForCode');
          const safeCode = `<!DOCTYPE html>
<html>
<head><title>Test Game</title></head>
<body>
  <h1>Spooky Game</h1>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Game loaded');
    });
  </script>
</body>
</html>`;
          mockGemini.mockResolvedValue(safeCode);

          // Spy on uploadFile
          const uploadSpy = jest.spyOn((codeService as any).storachaClient, 'uploadFile');

          // Generate code
          const result = await codeService.generateCode({
            story: input.story,
            imageTheme: input.imageTheme,
          });

          // Verify upload was called with the code
          expect(uploadSpy).toHaveBeenCalledTimes(1);
          expect(uploadSpy).toHaveBeenCalledWith(expect.any(Buffer), 'game.html');

          // Verify CID is returned
          expect(result.cid).toBeDefined();
          expect(typeof result.cid).toBe('string');
          expect(result.cid.length).toBeGreaterThan(0);

          // Verify code is in result
          expect(result.code).toBe(safeCode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should store code as Buffer with correct content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 50, maxLength: 500 }),
        async (codeContent) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Create HTML code
          const htmlCode = `<!DOCTYPE html><html><body>${codeContent}</body></html>`;

          // Mock Gemini
          const mockGemini = jest.spyOn(codeService as any, 'callGeminiForCode');
          mockGemini.mockResolvedValue(htmlCode);

          // Spy on uploadFile
          const uploadSpy = jest.spyOn((codeService as any).storachaClient, 'uploadFile');

          // Generate code
          await codeService.generateCode({
            story: 'test story',
            imageTheme: 'test theme',
          });

          // Verify upload was called with Buffer containing the code
          expect(uploadSpy).toHaveBeenCalledTimes(1);
          const uploadedBuffer = uploadSpy.mock.calls[0][0] as Buffer;
          expect(Buffer.isBuffer(uploadedBuffer)).toBe(true);
          expect(uploadedBuffer.toString()).toBe(htmlCode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only upload code after it passes tests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story: fc.string({ minLength: 10, maxLength: 500 }),
          imageTheme: fc.string({ minLength: 5, maxLength: 100 }),
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Mock Gemini to return code with eval first
          const mockGemini = jest.spyOn(codeService as any, 'callGeminiForCode');
          mockGemini.mockResolvedValue('<html><body><script>eval("bad");</script></body></html>');

          // Mock generatePatch to return safe code
          const mockPatch = jest.spyOn(codeService as any, 'generatePatch');
          mockPatch.mockResolvedValue({
            patchedCode: '<html><body><script>console.log("safe");</script></body></html>',
            changes: 'Removed eval',
          });

          // Spy on uploadFile
          const uploadSpy = jest.spyOn((codeService as any).storachaClient, 'uploadFile');

          // Generate code
          await codeService.generateCode({
            story: input.story,
            imageTheme: input.imageTheme,
          });

          // Verify upload was called only once (after patching)
          expect(uploadSpy).toHaveBeenCalledTimes(1);

          // Verify uploaded code is the patched version (safe)
          const uploadedBuffer = uploadSpy.mock.calls[0][0] as Buffer;
          const uploadedCode = uploadedBuffer.toString();
          expect(uploadedCode).not.toContain('eval');
          expect(uploadedCode).toContain('console.log');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return CID matching Storacha format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story: fc.string({ minLength: 10, maxLength: 500 }),
          imageTheme: fc.string({ minLength: 5, maxLength: 100 }),
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Mock Gemini
          const mockGemini = jest.spyOn(codeService as any, 'callGeminiForCode');
          mockGemini.mockResolvedValue('<html><body>Test</body></html>');

          // Generate code
          const result = await codeService.generateCode({
            story: input.story,
            imageTheme: input.imageTheme,
          });

          // Verify CID format (starts with 'bafy')
          expect(result.cid).toMatch(/^bafy[a-z2-7]{55,}$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include tested flag in response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story: fc.string({ minLength: 10, maxLength: 500 }),
          imageTheme: fc.string({ minLength: 5, maxLength: 100 }),
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Mock Gemini
          const mockGemini = jest.spyOn(codeService as any, 'callGeminiForCode');
          mockGemini.mockResolvedValue('<html><body>Test</body></html>');

          // Generate code
          const result = await codeService.generateCode({
            story: input.story,
            imageTheme: input.imageTheme,
          });

          // Verify tested flag is true
          expect(result.tested).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should track patch attempts in response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          story: fc.string({ minLength: 10, maxLength: 500 }),
          imageTheme: fc.string({ minLength: 5, maxLength: 100 }),
        }),
        async (input) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Mock Gemini to return bad code
          const mockGemini = jest.spyOn(codeService as any, 'callGeminiForCode');
          mockGemini.mockResolvedValue('<html><body><script>eval("x");</script></body></html>');

          // Mock generatePatch
          const mockPatch = jest.spyOn(codeService as any, 'generatePatch');
          mockPatch.mockResolvedValue({
            patchedCode: '<html><body><script>console.log("ok");</script></body></html>',
            changes: 'Fixed',
          });

          // Generate code
          const result = await codeService.generateCode({
            story: input.story,
            imageTheme: input.imageTheme,
          });

          // Verify patchAttempts is tracked
          expect(result.patchAttempts).toBeDefined();
          expect(result.patchAttempts).toBeGreaterThanOrEqual(0);
          expect(result.patchAttempts).toBeLessThanOrEqual(3);
        }
      ),
      { numRuns: 100 }
    );
  });
});
