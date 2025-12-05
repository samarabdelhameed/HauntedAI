#!/bin/bash

echo "🎃 Starting HauntedAI Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and run this script again."
    exit 1
fi

echo "✅ Docker is running"

# Start database and Redis
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run database migrations
echo "🔄 Running database migrations..."
cd apps/api
npx prisma migrate deploy
npx prisma generate
cd ../..

# Start API in background
echo "🚀 Starting API Gateway..."
cd apps/api
npm run dev &
API_PID=$!
cd ../..

# Wait a bit for API to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend..."
cd apps/web
npm run dev &
WEB_PID=$!
cd ../..

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
