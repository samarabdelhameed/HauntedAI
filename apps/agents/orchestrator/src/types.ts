// Managed by Kiro
// Types for orchestrator service

export interface WorkflowState {
  roomId: string;
  currentAgent: string;
  completedAgents: string[];
  failedAgents: string[];
  retryCount: Record<string, number>;
  results: Record<string, any>;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  initialDelay: number; // milliseconds
  backoffMultiplier: number;
  maxDelay: number; // milliseconds
}

export interface AgentConfig {
  name: string;
  timeout: number; // milliseconds
  endpoint?: string;
}
