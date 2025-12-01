# 👻 HauntedAI

> **Where AI Agents Come Alive**  
> A multi-agent AI platform that autonomously generates spooky content and stores it on decentralized networks.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Polygon](https://img.shields.io/badge/Polygon-Blockchain-purple)](https://polygon.technology/)

## 🎯 Overview

HauntedAI is a groundbreaking platform that combines:
- **🤖 Autonomous AI Agents** - Four specialized agents (Story, Asset, Code, Deploy) working independently
- **🌐 Decentralized Storage** - All content stored permanently on Storacha/IPFS
- **⛓️ Blockchain Integration** - HHCW token rewards and Ghost Badge NFTs on Polygon
- **🎨 Immersive 3D UI** - Spooky Three.js visualizations with real-time agent monitoring
- **🔧 Built with Kiro** - Leveraging Kiro's full capabilities (hooks, steering docs, MCP plugins)

## ✨ Features

### 🎭 Multi-Agent System
- **StoryAgent**: Generates personalized spooky stories using GPT-4
- **AssetAgent**: Creates haunting images with DALL-E 3
- **CodeAgent**: Builds mini-games with auto-patching capabilities
- **DeployAgent**: Automatically deploys content to Vercel/IPFS

### 🌟 User Experience
- **Live Room**: Watch agents work in real-time with 3D visualizations
- **Spooky Theme**: Dark mode with purple/red accents, fog effects, and ghost sprites
- **Sound Effects**: Immersive audio with whispers, ghost laughs, and thunder
- **Multi-language**: Full support for English and Arabic (RTL)

### 💰 Token Economy
- **HHCW Token (ERC20)**: Earn rewards for uploads, views, and referrals
- **Ghost Badges (ERC721)**: Unlock NFT achievements for milestones
- **Treasury Contract**: Automated reward distribution

### 🔒 Decentralized & Secure
- **Storacha/IPFS**: Permanent, censorship-resistant content storage
- **Web3 Auth**: Connect with MetaMask or WalletConnect
- **Smart Contracts**: Audited contracts on Polygon

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│  Landing • Dashboard • Live Room • Explore                  │
│  Three.js • TailwindCSS • Wagmi • Howler.js                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + WebSocket + SSE
┌────────────────────┴────────────────────────────────────────┐
│                  API Gateway (NestJS)                        │
│  Auth • Rooms • Assets • Tokens • Swagger Docs             │
└────────────────────┬────────────────────────────────────────┘
                     │ Redis/BullMQ Message Queue
┌────────────────────┴────────────────────────────────────────┐
│                  Agent Micro-services                        │
│  StoryAgent • AssetAgent • CodeAgent • DeployAgent          │
│  Orchestrator (Workflow Coordinator)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│              Storage & Blockchain Layer                      │
│  PostgreSQL • Redis • Storacha/IPFS • Polygon              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7
- OpenAI API Key
- Storacha DID
- Polygon wallet with MATIC

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/haunted-ai.git
cd haunted-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development environment
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start all services
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Grafana**: http://localhost:3002

## 📖 Documentation

- [Requirements](./.kiro/specs/haunted-ai/requirements.md) - Detailed feature requirements
- [Design](./.kiro/specs/haunted-ai/design.md) - Architecture and correctness properties
- [Tasks](./.kiro/specs/haunted-ai/tasks.md) - Implementation plan
- [Testing Guide](./TESTING.md) - Comprehensive testing documentation
- [API Docs](http://localhost:3001/api/docs) - Interactive Swagger documentation
- [Contributing](./CONTRIBUTING.md) - Development guidelines

## 🧪 Testing

### Quick Test
```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage
```

### Current Test Results ✅
- **User CRUD**: 15 tests passing
- **Room CRUD**: 12 tests passing  
- **Asset CRUD**: 10 tests passing
- **Total**: 37 unit tests passing

### Full Testing Guide
See [TESTING.md](./TESTING.md) for comprehensive testing documentation including:
- Manual testing checklist
- API endpoint testing
- Database testing
- Integration testing
- Property-based testing (81 properties planned)

### Test Commands
```bash
# Unit tests only
npm run test:unit

# Property-based tests (coming soon)
npm run test:property

# Load tests (coming soon)
npm run test:load

# Watch mode
npm test -- --watch
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, Three.js, Wagmi |
| **Backend** | NestJS, Express, Socket.io, Prisma |
| **Agents** | Node.js 20, OpenAI SDK, Stability SDK |
| **Storage** | PostgreSQL, Redis, Storacha, IPFS |
| **Blockchain** | Hardhat, Solidity, Ethers.js, Polygon |
| **DevOps** | Docker, GitHub Actions, Prometheus, Grafana |
| **Testing** | Jest, fast-check, Supertest, k6 |

## 🎓 Kiro Integration

HauntedAI showcases the full power of Kiro:

### Hooks
- **on-save**: Automatically run tests when files are saved
- **on-commit**: Run linter before commits

### Steering Docs
- **code-standards.md**: Project coding standards
- **architecture.md**: Architecture guidelines

### MCP Plugins
- **Storacha Plugin**: Seamless IPFS integration
- **OpenAI Plugin**: Direct AI model access

## 🏆 Hackathon Pitch

**Problem**: Traditional AI platforms are centralized, opaque, and don't reward users.

**Solution**: HauntedAI is a fully autonomous, transparent, and rewarding AI platform where:
- ✅ Agents work independently and visibly
- ✅ All content is permanently stored on IPFS
- ✅ Users earn tokens and NFTs for participation
- ✅ Everything is open-source and auditable

**Impact**: Democratizing AI content generation with transparency, permanence, and fair rewards.

## 📊 Current Status & Metrics

### ✅ Completed (Phase 1)
- **Project Structure**: Monorepo with TypeScript, ESLint, Prettier
- **Docker Environment**: Full stack containerization ready
- **Database**: Prisma schema with 5 models (User, Room, Asset, Token, Badge)
- **CI/CD**: GitHub Actions pipeline with lint, test, build, deploy
- **Unit Tests**: 37 tests covering database operations
- **NestJS API**: Modular structure with 5 modules ready
- **Documentation**: Swagger/OpenAPI integration

### 🔄 In Progress (Phase 2)
- **API Implementation**: Endpoints defined, logic pending
- **Authentication**: Web3 wallet integration
- **Property-Based Tests**: 81 properties to be implemented

### 📈 Metrics
- **Test Coverage**: 37 unit tests passing ✅
- **Code Quality**: ESLint + Prettier configured
- **API Endpoints**: 15+ endpoints defined
- **Target Coverage**: 80%+
- **Target Response Time**: < 5s (95th percentile)
- **Decentralized Storage**: 100% via Storacha/IPFS

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Kiro Team** - For the amazing development platform
- **OpenAI** - For GPT-4 and DALL-E APIs
- **Storacha** - For decentralized storage
- **Polygon** - For scalable blockchain infrastructure

## 📞 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Twitter**: [@hauntedai](https://twitter.com/hauntedai)
- **Discord**: [Join our community](https://discord.gg/hauntedai)

---

**Built with 💜 for the Kiro Hackathon**

*Where Agents Come Alive* 👻
