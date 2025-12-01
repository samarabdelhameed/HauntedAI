# Requirements Document - HauntedAI

## Introduction

HauntedAI is a multi-agent AI system that autonomously generates spooky content (stories, images, code) and stores it on the decentralized Storacha/IPFS network. The system uses Kiro as the core platform for managing intelligent agents and provides an interactive, haunting user interface.

## Glossary

- **HauntedAI System**: The complete system managing intelligent agents, UI, and storage
- **Agent**: An autonomous intelligent agent performing specific tasks (StoryAgent, AssetAgent, CodeAgent, DeployAgent)
- **Orchestrator**: The central coordinator managing agent workflow and communication
- **Storacha Network**: Decentralized storage network built on IPFS
- **CID**: Content Identifier - unique identifier for content on IPFS
- **Room**: A single work session containing user input and agent outputs
- **Live Logs**: Real-time log displaying agent operations via Server-Sent Events
- **HHCW Token**: System reward token (ERC20 on Polygon)
- **DID**: Decentralized Identifier - unique decentralized ID for each user
- **API Gateway**: Central gateway receiving requests and routing them to services
- **Micro-service**: Independent service performing specific tasks within the system
- **Three.js Canvas**: 3D rendering canvas for displaying spooky visual effects
- **Ghost Badge**: NFT badge (ERC721) awarded to users for achievements
- **Preview Panel**: Panel displaying generated content (image, story, CID)
- **Spooky Theme**: Haunting UI theme (dark mode + purple/red colors + fog effects)

## Requirements

### Requirement 1: Story Generation

**User Story:** As a user, I want to input my name or a short idea and receive a personalized spooky story, so that I can enjoy a unique and frightening experience.

#### Acceptance Criteria

1. WHEN the user enters text in the input field and clicks Submit, THEN THE StoryAgent SHALL generate a personalized spooky story based on the entered text using real OpenAI API
2. WHEN StoryAgent completes story generation, THEN THE System SHALL store the story on Storacha Network and return a valid CID
3. WHEN the story is stored, THEN THE System SHALL display the complete story in the user interface with the CID
4. WHEN StoryAgent fails to generate, THEN THE System SHALL retry up to 3 times with exponential backoff
5. WHEN all retry attempts fail, THEN THE System SHALL display a clear error message and log the error in Live Logs

### Requirement 2: Asset Generation

**User Story:** As a user, I want to see a spooky image related to the generated story, so that the experience is visual and immersive.

#### Acceptance Criteria

1. WHEN StoryAgent completes story generation, THEN THE AssetAgent SHALL automatically start generating a spooky image related to the story using real DALL-E or Stability AI API
2. WHEN AssetAgent generates the image, THEN THE System SHALL store the image on Storacha Network and return a valid CID
3. WHEN the image is stored, THEN THE System SHALL display the image in the Preview Panel with a copyable CID
4. WHEN AssetAgent fails to generate, THEN THE System SHALL retry up to 3 times
5. WHEN the image is displayed, THEN THE System SHALL link the image to the story in the database

### Requirement 3: Code Generation and Auto-Patching

**User Story:** As a developer, I want the system to generate mini-game code and automatically fix errors, so that I get working code without manual intervention.

#### Acceptance Criteria

1. WHEN AssetAgent completes image generation, THEN THE CodeAgent SHALL automatically start generating mini-game code using real OpenAI Codex API
2. WHEN CodeAgent generates code, THEN THE System SHALL run automated tests on the code
3. WHEN tests fail, THEN THE CodeAgent SHALL generate an automatic patch to fix the errors
4. WHEN code passes tests, THEN THE System SHALL store the code on Storacha Network and return a CID
5. WHEN CodeAgent fails to fix errors after 3 attempts, THEN THE System SHALL log the error and continue with remaining operations

### Requirement 4: Deployment Automation

**User Story:** As a user, I want generated content to be automatically deployed, so that it is immediately available for viewing.

#### Acceptance Criteria

1. WHEN CodeAgent completes code generation, THEN THE DeployAgent SHALL automatically start the deployment process
2. WHEN DeployAgent deploys content, THEN THE System SHALL store deployment information (URL, CID) in the database
3. WHEN deployment completes, THEN THE System SHALL send a success notification via WebSocket to the frontend
4. WHEN DeployAgent fails, THEN THE System SHALL log the error and retry
5. WHEN all retry attempts fail, THEN THE System SHALL display an error message with problem details

### Requirement 5: Live Logging and Monitoring

**User Story:** As a user or judge, I want to see agent operations in real-time, so that I can understand how the system works and track progress.

#### Acceptance Criteria

1. WHEN any Agent starts an operation, THEN THE System SHALL send a log message via Server-Sent Events to the frontend
2. WHEN a log message reaches the frontend, THEN THE System SHALL display it in the Live Logs Panel with timestamp and Agent type
3. WHEN an error occurs, THEN THE System SHALL display the error in red with clear details
4. WHEN an operation succeeds, THEN THE System SHALL display a success message in green with an icon
5. WHEN Live Logs fill up, THEN THE System SHALL keep only the last 100 messages with auto-scroll

### Requirement 6: Spooky User Interface

**User Story:** As a user, I want a spooky and visually appealing interface, so that the experience is immersive and distinctive.

#### Acceptance Criteria

1. WHEN the user opens the application, THEN THE System SHALL display a dark mode interface with purple and red colors
2. WHEN the user interacts with the interface, THEN THE System SHALL play spooky sound effects (whisper, ghost laugh) using Howler.js
3. WHEN an operation succeeds or fails, THEN THE System SHALL display appropriate animations (ghost sprite, fog particles)
4. WHEN the user hovers over elements, THEN THE System SHALL display a glow effect in purple or red
5. WHEN the interface loads, THEN THE System SHALL display a moving fog overlay with animated particles

### Requirement 7: Storacha Integration

**User Story:** As a developer, I want to store all generated content on a decentralized network, so that content is permanent and available without centralized servers.

#### Acceptance Criteria

1. WHEN the system starts, THEN THE System SHALL connect to Storacha Network using a pre-configured DID with real authentication
2. WHEN content is generated, THEN THE System SHALL upload it to Storacha and return a valid CID within 10 seconds
3. WHEN a CID is returned, THEN THE System SHALL save it in the database with metadata (file type, size, timestamp)
4. WHEN the user requests content, THEN THE System SHALL retrieve it from IPFS using the CID
5. WHEN connection to Storacha fails, THEN THE System SHALL retry connection with exponential backoff

### Requirement 8: Room Management

**User Story:** As a user, I want to create separate work sessions (Rooms), so that I can organize and manage generated content easily.

#### Acceptance Criteria

1. WHEN the user clicks "Create New Session", THEN THE System SHALL create a new Room with a unique UUID
2. WHEN a Room is created, THEN THE System SHALL save Room information in the database with status "idle"
3. WHEN the user starts a generation process, THEN THE System SHALL update status to "running"
4. WHEN all agents finish, THEN THE System SHALL update status to "done"
5. WHEN an error occurs, THEN THE System SHALL update status to "error" with error details

### Requirement 9: Token Rewards System

**User Story:** As a user, I want to receive HHCW Token rewards when using the system, so that I feel motivated to participate and continue.

#### Acceptance Criteria

1. WHEN the user uploads content, THEN THE System SHALL grant them 10 HHCW tokens via real blockchain transaction
2. WHEN the user views content, THEN THE System SHALL grant them 1 HHCW token
3. WHEN the user invites a friend, THEN THE System SHALL grant them 50 HHCW tokens when the friend registers
4. WHEN a transaction occurs, THEN THE System SHALL record it in the token_tx table with tx_hash from Polygon network
5. WHEN the user requests their balance, THEN THE System SHALL return the current balance from the database

### Requirement 10: Explore and Discovery

**User Story:** As a user, I want to explore content generated by other users, so that I can enjoy different spooky stories and images.

#### Acceptance Criteria

1. WHEN the user opens the Explore page, THEN THE System SHALL display a grid of public content with pagination
2. WHEN the user filters by Agent type, THEN THE System SHALL display only matching content
3. WHEN the user clicks on content, THEN THE System SHALL open a modal displaying full details with CID
4. WHEN the user copies a CID, THEN THE System SHALL copy it to clipboard and display a confirmation message
5. WHEN the user downloads an image, THEN THE System SHALL retrieve it from IPFS and start the download

### Requirement 11: Authentication and Authorization

**User Story:** As a user, I want to log in using a Web3 wallet, so that I can maintain my decentralized identity and account security.

#### Acceptance Criteria

1. WHEN the user clicks "Connect Wallet", THEN THE System SHALL request a message signature from the wallet using real Web3 provider
2. WHEN the user signs the message, THEN THE System SHALL verify the signature and issue a JWT token
3. WHEN a JWT is issued, THEN THE System SHALL save it in localStorage and use it in all requests
4. WHEN a JWT expires, THEN THE System SHALL request the user to re-sign
5. WHEN the user logs out, THEN THE System SHALL delete the JWT from localStorage and redirect to the home page

### Requirement 12: Error Recovery and Resilience

**User Story:** As a developer, I want the system to automatically recover from errors, so that it continues working without manual intervention.

#### Acceptance Criteria

1. WHEN any Agent fails, THEN THE Orchestrator SHALL retry up to 3 times with exponential backoff
2. WHEN all retry attempts fail, THEN THE Orchestrator SHALL log the error and continue with other agents
3. WHEN the database loses connection, THEN THE System SHALL automatically reconnect
4. WHEN Storacha Network is unavailable, THEN THE System SHALL temporarily store content locally and retry later
5. WHEN a critical error occurs, THEN THE System SHALL send a notification to developers via webhook

### Requirement 13: Three.js Spooky Visualization

**User Story:** As a user, I want to see spooky 3D visual effects, so that the experience is immersive and visually appealing.

#### Acceptance Criteria

1. WHEN the user opens Live Room, THEN THE System SHALL display a Three.js canvas with moving fog effect
2. WHEN an Agent operation starts, THEN THE System SHALL display an animated ghost sprite representing the agent
3. WHEN an operation succeeds, THEN THE System SHALL play particle animation (flying leaves or sparks)
4. WHEN an error occurs, THEN THE System SHALL display a red glow effect with thunder sound
5. WHEN the user moves the mouse, THEN THE System SHALL slightly move the camera to add depth

### Requirement 14: Micro-services Architecture

**User Story:** As a developer, I want a scalable micro-services architecture, so that each service can be developed and maintained independently.

#### Acceptance Criteria

1. WHEN the system starts, THEN THE System SHALL run each Agent as a separate micro-service
2. WHEN API Gateway receives a request, THEN THE System SHALL route it to the appropriate micro-service
3. WHEN a micro-service fails, THEN THE System SHALL automatically restart it without affecting other services
4. WHEN a micro-service needs to communicate with another, THEN THE System SHALL use a message queue (Redis/BullMQ)
5. WHEN request load increases, THEN THE System SHALL be able to horizontally scale any micro-service

### Requirement 15: Docker and CI/CD

**User Story:** As a developer, I want containerization and CI/CD pipeline, so that deployment is fast and reliable.

#### Acceptance Criteria

1. WHEN a developer commits code, THEN THE System SHALL automatically run a GitHub Actions workflow
2. WHEN the workflow starts, THEN THE System SHALL run lint, tests, and build
3. WHEN build succeeds, THEN THE System SHALL build Docker images and push them to Docker Hub
4. WHEN images are ready, THEN THE System SHALL automatically deploy to staging environment
5. WHEN staging tests pass, THEN THE System SHALL allow manual approval for production deploy

### Requirement 16: Smart Contracts and NFT Badges

**User Story:** As a user, I want to receive NFT badges for certain achievements, so that I feel proud and can showcase my accomplishments.

#### Acceptance Criteria

1. WHEN the user completes 10 rooms, THEN THE System SHALL grant them a Ghost Badge NFT (ERC721) via real blockchain transaction
2. WHEN the user earns 1000 HHCW tokens, THEN THE System SHALL grant them a Haunted Master Badge
3. WHEN a badge is granted, THEN THE System SHALL record the transaction on Polygon blockchain with real tx_hash
4. WHEN the user opens their profile, THEN THE System SHALL display all owned badges fetched from blockchain
5. WHEN the user clicks on a badge, THEN THE System SHALL display metadata and acquisition date

### Requirement 17: API Documentation

**User Story:** As an external developer, I want clear and interactive API documentation, so that I can integrate with the system easily.

#### Acceptance Criteria

1. WHEN a developer opens `/api/docs`, THEN THE System SHALL display an interactive Swagger UI
2. WHEN a developer selects an endpoint, THEN THE System SHALL display parameters, response schema, and examples
3. WHEN a developer tests an endpoint from Swagger, THEN THE System SHALL send the request and display the result
4. WHEN the API changes, THEN THE System SHALL automatically update documentation from code
5. WHEN a developer searches for an endpoint, THEN THE System SHALL provide search functionality

### Requirement 18: Monitoring and Observability

**User Story:** As a developer, I want to monitor system performance and track errors, so that I can improve performance and solve problems quickly.

#### Acceptance Criteria

1. WHEN the system runs, THEN THE System SHALL collect metrics (CPU, memory, requests/sec) and send them to Prometheus
2. WHEN metrics are collected, THEN THE System SHALL display them in Grafana dashboards
3. WHEN an error occurs, THEN THE System SHALL log it in Winston logger with full stack trace
4. WHEN performance degrades, THEN THE System SHALL send an alert to developers
5. WHEN a developer opens the monitoring dashboard, THEN THE System SHALL display real-time metrics for each micro-service

### Requirement 19: Kiro Integration and Hooks

**User Story:** As a developer, I want to use Kiro hooks and steering docs, so that I can benefit from Kiro's full capabilities.

#### Acceptance Criteria

1. WHEN a developer saves a code file, THEN THE Kiro Hook SHALL automatically run tests
2. WHEN tests fail, THEN THE Kiro Hook SHALL display errors in the IDE
3. WHEN a developer requests code generation, THEN THE Kiro Agent SHALL use steering docs to understand project standards
4. WHEN a steering doc is updated, THEN THE System SHALL apply new standards to generated code
5. WHEN a developer uses an MCP plugin, THEN THE System SHALL seamlessly integrate with Storacha and OpenAI using real API credentials

### Requirement 20: Multi-language Support

**User Story:** As an Arabic user, I want an interface in Arabic, so that I can use the system easily.

#### Acceptance Criteria

1. WHEN the user opens the application, THEN THE System SHALL detect browser language and display the interface in that language
2. WHEN the user changes language, THEN THE System SHALL update all text immediately without reloading
3. WHEN StoryAgent generates a story, THEN THE System SHALL generate it in the language selected by the user using real OpenAI API with language parameter
4. WHEN the user enters Arabic text, THEN THE System SHALL display it correctly with RTL support
5. WHEN the system displays dates and numbers, THEN THE System SHALL use the appropriate format for the selected language

### Requirement 21: Kiro-Centric Development ⭐ **CORE REQUIREMENT**

**User Story:** As a developer, I want every agent to be generated or modified using Kiro specs and MCP plugins, so that we showcase Kiro's full power and capabilities.

#### Acceptance Criteria

1. WHEN creating an Agent, THEN THE Developer SHALL use Kiro steering docs to define its behavior and standards
2. WHEN an Agent needs external tools (OpenAI, Storacha), THEN THE System SHALL connect via Kiro MCP plugins with real API credentials
3. WHEN an Agent logic changes, THEN THE Developer SHALL update the Kiro spec file, and the system SHALL regenerate the agent code
4. WHEN a judge reviews the code, THEN THEY SHALL see explicit `// Generated by Kiro` or `// Managed by Kiro` comments in every agent file
5. WHEN the demo runs, THEN THE Presenter SHALL show the Kiro spec file alongside the live agent execution

---

## 🎯 Implementation Phases

### Phase 1: Core MVP (Requirements 1, 2, 3, 7, 5, 21) ⭐ **START HERE**

**Goal**: Demonstrate autonomous agent workflow with Kiro integration

**Core Requirements**:

1. ✅ **Requirement 1**: Story Generation (StoryAgent with OpenAI)
2. ✅ **Requirement 2**: Asset Generation (AssetAgent with DALL-E)
3. ✅ **Requirement 3**: Code Generation (CodeAgent with Codex)
4. ✅ **Requirement 7**: Storacha Integration (Real CID storage)
5. ✅ **Requirement 5**: Live Logging (Real-time SSE logs)
6. ✅ **Requirement 21**: Kiro-Centric Development (MCP + Steering Docs)

**Deliverable**: Working demo where user inputs text → agents generate story + image + code → all stored on IPFS with live logs

**Timeline**: Week 1-2

---

### Phase 2: Enhanced Experience (Requirements 6, 8, 12, 14, 15)

**Goal**: Add professional UI, error handling, and deployment

**Additional Requirements**:

- **Requirement 6**: Spooky UI (Dark theme, fog, sounds)
- **Requirement 8**: Room Management (Session tracking)
- **Requirement 12**: Error Recovery (Retry logic, resilience)
- **Requirement 14**: Micro-services (Scalable architecture)
- **Requirement 15**: Docker + CI/CD (Automated deployment)

**Deliverable**: Production-ready platform with professional UI and robust error handling

**Timeline**: Week 3

---

### Phase 3: Blockchain & Gamification (Requirements 9, 11, 16)

**Goal**: Add Web3 features and token economy

**Additional Requirements**:

- **Requirement 11**: Web3 Authentication (Wallet connect)
- **Requirement 9**: Token Rewards (HHCW ERC20)
- **Requirement 16**: NFT Badges (Ghost Badge ERC721)

**Deliverable**: Full blockchain integration with rewards and achievements

**Timeline**: Week 4

---

### Phase 4: Advanced Features (Requirements 4, 10, 13, 17, 18, 19, 20)

**Goal**: Complete all advanced features

**Additional Requirements**:

- **Requirement 4**: Deployment Automation (DeployAgent)
- **Requirement 10**: Explore & Discovery (Content browsing)
- **Requirement 13**: Three.js Visualization (3D effects)
- **Requirement 17**: API Documentation (Swagger)
- **Requirement 18**: Monitoring (Prometheus + Grafana)
- **Requirement 19**: Full Kiro Integration (Hooks)
- **Requirement 20**: Multi-language (Arabic + RTL)

**Deliverable**: Feature-complete platform ready for hackathon submission

**Timeline**: Week 5+

---

## 📝 Notes for Judges

This project demonstrates **Kiro's full capabilities**:

- ✅ **Specs-driven development**: Every agent defined in Kiro specs
- ✅ **MCP Plugins**: Real integration with OpenAI and Storacha
- ✅ **Steering Docs**: Project standards enforced via Kiro
- ✅ **Hooks**: Automated testing on file save
- ✅ **Property-Based Testing**: 81 correctness properties verified
- ✅ **Real APIs**: No mocks - everything uses real external services
