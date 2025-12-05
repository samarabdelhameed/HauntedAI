# 🚀 HauntedAI Deployment Guide

Complete guide for deploying HauntedAI platform to production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Providers](#cloud-providers)
- [Database Setup](#database-setup)
- [Blockchain Configuration](#blockchain-configuration)
- [Monitoring Setup](#monitoring-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements

- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ recommended
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection
- **OS**: Linux (Ubuntu 20.04+ recommended)

### Software Dependencies

- **Docker 24.0+**
- **Docker Compose 2.0+**
- **Node.js 20+** (for local development)
- **Git**

### External Services

- **OpenAI API Key** - For GPT-4 and DALL-E
- **Storacha Account** - For decentralized storage
- **Polygon RPC** - For blockchain interactions
- **Domain Name** - For production deployment
- **SSL Certificate** - For HTTPS

## 🔐 Environment Variables

### Required Variables

Create production environment files:

```bash
# .env (root)
NODE_ENV=production
DOMAIN=hauntedai.com
SSL_EMAIL=admin@hauntedai.com

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/hauntedai_prod
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-super-secure-jwt-secret-256-bits
ENCRYPTION_KEY=your-encryption-key-32-chars

# External APIs
OPENAI_API_KEY=sk-your-openai-api-key
STABILITY_API_KEY=sk-your-stability-api-key
STORACHA_DID=did:key:your-storacha-did
STORACHA_PROOF=your-storacha-proof

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-deployment-wallet-private-key
HHCW_TOKEN_ADDRESS=0x...
GHOST_BADGE_ADDRESS=0x...
TREASURY_ADDRESS=0x...

# Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-project-id

# Monitoring
WEBHOOK_URL=https://hooks.slack.com/your-webhook
GRAFANA_ADMIN_PASSWORD=secure-grafana-password
```

### API Environment

```bash
# apps/api/.env
NODE_ENV=production
API_PORT=3001
DATABASE_URL=postgresql://user:password@postgres:5432/hauntedai_prod
REDIS_URL=redis://redis:6379
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-your-openai-key
STORACHA_DID=did:key:your-did
STORACHA_PROOF=your-proof
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-private-key
WEBHOOK_URL=https://hooks.slack.com/your-webhook
```

### Frontend Environment

```bash
# apps/web/.env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.hauntedai.com
NEXT_PUBLIC_WS_URL=wss://api.hauntedai.com
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_HHCW_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_GHOST_BADGE_ADDRESS=0x...
```

## 🐳 Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - api
      - web
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: hauntedai_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 512mb
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # API Gateway
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile.prod
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/hauntedai_prod
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # Frontend
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile.prod
    environment:
      NODE_ENV: production
    restart: unless-stopped
    deploy:
      replicas: 2

  # Agent Services
  story-agent:
    build:
      context: .
      dockerfile: apps/agents/story-agent/Dockerfile.prod
    environment:
      NODE_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    restart: unless-stopped

  asset-agent:
    build:
      context: .
      dockerfile: apps/agents/asset-agent/Dockerfile.prod
    environment:
      NODE_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    restart: unless-stopped

  code-agent:
    build:
      context: .
      dockerfile: apps/agents/code-agent/Dockerfile.prod
    environment:
      NODE_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    restart: unless-stopped

  deploy-agent:
    build:
      context: .
      dockerfile: apps/agents/deploy-agent/Dockerfile.prod
    environment:
      NODE_ENV: production
      VERCEL_TOKEN: ${VERCEL_TOKEN}
    restart: unless-stopped

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.prod.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
      GF_SERVER_DOMAIN: monitoring.hauntedai.com
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

### Deployment Commands

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale API services
docker-compose -f docker-compose.prod.yml up -d --scale api=3

# View logs
docker-compose -f docker-compose.prod.yml logs -f api

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## ☸️ Kubernetes Deployment

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: hauntedai
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: hauntedai-config
  namespace: hauntedai
data:
  NODE_ENV: "production"
  API_PORT: "3001"
  REDIS_URL: "redis://redis:6379"
```

### Secrets

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: hauntedai-secrets
  namespace: hauntedai
type: Opaque
data:
  DATABASE_URL: <base64-encoded-url>
  JWT_SECRET: <base64-encoded-secret>
  OPENAI_API_KEY: <base64-encoded-key>
```

### API Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hauntedai-api
  namespace: hauntedai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hauntedai-api
  template:
    metadata:
      labels:
        app: hauntedai-api
    spec:
      containers:
      - name: api
        image: hauntedai/api:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: hauntedai-config
        - secretRef:
            name: hauntedai-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service

```yaml
# k8s/api-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: hauntedai-api-service
  namespace: hauntedai
spec:
  selector:
    app: hauntedai-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hauntedai-ingress
  namespace: hauntedai
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.hauntedai.com
    - hauntedai.com
    secretName: hauntedai-tls
  rules:
  - host: api.hauntedai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hauntedai-api-service
            port:
              number: 80
  - host: hauntedai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hauntedai-web-service
            port:
              number: 80
```

### Deploy to Kubernetes

```bash
# Apply all configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n hauntedai
kubectl get services -n hauntedai
kubectl get ingress -n hauntedai

# View logs
kubectl logs -f deployment/hauntedai-api -n hauntedai

# Scale deployment
kubectl scale deployment hauntedai-api --replicas=5 -n hauntedai
```

## ☁️ Cloud Providers

### AWS Deployment

#### ECS with Fargate

```json
{
  "family": "hauntedai-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "hauntedai/api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:hauntedai/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hauntedai-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### RDS Database

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier hauntedai-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.1 \
  --allocated-storage 100 \
  --storage-type gp2 \
  --db-name hauntedai_prod \
  --master-username hauntedai \
  --master-user-password your-secure-password \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

### Google Cloud Platform

#### Cloud Run Deployment

```yaml
# cloudrun.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: hauntedai-api
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 100
      containers:
      - image: gcr.io/project-id/hauntedai-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: production
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hauntedai-secrets
              key: database-url
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
```

```bash
# Deploy to Cloud Run
gcloud run deploy hauntedai-api \
  --image gcr.io/project-id/hauntedai-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10
```

### Vercel (Frontend)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_API_URL": "https://api.hauntedai.com",
    "NEXT_PUBLIC_WS_URL": "wss://api.hauntedai.com"
  }
}
```

## 🗄️ Database Setup

### PostgreSQL Configuration

```sql
-- Create production database
CREATE DATABASE hauntedai_prod;
CREATE USER hauntedai WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE hauntedai_prod TO hauntedai;

-- Performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Reload configuration
SELECT pg_reload_conf();
```

### Database Migration

```bash
# Run migrations
cd apps/api
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (if needed)
npx prisma db seed
```

### Backup Strategy

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="hauntedai_prod"

# Create backup
pg_dump -h postgres -U hauntedai -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

## ⛓️ Blockchain Configuration

### Smart Contract Deployment

```bash
# Deploy to Polygon mainnet
cd apps/blockchain

# Set environment variables
export POLYGON_RPC_URL="https://polygon-rpc.com"
export PRIVATE_KEY="your-deployer-private-key"

# Deploy contracts
forge script script/DeployHHCWToken.s.sol --rpc-url $POLYGON_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify

forge script script/DeployTreasury.s.sol --rpc-url $POLYGON_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify

# Verify contracts on Polygonscan
forge verify-contract --chain-id 137 --compiler-version v0.8.19 CONTRACT_ADDRESS src/HHCWToken.sol:HHCWToken
```

### Contract Addresses

Update production environment with deployed addresses:

```bash
# Polygon Mainnet
HHCW_TOKEN_ADDRESS=0x...
GHOST_BADGE_ADDRESS=0x...
TREASURY_ADDRESS=0x...

# Polygon Mumbai Testnet (for staging)
HHCW_TOKEN_ADDRESS_TESTNET=0x...
GHOST_BADGE_ADDRESS_TESTNET=0x...
TREASURY_ADDRESS_TESTNET=0x...
```

## 📊 Monitoring Setup

### Prometheus Configuration

```yaml
# monitoring/prometheus.prod.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'hauntedai-api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'hauntedai-agents'
    static_configs:
      - targets: 
        - 'story-agent:3002'
        - 'asset-agent:3003'
        - 'code-agent:3004'
        - 'deploy-agent:3005'
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Grafana Dashboards

Import production dashboards:

```bash
# Copy dashboard configurations
cp monitoring/grafana/dashboards/* /var/lib/grafana/dashboards/

# Restart Grafana
docker-compose restart grafana
```

### Alerting Rules

```yaml
# monitoring/alert_rules.yml
groups:
  - name: hauntedai_production
    rules:
      - alert: HighErrorRate
        expr: rate(hauntedai_http_request_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighMemoryUsage
        expr: hauntedai_memory_usage_bytes > 2000000000  # 2GB
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }} bytes"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.job }} is down"
```

## 🔒 SSL/TLS Configuration

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3001;
    }

    upstream web {
        server web:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name hauntedai.com api.hauntedai.com;
        return 301 https://$server_name$request_uri;
    }

    # API Server
    server {
        listen 443 ssl http2;
        server_name api.hauntedai.com;

        ssl_certificate /etc/ssl/certs/api.hauntedai.com.crt;
        ssl_certificate_key /etc/ssl/certs/api.hauntedai.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # SSE support
        location /api/v1/rooms/*/logs {
            proxy_pass http://api;
            proxy_set_header Connection '';
            proxy_http_version 1.1;
            chunked_transfer_encoding off;
            proxy_buffering off;
            proxy_cache off;
        }
    }

    # Frontend Server
    server {
        listen 443 ssl http2;
        server_name hauntedai.com;

        ssl_certificate /etc/ssl/certs/hauntedai.com.crt;
        ssl_certificate_key /etc/ssl/certs/hauntedai.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;

        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Let's Encrypt SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificates
sudo certbot --nginx -d hauntedai.com -d api.hauntedai.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## ⚡ Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX CONCURRENTLY idx_rooms_status ON rooms(status);
CREATE INDEX CONCURRENTLY idx_assets_room_id ON assets(room_id);
CREATE INDEX CONCURRENTLY idx_assets_agent_type ON assets(agent_type);
CREATE INDEX CONCURRENTLY idx_token_tx_user_id ON token_tx(user_id);

-- Analyze tables for query optimization
ANALYZE rooms;
ANALYZE assets;
ANALYZE token_tx;
```

### Redis Configuration

```conf
# redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### Node.js Optimization

```javascript
// Production optimizations
process.env.NODE_ENV = 'production';
process.env.UV_THREADPOOL_SIZE = '128';

// Memory management
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Graceful shutdown...`);
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database connectivity
docker exec -it postgres psql -U hauntedai -d hauntedai_prod -c "SELECT 1;"

# Check connection pool
docker logs api | grep "database"

# Reset connections
docker-compose restart postgres api
```

#### 2. Memory Issues

```bash
# Check memory usage
docker stats

# Increase memory limits
docker-compose -f docker-compose.prod.yml up -d --scale api=2

# Monitor memory leaks
docker exec -it api node --inspect=0.0.0.0:9229 dist/main.js
```

#### 3. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/hauntedai.com.crt -text -noout

# Renew certificates
certbot renew --dry-run

# Check Nginx configuration
nginx -t
```

#### 4. Agent Service Failures

```bash
# Check agent logs
docker logs story-agent
docker logs asset-agent

# Restart specific agent
docker-compose restart story-agent

# Check API connectivity
curl http://story-agent:3002/health
```

### Health Check Endpoints

```bash
# API Gateway
curl https://api.hauntedai.com/health

# Individual agents
curl http://story-agent:3002/health
curl http://asset-agent:3003/health
curl http://code-agent:3004/health
curl http://deploy-agent:3005/health

# Database
curl https://api.hauntedai.com/health/db

# Redis
curl https://api.hauntedai.com/health/redis
```

### Log Analysis

```bash
# Centralized logging with ELK stack
docker run -d --name elasticsearch elasticsearch:7.17.0
docker run -d --name kibana --link elasticsearch kibana:7.17.0
docker run -d --name logstash --link elasticsearch logstash:7.17.0

# View aggregated logs
docker logs --since=1h api | grep ERROR
docker logs --since=1h story-agent | grep WARN
```

### Performance Monitoring

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.hauntedai.com/health

# Monitor database performance
docker exec -it postgres psql -U hauntedai -d hauntedai_prod -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"

# Check Redis performance
docker exec -it redis redis-cli info stats
```

## 📞 Support

For deployment issues:

- **Documentation**: Check this guide and README.md
- **GitHub Issues**: Report deployment-specific issues
- **Discord**: Real-time support from community
- **Email**: team@hauntedai.com for critical issues

---

**Happy Deploying!** 🚀

*May your deployments be swift and your uptime be eternal.*