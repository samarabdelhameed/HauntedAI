# HauntedAI Monitoring Setup

**Managed by Kiro** | Grafana + Prometheus Monitoring

## Overview

This directory contains the complete monitoring setup for the HauntedAI platform, including Prometheus metrics collection and Grafana dashboards for visualization.

## Components

### Prometheus
- **Port**: 9090
- **Purpose**: Metrics collection and storage
- **Configuration**: `prometheus.yml`
- **Scrape Targets**: All HauntedAI services (API + Agents)

### Grafana
- **Port**: 3010 (mapped from container port 3000)
- **Purpose**: Metrics visualization and alerting
- **Default Login**: admin / hauntedai2024
- **Dashboards**: API metrics, Agent metrics

## Quick Start

1. **Start monitoring stack**:
   ```bash
   docker-compose up prometheus grafana
   ```

2. **Access Grafana**:
   - URL: http://localhost:3010
   - Username: admin
   - Password: hauntedai2024

3. **Access Prometheus**:
   - URL: http://localhost:9090

## Dashboards

### API Metrics Dashboard
- HTTP request rate and error rate
- Response time percentiles (50th, 95th, 99th)
- Memory and CPU usage
- Active connections (SSE/WebSocket)

### Agent Metrics Dashboard
- Agent execution rates by type
- Success/failure rates
- Individual agent performance
- Room creation metrics

## Metrics Endpoints

All services expose metrics at `/metrics`:

- **API Gateway**: http://localhost:3001/metrics
- **StoryAgent**: http://localhost:3002/metrics
- **AssetAgent**: http://localhost:3003/metrics
- **CodeAgent**: http://localhost:3004/metrics
- **DeployAgent**: http://localhost:3005/metrics

## Available Metrics

### HTTP Metrics
- `hauntedai_http_requests_total` - Total HTTP requests
- `hauntedai_http_request_duration_seconds` - Request duration histogram
- `hauntedai_http_request_errors_total` - HTTP errors

### Agent Metrics
- `hauntedai_agent_executions_total` - Agent executions by type and status
- `hauntedai_agent_failures_total` - Agent failures by type and error
- `hauntedai_agent_duration_seconds` - Agent execution duration

### System Metrics
- `hauntedai_cpu_usage_percent` - CPU usage
- `hauntedai_memory_usage_bytes` - Memory usage
- `hauntedai_active_connections` - Active SSE/WebSocket connections
- `hauntedai_rooms_created_total` - Total rooms created

## Alerting Rules

Configured alerts in `alert_rules.yml`:

- **HighErrorRate**: Error rate > 10%
- **HighResponseTime**: 95th percentile > 5 seconds
- **HighMemoryUsage**: Memory > 1GB
- **AgentFailures**: Agent failure rate > 5%
- **ServiceDown**: Service unavailable
- **TooManyConnections**: > 80 active connections

## Configuration Files

### Prometheus Configuration
- `prometheus.yml` - Main configuration
- `alert_rules.yml` - Alerting rules

### Grafana Configuration
- `grafana/provisioning/datasources/prometheus.yml` - Datasource config
- `grafana/provisioning/dashboards/dashboards.yml` - Dashboard provisioning
- `grafana/dashboards/api-metrics.json` - API dashboard
- `grafana/dashboards/agent-metrics.json` - Agent dashboard

## Troubleshooting

### Prometheus Not Scraping Metrics
1. Check service health: `curl http://localhost:3001/health`
2. Check metrics endpoint: `curl http://localhost:3001/metrics`
3. Verify Prometheus targets: http://localhost:9090/targets

### Grafana Dashboard Not Loading
1. Check Prometheus datasource connection
2. Verify dashboard JSON syntax
3. Check Grafana logs: `docker logs hauntedai-grafana`

### Missing Metrics
1. Ensure services are running with metrics enabled
2. Check agent service logs for errors
3. Verify metric names in Prometheus: http://localhost:9090/graph

## Development

### Adding New Metrics
1. Add metric to `AgentMetrics` class in `apps/shared/src/metrics.ts`
2. Record metric in service code
3. Update Grafana dashboards to display new metric

### Creating New Dashboards
1. Create dashboard in Grafana UI
2. Export JSON configuration
3. Save to `grafana/dashboards/` directory
4. Restart Grafana to load new dashboard

## Production Considerations

### Security
- Change default Grafana password
- Enable HTTPS for Grafana
- Restrict access to monitoring ports

### Performance
- Configure Prometheus retention policy
- Set up Grafana alerting channels (Slack, email)
- Monitor disk usage for metrics storage

### Scaling
- Consider Prometheus federation for multiple environments
- Use Grafana folders to organize dashboards
- Set up backup for Grafana dashboards and configuration

---

**Managed by Kiro** | HauntedAI Platform | Hackathon 2024