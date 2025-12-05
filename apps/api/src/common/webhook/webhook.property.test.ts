// Feature: haunted-ai, Property 48: Critical error webhook notification
// Validates: Requirements 12.5

import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { LoggerService } from '../logger/logger.service';
import fc from 'fast-check';

// Mock fetch globally
global.fetch = jest.fn();

describe('Property 48: Critical error webhook notification', () => {
  let webhookService: WebhookService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    // Set webhook URL for testing
    process.env.ERROR_WEBHOOK_URL = 'https://webhook.example.com/errors';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    webhookService = module.get<WebhookService>(WebhookService);
    loggerService = module.get<LoggerService>(LoggerService);

    // Reset mocks
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  afterEach(() => {
    delete process.env.ERROR_WEBHOOK_URL;
  });

  it('should send webhook POST request for any critical error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          event: fc.string({ minLength: 1, maxLength: 50 }),
          errorName: fc.string({ minLength: 1, maxLength: 30 }),
          errorMessage: fc.string({ minLength: 1, maxLength: 200 }),
          metadata: fc.dictionary(fc.string(), fc.anything()),
        }),
        async ({ event, errorName, errorMessage, metadata }) => {
          jest.clearAllMocks();
          (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
          });

          const error = new Error(errorMessage);
          error.name = errorName;

          await webhookService.sendCriticalError(event, error, metadata);

          // Verify fetch was called
          expect(global.fetch).toHaveBeenCalledTimes(1);

          // Verify the webhook URL
          const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
          expect(fetchCall[0]).toBe('https://webhook.example.com/errors');

          // Verify the request method and headers
          const fetchOptions = fetchCall[1];
          expect(fetchOptions.method).toBe('POST');
          expect(fetchOptions.headers['Content-Type']).toBe('application/json');

          // Verify the payload structure
          const payload = JSON.parse(fetchOptions.body);
          expect(payload.event).toBe(event);
          expect(payload.severity).toBe('critical');
          expect(payload.message).toBe(errorMessage);
          expect(payload.error.name).toBe(errorName);
          expect(payload.error.message).toBe(errorMessage);
          expect(payload.service).toBe('HauntedAI API Gateway');
          expect(payload.timestamp).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include error details and stack trace in webhook payload', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          event: fc.string({ minLength: 1, maxLength: 50 }),
          errorMessage: fc.string({ minLength: 1, maxLength: 200 }),
        }),
        async ({ event, errorMessage }) => {
          jest.clearAllMocks();
          (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
          });

          const error = new Error(errorMessage);

          await webhookService.sendCriticalError(event, error);

          const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
          const payload = JSON.parse(fetchCall[1].body);

          // Verify error details are included
          expect(payload.error).toBeDefined();
          expect(payload.error.name).toBe('Error');
          expect(payload.error.message).toBe(errorMessage);
          expect(payload.error.stack).toBeDefined();
          expect(typeof payload.error.stack).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not throw when webhook request fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          event: fc.string({ minLength: 1, maxLength: 50 }),
          errorMessage: fc.string({ minLength: 1, maxLength: 200 }),
          statusCode: fc.integer({ min: 400, max: 599 }),
        }),
        async ({ event, errorMessage, statusCode }) => {
          jest.clearAllMocks();
          (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: statusCode,
          });

          const error = new Error(errorMessage);

          // Should not throw even if webhook fails
          await expect(webhookService.sendCriticalError(event, error)).resolves.not.toThrow();

          // Should log the error
          expect(loggerService.error).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle network errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          event: fc.string({ minLength: 1, maxLength: 50 }),
          errorMessage: fc.string({ minLength: 1, maxLength: 200 }),
        }),
        async ({ event, errorMessage }) => {
          jest.clearAllMocks();
          (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

          const error = new Error(errorMessage);

          // Should not throw even if network fails
          await expect(webhookService.sendCriticalError(event, error)).resolves.not.toThrow();

          // Should log the error
          expect(loggerService.error).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not send webhooks when disabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          event: fc.string({ minLength: 1, maxLength: 50 }),
          errorMessage: fc.string({ minLength: 1, maxLength: 200 }),
        }),
        async ({ event, errorMessage }) => {
          // Create service without webhook URL
          delete process.env.ERROR_WEBHOOK_URL;

          const module: TestingModule = await Test.createTestingModule({
            providers: [
              WebhookService,
              {
                provide: LoggerService,
                useValue: {
                  log: jest.fn(),
                  error: jest.fn(),
                  warn: jest.fn(),
                },
              },
            ],
          }).compile();

          const disabledWebhookService = module.get<WebhookService>(WebhookService);

          jest.clearAllMocks();

          const error = new Error(errorMessage);

          await disabledWebhookService.sendCriticalError(event, error);

          // Should not call fetch when disabled
          expect(global.fetch).not.toHaveBeenCalled();
          expect(disabledWebhookService.isEnabled()).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should send different severity levels correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          event: fc.string({ minLength: 1, maxLength: 50 }),
          message: fc.string({ minLength: 1, maxLength: 200 }),
          severity: fc.constantFrom('critical', 'error', 'warning'),
        }),
        async ({ event, message, severity }) => {
          jest.clearAllMocks();
          (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
          });

          if (severity === 'critical') {
            await webhookService.sendCriticalError(event, new Error(message));
          } else if (severity === 'error') {
            await webhookService.sendError(event, message);
          } else {
            await webhookService.sendWarning(event, message);
          }

          const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
          const payload = JSON.parse(fetchCall[1].body);

          expect(payload.severity).toBe(severity);
          expect(payload.event).toBe(event);
        }
      ),
      { numRuns: 100 }
    );
  });
});
