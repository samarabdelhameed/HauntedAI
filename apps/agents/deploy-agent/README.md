# DeployAgent - HauntedAI Deployment Service

**Managed by Kiro** | Autonomous deployment agent for HauntedAI

## Overview

DeployAgent is a micro-service that automatically deploys generated code to Vercel. It fetches code from IPFS using CIDs and creates production deployments.

## Features

- ✅ Fetch code from IPFS/Storacha using CID
- ✅ Deploy to Vercel using API
- ✅ Automatic retry with exponential backoff
- ✅ Deployment status monitoring
- ✅ Health check endpoint
- ✅ Comprehensive error handling

## Architecture

```
DeployAgent
├── Fetch code from IPFS (via CID)
├── Deploy to Vercel API
├── Wait for deployment to be ready
└── Return deployment URL
```

## API Endpoints

### POST /deploy

Deploy code to Vercel.

**Request Body:**
```json
{
  "codeCid": "bafybeig...",
  "roomId": "uuid",
  "projectName": "optional-project-name"
}
```

**Response (Success):**
```json
{
  "success": true,
  "deploymentUrl": "https://haunted-abc123.vercel.app",
  "deploymentId": "dpl_abc123"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "vercelConfigured": true
}
```

## Environment Variables

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token_here
VERCEL_TEAM_ID=your_team_id_here  # Optional

# Server Configuration
PORT=3005
NODE_ENV=development

# Service Configuration
SERVICE_NAME=deploy-agent

# Storacha Configuration
STORACHA_DID=your_storacha_did_here
STORACHA_PROOF=your_storacha_proof_here
```

## Getting Started

### Installation

```bash
cd apps/agents/deploy-agent
npm install
```

### Development

```bash
# Start in development mode
npm run dev

# Build
npm run build

# Start production
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Deployment Flow

1. **Receive Request**: POST /deploy with codeCid and roomId
2. **Validate CID**: Check CID format is valid
3. **Fetch Code**: Retrieve code from IPFS using CID
4. **Deploy to Vercel**: Create deployment via Vercel API
5. **Monitor Status**: Poll deployment status until ready
6. **Return URL**: Send deployment URL back to caller

## Error Handling

### Retry Logic

- **Max Retries**: 3 attempts
- **Initial Delay**: 2 seconds
- **Backoff Multiplier**: 2x (exponential)
- **Max Delay**: 30 seconds

### Retryable Errors

- Network timeouts
- 5xx server errors
- 429 rate limit errors
- Temporary IPFS unavailability

### Non-Retryable Errors

- Invalid CID format
- 4xx client errors (except 429)
- Empty code content
- Invalid Vercel token

## Deployment Timeout

- **Maximum Wait Time**: 2 minutes
- **Poll Interval**: 5 seconds
- **States Monitored**: QUEUED → BUILDING → READY

## Integration with Orchestrator

The Orchestrator calls DeployAgent after CodeAgent completes:

```typescript
// Orchestrator workflow
const codeResult = await codeAgent.generate(theme);
const deployResult = await deployAgent.deploy({
  codeCid: codeResult.cid,
  roomId: room.id,
});
```

## Vercel Configuration

### Getting Vercel Token

1. Go to https://vercel.com/account/tokens
2. Create new token with deployment permissions
3. Copy token to `.env` file

### Team Deployments

If deploying to a team account:
1. Get team ID from Vercel dashboard
2. Set `VERCEL_TEAM_ID` in `.env`

## Monitoring

### Logs

All operations are logged with timestamps:
- Deployment requests
- IPFS fetch operations
- Vercel API calls
- Retry attempts
- Errors and failures

### Health Check

Monitor service health:
```bash
curl http://localhost:3005/health
```

## Testing

### Manual Testing

```bash
# Test deployment
curl -X POST http://localhost:3005/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "codeCid": "bafybeig...",
    "roomId": "test-room-123"
  }'
```

### Property-Based Tests

See `src/*.property.test.ts` for property-based tests that verify:
- Deployment trigger correctness
- Information persistence
- Retry logic
- Notification delivery

## Requirements Validation

This service implements:
- ✅ **Requirement 4.1**: Deployment automation
- ✅ **Requirement 4.2**: Deployment information persistence
- ✅ **Requirement 4.3**: Completion notifications
- ✅ **Requirement 4.4**: Retry logic

## Correctness Properties

### Property 12: Code completion triggers deployment
*For any* completed code generation, DeployAgent should be automatically triggered within 1 second.

### Property 13: Deployment information persistence
*For any* successful deployment, the database should contain a record with both deployment URL and code CID.

### Property 14: Deployment WebSocket notification
*For any* completed deployment, a success notification should be sent via WebSocket and received by connected clients.

## Troubleshooting

### Common Issues

**Issue**: "VERCEL_TOKEN not set"
- **Solution**: Add Vercel token to `.env` file

**Issue**: "Invalid CID format"
- **Solution**: Ensure CID starts with "bafy" and is valid

**Issue**: "Deployment timeout"
- **Solution**: Check Vercel dashboard for deployment status

**Issue**: "Failed to fetch from IPFS"
- **Solution**: Verify CID is valid and content is available

## Contributing

This service is part of the HauntedAI platform. Follow the project's contribution guidelines.

## License

MIT

---

**Generated by Kiro** | HauntedAI Platform | Hackathon 2024
