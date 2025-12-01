// Managed by Kiro
// Log Emitter Service - Publishes logs to Redis for SSE streaming
// Requirements: 5.1, 5.2

import Redis from 'ioredis';

export interface AgentLog {
  timestamp: Date;
  agentType: 'story' | 'asset' | 'code' | 'deploy' | 'orchestrator';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  metadata?: Record<string, any>;
}

export class LogEmitterService {
  private publisher: Redis;

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.publisher = new Redis(redisUrl, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.publisher.on('connect', () => {
      console.log('[LogEmitter] Redis publisher connected');
    });

    this.publisher.on('error', (err: Error) => {
      console.error('[LogEmitter] Redis publisher error:', err);
    });
  }

  /**
   * Emit a log message to a room channel via Redis pub/sub
   * Requirements: 5.1, 5.2
   */
  async emitLog(
    roomId: string,
    agentType: AgentLog['agentType'],
    level: AgentLog['level'],
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const log: AgentLog = {
      timestamp: new Date(),
      agentType,
      level,
      message,
      metadata,
    };

    const channel = `room:${roomId}:logs`;
    const serializedLog = JSON.stringify({
      ...log,
      timestamp: log.timestamp.toISOString(),
    });

    try {
      await this.publisher.publish(channel, serializedLog);
      console.log(`[LogEmitter] Published ${level} log to ${channel}: ${message}`);
    } catch (error) {
      console.error(`[LogEmitter] Failed to publish log to ${channel}:`, error);
      // Don't throw - log emission failures shouldn't break workflow
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.publisher.quit();
  }
}
