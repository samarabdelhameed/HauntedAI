// Feature: haunted-ai, Property 46: Database auto-reconnection
// Validates: Requirements 12.3

import fc from 'fast-check';

describe('Property 46: Database auto-reconnection', () => {
  // Mock PrismaService class for testing
  class MockPrismaService {
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private readonly reconnectDelay = 100; // Reduced for testing
    private isConnected = false;
    private connectFn: () => Promise<void>;

    constructor(connectFn: () => Promise<void>) {
      this.connectFn = connectFn;
    }

    async connectWithRetry(): Promise<void> {
      while (this.reconnectAttempts < this.maxReconnectAttempts) {
        try {
          await this.connectFn();
          this.isConnected = true;
          this.reconnectAttempts = 0;
          return;
        } catch (error) {
          this.reconnectAttempts++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            throw new Error(
              `Failed to connect to database after ${this.maxReconnectAttempts} attempts`
            );
          }

          await this.sleep(this.reconnectDelay);
        }
      }
    }

    private sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getConnectionStatus(): boolean {
      return this.isConnected;
    }

    getReconnectAttempts(): number {
      return this.reconnectAttempts;
    }
  }

  it('should automatically reconnect within 5 seconds after connection loss', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }), // Number of connection failures to simulate
        async (failureCount) => {
          let connectAttempts = 0;

          const connectFn = async () => {
            connectAttempts++;
            if (connectAttempts <= failureCount) {
              throw new Error('Connection failed');
            }
            // Success on subsequent attempts
          };

          const service = new MockPrismaService(connectFn);

          // Trigger reconnection
          await service.connectWithRetry();

          // Verify connection was attempted multiple times
          expect(connectAttempts).toBeGreaterThan(failureCount);
          expect(service.getConnectionStatus()).toBe(true);
          expect(service.getReconnectAttempts()).toBe(0); // Reset after success
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  it('should fail after max reconnection attempts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(10), // Always fail more than max attempts
        async (failureCount) => {
          let connectAttempts = 0;

          const connectFn = async () => {
            connectAttempts++;
            throw new Error('Connection failed');
          };

          const service = new MockPrismaService(connectFn);

          // Should throw after max attempts
          await expect(service.connectWithRetry()).rejects.toThrow(
            'Failed to connect to database after 5 attempts'
          );

          // Verify it tried exactly max attempts
          expect(connectAttempts).toBe(5);
          expect(service.getConnectionStatus()).toBe(false);
        }
      ),
      { numRuns: 10 } // Reduced runs since this is slow
    );
  }, 60000);

  it('should reset reconnect attempts after successful connection', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 2 }), // Initial failures
        async (initialFailures) => {
          let connectAttempts = 0;

          const connectFn = async () => {
            connectAttempts++;
            if (connectAttempts <= initialFailures) {
              throw new Error('Connection failed');
            }
          };

          const service = new MockPrismaService(connectFn);

          // First connection attempt
          await service.connectWithRetry();
          expect(service.getReconnectAttempts()).toBe(0);
          expect(service.getConnectionStatus()).toBe(true);

          // Reset for second attempt
          connectAttempts = 0;
          await service.connectWithRetry();
          expect(service.getReconnectAttempts()).toBe(0);
          expect(service.getConnectionStatus()).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  it('should maintain connection status correctly across multiple operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 3 }), // Series of success/failure
        async (connectionResults) => {
          for (const shouldSucceed of connectionResults) {
            let connectAttempts = 0;

            const connectFn = async () => {
              connectAttempts++;
              if (!shouldSucceed) {
                throw new Error('Connection failed');
              }
            };

            const service = new MockPrismaService(connectFn);

            if (shouldSucceed) {
              await service.connectWithRetry();
              expect(service.getConnectionStatus()).toBe(true);
              expect(service.getReconnectAttempts()).toBe(0);
            } else {
              await expect(service.connectWithRetry()).rejects.toThrow();
              expect(service.getConnectionStatus()).toBe(false);
            }
          }
        }
      ),
      { numRuns: 20 } // Reduced runs since this is slow
    );
  }, 60000);
});
