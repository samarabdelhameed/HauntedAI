# Orchestrator Service

**Managed by Kiro** | HauntedAI Agent Workflow Coordination

## Overview

The Orchestrator Service is the central coordinator for the HauntedAI multi-agent workflow. It manages the execution sequence of agents (StoryAgent → AssetAgent → CodeAgent → DeployAgent), handles retries with exponential backoff, emits real-time logs via Redis pub/sub, and sends WebSocket notifications for deployment completion.

## Features

- ✅ **Workflow State Management**: Tracks agent execution state and results
- ✅ **Agent Trigger Map**: Defines sequential agent execution flow
- ✅ **Retry Logic**: Exponential backoff (2s, 4s, 8s) with max 3 attempts
- ✅ **Error Recovery**: Continues workflow after agent failures
- ✅ **Timeout Enforcement**: Configurable timeouts per agent (30s-120s)
- ✅ **Real-time Logging**: Redis pub/sub for SSE streaming
- ✅ **WebSocket Notifications**: Deployment completion alerts
- ✅ **Property-Based Testing**: 100+ test iterations for correctness

## Architecture

```
User Input → Orchestrator → StoryAgent → AssetAgent → CodeAgent → DeployAgent
                ↓
            Redis Pub/Sub (Logs)
                ↓
            WebSocket (Notifications)
```

## Installation

```bash
cd apps/agents/orchestrator
npm install
```

## Usage

### Basic Usage

```typescript
import { createOrchestrator } from '@hauntedai/orchestrator';

// Create orchestrator with dependencies
const { orchestrator, logEmitter } = createOrchestrator(
  // Update room status callback
  async (roomId: string, status: string) => {
    await prisma.room.update({ 
      where: { id: roomId }, 
      data: { status } 
    });
  },
  // Reward user callback
  async (roomId: string, amount: number) => {
    await tokenService.rewardUser(roomId, amount);
  },
  // Optional: Redis URL
  process.env.REDIS_URL
);

// Execute workflow
await orchestrator.executeWorkflow(roomId, userInput);

// Clean up
await logEmitter.close();
```

### Advanced Usage

```typescript
import { 
  OrchestratorService, 
  LogEmitterService,
  WebSocketNotificationService 
} from '@hauntedai/orchestrator';
import { createServer } from 'http';

// Create HTTP server for WebSocket
const httpServer = createServer();
httpServer.listen(3000);

// Create services
const logEmitter = new LogEmitterService(process.env.REDIS_URL);
const wsService = new WebSocketNotificationService(httpServer);

// Create orchestrator
const orchestrator = new OrchestratorService(
  async (roomId, agentType, level, message, metadata) => {
    await logEmitter.emitLog(roomId, agentType, level, message, metadata);
  },
  async (roomId, status) => {
    await updateRoomStatus(roomId, status);
  },
  async (roomId, amount) => {
    await rewardUser(roomId, amount);
  }
);

// Execute workflow
await orchestrator.executeWorkflow(roomId, userInput);

// Send deployment notification
await wsService.sendDeploymentNotification(roomId, deploymentUrl, codeCid);
```

## Configuration

### Agent Timeouts

| Agent | Timeout | Purpose |
|-------|---------|---------|
| StoryAgent | 30s | Story generation with OpenAI |
| AssetAgent | 60s | Image generation with DALL-E |
| CodeAgent | 60s | Code generation with Codex |
| DeployAgent | 120s | Deployment to Vercel/IPFS |

### Retry Policy

- **Max Attempts**: 3
- **Initial Delay**: 2 seconds
- **Backoff Multiplier**: 2 (exponential)
- **Max Delay**: 30 seconds
- **Pattern**: 2s → 4s → 8s

### Environment Variables

```bash
# Redis connection
REDIS_URL=redis://localhost:6379

# Agent endpoints (optional)
STORY_AGENT_URL=http://localhost:3002
ASSET_AGENT_URL=http://localhost:3003
CODE_AGENT_URL=http://localhost:3004
DEPLOY_AGENT_URL=http://localhost:3005
```

## Testing

```bash
# Run all tests
npm test

# Run property-based tests only
npm test -- orchestrator.property.test.ts

# Run timeout tests
npm test -- orchestrator-timeout.test.ts

# Run WebSocket tests
npm test -- websocket-notification.property.test.ts

# Run with coverage
npm test -- --coverage
```

## API Reference

### OrchestratorService

#### `executeWorkflow(roomId: string, userInput: string): Promise<void>`

Executes the complete agent workflow for a room.

**Parameters:**
- `roomId`: Unique room identifier
- `userInput`: User's input text for story generation

**Workflow Steps:**
1. Story Generation (StoryAgent)
2. Asset Generation (AssetAgent)
3. Code Generation (CodeAgent)
4. Deployment (DeployAgent)
5. Update room status to 'done'
6. Reward user with 10 HHCW tokens

**Error Handling:**
- Retries each agent up to 3 times with exponential backoff
- Logs all errors via Redis pub/sub
- Sets room status to 'error' if workflow fails
- Does not throw exceptions (graceful error recovery)

### LogEmitterService

#### `emitLog(roomId, agentType, level, message, metadata?): Promise<void>`

Emits a log message to Redis pub/sub for SSE streaming.

**Parameters:**
- `roomId`: Room identifier
- `agentType`: 'story' | 'asset' | 'code' | 'deploy' | 'orchestrator'
- `level`: 'info' | 'warn' | 'error' | 'success'
- `message`: Log message text
- `metadata`: Optional additional data

### WebSocketNotificationService

#### `sendDeploymentNotification(roomId, deploymentUrl, codeCid): Promise<void>`

Sends deployment completion notification via WebSocket.

**Parameters:**
- `roomId`: Room identifier
- `deploymentUrl`: Deployed application URL
- `codeCid`: IPFS CID of deployed code

## Correctness Properties

The orchestrator implements the following verified properties:

### Property 44: Agent retry with exponential backoff
*For any* agent failure, retries should occur with delays following the pattern: 2s, 4s, 8s (exponential backoff with base 2).

**Validates**: Requirements 12.1

### Property 45: Workflow continuation after agent failure
*For any* agent that exhausts all retry attempts, the orchestrator should continue executing remaining agents in the workflow.

**Validates**: Requirements 12.2

### Property 14: Deployment WebSocket notification
*For any* completed deployment, a success notification should be sent via WebSocket and received by connected clients.

**Validates**: Requirements 4.3

## Requirements Traceability

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| 12.1 - Retry Logic | `executeAgentWithRetry()` | Property 44 |
| 12.2 - Error Recovery | `executeWorkflow()` | Property 45 |
| 5.1 - Log Emission | `LogEmitterService` | Integration |
| 5.2 - Log Format | `AgentLog` interface | Integration |
| 4.3 - WebSocket Notifications | `WebSocketNotificationService` | Property 14 |

## Performance

- **Workflow Execution**: ~10-15 seconds (all agents succeed)
- **Retry Overhead**: +2s, +4s, +8s per failed attempt
- **Log Emission**: < 10ms per log
- **WebSocket Notification**: < 50ms delivery

## Monitoring

The orchestrator emits logs for:
- Workflow start/completion
- Agent execution start/completion
- Retry attempts with delays
- Errors with full context
- User rewards

All logs include:
- Timestamp (ISO 8601)
- Agent type
- Log level
- Message
- Metadata (optional)

## Contributing

This service follows the HauntedAI architecture guidelines:
- Separation of concerns
- Dependency injection
- Interface-based design
- Comprehensive testing
- Property-based verification

## License

MIT

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
