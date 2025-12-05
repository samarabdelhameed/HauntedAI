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
