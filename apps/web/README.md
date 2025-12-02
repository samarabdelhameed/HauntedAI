# HauntedAI Frontend

**Managed by Kiro** | Spooky AI Platform Frontend

## Overview

This is the frontend application for HauntedAI, built with Vite + React + TypeScript. It provides a haunting user interface for interacting with AI agents that generate spooky content.

## Features

- ✅ **Spooky UI**: Dark theme with animated backgrounds, floating ghosts, and fog effects
- ✅ **Web3 Integration**: MetaMask wallet connection for authentication
- ✅ **Real-time Logs**: Server-Sent Events (SSE) for live agent activity
- ✅ **API Integration**: Full integration with NestJS backend
- ✅ **Sound Effects**: Spooky sounds using Howler.js
- ✅ **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: Vite + React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Web3**: MetaMask integration
- **State Management**: React Context API

## Setup

### Prerequisites

- Node.js 20+
- MetaMask browser extension
- Backend API running on `http://localhost:3001`

### Installation

```bash
cd apps/web
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=HauntedAI
VITE_ENABLE_SOUNDS=true
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
apps/web/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AnimatedBackground.tsx
│   │   ├── FloatingGhost.tsx
│   │   └── GlowButton.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/            # Page components
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LiveRoom.tsx
│   │   ├── Explore.tsx
│   │   └── Profile.tsx
│   ├── utils/            # Utility functions
│   │   ├── apiClient.ts
│   │   ├── web3.ts
│   │   └── soundManager.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── .env                  # Environment variables
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Pages

### 1. Landing Page (`/`)

- Hero section with spooky theme
- Connect Wallet button
- Feature showcase
- Navigation to Dashboard and Explore

### 2. Dashboard (`/dashboard`)

- Agent status cards
- Recent rooms list
- Token balance display
- Create new session modal

### 3. Live Room (`/room/:id`)

- Real-time agent logs via SSE
- Start workflow button
- Asset preview panel
- CID display and copy

### 4. Explore (`/explore`)

- Browse all generated assets
- Filter by agent type
- Search by CID
- View asset details modal

### 5. Profile (`/profile`)

- User information
- Token balance
- Transaction history
- NFT badges

## API Integration

The frontend communicates with the backend API using the `apiClient` utility:

```typescript
import { apiClient } from './utils/apiClient';

// Authentication
await apiClient.login(walletAddress, signature, message);

// Rooms
await apiClient.createRoom(inputText);
await apiClient.getRoom(roomId);
await apiClient.startRoom(roomId);
await apiClient.listRooms();

// Assets
await apiClient.listAssets(filters);
await apiClient.getAsset(assetId);

// Tokens
await apiClient.getBalance(did);
await apiClient.getTransactions(did);

// SSE
const eventSource = apiClient.createSSEConnection(roomId, onMessage, onError);
```

## Web3 Integration

The frontend uses MetaMask for wallet connection:

```typescript
import { web3Manager } from './utils/web3';

// Connect wallet
const connection = await web3Manager.connectWallet();

// Sign message
const signature = await web3Manager.signMessage(address, message);

// Get balance
const balance = await web3Manager.getBalance(address);
```

## Authentication Flow

1. User clicks "Connect Wallet"
2. MetaMask prompts for account access
3. User signs authentication message
4. Frontend sends signature to backend
5. Backend verifies signature and issues JWT
6. JWT stored in localStorage
7. JWT included in all API requests

## Real-time Logs (SSE)

The Live Room page uses Server-Sent Events for real-time agent logs:

```typescript
const eventSource = apiClient.createSSEConnection(
  roomId,
  (log) => {
    // Handle log message
    console.log(log);
  },
  (error) => {
    // Handle error
    console.error(error);
  }
);

// Cleanup
eventSource.close();
```

## Sound Effects

The app includes spooky sound effects:

```typescript
import { soundManager } from './utils/soundManager';

// Play sounds
soundManager.play('hover');
soundManager.play('click');
soundManager.play('success');
soundManager.play('error');

// Toggle sounds
soundManager.toggle();

// Set volume
soundManager.setVolume(0.5);
```

## Styling

The app uses TailwindCSS with custom utilities:

- `.glass` - Glassmorphism effect
- `.text-glow` - Text glow effect
- `.font-creepster` - Spooky font
- `.animate-float` - Floating animation
- `.animate-pulse-glow` - Pulsing glow animation

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker

```bash
# Build image
docker build -t haunted-ai-web .

# Run container
docker run -p 5173:5173 haunted-ai-web
```

### Production

The app can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Troubleshooting

### MetaMask not detected

Make sure MetaMask extension is installed and enabled.

### API connection failed

Check that the backend API is running on `http://localhost:3001`.

### SSE connection error

Ensure the backend supports CORS and SSE endpoints are accessible.

### Sounds not playing

Check browser console for errors. Some browsers block autoplay.

## Contributing

This project follows the HauntedAI development standards. See the main README for contribution guidelines.

## License

MIT

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024
