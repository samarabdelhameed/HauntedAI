// Managed by Kiro
// Orchestrator Service - Coordinates agent workflow
// Requirements: 12.1, 12.2

import { WorkflowState, AgentResult, RetryPolicy, AgentConfig } from './types';

export class OrchestratorService {
  // Agent trigger map: defines workflow sequence
  // Requirements: 12.1
  private readonly AGENT_TRIGGERS: Record<string, string[]> = {
    'user.input': ['StoryAgent'],
    'story.generated': ['AssetAgent'],
    'asset.generated': ['CodeAgent'],
    'code.patched': ['DeployAgent'],
    'deploy.done': ['complete'],
  };

  // Retry policy with exponential backoff
  // Requirements: 12.1
  private readonly RETRY_POLICY: RetryPolicy = {
    maxAttempts: 3,
    initialDelay: 2000, // 2 seconds
    backoffMultiplier: 2, // exponential: 2s, 4s, 8s
    maxDelay: 30000, // 30 seconds max
  };

  // Agent configurations with timeouts
  // Requirements: 12.1
  private readonly AGENT_CONFIGS: Record<string, AgentConfig> = {
    StoryAgent: {
      name: 'StoryAgent',
      timeout: 30000, // 30 seconds
      endpoint: process.env.STORY_AGENT_URL || 'http://localhost:3002',
    },
    AssetAgent: {
      name: 'AssetAgent',
      timeout: 60000, // 60 seconds
      endpoint: process.env.ASSET_AGENT_URL || 'http://localhost:3003',
    },
    CodeAgent: {
      name: 'CodeAgent',
      timeout: 60000, // 60 seconds
      endpoint: process.env.CODE_AGENT_URL || 'http://localhost:3004',
    },
    DeployAgent: {
      name: 'DeployAgent',
      timeout: 120000, // 120 seconds
      endpoint: process.env.DEPLOY_AGENT_URL || 'http://localhost:3005',
    },
  };

  constructor(
    private readonly logEmitter: (
      roomId: string,
      agentType: string,
      level: string,
      message: string,
      metadata?: Record<string, any>,
    ) => Promise<void>,
    private readonly updateRoomStatus: (roomId: string, status: string) => Promise<void>,
    private readonly rewardUser: (roomId: string, amount: number) => Promise<void>,
  ) {}

  /**
   * Execute complete workflow for a room
   * Requirements: 12.1, 12.2
   */
  async executeWorkflow(roomId: string, userInput: string): Promise<void> {
    const state: WorkflowState = {
      roomId,
      currentAgent: 'StoryAgent',
      completedAgents: [],
      failedAgents: [],
      retryCount: {},
      results: {},
    };

    try {
      await this.logEmitter(roomId, 'orchestrator', 'info', 'Starting workflow execution', {
        userInput: userInput.substring(0, 50),
      });

      // 1. Story Generation
      await this.logEmitter(roomId, 'orchestrator', 'info', 'Triggering StoryAgent');
      const storyResult = await this.executeAgentWithRetry('StoryAgent', { input: userInput }, state);
      state.results.story = storyResult;

      // 2. Asset Generation
      await this.logEmitter(roomId, 'orchestrator', 'info', 'Triggering AssetAgent');
      const assetResult = await this.executeAgentWithRetry('AssetAgent', { story: storyResult }, state);
      state.results.asset = assetResult;

      // 3. Code Generation
      await this.logEmitter(roomId, 'orchestrator', 'info', 'Triggering CodeAgent');
      const codeResult = await this.executeAgentWithRetry('CodeAgent', { theme: assetResult }, state);
      state.results.code = codeResult;

      // 4. Deployment
      await this.logEmitter(roomId, 'orchestrator', 'info', 'Triggering DeployAgent');
      const deployResult = await this.executeAgentWithRetry('DeployAgent', { code: codeResult }, state);
      state.results.deploy = deployResult;

      // 5. Update room status to done
      await this.updateRoomStatus(roomId, 'done');
      await this.logEmitter(roomId, 'orchestrator', 'success', 'Workflow completed successfully', {
        completedAgents: state.completedAgents,
      });

      // 6. Reward user
      await this.rewardUser(roomId, 10); // 10 HHCW tokens
      await this.logEmitter(roomId, 'orchestrator', 'success', 'User rewarded with 10 HHCW tokens');
    } catch (error) {
      // Error recovery: log error but don't throw
      // Requirements: 12.2
      await this.updateRoomStatus(roomId, 'error');
      await this.logEmitter(roomId, 'orchestrator', 'error', 'Workflow failed', {
        error: error instanceof Error ? error.message : String(error),
        completedAgents: state.completedAgents,
        failedAgents: state.failedAgents,
      });
    }
  }

  /**
   * Execute agent with retry logic and exponential backoff
   * Requirements: 12.1, 12.2
   */
  private async executeAgentWithRetry(
    agentName: string,
    input: any,
    state: WorkflowState,
  ): Promise<any> {
    const config = this.AGENT_CONFIGS[agentName];
    if (!config) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    const maxAttempts = this.RETRY_POLICY.maxAttempts;
    let attempt = 0;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        state.retryCount[agentName] = attempt;

        await this.logEmitter(
          state.roomId,
          agentName.toLowerCase().replace('agent', '') as any,
          'info',
          `${agentName} starting (attempt ${attempt}/${maxAttempts})`,
          { attempt, maxAttempts },
        );

        // Call agent with timeout
        const result = await this.callAgentWithTimeout(config, input);

        // Mark as completed
        state.completedAgents.push(agentName);

        await this.logEmitter(
          state.roomId,
          agentName.toLowerCase().replace('agent', '') as any,
          'success',
          `${agentName} completed successfully`,
          { attempt, duration: result.duration },
        );

        return result.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check if we should retry
        if (attempt >= maxAttempts) {
          // All retries exhausted - mark as failed and continue workflow
          // Requirements: 12.2
          state.failedAgents.push(agentName);

          await this.logEmitter(
            state.roomId,
            agentName.toLowerCase().replace('agent', '') as any,
            'error',
            `${agentName} failed after ${maxAttempts} attempts`,
            { error: errorMessage, attempts: maxAttempts },
          );

          // Throw error to stop workflow
          throw new Error(`${agentName} failed after ${maxAttempts} attempts: ${errorMessage}`);
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.RETRY_POLICY.initialDelay * Math.pow(this.RETRY_POLICY.backoffMultiplier, attempt - 1),
          this.RETRY_POLICY.maxDelay,
        );

        await this.logEmitter(
          state.roomId,
          agentName.toLowerCase().replace('agent', '') as any,
          'warn',
          `${agentName} failed, retrying in ${delay}ms`,
          { error: errorMessage, attempt, nextDelay: delay },
        );

        // Wait before retry
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error(`${agentName} failed unexpectedly`);
  }

  /**
   * Call agent with timeout
   * Requirements: 12.1
   */
  private async callAgentWithTimeout(config: AgentConfig, input: any): Promise<{ data: any; duration: number }> {
    const startTime = Date.now();

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${config.name} timeout after ${config.timeout}ms`));
      }, config.timeout);
    });

    // Create agent call promise (placeholder - will be implemented when agents are ready)
    const agentPromise = this.callAgent(config, input);

    // Race between agent call and timeout
    const data = await Promise.race([agentPromise, timeoutPromise]);

    const duration = Date.now() - startTime;

    return { data, duration };
  }

  /**
   * Call agent endpoint (placeholder for actual implementation)
   * This will be replaced with actual HTTP calls when agents are implemented
   */
  private async callAgent(config: AgentConfig, input: any): Promise<any> {
    // Placeholder implementation
    // In real implementation, this would make HTTP POST request to agent endpoint
    // For now, return mock data to allow testing
    return {
      success: true,
      agentName: config.name,
      input,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get workflow state for a room (for monitoring/debugging)
   */
  getWorkflowState(roomId: string): WorkflowState | null {
    // This would be stored in Redis or memory in a real implementation
    // For now, return null as placeholder
    return null;
  }
}
