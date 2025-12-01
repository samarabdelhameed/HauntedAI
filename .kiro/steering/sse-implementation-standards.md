---
title: SSE Implementation Standards
inclusion: always
---

# SSE Implementation Standards for HauntedAI

**Managed by Kiro** | Real-time Logging Standards

## Purpose

This steering document defines standards for Server-Sent Events (SSE) implementation across the HauntedAI platform. All agents and services MUST follow these standards when emitting logs.

## Log Message Standards

### Required Fields

Every log message MUST include:
- `timestamp`: ISO 8601 format date
- `agentType`: One of ['story', 'asset', 'code', 'deploy', 'orchestrator']
- `level`: One of ['info', 'warn', 'error', 'success']
- `message`: Clear, descriptive message string

### Optional Fields

- `metadata`: Additional context as key-value pairs
- `userId`: User ID if applicable
- `roomId`: Room ID for context
- `duration`: Operation duration in milliseconds
- `error`: Error object for error-level logs

## Agent Log Emission Rules

### When to Emit Logs

Agents MUST emit logs for:
1. **Operation Start**: When beginning any major operation
2. **Operation Complete**: When successfully completing an operation
3. **Operation Error**: When encountering any error
4. **Progress Updates**: For long-running operations (every 10s)
5. **State Changes**: When changing room or workflow state

### Log Level Guidelines

- **info**: Normal operation progress, state changes
- **success**: Successful completion of operations
- **warn**: Non-critical issues, fallback actions
- **error**: Critical errors, operation failures

### Example Usage

```typescript
// Starting an operation
await this.roomsService.emitLog(
  roomId,
  'story',
  'info',
  'Starting story generation',
  { userId, inputLength: input.length }
);

// Success
await this.roomsService.emitLog(
  roomId,
  'story',
  'success',
  'Story generation completed',
  { storyLength: story.length, duration: 2500 }
);

// Error
await this.roomsService.emitLog(
  roomId,
  'story',
  'error',
  'Story generation failed',
  { error: error.message, retryCount: 2 }
);
```

## Message Format Standards

### Message Structure

Messages MUST be:
- Clear and descriptive
- Present tense for ongoing operations
- Past tense for completed operations
- Include relevant context

### Good Examples ✅

- "Starting story generation with user input"
- "Story generated successfully (2.5s)"
- "Uploading story to Storacha"
- "Story uploaded with CID: bafybeig..."
- "Story generation failed: API rate limit exceeded"

### Bad Examples ❌

- "Starting..." (too vague)
- "Done" (not descriptive)
- "Error" (no context)
- "Processing data" (what data?)

## SSE Connection Standards

### Client Implementation

Clients MUST:
1. Include JWT token in connection
2. Handle all event types (connected, log, heartbeat)
3. Implement reconnection logic
4. Display logs in real-time
5. Handle connection errors gracefully

### Server Implementation

Services MUST:
1. Validate room access before streaming
2. Send heartbeat every 30 seconds
3. Clean up connections on disconnect
4. Log connection events
5. Handle Redis connection failures

## Performance Standards

### Log Volume

- Maximum 10 logs per second per room
- Buffer logs if rate exceeded
- Aggregate similar logs within 1 second

### Connection Limits

- Maximum 100 concurrent SSE connections per server
- Maximum 10 connections per room
- Reject new connections if limit exceeded

### Message Size

- Maximum message size: 10KB
- Truncate large metadata objects
- Use CIDs for large content references

## Error Handling Standards

### Connection Errors

When SSE connection fails:
1. Log error with full context
2. Attempt reconnection (3 times)
3. Fall back to polling if SSE unavailable
4. Notify user of degraded experience

### Redis Errors

When Redis pub/sub fails:
1. Log error to Winston
2. Attempt reconnection with backoff
3. Queue logs in memory (max 100)
4. Flush queue when reconnected

### Client Disconnect

When client disconnects:
1. Clean up SSE connection
2. Unsubscribe from Redis channel
3. Clear heartbeat interval
4. Log disconnection event

## Testing Standards

### Unit Tests Required

- Log emission with all field combinations
- SSE header configuration
- Connection lifecycle management
- Error handling scenarios

### Integration Tests Required

- End-to-end log flow (publish → Redis → SSE → client)
- Multiple concurrent connections
- Connection cleanup on disconnect
- Heartbeat mechanism

### Property Tests Required

- Log message format validation
- Timestamp ordering
- Connection uniqueness
- Buffer size limits

## Monitoring Standards

### Metrics to Track

- Active SSE connections count
- Logs published per second
- Average log delivery latency
- Connection error rate
- Redis pub/sub health

### Alerts to Configure

- SSE connection count > 80
- Log delivery latency > 1s
- Redis connection failures
- High error log rate

## Security Standards

### Authentication

- All SSE endpoints MUST require JWT
- Validate token before streaming
- Check room ownership/access
- Log authentication failures

### Data Privacy

- Never log sensitive user data
- Sanitize error messages
- Redact API keys in logs
- Comply with data retention policies

## Kiro Integration

This implementation showcases Kiro's capabilities:

- ✅ **Spec-driven**: Follows design.md requirements
- ✅ **Type-safe**: Full TypeScript implementation
- ✅ **Testable**: Comprehensive test coverage
- ✅ **Documented**: Inline and external docs
- ✅ **Monitored**: Metrics and logging
- ✅ **Secure**: Authentication and validation

## Compliance Checklist

Before deploying SSE changes:

- [ ] All logs follow message format standards
- [ ] Error handling implemented per standards
- [ ] Unit tests cover all scenarios
- [ ] Integration tests pass
- [ ] Performance within limits
- [ ] Security requirements met
- [ ] Documentation updated
- [ ] Monitoring configured

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
