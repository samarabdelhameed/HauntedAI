# Design Document - HauntedAI

## Overview

HauntedAI is a full-stack multi-agent AI platform that autonomously generates spooky content (stories, images, code) and stores it on decentralized storage (Storacha/IPFS). The system is built using a micro-services architecture where each agent operates independently and communicates through a central orchestrator. The platform features a haunting 3D user interface built with Three.js, real-time logging via Server-Sent Events, Web3 authentication, and a token economy powered by smart contracts on Polygon.

### Key Features

- **Autonomous Agents**: Four specialized agents (StoryAgent, AssetAgent, CodeAgent, DeployAgent) that work independently
- **Decentralized Storage**: All generated content stored on Storacha/IPFS with permanent CIDs
- **Spooky 3D UI**: Immersive interface with Three.js fog effects, ghost sprites, and particle animations
- **Token Economy**: HHCW ERC20 token and Ghost Badge ERC721 NFTs on Polygon
- **Real-time Monitoring**: Live logs and metrics displayed via SSE and WebSocket
- **Micro-services**: Scalable architecture with independent services
- **CI/CD Pipeline**: Automated testing, building, and deployment

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  Next.js 14 + TypeScript + TailwindCSS + Three.js          │
│  - Landing Page                                             │
│  - Dashboard (Auth Required)                                │
│  - Live Room (Real-time Agent Visualization)                │
│  - Explore (Content Discovery)                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + WebSocket + SSE
┌────────────────────┴────────────────────────────────────────┐
│                      API Gateway Layer                       │
│              NestJS + Express + Socket.io                   │
│  - Authentication Service (JWT + Web3)                      │
│  - Room Service (Session Management)                        │
│  - Storage Service (Storacha Integration)                   │
│  - Token Service (Blockchain Integration)                   │
└────────────────────┬────────────────────────────────────────┘
                     │ Message Queue (Redis/BullMQ)
┌────────────────────┴────────────────────────────────────────┐
│                    Agent Services Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ StoryAgent   │  │ AssetAgent   │  │ CodeAgent    │     │
│  │ (OpenAI GPT) │  │ (DALL-E/SD)  │  │ (Codex)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────────────────────────┐   │
│  │ DeployAgent  │  │      Orchestrator                │   │
│  │ (Vercel API) │  │  (Workflow Coordinator)          │   │
│  └──────────────┘  └──────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                    Storage & Blockchain Layer                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │ Redis Cache  │  │ Storacha/IPFS│     │
│  │ (Metadata)   │  │ (Sessions)   │  │ (Content)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Polygon Blockchain                        │      │
│  │  - HHCWToken.sol (ERC20)                         │      │
│  │  - GhostBadge.sol (ERC721)                       │      │
│  │  - Treasury.sol (Reward Distribution)            │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer             | Technology                             | Purpose                                      |
| ----------------- | -------------------------------------- | -------------------------------------------- |
| **Frontend**      | Next.js 14, TypeScript, TailwindCSS    | Server-side rendering, type safety, styling  |
| **3D Graphics**   | Three.js, React Three Fiber            | Spooky 3D visualizations                     |
| **Web3**          | Wagmi, Viem, WalletConnect             | Wallet connection and blockchain interaction |
| **Audio**         | Howler.js                              | Spooky sound effects                         |
| **Backend**       | NestJS, Express, TypeScript            | API gateway and business logic               |
| **Real-time**     | Socket.io, Server-Sent Events          | Live logs and notifications                  |
| **Agents**        | Node.js 20, OpenAI SDK, Stability SDK  | AI content generation                        |
| **Message Queue** | Redis, BullMQ                          | Inter-service communication                  |
| **Database**      | PostgreSQL 16, Prisma ORM              | Metadata storage                             |
| **Cache**         | Redis 7                                | Session and temporary data                   |
| **Storage**       | Storacha, IPFS                         | Decentralized content storage                |
| **Blockchain**    | Hardhat, Solidity, Ethers.js, Polygon  | Smart contracts and token economy            |
| **DevOps**        | Docker, Docker Compose, GitHub Actions | Containerization and CI/CD                   |
| **Monitoring**    | Winston, Prometheus, Grafana           | Logging and metrics                          |

## Components and Interfaces

### Frontend Components

#### 1. Landing Page (`/`)

- **Purpose**: First impression with spooky theme
- **Components**:
  - `HeroSection`: Animated ghost logo with fog effect
  - `ConnectWalletButton`: Web3 wallet connection
  - `FeatureShowcase`: Highlight key features
  - `CTAButton`: "Enter the Haunted Room"

#### 2. Dashboard (`/app`)

- **Purpose**: Main control panel for authenticated users
- **Components**:
  - `Sidebar`: Navigation (Dashboard, Live Room, Explore, Wallet, Settings)
  - `AgentCards`: Display status of each agent (idle/running/error)
  - `RecentRooms`: List of user's recent sessions
  - `TokenBalance`: Display HHCW balance and badges
  - `CreateSessionButton`: Start new room

#### 3. Live Room (`/room/[id]`)

- **Purpose**: Real-time visualization of agent operations
- **Components**:
  - `InputPanel`: Text input for user prompt
  - `ThreeJsCanvas`: 3D scene with fog, ghosts, particles
  - `PreviewPanel`: Display generated content (story, image, CID)
  - `LiveLogsTerminal`: Scrolling terminal with agent logs
  - `AgentStatusIndicators`: Visual indicators for each agent

#### 4. Explore Page (`/explore`)

- **Purpose**: Discover content from other users
- **Components**:
  - `FilterBar`: Filter by agent type, date, user
  - `ContentGrid`: Paginated grid of content cards
  - `ContentModal`: Full-screen view with CID and download
  - `SearchBar`: Search functionality

### Backend Services

#### 1. API Gateway (NestJS)

- **Port**: 3001
- **Endpoints**:
  - `POST /api/v1/auth/login` - Web3 authentication
  - `POST /api/v1/rooms` - Create new room
  - `POST /api/v1/rooms/:id/start` - Start agent workflow
  - `GET /api/v1/rooms/:id/logs` - SSE stream for logs
  - `GET /api/v1/assets` - List assets
  - `GET /api/v1/explore` - Public content discovery
  - `GET /api/v1/users/:did/balance` - Token balance
  - `GET /api/docs` - Swagger documentation

#### 2. Orchestrator Service

- **Purpose**: Coordinate agent workflow
- **Responsibilities**:
  - Receive user input from API Gateway
  - Trigger agents in sequence: Story → Asset → Code → Deploy
  - Handle retries with exponential backoff (3 attempts)
  - Emit logs via SSE to frontend
  - Update room status in database

#### 3. StoryAgent Service

- **Port**: 3002
- **API**: OpenAI GPT-4
- **Input**: User prompt (name or idea)
- **Output**: Spooky story (JSON)
- **Process**:
  1. Receive prompt from Orchestrator
  2. Call OpenAI API with spooky system prompt
  3. Parse and validate response
  4. Upload story to Storacha
  5. Return CID to Orchestrator

#### 4. AssetAgent Service

- **Port**: 3003
- **API**: DALL-E 3 or Stability AI
- **Input**: Story summary
- **Output**: Spooky image (PNG)
- **Process**:
  1. Receive story from Orchestrator
  2. Generate image prompt from story
  3. Call DALL-E API
  4. Download and optimize image
  5. Upload to Storacha
  6. Return CID to Orchestrator

#### 5. CodeAgent Service

- **Port**: 3004
- **API**: OpenAI Codex
- **Input**: Story and image theme
- **Output**: Mini-game code (HTML/JS)
- **Process**:
  1. Receive theme from Orchestrator
  2. Generate code using Codex
  3. Run ESLint and tests
  4. Auto-patch if tests fail (up to 3 attempts)
  5. Upload code to Storacha
  6. Return CID to Orchestrator

#### 6. DeployAgent Service

- **Port**: 3005
- **API**: Vercel Deployment API
- **Input**: Code CID
- **Output**: Deployment URL
- **Process**:
  1. Receive code CID from Orchestrator
  2. Fetch code from IPFS
  3. Deploy to Vercel
  4. Return deployment URL
  5. Store URL in database

### Storage Service

#### Storacha Integration

- **Library**: `@web3-storage/w3up-client`
- **Authentication**: DID-based with delegation
- **Operations**:
  - `uploadFile(file: Buffer, filename: string): Promise<CID>`
  - `retrieveFile(cid: string): Promise<Buffer>`
  - `getMetadata(cid: string): Promise<Metadata>`

### Token Service

#### Smart Contracts (Solidity)

**HHCWToken.sol (ERC20)**

```solidity
contract HHCWToken is ERC20 {
    address public treasury;

    function mint(address to, uint256 amount) external onlyTreasury {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
```

**GhostBadge.sol (ERC721)**

```solidity
contract GhostBadge is ERC721 {
    uint256 public tokenIdCounter;
    mapping(uint256 => string) public badgeTypes;

    function mintBadge(address to, string memory badgeType) external returns (uint256) {
        uint256 tokenId = tokenIdCounter++;
        _mint(to, tokenId);
        badgeTypes[tokenId] = badgeType;
        return tokenId;
    }
}
```

**Treasury.sol**

```solidity
contract Treasury {
    HHCWToken public token;
    GhostBadge public badge;

    function rewardUpload(address user) external {
        token.mint(user, 10 * 10**18); // 10 HHCW
    }

    function rewardView(address user) external {
        token.mint(user, 1 * 10**18); // 1 HHCW
    }

    function rewardReferral(address user) external {
        token.mint(user, 50 * 10**18); // 50 HHCW
    }

    function grantBadge(address user, string memory badgeType) external {
        badge.mintBadge(user, badgeType);
    }
}
```

## Data Models

### Database Schema (PostgreSQL)

#### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    wallet_address CHAR(42) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_did ON users(did);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

#### Rooms Table

```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('idle', 'running', 'done', 'error')),
    input_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_owner ON rooms(owner_id);
CREATE INDEX idx_rooms_status ON rooms(status);
```

#### Assets Table

```sql
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    agent_type VARCHAR(20) CHECK (agent_type IN ('story', 'asset', 'code', 'deploy')),
    cid VARCHAR(100) NOT NULL,
    file_type VARCHAR(20),
    file_size BIGINT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_room ON assets(room_id);
CREATE INDEX idx_assets_cid ON assets(cid);
CREATE INDEX idx_assets_agent_type ON assets(agent_type);
```

#### Token Transactions Table

```sql
CREATE TABLE token_tx (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    reason VARCHAR(100),
    tx_hash CHAR(66),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_tx_user ON token_tx(user_id);
CREATE INDEX idx_token_tx_hash ON token_tx(tx_hash);
```

#### Badges Table

```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_id BIGINT NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    tx_hash CHAR(66),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_user ON badges(user_id);
CREATE INDEX idx_badges_token ON badges(token_id);
```

### TypeScript Interfaces

```typescript
// User
interface User {
  id: string;
  did: string;
  username: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Room
interface Room {
  id: string;
  ownerId: string;
  status: 'idle' | 'running' | 'done' | 'error';
  inputText: string;
  createdAt: Date;
  updatedAt: Date;
}

// Asset
interface Asset {
  id: string;
  roomId: string;
  agentType: 'story' | 'asset' | 'code' | 'deploy';
  cid: string;
  fileType: string;
  fileSize: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Token Transaction
interface TokenTransaction {
  id: string;
  userId: string;
  amount: bigint;
  reason: string;
  txHash: string;
  createdAt: Date;
}

// Badge
interface Badge {
  id: string;
  userId: string;
  tokenId: number;
  badgeType: string;
  txHash: string;
  createdAt: Date;
}

// Agent Log
interface AgentLog {
  timestamp: Date;
  agentType: 'story' | 'asset' | 'code' | 'deploy' | 'orchestrator';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  metadata?: Record<string, any>;
}

// Orchestrator Workflow
interface WorkflowState {
  roomId: string;
  currentAgent: string;
  completedAgents: string[];
  failedAgents: string[];
  retryCount: Record<string, number>;
  results: Record<string, any>;
}
```

## Orchestrator Workflow

### Agent Execution Flow

```typescript
// Orchestrator triggers map
const AGENT_TRIGGERS = {
  'user.input': ['StoryAgent'],
  'story.generated': ['AssetAgent'],
  'asset.generated': ['CodeAgent'],
  'code.patched': ['DeployAgent'],
  'deploy.done': ['complete'],
};

// Retry policy
const RETRY_POLICY = {
  maxAttempts: 3,
  initialDelay: 2000, // 2 seconds
  backoffMultiplier: 2, // exponential
  maxDelay: 30000, // 30 seconds
};

// Workflow execution
async function executeWorkflow(roomId: string, userInput: string) {
  const state: WorkflowState = {
    roomId,
    currentAgent: 'StoryAgent',
    completedAgents: [],
    failedAgents: [],
    retryCount: {},
    results: {},
  };

  try {
    // 1. Story Generation
    await executeAgentWithRetry('StoryAgent', { input: userInput }, state);

    // 2. Asset Generation
    await executeAgentWithRetry('AssetAgent', { story: state.results.story }, state);

    // 3. Code Generation
    await executeAgentWithRetry('CodeAgent', { theme: state.results.asset }, state);

    // 4. Deployment
    await executeAgentWithRetry('DeployAgent', { code: state.results.code }, state);

    // 5. Update room status
    await updateRoomStatus(roomId, 'done');

    // 6. Reward user
    await rewardUser(roomId, 10); // 10 HHCW tokens
  } catch (error) {
    await updateRoomStatus(roomId, 'error');
    await logError(roomId, error);
  }
}

async function executeAgentWithRetry(agentName: string, input: any, state: WorkflowState) {
  const maxAttempts = RETRY_POLICY.maxAttempts;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      emitLog(state.roomId, 'info', `${agentName} starting (attempt ${attempt + 1})`);

      const result = await callAgent(agentName, input);

      state.completedAgents.push(agentName);
      state.results[agentName.toLowerCase()] = result;

      emitLog(state.roomId, 'success', `${agentName} completed successfully`);

      return result;
    } catch (error) {
      attempt++;
      state.retryCount[agentName] = attempt;

      if (attempt >= maxAttempts) {
        state.failedAgents.push(agentName);
        emitLog(state.roomId, 'error', `${agentName} failed after ${maxAttempts} attempts`);
        throw error;
      }

      const delay = Math.min(
        RETRY_POLICY.initialDelay * Math.pow(RETRY_POLICY.backoffMultiplier, attempt - 1),
        RETRY_POLICY.maxDelay
      );

      emitLog(state.roomId, 'warn', `${agentName} failed, retrying in ${delay}ms`);

      await sleep(delay);
    }
  }
}
```

## Error Handling

### Error Types

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

class StorachaError extends Error {
  constructor(
    public operation: string,
    message: string
  ) {
    super(message);
    this.name = 'StorachaError';
  }
}

class BlockchainError extends Error {
  constructor(
    public txHash: string | null,
    message: string
  ) {
    super(message);
    this.name = 'BlockchainError';
  }
}
```

### Error Recovery Strategies

| Error Type                        | Strategy                     | Retry          | Fallback                         |
| --------------------------------- | ---------------------------- | -------------- | -------------------------------- |
| **OpenAI API Rate Limit**         | Exponential backoff          | Yes (3x)       | Use cached response if available |
| **Storacha Upload Failure**       | Retry with different gateway | Yes (3x)       | Store locally, retry later       |
| **Database Connection Lost**      | Reconnect automatically      | Yes (infinite) | Queue operations in Redis        |
| **Blockchain Transaction Failed** | Increase gas, retry          | Yes (2x)       | Log for manual review            |
| **Agent Timeout**                 | Kill process, restart        | Yes (1x)       | Skip agent, continue workflow    |
| **Invalid User Input**            | Validate, return error       | No             | Show validation message          |

## Testing Strategy

### Unit Testing

**Framework**: Jest + Supertest

**Coverage Target**: 80%

**Test Categories**:

1. **API Endpoints**: Test all REST endpoints with valid/invalid inputs
2. **Service Logic**: Test business logic in isolation
3. **Database Operations**: Test CRUD operations with test database
4. **Utility Functions**: Test helper functions and validators

**Example Unit Tests**:

```typescript
describe('RoomService', () => {
  it('should create a new room with valid user ID', async () => {
    const room = await roomService.create(userId, 'Test input');
    expect(room.status).toBe('idle');
    expect(room.inputText).toBe('Test input');
  });

  it('should reject room creation with invalid user ID', async () => {
    await expect(roomService.create('invalid', 'Test')).rejects.toThrow();
  });
});

describe('StorachaService', () => {
  it('should upload file and return valid CID', async () => {
    const buffer = Buffer.from('test content');
    const cid = await storachaService.uploadFile(buffer, 'test.txt');
    expect(cid).toMatch(/^bafy[a-z0-9]+$/);
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property testing library)

**Purpose**: Verify universal properties that should hold across all inputs

**Configuration**: Minimum 100 iterations per property test

**Property Test Format**:

```typescript
// Each property test must include this comment format:
// Feature: haunted-ai, Property X: [property description]
// Validates: Requirements Y.Z
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Story Generation Properties

**Property 1: Non-empty input generates story**
_For any_ non-empty user input string, StoryAgent should generate a story with non-zero length containing spooky elements.
**Validates: Requirements 1.1**

**Property 2: Story storage round-trip**
_For any_ generated story, storing it on Storacha should return a valid CID, and retrieving content using that CID should return the identical story.
**Validates: Requirements 1.2**

**Property 3: Story UI rendering completeness**
_For any_ story and CID pair, the rendered UI output should contain both the complete story text and the CID string.
**Validates: Requirements 1.3**

**Property 4: Story generation retry with backoff**
_For any_ StoryAgent failure, the system should retry up to 3 times with exponentially increasing delays (2s, 4s, 8s).
**Validates: Requirements 1.4**

### Asset Generation Properties

**Property 5: Story completion triggers asset generation**
_For any_ completed story generation, AssetAgent should be automatically triggered within 1 second.
**Validates: Requirements 2.1**

**Property 6: Image storage round-trip**
_For any_ generated image, storing it on Storacha should return a valid CID, and retrieving content using that CID should return identical image data (same byte length and hash).
**Validates: Requirements 2.2**

**Property 7: Image preview rendering**
_For any_ image and CID pair, the Preview Panel should display the image element and include a copyable CID text element.
**Validates: Requirements 2.3**

**Property 8: Asset-story database linkage**
_For any_ image and story pair in the same room, querying the database should show the correct foreign key relationship between assets.
**Validates: Requirements 2.5**

### Code Generation Properties

**Property 9: Image completion triggers code generation**
_For any_ completed image generation, CodeAgent should be automatically triggered within 1 second.
**Validates: Requirements 3.1**

**Property 10: Generated code is tested**
_For any_ code generated by CodeAgent, automated tests should be executed and results should be logged.
**Validates: Requirements 3.2**

**Property 11: Code storage round-trip**
_For any_ code that passes tests, storing it on Storacha should return a valid CID, and retrieving content using that CID should return identical code (same string content).
**Validates: Requirements 3.4**

### Deployment Properties

**Property 12: Code completion triggers deployment**
_For any_ completed code generation, DeployAgent should be automatically triggered within 1 second.
**Validates: Requirements 4.1**

**Property 13: Deployment information persistence**
_For any_ successful deployment, the database should contain a record with both deployment URL and code CID.
**Validates: Requirements 4.2**

**Property 14: Deployment WebSocket notification**
_For any_ completed deployment, a success notification should be sent via WebSocket and received by connected clients.
**Validates: Requirements 4.3**

### Live Logging Properties

**Property 15: Agent operations emit logs**
_For any_ agent operation start, a log message should be sent via SSE stream within 100ms.
**Validates: Requirements 5.1**

**Property 16: Log message rendering completeness**
_For any_ log message, the rendered output should contain both a timestamp and the agent type identifier.
**Validates: Requirements 5.2**

**Property 17: Error log formatting**
_For any_ error-level log, the rendered output should have red color styling and include error details.
**Validates: Requirements 5.3**

**Property 18: Success log formatting**
_For any_ success-level log, the rendered output should have green color styling and include an icon element.
**Validates: Requirements 5.4**

**Property 19: Log buffer size limit**
_For any_ sequence of log messages, when the count exceeds 100, only the most recent 100 messages should remain in the display buffer.
**Validates: Requirements 5.5**

### User Interface Properties

**Property 20: Interaction triggers sound**
_For any_ user interaction event (click, hover), a spooky sound effect should be played via Howler.js.
**Validates: Requirements 6.2**

**Property 21: Operation result triggers animation**
_For any_ operation completion (success or failure), an appropriate animation (ghost sprite or fog particles) should be displayed.
**Validates: Requirements 6.3**

**Property 22: Hover triggers glow effect**
_For any_ hoverable UI element, mouse hover should trigger a purple or red glow effect.
**Validates: Requirements 6.4**

### Storage Properties

**Property 23: Upload performance and CID validity**
_For any_ content upload to Storacha, the operation should complete within 10 seconds and return a CID matching the pattern `^bafy[a-z0-9]+$`.
**Validates: Requirements 7.2**

**Property 24: CID metadata persistence**
_For any_ returned CID, the database should contain a record with complete metadata including file type, size, and timestamp.
**Validates: Requirements 7.3**

**Property 25: Content retrieval round-trip**
_For any_ content stored with a CID, retrieving from IPFS using that CID should return the original content (same byte length and hash).
**Validates: Requirements 7.4**

**Property 26: Storacha connection retry**
_For any_ Storacha connection failure, the system should retry with exponentially increasing delays up to 3 times.
**Validates: Requirements 7.5**

### Room Management Properties

**Property 27: Room creation uniqueness**
_For any_ room creation request, a new room should be created with a UUID that is unique across all existing rooms.
**Validates: Requirements 8.1**

**Property 28: New room initial state**
_For any_ newly created room, the database record should have status "idle".
**Validates: Requirements 8.2**

**Property 29: Room status transitions**
_For any_ room, the status should transition from "idle" → "running" → "done" (or "error") in that order without skipping states.
**Validates: Requirements 8.3, 8.4, 8.5**

### Token Rewards Properties

**Property 30: Upload reward amount**
_For any_ content upload by a user, their HHCW token balance should increase by exactly 10 tokens.
**Validates: Requirements 9.1**

**Property 31: View reward amount**
_For any_ content view by a user, their HHCW token balance should increase by exactly 1 token.
**Validates: Requirements 9.2**

**Property 32: Referral reward amount**
_For any_ successful referral (friend registration), the referrer's HHCW token balance should increase by exactly 50 tokens.
**Validates: Requirements 9.3**

**Property 33: Transaction logging**
_For any_ token transaction, a record should exist in the token_tx table with a valid Polygon tx_hash matching the pattern `^0x[a-fA-F0-9]{64}$`.
**Validates: Requirements 9.4**

**Property 34: Balance calculation correctness**
_For any_ user, the returned balance should equal the sum of all amounts in their token_tx records.
**Validates: Requirements 9.5**

### Content Discovery Properties

**Property 35: Filter correctness**
_For any_ agent type filter applied, all displayed content should have matching agent_type field.
**Validates: Requirements 10.2**

**Property 36: Content modal completeness**
_For any_ content item clicked, the modal should display all fields: story/image, CID, metadata, and timestamp.
**Validates: Requirements 10.3**

**Property 37: Clipboard copy operation**
_For any_ CID copy action, the clipboard should contain the exact CID string and a confirmation message should be displayed.
**Validates: Requirements 10.4**

**Property 38: Image download functionality**
_For any_ image download request, the file should be retrieved from IPFS and browser download should be initiated.
**Validates: Requirements 10.5**

### Authentication Properties

**Property 39: Wallet connection triggers signature request**
_For any_ "Connect Wallet" action, a Web3 signature request should be sent to the wallet provider.
**Validates: Requirements 11.1**

**Property 40: Valid signature issues JWT**
_For any_ valid Web3 signature, a JWT token should be issued with expiration time set to 24 hours from issuance.
**Validates: Requirements 11.2**

**Property 41: JWT storage and usage**
_For any_ issued JWT, it should be stored in localStorage and included in the Authorization header of all subsequent API requests.
**Validates: Requirements 11.3**

**Property 42: JWT expiration handling**
_For any_ expired JWT, API requests should return 401 status and trigger re-authentication flow.
**Validates: Requirements 11.4**

**Property 43: Logout cleanup**
_For any_ logout action, the JWT should be removed from localStorage and the user should be redirected to the home page.
**Validates: Requirements 11.5**

### Error Recovery Properties

**Property 44: Agent retry with exponential backoff**
_For any_ agent failure, retries should occur with delays following the pattern: 2s, 4s, 8s (exponential backoff with base 2).
**Validates: Requirements 12.1**

**Property 45: Workflow continuation after agent failure**
_For any_ agent that exhausts all retry attempts, the orchestrator should continue executing remaining agents in the workflow.
**Validates: Requirements 12.2**

**Property 46: Database auto-reconnection**
_For any_ database connection loss, the system should attempt reconnection automatically within 5 seconds.
**Validates: Requirements 12.3**

**Property 47: Storacha fallback storage**
_For any_ Storacha upload failure, content should be stored in local filesystem and a retry should be scheduled.
**Validates: Requirements 12.4**

**Property 48: Critical error webhook notification**
_For any_ critical error (database failure, all agents failed), a webhook POST request should be sent to the configured developer notification endpoint.
**Validates: Requirements 12.5**

### Three.js Visualization Properties

**Property 49: Agent operation displays ghost sprite**
_For any_ agent operation start, an animated ghost sprite should be added to the Three.js scene.
**Validates: Requirements 13.2**

**Property 50: Success triggers particle animation**
_For any_ successful operation, particle animation (leaves or sparks) should be played in the Three.js scene.
**Validates: Requirements 13.3**

**Property 51: Error triggers red glow and thunder**
_For any_ error occurrence, a red glow effect should be displayed and thunder sound should be played.
**Validates: Requirements 13.4**

**Property 52: Mouse movement affects camera**
_For any_ mouse movement event, the Three.js camera position should change proportionally to the mouse delta.
**Validates: Requirements 13.5**

### Micro-services Properties

**Property 53: Request routing correctness**
_For any_ API request, it should be routed to the micro-service that handles that endpoint path.
**Validates: Requirements 14.2**

**Property 54: Service isolation on failure**
_For any_ micro-service failure, other micro-services should continue processing requests without interruption.
**Validates: Requirements 14.3**

**Property 55: Inter-service communication via queue**
_For any_ communication between micro-services, messages should be sent through Redis/BullMQ message queue.
**Validates: Requirements 14.4**

### CI/CD Properties

**Property 56: CI workflow execution completeness**
_For any_ GitHub Actions workflow run, all steps (lint, test, build) should be executed in order.
**Validates: Requirements 15.2**

**Property 57: Docker build and push on success**
_For any_ successful build, Docker images should be built and pushed to Docker Hub with tags matching the commit SHA.
**Validates: Requirements 15.3**

**Property 58: Auto-deployment to staging**
_For any_ Docker image pushed to Docker Hub, an automatic deployment to staging environment should be triggered.
**Validates: Requirements 15.4**

### NFT Badge Properties

**Property 59: Achievement badge minting**
_For any_ user who completes 10 rooms, a Ghost Badge NFT should be minted to their wallet address via blockchain transaction.
**Validates: Requirements 16.1**

**Property 60: Milestone badge minting**
_For any_ user whose token balance reaches 1000 HHCW, a Haunted Master Badge NFT should be minted to their wallet address.
**Validates: Requirements 16.2**

**Property 61: Badge transaction recording**
_For any_ badge minted, a transaction record should exist on Polygon blockchain with a valid tx_hash.
**Validates: Requirements 16.3**

**Property 62: Badge display completeness**
_For any_ user profile view, all NFT badges owned by that user should be fetched from blockchain and displayed.
**Validates: Requirements 16.4**

**Property 63: Badge metadata display**
_For any_ badge clicked, the displayed information should include badge type, metadata, and acquisition timestamp.
**Validates: Requirements 16.5**

### API Documentation Properties

**Property 64: Endpoint documentation completeness**
_For any_ API endpoint, the Swagger documentation should include parameters, response schema, and at least one example.
**Validates: Requirements 17.2**

**Property 65: Swagger try-it-out functionality**
_For any_ endpoint tested via Swagger UI, a real HTTP request should be sent and the response should be displayed.
**Validates: Requirements 17.3**

**Property 66: Documentation auto-update**
_For any_ API code change, the Swagger documentation should automatically reflect the change without manual updates.
**Validates: Requirements 17.4**

**Property 67: Documentation search functionality**
_For any_ search query in Swagger UI, all endpoints matching the query should be returned in results.
**Validates: Requirements 17.5**

### Monitoring Properties

**Property 68: Metrics collection**
_For any_ running micro-service, metrics (CPU, memory, requests/sec) should be collected and sent to Prometheus every 15 seconds.
**Validates: Requirements 18.1**

**Property 69: Metrics visualization**
_For any_ metrics collected by Prometheus, they should be queryable and displayable in Grafana dashboards.
**Validates: Requirements 18.2**

**Property 70: Error logging with stack trace**
_For any_ error occurrence, a log entry should be created in Winston logger containing the full stack trace.
**Validates: Requirements 18.3**

**Property 71: Performance degradation alerting**
_For any_ performance metric that exceeds threshold (e.g., response time > 5s), an alert should be sent to developers.
**Validates: Requirements 18.4**

### Kiro Integration Properties

**Property 72: File save triggers tests**
_For any_ code file save event, Kiro Hook should automatically execute the test suite within 2 seconds.
**Validates: Requirements 19.1**

**Property 73: Test failure displays errors**
_For any_ test failure, error messages should be displayed in the Kiro IDE with file location and line number.
**Validates: Requirements 19.2**

**Property 74: Code generation uses steering docs**
_For any_ code generation request, Kiro Agent should reference steering docs to apply project-specific standards.
**Validates: Requirements 19.3**

**Property 75: Steering doc updates affect generation**
_For any_ steering doc update, subsequent code generation should follow the new standards defined in the updated doc.
**Validates: Requirements 19.4**

**Property 76: MCP plugin real API integration**
_For any_ MCP plugin operation, real API credentials should be used to call Storacha and OpenAI APIs (no mocks).
**Validates: Requirements 19.5**

### Multi-language Properties

**Property 77: Language detection**
_For any_ browser language setting, the UI should be displayed in that language if supported, otherwise default to English.
**Validates: Requirements 20.1**

**Property 78: Language switching without reload**
_For any_ language change action, all UI text should update to the new language without page reload.
**Validates: Requirements 20.2**

**Property 79: Multilingual story generation**
_For any_ language selection, StoryAgent should generate the story in that language using OpenAI API with appropriate language parameter.
**Validates: Requirements 20.3**

**Property 80: RTL text rendering**
_For any_ Arabic text input or display, the text should be rendered right-to-left with proper text direction.
**Validates: Requirements 20.4**

**Property 81: Localized date and number formatting**
_For any_ date or number displayed, the format should match the selected language's locale (e.g., DD/MM/YYYY for Arabic, MM/DD/YYYY for English).
**Validates: Requirements 20.5**

## Testing Strategy

### Overview

HauntedAI employs a comprehensive dual testing approach combining unit tests for specific scenarios and property-based tests for universal correctness guarantees. This strategy ensures both concrete bug detection and general correctness verification.

### Property-Based Testing

**Framework**: `fast-check` (JavaScript/TypeScript property testing library)

**Configuration**:

- Minimum 100 iterations per property test
- Seed-based reproducibility for failed tests
- Shrinking enabled to find minimal failing examples

**Property Test Format**:
Each property-based test MUST include a comment tag in this exact format:

```typescript
// Feature: haunted-ai, Property X: [property description]
// Validates: Requirements Y.Z
```

**Example Property Tests**:

```typescript
import fc from 'fast-check';

describe('Story Generation Properties', () => {
  // Feature: haunted-ai, Property 1: Non-empty input generates story
  // Validates: Requirements 1.1
  it('should generate non-empty story for any non-empty input', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 500 }), async (userInput) => {
        const story = await storyAgent.generate(userInput);
        expect(story.length).toBeGreaterThan(0);
        expect(story).toMatch(/spooky|ghost|haunted|dark|scary/i);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: haunted-ai, Property 2: Story storage round-trip
  // Validates: Requirements 1.2
  it('should retrieve identical story after storage', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 10, maxLength: 1000 }), async (story) => {
        const cid = await storachaService.uploadFile(Buffer.from(story), 'story.txt');
        const retrieved = await storachaService.retrieveFile(cid);
        expect(retrieved.toString()).toBe(story);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Token Rewards Properties', () => {
  // Feature: haunted-ai, Property 34: Balance calculation correctness
  // Validates: Requirements 9.5
  it('should calculate balance as sum of all transactions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: -100, max: 100 }), { minLength: 1, maxLength: 50 }),
        async (amounts) => {
          const userId = await createTestUser();

          // Create transactions
          for (const amount of amounts) {
            await tokenService.recordTransaction(userId, amount, 'test');
          }

          // Verify balance
          const balance = await tokenService.getBalance(userId);
          const expectedBalance = amounts.reduce((sum, amt) => sum + amt, 0);
          expect(balance).toBe(expectedBalance);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Room Management Properties', () => {
  // Feature: haunted-ai, Property 29: Room status transitions
  // Validates: Requirements 8.3, 8.4, 8.5
  it('should transition room status in correct order', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 100 }), async (userInput) => {
        const room = await roomService.create(userId, userInput);
        expect(room.status).toBe('idle');

        await roomService.start(room.id);
        const runningRoom = await roomService.get(room.id);
        expect(runningRoom.status).toBe('running');

        // Simulate completion or error
        const finalStatus = Math.random() > 0.5 ? 'done' : 'error';
        await roomService.updateStatus(room.id, finalStatus);
        const finalRoom = await roomService.get(room.id);
        expect(finalRoom.status).toBe(finalStatus);
      }),
      { numRuns: 100 }
    );
  });
});
```

**Custom Generators**:

```typescript
// Generator for valid CIDs
const cidArbitrary = fc
  .string({ minLength: 59, maxLength: 59 })
  .map((s) => 'bafy' + s.toLowerCase().replace(/[^a-z0-9]/g, '2'));

// Generator for Ethereum addresses
const addressArbitrary = fc.hexaString({ minLength: 40, maxLength: 40 }).map((s) => '0x' + s);

// Generator for valid room states
const roomStateArbitrary = fc.record({
  id: fc.uuid(),
  ownerId: fc.uuid(),
  status: fc.constantFrom('idle', 'running', 'done', 'error'),
  inputText: fc.string({ minLength: 1, maxLength: 500 }),
});

// Generator for agent logs
const agentLogArbitrary = fc.record({
  timestamp: fc.date(),
  agentType: fc.constantFrom('story', 'asset', 'code', 'deploy', 'orchestrator'),
  level: fc.constantFrom('info', 'warn', 'error', 'success'),
  message: fc.string({ minLength: 10, maxLength: 200 }),
});
```

### Unit Testing

**Framework**: Jest + Supertest

**Coverage Target**: 80% code coverage

**Test Categories**:

#### 1. API Endpoint Tests

```typescript
describe('POST /api/v1/rooms', () => {
  it('should create room with valid user ID', async () => {
    const response = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${validJWT}`)
      .send({ inputText: 'Test input' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('idle');
  });

  it('should reject room creation without authentication', async () => {
    await request(app).post('/api/v1/rooms').send({ inputText: 'Test input' }).expect(401);
  });

  it('should reject room creation with empty input', async () => {
    await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${validJWT}`)
      .send({ inputText: '' })
      .expect(400);
  });
});
```

#### 2. Service Logic Tests

```typescript
describe('OrchestratorService', () => {
  it('should execute agents in correct sequence', async () => {
    const executionOrder: string[] = [];

    jest.spyOn(storyAgent, 'generate').mockImplementation(async () => {
      executionOrder.push('story');
      return { story: 'test story', cid: 'bafy123' };
    });

    jest.spyOn(assetAgent, 'generate').mockImplementation(async () => {
      executionOrder.push('asset');
      return { imageCid: 'bafy456' };
    });

    await orchestrator.executeWorkflow(roomId, 'test input');

    expect(executionOrder).toEqual(['story', 'asset']);
  });

  it('should retry failed agent up to 3 times', async () => {
    let attemptCount = 0;

    jest.spyOn(storyAgent, 'generate').mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Temporary failure');
      }
      return { story: 'test story', cid: 'bafy123' };
    });

    await orchestrator.executeWorkflow(roomId, 'test input');

    expect(attemptCount).toBe(3);
  });
});
```

#### 3. Database Operation Tests

```typescript
describe('RoomRepository', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create room with all fields', async () => {
    const room = await roomRepository.create({
      ownerId: userId,
      inputText: 'test',
      status: 'idle',
    });

    expect(room.id).toBeDefined();
    expect(room.createdAt).toBeInstanceOf(Date);
  });

  it('should update room status', async () => {
    const room = await roomRepository.create({
      ownerId: userId,
      inputText: 'test',
      status: 'idle',
    });

    await roomRepository.updateStatus(room.id, 'running');

    const updated = await roomRepository.findById(room.id);
    expect(updated.status).toBe('running');
  });
});
```

#### 4. Integration Tests

```typescript
describe('End-to-End Workflow', () => {
  it('should complete full workflow from input to deployment', async () => {
    // Create room
    const room = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${validJWT}`)
      .send({ inputText: 'Spooky story about ghosts' })
      .expect(201);

    // Start workflow
    await request(app)
      .post(`/api/v1/rooms/${room.body.id}/start`)
      .set('Authorization', `Bearer ${validJWT}`)
      .expect(200);

    // Wait for completion (with timeout)
    await waitForRoomStatus(room.body.id, 'done', 60000);

    // Verify assets were created
    const assets = await request(app)
      .get(`/api/v1/assets?roomId=${room.body.id}`)
      .set('Authorization', `Bearer ${validJWT}`)
      .expect(200);

    expect(assets.body).toHaveLength(4); // story, asset, code, deploy
    expect(assets.body.every((a) => a.cid)).toBe(true);
  }, 120000); // 2 minute timeout
});
```

### Edge Case Testing

**Edge cases identified from requirements**:

1. **Empty/Whitespace Input**: Test that empty or whitespace-only inputs are rejected
2. **All Retries Exhausted**: Test behavior when all 3 retry attempts fail
3. **Network Timeouts**: Test handling of API timeouts (OpenAI, Storacha)
4. **Invalid CIDs**: Test error handling for malformed CIDs
5. **Concurrent Requests**: Test system behavior under concurrent room creation
6. **Large Content**: Test handling of very large stories/images
7. **Special Characters**: Test Unicode, emojis, and special characters in inputs
8. **Expired JWT**: Test authentication with expired tokens
9. **Insufficient Gas**: Test blockchain transaction failures
10. **Database Constraints**: Test unique constraint violations

```typescript
describe('Edge Cases', () => {
  it('should reject whitespace-only input', async () => {
    await expect(storyAgent.generate('   \n\t  ')).rejects.toThrow('Input cannot be empty');
  });

  it('should handle all retries exhausted', async () => {
    jest.spyOn(storyAgent, 'generate').mockRejectedValue(new Error('API unavailable'));

    await expect(orchestrator.executeWorkflow(roomId, 'test')).rejects.toThrow(
      'Agent failed after 3 attempts'
    );
  });

  it('should handle very large story content', async () => {
    const largeStory = 'A'.repeat(1000000); // 1MB
    const cid = await storachaService.uploadFile(Buffer.from(largeStory), 'large.txt');
    expect(cid).toMatch(/^bafy/);
  });
});
```

### Test Execution

**Local Development**:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run property tests only
npm run test:property

# Run unit tests only
npm run test:unit

# Run specific test file
npm test -- room.service.spec.ts

# Run in watch mode
npm test -- --watch
```

**CI Pipeline**:

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run property tests
        run: npm run test:property

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Test Data Management

**Test Database**:

- Use separate PostgreSQL database for tests
- Reset database before each test suite
- Use transactions for test isolation

**Mock Data Factories**:

```typescript
// factories/user.factory.ts
export const createTestUser = async (overrides = {}) => {
  return await prisma.user.create({
    data: {
      did: `did:key:test${Date.now()}`,
      username: `testuser${Date.now()}`,
      walletAddress: `0x${randomBytes(20).toString('hex')}`,
      ...overrides,
    },
  });
};

// factories/room.factory.ts
export const createTestRoom = async (userId: string, overrides = {}) => {
  return await prisma.room.create({
    data: {
      ownerId: userId,
      inputText: 'Test spooky story',
      status: 'idle',
      ...overrides,
    },
  });
};
```

### Performance Testing

**Load Testing** (using k6):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 10 users
    { duration: '3m', target: 10 }, // Stay at 10 users
    { duration: '1m', target: 50 }, // Ramp up to 50 users
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests under 5s
    http_req_failed: ['rate<0.1'], // Less than 10% failures
  },
};

export default function () {
  const payload = JSON.stringify({
    inputText: 'Generate a spooky story',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${__ENV.TEST_JWT}`,
    },
  };

  const res = http.post('http://localhost:3001/api/v1/rooms', payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
    'has room id': (r) => JSON.parse(r.body).id !== undefined,
  });

  sleep(1);
}
```

### Continuous Testing

**Pre-commit Hooks** (using Husky):

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test:unit",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

**Test Reporting**:

- Jest HTML Reporter for local development
- Codecov for coverage tracking
- GitHub Actions test summary in PR comments

### Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clear Naming**: Test names should clearly describe what is being tested
3. **Arrange-Act-Assert**: Follow AAA pattern for test structure
4. **Mock External Services**: Mock OpenAI, Storacha, and blockchain calls in unit tests
5. **Use Real APIs in Integration Tests**: Integration tests should use real API credentials
6. **Fast Feedback**: Unit tests should run in < 5 seconds, property tests in < 30 seconds
7. **Deterministic Tests**: Avoid flaky tests by controlling randomness and timing
8. **Test Coverage**: Aim for 80% coverage, but focus on critical paths
9. **Property Test Shrinking**: Use fast-check's shrinking to find minimal failing examples
10. **Document Test Failures**: When a property test fails, document the failing case

## Deployment Architecture

### Development Environment

```yaml
# docker-compose.dev.yml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: hauntedai_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://dev:dev@postgres:5432/hauntedai_dev
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      STORACHA_DID: ${STORACHA_DID}
    ports:
      - '3001:3001'
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/api:/app
      - /app/node_modules

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - '3000:3000'
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
```

### Production Environment

**Infrastructure** (AWS/GCP):

- **Frontend**: Vercel (Next.js optimized hosting)
- **API Gateway**: AWS ECS Fargate or GCP Cloud Run
- **Agents**: Separate ECS tasks or Cloud Run services
- **Database**: AWS RDS PostgreSQL or GCP Cloud SQL
- **Cache**: AWS ElastiCache Redis or GCP Memorystore
- **Storage**: Storacha/IPFS (decentralized)
- **Blockchain**: Polygon Mainnet
- **Monitoring**: Prometheus + Grafana on AWS EC2 or GCP Compute Engine

**Scaling Strategy**:

- Horizontal scaling for API Gateway and Agents
- Vertical scaling for database
- CDN for static assets (Cloudflare)
- Load balancer for API Gateway (AWS ALB or GCP Load Balancer)

## Security Considerations

1. **API Keys**: Store in environment variables, never commit to git
2. **JWT Secrets**: Use strong random secrets, rotate regularly
3. **Rate Limiting**: Implement rate limiting on all public endpoints
4. **Input Validation**: Validate and sanitize all user inputs
5. **SQL Injection**: Use parameterized queries (Prisma ORM)
6. **XSS Protection**: Sanitize HTML output, use Content Security Policy
7. **CORS**: Configure CORS to allow only trusted origins
8. **HTTPS**: Enforce HTTPS in production
9. **Wallet Security**: Never store private keys, only public addresses
10. **Smart Contract Audits**: Audit contracts before mainnet deployment

## Conclusion

This design document provides a comprehensive blueprint for building HauntedAI, a multi-agent AI platform with decentralized storage and blockchain integration. The architecture is scalable, testable, and maintainable, with clear separation of concerns and robust error handling. The dual testing strategy ensures both specific bug detection and general correctness verification through property-based testing.
