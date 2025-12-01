---
title: Architecture Guidelines for HauntedAI
inclusion: always
---

# Architecture Guidelines for HauntedAI

**Managed by Kiro** | System Architecture & Design Patterns

## Purpose

This document defines architectural standards and patterns for the HauntedAI platform. All code MUST follow these guidelines to ensure consistency, scalability, and maintainability.

## Architecture Overview

HauntedAI follows a **micro-services architecture** with clear separation of concerns:

```
Frontend (Next.js) → API Gateway (NestJS) → Agent Services → Storage/Blockchain
```

## Core Principles

### 1. Separation of Concerns

Each service has a single, well-defined responsibility:
- **API Gateway**: Request routing, authentication, validation
- **Orchestrator**: Workflow coordination, retry logic
- **Agents**: Specific AI operations (story, asset, code, deploy)
- **Storage**: Data persistence and retrieval
- **Blockchain**: Token economy and NFT management

### 2. Dependency Injection

Use NestJS dependency injection for all services:

```typescript
@Injectable()
export class MyService {
  constructor(
    private readonly dependency: DependencyService,
  ) {}
}
```

### 3. Interface-Based Design

Define clear interfaces for all components:

```typescript
interface AgentLog {
  timestamp: Date;
  agentType: 'story' | 'asset' | 'code' | 'deploy' | 'orchestrator';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  metadata?: Record<string, any>;
}
```

## Service Communication

### Real-Time Communication (SSE)

Use Server-Sent Events for real-time log streaming:

```typescript
// Server
res.setHeader('Content-Type', 'text/event-stream');
res.write(`event: log\ndata: ${JSON.stringify(log)}\n\n`);

// Client
const eventSource = new EventSource('/api/v1/rooms/:id/logs');
eventSource.addEventListener('log', (event) => {
  const log = JSON.parse(event.data);
  // Handle log
});
```

### Pub/Sub Messaging (Redis)

Use Redis pub/sub for inter-service communication:

```typescript
// Publisher
await redis.publish(`room:${roomId}:logs`, JSON.stringify(log));

// Subscriber
await redis.subscribe(`room:${roomId}:logs`, (message) => {
  const log = JSON.parse(message);
  // Handle log
});
```

### HTTP/REST APIs

Use RESTful conventions for all HTTP endpoints:

```
POST   /api/v1/rooms          - Create resource
GET    /api/v1/rooms/:id      - Get resource
PUT    /api/v1/rooms/:id      - Update resource
DELETE /api/v1/rooms/:id      - Delete resource
GET    /api/v1/rooms          - List resources
```

## Error Handling

### Error Types

Define custom error classes:

```typescript
class AgentError extends Error {
  constructor(
    public agentName: string,
    public code: string,
    message: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'AgentError';
  }
}
```

### Error Recovery

Implement exponential backoff for retries:

```typescript
async function executeWithRetry(fn, maxAttempts = 3) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) throw error;
      
      const delay = Math.min(
        2000 * Math.pow(2, attempt - 1),
        30000
      );
      await sleep(delay);
    }
  }
}
```

### Global Error Handler

Use NestJS exception filters:

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    // Log error
    logger.error(exception);
    
    // Return appropriate response
    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Data Flow

### Request Flow

```
1. Client → API Gateway
2. API Gateway → Validate & Authenticate
3. API Gateway → Route to Service
4. Service → Process Request
5. Service → Update Database
6. Service → Emit Logs (Redis)
7. SSE → Stream Logs to Client
8. Service → Return Response
9. API Gateway → Return to Client
```

### Workflow Orchestration

```
1. User Input → Orchestrator
2. Orchestrator → StoryAgent
3. StoryAgent → Generate Story → Upload to Storacha
4. Orchestrator → AssetAgent
5. AssetAgent → Generate Image → Upload to Storacha
6. Orchestrator → CodeAgent
7. CodeAgent → Generate Code → Test → Upload to Storacha
8. Orchestrator → DeployAgent
9. DeployAgent → Deploy to Vercel
10. Orchestrator → Update Room Status → Reward User
```

## Database Design

### Schema Principles

1. **Normalization**: Avoid data duplication
2. **Indexing**: Index all foreign keys and frequently queried fields
3. **Timestamps**: Always include `createdAt` and `updatedAt`
4. **Soft Deletes**: Use status flags instead of hard deletes when appropriate

### Prisma Best Practices

```typescript
// Use transactions for related operations
await prisma.$transaction([
  prisma.room.update({ /* ... */ }),
  prisma.asset.create({ /* ... */ }),
]);

// Use select to limit returned fields
const room = await prisma.room.findUnique({
  where: { id },
  select: {
    id: true,
    status: true,
    owner: {
      select: {
        username: true,
      },
    },
  },
});
```

## Security

### Authentication

- Use JWT tokens for API authentication
- Store tokens securely (httpOnly cookies or localStorage)
- Implement token refresh mechanism
- Validate tokens on every protected route

### Authorization

- Check user permissions before operations
- Verify resource ownership
- Use role-based access control (RBAC)

### Input Validation

```typescript
// Use class-validator
export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  inputText: string;
}
```

### Rate Limiting

Implement rate limiting for all public endpoints:

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
@Controller('api/v1/rooms')
export class RoomsController {
  // ...
}
```

## Performance

### Caching Strategy

- Cache frequently accessed data in Redis
- Use TTL for cache invalidation
- Implement cache-aside pattern

### Database Optimization

- Use connection pooling
- Implement pagination for list endpoints
- Use database indexes effectively
- Monitor slow queries

### API Optimization

- Implement response compression
- Use CDN for static assets
- Minimize payload size
- Implement lazy loading

## Monitoring & Observability

### Logging

Use structured logging:

```typescript
logger.log({
  level: 'info',
  message: 'Room created',
  roomId: room.id,
  userId: user.id,
  timestamp: new Date().toISOString(),
});
```

### Metrics

Track key metrics:
- Request count and latency
- Error rate
- Active connections (SSE, WebSocket)
- Database query performance
- Agent execution time

### Health Checks

Implement health check endpoints:

```typescript
@Get('/health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
    },
  };
}
```

## Deployment

### Docker

- Use multi-stage builds
- Minimize image size
- Use .dockerignore
- Set appropriate resource limits

### Environment Variables

- Never commit secrets
- Use .env.example for documentation
- Validate required env vars on startup

### CI/CD

Pipeline stages:
1. Lint
2. Test
3. Build
4. Deploy to staging
5. Run smoke tests
6. Deploy to production (manual approval)

## Kiro Integration

This architecture showcases Kiro's capabilities:

- ✅ **Spec-driven**: Architecture follows design.md
- ✅ **Modular**: Clear separation of concerns
- ✅ **Testable**: Easy to test each component
- ✅ **Scalable**: Micro-services can scale independently
- ✅ **Observable**: Comprehensive logging and monitoring

## Architecture Checklist

Before implementing new features:

- [ ] Service responsibility is clear and single-purpose
- [ ] Interfaces are well-defined
- [ ] Error handling is comprehensive
- [ ] Logging is structured and meaningful
- [ ] Tests cover all paths
- [ ] Documentation is complete
- [ ] Security is considered
- [ ] Performance is optimized

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
