# 🚀 How to Run HauntedAI - Complete Guide

**Last Updated**: December 2, 2025  
**Status**: ✅ All Systems Operational

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Node.js 20+** installed
- ✅ **Docker & Docker Compose** installed
- ✅ **MetaMask** browser extension installed
- ✅ **Git** installed
- ✅ **Terminal/Command Line** access

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd haunted-ai
```

### Step 2: Install Root Dependencies

```bash
npm install
```

### Step 3: Start Infrastructure (PostgreSQL + Redis)

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Wait 10 seconds** for services to start.

### Step 4: Setup Backend API

```bash
cd apps/api

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Start API
npm run start:dev
```

**API will be available at**: http://localhost:3001

### Step 5: Setup Frontend

Open a **new terminal**:

```bash
cd apps/web

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Frontend will be available at**: http://localhost:5173

### Step 6: Open Browser

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Sign authentication message
5. Start creating haunted content! 👻

---

## 🔧 Detailed Setup

### 1. Infrastructure Setup

#### Start Docker Services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379

#### Verify Services

```bash
# Check PostgreSQL
docker ps | grep postgres

# Check Redis
docker ps | grep redis
```

---

### 2. Backend API Setup

#### Install Dependencies

```bash
cd apps/api
npm install
```

#### Configure Environment

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/haunted_ai?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Blockchain (BSC Testnet)
BLOCKCHAIN_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
PRIVATE_KEY=your-private-key-here
HHCW_TOKEN_ADDRESS=0x...
GHOST_BADGE_ADDRESS=0x...
TREASURY_ADDRESS=0x...

# Storacha
STORACHA_DID=your-storacha-did
STORACHA_PROOF=your-storacha-proof
```

#### Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

#### Start API

```bash
npm run start:dev
```

**Verify**: Open http://localhost:3001/api/docs (Swagger UI)

---

### 3. Frontend Setup

#### Install Dependencies

```bash
cd apps/web
npm install
```

#### Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=HauntedAI
VITE_ENABLE_SOUNDS=true
```

#### Start Frontend

```bash
npm run dev
```

**Verify**: Open http://localhost:5173

---

### 4. (Optional) Agent Services

If you want to run agents locally:

#### Story Agent

```bash
cd apps/agents/story-agent
npm install
npm run dev
```

#### Asset Agent

```bash
cd apps/agents/asset-agent
npm install
npm run dev
```

#### Code Agent

```bash
cd apps/agents/code-agent
npm install
npm run dev
```

#### Deploy Agent

```bash
cd apps/agents/deploy-agent
npm install
npm run dev
```

#### Orchestrator

```bash
cd apps/agents/orchestrator
npm install
npm run dev
```

---

## 🧪 Testing the System

### 1. Test Authentication

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Approve MetaMask
4. Sign message
5. Should redirect to Dashboard

**Expected**: User authenticated, JWT stored

### 2. Test Room Creation

1. On Dashboard, click "New Session"
2. Enter: "A haunted castle with mysterious whispers"
3. Click "Summon Agents"
4. Should redirect to Live Room

**Expected**: Room created, ID displayed

### 3. Test Workflow

1. On Live Room, click "Start Workflow"
2. Watch logs appear in real-time
3. Wait for agents to complete
4. Assets should appear in right panel

**Expected**: Real-time logs, assets generated

### 4. Test Explore

1. Go to Explore page
2. Should see generated assets
3. Try filtering by agent type
4. Try searching
5. Click on asset to view details

**Expected**: Assets displayed, filtering works

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Solution**:
```bash
# Kill process on port 3001 (API)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (Frontend)
lsof -ti:5173 | xargs kill -9
```

### Issue: Database Connection Failed

**Solution**:
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres

# Check connection
psql postgresql://postgres:postgres@localhost:5432/haunted_ai
```

### Issue: MetaMask Not Detected

**Solution**:
1. Install MetaMask extension
2. Refresh page
3. Check browser console for errors

### Issue: API Returns 401 Unauthorized

**Solution**:
1. Logout and login again
2. Check JWT token in localStorage
3. Check JWT_SECRET in backend .env

### Issue: SSE Connection Drops

**Solution**:
1. Check backend is running
2. Check CORS settings
3. Check network tab in browser dev tools

### Issue: No Logs Appearing

**Solution**:
1. Check Redis is running
2. Check SSE connection in network tab
3. Check backend logs for errors

---

## 📊 Verify Everything is Working

### Backend API ✅

```bash
# Health check
curl http://localhost:3001/health

# API docs
open http://localhost:3001/api/docs
```

### Frontend ✅

```bash
# Open in browser
open http://localhost:5173
```

### Database ✅

```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5432/haunted_ai

# Check tables
\dt

# Check users
SELECT * FROM users;
```

### Redis ✅

```bash
# Connect to Redis
docker exec -it <redis-container-id> redis-cli

# Check keys
KEYS *
```

---

## 🔄 Restart Everything

If something goes wrong, restart everything:

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Kill all node processes
pkill -f node

# Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Wait 10 seconds
sleep 10

# Start backend
cd apps/api && npm run start:dev &

# Start frontend
cd apps/web && npm run dev &
```

---

## 📝 Development Workflow

### Making Changes

1. **Frontend changes**: Auto-reload (Vite HMR)
2. **Backend changes**: Auto-reload (NestJS watch mode)
3. **Database changes**: Run `npx prisma migrate dev`

### Running Tests

```bash
# Backend tests
cd apps/api
npm test

# Frontend tests
cd apps/web
npm test

# Smart contract tests
cd apps/blockchain
forge test
```

### Building for Production

```bash
# Backend
cd apps/api
npm run build

# Frontend
cd apps/web
npm run build

# Output in dist/ folder
```

---

## 🚀 Production Deployment

### Frontend (Vercel)

```bash
cd apps/web
npm run build
vercel deploy
```

### Backend (Railway/Heroku)

```bash
cd apps/api
npm run build
# Deploy to your platform
```

### Database (Supabase/Railway)

1. Create PostgreSQL database
2. Update DATABASE_URL in .env
3. Run migrations: `npx prisma migrate deploy`

---

## 📞 Need Help?

### Check Logs

```bash
# Backend logs
cd apps/api
npm run start:dev

# Frontend logs
cd apps/web
npm run dev

# Docker logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Common Commands

```bash
# Check running processes
ps aux | grep node

# Check ports
lsof -i :3001
lsof -i :5173

# Check Docker containers
docker ps

# Check Docker logs
docker logs <container-id>
```

---

## ✅ Success Checklist

Before considering setup complete:

- [ ] Docker services running (PostgreSQL + Redis)
- [ ] Backend API running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can open http://localhost:5173
- [ ] Can connect MetaMask wallet
- [ ] Can authenticate successfully
- [ ] Can create a room
- [ ] Can start workflow
- [ ] Can see real-time logs
- [ ] Can view assets
- [ ] Can explore content

---

## 🎉 You're Ready!

If all checks pass, you're ready to use HauntedAI!

**Next Steps**:
1. Create your first haunted room
2. Watch agents work in real-time
3. Explore generated content
4. Earn HHCW tokens
5. Unlock Ghost Badges

---

**Managed by Kiro** | HauntedAI Platform | Setup Complete ✅
