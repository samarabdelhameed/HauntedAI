// Feature: haunted-ai, Property 10: Generated code is tested
// Validates: Requirements 3.2

import fc from 'fast-check';
import { CodeService } from './code.service';

// Mock Storacha client
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

describe('Property 10: Generated code is tested', () => {
  let codeService: CodeService;

  beforeAll(() => {
    process.env.HUGGINGFACE_API_KEY = 'hf_test_key_for_testing';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should test all generated code for security issues', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          code: fc.string({ minLength: 50, maxLength: 500 }),
          hasEval: fc.boolean(),
          hasFunction: fc.boolean(),
          hasInlineHandlers: fc.boolean(),
        }),
        async (input) => {
          jest.clearAllMocks();

          codeService = new CodeService();

          // Build test code with potential security issues
          let testCode = input.code;

          if (input.hasEval) {
            testCode += '\n<script>eval("alert(1)")</script>';
          }

          if (input.hasFunction) {
            testCode += '\n<script>new Function("alert(2)")()</script>';
          }

          if (input.hasInlineHandlers) {
            testCode += '\n<button onclick="alert(3)">Click</button>';
          }

          // Test the code
          const result = await codeService.testCode(testCode);

          // Verify testing was performed
          expect(result).toHaveProperty('passed');
          expect(result).toHaveProperty('errors');
          expect(result).toHaveProperty('warnings');

          // Verify security checks
          if (input.hasEval) {
            expect(result.passed).toBe(false);
            expect(result.errors.some((e) => e.includes('eval'))).toBe(true);
          }

          if (input.hasFunction) {
            expect(result.passed).toBe(false);
            expect(result.errors.some((e) => e.includes('Function'))).toBe(true);
          }

          if (input.hasInlineHandlers) {
            expect(result.passed).toBe(false);
            expect(result.errors.some((e) => e.includes('inline event handlers'))).toBe(true);
          }

          // If no security issues, should pass
          if (!input.hasEval && !input.hasFunction && !input.hasInlineHandlers) {
            expect(result.passed).toBe(true);
            expect(result.errors.length).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should test code structure and completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasHtml: fc.boolean(),
          hasScript: fc.boolean(),
          hasStyle: fc.boolean(),
        }),
        async (input) => {
          jest.clearAllMocks();

          codeService = new CodeService();

          // Build test code
          let testCode = '';

          if (input.hasHtml) {
            testCode += '<!DOCTYPE html><html><head>';
          }

          if (input.hasStyle) {
            testCode += '<style>body { background: black; }</style>';
          }

          if (input.hasHtml) {
            testCode += '</head><body>';
          }

          if (input.hasScript) {
            testCode += '<script>let score = 0;</script>';
          }

          if (input.hasHtml) {
            testCode += '</body></html>';
          }

          // Test the code
          const result = await codeService.testCode(testCode);

          // Verify structure checks
          if (!input.hasHtml) {
            expect(result.warnings.some((w) => w.includes('HTML'))).toBe(true);
          }

          if (!input.hasScript) {
            expect(result.warnings.some((w) => w.includes('JavaScript'))).toBe(true);
          }

          // Should not have security errors for valid code
          expect(result.errors.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should log test results for all generated code', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (story, imageTheme) => {
          jest.clearAllMocks();

          codeService = new CodeService();

          // Mock HuggingFace API
          const mockHF = jest.spyOn(codeService as any, 'callHuggingFaceForCode');
          mockHF.mockResolvedValue('<html><body><script>let x = 1;</script></body></html>');

          // Mock Storacha
          const mockStoracha = jest.spyOn(
            (codeService as any).storachaClient,
            'uploadFile'
          );
          mockStoracha.mockResolvedValue('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi');

          // Spy on testCode to verify it's called
          const testCodeSpy = jest.spyOn(codeService, 'testCode');

          // Generate code
          const result = await codeService.generateCode({
            story,
            imageTheme,
          });

          // Verify testCode was called
          expect(testCodeSpy).toHaveBeenCalled();

          // Verify result indicates testing was done
          expect(result.tested).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
