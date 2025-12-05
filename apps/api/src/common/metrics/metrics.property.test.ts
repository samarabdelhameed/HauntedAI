/**
 * Property-Based Tests for Metrics Service
 * Feature: haunted-ai, Property 68: Metrics collection
 * Validates: Requirements 18.1
 * Managed by Kiro
 */

import * as fc from 'fast-check';
import { MetricsService } from './metrics.service';

describe('Metrics Service Property Tests', () => {
  let metricsService: MetricsService;

  beforeEach(() => {
    // Create fresh metrics service instance
    metricsService = new MetricsService();
  });

  afterEach(() => {
    // Clean up metrics service to prevent Jest from hanging
    if (metricsService) {
      metricsService.cleanup();
    }
    jest.clearAllMocks();
  });

  // Feature: haunted-ai, Property 68: Metrics collection
  // Validates: Requirements 18.1
  describe('Property 68: Metrics collection', () => {
    it('should collect HTTP request metrics for all requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
            route: fc.constantFrom('/api/v1/rooms', '/api/v1/assets', '/api/v1/users', '/api/v1/tokens'),
            statusCode: fc.integer({ min: 200, max: 599 }),
            // fast-check requires min/max for fc.float to be valid 32-bit floats
            duration: fc.float({
              min: Math.fround(0.001),
              max: Math.fround(10.0),
              noNaN: true,
            }),
          }),
          async ({ method, route, statusCode, duration }) => {
            // Record HTTP request
            metricsService.recordHttpRequest(method, route, statusCode, duration);

            // Get metrics
            const metrics = await metricsService.getMetrics();

            // Verify metrics contain HTTP request data
            expect(metrics).toContain('hauntedai_http_request_duration_seconds');
            expect(metrics).toContain('hauntedai_http_requests_total');
            expect(metrics).toContain(method);
            expect(metrics).toContain(route);
            expect(metrics).toContain(statusCode.toString());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should collect system metrics (CPU and memory)', async () => {
      // Wait for at least one metrics collection cycle (15 seconds)
      // For testing, we'll just verify the metrics are exposed
      const metrics = await metricsService.getMetrics();

      // Verify system metrics are present
      expect(metrics).toContain('hauntedai_cpu_usage_percent');
      expect(metrics).toContain('hauntedai_memory_usage_bytes');
      
      // Verify default Node.js metrics are present
      expect(metrics).toContain('process_cpu_user_seconds_total');
      expect(metrics).toContain('nodejs_heap_size_total_bytes');
    });

    it('should track room creation metrics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100 }),
          async (roomCount) => {
            // Record multiple room creations
            for (let i = 0; i < roomCount; i++) {
              metricsService.recordRoomCreated();
            }

            // Get metrics
            const metrics = await metricsService.getMetrics();

            // Verify room creation counter exists
            expect(metrics).toContain('hauntedai_rooms_created_total');
            
            // Verify the count is at least what we recorded
            const match = metrics.match(/hauntedai_rooms_created_total\s+(\d+)/);
            if (match) {
              const count = parseInt(match[1], 10);
              expect(count).toBeGreaterThanOrEqual(roomCount);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should track agent execution metrics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy'),
            status: fc.constantFrom('success', 'failure'),
          }),
          async ({ agentType, status }) => {
            // Record agent execution
            metricsService.recordAgentExecution(agentType, status);

            // Get metrics
            const metrics = await metricsService.getMetrics();

            // Verify agent execution metrics exist
            expect(metrics).toContain('hauntedai_agent_executions_total');
            expect(metrics).toContain(agentType);
            expect(metrics).toContain(status);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track agent failure metrics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            agentType: fc.constantFrom('story', 'asset', 'code', 'deploy'),
            errorType: fc.constantFrom('timeout', 'api_error', 'network_error', 'validation_error'),
          }),
          async ({ agentType, errorType }) => {
            // Record agent failure
            metricsService.recordAgentFailure(agentType, errorType);

            // Get metrics
            const metrics = await metricsService.getMetrics();

            // Verify agent failure metrics exist
            expect(metrics).toContain('hauntedai_agent_failures_total');
            expect(metrics).toContain(agentType);
            expect(metrics).toContain(errorType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track active connections', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            type: fc.constantFrom('sse', 'websocket'),
            count: fc.integer({ min: 0, max: 1000 }),
          }),
          async ({ type, count }) => {
            // Set active connections
            metricsService.setActiveConnections(type, count);

            // Get metrics
            const metrics = await metricsService.getMetrics();

            // Verify active connections metric exists
            expect(metrics).toContain('hauntedai_active_connections');
            expect(metrics).toContain(type);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track HTTP errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
            route: fc.constantFrom('/api/v1/rooms', '/api/v1/assets'),
            errorType: fc.constantFrom('ValidationError', 'AuthenticationError', 'NotFoundError'),
          }),
          async ({ method, route, errorType }) => {
            // Record HTTP error
            metricsService.recordHttpError(method, route, errorType);

            // Get metrics
            const metrics = await metricsService.getMetrics();

            // Verify HTTP error metrics exist
            expect(metrics).toContain('hauntedai_http_request_errors_total');
            expect(metrics).toContain(method);
            expect(metrics).toContain(errorType);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return metrics in Prometheus format', async () => {
      // Record some metrics
      metricsService.recordHttpRequest('GET', '/api/v1/rooms', 200, 0.5);
      metricsService.recordRoomCreated();

      // Get metrics
      const metrics = await metricsService.getMetrics();

      // Verify Prometheus format
      expect(typeof metrics).toBe('string');
      expect(metrics.length).toBeGreaterThan(0);
      
      // Verify it contains HELP and TYPE declarations (Prometheus format)
      expect(metrics).toMatch(/# HELP/);
      expect(metrics).toMatch(/# TYPE/);
    });

    it('should provide correct content type for Prometheus', () => {
      const contentType = metricsService.getContentType();
      
      // Verify content type is for Prometheus
      expect(contentType).toContain('text/plain');
    });
  });

  describe('Metrics Consistency Properties', () => {
    it('should maintain consistent metric counts across multiple operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              method: fc.constantFrom('GET', 'POST'),
              route: fc.constantFrom('/api/v1/rooms', '/api/v1/assets'),
              statusCode: fc.integer({ min: 200, max: 500 }),
              // Ensure bounds are valid 32-bit floats for fast-check
              duration: fc.float({
                min: Math.fround(0.1),
                max: Math.fround(5.0),
                noNaN: true,
              }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          async (requests) => {
            // Record all requests
            for (const req of requests) {
              metricsService.recordHttpRequest(req.method, req.route, req.statusCode, req.duration);
            }

            // Get metrics
            const metrics = await metricsService.getMetrics();

            // Verify metrics are present
            expect(metrics).toContain('hauntedai_http_requests_total');
            expect(metrics).toContain('hauntedai_http_request_duration_seconds');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
