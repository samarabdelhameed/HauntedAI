#!/bin/bash

# 🎃 HauntedAI - Start All Services
# This script starts all microservices needed for the full system test

echo "🎃 Starting HauntedAI Services..."
echo ""

# Load env vars if available
if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

# Ensure required API keys are present
if [ -z "${HUGGINGFACE_API_KEY:-}" ] || [ -z "${POLLINATION_API_KEY:-}" ]; then
  echo "❌ Missing required API keys. Set HUGGINGFACE_API_KEY and POLLINATION_API_KEY."
  echo "   You can place them in an .env file or export them before running this script."
  exit 1
fi

export HUGGINGFACE_API_KEY
export POLLINATION_API_KEY

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Configuration:${NC}"
echo "  HUGGINGFACE_API_KEY: ${HUGGINGFACE_API_KEY:0:4}********"
echo "  POLLINATION_API_KEY: ${POLLINATION_API_KEY:0:4}********"
echo ""

# Function to start a service
start_service() {
  local name=$1
  local port=$2
  local path=$3
  
  echo -e "${YELLOW}Starting ${name} on port ${port}...${NC}"
  
  cd "$path" || exit 1
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install --silent
  fi
  
  # Start service in background
  PORT=$port HUGGINGFACE_API_KEY=$HUGGINGFACE_API_KEY POLLINATION_API_KEY=$POLLINATION_API_KEY npm run dev > "/tmp/${name}.log" 2>&1 &
  local pid=$!
  
  echo "  PID: $pid"
  echo "  Log: /tmp/${name}.log"
  echo ""
  
  cd - > /dev/null || exit 1
}

# Start all services
echo -e "${GREEN}🚀 Starting services...${NC}"
echo ""

start_service "story-agent" 3001 "apps/agents/story-agent"
start_service "asset-agent" 3002 "apps/agents/asset-agent"
start_service "code-agent" 3004 "apps/agents/code-agent"
start_service "deploy-agent" 3005 "apps/agents/deploy-agent"

echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "Services:"
echo "  📖 StoryAgent:  http://localhost:3001"
echo "  🎨 AssetAgent:  http://localhost:3002"
echo "  💻 CodeAgent:   http://localhost:3004"
echo "  🚀 DeployAgent: http://localhost:3005"
echo ""
echo "Waiting 10 seconds for services to initialize..."
sleep 10

echo ""
echo -e "${GREEN}🧪 Ready to run tests!${NC}"
echo ""
echo "Run the full system test with:"
echo "  node test-full-system-e2e.js"
echo ""
echo "To stop all services:"
echo "  pkill -f 'npm run dev'"
echo ""
