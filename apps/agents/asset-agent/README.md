# AssetAgent - Spooky Image Generation Service

**Managed by Kiro** | Part of HauntedAI Platform

## Overview

AssetAgent is a micro-service that generates spooky images using OpenAI's DALL-E 3 based on story content. It automatically creates atmospheric, gothic horror images and stores them on the decentralized Storacha/IPFS network.

## Features

- 🎨 **DALL-E 3 Integration**: High-quality image generation with spooky styling
- 📦 **Storacha Storage**: Decentralized storage with CID tracking
- 🔄 **Retry Logic**: Exponential backoff for API failures (3 attempts)
- 🗜️ **Image Optimization**: Automatic compression for images > 1MB
- 🏥 **Health Checks**: Built-in health monitoring endpoint
- 📝 **Comprehensive Logging**: Detailed operation logging

## Requirements

- Node.js 20+
- OpenAI API key with DALL-E 3 access
- Storacha account (optional - uses default if not configured)

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key
```

## Configuration

Create a `.env` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3003
```

## Usage

### Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Production

```bash
# Build TypeScript
npm run build

# Start service
npm start
```

### Docker

```bash
# Build image
docker build -f Dockerfile.dev -t asset-agent .

# Run container
docker run -p 3003:3003 \
  -e OPENAI_API_KEY=your_key \
  asset-agent
```

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "asset-agent",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "openai": {
    "connected": true
  }
}
```

### Generate Asset

```bash
POST /generate
Content-Type: application/json

{
  "story": "A dark and spooky tale...",
  "storySummary": "Optional brief summary",
  "userId": "user-123",
  "roomId": "room-456"
}
```

Response:
```json
{
  "imageCid": "bafybeig...",
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "metadata": {
    "size": 524288,
    "format": "png",
    "width": 1024,
    "height": 1024,
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "model": "dall-e-3",
    "prompt": "Dark gothic horror scene..."
  }
}
```

## Architecture

```
┌─────────────────────────────────────────┐
│         AssetAgent Service              │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      Express Server              │  │
│  │  - POST /generate                │  │
│  │  - GET /health                   │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────▼───────────────────┐  │
│  │      AssetService                │  │
│  │  - Generate image prompt         │  │
│  │  - Call DALL-E 3 API            │  │
│  │  - Download & optimize image     │  │
│  │  - Upload to Storacha           │  │
│  │  - Retry logic with backoff     │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────▼───────────────────┐  │
│  │    StorachaClient                │  │
│  │  - Upload to IPFS                │  │
│  │  - Return CID                    │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   OpenAI DALL-E 3      Storacha/IPFS
```

## Error Handling

The service implements comprehensive error handling:

- **Rate Limits**: Automatic retry with exponential backoff
- **Network Errors**: Retry up to 3 times
- **Invalid Input**: Clear validation error messages
- **API Failures**: Detailed error logging

## Testing

The service includes:

- Unit tests for core functionality
- Property-based tests for correctness
- Integration tests with real APIs

```bash
# Run all tests
npm test

# Run specific test file
npm test -- asset.service.test.ts

# Run with coverage
npm run test:coverage
```

## Performance

- Image generation: ~10-30 seconds (DALL-E 3)
- Image optimization: ~1-2 seconds
- Storacha upload: ~2-5 seconds
- Total: ~15-40 seconds per request

## Monitoring

The service logs:

- All API calls and responses
- Retry attempts and delays
- Error details with stack traces
- Performance metrics

## Requirements Validation

This service implements:

- ✅ **Requirement 2.1**: Image generation from story using DALL-E 3
- ✅ **Requirement 2.2**: Storacha storage with CID return
- ✅ **Requirement 2.4**: Retry logic with exponential backoff
- ✅ Image optimization for files > 1MB
- ✅ Health check endpoint
- ✅ Comprehensive error handling

## Kiro Integration

This service showcases Kiro's capabilities:

- ✅ **Generated by Kiro**: All code managed by Kiro specs
- ✅ **MCP Integration**: Real OpenAI and Storacha APIs
- ✅ **Property-Based Testing**: Formal correctness verification
- ✅ **Steering Docs**: Follows architecture guidelines
- ✅ **Type-Safe**: Full TypeScript implementation

## License

MIT

---

**Generated by Kiro** | HauntedAI Platform | Hackathon 2024
