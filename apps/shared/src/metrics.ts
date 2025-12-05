/**
 * Shared Metrics Utility for HauntedAI Agents
 * Managed by Kiro
 */

import * as promClient from 'prom-client';

export class AgentMetrics {
  private register: promClient.Registry;
  
  // Agent-specific metrics
  public agentExecutions: promClient.Counter;
  public agentFailures: promClient.Counter;
  public agentDuration: promClient.Histogram;
  
  // HTTP metrics
  public httpRequestDuration: promClient.Histogram;
  public httpRequestTotal: promClient.Counter;

  constructor(agentName: string) {
    // Create a new registry
    this.register = new promClient.Registry();
    
    // Add default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({
      register: this.register,
      prefix: `hauntedai_${agentName}_`,
    });

    // Agent execution counter
    this.agentExecutions = new promClient.Counter({
      name: `hauntedai_agent_executions_total`,
      help: 'Total number of agent executions',
      labelNames: ['agent_type', 'status'],
      registers: [this.register],
    });

    // Agent failure counter
    this.agentFailures = new promClient.Counter({
      name: `hauntedai_agent_failures_total`,
      help: 'Total number of agent failures',
      labelNames: ['agent_type', 'error_type'],
      registers: [this.register],
    });

    // Agent execution duration
    this.agentDuration = new promClient.Histogram({
      name: `hauntedai_agent_duration_seconds`,
      help: 'Duration of agent executions in seconds',
      labelNames: ['agent_type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
      registers: [this.register],
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new promClient.Histogram({
      name: `hauntedai_http_request_duration_seconds`,
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    // HTTP request counter
    this.httpRequestTotal = new promClient.Counter({
      name: `hauntedai_http_requests_total`,
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });
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
   * Record agent execution
   */
  recordExecution(agentType: string, status: 'success' | 'failure', duration: number) {
    this.agentExecutions.inc({ agent_type: agentType, status });
    this.agentDuration.observe({ agent_type: agentType }, duration);
  }

  /**
   * Record agent failure
   */
  recordFailure(agentType: string, errorType: string) {
    this.agentFailures.inc({ agent_type: agentType, error_type: errorType });
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
}