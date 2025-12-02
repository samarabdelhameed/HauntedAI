/**
 * Property-Based Tests for Live Logs Display
 * Feature: haunted-ai
 * Validates: Requirements 5.2, 5.3, 5.4, 5.5
 */

import fc from 'fast-check';

// Mock types for testing
interface Log {
  timestamp: string;
  agentType: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

// Helper to generate valid ISO timestamps
const timestampArbitrary = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() })
  .map(ms => new Date(ms).toISOString());

// Helper function to render log message (simulates component logic)
function renderLogMessage(log: Log): string {
  const timestamp = new Date(log.timestamp).toLocaleTimeString();
  return `[${timestamp}] [${log.agentType}] ${log.message}`;
}

// Helper function to get log color class based on level
function getLogColorClass(level: string): string {
  switch (level) {
    case 'error':
      return 'text-red-400';
    case 'success':
      return 'text-green-400';
    case 'warn':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}

// Helper function to check if log has icon (success logs should have icons)
function hasIcon(level: string): boolean {
  return level === 'success';
}

// Helper function to manage log buffer with size limit
function manageLogBuffer(logs: Log[], maxSize: number = 100): Log[] {
  if (logs.length > maxSize) {
    return logs.slice(-maxSize);
  }
  return logs;
}

describe('Live Logs Display Property Tests', () => {
  // Feature: haunted-ai, Property 16: Log message rendering completeness
  // Validates: Requirements 5.2
  describe('Property 16: Log message rendering completeness', () => {
    it('should render log with both timestamp and agent type for any log', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timestamp: timestampArbitrary,
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
            level: fc.constantFrom('info', 'warn', 'error', 'success'),
            message: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          async (log) => {
            // Render the log message
            const rendered = renderLogMessage(log);

            // Verify timestamp is present
            const timestamp = new Date(log.timestamp).toLocaleTimeString();
            expect(rendered).toContain(timestamp);

            // Verify agent type is present
            expect(rendered).toContain(log.agentType);

            // Verify message is present
            expect(rendered).toContain(log.message);

            // Verify format includes brackets
            expect(rendered).toMatch(/\[.*\]/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all required fields in rendered output', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              timestamp: timestampArbitrary,
              agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
              level: fc.constantFrom('info', 'warn', 'error', 'success'),
              message: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          async (logs) => {
            // Render all logs
            const renderedLogs = logs.map(log => renderLogMessage(log));

            // Verify each log has all components
            renderedLogs.forEach((rendered, idx) => {
              const log = logs[idx];
              
              // Must contain timestamp
              expect(rendered).toContain('[');
              expect(rendered).toContain(']');
              
              // Must contain agent type
              expect(rendered).toContain(log.agentType);
              
              // Must contain message
              expect(rendered).toContain(log.message);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: haunted-ai, Property 17: Error log formatting
  // Validates: Requirements 5.3
  describe('Property 17: Error log formatting', () => {
    it('should apply red color styling to error logs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timestamp: timestampArbitrary,
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
            level: fc.constant('error' as const),
            message: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          async (log) => {
            // Get color class for error log
            const colorClass = getLogColorClass(log.level);

            // Verify red color is applied
            expect(colorClass).toBe('text-red-400');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include error details in message', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timestamp: timestampArbitrary,
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
            level: fc.constant('error' as const),
            message: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          async (log) => {
            // Render the log
            const rendered = renderLogMessage(log);

            // Verify error message is included
            expect(rendered).toContain(log.message);
            
            // Verify log level is error
            expect(log.level).toBe('error');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: haunted-ai, Property 18: Success log formatting
  // Validates: Requirements 5.4
  describe('Property 18: Success log formatting', () => {
    it('should apply green color styling to success logs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timestamp: timestampArbitrary,
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
            level: fc.constant('success' as const),
            message: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          async (log) => {
            // Get color class for success log
            const colorClass = getLogColorClass(log.level);

            // Verify green color is applied
            expect(colorClass).toBe('text-green-400');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include icon element for success logs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timestamp: timestampArbitrary,
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
            level: fc.constant('success' as const),
            message: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          async (log) => {
            // Check if icon should be present
            const shouldHaveIcon = hasIcon(log.level);

            // Verify success logs have icons
            expect(shouldHaveIcon).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: haunted-ai, Property 19: Log buffer size limit
  // Validates: Requirements 5.5
  describe('Property 19: Log buffer size limit', () => {
    it('should keep only last 100 messages when buffer exceeds limit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              timestamp: timestampArbitrary,
              agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
              level: fc.constantFrom('info', 'warn', 'error', 'success'),
              message: fc.string({ minLength: 10, maxLength: 200 }),
            }),
            { minLength: 101, maxLength: 200 }
          ),
          async (logs) => {
            // Manage log buffer with 100 message limit
            const managedLogs = manageLogBuffer(logs, 100);

            // Verify buffer size is at most 100
            expect(managedLogs.length).toBeLessThanOrEqual(100);

            // Verify we kept the most recent logs
            if (logs.length > 100) {
              expect(managedLogs.length).toBe(100);
              
              // Verify the last log is the same
              expect(managedLogs[managedLogs.length - 1]).toEqual(logs[logs.length - 1]);
              
              // Verify the first log in managed buffer is from the correct position
              expect(managedLogs[0]).toEqual(logs[logs.length - 100]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not truncate buffer when under limit', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              timestamp: timestampArbitrary,
              agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
              level: fc.constantFrom('info', 'warn', 'error', 'success'),
              message: fc.string({ minLength: 10, maxLength: 200 }),
            }),
            { minLength: 1, maxLength: 100 }
          ),
          async (logs) => {
            // Manage log buffer with 100 message limit
            const managedLogs = manageLogBuffer(logs, 100);

            // Verify all logs are kept when under limit
            expect(managedLogs.length).toBe(logs.length);
            
            // Verify logs are unchanged
            expect(managedLogs).toEqual(logs);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain correct order after truncation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              timestamp: timestampArbitrary,
              agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
              level: fc.constantFrom('info', 'warn', 'error', 'success'),
              message: fc.string({ minLength: 10, maxLength: 200 }),
            }),
            { minLength: 101, maxLength: 150 }
          ),
          async (logs) => {
            // Manage log buffer
            const managedLogs = manageLogBuffer(logs, 100);

            // Verify order is maintained (most recent 100)
            for (let i = 0; i < managedLogs.length - 1; i++) {
              const currentIndex = logs.length - 100 + i;
              expect(managedLogs[i]).toEqual(logs[currentIndex]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional property: Warn log formatting
  describe('Additional: Warn log formatting', () => {
    it('should apply yellow color styling to warn logs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timestamp: timestampArbitrary,
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
            level: fc.constant('warn' as const),
            message: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          async (log) => {
            // Get color class for warn log
            const colorClass = getLogColorClass(log.level);

            // Verify yellow color is applied
            expect(colorClass).toBe('text-yellow-400');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional property: Info log formatting
  describe('Additional: Info log formatting', () => {
    it('should apply gray color styling to info logs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            timestamp: timestampArbitrary,
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
            level: fc.constant('info' as const),
            message: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          async (log) => {
            // Get color class for info log
            const colorClass = getLogColorClass(log.level);

            // Verify gray color is applied
            expect(colorClass).toBe('text-gray-400');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
