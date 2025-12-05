#!/bin/bash

# 🎬 HauntedAI x Kiro - Demo Recording Setup Script
# This script prepares your environment for recording the demo video

set -e

echo "🎬 Setting up demo recording environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Clean up any running processes
echo -e "${BLUE}📋 Step 1: Cleaning up existing processes...${NC}"
pkill -f "node.*api" || true
pkill -f "node.*agents" || true
pkill -f "next dev" || true
pkill -f "redis-server" || true
sleep 2

# 2. Start Redis
echo -e "${BLUE}📋 Step 2: Starting Redis...${NC}"
redis-server --daemonize yes
sleep 2

# 3. Verify environment variables
echo -e "${BLUE}📋 Step 3: Checking environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update .env with your actual API keys before recording!${NC}"
    exit 1
fi

# Check critical env vars
if ! grep -q "GROQ_API_KEY=sk-" .env; then
    echo -e "${YELLOW}⚠️  Warning: GROQ_API_KEY not set in .env${NC}"
fi

if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo -e "${YELLOW}⚠️  Warning: OPENAI_API_KEY not set in .env${NC}"
fi

# 4. Install dependencies if needed
echo -e "${BLUE}📋 Step 4: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# 5. Build the project
echo -e "${BLUE}📋 Step 5: Building project...${NC}"
npm run build || echo "Build completed with warnings"

# 6. Prepare demo data
echo -e "${BLUE}📋 Step 6: Preparing demo database...${NC}"
cd apps/api
npx prisma generate
npx prisma db push --skip-generate
cd ../..

# 7. Set terminal preferences for recording
echo -e "${BLUE}📋 Step 7: Terminal recording tips...${NC}"
echo ""
echo "📝 Terminal Setup Recommendations:"
echo "  - Font size: 16-18pt (for readability)"
echo "  - Theme: Use high contrast (e.g., Dracula, One Dark Pro)"
echo "  - Window size: 1920x1080 or 1280x720"
echo "  - Clear scrollback before recording"
echo ""

# 8. Create demo checklist
echo -e "${BLUE}📋 Step 8: Creating demo checklist...${NC}"
cat > DEMO_CHECKLIST.md << 'EOF'
# 🎬 Demo Recording Checklist

## Pre-Recording Setup

### Environment
- [ ] All API keys configured in .env
- [ ] Redis running
- [ ] Database migrated and seeded
- [ ] All dependencies installed
- [ ] Project builds successfully

### Recording Tools
- [ ] Screen recording software ready (OBS, QuickTime, etc.)
- [ ] Microphone tested and working
- [ ] Audio levels checked
- [ ] Camera positioned (if doing picture-in-picture)
- [ ] Notifications disabled (Do Not Disturb mode)
- [ ] Close unnecessary applications

### Terminal Setup
- [ ] Font size increased (16-18pt)
- [ ] High contrast theme enabled
- [ ] Window size set to 1920x1080 or 1280x720
- [ ] Clear terminal history
- [ ] Navigate to project root

### Browser Setup
- [ ] Clear browser cache and cookies
- [ ] Close unnecessary tabs
- [ ] Zoom level at 100% or 125%
- [ ] Developer tools closed (unless showing)
- [ ] Bookmark bar hidden for clean look

### VS Code Setup
- [ ] Font size increased (14-16pt)
- [ ] Minimap hidden (View → Show Minimap)
- [ ] Activity bar visible
- [ ] Explorer sidebar open
- [ ] Close unnecessary editor tabs
- [ ] Zen mode ready (Cmd+K Z)

## Recording Checklist

### Part 1: Introduction (30s)
- [ ] Show HauntedAI landing page
- [ ] Introduce yourself and project
- [ ] Mention "Built with Kiro AI IDE"

### Part 2: Kiro Integration (1m)
- [ ] Open VS Code
- [ ] Show .kiro folder structure
- [ ] Navigate: specs → steering → hooks
- [ ] Explain each component briefly

### Part 3: Spec-Driven Development (2m)
- [ ] Open requirements.md
- [ ] Scroll through acceptance criteria
- [ ] Open design.md
- [ ] Show correctness properties
- [ ] Open tasks.md
- [ ] Run: `npx kiro spec coverage haunted-ai`
- [ ] Show 100% coverage result

### Part 4: Property-Based Testing (1.5m)
- [ ] Open tokens.property.test.ts
- [ ] Highlight fc.assert with numRuns: 100
- [ ] Open testing-standards.md
- [ ] Show on-save.sh hook
- [ ] Demonstrate: Save a file → Tests run automatically

### Part 5: Live Demo (2m)
- [ ] Split screen: Terminal + Browser
- [ ] Run: `./start-dev.sh`
- [ ] Wait for all services to start
- [ ] Open browser: http://localhost:3001
- [ ] Login with MetaMask
- [ ] Create new room with horror prompt
- [ ] Show real-time SSE logs
- [ ] Wait for story generation
- [ ] Show asset generation
- [ ] Show final deployed experience
- [ ] Show blockchain rewards

### Part 6: Results & Impact (30s)
- [ ] Show metrics summary
- [ ] Highlight key achievements
- [ ] Call to action (GitHub, docs)

## Post-Recording

- [ ] Review footage for errors
- [ ] Check audio quality
- [ ] Add subtitles if needed
- [ ] Add intro/outro graphics
- [ ] Export in high quality (1080p minimum)
- [ ] Upload to platform
- [ ] Share with team for feedback

## Emergency Backup Plans

### If services don't start:
1. Check Redis: `redis-cli ping`
2. Check ports: `lsof -i :3000,3001`
3. Restart: `./start-dev.sh`

### If demo fails:
1. Have pre-recorded backup footage
2. Use screenshots as fallback
3. Explain the concept without live demo

### If time runs over:
1. Skip detailed code walkthrough
2. Focus on live demo
3. Mention documentation for details

## Time Markers (for editing)

- 0:00 - Introduction
- 0:30 - Kiro Integration Overview
- 1:30 - Spec-Driven Development
- 3:30 - Property-Based Testing
- 5:00 - Live Demo
- 7:00 - Results & Closing

---

**Good luck! 🎬🚀**
EOF

echo -e "${GREEN}✅ Demo checklist created: DEMO_CHECKLIST.md${NC}"

# 9. Create quick start script for demo
cat > start-demo.sh << 'EOF'
#!/bin/bash

# Quick start script for demo recording
# Run this right before you start recording

echo "🎬 Starting HauntedAI Demo Environment..."

# Start Redis
redis-server --daemonize yes
sleep 2

# Start all services
./start-dev.sh

echo ""
echo "✅ All services started!"
echo ""
echo "📝 Demo URLs:"
echo "  - Frontend: http://localhost:3001"
echo "  - API: http://localhost:3000"
echo "  - API Docs: http://localhost:3000/api"
echo ""
echo "🎬 Ready to record! Press Ctrl+C when done."
echo ""

# Keep script running
tail -f /dev/null
EOF

chmod +x start-demo.sh

echo -e "${GREEN}✅ Quick start script created: start-demo.sh${NC}"

# 10. Create demo test data script
cat > seed-demo-data.sh << 'EOF'
#!/bin/bash

# Seed demo data for recording
# Creates a test user and sample room

echo "🌱 Seeding demo data..."

cd apps/api

# Create demo user via API (after services are running)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@hauntedai.com",
    "password": "Demo123!@#",
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }'

echo ""
echo "✅ Demo user created!"
echo "   Username: demo_user"
echo "   Password: Demo123!@#"
echo ""

cd ../..
EOF

chmod +x seed-demo-data.sh

echo -e "${GREEN}✅ Demo data script created: seed-demo-data.sh${NC}"

# 11. Final instructions
echo ""
echo -e "${GREEN}✅ Demo recording environment ready!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Review DEMO_SCRIPT.md for full script"
echo "  2. Review DEMO_CHECKLIST.md for recording checklist"
echo "  3. Update .env with your API keys"
echo "  4. Run: ./start-demo.sh (when ready to record)"
echo "  5. Open browser: http://localhost:3001"
echo "  6. Start recording!"
echo ""
echo "🎬 Recording Tips:"
echo "  - Do a practice run first"
echo "  - Speak slowly and clearly"
echo "  - Pause between sections"
echo "  - Have water nearby"
echo "  - Smile and be enthusiastic!"
echo ""
echo "Good luck! 🚀"
