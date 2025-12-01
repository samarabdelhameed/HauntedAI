#!/bin/bash

# Setup Test Database Script
# This script creates a temporary SQLite database for testing

echo "🔧 Setting up test database..."

# Create test environment file
cat > .env.test << EOF
DATABASE_URL="file:./test.db"
API_PORT=3001
JWT_SECRET="test-secret-key-for-testing-only"
EOF

echo "✓ Test environment file created"

# Update schema to use SQLite temporarily
cp prisma/schema.prisma prisma/schema.prisma.backup

cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  did           String   @unique
  username      String   @unique
  walletAddress String?  @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  rooms     Room[]
  tokenTxs  TokenTransaction[]
  badges    Badge[]
}

model Room {
  id        String     @id @default(uuid())
  ownerId   String
  status    String     @default("idle")
  inputText String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  owner  User    @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  assets Asset[]
}

model Asset {
  id        String    @id @default(uuid())
  roomId    String
  agentType String
  cid       String
  fileType  String?
  fileSize  Int?
  metadata  String?
  createdAt DateTime  @default(now())

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)
}

model TokenTransaction {
  id        String   @id @default(uuid())
  userId    String
  amount    Int
  reason    String?
  txHash    String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Badge {
  id        String   @id @default(uuid())
  userId    String
  tokenId   Int
  badgeType String
  txHash    String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
EOF

echo "✓ Schema updated for SQLite"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "🗄️  Creating database..."
npx prisma db push --skip-generate

echo "✅ Test database setup complete!"
echo ""
echo "To restore PostgreSQL schema, run:"
echo "  mv prisma/schema.prisma.backup prisma/schema.prisma"
echo "  npx prisma generate"
