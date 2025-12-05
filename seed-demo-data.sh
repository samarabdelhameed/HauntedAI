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
