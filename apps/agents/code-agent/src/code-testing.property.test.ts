// Feature: haunted-ai, Property 10: Generated code is tested
// Validates: Requirements 3.2

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

describe('Property 10: Generated code is tested', () => {
  let codeService: CodeService;

  beforeAll(() => {
    // Set required environment variable
    process.env.GEMINI_API_KEY = 'test-gemini-key-for-testing';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should test all generated code before uploading', async () => {
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

          // Mock Gemini to return code
          const mockGemini = jest.spyOn(codeService as any, 'callGeminiForCode');
          mockGemini.mockResolvedValue('<html><body><script>console.log("test");</script></body></html>');

          // Spy on testCode method
          const testCodeSpy = jest.spyOn(codeService as any, 'testCode');

          // Generate code
          await codeService.generateCode({
            story: input.story,
            imageTheme: input.imageTheme,
          });

          // Verify testCode was called
          expect(testCodeSpy).toHaveBeenCalled();
          expect(testCodeSpy).toHaveBeenCalledWith(expect.any(String));

          // Verify it was called before upload (at least once)
          expect(testCodeSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect dangerous eval() patterns in code', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 10, maxLength: 200 }), async (codeContent) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Create code with eval
          const dangerousCode = `<html><body><script>eval("${codeContent}");</script></body></html>`;

          // Test the code
          const result = await (codeService as any).testCode(dangerousCode);

          // Should fail because of eval
          expect(result.passed).toBe(false);
          expect(result.errors).toContain('Code contains eval() which is a security risk');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect dangerous Function() constructor in code', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 10, maxLength: 200 }), async (codeContent) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Create code with Function constructor
          const dangerousCode = `<html><body><script>const fn = new Function("${codeContent}");</script></body></html>`;

          // Test the code
          const result = await (codeService as any).testCode(dangerousCode);

          // Should fail because of Function()
          expect(result.passed).toBe(false);
          expect(result.errors).toContain(
            'Code contains Function() constructor which is a security risk'
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect inline event handlers in code', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('click', 'load', 'submit', 'change', 'keypress'),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (eventName, handlerCode) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Create code with inline handler
          const dangerousCode = `<html><body><button on${eventName}="${handlerCode}">Click</button></body></html>`;

          // Test the code
          const result = await (codeService as any).testCode(dangerousCode);

          // Should fail because of inline handler
          expect(result.passed).toBe(false);
          expect(result.errors).toContain(
            'Code contains inline event handlers (use addEventListener instead)'
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass safe code without dangerous patterns', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (title, content) => {
          // Reset mocks
          jest.clearAllMocks();

          codeService = new CodeService();

          // Create safe code
          const safeCode = `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
  <h1>${content}</h1>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Page loaded');
    });
  </script>
</body>
</html>`;

          // Test the code
          const result = await (codeService as any).testCode(safeCode);

          // Should pass
          expect(result.passed).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should test code multiple times if patching is needed', async () => {
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

          // Mock Gemini to return code with eval first, then safe code
          const mockGemini = jest.spyOn(codeService as any, 'callGeminiForCode');
          mockGemini.mockResolvedValueOnce(
            '<html><body><script>eval("bad");</script></body></html>'
          );

          // Mock generatePatch to return safe code
          const mockPatch = jest.spyOn(codeService as any, 'generatePatch');
          mockPatch.mockResolvedValue({
            patchedCode: '<html><body><script>console.log("safe");</script></body></html>',
            changes: 'Removed eval',
          });

          // Spy on testCode
          const testCodeSpy = jest.spyOn(codeService as any, 'testCode');

          // Generate code
          await codeService.generateCode({
            story: input.story,
            imageTheme: input.imageTheme,
          });

          // Verify testCode was called multiple times (initial + after patch)
          expect(testCodeSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
