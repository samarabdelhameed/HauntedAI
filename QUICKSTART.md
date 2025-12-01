# 🚀 HauntedAI Quick Start Guide

Get HauntedAI running in 5 minutes!

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

## Step 1: Clone & Install (1 min)

```bash
# Clone repository
git clone https://github.com/yourusername/haunted-ai.git
cd haunted-ai

# Install dependencies
npm install
```

## Step 2: Configure Environment (1 min)

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your keys (optional for basic testing)
# OPENAI_API_KEY=sk-...
# STORACHA_DID=did:key:...
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://...
```

## Step 3: Start Services (2 mins)

```bash
# Start PostgreSQL and Redis with Docker
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
sleep 5

# Run database migrations
cd apps/api
npm run db:migrate
cd ../..
```

## Step 4: Start API (30 seconds)

```bash
# Start API server
cd apps/api
npm run dev
```

The API will be available at `http://localhost:3001`

## Step 5: Test It! (30 seconds)

Open a new terminal and run:

```bash
# Run E2E test
node apps/api/test-e2e-user-scenario.js
```

You should see:

```
🎃 HauntedAI - End-to-End User Scenario Test 🎃
============================================================

📋 Step 1: Health Check
✓ API is healthy

📋 Step 2: Create New Room
✓ Room created successfully
  Room ID: room-1733058123456-abc
  Status: idle

📋 Step 3: Get Room Details
✓ Room details retrieved

📋 Step 4: Start Workflow
✓ Workflow started

📋 Step 5: Monitor Live Logs (SSE)
✓ SSE connection established
  [INFO] orchestrator: Starting workflow
  [SUCCESS] story: Story generated successfully

📋 Step 6: Verify Final Room Status
✓ Final room status retrieved

============================================================
🎉 User Scenario Test Completed Successfully! 🎉
============================================================
```

## 🎯 What's Next?

### Run Property Tests

```bash
cd apps/api
npm test -- live-logging.property.test.ts --runInBand
```

### View API Documentation

Open `http://localhost:3001/api/docs` in your browser

### Try the API

```bash
# Create a room
curl -X POST http://localhost:3001/api/v1/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "inputText": "Tell me a spooky story"
  }'

# Start workflow
curl -X POST http://localhost:3001/api/v1/rooms/{ROOM_ID}/start

# Monitor logs (in browser or with curl)
curl http://localhost:3001/api/v1/rooms/{ROOM_ID}/logs
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

### Redis Connection Error

```bash
# Check if Redis is running
docker ps | grep redis

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis
```

## 📚 Learn More

- [Full README](README.md)
- [E2E Testing Guide](docs/E2E_TESTING_GUIDE.md)
- [Kiro Integration](docs/KIRO_INTEGRATION.md)
- [API Documentation](http://localhost:3001/api/docs)

## 🎉 You're Ready!

HauntedAI is now running. Check out the full documentation to explore all features!

---

**Built with Kiro** | HauntedAI Platform
