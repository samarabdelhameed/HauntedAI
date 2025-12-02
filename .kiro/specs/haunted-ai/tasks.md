# Implementation Plan - HauntedAI

## Task List

- [x] 1. Project Setup and Infrastructure
- [x] 1.1 Initialize monorepo structure with workspaces
  - Create root package.json with workspaces for apps/web, apps/api, apps/agents
  - Set up TypeScript configuration with shared tsconfig.base.json
  - Configure ESLint and Prettier for code quality
  - _Requirements: All_

- [x] 1.2 Set up Docker development environment
  - Create docker-compose.dev.yml with PostgreSQL, Redis, and service containers
  - Write Dockerfiles for each service (api, web, agents)
  - Configure environment variable templates (.env.example)
  - _Requirements: 14.1, 15.1_

- [x] 1.3 Initialize database with Prisma
  - Install Prisma and configure schema.prisma
  - Create migrations for users, rooms, assets, token_tx, badges tables
  - Set up Prisma Client generation
  - Add database indexes for performance
  - _Requirements: 8.1, 8.2, 9.4_

- [x] 1.4 Set up GitHub repository and CI/CD
  - Initialize Git repository with .gitignore
  - Create GitHub Actions workflow for lint, test, build
  - Configure Docker Hub integration for image pushing
  - Set up branch protection rules
  - _Requirements: 15.1, 15.2_

- [ ] 1.5 Write unit tests for database operations
  - Test user CRUD operations
  - Test room CRUD operations
  - Test asset CRUD operations
  - _Requirements: 8.1, 8.2_

- [ ] 2. Backend API Gateway (NestJS)
- [x] 2.1 Create NestJS application structure
  - Initialize NestJS project in apps/api
  - Set up modules: auth, rooms, assets, tokens, users
  - Configure global exception filters and interceptors
  - Set up Swagger/OpenAPI documentation
  - _Requirements: 17.1, 17.2_

- [x] 2.2 Implement authentication service
  - Create Web3 signature verification endpoint (POST /api/v1/auth/login)
  - Implement JWT token generation and validation
  - Create authentication guard for protected routes
  - Add JWT storage in response headers
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 2.3 Write property test for authentication
  - **Property 39: Wallet connection triggers signature request**
  - **Property 40: Valid signature issues JWT**
  - **Property 41: JWT storage and usage**
  - **Validates: Requirements 11.1, 11.2, 11.3**

- [x] 2.4 Implement room management endpoints
  - POST /api/v1/rooms - Create new room
  - POST /api/v1/rooms/:id/start - Start agent workflow
  - GET /api/v1/rooms/:id - Get room details
  - GET /api/v1/rooms - List user's rooms
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 2.5 Write property test for room management
  - **Property 27: Room creation uniqueness**
  - **Property 28: New room initial state**
  - **Property 29: Room status transitions**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 2.6 Implement Server-Sent Events for live logs
  - Create SSE endpoint (GET /api/v1/rooms/:id/logs)
  - Implement log streaming service with Redis pub/sub
  - Add connection management and heartbeat
  - _Requirements: 5.1, 5.2_

- [x] 2.7 Write property test for live logging
  - **Property 15: Agent operations emit logs**
  - **Property 16: Log message rendering completeness**
  - **Property 19: Log buffer size limit**
  - **Validates: Requirements 5.1, 5.2, 5.5**

- [x] 2.8 Implement asset endpoints
  - GET /api/v1/assets - List assets with filtering
  - GET /api/v1/assets/:id - Get asset details
  - GET /api/v1/explore - Public content discovery with pagination
  - _Requirements: 10.1, 10.2_

- [x] 2.9 Write property test for content discovery
  - **Property 35: Filter correctness**
  - **Property 36: Content modal completeness**
  - **Validates: Requirements 10.2, 10.3**

- [x] 2.10 Implement token endpoints
  - GET /api/v1/users/:did/balance - Get user token balance
  - GET /api/v1/users/:did/transactions - Get transaction history
  - POST /api/v1/tokens/reward - Internal endpoint for rewarding users
  - _Requirements: 9.5_

- [x] 2.11 Write property test for token rewards
  - **Property 30: Upload reward amount**
  - **Property 31: View reward amount**
  - **Property 34: Balance calculation correctness**
  - **Validates: Requirements 9.1, 9.2, 9.5**

- [x] 3. Checkpoint - Ensure API Gateway tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Storacha Integration Service
- [x] 4.1 Create Storacha client wrapper
  - Install @web3-storage/w3up-client
  - Implement DID-based authentication
  - Create uploadFile and retrieveFile methods
  - Add retry logic with exponential backoff
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 4.2 Write property test for Storacha operations
  - **Property 2: Story storage round-trip**
  - **Property 6: Image storage round-trip**
  - **Property 23: Upload performance and CID validity**
  - **Property 25: Content retrieval round-trip**
  - **Validates: Requirements 1.2, 2.2, 7.2, 7.4**

- [x] 4.3 Implement CID metadata storage
  - Create service to save CID metadata to database
  - Add file type, size, and timestamp tracking
  - Implement CID validation (regex pattern matching)
  - _Requirements: 7.3_

- [x] 4.4 Write property test for CID metadata
  - **Property 24: CID metadata persistence**
  - **Validates: Requirements 7.3**

- [x] 4.5 Add fallback storage for Storacha failures
  - Implement local filesystem storage as fallback
  - Create retry queue for failed uploads
  - Add background job to retry failed uploads
  - _Requirements: 12.4_

- [x] 4.6 Write property test for fallback storage
  - **Property 47: Storacha fallback storage**
  - **Validates: Requirements 12.4**

- [x] 5. Orchestrator Service
- [x] 5.1 Create orchestrator core logic
  - Implement workflow state management
  - Create agent trigger map (user.input → StoryAgent → AssetAgent → CodeAgent → DeployAgent)
  - Add retry logic with exponential backoff (2s, 4s, 8s)
  - Implement error recovery and workflow continuation
  - _Requirements: 12.1, 12.2_

- [x] 5.2 Write property test for orchestrator retry logic
  - **Property 44: Agent retry with exponential backoff**
  - **Property 45: Workflow continuation after agent failure**
  - **Validates: Requirements 12.1, 12.2**

- [x] 5.3 Implement log emission via Redis pub/sub
  - Create log emitter that publishes to Redis channel
  - Add timestamp and agent type to all log messages
  - Implement log levels (info, warn, error, success)
  - _Requirements: 5.1, 5.2_

- [x] 5.4 Add WebSocket notification service
  - Implement Socket.io server for real-time notifications
  - Send deployment completion notifications
  - Add connection authentication
  - _Requirements: 4.3_

- [x] 5.5 Write property test for WebSocket notifications
  - **Property 14: Deployment WebSocket notification**
  - **Validates: Requirements 4.3**

- [x] 5.6 Implement agent execution with timeout
  - Add timeout configuration for each agent (30s for Story, 60s for Asset/Code, 120s for Deploy)
  - Kill agent process if timeout exceeded
  - Log timeout errors
  - _Requirements: 12.1_

- [x] 6. StoryAgent Service
- [x] 6.1 Create StoryAgent micro-service
  - Initialize Node.js service with Express
  - Install OpenAI SDK
  - Create POST /generate endpoint
  - Implement health check endpoint
  - _Requirements: 1.1_

- [x] 6.2 Implement story generation with OpenAI GPT-4
  - Create spooky system prompt template
  - Call OpenAI API with user input
  - Parse and validate response
  - Add error handling for API failures
  - _Requirements: 1.1_

- [x] 6.3 Write property test for story generation
  - **Property 1: Non-empty input generates story**
  - **Validates: Requirements 1.1**

- [x] 6.4 Integrate story upload to Storacha
  - Upload generated story to Storacha
  - Return CID in response
  - Save story metadata to database
  - _Requirements: 1.2_

- [x] 6.5 Write property test for story storage
  - **Property 2: Story storage round-trip**
  - **Validates: Requirements 1.2**

- [x] 6.6 Add retry logic for OpenAI API failures
  - Implement exponential backoff for rate limits
  - Handle timeout errors
  - Log all retry attempts
  - _Requirements: 1.4_

- [x] 6.7 Write property test for story retry logic
  - **Property 4: Story generation retry with backoff**
  - **Validates: Requirements 1.4**

- [-] 7. AssetAgent Service
- [x] 7.1 Create AssetAgent micro-service
  - Initialize Node.js service with Express
  - Install OpenAI SDK (for DALL-E) or Stability SDK
  - Create POST /generate endpoint
  - Implement health check endpoint
  - _Requirements: 2.1_

- [x] 7.2 Implement image generation with DALL-E 3
  - Generate image prompt from story summary
  - Call DALL-E API with spooky style parameters
  - Download generated image
  - Optimize image size (compress if > 1MB)
  - _Requirements: 2.1_

- [x] 7.3 Write property test for asset generation trigger
  - **Property 5: Story completion triggers asset generation**
  - **Validates: Requirements 2.1**

- [x] 7.4 Integrate image upload to Storacha
  - Upload generated image to Storacha
  - Return CID in response
  - Save image metadata to database
  - _Requirements: 2.2_

- [x] 7.5 Write property test for image storage
  - **Property 6: Image storage round-trip**
  - **Property 8: Asset-story database linkage**
  - **Validates: Requirements 2.2, 2.5**

- [x] 7.6 Add retry logic for image generation failures
  - Implement exponential backoff
  - Handle API rate limits
  - Log all retry attempts
  - _Requirements: 2.4_

- [x] 7.7 Write property test for asset retry logic
  - **Property 4: Story generation retry with backoff** (same pattern)
  - **Validates: Requirements 2.4**

- [-] 8. CodeAgent Service
- [x] 8.1 Create CodeAgent micro-service
  - Initialize Node.js service with Express
  - Install OpenAI SDK (for Codex)
  - Create POST /generate endpoint
  - Implement health check endpoint
  - _Requirements: 3.1_

- [x] 8.2 Implement code generation with OpenAI Codex
  - Generate code prompt from story and image theme
  - Call OpenAI API to generate mini-game HTML/JS code
  - Parse and validate generated code
  - _Requirements: 3.1_

- [x] 8.3 Write property test for code generation trigger
  - **Property 9: Image completion triggers code generation**
  - **Validates: Requirements 3.1**

- [x] 8.4 Implement automated testing for generated code
  - Run ESLint on generated code
  - Execute basic syntax validation
  - Check for security issues (no eval, no inline scripts)
  - _Requirements: 3.2_

- [x] 8.5 Write property test for code testing
  - **Property 10: Generated code is tested**
  - **Validates: Requirements 3.2**

- [x] 8.6 Implement auto-patching for failed tests
  - If tests fail, generate patch using OpenAI
  - Apply patch and re-run tests
  - Retry up to 3 times
  - _Requirements: 3.3_

- [x] 8.7 Write property test for auto-patching
  - **Property 11: Code storage round-trip**
  - **Validates: Requirements 3.4**

- [x] 8.8 Integrate code upload to Storacha
  - Upload passing code to Storacha
  - Return CID in response
  - Save code metadata to database
  - _Requirements: 3.4_

- [x] 9. DeployAgent Service
- [x] 9.1 Create DeployAgent micro-service
  - Initialize Node.js service with Express
  - Install Vercel SDK or IPFS deployment tools
  - Create POST /deploy endpoint
  - Implement health check endpoint
  - _Requirements: 4.1_

- [x] 9.2 Implement deployment to Vercel or IPFS
  - Fetch code from IPFS using CID
  - Deploy to Vercel using API or publish to IPFS gateway
  - Return deployment URL
  - _Requirements: 4.1, 4.2_

- [x] 9.3 Write property test for deployment trigger
  - **Property 12: Code completion triggers deployment**
  - **Property 13: Deployment information persistence**
  - **Validates: Requirements 4.1, 4.2**

- [x] 9.4 Add deployment retry logic
  - Implement exponential backoff for deployment failures
  - Handle API rate limits
  - Log all retry attempts
  - _Requirements: 4.4_

- [x] 9.5 Send deployment completion notification
  - Emit WebSocket event on successful deployment
  - Include deployment URL and CID
  - _Requirements: 4.3_

- [x] 10. Checkpoint - Ensure all agent services tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Smart Contracts (Solidity)
- [ ] 11.1 Set up foundry  project
  - Initialize Hardhat in apps/blockchain
  - Configure networks (localhost, eth testnet , Mumbai testnet, Polygon testnet )
  - Install OpenZeppelin contracts
  - _Requirements: 16.1_

- [ ] 11.2 Implement HHCWToken contract (ERC20)
  - Write HHCWToken.sol with mint and burn functions
  - Add treasury access control
  - Write deployment script
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 11.3 Implement GhostBadge contract (ERC721)
  - Write GhostBadge.sol with mintBadge function
  - Add badge type metadata
  - Implement tokenURI for metadata
  - _Requirements: 16.1, 16.2_

- [ ] 11.4 Implement Treasury contract
  - Write Treasury.sol with reward functions
  - Add rewardUpload, rewardView, rewardReferral functions
  - Add grantBadge function
  - _Requirements: 9.1, 9.2, 9.3, 16.1_

- [ ] 11.5 Write unit tests for smart contracts
  - Test token minting and burning
  - Test badge minting
  - Test reward distribution
  - Test access control
  - _Requirements: 9.1, 16.1_

- [ ] 11.6 Deploy contracts to Mumbai testnet
  - Deploy HHCWToken, GhostBadge, Treasury
  - Verify contracts on Polygonscan
  - Save contract addresses to environment variables
  - _Requirements: 9.1, 16.1_

- [ ] 11.7 Write property test for token rewards
  - **Property 30: Upload reward amount**
  - **Property 31: View reward amount**
  - **Property 32: Referral reward amount**
  - **Property 33: Transaction logging**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [ ] 11.8 Write property test for NFT badges
  - **Property 59: Achievement badge minting**
  - **Property 60: Milestone badge minting**
  - **Property 61: Badge transaction recording**
  - **Validates: Requirements 16.1, 16.2, 16.3**

- [ ] 12. Token Service Integration
- [ ] 12.1 Create blockchain service in API
  - Install ethers.js
  - Create contract interaction methods
  - Implement wallet management (use server wallet for gas)
  - _Requirements: 9.1_

- [ ] 12.2 Implement reward distribution logic
  - Call Treasury.rewardUpload when user uploads content
  - Call Treasury.rewardView when user views content
  - Call Treasury.rewardReferral when referral completes
  - Record all transactions in database
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 12.3 Implement badge minting logic
  - Check user achievements (10 rooms, 1000 tokens)
  - Call Treasury.grantBadge when achievement unlocked
  - Record badge in database
  - _Requirements: 16.1, 16.2, 16.3_

- [ ] 12.4 Write property test for badge display
  - **Property 62: Badge display completeness**
  - **Property 63: Badge metadata display**
  - **Validates: Requirements 16.4, 16.5**

- [ ] 13. Frontend - Next.js Application
- [ ] 13.1 Initialize Next.js project
  - Create Next.js 14 app in apps/web
  - Install TailwindCSS and configure dark theme
  - Set up app router structure
  - Configure environment variables
  - _Requirements: 6.1_

- [ ] 13.2 Create landing page (/)
  - Design hero section with spooky theme
  - Add Connect Wallet button
  - Implement fog overlay with CSS animations
  - Add feature showcase section
  - _Requirements: 6.1_

- [ ] 13.3 Implement Web3 wallet connection
  - Install Wagmi and Viem
  - Create WalletConnect integration
  - Implement signature request for authentication
  - Store JWT in localStorage
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 13.4 Write property test for authentication flow
  - **Property 39: Wallet connection triggers signature request**
  - **Property 40: Valid signature issues JWT**
  - **Property 41: JWT storage and usage**
  - **Validates: Requirements 11.1, 11.2, 11.3**

- [ ] 13.5 Create dashboard page (/app)
  - Design sidebar with navigation
  - Create agent status cards
  - Display recent rooms list
  - Show token balance and badges
  - Add "Create New Session" button
  - _Requirements: 8.1_

- [ ] 13.6 Create live room page (/room/[id])
  - Design input panel for user prompt
  - Create preview panel for generated content
  - Add live logs terminal component
  - Implement SSE connection for real-time logs
  - _Requirements: 5.1, 5.2_

- [ ] 13.7 Write property test for live logs display
  - **Property 16: Log message rendering completeness**
  - **Property 17: Error log formatting**
  - **Property 18: Success log formatting**
  - **Property 19: Log buffer size limit**
  - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ] 13.8 Implement Three.js spooky visualization
  - Install Three.js and React Three Fiber
  - Create 3D scene with fog effect
  - Add animated ghost sprites for each agent
  - Implement particle system for success/error animations
  - Add camera movement on mouse hover
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 13.9 Write property test for Three.js interactions
  - **Property 49: Agent operation displays ghost sprite**
  - **Property 50: Success triggers particle animation**
  - **Property 51: Error triggers red glow and thunder**
  - **Property 52: Mouse movement affects camera**
  - **Validates: Requirements 13.2, 13.3, 13.4, 13.5**

- [ ] 13.10 Add spooky sound effects with Howler.js
  - Install Howler.js
  - Add sound files (whisper, ghost laugh, thunder)
  - Play sounds on user interactions
  - Play sounds on operation success/failure
  - _Requirements: 6.2_

- [ ] 13.11 Write property test for sound effects
  - **Property 20: Interaction triggers sound**
  - **Validates: Requirements 6.2**

- [ ] 13.12 Create explore page (/explore)
  - Design content grid with pagination
  - Add filter bar (by agent type, date)
  - Implement search functionality
  - Create content modal for full details
  - Add CID copy and download buttons
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 13.13 Write property test for explore page
  - **Property 35: Filter correctness**
  - **Property 37: Clipboard copy operation**
  - **Property 38: Image download functionality**
  - **Validates: Requirements 10.2, 10.4, 10.5**

- [ ] 13.14 Implement multi-language support
  - Install next-intl or react-i18next
  - Create translation files (en, ar)
  - Detect browser language
  - Add language switcher
  - Implement RTL support for Arabic
  - _Requirements: 20.1, 20.2, 20.4_

- [ ] 13.15 Write property test for multi-language
  - **Property 77: Language detection**
  - **Property 78: Language switching without reload**
  - **Property 80: RTL text rendering**
  - **Validates: Requirements 20.1, 20.2, 20.4**

- [ ] 14. Checkpoint - Ensure frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Error Handling and Resilience
- [ ] 15.1 Implement global error handler in API
  - Create exception filter for all errors
  - Log errors with Winston
  - Return appropriate HTTP status codes
  - _Requirements: 12.5_

- [ ] 15.2 Add database reconnection logic
  - Implement Prisma connection retry
  - Add connection health checks
  - Log connection status
  - _Requirements: 12.3_

- [ ] 15.3 Write property test for database reconnection
  - **Property 46: Database auto-reconnection**
  - **Validates: Requirements 12.3**

- [ ] 15.4 Implement webhook notifications for critical errors
  - Create webhook service
  - Send POST requests to configured endpoint
  - Include error details and stack trace
  - _Requirements: 12.5_

- [ ] 15.5 Write property test for error notifications
  - **Property 48: Critical error webhook notification**
  - **Validates: Requirements 12.5**

- [ ] 15.6 Add JWT expiration handling in frontend
  - Detect 401 responses
  - Trigger re-authentication flow
  - Clear expired JWT from localStorage
  - _Requirements: 11.4_

- [ ] 15.7 Write property test for JWT expiration
  - **Property 42: JWT expiration handling**
  - **Validates: Requirements 11.4**

- [ ] 16. Monitoring and Observability
- [ ] 16.1 Set up Winston logger
  - Install Winston
  - Configure log levels and formats
  - Add file and console transports
  - Include stack traces for errors
  - _Requirements: 18.3_

- [ ] 16.2 Write property test for error logging
  - **Property 70: Error logging with stack trace**
  - **Validates: Requirements 18.3**

- [ ] 16.3 Set up Prometheus metrics collection
  - Install prom-client
  - Create metrics for CPU, memory, request count, response time
  - Expose /metrics endpoint
  - _Requirements: 18.1_

- [ ] 16.4 Write property test for metrics collection
  - **Property 68: Metrics collection**
  - **Validates: Requirements 18.1**

- [ ] 16.5 Set up Grafana dashboards
  - Install Grafana
  - Create dashboard for API metrics
  - Create dashboard for agent metrics
  - Add alerting rules
  - _Requirements: 18.2, 18.4_

- [ ] 17. API Documentation
- [ ] 17.1 Configure Swagger/OpenAPI
  - Install @nestjs/swagger
  - Add API decorators to all endpoints
  - Configure Swagger UI at /api/docs
  - _Requirements: 17.1_

- [ ] 17.2 Add comprehensive API documentation
  - Document all parameters with examples
  - Add response schemas
  - Include authentication requirements
  - Add error response examples
  - _Requirements: 17.2_

- [ ] 17.3 Write property test for API documentation
  - **Property 64: Endpoint documentation completeness**
  - **Property 66: Documentation auto-update**
  - **Validates: Requirements 17.2, 17.4**

- [ ] 17.4 Implement Swagger try-it-out functionality
  - Configure Swagger to allow API testing
  - Add authentication support in Swagger UI
  - _Requirements: 17.3_

- [ ] 17.5 Add API search functionality
  - Implement search in Swagger UI
  - Add tags for endpoint categorization
  - _Requirements: 17.5_

- [ ] 18. Kiro Integration
- [ ] 18.1 Create Kiro hooks
  - Create .kiro/hooks/on-save.sh to run tests on file save
  - Create .kiro/hooks/on-commit.sh to run linter
  - _Requirements: 19.1, 19.2_

- [ ] 18.2 Write property test for Kiro hooks
  - **Property 72: File save triggers tests**
  - **Property 73: Test failure displays errors**
  - **Validates: Requirements 19.1, 19.2**

- [ ] 18.3 Create Kiro steering docs
  - Create .kiro/steering/code-standards.md with project coding standards
  - Create .kiro/steering/architecture.md with architecture guidelines
  - _Requirements: 19.3, 19.4_

- [ ] 18.4 Write property test for steering docs
  - **Property 74: Code generation uses steering docs**
  - **Property 75: Steering doc updates affect generation**
  - **Validates: Requirements 19.3, 19.4**

- [ ] 18.5 Configure MCP plugins
  - Create .kiro/settings/mcp.json
  - Configure Storacha MCP plugin
  - Configure OpenAI MCP plugin
  - Add real API credentials
  - _Requirements: 19.5_

- [ ] 18.6 Write property test for MCP integration
  - **Property 76: MCP plugin real API integration**
  - **Validates: Requirements 19.5**

- [ ] 19. Final Integration and Testing
- [ ] 19.1 Run end-to-end integration tests
  - Test complete workflow: input → story → image → code → deploy
  - Verify all CIDs are valid and retrievable
  - Verify token rewards are distributed
  - Verify badges are minted
  - _Requirements: All_

- [ ] 19.2 Run all property-based tests
  - Execute all 81 property tests with 100 iterations each
  - Verify all properties pass
  - Document any failing cases
  - _Requirements: All_

- [ ] 19.3 Perform load testing
  - Run k6 load tests with 50 concurrent users
  - Verify 95th percentile response time < 5s
  - Verify error rate < 10%
  - _Requirements: 14.5_

- [ ] 19.4 Security audit
  - Check for exposed API keys
  - Verify JWT secret strength
  - Test rate limiting
  - Verify input validation
  - Test CORS configuration
  - _Requirements: All_

- [ ] 19.5 Deploy to staging environment
  - Deploy all services to staging
  - Run smoke tests
  - Verify all integrations work
  - _Requirements: 15.4_

- [ ] 20. Documentation and README
- [ ] 20.1 Create comprehensive README.md
  - Add project overview and features
  - Add architecture diagram
  - Add setup instructions
  - Add API documentation link
  - Add demo video/screenshots
  - Add hackathon pitch section
  - _Requirements: All_

- [ ] 20.2 Create CONTRIBUTING.md
  - Add development setup guide
  - Add coding standards
  - Add PR process
  - _Requirements: All_

- [ ] 20.3 Create deployment guide
  - Document environment variables
  - Document deployment steps
  - Add troubleshooting section
  - _Requirements: 15.4_

- [ ] 21. Final Checkpoint - Production Ready
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all features work end-to-end
  - Confirm README is impressive and complete
  - Ready for GitHub push and hackathon submission
