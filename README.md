# 🎃 HauntedAI - Multi-Agent AI Platform

**Where Agents Come Alive** | *Autonomous AI Content Generation on Decentralized Storage*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Blockchain](https://img.shields.io/badge/Blockchain-Polygon-purple.svg)](https://polygon.technology/)

## 🌟 Overview

HauntedAI is a revolutionary multi-agent AI platform that autonomously generates spooky content through a coordinated workflow of specialized AI agents. Built with cutting-edge technologies, it combines the power of OpenAI's GPT-4 and DALL-E with decentralized storage on IPFS/Storacha, creating an immersive and permanent content creation experience.

### ✨ Key Features

- 🤖 **4 Autonomous AI Agents** - Story, Asset, Code, and Deploy agents working in harmony
- 🔗 **Decentralized Storage** - All content permanently stored on IPFS/Storacha with CIDs
- 🎮 **Interactive 3D UI** - Spooky Three.js visualizations with real-time agent animations
- 🔐 **Web3 Authentication** - Wallet-based login with JWT tokens
- 🪙 **Token Economy** - HHCW ERC20 rewards and Ghost Badge NFTs on Polygon
- 📊 **Real-time Monitoring** - Live logs via SSE and comprehensive metrics
- 🌐 **Multi-language** - English and Arabic support with RTL
- 🎵 **Immersive Audio** - Spooky sound effects with Howler.js

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                    │
│  🎨 Spooky UI + Three.js + Web3 + Real-time Logs          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + WebSocket + SSE
┌────────────────────┴────────────────────────────────────────┐
│                  API Gateway (NestJS)                       │
│  🔐 Auth + 🏠 Rooms + 🎨 Assets + 🪙 Tokens + 📊 Metrics  │
└────────────────────┬────────────────────────────────────────┘
                     │ Redis Pub/Sub + HTTP
┌────────────────────┴────────────────────────────────────────┐
│                   Agent Services Layer                       │
│  📖 StoryAgent  🎨 AssetAgent  💻 CodeAgent  🚀 DeployAgent │
│     (GPT-4)       (DALL-E)      (Codex)      (Vercel)     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│              Storage & Blockchain Layer                      │
│  🗄️ PostgreSQL  📦 Redis  🌐 Storacha/IPFS  ⛓️ Polygon    │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+**
- **Docker & Docker Compose**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/hauntedai/platform.git
cd platform
```

### 2. Environment Setup

```bash
# Copy environment templates
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Add your API keys to .env files
# Required: OPENAI_API_KEY, STORACHA_DID, STORACHA_PROOF
```

### 3. Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individual services
npm install
npm run dev
```

### 4. Access Applications

- **🎃 Frontend**: http://localhost:3000
- **📚 API Docs**: http://localhost:3001/api/docs
- **📊 Grafana**: http://localhost:3010 (admin/hauntedai2024)
- **📈 Prometheus**: http://localhost:9090

## 🎯 How It Works

### The Agent Workflow

1. **👤 User Input** - Enter a name or spooky idea
2. **📖 StoryAgent** - Generates personalized horror story using GPT-4
3. **🎨 AssetAgent** - Creates haunting image based on story using DALL-E 3
4. **💻 CodeAgent** - Builds interactive mini-game with auto-testing
5. **🚀 DeployAgent** - Deploys to live URL via Vercel
6. **🪙 Rewards** - User receives HHCW tokens and potential NFT badges

### Real-time Experience

- **Live Logs**: Watch agents work in real-time via Server-Sent Events
- **3D Visualization**: See ghost sprites animate for each agent operation
- **Sound Effects**: Immersive audio feedback for all interactions
- **Progress Tracking**: Visual indicators for each workflow step

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Three.js** - 3D graphics and animations
- **Wagmi + Viem** - Web3 wallet integration
- **Howler.js** - Audio management
- **React-i18next** - Internationalization

### Backend
- **NestJS** - Scalable Node.js framework
- **PostgreSQL** - Primary database with Prisma ORM
- **Redis** - Caching and pub/sub messaging
- **Winston** - Structured logging
- **Prometheus** - Metrics collection
- **JWT** - Authentication tokens

### AI & External Services
- **OpenAI GPT-4** - Story generation
- **DALL-E 3** - Image generation
- **OpenAI Codex** - Code generation
- **Storacha/IPFS** - Decentralized storage
- **Vercel** - Code deployment

### Blockchain
- **Polygon Network** - EVM-compatible blockchain
- **Solidity** - Smart contract language
- **Foundry** - Development framework
- **Ethers.js** - Blockchain interaction

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Grafana** - Monitoring dashboards
- **Jest** - Testing framework

## 📊 Smart Contracts

### HHCW Token (ERC20)
- **Symbol**: HHCW
- **Decimals**: 18
- **Rewards**: 10 HHCW for uploads, 1 HHCW for views, 50 HHCW for referrals

### Ghost Badge (ERC721)
- **Achievement Badges**: Unlocked at milestones
- **Milestone Badges**: 10 rooms created, 1000 HHCW earned
- **Metadata**: Stored on IPFS with rich attributes

### Treasury Contract
- **Reward Distribution**: Automated token minting
- **Badge Minting**: Achievement-based NFT creation
- **Access Control**: Role-based permissions

## 🧪 Testing

### Property-Based Testing
```bash
# Run all property tests (81 properties)
npm run test:property

# Run specific property test
npm test -- --testPathPattern=metrics.property.test.ts
```

### Unit Testing
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage
```

### Integration Testing
```bash
# Test complete workflow
node test-complete-user-scenario.js

# Test blockchain integration
node apps/blockchain/test-complete-scenario.js
```

## 📈 Monitoring

### Grafana Dashboards
- **API Metrics**: Request rates, response times, error rates
- **Agent Metrics**: Execution rates, success/failure tracking
- **System Metrics**: CPU, memory, active connections

### Prometheus Metrics
- HTTP request metrics with labels
- Agent execution and failure counters
- System resource utilization
- Custom business metrics

### Alerting Rules
- High error rate (>10%)
- High response time (>5s)
- Agent failures (>5% rate)
- Service availability

## 🔧 Development

### Project Structure
```
├── apps/
│   ├── api/                 # NestJS API Gateway
│   ├── web/                 # Next.js Frontend
│   ├── agents/              # AI Agent Services
│   │   ├── story-agent/     # GPT-4 Story Generation
│   │   ├── asset-agent/     # DALL-E Image Generation
│   │   ├── code-agent/      # Codex Code Generation
│   │   ├── deploy-agent/    # Vercel Deployment
│   │   └── orchestrator/    # Workflow Coordination
│   ├── blockchain/          # Smart Contracts
│   └── shared/              # Shared Types & Utils
├── monitoring/              # Grafana & Prometheus
├── docs/                    # Documentation
└── .kiro/                   # Kiro Configuration
```

### Adding New Features

1. **Define Requirements** in `.kiro/specs/haunted-ai/requirements.md`
2. **Update Design** in `.kiro/specs/haunted-ai/design.md`
3. **Add Tasks** in `.kiro/specs/haunted-ai/tasks.md`
4. **Implement** following architecture guidelines
5. **Test** with property-based and unit tests
6. **Document** in API docs and README

### Code Standards

- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Property-based testing** for correctness
- **Swagger documentation** for APIs
- **Conventional commits** for git history

## 🌐 API Documentation

### Authentication
```bash
# Web3 wallet login
POST /api/v1/auth/login
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message..."
}
```

### Room Management
```bash
# Create new room
POST /api/v1/rooms
Authorization: Bearer <jwt>
{
  "inputText": "A haunted mansion story"
}

# Start agent workflow
POST /api/v1/rooms/:id/start

# Stream live logs
GET /api/v1/rooms/:id/logs
Accept: text/event-stream
```

### Content Discovery
```bash
# Explore public content
GET /api/v1/assets/explore?agentType=story&page=1

# Get asset details
GET /api/v1/assets/:id
```

### Token Operations
```bash
# Get user balance
GET /api/v1/users/:did/balance

# Get transaction history
GET /api/v1/users/:did/transactions
```

**Full API Documentation**: http://localhost:3001/api/docs

## 🎮 User Guide

### Getting Started

1. **Connect Wallet** - Use MetaMask or WalletConnect
2. **Create Room** - Start a new content generation session
3. **Enter Prompt** - Provide a name or spooky idea
4. **Watch Magic** - See agents work in real-time
5. **Collect Rewards** - Earn HHCW tokens and badges

### Features

- **Dashboard** - View your rooms, balance, and badges
- **Live Room** - Real-time agent visualization and logs
- **Explore** - Discover content from other users
- **Profile** - Manage your account and achievements

### Tips

- Use descriptive prompts for better stories
- Watch the 3D visualization for agent status
- Check your token balance after each session
- Explore public content for inspiration

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Submitting Changes

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon

**Built for Kiro Hackathon 2024** - Showcasing the full power of Kiro's AI-assisted development platform.

### Kiro Integration

- ✅ **Spec-driven Development** - Complete requirements and design specs
- ✅ **Property-based Testing** - 81 correctness properties verified
- ✅ **MCP Plugins** - Real API integrations (OpenAI, Storacha)
- ✅ **Steering Documents** - Architecture and testing standards
- ✅ **Hooks** - Automated testing on file save
- ✅ **Multi-language** - English and Arabic support

## 🔗 Links

- **🌐 Live Demo**: https://hauntedai.vercel.app
- **📚 API Docs**: https://api.hauntedai.com/docs
- **📊 Monitoring**: https://monitoring.hauntedai.com
- **🐙 GitHub**: https://github.com/hauntedai/platform
- **📱 Twitter**: https://twitter.com/hauntedai
- **💬 Discord**: https://discord.gg/hauntedai

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 and DALL-E APIs
- **Storacha** for decentralized storage
- **Polygon** for blockchain infrastructure
- **Kiro** for AI-assisted development platform
- **Vercel** for deployment platform

---

**Made with 🎃 by the HauntedAI Team** | *Where Agents Come Alive*