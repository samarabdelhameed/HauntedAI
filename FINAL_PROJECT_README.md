# 👻 HauntedAI - Autonomous Multi-Agent AI Platform

**A spooky AI platform where autonomous agents generate stories, images, code, and deploy them to IPFS - all powered by Web3 and blockchain rewards.**

[![Status](https://img.shields.io/badge/Status-Operational-success)]()
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-blue)]()
[![Backend](https://img.shields.io/badge/Backend-NestJS-red)]()
[![Blockchain](https://img.shields.io/badge/Blockchain-BSC%20Testnet-yellow)]()
[![Storage](https://img.shields.io/badge/Storage-IPFS-purple)]()

---

## 🎯 What is HauntedAI?

HauntedAI is a **multi-agent AI system** that autonomously generates spooky content through a coordinated workflow of specialized AI agents. Each agent performs a specific task, and all generated content is stored permanently on decentralized storage (IPFS).

### Key Features

- 🤖 **4 Autonomous AI Agents** (Story, Asset, Code, Deploy)
- 🔗 **Web3 Authentication** (MetaMask)
- 📡 **Real-time Logging** (Server-Sent Events)
- 💾 **Decentralized Storage** (Storacha/IPFS)
- 🪙 **Token Economy** (HHCW ERC20 Token)
- 🏆 **NFT Badges** (ERC721 Achievements)
- 🎨 **Spooky UI** (Dark theme with animations)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- MetaMask browser extension
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd haunted-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Infrastructure

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Start Backend

```bash
cd apps/api
npm install
npm run start:dev
```

### 5. Start Frontend

```bash
cd apps/web
npm install
npm run dev
```

### 6. Open Browser

```
Frontend: http://localhost:5173
API: http://localhost:3001
API Docs: http://localhost:3001/api/docs
```

---

## 🎮 How to Use

### 1. Connect Wallet

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Sign authentication message

### 2. Create a Room

1. Click "New Session" on Dashboard
2. Enter your haunted idea (e.g., "A haunted castle with mysterious whispers")
3. Click "Summon Agents"

### 3. Start Workflow

1. You'll be redirected to the Live Room
2. Click "Start Workflow"
3. Watch real-time logs as agents work
4. See generated assets appear

### 4. Explore Content

1. Go to Explore page
2. Browse all generated content
3. Filter by agent type
4. Click to view details and copy CIDs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)                   │
│  Landing → Dashboard → Live Room → Explore                  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + SSE
┌────────────────────┴────────────────────────────────────────┐
│                   API Gateway (NestJS)                       │
│  Auth → Rooms → Assets → Tokens → SSE                      │
└────────────────────┬────────────────────────────────────────┘
                     │ Message Queue
┌────────────────────┴────────────────────────────────────────┐
│                  Agent Services (Node.js)                    │
│  Orchestrator → Story → Asset → Code → Deploy              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│              Storage & Blockchain Layer                      │
│  PostgreSQL + Redis + Storacha/IPFS + BSC Testnet          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Agents

### 1. StoryAgent
- **Purpose**: Generate spooky stories
- **AI Model**: OpenAI GPT-4
- **Input**: User prompt
- **Output**: Haunting story text
- **Storage**: Storacha/IPFS

### 2. AssetAgent
- **Purpose**: Create spooky images
- **AI Model**: DALL-E 3
- **Input**: Story summary
- **Output**: Haunting image
- **Storage**: Storacha/IPFS

### 3. CodeAgent
- **Purpose**: Generate mini-game code
- **AI Model**: OpenAI Codex
- **Input**: Story theme
- **Output**: HTML/JS game code
- **Storage**: Storacha/IPFS

### 4. DeployAgent
- **Purpose**: Deploy to IPFS
- **Input**: Code CID
- **Output**: Deployment URL
- **Storage**: IPFS gateway

### 5. Orchestrator
- **Purpose**: Coordinate workflow
- **Features**: Retry logic, error recovery, log emission
- **Pattern**: Story → Asset → Code → Deploy

---

## 🔗 API Endpoints

### Authentication
```
POST /auth/login - Web3 wallet authentication
```

### Rooms
```
POST /rooms - Create new room
GET /rooms - List user rooms
GET /rooms/:id - Get room details
POST /rooms/:id/start - Start agent workflow
GET /rooms/:id/logs - SSE log stream
```

### Assets
```
GET /assets - List all assets
GET /assets/:id - Get asset details
```

### Tokens
```
GET /tokens/balance/:did - Get token balance
GET /tokens/transactions/:did - Get transaction history
POST /tokens/reward - Reward user (internal)
```

---

## 🪙 Token Economy

### HHCW Token (ERC20)

**Rewards**:
- 🎨 Upload content: **10 HHCW**
- 👁️ View content: **1 HHCW**
- 🤝 Referral: **50 HHCW**

**Contract**: Deployed on BSC Testnet

### Ghost Badge (ERC721)

**Achievements**:
- 🏆 Complete 10 rooms: **Ghost Master Badge**
- 💰 Earn 1000 tokens: **Haunted Millionaire Badge**

**Contract**: Deployed on BSC Testnet

---

## 🎨 UI Features

### Spooky Theme
- Dark mode (#0B0B0B background)
- Orange glow (#FF6B00)
- Red accent (#FF0040)
- Creepster font for headings

### Animations
- Animated background with particles
- Floating ghost sprites
- Glass morphism effects
- Smooth transitions (Framer Motion)

### Sound Effects
- Hover: Subtle whisper
- Click: Ghost sound
- Success: Success chime
- Error: Thunder sound

---

## 🔐 Security

### Implemented
- ✅ JWT authentication
- ✅ Web3 signature verification
- ✅ Input validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention
- ✅ CORS configuration

---

## 📊 Tech Stack

### Frontend
- **Framework**: Vite + React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Web3**: MetaMask
- **Routing**: React Router DOM

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Cache**: Redis
- **Real-time**: SSE
- **Storage**: Storacha/IPFS

### Blockchain
- **Framework**: Foundry
- **Language**: Solidity
- **Network**: BSC Testnet
- **Standards**: ERC20, ERC721
- **Library**: ethers.js

### AI Services
- **OpenAI GPT-4**: Story generation
- **DALL-E 3**: Image generation
- **OpenAI Codex**: Code generation

---

## 📁 Project Structure

```
haunted-ai/
├── apps/
│   ├── web/                 # Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── pages/
│   │   │   └── utils/
│   │   └── package.json
│   ├── api/                 # Backend API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   ├── prisma/
│   │   │   └── main.ts
│   │   └── package.json
│   ├── blockchain/          # Smart Contracts
│   │   ├── src/
│   │   ├── script/
│   │   └── test/
│   └── agents/              # AI Agents
│       ├── story-agent/
│       ├── asset-agent/
│       ├── code-agent/
│       ├── deploy-agent/
│       └── orchestrator/
├── docs/                    # Documentation
├── .kiro/                   # Kiro configuration
└── docker-compose.dev.yml
```

---

## 🧪 Testing

### Run All Tests

```bash
# Backend tests
cd apps/api
npm test

# Smart contract tests
cd apps/blockchain
forge test

# Frontend tests
cd apps/web
npm test
```

### Test Coverage

- ✅ Unit tests
- ✅ Integration tests
- ✅ Property-based tests
- ✅ E2E tests

---

## 📚 Documentation

### Available Docs
- `README.md` - This file
- `apps/web/README.md` - Frontend documentation
- `apps/web/QUICKSTART.md` - Quick start guide
- `apps/blockchain/README.md` - Smart contracts guide
- `test-frontend-integration.md` - Testing guide
- `PROJECT_STATUS_SUMMARY.md` - Project status

---

## 🐛 Troubleshooting

### MetaMask Not Detected
**Solution**: Install MetaMask extension and refresh page

### API Connection Failed
**Solution**: Check backend is running on port 3001

### SSE Not Working
**Solution**: Check CORS enabled, check network tab

### Database Connection Error
**Solution**: Check PostgreSQL is running, check .env file

---

## 🚀 Deployment

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

### Smart Contracts (BSC Mainnet)
```bash
cd apps/blockchain
forge script script/DeployHHCWToken.s.sol --rpc-url $BSC_RPC_URL --broadcast
```

---

## 🤝 Contributing

We welcome contributions! Please see `docs/CONTRIBUTING.md` for guidelines.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🎯 Roadmap

### Phase 1: Core MVP ✅
- ✅ Multi-agent workflow
- ✅ Web3 authentication
- ✅ Real-time logging
- ✅ IPFS storage
- ✅ Token economy

### Phase 2: Enhanced Features (In Progress)
- [ ] More AI agents
- [ ] Advanced visualizations
- [ ] Multi-language support
- [ ] Mobile app

### Phase 3: Production (Planned)
- [ ] Mainnet deployment
- [ ] Performance optimization
- [ ] Security audit
- [ ] Marketing launch

---

## 🏆 Hackathon Submission

This project demonstrates:
- ✅ **Kiro Integration**: Specs-driven development
- ✅ **AI Innovation**: Multi-agent coordination
- ✅ **Web3 Integration**: Wallet auth + smart contracts
- ✅ **Decentralization**: IPFS storage
- ✅ **Real-time Features**: SSE streaming
- ✅ **Professional UI**: Spooky theme with animations

---

## 📞 Contact

- **Project**: HauntedAI
- **Platform**: Kiro
- **Status**: Operational
- **Demo**: http://localhost:5173

---

## 🎉 Acknowledgments

- **Kiro**: For the amazing development platform
- **OpenAI**: For GPT-4, DALL-E, and Codex
- **Storacha**: For decentralized storage
- **BSC**: For blockchain infrastructure

---

**Built with 👻 by the HauntedAI Team**

**Managed by Kiro** | Hackathon 2024 | ✅ Operational
