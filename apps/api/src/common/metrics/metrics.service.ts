/**
 * Prometheus Metrics Service for HauntedAI
 * Managed by Kiro
 * 
 * Collects and exposes metrics for monitoring:
 * - CPU usage
 * - Memory usage
 * - Request count
 * - Response time
 */

import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private register: promClient.Registry;
  private systemMetricsInterval?: NodeJS.Timeout;
  
  // HTTP metrics
  public httpRequestDuration: promClient.Histogram;
  public httpRequestTotal: promClient.Counter;
  public httpRequestErrors: promClient.Counter;
  
  // System metrics
  public cpuUsage: promClient.Gauge;
  public memoryUsage: promClient.Gauge;
  
  // Application metrics
  public activeConnections: promClient.Gauge;
  public roomsCreated: promClient.Counter;
  public agentExecutions: promClient.Counter;
  public agentFailures: promClient.Counter;

  constructor() {
    // Create a new registry
    this.register = new promClient.Registry();
    
    // Add default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({
      register: this.register,
      prefix: 'hauntedai_',
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new promClient.Histogram({
      name: 'hauntedai_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    // HTTP request counter
    this.httpRequestTotal = new promClient.Counter({
      name: 'hauntedai_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    // HTTP error counter
    this.httpRequestErrors = new promClient.Counter({
      name: 'hauntedai_http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.register],
    });

    // CPU usage gauge
    this.cpuUsage = new promClient.Gauge({
      name: 'hauntedai_cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.register],
    });

    // Memory usage gauge
    this.memoryUsage = new promClient.Gauge({
      name: 'hauntedai_memory_usage_bytes',
      help: 'Memory usage in bytes',
      registers: [this.register],
    });

    // Active SSE/WebSocket connections
    this.activeConnections = new promClient.Gauge({
      name: 'hauntedai_active_connections',
      help: 'Number of active SSE/WebSocket connections',
      labelNames: ['type'],
      registers: [this.register],
    });

    // Rooms created counter
    this.roomsCreated = new promClient.Counter({
      name: 'hauntedai_rooms_created_total',
      help: 'Total number of rooms created',
      registers: [this.register],
    });

    // Agent executions counter
    this.agentExecutions = new promClient.Counter({
      name: 'hauntedai_agent_executions_total',
      help: 'Total number of agent executions',
      labelNames: ['agent_type', 'status'],
      registers: [this.register],
    });

    // Agent failures counter
    this.agentFailures = new promClient.Counter({
      name: 'hauntedai_agent_failures_total',
      help: 'Total number of agent failures',
      labelNames: ['agent_type', 'error_type'],
      registers: [this.register],
    });

    // Start collecting system metrics every 15 seconds
    this.startSystemMetricsCollection();
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Get metrics content type
   */
  getContentType(): string {
    return this.register.contentType;
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration
    );
    this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  /**
   * Record HTTP error
   */
  recordHttpError(method: string, route: string, errorType: string) {
    this.httpRequestErrors.inc({ method, route, error_type: errorType });
  }

  /**
   * Record room creation
   */
  recordRoomCreated() {
    this.roomsCreated.inc();
  }

  /**
   * Record agent execution
   */
  recordAgentExecution(agentType: string, status: 'success' | 'failure') {
    this.agentExecutions.inc({ agent_type: agentType, status });
  }

  /**
   * Record agent failure
   */
  recordAgentFailure(agentType: string, errorType: string) {
    this.agentFailures.inc({ agent_type: agentType, error_type: errorType });
  }

  /**
   * Set active connections count
   */
  setActiveConnections(type: 'sse' | 'websocket', count: number) {
    this.activeConnections.set({ type }, count);
  }

  /**
   * Start collecting system metrics periodically
   */
  private startSystemMetricsCollection() {
    this.systemMetricsInterval = setInterval(() => {
      // Collect CPU usage
      const cpuUsage = process.cpuUsage();
      const totalCpuTime = cpuUsage.user + cpuUsage.system;
      this.cpuUsage.set(totalCpuTime / 1000000); // Convert to seconds

      // Collect memory usage
      const memUsage = process.memoryUsage();
      this.memoryUsage.set(memUsage.heapUsed);
    }, 15000); // Every 15 seconds
  }

  /**
   * Clean up resources (timers, default metrics collection)
   * This is useful for tests to prevent Jest from hanging
   */
  cleanup(): void {
    // Clear the system metrics interval (this is the main cause of Jest hanging)
    if (this.systemMetricsInterval) {
      clearInterval(this.systemMetricsInterval);
      this.systemMetricsInterval = undefined;
    }

    // Clear the registry to remove all metrics
    // Note: prom-client's collectDefaultMetrics uses internal timers,
    // but clearing the registry prevents them from updating this instance
    this.register.clear();
  }
}
