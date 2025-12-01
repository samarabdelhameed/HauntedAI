// User Types
export interface User {
  id: string;
  did: string;
  username: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Room Types
export type RoomStatus = 'idle' | 'running' | 'done' | 'error';

export interface Room {
  id: string;
  ownerId: string;
  status: RoomStatus;
  inputText: string;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Types
export type AgentType = 'story' | 'asset' | 'code' | 'deploy';

export interface Asset {
  id: string;
  roomId: string;
  agentType: AgentType;
  cid: string;
  fileType: string;
  fileSize: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Token Transaction Types
export interface TokenTransaction {
  id: string;
  userId: string;
  amount: bigint;
  reason: string;
  txHash: string;
  createdAt: Date;
}

// Badge Types
export interface Badge {
  id: string;
  userId: string;
  tokenId: number;
  badgeType: string;
  txHash: string;
  createdAt: Date;
}

// Agent Log Types
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface AgentLog {
  timestamp: Date;
  agentType: AgentType | 'orchestrator';
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
}

// Workflow State Types
export interface WorkflowState {
  roomId: string;
  currentAgent: string;
  completedAgents: string[];
  failedAgents: string[];
  retryCount: Record<string, number>;
  results: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Agent Response Types
export interface StoryAgentResponse {
  story: string;
  cid: string;
}

export interface AssetAgentResponse {
  imageCid: string;
  imageUrl?: string;
}

export interface CodeAgentResponse {
  code: string;
  cid: string;
  testsPassed: boolean;
}

export interface DeployAgentResponse {
  deploymentUrl: string;
  codeCid: string;
}
