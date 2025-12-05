#!/bin/bash

# HauntedAI Monitoring Setup Script
# Managed by Kiro

set -e

echo "🎃 HauntedAI Monitoring Setup"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if docker-compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose not found. Please install Docker Compose."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Create necessary directories
create_directories() {
    print_status "Creating monitoring directories..."
    
    mkdir -p grafana/provisioning/datasources
    mkdir -p grafana/provisioning/dashboards
    mkdir -p grafana/dashboards
    
    print_success "Directories created"
}

# Validate configuration files
validate_configs() {
    print_status "Validating configuration files..."
    
    # Check if required files exist
    required_files=(
        "prometheus.yml"
        "alert_rules.yml"
        "grafana/provisioning/datasources/prometheus.yml"
        "grafana/provisioning/dashboards/dashboards.yml"
        "grafana/dashboards/api-metrics.json"
        "grafana/dashboards/agent-metrics.json"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "All configuration files found"
}

# Start monitoring services
start_monitoring() {
    print_status "Starting monitoring services..."
    
    # Go to project root
    cd ..
    
    # Start Prometheus
    print_status "Starting Prometheus..."
    docker-compose -f docker-compose.dev.yml up prometheus -d
    
    # Wait a moment for Prometheus to start
    sleep 5
    
    # Start Grafana
    print_status "Starting Grafana..."
    docker-compose -f docker-compose.dev.yml up grafana -d
    
    # Wait for services to be ready
    sleep 10
    
    print_success "Monitoring services started"
}

# Check service health
check_services() {
    print_status "Checking service health..."
    
    # Check Prometheus
    if curl -s http://localhost:9090/-/healthy > /dev/null; then
        print_success "Prometheus is healthy (http://localhost:9090)"
    else
        print_warning "Prometheus may not be ready yet"
    fi
    
    # Check Grafana
    if curl -s http://localhost:3010/api/health > /dev/null; then
        print_success "Grafana is healthy (http://localhost:3010)"
    else
        print_warning "Grafana may not be ready yet"
    fi
}

# Display access information
show_access_info() {
    echo ""
    echo "🎉 Monitoring Setup Complete!"
    echo "============================="
    echo ""
    echo "Access Information:"
    echo "-------------------"
    echo "📊 Grafana Dashboard: http://localhost:3010"
    echo "   Username: admin"
    echo "   Password: hauntedai2024"
    echo ""
    echo "📈 Prometheus: http://localhost:9090"
    echo ""
    echo "Available Dashboards:"
    echo "- HauntedAI API Metrics"
    echo "- HauntedAI Agent Metrics"
    echo ""
    echo "Metrics Endpoints:"
    echo "- API Gateway: http://localhost:3001/metrics"
    echo "- StoryAgent: http://localhost:3002/metrics"
    echo "- AssetAgent: http://localhost:3003/metrics"
    echo "- CodeAgent: http://localhost:3004/metrics"
    echo "- DeployAgent: http://localhost:3005/metrics"
    echo ""
    echo "Next Steps:"
    echo "1. Start your HauntedAI services"
    echo "2. Test metrics: node monitoring/test-metrics.js"
    echo "3. View dashboards in Grafana"
    echo ""
}

# Main execution
main() {
    check_docker
    check_docker_compose
    create_directories
    validate_configs
    start_monitoring
    check_services
    show_access_info
}

# Run main function
main "$@"